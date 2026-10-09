import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type {
  ExtensionAPI,
  ExtensionContext,
  InputEvent,
  InputEventResult,
} from "@earendil-works/pi-coding-agent";
import type { LingualMode, LingualI18nLabels, LingualResult } from "./types.js";
import {
  translatePrompt,
  shouldTriggerTranslation,
  loadUserLingualConfig,
  formatTreeBranch,
  formatSubRail,
  truncateVisual,
  formatCapsuleLine,
  extractVocabPhrases,
  spotlightPhrases,
  getVisualWidth,
  wrapVisualText,
} from "./engine.js";
import {
  resolveLabelsForLang,
  formatStatusReport,
  formatModelSelectionMessage,
  LANGUAGE_PRESETS,
} from "./presets.js";
import { splitSemanticChunks } from "./chunker.js";
import { LingualSessionController } from "./fsm.js";
import { sanitizePromptForTranslation } from "./sanitizer.js";
import { globalLingualCache } from "./cache.js";

interface ExtensionState {
  mode: LingualMode;
  compact: boolean;
  sourceLang: string;
  targetLang: string;
  selectedModel: string;
  labels: LingualI18nLabels;
}

function isTestEnvironment(): boolean {
  return (
    process.env.NODE_ENV === "test" ||
    process.env.NODE_TEST_CONTEXT !== undefined ||
    process.execArgv.some((a) => a.startsWith("--test") || a === "--test") ||
    process.argv.some((a) => a.includes(".test.") || a.includes("test")) ||
    process.env.npm_lifecycle_event === "test"
  );
}

const initialDiskConfig = isTestEnvironment() ? {} : loadUserLingualConfig();
const initialSourceLang = initialDiskConfig.sourceLang || "zh";
const initialTargetLang = initialDiskConfig.targetLang || (initialSourceLang === "en" ? "ja" : "en");
const initialLabels = resolveLabelsForLang(initialSourceLang, initialDiskConfig.labels);

const state: ExtensionState = {
  mode: initialDiskConfig.mode || "original",
  compact: Boolean(initialDiskConfig.compact),
  sourceLang: initialSourceLang,
  targetLang: initialTargetLang,
  selectedModel: initialDiskConfig.selectedModel || "auto",
  labels: initialLabels,
};

function saveUserLingualConfig(patch: Record<string, any>) {
  // 测试沙箱隔离：自动化测试期间不污染宿主机用户配置
  if (isTestEnvironment()) {
    return;
  }

  try {
    const agentDir = path.join(os.homedir(), ".pi", "agent");
    const settingsFile = path.join(agentDir, "settings.json");
    const configFile = path.join(agentDir, "lingual.json");

    // 1. 优先尝试持久化到 Pi 全局 settings.json 下的 "pi-lingual" 配置块 (对齐 ADR-0003 与 Trifecta 铁律 1)
    if (fs.existsSync(settingsFile)) {
      try {
        const raw = fs.readFileSync(settingsFile, "utf8");
        const settings = JSON.parse(raw);
        const currentBlock = settings["pi-lingual"] || {};

        for (const [k, v] of Object.entries(patch)) {
          if (v === undefined || v === "auto" || v === "original" || (k === "compact" && v === false)) {
            delete currentBlock[k]; // 恢复默认值时物理移除键，零残留回滚
          } else {
            currentBlock[k] = v;
          }
        }

        if (Object.keys(currentBlock).length === 0) {
          delete settings["pi-lingual"];
        } else {
          settings["pi-lingual"] = currentBlock;
        }

        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), "utf8");
      } catch {}
    }

    // 2. 同时更新 ~/.pi/agent/lingual.json 作为独立备用配置，同样执行删键清理以防永久覆盖 settings.json
    if (!fs.existsSync(agentDir)) {
      fs.mkdirSync(agentDir, { recursive: true });
    }
    let existing: Record<string, any> = {};
    if (fs.existsSync(configFile)) {
      try {
        existing = JSON.parse(fs.readFileSync(configFile, "utf8"));
      } catch {}
    }
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === "auto" || v === "original" || (k === "compact" && v === false)) {
        delete existing[k];
      } else {
        existing[k] = v;
      }
    }
    if (Object.keys(existing).length === 0) {
      if (fs.existsSync(configFile)) {
        try { fs.unlinkSync(configFile); } catch {}
      }
    } else {
      fs.writeFileSync(configFile, JSON.stringify(existing, null, 2), "utf8");
    }
  } catch {}
}

// 单调递增会话 FSM 控制器，彻底根除连续输入并发竞态与幽灵卡片，物理协同掐断上游 Socket
const session = new LingualSessionController();
let lastContext: ExtensionContext | null = null;

