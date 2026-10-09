"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  DEFAULT_CONFIG: () => DEFAULT_CONFIG,
  LANGUAGE_PRESETS: () => LANGUAGE_PRESETS,
  LINGUAL_SYSTEM_PROMPT: () => LINGUAL_SYSTEM_PROMPT,
  LINGUA_SYSTEM_PROMPT: () => LINGUA_SYSTEM_PROMPT,
  LinguaLruCache: () => LinguaLruCache,
  LingualLruCache: () => LingualLruCache,
  MAX_TRANSLATION_CHARS: () => MAX_TRANSLATION_CHARS,
  MAX_TRANSLATION_LINES: () => MAX_TRANSLATION_LINES,
  buildSystemPrompt: () => buildSystemPrompt,
  extractVocabPhrases: () => extractVocabPhrases,
  formatCapsuleLine: () => formatCapsuleLine,
  formatModelSelectionMessage: () => formatModelSelectionMessage,
  formatStatusReport: () => formatStatusReport,
  formatSubRail: () => formatSubRail,
  formatTerminalAnnotation: () => formatTerminalAnnotation,
  formatTreeBranch: () => formatTreeBranch,
  getVisualWidth: () => getVisualWidth,
  globalLinguaCache: () => globalLinguaCache,
  globalLingualCache: () => globalLingualCache,
  invalidateUserConfigCache: () => invalidateUserConfigCache,
  isNonEnglish: () => isNonEnglish,
  loadUserConfig: () => loadUserConfig,
  loadUserLingualConfig: () => loadUserLingualConfig,
  parseLlmResponse: () => parseLlmResponse,
  resolveLabelsForLang: () => resolveLabelsForLang,
  sanitizePromptForTranslation: () => sanitizePromptForTranslation,
  shouldShieldBypass: () => shouldShieldBypass,
  shouldTriggerTranslation: () => shouldTriggerTranslation,
  splitSemanticChunks: () => splitSemanticChunks,
  spotlightPhrases: () => spotlightPhrases,
  stripLinguaAnnotation: () => stripLinguaAnnotation,
  stripLingualAnnotation: () => stripLingualAnnotation,
  translatePrompt: () => translatePrompt,
  truncateVisual: () => truncateVisual,
  wrapVisualText: () => wrapVisualText
});
module.exports = __toCommonJS(index_exports);

