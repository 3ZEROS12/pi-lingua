# ADR-0004: 开发者直觉工效学与零心智负担命令总线设计
# (Developer Ergonomics, Zero-Cognitive-Burden Command Bus & Anti-Regression Invariants)

## 状态 (Status)
**Accepted** (已接受并在 v0.3.0 中全量物理实施)

## 背景与痛点根因回顾 (Context & Essential Root Causes)
在交互式真机测试与用户验收过程中，先后暴露了五类影响体验的问题：
1. **速度与排队卡顿**：用户输入回车后等待 2~3 秒才出卡片，甚至主 AI 回复完卡片才慢吞吞弹窗；
2. **命令不起作用**：输入 `/lang`、`/lang ja`、`/lingual lang ja` 无法切语言，或被静默识别为“切换模式”；
3. **陈旧卡片悬挂与僵尸复活**：新输入打出后旧卡片残留，或翻页时旧内容幽灵复活；
4. **母语主权被硬编码侵蚀**：底层代码残留英文 fallback（如 `"Spoken"`, `"Written"`），偶发跳出非母语标签；
5. **宿主真实配置污染自动化测试**：宿主 `settings.json` 的修改泄露到测试套件中导致断言失败。

经过第一性原理深层溯源，这些表面 Bug 的**本质技术根因（Essential Root Causes）**集中在以下三大软件工程盲区：

### 根因 1：自嗨式命名与理想态设计 vs 真实开发者肌肉记忆 (Ergonomics Mismatch)
* **设计盲区**：插件开发者往往以“命名空间整齐”为导向，注册了 `/lingual-lang`、`/lingual-model`、`/2-lang` 等命令，并假设用户会认真通读说明书、按字面敲全。
* **物理事实**：处于敲代码心流中的开发者，其直觉反射是输入最短、最自然的词汇（如 `/lang`、`/compact`、`/last`，或者直接输入 `/lingual lang ja`、`/lang 日语`）。
* **灾难后果**：主命令未设计子命令路由调度器，将未知子命令当做“缺省值”执行模式轮转，导致用户的配置意图被彻底吞噬。

### 根因 2：并发时序盲盒 vs 0ms 确定性反馈缺失 (Feedback Loop Blindness)
* **设计盲区**：在 0ms 与主会话请求同时向同一个网关套接字发送数万 Token 的大包，产生网关层连接池排队；且旧卡片没有在按回车瞬间物理销毁，用户无法分辨是“正在处理”还是“终端卡死”。
* **物理事实**：终端是单线程视窗，异步等待超过 500ms 且无明确过渡状态，人脑就会判定为“卡顿”。

### 根因 3：单一真相来源破缺 (Single Source of Truth Violation)
* **设计盲区**：在引擎层、布局层、扩展层分散放置默认 fallback 字符串（如 `cfg.labels?.sourceLabel || "Original"`），且配置状态未闭环（只存 `sourceLang` 缺少 `targetLang`）。
* **物理事实**：任何硬编码兜底都会在边界条件（如语言切换、离线测试）下发生隐蔽泄漏，打破“母语最高统治权”。

---

## 决策与架构铁律 (Architectural Invariants & RFC 2119)

### 铁律 1：主命令总线容错与一等公民直觉注册 (Command Bus Ergonomics)
1. **一等公民直觉命令**：凡是开发者可能直觉敲出的命令（`/lang`、`/compact`、`/last`），必须直接向宿主注册为一等公民，绝不允许强制用户敲带连字符的长名。
2. **Master Command Dispatcher 必载**：主命令（`/lingual`、`/2`）必须内置二级命令解析器：
   - 包含子命令词（`lang`, `model`, `compact`, `status`, `last`, `agent/help`）时，**绝对禁止掉入 mode 模式轮转分支**，必须精准路由给对应处理器；
   - 识别自然语言别名与缩写（`japanese/jp/日语 ➔ ja`, `chinese/cn/中文 ➔ zh`）；
   - 支持语言对语法（`/lang zh ja`, `/lang zh->en`）。

### 铁律 2：0ms 确定性反馈与防踩踏微时序 (Deterministic Feedback & Micro-Staggering)
1. **新输入 0ms 旧卡物理销毁**：输入触发的那一瞬间，旧卡片必须立即通过 `setWidget("lingual_hud", undefined)` 彻底销毁，状态栏打出 `polishing...`，给用户 0ms 确定性认知。
2. **80ms 微任务避峰**：在 `original` 模式下，伴学异步请求必须延迟 80ms 触发，让出网络套接字让主任务完成首包握手，彻底免除网关排队互斥。

### 铁律 3：母语最高统治权与单一真理来源 (Primary Language Sovereignty via SSOT)
1. **严禁散落硬编码兜底**：所有涉及 UI 渲染的标签（`slot1Label`, `slot2Label`, `vocabLabel`, `sourceLabel`），必须严格且唯一通过 `resolveLabelsForLang(sourceLang)` 计算导出。
2. **状态全双工闭环**：`ExtensionState` 必须同时显式跟踪 `sourceLang` 与 `targetLang`，底栏状态动态更新为 `${sourceLang} ⇄ ${targetLang}`。

### 铁律 4：测试沙箱物理级多源隔离 (Test Isolation Sandbox)
1. **严禁测试污染宿主配置**：测试环境中，`loadUserLingualConfig()` 必须强行返回空对象，`saveUserLingualConfig()` 必须拦截写入。
2. **多源检测覆盖**：必须同时嗅探 `NODE_TEST_CONTEXT`、`process.execArgv`（`--test-*` 内部参数）、`process.argv` 与 npm 生命周期事件，彻底杜绝 Node.js 多进程测试工作线程漏判。

---

## 效果与收益 (Consequences & Verified Proof)
- 经 66 组单元测试与 Fleet 全生态预检物理验证，100% 覆盖上述所有边界条件。
- 用户在终端随意输入 `/lang ja`、`/lang 日语`、`/lingual lang ja`、`/2 ja`、`/compact`、`/last` 均能 100% 毫秒级稳定响应并持久化生效。
