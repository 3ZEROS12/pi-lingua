// src/engine.ts
var DEFAULT_CONFIG = {
  endpoint: process.env.LINGUA_ENDPOINT || "http://127.0.0.1:8045/v1/chat/completions",
  apiKey: process.env.LINGUA_API_KEY || "sk-d9e62a39dd574907a04100acd9229a6c",
  model: process.env.LINGUA_MODEL || "gemini-3.8-flash",
  mode: "original",
  sourceLang: "ja",
  targetLang: "en",
  temperature: 0.2,
  timeoutMs: 3e4
};
var LINGUA_SYSTEM_PROMPT = `You are an elite bilingual developer language coach and senior software architect.
Task:
Translate the user's message from native Japanese (language A) into TWO distinct authentic English registers (language B), and provide the exact back-translation/nuance in Japanese for each register:
1. "spoken": Natural, fluent spoken English (daily standup, Slack, pair programming, agile team collaboration, code reviews). Authentic Silicon Valley flow, contractions, native phrasal verbs, natural idioms.
2. "spoken_meaning": The exact colloquial nuance and meaning in Japanese.
3. "written": Clear, precise, modern technical written English (PR descriptions, RFCs, issues, architecture docs). High-level Plain English: active, concise, professional. STRICTLY AVOID archaic Victorian fluff (e.g. "we may now proceed", "precipitated", "parsimonious").
4. "written_meaning": The exact formal technical nuance and meaning in Japanese.
5. "vocab": Adaptively extract ALL key idiomatic collocations, phrasal verbs, technical idioms, or advanced expressions bridging an intermediate Japanese engineer to IELTS Band 8.0+ / native developer fluency. Do NOT artificially cap at 1-2; extract as many as genuinely beneficial, while keeping each definition concise in Japanese in parentheses separated by " \xB7 " (e.g. "term1 (\u65E5\u672C\u8A9E\u306E\u610F\u5473) \xB7 term2 (\u65E5\u672C\u8A9E\u306E\u610F\u5473) \xB7 ...") to ensure the terminal HUD remains vertically compact.

[CODE & SYMBOL SHIELD - STRICT RULE]:
All inline code (\`foo()\`), file paths (@file, path/to/file), SQL keywords, variable names, and technical identifiers MUST be preserved 100% verbatim in both spoken and written outputs. Never translate, rephrase, or drop code tokens.

[GOLDEN FEW-SHOT ANCHORS]:
Input: "\u8CDB\u6210\u3067\u3059\u3001\u9032\u3081\u307E\u3057\u3087\u3046"
Output:
{
  "spoken": "Totally on board with that \u2014 let's dive right in.",
  "spoken_meaning": "\u5B8C\u5168\u306B\u8CDB\u6210\u3001\u65E9\u901F\u53D6\u308A\u639B\u304B\u308D\u3046",
  "written": "Acknowledged. Let's proceed with the implementation.",
  "written_meaning": "\u4E86\u89E3\u3057\u307E\u3057\u305F\u3002\u5B9F\u88C5\u3092\u9032\u3081\u307E\u3057\u3087\u3046",
  "vocab": "on board with (\u8CDB\u6210\u3057\u3066/\u540C\u8ABF\u3057\u3066) \xB7 dive in (\u76F4\u3061\u306B\u53D6\u308A\u639B\u304B\u308B)"
}

Input: "\u7D9A\u3051\u3066\u304F\u3060\u3055\u3044"
Output:
{
  "spoken": "Let's keep going.",
  "spoken_meaning": "\u3053\u306E\u307E\u307E\u7D9A\u3051\u3088\u3046",
  "written": "Proceed with the next steps.",
  "written_meaning": "\u6B21\u306E\u30B9\u30C6\u30C3\u30D7\u306B\u9032\u3093\u3067\u304F\u3060\u3055\u3044",
  "vocab": "keep going (\u305D\u306E\u307E\u307E\u7D9A\u3051\u308B) \xB7 proceed with (\u301C\u3092\u9032\u3081\u308B)"
}

Input: "\u3053\u306E\u8A2D\u8A08\u306F\u5C11\u3005\u30AA\u30FC\u30D0\u30FC\u30A8\u30F3\u30B8\u30CB\u30A2\u30EA\u30F3\u30B0\u6C17\u5473\u306A\u306E\u3067\u3001\u6A19\u6E96\u30E9\u30A4\u30D6\u30E9\u30EA\u3067\u30B7\u30F3\u30D7\u30EB\u306B\u5B9F\u88C5\u3057\u305F\u307B\u3046\u304C\u3044\u3044\u3067\u3059"
Output:
{
  "spoken": "This feels a bit over-engineered; we'd be much better off just sticking with the standard library.",
  "spoken_meaning": "\u3061\u3087\u3063\u3068\u4F5C\u308A\u8FBC\u307F\u3059\u304E\u306A\u6C17\u304C\u3059\u308B\u3002\u6A19\u6E96\u30E9\u30A4\u30D6\u30E9\u30EA\u306E\u307E\u307E\u306B\u3057\u305F\u65B9\u304C\u305A\u3063\u3068\u3044\u3044",
  "written": "The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.",
  "written_meaning": "\u63D0\u6848\u3055\u308C\u305F\u30A2\u30D7\u30ED\u30FC\u30C1\u306F\u4E0D\u8981\u306A\u8907\u96D1\u3055\u3092\u3082\u305F\u3089\u3057\u307E\u3059\u3002\u6A19\u6E96\u30E9\u30A4\u30D6\u30E9\u30EA\u306E\u5B9F\u88C5\u3092\u6D3B\u7528\u3059\u308B\u3053\u3068\u304C\u63A8\u5968\u3055\u308C\u307E\u3059",
  "vocab": "over-engineered (\u904E\u5270\u8A2D\u8A08\u306E) \xB7 be better off (\u301C\u3059\u308B\u65B9\u304C\u826F\u3044) \xB7 stick with (\u301C\u3092\u4F7F\u3044\u7D9A\u3051\u308B) \xB7 leverage (\u6D3B\u7528\u3059\u308B)"
}

Strict JSON format:
{
  "spoken": "...",
  "spoken_meaning": "...",
  "written": "...",
  "written_meaning": "...",
  "vocab": "..."
}
Output valid JSON ONLY. Never output markdown code fences, backticks, quotes, or explanations.`;
function isNonEnglish(text) {
  const naturalLanguageScript = /[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af\u0400-\u04ff\u0600-\u06ff\u00c0-\u024f]/;
  return naturalLanguageScript.test(text);
}
var COMMON_TERMINAL_COMMAND_PREFIXES = [
  "git ",
  "npm ",
  "pnpm ",
  "yarn ",
  "bun ",
  "cd ",
  "docker ",
  "cargo ",
  "go ",
  "python ",
  "node ",
  "deno ",
  "curl ",
  "cat ",
  "ls ",
  "grep ",
  "find "
];
var CODE_STATEMENT_STARTERS = [
  "const ",
  "let ",
  "var ",
  "function ",
  "class ",
  "import ",
  "export ",
  "def ",
  "struct ",
  "impl ",
  "interface ",
  "type ",
  "return "
];
function shouldTriggerTranslation(text, sourceLang = "ja") {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (sourceLang !== "en") {
    return isNonEnglish(trimmed);
  }
  const lower = trimmed.toLowerCase();
  if (COMMON_TERMINAL_COMMAND_PREFIXES.some((prefix) => lower.startsWith(prefix))) {
    return false;
  }
  if (CODE_STATEMENT_STARTERS.some((prefix) => lower.startsWith(prefix))) {
    return false;
  }
  const words = trimmed.split(/\s+/);
  if (words.length < 2) {
    return false;
  }
  return /[a-zA-Z]{2,}/.test(trimmed);
}
function parseLlmResponse(raw) {
  try {
    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null;
    }
    const jsonSubstr = raw.slice(firstBrace, lastBrace + 1);
    const parsed = JSON.parse(jsonSubstr);
    const spoken = (parsed.spoken || parsed.casual || parsed.slot1 || "").trim();
    const spokenMeaning = (parsed.spoken_meaning || parsed.spokenMeaning || "").trim();
    const written = (parsed.written || parsed.academic || parsed.slot2 || "").trim();
    const writtenMeaning = (parsed.written_meaning || parsed.writtenMeaning || "").trim();
    const vocab = typeof parsed.vocab === "string" ? parsed.vocab.trim() : "";
    if (spoken) {
      return {
        spoken,
        spokenMeaning: spokenMeaning || void 0,
        written: written || void 0,
        writtenMeaning: writtenMeaning || void 0,
        vocab: vocab || void 0
      };
    }
    return null;
  } catch {
    return null;
  }
}
function formatTerminalAnnotation(sourceText, spoken, written, vocab, options = {}) {
  const slot1 = options.slot1Label || "\u53E3\u8A9E";
  const slot2 = options.slot2Label || "\u6587\u9762";
  const vocabTag = options.vocabLabel || "\u5358\u8A9E";
  const sourceTag = options.sourceLabel || "\u539F\u6587";
  const spokenDisplay = options.spokenMeaning ? `${spoken} (${options.spokenMeaning})` : spoken;
  const writtenDisplay = written && options.writtenMeaning ? `${written} (${options.writtenMeaning})` : written || "";
  const hasSlot2 = Boolean(writtenDisplay && writtenDisplay.trim());
  const hasVocab = Boolean(vocab && vocab.trim());
  const lines = [`  \xB7 ${sourceTag}   ${sourceText}`];
  if (hasSlot2 && hasVocab) {
    lines.push(
      `  \u250C [${slot1}] ${spokenDisplay}`,
      `  \u251C [${slot2}] ${writtenDisplay}`,
      `  \u2514 [${vocabTag}] ${vocab}`
    );
  } else if (hasSlot2) {
    lines.push(
      `  \u250C [${slot1}] ${spokenDisplay}`,
      `  \u2514 [${slot2}] ${writtenDisplay}`
    );
  } else if (hasVocab) {
    lines.push(
      `  \u250C [${slot1}] ${spokenDisplay}`,
      `  \u2514 [${vocabTag}] ${vocab}`
    );
  } else {
    lines.push(`  \u2514 [${slot1}] ${spokenDisplay}`);
  }
  return lines.join("\n");
}
async function translatePrompt(text, userConfig = {}) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const cfg = { ...DEFAULT_CONFIG, ...userConfig };
  if (!shouldTriggerTranslation(trimmed, cfg.sourceLang)) {
    return null;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
  try {
    const response = await fetch(cfg.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: [
          { role: "system", content: LINGUA_SYSTEM_PROMPT },
          { role: "user", content: trimmed }
        ],
        temperature: cfg.temperature
      }),
      signal: controller.signal
    });
    if (!response.ok) {
      return null;
    }
    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      return null;
    }
    const payload = parseLlmResponse(content);
    if (!payload || !payload.spoken) return null;
    const slot1Label = cfg.labels?.slot1Label || cfg.labels?.spokenLabel || "\u53E3\u8A9E";
    const slot2Label = cfg.labels?.slot2Label || cfg.labels?.writtenLabel || "\u6587\u9762";
    const vocabLabel = cfg.labels?.vocabLabel || "\u5358\u8A9E";
    const sourceLabel = cfg.labels?.sourceLabel || "\u539F\u6587";
    return {
      spoken: payload.spoken,
      spokenMeaning: payload.spokenMeaning,
      written: payload.written || "",
      writtenMeaning: payload.writtenMeaning,
      vocab: payload.vocab,
      sourceText: trimmed,
      annotated: formatTerminalAnnotation(
        trimmed,
        payload.spoken,
        payload.written,
        payload.vocab,
        {
          spokenMeaning: payload.spokenMeaning,
          writtenMeaning: payload.writtenMeaning,
          slot1Label,
          slot2Label,
          vocabLabel,
          sourceLabel
        }
      )
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// src/extension.ts
var DEFAULT_LABELS = {
  slot1Label: "\u53E3\u8A9E",
  slot2Label: "\u6587\u9762",
  vocabLabel: "\u5358\u8A9E",
  sourceLabel: "\u539F\u6587",
  hudTitle: "\u4E8C \u21C4 two",
  statusOriginal: "\u21C4 [\u4E8C \u21C4 two] \u539F\u6587",
  statusEnglish: "\u21C4 [\u4E8C \u21C4 two] \u82F1\u8A9E",
  statusOff: "\u21C4 [\u4E8C \u21C4 two]: \u30AA\u30D5",
  spokenLabel: "\u53E3\u8A9E",
  writtenLabel: "\u6587\u9762"
};
var state = {
  mode: "original",
  sourceLang: "ja",
  labels: { ...DEFAULT_LABELS }
};
var currentRequestId = 0;
function updateFooter(ctx) {
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
function renderHudWidget(ctx, sourceText, spoken, written, vocab, spokenMeaning, writtenMeaning) {
  if (!ctx.hasUI) return;
  const hasWritten = Boolean(written && written.trim());
  const hasVocab = Boolean(vocab && vocab.trim());
  const slot1 = state.labels.slot1Label || state.labels.spokenLabel || "\u53E3\u8A9E";
  const slot2 = state.labels.slot2Label || state.labels.writtenLabel || "\u6587\u9762";
  const vocabTag = state.labels.vocabLabel || "\u5358\u8A9E";
  const sourceTag = state.labels.sourceLabel || "\u539F\u6587";
  const spokenDisplay = spokenMeaning ? `${spoken} ` + ctx.ui.theme.fg("dim", `(${spokenMeaning})`) : spoken;
  const writtenDisplay = written && writtenMeaning ? `${written} ` + ctx.ui.theme.fg("dim", `(${writtenMeaning})`) : written || "";
  const lines = [
    ctx.ui.theme.fg("muted", "  \xB7 ") + ctx.ui.theme.fg("dim", `${sourceTag}   `) + sourceText
  ];
  if (hasWritten && hasVocab) {
    lines.push(
      ctx.ui.theme.fg("muted", "  \u250C ") + ctx.ui.theme.fg("accent", `[${slot1}] `) + spokenDisplay,
      ctx.ui.theme.fg("muted", "  \u251C ") + ctx.ui.theme.fg("accent", `[${slot2}] `) + writtenDisplay,
      ctx.ui.theme.fg("muted", "  \u2514 ") + ctx.ui.theme.fg("muted", `[${vocabTag}] `) + ctx.ui.theme.fg("dim", vocab)
    );
  } else if (hasWritten) {
    lines.push(
      ctx.ui.theme.fg("muted", "  \u250C ") + ctx.ui.theme.fg("accent", `[${slot1}] `) + spokenDisplay,
      ctx.ui.theme.fg("muted", "  \u2514 ") + ctx.ui.theme.fg("accent", `[${slot2}] `) + writtenDisplay
    );
  } else if (hasVocab) {
    lines.push(
      ctx.ui.theme.fg("muted", "  \u250C ") + ctx.ui.theme.fg("accent", `[${slot1}] `) + spokenDisplay,
      ctx.ui.theme.fg("muted", "  \u2514 ") + ctx.ui.theme.fg("muted", `[${vocabTag}] `) + ctx.ui.theme.fg("dim", vocab)
    );
  } else {
    lines.push(
      ctx.ui.theme.fg("muted", "  \u2514 ") + ctx.ui.theme.fg("accent", `[${slot1}] `) + spokenDisplay
    );
  }
  ctx.ui.setWidget("lingua_hud", lines, { placement: "aboveEditor" });
}
function extension_default(pi) {
  pi.on("session_start", async (_event, ctx) => {
    updateFooter(ctx);
  });
  const cycleModeHandler = async (_args, ctx) => {
    currentRequestId++;
    if (state.mode === "original") {
      state.mode = "english";
      updateFooter(ctx);
      ctx.ui.notify(`[${state.labels.hudTitle}] \u3010\u82F1\u8A9E\u30E2\u30FC\u30C9\u3011\u306B\u5207\u308A\u66FF\u3048\u307E\u3057\u305F\uFF1AAI\u3078\u306E\u5165\u529B\u306F\u7D14\u7C8B\u306A\u6280\u8853\u82F1\u8A9E\u306B\u81EA\u52D5\u5909\u63DB\u3055\u308C\u307E\u3059`, "info");
    } else if (state.mode === "english") {
      state.mode = "off";
      updateFooter(ctx);
      ctx.ui.setWidget("lingua_hud", void 0);
      ctx.ui.notify(`[${state.labels.hudTitle}] \u30AA\u30D5\u306B\u3057\u307E\u3057\u305F`, "info");
    } else {
      state.mode = "original";
      updateFooter(ctx);
      ctx.ui.notify(`[${state.labels.hudTitle}] \u3010\u539F\u6587\u30E2\u30FC\u30C9\u3011\u306B\u5207\u308A\u66FF\u3048\u307E\u3057\u305F\uFF1AAI\u3078\u306E\u5165\u529B\u306F\u539F\u6587\u306E\u307E\u307E\u3001\u4E0A\u90E8\u30AB\u30FC\u30C9\u3067\u82F1\u8A9E\u3092\u8868\u793A`, "info");
    }
  };
  pi.registerCommand("lingua", {
    description: "\u30E2\u30FC\u30C9\u5207\u66FF [\u4E8C \u21C4 two]: [\u539F\u6587] \u2794 [\u82F1\u8A9E] \u2794 [\u30AA\u30D5]",
    handler: cycleModeHandler
  });
  pi.registerCommand("lingual", {
    description: "\u30E2\u30FC\u30C9\u5207\u66FF [\u4E8C \u21C4 two] (\u30A8\u30A4\u30EA\u30A2\u30B9)",
    handler: cycleModeHandler
  });
  pi.registerCommand("translate", {
    description: "\u30E2\u30FC\u30C9\u5207\u66FF [\u4E8C \u21C4 two] (\u30A8\u30A4\u30EA\u30A2\u30B9)",
    handler: cycleModeHandler
  });
  pi.registerCommand("2", {
    description: "\u30E2\u30FC\u30C9\u5207\u66FF [\u4E8C \u21C4 two] (\u30A8\u30A4\u30EA\u30A2\u30B9)",
    handler: cycleModeHandler
  });
  pi.registerCommand("lingua-agent", {
    description: "AI Coding Agent \u306B\u3088\u308B\u30D7\u30E9\u30B0\u30A4\u30F3\u306E\u30AB\u30B9\u30BF\u30DE\u30A4\u30BA\u65B9\u6CD5\u3092\u78BA\u8A8D",
    handler: async (_args, ctx) => {
      ctx.ui.notify(
        "\u{1F4A1} \u8A00\u8A9E\u3084\u30B9\u30BF\u30A4\u30EB\u3092\u5909\u66F4\u3057\u305F\u3044\u3067\u3059\u304B\uFF1FAgent \u306B\u300C\u3053\u306E\u30D7\u30E9\u30B0\u30A4\u30F3\u3092\u30AB\u30B9\u30BF\u30DE\u30A4\u30BA\u3057\u305F\u3044\u300D\u3068\u4F1D\u3048\u308B\u3060\u3051\u3067\u3001\u6BCD\u56FD\u8A9E\u3067\u30A4\u30F3\u30BF\u30D3\u30E5\u30FC\u304C\u884C\u308F\u308C\u81EA\u52D5\u518D\u69CB\u7BC9\u3055\u308C\u307E\u3059\uFF01\u26A0\uFE0F \u6CE8\u610F: \u5909\u66F4\u5F8C\u306F\u30BF\u30FC\u30DF\u30CA\u30EB\u3092\u518D\u8D77\u52D5\u3057\u3066 Node \u30AD\u30E3\u30C3\u30B7\u30E5\u3092\u66F4\u65B0\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
        "info"
      );
    }
  });
  pi.on("input", async (event, ctx) => {
    if (state.mode === "off") return { action: "continue" };
    if (event.source === "extension") return { action: "continue" };
    const raw = event.text.trim();
    if (!raw) return { action: "continue" };
    if (raw.startsWith("/") || raw.startsWith("!")) {
      return { action: "continue" };
    }
    if (!shouldTriggerTranslation(raw, state.sourceLang)) {
      return { action: "continue" };
    }
    const requestId = ++currentRequestId;
    if (state.mode === "original") {
      if (ctx.hasUI) {
        ctx.ui.setStatus("lingua", ctx.ui.theme.fg("accent", "\u21C4 [lingua] polishing..."));
      }
      translatePrompt(raw, {
        sourceLang: state.sourceLang,
        labels: state.labels
      }).then((result) => {
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
      }).finally(() => {
        if (requestId === currentRequestId) {
          updateFooter(ctx);
        }
      });
      return { action: "continue" };
    }
    if (ctx.hasUI) {
      ctx.ui.setWidget(
        "lingua_hud",
        [ctx.ui.theme.fg("muted", "  \u22EF \u21C4 [lingua] polishing...")],
        { placement: "aboveEditor" }
      );
      ctx.ui.setStatus("lingua", ctx.ui.theme.fg("accent", "\u21C4 [lingua] polishing..."));
    }
    try {
      const result = await translatePrompt(raw, {
        sourceLang: state.sourceLang,
        labels: state.labels
      });
      if (requestId !== currentRequestId) {
        return { action: "continue" };
      }
      if (!result) {
        if (ctx.hasUI) ctx.ui.setWidget("lingua_hud", void 0);
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
      const englishText = result.written && result.written.trim() ? result.written : result.spoken;
      return {
        action: "transform",
        text: englishText,
        images: event.images
      };
    } catch {
      if (ctx.hasUI) ctx.ui.setWidget("lingua_hud", void 0);
      return { action: "continue" };
    } finally {
      if (requestId === currentRequestId) {
        updateFooter(ctx);
      }
    }
  });
}
export {
  extension_default as default
};
