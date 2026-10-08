"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  DEFAULT_CONFIG: () => DEFAULT_CONFIG,
  LINGUA_SYSTEM_PROMPT: () => LINGUA_SYSTEM_PROMPT,
  MAX_TRANSLATION_CHARS: () => MAX_TRANSLATION_CHARS,
  MAX_TRANSLATION_LINES: () => MAX_TRANSLATION_LINES,
  formatTerminalAnnotation: () => formatTerminalAnnotation,
  formatTreeBranch: () => formatTreeBranch,
  getVisualWidth: () => getVisualWidth,
  isNonEnglish: () => isNonEnglish,
  loadUserConfig: () => loadUserConfig,
  parseLlmResponse: () => parseLlmResponse,
  shouldTriggerTranslation: () => shouldTriggerTranslation,
  stripLinguaAnnotation: () => stripLinguaAnnotation,
  translatePrompt: () => translatePrompt,
  wrapVisualText: () => wrapVisualText
});
module.exports = __toCommonJS(index_exports);

// src/engine.ts
var import_node_fs = __toESM(require("fs"), 1);
var import_node_path = __toESM(require("path"), 1);
var import_node_os = __toESM(require("os"), 1);
function loadUserConfig() {
  const configPaths = [
    import_node_path.default.join(import_node_os.default.homedir(), ".pi", "agent", "lingua.json"),
    import_node_path.default.join(import_node_os.default.homedir(), ".pi", "agent", "settings.json"),
    import_node_path.default.join(import_node_os.default.homedir(), ".pi", "agent", "translate.json")
  ];
  for (const p of configPaths) {
    try {
      if (import_node_fs.default.existsSync(p)) {
        const raw = import_node_fs.default.readFileSync(p, "utf8");
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
function stripLinguaAnnotation(annotatedText) {
  const lines = annotatedText.split("\n");
  const rawLines = [];
  let spoken;
  let written;
  let vocab;
  for (const line of lines) {
    const trimmed = line.trim();
    const sourceMatch = trimmed.match(/^·\s*(?:原文|source|original)\s+(.*)$/i);
    if (sourceMatch) {
      rawLines.push(sourceMatch[1].trim());
      continue;
    }
    const slotMatch = trimmed.match(/^(?:[┌├└│]\s*|↳\s*)\[([^\]]+)\]\s*(.*)$/);
    if (slotMatch) {
      const tag = slotMatch[1].trim();
      let text = slotMatch[2].trim();
      const parenIdx = text.lastIndexOf(" (");
      if (parenIdx !== -1 && text.endsWith(")")) {
        text = text.slice(0, parenIdx).trim();
      }
      if (/^(?:口语|spoken|口語|slack|slot1)$/i.test(tag)) {
        spoken = text;
      } else if (/^(?:写作|written|文面|rfc|slot2|敬語)$/i.test(tag)) {
        written = text;
      } else if (/^(?:重点|vocab|単語|词汇)$/i.test(tag)) {
        vocab = text;
      }
    } else {
      rawLines.push(line);
    }
  }
  return {
    raw: rawLines.join("\n").trim(),
    spoken,
    written,
    vocab
  };
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_CONFIG,
  LINGUA_SYSTEM_PROMPT,
  MAX_TRANSLATION_CHARS,
  MAX_TRANSLATION_LINES,
  formatTerminalAnnotation,
  formatTreeBranch,
  getVisualWidth,
  isNonEnglish,
  loadUserConfig,
  parseLlmResponse,
  shouldTriggerTranslation,
  stripLinguaAnnotation,
  translatePrompt,
  wrapVisualText
});
