type LinguaMode = "original" | "english" | "off";
interface LinguaI18nLabels {
    slot1Label: string;
    slot2Label: string;
    vocabLabel: string;
    sourceLabel: string;
    hudTitle: string;
    statusOriginal: string;
    statusEnglish: string;
    statusOff: string;
    spokenLabel?: string;
    writtenLabel?: string;
}
interface LinguaConfig {
    endpoint: string;
    apiKey: string;
    model: string;
    mode?: LinguaMode;
    sourceLang?: string;
    targetLang?: string;
    labels?: Partial<LinguaI18nLabels>;
    temperature?: number;
    timeoutMs?: number;
}
interface LinguaResult {
    spoken: string;
    spokenMeaning?: string;
    written: string;
    writtenMeaning?: string;
    vocab?: string;
    sourceText: string;
    annotated: string;
}
interface TranslationPayload {
    spoken: string;
    spokenMeaning?: string;
    written?: string;
    writtenMeaning?: string;
    vocab?: string;
}

declare const DEFAULT_CONFIG: LinguaConfig;
/**
 * 現代エンジニア向けバイリンガル言語伴走プロンプト (日本語 A ➔ 英語 B)
 * 仕様：
 * 1. 自然な口語 (Silicon Valley Slack/Standup) + 厳格な技術文面 (RFC/PR) の二元レジスター
 * 2. 母国語 A (日本語) による正確な語感・ニュアンス解説 (Back-translation & Nuance)
 * 3. 典型的な開発コラボレーションに即した 3 組のゴールデン Few-Shot アンカー
 * 4. コード・識別子の絶対防御 (Code & Symbol Shield)
 * 5. 中級から IELTS Band 8.0+ / ネイティブ開発者レベルへ引き上げる適応型単語抽出
 */
declare const LINGUA_SYSTEM_PROMPT = "You are an elite bilingual developer language coach and senior software architect.\nTask:\nTranslate the user's message from native Japanese (language A) into TWO distinct authentic English registers (language B), and provide the exact back-translation/nuance in Japanese for each register:\n1. \"spoken\": Natural, fluent spoken English (daily standup, Slack, pair programming, agile team collaboration, code reviews). Authentic Silicon Valley flow, contractions, native phrasal verbs, natural idioms.\n2. \"spoken_meaning\": The exact colloquial nuance and meaning in Japanese.\n3. \"written\": Clear, precise, modern technical written English (PR descriptions, RFCs, issues, architecture docs). High-level Plain English: active, concise, professional. STRICTLY AVOID archaic Victorian fluff (e.g. \"we may now proceed\", \"precipitated\", \"parsimonious\").\n4. \"written_meaning\": The exact formal technical nuance and meaning in Japanese.\n5. \"vocab\": Adaptively extract ALL key idiomatic collocations, phrasal verbs, technical idioms, or advanced expressions bridging an intermediate Japanese engineer to IELTS Band 8.0+ / native developer fluency. Do NOT artificially cap at 1-2; extract as many as genuinely beneficial, while keeping each definition concise in Japanese in parentheses separated by \" \u00B7 \" (e.g. \"term1 (\u65E5\u672C\u8A9E\u306E\u610F\u5473) \u00B7 term2 (\u65E5\u672C\u8A9E\u306E\u610F\u5473) \u00B7 ...\") to ensure the terminal HUD remains vertically compact.\n\n[CODE & SYMBOL SHIELD - STRICT RULE]:\nAll inline code (`foo()`), file paths (@file, path/to/file), SQL keywords, variable names, and technical identifiers MUST be preserved 100% verbatim in both spoken and written outputs. Never translate, rephrase, or drop code tokens.\n\n[GOLDEN FEW-SHOT ANCHORS]:\nInput: \"\u8CDB\u6210\u3067\u3059\u3001\u9032\u3081\u307E\u3057\u3087\u3046\"\nOutput:\n{\n  \"spoken\": \"Totally on board with that \u2014 let's dive right in.\",\n  \"spoken_meaning\": \"\u5B8C\u5168\u306B\u8CDB\u6210\u3001\u65E9\u901F\u53D6\u308A\u639B\u304B\u308D\u3046\",\n  \"written\": \"Acknowledged. Let's proceed with the implementation.\",\n  \"written_meaning\": \"\u4E86\u89E3\u3057\u307E\u3057\u305F\u3002\u5B9F\u88C5\u3092\u9032\u3081\u307E\u3057\u3087\u3046\",\n  \"vocab\": \"on board with (\u8CDB\u6210\u3057\u3066/\u540C\u8ABF\u3057\u3066) \u00B7 dive in (\u76F4\u3061\u306B\u53D6\u308A\u639B\u304B\u308B)\"\n}\n\nInput: \"\u7D9A\u3051\u3066\u304F\u3060\u3055\u3044\"\nOutput:\n{\n  \"spoken\": \"Let's keep going.\",\n  \"spoken_meaning\": \"\u3053\u306E\u307E\u307E\u7D9A\u3051\u3088\u3046\",\n  \"written\": \"Proceed with the next steps.\",\n  \"written_meaning\": \"\u6B21\u306E\u30B9\u30C6\u30C3\u30D7\u306B\u9032\u3093\u3067\u304F\u3060\u3055\u3044\",\n  \"vocab\": \"keep going (\u305D\u306E\u307E\u307E\u7D9A\u3051\u308B) \u00B7 proceed with (\u301C\u3092\u9032\u3081\u308B)\"\n}\n\nInput: \"\u3053\u306E\u8A2D\u8A08\u306F\u5C11\u3005\u30AA\u30FC\u30D0\u30FC\u30A8\u30F3\u30B8\u30CB\u30A2\u30EA\u30F3\u30B0\u6C17\u5473\u306A\u306E\u3067\u3001\u6A19\u6E96\u30E9\u30A4\u30D6\u30E9\u30EA\u3067\u30B7\u30F3\u30D7\u30EB\u306B\u5B9F\u88C5\u3057\u305F\u307B\u3046\u304C\u3044\u3044\u3067\u3059\"\nOutput:\n{\n  \"spoken\": \"This feels a bit over-engineered; we'd be much better off just sticking with the standard library.\",\n  \"spoken_meaning\": \"\u3061\u3087\u3063\u3068\u4F5C\u308A\u8FBC\u307F\u3059\u304E\u306A\u6C17\u304C\u3059\u308B\u3002\u6A19\u6E96\u30E9\u30A4\u30D6\u30E9\u30EA\u306E\u307E\u307E\u306B\u3057\u305F\u65B9\u304C\u305A\u3063\u3068\u3044\u3044\",\n  \"written\": \"The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.\",\n  \"written_meaning\": \"\u63D0\u6848\u3055\u308C\u305F\u30A2\u30D7\u30ED\u30FC\u30C1\u306F\u4E0D\u8981\u306A\u8907\u96D1\u3055\u3092\u3082\u305F\u3089\u3057\u307E\u3059\u3002\u6A19\u6E96\u30E9\u30A4\u30D6\u30E9\u30EA\u306E\u5B9F\u88C5\u3092\u6D3B\u7528\u3059\u308B\u3053\u3068\u304C\u63A8\u5968\u3055\u308C\u307E\u3059\",\n  \"vocab\": \"over-engineered (\u904E\u5270\u8A2D\u8A08\u306E) \u00B7 be better off (\u301C\u3059\u308B\u65B9\u304C\u826F\u3044) \u00B7 stick with (\u301C\u3092\u4F7F\u3044\u7D9A\u3051\u308B) \u00B7 leverage (\u6D3B\u7528\u3059\u308B)\"\n}\n\nStrict JSON format:\n{\n  \"spoken\": \"...\",\n  \"spoken_meaning\": \"...\",\n  \"written\": \"...\",\n  \"written_meaning\": \"...\",\n  \"vocab\": \"...\"\n}\nOutput valid JSON ONLY. Never output markdown code fences, backticks, quotes, or explanations.";
/**
 * Check if the text contains non-English natural language scripts (CJK, accented Latin, Cyrillic, etc.)
 * Strictly avoids triggering on pure emojis, typographical quotes, or terminal commands.
 */
