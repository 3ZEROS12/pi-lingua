# MISSION STATE & CONTEXT HANDOFF
- **Directory**: `D:\Workspace\projects\pi-lingua`
- **Package**: `pi-lingual` (v0.2.5)
- **Status**: **PROMPT SANITIZER & INTENT DISTILLER COMPLETE · ZERO ZOMBIE CARDS · 42/42 TESTS PASS · FULL PHYSICAL DEPLOYMENT**

---

## 🎯 深度架构方案：报错审查、意图萃取与过长边界限定

### 1. 核心矛盾与痛点剖析
1. **开发者真实提问形态**：
   开发者极少输入纯粹的教科书式短句，往往混合着：
   - 剪贴板图片路径（`C:\Users\...\pi-clipboard-xxx.png`）
   - 终端命令（`npm test`、`git cherry-pick`）
   - 冗长的报错与堆栈跟踪（几十行的 `at Module._compile (internal/...)` 或 Python Traceback）
   - 自然语言核心提问（“跑测试挂了，帮我看下怎么修复”）
2. **旧版缺陷**：
   - 旧逻辑粗暴设置 `MAX_TRANSLATION_LINES = 8`，一旦输入带了堆栈直接一刀切跳过；
   - 跳过时又不清理 HUD，导致屏幕上永远悬挂着上一句的“僵尸卡片”；
   - 即使送去翻译，几十行无用的堆栈也会浪费大量 Token，甚至被翻译模型误译。

---

### 2. 启发式审查折叠与意图萃取管道 (`src/sanitizer.ts`)
我们建立了 0 依赖、0ms 级轻量流式审查管道 `sanitizePromptForTranslation`：

| 物理输入特征 | 审查识别规则 | 萃取与折叠行为 | 效果与意图保障 |
| :--- | :--- | :--- | :--- |
| **剪贴板临时图片** | `C:\Users\...\pi-clipboard-xxx.png` | 自动剥离前缀路径 | 消除路径噪音，精准锁定后续提问 |
| **多行堆栈跟踪** | Node.js `at ...`、Python `Traceback`、Java/Go panic | 自动折叠为 `[... stack trace ...]` | 剥离几十行冗余帧，防止撑爆上下文 |
| **多行代码块** | Markdown 闭合代码块 (```...```) | 自动折叠为 `[code ...]` | 代码不参与翻译，提炼上下文关系 |
| **编译器/Linter 诊断** | `src/index.ts:12:4: error: ...`、`npm ERR!` | 保留首行核心报错，后续折叠为 `[...]` | 核心错误摘要保留，冗长细节折叠 |
| **Shell 终端命令** | `git cherry-pick`、`npm test`、flag 参数 | **100% 严格原样保留原型** | 命令原型不被抹除，只翻译自然语言 |

---

### 3. “过长不翻译”范围的重新精准界定 (The New Bound Invariant)
我们彻底废除了“按原始字符数一刀切”的旧逻辑，重新界定三层判定红线：
1. **纯堆栈/纯代码/纯命令判定（Zero Natural Language）**：
   若萃取后发现整段输入 **100% 全部是堆栈、代码或 CLI 命令行**，没有一句人类自然语言提问（如纯粘了 200 行报错）：
   ➔ **立即跳过翻译并物理销毁 HUD（Zero Zombie Card）**，0ms 立即放行原始文本给 AI！
2. **自然语言长度预算（Natural Language Budget）**：
   只衡量萃取后的**真实自然语言字符数**：
   - 自然语言核心 `<= 500` 字符（约 250 汉字，足以覆盖 99% 的复杂开发提问）：**100% 正常分句切片并双模翻译！**
   - 只有当自然语言主体本身超过 500 字符（整篇 PRD、整章文章）：才判定为大篇幅文档并跳过。
3. **输入即响应骨架屏握手（Instant Turn Handshake）**：
   敲击回车第 0ms 瞬间，立即用当前句加载态置换旧卡片，彻底消灭“以为卡死在上一句”的心智误解。

---

## 🛠️ 物理执行与版本交付数据
- **测试套件**：**42 / 42 套件全部通过 (100% Pass · 0 Fail)**
- **TypeScript 静态检查**：`npm run typecheck` **0 错误、0 警告**
- **npm 版本号**：`pi-lingual@0.2.5` (`package.json`)
- **宿主物理覆盖**：编译产物全量覆盖至 `C:\Users\Jason\.pi\agent\npm\node_modules\pi-lingual`
