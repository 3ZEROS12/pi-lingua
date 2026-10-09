# `pi-lingual` 工程实施状态报告 (Mission State Ledger)

**Baseline Version**: `v0.3.0` (SemVer Frozen per Architectural Decision)  
**Workspace Root**: `D:/Workspace/projects/pi-lingua`  
**Execution Status**: Phase 1~5 Industrial Refactoring Completed & Verified  
**Test Suite Health**: **64 / 64 PASS (100% Green)**  
**Build Artifacts**: Clean dual-bundle output (`dist/extension.js`, `dist/extension.cjs`, `dist/index.js`, `dist/index.cjs` with `.d.ts` / `.d.cts`) via `tsup`

---

## 一、 核心重构与第一性原理落地成果 (Delivered Capabilities)

### 1. 终端盒模型求解引擎 (`src/layout.ts`)
- **严格遵循 Unicode Standard Annex #11**：高精度视觉单元格测算（CJK/全角/Emoji = 2 单元格，ASCII = 1 单元格，ANSI 转义序列 = 0 单元格）；
- **行头标点禁则处理 (Kinsoku Shori)**：预设行首禁止标点集合，对折行后孤立标点自动吸附至上一行末尾；
- **单行高密度胶囊流 (formatCapsuleLine)**：预先扣除前缀与省略号物理列宽，在极端窄屏 (< 40 列) 或高度受限时平滑降级，绝不折行撕裂；
- **9 行硬预算求解器 (renderCardLayout)**：统一求解全展开树状分支、内联语感降级及单行胶囊降级，数学断言 `lines.length <= 9`；
- **终端缩放防崩溃保底 (getEffectiveMaxCols)**：针对 `SIGWINCH` 终端缩放或列宽异常，物理保底 25 列，防止除零或负数溢出。

### 2. 单调会话状态机与协同掐断 (`src/fsm.ts`)
- **世代守卫 (Generation Counter)**：单调递增世代号，任何陈旧回调或慢请求返回时严格校验 `isLatest(generation)`，彻底根治覆盖脏写与幽灵卡片；
- **物理 AbortController 协同掐断**：每次新请求到达时调用 `beginRequest()`，瞬间触发 `abortActive()` 掐断上一轮排队中或传输中的远程网络 Socket，杜绝 Token 偷跑与连接挂起；
- **封装式分页池管理**：将 `pagedResults`、`currentPageIndex`、`lastResult` 完全收敛进 `LingualSessionController`，对外提供 `nextPage()`、`prevPage()`、`clearPagination()` 与状态快照。

### 3. 词法盾牌与意图提炼加固 (`src/sanitizer.ts`, `src/shield.ts`)
- **Windows 路径与双反斜杠安全清洗**：安全剥离剪贴板截图路径，防止路径转义符污染自然语言切片；
- **单行代码块起手保留**：对形如 `` `const x = 1` 怎么优化？ `` 的提问，准确保留行首行内代码与自然语言提问；
- **纯报错/纯代码 0ms 旁路防御**：严格识别纯堆栈、纯编译器诊断并即时放行，0 网络开销。

### 4. 领域引擎与两级缓存加固 (`src/engine.ts`, `src/cache.ts`)
- **LRU 内存安全边界**：限制缓存键长 <= 256 字符，载荷长 <= 2048 字符，防止整篇长文注入引起内存泄漏；
- **2 秒内存配置快照**：高频分块翻译期间零重复磁盘读取，防止并发 I/O 阻塞；
- **流式推理中止透传**：`translatePrompt` 深度接入 `AbortSignal`，超时与用户打断时即刻释放模型连接。

### 5. 扩展胶水装配与全量兼容门面 (`src/extension.ts`, `src/index.ts`)
- **纯 Presenter 架构**：`extension.ts` 全面接入 `LingualSessionController`，所有快捷键与命令统一驱动状态机；
- **100% 向后兼容门面**：`src/index.ts` 完整导出所有类型、预设、排版函数与引擎接口，对外 API 契约无破坏。

---

## 二、 自动化验证物理铁证 (Physical Proof of Execution)

