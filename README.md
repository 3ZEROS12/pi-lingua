# pi-lingual

> **Zero-friction developer translator & dual-register language companion for Pi Coding Agent**  
> Type naturally in your native language while cultivating authentic Silicon Valley spoken flow and technical RFC precision directly above your terminal prompt.

[![npm version](https://img.shields.io/npm/v/pi-lingual?color=blue)](https://www.npmjs.com/package/pi-lingual)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Built for Pi](https://img.shields.io/badge/Built%20for-Pi%20Coding%20Agent-orange)](https://github.com/earendil-works/pi-coding-agent)
[![Tests](https://img.shields.io/badge/Tests-74%2F74%20Pass%20(100%25)-brightgreen)](tests/engine.test.ts)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Zero%20Error-blue)](tsconfig.json)

**English** | [简体中文](./README_zh.md)

<p align="center">
  <img src="assets/hero.svg" alt="pi-lingual Terminal Companion HUD Experience" width="840">
</p>

---

## The Engineering Problem

Pairing with terminal-based AI coding agents (Pi, Claude Code, Cursor CLI) poses distinct language barriers for developers outside native English regions:

1. **Mechanical Literal Translation**: Generic machine translation flattens idiomatic expression. Asking how to suggest lunch yields dry literalisms like `What to eat?`. Silicon Valley engineering teams on Slack write: `What are we feeling for lunch?`.
2. **Terminal CJK Geometry Tears**: East Asian (CJK) characters occupy 2 visual columns. Rigid terminal box borders (`│ ... │`) fracture whenever multibyte characters miscalculate width, causing ugly line wrapping tears across Windows Terminal, Alacritty, and iTerm2.
3. **Session Context Contamination**: Injecting English translations directly into session history spams conversation buffers with redundant text, burning token budgets and diluting LLM reasoning focus on subsequent turns.
4. **Async Pipeline Collisions & Ghost Cards**: Typing consecutive prompts while background model inference is pending triggers socket race conditions. Stale network responses overwrite active terminal displays, burning hundreds of hidden reasoning tokens.
5. **Crash-Prone Stack Trace Flooding**: Pasting terminal exceptions, compiler diagnostics, or clipboard image paths causes naive translation prompts to blow past model context budgets and clutter widget layouts.

`pi-lingual` solves these frictions through a deterministic, non-invasive dual-register companion engine embedded directly in the terminal interface.

---

## Architectural Mechanisms & Core Capabilities

```text
  · [Original] 这个方案有点过度设计了，不如直接用标准库实现
  ┌ [Spoken]   This feels a bit over-engineered; we'd be much better off sticking with the standard library.
  │            (感觉有点过度设计了，用标准库划算得多)
  ├ [Written]  The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.
  │            (该方案引入了不必要的复杂度，建议优先采用原生标准库实现)
  └ [Vocab]    over-engineered (过度工程化) · be better off (更合适) · stick with (沿用) · leverage (利用)
```

### 1. Trifecta Left-Rail Tree Branch HUD
Rectangular ASCII boxes collapse when mixed with variable-width Unicode. `pi-lingual` discards right-hand and bottom borders entirely, utilizing an open **Trifecta Left-Rail Tree Branch** (`· ┌ ├ └`):
* **`  · [Original]`**: Anchors the source input across columns, wrapping via hanging indentation without synthetic truncations.
* **`  ┌ [Spoken]`**: Idiomatic conversational English (daily standups, Slack huddles, pair-programming dialogues, phrasal verbs) paired with authentic native nuance.
* **`  ├ [Written]`**: Architecture-grade technical prose (RFC proposals, PR descriptions, issue trackers, code reviews) paired with formal engineering nuance.
* **`  └ [Vocab]`**: Inline horizontal stream of extracted collocations and idioms.

### 2. Unicode UAX #11 Box Model & Kinetic Budgeting
Terminal widgets inside host agents enforce strict line limits (Pi truncates widgets exceeding 10 lines). `pi-lingual` implements a deterministic box model solver (`src/layout.ts`):
* **UAX #11 Visual Width Calculation**: Dynamically measures East Asian Wide (CJK = 2 cols), half-width Latin (1 col), and zero-width ANSI control sequences (0 cols).
* **Line-Head Kinsoku Shori (禁则处理)**: Prevents isolated punctuation marks (`,`, `.`, `!`, `?`, `)`, `]`, `。`, `，`, `！`, `）`) from starting new lines.
* **Strict $\le 9$ Lines Hard Budget Guard**: Multi-tiered fallback logic mathematically guarantees HUD output never breaches 9 lines, eradicating widget truncation warnings.
* **Target Language Integrity Invariant**: If budget boundaries tighten on narrow windows, colloquial and formal English expressions (`spoken` and `written`) are preserved at full length while explanatory annotations collapse inwards.
* **Atomic Vocabulary Shield**: Vocabulary items format as whole units (`term (meaning)`). If column space expires, clipping stops strictly at the previous delimiter (`·`), preventing severed substrings such as `compression (压缩 ...`.
* **Dynamic Information Density Trigger**: Accounts for CJK carrying $2.5\times$ the information density of Latin alphabets. Inputs with $\ge 45$ CJK characters or $\ge 2$ sentences trigger high-density summarization to prevent 3-line verbal expansions from exhausting screen space.

### 3. Spotlight Collocation Highlighting
Acquiring idiomatic grammar requires immediate visual recognition. `pi-lingual` matches extracted vocabulary keys against generated sentences, non-destructively applying ANSI underline formatting (`\x1b[4m...\x1b[24m`). It preserves letter casing and exact column metrics while guiding eye fixations to key verbs and prepositions within 100 milliseconds.

### 4. Single-Line Capsule Mode (Tiling Window Protection)
When working in 3–4 pane tiling layouts (tmux splits, WezTerm panes) or compact windows (`rows < 22`), vertical space is at a premium.

<p align="center">
  <img src="assets/capsule-mode.svg" alt="pi-lingual Layout Morphing" width="840">
</p>

Toggle **Capsule Mode** via `/compact` or `/2-compact` to compress the multi-line tree HUD into an ultra-dense single line:
```text
zh ⇄ en · [Spoken] This feels over-engineered... │ [Written] Proposed approach introduces unnecessary complexity...
```
This reclaims over 80% vertical space while retaining dual-register visibility.

### 5. Sanitizer & Intent Distillation Pipeline (`src/sanitizer.ts`)
Developer input often bundles compiler logs, stack dumps, and clipboard screenshots. `pi-lingual` parses raw inputs before model dispatch:
* **Clipboard Artifact Stripping**: Strips temporary paths such as `C:\...\pi-clipboard-*.png` automatically.
* **Multi-Line List Folding**: Condenses multi-row bulleted lists (`- `, `* `, `1. `) into `[N items ...]`, foregrounding core questions while persisting raw payloads for downstream execution.
* **Stack Trace & Diagnostic Collapsing**: Collapses multi-line Node.js / Python stack dumps into `[... stack trace ...]`, retaining first-line diagnostic summaries.
* **Declarative Prose Detection**: Distinguishes authentic natural language statements ($\ge 4$ words) from raw compiler output, preventing false-positive filter rejections.
* **Extended Capacity**: Safely digests complex prompts up to 2,500 characters.

### 6. Monotonic Session FSM & Socket Cancellation (`src/fsm.ts`)
Typing speed frequently outpaces remote network round-trips:
* **Physical AbortController Teardown**: Hitting Enter increments a monotonic generation counter and aborts pending remote HTTP sockets from prior turns, eliminating ghost completions and wasted reasoning tokens.
* **Instant 0ms Screen Clearance**: Existing cards clear immediately on prompt submission while the status indicator updates to `polishing...`.
* **80ms Micro-Staggering**: In `original` mode, background companion analysis waits 80ms to yield network sockets to the main agent's primary handshakes.
* **Bounded Reasoning Pulse**: Model completions enforce `reasoning: "low"`, constraining background generation to tight ~100-token bursts completed in 200–300ms.

### 7. Zero-Token Shield & In-Memory LRU Cache
* **Code & CLI Pass-Through Shield (`src/shield.ts`)**: 40+ CLI tool prefixes (`git`, `npm`, `cargo`, `docker`, `kubectl`, `make`, `python`), syntax declarations (`const`, `function`, `class`, `import`, `def`), and markdown code fences bypass translation at **0ms with 0 token spend**.
* **50-Capacity In-Memory LRU Cache (`src/cache.ts`)**: Repetitive acknowledgment phrases (`继续`, `认同`, `开始吧`, `可以`, `明白`) yield **0ms instant HUD display** via in-memory cache hits.

---

## Developer Ergonomics & Command Matrix (ADR-0004)

`pi-lingual` implements first-class ergonomic commands alongside a multi-tier Master Command Dispatcher.

### Command Bus Overview
| Intuitive Command | Standard Form | Compatibility Aliases | Description |
| :--- | :--- | :--- | :--- |
| `/lang <code\|alias>` | `/lingual-lang` | `/2-lang`, `/lingual lang` | Switch native language (`zh`, `ja`, `en`, `es`, `fr`, `de`, or aliases like `日语`) |
| `/compact` | `/lingual-compact` | `/2-compact`, `/lingual compact` | Toggle between single-line capsule mode and full tree HUD |
| `/last` | `/lingual-last` | `/2-last`, `/lingual last` | Replay the most recent companion card in the terminal |
| `/status` | `/lingual-status` | `/2-status`, `/lingual status` | Display diagnostic report, active model, and LRU cache hit rates |
| `/lingual [sub]` | `/2 [sub]` | `/lingual-mode` | Master bus: route subcommands or cycle modes (`original` ➔ `english` ➔ `off`) |
| `/lingual-model <id>` | `/2-model` | `/lingual model` | Switch companion model (`auto` or explicit model identifier) |
| `/lingual-agent` | `/2-agent` | `/lingual agent`, `/lingual help` | Display companion customization reference |

### Keyboard Shortcuts (Interactive Pagination)
Long prompts with multiple clauses separate into atomic pages. Navigate through cards without touching mouse or editor state:
* **`Alt+.`** (`>` key): Next semantic chunk.
* **`Alt+,`** (`<` key): Previous semantic chunk.

### Standalone System CLI
Execute translation directly from bash, zsh, or PowerShell:
```bash
lingual "这个方案有点过度设计了，不如直接用标准库实现"
2 "メモリリークの可能性があるので、クリーンアップ処理を追加してください"
```

---

## Real-World Multilingual Engineering Matrix

`pi-lingual` operates symmetrically across primary engineering languages:

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

## Primary Language Sovereignty & Internationalization

Switching your primary working language modifies UI chrome dynamically without altering source code.

### Runtime Language Pivot
```bash
/lang ja     # Switch primary language to Japanese (日本語)
/lang en     # Switch primary language to English (for ESL developers learning others)
/lang es     # Switch primary language to Spanish (Español)
/lang de     # Switch primary language to German (Deutsch)
/lang zh     # Switch primary language to Simplified Chinese (简体中文)
```

### Zero-Residue Persistence
Configuration persists under `~/.pi/agent/settings.json`:
```json
{
  "pi-lingual": {
    "sourceLang": "ja",
    "compact": false
  }
}
```
* **Survives Package Updates**: Settings persist cleanly across `pi install npm:pi-lingual` runs.
* **Zero Chinese Residue**: Selecting non-Chinese presets removes Chinese UI strings completely; command hints, status badges, and error diagnostics render in the selected language.
* **English Pivot Fallback**: Internal edge-case fallbacks default strictly to neutral English, preventing random script leaks.

---

## Model Engine Integration & Quota Isolation

`pi-lingual` executes directly against Pi's internal model dispatch buses, requiring zero separate API keys for active users:

### 1. Default: In-Process Pi Session Model (Zero Setup & Zero Leakage)
Calls `ctx.modelRegistry.streamSimple()` using the currently active Pi session model credentials.
* **100% In-Process Authentication**: Handled securely by Pi's runtime. No API keys or tokens are read, stored, or transmitted by `pi-lingual`.
* **Zero Additional Billing**: Reuses your existing session credentials.

### 2. Quota Isolation & Model Switching (Protecting Reasoning Budgets)
When pairing with high-tier reasoning models (Claude 3.5 Sonnet, o1, o3-mini), avoid consuming reasoning quota by delegating companion duties to a lightweight, high-speed model:
* **List Available Models**: Run `/lingual-model` without arguments to query and display all authenticated models available in your Pi environment.
* **Designate Dedicated Model**:
  ```bash
  /lingual-model gemini-3.8-flash    # Or any model available in your environment
  /2-model gpt-4o-mini              # Quick alias
  ```
* **Restore Default Follow-Session Mode**:
  ```bash
  /lingual-model auto
  ```
Preferences persist safely in `~/.pi/agent/settings.json` under `"pi-lingual": { "selectedModel": "..." }` in your home directory (never in the project git repo).

### 3. Private BYOK & Offline Models (Local Ollama / OpenAI-Compatible)
For air-gapped, offline, or private BYOK environments, configure custom endpoints via `~/.pi/agent/lingual.json` or environment variables:
* **Local Ollama (Zero Network Usage)**:
  ```json
  {
    "endpoint": "http://127.0.0.1:11434/v1/chat/completions",
    "model": "qwen2.5:3b"
  }
  ```
* **Custom OpenAI-Compatible API (e.g. DeepSeek / OpenRouter / Private Gateway)**:
  ```json
  {
    "endpoint": "https://api.deepseek.com/v1/chat/completions",
    "apiKey": "your_api_key_here",
    "model": "deepseek-chat"
  }
  ```
* **Environment Variable Overrides**:
  You can also export environment variables without creating any file:
  ```bash
  export LINGUAL_ENDPOINT="https://api.deepseek.com/v1/chat/completions"
  export LINGUAL_API_KEY="your_api_key_here"
  export LINGUAL_MODEL="deepseek-chat"
  ```

> 🔒 **Absolute Privacy & Zero-Credential Exposure Guarantee**:  
> `pi-lingual` contains zero telemetry, zero analytics, and zero external tracking sinks (`dependencies: {}`). Configuration files reside exclusively in your user home directory (`~/.pi/agent/`), strictly isolated from project workspaces and never tracked or committed by Git.

---

## Author's Note

The system prompts for the translation model are currently tailored by me, but you can deeply customize them to fit your own needs at any time using the `/lingual agent` command.

Beyond just tweaking configurations, I genuinely encourage everyone to think through the output style you actually want:
* **How granular should the breakdown of key phrases in a sentence be?**
* **Do you need supplementary explanations on specific grammar nuances or engineering contexts?**
* **How many core collocations strike the right balance for your cognitive load?**

These questions matter immensely. You will only achieve the best results when you tune the prompts intentionally to match your baseline. In your daily workflow, whenever you press Enter and wait a few seconds for the AI to generate code, take that brief idle window to glance at the natural phrasing right above your prompt.

The inspiration for this project came from my personal experience using tools like the Metasequoia (水杉) input method. I used them faithfully for quite a while, but the outcome was disappointing—I felt like I wasn't really learning anything. Elementary vocabulary was already familiar and didn't need reinforcement, while difficult, obscure words couldn't be grasped just by staring at isolated dictionary entries. During that period, my vocabulary apps were practically worn out from constant lookups. What truly allows you to internalize language and actually use it is authentic phrasing and natural collocations embedded within real context.

I hope everyone takes the time to tune a prompt that works best for them, catches those brief moments during code generation, and keeps going.

---

## Installation & Verification

### Install as a Pi Extension
```bash
# Install official package from npm
pi install npm:pi-lingual

# Or install from GitHub
pi install git:github.com/3ZEROS12/pi-lingua
```

### Development & Verification
```bash
git clone https://github.com/3ZEROS12/pi-lingua.git
cd pi-lingua
npm install
npm test            # 74/74 test suites pass (100% green)
npm run typecheck   # 0 TypeScript compiler errors
```

---

## License

MIT © [Jason Song](https://github.com/3ZEROS12)
