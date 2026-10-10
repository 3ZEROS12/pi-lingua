# pi-lingual

A bilingual terminal HUD and prompt transformer for Pi Coding Agent.

Code in your native language. See real-time Silicon Valley spoken phrasing and formal technical prose—or transform prompts into clean technical English to keep your code, comments, and commits consistent.

[![npm version](https://img.shields.io/npm/v/pi-lingual?color=blue)](https://www.npmjs.com/package/pi-lingual)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Built for Pi](https://img.shields.io/badge/Built%20for-Pi%20Coding%20Agent-orange)](https://github.com/earendil-works/pi-coding-agent)
[![Tests](https://img.shields.io/badge/Tests-79%2F79%20Pass%20(100%25)-brightgreen)](tests/engine.test.ts)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Zero%20Error-blue)](tsconfig.json)

**English** | [简体中文](./README_zh.md)

<p align="center">
  <img src="assets/hero.svg" alt="pi-lingual Terminal Companion HUD Experience" width="840">
</p>

---

## Quick Start

Install directly inside Pi Coding Agent:

```bash
pi install npm:pi-lingual
```

Works out of the box with your current session model credentials. No extra API keys or setup required.

---

## In Action: Dual-Register HUD

Type in your native language, and an interactive HUD appears right above your prompt:

```text
  · [Original] 这个方案有点过度设计了，不如直接用标准库实现
  ┌ [Spoken]   This feels a bit over-engineered; we'd be much better off sticking with the standard library.
  │            (感觉有点过度设计了，用标准库划算得多)
  ├ [Written]  The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.
  │            (该方案引入了不必要的复杂度，建议优先采用原生标准库实现)
  └ [Vocab]    over-engineered (过度工程化) · be better off (更合适) · stick with (沿用) · leverage (利用)
```

The HUD presents three distinct layers:
* **`[Spoken]`**: Casual phrasing for standups, Slack chats, and pair programming.
* **`[Written]`**: Architecture-grade prose for RFC proposals, PR descriptions, and issue reviews.
* **`[Vocab]`**: Extracted collocations with spotlight underline matching.

---

## Three Operating Modes

Toggle modes anytime with `/2` or `/lingual`:

| Mode | What You Type | What the AI Receives | What You See | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **`original`** *(Default)* | Native Language *(e.g. Chinese / Japanese)* | **Raw Native Prompt**<br>*(0ms pass-through, 0 context pollution)* | Interactive dual-register HUD *(Spoken + Written + Vocab)* | Solo coding while absorbing authentic engineering phrasing |
| **`english`** *(Transform)* | Native Language *(e.g. Chinese / Japanese)* | **Standard Technical English**<br>*(Replaces prompt with RFC-grade English)* | Companion card previewing the generated English | Team/open-source repos requiring English comments and commits |
| **`off`** | Any Text | **Raw Text** *(0 background calls, 0 widgets)* | Hidden / disabled | Pure coding sessions with zero UI overlays |

### Hybrid Intent Grafting (Code Stays Untouched)
In `english` mode, pasting code blocks or error logs never translates the code:
- **Translates intent only**: Converts natural language instructions into crisp technical English.
- **Keeps code untouched**: Grafts your original code block or stack trace right back onto the prompt.
- **The result**: Clean English instructions paired with complete technical context.

---

## Form Factors: Full Tree vs. Single-Line Capsule

Two layouts designed to protect your editor workspace:

<p align="center">
  <img src="assets/capsule-mode.svg" alt="pi-lingual Layout Modes" width="840">
</p>

1. **Left-Rail Tree HUD (Default)**: Open-branch layout (`· ┌ ├ └`) using Unicode UAX #11 metrics. Eliminates closed borders to prevent terminal wrapping tears. Stays strictly within 9 lines.
2. **Single-Line Capsule Mode (`/compact`)**: Compresses the HUD into a dense single-line stream:
   ```text
   zh ⇄ en · [Spk] This feels over-engineered... │ [Wrt] Proposed approach introduces unnecessary complexity...
   ```
   *Saves over 80% vertical space in tight split panes (tmux, WezTerm). Activates automatically when terminal height is $< 22$ lines.*

---

## Real-World Multilingual Matrix

Translating into English is the primary focus, but major languages are supported bidirectionally:

<p align="center">
  <img src="assets/multilingual-showcase.svg" alt="Multilingual Matrix" width="840">
</p>

| Source | Scenario | Input Prompt | [Spoken] Daily Standup / Slack | [Written] RFC / PR Review |
| :--- | :--- | :--- | :--- | :--- |
| **🇨🇳 zh** | Architecture | `这个方案过度设计了，不如直接用标准库` | `This feels a bit over-engineered; let's stick with the standard library.` | `The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.` |
| **🇯🇵 ja** | Systems | `メモリリークの可能性があるので、クリーンアップ処理を追加してください` | `There might be a memory leak here, so let's make sure we toss in some cleanup logic.` | `To prevent potential memory leaks, please incorporate explicit cleanup and resource disposal routines.` |
| **🇪🇸 es** | Code Review | `El PR es demasiado grande, sugiero dividirlo en dos cambios atómicos` | `This PR is huge — how about we split it into a couple of bite-sized PRs instead?` | `The PR scope is excessively broad; decomposing it into two discrete, atomic commits is advised.` |
| **🇩🇪 de** | Distributed | `Wir müssen sicherstellen, dass diese Schnittstelle idempotent ist` | `We've gotta make sure this endpoint is strictly idempotent so duplicate requests don't bite us.` | `It is imperative to guarantee strict idempotency for this API endpoint to prevent duplicate mutations.` |

Switch language pairs anytime:
```bash
/lang ja en      # Japanese to English
/lang es en      # Spanish to English
/lang de en      # German to English
/lang en ja      # English to Japanese
/lang zh ja      # Chinese to Japanese
/lang 日语       # Natural language aliases supported
```

Switching languages updates status badges, command hints, and UI chrome with zero hardcoded residues.

---

## Engineering Highlights

- 🛡️ **Zero Context Pollution**: Runs as an ambient TUI sidecar. Never injects translation tokens into your LLM chat history.
- ⚡ **Instant & Non-Blocking**: Press Enter to clear cards immediately. Stale background requests abort on the fly via `AbortController`.
- 📐 **Rock-Solid Terminal Layout**: Open tree branches (`· ┌ ├ └`) using Unicode UAX #11. Never breaks borders or wraps awkwardly on wide characters.
- ⚡ **Command Pass-Through Shield**: 40+ common CLI prefixes (`git`, `docker`, `npm`, `cargo`) and code blocks bypass translation with zero token spend.
- 🧠 **In-Memory LRU Cache**: Frequent affirmations (`继续`, `认同`, `开始吧`) return instantly at 0ms from a 50-entry cache.
- 🧹 **Noise Filtering**: Automatically strips clipboard screenshot paths (`pi-clipboard-*.png`) and folds compiler logs before translation.
- 🪶 **Model Isolation**: Runs on your session model by default, or pick a lightweight model to protect high-tier reasoning quota.

---

## Commands & Shortcuts

| Command | Alias | Description |
| :--- | :--- | :--- |
| `/2 [sub]` | `/lingual [sub]` | Master command: cycle modes, or route subcommands |
| `/compact` | `/2-compact` | Toggle between Tree HUD and Capsule mode |
| `/lang <source> [target]` | `/2-lang` | Switch language pair (e.g. `/lang ja en`, `/lang 日语`) |
| `/last` | `/2-last` | Replay the most recent companion card |
| `/2-model <id>` | `/lingual-model` | Switch companion model (`auto` to follow session, or specify a model ID) |
| `/status` | `/2-status` | Display diagnostics, active model, and cache stats |

*Keyboard shortcuts: `Alt+.` (next page), `Alt+,` (previous page). Standalone CLI: `lingual "prompt"`.*

---

## Dedicated Models & Privacy

### Protecting High-Tier Reasoning Quotas
By default, `pi-lingual` runs securely in-process using your active Pi session model.

When pairing with high-tier reasoning models, delegate companion duties to a lightweight model to save quota:
```bash
/2-model <lightweight-model-id>    # Delegate to a lightweight model
/2-model auto                      # Revert to follow-session mode
```

Local Ollama or custom OpenAI-compatible endpoints can also be configured in `~/.pi/agent/lingual.json`:
```json
{
  "endpoint": "http://127.0.0.1:11434/v1/chat/completions",
  "model": "qwen2.5:3b"
}
```

> 🔒 **Absolute Privacy Guarantee**: `pi-lingual` has **zero external dependencies** (`dependencies: {}`), zero telemetry, and zero tracking. Requests go only to your authenticated model endpoints.

---

## Deep Dive & Engineering Notes

- **[Architecture & Layout Engine Spec](./docs/architecture.md)**: Details on UAX #11 box model math, punctuation wrapping rules, line-budget fallbacks, and concurrency controls.
- **[Why pi-lingual: A Note on Language Intuition](./docs/philosophy.md)**: Reflections on why vocabulary flashcards fail, and how the 5-second model generation gap builds authentic fluency.

---

## License

MIT © [Jason Song](https://github.com/3ZEROS12)