```text
> pi-lingual@0.3.0 test
> npx tsx --test --test-concurrency=1 tests/**/*.test.ts

✔ LingualLruCache - basic get, set, and stats tracking
✔ LingualLruCache - evicts least recently used entry when capacity is exceeded
✔ translatePrompt - hits in-memory LRU cache on repeated calls without invoking complete callback
✔ truncateVisual - strictly respects maxVisualCols including ellipsis allowance
✔ formatCapsuleLine - strictly bounds visual width under extreme narrow columns
✔ formatCapsuleLine - formats single-line compact representation for both slots
✔ formatCapsuleLine - dynamically truncates slots when maxCols is narrow without line break
✔ formatCapsuleLine - handles single slot without slot 2
✔ splitSemanticChunks - preserves single chunk for normal short prompts
✔ splitSemanticChunks - groups short consecutive sentences up to 90 chars without arbitrary over-splitting
✔ splitSemanticChunks - splits long multi-sentence input into atomic chunks
✔ splitSemanticChunks - splits long English prose on sentence terminators cleanly without failing lookbehinds
✔ splitSemanticChunks - does NOT produce orphan single-comma chunks during clause fallback
✔ extension command matrix - registers standardized lingual command suite
✔ extension /lingual - supports explicit mode arguments and cycle fallback
✔ extension /lingual-compact - toggles capsule and tree layout with notification
✔ extension /lingual-lang - switches native language and notifies in target language
✔ formatStatusReport - includes in-memory cache statistics and hit rate
✔ extension paging - non-translating inputs fully clear pagination pool to prevent ghost resurrection
✔ isNonEnglish - correctly identifies natural language scripts and ignores emojis & typography
✔ shouldTriggerTranslation - bidirectional language trigger logic
✔ parseLlmResponse - robustly handles prefix chatter, markdown fences, thoughts, nuance meanings and duality slots
✔ parseLlmResponse - supports proficiency-adaptive vocab with multiple (3+) expressions without rigid caps
✔ formatTerminalAnnotation - formats with source text anchor, native nuance, and Trifecta Left-Rail Tree Branch
✔ stripLingualAnnotation - cleanly recovers raw text and isolates parenthetical nuance
✔ translatePrompt - ignores pure English/ASCII and emoji inputs under default sourceLang
✔ translatePrompt - supports custom completion callback (Pi native ModelRegistry zero-config mode)
✔ translatePrompt - live integration test against local gateway if configured
✔ extension input handler - original mode returns continue immediately and renders source anchor & Left-Rail tree branch asynchronously
✔ LingualSessionController - monotonic generation increment and abort signal
✔ LingualSessionController - rejects stale generation writes
✔ LingualSessionController - pagination cyclic navigation and snapshot
✔ LingualSessionController - clearPagination leaves no ghost cards
✔ Bulletproof Tiered Hard Budget Guard - guarantees lines.length <= 8 on extreme long inputs and narrow columns
✔ getEffectiveMaxCols - guarantees minimum 25 columns under extreme SIGWINCH collapse
✔ renderCardLayout - renders tree branch for normal inputs within 9 lines
✔ renderCardLayout - guarantees output <= 9 lines on long multi-clause inputs with fallback
✔ renderCardLayout - explicit compact mode generates 1 line capsule with page tag
✔ wrapVisualText - handles consecutive punctuation and Kinsoku Shori
✔ sanitizePromptForTranslation - collapses Node.js stack traces while preserving error summary and natural question
✔ sanitizePromptForTranslation - collapses Python Tracebacks cleanly
✔ sanitizePromptForTranslation - collapses Markdown code fences into [code ...]
✔ sanitizePromptForTranslation - strips clipboard image path prefixes
✔ sanitizePromptForTranslation - identifies pure stack trace with zero natural language
✔ sanitizePromptForTranslation - strictly preserves CLI command verbatim
✔ sanitizePromptForTranslation - extracts rawPayload for hybrid intent grafting
✔ sanitizePromptForTranslation - preserves regular markdown and source file paths without accidental stripping
✔ sanitizePromptForTranslation - handles forward slashes and paths with spaces cleanly
✔ sanitizePromptForTranslation - correctly identifies pure compiler diagnostic output as non-natural
✔ sanitizePromptForTranslation - preserves inline code at start of question
✔ sanitizePromptForTranslation - safely strips clipboard paths with double backslashes
✔ shouldShieldBypass - 0ms bypass for pure CLI commands
✔ shouldShieldBypass - 0ms bypass for code blocks and data structures
✔ shouldShieldBypass - does NOT bypass natural language prompts with tech terms
✔ Primary Language Sovereignty - Japanese (ja) leaves ZERO Chinese in UI and labels
✔ Primary Language Sovereignty - English (en) leaves ZERO Chinese in UI and labels
✔ System Prompt Sovereignty - Generates authentic Language A anchors and rules
✔ Visual Consistency - Source line tag matches [Original] format and aligns to column 11
✔ extractVocabPhrases - extracts clean phrases without parenthesis definitions, sorted by length descending
✔ spotlightPhrases - non-destructively highlights matched phrases with ANSI underline without case alteration
✔ spotlightPhrases - successfully underlines CJK (Japanese/Chinese) expressions without ASCII word boundary failure
✔ formatTerminalAnnotation - applies spotlight to spoken and written branches when vocab is present
✔ getVisualWidth - handles ANSI escapes, CJK, and ASCII accurately
✔ formatTreeBranch - aligns wrapped text with hanging indent strictly behind heading

ℹ tests 64
ℹ suites 0
ℹ pass 64
ℹ fail 0
```
