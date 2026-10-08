# AGENTS.md · Autonomous Customization Protocol for pi-lingua

## 🤖 Agent Autonomous Discovery & Customization Role
When a user opens this project with an AI Coding Agent (such as Pi, Cursor, Claude Code, Windsurf, etc.) or expresses intent to customize, reconfigure, or adapt pi-lingua (e.g. "我想定制这个伴学插件", "我想学别的语言", "我想去掉雅思"):

**THE AGENT MUST AUTONOMOUSLY EXECUTE THIS INTERVIEW & DEPLOYMENT PROTOCOL:**
1. **Zero User Overhead**: Do NOT ask the user to read source code, edit files, or manually run scripts. The ONLY thing the user should do is answer the interview questions.
2. **Native Language Adherence**: MUST conduct the entire conversation **strictly in the exact language the user is speaking** (Chinese, English, Japanese, Spanish, etc.).
3. **Autonomous Execution**: Once the user answers the diagnostic questions, the Agent MUST autonomously apply the configuration:
   - For standard supported languages (`zh`, `ja`, `en`, `es`, `fr`, `de`), the Agent MUST directly configure `~/.pi/agent/settings.json` under `"pi-lingual"` (zero source modification, surviving all future npm updates).
   - If developing or contributing a new official preset, synthesize the code in `src/presets.ts` and `src/prompts.ts`, physically execute `npm test` and `npm run build`, and verify cleanly.

---

