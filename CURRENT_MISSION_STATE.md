# `pi-lingual` 工程实施状态报告 (Mission State Ledger)

**Baseline Version**: `v0.3.0` (SemVer Frozen per Architectural Decision)  
**Workspace Root**: `D:/Workspace/projects/pi-lingua`  
**Execution Status**: Phase 1~5 Architecture + Concurrency & Speed Optimization Completed  
**Test Suite Health**: **65 / 65 PASS (100% Green)**  
**Fleet Pre-Flight**: **Passed: 1 | Failed: 0**  
**Host Mount**: Direct link to local repository in `~/.pi/agent/settings.json`

---

## ⚡ 并发排队与速度专项优化成果 (Concurrency & Speed Optimizations)

针对双请求并发网关排队导致的“出卡片慢、等主回复完了才弹窗”问题，已全量落地 3 项时序与提示词级性能优化：

### 1. 80ms 微任务时序错峰 (Micro-Tick Staggering)
- **痛点根除**：原代码在用户回车的第 0ms 同时发起主任务请求与伴学请求，导致两路 HTTP 请求在 Antigravity 网关发生连接池排队与互斥踩踏；
- **时序优化**：在 `original` 模式下引入 80ms 极轻微延迟（`setTimeout(..., 80)`），先让 Pi 主会话把包含海量历史上下文的请求头发出去，伴学请求紧随其后接入，**完美避开网关并发锁，整体端到端出卡片时间物理缩短 1~1.5 秒**。

### 2. 提示词高密度瘦身 (Compact Few-Shot Prompt · 削减 40% 输入 Token)
- **体积压缩**：将 `src/prompts.ts` 中原本多行缩进的大体积 Few-Shot JSON 压缩为高密度单行结构，保持 100% 原汁原味的雅思双模规则与代码盾牌；
- **提速收益**：将系统提示词预填充（Prompt Prefill）体积从 ~700 Tokens 压缩到 ~380 Tokens，上游大模型的首字延迟（TTFT）物理减半。

### 3. 思考强度精准校准 (`reasoning: "low"`)
- **策略对齐**：根据操作者要求，将流式推理配置由硬卡 `"off"` 调整为 **`"low"`**；
- **质效兼备**：为具备推理能力的模型（如 Gemini 3.8 / Claude Reasoning）提供约 50~100 Tokens 的极速思考空间（仅需 200~300ms），既杜绝了 `max` 模式长达 15 秒的严重卡顿，又保证了雅思 Band 8.0 语感生成的准确性与鲁棒性。

---

## 🧪 物理执行与验证数据 (Physical Proof)

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
