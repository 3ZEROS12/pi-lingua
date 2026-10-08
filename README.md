# pi-lingual

> **Zero-friction developer translator & dual-register language companion for Pi Coding Agent**  
> Run pair-programming interactions in your native tongue while building native Silicon Valley spoken flow and technical RFC precision above your editor.

[![npm version](https://img.shields.io/npm/v/pi-lingual?color=blue)](https://www.npmjs.com/package/pi-lingual)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Built for Pi](https://img.shields.io/badge/Built%20for-Pi%20Coding%20Agent-orange)](https://github.com/earendil-works/pi-coding-agent)
[![Tests](https://img.shields.io/badge/Tests-9%2F9%20Pass-brightgreen)](tests/engine.test.ts)

**English** | [简体中文](./README_zh.md)

<p align="center">
  <img src="assets/hero.svg" alt="pi-lingua Terminal Companion HUD" width="840">
</p>

---

## The Core Friction

Every day, software engineers type hundreds of terminal prompts into coding agents. Most translation setups handle this poorly:

* **Naive machine translation** produces flat, literal phrasing. Ask how to ask colleagues out for lunch, and generic translators output `What to eat?`. Silicon Valley engineering teams on Slack say: `What are we feeling for lunch?`.
* **Silent translation plugins** translate input in the background to hide their existence. The agent gets English, but the developer sees nothing and learns nothing.
* **Inline comment spam** pollutes session histories by appending English translations directly into chat transcripts, wasting model context on every subsequent turn.

`pi-lingua` runs a dual-register language engine directly in the terminal interface. It displays everyday conversational slang and formal technical prose in a detached floating view above your input line, without touching the model conversation log.

---

## Architecture & Core Mechanics

```text
  · Original   吃什么？
  ┌ [Spoken]   What are we feeling for lunch? (中午整点啥好吃的？)
  ├ [Written]  Please specify your catering preferences for the upcoming session. (请明确下阶段会议的用餐偏好。)
  └ [Vocab]    feel like (想要/倾向于) · specify (明确列出) · catering preferences (餐饮偏好)
```

### 1. Trifecta Left-Rail Tree Branch HUD
Terminal CJK characters commonly break closed rectangular borders, causing line-wrapping tears in Windows Terminal, Alacritty, and iTerm2. `pi-lingua` discards right-hand box boundaries entirely. It renders an open left-rail tree branch:
* ` · Original`: Exact user input line for cognitive reference.
* ` ┌ [Spoken]`: Natural colloquial English (daily standups, Slack huddles, pair programming, contractions, common phrasal verbs) paired with native nuances in parentheses.
* ` ├ [Written]`: Modern technical Plain English (RFCs, PR descriptions, issue trackers, architectural reviews) paired with native nuances.
* ` └ [Vocab]`: Single-line stream of highlighted expressions and collocations.

### 2. Zero Context Pollution
The plugin intercepts input via Pi's extension lifecycle while preserving transcript purity:
* **Original Mode (`original`, default)**: User input passes to the agent in 0ms. The background translation job runs asynchronously. On-disk session transcripts store only the original prompt. No English text is injected into the model conversation history.
* **English Mode (`english`)**: The engine translates the input first, extracts only the formal technical English sentence, strips away parenthetical native explanations, and passes clean English to the model for complex reasoning.
* **Off Mode (`off`)**: Bypasses the translation engine entirely.

### 3. Adaptive Vocabulary in an Inline Stream
Fixed limits (such as forcing 1–2 vocabulary items) either omit crucial idioms or pad outputs with obvious words. `pi-lingua` evaluates user proficiency dynamically. When an input contains technical idioms, phrasal verbs, or prepositions that intermediate developers miss, the engine extracts them all.

To protect terminal screen space, all vocabulary entries stream into a single horizontal line joined by ` · `:
```text
over-engineered (过度工程化) · be better off (采用……更为合适) · stick with (坚持沿用)
```
The view never stacks multi-line definitions vertically, preventing code lines in the editor from being pushed off-screen.

### 4. Saturated Command & CLI Coverage
Switching modes or checking translations requires minimal keystrokes:
* **Inside Pi Sessions**: Run `/lingua`, `/lingual`, `/translate`, or the single-character toggle `/2` to rotate modes (`Original ➔ English ➔ Off`).
* **Status Bar Totem**: Active state shows directly in the footer: `⇄ [二 ⇄ two] 原文`, updating dynamically on toggle.
* **Global CLI**: Execute translations from any shell via `lingua`, `lingual`, `translate`, `lg`, or `2`:
  ```bash
  2 "这个方案有点过度设计了，不如直接用标准库实现"
  ```

---

## Terminal Experience

### Approving an Implementation
```text
> 认同，开始吧
```
```text
  · 原文   认同，开始吧
  ┌ [Spoken]  Totally on board with that — let's dive right in. (完全赞同，咱们直接开搞)
  ├ [Written] Acknowledged. Let's proceed with the implementation. (确认赞同，着手推进具体实施)
  └ [Vocab]   on board with (赞同/支持) · dive in (立刻着手)
```

### Discussing Technical Trade-Offs
```text
> 这个方案有点过度设计了，不如直接用标准库实现
```
```text
  · 原文   这个方案有点过度设计了，不如直接用标准库实现
  ┌ [Spoken]  This feels a bit over-engineered; we'd be much better off just sticking with the standard library. (感觉有点过度设计了，用标准库划算得多)
  ├ [Written] The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred. (该方案引入了不必要的复杂度，建议优先采用原生标准库实现)
  └ [Vocab]   over-engineered (过度工程化) · be better off (做某事更合适) · stick with (坚持使用) · leverage (利用/借助)
```

### High-Frequency Progression
```text
> 继续
```
```text
  · 原文   继续
  ┌ [Spoken]  Let's keep going. (继续往下搞)
  ├ [Written] Proceed with the next steps. (推进后续步骤)
  └ [Vocab]   keep going (继续推进) · proceed with (着手推进)
```

---

## Global Symmetrical Multilingual Showcase

`pi-lingua` operates bidirectionally across world languages. English-speaking developers learning Chinese, Japanese, or Spanish receive the same dual-register breakdowns as international developers learning English.

<p align="center">
  <img src="assets/multilingual-showcase.svg" alt="Global Multilingual Showcase" width="840">
</p>

### 8 Symmetrical Language Pairs & Authoritative Passages

| Direction | Source Tradition (Language A) | Input Passage | [Spoken] Register | [Written] Register |
| :--- | :--- | :--- | :--- | :--- |
| **🇨🇳 zh ➔ 🇺🇸 en** | **Chinese · Union Version (CUV)**<br>*(Matthew 6:31 / Dev Meme)* | `吃什么？` | `What are we feeling for lunch?`<br>*(Slack team lunch idiom)* | `Please specify your catering preferences...`<br>*(Formal catering registration)* |
| **🇺🇸 en ➔ 🇨🇳 zh** | **English · King James (KJV)**<br>*(Genesis 1:1, 1:3)* | `In the beginning God created the heaven and the earth...` | `最开始的时候，上帝创造了天地。上帝说了句“要有光”，立马就有了光。` | `起初，神创造天地。神说：“要有光”，就有了光。`<br>*(Standard technical register)* |
| **🇪🇸 es ➔ 🇺🇸 en** | **Spanish · Reina-Valera (RVR 1960)**<br>*(John 3:16)* | `Porque de tal manera amó Dios al mundo...` | `God loved the world so much that He gave His one and only Son...` | `For God so loved the world that He gave His only begotten Son...` |
| **🇺🇸 en ➔ 🇪🇸 es** | **English · NIV**<br>*(Matthew 10:34)* | `Do not suppose that I have come to bring peace...` | `Ni crean que vine a traer paz a la tierra. No vine a traer paz, sino espada.` | `No se debe suponer que he venido a traer paz... No he venido a instaurar la paz...` |
| **🇯🇵 ja ➔ 🇺🇸 en** | **Japanese · Shinkyoudo-yaku**<br>*(Matthew 7:7)* | `求めなさい。そうすれば、与えられる...` | `Just ask, and you'll receive; look for it, and you'll find it...` | `Ask, and it will be given to you; seek, and you will find...` |
| **🇺🇸 en ➔ 🇯🇵 ja** | **English · ESV**<br>*(1 Corinthians 13:4)* | `Love is patient and kind; love does not envy...` | `愛ってさ、辛抱強くて思いやりがあるんだよね。人を妬んだり自慢したりもしないし...` | `愛は忍耐強く、また情け深い。愛は嫉妬せず、誇ることもなく、驕り高ぶらない。` |
| **🇫🇷 fr ➔ 🇺🇸 en** | **French · Louis Segond (LSG 1910)**<br>*(Psalm 23:4)* | `Quand je marche dans la vallée de l'ombre de la mort...` | `Even when I walk through the valley of the shadow of death...` | `Even though I walk through the valley of the shadow of death, I will fear no evil...` |
| **🇩🇪 de ➔ 🇺🇸 en** | **German · Lutherbibel (LUT 2017)**<br>*(Ecclesiastes 1:2, 1:9)* | `Es ist alles ganz eitel. Es geschieht nichts Neues unter der Sonne.` | `Honestly, it all feels like spinning our wheels. There's really nothing new under the sun...` | `This initiative yields negligible substantive value; it merely re-implements established paradigms...` |

---

## Autonomous Customization via AI Agent

The project includes an AI-Native customization protocol defined in `AGENTS.md`. You do not need to configure translation prompts or edit TypeScript files manually.

When you open this repository in Pi, Cursor, or Claude Code, state your goal in plain text:
> *"I want to customize this language companion plugin for learning Japanese."*

Your agent will run the configuration workflow autonomously:

1. **4-Question Interview**: Conducts an interview in your language covering source/target pair (A ➔ B), current baseline proficiency versus target benchmark, engineering domain, and style preferences.
2. **Primary Language Sovereignty**: When adapting to a new language pair (e.g. English ➔ Japanese), the agent replaces every status label, mode name (`Original`, `English`, `Off`), and notification string with native expressions of Language A, removing prior interface languages completely.
3. **Adaptive Vocabulary Prompt Calibration**: The agent re-anchors the system prompt in `src/engine.ts` with domain-specific few-shot examples and adjusts vocabulary extraction thresholds for your skill level.
4. **Automated Verification**: Runs `npm test` and `npm run build` to verify typings and test suites.

> **Important Node.js ESM Cache Notice**:  
> Running `/reload` inside an existing Pi session cannot clear ESM modules already cached in process memory. **You must exit the terminal and restart Pi (`pi`) for recompiled extensions in `dist/` to take physical effect.**

---

## Installation & CLI Usage

### Install as a Pi Coding Agent Extension
```bash
# Install directly from local repository
pi install D:/Workspace/projects/pi-lingua

# Or install from npm registry
pi install npm:pi-lingual
```

### Standalone CLI
Translate expressions from any shell:
```bash
# Query via any registered alias: lingua, lingual, translate, lg, 2
lingua "这几个接口需要做幂等性校验"
2 "内存占用过高，排查一下是否有未释放的句柄"
```

---

## ⚙️ Environment & LLM Gateway Configuration

`pi-lingua` works out-of-the-box with any OpenAI-compatible local or cloud LLM proxy:

| Environment Variable | Default | Description |
| :--- | :--- | :--- |
| `LINGUA_ENDPOINT` | `http://127.0.0.1:8045/v1/chat/completions` | OpenAI-compatible completions endpoint |
| `LINGUA_API_KEY` | *(empty)* | Optional authorization bearer token |
| `LINGUA_MODEL` | `gemini-3.8-flash` | Target model name used for translation |

Set environment variables in your shell before launching `pi`:
```bash
export LINGUA_ENDPOINT="https://api.openai.com/v1/chat/completions"
export LINGUA_API_KEY="sk-..."
export LINGUA_MODEL="gpt-4o-mini"
```

---

## Release Workflow

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "feat: release pi-lingua v0.1.0 with dual-register HUD & multilingual showcase"
git branch -M main
git remote add origin https://github.com/3ZEROS12/pi-lingua.git
git push -u origin main
```

### 2. Publish to npm
```bash
npm run build
npm test
npm publish --access public
```

### 3. Add to Pi Package Ecosystem
```bash
# Global user installation
pi install npm:pi-lingual
```
Submit a pull request to `packages.md` in the official [pi-coding-agent](https://github.com/earendil-works/pi-coding-agent) repository to list `pi-lingual` under community extensions.

---

## License

MIT © [Jason Song](https://github.com/3ZEROS12)
