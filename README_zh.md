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

```text
  · [原文] 这个方案有点过度设计了，不如直接用标准库实现
  ┌ [口语] This feels a bit over-engineered; we'd be much better off sticking with the standard library.
  │        (感觉有点过度设计了，用标准库划算得多)
  ├ [写作] The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.
  │        (该方案引入了不必要的复杂度，建议优先采用原生标准库实现)
  └ [重点] over-engineered (过度工程化) · be better off (更合适) · stick with (沿用) · leverage (利用)
```

## 一键安装

在 Pi 终端内运行：

```bash
pi install npm:pi-lingual
```

安装即可直接使用。默认直接调用当前会话的模型凭据，无需额外配置。

---

## 核心价值：为什么需要它？

在终端中使用 AI 编写代码时，开发者每天都会遇到四个非常具体的痛点：

### 1. 团队与开源代码库必须是全英文
参与开源项目或跨国团队时，代码注释、Commit Message 和 PR 描述必须统一为纯英文。
用中文向 AI 提问，AI 很容易产出带有中文注释的代码或中文解释。每次提交前，你都得手动检查并修改一遍。
开启 `english` 模式后：你在终端里用最习惯的母语随手提问，插件自动转写为专业技术英文下发给 AI。**AI 产出的代码、注释和说明天然保持统一的纯英文规范。**

### 2. 抓住大模型生成代码的 5 秒空隙
敲下回车后，大模型通常需要 5 到 15 秒来生成代码或重构逻辑。
这段时间很微妙：切出去刷网页太短，盯着屏幕发呆又容易走神。
`pi-lingual` 在输入框上方开辟了一个低认知负荷的语感视窗。利用等待代码生成的短暂间隙，一眼看清同一句话在日常站会（Slack/Standup）与正式技术规范（RFC/PR/Review）中的真实表达，顺手积累地道语感。

### 3. 零上下文污染，不浪费一个多余 Token
传统翻译工具通常把翻译文字追加在用户 Prompt 后面发给模型。
在多轮对话中，这会导致会话历史堆积大量冗余英文，白白浪费上下文预算，还会干扰长对话的推理焦点。
`pi-lingual` 运行在完全独立的 TUI 悬浮视窗中。**发给 AI 的输入保持纯净原文，不会向会话历史写入任何多余内容。**

### 4. 彻底解决终端排版撕裂
东亚全角字符（CJK）在终端中占据 2 个显示列宽。
常见的闭合四方框（`│ ... │`）一旦混入中文或特殊符号，字符测算失准就会导致边框断裂、重影和光标错位。
`pi-lingual` 放弃闭合边框，改用基于 Unicode UAX #11 的开放式树状布局（`· ┌ ├ └`）。无论分屏多窄，排版永不撕裂。

---

## 三大工作模式

终端中输入 `/2` 或 `/lingual` 随时平滑切换：

```text
  /2 （循环轮转：原文模式 ➔ 英文模式 ➔ 关闭 ➔ 原文模式）
```

| 模式 | 你输入什么 | 发给 AI 的内容 | 视窗展示内容 | 适用场景 |
| :--- | :--- | :--- | :--- | :--- |
| **`original`** *(默认·原文伴学)* | 母语 *(如中文/日文)* | **母语原文** (0ms 透传) | 终端双语视窗 *(口语 + 写作 + 重点短语)* | 个人日常开发，顺便积累专业英文表达 |
| **`english`** *(英文代发增强)* | 母语 *(如中文/日文)* | **规范技术英文** | 预览生成的英文卡片 | 参与开源或团队项目，确保代码和提交纯英文 |
| **`off`** *(彻底关闭)* | 任意输入 | **母语原文** | 不显示，插件静默 | 专注纯代码、不需要任何界面辅助时 |

### 混合意图嫁接（代码与堆栈绝不乱翻）
在 `english` 模式下，粘贴大段代码块或报错日志时，插件**绝不翻译代码**：
- **只翻人话**：仅提取指令前方的自然语言提问，转写为精准专业的技术英文；
- **原样拼接**：原始代码块、编译器诊断或报错堆栈 100% 原样保留，缝合在英文指令后方；
- **最终效果**：AI 收到地道规范的英文指令，同时拥有完整的代码与报错上下文。

---

## 交互实录：双语境视窗的设计哲学

死记孤立的单词表无法形成真实的表达能力。真实工程协作通常分化为两个截然不同的语境：

