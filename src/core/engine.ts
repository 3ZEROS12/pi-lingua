import type { LingualRequest, LingualResponse, TranslationPayload } from "./types.js";
import { shouldShieldBypass } from "../shield.js";
import { LingualLruCache, globalLingualCache } from "../cache.js";
import { buildSystemPrompt } from "./prompts.js";

/**
 * Featherweight JSON repair for LLM responses with unescaped quotes or trailing commas
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
 * Robust against markdown fences, reasoning thoughts (<think>...</think>), and conversational chatter
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
    const summary = typeof (parsed.summary || parsed.core_intent || parsed.coreIntent) === "string"
      ? (parsed.summary || parsed.core_intent || parsed.coreIntent).trim()
      : "";

    if (spoken) {
      return {
        spoken,
        spokenMeaning: spokenMeaning || undefined,
        written: written || undefined,
        writtenMeaning: writtenMeaning || undefined,
        vocab: vocab || undefined,
        summary: summary || undefined,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export interface LingualCoreOptions {
  completer?: (prompt: string, systemPrompt: string, signal?: AbortSignal) => Promise<string | null>;
  cache?: LingualLruCache<TranslationPayload>;
  signal?: AbortSignal;
}

/**
 * Pure translation engine orchestrator for lingual-core
 * Completely decoupled from Pi host session or file system I/O.
 */
export async function translateCore(
  req: LingualRequest,
  options?: LingualCoreOptions
): Promise<LingualResponse> {
  const text = (req.text || "").trim();
  const sourceLang = req.sourceLang || "zh";
  const targetLang = req.targetLang || "en";

  if (!text) {
    return {
      spoken: "",
      written: "",
      cached: false,
      shieldBypassed: false,
    };
  }

  // 1. Code & Shell Shield: 0ms bypass for pure commands, code blocks, and data structures
  if (shouldShieldBypass(text)) {
    return {
      spoken: text,
      written: text,
      cached: false,
      shieldBypassed: true,
    };
  }

  // 2. In-memory LRU Cache check
  const cache = options?.cache || globalLingualCache;
  const cacheKey = LingualLruCache.buildKey(text, sourceLang, targetLang);
  const cached = cache.get(cacheKey);
  if (cached) {
    return {
      spoken: cached.spoken,
      spokenMeaning: cached.spokenMeaning,
      written: cached.written || cached.spoken,
      writtenMeaning: cached.writtenMeaning,
      vocab: cached.vocab,
      summary: cached.summary,
      cached: true,
      shieldBypassed: false,
    };
  }

  // 3. If no completer supplied, return fallback response
  if (!options?.completer) {
    return {
      spoken: text,
      written: text,
      cached: false,
      shieldBypassed: false,
    };
  }

  // 4. Build system prompt with context and tone adaptations
  const systemPrompt = buildSystemPrompt(
    sourceLang,
    targetLang,
    Boolean(req.isLongInput),
    req.context,
    req.tone || "general"
  );

  // 5. Invoke LLM completion
  const raw = await options.completer(text, systemPrompt, options.signal);
  if (!raw) {
    return {
      spoken: text,
      written: text,
      cached: false,
      shieldBypassed: false,
    };
  }

  // 6. Safe JSON parsing & cache storage
  const parsed = parseLlmResponse(raw);
  if (parsed) {
    cache.set(cacheKey, parsed);
    return {
      spoken: parsed.spoken,
      spokenMeaning: parsed.spokenMeaning,
      written: parsed.written || parsed.spoken,
      writtenMeaning: parsed.writtenMeaning,
      vocab: parsed.vocab,
      summary: parsed.summary,
      cached: false,
      shieldBypassed: false,
    };
  }

  return {
    spoken: text,
    written: text,
    cached: false,
    shieldBypassed: false,
  };
}
