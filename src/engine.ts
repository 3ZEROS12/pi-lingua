import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { LinguaConfig, LinguaResult, TranslationPayload } from "./types.js";

/**
 * Load user configuration from:
 * 1. ~/.pi/agent/settings.json (under "pi-lingual" block)
 * 2. ~/.pi/agent/lingua.json (flat or nested)
 * 3. ~/.pi/agent/translate.json (compatibility fallback)
 * Never hardcodes private credentials in source code.
 */
export function loadUserConfig(): Partial<LinguaConfig> {
  const configPaths = [
    path.join(os.homedir(), ".pi", "agent", "lingua.json"),
    path.join(os.homedir(), ".pi", "agent", "settings.json"),
    path.join(os.homedir(), ".pi", "agent", "translate.json"),
  ];

  for (const p of configPaths) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf8");
        const parsed = JSON.parse(raw);
        // If settings.json, read the "pi-lingual" block
        const target = p.endsWith("settings.json") ? (parsed["pi-lingual"] || parsed["lingua"]) : parsed;
        if (!target) continue;

        const endpoint = target.endpoint || target.antigravity?.endpoint;
        const apiKey = target.apiKey || target.antigravity?.apiKey;
        const model = target.model || target.antigravity?.model;
        const selectedModel = target.selectedModel || target.model;
        return {
          ...(endpoint ? { endpoint } : {}),
          ...(apiKey ? { apiKey } : {}),
          ...(model ? { model } : {}),
          ...(selectedModel ? { selectedModel } : {}),
          ...(target.mode ? { mode: target.mode } : {}),
          ...(target.sourceLang ? { sourceLang: target.sourceLang } : {}),
          ...(target.targetLang ? { targetLang: target.targetLang } : {}),
        };
      }
    } catch {
      // Ignore read errors gracefully
    }
  }
  return {};
}

export const DEFAULT_CONFIG: LinguaConfig = {
  endpoint: process.env.LINGUA_ENDPOINT || "",
  apiKey: process.env.LINGUA_API_KEY || "",
  model: process.env.LINGUA_MODEL || "",
  selectedModel: "auto",
  mode: "original",
  sourceLang: "zh",
  targetLang: "en",
  temperature: 0.2,
  timeoutMs: 30000,
};

/**
 * 现代开发者双语伴学系统提示词 (中文 A ➔ 英文 B)
 * 设计哲学：
 * 1. 敏捷口语 (Silicon Valley Slack/Standup) + 现代技术书面 (PR/RFC/Docs) 双语域
 * 2. 母语 A (中文) 精准语境释义与反向释义 (Back-translation & Nuance)
 * 3. 典型开发协同的 3 组黄金 Few-Shot 锚点
 * 4. 代码与专有名词绝对防御机制 (Code & Symbol Shield)
 * 5. 水平自适应重点词汇提取，单行紧凑流排列
 */
