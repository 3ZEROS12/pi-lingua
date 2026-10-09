# `pi-lingual` 工程实施状态报告 (Mission State Ledger)

**Baseline Version**: `v0.3.0` (SemVer Frozen per Architectural Decision)  
**Workspace Root**: `D:/Workspace/projects/pi-lingua`  
**Execution Status**: Phase 1~5 Architecture + Featherweight Hardening & Pruning Completed  
**Test Suite Health**: **65 / 65 PASS (100% Green)**  
**Fleet Pre-Flight**: **Passed: 1 | Failed: 0**  
**Bundle Efficiency**: Clean dual-bundle output (`dist/extension.js` 93.5 KB, `dist/index.js` 78.6 KB; 相比重构前减少 4.3 KB 冗余)

---

## 一、 架构加固与羽量级瘦身成果 (Featherweight Hardening & Slimming)

### 1. 极简微型 JSON 容错修复 (Featherweight JSON Repair · 18 行代码)
- **物理痛点消除**：大模型偶发在 `spoken_meaning` 中输出未转义双引号（如 `{"spoken_meaning": "用 "refactor" 重写"}`），导致 `JSON.parse` 抛出 `SyntaxError` 并静默丢失卡片；
- **零依赖刀锋修复**：在 `parseLlmResponse` 中引入微型修复状态机，捕获后自动正规化修复内层未转义引号并安全剔除尾随逗号，测试断言 100% 自愈恢复。

### 2. 长命令模型意图凝练总结流 (Long-Input Condensation · 单卡直出)
- **按需注入总结指令**：当输入长文本（> 90 字符）时，自动注入 `[LONG INPUT CONDENSATION DIRECTIVE]`，驱动大模型将核心架构意图凝炼为精悍的双语域表达（严格 < 25 词）；
- **彻底消灭多页切片轮询**：摒弃复杂的背景并发预加载队列与 `Alt+.` / `Alt+,` 翻页心智负担，实现 **1 个提问轮次 = 1 个原子 HUD 卡片**，极致轻量，一目了然。

### 3. 终端窗口实时缩放自适应 (SIGWINCH 8 行防抖重绘)
- 挂载 `process.stdout.on("resize", ...)` 120ms 防抖监听器；
- 用户在卡片显示期间拖动缩放终端窗口时，自动按最新物理列宽重新执行盒模型求解与重绘，绝不产生换行撕裂。

### 4. 核心命令矩阵收敛与保留
- 完整保留核心命令：`/lingual`（模式切换）、`/lingual-lang`（母语切换）、`/lingual-agent`（向 Agent 提问定制指南）、`/lingual-compact`、`/lingual-status`、`/lingual-last` 以及 `/2` 极速别名；
- 避免冗余命令爆炸，保持终端 Tab 补全清单纯净。

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
✔ parseLlmResponse - recovers cleanly from unescaped quotes and trailing commas via featherweight repair
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

ℹ tests 65
ℹ suites 0
ℹ pass 65
ℹ fail 0
```