// src/presets.ts
var LANGUAGE_PRESETS = {
  zh: {
    slot1Label: "Spoken",
    slot2Label: "Written",
    vocabLabel: "Vocab",
    sourceLabel: "Original",
    hudTitle: "zh \u21C4 en",
    statusOriginal: "zh \u21C4 en",
    statusEnglish: "zh \u21C4 en",
    statusOff: "zh \u21C4 en: off",
    subNuanceLabel: "\u21B3",
    notifyOriginal: "[zh \u21C4 en] \u5DF2\u5207\u6362\u81F3\u3010\u539F\u6587\u6A21\u5F0F\u3011\uFF1A\u8F93\u5165\u4FDD\u6301\u7EAF\u51C0\u6BCD\u8BED\uFF0C\u4E0A\u65B9 HUD \u6D6E\u73B0\u4F34\u5B66\u89C6\u7A97",
    notifyEnglish: "[zh \u21C4 en] \u5DF2\u5207\u6362\u81F3\u3010\u82F1\u6587\u6A21\u5F0F\u3011\uFF1A\u53D1\u7ED9 AI \u7684\u8F93\u5165\u5C06\u81EA\u52A8\u8F6C\u6362\u4E3A\u7EAF\u6B63\u6280\u672F\u82F1\u6587",
    notifyOff: "[zh \u21C4 en] \u5DF2\u5173\u95ED\u4F34\u5B66",
    notifyPaging: "[zh \u21C4 en] \u957F\u53E5\u5DF2\u5207\u5206\u591A\u6BB5\uFF0C\u6309 Alt+. \u6216 Alt+, \u7FFB\u9875\u6D4F\u89C8",
    notifyNoHistory: "[zh \u21C4 en] \u6682\u65E0\u4E0A\u4E00\u6761\u4F34\u5B66\u8BB0\u5F55",
    notifyHistoryRestored: "[zh \u21C4 en] \u5DF2\u91CD\u65B0\u663E\u793A\u4E0A\u4E00\u6761\u4F34\u5B66\u5361\u7247",
    notifyAgentHelp: "\u{1F4A1} \u5207\u6362\u6BCD\u8BED\uFF1F\u76F4\u63A5\u8FD0\u884C /lingual-lang <zh|ja|en|es|fr|de> \u5373\u53EF\u5B9E\u65F6\u5207\u6362\u5E76\u6301\u4E45\u5316\uFF1B\u82E5\u9700\u5B9A\u5236\u7279\u6B8A\u98CE\u683C\uFF0C\u53EF\u76F4\u63A5\u5411 Agent \u63CF\u8FF0\u4F60\u7684\u5B9A\u5236\u504F\u597D\u3002",
    notifyModelSwitched: "\u4F34\u5B66\u6A21\u578B\u5DF2\u5207\u6362\u4E3A: {model}",
    notifyLangSwitched: "\u4F34\u5B66\u6BCD\u8BED\u5DF2\u5207\u6362\u4E3A: {lang}",
    notifyLangInvalid: "\u65E0\u6548\u7684\u8BED\u8A00\u4EE3\u7801\u3002\u652F\u6301\u7684\u8BED\u8A00\u4EE3\u7801: zh, ja, en, es, fr, de",
    notifyCompactOn: "[zh \u21C4 en] \u5DF2\u5F00\u542F\u5355\u884C\u80F6\u56CA\u6A21\u5F0F\uFF1A\u6781\u7B80\u5360\u4F4D\uFF0C\u4FDD\u62A4\u5206\u5C4F\u89C6\u91CE",
    notifyCompactOff: "[zh \u21C4 en] \u5DF2\u5207\u6362\u4E3A\u5DE6\u5BFC\u8F68\u6811\u72B6\u67B6\u6784\uFF1A\u5C55\u793A\u5B8C\u6574\u53CC\u6A21\u4E0E\u8BED\u611F",
    cmdDescMode: "\u5207\u6362\u4F34\u5B66\u6A21\u5F0F [zh \u21C4 en]: [\u539F\u6587] \u2794 [\u82F1\u6587] \u2794 [\u5173]",
    cmdDescStatus: "\u67E5\u770B\u4F34\u5B66\u63D2\u4EF6\u5F53\u524D\u72B6\u6001\u62A5\u544A\u4E0E\u6A21\u578B\u8BCA\u65AD: /lingual-status",
    cmdDescModel: "\u67E5\u770B\u6216\u5207\u6362\u4F34\u5B66\u6A21\u578B [zh \u21C4 en]: /lingual-model [model-id|auto]",
    cmdDescLang: "\u67E5\u770B\u6216\u5207\u6362\u4F34\u5B66\u6BCD\u8BED [zh \u21C4 en]: /lingual-lang [zh|ja|en|es|fr|de]",
    cmdDescCompact: "\u5207\u6362\u5355\u884C\u80F6\u56CA\u6A21\u5F0F\u4E0E\u5B8C\u6574\u6811\u72B6\u56FE: /lingual-compact",
    cmdDescLast: "\u91CD\u65B0\u56DE\u770B\u6216\u91CD\u73B0\u4E0A\u4E00\u6761\u4F34\u5B66\u5361\u7247: /lingual-last",
    cmdDescAgent: "\u67E5\u770B\u4F34\u5B66\u5B9A\u5236\u4E0E\u6BCD\u8BED\u5207\u6362\u6307\u5357: /lingual-agent",
    shortcutNextPage: "\u5207\u6362\u81F3\u4E0B\u4E00\u6BB5\u4F34\u5B66\u5207\u7247",
    shortcutPrevPage: "\u5207\u6362\u81F3\u4E0A\u4E00\u6BB5\u4F34\u5B66\u5207\u7247",
    capsuleSlot1Prefix: "\u53E3",
    capsuleSlot2Prefix: "\u5199",
    layoutCapsule: "\u5355\u884C\u80F6\u56CA\u6781\u7B80\u6D41 (1-Line Capsule)",
    layoutTree: "Trifecta \u5F00\u653E\u5F0F\u5DE6\u5BFC\u8F68\u6811\u72B6\u67B6\u6784 (\xB7 \u250C \u251C \u2514)",
    statusReportTitle: "\u8FD0\u884C\u72B6\u6001\u62A5\u544A",
    statusReportMode: "\u5F53\u524D\u6A21\u5F0F",
    statusReportFlow: "\u8BED\u8A00\u6D41\u5411",
    statusReportModel: "\u4F34\u5B66\u6A21\u578B",
    statusReportCache: "\u4F1A\u8BDD\u7F13\u5B58",
    statusReportLayout: "HUD\u5E03\u5C40: Trifecta \u5F00\u653E\u5F0F\u5DE6\u5BFC\u8F68\u6811\u72B6\u67B6\u6784 (\xB7 \u250C \u251C \u2514)",
    statusReportAuth: "\u51ED\u636E\u6A21\u5F0F: Pi \u539F\u751F\u8FDB\u7A0B\u5185\u8BA4\u8BC1 (Zero Config \xB7 \u96F6Token\u6CC4\u9732)",
    statusReportShortcuts: "\u5FEB\u6377\u64CD\u4F5C: /2 (\u5207\u6362\u6A21\u5F0F) \xB7 /lingual-lang (\u5207\u6BCD\u8BED) \xB7 /lingual-model (\u5207\u6A21\u578B) \xB7 /lingual-agent (\u5B9A\u5236\u8BED\u8A00)",
    modeDescOriginal: "\u539F\u6587\u76F4\u901A \xB7 0ms\u975E\u963B\u585E",
    modeDescEnglish: "\u82F1\u6587\u6A21\u5F0F \xB7 \u6DF1\u5EA6\u4EE3\u7801\u63A8\u7406",
    modeDescOff: "\u5DF2\u5173\u95ED",
    modelCurrentLabel: "\u5F53\u524D\u4F34\u5B66\u6A21\u578B",
    modelFollowSession: "\u8DDF\u968F\u4F1A\u8BDD",
    modelAvailableListHeader: "\u53EF\u7528\u6A21\u578B (\u8F93\u5165 /lingual-model <id> \u5207\u6362):",
    modelAutoFollowDesc: "auto (\u81EA\u52A8\u8DDF\u968F\u5F53\u524D\u4F1A\u8BDD\u4E3B\u6A21\u578B)",
    modelSelectHint: "\u53EF\u8F93\u5165 /lingual-model <model-id> \u6216 auto \u6307\u5B9A\u4F34\u5B66\u6A21\u578B\u3002"
  },
  ja: {
    slot1Label: "\u53E3\u8A9E",
    slot2Label: "\u6587\u9762",
    vocabLabel: "\u5358\u8A9E",
    sourceLabel: "\u539F\u6587",
    hudTitle: "ja \u21C4 en",
    statusOriginal: "ja \u21C4 en",
    statusEnglish: "ja \u21C4 en",
    statusOff: "ja \u21C4 en: off",
    subNuanceLabel: "\u21B3",
    notifyOriginal: "[ja \u21C4 en] \u3010\u539F\u6587\u30E2\u30FC\u30C9\u3011\u306B\u5207\u308A\u66FF\u3048\u307E\u3057\u305F\uFF1A\u5165\u529B\u306F\u539F\u6587\u306E\u307E\u307E\u3001\u4E0A\u90E8\u30AB\u30FC\u30C9\u3067\u82F1\u8A9E\u3092\u8868\u793A",
    notifyEnglish: "[ja \u21C4 en] \u3010\u82F1\u8A9E\u30E2\u30FC\u30C9\u3011\u306B\u5207\u308A\u66FF\u3048\u307E\u3057\u305F\uFF1AAI\u3078\u306E\u5165\u529B\u306F\u7D14\u7C8B\u306A\u6280\u8853\u82F1\u8A9E\u306B\u81EA\u52D5\u5909\u63DB\u3055\u308C\u307E\u3059",
    notifyOff: "[ja \u21C4 en] \u4F34\u8D70\u6A5F\u80FD\u3092\u30AA\u30D5\u306B\u3057\u307E\u3057\u305F",
    notifyPaging: "[ja \u21C4 en] \u9577\u6587\u3092\u5206\u5272\u3057\u307E\u3057\u305F\u3002Alt+. \u307E\u305F\u306F Alt+, \u3067\u30DA\u30FC\u30B8\u9001\u308A",
    notifyNoHistory: "[ja \u21C4 en] \u524D\u56DE\u306E\u8A18\u9332\u306F\u3042\u308A\u307E\u305B\u3093",
    notifyHistoryRestored: "[ja \u21C4 en] \u524D\u56DE\u306E\u30AB\u30FC\u30C9\u3092\u5FA9\u5143\u3057\u307E\u3057\u305F",
    notifyAgentHelp: "\u{1F4A1} \u6BCD\u8A9E\u306E\u5909\u66F4\u306F /lingual-lang <zh|ja|en|es|fr|de> \u3067\u5373\u6642\u5207\u308A\u66FF\u3048\u30FB\u4FDD\u5B58\u3067\u304D\u307E\u3059\u3002\u7279\u5225\u306A\u6587\u4F53\u3084\u8A9E\u57DF\u306E\u30AB\u30B9\u30BF\u30DE\u30A4\u30BA\u304C\u5FC5\u8981\u306A\u5834\u5408\u306F\u3001Agent \u306B\u76F4\u63A5\u3054\u8981\u671B\u3092\u304A\u4F1D\u3048\u304F\u3060\u3055\u3044\u3002",
    notifyModelSwitched: "\u30E2\u30C7\u30EB\u3092\u5207\u308A\u66FF\u3048\u307E\u3057\u305F: {model}",
    notifyLangSwitched: "\u6BCD\u8A9E\u3092\u5207\u308A\u66FF\u3048\u307E\u3057\u305F: {lang}",
    notifyLangInvalid: "\u7121\u52B9\u306A\u8A00\u8A9E\u30B3\u30FC\u30C9\u3067\u3059\u3002\u5BFE\u5FDC\u8A00\u8A9E: zh, ja, en, es, fr, de",
    notifyCompactOn: "[ja \u21C4 en] 1\u884C\u30AB\u30D7\u30BB\u30EB\u30E2\u30FC\u30C9\u3092\u6709\u52B9\u306B\u3057\u307E\u3057\u305F\uFF1A\u753B\u9762\u9818\u57DF\u3092\u6700\u5927\u9650\u78BA\u4FDD",
    notifyCompactOff: "[ja \u21C4 en] \u30D5\u30EB\u30C4\u30EA\u30FC\u8868\u793A\u306B\u5207\u308A\u66FF\u3048\u307E\u3057\u305F\uFF1A\u8A73\u7D30\u306A\u30CB\u30E5\u30A2\u30F3\u30B9\u3092\u8868\u793A",
    cmdDescMode: "\u30E2\u30FC\u30C9\u5207\u66FF [ja \u21C4 en]: [\u539F\u6587] \u2794 [\u82F1\u8A9E] \u2794 [\u30AA\u30D5]",
    cmdDescStatus: "\u72B6\u614B\u30EC\u30DD\u30FC\u30C8\u3068\u30E2\u30C7\u30EB\u8A3A\u65AD\u3092\u8868\u793A: /lingual-status",
    cmdDescModel: "\u5B66\u7FD2\u30E2\u30C7\u30EB\u306E\u78BA\u8A8D\u30FB\u5207\u66FF: /lingual-model [model-id|auto]",
    cmdDescLang: "\u4F34\u8D70\u306E\u6BCD\u8A9E\u3092\u78BA\u8A8D\u30FB\u5909\u66F4: /lingual-lang [zh|ja|en|es|fr|de]",
    cmdDescCompact: "1\u884C\u30AB\u30D7\u30BB\u30EB\u8868\u793A\u3068\u30D5\u30EB\u30C4\u30EA\u30FC\u306E\u5207\u66FF: /lingual-compact",
    cmdDescLast: "\u524D\u56DE\u306E\u4F34\u8D70\u30AB\u30FC\u30C9\u3092\u518D\u8868\u793A: /lingual-last",
    cmdDescAgent: "\u4F34\u8D70\u30AB\u30B9\u30BF\u30DE\u30A4\u30BA\u3068\u6BCD\u8A9E\u5909\u66F4\u306E\u6848\u5185\u3092\u8868\u793A: /lingual-agent",
    shortcutNextPage: "\u6B21\u306E\u30BB\u30B0\u30E1\u30F3\u30C8\u306B\u5207\u308A\u66FF\u3048",
    shortcutPrevPage: "\u524D\u306E\u30BB\u30B0\u30E1\u30F3\u30C8\u306B\u5207\u308A\u66FF\u3048",
    capsuleSlot1Prefix: "\u53E3",
    capsuleSlot2Prefix: "\u6587",
    layoutCapsule: "1\u884C\u30AB\u30D7\u30BB\u30EB\u8868\u793A (1-Line Capsule)",
    layoutTree: "Trifecta \u30AA\u30FC\u30D7\u30F3\u5DE6\u30EC\u30FC\u30EB\u30C4\u30EA\u30FC\u69CB\u9020 (\xB7 \u250C \u251C \u2514)",
    statusReportTitle: "\u30B9\u30C6\u30FC\u30BF\u30B9\u30EC\u30DD\u30FC\u30C8",
    statusReportMode: "\u73FE\u5728\u306E\u30E2\u30FC\u30C9",
    statusReportFlow: "\u8A00\u8A9E\u30D5\u30ED\u30FC",
    statusReportModel: "\u4F34\u8D70\u30E2\u30C7\u30EB",
    statusReportCache: "\u30BB\u30C3\u30B7\u30E7\u30F3\u30AD\u30E3\u30C3\u30B7\u30E5",
    statusReportLayout: "HUD\u30EC\u30A4\u30A2\u30A6\u30C8: Trifecta \u30AA\u30FC\u30D7\u30F3\u5DE6\u30EC\u30FC\u30EB\u30C4\u30EA\u30FC\u69CB\u9020 (\xB7 \u250C \u251C \u2514)",
    statusReportAuth: "\u8A8D\u8A3C\u65B9\u5F0F: Pi \u30CD\u30A4\u30C6\u30A3\u30D6\u30A4\u30F3\u30D7\u30ED\u30BB\u30B9\u8A8D\u8A3C (\u30BC\u30ED\u8A2D\u5B9A\u30FBToken\u5B89\u5168)",
    statusReportShortcuts: "\u30AF\u30A4\u30C3\u30AF\u64CD\u4F5C: /2 (\u30E2\u30FC\u30C9\u5207\u66FF) \xB7 /lingual-lang (\u6BCD\u8A9E\u5207\u66FF) \xB7 /lingual-model (\u30E2\u30C7\u30EB\u5207\u66FF) \xB7 /lingual-agent (\u30AB\u30B9\u30BF\u30DE\u30A4\u30BA)",
    modeDescOriginal: "\u539F\u6587\u30D1\u30B9\u30B9\u30EB\u30FC \xB7 0ms\u975E\u540C\u671F",
    modeDescEnglish: "\u82F1\u8A9E\u30E2\u30FC\u30C9 \xB7 \u9AD8\u5EA6\u30B3\u30FC\u30C9\u63A8\u8AD6",
    modeDescOff: "\u30AA\u30D5",
    modelCurrentLabel: "\u73FE\u5728\u306E\u5B66\u7FD2\u30E2\u30C7\u30EB",
    modelFollowSession: "\u30BB\u30C3\u30B7\u30E7\u30F3\u9023\u52D5",
    modelAvailableListHeader: "\u5229\u7528\u53EF\u80FD\u306A\u30E2\u30C7\u30EB (/lingual-model <id> \u3067\u5207\u66FF):",
    modelAutoFollowDesc: "auto (\u30BB\u30C3\u30B7\u30E7\u30F3\u306E\u4E3B\u30E2\u30C7\u30EB\u306B\u81EA\u52D5\u8FFD\u5F93)",
    modelSelectHint: "/lingual-model <model-id> \u307E\u305F\u306F auto \u3092\u5165\u529B\u3057\u3066\u30E2\u30C7\u30EB\u3092\u6307\u5B9A\u3067\u304D\u307E\u3059\u3002"
  },
  en: {
    slot1Label: "Spoken",
    slot2Label: "Written",
    vocabLabel: "Vocab",
    sourceLabel: "Source",
    hudTitle: "en \u21C4 ja",
    statusOriginal: "en \u21C4 ja",
    statusEnglish: "en \u21C4 ja",
    statusOff: "en \u21C4 ja: off",
    subNuanceLabel: "\u21B3",
    notifyOriginal: "[en \u21C4 ja] Switched to [Original] mode: Prompt passed to AI unmodified, HUD displays translations",
    notifyEnglish: "[en \u21C4 ja] Switched to [English] mode: Prompt transformed into idiomatic technical English",
    notifyOff: "[en \u21C4 ja] Companion turned off",
    notifyPaging: "[en \u21C4 ja] Long prompt segmented. Press Alt+. or Alt+, to navigate pages",
    notifyNoHistory: "[en \u21C4 ja] No previous companion card recorded",
    notifyHistoryRestored: "[en \u21C4 ja] Restored previous companion card",
    notifyAgentHelp: "\u{1F4A1} Switch native language with /lingual-lang <zh|ja|en|es|fr|de> anytime; for advanced prompt or style customization, simply describe your preferences to your Agent.",
    notifyModelSwitched: "Companion model switched to: {model}",
    notifyLangSwitched: "Native language switched to: {lang}",
    notifyLangInvalid: "Invalid language code. Supported: zh, ja, en, es, fr, de",
    notifyCompactOn: "[en \u21C4 ja] Single-line capsule mode enabled for compact split panes",
    notifyCompactOff: "[en \u21C4 ja] Full tree layout restored",
    cmdDescMode: "Cycle companion mode [en \u21C4 ja]: [Original] \u2794 [English] \u2794 [Off]",
    cmdDescStatus: "Display companion status report and model diagnosis: /lingual-status",
    cmdDescModel: "Inspect or switch companion model: /lingual-model [model-id|auto]",
    cmdDescLang: "View or switch companion native language: /lingual-lang [zh|ja|en|es|fr|de]",
    cmdDescCompact: "Toggle single-line capsule mode: /lingual-compact",
    cmdDescLast: "Replay previous companion card: /lingual-last",
    cmdDescAgent: "Display companion customization & language guide: /lingual-agent",
    shortcutNextPage: "Switch to next companion segment",
    shortcutPrevPage: "Switch to previous companion segment",
    capsuleSlot1Prefix: "Spk",
    capsuleSlot2Prefix: "Wrt",
    layoutCapsule: "Single-Line Capsule (1-Line)",
    layoutTree: "Trifecta Minimalist Left-Rail Tree (\xB7 \u250C \u251C \u2514)",
    statusReportTitle: "Companion Status Report",
    statusReportMode: "Current mode",
    statusReportFlow: "Language flow",
    statusReportModel: "Companion model",
    statusReportCache: "Session Cache",
    statusReportLayout: "HUD Layout: Trifecta Minimalist Left-Rail Tree (\xB7 \u250C \u251C \u2514)",
    statusReportAuth: "Auth: Pi Native In-Process Auth (Zero Config \xB7 Secure)",
    statusReportShortcuts: "Shortcuts: /2 (mode) \xB7 /lingual-lang (lang) \xB7 /lingual-model (model) \xB7 /lingual-agent (customize)",
    modeDescOriginal: "Pass-through \xB7 0ms non-blocking",
    modeDescEnglish: "English mode \xB7 Deep reasoning",
    modeDescOff: "Disabled",
    modelCurrentLabel: "Current companion model",
    modelFollowSession: "Follow session",
    modelAvailableListHeader: "Available models (run /lingual-model <id> to switch):",
    modelAutoFollowDesc: "auto (Automatically follows active session model)",
    modelSelectHint: "Run /lingual-model <model-id> or auto to designate a model."
  },
  es: {
    slot1Label: "Coloquial",
    slot2Label: "Escrito",
    vocabLabel: "Vocab",
    sourceLabel: "Original",
    hudTitle: "es \u21C4 en",
    statusOriginal: "es \u21C4 en",
    statusEnglish: "es \u21C4 en",
    statusOff: "es \u21C4 en: off",
    subNuanceLabel: "\u21B3",
    notifyOriginal: "[es \u21C4 en] Cambiado al modo [Original]: El texto se env\xEDa sin modificar",
    notifyEnglish: "[es \u21C4 en] Cambiado al modo [Ingl\xE9s]: El texto se transforma en ingl\xE9s t\xE9cnico",
    notifyOff: "[es \u21C4 en] Asistente desactivado",
    notifyPaging: "[es \u21C4 en] Texto largo segmentado. Presione Alt+. o Alt+, para navegar",
    notifyNoHistory: "[es \u21C4 en] No hay registros anteriores",
    notifyHistoryRestored: "[es \u21C4 en] Tarjeta anterior restaurada",
    notifyAgentHelp: "\u{1F4A1} Cambie su idioma nativo con /lingual-lang <zh|ja|en|es|fr|de> al instante; para estilos personalizados, simplemente ind\xEDquele sus preferencias a su Agente.",
    notifyModelSwitched: "Modelo cambiado a: {model}",
    notifyLangSwitched: "Idioma nativo cambiado a: {lang}",
    notifyLangInvalid: "C\xF3digo de idioma no v\xE1lido. Admitidos: zh, ja, en, es, fr, de",
    notifyCompactOn: "[es \u21C4 en] Modo c\xE1psula de una l\xEDnea activado",
    notifyCompactOff: "[es \u21C4 en] Modo \xE1rbol completo restaurado",
    cmdDescMode: "Cambiar modo [es \u21C4 en]: [Original] \u2794 [Ingl\xE9s] \u2794 [Apagado]",
    cmdDescStatus: "Mostrar diagn\xF3stico y estado del modelo: /lingual-status",
    cmdDescModel: "Consultar o cambiar modelo: /lingual-model [model-id|auto]",
    cmdDescLang: "Ver o cambiar idioma nativo: /lingual-lang [zh|ja|en|es|fr|de]",
    cmdDescCompact: "Alternar modo c\xE1psula de una l\xEDnea: /lingual-compact",
    cmdDescLast: "Reaparecer tarjeta anterior: /lingual-last",
    cmdDescAgent: "Ver gu\xEDa de personalizaci\xF3n y cambio de idioma: /lingual-agent",
    shortcutNextPage: "Cambiar al siguiente segmento",
    shortcutPrevPage: "Cambiar al segmento anterior",
    capsuleSlot1Prefix: "Col",
    capsuleSlot2Prefix: "Esc",
    layoutCapsule: "C\xE1psula de una l\xEDnea (1-Line Capsule)",
    layoutTree: "Trifecta \xE1rbol de gu\xEDa izquierda (\xB7 \u250C \u251C \u2514)",
    statusReportTitle: "Informe de estado",
    statusReportMode: "Modo actual",
    statusReportFlow: "Flujo de idiomas",
    statusReportModel: "Modelo asistente",
    statusReportCache: "Cach\xE9 de sesi\xF3n",
    statusReportLayout: "Dise\xF1o HUD: Trifecta \xE1rbol de gu\xEDa izquierda (\xB7 \u250C \u251C \u2514)",
    statusReportAuth: "Autenticaci\xF3n: Proceso nativo de Pi (Sin config \xB7 Seguro)",
    statusReportShortcuts: "Accesos directos: /2 (modo) \xB7 /lingual-lang (idioma) \xB7 /lingual-model (modelo) \xB7 /lingual-agent (personalizar)",
    modeDescOriginal: "Directo \xB7 0ms no bloqueante",
    modeDescEnglish: "Modo ingl\xE9s \xB7 Razonamiento profundo",
    modeDescOff: "Apagado",
    modelCurrentLabel: "Modelo actual",
    modelFollowSession: "Siguiendo sesi\xF3n",
    modelAvailableListHeader: "Modelos disponibles (ejecute /lingual-model <id>):",
    modelAutoFollowDesc: "auto (Sigue autom\xE1ticamente el modelo de la sesi\xF3n)",
    modelSelectHint: "Use /lingual-model <id> o auto para asignar un modelo."
  },
  fr: {
    slot1Label: "Oral",
    slot2Label: "\xC9crit",
    vocabLabel: "Vocab",
    sourceLabel: "Source",
    hudTitle: "fr \u21C4 en",
    statusOriginal: "fr \u21C4 en",
    statusEnglish: "fr \u21C4 en",
    statusOff: "fr \u21C4 en: off",
    subNuanceLabel: "\u21B3",
    notifyOriginal: "[fr \u21C4 en] Mode [Original] activ\xE9 : Votre texte reste inchang\xE9",
    notifyEnglish: "[fr \u21C4 en] Mode [Anglais] activ\xE9 : Votre prompt est traduit en anglais technique",
    notifyOff: "[fr \u21C4 en] Compagnon d\xE9sactiv\xE9",
    notifyPaging: "[fr \u21C4 en] Long texte segment\xE9. Appuyez sur Alt+. ou Alt+, pour parcourir",
    notifyNoHistory: "[fr \u21C4 en] Aucun historique pr\xE9c\xE9dent",
    notifyHistoryRestored: "[fr \u21C4 en] Carte pr\xE9c\xE9dente restaur\xE9e",
    notifyAgentHelp: "\u{1F4A1} Changez de langue avec /lingual-lang <zh|ja|en|es|fr|de> \xE0 tout moment ; pour personnaliser le style ou le ton, d\xE9crivez simplement vos pr\xE9f\xE9rences \xE0 votre Agent.",
    notifyModelSwitched: "Mod\xE8le chang\xE9 pour : {model}",
    notifyLangSwitched: "Langue maternelle chang\xE9e en : {lang}",
    notifyLangInvalid: "Code de langue invalide. Pris en charge : zh, ja, en, es, fr, de",
    notifyCompactOn: "[fr \u21C4 en] Mode capsule sur une seule ligne activ\xE9",
    notifyCompactOff: "[fr \u21C4 en] Mode arborescence compl\xE8te restaur\xE9",
    cmdDescMode: "Changer de mode [fr \u21C4 en]: [Original] \u2794 [Anglais] \u2794 [D\xE9sactiv\xE9]",
    cmdDescStatus: "Afficher le rapport d'\xE9tat et le diagnostic: /lingual-status",
    cmdDescModel: "Consulter ou changer de mod\xE8le: /lingual-model [model-id|auto]",
    cmdDescLang: "Afficher ou changer la langue maternelle: /lingual-lang [zh|ja|en|es|fr|de]",
    cmdDescCompact: "Basculer le mode capsule sur une ligne: /lingual-compact",
    cmdDescLast: "R\xE9afficher la carte pr\xE9c\xE9dente: /lingual-last",
    cmdDescAgent: "Afficher le guide de personnalisation et de changement de langue : /lingual-agent",
    shortcutNextPage: "Passer au segment suivant",
    shortcutPrevPage: "Passer au segment pr\xE9c\xE9dent",
    capsuleSlot1Prefix: "Oral",
    capsuleSlot2Prefix: "\xC9crit",
    layoutCapsule: "Capsule sur une ligne (1-Line Capsule)",
    layoutTree: "Disposition HUD : Arbre guide gauche Trifecta (\xB7 \u250C \u251C \u2514)",
    statusReportTitle: "Rapport d'\xE9tat",
    statusReportMode: "Mode actuel",
    statusReportFlow: "Flux linguistique",
    statusReportModel: "Mod\xE8le compagnon",
    statusReportCache: "Cache de session",
    statusReportLayout: "Disposition HUD : Arbre guide gauche Trifecta (\xB7 \u250C \u251C \u2514)",
    statusReportAuth: "Authentification : Processus interne Pi natif (Z\xE9ro config \xB7 S\xE9curis\xE9)",
    statusReportShortcuts: "Raccourcis : /2 (mode) \xB7 /lingual-lang (langue) \xB7 /lingual-model (mod\xE8le) \xB7 /lingual-agent (personnaliser)",
    modeDescOriginal: "Passerelle directe \xB7 0ms non bloquant",
    modeDescEnglish: "Mode anglais \xB7 Raisonnement approfondi",
    modeDescOff: "D\xE9sactiv\xE9",
    modelCurrentLabel: "Mod\xE8le actuel",
    modelFollowSession: "Suit la session",
    modelAvailableListHeader: "Mod\xE8les disponibles (tapez /lingual-model <id>):",
    modelAutoFollowDesc: "auto (Suit automatiquement le mod\xE8le principal)",
    modelSelectHint: "Entrez /lingual-model <id> ou auto pour d\xE9finir le mod\xE8le."
  },
  de: {
    slot1Label: "Gesprochen",
    slot2Label: "Schriftlich",
    vocabLabel: "Wortschatz",
    sourceLabel: "Quelle",
    hudTitle: "de \u21C4 en",
    statusOriginal: "de \u21C4 en",
    statusEnglish: "de \u21C4 en",
    statusOff: "de \u21C4 en: off",
    subNuanceLabel: "\u21B3",
    notifyOriginal: "[de \u21C4 en] Modus [Original] aktiviert: Eingabe wird unver\xE4ndert weitergeleitet",
    notifyEnglish: "[de \u21C4 en] Modus [Englisch] aktiviert: Eingabe wird in technisches Englisch \xFCbersetzt",
    notifyOff: "[de \u21C4 en] Begleiter deaktiviert",
    notifyPaging: "[de \u21C4 en] Langer Text segmentiert. Mit Alt+. oder Alt+, bl\xE4ttern",
    notifyNoHistory: "[de \u21C4 en] Kein vorheriger Eintrag vorhanden",
    notifyHistoryRestored: "[de \u21C4 en] Vorherige Karte wiederhergestellt",
    notifyAgentHelp: "\u{1F4A1} Wechseln Sie die Muttersprache mit /lingual-lang <zh|ja|en|es|fr|de> jederzeit; f\xFCr benutzerdefinierte Stile teilen Sie Ihrem Agenten einfach Ihre W\xFCnsche mit.",
    notifyModelSwitched: "Modell gewechselt zu: {model}",
    notifyLangSwitched: "Muttersprache ge\xE4ndert zu: {lang}",
    notifyLangInvalid: "Ung\xFCltiger Sprachcode. Unterst\xFCtzt: zh, ja, en, es, fr, de",
    notifyCompactOn: "[de \u21C4 en] Einzeiliger Kapselmodus aktiviert",
    notifyCompactOff: "[de \u21C4 en] Vollst\xE4ndige Baumansicht wiederhergestellt",
    cmdDescMode: "Modus umschalten [de \u21C4 en]: [Original] \u2794 [Englisch] \u2794 [Aus]",
    cmdDescStatus: "Statusbericht und Modell-Diagnose anzeigen: /lingual-status",
    cmdDescModel: "Modell pr\xFCfen oder wechseln: /lingual-model [model-id|auto]",
    cmdDescLang: "Muttersprache anzeigen oder wechseln: /lingual-lang [zh|ja|en|es|fr|de]",
    cmdDescCompact: "Einzeiligen Kapselmodus umschalten: /lingual-compact",
    cmdDescLast: "Vorherige Karte erneut anzeigen: /lingual-last",
    cmdDescAgent: "Anleitung zur Anpassung und Sprachumstellung anzeigen: /lingual-agent",
    shortcutNextPage: "Zum n\xE4chsten Segment wechseln",
    shortcutPrevPage: "Zum vorherigen Segment wechseln",
    capsuleSlot1Prefix: "Ges",
    capsuleSlot2Prefix: "Sch",
    layoutCapsule: "Einzeilige Kapsel (1-Line Capsule)",
    layoutTree: "HUD-Layout: Trifecta Minimalistische Baumstruktur (\xB7 \u250C \u251C \u2514)",
    statusReportTitle: "Statusbericht",
    statusReportMode: "Aktueller Modus",
    statusReportFlow: "Sprachfluss",
    statusReportModel: "Begleitmodell",
    statusReportCache: "Sitzungscache",
    statusReportLayout: "HUD-Layout: Trifecta Minimalistische Baumstruktur (\xB7 \u250C \u251C \u2514)",
    statusReportAuth: "Authentifizierung: Pi nativer In-Process Modus (Zero Config \xB7 Sicher)",
    statusReportShortcuts: "Befehle: /2 (Modus) \xB7 /lingual-lang (Sprache) \xB7 /lingual-model (Modell) \xB7 /lingual-agent (Anpassen)",
    modeDescOriginal: "Direkt \xB7 0ms nicht blockierend",
    modeDescEnglish: "Englisch-Modus \xB7 Tiefgreifende Logik",
    modeDescOff: "Aus",
    modelCurrentLabel: "Aktuelles Modell",
    modelFollowSession: "Sitzungsmodell",
    modelAvailableListHeader: "Verf\xFCgbare Modelle (/lingual-model <id> ausf\xFChren):",
    modelAutoFollowDesc: "auto (Folgt automatisch dem aktiven Sitzungsmodell)",
    modelSelectHint: "Geben Sie /lingual-model <id> oder auto ein."
  }
};
function resolveLabelsForLang(lang, overrides) {
  const norm = (lang || "zh").toLowerCase().split("-")[0];
  const target = LANGUAGE_PRESETS[norm] || LANGUAGE_PRESETS.zh;
  return {
    ...LANGUAGE_PRESETS.en,
    // 1. 英文全量保底 (保证任何新增 key 不为空，不泄露中文)
    ...target,
    // 2. 目标母语官方预设
    ...overrides || {}
    // 3. 用户显式覆盖
  };
}
function formatStatusReport(labels, info) {
  const modeDesc = info.mode === "original" ? labels.modeDescOriginal || "Original pass-through" : info.mode === "english" ? labels.modeDescEnglish || "English deep reasoning" : labels.modeDescOff || "Off";
  const layoutDesc = info.layout === "capsule" ? labels.layoutCapsule || "Single-Line Capsule (1-Line)" : labels.layoutTree || "Trifecta Minimalist Left-Rail Tree (\xB7 \u250C \u251C \u2514)";
  const lines = [
    `\u21C4 [${labels.hudTitle}] ${labels.statusReportTitle || "Status Report"}`,
    `\u2022 ${labels.statusReportMode || "Mode"}: [${info.mode}] (${modeDesc})`,
    `\u2022 ${labels.statusReportFlow || "Flow"}: [${info.sourceLang} \u2794 ${info.targetLang || "en"}]`,
    `\u2022 ${labels.statusReportModel || "Model"}: ${info.activeModel}`
  ];
  if (info.cacheStats) {
    const total = info.cacheStats.hits + info.cacheStats.misses;
    const rate = total > 0 ? Math.round(info.cacheStats.hits / total * 100) : 0;
    lines.push(
      `\u2022 ${labels.statusReportCache || "Cache"}: ${info.cacheStats.hits} hits / ${total} total (${rate}% hit rate) \xB7 ${info.cacheStats.size}/${info.cacheStats.capacity} items`
    );
  }
  lines.push(
    `\u2022 ${labels.statusReportLayout || "Layout"}: ${layoutDesc}`,
    `\u2022 ${labels.statusReportAuth || "Auth: Pi Native In-Process Auth"}`,
    `\u2022 ${labels.statusReportShortcuts || "Shortcuts: /2 \xB7 /lingual-lang \xB7 /lingual-compact \xB7 /lingual-model \xB7 /lingual-agent"}`
  );
  return lines.join("\n");
}
function formatModelSelectionMessage(labels, currentActive, availableList) {
  let msg = `[${labels.hudTitle}] ${labels.modelCurrentLabel || "Current model"}: ${currentActive}
`;
  if (availableList) {
    msg += `${labels.modelAvailableListHeader || "Available models:"}
${availableList}
\u2022 ${labels.modelAutoFollowDesc || "auto"}
`;
  }
  msg += labels.modelSelectHint || "Specify model with /lingual-model <model-id> or auto.";
  return msg;
}