export const LINGUA_SYSTEM_PROMPT = `You are an elite bilingual developer language coach and senior software architect.
Task:
Translate the user's message from native Chinese (language A) into TWO distinct authentic English registers (language B), and provide the exact back-translation/nuance in Chinese for each register:
1. "spoken": Natural, fluent spoken English (daily standup, Slack, pair programming, agile team collaboration, code reviews). Authentic Silicon Valley flow, contractions, native phrasal verbs, natural idioms.
2. "spoken_meaning": The exact colloquial nuance and meaning in Chinese.
3. "written": Clear, precise, modern technical written English (PR descriptions, RFCs, issues, architecture docs). High-level Plain English: active, concise, professional. STRICTLY AVOID archaic Victorian fluff (e.g. "we may now proceed", "precipitated", "parsimonious").
4. "written_meaning": The exact formal technical nuance and meaning in Chinese.
5. "vocab": Adaptively extract ALL key idiomatic collocations, phrasal verbs, technical idioms, or advanced expressions bridging the user to high-level/native developer fluency. Do NOT artificially cap at 1-2; extract as many as genuinely beneficial, while keeping each definition concise in Chinese in parentheses separated by " · " (e.g. "term1 (中文释义) · term2 (中文释义) · ...") to ensure the terminal HUD remains vertically compact.

[CODE & SYMBOL SHIELD - STRICT RULE]:
All inline code (\`foo()\`), file paths (@file, path/to/file), SQL keywords, variable names, and technical identifiers MUST be preserved 100% verbatim in both spoken and written outputs. Never translate, rephrase, or drop code tokens.

[GOLDEN FEW-SHOT ANCHORS]:
Input: "认同，开始吧"
Output:
{
  "spoken": "Totally on board with that — let's dive right in.",
  "spoken_meaning": "完全赞同，咱们直接开搞",
  "written": "Acknowledged. Let's proceed with the implementation.",
  "written_meaning": "确认赞同，着手推进具体实施",
  "vocab": "on board with (赞成/支持) · dive in (立刻着手/开搞)"
}

Input: "继续"
Output:
{
  "spoken": "Let's keep going.",
  "spoken_meaning": "继续往下搞",
  "written": "Proceed with the next steps.",
  "written_meaning": "推进后续步骤",
  "vocab": "keep going (继续推进) · proceed with (着手进行)"
}

Input: "这个方案有点过度设计了，不如直接用标准库实现"
Output:
{
  "spoken": "This feels a bit over-engineered; we'd be much better off just sticking with the standard library.",
  "spoken_meaning": "感觉有点过度设计了，用标准库划算得多",
  "written": "The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.",
  "written_meaning": "该方案引入了不必要的复杂度，建议优先采用原生标准库实现",
  "vocab": "over-engineered (过度工程化) · be better off (做某事更合适/划算) · stick with (坚持使用/沿用) · leverage (利用/借助)"
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

/**
 * Check if the text contains non-English natural language scripts (CJK, accented Latin, Cyrillic, etc.)
 * Strictly avoids triggering on pure emojis, typographical quotes, or terminal commands.
 */
export function isNonEnglish(text: string): boolean {
  const naturalLanguageScript = /[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af\u0400-\u04ff\u0600-\u06ff\u00c0-\u024f]/;
  return naturalLanguageScript.test(text);
}

const COMMON_TERMINAL_COMMAND_PREFIXES = [
  "git ", "npm ", "pnpm ", "yarn ", "bun ", "cd ", "docker ", "cargo ",
  "go ", "python ", "node ", "deno ", "curl ", "cat ", "ls ", "grep ", "find "
];

const CODE_STATEMENT_STARTERS = [
  "const ", "let ", "var ", "function ", "class ", "import ", "export ",
  "def ", "struct ", "impl ", "interface ", "type ", "return "
];

export const MAX_TRANSLATION_CHARS = 300;
export const MAX_TRANSLATION_LINES = 3;

/**
 * Bidirectional language-aware trigger with strict Length & Payload Guards:
 * - If sourceLang is not English (e.g. "zh", "ja"): triggers on natural language scripts;
 * - If sourceLang is English ("en"): detects English natural language sentences while strictly excluding code and CLI commands.
 * - [Safety Gate]: Rejects long text (> 300 chars), multi-line docs (> 3 lines), markdown headings, and code fences.
 */
export function shouldTriggerTranslation(text: string, sourceLang = "zh"): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  // 1. Long text and structured payload guard (protects tokens and terminal screen)
  if (trimmed.length > MAX_TRANSLATION_CHARS) {
    return false;
  }
  const lines = trimmed.split(/\r?\n/);
  if (lines.length > MAX_TRANSLATION_LINES) {
    return false;
  }
  // Fast bypass markdown headings, horizontal rules, and code blocks anywhere in input
  if (/^#{1,6}\s/.test(trimmed) || trimmed.includes("```") || trimmed.startsWith("---")) {
    return false;
  }

  // 2. If source language is non-English (default Chinese/Japanese etc.)
  if (sourceLang !== "en") {
    return isNonEnglish(trimmed);
  }

  // 3. If source language is English (e.g. English native learning Japanese):
  // Fast bypass terminal commands and code statements
  const lower = trimmed.toLowerCase();
  if (COMMON_TERMINAL_COMMAND_PREFIXES.some(prefix => lower.startsWith(prefix))) {
    return false;
  }
  if (CODE_STATEMENT_STARTERS.some(prefix => lower.startsWith(prefix))) {
    return false;
  }

  // Pure single words or symbols without spaces are treated as identifiers/commands
  const words = trimmed.split(/\s+/);
  if (words.length < 2) {
    return false;
  }

  // Must contain standard English alphabet words
  return /[a-zA-Z]{2,}/.test(trimmed);
}

/**
 * Clean and parse LLM JSON responses safely
 * Uses robust brace-boundary slicing to be immune to markdown fences, thoughts, or prefix chatter
 */
