export type LinguaMode = "original" | "english" | "off";

export interface LinguaI18nLabels {
  slot1Label: string;      // e.g. "口语" | "Spoken" | "口語" | "Slack"
  slot2Label: string;      // e.g. "写作" | "Written" | "文面" | "RFC"
  vocabLabel: string;      // e.g. "重点" | "Vocab" | "単語"
  sourceLabel: string;     // e.g. "原文" | "Original"
  hudTitle: string;        // e.g. "二 ⇄ two" | "two ⇄ 二"
  statusOriginal: string;  // e.g. "⇄ [二 ⇄ two] 原文"
  statusEnglish: string;   // e.g. "⇄ [二 ⇄ two] 英文"
  statusOff: string;       // e.g. "⇄ [二 ⇄ two]: 关"

  // Aliases for backwards compatibility
  spokenLabel?: string;
  writtenLabel?: string;
}

export interface LinguaConfig {
  endpoint: string;
  apiKey: string;
  model: string;
  selectedModel?: string;   // e.g. "auto" (default) | "gemini-3.8-flash" | "claude-sonnet-5-5"
  mode?: LinguaMode;
  sourceLang?: string;      // e.g. "zh" (default) | "en" | "ja"
  targetLang?: string;      // e.g. "en" (default) | "ja" | "zh"
  labels?: Partial<LinguaI18nLabels>;
  temperature?: number;
  timeoutMs?: number;
  complete?: (text: string, systemPrompt: string) => Promise<string | null>;
}

export interface LinguaResult {
  spoken: string;           // Slot 1 target expression
  spokenMeaning?: string;   // Slot 1 exact nuance/meaning in native language A
  written: string;          // Slot 2 target expression
  writtenMeaning?: string;  // Slot 2 exact nuance/meaning in native language A
  vocab?: string;           // Vocab/idiom highlights
  sourceText: string;       // Original source text in language A
  annotated: string;
}

export interface TranslationPayload {
  spoken: string;
  spokenMeaning?: string;
  written?: string;
  writtenMeaning?: string;
  vocab?: string;
}