function updateFooter(ctx: ExtensionContext) {
  if (!ctx.hasUI) return;
  // 标准化底栏标签为纯净极简的 A ⇄ B (例如 zh ⇄ en)，彻底剔除多余的第二元素模式词
  const pair = `${state.sourceLang} ⇄ ${state.targetLang}`;
  switch (state.mode) {
    case "original":
    case "english":
      ctx.ui.setStatus("lingual", ctx.ui.theme.fg("accent", pair));
      break;
    case "off":
      ctx.ui.setStatus("lingual", ctx.ui.theme.fg("muted", `${pair}: off`));
      break;
  }
}

/**
 * 渲染极简开放式左导轨树状视窗（Trifecta Minimalist Left-Rail Tree Branch）
 * 包含：原文锚点、双模译文及针对母语 A 的精确语感释义、核心短语点睛
 * 0 封闭框线，0 截断假线，100% 免疫 CJK 字符对齐鬼影。
 */
function renderHudWidget(
  ctx: ExtensionContext,
  sourceText: string,
  spoken: string,
  written?: string,
  vocab?: string,
  spokenMeaning?: string,
  writtenMeaning?: string,
  pagination?: { pageIndex: number; totalPages: number }
) {
  if (!ctx.hasUI) return;

  const hasWritten = Boolean(written && written.trim());
  const hasVocab = Boolean(vocab && vocab.trim());

  const slot1 = state.labels.slot1Label || state.labels.spokenLabel || "口语";
  const slot2 = state.labels.slot2Label || state.labels.writtenLabel || "写作";
  const vocabTag = state.labels.vocabLabel || "重点";
  const sourceTag = state.labels.sourceLabel || "原文";

  // 极简美学原则：平时绝不显示任何繁杂的翻页长文，唯有触发长句切分多页时，才在角标微弱提示 [1/2 ⌥.]
  const pageTag = pagination && pagination.totalPages > 1
    ? ctx.ui.theme.fg("muted", ` [${pagination.pageIndex + 1}/${pagination.totalPages} ⌥.]`)
    : "";

  // 方向四：极端分屏单行胶囊模式 (Compact Capsule Mode)
  // 当显式开启 compact 或终端高度不足 (process.stdout.rows < 22) 时，渲染严格为 1 行的高密度胶囊流
  const isCompact = state.compact || (process.stdout?.rows ? process.stdout.rows < 22 : false);
  if (isCompact) {
    const capsuleText = formatCapsuleLine(
      state.labels.hudTitle,
      spoken,
      written,
      {
        slot1Short: state.labels.capsuleSlot1Prefix || "口",
        slot2Short: state.labels.capsuleSlot2Prefix || "写",
        maxCols: process.stdout?.columns || 80,
      }
    );
    ctx.ui.setWidget("lingual_hud", [capsuleText + pageTag], { placement: "aboveEditor" });
    return;
  }

  // 方向三：重点短语反光瞄准镜 (Spotlight Highlighting)
  const spotlightPhrasesList = hasVocab ? extractVocabPhrases(vocab) : [];
  const displaySpoken = spotlightPhrasesList.length > 0 ? spotlightPhrases(spoken, spotlightPhrasesList) : spoken;
  const displayWritten = (written && spotlightPhrasesList.length > 0) ? spotlightPhrases(written, spotlightPhrasesList) : written;

  // 预留 8 列安全边距，彻底杜绝单字溢出终端物理边界（解决末尾孤单汉字被强制折到第 0 列的缺陷）
  const maxCols = Math.max(30, (process.stdout.columns || 80) - 8);

  // 原文标签与树枝标签严格保持一致形制 [原文]，起始位置严格对齐第 11 视觉列
  const prefixRaw = `  · [${sourceTag}] `;
  const prefixW = getVisualWidth(prefixRaw);
  const pageTagW = pageTag ? getVisualWidth(pageTag) : 0;
  const availLine1W = Math.max(20, maxCols - prefixW - pageTagW);

  // 原文锚点渲染：100% 完整原句呈现，绝不以省略号截断开发者输入
  const cleanSource = sourceText.replace(/\r?\n+/g, " ").trim();
  let sourceLines: string[] = [];

  if (getVisualWidth(cleanSource) <= availLine1W) {
    sourceLines = [
      ctx.ui.theme.fg("muted", "  · ") + ctx.ui.theme.fg("muted", "[") + ctx.ui.theme.fg("dim", sourceTag) + ctx.ui.theme.fg("muted", "] ") + cleanSource + pageTag,
    ];
  } else {
    // 超过可用宽度时采用悬挂缩进自然折行；翻页角标挂在最后一行末尾，防止第一行被挤压腰斩！
    const wrapped = wrapVisualText(cleanSource, Math.max(20, maxCols - prefixW));
    sourceLines = wrapped.map((wLine, idx) => {
      const isLast = idx === wrapped.length - 1;
      const tagSuffix = isLast ? pageTag : "";
      if (idx === 0) {
        return (
          ctx.ui.theme.fg("muted", "  · ") +
          ctx.ui.theme.fg("muted", "[") +
          ctx.ui.theme.fg("dim", sourceTag) +
          ctx.ui.theme.fg("muted", "] ") +
          wLine +
          tagSuffix
        );
      }
      return " ".repeat(prefixW) + ctx.ui.theme.fg("dim", wLine) + tagSuffix;
    });
  }

  let lines: string[] = [...sourceLines];

  const pMuted = (s: string) => ctx.ui.theme.fg("muted", s);
  const pAccent = (s: string) => ctx.ui.theme.fg("accent", s);
  const pDim = (s: string) => ctx.ui.theme.fg("dim", s);

  // 1. 口语主分支 (目标语言 B)：若无后续分支则作为 └ 闭合
  const branch1Char = (hasWritten || hasVocab) ? "┌" : "└";
  const cont1Char = (hasWritten || hasVocab) ? "│" : " ";
  lines.push(...formatTreeBranch(branch1Char, cont1Char, slot1, displaySpoken, pMuted, pAccent, pMuted, s => s, maxCols));
  // 1.1 口语子导轨 (母语 A 细微语感)：换行挂载在标签正下方，保持左侧顺序线 │ 不中断
  if (spokenMeaning) {
    lines.push(...formatSubRail(cont1Char, spokenMeaning, "↳", pMuted, pDim, maxCols));
  }

  // 2. 写作分支 (目标语言 B)
  if (hasWritten) {
    const branchChar = hasVocab ? "├" : "└";
    const contChar = hasVocab ? "│" : " ";
    lines.push(...formatTreeBranch(branchChar, contChar, slot2, displayWritten!, pMuted, pAccent, pMuted, s => s, maxCols));
    // 2.1 写作子导轨 (母语 A 严谨书面语感)
    if (writtenMeaning) {
      lines.push(...formatSubRail(contChar, writtenMeaning, "↳", pMuted, pDim, maxCols));
    }
  }

  // 3. 重点词汇分支：对每行独立应用 pDim 装饰器
  if (hasVocab) {
    lines.push(...formatTreeBranch("└", " ", vocabTag, vocab!, pMuted, pMuted, pMuted, pDim, maxCols));
  }

  // 4. 动态行数守卫 (遵循伴学核心灵魂：绝不剥离母语语感，绝不删除重点词汇)
  // Pi host widget 的物理截断上限为 10 行。
  // 若全展开超过 9 行，优雅将语感内联进双模括号；若极端超长，平滑降级为单行胶囊模式，彻底杜绝内容残缺！
  const HARD_MAX_LINES = 9;

  if (lines.length > HARD_MAX_LINES) {
    // 优雅内联：双模括号包含完整母语语感，重点词汇依然完整保留
    const inlineLines: string[] = [...sourceLines];
    const spInline = spokenMeaning ? `${spoken} (${spokenMeaning})` : spoken;
    inlineLines.push(...formatTreeBranch(branch1Char, cont1Char, slot1, spInline, pMuted, pAccent, pMuted, s => s, maxCols));

    if (hasWritten) {
      const branchChar = hasVocab ? "├" : "└";
      const contChar = hasVocab ? "│" : " ";
      const wrInline = writtenMeaning ? `${written} (${writtenMeaning})` : (written || "");
      inlineLines.push(...formatTreeBranch(branchChar, contChar, slot2, wrInline, pMuted, pAccent, pMuted, s => s, maxCols));
    }

    if (hasVocab) {
      inlineLines.push(...formatTreeBranch("└", " ", vocabTag, vocab!, pMuted, pMuted, pMuted, pDim, maxCols));
    }

    if (inlineLines.length <= HARD_MAX_LINES) {
      lines = inlineLines;
    } else {
      // 极端窄屏或超长语句：优雅降级为单行胶囊模式，保留最纯粹双模流，绝不输出光秃秃的残缺卡片
      const capsuleText = formatCapsuleLine(
        state.labels.hudTitle,
        spoken,
        written,
        {
          slot1Short: state.labels.capsuleSlot1Prefix || slot1,
          slot2Short: state.labels.capsuleSlot2Prefix || slot2,
          maxCols: process.stdout?.columns || 80,
        }
      );
      lines = [capsuleText + pageTag];
    }
  }

  // 终极绝对安全切片保护
  if (lines.length > 9) {
    lines = lines.slice(0, 9);
  }

  ctx.ui.setWidget("lingual_hud", lines, { placement: "aboveEditor" });
}

