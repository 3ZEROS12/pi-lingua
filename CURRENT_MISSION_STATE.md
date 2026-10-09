# `pi-lingual` 工程实施状态报告 (Mission State Ledger)

**Baseline Version**: `v0.3.0` (SemVer Frozen per Architectural Decision)  
**Workspace Root**: `D:/Workspace/projects/pi-lingua`  
**Execution Status**: Phase 1~5 Architecture + Concurrency Optimization + Command Matrix Refactor + Long Input 2-Stage Condensation & Tree Preservation Completed  
**Test Suite Health**: **67 / 67 PASS (100% Green)**  
**Fleet Pre-Flight**: **Passed: 1 | Failed: 0**  
**Host Mount**: Direct link to local repository in `~/.pi/agent/settings.json`

---

## 🔍 会话 `01a11fed` 长文本收缩为胶囊行与省略号深层根因与彻底根除

在用户真机测试会话 `2026-10-09T09-09-54-037Z_01a11fed-16f5-7349-b6e6-faf8ad12c9c0.jsonl`（`en-zh` 模式）中，第 7 行输入了一段 324 字符的建筑美学长文本（榫卯与朱砂印章），终端却显示为被粗暴收缩的单行胶囊：
`⇄ [en ⇄ ja] Spk: 机底用了非常克制的榫卯结构托底，占了刚好七分... · Wrt: 机身底座采用极简榫卯/斗拱结构（约占整体设计 1...`

经第一性原理全链路断点复现，彻底定位并根除了该问题的三大技术根因：

### 1. 致命根因：`src/layout.ts` 与 `src/extension.ts` 中的粗暴单行胶囊降级逻辑
- **物理死穴**：原代码在行数守卫中设计了一段“退化降级”：
  ```typescript
  if (inlineLines.length > HARD_MAX_LINES) {
    const capsuleText = formatCapsuleLine(...); // ⚠️ 致命灾难！粗暴降级并以 ... 截断！
    lines = [capsuleText];
  }
  ```
- **连锁反应**：当用户输入 324 字符的长句时，由于卡片上的原文（`sourceText`）仍是未精炼的 324 字符原样长文，光是原文排版折行就占用了 5~6 行，加上口语、写作、词汇，总行数达到 10 行；行数守卫判定 `10 > 9`，立刻粗暴激活该降级分支，**硬生生将原本精美的左导轨树状卡片摧毁，砸成了带省略号的单行胶囊**！
- **修复方案**：**彻底物理铲除该降级逻辑**！在非显式 `compact` 模式下，卡片**100% 坚守 Trifecta 开放式左导轨树状架构 (`· ┌ ├ └`)**；长文本原文最多占用 2 行悬挂缩进，末尾严格按 `maxLines` 保护，**绝对禁止退化为带省略号的单行胶囊**！

### 2. 意图凝练中间层落地 (2-Stage Intermediate Condensation Pipeline)
- **痛点根除**：过去直接把长文送给翻译模型，导致卡片原文行数爆炸；
- **优雅解法**：遵循用户的“加一层中间判定，总结完再如常输出”的清晰思路：
  * 当输入为长句（`> 90` 字符）时，提示词要求模型首先在源语言生成小于 20 个单词的意图精炼句（`summary`）；
  * 卡片原文锚点（`· [Source]`）直接呈现该提炼后的精粹（仅占 1~2 行），双模与词汇针对该精粹展开；
  * **整张卡片稳稳控制在 4~5 行内，留出充裕高度空间，永不越界、永不截断、零省略号**！

### 3. 动态语言流向标题 (`hudTitle`) 修复
- **痛点根除**：原先 `LANGUAGE_PRESETS.en` 中的 `hudTitle` 硬编码为 `"en ⇄ ja"`，导致即使切到 `en ➔ zh`，胶囊或标题仍错误显示为 `[en ⇄ ja]`；
- **修复方案**：`resolveLabelsForLang` 现动态计算 `hudTitle = "${sourceLang} ⇄ ${targetLang}"`，在 `en-zh` 模式下绝对显示为正确的 `en ⇄ zh`。

---

## 🧪 物理执行与验证数据 (Physical Proof)

```text
> pi-lingual@0.3.0 test
> npx tsx --test --test-concurrency=1 tests/**/*.test.ts

✔ renderCardLayout - renders tree branch for normal inputs within 9 lines
✔ renderCardLayout - guarantees output <= 9 lines on long multi-clause inputs with fallback
✔ Bulletproof Tiered Hard Budget Guard - guarantees lines.length <= 8 on extreme long inputs and narrow columns
✔ sanitizePromptForTranslation - correctly recognizes declarative English sentences without question keywords
...
ℹ tests 67
ℹ suites 0
ℹ pass 67
ℹ fail 0
ℹ duration_ms 31893.0265

🧪 Fleet Physical Pre-Flight: Passed: 1 | Failed: 0
```
