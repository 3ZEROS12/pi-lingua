# `pi-lingual` 工程实施状态报告 (Mission State Ledger)

**Baseline Version**: `v0.3.0` (SemVer Frozen per Architectural Decision)  
**Workspace Root**: `D:/Workspace/projects/pi-lingua`  
**Execution Status**: First-Principles Refactoring: Pure Deterministic Layout + Zero-Residue Primary Language Sovereignty + Collision Eradication Completed  
**Test Suite Health**: **67 / 67 PASS (100% Green)**  
**Fleet Pre-Flight**: **Passed: 1 | Failed: 0**  
**Host Mount**: Direct link to local repository in `~/.pi/agent/settings.json`

---

## 🧭 架构反思与第一性原理重构 (Architecture Reflection & Rebuild)

针对用户关于“提示文字在非中文模式下仍显示中文”以及“不要盲目套用用户直觉方案，要探索更合理的工程解法”的严肃指导，进行了深刻的工程反思与第一性原理清洗：

### 1. 摒弃投机性中间层，回归纯粹确定性排版 (Deterministic Layout over Speculative LLM Summary)
- **反思**：此前因为用户随口一句“是不是中间加个 if 总结一下”，便直接在 LLM 提示词里强行塞入了 `summary` 字段，让模型做两阶段意图提炼。这属于典型的“将前端 UI 的排版溢出问题，错误地转嫁给大模型”，既增加了 Prompt 复杂度与 Token 消耗，又篡改了开发者原本输入的真实原文。
- **第一性原理根治**：
  * **剥离 `summary` 侵入**：从 `prompts.ts`、`engine.ts`、`types.ts` 中彻底移除 `summary` 字段，让伴学大模型专注于最高质量的双模翻译（`spoken` + `written` + `vocab` 与语感释义）。
  * **在 `layout.ts` 纯确定性求解**：对于长文本，原文展示采用严格的悬挂缩进自然折行（最多占用 2 行保护）；若双模全展开依然超出 9 行安全预算，自动将母语语感内联入括号（`Spoken: ... (nuance)`），末尾以 9 行截断保护。
  * **绝对守护开放式左导轨树状架构 (`· ┌ ├ └`)**：彻底剔除那段将树状卡片砸毁为带省略号的单行胶囊的 `else` 降级逻辑，在非显式 `compact` 模式下 100% 呈现完整四段式树状图。

### 2. 彻底根治中文残留，实现真正的母语绝对主权 (Zero-Chinese-Residue I18n)
- **病灶诊断**：用户指出“为什么维护了映射表，提示的地方依然一直是中文？”
  1. **调用方硬编码越界**：在 `src/extension.ts` 的 `switchLangHandler` 中，直接硬编码了中文 `用法: /lang ... (如 /lang ja 或 /lang zh ja)` 以及 `• zh (中文 ➔ 英文)`，完全绕过了映射表！
  2. **映射表缺失对应词条**：`src/presets.ts` 过去根本没有声明语言切换列表 `langList` 与用法提示 `langUsageHint` 字段。
  3. **代码后备（Fallback）中文污染**：在全工程的 `|| "..."` 表达式中，充斥着大量硬编码中文兜底。一旦非中文用户命中后备，立刻泄露中文。
  4. **静态语言对死板绑定**：`LANGUAGE_PRESETS.en` 中死板硬编码了 `[en ⇄ ja]`，即便切换为 `en ➔ zh`，通知依然显示为 `[en ⇄ ja]`。
- **第一性原理根治**：
  * 在 `types.ts` 的 `LingualI18nLabels` 中正式纳入 `langList` 与 `langUsageHint` 契约。
  * 在 `presets.ts` 的全部 6 大官方预设（`zh`, `ja`, `en`, `es`, `fr`, `de`）中完整补充纯正的母语表达，非中文预设**0 中文字符残留**。
  * 在 `resolveLabelsForLang` 中引入动态语言对正则流替换：无论用户设定何种语言对，所有通知与图腾中的 `[xx ⇄ yy]` 均自动对齐为真实的 `${sourceLang} ⇄ ${targetLang}`。
  * 所有代码 fallback `|| "..."` 统一遵循 **English Pivot Fallback**，绝对杜绝中文兜底。

### 3. 根除 Pi 宿主内置命令冲突警告 (`/compact` Collision Fix)
- **病灶诊断**：用户截图显示 `[Extension issues] Extension command '/compact' conflicts with built-in interactive command. Skipping in autocomplete`。Pi 自身内置了历史记录压缩命令 `/compact`，扩展重复注册顶级 `/compact` 会导致宿主报冲突并跳过补全。
- **第一性原理根治**：
  * 移除 `pi.registerCommand("compact", ...)` 这一侵入式注册；
  * 保留正规命名的 `/lingual-compact` 与极速别名 `/2-compact`；
  * 在主命令总线 `/lingual` 和 `/2` 中，依然无缝支持 `/lingual compact` 与 `/2 compact` 子命令调度。
  * 彻底消灭启动时的 `[Extension issues]` 红色告警。

---

## 🧪 物理执行与验证数据 (Physical Proof)

```text
> pi-lingual@0.3.0 test
> npx tsx --test --test-concurrency=1 tests/**/*.test.ts

✔ Primary Language Sovereignty - Japanese (ja) leaves ZERO Chinese in UI and labels
✔ Primary Language Sovereignty - English (en) leaves ZERO Chinese in UI and labels
✔ extension command matrix - registers standardized lingual command suite
✔ standalone /lang and language normalization - switches languages and handles pairs & aliases
✔ master command dispatcher - routes subcommands in /lingual and /2 smoothly
✔ renderCardLayout - renders tree branch for normal inputs within 9 lines
✔ renderCardLayout - guarantees output <= 9 lines on long multi-clause inputs with fallback
✔ Bulletproof Tiered Hard Budget Guard - guarantees lines.length <= 8 on extreme long inputs and narrow columns
...
ℹ tests 67
ℹ suites 0
ℹ pass 67
ℹ fail 0
ℹ duration_ms 32178.6697

🧪 Fleet Physical Pre-Flight: Passed: 1 | Failed: 0
```