// src/chunker.ts
function splitSemanticChunks(text, maxChunkChars = 65) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.length <= maxChunkChars) {
    return [trimmed];
  }
  const rawSentences = trimmed.split(/([。！？；\n]|(?<=[.!?])\s+)/);
  const sentences = [];
  let cur = "";
  for (let i = 0; i < rawSentences.length; i++) {
    const part = rawSentences[i];
    if (!part) continue;
    cur += part;
    if (/[。！？；\n]/.test(part) || /(?<=[.!?])\s+/.test(part)) {
      if (cur.trim()) sentences.push(cur.trim());
      cur = "";
    }
  }
  if (cur.trim()) {
    sentences.push(cur.trim());
  }
  if (sentences.length <= 1) {
    if (trimmed.length <= maxChunkChars) {
      return [trimmed];
    }
    const commaParts = trimmed.split(/([，,、])/);
    const subChunks = [];
    let subCur = "";
    for (const cp of commaParts) {
      if (!cp) continue;
      if (subCur.length + cp.length <= maxChunkChars || subCur === "") {
        subCur += cp;
      } else {
        if (subCur.trim()) subChunks.push(subCur.trim());
        subCur = cp;
      }
    }
    if (subCur.trim()) subChunks.push(subCur.trim());
    const boundedChunks = [];
    for (const chunk of subChunks) {
      if (chunk.length <= maxChunkChars) {
        boundedChunks.push(chunk);
      } else {
        let remain = chunk;
        while (remain.length > maxChunkChars) {
          const slicePoint = remain.lastIndexOf(" ", maxChunkChars);
          const splitIdx = slicePoint > 10 ? slicePoint : maxChunkChars;
          boundedChunks.push(remain.slice(0, splitIdx).trim());
          remain = remain.slice(splitIdx).trim();
        }
        if (remain.trim()) {
          boundedChunks.push(remain.trim());
        }
      }
    }
    return boundedChunks.length > 0 ? boundedChunks : [trimmed];
  }
  const chunks = [];
  let chunkBuffer = "";
  for (const s of sentences) {
    if (chunkBuffer.length + s.length <= maxChunkChars || chunkBuffer === "") {
      chunkBuffer += (chunkBuffer ? " " : "") + s;
    } else {
      if (chunkBuffer.trim()) chunks.push(chunkBuffer.trim());
      chunkBuffer = s;
    }
  }
  if (chunkBuffer.trim()) {
    chunks.push(chunkBuffer.trim());
  }
  return chunks.length > 0 ? chunks : [trimmed];
}

