# `pi-lingual` 工程实施状态报告 (Mission State Ledger)

**Baseline Version**: `v0.3.0` (SemVer Frozen per Architectural Decision)  
**Workspace Root**: `D:/Workspace/projects/pi-lingua`  
**Execution Status**: Phase 1~5 Architecture + Concurrency & Speed Optimization + Command Matrix Refactor Completed  
**Test Suite Health**: **66 / 66 PASS (100% Green)**  
**Fleet Pre-Flight**: **Passed: 1 | Failed: 0**  
**Host Mount**: Direct link to local repository in `~/.pi/agent/settings.json`

---

## 🛠️ 命令路由与语言切换系统根治专项成果 (Command Matrix & Language Switching Architecture)

针对用户在交互式测试中发现的“某些命令不起作用，例如 lang 无法切换语言”问题，完成深度根因溯源并全量落地五重工业级根治：

### 1. 独立直觉命令首登宿主 (`/lang` 与 `/compact`)
- **痛点根除**：原先仅注册了 `/lingual-lang` 与 `/2-lang`，开发者直觉输入的 `/lang` 或 `/lang ja` 会被 Pi 宿主判定为未知命令；
- **直觉支持**：正式将 `/lang`（以及 `/compact`）注册为一等公民命令，同时保留 `/lingual-lang`、`/2-lang`、`/lingual-compact`、`/2-compact` 全家桶别名。

### 2. 主命令总线子命令智能路由 (`/lingual` 与 `/2`)
- **痛点根除**：原先 `/lingual` 和 `/2` 的处理函数 `setModeHandler` 仅检测 `english`/`original`/`off`，当用户输入 `/lingual lang ja`、`/2 lang ja` 或 `/lingual compact` 时，参数被视作未知模式，导致直接执行三态轮转（切模式），完全吞掉了语言切换诉求；
- **智能调度**：重构 `masterCommandHandler` 总线分发层，严格支持：
  * `/lingual lang [code]` / `/2 lang [code]` ➔ 路由至语言切换
  * `/lingual model [id]` / `/2 model [id]` ➔ 路由至模型切换
  * `/lingual compact` / `/2 compact` ➔ 路由至胶囊/树状布局切换
  * `/lingual status` / `/2 status` ➔ 路由至状态诊断报告
  * `/lingual last` / `/2 last` ➔ 路由至上一张卡片回显
  * `/lingual agent` / `/2 agent` ➔ 路由至伴学定制向导
  * `/lingual ja` / `/2 ja` ➔ 直通语言切换
  * `/lingual [english|original|off]` ➔ 直通模式切换
  * `/lingual` / `/2`（无参数） ➔ 平滑三态循环轮转 (`original` ➔ `english` ➔ `off` ➔ `original`)。

### 3. 多源自然语言代码归一化 (Natural Language Alias Normalization)
- **多形式容错**：编写 `normalizeLangCode` 模块，全面支持自然语言别名与区域代码：
  * `japanese`, `jp`, `日语`, `日文`, `日本語` ➔ 自动归一为 `ja`
  * `chinese`, `cn`, `zh-cn`, `中文` ➔ 自动归一为 `zh`
  * `english`, `eng`, `英语`, `英文` ➔ 自动归一为 `en`
  * `spanish`, `西语`, `西班牙语` ➔ 自动归一为 `es`
  * `french`, `法语`, `法文` ➔ 自动归一为 `fr`
  * `german`, `德语`, `德文` ➔ 自动归一为 `de`
- **语言对语法支持**：支持输入语言对，如 `/lang zh ja`、`/lang zh->en`、`/lang zh ➔ ja`，精准更新 `sourceLang` 与 `targetLang`。

### 4. 语言流向双向状态闭环 (`targetLang` 状态联动)
- **闭环补全**：在 `ExtensionState` 中新增 `targetLang` 状态字段与持久化落盘，并在调用 `translatePrompt` 时同步透传 `targetLang`，彻底杜绝母语为英语时发生 `en ➔ en` 同语言直译死循环；
- **状态栏动态更新**：底栏指示器动态显示为当前实际流向（如 `zh ⇄ en`、`ja ⇄ en`、`zh ⇄ ja`、`en ⇄ ja`）。

### 5. 测试沙箱隔离升级与宿主配置保护 (`isTestEnvironment`)
- **环境隔离**：使用多源探测（`NODE_TEST_CONTEXT`、`execArgv` 中的 `--test-*`、`process.argv`）彻底隔离测试环境与宿主机配置，杜绝宿主机中的个人偏好污染自动化测试断言；
- **标签主权兜底**：在 `src/engine.ts` 中针对未显式传入 `labels` 的场景引入 `resolveLabelsForLang` 兜底，坚守【母语最高统治权】。

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
✔ standalone /lang and language normalization - switches languages and handles pairs & aliases
✔ master command dispatcher - routes subcommands in /lingual and /2 smoothly
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

ℹ tests 66
ℹ suites 0
ℹ pass 66
ℹ fail 0
```
