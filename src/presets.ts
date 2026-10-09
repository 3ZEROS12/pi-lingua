import type { LingualI18nLabels } from "./types.js";

/**
 * 官方预设多语言映射矩阵 (Language Preset Matrix)
 * 当用户或 Agent 设定母语 A 时，所有 UI 标签、图腾与状态文本自动本地化，彻底根除跨语言残留。
 */
export const LANGUAGE_PRESETS: Record<string, LingualI18nLabels> = {
  zh: {
    slot1Label: "口语",
    slot2Label: "写作",
    vocabLabel: "重点",
    sourceLabel: "原文",
    hudTitle: "zh ⇄ en",
    statusOriginal: "zh ⇄ en",
    statusEnglish: "zh ⇄ en",
    statusOff: "zh ⇄ en: off",
    subNuanceLabel: "↳",

    notifyOriginal: "[zh ⇄ en] 已切换至【原文模式】：输入保持纯净母语，上方 HUD 浮现伴学视窗",
    notifyEnglish: "[zh ⇄ en] 已切换至【英文模式】：发给 AI 的输入将自动转换为纯正技术英文",
    notifyOff: "[zh ⇄ en] 已关闭伴学",
    notifyPaging: "[zh ⇄ en] 长句已切分多段，按 Alt+. 或 Alt+, 翻页浏览",
    notifyNoHistory: "[zh ⇄ en] 暂无上一条伴学记录",
    notifyHistoryRestored: "[zh ⇄ en] 已重新显示上一条伴学卡片",
    notifyAgentHelp: "💡 切换母语？直接运行 /lingual-lang <zh|ja|en|es|fr|de> 即可实时切换并持久化；若需定制特殊风格，可直接向 Agent 描述你的定制偏好。",
    notifyModelSwitched: "伴学模型已切换为: {model}",
    notifyLangSwitched: "伴学语言已切换为: {lang}（提示：命令补全菜单文面将在重启终端后完全同步）",
    notifyLangInvalid: "无效的语言代码。支持的语言代码: zh, ja, en, es, fr, de",
    notifyCompactOn: "[zh ⇄ en] 已开启单行胶囊模式：极简占位，保护分屏视野",
    notifyCompactOff: "[zh ⇄ en] 已切换为左导轨树状架构：展示完整双模与语感",
    notifyTimeout: "[zh ⇄ en] 英文翻译请求未就绪或超时，本次已放行原文",
    notifyError: "[zh ⇄ en] 英文翻译请求异常，本次已放行原文",

    cmdDescMode: "切换伴学模式 [zh ⇄ en]: [原文] ➔ [英文] ➔ [关]",
    cmdDescStatus: "查看伴学插件当前状态报告与模型诊断: /lingual-status",
    cmdDescModel: "查看或切换伴学模型 [zh ⇄ en]: /lingual-model [model-id|auto]",
    cmdDescLang: "查看或切换伴学母语 [zh ⇄ en]: /lingual-lang [zh|ja|en|es|fr|de]",
    cmdDescCompact: "切换单行胶囊模式与完整树状图: /lingual-compact",
    cmdDescLast: "重新回看或重现上一条伴学卡片: /lingual-last",
    cmdDescAgent: "查看伴学定制与母语切换指南: /lingual-agent",
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
    statusReportShortcuts: "快捷操作: /2 (切换模式) · /lingual-lang (切母语) · /lingual-model (切模型) · /lingual-agent (定制语言)",
    modeDescOriginal: "原文直通 · 0ms非阻塞",
    modeDescEnglish: "英文模式 · 深度代码推理",
    modeDescOff: "已关闭",

    modelCurrentLabel: "当前伴学模型",
    modelFollowSession: "跟随会话",
    modelAvailableListHeader: "可用模型 (输入 /lingual-model <id> 切换):",
    modelAutoFollowDesc: "auto (自动跟随当前会话主模型)",
    modelSelectHint: "可输入 /lingual-model <model-id> 或 auto 指定伴学模型。",

    langUsageHint: "用法: /lang <zh|ja|en|es|fr|de> [target] (如 /lang ja 或 /lang zh ja)",
    langList: [
      "• zh (中文 ➔ 英文)",
      "• ja (日本語 ➔ 英語)",
      "• en (英文 ➔ 日文)",
      "• es (西班牙文 ➔ 英文)",
      "• fr (法文 ➔ 英文)",
      "• de (德文 ➔ 英文)",
    ],
  },
  ja: {
    slot1Label: "口語",
    slot2Label: "文面",
    vocabLabel: "単語",
    sourceLabel: "原文",
    hudTitle: "ja ⇄ en",
    statusOriginal: "ja ⇄ en",
    statusEnglish: "ja ⇄ en",
    statusOff: "ja ⇄ en: off",
    subNuanceLabel: "↳",

    notifyOriginal: "[ja ⇄ en] 【原文モード】に切り替えました：入力は原文のまま、上部カードで英語を表示",
    notifyEnglish: "[ja ⇄ en] 【英語モード】に切り替えました：AIへの入力は純粋な技術英語に自動変換されます",
    notifyOff: "[ja ⇄ en] 伴走機能をオフにしました",
    notifyPaging: "[ja ⇄ en] 長文を分割しました。Alt+. または Alt+, でページ送り",
    notifyNoHistory: "[ja ⇄ en] 前回の記録はありません",
    notifyHistoryRestored: "[ja ⇄ en] 前回のカードを復元しました",
    notifyAgentHelp: "💡 母語の変更は /lingual-lang <zh|ja|en|es|fr|de> で即時切り替え・保存できます。特別な文体や語域のカスタマイズが必要な場合は、Agent に直接ご要望をお伝えください。",
    notifyModelSwitched: "モデルを切り替えました: {model}",
    notifyLangSwitched: "母語を切り替えました: {lang}（※コマンド補完メニューの文面は端末再起動後に完全に反映されます）",
    notifyLangInvalid: "無効な言語コードです。対応言語: zh, ja, en, es, fr, de",
    notifyCompactOn: "[ja ⇄ en] 1行カプセルモードを有効にしました：画面領域を最大限確保",
    notifyCompactOff: "[ja ⇄ en] フルツリー表示に切り替えました：詳細なニュアンスを表示",
    notifyTimeout: "[ja ⇄ en] 英語翻訳リクエストがタイムアウトしました。原文を送信しました",
    notifyError: "[ja ⇄ en] 英語翻訳リクエストでエラーが発生しました。原文を送信しました",

    cmdDescMode: "モード切替 [ja ⇄ en]: [原文] ➔ [英語] ➔ [オフ]",
    cmdDescStatus: "状態レポートとモデル診断を表示: /lingual-status",
    cmdDescModel: "学習モデルの確認・切替: /lingual-model [model-id|auto]",
    cmdDescLang: "伴走の母語を確認・変更: /lingual-lang [zh|ja|en|es|fr|de]",
    cmdDescCompact: "1行カプセル表示とフルツリーの切替: /lingual-compact",
    cmdDescLast: "前回の伴走カードを再表示: /lingual-last",
    cmdDescAgent: "伴走カスタマイズと母語変更の案内を表示: /lingual-agent",
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
    statusReportShortcuts: "クイック操作: /2 (モード切替) · /lingual-lang (母語切替) · /lingual-model (モデル切替) · /lingual-agent (カスタマイズ)",
    modeDescOriginal: "原文パススルー · 0ms非同期",
    modeDescEnglish: "英語モード · 高度コード推論",
    modeDescOff: "オフ",

    modelCurrentLabel: "現在の学習モデル",
    modelFollowSession: "セッション連動",
    modelAvailableListHeader: "利用可能なモデル (/lingual-model <id> で切替):",
    modelAutoFollowDesc: "auto (セッションの主モデルに自動追従)",
    modelSelectHint: "/lingual-model <model-id> または auto を入力してモデルを指定できます。",

    langUsageHint: "使い方: /lang <zh|ja|en|es|fr|de> [target] (例: /lang ja または /lang zh ja)",
    langList: [
      "• zh (中国語 ➔ 英語)",
      "• ja (日本語 ➔ 英語)",
      "• en (英語 ➔ 日本語)",
      "• es (スペイン語 ➔ 英語)",
      "• fr (フランス語 ➔ 英語)",
      "• de (ドイツ語 ➔ 英語)",
    ],
  },
  en: {
    slot1Label: "Spoken",
    slot2Label: "Written",
    vocabLabel: "Vocab",
    sourceLabel: "Source",
    hudTitle: "en ⇄ ja",
    statusOriginal: "en ⇄ ja",
    statusEnglish: "en ⇄ ja",
    statusOff: "en ⇄ ja: off",
    subNuanceLabel: "↳",

    notifyOriginal: "[en ⇄ ja] Switched to [Original] mode: Prompt passed to AI unmodified, HUD displays translations",
    notifyEnglish: "[en ⇄ ja] Switched to [English] mode: Prompt transformed into idiomatic technical English",
    notifyOff: "[en ⇄ ja] Companion turned off",
    notifyPaging: "[en ⇄ ja] Long prompt segmented. Press Alt+. or Alt+, to navigate pages",
    notifyNoHistory: "[en ⇄ ja] No previous companion card recorded",
    notifyHistoryRestored: "[en ⇄ ja] Restored previous companion card",
    notifyAgentHelp: "💡 Switch native language with /lingual-lang <zh|ja|en|es|fr|de> anytime; for advanced prompt or style customization, simply describe your preferences to your Agent.",
    notifyModelSwitched: "Companion model switched to: {model}",
    notifyLangSwitched: "Native language switched to: {lang} (Note: Command autocomplete descriptions will fully refresh on terminal restart)",
    notifyLangInvalid: "Invalid language code. Supported: zh, ja, en, es, fr, de",
    notifyCompactOn: "[en ⇄ ja] Single-line capsule mode enabled for compact split panes",
    notifyCompactOff: "[en ⇄ ja] Full tree layout restored",
    notifyTimeout: "[en ⇄ ja] English translation timed out or not ready; original prompt passed",
    notifyError: "[en ⇄ ja] English translation request error; original prompt passed",

    cmdDescMode: "Cycle companion mode [en ⇄ ja]: [Original] ➔ [English] ➔ [Off]",
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
    layoutTree: "Trifecta Minimalist Left-Rail Tree (· ┌ ├ └)",

    statusReportTitle: "Companion Status Report",
    statusReportMode: "Current mode",
    statusReportFlow: "Language flow",
    statusReportModel: "Companion model",
    statusReportCache: "Session Cache",
    statusReportLayout: "HUD Layout: Trifecta Minimalist Left-Rail Tree (· ┌ ├ └)",
    statusReportAuth: "Auth: Pi Native In-Process Auth (Zero Config · Secure)",
    statusReportShortcuts: "Shortcuts: /2 (mode) · /lingual-lang (lang) · /lingual-model (model) · /lingual-agent (customize)",
    modeDescOriginal: "Pass-through · 0ms non-blocking",
    modeDescEnglish: "English mode · Deep reasoning",
    modeDescOff: "Disabled",

    modelCurrentLabel: "Current companion model",
    modelFollowSession: "Follow session",
    modelAvailableListHeader: "Available models (run /lingual-model <id> to switch):",
    modelAutoFollowDesc: "auto (Automatically follows active session model)",
    modelSelectHint: "Run /lingual-model <model-id> or auto to designate a model.",

    langUsageHint: "Usage: /lang <zh|ja|en|es|fr|de> [target] (e.g. /lang ja or /lang zh ja)",
    langList: [
      "• zh (Chinese ➔ English)",
      "• ja (Japanese ➔ English)",
      "• en (English ➔ Japanese)",
      "• es (Spanish ➔ English)",
      "• fr (French ➔ English)",
      "• de (German ➔ English)",
    ],
  },
  es: {
    slot1Label: "Coloquial",
    slot2Label: "Escrito",
    vocabLabel: "Vocab",
    sourceLabel: "Original",
    hudTitle: "es ⇄ en",
    statusOriginal: "es ⇄ en",
    statusEnglish: "es ⇄ en",
    statusOff: "es ⇄ en: off",
    subNuanceLabel: "↳",

    notifyOriginal: "[es ⇄ en] Cambiado al modo [Original]: El texto se envía sin modificar",
    notifyEnglish: "[es ⇄ en] Cambiado al modo [Inglés]: El texto se transforma en inglés técnico",
    notifyOff: "[es ⇄ en] Asistente desactivado",
    notifyPaging: "[es ⇄ en] Texto largo segmentado. Presione Alt+. o Alt+, para navegar",
    notifyNoHistory: "[es ⇄ en] No hay registros anteriores",
    notifyHistoryRestored: "[es ⇄ en] Tarjeta anterior restaurada",
    notifyAgentHelp: "💡 Cambie su idioma nativo con /lingual-lang <zh|ja|en|es|fr|de> al instante; para estilos personalizados, simplemente indíquele sus preferencias a su Agente.",
    notifyModelSwitched: "Modelo cambiado a: {model}",
    notifyLangSwitched: "Idioma nativo cambiado a: {lang} (Nota: Las descripciones del menú de comandos se actualizarán tras reiniciar la terminal)",
    notifyLangInvalid: "Código de idioma no válido. Admitidos: zh, ja, en, es, fr, de",
    notifyCompactOn: "[es ⇄ en] Modo cápsula de una línea activado",
    notifyCompactOff: "[es ⇄ en] Modo árbol completo restaurado",
    notifyTimeout: "[es ⇄ en] La traducción al inglés agotó el tiempo; se envió el texto original",
    notifyError: "[es ⇄ en] Error en la traducción al inglés; se envió el texto original",

    cmdDescMode: "Cambiar modo [es ⇄ en]: [Original] ➔ [Inglés] ➔ [Apagado]",
    cmdDescStatus: "Mostrar diagnóstico y estado del modelo: /lingual-status",
    cmdDescModel: "Consultar o cambiar modelo: /lingual-model [model-id|auto]",
    cmdDescLang: "Ver o cambiar idioma nativo: /lingual-lang [zh|ja|en|es|fr|de]",
    cmdDescCompact: "Alternar modo cápsula de una línea: /lingual-compact",
    cmdDescLast: "Reaparecer tarjeta anterior: /lingual-last",
    cmdDescAgent: "Ver guía de personalización y cambio de idioma: /lingual-agent",
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
    statusReportShortcuts: "Accesos directos: /2 (modo) · /lingual-lang (idioma) · /lingual-model (modelo) · /lingual-agent (personalizar)",
    modeDescOriginal: "Directo · 0ms no bloqueante",
    modeDescEnglish: "Modo inglés · Razonamiento profundo",
    modeDescOff: "Apagado",

    modelCurrentLabel: "Modelo actual",
    modelFollowSession: "Siguiendo sesión",
    modelAvailableListHeader: "Modelos disponibles (ejecute /lingual-model <id>):",
    modelAutoFollowDesc: "auto (Sigue automáticamente el modelo de la sesión)",
    modelSelectHint: "Use /lingual-model <id> o auto para asignar un modelo.",

    langUsageHint: "Uso: /lang <zh|ja|en|es|fr|de> [target] (ej. /lang ja o /lang zh ja)",
    langList: [
      "• zh (Chino ➔ Inglés)",
      "• ja (Japonés ➔ Inglés)",
      "• en (Inglés ➔ Japonés)",
      "• es (Español ➔ Inglés)",
      "• fr (Francés ➔ Inglés)",
      "• de (Alemán ➔ Inglés)",
    ],
  },
  fr: {
    slot1Label: "Oral",
    slot2Label: "Écrit",
    vocabLabel: "Vocab",
    sourceLabel: "Source",
    hudTitle: "fr ⇄ en",
    statusOriginal: "fr ⇄ en",
    statusEnglish: "fr ⇄ en",
    statusOff: "fr ⇄ en: off",
    subNuanceLabel: "↳",

    notifyOriginal: "[fr ⇄ en] Mode [Original] activé : Votre texte reste inchangé",
    notifyEnglish: "[fr ⇄ en] Mode [Anglais] activé : Votre prompt est traduit en anglais technique",
    notifyOff: "[fr ⇄ en] Compagnon désactivé",
    notifyPaging: "[fr ⇄ en] Long texte segmenté. Appuyez sur Alt+. ou Alt+, pour parcourir",
    notifyNoHistory: "[fr ⇄ en] Aucun historique précédent",
    notifyHistoryRestored: "[fr ⇄ en] Carte précédente restaurée",
    notifyAgentHelp: "💡 Changez de langue avec /lingual-lang <zh|ja|en|es|fr|de> à tout moment ; pour personnaliser le style ou le ton, décrivez simplement vos préférences à votre Agent.",
    notifyModelSwitched: "Modèle changé pour : {model}",
    notifyLangSwitched: "Langue maternelle changée en : {lang} (Note : L'autocomplétion des commandes sera actualisée après redémarrage du terminal)",
    notifyLangInvalid: "Code de langue invalide. Pris en charge : zh, ja, en, es, fr, de",
    notifyCompactOn: "[fr ⇄ en] Mode capsule sur une seule ligne activé",
    notifyCompactOff: "[fr ⇄ en] Mode arborescence complète restauré",
    notifyTimeout: "[fr ⇄ en] La traduction en anglais a expiré ; le prompt original a été transmis",
    notifyError: "[fr ⇄ en] Erreur de traduction en anglais ; le prompt original a été transmis",

    cmdDescMode: "Changer de mode [fr ⇄ en]: [Original] ➔ [Anglais] ➔ [Désactivé]",
    cmdDescStatus: "Afficher le rapport d'état et le diagnostic: /lingual-status",
    cmdDescModel: "Consulter ou changer de modèle: /lingual-model [model-id|auto]",
    cmdDescLang: "Afficher ou changer la langue maternelle: /lingual-lang [zh|ja|en|es|fr|de]",
    cmdDescCompact: "Basculer le mode capsule sur une ligne: /lingual-compact",
    cmdDescLast: "Réafficher la carte précédente: /lingual-last",
    cmdDescAgent: "Afficher le guide de personnalisation et de changement de langue : /lingual-agent",
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
    statusReportShortcuts: "Raccourcis : /2 (mode) · /lingual-lang (langue) · /lingual-model (modèle) · /lingual-agent (personnaliser)",
    modeDescOriginal: "Passerelle directe · 0ms non bloquant",
    modeDescEnglish: "Mode anglais · Raisonnement approfondi",
    modeDescOff: "Désactivé",

    modelCurrentLabel: "Modèle actuel",
    modelFollowSession: "Suit la session",
    modelAvailableListHeader: "Modèles disponibles (tapez /lingual-model <id>):",
    modelAutoFollowDesc: "auto (Suit automatiquement le modèle principal)",
    modelSelectHint: "Entrez /lingual-model <id> ou auto pour définir le modèle.",

    langUsageHint: "Utilisation : /lang <zh|ja|en|es|fr|de> [target] (ex : /lang ja ou /lang zh ja)",
    langList: [
      "• zh (Chinois ➔ Anglais)",
      "• ja (Japonais ➔ Anglais)",
      "• en (Anglais ➔ Japonais)",
      "• es (Espagnol ➔ Anglais)",
      "• fr (Français ➔ Anglais)",
      "• de (Allemand ➔ Anglais)",
    ],
  },
  de: {
    slot1Label: "Gesprochen",
    slot2Label: "Schriftlich",
    vocabLabel: "Wortschatz",
    sourceLabel: "Quelle",
    hudTitle: "de ⇄ en",
    statusOriginal: "de ⇄ en",
    statusEnglish: "de ⇄ en",
    statusOff: "de ⇄ en: off",
    subNuanceLabel: "↳",

    notifyOriginal: "[de ⇄ en] Modus [Original] aktiviert: Eingabe wird unverändert weitergeleitet",
    notifyEnglish: "[de ⇄ en] Modus [Englisch] aktiviert: Eingabe wird in technisches Englisch übersetzt",
    notifyOff: "[de ⇄ en] Begleiter deaktiviert",
    notifyPaging: "[de ⇄ en] Langer Text segmentiert. Mit Alt+. oder Alt+, blättern",
    notifyNoHistory: "[de ⇄ en] Kein vorheriger Eintrag vorhanden",
    notifyHistoryRestored: "[de ⇄ en] Vorherige Karte wiederhergestellt",
    notifyAgentHelp: "💡 Wechseln Sie die Muttersprache mit /lingual-lang <zh|ja|en|es|fr|de> jederzeit; für benutzerdefinierte Stile teilen Sie Ihrem Agenten einfach Ihre Wünsche mit.",
    notifyModelSwitched: "Modell gewechselt zu: {model}",
    notifyLangSwitched: "Muttersprache geändert zu: {lang} (Hinweis: Befehlsbeschreibungen werden nach dem Terminal-Neustart vollständig aktualisiert)",
    notifyLangInvalid: "Ungültiger Sprachcode. Unterstützt: zh, ja, en, es, fr, de",
    notifyCompactOn: "[de ⇄ en] Einzeiliger Kapselmodus aktiviert",
    notifyCompactOff: "[de ⇄ en] Vollständige Baumansicht wiederhergestellt",
    notifyTimeout: "[de ⇄ en] Englische Übersetzung hat das Zeitlimit überschritten; Originaltext wurde übergeben",
    notifyError: "[de ⇄ en] Fehler bei der englischen Übersetzung; Originaltext wurde übergeben",

    cmdDescMode: "Modus umschalten [de ⇄ en]: [Original] ➔ [Englisch] ➔ [Aus]",
    cmdDescStatus: "Statusbericht und Modell-Diagnose anzeigen: /lingual-status",
    cmdDescModel: "Modell prüfen oder wechseln: /lingual-model [model-id|auto]",
    cmdDescLang: "Muttersprache anzeigen oder wechseln: /lingual-lang [zh|ja|en|es|fr|de]",
    cmdDescCompact: "Einzeiligen Kapselmodus umschalten: /lingual-compact",
    cmdDescLast: "Vorherige Karte erneut anzeigen: /lingual-last",
    cmdDescAgent: "Anleitung zur Anpassung und Sprachumstellung anzeigen: /lingual-agent",
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
    statusReportShortcuts: "Befehle: /2 (Modus) · /lingual-lang (Sprache) · /lingual-model (Modell) · /lingual-agent (Anpassen)",
    modeDescOriginal: "Direkt · 0ms nicht blockierend",
    modeDescEnglish: "Englisch-Modus · Tiefgreifende Logik",
    modeDescOff: "Aus",

    modelCurrentLabel: "Aktuelles Modell",
    modelFollowSession: "Sitzungsmodell",
    modelAvailableListHeader: "Verfügbare Modelle (/lingual-model <id> ausführen):",
    modelAutoFollowDesc: "auto (Folgt automatisch dem aktiven Sitzungsmodell)",
    modelSelectHint: "Geben Sie /lingual-model <id> oder auto ein.",

    langUsageHint: "Verwendung: /lang <zh|ja|en|es|fr|de> [target] (z.B. /lang ja oder /lang zh ja)",
    langList: [
      "• zh (Chinesisch ➔ Englisch)",
      "• ja (Japanisch ➔ Englisch)",
      "• en (Englisch ➔ Japanisch)",
      "• es (Spanisch ➔ Englisch)",
      "• fr (Französisch ➔ Englisch)",
      "• de (Deutsch ➔ Englisch)",
    ],
  },
};

