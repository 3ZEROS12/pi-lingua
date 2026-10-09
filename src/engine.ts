import {
  getVisualWidth,
  truncateVisual,
  wrapVisualText,
  formatTreeBranch,
  formatSubRail,
  extractVocabPhrases,
  spotlightPhrases,
  formatTerminalAnnotation,
  formatCapsuleLine,
  renderCardLayout,
  CANNOT_START_LINE_CHARS,
  getEffectiveMaxCols,
} from "./layout.js";

export {
  getVisualWidth,
  truncateVisual,
  wrapVisualText,
  formatTreeBranch,
  formatSubRail,
  extractVocabPhrases,
  spotlightPhrases,
  formatTerminalAnnotation,
  formatCapsuleLine,
  renderCardLayout,
  CANNOT_START_LINE_CHARS,
  getEffectiveMaxCols,
};
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { LingualConfig, LingualResult, TranslationPayload } from "./types.js";
import { resolveLabelsForLang } from "./presets.js";
import { buildSystemPrompt } from "./prompts.js";
import { shouldShieldBypass } from "./shield.js";
import { LingualLruCache, globalLingualCache } from "./cache.js";

let cachedUserConfig: Partial<LingualConfig> | null = null;
let lastConfigCheckTime = 0;
const CONFIG_CACHE_TTL_MS = 2000;

export function invalidateUserConfigCache(): void {
  cachedUserConfig = null;
  lastConfigCheckTime = 0;
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

/**
 * Load user configuration from:
 * 1. ~/.pi/agent/settings.json (under "pi-lingual" block)
 * 2. ~/.pi/agent/lingual.json (flat or nested)
 * Uses high-efficiency 2-second in-memory memoization to prevent synchronous disk I/O thrashing during parallel chunk translations.
 * Never hardcodes private credentials in source code.
 */
export function loadUserLingualConfig(): Partial<LingualConfig> {
  // 测试沙箱隔离：自动化测试期间不读取宿主机个人配置，防止环境脏数据干扰断言
  if (isTestEnvironment()) {
    return {};
  }

  const now = Date.now();
  if (cachedUserConfig && now - lastConfigCheckTime < CONFIG_CACHE_TTL_MS) {
    return cachedUserConfig;
  }

  const configPaths = [
    path.join(os.homedir(), ".pi", "agent", "settings.json"),
    path.join(os.homedir(), ".pi", "agent", "lingual.json"),
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
        const sourceLang = target.sourceLang;
        const targetLang = target.targetLang;
        const compact = target.compact;
        const labels = resolveLabelsForLang(sourceLang || "zh", target.labels);

        cachedUserConfig = {
          ...(endpoint ? { endpoint } : {}),
          ...(apiKey ? { apiKey } : {}),
          ...(model ? { model } : {}),
          ...(selectedModel ? { selectedModel } : {}),
          ...(target.mode ? { mode: target.mode } : {}),
          ...(compact !== undefined ? { compact: Boolean(compact) } : {}),
          ...(sourceLang ? { sourceLang } : {}),
          ...(targetLang ? { targetLang } : {}),
          labels,
        };
        lastConfigCheckTime = now;
        return cachedUserConfig;
      }
    } catch {
      // Ignore read errors gracefully
    }
  }
  cachedUserConfig = {};
  lastConfigCheckTime = now;
  return {};
}

export const DEFAULT_CONFIG: LingualConfig = {
  endpoint: process.env.LINGUAL_ENDPOINT || "",
  apiKey: process.env.LINGUAL_API_KEY || "",
  model: process.env.LINGUAL_MODEL || "",
  selectedModel: "auto",
  mode: "original",
  sourceLang: "zh",
  targetLang: "en",
  temperature: 0.2,
  timeoutMs: 30000,
};

/**
 * 现代开发者双语伴学系统提示词 (中文 A ➔ 英文 B，默认导出)
 * 设计哲学：
 * 1. 敏捷口语 (Silicon Valley Slack/Standup) + 现代技术书面 (PR/RFC/Docs) 双语域
 * 2. 母语 A 精准语境释义与反向释义 (Back-translation & Nuance)
 * 3. 典型开发协同的 3 组黄金 Few-Shot 锚点
 * 4. 代码与专有名词绝对防御机制 (Code & Symbol Shield)
 * 5. 水平自适应重点词汇提取，单行紧凑流排列
 */
export const LINGUAL_SYSTEM_PROMPT = buildSystemPrompt("zh", "en");
export { buildSystemPrompt };

/**
 * Check if the text contains non-English natural language scripts (CJK, accented Latin, Cyrillic, etc.)
 * Strictly avoids triggering on pure emojis, typographical quotes, or terminal commands.
 */
export function isNonEnglish(text: string): boolean {
  const naturalLanguageScript = /[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af\u0400-\u04ff\u0600-\u06ff\u00c0-\u024f]/;
  return naturalLanguageScript.test(text);
}

export const MAX_TRANSLATION_CHARS = 2500;
export const MAX_TRANSLATION_LINES = 30;

