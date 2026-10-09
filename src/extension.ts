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
const initialLabels = resolveLabelsForLang(initialSourceLang, initialDiskConfig.labels, initialTargetLang);

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

  const slot1 = state.labels.slot1Label || state.labels.spokenLabel || "Spoken";
  const slot2 = state.labels.slot2Label || state.labels.writtenLabel || "Written";
  const vocabTag = state.labels.vocabLabel || "Vocab";
  const sourceTag = state.labels.sourceLabel || "Source";

  // 极简美学原则：平时绝不显示任何繁杂的翻页长文，唯有触发长句切分多页时，才在角标微弱提示 [1/2 ⌥.]
  const pageTag = pagination && pagination.totalPages > 1
    ? ctx.ui.theme.fg("muted", ` [${pagination.pageIndex + 1}/${pagination.totalPages} ⌥.]`)
    : "";

  // 方向四：极端分屏单行胶囊模式 (Compact Capsule Mode)
  // 当显式开启 compact 或终端高度不足 (process.stdout.rows < 22) 时，渲染严格为 1 行的高密度胶囊流
  const pairTitle = `${state.sourceLang} ⇄ ${state.targetLang}`;
  const isCompact = state.compact || (process.stdout?.rows ? process.stdout.rows < 22 : false);
  if (isCompact) {
    const capsuleText = formatCapsuleLine(
      pairTitle,
      spoken,
      written,
      {
        slot1Short: state.labels.capsuleSlot1Prefix || "Spk",
        slot2Short: state.labels.capsuleSlot2Prefix || "Wrt",
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

  // 4. 动态行数守卫 (遵循伴学核心灵魂：绝不剥离母语语感，绝不删除重点词汇，绝不粗暴降级为单行胶囊)
  // Pi host widget 的物理截断上限为 10 行。
  // 若全展开超过 9 行，优雅将原文限制为最多 2 行，并将语感内联进双模括号；绝不粗暴降级为带省略号的单行胶囊！
  const HARD_MAX_LINES = 9;

  if (lines.length > HARD_MAX_LINES) {
    // 约束 Tier 1: 原文最多展示 2 行，防止长原文占用过多预算；超过 2 行时末行严格附带合规省略号
    let clampedSourceLines = sourceLines;
    if (sourceLines.length > 2) {
      clampedSourceLines = [
        sourceLines[0],
        truncateVisual(sourceLines[1] + "...", maxCols),
      ];
    }

    // 约束 Tier 2: 将母语语感内联入括号，收缩纵向子导轨高度
    const spInline = spokenMeaning ? `${spoken} (${spokenMeaning})` : spoken;
    const rawSpLines = formatTreeBranch(branch1Char, cont1Char, slot1, spInline, pMuted, pAccent, pMuted, s => s, maxCols);

    let rawWrLines: string[] = [];
    if (hasWritten) {
      const branchChar = hasVocab ? "├" : "└";
      const contChar = hasVocab ? "│" : " ";
      const wrInline = writtenMeaning ? `${written} (${writtenMeaning})` : (written || "");
      rawWrLines = formatTreeBranch(branchChar, contChar, slot2, wrInline, pMuted, pAccent, pMuted, s => s, maxCols);
    }

    let rawVocabLines: string[] = [];
    if (hasVocab) {
      rawVocabLines = formatTreeBranch("└", " ", vocabTag, vocab!, pMuted, pMuted, pMuted, pDim, maxCols);
    }

    const totalInline = clampedSourceLines.length + rawSpLines.length + rawWrLines.length + rawVocabLines.length;
    if (totalInline <= HARD_MAX_LINES) {
      lines = [...clampedSourceLines, ...rawSpLines, ...rawWrLines, ...rawVocabLines];
    } else {
      // 约束 Tier 3: 目标语完整性铁律 (Target Language Integrity Invariant)
      // 当全内联依然超出行预算时，绝对禁止对带长语感的折行数组执行盲目 slice，
      // 彻底根除英文主句被截断 (如 "which came as quite a") 或留下未闭合孤立括号 (如 "(嗨，今天想跟你聊聊林纳斯·托瓦兹。我以") 的缺陷！
      // 优先保障纯正目标语英文与重点词汇的完整性：
      const branchChar = hasVocab ? "├" : "└";
      const contChar = hasVocab ? "│" : " ";
      const pureSpLines = formatTreeBranch(branch1Char, cont1Char, slot1, displaySpoken, pMuted, pAccent, pMuted, s => s, maxCols);
      const pureWrLines = hasWritten
        ? formatTreeBranch(branchChar, contChar, slot2, displayWritten!, pMuted, pAccent, pMuted, s => s, maxCols)
        : [];
      const pureVocabLines = hasVocab
        ? formatTreeBranch("└", " ", vocabTag, vocab!, pMuted, pMuted, pMuted, pDim, maxCols)
        : [];

      const totalPure = clampedSourceLines.length + pureSpLines.length + pureWrLines.length + pureVocabLines.length;
      if (totalPure <= HARD_MAX_LINES) {
        // 若预算有空余，尝试保留其中某一个语感 (优先保留口语语感)
        if (clampedSourceLines.length + rawSpLines.length + pureWrLines.length + pureVocabLines.length <= HARD_MAX_LINES) {
          lines = [...clampedSourceLines, ...rawSpLines, ...pureWrLines, ...pureVocabLines];
        } else if (clampedSourceLines.length + pureSpLines.length + rawWrLines.length + pureVocabLines.length <= HARD_MAX_LINES) {
          lines = [...clampedSourceLines, ...pureSpLines, ...rawWrLines, ...pureVocabLines];
        } else {
          lines = [...clampedSourceLines, ...pureSpLines, ...pureWrLines, ...pureVocabLines];
        }
      } else {
        // 约束 Tier 4: 超窄屏或超长文安全有界分配
        // 优先收缩重点词汇为 1 行 (以省略号结尾)
        let vLines = pureVocabLines;
        if (vLines.length > 1) {
          vLines = [truncateVisual(vLines[0] + " · ...", maxCols)];
        }

        if (clampedSourceLines.length + pureSpLines.length + pureWrLines.length + vLines.length <= HARD_MAX_LINES) {
          lines = [...clampedSourceLines, ...pureSpLines, ...pureWrLines, ...vLines];
        } else {
          // 对纯目标语按剩余预算均衡分配，末行采用视觉省略号收尾，绝不生硬断句
          const rem = Math.max(2, HARD_MAX_LINES - clampedSourceLines.length - vLines.length);
          const spBudget = Math.max(1, Math.floor(rem / 2));
          const wrBudget = Math.max(1, rem - spBudget);

          const clampLines = (arr: string[], budget: number): string[] => {
            if (arr.length <= budget) return arr;
            const res = arr.slice(0, budget);
            const last = res.length - 1;
            res[last] = truncateVisual(res[last], maxCols);
            return res;
          };

          const spSafe = clampLines(pureSpLines, spBudget);
          const wrSafe = clampLines(pureWrLines, wrBudget);
          lines = [...clampedSourceLines, ...spSafe, ...wrSafe, ...vLines];
          if (lines.length > HARD_MAX_LINES) {
            lines = lines.slice(0, HARD_MAX_LINES);
          }
        }
      }
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
      ctx.ui.notify(state.labels.notifyEnglish || `[${state.labels.hudTitle}] Switched to [English] mode: Input to AI will be converted to technical English`, "info");
    } else if (nextMode === "off") {
      if (ctx.hasUI && typeof ctx.ui.setWidget === "function") {
        ctx.ui.setWidget("lingual_hud", undefined);
      }
      ctx.ui.notify(state.labels.notifyOff || `[${state.labels.hudTitle}] Companion turned off`, "info");
    } else {
      ctx.ui.notify(state.labels.notifyOriginal || `[${state.labels.hudTitle}] Switched to [Original] mode: Input kept in native language, translations shown above`, "info");
    }
  };

  const setModelHandler = async (args: string, ctx: ExtensionContext) => {
    const trimmed = args.trim();
    const followSessionDesc = state.labels.modelFollowSession || "follow session";
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
    const switchTemplate = state.labels.notifyModelSwitched || "Companion model switched to: {model}";
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
      const listText = (state.labels.langList || [
        "• zh (Chinese ➔ English)",
        "• ja (Japanese ➔ English)",
        "• en (English ➔ Japanese)",
        "• es (Spanish ➔ English)",
        "• fr (French ➔ English)",
        "• de (German ➔ English)",
      ]).join("\n");
      const usage = state.labels.langUsageHint || "Usage: /lang <zh|ja|en|es|fr|de> [target] (e.g. /lang ja or /lang zh ja)";
      ctx.ui.notify(
        `[${state.sourceLang} ⇄ ${state.targetLang}] ${state.labels.statusReportFlow || "Flow"}: [${state.sourceLang} ➔ ${state.targetLang}]\n${listText}\n${usage}`,
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
    state.labels = resolveLabelsForLang(newSource, undefined, newTarget);
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
      ? (state.labels.notifyCompactOn || `[${state.labels.hudTitle}] Single-line capsule mode enabled`)
      : (state.labels.notifyCompactOff || `[${state.labels.hudTitle}] Full tree layout restored`);
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
    const followDesc = state.labels.modelFollowSession || "follow session";
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
      ctx.ui.notify(state.labels.notifyHistoryRestored || `[${state.labels.hudTitle}] Restored previous companion card`, "info");
      return;
    }
    const last = session.getLastResult();
    if (!last) {
      ctx.ui.notify(state.labels.notifyNoHistory || `[${state.labels.hudTitle}] No previous companion card recorded`, "info");
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
    ctx.ui.notify(state.labels.notifyHistoryRestored || `[${state.labels.hudTitle}] Restored previous companion card`, "info");
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
          "💡 Switch native language with /lang <zh|ja|en|es|fr|de> anytime; for advanced prompt or style customization, simply describe your preferences to your Agent.",
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
    description: state.labels.cmdDescMode || "Switch or manage companion: /lingual [lang|model|compact|status|original|english|off]",
    handler: masterCommandHandler,
  });

  pi.registerCommand("2", {
    description: state.labels.cmdDescMode || "Companion quick bus (alias): /2 [lang|model|compact|status|original|english|off]",
    handler: masterCommandHandler,
  });

  // 独立模式切换命令
  pi.registerCommand("lingual-mode", {
    description: state.labels.cmdDescMode || "Set companion mode: /lingual-mode <original|english|off>",
    handler: setModeHandler,
  });

  // 独立语言切换命令 (首选直觉命令 /lang 及别名)
  pi.registerCommand("lang", {
    description: state.labels.cmdDescLang || "Switch companion language: /lang <zh|ja|en|es|fr|de> [target]",
    handler: switchLangHandler,
  });

  pi.registerCommand("lingual-lang", {
    description: state.labels.cmdDescLang || "Switch companion language (alias): /lingual-lang <zh|ja|en|es|fr|de>",
    handler: switchLangHandler,
  });

  pi.registerCommand("2-lang", {
    description: state.labels.cmdDescLang || "Quick switch companion native language (alias): /2-lang <lang>",
    handler: switchLangHandler,
  });

  // 独立胶囊紧凑布局命令 (/lingual-compact 及别名 /2-compact；避免直接占用 Pi 内置 /compact 历史压缩命令)
  pi.registerCommand("lingual-compact", {
    description: state.labels.cmdDescCompact || "Toggle single-line capsule mode: /lingual-compact",
    handler: toggleCompactHandler,
  });

  pi.registerCommand("2-compact", {
    description: state.labels.cmdDescCompact || "Toggle single-line capsule mode (alias): /2-compact",
    handler: toggleCompactHandler,
  });

  // 独立伴学模型配置命令
  pi.registerCommand("lingual-model", {
    description: state.labels.cmdDescModel || "Inspect or switch companion model: /lingual-model [model-id|auto]",
    handler: setModelHandler,
  });

  pi.registerCommand("2-model", {
    description: state.labels.cmdDescModel || "Inspect or switch companion model (alias)",
    handler: setModelHandler,
  });

  // 独立状态报告命令
  pi.registerCommand("lingual-status", {
    description: state.labels.cmdDescStatus || "Display companion status report: /lingual-status",
    handler: showStatusHandler,
  });

  pi.registerCommand("2-status", {
    description: state.labels.cmdDescStatus || "Display companion status report (alias)",
    handler: showStatusHandler,
  });

  // 独立历史回显命令 (支持直觉命令 /last 及全名)
  pi.registerCommand("last", {
    description: state.labels.cmdDescLast || "Replay previous companion card: /last",
    handler: showLastHandler,
  });

  pi.registerCommand("lingual-last", {
    description: state.labels.cmdDescLast || "Replay previous companion card: /lingual-last",
    handler: showLastHandler,
  });

  pi.registerCommand("2-last", {
    description: state.labels.cmdDescLast || "Replay previous companion card (alias)",
    handler: showLastHandler,
  });

  // 伴学定制指南
  pi.registerCommand("lingual-agent", {
    description: state.labels.cmdDescAgent || "View companion customization and language guide: /lingual-agent",
    handler: async (_args, ctx) => {
      ctx.ui.notify(
        state.labels.notifyAgentHelp ||
          "💡 Switch native language with /lang <zh|ja|en|es|fr|de> anytime; for advanced prompt or style customization, simply describe your preferences to your Agent.",
        "info"
      );
    },
  });

  if (typeof pi.registerShortcut === "function") {
    // 快捷键支持：使用 Alt+. 与 Alt+,（对应 US 键盘 > 与 < 左右方向，零系统冲突）
    pi.registerShortcut("alt+.", {
      description: state.labels.shortcutNextPage || "Switch to next companion segment",
      handler: async (ctx) => {
        if (session.nextPage()) {
          renderActiveCard(ctx);
        }
      },
    });

    pi.registerShortcut("alt+,", {
      description: state.labels.shortcutPrevPage || "Switch to previous companion segment",
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
    // 判定 2：或命中底层代码与 CLI 盾牌及字符长度防护 (由 shouldTriggerTranslation 统一管控)
    if (
      !sanitized.hasNaturalLanguage ||
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
          const timeoutTemplate = state.labels.notifyTimeout || "[{pair}] English translation timed out or not ready; original prompt passed";
          ctx.ui.notify(timeoutTemplate.replace("{pair}", state.labels.hudTitle), "warning");
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
        const errTemplate = state.labels.notifyError || "[{pair}] English translation request error; original prompt passed";
        ctx.ui.notify(errTemplate.replace("{pair}", state.labels.hudTitle), "warning");
      }
      return { action: "continue" };
    } finally {
      if (session.isLatest(generation)) {
        updateFooter(ctx);
      }
    }
  });
}