declare function isNonEnglish(text: string): boolean;
/**
 * Bidirectional language-aware trigger:
 * - If sourceLang is not English (e.g. "zh", "ja"): triggers on natural language scripts;
 * - If sourceLang is English ("en"): detects English natural language sentences while strictly excluding code and CLI commands.
 */
declare function shouldTriggerTranslation(text: string, sourceLang?: string): boolean;
/**
 * Clean and parse LLM JSON responses safely
 * Uses robust brace-boundary slicing to be immune to markdown fences, thoughts, or prefix chatter
 */
declare function parseLlmResponse(raw: string): TranslationPayload | null;
/**
 * Format terminal output with Trifecta Tree Branch aesthetics (┌ ├ └)
 * Displays the original input anchor, dual registers with native language nuance, and vocab highlights.
 */
declare function formatTerminalAnnotation(sourceText: string, spoken: string, written?: string, vocab?: string, options?: {
    spokenMeaning?: string;
    writtenMeaning?: string;
    slot1Label?: string;
    slot2Label?: string;
    vocabLabel?: string;
    sourceLabel?: string;
}): string;
/**
 * Strip annotations and recover purely clean text to prevent LLM prompt pollution
 * Robust against tree branch glyphs (┌ ├ └) and arrow annotations (↳)
 */
declare function stripLinguaAnnotation(annotatedText: string): {
    raw: string;
    spoken?: string;
    written?: string;
    vocab?: string;
};
/**
 * Translate a user prompt into idiomatic English with dual registers, native nuance, and vocabulary highlights
 */
declare function translatePrompt(text: string, userConfig?: Partial<LinguaConfig>): Promise<LinguaResult | null>;

export { DEFAULT_CONFIG, LINGUA_SYSTEM_PROMPT, type LinguaConfig, type LinguaI18nLabels, type LinguaMode, type LinguaResult, type TranslationPayload, formatTerminalAnnotation, isNonEnglish, parseLlmResponse, shouldTriggerTranslation, stripLinguaAnnotation, translatePrompt };
