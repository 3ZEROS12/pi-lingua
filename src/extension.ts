import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type {
  ExtensionAPI,
  ExtensionContext,
  InputEvent,
  InputEventResult,
} from "@earendil-works/pi-coding-agent";
import type { LinguaMode, LinguaI18nLabels, LinguaResult } from "./types.js";
import {
  translatePrompt,
  shouldTriggerTranslation,
  loadUserConfig,
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
import { sanitizePromptForTranslation } from "./sanitizer.js";
import { globalLinguaCache } from "./cache.js";

interface ExtensionState {
  mode: LinguaMode;
  compact: boolean;
  sourceLang: string;
  selectedModel: string;
  labels: LinguaI18nLabels;
}

const initialDiskConfig = loadUserConfig();
const initialSourceLang = initialDiskConfig.sourceLang || "zh";
const initialLabels = resolveLabelsForLang(initialSourceLang, initialDiskConfig.labels);

const state: ExtensionState = {
  mode: initialDiskConfig.mode || "original",
  compact: Boolean(initialDiskConfig.compact),
  sourceLang: initialSourceLang,
  selectedModel: initialDiskConfig.selectedModel || "auto",
  labels: initialLabels,
};

function saveUserLinguaConfig(patch: Record<string, any>) {
  // 测试沙箱隔离：自动化测试期间不污染宿主机用户配置
  if (process.env.NODE_ENV === "test" || process.execArgv.includes("--test") || process.argv.includes("--test")) {
    return;
  }

  try {
    const agentDir = path.join(os.homedir(), ".pi", "agent");
    const settingsFile = path.join(agentDir, "settings.json");
    const configFile = path.join(agentDir, "lingua.json");

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

    // 2. 同时更新 ~/.pi/agent/lingua.json 作为独立备用配置，同样执行删键清理以防永久覆盖 settings.json
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

// 单调递增请求版本号，彻底根除连续输入并发竞态（Stale Overwrite）与幽灵 HUD 复活
let currentRequestId = 0;

// 内存暂存最近一次成功伴学结果，供 /2-last 与 /lingua-last 随时回看复盘
let lastResult: LinguaResult | null = null;

// 多句切分原子卡片分页池与当前索引
let pagedResults: LinguaResult[] = [];
let currentPageIndex = 0;
let totalExpectedPages = 1;

function updateFooter(ctx: ExtensionContext) {
  if (!ctx.hasUI) return;
  switch (state.mode) {
    case "original":
      ctx.ui.setStatus("lingua", ctx.ui.theme.fg("accent", state.labels.statusOriginal));
      break;
    case "english":
      ctx.ui.setStatus("lingua", ctx.ui.theme.fg("accent", state.labels.statusEnglish));
      break;
    case "off":
      ctx.ui.setStatus("lingua", ctx.ui.theme.fg("muted", state.labels.statusOff));
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
    ctx.ui.setWidget("lingua_hud", [capsuleText + pageTag], { placement: "aboveEditor" });
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
    // 超过可用宽度时采用悬挂缩进自然折行，保证每一页原句完整展示，零省略号
    const wrapped = wrapVisualText(cleanSource, Math.max(20, maxCols - prefixW));
    sourceLines = wrapped.map((wLine, idx) => {
      if (idx === 0) {
        return (
          ctx.ui.theme.fg("muted", "  · ") +
          ctx.ui.theme.fg("muted", "[") +
          ctx.ui.theme.fg("dim", sourceTag) +
          ctx.ui.theme.fg("muted", "] ") +
          wLine +
          pageTag
        );
      }
      return " ".repeat(prefixW) + ctx.ui.theme.fg("dim", wLine);
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

  // 3. 重点词汇分支：对每行独立应用 pDim 装饰器，彻底解决折行时 ANSI SGR 重置引发的颜色断裂问题
  if (hasVocab) {
    lines.push(...formatTreeBranch("└", " ", vocabTag, vocab!, pMuted, pMuted, pMuted, pDim, maxCols));
  }

  // 4. 动态行数坚不可摧守卫 (Bulletproof Tiered Hard Budget Guard)
  // Pi host widget 的物理截断硬上限为 10 行。
  // 为了 100% 物理杜绝 "... (widget truncated)"，我们严格将最大行数预算约束在 <= 8 行 (保留 2 行绝对安全冗余)！
  const HARD_MAX_LINES = 8;

  if (lines.length > HARD_MAX_LINES) {
    // Tier 1: 内联母语语感释义入括号 (收起独立的 subRail 语感导轨行)
    const t1Lines: string[] = [...sourceLines];
    const spT1 = spokenMeaning ? `${spoken} (${spokenMeaning})` : spoken;
    t1Lines.push(...formatTreeBranch(branch1Char, cont1Char, slot1, spT1, pMuted, pAccent, pMuted, s => s, maxCols));
    if (hasWritten) {
      const branchChar = hasVocab ? "├" : "└";
      const contChar = hasVocab ? "│" : " ";
      const wrT1 = writtenMeaning ? `${written} (${writtenMeaning})` : (written || "");
      t1Lines.push(...formatTreeBranch(branchChar, contChar, slot2, wrT1, pMuted, pAccent, pMuted, s => s, maxCols));
    }
    if (hasVocab) {
      t1Lines.push(...formatTreeBranch("└", " ", vocabTag, vocab!, pMuted, pMuted, pMuted, pDim, maxCols));
    }

    if (t1Lines.length <= HARD_MAX_LINES) {
      lines = t1Lines;
    } else {
      // Tier 2: 句子本身过长或屏幕极窄，剥离括号中的长篇母语释义，只保留精纯目标语 spoken 和 written
      const t2Lines: string[] = [...sourceLines];
      t2Lines.push(...formatTreeBranch(branch1Char, cont1Char, slot1, displaySpoken, pMuted, pAccent, pMuted, s => s, maxCols));
      if (hasWritten) {
        const branchChar = hasVocab ? "├" : "└";
        const contChar = hasVocab ? "│" : " ";
        t2Lines.push(...formatTreeBranch(branchChar, contChar, slot2, displayWritten!, pMuted, pAccent, pMuted, s => s, maxCols));
      }
      if (hasVocab) {
        t2Lines.push(...formatTreeBranch("└", " ", vocabTag, vocab!, pMuted, pMuted, pMuted, pDim, maxCols));
      }

      if (t2Lines.length <= HARD_MAX_LINES) {
        lines = t2Lines;
      } else {
        // Tier 3: 进一步省略重点词汇行，原文最多保留 2 行
        const t3Lines: string[] = [];
        if (sourceLines.length > 2) {
          t3Lines.push(sourceLines[0]);
          t3Lines.push(sourceLines[1]);
        } else {
          t3Lines.push(...sourceLines);
        }
        t3Lines.push(...formatTreeBranch(hasWritten ? "┌" : "└", hasWritten ? "│" : " ", slot1, displaySpoken, pMuted, pAccent, pMuted, s => s, maxCols));
        if (hasWritten) {
          t3Lines.push(...formatTreeBranch("└", " ", slot2, displayWritten!, pMuted, pAccent, pMuted, s => s, maxCols));
        }

        if (t3Lines.length <= HARD_MAX_LINES) {
          lines = t3Lines;
        } else {
          // Tier 4: 极端长句/超窄屏，优雅降级为单行胶囊模式 (1-Line Capsule Mode)，严格 1 行！
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
    }
  }

  // 终极物理拦截底线 (Ultimate Physical Safety Redline)
  // 无论发生何种异常折行计算，送入宿主的行数绝对不能超过 HARD_MAX_LINES
  if (lines.length > HARD_MAX_LINES) {
    lines = lines.slice(0, HARD_MAX_LINES);
  }

  ctx.ui.setWidget("lingua_hud", lines, { placement: "aboveEditor" });
}

function renderActiveCard(ctx: ExtensionContext) {
  if (pagedResults.length === 0) return;
  const res = pagedResults[currentPageIndex];
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
      pageIndex: currentPageIndex,
      totalPages: Math.max(pagedResults.length, totalExpectedPages),
    }
  );
}

export default function (pi: ExtensionAPI) {
  pi.on("session_start", async (_event, ctx) => {
    // 0 侵扰冷启动：静默点亮状态栏指示，绝不弹窗打断敲代码心流
    updateFooter(ctx);
  });

  const cycleModeHandler = async (_args: string, ctx: ExtensionContext) => {
    currentRequestId++;

    if (state.mode === "original") {
      state.mode = "english";
      updateFooter(ctx);
      ctx.ui.notify(state.labels.notifyEnglish || `[${state.labels.hudTitle}] 已切换至【英文模式】：发给 AI 的输入将自动转换为纯正技术英文`, "info");
    } else if (state.mode === "english") {
      state.mode = "off";
      updateFooter(ctx);
      ctx.ui.setWidget("lingua_hud", undefined);
      ctx.ui.notify(state.labels.notifyOff || `[${state.labels.hudTitle}] 已关闭伴学`, "info");
    } else {
      state.mode = "original";
      updateFooter(ctx);
      ctx.ui.notify(state.labels.notifyOriginal || `[${state.labels.hudTitle}] 已切换至【原文模式】：输入保持纯净母语，上方 HUD 浮现伴学视窗`, "info");
    }
  };

  pi.registerCommand("lingua", {
    description: state.labels.cmdDescMode || "切换伴学模式 [二 ⇄ two]: [原文] ➔ [英文] ➔ [关]",
    handler: cycleModeHandler,
  });

  pi.registerCommand("lingual", {
    description: state.labels.cmdDescMode || "切换伴学模式 [二 ⇄ two] (别名)",
    handler: cycleModeHandler,
  });

  pi.registerCommand("translate", {
    description: state.labels.cmdDescMode || "切换伴学模式 [二 ⇄ two] (别名)",
    handler: cycleModeHandler,
  });

  pi.registerCommand("2", {
    description: state.labels.cmdDescMode || "切换伴学模式 [二 ⇄ two] (别名)",
    handler: cycleModeHandler,
  });

  pi.registerCommand("lingua-agent", {
    description: state.labels.cmdDescAgent || "查看 AI Coding Agent 自主定制本插件的方法",
    handler: async (_args, ctx) => {
      ctx.ui.notify(
        state.labels.notifyAgentHelp ||
          "💡 想要更换语言或风格？对你的 Agent 说一句话（如“我想定制这个伴学插件”），Agent 将自主为你完成诊断问卷与重新构建！⚠️ 注意：完成后请重启终端生效。",
        "info"
      );
    },
  });

  pi.registerCommand("lingua-model", {
    description: state.labels.cmdDescModel || "查看或切换伴学模型 [二 ⇄ two]: /lingua-model [model-id|auto]",
    handler: async (args: string, ctx: ExtensionContext) => {
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
      saveUserLinguaConfig({ selectedModel: trimmed });
      const switchTemplate = state.labels.notifyModelSwitched || "伴学模型已切换为: {model}";
      const switchedMsg = `[${state.labels.hudTitle}] ` + switchTemplate.replace("{model}", trimmed);
      ctx.ui.notify(switchedMsg, "info");
    },
  });

  const switchLangHandler = async (args: string, ctx: ExtensionContext) => {
    const trimmed = args.trim().toLowerCase();
    if (!trimmed) {
      const langList = [
        "• zh (中文)",
        "• ja (日本語)",
        "• en (English)",
        "• es (Español)",
        "• fr (Français)",
        "• de (Deutsch)",
      ].join("\n");
      ctx.ui.notify(
        `[${state.labels.hudTitle}] ${state.labels.statusReportFlow || "Flow"}: [${state.sourceLang} ➔ en]\n${langList}\nUsage: /lingua-lang <zh|ja|en|es|fr|de>`,
        "info"
      );
      return;
    }

    if (!LANGUAGE_PRESETS[trimmed]) {
      ctx.ui.notify(
        state.labels.notifyLangInvalid || "Invalid language code. Supported: zh, ja, en, es, fr, de",
        "warning"
      );
      return;
    }

    state.sourceLang = trimmed;
    state.labels = resolveLabelsForLang(trimmed, initialDiskConfig.labels);
    saveUserLinguaConfig({ sourceLang: trimmed });
    globalLinguaCache.clear();
    updateFooter(ctx);

    const template = state.labels.notifyLangSwitched || "Native language switched to: {lang}";
    ctx.ui.notify(`[${state.labels.hudTitle}] ` + template.replace("{lang}", trimmed), "info");
  };

  pi.registerCommand("lingua-lang", {
    description: state.labels.cmdDescLang || "查看或切换伴学母语 [二 ⇄ two]: /lingua-lang [zh|ja|en|es|fr|de]",
    handler: switchLangHandler,
  });

  pi.registerCommand("lingual-lang", {
    description: state.labels.cmdDescLang || "切换伴学母语 (别名)",
    handler: switchLangHandler,
  });

  pi.registerCommand("2-lang", {
    description: state.labels.cmdDescLang || "极速切换伴学母语 (别名): /2-lang <lang>",
    handler: switchLangHandler,
  });

  const toggleCompactHandler = async (_args: string, ctx: ExtensionContext) => {
    state.compact = !state.compact;
    saveUserLinguaConfig({ compact: state.compact });
    const msg = state.compact
      ? (state.labels.notifyCompactOn || `[${state.labels.hudTitle}] 已开启单行胶囊模式`)
      : (state.labels.notifyCompactOff || `[${state.labels.hudTitle}] 已切换为左导轨树状架构`);
    ctx.ui.notify(msg, "info");

    // 若当前有活动卡片，立即就地刷新重绘
    if (pagedResults.length > 0) {
      renderActiveCard(ctx);
    } else if (lastResult) {
      renderHudWidget(
        ctx,
        lastResult.sourceText,
        lastResult.spoken,
        lastResult.written,
        lastResult.vocab,
        lastResult.spokenMeaning,
        lastResult.writtenMeaning
      );
    }
  };

  pi.registerCommand("lingua-compact", {
    description: state.labels.cmdDescCompact || "切换单行胶囊模式与完整树状图: /lingua-compact",
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

  const showStatusHandler = async (_args: string, ctx: ExtensionContext) => {
    const followDesc = state.labels.modelFollowSession || "跟随会话";
    const activeModel = state.selectedModel === "auto"
      ? (ctx.model ? `auto (${followDesc}: ${ctx.model.provider}/${ctx.model.id})` : "auto")
      : (state.selectedModel || "auto");

    const statusMsg = formatStatusReport(state.labels, {
      mode: state.mode,
      sourceLang: state.sourceLang,
      targetLang: "en",
      activeModel,
      layout: state.compact ? "capsule" : "tree",
      cacheStats: globalLinguaCache.getStats(),
    });

    ctx.ui.notify(statusMsg, "info");
  };

  pi.registerCommand("lingua-status", {
    description: state.labels.cmdDescStatus || "查看伴学插件当前状态报告与模型诊断: /lingua-status",
    handler: showStatusHandler,
  });

  pi.registerCommand("2-status", {
    description: state.labels.cmdDescStatus || "查看伴学插件当前状态 (别名)",
    handler: showStatusHandler,
  });

  const showLastHandler = async (_args: string, ctx: ExtensionContext) => {
    if (pagedResults.length > 0) {
      renderActiveCard(ctx);
      ctx.ui.notify(state.labels.notifyHistoryRestored || `[${state.labels.hudTitle}] 已重新显示上一条伴学卡片`, "info");
      return;
    }
    if (!lastResult) {
      ctx.ui.notify(state.labels.notifyNoHistory || `[${state.labels.hudTitle}] 暂无上一条伴学记录`, "info");
      return;
    }
    renderHudWidget(
      ctx,
      lastResult.sourceText,
      lastResult.spoken,
      lastResult.written,
      lastResult.vocab,
      lastResult.spokenMeaning,
      lastResult.writtenMeaning
    );
    ctx.ui.notify(state.labels.notifyHistoryRestored || `[${state.labels.hudTitle}] 已重新显示上一条伴学卡片`, "info");
  };

  pi.registerCommand("lingua-last", {
    description: state.labels.cmdDescLast || "重新回看或重现上一条伴学卡片: /lingua-last",
    handler: showLastHandler,
  });

  pi.registerCommand("2-last", {
    description: state.labels.cmdDescLast || "回看上一条伴学卡片 (别名)",
    handler: showLastHandler,
  });

  if (typeof pi.registerShortcut === "function") {
    // 快捷键支持：使用 Alt+. 与 Alt+,（对应 US 键盘 > 与 < 左右方向，零系统冲突）
    pi.registerShortcut("alt+.", {
      description: state.labels.shortcutNextPage || "切换至下一段伴学切片",
      handler: async (ctx) => {
        if (pagedResults.length <= 1) return;
        currentPageIndex = (currentPageIndex + 1) % pagedResults.length;
        renderActiveCard(ctx);
      },
    });

    pi.registerShortcut("alt+,", {
      description: state.labels.shortcutPrevPage || "切换至上一段伴学切片",
      handler: async (ctx) => {
        if (pagedResults.length <= 1) return;
        currentPageIndex = (currentPageIndex - 1 + pagedResults.length) % pagedResults.length;
        renderActiveCard(ctx);
      },
    });
  }

  // 创建 Pi 宿主原生模型驱动器：0 配置开箱即用，优先复用 Pi 已授权的会话凭据，拒绝泄露本地私有 Token
  const createModelCompleter = (ctx: ExtensionContext) => {
    return async (text: string, systemPrompt: string): Promise<string | null> => {
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
            reasoning: "off",
            maxTokens: 600,
          } as any
        );

        // 【关键保护 2】：设置 8s 超时熔断保护，防止上游网络死锁或挂起阻塞用户终端输入
        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error("Lingua translation timed out")), 8000)
        );
        const res = (await Promise.race([stream.result(), timeoutPromise])) as any;
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
      // 【关键体验防线 1 · 绝无僵尸残留】：当前输入不触发翻译时，立刻物理销毁上一轮的旧卡片，绝不让上上一句死死挂在屏幕上！
      if (ctx.hasUI) {
        ctx.ui.setWidget("lingua_hud", undefined);
      }
      return { action: "continue" };
    }

    const requestId = ++currentRequestId;
    const completer = createModelCompleter(ctx);

    const chunks = splitSemanticChunks(promptToTranslate);
    totalExpectedPages = chunks.length;
    currentPageIndex = 0;
    pagedResults = [];

    // 【原文模式】(original · 默认)：彻底非阻塞 (0ms 立即放行原始输入)，后台异步微任务渲染卡片视窗
    if (state.mode === "original") {
      if (ctx.hasUI) {
        ctx.ui.setStatus("lingua", ctx.ui.theme.fg("accent", "⇄ [lingua] polishing..."));

        // 【关键体验防线 2 · 输入即响应握手】：在回车敲下的第 0ms，立即用当前句子替换上一轮陈旧卡片！
        // 彻底消除“等待期间依然显示上一句”的心智误解
        const cleanFirstChunk = chunks[0].replace(/\r?\n+/g, " ").trim();
        const skeletonLines = [
          ctx.ui.theme.fg("muted", "  · ") +
            ctx.ui.theme.fg("muted", "[") +
            ctx.ui.theme.fg("dim", state.labels.sourceLabel) +
            ctx.ui.theme.fg("muted", "] ") +
            cleanFirstChunk,
          ctx.ui.theme.fg("muted", "  ┌ ") +
            ctx.ui.theme.fg("accent", `[${state.labels.slot1Label}]   `) +
            ctx.ui.theme.fg("dim", "⇄ generating companion nuances..."),
        ];
        ctx.ui.setWidget("lingua_hud", skeletonLines, { placement: "aboveEditor" });
      }

      if (chunks.length === 1) {
        // 单句常规输入：秒级渲染单个卡片，不触发任何分页角标，保持最纯粹美感
        translatePrompt(promptToTranslate, {
          sourceLang: state.sourceLang,
          labels: state.labels,
          complete: completer,
        })
          .then((result) => {
            if (requestId !== currentRequestId || state.mode !== "original") {
              return;
            }
            if (result) {
              lastResult = result;
              pagedResults = [result];
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
            } else {
              // 【关键体验防线 3 · 失败优雅清空】：若推理超时或返回 null，立即清空骨架屏，绝不留脏卡片
              if (ctx.hasUI) {
                ctx.ui.setWidget("lingua_hud", undefined);
              }
            }
          })
          .catch(() => {
            if (requestId === currentRequestId && ctx.hasUI) {
              ctx.ui.setWidget("lingua_hud", undefined);
            }
          })
          .finally(() => {
            if (requestId === currentRequestId) {
              updateFooter(ctx);
            }
          });
      } else {
        // 多句超长输入：触发意群切片保底，第 1 句 200ms 极速呈现，后续句后台无感预加载
        translatePrompt(chunks[0], {
          sourceLang: state.sourceLang,
          labels: state.labels,
          complete: completer,
        })
          .then((result0) => {
            if (requestId !== currentRequestId || state.mode !== "original") {
              return;
            }
            if (result0) {
              lastResult = result0;
              pagedResults[0] = result0;
              if (ctx.hasUI) {
                renderActiveCard(ctx);
                ctx.ui.notify(state.labels.notifyPaging || `[${state.labels.hudTitle}] 长句已切分多段，按 Alt+. 翻页浏览`, "info");
              }
            } else {
              if (ctx.hasUI) {
                ctx.ui.setWidget("lingua_hud", undefined);
              }
            }
          })
          .catch(() => {
            if (requestId === currentRequestId && ctx.hasUI) {
              ctx.ui.setWidget("lingua_hud", undefined);
            }
          })
          .finally(() => {
            if (requestId === currentRequestId) {
              updateFooter(ctx);
            }
          });

        // 后续切片后台异步并发预加载，就绪后当用户按 Alt+→ 即刻呈现
        (async () => {
          for (let i = 1; i < chunks.length; i++) {
            if (requestId !== currentRequestId || state.mode !== "original") break;
            const res = await translatePrompt(chunks[i], {
              sourceLang: state.sourceLang,
              labels: state.labels,
              complete: completer,
            });
            if (res && requestId === currentRequestId) {
              pagedResults[i] = res;
              if (ctx.hasUI && currentPageIndex === 0) {
                renderActiveCard(ctx);
              }
            }
          }
        })();
      }

      return { action: "continue" };
    }

    // 【英文模式】(english)：同步等待获取纯技术英文以替换发送给 AI 的 Prompt
    if (ctx.hasUI) {
      ctx.ui.setWidget(
        "lingua_hud",
        [ctx.ui.theme.fg("muted", "  ⋯ ⇄ [lingua] polishing...")],
        { placement: "aboveEditor" }
      );
      ctx.ui.setStatus("lingua", ctx.ui.theme.fg("accent", "⇄ [lingua] polishing..."));
    }

    try {
      let combinedEnglish = "";

      if (chunks.length === 1) {
        const result = await translatePrompt(raw, {
          sourceLang: state.sourceLang,
          labels: state.labels,
          complete: completer,
        });
        if (requestId !== currentRequestId) {
          return { action: "continue" };
        }

        if (!result) {
          if (ctx.hasUI) ctx.ui.setWidget("lingua_hud", undefined);
          return { action: "continue" };
        }

        lastResult = result;
        pagedResults = [result];
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
        combinedEnglish = result.written && result.written.trim() ? result.written : result.spoken;
      } else {
        // 并发执行所有切片的翻译，将多切片耗时从 N*Latency 降低至 1*Latency
        const results = await Promise.all(
          chunks.map((chunk) =>
            translatePrompt(chunk, {
              sourceLang: state.sourceLang,
              labels: state.labels,
              complete: completer,
            })
          )
        );
        if (requestId !== currentRequestId) return { action: "continue" };
        const validResults = results.filter((r): r is LinguaResult => r !== null);
        if (validResults.length === 0) {
          if (ctx.hasUI) ctx.ui.setWidget("lingua_hud", undefined);
          return { action: "continue" };
        }
        pagedResults = validResults;
        lastResult = validResults[0];
        currentPageIndex = 0;
        if (ctx.hasUI) {
          renderActiveCard(ctx);
          ctx.ui.notify(state.labels.notifyPaging || `[${state.labels.hudTitle}] 长句已切分多段，按 Alt+. 翻页浏览`, "info");
        }
        combinedEnglish = validResults.map((r) => (r.written && r.written.trim() ? r.written : r.spoken)).join(" ");
      }

      return {
        action: "transform",
        text: combinedEnglish,
        images: event.images,
      };
    } catch {
      if (ctx.hasUI) ctx.ui.setWidget("lingua_hud", undefined);
      return { action: "continue" };
    } finally {
      if (requestId === currentRequestId) {
        updateFooter(ctx);
      }
    }
  });
}