/**
 * 根据母语语言代码解析对应的本地化标签，并允许用户自定义覆盖
 * 遵循 Lesson 7: 英文中枢保底链 (English Pivot Fallback)
 */
export function resolveLabelsForLang(
  lang: string,
  overrides?: Partial<LingualI18nLabels>,
  targetLang?: string
): LingualI18nLabels {
  const norm = (lang || "zh").toLowerCase().split("-")[0];
  const target = LANGUAGE_PRESETS[norm] || LANGUAGE_PRESETS.zh;
  const actualTarget = targetLang || (norm === "en" ? "ja" : "en");
  const pairTitle = `${norm} ⇄ ${actualTarget}`;

  const merged: Record<string, any> = {
    ...LANGUAGE_PRESETS.en, // 1. 英文全量保底 (保证任何新增 key 不为空，不泄露中文)
    ...target,              // 2. 目标母语官方预设
    hudTitle: pairTitle,
    statusOriginal: pairTitle,
    statusEnglish: pairTitle,
    statusOff: `${pairTitle}: off`,
    ...(overrides || {}),   // 3. 用户显式覆盖
  };

  // 动态将预设中的死板语言对标签替换为真实的动态当前流向 pairTitle
  for (const [key, val] of Object.entries(merged)) {
    if (typeof val === "string") {
      merged[key] = val.replace(/\[(?:zh|ja|en|es|fr|de)\s*⇄\s*(?:zh|ja|en|es|fr|de)\]/g, `[${pairTitle}]`);
    }
  }

  return merged as LingualI18nLabels;
}

/**
 * 格式化完整的运行状态报告，严格遵循母语 A 统治权
 */
export function formatStatusReport(
  labels: LingualI18nLabels,
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
    `• ${labels.statusReportShortcuts || "Shortcuts: /2 · /lingual-lang · /lingual-compact · /lingual-model · /lingual-agent"}`
  );
  return lines.join("\n");
}

/**
 * 格式化模型选择界面的提示文本，严格遵循母语 A 统治权
 */
export function formatModelSelectionMessage(
  labels: LingualI18nLabels,
  currentActive: string,
  availableList?: string
): string {
  let msg = `[${labels.hudTitle}] ${labels.modelCurrentLabel || "Current model"}: ${currentActive}\n`;
  if (availableList) {
    msg += `${labels.modelAvailableListHeader || "Available models:"}\n${availableList}\n• ${labels.modelAutoFollowDesc || "auto"}\n`;
  }
  msg += labels.modelSelectHint || "Specify model with /lingual-model <model-id> or auto.";
  return msg;
}
