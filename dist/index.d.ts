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
    subNuanceLabel?: string;
    notifyOriginal?: string;
    notifyEnglish?: string;
    notifyOff?: string;
    notifyPaging?: string;
    notifyNoHistory?: string;
    notifyHistoryRestored?: string;
    notifyAgentHelp?: string;
    notifyModelSwitched?: string;
    notifyLangSwitched?: string;
    notifyLangInvalid?: string;
    cmdDescMode?: string;
    cmdDescStatus?: string;
    cmdDescModel?: string;
    cmdDescLang?: string;
    cmdDescLast?: string;
    cmdDescAgent?: string;
    shortcutNextPage?: string;
    shortcutPrevPage?: string;
    statusReportTitle?: string;
    statusReportMode?: string;
    statusReportFlow?: string;
    statusReportModel?: string;
    statusReportCache?: string;
    statusReportLayout?: string;
    statusReportAuth?: string;
    statusReportShortcuts?: string;
    modeDescOriginal?: string;
    modeDescEnglish?: string;
    modeDescOff?: string;
    modelCurrentLabel?: string;
    modelFollowSession?: string;
    modelAvailableListHeader?: string;
    modelAutoFollowDesc?: string;
    modelSelectHint?: string;
    spokenLabel?: string;
    writtenLabel?: string;
}
interface LinguaConfig {
    endpoint: string;
    apiKey: string;
    model: string;
    selectedModel?: string;
    mode?: LinguaMode;
    sourceLang?: string;
    targetLang?: string;
    labels?: Partial<LinguaI18nLabels>;
    temperature?: number;
    timeoutMs?: number;
    complete?: (text: string, systemPrompt: string) => Promise<string | null>;
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

/**
 * 官方预设多语言映射矩阵 (Language Preset Matrix)
 * 当用户或 Agent 设定母语 A 时，所有 UI 标签、图腾与状态文本自动本地化，彻底根除跨语言残留。
 */
declare const LANGUAGE_PRESETS: Record<string, LinguaI18nLabels>;
/**
 * 根据母语语言代码解析对应的本地化标签，并允许用户自定义覆盖
 * 遵循 Lesson 7: 英文中枢保底链 (English Pivot Fallback)
 */
declare function resolveLabelsForLang(lang: string, overrides?: Partial<LinguaI18nLabels>): LinguaI18nLabels;
/**
 * 格式化完整的运行状态报告，严格遵循母语 A 统治权
 */
declare function formatStatusReport(labels: LinguaI18nLabels, info: {
    mode: string;
    sourceLang: string;
    targetLang?: string;
    activeModel: string;
    cacheStats?: {
        hits: number;
        misses: number;
        size: number;
        capacity: number;
    };
}): string;
/**
 * 格式化模型选择界面的提示文本，严格遵循母语 A 统治权
 */
declare function formatModelSelectionMessage(labels: LinguaI18nLabels, currentActive: string, availableList?: string): string;

/**
 * Splits text into atomic natural sentence chunks when long.
 * Preserves punctuation (。！？；\n and .!?\n).
 *
 * Line Budget Philosophy:
 * In an 80-column terminal, a 40-char Chinese sentence translates to:
 * - 1 line: Source text
 * - 2 lines: Spoken target language B
 * - 1 line: Spoken native language A sub-rail
 * - 2 lines: Written target language B
 * - 1 line: Written native language A sub-rail
 * - 1 line: Key vocab highlights
 * Total = 8 lines (strictly <= 9 lines, guaranteeing immunity against Pi's 10-line hard truncation cap!).
 */
declare function splitSemanticChunks(text: string, maxChunkChars?: number): string[];

/**
 * 动态根据母语 A (sourceLang) 与目标学习语言 B (targetLang) 生成严格遵循【母语最高统治权】的系统提示词
 * 彻底替换提示词中的硬编码中文，使任意 A 语言使用者均获得 100% 本地化的语感解释与词汇注解。
 */
declare function buildSystemPrompt(sourceLang?: string, targetLang?: string): string;

/**
 * Code & Shell Pass-through Shield (代码与纯命令行 0ms 旁路拦截器)
 *
 * 开发者在与 AI 对话时频繁输入终端命令或粘贴大段代码，这类输入无伴学翻译价值。
 * 在此做 0.1ms 级的快速特征嗅探，命中后直接跳过，零网络请求，零 Token 损耗。
 */
/**
 * 判定输入文本是否为纯代码块、Shell 指令或数据结构体，应当 0ms 旁路放行
 */
declare function shouldShieldBypass(text: string): boolean;

/**
 * In-Memory LRU Cache for Lingua Translations (会话级 0 依赖极速缓存)
 *
 * 开发者在与 AI 对话时存在大量高频短语（如“继续”、“可以”、“同意”、“开始吧”、“继续推进”）。
 * 基于 ES6 Map 实现轻量高效的 LRU 缓存（默认容量 50 条）。
 * 命中缓存后 0ms 瞬间直出，零外部调用，零 Token 损耗。
 */
interface CacheStats {
    hits: number;
    misses: number;
    size: number;
    capacity: number;
}
declare class LinguaLruCache<T> {
    readonly capacity: number;
    private cache;
    private hits;
    private misses;
    constructor(capacity?: number);
    /**
     * 生成标准化缓存键（结合源语言与目标语言）
     */
    static buildKey(text: string, sourceLang?: string, targetLang?: string): string;
    get(key: string): T | undefined;
    set(key: string, val: T): void;
    has(key: string): boolean;
    clear(): void;
    get size(): number;
    getStats(): CacheStats;
}

declare const globalLinguaCache: LinguaLruCache<LinguaResult>;

/**
 * Load user configuration from:
 * 1. ~/.pi/agent/settings.json (under "pi-lingual" block)
 * 2. ~/.pi/agent/lingua.json (flat or nested)
 * 3. ~/.pi/agent/translate.json (compatibility fallback)
 * Never hardcodes private credentials in source code.
 */
declare function loadUserConfig(): Partial<LinguaConfig>;
declare const DEFAULT_CONFIG: LinguaConfig;
/**
 * 现代开发者双语伴学系统提示词 (中文 A ➔ 英文 B，默认导出)
 * 设计哲学：
 * 1. 敏捷口语 (Silicon Valley Slack/Standup) + 现代技术书面 (PR/RFC/Docs) 双语域
 * 2. 母语 A 精准语境释义与反向释义 (Back-translation & Nuance)
 * 3. 典型开发协同的 3 组黄金 Few-Shot 锚点
 * 4. 代码与专有名词绝对防御机制 (Code & Symbol Shield)
 * 5. 水平自适应重点词汇提取，单行紧凑流排列
 */
declare const LINGUA_SYSTEM_PROMPT: string;

/**
 * Check if the text contains non-English natural language scripts (CJK, accented Latin, Cyrillic, etc.)
 * Strictly avoids triggering on pure emojis, typographical quotes, or terminal commands.
 */
declare function isNonEnglish(text: string): boolean;
declare const MAX_TRANSLATION_CHARS = 1500;
declare const MAX_TRANSLATION_LINES = 8;
/**
 * Bidirectional language-aware trigger with strict Length & Payload Guards:
 * - If sourceLang is not English (e.g. "zh", "ja"): triggers on natural language scripts;
 * - If sourceLang is English ("en"): detects English natural language sentences while strictly excluding code and CLI commands.
 * - [Safety Gate]: Rejects oversized payloads (> 1500 chars), monolithic multi-line code (> 8 lines), markdown headings, and code fences.
 */
declare function shouldTriggerTranslation(text: string, sourceLang?: string): boolean;
/**
 * Clean and parse LLM JSON responses safely
 * Uses robust brace-boundary slicing and thought stripping to be immune to markdown fences, thoughts, or prefix chatter
 */
declare function parseLlmResponse(raw: string): TranslationPayload | null;
/**
 * Truncate string based on visual cell width (CJK = 2 cols, ASCII = 1 col)
 * Guarantees that header text never exceeds visual column boundaries.
 */
declare function truncateVisual(str: string, maxVisualCols: number): string;
/**
 * Accurate visual cell width calculation:
 * - ANSI escape codes = 0 visual width
 * - CJK characters, Fullwidth forms, emojis = 2 visual width
 * - ASCII characters = 1 visual width
 */
declare function getVisualWidth(str: string): number;
/**
 * Robust ANSI-safe CJK & Latin visual text wrapper:
 * Breaks cleanly at word boundaries for Latin words, and character boundaries for CJK.
 */
declare function wrapVisualText(text: string, maxWidth: number): string[];
/**
 * Format a tree branch with hanging indent (树状悬挂缩进):
 * Line 0: `  ┌ [口语] <content>`
 * Line 1+: `  │        <continuation>` (strictly aligned under text body)
 */
/**
 * Format a tree branch with hanging indent (树状悬挂缩进):
 * Line 0: `  ┌ [口语] <content>`
 * Line 1+: `  │        <continuation>` (strictly aligned under text body)
 *
 * lineDecorator: function to style the content of each line independently (prevents ANSI reset desync / color breakage)
 */
declare function formatTreeBranch(branchChar: string, contChar: string, tag: string, content: string, prefixDecorator?: (p: string) => string, tagDecorator?: (t: string) => string, contDecorator?: (c: string) => string, lineDecorator?: ((l: string) => string) | number, maxCols?: number): string[];
/**
 * Format a sub-rail line under a branch (子导轨释义行):
 * Preserves the vertical continuation rail (`  │ `) so the tree is never broken!
 * Line 0: `  │      ↳ (<nuance in Language A>)`
 * Line 1+: `  │        <continuation>`
 */
declare function formatSubRail(contChar: string, nuanceText: string, arrow?: string, contDecorator?: (c: string) => string, lineDecorator?: (l: string) => string, maxCols?: number, indentCols?: number): string[];
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

export { type CacheStats, DEFAULT_CONFIG, LANGUAGE_PRESETS, LINGUA_SYSTEM_PROMPT, type LinguaConfig, type LinguaI18nLabels, LinguaLruCache, type LinguaMode, type LinguaResult, MAX_TRANSLATION_CHARS, MAX_TRANSLATION_LINES, type TranslationPayload, buildSystemPrompt, formatModelSelectionMessage, formatStatusReport, formatSubRail, formatTerminalAnnotation, formatTreeBranch, getVisualWidth, globalLinguaCache, isNonEnglish, loadUserConfig, parseLlmResponse, resolveLabelsForLang, shouldShieldBypass, shouldTriggerTranslation, splitSemanticChunks, stripLinguaAnnotation, translatePrompt, truncateVisual, wrapVisualText };
