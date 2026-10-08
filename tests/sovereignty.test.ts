import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveLabelsForLang, formatStatusReport, formatModelSelectionMessage } from "../src/presets.js";
import { buildSystemPrompt } from "../src/prompts.js";
import { formatTerminalAnnotation, stripLinguaAnnotation } from "../src/engine.js";

test("Primary Language Sovereignty - Japanese (ja) leaves ZERO Chinese in UI and labels", () => {
  const jaLabels = resolveLabelsForLang("ja");
  assert.equal(jaLabels.slot1Label, "口語");
  assert.equal(jaLabels.slot2Label, "文面");
  assert.equal(jaLabels.vocabLabel, "単語");
  assert.equal(jaLabels.sourceLabel, "原文");
  assert.equal(jaLabels.statusOriginal, "⇄ [二 ⇄ two] 原文");
  assert.equal(jaLabels.statusEnglish, "⇄ [二 ⇄ two] 英語");
  assert.equal(jaLabels.statusOff, "⇄ [二 ⇄ two]: オフ");

  // Notifications
  assert.ok(jaLabels.notifyOriginal?.includes("【原文モード】に切り替えました"));
  assert.ok(jaLabels.notifyEnglish?.includes("【英語モード】に切り替えました"));
  assert.ok(jaLabels.notifyOff?.includes("オフにしました"));
  assert.ok(jaLabels.notifyPaging?.includes("長文を分割しました"));
  assert.ok(jaLabels.notifyAgentHelp?.includes("言語やスタイルを変更したいですか？"));

  // Status report contains Japanese chrome
  const report = formatStatusReport(jaLabels, {
    mode: "original",
    sourceLang: "ja",
    targetLang: "en",
    activeModel: "auto",
  });
  assert.ok(report.includes("ステータスレポート"));
  assert.ok(report.includes("現在のモード: [original] (原文パススルー · 0ms非同期)"));
  assert.ok(report.includes("言語フロー: [ja ➔ en]"));
  assert.ok(report.includes("認証方式: Pi ネイティブインプロセス認証"));

  // Model selection
  const modelMsg = formatModelSelectionMessage(jaLabels, "auto", "• anthropic/claude-3-5-sonnet");
  assert.ok(modelMsg.includes("現在の学習モデル: auto"));
  assert.ok(modelMsg.includes("利用可能なモデル"));
});

test("Primary Language Sovereignty - English (en) leaves ZERO Chinese in UI and labels", () => {
  const enLabels = resolveLabelsForLang("en");
  assert.equal(enLabels.slot1Label, "Spoken");
  assert.equal(enLabels.slot2Label, "Written");
  assert.equal(enLabels.vocabLabel, "Vocab");
  assert.equal(enLabels.sourceLabel, "Source");
  assert.equal(enLabels.statusOriginal, "⇄ [two ⇄ 二] Original");
  assert.equal(enLabels.statusEnglish, "⇄ [two ⇄ 二] English");
  assert.equal(enLabels.statusOff, "⇄ [two ⇄ 二]: Off");

  // Status report has zero Chinese characters (excluding the cross-language totem "two ⇄ 二")
  const report = formatStatusReport(enLabels, {
    mode: "original",
    sourceLang: "en",
    targetLang: "ja",
    activeModel: "auto",
  });
  assert.ok(report.includes("Companion Status Report"));
  assert.ok(report.includes("[en ➔ ja]"));
  const reportWithoutTotem = report.replace("two ⇄ 二", "");
  assert.ok(!/[\u4e00-\u9fa5]/.test(reportWithoutTotem), "English status report must contain zero Chinese characters outside the totem");

  // Model selection has zero Chinese characters (excluding the cross-language totem "two ⇄ 二")
  const modelMsg = formatModelSelectionMessage(enLabels, "auto", "• google/gemini-3.8-flash");
  assert.ok(modelMsg.includes("Current companion model: auto"));
  const modelMsgWithoutTotem = modelMsg.replace("two ⇄ 二", "");
  assert.ok(!/[\u4e00-\u9fa5]/.test(modelMsgWithoutTotem), "English model selection must contain zero Chinese characters outside the totem");
});

test("System Prompt Sovereignty - Generates authentic Language A anchors and rules", () => {
  // Japanese prompt specifies Japanese nuances and Japanese golden anchors
  const jaPrompt = buildSystemPrompt("ja", "en");
  assert.ok(jaPrompt.includes("native Japanese (language A)"));
  assert.ok(jaPrompt.includes("賛成、始めましょう"));
  assert.ok(jaPrompt.includes("大賛成、すぐに始めよう"));
  assert.ok(jaPrompt.includes("過剰設計"));
  assert.ok(!jaPrompt.includes("认同，开始吧"), "Japanese prompt must not have Chinese anchor sentences");

  // Spanish prompt specifies Spanish nuances and Spanish golden anchors
  const esPrompt = buildSystemPrompt("es", "en");
  assert.ok(esPrompt.includes("native Spanish (language A)"));
  assert.ok(esPrompt.includes("De acuerdo, empecemos"));
  assert.ok(esPrompt.includes("Totalmente de acuerdo, vamos al grano"));

  // English prompt specifies English nuances
  const enPrompt = buildSystemPrompt("en", "ja");
  assert.ok(enPrompt.includes("native English (language A)"));
  assert.ok(enPrompt.includes("Sounds good, let's ship it."));
});

test("Visual Consistency - Source line tag matches [Original] format and aligns to column 11", () => {
  const annotated = formatTerminalAnnotation(
    "认同，开始吧",
    "Totally on board with that.",
    "Acknowledged. Let's proceed.",
    "on board with (赞成)",
    {
      sourceLabel: "原文",
      slot1Label: "口语",
      slot2Label: "写作",
      vocabLabel: "重点",
      spokenMeaning: "完全赞同",
    }
  );

  const lines = annotated.split("\n");
  // Line 0 must be formatted as:   · [原文] ...
  assert.ok(lines[0].includes("  · [原文] 认同，开始吧"));
  assert.ok(lines[1].includes("  ┌ [口语] Totally on board with that."));

  // Recovery via stripLinguaAnnotation works with bracketed source tag
  const recovered = stripLinguaAnnotation(annotated);
  assert.equal(recovered.raw, "认同，开始吧");
  assert.equal(recovered.spoken, "Totally on board with that.");
});
