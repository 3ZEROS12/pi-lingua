// src/extension.ts
import fs2 from "fs";
import path2 from "path";
import os2 from "os";

// src/engine.ts
import fs from "fs";
import path from "path";
import os from "os";
function loadUserConfig() {
  const configPaths = [
    path.join(os.homedir(), ".pi", "agent", "lingua.json"),
    path.join(os.homedir(), ".pi", "agent", "settings.json"),
    path.join(os.homedir(), ".pi", "agent", "translate.json")
  ];
  for (const p of configPaths) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf8");
        const parsed = JSON.parse(raw);
        const target = p.endsWith("settings.json") ? parsed["pi-lingual"] || parsed["lingua"] : parsed;
        if (!target) continue;
        const endpoint = target.endpoint || target.antigravity?.endpoint;
        const apiKey = target.apiKey || target.antigravity?.apiKey;
        const model = target.model || target.antigravity?.model;
        const selectedModel = target.selectedModel || target.model;
        return {
          ...endpoint ? { endpoint } : {},
          ...apiKey ? { apiKey } : {},
          ...model ? { model } : {},
          ...selectedModel ? { selectedModel } : {},
          ...target.mode ? { mode: target.mode } : {},
          ...target.sourceLang ? { sourceLang: target.sourceLang } : {},
          ...target.targetLang ? { targetLang: target.targetLang } : {}
        };
      }
    } catch {
    }
  }
  return {};
}
var DEFAULT_CONFIG = {
  endpoint: process.env.LINGUA_ENDPOINT || "",
  apiKey: process.env.LINGUA_API_KEY || "",
  model: process.env.LINGUA_MODEL || "",
  selectedModel: "auto",
  mode: "original",
  sourceLang: "zh",
  targetLang: "en",
  temperature: 0.2,
  timeoutMs: 3e4
};
var LINGUA_SYSTEM_PROMPT = `You are an elite bilingual developer language coach and senior software architect.
Task:
Translate the user's message from native Chinese (language A) into TWO distinct authentic English registers (language B), and provide the exact back-translation/nuance in Chinese for each register:
1. "spoken": Natural, fluent spoken English (daily standup, Slack, pair programming, agile team collaboration, code reviews). Authentic Silicon Valley flow, contractions, native phrasal verbs, natural idioms.
2. "spoken_meaning": The exact colloquial nuance and meaning in Chinese.
3. "written": Clear, precise, modern technical written English (PR descriptions, RFCs, issues, architecture docs). High-level Plain English: active, concise, professional. STRICTLY AVOID archaic Victorian fluff (e.g. "we may now proceed", "precipitated", "parsimonious").
4. "written_meaning": The exact formal technical nuance and meaning in Chinese.
5. "vocab": Adaptively extract ALL key idiomatic collocations, phrasal verbs, technical idioms, or advanced expressions bridging the user to high-level/native developer fluency. Do NOT artificially cap at 1-2; extract as many as genuinely beneficial, while keeping each definition concise in Chinese in parentheses separated by " \xB7 " (e.g. "term1 (\u4E2D\u6587\u91CA\u4E49) \xB7 term2 (\u4E2D\u6587\u91CA\u4E49) \xB7 ...") to ensure the terminal HUD remains vertically compact.

[CODE & SYMBOL SHIELD - STRICT RULE]:
All inline code (\`foo()\`), file paths (@file, path/to/file), SQL keywords, variable names, and technical identifiers MUST be preserved 100% verbatim in both spoken and written outputs. Never translate, rephrase, or drop code tokens.

[GOLDEN FEW-SHOT ANCHORS]:
Input: "\u8BA4\u540C\uFF0C\u5F00\u59CB\u5427"
Output:
{
  "spoken": "Totally on board with that \u2014 let's dive right in.",
  "spoken_meaning": "\u5B8C\u5168\u8D5E\u540C\uFF0C\u54B1\u4EEC\u76F4\u63A5\u5F00\u641E",
  "written": "Acknowledged. Let's proceed with the implementation.",
  "written_meaning": "\u786E\u8BA4\u8D5E\u540C\uFF0C\u7740\u624B\u63A8\u8FDB\u5177\u4F53\u5B9E\u65BD",
  "vocab": "on board with (\u8D5E\u6210/\u652F\u6301) \xB7 dive in (\u7ACB\u523B\u7740\u624B/\u5F00\u641E)"
}

Input: "\u7EE7\u7EED"
Output:
{
  "spoken": "Let's keep going.",
  "spoken_meaning": "\u7EE7\u7EED\u5F80\u4E0B\u641E",
  "written": "Proceed with the next steps.",
  "written_meaning": "\u63A8\u8FDB\u540E\u7EED\u6B65\u9AA4",
  "vocab": "keep going (\u7EE7\u7EED\u63A8\u8FDB) \xB7 proceed with (\u7740\u624B\u8FDB\u884C)"
}

Input: "\u8FD9\u4E2A\u65B9\u6848\u6709\u70B9\u8FC7\u5EA6\u8BBE\u8BA1\u4E86\uFF0C\u4E0D\u5982\u76F4\u63A5\u7528\u6807\u51C6\u5E93\u5B9E\u73B0"
Output:
{
  "spoken": "This feels a bit over-engineered; we'd be much better off just sticking with the standard library.",
  "spoken_meaning": "\u611F\u89C9\u6709\u70B9\u8FC7\u5EA6\u8BBE\u8BA1\u4E86\uFF0C\u7528\u6807\u51C6\u5E93\u5212\u7B97\u5F97\u591A",
  "written": "The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.",
  "written_meaning": "\u8BE5\u65B9\u6848\u5F15\u5165\u4E86\u4E0D\u5FC5\u8981\u7684\u590D\u6742\u5EA6\uFF0C\u5EFA\u8BAE\u4F18\u5148\u91C7\u7528\u539F\u751F\u6807\u51C6\u5E93\u5B9E\u73B0",
  "vocab": "over-engineered (\u8FC7\u5EA6\u5DE5\u7A0B\u5316) \xB7 be better off (\u505A\u67D0\u4E8B\u66F4\u5408\u9002/\u5212\u7B97) \xB7 stick with (\u575A\u6301\u4F7F\u7528/\u6CBF\u7528) \xB7 leverage (\u5229\u7528/\u501F\u52A9)"
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
var MAX_TRANSLATION_CHARS = 300;
var MAX_TRANSLATION_LINES = 3;
function shouldTriggerTranslation(text, sourceLang = "zh") {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (trimmed.length > MAX_TRANSLATION_CHARS) {
    return false;
  }
  const lines = trimmed.split(/\r?\n/);
  if (lines.length > MAX_TRANSLATION_LINES) {
    return false;
  }
  if (/^#{1,6}\s/.test(trimmed) || trimmed.includes("```") || trimmed.startsWith("---")) {
    return false;
  }
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
function getVisualWidth(str) {
  let width = 0;
  const clean = str.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");
  for (const char of clean) {
    const code = char.codePointAt(0) || 0;
    if (code >= 4352 && code <= 4447 || code >= 11904 && code <= 42191 || code >= 44032 && code <= 55203 || code >= 63744 && code <= 64255 || code >= 65040 && code <= 65049 || code >= 65072 && code <= 65135 || code >= 65280 && code <= 65376 || code >= 65504 && code <= 65510 || code >= 127744 && code <= 128591 || code >= 129280 && code <= 129535) {
      width += 2;
    } else {
      width += 1;
    }
  }
  return width;
}
function wrapVisualText(text, maxWidth) {
  if (maxWidth <= 0) return [text];
  const lines = [];
  let currentLine = "";
  let currentWidth = 0;
  const tokenRegex = /\x1b\[[0-9;]*[a-zA-Z]|\s+|[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]|[^\s\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af\x1b]+/g;
  let match;
  while ((match = tokenRegex.exec(text)) !== null) {
    const token = match[0];
    const tokenWidth = getVisualWidth(token);
    if (tokenWidth === 0) {
      currentLine += token;
      continue;
    }
    if (currentWidth + tokenWidth <= maxWidth) {
      currentLine += token;
      currentWidth += tokenWidth;
    } else {
      if (currentLine === "") {
        lines.push(token);
        continue;
      }
      lines.push(currentLine.trimEnd());
      currentLine = token.trimStart();
      currentWidth = getVisualWidth(currentLine);
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine.trimEnd());
  }
  return lines;
}
function formatTreeBranch(branchChar, contChar, tag, content, prefixDecorator = (s) => s, tagDecorator = (s) => s, contDecorator = (s) => s, maxCols = (process.stdout.columns || 100) - 2) {
  const rawPrefix = `  ${branchChar} [${tag}] `;
  const prefixW = getVisualWidth(rawPrefix);
  const rawCont = `  ${contChar}${" ".repeat(Math.max(1, prefixW - 3))}`;
  const availW = Math.max(25, maxCols - prefixW);
  const lines = wrapVisualText(content, availW);
  if (lines.length === 0) {
    return [prefixDecorator(`  ${branchChar} `) + tagDecorator(`[${tag}]`)];
  }
  return lines.map((line, idx) => {
    if (idx === 0) {
      return prefixDecorator(`  ${branchChar} `) + tagDecorator(`[${tag}] `) + line;
    }
    return contDecorator(rawCont) + line;
  });
}
function formatTerminalAnnotation(sourceText, spoken, written, vocab, options = {}) {
  const slot1 = options.slot1Label || "\u53E3\u8BED";
  const slot2 = options.slot2Label || "\u5199\u4F5C";
  const vocabTag = options.vocabLabel || "\u91CD\u70B9";
  const sourceTag = options.sourceLabel || "\u539F\u6587";
  const spokenDisplay = options.spokenMeaning ? `${spoken} (${options.spokenMeaning})` : spoken;
  const writtenDisplay = written && options.writtenMeaning ? `${written} (${options.writtenMeaning})` : written || "";
  const hasSlot2 = Boolean(writtenDisplay && writtenDisplay.trim());
  const hasVocab = Boolean(vocab && vocab.trim());
  const cleanSource = sourceText.replace(/\r?\n+/g, " ").trim();
  const chars = Array.from(cleanSource);
  const displaySource = chars.length > 40 ? chars.slice(0, 37).join("") + "..." : cleanSource;
  const lines = [`  \xB7 ${sourceTag}   ${displaySource}`];
  if (hasSlot2 && hasVocab) {
    lines.push(
      ...formatTreeBranch("\u250C", "\u2502", slot1, spokenDisplay),
      ...formatTreeBranch("\u251C", "\u2502", slot2, writtenDisplay),
      ...formatTreeBranch("\u2514", " ", vocabTag, vocab || "")
    );
  } else if (hasSlot2) {
    lines.push(
      ...formatTreeBranch("\u250C", "\u2502", slot1, spokenDisplay),
      ...formatTreeBranch("\u2514", " ", slot2, writtenDisplay)
    );
  } else if (hasVocab) {
    lines.push(
      ...formatTreeBranch("\u250C", "\u2502", slot1, spokenDisplay),
      ...formatTreeBranch("\u2514", " ", vocabTag, vocab || "")
    );
  } else {
    lines.push(...formatTreeBranch("\u2514", " ", slot1, spokenDisplay));
  }
  return lines.join("\n");
}
async function translatePrompt(text, userConfig = {}) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const diskConfig = loadUserConfig();
  const cfg = { ...DEFAULT_CONFIG, ...diskConfig, ...userConfig };
  if (!shouldTriggerTranslation(trimmed, cfg.sourceLang)) {
    return null;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
  try {
    let content = null;
    if (typeof cfg.complete === "function") {
      content = await cfg.complete(trimmed, LINGUA_SYSTEM_PROMPT);
    } else if (cfg.endpoint) {
      const headers = {
        "Content-Type": "application/json"
      };
      if (cfg.apiKey) {
        headers["Authorization"] = `Bearer ${cfg.apiKey}`;
      }
      const response = await fetch(cfg.endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: cfg.model || "gemini-3.8-flash",
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
      content = json?.choices?.[0]?.message?.content ?? null;
    } else {
      return null;
    }
    if (typeof content !== "string" || !content.trim()) {
      return null;
    }
    const payload = parseLlmResponse(content);
    if (!payload || !payload.spoken) return null;
    const slot1Label = cfg.labels?.slot1Label || cfg.labels?.spokenLabel || "\u53E3\u8BED";
    const slot2Label = cfg.labels?.slot2Label || cfg.labels?.writtenLabel || "\u5199\u4F5C";
    const vocabLabel = cfg.labels?.vocabLabel || "\u91CD\u70B9";
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
  slot1Label: "\u53E3\u8BED",
  slot2Label: "\u5199\u4F5C",
  vocabLabel: "\u91CD\u70B9",
  sourceLabel: "\u539F\u6587",
  hudTitle: "\u4E8C \u21C4 two",
  statusOriginal: "\u21C4 [\u4E8C \u21C4 two] \u539F\u6587",
  statusEnglish: "\u21C4 [\u4E8C \u21C4 two] \u82F1\u6587",
  statusOff: "\u21C4 [\u4E8C \u21C4 two]: \u5173",
  spokenLabel: "\u53E3\u8BED",
  writtenLabel: "\u5199\u4F5C"
};
var initialDiskConfig = loadUserConfig();
var state = {
  mode: initialDiskConfig.mode || "original",
  sourceLang: initialDiskConfig.sourceLang || "zh",
  selectedModel: initialDiskConfig.selectedModel || "auto",
  labels: { ...DEFAULT_LABELS }
};
function saveUserLinguaConfig(patch) {
  try {
    const agentDir = path2.join(os2.homedir(), ".pi", "agent");
    const settingsFile = path2.join(agentDir, "settings.json");
    const configFile = path2.join(agentDir, "lingua.json");
    if (fs2.existsSync(settingsFile)) {
      try {
        const raw = fs2.readFileSync(settingsFile, "utf8");
        const settings = JSON.parse(raw);
        const currentBlock = settings["pi-lingual"] || {};
        for (const [k, v] of Object.entries(patch)) {
          if (v === void 0 || v === "auto" || v === "original") {
            delete currentBlock[k];
          } else {
            currentBlock[k] = v;
          }
        }
        if (Object.keys(currentBlock).length === 0) {
          delete settings["pi-lingual"];
        } else {
          settings["pi-lingual"] = currentBlock;
        }
        fs2.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), "utf8");
      } catch {
      }
    }
    if (!fs2.existsSync(agentDir)) {
      fs2.mkdirSync(agentDir, { recursive: true });
    }
    let existing = {};
    if (fs2.existsSync(configFile)) {
      try {
        existing = JSON.parse(fs2.readFileSync(configFile, "utf8"));
      } catch {
      }
    }
    const updated = { ...existing, ...patch };
    fs2.writeFileSync(configFile, JSON.stringify(updated, null, 2), "utf8");
  } catch {
  }
}
var currentRequestId = 0;
var lastResult = null;
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
  const slot1 = state.labels.slot1Label || state.labels.spokenLabel || "\u53E3\u8BED";
  const slot2 = state.labels.slot2Label || state.labels.writtenLabel || "\u5199\u4F5C";
  const vocabTag = state.labels.vocabLabel || "\u91CD\u70B9";
  const sourceTag = state.labels.sourceLabel || "\u539F\u6587";
  const spokenDisplay = spokenMeaning ? `${spoken} ` + ctx.ui.theme.fg("dim", `(${spokenMeaning})`) : spoken;
  const writtenDisplay = written && writtenMeaning ? `${written} ` + ctx.ui.theme.fg("dim", `(${writtenMeaning})`) : written || "";
  const vocabDisplay = vocab ? ctx.ui.theme.fg("dim", vocab) : "";
  const cleanSource = sourceText.replace(/\r?\n+/g, " ").trim();
  const chars = Array.from(cleanSource);
  const displaySource = chars.length > 40 ? chars.slice(0, 37).join("") + "..." : cleanSource;
  const maxCols = process.stdout.columns || 100;
  const lines = [
    ctx.ui.theme.fg("muted", "  \xB7 ") + ctx.ui.theme.fg("dim", `${sourceTag}   `) + displaySource
  ];
  const pMuted = (s) => ctx.ui.theme.fg("muted", s);
  const pAccent = (s) => ctx.ui.theme.fg("accent", s);
  if (hasWritten && hasVocab) {
    lines.push(
      ...formatTreeBranch("\u250C", "\u2502", slot1, spokenDisplay, pMuted, pAccent, pMuted, maxCols),
      ...formatTreeBranch("\u251C", "\u2502", slot2, writtenDisplay, pMuted, pAccent, pMuted, maxCols),
      ...formatTreeBranch("\u2514", " ", vocabTag, vocabDisplay, pMuted, pMuted, pMuted, maxCols)
    );
  } else if (hasWritten) {
    lines.push(
      ...formatTreeBranch("\u250C", "\u2502", slot1, spokenDisplay, pMuted, pAccent, pMuted, maxCols),
      ...formatTreeBranch("\u2514", " ", slot2, writtenDisplay, pMuted, pAccent, pMuted, maxCols)
    );
  } else if (hasVocab) {
    lines.push(
      ...formatTreeBranch("\u250C", "\u2502", slot1, spokenDisplay, pMuted, pAccent, pMuted, maxCols),
      ...formatTreeBranch("\u2514", " ", vocabTag, vocabDisplay, pMuted, pMuted, pMuted, maxCols)
    );
  } else {
    lines.push(
      ...formatTreeBranch("\u2514", " ", slot1, spokenDisplay, pMuted, pAccent, pMuted, maxCols)
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
      ctx.ui.notify(`[${state.labels.hudTitle}] \u5DF2\u5207\u6362\u81F3\u3010\u82F1\u6587\u6A21\u5F0F\u3011\uFF1A\u53D1\u7ED9 AI \u7684\u8F93\u5165\u5C06\u81EA\u52A8\u8F6C\u6362\u4E3A\u7EAF\u6B63\u6280\u672F\u82F1\u6587`, "info");
    } else if (state.mode === "english") {
      state.mode = "off";
      updateFooter(ctx);
      ctx.ui.setWidget("lingua_hud", void 0);
      ctx.ui.notify(`[${state.labels.hudTitle}] \u5DF2\u5173\u95ED\u4F34\u5B66`, "info");
    } else {
      state.mode = "original";
      updateFooter(ctx);
      ctx.ui.notify(`[${state.labels.hudTitle}] \u5DF2\u5207\u6362\u81F3\u3010\u539F\u6587\u6A21\u5F0F\u3011\uFF1A\u8F93\u5165\u4FDD\u6301\u7EAF\u51C0\u6BCD\u8BED\uFF0C\u4E0A\u65B9 HUD \u6D6E\u73B0\u4F34\u5B66\u89C6\u7A97`, "info");
    }
  };
  pi.registerCommand("lingua", {
    description: "\u5207\u6362\u4F34\u5B66\u6A21\u5F0F [\u4E8C \u21C4 two]: [\u539F\u6587] \u2794 [\u82F1\u6587] \u2794 [\u5173]",
    handler: cycleModeHandler
  });
  pi.registerCommand("lingual", {
    description: "\u5207\u6362\u4F34\u5B66\u6A21\u5F0F [\u4E8C \u21C4 two] (\u522B\u540D)",
    handler: cycleModeHandler
  });
  pi.registerCommand("translate", {
    description: "\u5207\u6362\u4F34\u5B66\u6A21\u5F0F [\u4E8C \u21C4 two] (\u522B\u540D)",
    handler: cycleModeHandler
  });
  pi.registerCommand("2", {
    description: "\u5207\u6362\u4F34\u5B66\u6A21\u5F0F [\u4E8C \u21C4 two] (\u522B\u540D)",
    handler: cycleModeHandler
  });
  pi.registerCommand("lingua-agent", {
    description: "\u67E5\u770B AI Coding Agent \u81EA\u4E3B\u5B9A\u5236\u672C\u63D2\u4EF6\u7684\u65B9\u6CD5",
    handler: async (_args, ctx) => {
      ctx.ui.notify(
        "\u{1F4A1} \u60F3\u8981\u66F4\u6362\u8BED\u8A00\u6216\u98CE\u683C\uFF1F\u5BF9\u4F60\u7684 Agent \u8BF4\u4E00\u53E5\u8BDD\uFF08\u5982\u201C\u6211\u60F3\u5B9A\u5236\u8FD9\u4E2A\u4F34\u5B66\u63D2\u4EF6\u201D\uFF09\uFF0CAgent \u5C06\u81EA\u4E3B\u4E3A\u4F60\u5B8C\u6210\u8BCA\u65AD\u95EE\u5377\u4E0E\u91CD\u65B0\u6784\u5EFA\uFF01\u26A0\uFE0F \u6CE8\u610F\uFF1A\u5B8C\u6210\u540E\u8BF7\u91CD\u542F\u7EC8\u7AEF\u751F\u6548\u3002",
        "info"
      );
    }
  });
  pi.registerCommand("lingua-model", {
    description: "\u67E5\u770B\u6216\u5207\u6362\u4F34\u5B66\u6A21\u578B [\u4E8C \u21C4 two]: /lingua-model [model-id|auto]",
    handler: async (args, ctx) => {
      const trimmed = args.trim();
      const currentActive = state.selectedModel === "auto" ? ctx.model ? `auto (\u8DDF\u968F\u4F1A\u8BDD: ${ctx.model.provider}/${ctx.model.id})` : "auto" : state.selectedModel;
      if (!trimmed) {
        let msg = `[${state.labels.hudTitle}] \u5F53\u524D\u4F34\u5B66\u6A21\u578B: ${currentActive}
`;
        const available = ctx.modelRegistry?.getAvailable?.() || [];
        if (available.length > 0) {
          const list = available.map((m) => `\u2022 ${m.provider}/${m.id}`).slice(0, 8).join("\n");
          msg += `\u53EF\u7528\u6A21\u578B (\u8F93\u5165 /lingua-model <id> \u5207\u6362):
${list}
\u2022 auto (\u81EA\u52A8\u8DDF\u968F\u5F53\u524D\u4F1A\u8BDD\u4E3B\u6A21\u578B)`;
        } else {
          msg += "\u53EF\u8F93\u5165 /lingua-model <model-id> \u6216 auto \u6307\u5B9A\u4F34\u5B66\u6A21\u578B\u3002";
        }
        ctx.ui.notify(msg, "info");
        return;
      }
      state.selectedModel = trimmed;
      saveUserLinguaConfig({ selectedModel: trimmed });
      ctx.ui.notify(`[${state.labels.hudTitle}] \u4F34\u5B66\u6A21\u578B\u5DF2\u5207\u6362\u4E3A: ${trimmed}`, "info");
    }
  });
  const showStatusHandler = async (_args, ctx) => {
    const activeModel = state.selectedModel === "auto" ? ctx.model ? `auto (\u8DDF\u968F\u4F1A\u8BDD: ${ctx.model.provider}/${ctx.model.id})` : "auto (\u672A\u68C0\u6D4B\u5230\u4F1A\u8BDD\u6A21\u578B)" : state.selectedModel;
    const statusMsg = [
      `\u21C4 [${state.labels.hudTitle}] \u8FD0\u884C\u72B6\u6001\u62A5\u544A`,
      `\u2022 \u5F53\u524D\u6A21\u5F0F: [${state.mode}] (${state.mode === "original" ? "\u539F\u6587\u76F4\u901A \xB7 0ms\u975E\u963B\u585E" : state.mode === "english" ? "\u82F1\u6587\u6A21\u5F0F \xB7 \u6DF1\u5EA6\u4EE3\u7801\u63A8\u7406" : "\u5DF2\u5173\u95ED"})`,
      `\u2022 \u8BED\u8A00\u6D41\u5411: [${state.sourceLang} \u2794 \u76EE\u6807\u8BED]`,
      `\u2022 \u4F34\u5B66\u6A21\u578B: ${activeModel}`,
      `\u2022 HUD\u5E03\u5C40: Trifecta \u5F00\u653E\u5F0F\u5DE6\u5BFC\u8F68\u6811\u72B6\u67B6\u6784 (\xB7 \u250C \u251C \u2514)`,
      `\u2022 \u51ED\u636E\u6A21\u5F0F: Pi \u539F\u751F\u8FDB\u7A0B\u5185\u8BA4\u8BC1 (Zero Config \xB7 \u96F6Token\u6CC4\u9732)`,
      `\u2022 \u5FEB\u6377\u64CD\u4F5C: /2 (\u5207\u6362\u6A21\u5F0F) \xB7 /lingua-model (\u5207\u6A21\u578B) \xB7 /lingua-agent (\u5B9A\u5236\u8BED\u8A00)`
    ].join("\n");
    ctx.ui.notify(statusMsg, "info");
  };
  pi.registerCommand("lingua-status", {
    description: "\u67E5\u770B\u4F34\u5B66\u63D2\u4EF6\u5F53\u524D\u72B6\u6001\u62A5\u544A\u4E0E\u6A21\u578B\u8BCA\u65AD: /lingua-status",
    handler: showStatusHandler
  });
  pi.registerCommand("2-status", {
    description: "\u67E5\u770B\u4F34\u5B66\u63D2\u4EF6\u5F53\u524D\u72B6\u6001 (\u522B\u540D)",
    handler: showStatusHandler
  });
  const showLastHandler = async (_args, ctx) => {
    if (!lastResult) {
      ctx.ui.notify(`[${state.labels.hudTitle}] \u6682\u65E0\u4E0A\u4E00\u6761\u4F34\u5B66\u8BB0\u5F55`, "info");
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
    ctx.ui.notify(`[${state.labels.hudTitle}] \u5DF2\u91CD\u65B0\u663E\u793A\u4E0A\u4E00\u6761\u4F34\u5B66\u5361\u7247`, "info");
  };
  pi.registerCommand("lingua-last", {
    description: "\u91CD\u65B0\u56DE\u770B\u6216\u91CD\u73B0\u4E0A\u4E00\u6761\u4F34\u5B66\u5361\u7247: /lingua-last",
    handler: showLastHandler
  });
  pi.registerCommand("2-last", {
    description: "\u56DE\u770B\u4E0A\u4E00\u6761\u4F34\u5B66\u5361\u7247 (\u522B\u540D)",
    handler: showLastHandler
  });
  const createModelCompleter = (ctx) => {
    return async (text, systemPrompt) => {
      try {
        if (!ctx.modelRegistry) return null;
        let targetModel = ctx.model;
        if (state.selectedModel && state.selectedModel !== "auto") {
          const available = ctx.modelRegistry.getAvailable?.() || [];
          const match = available.find(
            (m) => m.id === state.selectedModel || `${m.provider}/${m.id}` === state.selectedModel || m.id.toLowerCase().includes(state.selectedModel.toLowerCase())
          );
          if (match) targetModel = match;
        }
        if (!targetModel) return null;
        const stream = ctx.modelRegistry.streamSimple(
          targetModel,
          {
            systemPrompt,
            messages: [
              {
                role: "user",
                content: [{ type: "text", text }],
                timestamp: Date.now()
              }
            ]
          },
          {
            reasoning: "off",
            maxTokens: 600
          }
        );
        const res = await stream.result();
        const content = res.content?.filter((c) => c.type === "text")?.map((c) => c.text)?.join("");
        return content && content.trim() ? content.trim() : null;
      } catch {
        return null;
      }
    };
  };
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
    const completer = createModelCompleter(ctx);
    if (state.mode === "original") {
      if (ctx.hasUI) {
        ctx.ui.setStatus("lingua", ctx.ui.theme.fg("accent", "\u21C4 [lingua] polishing..."));
      }
      translatePrompt(raw, {
        sourceLang: state.sourceLang,
        labels: state.labels,
        complete: completer
      }).then((result) => {
        if (requestId !== currentRequestId || state.mode !== "original") {
          return;
        }
        if (result) {
          lastResult = result;
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
        labels: state.labels,
        complete: completer
      });
      if (requestId !== currentRequestId) {
        return { action: "continue" };
      }
      if (!result) {
        if (ctx.hasUI) ctx.ui.setWidget("lingua_hud", void 0);
        return { action: "continue" };
      }
      lastResult = result;
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
