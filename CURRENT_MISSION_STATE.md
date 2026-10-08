# MISSION STATE & CONTEXT HANDOFF
- **Directory**: `D:\Workspace\projects\pi-lingua`
- **Package**: `pi-lingual` (v0.2.2)
- **Status**: **ANTI-TRUNCATION & CHUNK ERGONOMICS REFACTORING COMPLETED · 35/35 TEST SUITE PASS · 0 TS ERRORS · GITHUB SYNCED**

## 🎯 Dogfooding Findings & Root-Cause Resolutions (实机犬吠问题根治)

### 1. 根治问题一：原句无故被省略号腰斩截断 (`需要你针对现在的github和npm上的...`)
- **根因分析**：
  * 过去在 `src/engine.ts` 和 `src/extension.ts` 中死板写死了 `truncateVisual(cleanSource, 32)`；
  * 32 视觉列宽仅相当于 16 个汉字，只要用户输入超过 16 字，原句在第 15 字后就被强加 `...` 省略号；
  * 而终端实际列宽有 80~120 列，除去前缀与角标后依然有 50~90 列完全闲置，严重违背了“零文本压缩（Zero Text Compression）”的铁律！
- **修复方案**：
  * 彻底废除写死的 `32` 限制；
  * 动态根据终端实际可用宽度 `availLine1W` 单行展示；
  * 若句子较长，采用标准的 `  · [原文] ` 悬挂缩进自然折行，**100% 完整呈现原句，零省略号，零文本丢失**；
  * 配合底层的 `Strict 9-Line Hard Budget Guard`，即使原句折行，也绝不会触发宿主 10 行硬截断。

### 2. 根治问题二：句子拆分太随意，明明可以分两句，非要拆成四句
- **根因分析**：
  * 原先在 `src/chunker.ts` 中将 `maxChunkChars` 激进地定为 40 字符，且把逗号 `，` 作为强行子切分点；
  * 用户输入一两句带有标点的常规技术需求（约 40~60 字符），就会被生硬地打散成 4 个碎片切片 `[1/4 ⌥.] ~ [4/4 ⌥.]`；
  * 正如用户指出的：“分句只是为了防止超出宿主行数限制的防御措施，绝不是需要强推给用户的功能！”
- **修复方案**：
  * 将默认切分阈值从 40 字符大幅放宽至 **90 字符**；
  * **日常长句（<= 90 字符，相当于 40~50 汉字或 30 英文词）**：**100% 单卡完整呈现，0 切分，0 翻页烦扰**；
  * **中长篇幅（120~180 字符）**：贪婪聚合句子，严格限制在 **最多 2 页**，彻底根除每遇到一个句号就碎成一页的问题；
  * 取消对常规单句中逗号的随意切割，保留自然语意闭环。

---

## 🛠️ Verification & Test Health Matrix
- **`npm test`**: **35 / 35 套件全部通过 (100% Pass · 0 Fail)**
  * `tests/chunker.test.ts`: 验证用户实机犬吠案例不碎切、多短句合并为单卡、大长句合理拆分至 <= 2 页
  * `tests/engine.test.ts`: 验证长原句 100% 完整展示，严禁出现省略号 `...`
  * `tests/spotlight.test.ts`, `tests/capsule.test.ts`, `tests/commands.test.ts`, `tests/cache.test.ts`, `tests/shield.test.ts`, `tests/sovereignty.test.ts`, `tests/extension.test.ts`, `tests/tree-hanging-indent.test.ts`
- **`npm run typecheck`**: **0 TypeScript 报错**
- **构建产物**: `dist/` 双模块 (ESM + CJS + DTS) 同步编译生成。
