import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type {
  ExtensionAPI,
  ExtensionContext,
  InputEvent,
  InputEventResult,
} from "@earendil-works/pi-coding-agent";
import type { LingualMode, LingualI18nLabels, LingualResult, SlotConfig } from "./types.js";
import {
  translatePrompt,
  shouldTriggerTranslation,
  loadUserLingualConfig,
  invalidateUserConfigCache,
  formatTreeBranch,
  formatSubRail,
  truncateVisual,
  formatCapsuleLine,
  extractVocabPhrases,
  spotlightPhrases,
  getVisualWidth,
  wrapVisualText,
  formatVocabItemsAtomic,
  renderCardLayout,
} from "./engine.js";
import {
  resolveLabelsForLang,
  formatStatusReport,
  formatModelSelectionMessage,
  resolveSlotsForPreset,
  getDefaultSlots,
  createCustomSlot,
  addSlotToList,
  removeSlotFromList,
  toggleSlotInList,
  SLOT_PRESETS,
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
  slotPreset: string;
  slots: SlotConfig[];
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
const initialSlotPreset = initialDiskConfig.slotPreset;
const initialSlots = Array.isArray(initialDiskConfig.slots) && initialDiskConfig.slots.length > 0
  ? initialDiskConfig.slots
  : (initialSlotPreset ? resolveSlotsForPreset(initialSlotPreset, initialSourceLang) : getDefaultSlots(initialSourceLang));
const initialLabels = resolveLabelsForLang(initialSourceLang, initialDiskConfig.labels, initialTargetLang);

const state: ExtensionState = {
  mode: initialDiskConfig.mode || "original",
  compact: Boolean(initialDiskConfig.compact),
  sourceLang: initialSourceLang,
  targetLang: initialTargetLang,
  selectedModel: initialDiskConfig.selectedModel || "auto",
  slotPreset: initialSlotPreset || "",
  slots: initialSlots,
  labels: initialLabels,
};

function saveUserLingualConfig(patch: Record<string, any>) {
  // 测试沙箱隔离：自动化测试期间不污染宿主机用户配置
  if (isTestEnvironment()) {
    return;
  }

  try {
    const agentDir = path.join(os.homedir(), ".pi", "agent");
    const configFile = path.join(agentDir, "lingual.json");

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
        delete existing[k]; // 恢复默认值时物理移除键，零残留回滚 (RFC 2119 Invariant 1)
      } else {
        existing[k] = v;
      }
    }

    // 原子写入：写入临时文件后 rename，附带 Windows 文件锁冲突安全降级
    const content = JSON.stringify(existing, null, 2);
    const tmpFile = `${configFile}.${Date.now()}.${Math.random().toString(36).slice(2, 6)}.tmp`;

    try {
      fs.writeFileSync(tmpFile, content, "utf8");
      fs.renameSync(tmpFile, configFile);
    } catch {
      // Windows 句柄锁或权限波动时降级直接安全落盘
      try { fs.writeFileSync(configFile, content, "utf8"); } catch {}
      try { if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); } catch {}
    }

    // 同步刷新内存缓存
    invalidateUserConfigCache();
  } catch {}
}

// 单调递增会话 FSM 控制器，彻底根除连续输入并发竞态与幽灵卡片，物理协同掐断上游 Socket
const session = new LingualSessionController();
let lastContext: ExtensionContext | null = null;

