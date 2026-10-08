import type { LinguaConfig, LinguaResult, TranslationPayload } from "./types.js";

export const DEFAULT_CONFIG: LinguaConfig = {
  endpoint: process.env.LINGUA_ENDPOINT || "http://127.0.0.1:8045/v1/chat/completions",
  apiKey: process.env.LINGUA_API_KEY || "sk-d9e62a39dd574907a04100acd9229a6c",
  model: process.env.LINGUA_MODEL || "gemini-3.8-flash",
  mode: "original",
  sourceLang: "ja",
  targetLang: "en",
  temperature: 0.2,
  timeoutMs: 30000,
};

/**
 * 現代エンジニア向けバイリンガル言語伴走プロンプト (日本語 A ➔ 英語 B)
 * 仕様：
 * 1. 自然な口語 (Silicon Valley Slack/Standup) + 厳格な技術文面 (RFC/PR) の二元レジスター
 * 2. 母国語 A (日本語) による正確な語感・ニュアンス解説 (Back-translation & Nuance)
 * 3. 典型的な開発コラボレーションに即した 3 組のゴールデン Few-Shot アンカー
 * 4. コード・識別子の絶対防御 (Code & Symbol Shield)
 * 5. 中級から IELTS Band 8.0+ / ネイティブ開発者レベルへ引き上げる適応型単語抽出
 */
export const LINGUA_SYSTEM_PROMPT = `You are an elite bilingual developer language coach and senior software architect.
Task:
Translate the user's message from native Japanese (language A) into TWO distinct authentic English registers (language B), and provide the exact back-translation/nuance in Japanese for each register:
1. "spoken": Natural, fluent spoken English (daily standup, Slack, pair programming, agile team collaboration, code reviews). Authentic Silicon Valley flow, contractions, native phrasal verbs, natural idioms.
2. "spoken_meaning": The exact colloquial nuance and meaning in Japanese.
3. "written": Clear, precise, modern technical written English (PR descriptions, RFCs, issues, architecture docs). High-level Plain English: active, concise, professional. STRICTLY AVOID archaic Victorian fluff (e.g. "we may now proceed", "precipitated", "parsimonious").
4. "written_meaning": The exact formal technical nuance and meaning in Japanese.
5. "vocab": Adaptively extract ALL key idiomatic collocations, phrasal verbs, technical idioms, or advanced expressions bridging an intermediate Japanese engineer to IELTS Band 8.0+ / native developer fluency. Do NOT artificially cap at 1-2; extract as many as genuinely beneficial, while keeping each definition concise in Japanese in parentheses separated by " · " (e.g. "term1 (日本語の意味) · term2 (日本語の意味) · ...") to ensure the terminal HUD remains vertically compact.

[CODE & SYMBOL SHIELD - STRICT RULE]:
All inline code (\`foo()\`), file paths (@file, path/to/file), SQL keywords, variable names, and technical identifiers MUST be preserved 100% verbatim in both spoken and written outputs. Never translate, rephrase, or drop code tokens.

[GOLDEN FEW-SHOT ANCHORS]:
Input: "賛成です、進めましょう"
Output:
{
  "spoken": "Totally on board with that — let's dive right in.",
  "spoken_meaning": "完全に賛成、早速取り掛かろう",
  "written": "Acknowledged. Let's proceed with the implementation.",
  "written_meaning": "了解しました。実装を進めましょう",
  "vocab": "on board with (賛成して/同調して) · dive in (直ちに取り掛かる)"
}

Input: "続けてください"
Output:
{
  "spoken": "Let's keep going.",
  "spoken_meaning": "このまま続けよう",
  "written": "Proceed with the next steps.",
  "written_meaning": "次のステップに進んでください",
  "vocab": "keep going (そのまま続ける) · proceed with (〜を進める)"
}

Input: "この設計は少々オーバーエンジニアリング気味なので、標準ライブラリでシンプルに実装したほうがいいです"
Output:
{
  "spoken": "This feels a bit over-engineered; we'd be much better off just sticking with the standard library.",
  "spoken_meaning": "ちょっと作り込みすぎな気がする。標準ライブラリのままにした方がずっといい",
  "written": "The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.",
  "written_meaning": "提案されたアプローチは不要な複雑さをもたらします。標準ライブラリの実装を活用することが推奨されます",
  "vocab": "over-engineered (過剰設計の) · be better off (〜する方が良い) · stick with (〜を使い続ける) · leverage (活用する)"
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

/**
 * Bidirectional language-aware trigger:
 * - If sourceLang is not English (e.g. "zh", "ja"): triggers on natural language scripts;
 * - If sourceLang is English ("en"): detects English natural language sentences while strictly excluding code and CLI commands.
 */
export function shouldTriggerTranslation(text: string, sourceLang = "ja"): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  // 1. If source language is non-English (default Chinese/Japanese etc.)
  if (sourceLang !== "en") {
    return isNonEnglish(trimmed);
  }

  // 2. If source language is English (e.g. English native learning Japanese):
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
  const slot1 = options.slot1Label || "口語";
  const slot2 = options.slot2Label || "文面";
  const vocabTag = options.vocabLabel || "単語";
  const sourceTag = options.sourceLabel || "原文";

  const spokenDisplay = options.spokenMeaning ? `${spoken} (${options.spokenMeaning})` : spoken;
  const writtenDisplay = written && options.writtenMeaning ? `${written} (${options.writtenMeaning})` : (written || "");

  const hasSlot2 = Boolean(writtenDisplay && writtenDisplay.trim());
  const hasVocab = Boolean(vocab && vocab.trim());

  const lines = [`  · ${sourceTag}   ${sourceText}`];
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

  const cfg = { ...DEFAULT_CONFIG, ...userConfig };

  // Language-aware bidirectional trigger check
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
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
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

    // Both fetch and response.json stream consumption are guarded by the timeout timer
    const json = (await response.json()) as any;
    const content = json?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      return null;
    }

    const payload = parseLlmResponse(content);
    if (!payload || !payload.spoken) return null;

    const slot1Label = cfg.labels?.slot1Label || cfg.labels?.spokenLabel || "口語";
    const slot2Label = cfg.labels?.slot2Label || cfg.labels?.writtenLabel || "文面";
    const vocabLabel = cfg.labels?.vocabLabel || "単語";
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
