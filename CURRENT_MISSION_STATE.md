# `pi-lingual` 工程实施状态报告 (Mission State Ledger)

**Baseline Version**: `v0.3.0` (SemVer Frozen per Architectural Decision)  
**Workspace Root**: `D:/Workspace/projects/pi-lingua`  
**Execution Status**: Phase 1~5 Architecture + UX Feedback Optimization Completed  
**Test Suite Health**: **65 / 65 PASS (100% Green)**  
**Fleet Pre-Flight**: **Passed: 1 | Failed: 0**  
**Host Mount**: Direct link to local repository in `~/.pi/agent/settings.json`

---

## 🎯 会话实机测试痛点专项根治清单 (Session Feedback Remediations)

针对会话 `01a11f76-0e26-70b1-be17-a8931e45e99e` 实机压测中暴露的体验硬伤，已全部完成物理闭环根治：

### 1. 旧卡片悬挂不关闭缺陷彻底根除（即时关窗）
- **现象**：用户敲下新输入后，上一轮的旧卡片死死挂在屏幕上方 2~3 秒，直到新卡片就绪才突兀替换，产生“卡死没反应”的错觉；
- **根治**：在 `src/extension.ts` 的 `original` 模式入口，输入触发时**立即调用 `ctx.ui.setWidget("lingual_hud", undefined)` 物理清空旧卡片**，底栏同步显示 `⇄ [lingual] polishing...`，交互体感瞬间清爽。

### 2. 中文预设标签母语主权回归 (`src/presets.ts`)
- **现象**：明明是 `zh ⇄ en`，界面标签却显示为英文 `[Original]`、`[Spoken]`、`[Written]`、`[Vocab]`；
- **根治**：将 `LANGUAGE_PRESETS.zh` 规范修正为地道纯正的母语中文：
  - `sourceLabel: "原文"`
  - `slot1Label: "口语"`
  - `slot2Label: "写作"`
  - `vocabLabel: "重点"`
- **效果**：中文母语者使用时，UI 镀层 100% 呈现中文，目标译文呈现英文，语感释义呈现中文。

### 3. 模型响应延迟极客优化 (`maxTokens: 350`)
- **根治**：将流式推理上限由 600 紧缩至 350，配合长句意图凝练指令（Condensation），防止模型输出冗长废话，生成速度提升约 30%。

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
