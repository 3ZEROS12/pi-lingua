// src/extension.ts
import fs2 from "fs";
import path2 from "path";
import os2 from "os";

// src/layout.ts
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
function truncateVisual(str, maxVisualCols) {
  if (maxVisualCols <= 0) return "";
  const fullWidth = getVisualWidth(str);
  if (fullWidth <= maxVisualCols) return str;
  const targetCols = Math.max(1, maxVisualCols - 3);
  let curWidth = 0;
  let result = "";
  for (const char of str) {
    const w = getVisualWidth(char);
    if (curWidth + w > targetCols) {
      break;
    }
    result += char;
    curWidth += w;
  }
  return result + "...";
}
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
        if (tokenWidth > maxWidth) {
          let curToken = token;
          while (getVisualWidth(curToken) > maxWidth) {
            let sliceIdx = 0;
            let accW = 0;
            for (const ch of curToken) {
              const chW = getVisualWidth(ch);
              if (accW + chW > maxWidth) break;
              accW += chW;
              sliceIdx += ch.length;
            }
            if (sliceIdx === 0) sliceIdx = 1;
            rawLines.push(curToken.slice(0, sliceIdx));
            curToken = curToken.slice(sliceIdx);
          }
          if (curToken.trim()) {
            currentLine = curToken;
            currentWidth = getVisualWidth(curToken);
          }
          continue;
        }
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
function formatTreeBranch(branchChar, contChar, tag, content, prefixDecorator = (s) => s, tagDecorator = (s) => s, contDecorator = (s) => s, lineDecorator = (s) => s, maxCols = (process.stdout?.columns || 80) - 8) {
  const actualLineDecorator = typeof lineDecorator === "function" ? lineDecorator : (s) => s;
  const actualMaxCols = typeof lineDecorator === "number" ? lineDecorator : typeof maxCols === "number" ? maxCols : (process.stdout?.columns || 80) - 8;
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
function formatSubRail(contChar, nuanceText, arrow = "\u21B3", contDecorator = (s) => s, lineDecorator = (s) => s, maxCols = (process.stdout?.columns || 80) - 8, indentCols = 11) {
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
    const startsWithAscii = /^[a-zA-Z0-9]/.test(phrase);
    const endsWithAscii = /[a-zA-Z0-9]$/.test(phrase);
    const pattern = `${startsWithAscii ? "(?<=\\b|^)" : ""}${escaped}${endsWithAscii ? "(?=\\b|$)" : ""}`;
    const regex = new RegExp(pattern, "gi");
    result = result.replace(regex, (matched) => `\x1B[4m${matched}\x1B[24m`);
  }
  return result;
}
function formatVocabItemsAtomic(vocab, prefix, maxCols) {
  if (!vocab || !vocab.trim()) return prefix.trimEnd();
  const items = vocab.split(/\s*(?:·|•)\s*/);
  const prefixW = getVisualWidth(prefix);
  const availW = Math.max(20, maxCols - prefixW);
  const keptItems = [];
  let curW = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i].trim();
    if (!item) continue;
    const itemW = getVisualWidth(item);
    const sepW = keptItems.length > 0 ? 3 : 0;
    if (curW + sepW + itemW <= availW) {
      keptItems.push(item);
      curW += sepW + itemW;
    } else {
      if (keptItems.length === 0) {
        return prefix + truncateVisual(item, availW);
      } else {
        if (curW + 5 <= availW) {
          return prefix + keptItems.join(" \xB7 ") + " \xB7 ...";
        }
        return prefix + keptItems.join(" \xB7 ");
      }
    }
  }
  return prefix + keptItems.join(" \xB7 ");
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
  const maxCols = options.maxCols || (process.stdout?.columns ? Math.max(30, process.stdout.columns) : 80);
  const slot1 = options.slot1Short || "Spk";
  const slot2 = options.slot2Short || "Wrt";
  const cleanSpoken = spoken.replace(/\r?\n+/g, " ").trim();
  const cleanWritten = (written || "").replace(/\r?\n+/g, " ").trim();
  const prefix = `\u21C4 [${hudTitle}] `;
  const prefixW = getVisualWidth(prefix);
  const hasSlot2 = Boolean(cleanWritten);
  const availW = Math.max(8, maxCols - prefixW);
  let body = "";
  if (hasSlot2) {
    const s1PrefixW = getVisualWidth(`${slot1}: `);
    const s2PrefixW = getVisualWidth(`${slot2}: `);
    const fixedOverhead = s1PrefixW + 3 + s2PrefixW;
    const textAvail = Math.max(4, availW - fixedOverhead);
    const halfW = Math.max(2, Math.floor(textAvail / 2));
    const s1 = truncateVisual(cleanSpoken, halfW);
    const s2 = truncateVisual(cleanWritten, halfW);
    body = `${slot1}: ${s1} \xB7 ${slot2}: ${s2}`;
  } else {
    const s1PrefixW = getVisualWidth(`${slot1}: `);
    const textAvail = Math.max(2, availW - s1PrefixW);
    const s1 = truncateVisual(cleanSpoken, textAvail);
    body = `${slot1}: ${s1}`;
  }
  const fullLine = prefix + body;
  if (getVisualWidth(fullLine) > maxCols) {
    return truncateVisual(fullLine, maxCols);
  }
  return fullLine;
}

// src/engine.ts
import fs from "fs";
import path from "path";
import os from "os";

