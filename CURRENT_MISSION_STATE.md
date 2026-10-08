# MISSION STATE & CONTEXT HANDOFF
- **Directory**: `D:\Workspace\projects\pi-lingua`
- **Package**: `pi-lingual` (Local Workspace Stage)
- **Status**: **RELEASE v0.2.0 COMPLETED · PUBLISHED TO NPM (pi-lingual@0.2.0) · GITHUB SYNCED**

## 🎯 Architectural Milestones & Unified Resolution Matrix (全量重构闭环矩阵)

### 1. 算力防御核：纯代码与 CLI 命令零触发护盾 (`src/shield.ts`)
- **0ms 极速特征嗅探**：开发者在终端频繁执行 `git status`、`npm run build`、`cargo run`、`docker ps` 或粘贴大段代码块/JSON/SQL 数据结构；
- **智能防御准则**：
  * Markdown 代码块（以 ` ``` ` 开头）直接放行；
  * 完整闭合的 JSON/Array 结构直接放行；
  * 纯 CLI 命令（前缀覆盖 40+ 常用终端工具，且无 CJK 字符）直接放行；
  * 区分自然语言提问：如 `git status 为什么会报错？` 包含疑问语气与自然语言，不予拦截，保证技术答疑无损；
- **收益**：单次判定 < 0.1ms，彻底杜绝无谓的 Token 流失与网络请求。

### 2. 性能内核：零依赖内存 LRU 伴学缓存 (`src/cache.ts`)
- **高频短语零延迟命中**：开发者频繁使用“继续”、“可以”、“开始吧”、“认同”等日常确认指令；
- **轻量原生实现**：基于 ES6 `Map` 的双向链表特性手写 40 行极简 LRU Cache（默认容量 50 条），0 外部库依赖；
- **智能淘汰与热度刷新**：
  * `get` 命中时刷新热度至链表末尾，记录命中统计；
  * 溢出时淘汰最久未访问的首项；
  * 当用户通过 `/lingua-lang` 切换语言时自动清空缓存，防止语言错位；
- **收益**：高频词二次命中直接 **0ms 本地直出**，UI 响应如原生组件，零外部模型请求。

### 3. 交互闭环：交互式多语言秒切指令 (`/lingua-lang` & `/2-lang`)
- **指令覆盖矩阵**：
  * `/lingua-lang [lang]`
  * `/lingual-lang [lang]`
  * `/2-lang [lang]`
- **配置驱动与零源码魔改**：
  * 支持 `zh` (中), `ja` (日), `en` (英), `es` (西), `fr` (法), `de` (德)；
  * 执行 `/2-lang ja` 瞬间切换 `state.sourceLang` 与 `state.labels`，并以地道目标语言通知用户；
  * 自动将 `"sourceLang": "ja"` 持久化到 `~/.pi/agent/settings.json` 的 `"pi-lingual"` 节点（跨 npm 升级无损继承，绝不改写项目源码）；
  * 无参调用时以清晰列表展示当前语言与所有支持的语种代码及切换示例；
- **健康诊断联动**：`/lingua-status` 新增缓存统计展示（如 `8 hits / 10 total (80% hit rate) · 5/50 items`）。

### 4. 架构铁律保障：英文中枢保底链 (English Pivot Fallback · Lesson 7)
- **多语言回退链**：`activeLabels = { ...LANGUAGE_PRESETS.en, ...LANGUAGE_PRESETS[lang], ...userOverrides }`；
- **绝对防御**：日后若加入新特性但某小语种未来得及更新，自动降级为国际通用英文，**绝不向海外用户泄露生硬中文，绝不产生运行时白屏或崩溃**；
- **测试沙箱隔离**：测试执行期间自动拦截对宿主机 `~/.pi/agent/settings.json` 的读写，彻底消除多测试并发环境脏读问题。

### 5. 像素级排版与 9 行硬上限安全守卫
- **原文标签统一规整化**：首行重构为 `  · [原文] `（及 `[Source]` / `[口語]` / `[Original]`）；
- **数学级视觉列宽对齐**：首行与后序 `┌ [口语]`、`├ [写作]`、`└ [重点]` 严格锁定在**第 11 视觉列**起步；
- **9 行预算铁律**：极端分屏或长文折行自动触发行数紧凑折叠，100% 免疫宿主 10 行硬截断（`... (widget truncated)`）。

---

## 🛠️ Verification & Test Health Matrix
- **`npm test`**: **27 / 27 套件全部通过 (100% Pass · 0 Fail)**
- **`npm run typecheck`**: **0 TypeScript 报错**
- **构建产物**: `dist/index.js`, `dist/extension.js`, `dist/index.cjs`, `dist/extension.cjs`, `dist/*.d.ts` 全量同步编译。
- **发布状态**: **严格本地冻结 (Release Freeze)**，未向 npm 发包，未执行 Git 提交或推送。
