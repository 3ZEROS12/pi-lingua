# pi-lingual

> **Zero-friction developer translator & dual-register language companion for Pi Coding Agent**  
> Type naturally in your native language while cultivating authentic Silicon Valley spoken flow and technical RFC precision right above your terminal prompt.

[![npm version](https://img.shields.io/npm/v/pi-lingual?color=blue)](https://www.npmjs.com/package/pi-lingual)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Built for Pi](https://img.shields.io/badge/Built%20for-Pi%20Coding%20Agent-orange)](https://github.com/earendil-works/pi-coding-agent)
[![Tests](https://img.shields.io/badge/Tests-44%2F44%20Pass-brightgreen)](tests/engine.test.ts)

**English** | [简体中文](./README_zh.md)

<p align="center">
  <img src="assets/hero.svg" alt="pi-lingual Terminal Companion HUD Experience" width="840">
</p>

---

## Why pi-lingual?

When pairing with terminal-based AI coding agents (Pi, Claude Code, Cursor CLI), developers who are non-native English speakers or learning a target language face three recurring frictions:

1. **Mechanical Literal Translation**: Generic machine translation flattens idiomatic expression. Asking how to suggest lunch yields dry literalisms like `What to eat?`. Silicon Valley engineering teams on Slack say: `What are we feeling for lunch?`.
2. **Silent Background Translation**: Plugins that silently translate prompts behind the scenes deliver English to the LLM, but leave the developer's terminal completely blank—wasting valuable micro-learning moments.
3. **Context Window Contamination**: Pasting English translations directly into the conversation history spams subsequent turns with duplicate text, burning token budgets and diluting LLM reasoning focus.

`pi-lingual` runs a non-invasive, dual-register companion engine directly in the terminal UI. It projects colloquial team flow and formal technical prose in a floating HUD above your editor, while keeping session history 100% clean.

---

## Core Architecture & Key Capabilities

```text
  · [Original] 这个方案有点过度设计了，不如直接用标准库实现
  ┌ [Spoken]   This feels a bit over-engineered; we'd be much better off sticking with the standard library.
  │            (感觉有点过度设计了，用标准库划算得多)
  ├ [Written]  The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.
  │            (该方案引入了不必要的复杂度，建议优先采用原生标准库实现)
  └ [Vocab]    over-engineered (过度工程化) · be better off (更合适) · stick with (沿用) · leverage (利用)
```

### 1. Trifecta Left-Rail Tree Branch HUD
In Windows Terminal, Alacritty, and iTerm2, East Asian (CJK) characters break closed rectangular box borders due to 2-cell width misalignments, causing terminal line-wrapping tears. `pi-lingual` eliminates right-hand and bottom borders entirely, adopting an open **Trifecta Left-Rail Tree Branch**:
* **`  · [Original]`**: Uncompressed, full prompt anchor strictly aligned with subsequent branches at column 11.
* **`  ┌ [Spoken]`**: Natural colloquial English (daily standups, Slack huddles, pair-programming dialogues, phrasal verbs) paired with authentic native nuance.
* **`  ├ [Written]`**: Architecture-grade technical Plain English (RFCs, PR descriptions, issue trackers, code reviews) paired with formal engineering nuance.
* **`  └ [Vocab]`**: Inline horizontal stream of extracted collocations and idioms.

### 2. Spotlight Phrase Highlighting
Acquiring new vocabulary requires immediate visual parsing. `pi-lingual` dynamically matches extracted vocabulary against the generated dual registers, applying a non-destructive ANSI underline (`\x1b[4m...\x1b[24m`). It preserves exact letter casing and terminal column metrics while guiding your eyes to key collocations within 0.1 seconds.

### 3. Single-Line Capsule Mode (Tiling Terminal Protection)
When working in 3–4 pane tiling layouts (tmux, WezTerm, iTerm2 splits) or compact windows (`rows < 22`), vertical space is at a premium. 

<p align="center">
  <img src="assets/capsule-mode.svg" alt="pi-lingual Layout Morphing" width="840">
</p>

Toggle **Capsule Mode** with `/2-compact` (or `/linguall-compact`) to collapse the multi-line tree HUD into an ultra-dense, strictly single-line horizontal stream:
```text
zh ⇄ en · [Spoken] This feels over-engineered... │ [Written] Proposed approach introduces unnecessary complexity...
```
This saves over 80% vertical space while keeping translation feedback accessible.

### 4. Code & CLI Pass-Through Shield (0ms Fast Bypass)
Terminal workflows frequently involve shell commands, Git operations, and code snippets. Running translation calls on `git commit -m "fix"` or `const x = 1` wastes tokens and adds latency.

`pi-lingual` includes a dedicated heuristic shield (`src/shield.ts`) that intercepts inputs with **0ms latency and 0 token burn**:
* **40+ CLI Tool Prefixes**: `git`, `npm`, `pnpm`, `yarn`, `cargo`, `docker`, `kubectl`, `make`, `python`, `curl`, etc.
* **Multi-language Code Starters**: `const`, `function`, `class`, `import`, `def`, `impl`, `SELECT`, etc.
* **Data Structures & Fences**: Markdown code blocks, JSON/YAML structures, and pure alphanumeric identifiers.
* **Natural Language Queries Preserved**: Queries with technical commands (e.g. `git status 为什么报错？`) safely pass through for full companion analysis.

### 5. In-Memory LRU Cache (0ms Instant Replay)
During pair-programming, up to 40% of developer prompts consist of high-frequency confirmation phrases (`继续`, `认同`, `开始吧`, `可以`, `明白`).

`pi-lingual` embeds a zero-dependency 50-capacity LRU cache (`src/cache.ts`). Repeated phrases bypass model inference entirely, achieving **0ms instant HUD display** with zero network calls and zero token consumption.

### 6. Semantic Chunking & 9-Line Hard Budget Guard
Host terminal widgets enforce a strict 10-line truncation threshold. `pi-lingual` guarantees full readability through semantic pagination:
* **Short Prompts (<= 90 chars, 90% of cases)**: Aggregated into a single card without pagination banners or shortcuts.
* **Long Multi-Sentence Prompts**: Split along natural punctuation boundaries (`。！？；\n` or `.!?\n`). Each page retains the complete atomic set: `[Original]` + `[Spoken]` + `[Written]` + `[Vocab]`.
* **Seamless Keyboard Navigation**: Flip between pages using **`Alt+.`** (`>`) / **`Alt+,`** (`<`) without disrupting cursor focus or editor state.
* **Strict Line Budget**: The HUD never exceeds 9 lines under any condition.

---

## Real-World Software Engineering Multilingual Matrix

`pi-lingual` is built for modern engineering collaboration. It operates symmetrically across world languages:

<p align="center">
  <img src="assets/multilingual-showcase.svg" alt="Real-World Software Engineering Multilingual Matrix" width="840">
</p>

| Language Pair | Engineering Scenario | Input Prompt | [Spoken] Register | [Written] Register |
| :--- | :--- | :--- | :--- | :--- |
| **🇨🇳 zh ➔ 🇺🇸 en** | **Architecture Review**<br>*(Tech Trade-offs)* | `这个方案有点过度设计了，不如直接用标准库实现` | `This feels a bit over-engineered; we'd be much better off just sticking with the standard library.` | `The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.` |
| **🇯🇵 ja ➔ 🇺🇸 en** | **Systems Engineering**<br>*(Resource Disposal)* | `メモリリークの可能性があるので、クリーンアップ処理を追加してください` | `There might be a memory leak here, so let's make sure we toss in some cleanup logic.` | `To prevent potential memory leaks, please incorporate explicit cleanup and resource disposal routines.` |
| **🇪🇸 es ➔ 🇺🇸 en** | **Code Review**<br>*(Git Atomic Commits)* | `El PR es demasiado grande, sugiero dividirlo en dos cambios atómicos` | `This PR is huge — how about we split it into a couple of bite-sized PRs instead?` | `The PR scope is excessively broad; decomposing it into two discrete, atomic commits is advised.` |
| **🇩🇪 de ➔ 🇺🇸 en** | **Distributed Systems**<br>*(API Idempotency)* | `Wir müssen sicherstellen, dass diese Schnittstelle idempotent ist` | `We've gotta make sure this endpoint is strictly idempotent so duplicate requests don't bite us.` | `It is imperative to guarantee strict idempotency for this API endpoint to prevent duplicate mutations.` |

---

## Config-Driven Primary Language Sovereignty

Switching native languages requires zero source mutations and zero terminal restarts.

### Instant In-Place Switching
Run `/2-lang [code]` (or `/linguall-lang [code]`) inside any active Pi session:
```bash
/2-lang ja   # Switch native language to Japanese
/2-lang en   # Switch native language to English
/2-lang zh   # Switch native language to Chinese
```
*Supported languages: `zh`, `ja`, `en`, `es`, `fr`, `de`.*

### Zero-Residue Persistence
User preferences persist in `~/.pi/agent/settings.json` under `"pi-lingual"`:
```json
{
  "pi-lingual": {
    "sourceLang": "ja",
    "compact": false
  }
}
```
* **Survives npm Upgrades**: Preferences remain intact when upgrading packages via `pi install npm:pi-lingual`.
* **Zero Chinese Residue**: When switching to English or Japanese, all UI chrome, status indicators, and notification strings update dynamically to authentic expressions of Language A.
* **Clean Rollback**: Reverting to defaults physically removes keys from the configuration file, leaving zero orphaned schema clutter.

---

## Zero-Config Model Architecture & Decoupling

`pi-lingual` runs directly on Pi's internal model infrastructure, requiring zero external API keys for active subscribers:

### 1. Default: In-Process Pi Session Model (Zero Configuration)
* **How it works**: Uses `ctx.modelRegistry.streamSimple()` to execute via the currently authenticated Pi model.
* **Benefits**: Zero setup, zero extra billing, zero secret management. Install and press Enter.

### 2. Model Decoupling (Preserving High-Tier Tokens)
To prevent prompt translation from consuming high-tier reasoning quota (e.g. Claude 3.5 Sonnet or o1), designate a lightweight companion model:
```bash
/linguall-model gemini-3.8-flash
```
Or reset back to automatic inheritance:
```bash
/linguall-model auto
```

### 3. Optional: Local Offline Model (Ollama · 0 Cloud Tokens)
For fully offline or private environments, run a local 3B model (e.g. `qwen2.5:3b`) and configure `~/.pi/agent/lingual.json`:
```json
{
  "endpoint": "http://127.0.0.1:11434/v1/chat/completions",
  "model": "qwen2.5:3b"
}
```

---

## Commands & Shortcuts Reference

### In-Session Terminal Commands (Standardized on `/linguall`)
| Standard Command | Compatibility Aliases | Description |
| :--- | :--- | :--- |
| `/linguall [mode]` | `/linguall-mode`, `/2`, `/lingual`, `/translate` | Set or cycle mode: `/linguall [original\|english\|off]` |
| `/linguall-lang <lang>` | `/2-lang`, `/linguall-lang` | Switch native language (`zh`, `ja`, `en`, `es`, `fr`, `de`) |
| `/linguall-compact` | `/2-compact`, `/linguall-compact` | Toggle between single-line capsule mode and full tree HUD |
| `/linguall-model <id>` | `/2-model`, `/linguall-model` | View or switch companion model (`auto` or specific model ID) |
| `/linguall-status` | `/2-status`, `/linguall-status` | Display full diagnostic report, active model, and LRU cache statistics |
| `/linguall-last` | `/2-last`, `/linguall-last` | Replay the previous companion card in the terminal |
| `/linguall-agent` | `/2-agent`, `/linguall-agent` | Display companion customization guide |

### Keyboard Shortcuts (During Translation HUD Display)
* **`Alt+.`** (`>`): Flip to the next semantic chunk.
* **`Alt+,`** (`<`): Flip to the previous semantic chunk.

### Standalone CLI
Use `pi-lingual` directly from bash, zsh, or PowerShell:
```bash
lingual "这个方案有点过度设计了，不如直接用标准库实现"
2 "内存占用过高，排查一下是否有未释放的连接池句柄"
```

---

## Installation

### Install as a Pi Extension
```bash
# Recommended: Install from npm
pi install npm:pi-lingual

# Or install from git
pi install git:github.com/3ZEROS12/pi-lingua
```

### Development & Verification
```bash
git clone https://github.com/3ZEROS12/pi-lingua.git
cd pi-lingua
npm install
npm test            # 44/44 test suites pass
npm run typecheck   # 0 TypeScript errors
```

---

## License

MIT © [Jason Song](https://github.com/3ZEROS12)