// src/prompts.ts
var LANGUAGE_SPECS = {
  zh: {
    name: "Chinese",
    nativeName: "\u4E2D\u6587",
    meaningInstruction: "in native Chinese",
    vocabInstruction: 'in Chinese in parentheses separated by " \xB7 " (e.g. "term1 (\u4E2D\u6587\u91CA\u4E49) \xB7 term2 (\u4E2D\u6587\u91CA\u4E49) \xB7 ...")',
    anchors: [
      {
        input: "\u8BA4\u540C\uFF0C\u5F00\u59CB\u5427",
        spoken: "Totally on board with that \u2014 let's dive right in.",
        spoken_meaning: "\u5B8C\u5168\u8D5E\u540C\uFF0C\u54B1\u4EEC\u76F4\u63A5\u5F00\u641E",
        written: "Acknowledged. Let's proceed with the implementation.",
        written_meaning: "\u786E\u8BA4\u8D5E\u540C\uFF0C\u7740\u624B\u63A8\u8FDB\u5177\u4F53\u5B9E\u65BD",
        vocab: "on board with (\u8D5E\u6210/\u652F\u6301) \xB7 dive in (\u7ACB\u523B\u7740\u624B/\u5F00\u641E)"
      },
      {
        input: "\u7EE7\u7EED",
        spoken: "Let's keep going.",
        spoken_meaning: "\u7EE7\u7EED\u5F80\u4E0B\u641E",
        written: "Proceed with the next steps.",
        written_meaning: "\u63A8\u8FDB\u540E\u7EED\u6B65\u9AA4",
        vocab: "keep going (\u7EE7\u7EED\u63A8\u8FDB) \xB7 proceed with (\u7740\u624B\u8FDB\u884C)"
      },
      {
        input: "\u8FD9\u4E2A\u65B9\u6848\u6709\u70B9\u8FC7\u5EA6\u8BBE\u8BA1\u4E86\uFF0C\u4E0D\u5982\u76F4\u63A5\u7528\u6807\u51C6\u5E93\u5B9E\u73B0",
        spoken: "This feels a bit over-engineered; we'd be much better off just sticking with the standard library.",
        spoken_meaning: "\u611F\u89C9\u6709\u70B9\u8FC7\u5EA6\u8BBE\u8BA1\u4E86\uFF0C\u7528\u6807\u51C6\u5E93\u5212\u7B97\u5F97\u591A",
        written: "The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.",
        written_meaning: "\u8BE5\u65B9\u6848\u5F15\u5165\u4E86\u4E0D\u5FC5\u8981\u7684\u590D\u6742\u5EA6\uFF0C\u5EFA\u8BAE\u4F18\u5148\u91C7\u7528\u539F\u751F\u6807\u51C6\u5E93\u5B9E\u73B0",
        vocab: "over-engineered (\u8FC7\u5EA6\u5DE5\u7A0B\u5316) \xB7 be better off (\u505A\u67D0\u4E8B\u66F4\u5408\u9002/\u5212\u7B97) \xB7 stick with (\u575A\u6301\u4F7F\u7528/\u6CBF\u7528) \xB7 leverage (\u5229\u7528/\u501F\u52A9)"
      }
    ]
  },
  ja: {
    name: "Japanese",
    nativeName: "\u65E5\u672C\u8A9E",
    meaningInstruction: "in native Japanese",
    vocabInstruction: 'in Japanese in parentheses separated by " \xB7 " (e.g. "term1 (\u65E5\u672C\u8A9E\u89E3\u8AAC) \xB7 term2 (\u65E5\u672C\u8A9E\u89E3\u8AAC) \xB7 ...")',
    anchors: [
      {
        input: "\u8CDB\u6210\u3001\u59CB\u3081\u307E\u3057\u3087\u3046",
        spoken: "Totally on board with that \u2014 let's dive right in.",
        spoken_meaning: "\u5927\u8CDB\u6210\u3001\u3059\u3050\u306B\u59CB\u3081\u3088\u3046",
        written: "Acknowledged. Let's proceed with the implementation.",
        written_meaning: "\u540C\u610F\u3057\u307E\u3057\u305F\u3002\u5B9F\u88C5\u3092\u9032\u3081\u307E\u3059",
        vocab: "on board with (\u8CDB\u6210/\u652F\u6301) \xB7 dive in (\u3059\u3050\u306B\u7740\u624B\u3059\u308B)"
      },
      {
        input: "\u7D9A\u3051\u3066\u304F\u3060\u3055\u3044",
        spoken: "Let's keep going.",
        spoken_meaning: "\u305D\u306E\u307E\u307E\u9032\u3081\u3088\u3046",
        written: "Proceed with the next steps.",
        written_meaning: "\u6B21\u306E\u5DE5\u7A0B\u306B\u9032\u307F\u307E\u3059",
        vocab: "keep going (\u7D99\u7D9A\u3059\u308B) \xB7 proceed with (\u7740\u624B\u30FB\u9032\u884C\u3059\u308B)"
      },
      {
        input: "\u3053\u306E\u8A2D\u8A08\u306F\u5C11\u3057\u904E\u5270\u3067\u3059\u3002\u6A19\u6E96\u30E9\u30A4\u30D6\u30E9\u30EA\u3092\u4F7F\u3063\u305F\u307B\u3046\u304C\u3044\u3044\u3067\u3057\u3087\u3046",
        spoken: "This feels a bit over-engineered; we'd be much better off just sticking with the standard library.",
        spoken_meaning: "\u5C11\u3057\u904E\u5270\u8A2D\u8A08\u306A\u6C17\u304C\u3057\u307E\u3059\u3002\u6A19\u6E96\u30E9\u30A4\u30D6\u30E9\u30EA\u3067\u5341\u5206\u3067\u3059",
        written: "The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.",
        written_meaning: "\u63D0\u6848\u3055\u308C\u305F\u69CB\u6210\u306F\u4E0D\u8981\u306A\u8907\u96D1\u3055\u3092\u3082\u305F\u3089\u3057\u307E\u3059\u3002\u6A19\u6E96\u30E9\u30A4\u30D6\u30E9\u30EA\u306E\u5229\u7528\u3092\u63A8\u5968\u3057\u307E\u3059",
        vocab: "over-engineered (\u904E\u5270\u8A2D\u8A08) \xB7 be better off (\u301C\u3057\u305F\u307B\u3046\u304C\u3088\u3044) \xB7 stick with (\u301C\u3092\u4F7F\u3044\u7D9A\u3051\u308B) \xB7 leverage (\u6D3B\u7528\u3059\u308B)"
      }
    ]
  },
  en: {
    name: "English",
    nativeName: "English",
    meaningInstruction: "in native English",
    vocabInstruction: 'in English in parentheses separated by " \xB7 " (e.g. "term1 (English definition) \xB7 term2 (definition) \xB7 ...")',
    anchors: [
      {
        input: "Sounds good, let's ship it.",
        spoken: "\u3044\u3044\u611F\u3058\u3067\u3059\u306D\u3001\u30EA\u30EA\u30FC\u30B9\u3057\u307E\u3057\u3087\u3046\uFF01",
        spoken_meaning: "Looks great, let's deploy right away.",
        written: "\u78BA\u8A8D\u3057\u307E\u3057\u305F\u3002\u672C\u756A\u74B0\u5883\u3078\u30C7\u30D7\u30ED\u30A4\u3092\u9032\u3081\u307E\u3059\u3002",
        written_meaning: "Reviewed and confirmed. Proceeding with deployment to production.",
        vocab: "\u30EA\u30EA\u30FC\u30B9\u3059\u308B (ship / deploy) \xB7 \u672C\u756A\u74B0\u5883 (production environment)"
      },
      {
        input: "Keep going.",
        spoken: "\u7D9A\u3051\u3066\u3044\u304D\u307E\u3057\u3087\u3046\u3002",
        spoken_meaning: "Let's keep making progress.",
        written: "\u5F8C\u7D9A\u306E\u51E6\u7406\u3092\u9032\u3081\u3066\u304F\u3060\u3055\u3044\u3002",
        written_meaning: "Please proceed with the subsequent steps.",
        vocab: "\u5F8C\u7D9A\u306E\u51E6\u7406 (subsequent processing) \xB7 \u9032\u3081\u308B (proceed)"
      },
      {
        input: "This feels over-engineered; let's stick to the built-in standard library.",
        spoken: "\u3053\u308C\u3061\u3087\u3063\u3068\u4F5C\u308A\u8FBC\u307F\u3059\u304E\u304B\u3082\u3002\u7D20\u76F4\u306B\u6A19\u6E96\u30E9\u30A4\u30D6\u30E9\u30EA\u3067\u884C\u304D\u307E\u3057\u3087\u3046\u3002",
        spoken_meaning: "Might be a bit over-complicated; let's simply use the standard library.",
        written: "\u8A2D\u8A08\u304C\u904E\u5270\u306B\u8907\u96D1\u5316\u3057\u3066\u3044\u307E\u3059\u3002\u6A19\u6E96\u30E9\u30A4\u30D6\u30E9\u30EA\u306E\u6D3B\u7528\u3092\u63A8\u5968\u3057\u307E\u3059\u3002",
        written_meaning: "Architecture is unnecessarily complex. Recommending the standard library.",
        vocab: "\u4F5C\u308A\u8FBC\u307F\u3059\u304E (over-engineered) \xB7 \u6A19\u6E96\u30E9\u30A4\u30D6\u30E9\u30EA (standard library) \xB7 \u63A8\u5968\u3059\u308B (recommend)"
      }
    ]
  },
  es: {
    name: "Spanish",
    nativeName: "Espa\xF1ol",
    meaningInstruction: "in native Spanish",
    vocabInstruction: 'in Spanish in parentheses separated by " \xB7 " (e.g. "term1 (significado en espa\xF1ol) \xB7 term2 (...) \xB7 ...")',
    anchors: [
      {
        input: "De acuerdo, empecemos",
        spoken: "Totally on board with that \u2014 let's dive right in.",
        spoken_meaning: "Totalmente de acuerdo, vamos al grano",
        written: "Acknowledged. Let's proceed with the implementation.",
        written_meaning: "Confirmado. Procedamos con la implementaci\xF3n",
        vocab: "on board with (estar de acuerdo) \xB7 dive in (empezar de lleno)"
      },
      {
        input: "Continuar",
        spoken: "Let's keep going.",
        spoken_meaning: "Sigamos adelante",
        written: "Proceed with the next steps.",
        written_meaning: "Continuar con los siguientes pasos",
        vocab: "keep going (seguir adelante) \xB7 proceed with (proceder con)"
      },
      {
        input: "Esta propuesta est\xE1 sobrecargada, mejor usar la biblioteca est\xE1ndar",
        spoken: "This feels a bit over-engineered; we'd be much better off just sticking with the standard library.",
        spoken_meaning: "Parece demasiado complicado; nos ir\xEDa mucho mejor con la librer\xEDa est\xE1ndar",
        written: "The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.",
        written_meaning: "La soluci\xF3n propuesta introduce complejidad innecesaria. Se prefiere la biblioteca est\xE1ndar nativa",
        vocab: "over-engineered (sobreingenier\xEDa) \xB7 be better off (estar mejor con) \xB7 stick with (quedarse con) \xB7 leverage (aprovechar)"
      }
    ]
  },
  fr: {
    name: "French",
    nativeName: "Fran\xE7ais",
    meaningInstruction: "in native French",
    vocabInstruction: 'in French in parentheses separated by " \xB7 " (e.g. "term1 (d\xE9finition en fran\xE7ais) \xB7 term2 (...) \xB7 ...")',
    anchors: [
      {
        input: "D'accord, commen\xE7ons",
        spoken: "Totally on board with that \u2014 let's dive right in.",
        spoken_meaning: "Tout \xE0 fait d'accord, allons-y",
        written: "Acknowledged. Let's proceed with the implementation.",
        written_meaning: "D'accord. Proc\xE9dons \xE0 l'impl\xE9mentation",
        vocab: "on board with (\xEAtre d'accord) \xB7 dive in (s'y mettre directement)"
      },
      {
        input: "Continuer",
        spoken: "Let's keep going.",
        spoken_meaning: "Continuons",
        written: "Proceed with the next steps.",
        written_meaning: "Passer aux \xE9tapes suivantes",
        vocab: "keep going (continuer) \xB7 proceed with (proc\xE9der \xE0)"
      },
      {
        input: "Cette approche est trop complexe, autant utiliser la biblioth\xE8que standard",
        spoken: "This feels a bit over-engineered; we'd be much better off just sticking with the standard library.",
        spoken_meaning: "\xC7a semble surdimensionn\xE9 ; on ferait bien mieux de rester sur la biblioth\xE8que standard",
        written: "The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.",
        written_meaning: "L'approche propos\xE9e introduit une complexit\xE9 superflue. L'utilisation de la biblioth\xE8que standard est recommand\xE9e",
        vocab: "over-engineered (surdimensionn\xE9) \xB7 be better off (avoir tout int\xE9r\xEAt \xE0) \xB7 stick with (s'en tenir \xE0) \xB7 leverage (exploiter)"
      }
    ]
  },
  de: {
    name: "German",
    nativeName: "Deutsch",
    meaningInstruction: "in native German",
    vocabInstruction: 'in German in parentheses separated by " \xB7 " (e.g. "term1 (deutsche Definition) \xB7 term2 (...) \xB7 ...")',
    anchors: [
      {
        input: "Einverstanden, fangen wir an",
        spoken: "Totally on board with that \u2014 let's dive right in.",
        spoken_meaning: "Voll einverstanden, packen wir es an",
        written: "Acknowledged. Let's proceed with the implementation.",
        written_meaning: "Best\xE4tigt. Wir fahren mit der Implementierung fort",
        vocab: "on board with (einverstanden sein) \xB7 dive in (direkt loslegen)"
      },
      {
        input: "Weiter",
        spoken: "Let's keep going.",
        spoken_meaning: "Machen wir weiter",
        written: "Proceed with the next steps.",
        written_meaning: "Mit den n\xE4chsten Schritten fortfahren",
        vocab: "keep going (weitermachen) \xB7 proceed with (fortfahren mit)"
      },
      {
        input: "Dieser Ansatz ist \xFCberdimensioniert, nutzen wir lieber die Standardbibliothek",
        spoken: "This feels a bit over-engineered; we'd be much better off just sticking with the standard library.",
        spoken_meaning: "Das wirkt etwas \xFCberdimensioniert; mit der Standardbibliothek fahren wir deutlich besser",
        written: "The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.",
        written_meaning: "Der vorgeschlagene Ansatz bringt unn\xF6tige Komplexit\xE4t mit sich. Die native Standardbibliothek wird empfohlen",
        vocab: "over-engineered (\xFCberdimensioniert) \xB7 be better off (besser dran sein mit) \xB7 stick with (bleiben bei) \xB7 leverage (nutzen/einsetzen)"
      }
    ]
  }
};
function buildSystemPrompt(sourceLang = "zh", targetLang = "en") {
  const normSource = (sourceLang || "zh").toLowerCase().split("-")[0];
  const spec = LANGUAGE_SPECS[normSource] || LANGUAGE_SPECS.zh;
  const targetName = targetLang === "ja" ? "Japanese" : targetLang === "zh" ? "Chinese" : "English";
  const anchorText = spec.anchors.map(
    (a) => `Input: ${JSON.stringify(a.input)}
Output:
{
  "spoken": ${JSON.stringify(a.spoken)},
  "spoken_meaning": ${JSON.stringify(a.spoken_meaning)},
  "written": ${JSON.stringify(a.written)},
  "written_meaning": ${JSON.stringify(a.written_meaning)},
  "vocab": ${JSON.stringify(a.vocab)}
}`
  ).join("\n\n");
  return `You are an elite bilingual developer language coach and senior software architect.
Task:
Translate the user's message from native ${spec.name} (language A) into TWO distinct authentic ${targetName} registers (language B), and provide the exact back-translation/nuance in native ${spec.name} for each register:
1. "spoken": Natural, fluent spoken ${targetName} (daily standup, Slack, pair programming, agile team collaboration, code reviews). Authentic Silicon Valley flow, contractions, native phrasal verbs, natural idioms.
2. "spoken_meaning": The exact colloquial nuance and meaning ${spec.meaningInstruction}.
3. "written": Clear, precise, modern technical written ${targetName} (PR descriptions, RFCs, issues, architecture docs). High-level Plain ${targetName}: active, concise, professional. STRICTLY AVOID archaic Victorian fluff (e.g. "we may now proceed", "precipitated", "parsimonious").
4. "written_meaning": The exact formal technical nuance and meaning ${spec.meaningInstruction}.
5. "vocab": Adaptively extract ALL key idiomatic collocations, phrasal verbs, technical idioms, or advanced expressions bridging the user to high-level/native developer fluency. Do NOT artificially cap at 1-2; extract as many as genuinely beneficial, while keeping each definition concise ${spec.vocabInstruction} to ensure the terminal HUD remains vertically compact.

[CODE & SYMBOL SHIELD - STRICT RULE]:
All inline code (\`foo()\`), file paths (@file, path/to/file), SQL keywords, variable names, and technical identifiers MUST be preserved 100% verbatim in both spoken and written outputs. Never translate, rephrase, or drop code tokens.

[GOLDEN FEW-SHOT ANCHORS]:
${anchorText}

Strict JSON format:
{
  "spoken": "...",
  "spoken_meaning": "...",
  "written": "...",
  "written_meaning": "...",
  "vocab": "..."
}
Output valid JSON ONLY. Never output markdown code fences, backticks, quotes, or explanations.`;
}

