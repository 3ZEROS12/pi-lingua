# pi-lingual

面向 Pi Coding Agent 的终端双语视窗与提示词转写引擎。

敲母语写代码。输入框上方实时显示地道技术口语与书面语；也可一键将提示词转写为规范技术英文，保持代码、注释与提交全英文规范。

[![npm version](https://img.shields.io/npm/v/pi-lingual?color=blue)](https://www.npmjs.com/package/pi-lingual)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Built for Pi](https://img.shields.io/badge/Built%20for-Pi%20Coding%20Agent-orange)](https://github.com/earendil-works/pi-coding-agent)
[![Tests](https://img.shields.io/badge/Tests-79%2F79%20Pass%20(100%25)-brightgreen)](tests/engine.test.ts)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Zero%20Error-blue)](tsconfig.json)

[English](./README.md) | **简体中文**

<p align="center">
  <img src="assets/hero.svg" alt="pi-lingual 终端伴学视窗交互实录" width="840">
</p>

---

## 一键安装

在 Pi 终端内运行：

```bash
pi install npm:pi-lingual
```

安装即可直接使用。默认直接调用当前会话的模型凭据，无需额外配置。

---

## 交互实录：双语境视窗

用母语输入需求，输入框上方即时浮现高保真卡片：

```text
  · [原文] 这个方案有点过度设计了，不如直接用标准库实现
  ┌ [口语] This feels a bit over-engineered; we'd be much better off sticking with the standard library.
  │        (感觉有点过度设计了，用标准库划算得多)
  ├ [写作] The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.
  │        (该方案引入了不必要的复杂度，建议优先采用原生标准库实现)
  └ [重点] over-engineered (过度工程化) · be better off (更合适) · stick with (沿用) · leverage (利用)
```

卡片包含三个核心维度：
* **`[口语]`**：北美硅谷团队的敏捷沟通表达。覆盖日常站会、Slack 交流、结对编程与常用短语动词。
* **`[写作]`**：严谨规范的技术书面语。覆盖 RFC 草案、PR 描述、代码审查与 Issue 讨论。
* **`[重点]`**：提炼的核心工程搭配与动词短语。在句中命中时自动显示微光下划线。

---

## 工作模式

终端中输入 `/2` 或 `/lingual` 随时平滑切换：

| 模式 | 你输入什么 | 发给 AI 的内容 | 视窗展示内容 | 适用场景 |
| :--- | :--- | :--- | :--- | :--- |
| **`original`** *(默认)* | 母语 *(如中文/日文)* | **母语原文** (0ms 透传) | 终端双语视窗 *(口语 + 写作 + 重点短语)* | 个人日常开发，顺便积累专业英文表达 |
| **`english`** *(转写)* | 母语 *(如中文/日文)* | **规范技术英文** | 预览生成的英文卡片 | 参与开源或跨国项目，确保代码和注释纯英文 |
| **`off`** | 任意输入 | **母语原文** | 不显示，插件静默 | 专注纯代码、不需要任何界面辅助时 |

### 混合意图嫁接（Hybrid Intent Grafting）
在 `english` 模式下，粘贴大段代码块或报错堆栈时，插件**绝不机械翻译代码**：
- **只翻人话**：仅提取指令前方的自然语言提问，转写为精准专业的技术英文。
- **原样拼接**：原始代码块、编译器诊断或报错堆栈 100% 原样保留，缝合在英文指令后方。
- **最终效果**：AI 收到地道规范的英文指令，同时拥有完整的代码与报错上下文。

---

## 视窗形态：完整树状 vs 单行胶囊

针对不同开发分屏环境，提供两套视窗形态：

<p align="center">
  <img src="assets/capsule-mode.svg" alt="pi-lingual 视窗形态切换" width="840">
</p>

1. **左导轨树状架构（默认）**：开放式单侧边框（`· ┌ ├ └`）。基于 Unicode UAX #11 计算列宽，窄分屏下也绝不断行重影；严格限制不超过 9 行，避免触发终端报错。
2. **单行胶囊模式（`/compact`）**：将视窗压缩为单行高密度流：
   ```text
   zh ⇄ en · [口] This feels over-engineered... │ [写] Proposed approach introduces unnecessary complexity...
   ```
   *在 tmux、WezTerm 等窄分屏下节省 80% 纵向空间。当终端高度不足 22 行时自动生效。*

---

## 多语言真实场景对照

核心功能是转英文，但也支持主流工程语言双向互转：

<p align="center">
  <img src="assets/multilingual-showcase.svg" alt="多语言工程矩阵" width="840">
</p>

| 源语言 | 场景 | 输入提示词 | [口语] 站会与交流 | [写作] RFC / PR 规范 |
| :--- | :--- | :--- | :--- | :--- |
| **🇨🇳 zh** | 架构评审 | `这个方案过度设计了，不如直接用标准库` | `This feels a bit over-engineered; let's stick with the standard library.` | `The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.` |
| **🇯🇵 ja** | 系统工程 | `メモリリークの可能性があるので、クリーンアップ処理を追加してください` | `There might be a memory leak here, so let's make sure we toss in some cleanup logic.` | `To prevent potential memory leaks, please incorporate explicit cleanup and resource disposal routines.` |
| **🇪🇸 es** | 代码审查 | `El PR es demasiado grande, sugiero dividirlo en dos cambios atómicos` | `This PR is huge — how about we split it into a couple of bite-sized PRs instead?` | `The PR scope is excessively broad; decomposing it into two discrete, atomic commits is advised.` |
| **🇩🇪 de** | 分布式系统 | `Wir müssen sicherstellen, dass diese Schnittstelle idempotent ist` | `We've gotta make sure this endpoint is strictly idempotent so duplicate requests don't bite us.` | `It is imperative to guarantee strict idempotency for this API endpoint to prevent duplicate mutations.` |

随时通过命令切换语言对：
```bash
/lang ja en      # 日语转英语
/lang es en      # 西班牙语转英语
/lang de en      # 德语转英语
/lang en ja      # 英语转日语
/lang zh ja      # 中文转日语
/lang 日语       # 支持自然语言中文别名
```

切换母语后，底栏、命令提示、视窗标签全部动态适配，无残留字符。

---

## 核心特性与工程机制

- 🛡️ **零上下文污染**：作为纯 TUI 悬浮视窗运行。不向会话历史写入翻译文本，不浪费 Token，不干扰长会话。
- ⚡ **即时响应与请求熔断**：敲回车瞬间立即清空旧卡片；新输入到达时，立刻用 `AbortController` 物理掐断上一轮未完成的后台网络请求。
- 📐 **终端排版不撕裂**：基于 Unicode UAX #11 严格计算 CJK 双列宽，配合行头标点禁则处理，杜绝孤立标点折行。
- ⚡ **命令行 0ms 护盾**：40+ 常见 CLI 命令（`git`, `docker`, `npm`, `cargo`）及代码块以 0ms 直通放行，不耗费任何请求。
- 🧠 **内存极速缓存**：内置 50 条 LRU 缓存，高频确认词（“继续”、“开始吧”、“认同”）0ms 瞬间直出。
- 🧹 **输入审查与脱敏**：自动剥离剪贴板截图路径（`pi-clipboard-*.png`），折叠长堆栈报错，提取核心自然语言。
- 🪶 **模型配额隔离**：默认跟随当前会话模型；也可单独指定轻量模型，保护主力推理配额。

---

## 常用命令

| 命令 | 别名 | 功能说明 |
| :--- | :--- | :--- |
| `/2 [sub]` | `/lingual [sub]` | 主命令总线：无参数平滑切模式，或路由子命令 |
| `/compact` | `/2-compact` | 切换树状视窗与单行胶囊模式 |
| `/lang <源> [目标]` | `/2-lang` | 切换语言对（如 `/lang ja en`、`/lang 日语`） |
| `/last` | `/2-last` | 重新浮现上一条伴学卡片 |
| `/2-model <id>` | `/lingual-model` | 指定轻量伴学模型（`auto` 恢复跟随主会话） |
| `/status` | `/2-status` | 查看运行状态与缓存命中率 |

*快捷键：`Alt+.`（下一页），`Alt+,`（上一页）。系统独立命令行：`lingual "输入需求"`。*

---

## 独立模型分流与隐私

### 保护主力模型额度
默认自动复用当前 Pi 会话凭证。

如果主任务在使用高配长思考主力模型，可将伴学转写交给轻量便宜的模型：
```bash
/2-model <轻量模型ID>       # 指定环境中的任意轻量高速模型
/2-model auto              # 恢复跟随当前会话主模型
```

也支持在 `~/.pi/agent/lingual.json` 中配置本地 Ollama 或私有接口：
```json
{
  "endpoint": "http://127.0.0.1:11434/v1/chat/completions",
  "model": "qwen2.5:3b"
}
```

> 🔒 **绝对隐私承诺**：`pi-lingual` **零外部依赖**（`dependencies: {}`），零遥测，不上传任何隐私数据。仅与你配置的模型端点通信。

---

## 深度设计与背景

- **[架构与终端排版规范](./docs/architecture.md)**：深入探讨 UAX #11 盒模型、标点行头禁则算法、排版高度预算及并发控制机制。
- **[为什么做 pi-lingual：写在代码背后的语感思考](./docs/philosophy.md)**：为什么输入法背单词往往收效甚微，以及抓住大模型代码生成的 5 秒等待间隙如何建立真实语感。

---

## 开源协议

MIT © [Jason Song](https://github.com/3ZEROS12)
