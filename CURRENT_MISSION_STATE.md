# MISSION STATE & CONTEXT HANDOFF
- **Directory**: `D:\Workspace\projects\pi-lingua`
- **Package**: `pi-lingual` (v0.2.4)
- **Status**: **ROOT CAUSES EXCAVATED & PERMANENTLY ROOTED OUT · 36/36 TESTS PASS · ZERO WIDGET TRUNCATION · PHYSICAL DEPLOYMENT COMPLETE**

---

## 🎯 深度根本原因（Root Cause）深度复盘与终极根治报告

### 1. 致命缺陷：为何真实终端会现场打出 `... (widget truncated)`？
* **表象特征**：用户在真实会话中输入一段稍长的反馈后，HUD 卡片第 10 行赫然被打断，并输出了 `... (widget truncated)`。
* **物理根因定位**：
  1. Pi 宿主对 `aboveEditor` 浮动小部件施加了**硬性的 10 行物理高度拦截阈值**；
  2. 原代码声称具备 9 行守卫，但在处理长句输入时，虽然把母语语感拼进了括号 `${spoken} (${spokenMeaning})`，但当英文长句自身折行（2~3行）叠加母语长释义折行（2~3行）时，双模加上原文锚点，生成的总行数**依然达到了 11~12 行**！
  3. 旧代码在 `compactLines.length > 9` 时**直接放弃了更深层的压缩防护**，将超长数组直接塞给了宿主 `setWidget`，导致被宿主底层机制无情砍断并打印截断报错。
* **终极物理根治（Tiered Bulletproof Line Guard · `HARD_MAX_LINES = 8`）**：
  重构了 4 级阶梯式自适应行数防护算法，留出整整 2 行绝对安全冗余，严格将最大行数卡在 `<= 8` 行：
  * **Tier 0 (<= 8 行)**：全景展开（双模主分支 + 独立 subRail 语感导轨 + 重点词汇）；
  * **Tier 1 (内联折叠)**：将独立语感导轨收起，内联进双模括号；若 `<= 8` 行则采纳；
  * **Tier 2 (精纯目标语)**：若仍 `> 8` 行（说明英文句子本身较长或屏幕狭窄），剥离长篇母语释义，只保留纯正地道的目标语 `spoken` 与 `written` 以及词汇；
  * **Tier 3 (精炼主干)**：若仍 `> 8` 行，剥离词汇行，原文折叠至最多 2 行；
  * **Tier 4 (单行胶囊平滑降级)**：若仍 `> 8` 行，自动优雅降级为单行胶囊模式（1-Line Capsule Mode）；
  * **终极物理拦截底线**：`lines = lines.slice(0, 8)`。
  * **物理断言**：在任何超长文本、极端窄屏（40 列）下，向宿主递交的行数永远 `<= 8`，**物理上 100% 杜绝触发 `... (widget truncated)`！**

---

### 2. UI Chrome 规范治理：彻底对齐 Invariant 4
* **表象特征**：`zh` 预设下的标签被写成了中文 `[口语]`、`[写作]`、`[重点]`、`[原文]`，违背了工作区总纲 **Invariant 4（Universal Minimal English Chrome + LLM-Driven Native Content）**；
* **物理根治**：
  * 全局统一静态 UI 标签为极简英文通用 Chrome：`[Original]`、`[Spoken]`、`[Written]`、`[Vocab]`；
  * 动态内容（反向语感解释、状态栏通知、自适应词汇释义）保持纯正地道母语，界面整洁规范，与官方所有宣传图与终端输出 100% 保持一致。

---

### 3. 本地宿主环境物理覆盖与版本交付
* **版本自增**：发布版本提升为 `v0.2.4`；
* **物理同步覆盖**：已将编译产物与重绘资产全量同步覆盖至宿主全局加载目录：
  `C:\Users\Jason\.pi\agent\npm\node_modules\pi-lingual`；
* **自动化测试**：新构建的 `tests/hard-budget-guard.test.ts` 针对用户触发截断的长文本进行 45 列窄屏极端模拟，全套 **36 / 36 套件 100% 通过**，TypeScript 0 错误。
