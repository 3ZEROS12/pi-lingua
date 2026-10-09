# `pi-lingual` 工程实施状态报告 (Mission State Ledger)

**Baseline Version**: `v0.3.0` (SemVer Frozen per Architectural Decision)  
**Workspace Root**: `D:/Workspace/projects/pi-lingua`  
**Execution Status**: Phase 1~5 Architecture + Concurrency Optimization + Command Matrix Refactor + English Declarative Prose Sanitizer Fix Completed  
**Test Suite Health**: **67 / 67 PASS (100% Green)**  
**Fleet Pre-Flight**: **Passed: 1 | Failed: 0**  
**Host Mount**: Direct link to local repository in `~/.pi/agent/settings.json`

---

## 🔍 会话 `01a11fce` 英文长文本未触发卡片深层根因与彻底修复

在用户真机测试会话 `2026-10-09T08-36-45-441Z_01a11fce-bf01-719f-80b3-f50488ef4bde.jsonl`（`en-zh` 模式）中，第 11 行输入了 352 字符的英文陈述性文本（Situational Awareness 思考上下文），但未浮现伴学卡片。经第一性原理断点复现，彻底定位并根除了该隐蔽技术死穴：

### 1. 致命根因：`src/sanitizer.ts` 中英文陈述句被错误判定为非自然语言
- **物理死穴**：原代码在判定 `hasNaturalLanguage` 时，计算 `withoutPlaceholders` 采用了 `distilledText.replace(/[a-zA-Z0-9_\-\.\/\\:]+/g, "")`；
- **逻辑缺陷**：该正则本意是滤除纯代码标识符与路径，却**把所有的英文字母全部抹除**！导致第 11 行由 48 个标准英文词汇组成的优美英文陈述句，在被剔除字母后只剩下一个单引号 `'`（字符数 1），使得 `withoutPlaceholders.length > 5` 为 `false`；
- **连锁反应**：第 11 行并非以 `why/how/help` 等问句开头（`hasQuestionKeywords = false`），且不含中日韩字符（`hasCJK = false`），最终导致 `sanitized.hasNaturalLanguage` 被误判为 **`false`**，在 `src/extension.ts` 入口被直接判定为“纯代码/无自然语言意图”而静默跳过！
- **修复方案**：重构自然语言判定矩阵，针对非报错/非编译器输出场景，只要存在 $\ge 4$ 个标准英文自然单词（`/\b[a-zA-Z]{2,}\b/g`），即刻判定为具有人类自然语言意图，彻底根除陈述性英文句子的漏判。

### 2. 次要死穴：`src/extension.ts` 历史残留的 `> 500` 字符过窄防御截断
- **物理死穴**：在入口过滤处硬编码了 `promptToTranslate.length > 500`，与底层引擎的 `MAX_TRANSLATION_CHARS = 2500` 产生冲突；
- **修复方案**：彻底移除该硬编码 500 截断，完全对齐 `MAX_TRANSLATION_CHARS`，让所有大篇幅架构意图都能无阻碍流入 `[LONG INPUT CONDENSATION DIRECTIVE]` 凝练指令。

---

## 🧪 物理执行与验证数据 (Physical Proof)

```text
> pi-lingual@0.3.0 test
> npx tsx --test --test-concurrency=1 tests/**/*.test.ts

✔ sanitizePromptForTranslation - correctly recognizes declarative English sentences without question keywords
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
...
ℹ tests 67
ℹ suites 0
ℹ pass 67
ℹ fail 0
```
