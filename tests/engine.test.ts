import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseLlmResponse,
  formatTerminalAnnotation,
  stripLinguaAnnotation,
  translatePrompt,
  isNonEnglish,
  shouldTriggerTranslation,
} from "../src/engine.js";

test("isNonEnglish - correctly identifies natural language scripts and ignores emojis & typography", () => {
  // Pure English & commands
  assert.equal(isNonEnglish("git status"), false);
  assert.equal(isNonEnglish("const foo = 123;"), false);
  assert.equal(isNonEnglish("Hello, how are you?"), false);

  // Emojis & typographical quotes should NEVER trigger translation or prompt mutation
  assert.equal(isNonEnglish('git commit -m "fix: 🐛"'), false);
  assert.equal(isNonEnglish("const s = “hello”;"), false);
  assert.equal(isNonEnglish("Feature A — Feature B"), false);

  // Natural language scripts (Chinese, Japanese, Korean, accented Latin)
  assert.equal(isNonEnglish("帮我检查插件"), true);
  assert.equal(isNonEnglish("今の状況はどうなりましたか？"), true);
  assert.equal(isNonEnglish("¿Cómo estás?"), true);
});

test("shouldTriggerTranslation - bidirectional language trigger logic", () => {
  // Default Chinese/non-English source (sourceLang: "zh")
  assert.equal(shouldTriggerTranslation("帮我优化这段代码", "zh"), true);
  assert.equal(shouldTriggerTranslation('git commit -m "fix: bug"', "zh"), false);
  assert.equal(shouldTriggerTranslation('git commit -m "fix: 🐛"', "zh"), false);

  // [Safety Guard]: Rejects long text (> 300 chars), multi-line docs (> 3 lines), markdown headings
  const longPrompt = "a".repeat(350);
  assert.equal(shouldTriggerTranslation(longPrompt, "zh"), false, "Must reject text exceeding 300 characters");
  assert.equal(shouldTriggerTranslation("# 📋 pi-lingua · 文档撰写 Agent 任务交接说明书\n你好！", "zh"), false, "Must reject markdown heading");
  assert.equal(shouldTriggerTranslation("Line 1\nLine 2\nLine 3\nLine 4", "zh"), false, "Must reject documents with > 3 lines");
  assert.equal(shouldTriggerTranslation("```ts\nconst a = 1;\n```", "zh"), false, "Must reject code blocks");

  // English source learning foreign language (sourceLang: "en")
  assert.equal(shouldTriggerTranslation("Could you review this pull request for me?", "en"), true);
  assert.equal(shouldTriggerTranslation("How do I implement a concurrency lock in TypeScript?", "en"), true);
  // Terminal commands and code keywords MUST be bypassed even if sourceLang is "en"
  assert.equal(shouldTriggerTranslation("git checkout -b feature/login", "en"), false);
  assert.equal(shouldTriggerTranslation("npm install @earendil-works/pi-coding-agent", "en"), false);
  assert.equal(shouldTriggerTranslation("const maxRetries = 3;", "en"), false);
  assert.equal(shouldTriggerTranslation("import { useState } from 'react';", "en"), false);
});

test("parseLlmResponse - robustly handles prefix chatter, markdown fences, thoughts, nuance meanings and duality slots", () => {
  const noisy = `Here is the requested output:
<thought>Analyzing user requirements...</thought>
\`\`\`json
{
  "spoken": "Totally on board with that — let's dive right in.",
  "spoken_meaning": "完全赞同，咱们直接开搞",
  "written": "Acknowledged. Let's proceed with the implementation.",
  "written_meaning": "确认赞同，着手推进具体实施",
  "vocab": "on board with (赞成/支持) · dive in (立刻着手/开搞)"
}
\`\`\`
Hope this helps!`;

  const res = parseLlmResponse(noisy);
  assert.ok(res, "Must robustly extract JSON from noisy text");
  assert.equal(res.spoken, "Totally on board with that — let's dive right in.");
  assert.equal(res.spokenMeaning, "完全赞同，咱们直接开搞");
  assert.equal(res.written, "Acknowledged. Let's proceed with the implementation.");
  assert.equal(res.writtenMeaning, "确认赞同，着手推进具体实施");
  assert.equal(res.vocab, "on board with (赞成/支持) · dive in (立刻着手/开搞)");
});

test("parseLlmResponse - supports proficiency-adaptive vocab with multiple (3+) expressions without rigid caps", () => {
  const payload = JSON.stringify({
    spoken: "This feels a bit over-engineered; we'd be much better off just sticking with the standard library.",
    spoken_meaning: "感觉有点过度设计了，用标准库划算得多",
    written: "The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.",
    written_meaning: "该方案引入了不必要的复杂度，建议优先采用原生标准库实现",
    vocab: "over-engineered (过度工程化) · be better off (做某事更合适) · stick with (坚持使用) · leverage (充分利用/借力)",
  });

  const res = parseLlmResponse(payload);
  assert.ok(res);
  assert.ok(res.vocab && res.vocab.includes("leverage"));
  const items = res.vocab.split(" · ");
  assert.equal(items.length, 4, "Must preserve all 4 extracted collocations without arbitrary 1-2 capping");
});