export function parseLlmResponse(raw: string): TranslationPayload | null {
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
        spokenMeaning: spokenMeaning || undefined,
        written: written || undefined,
        writtenMeaning: writtenMeaning || undefined,
        vocab: vocab || undefined,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Format terminal output with Trifecta Tree Branch aesthetics (┌ ├ └)
 * Displays the original input anchor, dual registers with native language nuance, and vocab highlights.
 */
export function formatTerminalAnnotation(
  sourceText: string,
  spoken: string,
  written?: string,
  vocab?: string,
  options: {
    spokenMeaning?: string;
    writtenMeaning?: string;
    slot1Label?: string;
    slot2Label?: string;
    vocabLabel?: string;
    sourceLabel?: string;
  } = {}
): string {
  const slot1 = options.slot1Label || "口语";
  const slot2 = options.slot2Label || "写作";
  const vocabTag = options.vocabLabel || "重点";
  const sourceTag = options.sourceLabel || "原文";

  const spokenDisplay = options.spokenMeaning ? `${spoken} (${options.spokenMeaning})` : spoken;
  const writtenDisplay = written && options.writtenMeaning ? `${written} (${options.writtenMeaning})` : (written || "");

  const hasSlot2 = Boolean(writtenDisplay && writtenDisplay.trim());
  const hasVocab = Boolean(vocab && vocab.trim());

  // 安全单行收敛与 Unicode/CJK 超长截断保护，避免多行排版爆炸和终端撕裂
  const cleanSource = sourceText.replace(/\r?\n+/g, " ").trim();
  const chars = Array.from(cleanSource);
  const displaySource = chars.length > 40 ? chars.slice(0, 37).join("") + "..." : cleanSource;

  const lines = [`  · ${sourceTag}   ${displaySource}`];
  if (hasSlot2 && hasVocab) {
    lines.push(
      `  ┌ [${slot1}] ${spokenDisplay}`,
      `  ├ [${slot2}] ${writtenDisplay}`,
      `  └ [${vocabTag}] ${vocab}`
    );
  } else if (hasSlot2) {
    lines.push(
      `  ┌ [${slot1}] ${spokenDisplay}`,
      `  └ [${slot2}] ${writtenDisplay}`
    );
  } else if (hasVocab) {
    lines.push(
      `  ┌ [${slot1}] ${spokenDisplay}`,
      `  └ [${vocabTag}] ${vocab}`
    );
  } else {
    lines.push(`  └ [${slot1}] ${spokenDisplay}`);
  }

  return lines.join("\n");
}

/**
 * Strip annotations and recover purely clean text to prevent LLM prompt pollution
 * Robust against tree branch glyphs (┌ ├ └) and arrow annotations (↳)
 */
export function stripLinguaAnnotation(annotatedText: string): {
  raw: string;
  spoken?: string;
  written?: string;
  vocab?: string;
} {
  const lines = annotatedText.split("\n");
  const rawLines: string[] = [];
  let spoken: string | undefined;
  let written: string | undefined;
  let vocab: string | undefined;

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for source line: · 原文 text
    const sourceMatch = trimmed.match(/^·\s*(?:原文|source|original)\s+(.*)$/i);
    if (sourceMatch) {
      rawLines.push(sourceMatch[1].trim());
      continue;
    }

    // Match tree branch or arrow lines: [prefix] [label] text
    const slotMatch = trimmed.match(/^(?:[┌├└│]\s*|↳\s*)\[([^\]]+)\]\s*(.*)$/);
    if (slotMatch) {
      const tag = slotMatch[1].trim();
      let text = slotMatch[2].trim();

      // If the text contains parenthetical nuance like "... (释义)", isolate the expression
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
    vocab,
  };
}

/**
 * Translate a user prompt into idiomatic English with dual registers, native nuance, and vocabulary highlights
 */
export async function translatePrompt(
  text: string,
  userConfig: Partial<LinguaConfig> = {}
): Promise<LinguaResult | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const diskConfig = loadUserConfig();
  const cfg = { ...DEFAULT_CONFIG, ...diskConfig, ...userConfig };

  // Language-aware bidirectional trigger check
  if (!shouldTriggerTranslation(trimmed, cfg.sourceLang)) {
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);

  try {
    let content: string | null = null;

    // 1. If custom complete callback is provided (e.g. Pi native ModelRegistry / ctx.model):
    if (typeof cfg.complete === "function") {
      content = await cfg.complete(trimmed, LINGUA_SYSTEM_PROMPT);
    } else if (cfg.endpoint) {
      // 2. Otherwise fall back to custom OpenAI-compatible endpoint (BYOK / self-hosted proxy)
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
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
            { role: "user", content: trimmed },
          ],
          temperature: cfg.temperature,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        return null;
      }

      const json = (await response.json()) as any;
      content = json?.choices?.[0]?.message?.content ?? null;
    } else {
      // Neither complete callback nor endpoint configured
      return null;
    }

    if (typeof content !== "string" || !content.trim()) {
      return null;
    }

    const payload = parseLlmResponse(content);
    if (!payload || !payload.spoken) return null;

    const slot1Label = cfg.labels?.slot1Label || cfg.labels?.spokenLabel || "口语";
    const slot2Label = cfg.labels?.slot2Label || cfg.labels?.writtenLabel || "写作";
    const vocabLabel = cfg.labels?.vocabLabel || "重点";
    const sourceLabel = cfg.labels?.sourceLabel || "原文";

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
          sourceLabel,
        }
      ),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
