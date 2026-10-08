import { test } from "node:test";
import assert from "node:assert/strict";
import { splitSemanticChunks } from "../src/chunker.js";

test("splitSemanticChunks - preserves single chunk for normal short prompts", () => {
  const short1 = "吃什么？";
  assert.deepEqual(splitSemanticChunks(short1), ["吃什么？"]);

  const short2 = "这个方案有点过度设计了，不如直接用标准库实现";
  assert.deepEqual(splitSemanticChunks(short2), ["这个方案有点过度设计了，不如直接用标准库实现"]);

  // 验证用户实机犬吠案例：带有逗号和句号的常规长句绝对不应被随意拆碎
  const userDogfood = "需要你针对现在的github和npm上的说明文档做个针对性调整，保有人味儿是绝对必须的。";
  assert.deepEqual(splitSemanticChunks(userDogfood), [userDogfood], "User dogfood prompt must stay as 1 atomic chunk");
});

test("splitSemanticChunks - groups short consecutive sentences up to 90 chars without arbitrary over-splitting", () => {
  // 4 句短句，总字数在 90 字符内，绝不应碎成 4 页
  const fourSentences = "代码审查已完成。测试用例全绿通过。准备打包发布。请协助核对更新日志。";
  const chunks = splitSemanticChunks(fourSentences);
  assert.equal(chunks.length, 1, "Short multi-sentence prompt under budget must stay as 1 single chunk");
});

test("splitSemanticChunks - splits long multi-sentence input into atomic chunks", () => {
  const longPrompt =
    "考虑到额外的翻译模型所需求的Tokenkey可能会对纯plan订阅用户产生负担，或许我们可以考虑让其他同仁能够使用派出子agent的形式等，进行初步解决。之后才让他们考虑到底是否继续使用我们的extension，并告知Tokenkey可以带来更好的体验。有没有更好的办法存在？";

  const chunks = splitSemanticChunks(longPrompt, 90);
  assert.ok(chunks.length >= 2, "Long prompt with multiple sentences must split into 2 or more chunks");
  assert.ok(chunks.length <= 3, "Must not over-split into 4+ chunks");
  for (const chunk of chunks) {
    assert.ok(chunk.length > 0, "Each chunk must be non-empty");
  }
});
