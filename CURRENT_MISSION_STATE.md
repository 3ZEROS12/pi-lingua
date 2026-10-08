# MISSION STATE & CONTEXT HANDOFF
- **Directory**: `D:\Workspace\projects\pi-lingua`
- **Package**: `pi-lingual` (v0.2.1)
- **Status**: **FEATURE EXPANSION (SPOTLIGHT & CAPSULE) COMPLETED · 34/34 TEST SUITE PASS · 0 TS ERRORS · GITHUB SYNCED**

## 🎯 Architectural Milestones & Unified Resolution Matrix (全量重构与扩展矩阵)

### 1. 🔍 方向三：重点短语反光瞄准镜 (Spotlight Highlighting · `src/engine.ts`)
- **眼动认知效率飞跃**：解决“看懂了底部重点词，但需要扫视原句定位介词与动词搭配”的视觉摩擦；
- **自适应降序短语逆向提取 (`extractVocabPhrases`)**：从重点词条中剥离母语释义，按短语长度降序排列，长短语优先匹配（如 `on board with` 优先于 `board`）；
- **非破坏性 ANSI 点亮 (`spotlightPhrases`)**：在 `[口语]` 与 `[写作]` 主干中通过终端原生 ANSI 下划线 (`\x1b[4m...\x1b[24m`) 精准点亮搭配，零宽度膨胀，零颜色撕裂。

### 2. 💊 方向四：极端分屏单行胶囊折叠模式 (Compact Capsule Mode · `src/extension.ts`)
- **保护多分屏视野**：专为在 tmux / Windows Terminal 开启 3~4 分屏的极客开发者打造；
- **单行极简流 (`formatCapsuleLine`)**：将 6 行树状结构智能折叠为**严格 1 行的高密度流**：
  `⇄ [二 ⇄ two] 口: Totally on board with that... · 写: Acknowledged. Let's proceed... [Alt+.]`
- **双触发逻辑**：
  * **按需切换**：支持 `/2-compact` 或 `/lingua-compact` 随时切换，持久化存入 `settings.json`；
  * **自适应高度感应**：当终端物理行数不足 (`process.stdout.rows < 22`) 时自动启用胶囊折叠，避免遮挡代码。

### 3. 🛡️ 纯代码与 CLI 命令零触发护盾 (`src/shield.ts`)
- 0ms 智能特征嗅探纯 Shell 指令与代码块，自动放行，**0 Token 损耗**；包含疑问词的技术提问智能放行。

### 4. ⚡ 50 容量零依赖内存 LRU 伴学缓存 (`src/cache.ts`)
- 高频确认指令（“继续”、“认同”、“开始吧”、“可以”）二次命中直接 **0ms 本地直出**，零外部模型请求。

### 5. 🌐 交互式多语言秒切指令 (`/2-lang [lang]`)
- 一键切换母语 A，自动持久化写入 `settings.json`，跨版本升级无损继承，彻底废除在用户本地修改源码的脆弱做法。

### 6. 📐 像素级对齐与 9 行硬上限安全守卫
- 首行统一为 `  · [原文] `，与后续分支严格在第 11 列对齐；自适应折叠严守 9 行硬预算，100% 免疫宿主 10 行截断。

---

## 🛠️ Verification & Test Health Matrix
- **`npm test`**: **34 / 34 套件全部通过 (100% Pass · 0 Fail)**
  * `tests/spotlight.test.ts`: 验证短语提取、ANSI 下划线与树状分支瞄准
  * `tests/capsule.test.ts`: 验证单行胶囊格式化、列宽动态均衡截断与单行保底
  * `tests/commands.test.ts`: 验证 `/2-compact`、`/2-lang`、`/lingua-status` 全量指令
  * `tests/cache.test.ts`, `tests/shield.test.ts`, `tests/chunker.test.ts`, `tests/sovereignty.test.ts`, `tests/engine.test.ts`, `tests/extension.test.ts`, `tests/tree-hanging-indent.test.ts`
- **`npm run typecheck`**: **0 TypeScript 报错**
- **构建产物**: `dist/` 双模块 (ESM + CJS + DTS) 同步编译生成。
