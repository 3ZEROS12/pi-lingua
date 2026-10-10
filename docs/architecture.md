# pi-lingual Architecture & Engineering Mechanics

This document provides a technical deep dive into the layout algorithms, terminal geometry calculations, and session concurrency controls powering `pi-lingual`.

---

## 1. The Engineering Challenges

Integrating a real-time translation and language companion HUD into a terminal AI coding agent (e.g. Pi, Claude Code, Cursor CLI) poses distinct challenges:

1. **Mechanical Literal Translation**: Standard machine translation strips idiomatic context. Asking about lunch produces literalisms like `What to eat?`, whereas engineering teams on Slack typically write `What are we feeling for lunch?`.
2. **Terminal CJK Geometry Tears**: East Asian (CJK) characters occupy 2 terminal columns. Rigid rectangular borders (`│ ... │`) fracture when character widths are miscalculated, causing visual tearing in modern terminal emulators.
3. **Session Context Contamination**: Appending translations to the active prompt history pollutes context windows with redundant tokens and degrades reasoning on subsequent turns.
4. **Async Pipeline Collisions & Ghost Cards**: Typing consecutive prompts while background model inference is pending creates socket race conditions, where stale responses can overwrite current UI state.
5. **Stack Trace & Error Log Flooding**: Pasting terminal exceptions or clipboard file paths causes naive translation calls to exceed context limits and clutter layouts.

---

## 2. Terminal Layout Engine (`src/layout.ts`)

Host terminal runtimes (such as Pi's widget manager) enforce strict height limits ($\le 10$ lines). Exceeding this boundary causes widget truncation or UI errors. `pi-lingual` implements a deterministic box model solver:

### UAX #11 Visual Column Calculation
- Dynamically measures East Asian Wide (CJK = 2 columns), half-width Latin (1 column), and ANSI escape codes (0 columns).
- Prevents line wrap jitter across Windows Terminal, Alacritty, and iTerm2.

### Line-Head Punctuation Wrapping (Kinsoku Shori / 禁则处理)
- Prevents isolated punctuation marks (`,`, `.`, `!`, `?`, `)`, `]`, `。`, `，`, `！`, `）`) from starting new lines.
- Automatically snaps trailing punctuation to the previous line.

### Multi-Tiered Budget Guard ($\le 9$ Lines)
- Mathematically guarantees that the total rendered height never exceeds 9 lines.
- **Target Language Invariant**: When window space is constrained, colloquial and formal English expressions (`spoken` and `written`) are prioritized at full length, while annotations collapse inwards.
- **Atomic Term Truncation**: Vocabulary items format as whole units (`term (meaning)`). If column width is exhausted, truncation stops cleanly at the item boundary rather than cutting a word or leaving dangling parentheses.

### Dynamic Information Density Sensing
- CJK ideograms carry approximately $2.5\times$ the semantic density of Latin scripts.
- Prompts with $\ge 45$ CJK characters or multiple clauses trigger condensed summarization, preventing verbal expansions from exhausting screen space.

---

## 3. Session Concurrency & Network Teardown (`src/fsm.ts`)

Typing speed often outpaces remote model round-trips. `pi-lingual` handles this with deterministic lifecycle controls:

- **Monotonic Generation Tokens & AbortController**: Each new prompt increments an internal generation counter and aborts pending remote HTTP sockets from prior turns, eliminating ghost completions and wasted background tokens.
- **Immediate Screen Clearing**: Cards clear instantly on prompt submission while the status indicator shifts to `polishing...`.
- **Staggered Dispatch**: In background mode, companion analysis waits 80ms to yield network bandwidth to the primary agent's initial handshake.
- **Constrained Reasoning**: Completions enforce low reasoning effort (`reasoning: "low"`), ensuring background turns complete in lightweight 200–300ms bursts.

---

## 4. Input Sanitization & Noise Filtering (`src/sanitizer.ts`)

Raw prompts frequently contain diagnostics and clipboard metadata. The sanitizer prepares text before dispatch:

- **Clipboard Artifact Stripping**: Strips temporary paths like `C:\...\pi-clipboard-*.png`.
- **List & Diagnostic Folding**: Condenses multi-item lists (`- `, `1. `) into `[N items ...]` and long stack traces into `[... stack trace ...]`, keeping the core query legible.
- **Code & Command Pass-Through**: 40+ common CLI commands (`git`, `npm`, `cargo`, `docker`, `python`) and code fences bypass translation at 0ms with zero token cost.
- **In-Memory LRU Cache**: High-frequency affirmations (`继续`, `认同`, `开始吧`, `可以`) return cached cards instantly.
