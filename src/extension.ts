import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type {
  ExtensionAPI,
  ExtensionContext,
  InputEvent,
  InputEventResult,
} from "@earendil-works/pi-coding-agent";
import type { LinguaMode, LinguaI18nLabels } from "./types.js";
import {
  translatePrompt,
  shouldTriggerTranslation,
  loadUserConfig,
} from "./engine.js";

interface ExtensionState {
  mode: LinguaMode;
  sourceLang: string;
  selectedModel: string;
  labels: LinguaI18nLabels;
}

// 默认配置：中文母语 ➔ 英文伴走工作流 [二 ⇄ two]
const DEFAULT_LABELS: LinguaI18nLabels = {
  slot1Label: "口语",
  slot2Label: "写作",
  vocabLabel: "重点",
  sourceLabel: "原文",
  hudTitle: "二 ⇄ two",
  statusOriginal: "⇄ [二 ⇄ two] 原文",
  statusEnglish: "⇄ [二 ⇄ two] 英文",
  statusOff: "⇄ [二 ⇄ two]: 关",
  spokenLabel: "口语",
  writtenLabel: "写作",
};

const initialDiskConfig = loadUserConfig();

const state: ExtensionState = {
  mode: initialDiskConfig.mode || "original",
  sourceLang: initialDiskConfig.sourceLang || "zh",
  selectedModel: initialDiskConfig.selectedModel || "auto",
  labels: { ...DEFAULT_LABELS },
};

function saveUserLinguaConfig(patch: Record<string, any>) {
  try {
    const configDir = path.join(os.homedir(), ".pi", "agent");
    const configFile = path.join(configDir, "lingua.json");
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    let existing: Record<string, any> = {};
    if (fs.existsSync(configFile)) {
      try {
        existing = JSON.parse(fs.readFileSync(configFile, "utf8"));
      } catch {}
    }
    const updated = { ...existing, ...patch };
    fs.writeFileSync(configFile, JSON.stringify(updated, null, 2), "utf8");
  } catch {}
}

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

  // 安全单行收敛与 Unicode/CJK 超长截断保护，避免多行排版爆炸和终端撕裂
  const cleanSource = sourceText.replace(/\r?\n+/g, " ").trim();
  const chars = Array.from(cleanSource);
  const displaySource = chars.length > 40 ? chars.slice(0, 37).join("") + "..." : cleanSource;

  const lines: string[] = [
    ctx.ui.theme.fg("muted", "  · ") + ctx.ui.theme.fg("dim", `${sourceTag}   `) + displaySource,
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
      ctx.ui.notify(`[${state.labels.hudTitle}] 已切换至【英文模式】：发给 AI 的输入将自动转换为纯正技术英文`, "info");
    } else if (state.mode === "english") {
      state.mode = "off";
      updateFooter(ctx);
      ctx.ui.setWidget("lingua_hud", undefined);
      ctx.ui.notify(`[${state.labels.hudTitle}] 已关闭伴学`, "info");
    } else {
      state.mode = "original";
      updateFooter(ctx);
      ctx.ui.notify(`[${state.labels.hudTitle}] 已切换至【原文模式】：输入保持纯净母语，上方 HUD 浮现伴学视窗`, "info");
    }
  };

  pi.registerCommand("lingua", {
    description: "切换伴学模式 [二 ⇄ two]: [原文] ➔ [英文] ➔ [关]",
    handler: cycleModeHandler,
  });

  pi.registerCommand("lingual", {
    description: "切换伴学模式 [二 ⇄ two] (别名)",
    handler: cycleModeHandler,
  });

  pi.registerCommand("translate", {
    description: "切换伴学模式 [二 ⇄ two] (别名)",
    handler: cycleModeHandler,
  });

  pi.registerCommand("2", {
    description: "切换伴学模式 [二 ⇄ two] (别名)",
    handler: cycleModeHandler,
  });

  pi.registerCommand("lingua-agent", {
    description: "查看 AI Coding Agent 自主定制本插件的方法",
    handler: async (_args, ctx) => {
      ctx.ui.notify(
        "💡 想要更换语言或风格？对你的 Agent 说一句话（如“我想定制这个伴学插件”），Agent 将自主为你完成诊断问卷与重新构建！⚠️ 注意：完成后请重启终端生效。",
        "info"
      );
    },
  });

  pi.registerCommand("lingua-model", {
    description: "查看或切换伴学模型 [二 ⇄ two]: /lingua-model [model-id|auto]",
    handler: async (args: string, ctx: ExtensionContext) => {
      const trimmed = args.trim();
      const currentActive = state.selectedModel === "auto"
        ? (ctx.model ? `auto (跟随会话: ${ctx.model.provider}/${ctx.model.id})` : "auto")
        : state.selectedModel;

      if (!trimmed) {
        let msg = `[${state.labels.hudTitle}] 当前伴学模型: ${currentActive}\n`;
        const available = ctx.modelRegistry?.getAvailable?.() || [];
        if (available.length > 0) {
          const list = available.map((m) => `• ${m.provider}/${m.id}`).slice(0, 8).join("\n");
          msg += `可用模型 (输入 /lingua-model <id> 切换):\n${list}\n• auto (自动跟随当前会话主模型)`;
        } else {
          msg += "可输入 /lingua-model <model-id> 或 auto 指定伴学模型。";
        }
        ctx.ui.notify(msg, "info");
        return;
      }

      state.selectedModel = trimmed;
      saveUserLinguaConfig({ selectedModel: trimmed });
      ctx.ui.notify(`[${state.labels.hudTitle}] 伴学模型已切换为: ${trimmed}`, "info");
    },
  });

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
        const stream = ctx.modelRegistry.streamSimple(targetModel, {
          systemPrompt,
          messages: [
            {
              role: "user",
              content: [{ type: "text", text }],
              timestamp: Date.now(),
            },
          ],
        });

        const res = await stream.result();
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

    // 双向语言感知判定：支持非英语母语，也支持英语母语学外语，同时严格排除终端命令与代码
    if (!shouldTriggerTranslation(raw, state.sourceLang)) {
      return { action: "continue" };
    }

    const requestId = ++currentRequestId;
    const completer = createModelCompleter(ctx);

    // 【原文模式】(original · 默认)：彻底非阻塞 (0ms 立即放行原始输入)，后台异步微任务渲染卡片视窗
    if (state.mode === "original") {
      if (ctx.hasUI) {
        ctx.ui.setStatus("lingua", ctx.ui.theme.fg("accent", "⇄ [lingua] polishing..."));
      }

      translatePrompt(raw, {
        sourceLang: state.sourceLang,
        labels: state.labels,
        complete: completer,
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
        complete: completer,
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
