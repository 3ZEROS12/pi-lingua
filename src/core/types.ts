import type { LingualI18nLabels } from "../types.js";

export type LingualMode = "original" | "english" | "off";
export type LinguaMode = LingualMode;

export type SlotRole = "source" | "translation" | "vocab" | "custom";

export interface SlotConfig {
  id: string;               // e.g. "source", "spoken", "written", "vocab", "hook", "deep", "keigo"
  label: string;            // e.g. "原文", "口语", "写作", "重点", "Original", "Spoken", "Hook"
  role: SlotRole;           // "source" | "translation" | "vocab" | "custom"
  instruction?: string;     // Specific LLM translation/style prompt
  showMeaning?: boolean;    // Whether to generate nuance back-translation in language A
  enabled: boolean;
}

export interface SlotResult {
  id: string;
  label: string;
  role: SlotRole;
  content: string;
  meaning?: string;
}

export interface SlotDefinition {
  label: string;       // e.g. "Spoken" | "Hook" | "口語" | "Paper"
  name: string;        // e.g. "Silicon Valley Spoken" | "Twitter Hook" | "Business Keigo"
  instruction: string; // Specific tone & style instruction for this register
}

export interface CustomSlotsConfig {
  slot1?: Partial<SlotDefinition>;
  slot2?: Partial<SlotDefinition>;
}

export interface LingualRequest {
  text: string;
  sourceLang?: string;                  // e.g. "zh" (default) | "ja" | "en" | "es" | "fr" | "de"
  targetLang?: string;                  // e.g. "en" (default) | "ja" | "zh"
  context?: string;                     // Optional: Context of the tweet being replied to, issue, or Slack thread
  tone?: "general" | "social" | "tech"; // default "general"
  isLongInput?: boolean;
  slots?: SlotConfig[] | CustomSlotsConfig; // Dynamic Multi-Slot Architecture
}

export interface LingualResponse {
  spoken: string;
  spokenMeaning?: string;
  written: string;
  writtenMeaning?: string;
  vocab?: string;
  summary?: string;
  slots?: SlotResult[];                 // Full dynamic slots result array
  cached: boolean;
  shieldBypassed: boolean;
}

export interface LingualConfig {
  endpoint: string;
  apiKey: string;
  model: string;
  selectedModel?: string;   // e.g. "auto" (default) | "gemini-3.8-flash" | "claude-sonnet-5-5"
  mode?: LingualMode;
  compact?: boolean;        // e.g. false (default) | true (1-line capsule)
  sourceLang?: string;      // e.g. "zh" (default) | "en" | "ja"
  targetLang?: string;      // e.g. "en" (default) | "ja" | "zh"
  labels?: Partial<LingualI18nLabels>;
  temperature?: number;
  timeoutMs?: number;
  complete?: (text: string, systemPrompt: string, signal?: AbortSignal) => Promise<string | null>;
  signal?: AbortSignal;
}
export type LinguaConfig = LingualConfig;

export interface LingualResult {
  spoken: string;           // Slot 1 target expression
  spokenMeaning?: string;   // Slot 1 exact nuance/meaning in native language A
  written: string;          // Slot 2 target expression
  writtenMeaning?: string;  // Slot 2 exact nuance/meaning in native language A
  vocab?: string;           // Vocab/idiom highlights
  sourceText: string;       // Original source text in language A (or distilled intent headline)
  summary?: string;         // Distilled core intent / question title in language A for long inputs
  annotated: string;
}
export type LinguaResult = LingualResult;

export interface TranslationPayload {
  spoken: string;
  spokenMeaning?: string;
  written?: string;
  writtenMeaning?: string;
  vocab?: string;
  summary?: string;
}
