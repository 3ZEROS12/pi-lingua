import { test } from "node:test";
import assert from "node:assert/strict";
import { splitSemanticChunks } from "../src/chunker.js";

test("splitSemanticChunks - preserves single chunk for normal short prompts", () => {
  const short1 = "吃什么？";
  assert.deepEqual(splitSemanticChunks(short1), ["吃什么？"]);

  const short2 = "这个方案有点过度设计了，不如直接用标准库实现";
  assert.deepEqual(splitSemanticChunks(short2), ["这个方案有点过度设计了，不如直接用标准库实现"]);
});

test("splitSemanticChunks - splits long multi-sentence input into atomic chunks", () => {
  const longPrompt =
    "考虑到额外的翻译模型所需求的Tokenkey可能会对纯plan订阅用户产生负担，或许我们可以考虑让其他同仁能够使用派出子agent的形式等，进行初步解决。之后才让他们考虑到底是否继续使用我们的extension，并告知Tokenkey可以带来更好的体验。有没有更好的办法存在？";

  const chunks = splitSemanticChunks(longPrompt, 70);
  assert.ok(chunks.length >= 2, "Long prompt with multiple sentences must split into 2 or more chunks");
  for (const chunk of chunks) {
    assert.ok(chunk.length > 0, "Each chunk must be non-empty");
  }
});
