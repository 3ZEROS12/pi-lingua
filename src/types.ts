export type {
  LingualRequest,
  LingualResponse,
  LingualMode,
  LinguaMode,
  LingualConfig,
  LinguaConfig,
  LingualResult,
  LinguaResult,
  TranslationPayload,
} from "./core/types.js";

export interface LingualI18nLabels {
  slot1Label: string;      // e.g. "Spoken" | "口語" | "Slack"
  slot2Label: string;      // e.g. "Written" | "文面" | "RFC"
  vocabLabel: string;      // e.g. "Vocab" | "単語"
  sourceLabel: string;     // e.g. "Original" | "原文"
  hudTitle: string;        // e.g. "zh ⇄ en" | "en ⇄ ja"
  statusOriginal: string;  // e.g. "zh ⇄ en"
  statusEnglish: string;   // e.g. "zh ⇄ en"
  statusOff: string;       // e.g. "zh ⇄ en: off"
  subNuanceLabel?: string; // e.g. "↳"

  // Localized notifications (Primary Language Sovereignty)
  notifyOriginal?: string;
  notifyEnglish?: string;
  notifyOff?: string;
  notifyPaging?: string;
  notifyNoHistory?: string;
  notifyHistoryRestored?: string;
  notifyAgentHelp?: string;
  notifyModelSwitched?: string; // template containing {model} or format string
  notifyLangSwitched?: string;  // template containing {lang}
  notifyLangInvalid?: string;
  notifyCompactOn?: string;
  notifyCompactOff?: string;
  notifyTimeout?: string;
  notifyError?: string;

  // Localized command descriptions
  cmdDescMode?: string;
  cmdDescStatus?: string;
  cmdDescModel?: string;
  cmdDescLang?: string;
  cmdDescCompact?: string;
  cmdDescLast?: string;
  cmdDescAgent?: string;
  shortcutNextPage?: string;
  shortcutPrevPage?: string;

  // Localized capsule prefixes
  capsuleSlot1Prefix?: string; // e.g. "Spk" | "口"
  capsuleSlot2Prefix?: string; // e.g. "Wrt" | "写"
  layoutCapsule?: string;      // e.g. "单行胶囊模式" | "Single-Line Capsule"
  layoutTree?: string;         // e.g. "左导轨树状架构" | "Left-Rail Tree"

  // Localized status report & model diagnostics
  statusReportTitle?: string;
  statusReportMode?: string;
  statusReportFlow?: string;
  statusReportModel?: string;
  statusReportCache?: string;
  statusReportLayout?: string;
  statusReportAuth?: string;
  statusReportShortcuts?: string;
  modeDescOriginal?: string;
  modeDescEnglish?: string;
  modeDescOff?: string;

  // Localized model selector chrome
  modelCurrentLabel?: string;
  modelFollowSession?: string;
  modelAvailableListHeader?: string;
  modelAutoFollowDesc?: string;
  modelSelectHint?: string;

  // Localized language switcher & usage hints (Zero Chinese Residue)
  langUsageHint?: string;
  langList?: string[];

  // Aliases for backwards compatibility
  spokenLabel?: string;
  writtenLabel?: string;
}
export type LinguaI18nLabels = LingualI18nLabels;