function updateFooter(ctx: ExtensionContext) {
  if (!ctx.hasUI) return;
  // 标准化底栏标签为纯净极简的 A ⇄ B (例如 zh ⇄ en)
  let pair = `${state.sourceLang} ⇄ ${state.targetLang}`;
  const enabledSlots = (state.slots || []).filter((s) => s.enabled);
  const hasSource = enabledSlots.some((s) => s.role === "source");
  const nonSourceCount = enabledSlots.filter((s) => s.role !== "source").length;
  
  if (!hasSource) {
    pair += ` · no-src`;
  }
  if (nonSourceCount !== 2) {
    pair += ` · ${enabledSlots.length}s`;
  } else if (state.slotPreset) {
    pair += ` · ${state.slotPreset}`;
  }

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
 * 包含：原文锚点、动态多语域槽位译文及针对母语 A 的精确语感释义、核心短语点睛
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

  const isCompact = state.compact || (process.stdout?.rows ? process.stdout.rows < 22 : false);
  const maxCols = Math.max(30, (process.stdout?.columns || 80) - 8);
  const pageTag = pagination && pagination.totalPages > 1
    ? ctx.ui.theme.fg("muted", ` [${pagination.pageIndex + 1}/${pagination.totalPages} ⌥.]`)
    : "";

  const lines = renderCardLayout(
    {
      spoken,
      written: written || "",
      vocab,
      spokenMeaning,
      writtenMeaning,
      sourceText,
      annotated: "",
    },
    state.labels,
    {
      maxCols,
      maxLines: 9,
      isCompact,
      slots: state.slots,
      pageTag,
      themeDecorators: {
        muted: (s) => ctx.ui.theme.fg("muted", s),
        accent: (s) => ctx.ui.theme.fg("accent", s),
        dim: (s) => ctx.ui.theme.fg("dim", s),
      },
    }
  );

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

  const refreshActiveView = (ctx: ExtensionContext) => {
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

  const switchSlotsHandler = async (args: string, ctx: ExtensionContext) => {
    const rawArgs = args.trim();
    const parts = rawArgs.split(/\s+/).filter(Boolean);
    const subCmd = (parts[0] || "").toLowerCase();

    // 1. 无参数或 "list": 查看当前所有槽位状态与管理帮助
    if (!subCmd || subCmd === "list" || subCmd === "ls") {
      const slots = state.slots || [];
      const lines = slots.map((s, idx) => {
        const status = s.enabled ? "enabled" : "disabled";
        const meaning = s.showMeaning ? " +nuance" : "";
        const inst = s.instruction ? ` // ${s.instruction.slice(0, 45)}...` : "";
        return `  ${idx + 1}. [${s.id}] "${s.label}" (${s.role}, ${status}${meaning})${inst}`;
      });

      const enabledCount = slots.filter((s) => s.enabled).length;
      const help =
        `⇄ [${state.labels.hudTitle}] Dynamic Slots (${enabledCount}/${slots.length} active):\n` +
        (lines.length > 0 ? lines.join("\n") : "  (No slots configured)") +
        `\n\nSlot Management:\n` +
        `  • /slots add <id> <label> [instruction...] - Add or customize slot\n` +
        `  • /slots rm <id>                           - Remove slot (e.g. /slots rm source to hide original text!)\n` +
        `  • /slots toggle <id>                       - Toggle enable/disable\n` +
        `  • /slots reset                             - Reset to clean initial defaults\n` +
        `  • /slots <preset>                          - Quick apply template (e.g. compact2, social, developer)`;
      ctx.ui.notify(help, "info");
      return;
    }

    // 2. "/slots reset": 恢复开箱即用默认初始槽位
    if (subCmd === "reset") {
      state.slots = getDefaultSlots(state.sourceLang);
      state.slotPreset = "";
      saveUserLingualConfig({ slots: undefined, slotPreset: undefined });
      globalLingualCache.clear();
      ctx.ui.notify(`⇄ [${state.labels.hudTitle}] Reset slots to clean defaults (source + spoken + written).`, "info");
      updateFooter(ctx);
      refreshActiveView(ctx);
      return;
    }

    // 3. "/slots rm <id>" 或 "/slots remove <id>" 或 "/slots del <id>": 彻底删除槽位（支持删除 source 原文槽位！）
    if (subCmd === "rm" || subCmd === "remove" || subCmd === "del") {
      const targetId = (parts[1] || "").toLowerCase();
      if (!targetId) {
        ctx.ui.notify(`Usage: /slots rm <slot-id> (e.g. /slots rm source to hide original text, or /slots rm written)`, "warning");
        return;
      }
      const existing = (state.slots || []).find((s) => s.id.toLowerCase() === targetId);
      if (!existing) {
        ctx.ui.notify(`Slot [${targetId}] not found in active slots. Run /slots to inspect.`, "warning");
        return;
      }
      state.slots = removeSlotFromList(state.slots || [], targetId);
      state.slotPreset = "";
      saveUserLingualConfig({ slots: state.slots, slotPreset: undefined });
      globalLingualCache.clear();

      const extraHint = targetId === "source" ? " Original source line will no longer appear on cards." : "";
      ctx.ui.notify(`⇄ [${state.labels.hudTitle}] Removed slot [${targetId}] ("${existing.label}").${extraHint}`, "info");
      updateFooter(ctx);
      refreshActiveView(ctx);
      return;
    }

    // 4. "/slots toggle <id>": 一键开关槽位
    if (subCmd === "toggle") {
      const targetId = (parts[1] || "").toLowerCase();
      if (!targetId) {
        ctx.ui.notify(`Usage: /slots toggle <slot-id>`, "warning");
        return;
      }
      const existing = (state.slots || []).find((s) => s.id.toLowerCase() === targetId);
      if (!existing) {
        ctx.ui.notify(`Slot [${targetId}] not found in active slots.`, "warning");
        return;
      }
      state.slots = toggleSlotInList(state.slots || [], targetId);
      state.slotPreset = "";
      saveUserLingualConfig({ slots: state.slots, slotPreset: undefined });
      globalLingualCache.clear();
      const updated = state.slots.find((s) => s.id.toLowerCase() === targetId);
      ctx.ui.notify(`⇄ [${state.labels.hudTitle}] Slot [${targetId}] is now ${updated?.enabled ? "enabled" : "disabled"}.`, "info");
      updateFooter(ctx);
      refreshActiveView(ctx);
      return;
    }

    // 5. "/slots add <id> <label> [instruction...]": 动态添加或修改槽位
    if (subCmd === "add") {
      const id = (parts[1] || "").toLowerCase();
      const label = parts[2];
      const instruction = parts.slice(3).join(" ");
      if (!id || !label) {
        ctx.ui.notify(`Usage: /slots add <id> <label> [instruction...]\nExample: /slots add twitter 推文 Short punchy tweet under 280 chars`, "warning");
        return;
      }
      const newSlot = createCustomSlot({
        id,
        label,
        instruction: instruction || undefined,
      });
      state.slots = addSlotToList(state.slots || [], newSlot);
      state.slotPreset = "";
      saveUserLingualConfig({ slots: state.slots, slotPreset: undefined });
      globalLingualCache.clear();
      ctx.ui.notify(`⇄ [${state.labels.hudTitle}] Added/updated slot [${id}] "${label}" (${newSlot.role}).`, "info");
      updateFooter(ctx);
      refreshActiveView(ctx);
      return;
    }

    // 6. 兼容历史预设关键词 (e.g. /slots compact2, /slots social, /slots developer)
    const matchedPreset = SLOT_PRESETS[subCmd];
    if (matchedPreset) {
      state.slotPreset = subCmd;
      state.slots = resolveSlotsForPreset(subCmd, state.sourceLang);
      saveUserLingualConfig({ slotPreset: subCmd === "developer" ? undefined : subCmd, slots: state.slots });
      globalLingualCache.clear();
      ctx.ui.notify(`⇄ [${state.labels.hudTitle}] Applied preset [${subCmd}]: ${matchedPreset.description}`, "info");
      updateFooter(ctx);
      refreshActiveView(ctx);
      return;
    }

    // 7. 未知指令提示
    ctx.ui.notify(`Unknown slot command or preset "${subCmd}". Type /slots to view slots and commands.`, "warning");
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
    }) + `\n• Slots Preset: [${state.slotPreset || "developer"}] (${(state.slots || []).filter(s => s.enabled).map(s => s.label).join(", ")})`;

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

  // 核心主命令总线调度器：处理 /lingual 下的子命令路由与平滑轮转
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

    // 1. 子命令路由: 语言切换 (/lingual lang [code])
    if (sub === "lang" || sub === "language") {
      await switchLangHandler(subArgs, ctx);
      return;
    }

    // 1.1 子命令路由: 槽位架构切换 (/lingual slots [args...])
    if (sub === "slots" || sub === "slot" || sub === "preset") {
      await switchSlotsHandler(subArgs, ctx);
      return;
    }

    // 2. 子命令路由: 模型查看与切换 (/lingual model [id])
    if (sub === "model") {
      await setModelHandler(subArgs, ctx);
      return;
    }

    // 3. 子命令路由: 胶囊/树状布局切换 (/lingual compact)
    if (sub === "compact" || sub === "capsule" || sub === "layout") {
      await toggleCompactHandler(subArgs, ctx);
      return;
    }

    // 4. 子命令路由: 状态报告 (/lingual status)
    if (sub === "status" || sub === "info" || sub === "report") {
      await showStatusHandler(subArgs, ctx);
      return;
    }

    // 5. 子命令路由: 回看上一条卡片 (/lingual last)
    if (sub === "last" || sub === "prev" || sub === "history") {
      await showLastHandler(subArgs, ctx);
      return;
    }

    // 6. 子命令路由: 伴学定制指南 (/lingual agent 或 /lingual help)
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

    // 8. 直接输入语言代码 (/lingual ja 或 /lingual zh ja)
    const possibleLang = normalizeLangCode(sub);
    if (LANGUAGE_PRESETS[possibleLang]) {
      await switchLangHandler(trimmed, ctx);
      return;
    }

    await setModeHandler(trimmed, ctx);
  };

  // 主命令总线 (支持所有子命令与平滑三态模式轮转)
  pi.registerCommand("lingual", {
    description: state.labels.cmdDescMode || "Switch or manage companion: /lingual [lang|slots|compact|model|status|last|original|english|off]",
    handler: masterCommandHandler,
  });

  // 独立模式切换命令
  pi.registerCommand("lingual-mode", {
    description: state.labels.cmdDescMode || "Set companion mode: /lingual-mode <original|english|off>",
    handler: setModeHandler,
  });

  // 独立槽位架构配置命令 (/slots, /lingual-slots)
  pi.registerCommand("slots", {
    description: state.labels.cmdDescSlots || "Inspect, add, remove, or customize dynamic slots: /slots [add|rm|toggle|reset]",
    handler: switchSlotsHandler,
  });

  pi.registerCommand("lingual-slots", {
    description: state.labels.cmdDescSlots || "Dynamic slots management (alias): /lingual-slots [add|rm|toggle|reset]",
    handler: switchSlotsHandler,
  });

  // 独立语言切换命令 (首选直觉命令 /lang 及全称别名)
  pi.registerCommand("lang", {
    description: state.labels.cmdDescLang || "Switch companion language: /lang <zh|ja|en|es|fr|de> [target]",
    handler: switchLangHandler,
  });

  pi.registerCommand("lingual-lang", {
    description: state.labels.cmdDescLang || "Switch companion language (alias): /lingual-lang <zh|ja|en|es|fr|de>",
    handler: switchLangHandler,
  });

  // 独立胶囊紧凑布局命令 (仅保留全称 /lingual-compact，绝不占用 Pi 内置的 /compact 会话上下文压缩命令)
  pi.registerCommand("lingual-compact", {
    description: state.labels.cmdDescCompact || "Toggle single-line capsule mode: /lingual-compact",
    handler: toggleCompactHandler,
  });

  // 独立伴学模型配置命令
  pi.registerCommand("lingual-model", {
    description: state.labels.cmdDescModel || "Inspect or switch companion model: /lingual-model [model-id|auto]",
    handler: setModelHandler,
  });

  // 独立状态报告命令 (/status, /lingual-status)
  pi.registerCommand("status", {
    description: state.labels.cmdDescStatus || "Display companion status report: /status",
    handler: showStatusHandler,
  });

  pi.registerCommand("lingual-status", {
    description: state.labels.cmdDescStatus || "Display companion status report (alias): /lingual-status",
    handler: showStatusHandler,
  });

  // 独立历史回显命令 (支持直觉命令 /last 及全名)
  pi.registerCommand("last", {
    description: state.labels.cmdDescLast || "Replay previous companion card: /last",
    handler: showLastHandler,
  });

  pi.registerCommand("lingual-last", {
    description: state.labels.cmdDescLast || "Replay previous companion card (alias): /lingual-last",
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
        // 弹性参数配置：扩容 maxTokens 至 1500，杜绝长输入多槽位 JSON 截断；绝不盲目硬编码 reasoning 导致 400 报错
        const diskConfig = loadUserLingualConfig();
        const requestOptions: Record<string, any> = {
          maxTokens: 1500,
        };
        if (diskConfig.reasoning) {
          requestOptions.reasoning = diskConfig.reasoning;
        }

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
          requestOptions as any
        );

        // 【超时熔断】：默认 15s 充裕超时（支持 lingual.json 配置 timeoutMs），杜绝 30s 终端输入假死，同时无缝协同中断信号
        const timeoutMs = diskConfig.timeoutMs || 15000;
        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error("Lingual translation timed out")), timeoutMs)
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
          slots: state.slots,
          slotPreset: state.slotPreset,
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
        slots: state.slots,
        slotPreset: state.slotPreset,
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
