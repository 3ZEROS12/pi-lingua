import { test } from "node:test";
import assert from "node:assert/strict";
import {
  renderCardLayout,
  getEffectiveMaxCols,
  truncateVisual,
  getVisualWidth,
  wrapVisualText,
} from "../src/layout.js";
import { resolveLabelsForLang } from "../src/presets.js";
import type { LingualResult } from "../src/types.js";

test("getEffectiveMaxCols - guarantees minimum 25 columns under extreme SIGWINCH collapse", () => {
  assert.equal(getEffectiveMaxCols(10), 25);
  assert.equal(getEffectiveMaxCols(0), 25);
  assert.equal(getEffectiveMaxCols(-5), 25);
  assert.equal(getEffectiveMaxCols(80), 80);
});

test("renderCardLayout - renders tree branch for normal inputs within 9 lines", () => {
  const labels = resolveLabelsForLang("zh");
  const card: LingualResult = {
    sourceText: "把这个模块重构一下，消除技术债务",
    spoken: "Let's refactor this module to pay down tech debt.",
    spokenMeaning: "我们重构这个模块以偿还技术债务",
    written: "Refactor the module to eliminate accumulated technical debt.",
    writtenMeaning: "重构该模块以消除累积的技术债务",
    vocab: "refactor (重构) · technical debt (技术债务)",
    annotated: "",
  };

  const lines = renderCardLayout(card, labels, { maxCols: 80, maxLines: 9 });
  assert.ok(lines.length <= 9, `Lines in 80 cols must be <= 9 (got ${lines.length})`);
  assert.ok(lines.some((l) => l.includes("· [")), "Must have source line");
  assert.ok(lines.some((l) => l.includes("┌ [")), "Must have slot 1 branch");
  assert.ok(lines.some((l) => l.includes("├ [")), "Must have slot 2 branch");
  assert.ok(lines.some((l) => l.includes("└ [")), "Must have vocab branch");
});

test("renderCardLayout - guarantees output <= 9 lines on long multi-clause inputs with fallback", () => {
  const labels = resolveLabelsForLang("zh");
  const card: LingualResult = {
    sourceText: "这是一个非常漫长且复杂的系统重构需求说明，包含了对于状态机、终端排版以及国际化多语言支持的深度技术架构探讨，涉及各个核心模块的协同改造与测试断言防护",
    spoken: "We're tackling a deeply intricate architecture overhaul covering our state machines, terminal layouts, and comprehensive i18n support across all core modules.",
    spokenMeaning: "我们正在攻坚一个非常深度的架构重构，涵盖状态机、终端排版和跨模块的国际化支持",
    written: "Initiating a comprehensive structural refactoring encompassing finite state machine orchestration, deterministic terminal box models, and multi-lingual globalization across decoupled subsystems.",
    writtenMeaning: "对有限状态机编排、确定性终端盒模型及解耦子系统的多语言全球化展开全面的结构性重构",
    vocab: "state machine (状态机) · box model (盒模型) · orchestration (编排) · decoupling (解耦)",
    annotated: "",
  };

  // 1. 标准 80 列: 无论如何行数必须 <= 9
  const lines80 = renderCardLayout(card, labels, { maxCols: 80, maxLines: 9 });
  assert.ok(lines80.length <= 9, `Lines in 80 cols must be <= 9 (got ${lines80.length})`);

  // 2. 窄屏 45 列
  const lines45 = renderCardLayout(card, labels, { maxCols: 45, maxLines: 9 });
  assert.ok(lines45.length <= 9, `Lines in 45 cols must be <= 9 (got ${lines45.length})`);

  // 3. 极窄屏 30 列 (自动降级为单行胶囊模式)
  const lines30 = renderCardLayout(card, labels, { maxCols: 30, maxLines: 9 });
  assert.equal(lines30.length, 1, "Extreme narrow width must degrade to 1-line capsule");
  assert.ok(lines30[0].includes("⇄ ["), "Capsule line must contain header title");
});

test("renderCardLayout - explicit compact mode generates 1 line capsule with page tag", () => {
  const labels = resolveLabelsForLang("en");
  const card: LingualResult = {
    sourceText: "Please review the pull request.",
    spoken: "Could you take a look at the PR?",
    written: "Please conduct a formal review of the pull request.",
    annotated: "",
  };

  const lines = renderCardLayout(card, labels, {
    isCompact: true,
    pageTag: " [1/2]",
  });

  assert.equal(lines.length, 1);
  assert.ok(lines[0].includes("⇄ ["));
  assert.ok(lines[0].endsWith("[1/2]"));
});

test("wrapVisualText - handles consecutive punctuation and Kinsoku Shori", () => {
  const wrapped = wrapVisualText("这是一个测试文本，这里有很长的句子，并且标点符号不应该出现在行首。", 16);
  for (let i = 1; i < wrapped.length; i++) {
    const firstChar = wrapped[i][0];
    assert.ok(![",", "，", "。", "！", "？", "；"].includes(firstChar), `Line ${i} should not start with punctuation '${firstChar}'`);
  }
});