function renderActiveCard(ctx: ExtensionContext) {
  // 只统计实际已经被翻译就绪的有效卡片，彻底杜绝未就绪切片导致的虚假总页数与跳页
  const readyList = session.getReadyPages();
  if (readyList.length === 0) return;
  const snapshot = session.getPaginationSnapshot();
  const res = session.getActiveResult();
  if (!res) return;
  renderHudWidget(
    ctx,
    res.sourceText,
    res.spoken,
    res.written,
    res.vocab,
    res.spokenMeaning,
    res.writtenMeaning,
    {
      pageIndex: snapshot.pageIndex,
      totalPages: snapshot.readyCount,
    }
  );
}

export default function (pi: ExtensionAPI) {
  let resizeTimer: NodeJS.Timeout | undefined;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const active = session.getActiveResult() || session.getLastResult();
      if (active && lastContext && lastContext.hasUI) {
        renderActiveCard(lastContext);
      }
    }, 120);
  };
  process.stdout?.on("resize", onResize);

  pi.on("session_start", async (_event, ctx) => {
    lastContext = ctx;
    // 0 侵扰冷启动：静默点亮状态栏指示，绝不弹窗打断敲代码心流
    updateFooter(ctx);
  });

  const setModeHandler = async (args: string, ctx: ExtensionContext) => {
    session.abortActive();
    const trimmed = args?.trim().toLowerCase();
    let nextMode: LingualMode;

    if (trimmed === "english" || trimmed === "en" || trimmed === "eng" || trimmed === "2") {
      nextMode = "english";
    } else if (trimmed === "original" || trimmed === "orig" || trimmed === "1") {
      nextMode = "original";
    } else if (trimmed === "off" || trimmed === "0" || trimmed === "disable" || trimmed === "stop") {
      nextMode = "off";
    } else {
      // 缺省或无参数时，平滑三态循环轮转
      nextMode = state.mode === "original" ? "english" : state.mode === "english" ? "off" : "original";
    }

    state.mode = nextMode;
    // 【核心根治 1 · 状态持久化落盘】：每次切换模式立即物理持久化到 settings.json，彻底杜绝重载时回退到 original！
    saveUserLingualConfig({ mode: nextMode });
    updateFooter(ctx);

    if (nextMode === "english") {
      ctx.ui.notify(state.labels.notifyEnglish || `[${state.labels.hudTitle}] 已切换至【英文模式】：发给 AI 的输入将自动转换为纯正技术英文`, "info");
    } else if (nextMode === "off") {
      if (ctx.hasUI && typeof ctx.ui.setWidget === "function") {
        ctx.ui.setWidget("lingual_hud", undefined);
      }
      ctx.ui.notify(state.labels.notifyOff || `[${state.labels.hudTitle}] 已关闭伴学`, "info");
    } else {
      ctx.ui.notify(state.labels.notifyOriginal || `[${state.labels.hudTitle}] 已切换至【原文模式】：输入保持纯净母语，上方 HUD 浮现伴学视窗`, "info");
    }
  };

  const setModelHandler = async (args: string, ctx: ExtensionContext) => {
    const trimmed = args.trim();
    const followSessionDesc = state.labels.modelFollowSession || "跟随会话";
    const currentActive = state.selectedModel === "auto"
      ? (ctx.model ? `auto (${followSessionDesc}: ${ctx.model.provider}/${ctx.model.id})` : "auto")
      : state.selectedModel;

    if (!trimmed) {
      const available = ctx.modelRegistry?.getAvailable?.() || [];
      const availableList = available.length > 0
        ? available.map((m) => `• ${m.provider}/${m.id}`).slice(0, 8).join("\n")
        : undefined;

      const msg = formatModelSelectionMessage(state.labels, currentActive || "auto", availableList);
      ctx.ui.notify(msg, "info");
      return;
    }

    state.selectedModel = trimmed;
    saveUserLingualConfig({ selectedModel: trimmed });
    const switchTemplate = state.labels.notifyModelSwitched || "伴学模型已切换为: {model}";
    const switchedMsg = `[${state.labels.hudTitle}] ` + switchTemplate.replace("{model}", trimmed);
    ctx.ui.notify(switchedMsg, "info");
  };

  function normalizeLangCode(input: string): string {
    const s = input.trim().toLowerCase().replace(/[-_].*$/, "");
    if (s === "zh" || s === "cn" || s === "chinese" || s === "中文") return "zh";
    if (s === "ja" || s === "jp" || s === "japanese" || s === "日本語" || s === "日文" || s === "日语") return "ja";
    if (s === "en" || s === "eng" || s === "english" || s === "英语" || s === "英文") return "en";
    if (s === "es" || s === "spanish" || s === "español" || s === "西语" || s === "西班牙语") return "es";
    if (s === "fr" || s === "french" || s === "français" || s === "法语" || s === "法文") return "fr";
    if (s === "de" || s === "german" || s === "deutsch" || s === "德语" || s === "德文") return "de";
    return s;
  }

  const switchLangHandler = async (args: string, ctx: ExtensionContext) => {
    const trimmed = args.trim().toLowerCase();
    if (!trimmed || trimmed === "list" || trimmed === "help" || trimmed === "?") {
      const langList = [
        "• zh (中文 ➔ 英文)",
        "• ja (日本語 ➔ 英語)",
        "• en (English ➔ Japanese)",
        "• es (Español ➔ English)",
        "• fr (Français ➔ English)",
        "• de (Deutsch ➔ English)",
      ].join("\n");
      ctx.ui.notify(
        `[${state.sourceLang} ⇄ ${state.targetLang}] ${state.labels.statusReportFlow || "Flow"}: [${state.sourceLang} ➔ ${state.targetLang}]\n${langList}\n用法: /lang <zh|ja|en|es|fr|de> [target] (如 /lang ja 或 /lang zh ja)`,
        "info"
      );
      return;
    }

    const parts = trimmed.split(/\s*->\s*|\s*➔\s*|\s+to\s+|\s+/).filter(Boolean);
    const newSource = normalizeLangCode(parts[0]);
    const newTarget = parts.length > 1 ? normalizeLangCode(parts[1]) : (newSource === "en" ? "ja" : "en");

    if (!LANGUAGE_PRESETS[newSource]) {
      ctx.ui.notify(
        state.labels.notifyLangInvalid || "Invalid language code. Supported: zh, ja, en, es, fr, de",
        "warning"
      );
      return;
    }

    state.sourceLang = newSource;
    state.targetLang = newTarget;
    state.labels = resolveLabelsForLang(newSource);
    saveUserLingualConfig({ sourceLang: newSource, targetLang: newTarget });
    session.reset();
    globalLingualCache.clear();
    updateFooter(ctx);

    const template = state.labels.notifyLangSwitched || "Native language switched to: {lang}";
    const flowText = `${newSource} ⇄ ${newTarget}`;
    ctx.ui.notify(`[${flowText}] ` + template.replace("{lang}", flowText), "info");
  };

  const toggleCompactHandler = async (_args: string, ctx: ExtensionContext) => {
    state.compact = !state.compact;
    saveUserLingualConfig({ compact: state.compact });
    const msg = state.compact
      ? (state.labels.notifyCompactOn || `[${state.labels.hudTitle}] 已开启单行胶囊模式`)
      : (state.labels.notifyCompactOff || `[${state.labels.hudTitle}] 已切换为左导轨树状架构`);
    ctx.ui.notify(msg, "info");

    // 若当前有活动卡片，立即就地刷新重绘
    if (session.getReadyPages().length > 0) {
      renderActiveCard(ctx);
    } else if (session.getLastResult()) {
      const last = session.getLastResult()!;
      renderHudWidget(
        ctx,
        last.sourceText,
        last.spoken,
        last.written,
        last.vocab,
        last.spokenMeaning,
        last.writtenMeaning
      );
    }
  };

  const showStatusHandler = async (_args: string, ctx: ExtensionContext) => {
    const followDesc = state.labels.modelFollowSession || "跟随会话";
    const activeModel = state.selectedModel === "auto"
      ? (ctx.model ? `auto (${followDesc}: ${ctx.model.provider}/${ctx.model.id})` : "auto")
      : (state.selectedModel || "auto");

    const statusMsg = formatStatusReport(state.labels, {
      mode: state.mode,
      sourceLang: state.sourceLang,
      targetLang: state.targetLang,
      activeModel,
      layout: state.compact ? "capsule" : "tree",
      cacheStats: globalLingualCache.getStats(),
    });

    ctx.ui.notify(statusMsg, "info");
  };

  const showLastHandler = async (_args: string, ctx: ExtensionContext) => {
    if (session.getReadyPages().length > 0) {
      renderActiveCard(ctx);
      ctx.ui.notify(state.labels.notifyHistoryRestored || `[${state.labels.hudTitle}] 已重新显示上一条伴学卡片`, "info");
      return;
    }
    const last = session.getLastResult();
    if (!last) {
      ctx.ui.notify(state.labels.notifyNoHistory || `[${state.labels.hudTitle}] 暂无上一条伴学记录`, "info");
      return;
    }
    renderHudWidget(
      ctx,
      last.sourceText,
      last.spoken,
      last.written,
      last.vocab,
      last.spokenMeaning,
      last.writtenMeaning
    );
    ctx.ui.notify(state.labels.notifyHistoryRestored || `[${state.labels.hudTitle}] 已重新显示上一条伴学卡片`, "info");
  };

  // 核心主命令总线调度器：处理 /lingual 和 /2 下的子命令路由与平滑轮转
  const masterCommandHandler = async (args: string, ctx: ExtensionContext) => {
    const trimmed = args?.trim();
    if (!trimmed) {
      // 无参数时：平滑三态模式循环轮转 (original ➔ english ➔ off ➔ original)
      await setModeHandler("", ctx);
      return;
    }

    const lower = trimmed.toLowerCase();
    const spaceIndex = lower.indexOf(" ");
    const sub = spaceIndex === -1 ? lower : lower.slice(0, spaceIndex);
    const subArgs = spaceIndex === -1 ? "" : trimmed.slice(spaceIndex + 1).trim();

    // 1. 子命令路由: 语言切换 (/lingual lang [code] 或 /2 lang [code])
    if (sub === "lang" || sub === "language") {
      await switchLangHandler(subArgs, ctx);
      return;
    }

    // 2. 子命令路由: 模型查看与切换 (/lingual model [id] 或 /2 model [id])
    if (sub === "model") {
      await setModelHandler(subArgs, ctx);
      return;
    }

    // 3. 子命令路由: 胶囊/树状布局切换 (/lingual compact 或 /2 compact)
    if (sub === "compact" || sub === "capsule" || sub === "layout") {
      await toggleCompactHandler(subArgs, ctx);
      return;
    }

    // 4. 子命令路由: 状态报告 (/lingual status 或 /2 status)
    if (sub === "status" || sub === "info" || sub === "report") {
      await showStatusHandler(subArgs, ctx);
      return;
    }

    // 5. 子命令路由: 回看上一条卡片 (/lingual last 或 /2 last)
    if (sub === "last" || sub === "prev" || sub === "history") {
      await showLastHandler(subArgs, ctx);
      return;
    }

    // 6. 子命令路由: 伴学定制指南 (/lingual agent 或 /2 agent 或 /lingual help)
    if (sub === "agent" || sub === "help" || sub === "?") {
      ctx.ui.notify(
        state.labels.notifyAgentHelp ||
          "💡 切换母语？直接运行 /lang <zh|ja|en|es|fr|de> 即可实时切换并持久化；若需定制特殊风格，可直接向 Agent 描述你的定制偏好。",
        "info"
      );
      return;
    }

    // 7. 模式切换优先: 显式模式关键词 (/lingual original, /lingual english, /lingual off, /lingual mode ...)
    if (
      sub === "mode" ||
      sub === "original" ||
      sub === "english" ||
      sub === "off" ||
      sub === "orig" ||
      sub === "disable" ||
      sub === "stop"
    ) {
      await setModeHandler(sub === "mode" ? subArgs : trimmed, ctx);
      return;
    }

    // 8. 直接输入语言代码 (/lingual ja 或 /2 ja 或 /lingual zh ja)
    const possibleLang = normalizeLangCode(sub);
    if (LANGUAGE_PRESETS[possibleLang]) {
      await switchLangHandler(trimmed, ctx);
      return;
    }

    await setModeHandler(trimmed, ctx);
  };

  // 主命令总线 (支持所有子命令与平滑三态模式轮转)
  pi.registerCommand("lingual", {
    description: state.labels.cmdDescMode || "切换或管理伴学: /lingual [lang|model|compact|status|original|english|off]",
    handler: masterCommandHandler,
  });

  pi.registerCommand("2", {
    description: state.labels.cmdDescMode || "伴学极速总线 (别名): /2 [lang|model|compact|status|original|english|off]",
    handler: masterCommandHandler,
  });

  // 独立模式切换命令
  pi.registerCommand("lingual-mode", {
    description: state.labels.cmdDescMode || "设置伴学模式: /lingual-mode <original|english|off>",
    handler: setModeHandler,
  });

  // 独立语言切换命令 (首选直觉命令 /lang 及别名)
  pi.registerCommand("lang", {
    description: state.labels.cmdDescLang || "切换伴学语言: /lang <zh|ja|en|es|fr|de> [target]",
    handler: switchLangHandler,
  });

  pi.registerCommand("lingual-lang", {
    description: state.labels.cmdDescLang || "切换伴学语言 (别名): /lingual-lang <zh|ja|en|es|fr|de>",
    handler: switchLangHandler,
  });

  pi.registerCommand("2-lang", {
    description: state.labels.cmdDescLang || "极速切换伴学母语 (别名): /2-lang <lang>",
    handler: switchLangHandler,
  });

  // 独立胶囊紧凑布局命令 (直觉命令 /compact 及别名)
  pi.registerCommand("compact", {
    description: state.labels.cmdDescCompact || "切换单行胶囊与完整树状图: /compact",
    handler: toggleCompactHandler,
  });

  pi.registerCommand("lingual-compact", {
    description: state.labels.cmdDescCompact || "切换单行胶囊模式 (别名)",
    handler: toggleCompactHandler,
  });

  pi.registerCommand("2-compact", {
    description: state.labels.cmdDescCompact || "极速切换单行胶囊模式 (别名): /2-compact",
    handler: toggleCompactHandler,
  });

  // 独立伴学模型配置命令
  pi.registerCommand("lingual-model", {
    description: state.labels.cmdDescModel || "查看或切换伴学模型: /lingual-model [model-id|auto]",
    handler: setModelHandler,
  });

  pi.registerCommand("2-model", {
    description: state.labels.cmdDescModel || "查看或切换伴学模型 (别名)",
    handler: setModelHandler,
  });

  // 独立状态报告命令
  pi.registerCommand("lingual-status", {
    description: state.labels.cmdDescStatus || "查看伴学插件当前状态报告与模型诊断: /lingual-status",
    handler: showStatusHandler,
  });

  pi.registerCommand("2-status", {
    description: state.labels.cmdDescStatus || "查看伴学插件当前状态 (别名)",
    handler: showStatusHandler,
  });

  // 独立历史回显命令 (支持直觉命令 /last 及全名)
  pi.registerCommand("last", {
    description: state.labels.cmdDescLast || "回看上一条伴学卡片: /last",
    handler: showLastHandler,
  });

  pi.registerCommand("lingual-last", {
    description: state.labels.cmdDescLast || "重新回看或重现上一条伴学卡片: /lingual-last",
    handler: showLastHandler,
  });

  pi.registerCommand("2-last", {
    description: state.labels.cmdDescLast || "回看上一条伴学卡片 (别名)",
    handler: showLastHandler,
  });

  // 伴学定制指南
  pi.registerCommand("lingual-agent", {
    description: state.labels.cmdDescAgent || "查看伴学定制与母语切换指南: /lingual-agent",
    handler: async (_args, ctx) => {
      ctx.ui.notify(
        state.labels.notifyAgentHelp ||
          "💡 切换母语？直接运行 /lang <zh|ja|en|es|fr|de> 即可实时切换并持久化；若需定制特殊风格，可直接向 Agent 描述你的定制偏好。",
        "info"
      );
    },
  });

  if (typeof pi.registerShortcut === "function") {
    // 快捷键支持：使用 Alt+. 与 Alt+,（对应 US 键盘 > 与 < 左右方向，零系统冲突）
    pi.registerShortcut("alt+.", {
      description: state.labels.shortcutNextPage || "切换至下一段伴学切片",
      handler: async (ctx) => {
        if (session.nextPage()) {
          renderActiveCard(ctx);
        }
      },
    });

    pi.registerShortcut("alt+,", {
      description: state.labels.shortcutPrevPage || "切换至上一段伴学切片",
      handler: async (ctx) => {
        if (session.prevPage()) {
          renderActiveCard(ctx);
        }
      },
    });
  }

  // 创建 Pi 宿主原生模型驱动器：0 配置开箱即用，优先复用 Pi 已授权的会话凭据，拒绝泄露本地私有 Token
  const createModelCompleter = (ctx: ExtensionContext) => {
    return async (text: string, systemPrompt: string, signal?: AbortSignal): Promise<string | null> => {
      try {
        if (!ctx.modelRegistry) return null;

        // 1. 解析目标模型：支持 auto 跟随主会话，或用户通过 /lingua-model 自选的模型
        let targetModel = ctx.model;
        if (state.selectedModel && state.selectedModel !== "auto") {
          const available = ctx.modelRegistry.getAvailable?.() || [];
          const match = available.find(
            (m) =>
              m.id === state.selectedModel ||
              `${m.provider}/${m.id}` === state.selectedModel ||
              m.id.toLowerCase().includes(state.selectedModel.toLowerCase())
          );
          if (match) targetModel = match;
        }

        if (!targetModel) return null;

        // 2. 调用 Pi 原生无缝流式推理 (streamSimple)，不走硬编码外网代理，完全由 Pi 托管凭证与认证
        // 【关键保护 1】：显式禁用思维链 (reasoning: "off")，防止继承主模型 thinking: max 导致 15s 延迟与 Token 偷跑
        const stream = ctx.modelRegistry.streamSimple(
          targetModel,
          {
            systemPrompt,
            messages: [
              {
                role: "user",
                content: [{ type: "text", text }],
                timestamp: Date.now(),
              },
            ],
          },
          {
            reasoning: "low",
            maxTokens: 600,
          } as any
        );

        // 【关键保护 2】：设置 30s 充裕超时保护，防止上游网络死锁或挂起阻塞用户终端输入，同时绑定协同中断信号
        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error("Lingual translation timed out")), 30000)
        );
        const abortPromise = new Promise<null>((_, reject) => {
          if (signal?.aborted) reject(new Error("Lingual translation aborted"));
          signal?.addEventListener("abort", () => reject(new Error("Lingual translation aborted")), { once: true });
        });
        const res = (await Promise.race([stream.result(), timeoutPromise, abortPromise])) as any;
        if (!res) return null;
        const content = res.content
          ?.filter((c: any) => c.type === "text")
          ?.map((c: any) => c.text)
          ?.join("");

        return content && content.trim() ? content.trim() : null;
      } catch {
        return null;
      }
    };
  };

  // 核心拦截层：绝不把双模标注硬塞入用户的消息历史与 Prompt！
  pi.on("input", async (event: InputEvent, ctx: ExtensionContext): Promise<InputEventResult> => {
    if (state.mode === "off") return { action: "continue" };
    if (event.source === "extension") return { action: "continue" };

    const raw = event.text.trim();
    if (!raw) return { action: "continue" };

    // Skip commands and shell escapes
    if (raw.startsWith("/") || raw.startsWith("!")) {
      return { action: "continue" };
    }

    // 智能审查与意图萃取：剥离剪贴板图片、折叠多行堆栈追踪与代码块为 [...]，提炼真实自然语言核心
    const sanitized = sanitizePromptForTranslation(raw);
    const promptToTranslate = sanitized.distilledText;

    // 判定 1：若整段输入经过审查后，发现毫无自然语言意图 (纯堆栈/纯代码/纯命令)
    // 判定 2：或提炼后的真实自然语言超出了合理伴学上限 (> 500 字符)
    // 判定 3：或命中底层代码与 CLI 盾牌
    if (
      !sanitized.hasNaturalLanguage ||
      promptToTranslate.length > 500 ||
      !shouldTriggerTranslation(promptToTranslate, state.sourceLang)
    ) {
      // 【关键体验防线 1 · 绝无僵尸残留与幽灵复活】：当前输入不触发翻译时，立刻物理销毁旧卡片，并彻底清空分页池！
      if (ctx.hasUI) {
        ctx.ui.setWidget("lingual_hud", undefined);
      }
      session.clearPagination();
      return { action: "continue" };
    }

    lastContext = ctx;
    const { generation, signal } = session.beginRequest();
    const completer = createModelCompleter(ctx);

    // 【单卡高密度意图凝练流】：短句常规直译，长句由模型自动注入 Condensation 提炼为精悍单卡，彻底消除多切片轮询复杂性
    session.initPagination(1);

    // 【原文模式】(original · 默认)：彻底非阻塞 (0ms 立即放行原始输入)，后台异步微任务渲染卡片视窗
    if (state.mode === "original") {
      if (ctx.hasUI) {
        // 立即物理销毁上一轮的旧卡片，清爽等待新卡片，绝不悬挂陈旧内容导致卡死错觉
        ctx.ui.setWidget("lingual_hud", undefined);
        ctx.ui.setStatus("lingual", ctx.ui.theme.fg("accent", "⇄ [lingual] polishing..."));
      }

      // 微任务时序错峰 (80ms)：避开与 Pi 主会话首包握手争抢连接池，消除网关排队拥堵
      setTimeout(() => {
        if (!session.isLatest(generation) || state.mode !== "original") {
          return;
        }

        translatePrompt(promptToTranslate, {
          sourceLang: state.sourceLang,
          targetLang: state.targetLang,
          labels: state.labels,
          complete: completer,
          signal,
        })
          .then((result) => {
            if (!session.isLatest(generation) || state.mode !== "original") {
              return;
            }
            if (result) {
              session.setPageResult(0, result, generation);
              if (ctx.hasUI) {
                renderHudWidget(
                  ctx,
                  result.sourceText,
                  result.spoken,
                  result.written,
                  result.vocab,
                  result.spokenMeaning,
                  result.writtenMeaning
                );
              }
            }
          })
          .finally(() => {
            if (session.isLatest(generation)) {
              updateFooter(ctx);
            }
          });
      }, 80);

      return { action: "continue" };
    }

    // 【英文模式】(english)：同步等待获取纯技术英文以替换发送给 AI 的 Prompt
    if (ctx.hasUI) {
      ctx.ui.setWidget(
        "lingual_hud",
        [ctx.ui.theme.fg("muted", "  ⋯ ⇄ [lingual] polishing...")],
        { placement: "aboveEditor" }
      );
      ctx.ui.setStatus("lingual", ctx.ui.theme.fg("accent", "⇄ [lingual] polishing..."));
    }

    try {
      const result = await translatePrompt(promptToTranslate, {
        sourceLang: state.sourceLang,
        targetLang: state.targetLang,
        labels: state.labels,
        complete: completer,
        signal,
      });

      if (!session.isLatest(generation)) {
        return { action: "continue" };
      }

      if (!result) {
        if (ctx.hasUI) {
          ctx.ui.setWidget("lingual_hud", undefined);
          ctx.ui.notify(`[${state.labels.hudTitle}] 英文翻译请求未就绪或超时，本次已放行原文`, "warning");
        }
        return { action: "continue" };
      }

      session.setPageResult(0, result, generation);
      if (ctx.hasUI) {
        renderHudWidget(
          ctx,
          result.sourceText,
          result.spoken,
          result.written,
          result.vocab,
          result.spokenMeaning,
          result.writtenMeaning
        );
      }

      const combinedEnglish = result.written && result.written.trim() ? result.written : result.spoken;

      // 【核心体验跃升 · 混合意图嫁接 (Hybrid Intent Grafting)】:
      // 若原始输入包含大段被折叠的堆栈追踪或代码块，将纯英文专业指令与原始真实堆栈缝合，
      // 既驱动大模型展开顶级全英文代码推理，又绝不丢失排查必需的代码与堆栈物理上下文！
      const finalText = sanitized.rawPayload
        ? `${combinedEnglish}\n\n${sanitized.rawPayload}`
        : combinedEnglish;

      return {
        action: "transform",
        text: finalText,
        images: event.images,
      };
    } catch {
      if (ctx.hasUI) {
        ctx.ui.setWidget("lingual_hud", undefined);
        ctx.ui.notify(`[${state.labels.hudTitle}] 英文翻译请求异常，本次已放行原文`, "warning");
      }
      return { action: "continue" };
    } finally {
      if (session.isLatest(generation)) {
        updateFooter(ctx);
      }
    }
  });
}