// src/shield.ts
var SHELL_COMMAND_PREFIXES = [
  "git ",
  "npm ",
  "pnpm ",
  "yarn ",
  "bun ",
  "cargo ",
  "rustc ",
  "go ",
  "python ",
  "python3 ",
  "pip ",
  "node ",
  "deno ",
  "docker ",
  "podman ",
  "kubectl ",
  "helm ",
  "make ",
  "cmake ",
  "ninja ",
  "gcc ",
  "g++ ",
  "clang ",
  "cd ",
  "ls ",
  "dir ",
  "cat ",
  "type ",
  "rm ",
  "cp ",
  "mv ",
  "mkdir ",
  "chmod ",
  "chown ",
  "curl ",
  "wget ",
  "ssh ",
  "scp ",
  "grep ",
  "find ",
  "ps ",
  "kill ",
  "echo ",
  "export ",
  "set ",
  "typst ",
  "ffmpeg ",
  "yt-dlp ",
  "npx ",
  "tar ",
  "zip ",
  "unzip "
];
var CODE_STATEMENT_REGEX = /^(?:const|let|var|function|def|class|import|export|package|namespace|using|public|private|protected|fn|pub fn|impl|struct|enum|interface|type)\s+/;
var SQL_STATEMENT_REGEX = /^(?:SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE)\s+/i;
function shouldShieldBypass(text) {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("```")) {
    const withoutCodeFence = trimmed.replace(/```[\s\S]*?```/g, "").trim();
    if (withoutCodeFence && (/[?？]/.test(withoutCodeFence) || /(?:为什么|怎么|如何|帮我|排查|优化|修改|修复|为何|报错|审查|看下|explain|why|how|please|help|could you|fix)/i.test(withoutCodeFence))) {
      return false;
    }
    return true;
  }
  if (trimmed.startsWith("{") && trimmed.endsWith("}") || trimmed.startsWith("[") && trimmed.endsWith("]")) {
    if (trimmed.includes(":") || trimmed.includes(",")) {
      return true;
    }
  }
  const lower = trimmed.toLowerCase();
  for (const prefix of SHELL_COMMAND_PREFIXES) {
    if (lower.startsWith(prefix)) {
      if (/[?？]/.test(trimmed) || /(?:为什么|怎么|如何|报错|为何|explain|why|how)/i.test(trimmed)) {
        return false;
      }
      if (!/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/.test(trimmed)) {
        return true;
      }
      if (/^git\s+(?:commit|tag)\s+.*-m\s+["'].*["']/i.test(trimmed)) {
        return true;
      }
    }
  }
  if (CODE_STATEMENT_REGEX.test(trimmed) && !trimmed.includes("\uFF1F") && !trimmed.includes("?")) {
    if (!/[\u4e00-\u9fa5]/.test(trimmed) || /^[a-zA-Z0-9_\s<>{}\[\]();:=,"'.]+$/.test(trimmed)) {
      return true;
    }
  }
  if (SQL_STATEMENT_REGEX.test(trimmed) && !trimmed.includes("\uFF1F") && !trimmed.includes("?")) {
    return true;
  }
  return false;
}

// src/cache.ts
var LingualLruCache = class {
  constructor(capacity = 50) {
    this.capacity = capacity;
  }
  capacity;
  cache = /* @__PURE__ */ new Map();
  hits = 0;
  misses = 0;
  /**
   * 生成标准化缓存键（结合源语言与目标语言）
   */
  static buildKey(text, sourceLang = "zh", targetLang = "en") {
    return `${sourceLang}\u2794${targetLang}:${text.trim()}`;
  }
  get(key) {
    if (!this.cache.has(key)) {
      this.misses++;
      return void 0;
    }
    this.hits++;
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }
  set(key, val) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== void 0) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, val);
  }
  has(key) {
    return this.cache.has(key);
  }
  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }
  get size() {
    return this.cache.size;
  }
  getStats() {
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      capacity: this.capacity
    };
  }
};
var LinguaLruCache = LingualLruCache;
var globalLingualCache = new LingualLruCache(50);
var globalLinguaCache = globalLingualCache;

