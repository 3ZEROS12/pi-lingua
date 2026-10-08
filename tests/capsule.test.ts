import test from "node:test";
import assert from "node:assert/strict";
import { formatCapsuleLine } from "../src/engine.js";

test("formatCapsuleLine - formats single-line compact representation for both slots", () => {
  const line = formatCapsuleLine(
    "二 ⇄ two",
    "Totally on board with that.",
    "Acknowledged. Let's proceed.",
    {
      slot1Short: "口",
      slot2Short: "写",
      maxCols: 80,
    }
  );

  assert.ok(line.startsWith("⇄ [二 ⇄ two] "));
  assert.ok(line.includes("口: Totally on board with that."));
  assert.ok(line.includes(" · 写: Acknowledged. Let's proceed."));
  assert.ok(!line.includes("\n"), "Must be strictly a single line");
});

test("formatCapsuleLine - dynamically truncates slots when maxCols is narrow without line break", () => {
  const line = formatCapsuleLine(
    "二 ⇄ two",
    "This feels a bit over-engineered; we'd be much better off just sticking with standard library.",
    "The proposed approach introduces unnecessary complexity. Native implementations are preferred.",
    {
      slot1Short: "口",
      slot2Short: "写",
      maxCols: 50,
    }
  );

  assert.ok(!line.includes("\n"), "Must remain strictly a single line under narrow column budget");
  assert.ok(line.includes("口: "));
  assert.ok(line.includes(" · 写: "));
});

test("formatCapsuleLine - handles single slot without slot 2", () => {
  const line = formatCapsuleLine(
    "two ⇄ 二",
    "Let's keep going.",
    undefined,
    {
      slot1Short: "Spk",
      maxCols: 60,
    }
  );

  assert.ok(line.startsWith("⇄ [two ⇄ 二] "));
  assert.ok(line.includes("Spk: Let's keep going."));
  assert.ok(!line.includes(" · "), "Must not include slot separator when slot 2 is absent");
});
