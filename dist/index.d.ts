type LingualMode = "original" | "english" | "off";
type LinguaMode = LingualMode;
interface LingualI18nLabels {
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
    notifyCompactOn?: string;
    notifyCompactOff?: string;
    cmdDescMode?: string;
    cmdDescStatus?: string;
    cmdDescModel?: string;
    cmdDescLang?: string;
    cmdDescCompact?: string;
    cmdDescLast?: string;
    cmdDescAgent?: string;
    shortcutNextPage?: string;
    shortcutPrevPage?: string;
    capsuleSlot1Prefix?: string;
    capsuleSlot2Prefix?: string;
    layoutCapsule?: string;
    layoutTree?: string;
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
type LinguaI18nLabels = LingualI18nLabels;
interface LingualConfig {
    endpoint: string;
    apiKey: string;
    model: string;
    selectedModel?: string;
    mode?: LingualMode;
    compact?: boolean;
    sourceLang?: string;
    targetLang?: string;
    labels?: Partial<LingualI18nLabels>;
    temperature?: number;
    timeoutMs?: number;
    complete?: (text: string, systemPrompt: string) => Promise<string | null>;
}
type LinguaConfig = LingualConfig;
interface LingualResult {
    spoken: string;
    spokenMeaning?: string;
    written: string;
    writtenMeaning?: string;
    vocab?: string;
    sourceText: string;
    annotated: string;
}
type LinguaResult = LingualResult;
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
declare const LANGUAGE_PRESETS: Record<string, LingualI18nLabels>;
/**
 * 根据母语语言代码解析对应的本地化标签，并允许用户自定义覆盖
 * 遵循 Lesson 7: 英文中枢保底链 (English Pivot Fallback)
 */
declare function resolveLabelsForLang(lang: string, overrides?: Partial<LingualI18nLabels>): LingualI18nLabels;
/**
 * 格式化完整的运行状态报告，严格遵循母语 A 统治权
 */
declare function formatStatusReport(labels: LingualI18nLabels, info: {
    mode: string;
    sourceLang: string;
    targetLang?: string;
    activeModel: string;
    layout?: "tree" | "capsule";
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
declare function formatModelSelectionMessage(labels: LingualI18nLabels, currentActive: string, availableList?: string): string;

/**
 * Splits text into atomic natural sentence chunks when long.
 * Preserves punctuation (。！？；\n and .!?\n).
 *
 * Line Budget & Ergonomics:
 * 结合 9 行硬预算折叠守卫与树状全景舒展度，单卡最舒适自然容量为 60~70 字符（约 30~35 汉字）。
 * 默认预算校准至 65 字符：
 * - 确保多句诗文/长段落切分后，每一卡均能以 6~8 行完整树状形式优雅展开，绝不触发单行胶囊降级；
 * - 绝不过度粉碎短句，保留自然停顿。
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
 * In-Memory LRU Cache for Lingual Translations (会话级 0 依赖极速缓存)
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
declare class LingualLruCache<T> {
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
declare const LinguaLruCache: typeof LingualLruCache;
declare const globalLingualCache: LingualLruCache<any>;
declare const globalLinguaCache: LingualLruCache<any>;

/**
 * Prompt Sanitizer & Intent Distiller (报错审查与意图萃取器)
 *
 * 物理职责：
 * 1. 剥离图片路径与文件路径前缀 (如 C:\Users\...\pi-clipboard-xxx.png)；
 * 2. 识别并折叠多行堆栈追踪 (Node.js at ..., Python Traceback, Java Caused by...)；
 * 3. 识别并折叠多行 Markdown 代码块 (```...```) 为 [...]；
 * 4. 识别并折叠多行编译器/Linter 诊断报错，仅保留首行关键信息；
 * 5. 严格保留 shell 命令行 (git, npm, cargo 等) 原型，不进行破坏性抹除；
 * 6. 提炼出核心自然语言意图，防止几百行报错撑爆终端与大模型上下文。
 */
interface SanitizedPromptResult {
    /** 审查折叠后用于翻译与分句的紧凑意图文本 */
    distilledText: string;
    /** 是否包含有效的人类自然语言提问/意图 */
    hasNaturalLanguage: boolean;
    /** 是否折叠了堆栈、代码块或报错 */
    hasCollapsedContent: boolean;
    /** 自然语言核心字符数估算 */
    naturalCharsLength: number;
    /** 提取出的原始代码块、堆栈或诊断附件 (供 english 模式实施混合意图嫁接) */
    rawPayload?: string;
}
/**
 * 对用户原始输入进行审查与折叠萃取
 */
declare function sanitizePromptForTranslation(raw: string): SanitizedPromptResult;

declare function invalidateUserConfigCache(): void;
/**
 * Load user configuration from:
 * 1. ~/.pi/agent/settings.json (under "pi-lingual" block)
 * 2. ~/.pi/agent/lingual.json (flat or nested)
 * Uses high-efficiency 2-second in-memory memoization to prevent synchronous disk I/O thrashing during parallel chunk translations.
 * Never hardcodes private credentials in source code.
 */
declare function loadUserLingualConfig(): Partial<LingualConfig>;
declare const DEFAULT_CONFIG: LingualConfig;
/**
 * 现代开发者双语伴学系统提示词 (中文 A ➔ 英文 B，默认导出)
 * 设计哲学：
 * 1. 敏捷口语 (Silicon Valley Slack/Standup) + 现代技术书面 (PR/RFC/Docs) 双语域
 * 2. 母语 A 精准语境释义与反向释义 (Back-translation & Nuance)
 * 3. 典型开发协同的 3 组黄金 Few-Shot 锚点
 * 4. 代码与专有名词绝对防御机制 (Code & Symbol Shield)
 * 5. 水平自适应重点词汇提取，单行紧凑流排列
 */
declare const LINGUAL_SYSTEM_PROMPT: string;

/**
 * Check if the text contains non-English natural language scripts (CJK, accented Latin, Cyrillic, etc.)
 * Strictly avoids triggering on pure emojis, typographical quotes, or terminal commands.
 */
declare function isNonEnglish(text: string): boolean;
declare const MAX_TRANSLATION_CHARS = 2500;
declare const MAX_TRANSLATION_LINES = 30;
/**
 * Bidirectional language-aware trigger with strict Length & Payload Guards:
 * - If sourceLang is not English (e.g. "zh", "ja"): triggers on natural language scripts;
 * - If sourceLang is English ("en"): detects English natural language sentences while strictly excluding code and CLI commands;
 * - Centrally delegates to shouldShieldBypass (Single Source of Truth) to exclude code statements, SQL, and 40+ CLI commands;
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
 * Implements strict Kinsoku Shori (标点禁则处理) to guarantee that punctuation marks never orphan at the start of a line!
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
 * 从 vocab 字符串中解析出纯净的目标短语列表 (由长到短排序)
 * 例如: "on board with (赞成/支持) · dive in (立刻着手/开搞)"
 * ➔ ["on board with", "dive in"]
 */
declare function extractVocabPhrases(vocab: string | undefined): string[];
/**
 * 对目标文本中的指定短语进行非破坏性 ANSI 下划线瞄准点亮 (Spotlight Highlighting)
 * 大小写不敏感匹配，保留原始文本的大小写与排版
 */
declare function spotlightPhrases(text: string, phrases: string[]): string;
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
    spotlight?: boolean;
}): string;
/**
 * 格式化极端分屏下的单行高密度胶囊流 (Single-Line Capsule Layout)
 * 严格限制在 1 行内，按终端列宽动态均衡截断，避免任何换行撕裂
 */
declare function formatCapsuleLine(hudTitle: string, spoken: string, written?: string, options?: {
    slot1Short?: string;
    slot2Short?: string;
    maxCols?: number;
}): string;
/**
 * Strip annotations and recover purely clean text to prevent LLM prompt pollution
 * Robust against tree branch glyphs (┌ ├ └) and arrow annotations (↳)
 */
declare function stripLingualAnnotation(annotatedText: string): {
    raw: string;
    spoken?: string;
    written?: string;
    vocab?: string;
};
/**
 * Translate a user prompt into idiomatic English with dual registers, native nuance, and vocabulary highlights
 */
declare function translatePrompt(text: string, userConfig?: Partial<LingualConfig>): Promise<LingualResult | null>;
declare const LINGUA_SYSTEM_PROMPT: string;
declare const stripLinguaAnnotation: typeof stripLingualAnnotation;
declare const loadUserConfig: typeof loadUserLingualConfig;

export { type CacheStats, DEFAULT_CONFIG, LANGUAGE_PRESETS, LINGUAL_SYSTEM_PROMPT, LINGUA_SYSTEM_PROMPT, type LinguaConfig, type LinguaI18nLabels, LinguaLruCache, type LinguaMode, type LinguaResult, type LingualConfig, type LingualI18nLabels, LingualLruCache, type LingualMode, type LingualResult, MAX_TRANSLATION_CHARS, MAX_TRANSLATION_LINES, type SanitizedPromptResult, type TranslationPayload, buildSystemPrompt, extractVocabPhrases, formatCapsuleLine, formatModelSelectionMessage, formatStatusReport, formatSubRail, formatTerminalAnnotation, formatTreeBranch, getVisualWidth, globalLinguaCache, globalLingualCache, invalidateUserConfigCache, isNonEnglish, loadUserConfig, loadUserLingualConfig, parseLlmResponse, resolveLabelsForLang, sanitizePromptForTranslation, shouldShieldBypass, shouldTriggerTranslation, splitSemanticChunks, spotlightPhrases, stripLinguaAnnotation, stripLingualAnnotation, translatePrompt, truncateVisual, wrapVisualText };