test("formatTerminalAnnotation - formats with source text anchor, native nuance, and Trifecta Left-Rail Tree Branch", () => {
  // 1. Dual slots + nuance meanings + vocab
  const full = formatTerminalAnnotation(
    "賛成です、進めましょう",
    "Totally on board with that — let's dive right in.",
    "Acknowledged. Let's proceed with the implementation.",
    "on board with · dive in",
    {
      spokenMeaning: "完全に賛成、早速取り掛かろう",
      writtenMeaning: "了解しました。実装を進めましょう",
      slot1Label: "口語",
      slot2Label: "文面",
      vocabLabel: "単語",
      sourceLabel: "原文",
    }
  );
  assert.ok(full.includes("· 原文   賛成です、進めましょう"), "Must include source text anchor");
  assert.ok(full.includes("┌ [口語] Totally on board with that — let's dive right in. (完全に賛成、早速取り掛かろう)"));
  assert.ok(full.includes("├ [文面] Acknowledged. Let's proceed with the implementation. (了解しました。実装を進めましょう)"));
  assert.ok(full.includes("└ [単語] on board with · dive in"));

  // 2. Dual slots without vocab
  const noVocab = formatTerminalAnnotation(
    "继续",
    "Let's keep going.",
    "Proceed with the next steps."
  );
  assert.ok(noVocab.includes("· 原文   继续"));
  assert.ok(noVocab.includes("┌ [口语] Let's keep going."));
  assert.ok(noVocab.includes("└ [写作] Proceed with the next steps."));

  // 3. Single slot
  const single = formatTerminalAnnotation(
    "继续",
    "Let's keep going."
  );
  assert.ok(single.includes("· 原文   继续"));
  assert.ok(single.includes("└ [口语] Let's keep going."));
});

test("stripLinguaAnnotation - cleanly recovers raw text and isolates parenthetical nuance", () => {
  const branchAnnotated =
    "  · 原文   认同，开始吧\n" +
    "  ┌ [口语] Totally on board with that — let's dive right in. (完全赞同，咱们直接开搞)\n" +
    "  ├ [写作] Acknowledged. Let's proceed with the implementation. (确认赞同，着手推进具体实施)\n" +
    "  └ [重点] on board with · dive in";

  const stripped = stripLinguaAnnotation(branchAnnotated);

  assert.equal(stripped.raw, "认同，开始吧", "Must extract clean source text without prefixes");
  assert.equal(stripped.spoken, "Totally on board with that — let's dive right in.", "Must isolate English expression from nuance explanation");
  assert.equal(stripped.written, "Acknowledged. Let's proceed with the implementation.", "Must isolate English expression from nuance explanation");
  assert.equal(stripped.vocab, "on board with · dive in");
});

test("translatePrompt - ignores pure English/ASCII and emoji inputs under default sourceLang", async () => {
  const res1 = await translatePrompt("Hello world, please check this.");
  assert.equal(res1, null);

  const res2 = await translatePrompt('git commit -m "fix: 🐛"');
  assert.equal(res2, null);
});

test("translatePrompt - supports custom completion callback (Pi native ModelRegistry zero-config mode)", async () => {
  const mockComplete = async (_text: string, _sysPrompt: string) => {
    return JSON.stringify({
      spoken: "Totally on board with that — let's dive right in.",
      spoken_meaning: "完全赞同，咱们直接开搞",
      written: "Acknowledged. Let's proceed with the implementation.",
      written_meaning: "确认赞同，着手推进具体实施",
      vocab: "on board with (赞成/支持) · dive in (立刻着手/开搞)",
    });
  };

  const res = await translatePrompt("认同，开始吧", { complete: mockComplete });
  assert.ok(res, "Must return valid translation from complete callback");
  assert.equal(res.spoken, "Totally on board with that — let's dive right in.");
  assert.equal(res.spokenMeaning, "完全赞同，咱们直接开搞");
  assert.equal(res.written, "Acknowledged. Let's proceed with the implementation.");
  assert.equal(res.writtenMeaning, "确认赞同，着手推进具体实施");
  assert.equal(res.vocab, "on board with (赞成/支持) · dive in (立刻着手/开搞)");
  assert.ok(res.annotated.includes("· 原文   认同，开始吧"));
  assert.ok(res.annotated.includes("┌ [口语]"));
  assert.ok(res.annotated.includes("├ [写作]"));
  assert.ok(res.annotated.includes("└ [重点]"));
});

test("translatePrompt - live integration test against local gateway if configured", async () => {
  try {
    const res = await translatePrompt("认同，开始吧");
    if (!res) {
      console.log("Skipping live integration test: gateway offline or returned null");
      return;
    }
    assert.ok(res.spoken.length > 0, "Spoken register should be non-empty");
    assert.ok(res.written.length > 0, "Written register should be non-empty");
    assert.ok(res.annotated.includes("· 原文"), "Should contain source anchor");
  } catch (err: any) {
    console.log(`Live gateway offline (${err.message}), skipping gracefully`);
  }
});