```text
  · [原文] 这个方案有点过度设计了，不如直接用标准库实现
  ┌ [口语] This feels a bit over-engineered; we'd be much better off sticking with the standard library.
  │        (感觉有点过度设计了，用标准库划算得多)
  ├ [写作] The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.
  │        (该方案引入了不必要的复杂度，建议优先采用原生标准库实现)
  └ [重点] over-engineered (过度工程化) · be better off (更合适) · stick with (沿用) · leverage (利用)
```

* **`[口语] (Spoken Register)`**：北美硅谷团队日常沟通的高频表达。包含站会交流、Slack 讨论、结对编程中的常用短语动词与口语俚语。
* **`[写作] (Written Register)`**：符合工程规范的技术书面语。适用于 RFC 提案、PR 描述、代码审查与技术方案编写。
* **`[重点] (Collocations)`**：动态提取的核心词汇与搭配。在口语和写作句中命中时，自动施加 ANSI 微光下划线高亮。

---

## 视窗形态：完整树状 vs 单行胶囊

针对不同开发分屏环境，提供两套视窗形态：

<p align="center">
  <img src="assets/capsule-mode.svg" alt="pi-lingual 视窗形态切换" width="840">
</p>

1. **左导轨树状架构（默认）**：开放式单侧边框（`· ┌ ├ └`）。基于 Unicode UAX #11 计算列宽，窄分屏下也绝不断行重影；严格限制不超过 9 行，避免触发宿主终端小部件截断报错。
2. **单行胶囊模式（`/compact`）**：将视窗压缩为单行高密度流：
   ```text
   zh ⇄ en · [口] This feels over-engineered... │ [写] Proposed approach introduces unnecessary complexity...
   ```
   *在 tmux、WezTerm 等窄分屏下节省 80% 纵向空间。当终端高度不足 22 行时自动生效。*

---

## 多语言真实场景对照

核心功能是将母语转为高阶英文，但也支持主流工程语言双向互转：

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

**绝对母语主权（Language Sovereignty）**：切换母语后，底栏状态、命令说明、视窗标签、错误提示全部 100% 动态本地化，绝无硬编码残留。

---

## 底层硬核机制

- **输入流拦截**：在 `original` 模式下通过 `{ action: "continue" }` 实现 0ms 零延迟放行；在 `english` 模式下通过 `{ action: "transform", text: english }` 动态重写提示词。
- **即时请求熔断**：敲回车或新输入到达时，单调递增世代令牌（Generation Token）立刻用 `AbortController` 物理掐断上一轮未完成的后台网络请求，杜绝幽灵响应与 Token 浪费。
- **零延迟清屏与避峰**：敲回车瞬间立即清空旧卡片，底栏切换为 `polishing...`；在 `original` 模式下伴学请求延迟 80ms 触发，让出连接池给主任务完成首包握手，彻底免除排队互斥。
- **命令行与代码护盾**：40+ 常见 CLI 命令（`git`, `docker`, `npm`, `cargo`, `python`）及代码块以 0ms 直通放行，不耗费任何请求。
- **内存极速缓存**：内置 50 条 LRU 缓存，高频确认词（“继续”、“开始吧”、“认同”）0ms 瞬间直出。
- **输入审查与脱敏**：自动剥离剪贴板截图路径（`pi-clipboard-*.png`），折叠长堆栈报错与编译器诊断，提取核心自然语言。

---

## 常用命令与工效学

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
默认自动复用当前 Pi 会话凭证，零配置开箱即用。

如果主任务在使用高配长思考主力模型，可将伴学转写交给环境中的轻量高速模型，保护昂贵的主力推理配额：
```bash
/2-model <轻量模型ID>       # 指定环境中的任意轻量高速模型
/2-model auto              # 恢复跟随当前会话主模型
```

也支持在 `~/.pi/agent/lingual.json` 中配置本地 Ollama 或私有兼容端点：
```json
{
  "endpoint": "http://127.0.0.1:11434/v1/chat/completions",
  "model": "qwen2.5:3b"
}
```

> 🔒 **绝对隐私承诺**：`pi-lingual` **零外部依赖**（`dependencies: {}`），零遥测，不上传任何隐私数据。仅与你配置的模型端点通信。

---

## 开源协议

MIT © [Jason Song](https://github.com/3ZEROS12)
