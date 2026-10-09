# pi-lingual

> **专为 Pi Coding Agent 打造的零侵扰开发者翻译与双语域沉浸伴学插件**  
> 在终端内用母语自然敲击提示词，输入框上方即时浮现北美硅谷敏捷口语与严谨工程技术写作，兼顾代码编写心流与日常语感积累。

[![npm version](https://img.shields.io/npm/v/pi-lingual?color=blue)](https://www.npmjs.com/package/pi-lingual)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Built for Pi](https://img.shields.io/badge/Built%20for-Pi%20Coding%20Agent-orange)](https://github.com/earendil-works/pi-coding-agent)
[![Tests](https://img.shields.io/badge/Tests-35%2F35%20Pass-brightgreen)](tests/engine.test.ts)

[English](./README.md) | **简体中文**

<p align="center">
  <img src="assets/hero.svg" alt="pi-lingual 终端伴学视窗交互实录" width="840">
</p>

---

## 现实工程摩擦

在借助终端 AI Coding Agent（Pi、Claude Code、Cursor CLI 等）进行日常结对开发时，以非英语为母语的开发者往往面临三重系统性摩擦：

1. **机械字面直译**：通用翻译引擎难以把握软件工程的真实语境。询问午饭安排时，机械翻译给出生硬的 `What to eat?`，而北美工程团队在 Slack 里的真实约饭表达是：`What are we feeling for lunch?`。
2. **后台静默翻译**：为了所谓的“无感”，部分插件在后台悄悄将输入转换为英文发送给大模型。大模型收到了英文，开发者的终端界面上却空空如也，白白浪费了在日常交互中高频接触地道表达的机会。
3. **会话历史污染**：侵入式插件直接将英文译文拼接在聊天记录或提示词尾部，导致后续每一轮推理都重复携带冗余文本，轮轮消耗宝贵的上下文窗口，稀释大模型的注意力。

`pi-lingual` 在终端输入框上方挂载一个独立的悬浮视窗，实时呈现日常口语俚语与规范技术书面双重语域，且绝不污染大模型的会话历史记录。

---

## 核心架构与物理机制

```text
  · [Original] 这个方案有点过度设计了，不如直接用标准库实现
  ┌ [Spoken]   This feels a bit over-engineered; we'd be much better off sticking with the standard library.
  │            (感觉有点过度设计了，用标准库划算得多)
  ├ [Written]  The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.
  │            (该方案引入了不必要的复杂度，建议优先采用原生标准库实现)
  └ [Vocab]    over-engineered (过度工程化) · be better off (更合适) · stick with (沿用) · leverage (利用)
```

### 1. 左导轨极简树状视窗（Trifecta Left-Rail Tree Branch）
在 Windows Terminal、Alacritty 与 iTerm2 中，中日韩（CJK）全角字符极易打破闭合矩形边框的宽度计算，产生严重的断行重影与光标错位。`pi-lingual` 彻底剔除了右侧与底部的闭合边框，改用开放式**左导轨树状分支**：
* **`  · [Original]`**：完整保留当前输入的原始文本，在第 11 列严格与后续分支对齐，提供清晰的认知锚点。
* **`  ┌ [Spoken]`**：北美硅谷敏捷团队的真实口语表达（站会沟通、Slack 交流、结对编程、缩写与常用短语动词），末尾附带母语真实语感。
* **`  ├ [Written]`**：符合现代规范的技术书面表达（RFC 草案、PR 描述、Issue 讨论、架构评审），末尾附带严谨技术语感。
* **`  └ [Vocab]`**：自适应提取的盲区短语与工程搭配，单行串联呈现。

### 2. 微光短语高亮（Spotlight Phrase Highlighting）
语感习得依赖于第一时间的视觉聚焦。`pi-lingual` 动态提取重点短语并在双语域句子中进行模式匹配，施加非破坏性 ANSI 下划线（`\x1b[4m...\x1b[24m`）。它在不改变文本实际字符宽度和大小写的前提下，让开发者在 0.1 秒内精准捕捉地道搭配与核心动词。

### 3. 单行胶囊模式（针对多分屏平铺的视野保护）
在 tmux、WezTerm 或多窗格平铺（3~4 分屏）以及紧凑终端窗口（行数 `< 22`）下，屏幕纵向高度极为珍贵。

<p align="center">
  <img src="assets/capsule-mode.svg" alt="pi-lingual 视窗形态切换" width="840">
</p>

通过 `/2-compact`（或 `/lingua-compact`）即可一键开启**胶囊模式**，将原本 6 行的树状视窗折叠为极致平铺的单行流：
```text
⇄ [two ⇄ 二] · [Spoken] This feels over-engineered... │ [Written] Proposed approach introduces unnecessary complexity...
```
在保留双语域核心表达的同时，节省超过 80% 的终端纵向空间，保护代码编辑核心视野。

### 4. 代码与命令行防护盾牌（0ms 旁路直通）
终端日常操作充斥着大量 Git 命令、依赖安装与单行代码。对 `git commit -m "fix"` 或 `const x = 1` 触发翻译不仅徒增网络延迟，而且白白浪费模型算力。

`pi-lingual` 内置专用的启发式盾牌（`src/shield.ts`），实现 **0ms 延迟、0 Token 消耗**的即时放行：
* **40+ 终端工具前缀**：`git`、`npm`、`pnpm`、`yarn`、`cargo`、`docker`、`kubectl`、`make`、`python`、`curl` 等；
* **多语言代码起始语句**：`const`、`function`、`class`、`import`、`def`、`impl`、`SELECT` 等；
* **数据结构与围栏**：Markdown 代码块、JSON/YAML 结构体以及纯字母标识符；
* **智能保留自然语言提问**：包含命令名的自然语言提问（如 `git status 为什么报错？`）自动精准识别并放行给翻译引擎。

### 5. 零依赖内存 LRU 缓存（0ms 瞬间回显）
在日常结对编程中，高达 40% 的提示词为高频确认类短语（“继续”、“认同”、“开始吧”、“可以”、“明白”）。

`pi-lingual` 搭载轻量高效的 50 容量会话级 LRU 缓存（`src/cache.ts`）。命中重复输入时，完全跳过大模型调用，**0ms 瞬间浮现伴学卡片**，0 网络请求，0 Token 消耗。

### 6. 语义分块与 9 行绝对安全红线
宿主终端的小部件普遍存在严格的 10 行折叠截断限制。`pi-lingual` 采用语义驱动的原子分块保障阅读体验：
* **常规简短输入（<= 90 字符，占日常 90%）**：整句聚合为单张卡片，界面极简干净，**不出现多余的分页快捷键提示**；
* **长句与复杂段落**：沿自然标点（`。！？；\n` 或 `.!?\n`）进行原子切分，每一页严格完整保留 `[Original]` + `[Spoken]` + `[Written]` + `[Vocab]` 四位一体；
* **无冲突键盘翻页**：使用 **`Alt+.`**（下一页）与 **`Alt+,`**（上一页）丝滑翻页，不干扰编辑器光标与输入态；
* **严格安全红线**：整卡渲染严格约束在 `<= 9` 行之内，彻底杜绝宿主截断。

---

## 真实世界软件工程多语种矩阵

`pi-lingual` 专为全球现代软件工程协同打造，在多语种间对称双向运作：

<p align="center">
  <img src="assets/multilingual-showcase.svg" alt="真实世界软件工程多语种矩阵" width="840">
</p>

| 语言流向 | 真实工程协作场景 | 原始输入 | [Spoken] 敏捷口语语域 | [Written] 规范技术书面语域 |
| :--- | :--- | :--- | :--- | :--- |
| **🇨🇳 zh ➔ 🇺🇸 en** | **架构设计评审**<br>*(技术折衷讨论)* | `这个方案有点过度设计了，不如直接用标准库实现` | `This feels a bit over-engineered; we'd be much better off just sticking with the standard library.` | `The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.` |
| **🇯🇵 ja ➔ 🇺🇸 en** | **底层系统工程**<br>*(资源释放与内存优化)* | `メモリリークの可能性があるので、クリーンアップ処理を追加してください` | `There might be a memory leak here, so let's make sure we toss in some cleanup logic.` | `To prevent potential memory leaks, please incorporate explicit cleanup and resource disposal routines.` |
| **🇪🇸 es ➔ 🇺🇸 en** | **代码审查 (CR)**<br>*(Git 原子提交拆分)* | `El PR es demasiado grande, sugiero dividirlo en dos cambios atómicos` | `This PR is huge — how about we split it into a couple of bite-sized PRs instead?` | `The PR scope is excessively broad; decomposing it into two discrete, atomic commits is advised.` |
| **🇩🇪 de ➔ 🇺🇸 en** | **分布式系统设计**<br>*(API 接口幂等性)* | `Wir müssen sicherstellen, dass diese Schnittstelle idempotent ist` | `We've gotta make sure this endpoint is strictly idempotent so duplicate requests don't bite us.` | `It is imperative to guarantee strict idempotency for this API endpoint to prevent duplicate mutations.` |

---

## 配置驱动的母语最高主权

切换伴学母语无需修改任何源码，无需重新编译，更无需重启终端。

### 即时无缝切换
在任意正在运行的 Pi 会话中直接键入 `/2-lang [code]`（或 `/lingua-lang [code]`）：
```bash
/2-lang ja   # 秒切日语母语伴学
/2-lang en   # 秒切英语母语伴学（面向学习其他语言的英文开发者）
/2-lang zh   # 恢复中文母语伴学
```
*当前官方支持：`zh`、`ja`、`en`、`es`, `fr`, `de`。*

### 零残留持久化
用户配置持久化保存在用户目录的 `~/.pi/agent/settings.json`（`"pi-lingual"` 节点下）：
```json
{
  "pi-lingual": {
    "sourceLang": "ja",
    "compact": false
  }
}
```
* **抵御版本覆盖**：后续执行 `pi install npm:pi-lingual` 升级插件时，个人偏好稳如磐石；
* **母语绝对主权**：当切换为英语或日语时，插件界面彻底清除中文残留，所有命令描述、状态指示与系统通知均自动呈现为 Language A 的原生地道文本；
* **零残留回滚**：当配置项恢复默认值时，物理移除对应键，绝不向配置文件写入无用脏数据。

---

## 零配置原生模型执行与算力解耦

`pi-lingual` 直接运行在 Pi 宿主进程的大模型调度总线之上，无需订阅用户额外购买或配置 API Key：

### 1. 默认：继承 Pi 宿主会话模型（零配置，开箱即用）
* **原理**：调用 `ctx.modelRegistry.streamSimple()` 直接复用当前终端会话已经认证的模型凭据；
* **优势**：0 配置，0 额外账单，0 密钥泄露风险。安装后回车即可体验。

### 2. 算力解耦（保护昂贵的高阶推理配额）
当会话主模型为 Claude 3.5 Sonnet 或 o1 等高阶昂贵模型时，为了避免伴学翻译白白消耗主模型的按次/每分钟调用配额，可一键挂载轻量伴学模型：
```bash
/lingua-model gemini-3.8-flash
```
或随时重置为自动跟随：
```bash
/lingua-model auto
```

### 3. 可选：本地 0 成本离线模型（Ollama · 0 云端消耗）
如需在完全离线或敏感环境运行，可在本地启动 Ollama 并运行轻量 3B 模型（如 `qwen2.5:3b`），在 `~/.pi/agent/lingua.json` 中配置：
```json
{
  "endpoint": "http://127.0.0.1:11434/v1/chat/completions",
  "model": "qwen2.5:3b"
}
```

---

## 完整命令与快捷键速查表

### 终端会话内交互命令
| 命令 | 常用别名 | 功能说明 |
| :--- | :--- | :--- |
| `/2` | `/lingua`, `/lingual`, `/translate` | 循环切换运行模式：`[原文] ➔ [英文] ➔ [关]` |
| `/2-lang <lang>` | `/lingua-lang`, `/lingual-lang` | 秒切伴学母语（支持 `zh`, `ja`, `en`, `es`, `fr`, `de`） |
| `/2-compact` | `/lingua-compact` | 切换单行胶囊模式与完整树状视窗 |
| `/2-model <id>` | `/lingua-model` | 查看或切换轻量伴学模型（`auto` 或指定模型 ID） |
| `/2-status` | `/lingua-status` | 查看完整系统健康诊断、语言流向与 LRU 缓存统计 |
| `/2-last` | `/lingua-last` | 在终端中重新浮现上一条伴学卡片 |
| `/2-agent` | `/lingua-agent` | 查看伴学定制与母语切换指南 |

### 键盘快捷键（伴学卡片浮现时）
* **`Alt+.`** (`>` 键)：切换到下一个语义分块卡片；
* **`Alt+,`** (`<` 键)：切换到上一个语义分块卡片。

### 独立系统 CLI
在任何 Bash、Zsh 或 PowerShell 中直接使用全局 CLI：
```bash
2 "这个方案有点过度设计了，不如直接用标准库实现"
lingua "内存占用过高，排查一下是否有未释放的连接池句柄"
```

---

## 安装与快速上手

### 作为 Pi 扩展安装
```bash
# 推荐：直接通过 npm 安装
pi install npm:pi-lingual

# 或从 GitHub 安装
pi install git:github.com/3ZEROS12/pi-lingua
```

### 本地开发与验证
```bash
git clone https://github.com/3ZEROS12/pi-lingua.git
cd pi-lingua
npm install
npm test            # 35/35 套件全部通过
npm run typecheck   # 0 TypeScript 错误
```

---

## 许可证

MIT © [Jason Song](https://github.com/3ZEROS12)
