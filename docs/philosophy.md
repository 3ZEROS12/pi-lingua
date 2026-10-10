# Why pi-lingual: A Note on Language Intuition

## The Spark Behind the Project

The inspiration for `pi-lingual` came from my personal experience using tools like the Metasequoia (水杉) input method while preparing for the IELTS exam and coding daily.

The premise of "memorizing vocabulary while typing" sounded brilliant at first: every time you typed in your IME, an English word would pop up above the candidate box. I used it faithfully for quite a while, but eventually realized the actual learning effect was minimal.

Elementary vocabulary was already familiar and didn't need reinforcement. On the other hand, difficult, obscure words couldn't be absorbed just by looking at isolated dictionary definitions without context. My vocabulary lookup apps were worn out from constant searches, yet I still struggled to use those words naturally in real conversation or technical writing.

**Memorizing isolated word lists does not build expressive capability.**

---

## Catching the 5-Second Generation Gap

When terminal AI coding agents (Pi, Claude Code, Cursor CLI) emerged, a new pattern caught my attention:

After hitting Enter, an LLM typically takes 5 to 15 seconds to generate code, run refactorings, or plan an execution tree. That window is remarkably subtle:
- It is too short to switch contexts and read an article.
- It is just long enough for your focus to drift into idle staring.

What if we turned that brief idle gap right above your prompt into a low-cognitive-load window for absorbing natural language?

That was the origin of `pi-lingual`.

---

## Dual Registers: How Real Teams Communicate

In engineering, expression is not one-size-fits-all. When you write code and collaborate with global teams, you operate across two distinct linguistic registers:

1. **The Spoken Register (Agile & Conversational)**:
   - Used in Slack huddles, daily standups, and pair-programming chats.
   - Characterized by natural phrasal verbs, idioms, and casual flow.
   - Instead of literal machine translation (`What to eat?`), native teams say: `What are we feeling for lunch?`.
2. **The Written Register (Architecture & Documentation)**:
   - Used in RFC proposals, pull request descriptions, architecture reviews, and issue trackers.
   - Characterized by clear, concise, and professional technical prose.
   - Instead of `Don't write this code, it's bad`, written reviews state: `The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.`

Putting these two registers side by side right above your prompt lets you naturally observe how the same thought maps into different professional environments.

---

## Tuning to Your Personal Baseline

You can deeply customize the companion prompt using `/lingual agent`. I encourage everyone to reflect on what output style best matches their current level:
- **Granularity**: How detailed should phrase explanations be?
- **Vocabulary Density**: Do you prefer 2 core idioms per prompt, or 4?
- **Context**: Do you want more engineering nuance, or more conversational colloquialisms?

Language intuition takes root when you catch those brief moments during code generation, see authentic phrasing in context, and build familiarity turn by turn.