// src/engine.ts
var import_node_fs = __toESM(require("fs"), 1);
var import_node_path = __toESM(require("path"), 1);
var import_node_os = __toESM(require("os"), 1);
var cachedUserConfig = null;
var lastConfigCheckTime = 0;
var CONFIG_CACHE_TTL_MS = 2e3;
function invalidateUserConfigCache() {
  cachedUserConfig = null;
  lastConfigCheckTime = 0;
}
function loadUserLingualConfig() {
  if (process.env.NODE_ENV === "test" || process.execArgv.includes("--test") || process.argv.includes("--test")) {
    return {};
  }
  const now = Date.now();
  if (cachedUserConfig && now - lastConfigCheckTime < CONFIG_CACHE_TTL_MS) {
    return cachedUserConfig;
  }
  const configPaths = [
    import_node_path.default.join(import_node_os.default.homedir(), ".pi", "agent", "settings.json"),
    import_node_path.default.join(import_node_os.default.homedir(), ".pi", "agent", "lingual.json")
  ];
  for (const p of configPaths) {
    try {
      if (import_node_fs.default.existsSync(p)) {
        const raw = import_node_fs.default.readFileSync(p, "utf8");
        const parsed = JSON.parse(raw);
        const target = p.endsWith("settings.json") ? parsed["pi-lingual"] || parsed["lingua"] : parsed;
        if (!target) continue;
        const endpoint = target.endpoint || target.antigravity?.endpoint;
        const apiKey = target.apiKey || target.antigravity?.apiKey;
        const model = target.model || target.antigravity?.model;
        const selectedModel = target.selectedModel || target.model;
        const sourceLang = target.sourceLang;
        const targetLang = target.targetLang;
        const compact = target.compact;
        const labels = resolveLabelsForLang(sourceLang || "zh", target.labels);
        cachedUserConfig = {
          ...endpoint ? { endpoint } : {},
          ...apiKey ? { apiKey } : {},
          ...model ? { model } : {},
          ...selectedModel ? { selectedModel } : {},
          ...target.mode ? { mode: target.mode } : {},
          ...compact !== void 0 ? { compact: Boolean(compact) } : {},
          ...sourceLang ? { sourceLang } : {},
          ...targetLang ? { targetLang } : {},
          labels
        };
        lastConfigCheckTime = now;
        return cachedUserConfig;
      }
    } catch {
    }
  }
  cachedUserConfig = {};
  lastConfigCheckTime = now;
  return {};
}
var DEFAULT_CONFIG = {
  endpoint: process.env.LINGUAL_ENDPOINT || "",
  apiKey: process.env.LINGUAL_API_KEY || "",
  model: process.env.LINGUAL_MODEL || "",
  selectedModel: "auto",
  mode: "original",
  sourceLang: "zh",
  targetLang: "en",
  temperature: 0.2,
  timeoutMs: 3e4
};
var LINGUAL_SYSTEM_PROMPT = buildSystemPrompt("zh", "en");
function isNonEnglish(text) {
  const naturalLanguageScript = /[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af\u0400-\u04ff\u0600-\u06ff\u00c0-\u024f]/;
  return naturalLanguageScript.test(text);
}
var MAX_TRANSLATION_CHARS = 2500;
var MAX_TRANSLATION_LINES = 30;
function shouldTriggerTranslation(text, sourceLang = "zh") {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (trimmed.length > MAX_TRANSLATION_CHARS) {
    return false;
  }
  const lines = trimmed.split(/\r?\n/);
  if (lines.length > MAX_TRANSLATION_LINES) {
    return false;
  }
  if (/^#{1,6}\s/.test(trimmed) || trimmed.startsWith("---")) {
    return false;
  }
  if (shouldShieldBypass(trimmed)) {
    return false;
  }
  if (sourceLang !== "en") {
    return isNonEnglish(trimmed);
  }
  const words = trimmed.split(/\s+/);
  if (words.length < 2) {
    return false;
  }
  return /[a-zA-Z]{2,}/.test(trimmed);
}
function parseLlmResponse(raw) {
  try {
    let cleaned = raw.replace(/<(?:think|thought)>[\s\S]*?<\/(?:think|thought)>/gi, "").trim();
    const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (fenceMatch) {
      cleaned = fenceMatch[1].trim();
    }
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null;
    }
    const jsonSubstr = cleaned.slice(firstBrace, lastBrace + 1);
    const parsed = JSON.parse(jsonSubstr);
    const spoken = (parsed.spoken || parsed.casual || parsed.slot1 || "").trim();
    const spokenMeaning = (parsed.spoken_meaning || parsed.spokenMeaning || "").trim();
    const written = (parsed.written || parsed.academic || parsed.slot2 || "").trim();
    const writtenMeaning = (parsed.written_meaning || parsed.writtenMeaning || "").trim();
    const vocab = typeof parsed.vocab === "string" ? parsed.vocab.trim() : "";
    if (spoken) {
      return {
        spoken,
        spokenMeaning: spokenMeaning || void 0,
        written: written || void 0,
        writtenMeaning: writtenMeaning || void 0,
        vocab: vocab || void 0
      };
    }
    return null;
  } catch {
    return null;
  }
}
function truncateVisual(str, maxVisualCols) {
  let curWidth = 0;
  let result = "";
  for (const char of str) {
    const w = getVisualWidth(char);
    if (curWidth + w > maxVisualCols) {
      return result + "...";
    }
    result += char;
    curWidth += w;
  }
  return result;
}
function getVisualWidth(str) {
  let width = 0;
  const clean = str.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");
  for (const char of clean) {
    const code = char.codePointAt(0) || 0;
    if (code >= 4352 && code <= 4447 || code >= 11904 && code <= 42191 || code >= 44032 && code <= 55203 || code >= 63744 && code <= 64255 || code >= 65040 && code <= 65049 || code >= 65072 && code <= 65135 || code >= 65280 && code <= 65376 || code >= 65504 && code <= 65510 || code >= 127744 && code <= 128591 || code >= 129280 && code <= 129535) {
      width += 2;
    } else {
      width += 1;
    }
  }
  return width;
}
var CANNOT_START_LINE_CHARS = /* @__PURE__ */ new Set([
  ",",
  ".",
  ";",
  "!",
  "?",
  ":",
  "\uFF0C",
  "\u3002",
  "\uFF1B",
  "\uFF01",
  "\uFF1F",
  "\uFF1A",
  "\u3001",
  ")",
  "]",
  "}",
  "\uFF09",
  "\u3011",
  "\u201D",
  "\u2019",
  "\xBB"
]);
function wrapVisualText(text, maxWidth) {
  if (maxWidth <= 0) return [text];
  const rawLines = [];
  let currentLine = "";
  let currentWidth = 0;
  const tokenRegex = /\x1b\[[0-9;]*[a-zA-Z]|\s+|[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]|[^\s\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af\x1b]+/g;
  let match;
  while ((match = tokenRegex.exec(text)) !== null) {
    const token = match[0];
    const tokenWidth = getVisualWidth(token);
    if (tokenWidth === 0) {
      currentLine += token;
      continue;
    }
    if (currentWidth + tokenWidth <= maxWidth) {
      currentLine += token;
      currentWidth += tokenWidth;
    } else {
      if (currentLine === "") {
        rawLines.push(token);
        continue;
      }
      rawLines.push(currentLine.trimEnd());
      currentLine = token.trimStart();
      currentWidth = getVisualWidth(currentLine);
    }
  }
  if (currentLine.trim()) {
    rawLines.push(currentLine.trimEnd());
  }
  const lines = [];
  for (let i = 0; i < rawLines.length; i++) {
    let line = rawLines[i];
    if (i > 0 && line.length > 0) {
      const firstChar = line[0];
      if (CANNOT_START_LINE_CHARS.has(firstChar)) {
        const prevIdx = lines.length - 1;
        lines[prevIdx] = lines[prevIdx] + firstChar;
        line = line.slice(1).trimStart();
      }
    }
    if (line.trim()) {
      lines.push(line);
    }
  }
  return lines.length > 0 ? lines : [text];
}
function formatTreeBranch(branchChar, contChar, tag, content, prefixDecorator = (s) => s, tagDecorator = (s) => s, contDecorator = (s) => s, lineDecorator = (s) => s, maxCols = (process.stdout.columns || 80) - 8) {
  const actualLineDecorator = typeof lineDecorator === "function" ? lineDecorator : (s) => s;
  const actualMaxCols = typeof lineDecorator === "number" ? lineDecorator : typeof maxCols === "number" ? maxCols : (process.stdout.columns || 80) - 8;
  const rawPrefix = `  ${branchChar} [${tag}] `;
  const prefixW = getVisualWidth(rawPrefix);
  const rawCont = `  ${contChar}${" ".repeat(Math.max(1, prefixW - 3))}`;
  const availW = Math.max(25, actualMaxCols - prefixW);
  const lines = wrapVisualText(content, availW);
  if (lines.length === 0) {
    return [prefixDecorator(`  ${branchChar} `) + tagDecorator(`[${tag}]`)];
  }
  return lines.map((line, idx) => {
    if (idx === 0) {
      return prefixDecorator(`  ${branchChar} `) + tagDecorator(`[${tag}] `) + actualLineDecorator(line);
    }
    return contDecorator(rawCont) + actualLineDecorator(line);
  });
}
function formatSubRail(contChar, nuanceText, arrow = "\u21B3", contDecorator = (s) => s, lineDecorator = (s) => s, maxCols = (process.stdout.columns || 80) - 8, indentCols = 11) {
  if (!nuanceText || !nuanceText.trim()) return [];
  const rawPrefix = `  ${contChar}${" ".repeat(Math.max(1, indentCols - 5))}${arrow} `;
  const prefixW = getVisualWidth(rawPrefix);
  const rawCont = `  ${contChar}${" ".repeat(Math.max(1, prefixW - 3))}`;
  const availW = Math.max(20, maxCols - prefixW);
  const cleanText = nuanceText.startsWith("(") && nuanceText.endsWith(")") ? nuanceText : `(${nuanceText})`;
  const lines = wrapVisualText(cleanText, availW);
  return lines.map((line, idx) => {
    if (idx === 0) {
      return contDecorator(rawPrefix) + lineDecorator(line);
    }
    return contDecorator(rawCont) + lineDecorator(line);
  });
}
function extractVocabPhrases(vocab) {
  if (!vocab || !vocab.trim()) return [];
  const items = vocab.split(/\s*(?:·|•|,)\s*/);
  const phrases = [];
  for (const raw of items) {
    const clean = raw.replace(/\s*(?:\(.*?\)|（.*?）)\s*$/, "").trim();
    if (clean.length >= 2 && !phrases.includes(clean)) {
      phrases.push(clean);
    }
  }
  return phrases.sort((a, b) => b.length - a.length);
}
function spotlightPhrases(text, phrases) {
  if (!text || phrases.length === 0) return text;
  let result = text;
  for (const phrase of phrases) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const wordBoundary = `(?<=\\b|^)${escaped}(?=\\b|$)`;
    const regex = new RegExp(wordBoundary, "gi");
    result = result.replace(regex, (matched) => `\x1B[4m${matched}\x1B[24m`);
  }
  return result;
}
function formatTerminalAnnotation(sourceText, spoken, written, vocab, options = {}) {
  const slot1 = options.slot1Label || "Spoken";
  const slot2 = options.slot2Label || "Written";
  const vocabTag = options.vocabLabel || "Vocab";
  const sourceTag = options.sourceLabel || "Original";
  const hasSlot2 = Boolean(written && written.trim());
  const hasVocab = Boolean(vocab && vocab.trim());
  const spotlightEnabled = options.spotlight !== false;
  const phrases = hasVocab && spotlightEnabled ? extractVocabPhrases(vocab) : [];
  const displaySpoken = phrases.length > 0 ? spotlightPhrases(spoken, phrases) : spoken;
  const displayWritten = written && phrases.length > 0 ? spotlightPhrases(written, phrases) : written;
  const cleanSource = sourceText.replace(/\r?\n+/g, " ").trim();
  const lines = [`  \xB7 [${sourceTag}] ${cleanSource}`];
  const branch1Char = hasSlot2 || hasVocab ? "\u250C" : "\u2514";
  const cont1Char = hasSlot2 || hasVocab ? "\u2502" : " ";
  lines.push(...formatTreeBranch(branch1Char, cont1Char, slot1, displaySpoken));
  if (options.spokenMeaning) {
    lines.push(...formatSubRail(cont1Char, options.spokenMeaning));
  }
  if (hasSlot2) {
    const branchChar = hasVocab ? "\u251C" : "\u2514";
    const contChar = hasVocab ? "\u2502" : " ";
    lines.push(...formatTreeBranch(branchChar, contChar, slot2, displayWritten));
    if (options.writtenMeaning) {
      lines.push(...formatSubRail(contChar, options.writtenMeaning));
    }
  }
  if (hasVocab) {
    lines.push(...formatTreeBranch("\u2514", " ", vocabTag, vocab));
  }
  return lines.join("\n");
}
function formatCapsuleLine(hudTitle, spoken, written, options = {}) {
  const slot1 = options.slot1Short || "\u53E3";
  const slot2 = options.slot2Short || "\u5199";
  const maxCols = options.maxCols || (process.stdout?.columns ? Math.max(40, process.stdout.columns) : 80);
  const safeCols = Math.max(36, maxCols - 4);
  const cleanSpoken = spoken.replace(/\r?\n+/g, " ").trim();
  const cleanWritten = (written || "").replace(/\r?\n+/g, " ").trim();
  const prefix = `\u21C4 [${hudTitle}] `;
  const prefixW = getVisualWidth(prefix);
  const hasSlot2 = Boolean(cleanWritten);
  const availW = Math.max(16, safeCols - prefixW);
  let body = "";
  if (hasSlot2) {
    const slotW = Math.max(8, Math.floor((availW - 5) / 2));
    const s1 = truncateVisual(cleanSpoken, slotW);
    const s2 = truncateVisual(cleanWritten, slotW);
    body = `${slot1}: ${s1} \xB7 ${slot2}: ${s2}`;
  } else {
    const s1 = truncateVisual(cleanSpoken, availW - 4);
    body = `${slot1}: ${s1}`;
  }
  return prefix + body;
}
function stripLingualAnnotation(annotatedText) {
  const lines = annotatedText.split("\n");
  const rawLines = [];
  let spoken;
  let written;
  let vocab;
  for (const line of lines) {
    const trimmed = line.trim();
    const sourceMatch = trimmed.match(/^·\s*\[?(?:原文|source|original|quelle)\]?\s+(.*)$/i);
    if (sourceMatch) {
      rawLines.push(sourceMatch[1].trim());
      continue;
    }
    if (/^(?:[│\s]*↳\s*\(.*\)|↳\s*\(.*\))/.test(trimmed)) {
      continue;
    }
    const slotMatch = trimmed.match(/^(?:[┌├└│]\s*|↳\s*)\[([^\]]+)\]\s*(.*)$/);
    if (slotMatch) {
      const tag = slotMatch[1].trim();
      let text = slotMatch[2].trim().replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");
      const parenIdx = text.lastIndexOf(" (");
      if (parenIdx !== -1 && text.endsWith(")")) {
        text = text.slice(0, parenIdx).trim();
      }
      if (/^(?:口语|spoken|口語|slack|slot1)$/i.test(tag)) {
        spoken = text;
      } else if (/^(?:写作|written|文面|rfc|slot2|敬語)$/i.test(tag)) {
        written = text;
      } else if (/^(?:重点|vocab|単語|词汇)$/i.test(tag)) {
        vocab = text;
      }
    } else {
      rawLines.push(line);
    }
  }
  return {
    raw: rawLines.join("\n").trim(),
    spoken,
    written,
    vocab
  };
}
async function translatePrompt(text, userConfig = {}) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const diskConfig = loadUserLingualConfig();
  const cfg = { ...DEFAULT_CONFIG, ...diskConfig, ...userConfig };
  if (!shouldTriggerTranslation(trimmed, cfg.sourceLang)) {
    return null;
  }
  if (shouldShieldBypass(trimmed)) {
    return null;
  }
  const cacheKey = LingualLruCache.buildKey(trimmed, cfg.sourceLang, cfg.targetLang);
  const cached = globalLingualCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
  try {
    let content = null;
    const sysPrompt = buildSystemPrompt(cfg.sourceLang, cfg.targetLang);
    if (typeof cfg.complete === "function") {
      content = await cfg.complete(trimmed, sysPrompt);
    } else if (cfg.endpoint) {
      const headers = {
        "Content-Type": "application/json"
      };
      if (cfg.apiKey) {
        headers["Authorization"] = `Bearer ${cfg.apiKey}`;
      }
      const response = await fetch(cfg.endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: cfg.model || "gemini-3.8-flash",
          messages: [
            { role: "system", content: sysPrompt },
            { role: "user", content: trimmed }
          ],
          temperature: cfg.temperature
        }),
        signal: controller.signal
      });
      if (!response.ok) {
        return null;
      }
      const json = await response.json();
      content = json?.choices?.[0]?.message?.content ?? null;
    } else {
      return null;
    }
    if (typeof content !== "string" || !content.trim()) {
      return null;
    }
    const payload = parseLlmResponse(content);
    if (!payload || !payload.spoken) return null;
    const slot1Label = cfg.labels?.slot1Label || cfg.labels?.spokenLabel || "Spoken";
    const slot2Label = cfg.labels?.slot2Label || cfg.labels?.writtenLabel || "Written";
    const vocabLabel = cfg.labels?.vocabLabel || "Vocab";
    const sourceLabel = cfg.labels?.sourceLabel || "Original";
    const result = {
      spoken: payload.spoken,
      spokenMeaning: payload.spokenMeaning,
      written: payload.written || "",
      writtenMeaning: payload.writtenMeaning,
      vocab: payload.vocab,
      sourceText: trimmed,
      annotated: formatTerminalAnnotation(
        trimmed,
        payload.spoken,
        payload.written,
        payload.vocab,
        {
          spokenMeaning: payload.spokenMeaning,
          writtenMeaning: payload.writtenMeaning,
          slot1Label,
          slot2Label,
          vocabLabel,
          sourceLabel
        }
      )
    };
    globalLingualCache.set(cacheKey, result);
    return result;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
