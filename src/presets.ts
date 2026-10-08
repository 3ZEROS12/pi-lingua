import type { LinguaI18nLabels } from "./types.js";

/**
 * 官方预设多语言映射矩阵 (Language Preset Matrix)
 * 当用户或 Agent 设定母语 A 时，所有 UI 标签、图腾与状态文本自动本地化，彻底根除跨语言残留。
 */
export const LANGUAGE_PRESETS: Record<string, LinguaI18nLabels> = {
  zh: {
    slot1Label: "口语",
    slot2Label: "写作",
    vocabLabel: "重点",
    sourceLabel: "原文",
    hudTitle: "二 ⇄ two",
    statusOriginal: "⇄ [二 ⇄ two] 原文",
    statusEnglish: "⇄ [二 ⇄ two] 英文",
    statusOff: "⇄ [二 ⇄ two]: 关",
    subNuanceLabel: "↳",

    notifyOriginal: "已切换至【原文模式】：输入保持纯净母语，上方 HUD 浮现伴学视窗",
    notifyEnglish: "已切换至【英文模式】：发给 AI 的输入将自动转换为纯正技术英文",
    notifyOff: "已关闭伴学",
    notifyPaging: "长句已切分多段，按 Alt+. 或 Alt+, 翻页浏览",
    notifyNoHistory: "暂无上一条伴学记录",
    notifyHistoryRestored: "已重新显示上一条伴学卡片",
    notifyAgentHelp: "💡 切换母语？直接运行 /lingua-lang <zh|ja|en|es|fr|de> 即可实时切换并持久化；若需定制特殊风格，可直接向 Agent 描述你的定制偏好。",
    notifyModelSwitched: "伴学模型已切换为: {model}",
    notifyLangSwitched: "伴学母语已切换为: {lang}",
    notifyLangInvalid: "无效的语言代码。支持的语言代码: zh, ja, en, es, fr, de",
    notifyCompactOn: "已开启单行胶囊模式：极简占位，保护分屏视野",
    notifyCompactOff: "已切换为左导轨树状架构：展示完整双模与语感",

    cmdDescMode: "切换伴学模式 [二 ⇄ two]: [原文] ➔ [英文] ➔ [关]",
    cmdDescStatus: "查看伴学插件当前状态报告与模型诊断: /lingua-status",
    cmdDescModel: "查看或切换伴学模型 [二 ⇄ two]: /lingua-model [model-id|auto]",
    cmdDescLang: "查看或切换伴学母语 [二 ⇄ two]: /lingua-lang [zh|ja|en|es|fr|de]",
    cmdDescCompact: "切换单行胶囊模式与完整树状图: /lingua-compact",
    cmdDescLast: "重新回看或重现上一条伴学卡片: /lingua-last",
    cmdDescAgent: "查看伴学定制与母语切换指南: /lingua-agent",
    shortcutNextPage: "切换至下一段伴学切片",
    shortcutPrevPage: "切换至上一段伴学切片",

    capsuleSlot1Prefix: "口",
    capsuleSlot2Prefix: "写",
    layoutCapsule: "单行胶囊极简流 (1-Line Capsule)",
    layoutTree: "Trifecta 开放式左导轨树状架构 (· ┌ ├ └)",

    statusReportTitle: "运行状态报告",
    statusReportMode: "当前模式",
    statusReportFlow: "语言流向",
    statusReportModel: "伴学模型",
    statusReportCache: "会话缓存",
    statusReportLayout: "HUD布局: Trifecta 开放式左导轨树状架构 (· ┌ ├ └)",
    statusReportAuth: "凭据模式: Pi 原生进程内认证 (Zero Config · 零Token泄露)",
    statusReportShortcuts: "快捷操作: /2 (切换模式) · /lingua-lang (切母语) · /lingua-model (切模型) · /lingua-agent (定制语言)",
    modeDescOriginal: "原文直通 · 0ms非阻塞",
    modeDescEnglish: "英文模式 · 深度代码推理",
    modeDescOff: "已关闭",

    modelCurrentLabel: "当前伴学模型",
    modelFollowSession: "跟随会话",
    modelAvailableListHeader: "可用模型 (输入 /lingua-model <id> 切换):",
    modelAutoFollowDesc: "auto (自动跟随当前会话主模型)",
    modelSelectHint: "可输入 /lingua-model <model-id> 或 auto 指定伴学模型。",
  },
  ja: {
    slot1Label: "口語",
    slot2Label: "文面",
    vocabLabel: "単語",
    sourceLabel: "原文",
    hudTitle: "二 ⇄ two",
    statusOriginal: "⇄ [二 ⇄ two] 原文",
    statusEnglish: "⇄ [二 ⇄ two] 英語",
    statusOff: "⇄ [二 ⇄ two]: オフ",
    subNuanceLabel: "↳",

    notifyOriginal: "【原文モード】に切り替えました：入力は原文のまま、上部カードで英語を表示",
    notifyEnglish: "【英語モード】に切り替えました：AIへの入力は純粋な技術英語に自動変換されます",
    notifyOff: "伴走機能をオフにしました",
    notifyPaging: "長文を分割しました。Alt+. または Alt+, でページ送り",
    notifyNoHistory: "前回の記録はありません",
    notifyHistoryRestored: "前回のカードを復元しました",
    notifyAgentHelp: "💡 母語の変更は /lingua-lang <zh|ja|en|es|fr|de> で即時切り替え・保存できます。特別な文体や語域のカスタマイズが必要な場合は、Agent に直接ご要望をお伝えください。",
    notifyModelSwitched: "モデルを切り替えました: {model}",
    notifyLangSwitched: "母語を切り替えました: {lang}",
    notifyLangInvalid: "無効な言語コードです。対応言語: zh, ja, en, es, fr, de",
    notifyCompactOn: "1行カプセルモードを有効にしました：画面領域を最大限確保",
    notifyCompactOff: "フルツリー表示に切り替えました：詳細なニュアンスを表示",

    cmdDescMode: "モード切替 [二 ⇄ two]: [原文] ➔ [英語] ➔ [オフ]",
    cmdDescStatus: "状態レポートとモデル診断を表示: /lingua-status",
    cmdDescModel: "学習モデルの確認・切替: /lingua-model [model-id|auto]",
    cmdDescLang: "伴走の母語を確認・変更: /lingua-lang [zh|ja|en|es|fr|de]",
    cmdDescCompact: "1行カプセル表示とフルツリーの切替: /lingua-compact",
    cmdDescLast: "前回の伴走カードを再表示: /lingua-last",
    cmdDescAgent: "伴走カスタマイズと母語変更の案内を表示: /lingua-agent",
    shortcutNextPage: "次のセグメントに切り替え",
    shortcutPrevPage: "前のセグメントに切り替え",

    capsuleSlot1Prefix: "口",
    capsuleSlot2Prefix: "文",
    layoutCapsule: "1行カプセル表示 (1-Line Capsule)",
    layoutTree: "Trifecta オープン左レールツリー構造 (· ┌ ├ └)",

    statusReportTitle: "ステータスレポート",
    statusReportMode: "現在のモード",
    statusReportFlow: "言語フロー",
    statusReportModel: "伴走モデル",
    statusReportCache: "セッションキャッシュ",
    statusReportLayout: "HUDレイアウト: Trifecta オープン左レールツリー構造 (· ┌ ├ └)",
    statusReportAuth: "認証方式: Pi ネイティブインプロセス認証 (ゼロ設定・Token安全)",
    statusReportShortcuts: "クイック操作: /2 (モード切替) · /lingua-lang (母語切替) · /lingua-model (モデル切替) · /lingua-agent (カスタマイズ)",
    modeDescOriginal: "原文パススルー · 0ms非同期",
    modeDescEnglish: "英語モード · 高度コード推論",
    modeDescOff: "オフ",

    modelCurrentLabel: "現在の学習モデル",
    modelFollowSession: "セッション連動",
    modelAvailableListHeader: "利用可能なモデル (/lingua-model <id> で切替):",
    modelAutoFollowDesc: "auto (セッションの主モデルに自動追従)",
    modelSelectHint: "/lingua-model <model-id> または auto を入力してモデルを指定できます。",
  },
  en: {
    slot1Label: "Spoken",
    slot2Label: "Written",
    vocabLabel: "Vocab",
    sourceLabel: "Source",
    hudTitle: "two ⇄ 二",
    statusOriginal: "⇄ [two ⇄ 二] Original",
    statusEnglish: "⇄ [two ⇄ 二] English",
    statusOff: "⇄ [two ⇄ 二]: Off",
    subNuanceLabel: "↳",

    notifyOriginal: "[two ⇄ 二] Switched to [Original] mode: Prompt passed to AI unmodified, HUD displays translations",
    notifyEnglish: "[two ⇄ 二] Switched to [English] mode: Prompt transformed into idiomatic technical English",
    notifyOff: "[two ⇄ 二] Companion turned off",
    notifyPaging: "[two ⇄ 二] Long prompt segmented. Press Alt+. or Alt+, to navigate pages",
    notifyNoHistory: "[two ⇄ 二] No previous companion card recorded",
    notifyHistoryRestored: "[two ⇄ 二] Restored previous companion card",
    notifyAgentHelp: "💡 Switch native language with /lingua-lang <zh|ja|en|es|fr|de> anytime; for advanced prompt or style customization, simply describe your preferences to your Agent.",
    notifyModelSwitched: "Companion model switched to: {model}",
    notifyLangSwitched: "Native language switched to: {lang}",
    notifyLangInvalid: "Invalid language code. Supported: zh, ja, en, es, fr, de",
    notifyCompactOn: "[two ⇄ 二] Single-line capsule mode enabled for compact split panes",
    notifyCompactOff: "[two ⇄ 二] Full tree layout restored",

    cmdDescMode: "Cycle companion mode [two ⇄ 二]: [Original] ➔ [English] ➔ [Off]",
    cmdDescStatus: "Display companion status report and model diagnosis: /lingua-status",
    cmdDescModel: "Inspect or switch companion model: /lingua-model [model-id|auto]",
    cmdDescLang: "View or switch companion native language: /lingua-lang [zh|ja|en|es|fr|de]",
    cmdDescCompact: "Toggle single-line capsule mode: /lingua-compact",
    cmdDescLast: "Replay previous companion card: /lingua-last",
    cmdDescAgent: "Display companion customization & language guide: /lingua-agent",
    shortcutNextPage: "Switch to next companion segment",
    shortcutPrevPage: "Switch to previous companion segment",

    capsuleSlot1Prefix: "Spk",
    capsuleSlot2Prefix: "Wrt",
    layoutCapsule: "Single-Line Capsule (1-Line)",
    layoutTree: "Trifecta Minimalist Left-Rail Tree (· ┌ ├ └)",

    statusReportTitle: "Companion Status Report",
    statusReportMode: "Current mode",
    statusReportFlow: "Language flow",
    statusReportModel: "Companion model",
    statusReportCache: "Session Cache",
    statusReportLayout: "HUD Layout: Trifecta Minimalist Left-Rail Tree (· ┌ ├ └)",
    statusReportAuth: "Auth: Pi Native In-Process Auth (Zero Config · Secure)",
    statusReportShortcuts: "Shortcuts: /2 (mode) · /lingua-lang (lang) · /lingua-model (model) · /lingua-agent (customize)",
    modeDescOriginal: "Pass-through · 0ms non-blocking",
    modeDescEnglish: "English mode · Deep reasoning",
    modeDescOff: "Disabled",

    modelCurrentLabel: "Current companion model",
    modelFollowSession: "Follow session",
    modelAvailableListHeader: "Available models (run /lingua-model <id> to switch):",
    modelAutoFollowDesc: "auto (Automatically follows active session model)",
    modelSelectHint: "Run /lingua-model <model-id> or auto to designate a model.",
  },
  es: {
    slot1Label: "Coloquial",
    slot2Label: "Escrito",
    vocabLabel: "Vocab",
    sourceLabel: "Original",
    hudTitle: "dos ⇄ two",
    statusOriginal: "⇄ [dos ⇄ two] Original",
    statusEnglish: "⇄ [dos ⇄ two] Inglés",
    statusOff: "⇄ [dos ⇄ two]: Apagado",
    subNuanceLabel: "↳",

    notifyOriginal: "[dos ⇄ two] Cambiado al modo [Original]: El texto se envía sin modificar",
    notifyEnglish: "[dos ⇄ two] Cambiado al modo [Inglés]: El texto se transforma en inglés técnico",
    notifyOff: "[dos ⇄ two] Asistente desactivado",
    notifyPaging: "[dos ⇄ two] Texto largo segmentado. Presione Alt+. o Alt+, para navegar",
    notifyNoHistory: "[dos ⇄ two] No hay registros anteriores",
    notifyHistoryRestored: "[dos ⇄ two] Tarjeta anterior restaurada",
    notifyAgentHelp: "💡 Cambie su idioma nativo con /lingua-lang <zh|ja|en|es|fr|de> al instante; para estilos personalizados, simplemente indíquele sus preferencias a su Agente.",
    notifyModelSwitched: "Modelo cambiado a: {model}",
    notifyLangSwitched: "Idioma nativo cambiado a: {lang}",
    notifyLangInvalid: "Código de idioma no válido. Admitidos: zh, ja, en, es, fr, de",
    notifyCompactOn: "[dos ⇄ two] Modo cápsula de una línea activado",
    notifyCompactOff: "[dos ⇄ two] Modo árbol completo restaurado",

    cmdDescMode: "Cambiar modo [dos ⇄ two]: [Original] ➔ [Inglés] ➔ [Apagado]",
    cmdDescStatus: "Mostrar diagnóstico y estado del modelo: /lingua-status",
    cmdDescModel: "Consultar o cambiar modelo: /lingua-model [model-id|auto]",
    cmdDescLang: "Ver o cambiar idioma nativo: /lingua-lang [zh|ja|en|es|fr|de]",
    cmdDescCompact: "Alternar modo cápsula de una línea: /lingua-compact",
    cmdDescLast: "Reaparecer tarjeta anterior: /lingua-last",
    cmdDescAgent: "Ver guía de personalización y cambio de idioma: /lingua-agent",
    shortcutNextPage: "Cambiar al siguiente segmento",
    shortcutPrevPage: "Cambiar al segmento anterior",

    capsuleSlot1Prefix: "Col",
    capsuleSlot2Prefix: "Esc",
    layoutCapsule: "Cápsula de una línea (1-Line Capsule)",
    layoutTree: "Trifecta árbol de guía izquierda (· ┌ ├ └)",

    statusReportTitle: "Informe de estado",
    statusReportMode: "Modo actual",
    statusReportFlow: "Flujo de idiomas",
    statusReportModel: "Modelo asistente",
    statusReportCache: "Caché de sesión",
    statusReportLayout: "Diseño HUD: Trifecta árbol de guía izquierda (· ┌ ├ └)",
    statusReportAuth: "Autenticación: Proceso nativo de Pi (Sin config · Seguro)",
    statusReportShortcuts: "Accesos directos: /2 (modo) · /lingua-lang (idioma) · /lingua-model (modelo) · /lingua-agent (personalizar)",
    modeDescOriginal: "Directo · 0ms no bloqueante",
    modeDescEnglish: "Modo inglés · Razonamiento profundo",
    modeDescOff: "Apagado",

    modelCurrentLabel: "Modelo actual",
    modelFollowSession: "Siguiendo sesión",
    modelAvailableListHeader: "Modelos disponibles (ejecute /lingua-model <id>):",
    modelAutoFollowDesc: "auto (Sigue automáticamente el modelo de la sesión)",
    modelSelectHint: "Use /lingua-model <id> o auto para asignar un modelo.",
  },
  fr: {
    slot1Label: "Oral",
    slot2Label: "Écrit",
    vocabLabel: "Vocab",
    sourceLabel: "Source",
    hudTitle: "deux ⇄ two",
    statusOriginal: "⇄ [deux ⇄ two] Original",
    statusEnglish: "⇄ [deux ⇄ two] Anglais",
    statusOff: "⇄ [deux ⇄ two]: Désactivé",
    subNuanceLabel: "↳",

    notifyOriginal: "[deux ⇄ two] Mode [Original] activé : Votre texte reste inchangé",
    notifyEnglish: "[deux ⇄ two] Mode [Anglais] activé : Votre prompt est traduit en anglais technique",
    notifyOff: "[deux ⇄ two] Compagnon désactivé",
    notifyPaging: "[deux ⇄ two] Long texte segmenté. Appuyez sur Alt+. ou Alt+, pour parcourir",
    notifyNoHistory: "[deux ⇄ two] Aucun historique précédent",
    notifyHistoryRestored: "[deux ⇄ two] Carte précédente restaurée",
    notifyAgentHelp: "💡 Changez de langue avec /lingua-lang <zh|ja|en|es|fr|de> à tout moment ; pour personnaliser le style ou le ton, décrivez simplement vos préférences à votre Agent.",
    notifyModelSwitched: "Modèle changé pour : {model}",
    notifyLangSwitched: "Langue maternelle changée en : {lang}",
    notifyLangInvalid: "Code de langue invalide. Pris en charge : zh, ja, en, es, fr, de",
    notifyCompactOn: "[deux ⇄ two] Mode capsule sur une seule ligne activé",
    notifyCompactOff: "[deux ⇄ two] Mode arborescence complète restauré",

    cmdDescMode: "Changer de mode [deux ⇄ two]: [Original] ➔ [Anglais] ➔ [Désactivé]",
    cmdDescStatus: "Afficher le rapport d'état et le diagnostic: /lingua-status",
    cmdDescModel: "Consulter ou changer de modèle: /lingua-model [model-id|auto]",
    cmdDescLang: "Afficher ou changer la langue maternelle: /lingua-lang [zh|ja|en|es|fr|de]",
    cmdDescCompact: "Basculer le mode capsule sur une ligne: /lingua-compact",
    cmdDescLast: "Réafficher la carte précédente: /lingua-last",
    cmdDescAgent: "Afficher le guide de personnalisation et de changement de langue : /lingua-agent",
    shortcutNextPage: "Passer au segment suivant",
    shortcutPrevPage: "Passer au segment précédent",

    capsuleSlot1Prefix: "Oral",
    capsuleSlot2Prefix: "Écrit",
    layoutCapsule: "Capsule sur une ligne (1-Line Capsule)",
    layoutTree: "Disposition HUD : Arbre guide gauche Trifecta (· ┌ ├ └)",

    statusReportTitle: "Rapport d'état",
    statusReportMode: "Mode actuel",
    statusReportFlow: "Flux linguistique",
    statusReportModel: "Modèle compagnon",
    statusReportCache: "Cache de session",
    statusReportLayout: "Disposition HUD : Arbre guide gauche Trifecta (· ┌ ├ └)",
    statusReportAuth: "Authentification : Processus interne Pi natif (Zéro config · Sécurisé)",
    statusReportShortcuts: "Raccourcis : /2 (mode) · /lingua-lang (langue) · /lingua-model (modèle) · /lingua-agent (personnaliser)",
    modeDescOriginal: "Passerelle directe · 0ms non bloquant",
    modeDescEnglish: "Mode anglais · Raisonnement approfondi",
    modeDescOff: "Désactivé",

    modelCurrentLabel: "Modèle actuel",
    modelFollowSession: "Suit la session",
    modelAvailableListHeader: "Modèles disponibles (tapez /lingua-model <id>):",
    modelAutoFollowDesc: "auto (Suit automatiquement le modèle principal)",
    modelSelectHint: "Entrez /lingua-model <id> ou auto pour définir le modèle.",
  },
  de: {
    slot1Label: "Gesprochen",
    slot2Label: "Schriftlich",
    vocabLabel: "Wortschatz",
    sourceLabel: "Quelle",
    hudTitle: "zwei ⇄ two",
    statusOriginal: "⇄ [zwei ⇄ two] Original",
    statusEnglish: "⇄ [zwei ⇄ two] Englisch",
    statusOff: "⇄ [zwei ⇄ two]: Aus",
    subNuanceLabel: "↳",

    notifyOriginal: "[zwei ⇄ two] Modus [Original] aktiviert: Eingabe wird unverändert weitergeleitet",
    notifyEnglish: "[zwei ⇄ two] Modus [Englisch] aktiviert: Eingabe wird in technisches Englisch übersetzt",
    notifyOff: "[zwei ⇄ two] Begleiter deaktiviert",
    notifyPaging: "[zwei ⇄ two] Langer Text segmentiert. Mit Alt+. oder Alt+, blättern",
    notifyNoHistory: "[zwei ⇄ two] Kein vorheriger Eintrag vorhanden",
    notifyHistoryRestored: "[zwei ⇄ two] Vorherige Karte wiederhergestellt",
    notifyAgentHelp: "💡 Wechseln Sie die Muttersprache mit /lingua-lang <zh|ja|en|es|fr|de> jederzeit; für benutzerdefinierte Stile teilen Sie Ihrem Agenten einfach Ihre Wünsche mit.",
    notifyModelSwitched: "Modell gewechselt zu: {model}",
    notifyLangSwitched: "Muttersprache geändert zu: {lang}",
    notifyLangInvalid: "Ungültiger Sprachcode. Unterstützt: zh, ja, en, es, fr, de",
    notifyCompactOn: "[zwei ⇄ two] Einzeiliger Kapselmodus aktiviert",
    notifyCompactOff: "[zwei ⇄ two] Vollständige Baumansicht wiederhergestellt",

    cmdDescMode: "Modus umschalten [zwei ⇄ two]: [Original] ➔ [Englisch] ➔ [Aus]",
    cmdDescStatus: "Statusbericht und Modell-Diagnose anzeigen: /lingua-status",
    cmdDescModel: "Modell prüfen oder wechseln: /lingua-model [model-id|auto]",
    cmdDescLang: "Muttersprache anzeigen oder wechseln: /lingua-lang [zh|ja|en|es|fr|de]",
    cmdDescCompact: "Einzeiligen Kapselmodus umschalten: /lingua-compact",
    cmdDescLast: "Vorherige Karte erneut anzeigen: /lingua-last",
    cmdDescAgent: "Anleitung zur Anpassung und Sprachumstellung anzeigen: /lingua-agent",
    shortcutNextPage: "Zum nächsten Segment wechseln",
    shortcutPrevPage: "Zum vorherigen Segment wechseln",

    capsuleSlot1Prefix: "Ges",
    capsuleSlot2Prefix: "Sch",
    layoutCapsule: "Einzeilige Kapsel (1-Line Capsule)",
    layoutTree: "HUD-Layout: Trifecta Minimalistische Baumstruktur (· ┌ ├ └)",

    statusReportTitle: "Statusbericht",
    statusReportMode: "Aktueller Modus",
    statusReportFlow: "Sprachfluss",
    statusReportModel: "Begleitmodell",
    statusReportCache: "Sitzungscache",
    statusReportLayout: "HUD-Layout: Trifecta Minimalistische Baumstruktur (· ┌ ├ └)",
    statusReportAuth: "Authentifizierung: Pi nativer In-Process Modus (Zero Config · Sicher)",
    statusReportShortcuts: "Befehle: /2 (Modus) · /lingua-lang (Sprache) · /lingua-model (Modell) · /lingua-agent (Anpassen)",
    modeDescOriginal: "Direkt · 0ms nicht blockierend",
    modeDescEnglish: "Englisch-Modus · Tiefgreifende Logik",
    modeDescOff: "Aus",

    modelCurrentLabel: "Aktuelles Modell",
    modelFollowSession: "Sitzungsmodell",
    modelAvailableListHeader: "Verfügbare Modelle (/lingua-model <id> ausführen):",
    modelAutoFollowDesc: "auto (Folgt automatisch dem aktiven Sitzungsmodell)",
    modelSelectHint: "Geben Sie /lingua-model <id> oder auto ein.",
  },
};