// src/presets.ts
var LANGUAGE_PRESETS = {
  zh: {
    slot1Label: "\u53E3\u8BED",
    slot2Label: "\u5199\u4F5C",
    vocabLabel: "\u91CD\u70B9",
    sourceLabel: "\u539F\u6587",
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
    notifyLangSwitched: "\u4F34\u5B66\u8BED\u8A00\u5DF2\u5207\u6362\u4E3A: {lang}\uFF08\u63D0\u793A\uFF1A\u547D\u4EE4\u8865\u5168\u83DC\u5355\u6587\u9762\u5C06\u5728\u91CD\u542F\u7EC8\u7AEF\u540E\u5B8C\u5168\u540C\u6B65\uFF09",
    notifyLangInvalid: "\u65E0\u6548\u7684\u8BED\u8A00\u4EE3\u7801\u3002\u652F\u6301\u7684\u8BED\u8A00\u4EE3\u7801: zh, ja, en, es, fr, de",
    notifyCompactOn: "[zh \u21C4 en] \u5DF2\u5F00\u542F\u5355\u884C\u80F6\u56CA\u6A21\u5F0F\uFF1A\u6781\u7B80\u5360\u4F4D\uFF0C\u4FDD\u62A4\u5206\u5C4F\u89C6\u91CE",
    notifyCompactOff: "[zh \u21C4 en] \u5DF2\u5207\u6362\u4E3A\u5DE6\u5BFC\u8F68\u6811\u72B6\u67B6\u6784\uFF1A\u5C55\u793A\u5B8C\u6574\u53CC\u6A21\u4E0E\u8BED\u611F",
    notifyTimeout: "[zh \u21C4 en] \u82F1\u6587\u7FFB\u8BD1\u8BF7\u6C42\u672A\u5C31\u7EEA\u6216\u8D85\u65F6\uFF0C\u672C\u6B21\u5DF2\u653E\u884C\u539F\u6587",
    notifyError: "[zh \u21C4 en] \u82F1\u6587\u7FFB\u8BD1\u8BF7\u6C42\u5F02\u5E38\uFF0C\u672C\u6B21\u5DF2\u653E\u884C\u539F\u6587",
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
    modelSelectHint: "\u53EF\u8F93\u5165 /lingual-model <model-id> \u6216 auto \u6307\u5B9A\u4F34\u5B66\u6A21\u578B\u3002",
    langUsageHint: "\u7528\u6CD5: /lang <zh|ja|en|es|fr|de> [target] (\u5982 /lang ja \u6216 /lang zh ja)",
    langList: [
      "\u2022 zh (\u4E2D\u6587 \u2794 \u82F1\u6587)",
      "\u2022 ja (\u65E5\u672C\u8A9E \u2794 \u82F1\u8A9E)",
      "\u2022 en (\u82F1\u6587 \u2794 \u65E5\u6587)",
      "\u2022 es (\u897F\u73ED\u7259\u6587 \u2794 \u82F1\u6587)",
      "\u2022 fr (\u6CD5\u6587 \u2794 \u82F1\u6587)",
      "\u2022 de (\u5FB7\u6587 \u2794 \u82F1\u6587)"
    ]
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
    notifyLangSwitched: "\u6BCD\u8A9E\u3092\u5207\u308A\u66FF\u3048\u307E\u3057\u305F: {lang}\uFF08\u203B\u30B3\u30DE\u30F3\u30C9\u88DC\u5B8C\u30E1\u30CB\u30E5\u30FC\u306E\u6587\u9762\u306F\u7AEF\u672B\u518D\u8D77\u52D5\u5F8C\u306B\u5B8C\u5168\u306B\u53CD\u6620\u3055\u308C\u307E\u3059\uFF09",
    notifyLangInvalid: "\u7121\u52B9\u306A\u8A00\u8A9E\u30B3\u30FC\u30C9\u3067\u3059\u3002\u5BFE\u5FDC\u8A00\u8A9E: zh, ja, en, es, fr, de",
    notifyCompactOn: "[ja \u21C4 en] 1\u884C\u30AB\u30D7\u30BB\u30EB\u30E2\u30FC\u30C9\u3092\u6709\u52B9\u306B\u3057\u307E\u3057\u305F\uFF1A\u753B\u9762\u9818\u57DF\u3092\u6700\u5927\u9650\u78BA\u4FDD",
    notifyCompactOff: "[ja \u21C4 en] \u30D5\u30EB\u30C4\u30EA\u30FC\u8868\u793A\u306B\u5207\u308A\u66FF\u3048\u307E\u3057\u305F\uFF1A\u8A73\u7D30\u306A\u30CB\u30E5\u30A2\u30F3\u30B9\u3092\u8868\u793A",
    notifyTimeout: "[ja \u21C4 en] \u82F1\u8A9E\u7FFB\u8A33\u30EA\u30AF\u30A8\u30B9\u30C8\u304C\u30BF\u30A4\u30E0\u30A2\u30A6\u30C8\u3057\u307E\u3057\u305F\u3002\u539F\u6587\u3092\u9001\u4FE1\u3057\u307E\u3057\u305F",
    notifyError: "[ja \u21C4 en] \u82F1\u8A9E\u7FFB\u8A33\u30EA\u30AF\u30A8\u30B9\u30C8\u3067\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002\u539F\u6587\u3092\u9001\u4FE1\u3057\u307E\u3057\u305F",
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
    modelSelectHint: "/lingual-model <model-id> \u307E\u305F\u306F auto \u3092\u5165\u529B\u3057\u3066\u30E2\u30C7\u30EB\u3092\u6307\u5B9A\u3067\u304D\u307E\u3059\u3002",
    langUsageHint: "\u4F7F\u3044\u65B9: /lang <zh|ja|en|es|fr|de> [target] (\u4F8B: /lang ja \u307E\u305F\u306F /lang zh ja)",
    langList: [
      "\u2022 zh (\u4E2D\u56FD\u8A9E \u2794 \u82F1\u8A9E)",
      "\u2022 ja (\u65E5\u672C\u8A9E \u2794 \u82F1\u8A9E)",
      "\u2022 en (\u82F1\u8A9E \u2794 \u65E5\u672C\u8A9E)",
      "\u2022 es (\u30B9\u30DA\u30A4\u30F3\u8A9E \u2794 \u82F1\u8A9E)",
      "\u2022 fr (\u30D5\u30E9\u30F3\u30B9\u8A9E \u2794 \u82F1\u8A9E)",
      "\u2022 de (\u30C9\u30A4\u30C4\u8A9E \u2794 \u82F1\u8A9E)"
    ]
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
    notifyLangSwitched: "Native language switched to: {lang} (Note: Command autocomplete descriptions will fully refresh on terminal restart)",
    notifyLangInvalid: "Invalid language code. Supported: zh, ja, en, es, fr, de",
    notifyCompactOn: "[en \u21C4 ja] Single-line capsule mode enabled for compact split panes",
    notifyCompactOff: "[en \u21C4 ja] Full tree layout restored",
    notifyTimeout: "[en \u21C4 ja] English translation timed out or not ready; original prompt passed",
    notifyError: "[en \u21C4 ja] English translation request error; original prompt passed",
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
    modelSelectHint: "Run /lingual-model <model-id> or auto to designate a model.",
    langUsageHint: "Usage: /lang <zh|ja|en|es|fr|de> [target] (e.g. /lang ja or /lang zh ja)",
    langList: [
      "\u2022 zh (Chinese \u2794 English)",
      "\u2022 ja (Japanese \u2794 English)",
      "\u2022 en (English \u2794 Japanese)",
      "\u2022 es (Spanish \u2794 English)",
      "\u2022 fr (French \u2794 English)",
      "\u2022 de (German \u2794 English)"
    ]
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
    notifyLangSwitched: "Idioma nativo cambiado a: {lang} (Nota: Las descripciones del men\xFA de comandos se actualizar\xE1n tras reiniciar la terminal)",
    notifyLangInvalid: "C\xF3digo de idioma no v\xE1lido. Admitidos: zh, ja, en, es, fr, de",
    notifyCompactOn: "[es \u21C4 en] Modo c\xE1psula de una l\xEDnea activado",
    notifyCompactOff: "[es \u21C4 en] Modo \xE1rbol completo restaurado",
    notifyTimeout: "[es \u21C4 en] La traducci\xF3n al ingl\xE9s agot\xF3 el tiempo; se envi\xF3 el texto original",
    notifyError: "[es \u21C4 en] Error en la traducci\xF3n al ingl\xE9s; se envi\xF3 el texto original",
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
    modelSelectHint: "Use /lingual-model <id> o auto para asignar un modelo.",
    langUsageHint: "Uso: /lang <zh|ja|en|es|fr|de> [target] (ej. /lang ja o /lang zh ja)",
    langList: [
      "\u2022 zh (Chino \u2794 Ingl\xE9s)",
      "\u2022 ja (Japon\xE9s \u2794 Ingl\xE9s)",
      "\u2022 en (Ingl\xE9s \u2794 Japon\xE9s)",
      "\u2022 es (Espa\xF1ol \u2794 Ingl\xE9s)",
      "\u2022 fr (Franc\xE9s \u2794 Ingl\xE9s)",
      "\u2022 de (Alem\xE1n \u2794 Ingl\xE9s)"
    ]
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
    notifyLangSwitched: "Langue maternelle chang\xE9e en : {lang} (Note : L'autocompl\xE9tion des commandes sera actualis\xE9e apr\xE8s red\xE9marrage du terminal)",
    notifyLangInvalid: "Code de langue invalide. Pris en charge : zh, ja, en, es, fr, de",
    notifyCompactOn: "[fr \u21C4 en] Mode capsule sur une seule ligne activ\xE9",
    notifyCompactOff: "[fr \u21C4 en] Mode arborescence compl\xE8te restaur\xE9",
    notifyTimeout: "[fr \u21C4 en] La traduction en anglais a expir\xE9 ; le prompt original a \xE9t\xE9 transmis",
    notifyError: "[fr \u21C4 en] Erreur de traduction en anglais ; le prompt original a \xE9t\xE9 transmis",
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
    modelSelectHint: "Entrez /lingual-model <id> ou auto pour d\xE9finir le mod\xE8le.",
    langUsageHint: "Utilisation : /lang <zh|ja|en|es|fr|de> [target] (ex : /lang ja ou /lang zh ja)",
    langList: [
      "\u2022 zh (Chinois \u2794 Anglais)",
      "\u2022 ja (Japonais \u2794 Anglais)",
      "\u2022 en (Anglais \u2794 Japonais)",
      "\u2022 es (Espagnol \u2794 Anglais)",
      "\u2022 fr (Fran\xE7ais \u2794 Anglais)",
      "\u2022 de (Allemand \u2794 Anglais)"
    ]
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
    notifyLangSwitched: "Muttersprache ge\xE4ndert zu: {lang} (Hinweis: Befehlsbeschreibungen werden nach dem Terminal-Neustart vollst\xE4ndig aktualisiert)",
    notifyLangInvalid: "Ung\xFCltiger Sprachcode. Unterst\xFCtzt: zh, ja, en, es, fr, de",
    notifyCompactOn: "[de \u21C4 en] Einzeiliger Kapselmodus aktiviert",
    notifyCompactOff: "[de \u21C4 en] Vollst\xE4ndige Baumansicht wiederhergestellt",
    notifyTimeout: "[de \u21C4 en] Englische \xDCbersetzung hat das Zeitlimit \xFCberschritten; Originaltext wurde \xFCbergeben",
    notifyError: "[de \u21C4 en] Fehler bei der englischen \xDCbersetzung; Originaltext wurde \xFCbergeben",
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
    modelSelectHint: "Geben Sie /lingual-model <id> oder auto ein.",
    langUsageHint: "Verwendung: /lang <zh|ja|en|es|fr|de> [target] (z.B. /lang ja oder /lang zh ja)",
    langList: [
      "\u2022 zh (Chinesisch \u2794 Englisch)",
      "\u2022 ja (Japanisch \u2794 Englisch)",
      "\u2022 en (Englisch \u2794 Japanisch)",
      "\u2022 es (Spanisch \u2794 Englisch)",
      "\u2022 fr (Franz\xF6sisch \u2794 Englisch)",
      "\u2022 de (Deutsch \u2794 Englisch)"
    ]
  }
};
function resolveLabelsForLang(lang, overrides, targetLang) {
  const norm = (lang || "zh").toLowerCase().split("-")[0];
  const target = LANGUAGE_PRESETS[norm] || LANGUAGE_PRESETS.zh;
  const actualTarget = targetLang || (norm === "en" ? "ja" : "en");
  const pairTitle = `${norm} \u21C4 ${actualTarget}`;
  const merged = {
    ...LANGUAGE_PRESETS.en,
    // 1. 英文全量保底 (保证任何新增 key 不为空，不泄露中文)
    ...target,
    // 2. 目标母语官方预设
    hudTitle: pairTitle,
    statusOriginal: pairTitle,
    statusEnglish: pairTitle,
    statusOff: `${pairTitle}: off`,
    ...overrides || {}
    // 3. 用户显式覆盖
  };
  for (const [key, val] of Object.entries(merged)) {
    if (typeof val === "string") {
      merged[key] = val.replace(/\[(?:zh|ja|en|es|fr|de)\s*⇄\s*(?:zh|ja|en|es|fr|de)\]/g, `[${pairTitle}]`);
    }
  }
  return merged;
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

// src/core/prompts.ts
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
      },
      {
        input: "\u6211\u4EEC\u629B\u5F03\u4E86\u81C3\u80BF\u7684\u6846\u67B6\uFF0C\u6362\u6210\u96F6\u4F9D\u8D56\u5355\u6587\u4EF6\uFF0C\u51B7\u542F\u52A8\u76F4\u63A5\u63D0\u901F\u4E8610\u500D",
        spoken: "Ditched the bloated framework for a zero-dep single file \u2014 cold starts are 10x faster now!",
        spoken_meaning: "\u7529\u6389\u4E86\u81C3\u80BF\u7684\u6846\u67B6\u6362\u6210\u4E86\u96F6\u4F9D\u8D56\u5355\u6587\u4EF6\uFF0C\u51B7\u542F\u52A8\u76F4\u63A5\u98D9\u4E8610\u500D\uFF01",
        written: "Replaced the monolithic framework with a zero-dependency architecture, yielding a 10x improvement in cold-start latency.",
        written_meaning: "\u7528\u96F6\u4F9D\u8D56\u67B6\u6784\u53D6\u4EE3\u4E86\u5355\u4F53\u6846\u67B6\uFF0C\u4F7F\u51B7\u542F\u52A8\u5EF6\u8FDF\u964D\u4F4E\u81F3\u539F\u6765\u7684\u5341\u5206\u4E4B\u4E00\u3002",
        vocab: "ditch ... for ... (\u629B\u5F03\u67D0\u7269\u6362\u7528) \xB7 zero-dep (\u96F6\u5916\u90E8\u4F9D\u8D56) \xB7 cold start (\u51B7\u542F\u52A8) \xB7 yield (\u4EA7\u51FA/\u5B9E\u73B0)"
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
      },
      {
        input: "\u80A5\u5927\u5316\u3057\u305F\u30D5\u30EC\u30FC\u30E0\u30EF\u30FC\u30AF\u3092\u6368\u3066\u3066\u4F9D\u5B58\u30BC\u30ED\u306E\u5358\u4E00\u30D5\u30A1\u30A4\u30EB\u306B\u79FB\u884C\u3057\u305F\u3089\u3001\u30B3\u30FC\u30EB\u30C9\u30B9\u30BF\u30FC\u30C8\u304C10\u500D\u901F\u304F\u306A\u308A\u307E\u3057\u305F",
        spoken: "Ditched the bloated framework for a zero-dep single file \u2014 cold starts are 10x faster now!",
        spoken_meaning: "\u91CD\u3044\u30D5\u30EC\u30FC\u30E0\u30EF\u30FC\u30AF\u3092\u3084\u3081\u3066\u4F9D\u5B58\u30BC\u30ED\u306E\u5358\u4E00\u30D5\u30A1\u30A4\u30EB\u306B\u3057\u305F\u3089\u3001\u8D77\u52D5\u304C10\u500D\u901F\u304F\u306A\u308A\u307E\u3057\u305F\uFF01",
        written: "Replaced the monolithic framework with a zero-dependency architecture, yielding a 10x improvement in cold-start latency.",
        written_meaning: "\u4E00\u679A\u5CA9\u306E\u30D5\u30EC\u30FC\u30E0\u30EF\u30FC\u30AF\u304B\u3089\u4F9D\u5B58\u95A2\u4FC2\u30BC\u30ED\u306E\u30A2\u30FC\u30AD\u30C6\u30AF\u30C1\u30E3\u3078\u79FB\u884C\u3057\u3001\u30B3\u30FC\u30EB\u30C9\u30B9\u30BF\u30FC\u30C8\u9045\u5EF6\u309210\u500D\u6539\u5584\u3057\u307E\u3057\u305F\u3002",
        vocab: "ditch ... for ... (\u301C\u3092\u624B\u653E\u3057\u3066\u301C\u306B\u4E57\u308A\u63DB\u3048\u308B) \xB7 zero-dep (\u5916\u90E8\u4F9D\u5B58\u30BC\u30ED) \xB7 cold start (\u30B3\u30FC\u30EB\u30C9\u30B9\u30BF\u30FC\u30C8) \xB7 yield (\u3082\u305F\u3089\u3059)"
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
      },
      {
        input: "Ditched the bloated framework for a zero-dep single file \u2014 cold starts are 10x faster now!",
        spoken: "\u91CD\u3044\u30D5\u30EC\u30FC\u30E0\u30EF\u30FC\u30AF\u3092\u3084\u3081\u3066\u4F9D\u5B58\u30BC\u30ED\u306E\u5358\u4E00\u30D5\u30A1\u30A4\u30EB\u306B\u3057\u305F\u3089\u3001\u8D77\u52D5\u304C10\u500D\u901F\u304F\u306A\u308A\u307E\u3057\u305F\uFF01",
        spoken_meaning: "Discarded the heavy framework and switched to a zero-dep single file; boot speed jumped 10x!",
        written: "\u80A5\u5927\u5316\u3057\u305F\u30D5\u30EC\u30FC\u30E0\u30EF\u30FC\u30AF\u3092\u5EC3\u6B62\u3057\u3066\u4F9D\u5B58\u6027\u30BC\u30ED\u306E\u5358\u4E00\u30D5\u30A1\u30A4\u30EB\u69CB\u9020\u3092\u63A1\u7528\u3057\u3001\u30B3\u30FC\u30EB\u30C9\u30B9\u30BF\u30FC\u30C8\u901F\u5EA6\u309210\u500D\u5411\u4E0A\u3055\u305B\u307E\u3057\u305F\u3002",
        written_meaning: "Eliminated the bloated framework in favor of a zero-dependency architecture, achieving a 10x speedup in cold-start times.",
        vocab: "\u4F9D\u5B58\u30BC\u30ED (zero-dependency) \xB7 \u30B3\u30FC\u30EB\u30C9\u30B9\u30BF\u30FC\u30C8 (cold start) \xB7 \u5411\u4E0A\u3055\u305B\u308B (improve / speed up)"
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
function buildSystemPrompt(sourceLang = "zh", targetLang = "en", isLongInput = false, context, tone = "general") {
  const normSource = (sourceLang || "zh").toLowerCase().split("-")[0];
  const spec = LANGUAGE_SPECS[normSource] || LANGUAGE_SPECS.zh;
  const targetName = targetLang === "ja" ? "Japanese" : targetLang === "zh" ? "Chinese" : "English";
  const anchorText = spec.anchors.map(
    (a) => `Input: ${JSON.stringify(a.input)}
Output: ${JSON.stringify({
      spoken: a.spoken,
      spoken_meaning: a.spoken_meaning,
      written: a.written,
      written_meaning: a.written_meaning,
      vocab: a.vocab
    })}`
  ).join("\n\n");
  const condensationDirective = isLongInput ? `

[LONG INPUT CONDENSATION DIRECTIVE]:
The user's input text is long (>90 chars). DO NOT translate verbatim line by line with wordy padding.
First, distill and synthesize the core architectural/technical intent or question into a concise headline ("summary") in native ${spec.name} (strictly under 20 words).
Then, translate that distilled intent into concise, punchy spoken and written expressions in ${targetName} (strictly under 25 words each) so that the translation fits cleanly on a single card without information bloat.` : "";
  const contextDirective = context && context.trim() ? `

[CONVERSATION & THREAD CONTEXT]:
The user's message is a reply to or continuation of the following context (e.g. tweet, thread, issue):
"""
${context.trim().slice(0, 500)}
"""
Ensure the generated spoken and written translations fit naturally as a responsive reply to this specific context, using authentic conversational grounding.` : "";
  let toneDirective = "";
  if (tone === "social") {
    toneDirective = `

[TONE FOCUS - SOCIAL & COMMUNITY]:
Prioritize X (Twitter), Reddit, and developer community engagement dynamics:
- "spoken": Craft a high-impact, punchy opening hook with authentic Silicon Valley dev slang, rhetorical appeal, or conversational banter. Avoid robotic AI clich\xE9 words (e.g., NEVER use "delve", "testament", "tapestry", "revolutionize").
- "written": High-signal, structured technical insight. Concise, clear, and actionable.`;
  } else if (tone === "tech") {
    toneDirective = `

[TONE FOCUS - TECHNICAL RIGOR]:
Prioritize RFC, Pull Request, and architectural documentation precision:
- "spoken": Direct, respectful engineering alignment (Slack huddles, technical triage).
- "written": High-precision Plain ${targetName} matching modern IETF RFC and open-source release notes.`;
  }
  const jsonFormatHint = isLongInput ? `Strict JSON format:
{
  "summary": "Concise core intent/question in native ${spec.name} (under 20 words)",
  "spoken": "...",
  "spoken_meaning": "...",
  "written": "...",
  "written_meaning": "...",
  "vocab": "..."
}` : `Strict JSON format:
{
  "spoken": "...",
  "spoken_meaning": "...",
  "written": "...",
  "written_meaning": "...",
  "vocab": "..."
}`;
  return `You are an elite bilingual developer language coach and senior software architect.
Task:
Translate the user's message from native ${spec.name} (language A) into TWO distinct authentic ${targetName} registers (language B), and provide the exact back-translation/nuance in native ${spec.name} for each register:
1. "spoken": Natural, fluent spoken ${targetName} (daily standup, Slack, X/Twitter developer banter, agile collaboration, code reviews). Authentic Silicon Valley flow, natural contractions, native phrasal verbs, idioms.
2. "spoken_meaning": The exact colloquial nuance and meaning ${spec.meaningInstruction}.
3. "written": Clear, precise, modern technical written ${targetName} (PR descriptions, RFCs, issues, architecture docs, high-signal technical posts). High-level Plain ${targetName}: active, concise, professional. STRICTLY AVOID archaic Victorian fluff (e.g. "we may now proceed", "precipitated", "parsimonious") and AI-slop buzzwords (e.g. "delve", "testament").
4. "written_meaning": The exact formal technical nuance and meaning ${spec.meaningInstruction}.
5. "vocab": Adaptively extract ALL key idiomatic collocations, phrasal verbs, technical idioms, or advanced expressions bridging the user to high-level/native developer fluency. Do NOT artificially cap at 1-2; extract as many as genuinely beneficial, while keeping each definition concise ${spec.vocabInstruction} to ensure the terminal HUD remains vertically compact.

[CODE & SYMBOL SHIELD - STRICT RULE]:
All inline code (\`foo()\`), file paths (@file, path/to/file), SQL keywords, variable names, and technical identifiers MUST be preserved 100% verbatim in both spoken and written outputs. Never translate, rephrase, or drop code tokens.
${condensationDirective}${contextDirective}${toneDirective}

[GOLDEN FEW-SHOT ANCHORS]:
${anchorText}

${jsonFormatHint}
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
    if (!key || key.length > 256) {
      return;
    }
    if (typeof val === "string" && val.length > 2048) {
      return;
    }
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
var globalLingualCache = new LingualLruCache(50);

// src/core/engine.ts
function tryParseJson(str) {
  try {
    return JSON.parse(str);
  } catch {
    try {
      const repaired = str.replace(/,\s*([}\]])/g, "$1").replace(
        /("(?:spoken|spoken_meaning|written|written_meaning|vocab|casual|academic|slot1|slot2)"\s*:\s*")([\s\S]*?)("(?=\s*,\s*"|\s*\}))/g,
        (_m, prefix, content, suffix) => prefix + content.replace(/(?<!\\)"/g, '\\"') + suffix
      );
      return JSON.parse(repaired);
    } catch {
      return null;
    }
  }
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
    const parsed = tryParseJson(jsonSubstr);
    if (!parsed) return null;
    const spoken = (parsed.spoken || parsed.casual || parsed.slot1 || "").trim();
    const spokenMeaning = (parsed.spoken_meaning || parsed.spokenMeaning || "").trim();
    const written = (parsed.written || parsed.academic || parsed.slot2 || "").trim();
    const writtenMeaning = (parsed.written_meaning || parsed.writtenMeaning || "").trim();
    const vocab = typeof parsed.vocab === "string" ? parsed.vocab.trim() : "";
    const summary = typeof (parsed.summary || parsed.core_intent || parsed.coreIntent) === "string" ? (parsed.summary || parsed.core_intent || parsed.coreIntent).trim() : "";
    if (spoken) {
      return {
        spoken,
        spokenMeaning: spokenMeaning || void 0,
        written: written || void 0,
        writtenMeaning: writtenMeaning || void 0,
        vocab: vocab || void 0,
        summary: summary || void 0
      };
    }
    return null;
  } catch {
    return null;
  }
}

// src/engine.ts
var cachedUserConfig = null;
var lastConfigCheckTime = 0;
var CONFIG_CACHE_TTL_MS = 2e3;
function isTestEnvironment() {
  return process.env.NODE_ENV === "test" || process.env.NODE_TEST_CONTEXT !== void 0 || process.execArgv.some((a) => a.startsWith("--test") || a === "--test") || process.argv.some((a) => a.includes(".test.") || a.includes("test")) || process.env.npm_lifecycle_event === "test";
}
function loadUserLingualConfig() {
  if (isTestEnvironment()) {
    return {};
  }
  const now = Date.now();
  if (cachedUserConfig && now - lastConfigCheckTime < CONFIG_CACHE_TTL_MS) {
    return cachedUserConfig;
  }
  const configPaths = [
    path.join(os.homedir(), ".pi", "agent", "settings.json"),
    path.join(os.homedir(), ".pi", "agent", "lingual.json")
  ];
  for (const p of configPaths) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf8");
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
function isDynamicLongInput(text, sourceLang = "zh") {
  const trimmed = text.trim();
  if (!trimmed) return false;
  const isCjk = sourceLang === "zh" || sourceLang === "ja" || isNonEnglish(trimmed);
  if (isCjk) {
    if (trimmed.length >= 45) return true;
    const sentenceCount = (trimmed.match(/[。！？；\n]/g) || []).length;
    if (sentenceCount >= 2 && trimmed.length >= 30) return true;
  } else {
    if (trimmed.length >= 85) return true;
    const sentenceCount = (trimmed.match(/[.!?](\s+|$)|[\n;]/g) || []).length;
    if (sentenceCount >= 2 && trimmed.length >= 50) return true;
  }
  return trimmed.length >= 85;
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
  if (cfg.signal) {
    if (cfg.signal.aborted) {
      clearTimeout(timer);
      return null;
    }
    cfg.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }
  try {
    let content = null;
    const isLongInput = isDynamicLongInput(trimmed, cfg.sourceLang);
    const sysPrompt = buildSystemPrompt(cfg.sourceLang, cfg.targetLang, isLongInput);
    if (typeof cfg.complete === "function") {
      content = await cfg.complete(trimmed, sysPrompt, controller.signal);
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
    const labels = resolveLabelsForLang(cfg.sourceLang || "zh", cfg.labels);
    const slot1Label = labels.slot1Label || labels.spokenLabel || "Spoken";
    const slot2Label = labels.slot2Label || labels.writtenLabel || "Written";
    const vocabLabel = labels.vocabLabel || "Vocab";
    const sourceLabel = labels.sourceLabel || "Source";
    const effectiveSourceText = isLongInput && payload.summary && payload.summary.trim() ? payload.summary.trim() : trimmed;
    const result = {
      spoken: payload.spoken,
      spokenMeaning: payload.spokenMeaning,
      written: payload.written || "",
      writtenMeaning: payload.writtenMeaning,
      vocab: payload.vocab,
      summary: payload.summary,
      sourceText: effectiveSourceText,
      annotated: formatTerminalAnnotation(
        effectiveSourceText,
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

// src/fsm.ts
var LingualSessionController = class {
  activeAbortController = null;
  currentGeneration = 0;
  // 分页状态管理
  pagedResults = [];
  currentPageIndex = 0;
  totalExpectedPages = 1;
  lastResult = null;
  /**
   * 启动一次新的会话请求：
   * 1. 物理中断前序正在排队或流式传输的 HTTP 请求；
   * 2. 生成单调递增的新世代号；
   * 3. 绑定全新的 AbortSignal。
   */
  beginRequest() {
    this.abortActive();
    this.activeAbortController = new AbortController();
    const generation = ++this.currentGeneration;
    return {
      generation,
      signal: this.activeAbortController.signal
    };
  }
  /**
   * 物理中断当前正在活跃的网络请求
   */
  abortActive() {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }
  }
  /**
   * 判定指定世代号是否仍为当前最新的活跃世代
   */
  isLatest(generation) {
    return this.currentGeneration === generation;
  }
  /**
   * 获取当前最新世代号
   */
  getCurrentGeneration() {
    return this.currentGeneration;
  }
  /**
   * 初始化分页池 (当输入被切分为多个意群分块时调用)
   */
  initPagination(totalExpectedPages) {
    this.pagedResults = [];
    this.currentPageIndex = 0;
    this.totalExpectedPages = Math.max(1, totalExpectedPages);
  }
  /**
   * 存入某个切片的翻译结果 (具备世代守卫，拒绝陈旧世代脏写)
   */
  setPageResult(chunkIndex, result, generation) {
    if (!this.isLatest(generation)) {
      return false;
    }
    this.pagedResults[chunkIndex] = result;
    this.lastResult = result;
    return true;
  }
  /**
   * 获取当前展示页的翻译结果
   */
  getActiveResult() {
    const readyList = this.getReadyPages();
    if (readyList.length === 0) {
      return this.lastResult;
    }
    if (this.currentPageIndex >= readyList.length) {
      this.currentPageIndex = Math.max(0, readyList.length - 1);
    }
    return readyList[this.currentPageIndex] || null;
  }
  /**
   * 获取所有已就绪的分页结果列表
   */
  getReadyPages() {
    return this.pagedResults.filter((item) => Boolean(item));
  }
  /**
   * 获取当前分页状态快照
   */
  getPaginationSnapshot() {
    const readyCount = this.getReadyPages().length;
    const totalPages = Math.max(readyCount, this.totalExpectedPages);
    return {
      pageIndex: this.currentPageIndex,
      totalPages,
      readyCount,
      isMultiPage: totalPages > 1
    };
  }
  /**
   * 翻至下一页 (循环翻页)
   * 返回 true 表示发生了有效翻页
   */
  nextPage() {
    const readyList = this.getReadyPages();
    if (readyList.length <= 1) return false;
    this.currentPageIndex = (this.currentPageIndex + 1) % readyList.length;
    return true;
  }
  /**
   * 翻至上一页 (循环翻页)
   * 返回 true 表示发生了有效翻页
   */
  prevPage() {
    const readyList = this.getReadyPages();
    if (readyList.length <= 1) return false;
    this.currentPageIndex = (this.currentPageIndex - 1 + readyList.length) % readyList.length;
    return true;
  }
  /**
   * 清空分页池 (在遇到非自然语言输入、或关闭伴学时调用，杜绝幽灵卡片复活)
   */
  clearPagination() {
    this.pagedResults = [];
    this.currentPageIndex = 0;
    this.totalExpectedPages = 1;
  }
  /**
   * 获取上一条记录 (用于 /lingual-last 回显)
   */
  getLastResult() {
    return this.lastResult;
  }
  /**
   * 显式设置上一条记录
   */
  setLastResult(result) {
    this.lastResult = result;
  }
  /**
   * 彻底重置状态机
   */
  reset() {
    this.abortActive();
    this.clearPagination();
    this.lastResult = null;
  }
};

// src/sanitizer.ts
var TARGETED_CLIPBOARD_PATH_REGEX = /(?:[a-zA-Z]:[\\\/](?:[^:\r\n\t]+[\\\/])?pi-clipboard-[a-zA-Z0-9\-]+\.png|\/(?:[^\r\n\t]+[\\\/])?pi-clipboard-[a-zA-Z0-9\-]+\.png|(?:[a-zA-Z]:[\\\/](?:[^:\r\n\t]+[\\\/])?)CURRENT_MISSION_STATE\.md)/gi;
var LEADING_TARGETED_CLIPBOARD_REGEX = /^(?:[a-zA-Z]:[\\\/](?:[^:\r\n\t]+[\\\/])?pi-clipboard-[a-zA-Z0-9\-]+\.png|\/(?:[^\r\n\t]+[\\\/])?pi-clipboard-[a-zA-Z0-9\-]+\.png)\s*/i;
var STACK_LINE_REGEX = /^\s*(?:at\s+(?:[\w$.<>]+|[^\s]+)\s*\(.*:\d+:\d+\)|at\s+.*:\d+:\d+|File\s+".*", line \d+, in\s+.*|goroutine \d+ \[.*\]:|Caused by:.*|^\s*\d+:\s+0x[0-9a-f]+)/;
var COMPILER_DIAGNOSTIC_REGEX = /^(?:[a-zA-Z]:[\\\/]|\.{0,2}[\\\/]|[a-zA-Z0-9_\-\.]+)[^:\r\n]+:\d+:\d+:\s*(?:error|warning|fatal error|note):/i;
var LIST_ITEM_REGEX = /^\s*(?:[-*•]|\d+[\.、)])\s+/;
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
  const currentListItems = [];
  const collapsedListBlocks = [];
  const flushListItems = () => {
    if (currentListItems.length >= 2) {
      hasCollapsed = true;
      resultLines.push(`[${currentListItems.length} items ...]`);
      collapsedListBlocks.push(currentListItems.join("\n"));
      currentListItems.length = 0;
    } else if (currentListItems.length === 1) {
      resultLines.push(currentListItems[0]);
      currentListItems.length = 0;
    }
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineTrim = line.trim();
    if (!lineTrim) {
      flushListItems();
      inStackBlock = false;
      inDiagnosticBlock = false;
      continue;
    }
    if (STACK_LINE_REGEX.test(lineTrim) || lineTrim.startsWith("Traceback (most recent call last):")) {
      flushListItems();
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
      flushListItems();
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
      flushListItems();
      hasCollapsed = true;
      if (!resultLines[resultLines.length - 1]?.includes("npm ERR! [...]")) {
        resultLines.push("npm ERR! [...]");
      }
      continue;
    }
    if (LIST_ITEM_REGEX.test(lineTrim)) {
      currentListItems.push(line);
      continue;
    } else {
      flushListItems();
    }
    resultLines.push(line);
  }
  flushListItems();
  const distilledText = resultLines.join(" ").replace(/\s+/g, " ").trim();
  const withoutPlaceholders = distilledText.replace(/\[\.\.\.[^\]]*\]|\[\d+\s*items\s*\.\.\.\]/g, "").replace(/[a-zA-Z0-9_\-\.\/\\:]+/g, "").trim();
  const hasCJK = isNonEnglish(distilledText);
  const hasQuestionKeywords = /(?:为什么|怎么|如何|帮我|排查|优化|修改|修复|为何|报错|审查|看下|explain|why|how|please|help|could you|fix|should|what|inspect)/i.test(distilledText);
  const isPureDiagnosticOutput = /^(?:[a-zA-Z0-9_\-\.\/\\:]+\s*-\s*error\s+[a-zA-Z0-9]+|error(?:\s+TS\d+|:)|warning:)/i.test(distilledText) && !hasQuestionKeywords;
  const isPureErrorOrDiagnostic = isPureDiagnosticOutput || /^Error:\s*[\w\s:]*\[\.\.\.\s*stack trace\s*\.\.\.\]/i.test(distilledText) && !hasQuestionKeywords;
  const cleanEnglishWords = distilledText.replace(/\[\.\.\.[^\]]*\]|\[code[^\]]*\]|\[\d+\s*items\s*\.\.\.\]/gi, " ").trim();
  const words = cleanEnglishWords.match(/\b[a-zA-Z]{2,}\b/g) || [];
  const hasEnglishSentence = !isPureErrorOrDiagnostic && words.length >= 4 && !distilledText.startsWith("Error:");
  const hasNaturalLanguage = (hasCJK || hasQuestionKeywords || hasEnglishSentence || withoutPlaceholders.length > 5) && !isPureErrorOrDiagnostic;
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
    if (collapsedListBlocks.length > 0) {
      payloadParts.push(collapsedListBlocks.join("\n\n"));
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

// src/extension.ts
function isTestEnvironment2() {
  return process.env.NODE_ENV === "test" || process.env.NODE_TEST_CONTEXT !== void 0 || process.execArgv.some((a) => a.startsWith("--test") || a === "--test") || process.argv.some((a) => a.includes(".test.") || a.includes("test")) || process.env.npm_lifecycle_event === "test";
}
var initialDiskConfig = isTestEnvironment2() ? {} : loadUserLingualConfig();
var initialSourceLang = initialDiskConfig.sourceLang || "zh";
var initialTargetLang = initialDiskConfig.targetLang || (initialSourceLang === "en" ? "ja" : "en");
var initialLabels = resolveLabelsForLang(initialSourceLang, initialDiskConfig.labels, initialTargetLang);
var state = {
  mode: initialDiskConfig.mode || "original",
  compact: Boolean(initialDiskConfig.compact),
  sourceLang: initialSourceLang,
  targetLang: initialTargetLang,
  selectedModel: initialDiskConfig.selectedModel || "auto",
  labels: initialLabels
};
function saveUserLingualConfig(patch) {
  if (isTestEnvironment2()) {
    return;
  }
  try {
    const agentDir = path2.join(os2.homedir(), ".pi", "agent");
    const settingsFile = path2.join(agentDir, "settings.json");
    const configFile = path2.join(agentDir, "lingual.json");
    if (fs2.existsSync(settingsFile)) {
      try {
        const raw = fs2.readFileSync(settingsFile, "utf8");
        const settings = JSON.parse(raw);
        const currentBlock = settings["pi-lingual"] || {};
        for (const [k, v] of Object.entries(patch)) {
          if (v === void 0 || v === "auto" || v === "original" || k === "compact" && v === false) {
            delete currentBlock[k];
          } else {
            currentBlock[k] = v;
          }
        }
        if (Object.keys(currentBlock).length === 0) {
          delete settings["pi-lingual"];
        } else {
          settings["pi-lingual"] = currentBlock;
        }
        fs2.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), "utf8");
      } catch {
      }
    }
    if (!fs2.existsSync(agentDir)) {
      fs2.mkdirSync(agentDir, { recursive: true });
    }
    let existing = {};
    if (fs2.existsSync(configFile)) {
      try {
        existing = JSON.parse(fs2.readFileSync(configFile, "utf8"));
      } catch {
      }
    }
    for (const [k, v] of Object.entries(patch)) {
      if (v === void 0 || v === "auto" || v === "original" || k === "compact" && v === false) {
        delete existing[k];
      } else {
        existing[k] = v;
      }
    }
    if (Object.keys(existing).length === 0) {
      if (fs2.existsSync(configFile)) {
        try {
          fs2.unlinkSync(configFile);
        } catch {
        }
      }
    } else {
      fs2.writeFileSync(configFile, JSON.stringify(existing, null, 2), "utf8");
    }
  } catch {
  }
}
var session = new LingualSessionController();
var lastContext = null;
function updateFooter(ctx) {
  if (!ctx.hasUI) return;
  const pair = `${state.sourceLang} \u21C4 ${state.targetLang}`;
  switch (state.mode) {
    case "original":
    case "english":
      ctx.ui.setStatus("lingual", ctx.ui.theme.fg("accent", pair));
      break;
    case "off":
      ctx.ui.setStatus("lingual", ctx.ui.theme.fg("muted", `${pair}: off`));
      break;
  }
}
function renderHudWidget(ctx, sourceText, spoken, written, vocab, spokenMeaning, writtenMeaning, pagination) {
  if (!ctx.hasUI) return;
  const hasWritten = Boolean(written && written.trim());
  const hasVocab = Boolean(vocab && vocab.trim());
  const slot1 = state.labels.slot1Label || state.labels.spokenLabel || "Spoken";
  const slot2 = state.labels.slot2Label || state.labels.writtenLabel || "Written";
  const vocabTag = state.labels.vocabLabel || "Vocab";
  const sourceTag = state.labels.sourceLabel || "Source";
  const pageTag = pagination && pagination.totalPages > 1 ? ctx.ui.theme.fg("muted", ` [${pagination.pageIndex + 1}/${pagination.totalPages} \u2325.]`) : "";
  const pairTitle = `${state.sourceLang} \u21C4 ${state.targetLang}`;
  const isCompact = state.compact || (process.stdout?.rows ? process.stdout.rows < 22 : false);
  if (isCompact) {
    const capsuleText = formatCapsuleLine(
      pairTitle,
      spoken,
      written,
      {
        slot1Short: state.labels.capsuleSlot1Prefix || "Spk",
        slot2Short: state.labels.capsuleSlot2Prefix || "Wrt",
        maxCols: process.stdout?.columns || 80
      }
    );
    ctx.ui.setWidget("lingual_hud", [capsuleText + pageTag], { placement: "aboveEditor" });
    return;
  }
  const spotlightPhrasesList = hasVocab ? extractVocabPhrases(vocab) : [];
  const displaySpoken = spotlightPhrasesList.length > 0 ? spotlightPhrases(spoken, spotlightPhrasesList) : spoken;
  const displayWritten = written && spotlightPhrasesList.length > 0 ? spotlightPhrases(written, spotlightPhrasesList) : written;
  const maxCols = Math.max(30, (process.stdout.columns || 80) - 8);
  const prefixRaw = `  \xB7 [${sourceTag}] `;
  const prefixW = getVisualWidth(prefixRaw);
  const pageTagW = pageTag ? getVisualWidth(pageTag) : 0;
  const availLine1W = Math.max(20, maxCols - prefixW - pageTagW);
  const cleanSource = sourceText.replace(/\r?\n+/g, " ").trim();
  let sourceLines = [];
  if (getVisualWidth(cleanSource) <= availLine1W) {
    sourceLines = [
      ctx.ui.theme.fg("muted", "  \xB7 ") + ctx.ui.theme.fg("muted", "[") + ctx.ui.theme.fg("dim", sourceTag) + ctx.ui.theme.fg("muted", "] ") + cleanSource + pageTag
    ];
  } else {
    const wrapped = wrapVisualText(cleanSource, Math.max(20, maxCols - prefixW));
    sourceLines = wrapped.map((wLine, idx) => {
      const isLast = idx === wrapped.length - 1;
      const tagSuffix = isLast ? pageTag : "";
      if (idx === 0) {
        return ctx.ui.theme.fg("muted", "  \xB7 ") + ctx.ui.theme.fg("muted", "[") + ctx.ui.theme.fg("dim", sourceTag) + ctx.ui.theme.fg("muted", "] ") + wLine + tagSuffix;
      }
      return " ".repeat(prefixW) + ctx.ui.theme.fg("dim", wLine) + tagSuffix;
    });
  }
  let lines = [...sourceLines];
  const pMuted = (s) => ctx.ui.theme.fg("muted", s);
  const pAccent = (s) => ctx.ui.theme.fg("accent", s);
  const pDim = (s) => ctx.ui.theme.fg("dim", s);
  const branch1Char = hasWritten || hasVocab ? "\u250C" : "\u2514";
  const cont1Char = hasWritten || hasVocab ? "\u2502" : " ";
  lines.push(...formatTreeBranch(branch1Char, cont1Char, slot1, displaySpoken, pMuted, pAccent, pMuted, (s) => s, maxCols));
  if (spokenMeaning) {
    lines.push(...formatSubRail(cont1Char, spokenMeaning, "\u21B3", pMuted, pDim, maxCols));
  }
  if (hasWritten) {
    const branchChar = hasVocab ? "\u251C" : "\u2514";
    const contChar = hasVocab ? "\u2502" : " ";
    lines.push(...formatTreeBranch(branchChar, contChar, slot2, displayWritten, pMuted, pAccent, pMuted, (s) => s, maxCols));
    if (writtenMeaning) {
      lines.push(...formatSubRail(contChar, writtenMeaning, "\u21B3", pMuted, pDim, maxCols));
    }
  }
  if (hasVocab) {
    lines.push(...formatTreeBranch("\u2514", " ", vocabTag, vocab, pMuted, pMuted, pMuted, pDim, maxCols));
  }
  const HARD_MAX_LINES = 9;
  if (lines.length > HARD_MAX_LINES) {
    let clampedSourceLines = sourceLines;
    if (sourceLines.length > 2) {
      clampedSourceLines = [
        sourceLines[0],
        truncateVisual(sourceLines[1] + "...", maxCols)
      ];
    }
    const spInline = spokenMeaning ? `${spoken} (${spokenMeaning})` : spoken;
    const rawSpLines = formatTreeBranch(branch1Char, cont1Char, slot1, spInline, pMuted, pAccent, pMuted, (s) => s, maxCols);
    let rawWrLines = [];
    if (hasWritten) {
      const branchChar = hasVocab ? "\u251C" : "\u2514";
      const contChar = hasVocab ? "\u2502" : " ";
      const wrInline = writtenMeaning ? `${written} (${writtenMeaning})` : written || "";
      rawWrLines = formatTreeBranch(branchChar, contChar, slot2, wrInline, pMuted, pAccent, pMuted, (s) => s, maxCols);
    }
    let rawVocabLines = [];
    if (hasVocab) {
      rawVocabLines = formatTreeBranch("\u2514", " ", vocabTag, vocab, pMuted, pMuted, pMuted, pDim, maxCols);
    }
    const totalInline = clampedSourceLines.length + rawSpLines.length + rawWrLines.length + rawVocabLines.length;
    if (totalInline <= HARD_MAX_LINES) {
      lines = [...clampedSourceLines, ...rawSpLines, ...rawWrLines, ...rawVocabLines];
    } else {
      const branchChar = hasVocab ? "\u251C" : "\u2514";
      const contChar = hasVocab ? "\u2502" : " ";
      const pureSpLines = formatTreeBranch(branch1Char, cont1Char, slot1, displaySpoken, pMuted, pAccent, pMuted, (s) => s, maxCols);
      const pureWrLines = hasWritten ? formatTreeBranch(branchChar, contChar, slot2, displayWritten, pMuted, pAccent, pMuted, (s) => s, maxCols) : [];
      const pureVocabLines = hasVocab ? formatTreeBranch("\u2514", " ", vocabTag, vocab, pMuted, pMuted, pMuted, pDim, maxCols) : [];
      const totalPure = clampedSourceLines.length + pureSpLines.length + pureWrLines.length + pureVocabLines.length;
      if (totalPure <= HARD_MAX_LINES) {
        if (clampedSourceLines.length + rawSpLines.length + pureWrLines.length + pureVocabLines.length <= HARD_MAX_LINES) {
          lines = [...clampedSourceLines, ...rawSpLines, ...pureWrLines, ...pureVocabLines];
        } else if (clampedSourceLines.length + pureSpLines.length + rawWrLines.length + pureVocabLines.length <= HARD_MAX_LINES) {
          lines = [...clampedSourceLines, ...pureSpLines, ...rawWrLines, ...pureVocabLines];
        } else {
          lines = [...clampedSourceLines, ...pureSpLines, ...pureWrLines, ...pureVocabLines];
        }
      } else {
        const remForText = Math.max(4, HARD_MAX_LINES - clampedSourceLines.length - Math.min(2, pureVocabLines.length));
        const spBudget = Math.max(1, Math.min(pureSpLines.length, Math.floor(remForText / 2)));
        const wrBudget = Math.max(1, Math.min(pureWrLines.length, remForText - spBudget));
        const clampLines = (arr, budget) => {
          if (arr.length <= budget) return arr;
          const res = arr.slice(0, budget);
          const last = res.length - 1;
          res[last] = truncateVisual(res[last] + "...", maxCols);
          return res;
        };
        const spSafe = clampLines(pureSpLines, spBudget);
        const wrSafe = clampLines(pureWrLines, wrBudget);
        const remForVocab = Math.max(1, HARD_MAX_LINES - clampedSourceLines.length - spSafe.length - wrSafe.length);
        let vLines = pureVocabLines;
        if (vLines.length > remForVocab) {
          if (remForVocab === 1) {
            const vPrefix = `  \u2514 [${vocabTag}] `;
            vLines = [formatVocabItemsAtomic(vocab || "", vPrefix, maxCols)];
          } else {
            vLines = vLines.slice(0, remForVocab);
          }
        }
        lines = [...clampedSourceLines, ...spSafe, ...wrSafe, ...vLines];
        if (lines.length > HARD_MAX_LINES) {
          lines = lines.slice(0, HARD_MAX_LINES);
        }
      }
    }
  }
  if (lines.length > 9) {
    lines = lines.slice(0, 9);
  }
  ctx.ui.setWidget("lingual_hud", lines, { placement: "aboveEditor" });
}
function renderActiveCard(ctx) {
  const readyList = session.getReadyPages();
  if (readyList.length === 0) return;
  const snapshot = session.getPaginationSnapshot();
  const res = session.getActiveResult();
  if (!res) return;
  renderHudWidget(
    ctx,
    res.sourceText,
    res.spoken,
    res.written,
    res.vocab,
    res.spokenMeaning,
    res.writtenMeaning,
    {
      pageIndex: snapshot.pageIndex,
      totalPages: snapshot.readyCount
    }
  );
}
function extension_default(pi) {
  let resizeTimer;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const active = session.getActiveResult() || session.getLastResult();
      if (active && lastContext && lastContext.hasUI) {
        renderActiveCard(lastContext);
      }
    }, 120);
  };
  process.stdout?.on("resize", onResize);
  pi.on("session_start", async (_event, ctx) => {
    lastContext = ctx;
    updateFooter(ctx);
  });
  const setModeHandler = async (args, ctx) => {
    session.abortActive();
    const trimmed = args?.trim().toLowerCase();
    let nextMode;
    if (trimmed === "english" || trimmed === "en" || trimmed === "eng" || trimmed === "2") {
      nextMode = "english";
    } else if (trimmed === "original" || trimmed === "orig" || trimmed === "1") {
      nextMode = "original";
    } else if (trimmed === "off" || trimmed === "0" || trimmed === "disable" || trimmed === "stop") {
      nextMode = "off";
    } else {
      nextMode = state.mode === "original" ? "english" : state.mode === "english" ? "off" : "original";
    }
    state.mode = nextMode;
    saveUserLingualConfig({ mode: nextMode });
    updateFooter(ctx);
    if (nextMode === "english") {
      ctx.ui.notify(state.labels.notifyEnglish || `[${state.labels.hudTitle}] Switched to [English] mode: Input to AI will be converted to technical English`, "info");
    } else if (nextMode === "off") {
      if (ctx.hasUI && typeof ctx.ui.setWidget === "function") {
        ctx.ui.setWidget("lingual_hud", void 0);
      }
      ctx.ui.notify(state.labels.notifyOff || `[${state.labels.hudTitle}] Companion turned off`, "info");
    } else {
      ctx.ui.notify(state.labels.notifyOriginal || `[${state.labels.hudTitle}] Switched to [Original] mode: Input kept in native language, translations shown above`, "info");
    }
  };
  const setModelHandler = async (args, ctx) => {
    const trimmed = args.trim();
    const followSessionDesc = state.labels.modelFollowSession || "follow session";
    const currentActive = state.selectedModel === "auto" ? ctx.model ? `auto (${followSessionDesc}: ${ctx.model.provider}/${ctx.model.id})` : "auto" : state.selectedModel;
    if (!trimmed) {
      const available = ctx.modelRegistry?.getAvailable?.() || [];
      const availableList = available.length > 0 ? available.map((m) => `\u2022 ${m.provider}/${m.id}`).slice(0, 8).join("\n") : void 0;
      const msg = formatModelSelectionMessage(state.labels, currentActive || "auto", availableList);
      ctx.ui.notify(msg, "info");
      return;
    }
    state.selectedModel = trimmed;
    saveUserLingualConfig({ selectedModel: trimmed });
    const switchTemplate = state.labels.notifyModelSwitched || "Companion model switched to: {model}";
    const switchedMsg = `[${state.labels.hudTitle}] ` + switchTemplate.replace("{model}", trimmed);
    ctx.ui.notify(switchedMsg, "info");
  };
  function normalizeLangCode(input) {
    const s = input.trim().toLowerCase().replace(/[-_].*$/, "");
    if (s === "zh" || s === "cn" || s === "chinese" || s === "\u4E2D\u6587") return "zh";
    if (s === "ja" || s === "jp" || s === "japanese" || s === "\u65E5\u672C\u8A9E" || s === "\u65E5\u6587" || s === "\u65E5\u8BED") return "ja";
    if (s === "en" || s === "eng" || s === "english" || s === "\u82F1\u8BED" || s === "\u82F1\u6587") return "en";
    if (s === "es" || s === "spanish" || s === "espa\xF1ol" || s === "\u897F\u8BED" || s === "\u897F\u73ED\u7259\u8BED") return "es";
    if (s === "fr" || s === "french" || s === "fran\xE7ais" || s === "\u6CD5\u8BED" || s === "\u6CD5\u6587") return "fr";
    if (s === "de" || s === "german" || s === "deutsch" || s === "\u5FB7\u8BED" || s === "\u5FB7\u6587") return "de";
    return s;
  }
  const switchLangHandler = async (args, ctx) => {
    const trimmed = args.trim().toLowerCase();
    if (!trimmed || trimmed === "list" || trimmed === "help" || trimmed === "?") {
      const listText = (state.labels.langList || [
        "\u2022 zh (Chinese \u2794 English)",
        "\u2022 ja (Japanese \u2794 English)",
        "\u2022 en (English \u2794 Japanese)",
        "\u2022 es (Spanish \u2794 English)",
        "\u2022 fr (French \u2794 English)",
        "\u2022 de (German \u2794 English)"
      ]).join("\n");
      const usage = state.labels.langUsageHint || "Usage: /lang <zh|ja|en|es|fr|de> [target] (e.g. /lang ja or /lang zh ja)";
      ctx.ui.notify(
        `[${state.sourceLang} \u21C4 ${state.targetLang}] ${state.labels.statusReportFlow || "Flow"}: [${state.sourceLang} \u2794 ${state.targetLang}]
${listText}
${usage}`,
        "info"
      );
      return;
    }
    const parts = trimmed.split(/\s*->\s*|\s*➔\s*|\s+to\s+|\s+/).filter(Boolean);
    const newSource = normalizeLangCode(parts[0]);
    const newTarget = parts.length > 1 ? normalizeLangCode(parts[1]) : newSource === "en" ? "ja" : "en";
    if (!LANGUAGE_PRESETS[newSource]) {
      ctx.ui.notify(
        state.labels.notifyLangInvalid || "Invalid language code. Supported: zh, ja, en, es, fr, de",
        "warning"
      );
      return;
    }
    state.sourceLang = newSource;
    state.targetLang = newTarget;
    state.labels = resolveLabelsForLang(newSource, void 0, newTarget);
    saveUserLingualConfig({ sourceLang: newSource, targetLang: newTarget });
    session.reset();
    globalLingualCache.clear();
    updateFooter(ctx);
    const template = state.labels.notifyLangSwitched || "Native language switched to: {lang}";
    const flowText = `${newSource} \u21C4 ${newTarget}`;
    ctx.ui.notify(`[${flowText}] ` + template.replace("{lang}", flowText), "info");
  };
  const toggleCompactHandler = async (_args, ctx) => {
    state.compact = !state.compact;
    saveUserLingualConfig({ compact: state.compact });
    const msg = state.compact ? state.labels.notifyCompactOn || `[${state.labels.hudTitle}] Single-line capsule mode enabled` : state.labels.notifyCompactOff || `[${state.labels.hudTitle}] Full tree layout restored`;
    ctx.ui.notify(msg, "info");
    if (session.getReadyPages().length > 0) {
      renderActiveCard(ctx);
    } else if (session.getLastResult()) {
      const last = session.getLastResult();
      renderHudWidget(
        ctx,
        last.sourceText,
        last.spoken,
        last.written,
        last.vocab,
        last.spokenMeaning,
        last.writtenMeaning
      );
    }
  };
  const showStatusHandler = async (_args, ctx) => {
    const followDesc = state.labels.modelFollowSession || "follow session";
    const activeModel = state.selectedModel === "auto" ? ctx.model ? `auto (${followDesc}: ${ctx.model.provider}/${ctx.model.id})` : "auto" : state.selectedModel || "auto";
    const statusMsg = formatStatusReport(state.labels, {
      mode: state.mode,
      sourceLang: state.sourceLang,
      targetLang: state.targetLang,
      activeModel,
      layout: state.compact ? "capsule" : "tree",
      cacheStats: globalLingualCache.getStats()
    });
    ctx.ui.notify(statusMsg, "info");
  };
  const showLastHandler = async (_args, ctx) => {
    if (session.getReadyPages().length > 0) {
      renderActiveCard(ctx);
      ctx.ui.notify(state.labels.notifyHistoryRestored || `[${state.labels.hudTitle}] Restored previous companion card`, "info");
      return;
    }
    const last = session.getLastResult();
    if (!last) {
      ctx.ui.notify(state.labels.notifyNoHistory || `[${state.labels.hudTitle}] No previous companion card recorded`, "info");
      return;
    }
    renderHudWidget(
      ctx,
      last.sourceText,
      last.spoken,
      last.written,
      last.vocab,
      last.spokenMeaning,
      last.writtenMeaning
    );
    ctx.ui.notify(state.labels.notifyHistoryRestored || `[${state.labels.hudTitle}] Restored previous companion card`, "info");
  };
  const masterCommandHandler = async (args, ctx) => {
    const trimmed = args?.trim();
    if (!trimmed) {
      await setModeHandler("", ctx);
      return;
    }
    const lower = trimmed.toLowerCase();
    const spaceIndex = lower.indexOf(" ");
    const sub = spaceIndex === -1 ? lower : lower.slice(0, spaceIndex);
    const subArgs = spaceIndex === -1 ? "" : trimmed.slice(spaceIndex + 1).trim();
    if (sub === "lang" || sub === "language") {
      await switchLangHandler(subArgs, ctx);
      return;
    }
    if (sub === "model") {
      await setModelHandler(subArgs, ctx);
      return;
    }
    if (sub === "compact" || sub === "capsule" || sub === "layout") {
      await toggleCompactHandler(subArgs, ctx);
      return;
    }
    if (sub === "status" || sub === "info" || sub === "report") {
      await showStatusHandler(subArgs, ctx);
      return;
    }
    if (sub === "last" || sub === "prev" || sub === "history") {
      await showLastHandler(subArgs, ctx);
      return;
    }
    if (sub === "agent" || sub === "help" || sub === "?") {
      ctx.ui.notify(
        state.labels.notifyAgentHelp || "\u{1F4A1} Switch native language with /lang <zh|ja|en|es|fr|de> anytime; for advanced prompt or style customization, simply describe your preferences to your Agent.",
        "info"
      );
      return;
    }
    if (sub === "mode" || sub === "original" || sub === "english" || sub === "off" || sub === "orig" || sub === "disable" || sub === "stop") {
      await setModeHandler(sub === "mode" ? subArgs : trimmed, ctx);
      return;
    }
    const possibleLang = normalizeLangCode(sub);
    if (LANGUAGE_PRESETS[possibleLang]) {
      await switchLangHandler(trimmed, ctx);
      return;
    }
    await setModeHandler(trimmed, ctx);
  };
  pi.registerCommand("lingual", {
    description: state.labels.cmdDescMode || "Switch or manage companion: /lingual [lang|model|compact|status|original|english|off]",
    handler: masterCommandHandler
  });
  pi.registerCommand("2", {
    description: state.labels.cmdDescMode || "Companion quick bus (alias): /2 [lang|model|compact|status|original|english|off]",
    handler: masterCommandHandler
  });
  pi.registerCommand("lingual-mode", {
    description: state.labels.cmdDescMode || "Set companion mode: /lingual-mode <original|english|off>",
    handler: setModeHandler
  });
  pi.registerCommand("lang", {
    description: state.labels.cmdDescLang || "Switch companion language: /lang <zh|ja|en|es|fr|de> [target]",
    handler: switchLangHandler
  });
  pi.registerCommand("lingual-lang", {
    description: state.labels.cmdDescLang || "Switch companion language (alias): /lingual-lang <zh|ja|en|es|fr|de>",
    handler: switchLangHandler
  });
  pi.registerCommand("2-lang", {
    description: state.labels.cmdDescLang || "Quick switch companion native language (alias): /2-lang <lang>",
    handler: switchLangHandler
  });
  pi.registerCommand("lingual-compact", {
    description: state.labels.cmdDescCompact || "Toggle single-line capsule mode: /lingual-compact",
    handler: toggleCompactHandler
  });
  pi.registerCommand("2-compact", {
    description: state.labels.cmdDescCompact || "Toggle single-line capsule mode (alias): /2-compact",
    handler: toggleCompactHandler
  });
  pi.registerCommand("lingual-model", {
    description: state.labels.cmdDescModel || "Inspect or switch companion model: /lingual-model [model-id|auto]",
    handler: setModelHandler
  });
  pi.registerCommand("2-model", {
    description: state.labels.cmdDescModel || "Inspect or switch companion model (alias)",
    handler: setModelHandler
  });
  pi.registerCommand("lingual-status", {
    description: state.labels.cmdDescStatus || "Display companion status report: /lingual-status",
    handler: showStatusHandler
  });
  pi.registerCommand("2-status", {
    description: state.labels.cmdDescStatus || "Display companion status report (alias)",
    handler: showStatusHandler
  });
  pi.registerCommand("last", {
    description: state.labels.cmdDescLast || "Replay previous companion card: /last",
    handler: showLastHandler
  });
  pi.registerCommand("lingual-last", {
    description: state.labels.cmdDescLast || "Replay previous companion card: /lingual-last",
    handler: showLastHandler
  });
  pi.registerCommand("2-last", {
    description: state.labels.cmdDescLast || "Replay previous companion card (alias)",
    handler: showLastHandler
  });
  pi.registerCommand("lingual-agent", {
    description: state.labels.cmdDescAgent || "View companion customization and language guide: /lingual-agent",
    handler: async (_args, ctx) => {
      ctx.ui.notify(
        state.labels.notifyAgentHelp || "\u{1F4A1} Switch native language with /lang <zh|ja|en|es|fr|de> anytime; for advanced prompt or style customization, simply describe your preferences to your Agent.",
        "info"
      );
    }
  });
  if (typeof pi.registerShortcut === "function") {
    pi.registerShortcut("alt+.", {
      description: state.labels.shortcutNextPage || "Switch to next companion segment",
      handler: async (ctx) => {
        if (session.nextPage()) {
          renderActiveCard(ctx);
        }
      }
    });
    pi.registerShortcut("alt+,", {
      description: state.labels.shortcutPrevPage || "Switch to previous companion segment",
      handler: async (ctx) => {
        if (session.prevPage()) {
          renderActiveCard(ctx);
        }
      }
    });
  }
  const createModelCompleter = (ctx) => {
    return async (text, systemPrompt, signal) => {
      try {
        if (!ctx.modelRegistry) return null;
        let targetModel = ctx.model;
        if (state.selectedModel && state.selectedModel !== "auto") {
          const available = ctx.modelRegistry.getAvailable?.() || [];
          const match = available.find(
            (m) => m.id === state.selectedModel || `${m.provider}/${m.id}` === state.selectedModel || m.id.toLowerCase().includes(state.selectedModel.toLowerCase())
          );
          if (match) targetModel = match;
        }
        if (!targetModel) return null;
        const stream = ctx.modelRegistry.streamSimple(
          targetModel,
          {
            systemPrompt,
            messages: [
              {
                role: "user",
                content: [{ type: "text", text }],
                timestamp: Date.now()
              }
            ]
          },
          {
            reasoning: "low",
            maxTokens: 600
          }
        );
        const timeoutPromise = new Promise(
          (_, reject) => setTimeout(() => reject(new Error("Lingual translation timed out")), 3e4)
        );
        const abortPromise = new Promise((_, reject) => {
          if (signal?.aborted) reject(new Error("Lingual translation aborted"));
          signal?.addEventListener("abort", () => reject(new Error("Lingual translation aborted")), { once: true });
        });
        const res = await Promise.race([stream.result(), timeoutPromise, abortPromise]);
        if (!res) return null;
        const content = res.content?.filter((c) => c.type === "text")?.map((c) => c.text)?.join("");
        return content && content.trim() ? content.trim() : null;
      } catch {
        return null;
      }
    };
  };
  pi.on("input", async (event, ctx) => {
    if (state.mode === "off") return { action: "continue" };
    if (event.source === "extension") return { action: "continue" };
    const raw = event.text.trim();
    if (!raw) return { action: "continue" };
    if (raw.startsWith("/") || raw.startsWith("!")) {
      return { action: "continue" };
    }
    const sanitized = sanitizePromptForTranslation(raw);
    const promptToTranslate = sanitized.distilledText;
    if (!sanitized.hasNaturalLanguage || !shouldTriggerTranslation(promptToTranslate, state.sourceLang)) {
      if (ctx.hasUI) {
        ctx.ui.setWidget("lingual_hud", void 0);
      }
      session.clearPagination();
      return { action: "continue" };
    }
    lastContext = ctx;
    const { generation, signal } = session.beginRequest();
    const completer = createModelCompleter(ctx);
    session.initPagination(1);
    if (state.mode === "original") {
      if (ctx.hasUI) {
        ctx.ui.setWidget("lingual_hud", void 0);
        ctx.ui.setStatus("lingual", ctx.ui.theme.fg("accent", "\u21C4 [lingual] polishing..."));
      }
      setTimeout(() => {
        if (!session.isLatest(generation) || state.mode !== "original") {
          return;
        }
        translatePrompt(promptToTranslate, {
          sourceLang: state.sourceLang,
          targetLang: state.targetLang,
          labels: state.labels,
          complete: completer,
          signal
        }).then((result) => {
          if (!session.isLatest(generation) || state.mode !== "original") {
            return;
          }
          if (result) {
            session.setPageResult(0, result, generation);
            if (ctx.hasUI) {
              renderHudWidget(
                ctx,
                result.sourceText,
                result.spoken,
                result.written,
                result.vocab,
                result.spokenMeaning,
                result.writtenMeaning
              );
            }
          }
        }).finally(() => {
          if (session.isLatest(generation)) {
            updateFooter(ctx);
          }
        });
      }, 80);
      return { action: "continue" };
    }
    if (ctx.hasUI) {
      ctx.ui.setWidget(
        "lingual_hud",
        [ctx.ui.theme.fg("muted", "  \u22EF \u21C4 [lingual] polishing...")],
        { placement: "aboveEditor" }
      );
      ctx.ui.setStatus("lingual", ctx.ui.theme.fg("accent", "\u21C4 [lingual] polishing..."));
    }
    try {
      const result = await translatePrompt(promptToTranslate, {
        sourceLang: state.sourceLang,
        targetLang: state.targetLang,
        labels: state.labels,
        complete: completer,
        signal
      });
      if (!session.isLatest(generation)) {
        return { action: "continue" };
      }
      if (!result) {
        if (ctx.hasUI) {
          ctx.ui.setWidget("lingual_hud", void 0);
          const timeoutTemplate = state.labels.notifyTimeout || "[{pair}] English translation timed out or not ready; original prompt passed";
          ctx.ui.notify(timeoutTemplate.replace("{pair}", state.labels.hudTitle), "warning");
        }
        return { action: "continue" };
      }
      session.setPageResult(0, result, generation);
      if (ctx.hasUI) {
        renderHudWidget(
          ctx,
          result.sourceText,
          result.spoken,
          result.written,
          result.vocab,
          result.spokenMeaning,
          result.writtenMeaning
        );
      }
      const combinedEnglish = result.written && result.written.trim() ? result.written : result.spoken;
      const finalText = sanitized.rawPayload ? `${combinedEnglish}

${sanitized.rawPayload}` : combinedEnglish;
      return {
        action: "transform",
        text: finalText,
        images: event.images
      };
    } catch {
      if (ctx.hasUI) {
        ctx.ui.setWidget("lingual_hud", void 0);
        const errTemplate = state.labels.notifyError || "[{pair}] English translation request error; original prompt passed";
        ctx.ui.notify(errTemplate.replace("{pair}", state.labels.hudTitle), "warning");
      }
      return { action: "continue" };
    } finally {
      if (session.isLatest(generation)) {
        updateFooter(ctx);
      }
    }
  });
}
export {
  extension_default as default
};