var LINGUA_SYSTEM_PROMPT = LINGUAL_SYSTEM_PROMPT;
var stripLinguaAnnotation = stripLingualAnnotation;
var loadUserConfig = loadUserLingualConfig;

// src/sanitizer.ts
var TARGETED_CLIPBOARD_PATH_REGEX = /(?:[a-zA-Z]:[\\\/](?:[^:\r\n\t]+[\\\/])?pi-clipboard-[a-zA-Z0-9\-]+\.png|\/(?:[^\r\n\t]+[\\\/])?pi-clipboard-[a-zA-Z0-9\-]+\.png|(?:[a-zA-Z]:[\\\/](?:[^:\r\n\t]+[\\\/])?)CURRENT_MISSION_STATE\.md)/gi;
var LEADING_TARGETED_CLIPBOARD_REGEX = /^(?:[a-zA-Z]:[\\\/](?:[^:\r\n\t]+[\\\/])?pi-clipboard-[a-zA-Z0-9\-]+\.png|\/(?:[^\r\n\t]+[\\\/])?pi-clipboard-[a-zA-Z0-9\-]+\.png)\s*/i;
var STACK_LINE_REGEX = /^\s*(?:at\s+(?:[\w$.<>]+|[^\s]+)\s*\(.*:\d+:\d+\)|at\s+.*:\d+:\d+|File\s+".*", line \d+, in\s+.*|goroutine \d+ \[.*\]:|Caused by:.*|^\s*\d+:\s+0x[0-9a-f]+)/;
var COMPILER_DIAGNOSTIC_REGEX = /^(?:[a-zA-Z]:[\\\/]|\.{0,2}[\\\/]|[a-zA-Z0-9_\-\.]+)[^:\r\n]+:\d+:\d+:\s*(?:error|warning|fatal error|note):/i;
function sanitizePromptForTranslation(raw) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      distilledText: "",
      hasNaturalLanguage: false,
      hasCollapsedContent: false,
      naturalCharsLength: 0
    };
  }
  let text = trimmed;
  while (LEADING_TARGETED_CLIPBOARD_REGEX.test(text)) {
    text = text.replace(LEADING_TARGETED_CLIPBOARD_REGEX, "").trim();
  }
  const inlinePathMatches = text.match(TARGETED_CLIPBOARD_PATH_REGEX);
  let trailingPathPayload;
  if (inlinePathMatches && inlinePathMatches.length > 0) {
    trailingPathPayload = inlinePathMatches.join("\n");
    text = text.replace(TARGETED_CLIPBOARD_PATH_REGEX, "").trim();
  }
  if (!text) {
    return {
      distilledText: "",
      hasNaturalLanguage: false,
      hasCollapsedContent: false,
      naturalCharsLength: 0,
      rawPayload: trailingPathPayload
    };
  }
  let hasCollapsed = false;
  text = text.replace(/```[\w\-]*\r?\n([\s\S]*?)\r?\n```/g, (_match, codeContent) => {
    hasCollapsed = true;
    const codeLines = codeContent.trim().split(/\r?\n/);
    if (codeLines.length <= 1) {
      return `[${codeLines[0] || "code"}]`;
    }
    return "[code ...]";
  });
  const lines = text.split(/\r?\n/);
  const resultLines = [];
  let inStackBlock = false;
  let inDiagnosticBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineTrim = line.trim();
    if (!lineTrim) {
      inStackBlock = false;
      inDiagnosticBlock = false;
      continue;
    }
    if (STACK_LINE_REGEX.test(lineTrim) || lineTrim.startsWith("Traceback (most recent call last):")) {
      hasCollapsed = true;
      if (!inStackBlock) {
        resultLines.push("[... stack trace ...]");
        inStackBlock = true;
      }
      continue;
    } else {
      inStackBlock = false;
    }
    if (COMPILER_DIAGNOSTIC_REGEX.test(lineTrim)) {
      hasCollapsed = true;
      if (!inDiagnosticBlock) {
        resultLines.push(lineTrim);
        resultLines.push("[... diagnostics ...]");
        inDiagnosticBlock = true;
      }
      continue;
    } else {
      inDiagnosticBlock = false;
    }
    if (/^npm ERR!/i.test(lineTrim)) {
      hasCollapsed = true;
      if (!resultLines[resultLines.length - 1]?.includes("npm ERR! [...]")) {
        resultLines.push("npm ERR! [...]");
      }
      continue;
    }
    resultLines.push(line);
  }
  const distilledText = resultLines.join(" ").replace(/\s+/g, " ").trim();
  const withoutPlaceholders = distilledText.replace(/\[\.\.\.[^\]]*\]/g, "").replace(/[a-zA-Z0-9_\-\.\/\\:]+/g, "").trim();
  const hasCJK = isNonEnglish(distilledText);
  const hasQuestionKeywords = /(?:为什么|怎么|如何|帮我|排查|优化|修改|修复|为何|报错|审查|看下|explain|why|how|please|help|could you|fix|should|what|inspect)/i.test(distilledText);
  const isPureDiagnosticOutput = /^(?:[a-zA-Z0-9_\-\.\/\\:]+\s*-\s*error\s+[a-zA-Z0-9]+|error(?:\s+TS\d+|:)|warning:)/i.test(distilledText) && !hasQuestionKeywords;
  const hasNaturalLanguage = (hasCJK || hasQuestionKeywords || withoutPlaceholders.length > 5) && !isPureDiagnosticOutput;
  let rawPayload;
  const payloadParts = [];
  if (trailingPathPayload) {
    payloadParts.push(trailingPathPayload);
  }
  if (hasCollapsed) {
    const codeMatch = trimmed.match(/```[\w\-]*\r?\n([\s\S]*?)\r?\n```/g);
    if (codeMatch) {
      payloadParts.push(...codeMatch);
    }
    const stackLines = lines.filter(
      (l) => STACK_LINE_REGEX.test(l.trim()) || COMPILER_DIAGNOSTIC_REGEX.test(l.trim()) || l.trim().startsWith("Traceback")
    );
    if (stackLines.length > 0 && !codeMatch) {
      payloadParts.push(stackLines.join("\n"));
    }
  }
  if (payloadParts.length > 0) {
    rawPayload = payloadParts.join("\n\n").trim();
  }
  return {
    distilledText,
    hasNaturalLanguage,
    hasCollapsedContent: hasCollapsed,
    naturalCharsLength: distilledText.length,
    rawPayload
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_CONFIG,
  LANGUAGE_PRESETS,
  LINGUAL_SYSTEM_PROMPT,
  LINGUA_SYSTEM_PROMPT,
  LinguaLruCache,
  LingualLruCache,
  MAX_TRANSLATION_CHARS,
  MAX_TRANSLATION_LINES,
  buildSystemPrompt,
  extractVocabPhrases,
  formatCapsuleLine,
  formatModelSelectionMessage,
  formatStatusReport,
  formatSubRail,
  formatTerminalAnnotation,
  formatTreeBranch,
  getVisualWidth,
  globalLinguaCache,
  globalLingualCache,
  invalidateUserConfigCache,
  isNonEnglish,
  loadUserConfig,
  loadUserLingualConfig,
  parseLlmResponse,
  resolveLabelsForLang,
  sanitizePromptForTranslation,
  shouldShieldBypass,
  shouldTriggerTranslation,
  splitSemanticChunks,
  spotlightPhrases,
  stripLinguaAnnotation,
  stripLingualAnnotation,
  translatePrompt,
  truncateVisual,
  wrapVisualText
});
