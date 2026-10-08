# MISSION STATE & CONTEXT HANDOFF
- **Directory**: `D:\Workspace\projects\pi-lingua`
- **Package**: `pi-lingual` (v0.2.3)
- **Status**: **DEEP CODE CLEANUP & ARCHITECTURAL PURGE COMPLETED · 35/35 TEST SUITE PASS · 0 TS ERRORS · GITHUB SYNCED**

## 🎯 Code Optimization & Architectural Purge Matrix (代码级冗余清洗与过时设计彻底更替)

### 1. 废除死代码与孤儿常量 (`src/extension.ts`)
- **清洗项目**：删除了早期版本遗留下来的 `DEFAULT_LABELS` 硬编码对象；
- **架构对齐**：当前多语言全部收敛在 `src/presets.ts`，运行时通过 `resolveLabelsForLang` 结合英文中枢保底链动态分发，`DEFAULT_LABELS` 属于 100% 毫无用处的孤儿冗余。

### 2. 彻底废除旧版“本地改源码重新编译”叙事 (`src/presets.ts` & `AGENTS.md`)
- **清洗项目**：旧版 `/lingua-agent` 指令文案及 `notifyAgentHelp` 残留着“Agent 帮你完成问卷、修改本地源码并重新编译重启终端”的过时逻辑；
- **架构对齐**：全量更新为现代的“配置驱动（Config-Driven）”叙事——告知用户直接通过 `/lingua-lang <lang>` 即可 0ms 瞬间切换 6 种官方语言并自动持久化，免重启、免改源码，消除用户的认知错位。

### 3. 命令与代码嗅探逻辑单一真实源收敛 (`src/engine.ts` ➔ `src/shield.ts`)
- **清洗项目**：删除了 `engine.ts` 中写死的 `COMMON_TERMINAL_COMMAND_PREFIXES` (17项) 和 `CODE_STATEMENT_STARTERS` (13项)；
- **架构对齐**：统一收敛由 `src/shield.ts` 的 `shouldShieldBypass` 全权负责（单一真实源 Single Source of Truth），避免两套前缀字典不同步的潜在风险。

### 4. 彻底解绑旧插件历史包袱 (`src/engine.ts` 中的 `translate.json`)
- **清洗项目**：`loadUserConfig` 移除了对历史遗留文件 `~/.pi/agent/translate.json` 的隐式读取；
- **架构对齐**：全面收敛至规范的 `settings.json`（`"pi-lingual"` 节点）和 `lingua.json`，杜绝旧项目测试凭据和脏数据的意外污染。

### 5. 零残留对称文件清理 (`src/extension.ts` 中的 `saveUserLinguaConfig`)
- **清洗项目**：修复了恢复默认值（`compact: false` 等）时的孤儿文件残留问题；
- **架构对齐**：当 `lingua.json` 配置项全部清空为默认值时，物理执行 `fs.unlinkSync` 干净删除文件，严格贯彻 Trifecta Invariant 1（零残留回滚，零遗憾成本）。

---

## 🛠️ Verification & Test Health Matrix
- **`npm test`**: **35 / 35 套件全量通过 (100% Pass · 0 Fail)**
- **`npm run typecheck`**: **0 TypeScript 报错**
- **构建产物**: `dist/` 双模块 (ESM + CJS + DTS) 同步编译生成。
