import test from "node:test";
import assert from "node:assert/strict";
import { LingualLruCache, globalLingualCache } from "../src/cache.js";
import { translatePrompt } from "../src/engine.js";

test("LingualLruCache - basic get, set, and stats tracking", () => {
  const cache = new LingualLruCache<string>(3);
  assert.equal(cache.size, 0);

  cache.set("a", "alpha");
  cache.set("b", "beta");
  assert.equal(cache.size, 2);

  assert.equal(cache.get("a"), "alpha");
  assert.equal(cache.get("c"), undefined);

  const stats = cache.getStats();
  assert.equal(stats.hits, 1);
  assert.equal(stats.misses, 1);
  assert.equal(stats.size, 2);
  assert.equal(stats.capacity, 3);
});

test("LingualLruCache - evicts least recently used entry when capacity is exceeded", () => {
  const cache = new LingualLruCache<string>(3);
  cache.set("1", "one");
  cache.set("2", "two");
  cache.set("3", "three");

  // Access "1", making "2" the least recently used
  cache.get("1");

  // Insert "4", "2" should be evicted
  cache.set("4", "four");

  assert.equal(cache.get("1"), "one");
  assert.equal(cache.get("2"), undefined); // Evicted!
  assert.equal(cache.get("3"), "three");
  assert.equal(cache.get("4"), "four");
  assert.equal(cache.size, 3);
});

test("translatePrompt - hits in-memory LRU cache on repeated calls without invoking complete callback", async () => {
  globalLingualCache.clear();
  let calls = 0;

  const mockComplete = async (_text: string, _sysPrompt: string) => {
    calls++;
    return JSON.stringify({
      spoken: "Let's keep going.",
      spoken_meaning: "继续往下搞",
      written: "Proceed with the next steps.",
      written_meaning: "推进后续步骤",
      vocab: "keep going (继续推进) · proceed with (着手推进)",
    });
  };

  // First call -> misses cache, calls mockComplete
  const res1 = await translatePrompt("继续", { complete: mockComplete });
  assert.ok(res1);
  assert.equal(calls, 1);
  assert.equal(res1.spoken, "Let's keep going.");

  // Second call with same prompt -> hits cache, calls remains 1 (0ms)
  const res2 = await translatePrompt("继续", { complete: mockComplete });
  assert.ok(res2);
  assert.equal(calls, 1, "Mock complete must NOT be called on cache hit");
  assert.equal(res2.spoken, "Let's keep going.");

  const stats = globalLingualCache.getStats();
  assert.ok(stats.hits >= 1, "Cache hit count must increment");
});