## 📋 The 5 Diagnostic Interview Questions
The Agent should proactively ask the user the following structured questions (in the user's language):

1. **Language Pair (语言对 A ➔ B)**:
   - What is your native language A (the language you type in)?
   - What is your target immersion language B (the language you want to learn)?
   *(Examples: zh ➔ en, en ➔ ja, ja ➔ en, fr ➔ de)*
2. **Proficiency Baseline & Benchmark (当前水准与备考目标)**:
   - What is your current estimated proficiency or most recent test score in target language B? (e.g. IELTS 6.0/6.5, CET-4/6, JLPT N3/N2, TOEFL 80+, or self-assessed Beginner / Intermediate / Advanced)?
   - What is your target benchmark? (e.g. IELTS Band 8.0+, JLPT N1, or pure native developer communication without exams)?
3. **Engineering Domain (工程垂直领域)**:
   - What is your primary technical domain? (e.g. Full-stack Web, Systems/Kernel Rust/C++, Quant/Finance, AI/ML, Agile Slack team)
4. **Tone & Style (语域与风格偏好)**:
   - Do you prefer Silicon Valley colloquial flow, or formal corporate/whitepaper Plain English, or a balanced split?
5. **Translation Model Engine (伴学模型与算力偏好)**:
   - Do you want zero-config automatic inheritance from your active Pi session model (Recommended, 0 configuration, 0 keys needed)?
   - Or designate a fast/cost-effective dedicated model (e.g. `gemini-3.8-flash`, `gpt-4o-mini`) so deep reasoning and instant companion translations run decoupled?
   - Or custom BYOK endpoint (OpenAI-compatible / local Ollama)?

---

## ⚡ MANDATORY HARD INVARIANTS (绝对硬性铁律)

### 铁律 1：【母语 A 拥有最高统治权，彻底替换所有中文】(Primary Language Sovereignty)
- If the user selects native language A (e.g. A = English, Japanese, Spanish, German, French):
  **LANGUAGE A MUST FULLY REPLACE ALL CHINESE TEXT IN THE PROJECT UI (ZERO CHINESE RESIDUE).**
  The runtime engine dynamically resolves all user-facing strings (notifications, status bar, command descriptions, status reports) from `src/presets.ts` via `resolveLabelsForLang(sourceLang)` into Language A's authentic expressions:

  #### 模式名称本地化映射矩阵 (Mode Localization Matrix):
  | 概念 | 中文 (默认 A=zh) | 英文 (A=en) | 日文 (A=ja) | 西班牙文 (A=es) | 德文 (A=de) |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | **原文模式** | `原文` | `Original` | `原文` | `Original` | `Original` |
  | **英文模式** | `英文` | `English` | `英語` | `Inglés` | `Englisch` |
  | **关闭状态** | `关` | `Off` | `オフ` | `Apagado` | `Aus` |

  #### 状态栏与标签规范：
  - **If A = English (e.g. A=English ➔ B=Japanese)**:
    `slot1Label: "Spoken"`, `slot2Label: "Written"`, `vocabLabel: "Vocab"`,
    `hudTitle: "two ⇄ 二"`,
    `statusOriginal: "⇄ [two ⇄ 二] Original"`,
    `statusEnglish: "⇄ [two ⇄ 二] English"`,
    `statusOff: "⇄ [two ⇄ 二]: Off"`.
    Notification: `"[two ⇄ 二] switched to [Original]: Prompt passed to AI unmodified, HUD displays Japanese translations"`
    ALL NOTIFICATIONS, STATUS TEXTS, AND COMMAND DESCRIPTIONS MUST BE IN ENGLISH.
  - **If A = Japanese (e.g. A=Japanese ➔ B=English)**:
    `slot1Label: "口語"`, `slot2Label: "文面"`, `vocabLabel: "単語"`,
    `hudTitle: "二 ⇄ two"`,
    `statusOriginal: "⇄ [二 ⇄ two] 原文"`,
    `statusEnglish: "⇄ [二 ⇄ two] 英語"`,
    `statusOff: "⇄ [二 ⇄ two]: オフ"`.
    Notification: `"[二 ⇄ two] 【原文モード】に切り替えました：AIへの入力は原文のまま、上部カードで英語を表示"`
  - **Totem Header Pattern**:
    The totem header MUST strictly follow: `${A's word for "two"} ⇄ ${B's word for "two"}` (e.g. `two ⇄ 二`, `dos ⇄ two`, `deux ⇄ zwei`).

  #### 模式核心物理事实 (Physical Behavior of Modes):
  1. **Original (原文)**: Passes user's input A to the LLM 100% unmodified (0ms non-blocking), displays B's dual-registers in the HUD card.
  2. **English (英文)**: Replaces input with idiomatic technical English to the LLM for deep reasoning, displays B's dual-registers in the HUD card.
  3. **Off (关)**: Silent pass-through.

### 铁律 2：【配置驱动零侵入原则 (Zero-Source-Mutation Invariant)】
- **Standard Supported Languages (`zh`, `ja`, `en`, `es`, `fr`, `de`)**:
  Switching native language takes effect **immediately and in-place** without modifying source code or restarting the terminal. The Agent must simply configure `~/.pi/agent/settings.json` under `"pi-lingual": { "sourceLang": "<lang>" }` (or run `/2-lang <lang>`), which survives all future npm updates.
- **Contributing New Official Presets**:
  Only when authoring brand new official language presets in `src/presets.ts` or `src/prompts.ts` does `npm run build` and terminal restart apply:
  > **⚠️ ESM 重新编译生效前提**: Due to Node.js ESM in-memory module locking, editing TypeScript source files requires running `npm run build` and restarting Pi (`pi`) for recompiled `dist/` modules to physically load.

### 铁律 3：【保持 JSON Schema 与语感释义铁律】
- In `src/engine.ts`, `LINGUA_SYSTEM_PROMPT` must strictly output JSON:
  ```json
  {
    "spoken": "The spoken translation in target language B",
    "spoken_meaning": "The exact colloquial nuance/meaning in native language A",
    "written": "The formal/technical written translation in target language B",
    "written_meaning": "The exact formal technical nuance/meaning in native language A",
    "vocab": "collocation 1 (definition in native lang A) · collocation 2 (definition) · ..."
  }
  ```
- Must retain the `[CODE & SYMBOL SHIELD]` rule (never translate code tokens, paths, or SQL).
- Must provide 3 relevant `[GOLDEN FEW-SHOT ANCHORS]` matching the user's chosen language pair (A ➔ B).
- In the HUD card, the source anchor `· ${sourceTag} ${sourceText}` MUST always be displayed, and each translation slot MUST include the native language A nuance in parentheses to provide complete cognitive feedback.

### 铁律 4：【重点词汇按用户当前基准自适应提取，严禁死板定额，且保持单行紧凑】(Proficiency-Adaptive Vocab Invariant)
- The Agent MUST calibrate the `vocab` extraction directive in `LINGUA_SYSTEM_PROMPT` according to the user's current baseline vs target benchmark:
  - If the user is currently at an intermediate level (e.g. IELTS 6.0 / CET-4 / JLPT N3): Instruct the translation model to surface all non-trivial phrasal verbs, technical collocations, and tricky prepositions that trip up learners at that tier.
  - If the user is at an advanced level (e.g. IELTS 7.5+ / JLPT N1): Skip common words and strictly target nuanced, idiomatic native collocations and architecture-grade idioms.
  - STRICTLY FORBID hardcoding an arbitrary "1-2 words" cap. Surface as many valuable expressions as genuinely needed for the user's level.
  - **Terminal Vertical Height Guard**: To prevent the terminal HUD window from expanding vertically and pushing code off-screen, all extracted terms MUST be formatted compactly in a single horizontal inline stream: `term1 (concise native definition) · term2 (concise def) · term3 (concise def)`. Long paragraph explanations are strictly forbidden in the HUD.

---

## 🛠️ Verification & Build Pipeline
The Agent must physically run:
1. `npm test`
2. `npm run build`
3. `node bin/lingua.js "<sample input in language A>"`
Then report the physical output and prompt the user to restart the terminal.