/**
 * 根据母语语言代码解析对应的本地化标签，并允许用户自定义覆盖
 * 遵循 Lesson 7: 英文中枢保底链 (English Pivot Fallback)
 */
export function resolveLabelsForLang(
  lang: string,
  overrides?: Partial<LinguaI18nLabels>
): LinguaI18nLabels {
  const norm = (lang || "zh").toLowerCase().split("-")[0];
  const target = LANGUAGE_PRESETS[norm] || LANGUAGE_PRESETS.zh;
  return {
    ...LANGUAGE_PRESETS.en, // 1. 英文全量保底 (保证任何新增 key 不为空，不泄露中文)
    ...target,              // 2. 目标母语官方预设
    ...(overrides || {}),   // 3. 用户显式覆盖
  };
}

/**
 * 格式化完整的运行状态报告，严格遵循母语 A 统治权
 */
export function formatStatusReport(
  labels: LinguaI18nLabels,
  info: {
    mode: string;
    sourceLang: string;
    targetLang?: string;
    activeModel: string;
    layout?: "tree" | "capsule";
    cacheStats?: {
      hits: number;
      misses: number;
      size: number;
      capacity: number;
    };
  }
): string {
  const modeDesc =
    info.mode === "original"
      ? (labels.modeDescOriginal || "Original pass-through")
      : info.mode === "english"
      ? (labels.modeDescEnglish || "English deep reasoning")
      : (labels.modeDescOff || "Off");

  const layoutDesc =
    info.layout === "capsule"
      ? (labels.layoutCapsule || "Single-Line Capsule (1-Line)")
      : (labels.layoutTree || "Trifecta Minimalist Left-Rail Tree (· ┌ ├ └)");

  const lines = [
    `⇄ [${labels.hudTitle}] ${labels.statusReportTitle || "Status Report"}`,
    `• ${labels.statusReportMode || "Mode"}: [${info.mode}] (${modeDesc})`,
    `• ${labels.statusReportFlow || "Flow"}: [${info.sourceLang} ➔ ${info.targetLang || "en"}]`,
    `• ${labels.statusReportModel || "Model"}: ${info.activeModel}`,
  ];

  if (info.cacheStats) {
    const total = info.cacheStats.hits + info.cacheStats.misses;
    const rate = total > 0 ? Math.round((info.cacheStats.hits / total) * 100) : 0;
    lines.push(
      `• ${labels.statusReportCache || "Cache"}: ${info.cacheStats.hits} hits / ${total} total (${rate}% hit rate) · ${info.cacheStats.size}/${info.cacheStats.capacity} items`
    );
  }

  lines.push(
    `• ${labels.statusReportLayout || "Layout"}: ${layoutDesc}`,
    `• ${labels.statusReportAuth || "Auth: Pi Native In-Process Auth"}`,
    `• ${labels.statusReportShortcuts || "Shortcuts: /2 · /lingua-lang · /lingua-compact · /lingua-model · /lingua-agent"}`
  );
  return lines.join("\n");
}

/**
 * 格式化模型选择界面的提示文本，严格遵循母语 A 统治权
 */
export function formatModelSelectionMessage(
  labels: LinguaI18nLabels,
  currentActive: string,
  availableList?: string
): string {
  let msg = `[${labels.hudTitle}] ${labels.modelCurrentLabel || "Current model"}: ${currentActive}\n`;
  if (availableList) {
    msg += `${labels.modelAvailableListHeader || "Available models:"}\n${availableList}\n• ${labels.modelAutoFollowDesc || "auto"}\n`;
  }
  msg += labels.modelSelectHint || "Specify model with /lingua-model <model-id> or auto.";
  return msg;
}
