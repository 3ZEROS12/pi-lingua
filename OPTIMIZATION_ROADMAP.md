# pi-lingua 优化重构与发布门禁清单 (Optimization Roadmap & Release Gate)

> ⚠️ **发布门禁状态 (Release Gate Status)**: `STAGED FOR OPTIMIZATION (未优化完成，严禁直接发布)`  
> **归属工程池**: `D:/Workspace/projects/pi-lingua`  
> **对齐项目**: `anchor`, `toolflow`, `pi-tui-status-beautifier`

---

## 1. 当前版本特性与架构基线 (v0.1.0-alpha.1)

已完成以下核心突破与工业级加固（8/8 自动化全绿测试验讫）：
1. **中英·雅思 Band 8.0 三维语感点睛**：口语（IELTS Speaking Band 8.0+ 自然连贯）+ 写作（IELTS Writing Task 2 严谨学术）+ 重点（1~2 个关键高频搭配/短语动词及中文释义），内置 3 组黄金 Few-Shot 锚点与代码原样防御。
2. **独立暗调微边框卡片视窗 (Left-Rail Open Card)**：
   - 采用带微边框的独立卡片设计（`┌─ ⇄ Lingua 伴学视窗` / `│` / `└─`），彻底消除与 AI 回复正文的视觉混淆；
   - 采用右侧开放边界设计，100% 避免中日韩（CJK）字符宽度对齐偏差引发的终端光标鬼影；
   - 伴学模式下 0ms 立即放行原始输入（`res.action === "continue"`），绝不卡死主会话交互；
   - 引入单调递增 `currentRequestId`，HUD 渲染前强校验版本号，彻底根除连续输入时的覆盖脏写（Stale Overwrite）与幽灵 HUD 复活。
3. **母语 A 拥有最高统治权 (Primary Language Sovereignty)**：
   - 默认 A=中文 ➔ B=英文雅思；
   - 当定制为任意语言对 A ➔ B（如 A=英文 ➔ B=日文）时，母语 A 必须彻底替换插件所有标签（`[Spoken]`, `[Written]`, `[Vocab]`）、状态栏和通知，零中文残留。
4. **语言双向感知触发 (Bidirectional Trigger)**：
   - 支持非英语母语自然触发；
   - 支持英语母语学外语时识别英文自然语言句子，并严格排除 Git/NPM 命令与代码关键字。
5. **Agent-Native 自主访谈定制协议 (`AGENTS.md`)**：
   - 用户仅需说一句“我想定制伴学插件”，Agent 自动用用户的母语发起 4 维诊断访谈；
   - 幕后自动合成、写入、测试并打包；
   - 强制警告提醒用户退出终端重启 `pi` 以刷新 Node.js ESM 模块内存缓存。

---

## 2. 正式发布前必须攻坚的发布门禁清单 (Pre-Release Checklist)

- [ ] **Task 1: 高频输入防抖 (Debounce & Throttling)**
  - 在 `InputEvent` 拦截层增加 150ms 极简防抖，避免无意义的并发请求。
- [ ] **Task 2: 离线健康自检与零打扰穿透 (Health Probe & Silent Pass-through)**
  - 启动时做一次 50ms 的轻量 ping 探测；若网关不可达，自动静默禁用并在状态栏标记 `⇄ 离线`，绝不给用户弹任何阻断性报错。
- [ ] **Task 3: 代码与路径语法树保护 (AST-based Syntax Shield)**
  - 完善代码保护机制，确保用户在敲带有长段代码、SQL、正则的中文需求时，代码 100% 原样透传，只润色中文部分。
- [ ] **Task 4: 高频雅思双模词库回归测试集 (Benchmark Suite)**
  - 建立 `tests/corpus.json`，收录 50 组覆盖日常敏捷口语与 PR/RFC 雅思写作的典型指令，跑自动化断言确保每次 Prompt 调整不会发生质量劣化（Regression）。
- [ ] **Task 5: tsup 纯净单文件打包与 npm 发布验讫**
  - 配置 `tsup` 输出自包含的 `dist/extension.js` 和 `dist/index.js`，零外部未打包运行时依赖，确保任何用户 `pi install npm:@3zeros12/pi-lingua` 秒级可用。
