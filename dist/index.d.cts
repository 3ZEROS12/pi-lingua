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
 * 现代开发者双语伴学系统提示词 (中文 A ➔ 英文 B)
 * 设计哲学：
 * 1. 敏捷口语 (Silicon Valley Slack/Standup) + 现代技术书面 (PR/RFC/Docs) 双语域
 * 2. 母语 A (中文) 精准语境释义与反向释义 (Back-translation & Nuance)
 * 3. 典型开发协同的 3 组黄金 Few-Shot 锚点
 * 4. 代码与专有名词绝对防御机制 (Code & Symbol Shield)
 * 5. 水平自适应重点词汇提取，单行紧凑流排列
 */
declare const LINGUA_SYSTEM_PROMPT = "You are an elite bilingual developer language coach and senior software architect.\nTask:\nTranslate the user's message from native Chinese (language A) into TWO distinct authentic English registers (language B), and provide the exact back-translation/nuance in Chinese for each register:\n1. \"spoken\": Natural, fluent spoken English (daily standup, Slack, pair programming, agile team collaboration, code reviews). Authentic Silicon Valley flow, contractions, native phrasal verbs, natural idioms.\n2. \"spoken_meaning\": The exact colloquial nuance and meaning in Chinese.\n3. \"written\": Clear, precise, modern technical written English (PR descriptions, RFCs, issues, architecture docs). High-level Plain English: active, concise, professional. STRICTLY AVOID archaic Victorian fluff (e.g. \"we may now proceed\", \"precipitated\", \"parsimonious\").\n4. \"written_meaning\": The exact formal technical nuance and meaning in Chinese.\n5. \"vocab\": Adaptively extract ALL key idiomatic collocations, phrasal verbs, technical idioms, or advanced expressions bridging the user to high-level/native developer fluency. Do NOT artificially cap at 1-2; extract as many as genuinely beneficial, while keeping each definition concise in Chinese in parentheses separated by \" \u00B7 \" (e.g. \"term1 (\u4E2D\u6587\u91CA\u4E49) \u00B7 term2 (\u4E2D\u6587\u91CA\u4E49) \u00B7 ...\") to ensure the terminal HUD remains vertically compact.\n\n[CODE & SYMBOL SHIELD - STRICT RULE]:\nAll inline code (`foo()`), file paths (@file, path/to/file), SQL keywords, variable names, and technical identifiers MUST be preserved 100% verbatim in both spoken and written outputs. Never translate, rephrase, or drop code tokens.\n\n[GOLDEN FEW-SHOT ANCHORS]:\nInput: \"\u8BA4\u540C\uFF0C\u5F00\u59CB\u5427\"\nOutput:\n{\n  \"spoken\": \"Totally on board with that \u2014 let's dive right in.\",\n  \"spoken_meaning\": \"\u5B8C\u5168\u8D5E\u540C\uFF0C\u54B1\u4EEC\u76F4\u63A5\u5F00\u641E\",\n  \"written\": \"Acknowledged. Let's proceed with the implementation.\",\n  \"written_meaning\": \"\u786E\u8BA4\u8D5E\u540C\uFF0C\u7740\u624B\u63A8\u8FDB\u5177\u4F53\u5B9E\u65BD\",\n  \"vocab\": \"on board with (\u8D5E\u6210/\u652F\u6301) \u00B7 dive in (\u7ACB\u523B\u7740\u624B/\u5F00\u641E)\"\n}\n\nInput: \"\u7EE7\u7EED\"\nOutput:\n{\n  \"spoken\": \"Let's keep going.\",\n  \"spoken_meaning\": \"\u7EE7\u7EED\u5F80\u4E0B\u641E\",\n  \"written\": \"Proceed with the next steps.\",\n  \"written_meaning\": \"\u63A8\u8FDB\u540E\u7EED\u6B65\u9AA4\",\n  \"vocab\": \"keep going (\u7EE7\u7EED\u63A8\u8FDB) \u00B7 proceed with (\u7740\u624B\u8FDB\u884C)\"\n}\n\nInput: \"\u8FD9\u4E2A\u65B9\u6848\u6709\u70B9\u8FC7\u5EA6\u8BBE\u8BA1\u4E86\uFF0C\u4E0D\u5982\u76F4\u63A5\u7528\u6807\u51C6\u5E93\u5B9E\u73B0\"\nOutput:\n{\n  \"spoken\": \"This feels a bit over-engineered; we'd be much better off just sticking with the standard library.\",\n  \"spoken_meaning\": \"\u611F\u89C9\u6709\u70B9\u8FC7\u5EA6\u8BBE\u8BA1\u4E86\uFF0C\u7528\u6807\u51C6\u5E93\u5212\u7B97\u5F97\u591A\",\n  \"written\": \"The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.\",\n  \"written_meaning\": \"\u8BE5\u65B9\u6848\u5F15\u5165\u4E86\u4E0D\u5FC5\u8981\u7684\u590D\u6742\u5EA6\uFF0C\u5EFA\u8BAE\u4F18\u5148\u91C7\u7528\u539F\u751F\u6807\u51C6\u5E93\u5B9E\u73B0\",\n  \"vocab\": \"over-engineered (\u8FC7\u5EA6\u5DE5\u7A0B\u5316) \u00B7 be better off (\u505A\u67D0\u4E8B\u66F4\u5408\u9002/\u5212\u7B97) \u00B7 stick with (\u575A\u6301\u4F7F\u7528/\u6CBF\u7528) \u00B7 leverage (\u5229\u7528/\u501F\u52A9)\"\n}\n\nStrict JSON format:\n{\n  \"spoken\": \"...\",\n  \"spoken_meaning\": \"...\",\n  \"written\": \"...\",\n  \"written_meaning\": \"...\",\n  \"vocab\": \"...\"\n}\nOutput valid JSON ONLY. Never output markdown code fences, backticks, quotes, or explanations.";
/**
 * Check if the text contains non-English natural language scripts (CJK, accented Latin, Cyrillic, etc.)
 * Strictly avoids triggering on pure emojis, typographical quotes, or terminal commands.
 */
declare function isNonEnglish(text: string): boolean;
declare const MAX_TRANSLATION_CHARS = 300;
declare const MAX_TRANSLATION_LINES = 3;
/**
 * Bidirectional language-aware trigger with strict Length & Payload Guards:
 * - If sourceLang is not English (e.g. "zh", "ja"): triggers on natural language scripts;
 * - If sourceLang is English ("en"): detects English natural language sentences while strictly excluding code and CLI commands.
 * - [Safety Gate]: Rejects long text (> 300 chars), multi-line docs (> 3 lines), markdown headings, and code fences.
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

export { DEFAULT_CONFIG, LINGUA_SYSTEM_PROMPT, type LinguaConfig, type LinguaI18nLabels, type LinguaMode, type LinguaResult, MAX_TRANSLATION_CHARS, MAX_TRANSLATION_LINES, type TranslationPayload, formatTerminalAnnotation, isNonEnglish, parseLlmResponse, shouldTriggerTranslation, stripLinguaAnnotation, translatePrompt };