/**
 * Bidirectional language-aware trigger with strict Length & Payload Guards:
 * - If sourceLang is not English (e.g. "zh", "ja"): triggers on natural language scripts;
 * - If sourceLang is English ("en"): detects English natural language sentences while strictly excluding code and CLI commands;
 * - Centrally delegates to shouldShieldBypass (Single Source of Truth) to exclude code statements, SQL, and 40+ CLI commands;
 * - [Safety Gate]: Rejects oversized payloads (> 1500 chars), monolithic multi-line code (> 8 lines), markdown headings, and code fences.
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
  // Fast bypass markdown headings and horizontal rules
  if (/^#{1,6}\s/.test(trimmed) || trimmed.startsWith("---")) {
    return false;
  }

  // 2. Code & Shell Shield: 0ms bypass for pure commands, code fences, and data structures
  if (shouldShieldBypass(trimmed)) {
    return false;
  }

  // 3. If source language is non-English (default Chinese/Japanese etc.)
  if (sourceLang !== "en") {
    return isNonEnglish(trimmed);
  }

  // 4. If source language is English (e.g. English native learning Japanese):
  // Pure single words or symbols without spaces are treated as identifiers/commands
  const words = trimmed.split(/\s+/);
  if (words.length < 2) {
    return false;
  }

  // Must contain standard English alphabet words
  return /[a-zA-Z]{2,}/.test(trimmed);
}

/**
 * 极简微型 JSON 修复器 (Featherweight JSON Repair):
 * 当 LLM 吐出未转义的双引号或尾随逗号时，安全修补，杜绝静默失败
 */
function tryParseJson(str: string): any {
  try {
    return JSON.parse(str);
  } catch {
    try {
      const repaired = str
        .replace(/,\s*([}\]])/g, "$1")
        .replace(
          /("(?:spoken|spoken_meaning|written|written_meaning|vocab|casual|academic|slot1|slot2)"\s*:\s*")([\s\S]*?)("(?=\s*,\s*"|\s*\}))/g,
          (_m, prefix, content, suffix) => prefix + content.replace(/(?<!\\)"/g, '\\"') + suffix
        );
      return JSON.parse(repaired);
    } catch {
      return null;
    }
  }
}

/**
 * Clean and parse LLM JSON responses safely
 * Uses robust brace-boundary slicing and thought stripping to be immune to markdown fences, thoughts, or prefix chatter
 */
export function parseLlmResponse(raw: string): TranslationPayload | null {
  try {
    let cleaned = raw.replace(/<(?:think|thought)>[\s\S]*?<\/(?:think|thought)>/gi, "").trim();
    const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (fenceMatch) {
      cleaned = fenceMatch[1].trim();
    }

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null;
    }

    const jsonSubstr = cleaned.slice(firstBrace, lastBrace + 1);
    const parsed = tryParseJson(jsonSubstr);
    if (!parsed) return null;

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
 * Strip annotations and recover purely clean text to prevent LLM prompt pollution
 * Robust against tree branch glyphs (┌ ├ └) and arrow annotations (↳)
 */
export function stripLingualAnnotation(annotatedText: string): {
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

    // Check for source line: · 原文 text or · [原文] text
    const sourceMatch = trimmed.match(/^·\s*\[?(?:原文|source|original|quelle)\]?\s+(.*)$/i);
    if (sourceMatch) {
      rawLines.push(sourceMatch[1].trim());
      continue;
    }

    // Ignore sub-rail nuance lines (↳ ...) so raw text remains completely unpolluted
    if (/^(?:[│\s]*↳\s*\(.*\)|↳\s*\(.*\))/.test(trimmed)) {
      continue;
    }

    // Match tree branch or arrow lines: [prefix] [label] text
    const slotMatch = trimmed.match(/^(?:[┌├└│]\s*|↳\s*)\[([^\]]+)\]\s*(.*)$/);
    if (slotMatch) {
      const tag = slotMatch[1].trim();
      let text = slotMatch[2].trim().replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");

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
  userConfig: Partial<LingualConfig> = {}
): Promise<LingualResult | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const diskConfig = loadUserLingualConfig();
  const cfg = { ...DEFAULT_CONFIG, ...diskConfig, ...userConfig };

  // Language-aware bidirectional trigger check
  if (!shouldTriggerTranslation(trimmed, cfg.sourceLang)) {
    return null;
  }

  // Code & Shell Pass-through Shield: 0ms bypass for pure commands, code fences, and data structures
  if (shouldShieldBypass(trimmed)) {
    return null;
  }

  // In-Memory LRU Cache: 0ms hit for high-frequency phrases (e.g. "继续", "认同", "开始吧")
  const cacheKey = LingualLruCache.buildKey(trimmed, cfg.sourceLang, cfg.targetLang);
  const cached = globalLingualCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);

  if (cfg.signal) {
    if (cfg.signal.aborted) {
      clearTimeout(timer);
      return null;
    }
    cfg.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    let content: string | null = null;
    const isLongInput = trimmed.length > 90;
    const sysPrompt = buildSystemPrompt(cfg.sourceLang, cfg.targetLang, isLongInput);

    // 1. If custom complete callback is provided (e.g. Pi native ModelRegistry / ctx.model):
    if (typeof cfg.complete === "function") {
      content = await cfg.complete(trimmed, sysPrompt, controller.signal);
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
            { role: "system", content: sysPrompt },
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

    const labels = resolveLabelsForLang(cfg.sourceLang || "zh", cfg.labels);
    const slot1Label = labels.slot1Label || labels.spokenLabel || "口语";
    const slot2Label = labels.slot2Label || labels.writtenLabel || "写作";
    const vocabLabel = labels.vocabLabel || "重点";
    const sourceLabel = labels.sourceLabel || "原文";

    const result: LingualResult = {
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

    // Store in LRU cache
    globalLingualCache.set(cacheKey, result);
    return result;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export const LINGUA_SYSTEM_PROMPT = LINGUAL_SYSTEM_PROMPT;
export const stripLinguaAnnotation = stripLingualAnnotation;
export const loadUserConfig = loadUserLingualConfig;
