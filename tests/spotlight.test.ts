import test from "node:test";
import assert from "node:assert/strict";
import { extractVocabPhrases, spotlightPhrases, formatTerminalAnnotation } from "../src/engine.js";

test("extractVocabPhrases - extracts clean phrases without parenthesis definitions, sorted by length descending", () => {
  const vocab = "on board with (赞成/支持) · dive in (立刻着手/开搞) · board (董事会)";
  const phrases = extractVocabPhrases(vocab);

  assert.deepEqual(phrases, ["on board with", "dive in", "board"]);
});

test("spotlightPhrases - non-destructively highlights matched phrases with ANSI underline without case alteration", () => {
  const text = "Totally on board with that — let's dive in right away.";
  const phrases = ["on board with", "dive in"];
  const highlighted = spotlightPhrases(text, phrases);

  assert.ok(highlighted.includes("\x1b[4mon board with\x1b[24m"), "Must underline 'on board with'");
  assert.ok(highlighted.includes("\x1b[4mdive in\x1b[24m"), "Must underline 'dive in'");
  assert.ok(highlighted.includes("Totally "), "Unmatched words must remain clean");
});

test("spotlightPhrases - successfully underlines CJK (Japanese/Chinese) expressions without ASCII word boundary failure", () => {
  const text = "いい感じですね、リリースしましょう！本番環境へデプロイを進めます。";
  const phrases = ["リリース", "本番環境"];
  const highlighted = spotlightPhrases(text, phrases);

  assert.ok(highlighted.includes("\x1b[4mリリース\x1b[24m"), "Must underline Japanese phrase 'リリース'");
  assert.ok(highlighted.includes("\x1b[4m本番環境\x1b[24m"), "Must underline Japanese phrase '本番環境'");
});

test("formatTerminalAnnotation - applies spotlight to spoken and written branches when vocab is present", () => {
  const annotated = formatTerminalAnnotation(
    "认同，开始吧",
    "Totally on board with that — let's dive in.",
    "Acknowledged. Let's dive into implementation.",
    "on board with (赞成) · dive in (立刻着手)",
    {
      sourceLabel: "原文",
      slot1Label: "口语",
      slot2Label: "写作",
      vocabLabel: "重点",
    }
  );

  // The branch lines must contain ANSI underline tags
  assert.ok(annotated.includes("\x1b[4m"), "Must contain ANSI underline start tag");
  assert.ok(annotated.includes("\x1b[24m"), "Must contain ANSI underline end tag");
});
