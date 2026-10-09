# MISSION STATE & CONTEXT HANDOFF
- **Directory**: `D:\Workspace\projects\pi-lingua`
- **Package**: `pi-lingual` (v0.3.0)
- **Status**: **100% PURE LINGUAL STANDARDIZATION COMPLETE · ZERO LINGUA RESIDUE · 44/44 TESTS PASS · 0 TS ERRORS · FULL PHYSICAL DEPLOYMENT**

---

## 🎯 全盘“去 lingua 化”与 100% 纯净 `lingual` 标准化总决算

遵照绝对权威指令，本项目已在地毯式清理中将所有命令、配置、类型、CLI、注释与文档**彻底去除任何 `lingua` 残留，100% 统一定标为 `lingual`**：

### 1. 终端 Slash 命令体系（彻底删除所有 `/lingua*` 注册）
* **仅保留纯正的 `lingual` 族系命令**：
  * `/lingual [original|english|off]`：设置或循环切换伴学模式
  * `/lingual-mode <original|english|off>`：显式设定模式
  * `/lingual-lang <zh|ja|en|es|fr|de>`：切换母语
  * `/lingual-compact`：切换单行胶囊模式
  * `/lingual-model <id|auto>`：切换或检查伴学模型
  * `/lingual-status`：系统健康诊断与缓存统计
  * `/lingual-last`：回看/重现上一条伴学卡片
  * `/lingual-agent`：伴学定制与母语指南
  *(仅保留便捷简写 `/2` 系列映射，所有历史 `/lingua*` 命令已被彻底物理拔除)*

### 2. 状态栏、UI 与存储键名纯净化
* **状态栏 Key**：`ctx.ui.setStatus("lingual", ...)`
* **Widget Key**：`ctx.ui.setWidget("lingual_hud", ...)`
* **用户配置文件**：`~/.pi/agent/lingual.json`
* **全局配置节点**：`settings.json` 下的 `"pi-lingual"`
* **环境变量**：`LINGUAL_ENDPOINT`、`LINGUAL_API_KEY`、`LINGUAL_MODEL`

### 3. 类型与核心类名标准化
* `LingualMode`
* `LingualI18nLabels`
* `LingualConfig`
* `LingualResult`
* `LingualLruCache` / `globalLingualCache`
* `LINGUAL_SYSTEM_PROMPT`
* `stripLingualAnnotation`
* `loadUserLingualConfig` / `saveUserLingualConfig`

### 4. CLI 独立可执行程序
* 入口正式重命名为 `bin/lingual.js`（已物理删除 `bin/lingua.js`）
* `package.json` 中的 `bin` 字段统一为 `"lingual": "bin/lingual.js"`

---

## 🛠️ 物理执行与版本交付数据
- **测试套件**：**44 / 44 套件全量通过 (100% Pass · 0 Fail)**
- **TypeScript 静态检查**：`npm run typecheck` **0 错误、0 警告**
- **npm 版本号**：`pi-lingual@0.3.0` (`package.json`)
- **宿主物理覆盖**：全量编译产物、源码与 CLI 已物理同步至 `C:\Users\Jason\.pi\agent\npm\node_modules\pi-lingual`
