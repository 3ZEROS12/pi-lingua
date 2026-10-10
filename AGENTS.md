# SYSTEM CONTEXT & OPERATIONAL PROFILE: PI-LINGUAL

## 1. Domain & Runtime Environment (RFC 2119)
- **Package / Target**: `pi-lingual` (v0.3.3)
- **Primary Domain**: Zero-friction developer translator & dual-register language companion (Spoken vs Written) for AI coding agents.
- **Runtime & Toolchain**: Node.js v20+ / TypeScript Strict / tsup (dual ESM+CJS+DTS) / native Node test runner.
- **Extension Entry**: `dist/extension.js` (authored in `src/extension.ts`).
- **Configuration Path**: `~/.pi/agent/settings.json` under `"pi-lingual"` block.

---

## 2. Core Operational Invariants (RFC 2119)

### Invariant 1: Primary Language Sovereignty (Zero Chinese Residue)
- When the user selects native language A (`sourceLang`, e.g. English, Japanese, Spanish, German, French), Language A MUST completely replace all Chinese text in the UI chrome.
- All user-facing strings (notifications, status badges, command descriptions, diagnostic reports) MUST be dynamically derived from `resolveLabelsForLang(sourceLang)` in `src/presets.ts`. Hardcoding static English or Chinese fallback strings in runtime code is STRICTLY FORBIDDEN.

### Invariant 2: Zero-Source-Mutation Configuration
- Standard language switching (`zh`, `ja`, `en`, `es`, `fr`, `de`) MUST take effect immediately and in-place without editing source files or restarting the host terminal, writing preferences directly to `~/.pi/agent/settings.json`.
- Modifying project source files merely to switch runtime languages is STRICTLY PROHIBITED.

### Invariant 3: Duality Schema & Native Nuance Anchoring
- The translation engine MUST enforce strict JSON formatting containing:
  - `spoken`: Colloquial oral target language B.
  - `spoken_meaning`: Exact colloquial nuance in native language A.
  - `written`: Formal architecture-grade written target language B.
  - `written_meaning`: Exact formal technical nuance in native language A.
  - `vocab`: Inline horizontal stream of extracted terms and collocations.
- The `[CODE & SYMBOL SHIELD]` rule MUST bypass pure shell commands, Markdown code blocks, and data structures with 0ms latency and 0 token burn.

### Invariant 4: Proficiency-Adaptive Vocabulary & Single-Line Clamping
- The translation system prompt MUST adapt vocabulary depth to the user's proficiency tier (extracting tricky phrasal verbs for intermediate tiers, and high-register idioms for advanced tiers).
- To preserve vertical terminal space, vocabulary terms MUST be clamped to a single horizontal inline stream (`term (definition) · term2 (definition)`). Multi-line vertical expansions for vocabulary are FORBIDDEN.

### Invariant 5: Command Bus Ergonomics & Master Dispatcher
- Natural short commands MUST register as first-class standalone commands: `/lang`, `/compact`, `/last`, `/status`.
- The master commands (`/lingual` and `/2`) MUST implement secondary routing (`masterCommandHandler`). Subcommands (`lang`, `model`, `compact`, `status`, `last`) MUST NEVER fall through into the default mode-cycling branch.
- Language normalization MUST accept natural language aliases (`japanese`/`jp`/`日语` ➔ `ja`, `chinese`/`cn`/`中文` ➔ `zh`) and language pair syntax (`/lang zh ja`).

### Invariant 6: Deterministic UI Feedback & Concurrency Micro-Staggering
- On new user input in `original` mode, the previous HUD widget MUST be dismissed immediately (`ctx.ui.setWidget("lingual_hud", undefined)`) and status updated to `polishing...`.
- In `original` mode, background translation calls MUST be staggered by 80ms (`setTimeout(..., 80)`) to allow the host session's primary prompt to complete socket handshakes first.
- Model completers MUST specify `reasoning: "low"`, constraining background generation to tight ~100-token bursts completed in 200–300ms.

### Invariant 7: Multi-Probe Test Isolation Sandbox
- Configuration loaders (`loadUserLingualConfig`) and writers (`saveUserLingualConfig`) MUST detect test environments via multi-probe inspection (`NODE_TEST_CONTEXT`, `process.execArgv`, npm lifecycle events) and strictly avoid touching user settings files during tests.

### Invariant 8: Sincere, High-Desire Documentation Standard (RFC 2119)
- **10-Second Desire Funnel**: Screen 1 MUST display a 1-sentence punchy tagline, clean visual asset, and 1-line installation command (`pi install npm:pi-lingual`).
- **Short, Punchy Sentences**: Sentences in `README.md` and `README_zh.md` MUST be concise and sincere. Compound run-on sentences with convoluted academic clauses are STRICTLY FORBIDDEN.
- **The 4-Row Action Matrix**: Modes and workflows MUST be summarized in a crisp table:
  $$\text{Mode / Action} \mid \text{What You Input} \mid \text{What the Engine Does} \mid \text{What You See} \mid \text{When to Use}$$
- **Friction Breakers**: Preemptively explain why code/stack traces remain untouched (`Hybrid Intent Grafting`), why no extra tokens pollute chat history, and why latency is zero.
- **Zero Terminology Inflation**: Never brand ordinary 20-line functions as capitalized buzzwords ("Shield", "FSM", "Sovereignty"). Use real, standard engineering terms (Input Event Hook, UAX #11 Box Model, AbortController, LRU Cache).
- **Zero Volatile Model/Tech Name-Dropping**: Never sprinkle specific, fast-changing external model tags (e.g. Claude 3.5 Sonnet, GPT-4) without up-to-the-minute research. Prefer functional categories ("high-tier reasoning models vs. lightweight models") and generic command placeholders (`<model-id>`). Evergreen docs age gracefully.
- **Rich, Self-Contained Storefront over Hollow Fragmentation**: The main README MUST be rich, substantive, and high-desire. Never hollow out the main page into a bare-bones skeleton by scattering core user values and engineering designs into sub-files. Exhaustive proofs belong in `docs/architecture.md`, but the main page must stand completely self-contained.

---

## 3. Physical Verification & Build Commands

- **Run Physical Test Suite**:
  ```bash
  npm test
  # or from workspace root: node .scripts/fleet.mjs test pi-lingual
  ```
  *Executes 79 test suites verifying cache, chunker, commands, engine, layout, prompts, sanitizer, shield, and sovereignty (100% green).*

- **Build Distribution Bundles**:
  ```bash
  npm run build
  # compiles dist/extension.js, dist/index.js, dist/*.cjs, and .d.ts files via tsup
  ```

- **Run Strict Type Check**:
  ```bash
  npm run typecheck
  ```

- **Run Documentation Linter**:
  ```bash
  node ../.scripts/fleet.mjs docs pi-lingual
  ```

---

## 4. Architectural Boundaries & Quality Gates

- **Kinetic Line Budget Guard**: Card layouts MUST NOT exceed 9 lines under any column width, mathematically guaranteeing zero host widget truncation warnings.
- **Documentation Linting**: Documentation MUST pass `node .scripts/fleet.mjs docs pi-lingual` with 0 corporate buzzwords, 0 pseudo-contrasts, and 1:1 verified 74/74 test metrics.
