import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveSlotsForPreset, SLOT_PRESETS, LANGUAGE_PRESETS } from "../src/presets.js";
import { renderCardLayout, formatCapsuleLine } from "../src/layout.js";
import type { LingualResult } from "../src/types.js";

test("slots: resolveSlotsForPreset returns valid configurations for all presets", () => {
  const presets = ["developer", "social", "japanese", "academic", "compact2"];
  for (const p of presets) {
    const slotsZh = resolveSlotsForPreset(p, "zh");
    assert.ok(Array.isArray(slotsZh));
    assert.ok(slotsZh.length >= 2);
    const sourceSlot = slotsZh.find((s) => s.role === "source");
    assert.ok(sourceSlot);
    assert.equal(sourceSlot.label, "原文");

    // Check English localization
    const slotsEn = resolveSlotsForPreset(p, "en");
    const sourceSlotEn = slotsEn.find((s) => s.role === "source");
    assert.equal(sourceSlotEn?.label, "Source");
  }
});

test("slots: compact2 preset enables only source and single translation slot", () => {
  const slots = resolveSlotsForPreset("compact2", "zh");
  const enabled = slots.filter((s) => s.enabled);
  assert.equal(enabled.length, 2);
  assert.equal(enabled[0].role, "source");
  assert.equal(enabled[1].role, "translation");
  assert.equal(enabled[1].label, "译文");

  // written and vocab should be disabled
  const written = slots.find((s) => s.id === "written");
  const vocab = slots.find((s) => s.id === "vocab");
  assert.equal(written?.enabled, false);
  assert.equal(vocab?.enabled, false);
});

test("slots: renderCardLayout in compact2 mode renders only source and └ [译文]", () => {
  const card: LingualResult = {
    sourceText: "我们继续优化",
    spoken: "Let's keep optimizing.",
    written: "We shall proceed with optimization.",
    vocab: "optimize · proceed",
    spokenMeaning: "继续优化吧",
    annotated: "",
  };

  const labels = LANGUAGE_PRESETS.zh;
  const compactSlots = resolveSlotsForPreset("compact2", "zh");

  const lines = renderCardLayout(card, labels, {
    slots: compactSlots,
    maxCols: 80,
  });

  const fullText = lines.join("\n");
  // Must contain [原文] and [译文]
  assert.ok(fullText.includes("[原文]"));
  assert.ok(fullText.includes("[译文]"));
  // Must NOT contain [写作] or [重点]
  assert.ok(!fullText.includes("[写作]"));
  assert.ok(!fullText.includes("[重点]"));
  // Translation branch must terminate with └ since there are no branches following it
  assert.ok(fullText.includes("└ [译文]"));
});

test("slots: renderCardLayout in social preset renders [Hook] and [Deep]", () => {
  const card: LingualResult = {
    sourceText: "零依赖架构提速10倍",
    spoken: "Zero-dep setup made it 10x faster!",
    written: "Migrated to zero-dependency architecture, achieving 10x speedup.",
    vocab: "zero-dep · speedup",
    annotated: "",
  };

  const labels = LANGUAGE_PRESETS.zh;
  const socialSlots = resolveSlotsForPreset("social", "zh");

  const lines = renderCardLayout(card, labels, {
    slots: socialSlots,
    maxCols: 80,
  });

  const fullText = lines.join("\n");
  assert.ok(fullText.includes("[Hook]"));
  assert.ok(fullText.includes("[Deep]"));
  assert.ok(fullText.includes("[重点]"));
});

test("slots: single-line capsule adapts to active slots", () => {
  const card: LingualResult = {
    sourceText: "测试胶囊",
    spoken: "Testing capsule.",
    written: "Verifying capsule flow.",
    annotated: "",
  };

  const labels = LANGUAGE_PRESETS.zh;
  const compactSlots = resolveSlotsForPreset("compact2", "zh");

  const lines = renderCardLayout(card, labels, {
    slots: compactSlots,
    isCompact: true,
    maxCols: 80,
  });

  assert.equal(lines.length, 1);
  assert.ok(lines[0].includes("⇄ [zh ⇄ en]"));
  assert.ok(lines[0].includes("译文: Testing capsule."));
  // compact2 has written disabled, so it shouldn't show slot2
  assert.ok(!lines[0].includes("Wrt:"));
  assert.ok(!lines[0].includes("写:"));
});
