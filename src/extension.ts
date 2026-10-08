import type {
  ExtensionAPI,
  ExtensionContext,
  InputEvent,
  InputEventResult,
} from "@earendil-works/pi-coding-agent";
import type { LinguaMode, LinguaI18nLabels } from "./types.js";
import { translatePrompt, shouldTriggerTranslation } from "./engine.js";

interface ExtensionState {
  mode: LinguaMode;
  sourceLang: string;
  labels: LinguaI18nLabels;
}

// 日本語母国語 ➔ 英語伴走ワークフロー [二 ⇄ two]
const DEFAULT_LABELS: LinguaI18nLabels = {
  slot1Label: "口語",
  slot2Label: "文面",
  vocabLabel: "単語",
  sourceLabel: "原文",
  hudTitle: "二 ⇄ two",
  statusOriginal: "⇄ [二 ⇄ two] 原文",
  statusEnglish: "⇄ [二 ⇄ two] 英語",
  statusOff: "⇄ [二 ⇄ two]: オフ",
  spokenLabel: "口語",
  writtenLabel: "文面",
};

const state: ExtensionState = {
  mode: "original",
  sourceLang: "ja",
  labels: { ...DEFAULT_LABELS },
};

// 单调递增请求版本号，彻底根除连续输入并发竞态（Stale Overwrite）与幽灵 HUD 复活
let currentRequestId = 0;

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
  writtenMeaning?: string
) {
  if (!ctx.hasUI) return;

  const hasWritten = Boolean(written && written.trim());
  const hasVocab = Boolean(vocab && vocab.trim());

  const slot1 = state.labels.slot1Label || state.labels.spokenLabel || "口語";
  const slot2 = state.labels.slot2Label || state.labels.writtenLabel || "文面";
  const vocabTag = state.labels.vocabLabel || "単語";
  const sourceTag = state.labels.sourceLabel || "原文";

  const spokenDisplay = spokenMeaning
    ? `${spoken} ` + ctx.ui.theme.fg("dim", `(${spokenMeaning})`)
    : spoken;
  const writtenDisplay = written && writtenMeaning
    ? `${written} ` + ctx.ui.theme.fg("dim", `(${writtenMeaning})`)
    : (written || "");

  const lines: string[] = [
    ctx.ui.theme.fg("muted", "  · ") + ctx.ui.theme.fg("dim", `${sourceTag}   `) + sourceText,
  ];

  if (hasWritten && hasVocab) {
    lines.push(
      ctx.ui.theme.fg("muted", "  ┌ ") + ctx.ui.theme.fg("accent", `[${slot1}] `) + spokenDisplay,
      ctx.ui.theme.fg("muted", "  ├ ") + ctx.ui.theme.fg("accent", `[${slot2}] `) + writtenDisplay,
      ctx.ui.theme.fg("muted", "  └ ") + ctx.ui.theme.fg("muted", `[${vocabTag}] `) + ctx.ui.theme.fg("dim", vocab!)
    );
  } else if (hasWritten) {
    lines.push(
      ctx.ui.theme.fg("muted", "  ┌ ") + ctx.ui.theme.fg("accent", `[${slot1}] `) + spokenDisplay,
      ctx.ui.theme.fg("muted", "  └ ") + ctx.ui.theme.fg("accent", `[${slot2}] `) + writtenDisplay
    );
  } else if (hasVocab) {
    lines.push(
      ctx.ui.theme.fg("muted", "  ┌ ") + ctx.ui.theme.fg("accent", `[${slot1}] `) + spokenDisplay,
      ctx.ui.theme.fg("muted", "  └ ") + ctx.ui.theme.fg("muted", `[${vocabTag}] `) + ctx.ui.theme.fg("dim", vocab!)
    );
  } else {
    lines.push(
      ctx.ui.theme.fg("muted", "  └ ") + ctx.ui.theme.fg("accent", `[${slot1}] `) + spokenDisplay
    );
  }

  ctx.ui.setWidget("lingua_hud", lines, { placement: "aboveEditor" });
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
      ctx.ui.notify(`[${state.labels.hudTitle}] 【英語モード】に切り替えました：AIへの入力は純粋な技術英語に自動変換されます`, "info");
    } else if (state.mode === "english") {
      state.mode = "off";
      updateFooter(ctx);
      ctx.ui.setWidget("lingua_hud", undefined);
      ctx.ui.notify(`[${state.labels.hudTitle}] オフにしました`, "info");
    } else {
      state.mode = "original";
      updateFooter(ctx);
      ctx.ui.notify(`[${state.labels.hudTitle}] 【原文モード】に切り替えました：AIへの入力は原文のまま、上部カードで英語を表示`, "info");
    }
  };

  pi.registerCommand("lingua", {
    description: "モード切替 [二 ⇄ two]: [原文] ➔ [英語] ➔ [オフ]",
    handler: cycleModeHandler,
  });

  pi.registerCommand("lingual", {
    description: "モード切替 [二 ⇄ two] (エイリアス)",
    handler: cycleModeHandler,
  });

  pi.registerCommand("translate", {
    description: "モード切替 [二 ⇄ two] (エイリアス)",
    handler: cycleModeHandler,
  });

  pi.registerCommand("2", {
    description: "モード切替 [二 ⇄ two] (エイリアス)",
    handler: cycleModeHandler,
  });

  pi.registerCommand("lingua-agent", {
    description: "AI Coding Agent によるプラグインのカスタマイズ方法を確認",
    handler: async (_args, ctx) => {
      ctx.ui.notify(
        "💡 言語やスタイルを変更したいですか？Agent に「このプラグインをカスタマイズしたい」と伝えるだけで、母国語でインタビューが行われ自動再構築されます！⚠️ 注意: 変更後はターミナルを再起動して Node キャッシュを更新してください。",
        "info"
      );
    },
  });

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

    // 双向语言感知判定：支持非英语母语，也支持英语母语学外语，同时严格排除终端命令与代码
    if (!shouldTriggerTranslation(raw, state.sourceLang)) {
      return { action: "continue" };
    }

    const requestId = ++currentRequestId;

    // 【原文模式】(original · 默认)：彻底非阻塞 (0ms 立即放行原始输入)，后台异步微任务渲染卡片视窗
    if (state.mode === "original") {
      if (ctx.hasUI) {
        ctx.ui.setStatus("lingua", ctx.ui.theme.fg("accent", "⇄ [lingua] polishing..."));
      }

      translatePrompt(raw, {
        sourceLang: state.sourceLang,
        labels: state.labels,
      })
        .then((result) => {
          if (requestId !== currentRequestId || state.mode !== "original") {
            return;
          }
          if (result && ctx.hasUI) {
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
        })
        .finally(() => {
          if (requestId === currentRequestId) {
            updateFooter(ctx);
          }
        });

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
      const result = await translatePrompt(raw, {
        sourceLang: state.sourceLang,
        labels: state.labels,
      });
      if (requestId !== currentRequestId) {
        return { action: "continue" };
      }

      if (!result) {
        if (ctx.hasUI) ctx.ui.setWidget("lingua_hud", undefined);
        return { action: "continue" };
      }

      renderHudWidget(
        ctx,
        result.sourceText,
        result.spoken,
        result.written,
        result.vocab,
        result.spokenMeaning,
        result.writtenMeaning
      );

      // 发给 AI 的是干净地道的技术英文（纯英文，绝无母语释义泄露）
      const englishText = result.written && result.written.trim() ? result.written : result.spoken;

      return {
        action: "transform",
        text: englishText,
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
