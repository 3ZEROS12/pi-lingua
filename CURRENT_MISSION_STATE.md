# MISSION STATE & CONTEXT HANDOFF
- **Directory**: `D:\Workspace\projects\pi-lingua`
- **Package**: `pi-lingual` (v0.2.8)
- **Status**: **BRAND STANDARDIZATION & CLEAN BOTTOM LABEL (A ⇄ B) COMPLETED · 43/43 TESTS PASS · 0 TS ERRORS · FULL PHYSICAL DEPLOYMENT**

---

## 🎯 品牌规范与底栏标签纯净化改造 (Brand & UI Chrome Standardization)

### 1. 项目全局品牌规范命名为 `pi-lingual`
- **目的**：严防与社区已有库发生混淆或抄袭感知，所有对外与对内引用（包名、代码、配置、通知、文档）统一规范为 **`pi-lingual`**。

### 2. 状态栏底部标签标准化为 `A ⇄ B`（如 `zh ⇄ en`）
- **根除多余元素**：彻底剔除过去错误包含的“第二个元素模式词”（如“原文”、“Original”、“英文”等）；
- **呈现格式**：
  - 开启态（`original` / `english`）：高亮显示纯净极简的 `${sourceLang} ⇄ ${targetLang}`（例如 **`zh ⇄ en`**、`ja ⇄ en`、`en ⇄ ja`）；
  - 关闭态（`off`）：暗色显示 `${sourceLang} ⇄ ${targetLang}: off`；
- **全景对齐**：
  - `src/presets.ts` 中的所有语言预设全部更新；
  - `src/extension.ts` 中的 `updateFooter` 状态栏刷新函数全面标准化；
  - `assets/hero.svg`、`assets/capsule-mode.svg`、`README.md` 与 `README_zh.md` 100% 像素级对齐。

---

## 🛠️ 物理执行与版本交付数据
- **测试套件**：**43 / 43 套件全量通过 (100% Pass · 0 Fail)**
- **TypeScript 静态检查**：`npm run typecheck` **0 错误、0 警告**
- **npm 版本号**：`pi-lingual@0.2.8` (`package.json`)
- **宿主物理覆盖**：全量产物覆盖至 `C:\Users\Jason\.pi\agent\npm\node_modules\pi-lingual`
