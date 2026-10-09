import type { LinguaI18nLabels } from "./types.js";

interface LanguageSpec {
  name: string;
  nativeName: string;
  meaningInstruction: string;
  vocabInstruction: string;
  anchors: Array<{
    input: string;
    spoken: string;
    spoken_meaning: string;
    written: string;
    written_meaning: string;
    vocab: string;
  }>;
}

const LANGUAGE_SPECS: Record<string, LanguageSpec> = {
  zh: {
    name: "Chinese",
    nativeName: "中文",
    meaningInstruction: "in native Chinese",
    vocabInstruction: "in Chinese in parentheses separated by \" · \" (e.g. \"term1 (中文释义) · term2 (中文释义) · ...\")",
    anchors: [
      {
        input: "认同，开始吧",
        spoken: "Totally on board with that — let's dive right in.",
        spoken_meaning: "完全赞同，咱们直接开搞",
        written: "Acknowledged. Let's proceed with the implementation.",
        written_meaning: "确认赞同，着手推进具体实施",
        vocab: "on board with (赞成/支持) · dive in (立刻着手/开搞)",
      },
      {
        input: "继续",
        spoken: "Let's keep going.",
        spoken_meaning: "继续往下搞",
        written: "Proceed with the next steps.",
        written_meaning: "推进后续步骤",
        vocab: "keep going (继续推进) · proceed with (着手进行)",
      },
      {
        input: "这个方案有点过度设计了，不如直接用标准库实现",
        spoken: "This feels a bit over-engineered; we'd be much better off just sticking with the standard library.",
        spoken_meaning: "感觉有点过度设计了，用标准库划算得多",
        written: "The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.",
        written_meaning: "该方案引入了不必要的复杂度，建议优先采用原生标准库实现",
        vocab: "over-engineered (过度工程化) · be better off (做某事更合适/划算) · stick with (坚持使用/沿用) · leverage (利用/借助)",
      },
    ],
  },
  ja: {
    name: "Japanese",
    nativeName: "日本語",
    meaningInstruction: "in native Japanese",
    vocabInstruction: "in Japanese in parentheses separated by \" · \" (e.g. \"term1 (日本語解説) · term2 (日本語解説) · ...\")",
    anchors: [
      {
        input: "賛成、始めましょう",
        spoken: "Totally on board with that — let's dive right in.",
        spoken_meaning: "大賛成、すぐに始めよう",
        written: "Acknowledged. Let's proceed with the implementation.",
        written_meaning: "同意しました。実装を進めます",
        vocab: "on board with (賛成/支持) · dive in (すぐに着手する)",
      },
      {
        input: "続けてください",
        spoken: "Let's keep going.",
        spoken_meaning: "そのまま進めよう",
        written: "Proceed with the next steps.",
        written_meaning: "次の工程に進みます",
        vocab: "keep going (継続する) · proceed with (着手・進行する)",
      },
      {
        input: "この設計は少し過剰です。標準ライブラリを使ったほうがいいでしょう",
        spoken: "This feels a bit over-engineered; we'd be much better off just sticking with the standard library.",
        spoken_meaning: "少し過剰設計な気がします。標準ライブラリで十分です",
        written: "The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.",
        written_meaning: "提案された構成は不要な複雑さをもたらします。標準ライブラリの利用を推奨します",
        vocab: "over-engineered (過剰設計) · be better off (〜したほうがよい) · stick with (〜を使い続ける) · leverage (活用する)",
      },
    ],
  },
  en: {
    name: "English",
    nativeName: "English",
    meaningInstruction: "in native English",
    vocabInstruction: "in English in parentheses separated by \" · \" (e.g. \"term1 (English definition) · term2 (definition) · ...\")",
    anchors: [
      {
        input: "Sounds good, let's ship it.",
        spoken: "いい感じですね、リリースしましょう！",
        spoken_meaning: "Looks great, let's deploy right away.",
        written: "確認しました。本番環境へデプロイを進めます。",
        written_meaning: "Reviewed and confirmed. Proceeding with deployment to production.",
        vocab: "リリースする (ship / deploy) · 本番環境 (production environment)",
      },
      {
        input: "Keep going.",
        spoken: "続けていきましょう。",
        spoken_meaning: "Let's keep making progress.",
        written: "後続の処理を進めてください。",
        written_meaning: "Please proceed with the subsequent steps.",
        vocab: "後続の処理 (subsequent processing) · 進める (proceed)",
      },
      {
        input: "This feels over-engineered; let's stick to the built-in standard library.",
        spoken: "これちょっと作り込みすぎかも。素直に標準ライブラリで行きましょう。",
        spoken_meaning: "Might be a bit over-complicated; let's simply use the standard library.",
        written: "設計が過剰に複雑化しています。標準ライブラリの活用を推奨します。",
        written_meaning: "Architecture is unnecessarily complex. Recommending the standard library.",
        vocab: "作り込みすぎ (over-engineered) · 標準ライブラリ (standard library) · 推奨する (recommend)",
      },
    ],
  },
  es: {
    name: "Spanish",
    nativeName: "Español",
    meaningInstruction: "in native Spanish",
    vocabInstruction: "in Spanish in parentheses separated by \" · \" (e.g. \"term1 (significado en español) · term2 (...) · ...\")",
    anchors: [
      {
        input: "De acuerdo, empecemos",
        spoken: "Totally on board with that — let's dive right in.",
        spoken_meaning: "Totalmente de acuerdo, vamos al grano",
        written: "Acknowledged. Let's proceed with the implementation.",
        written_meaning: "Confirmado. Procedamos con la implementación",
        vocab: "on board with (estar de acuerdo) · dive in (empezar de lleno)",
      },
      {
        input: "Continuar",
        spoken: "Let's keep going.",
        spoken_meaning: "Sigamos adelante",
        written: "Proceed with the next steps.",
        written_meaning: "Continuar con los siguientes pasos",
        vocab: "keep going (seguir adelante) · proceed with (proceder con)",
      },
      {
        input: "Esta propuesta está sobrecargada, mejor usar la biblioteca estándar",
        spoken: "This feels a bit over-engineered; we'd be much better off just sticking with the standard library.",
        spoken_meaning: "Parece demasiado complicado; nos iría mucho mejor con la librería estándar",
        written: "The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.",
        written_meaning: "La solución propuesta introduce complejidad innecesaria. Se prefiere la biblioteca estándar nativa",
        vocab: "over-engineered (sobreingeniería) · be better off (estar mejor con) · stick with (quedarse con) · leverage (aprovechar)",
      },
    ],
  },
  fr: {
    name: "French",
    nativeName: "Français",
    meaningInstruction: "in native French",
    vocabInstruction: "in French in parentheses separated by \" · \" (e.g. \"term1 (définition en français) · term2 (...) · ...\")",
    anchors: [
      {
        input: "D'accord, commençons",
        spoken: "Totally on board with that — let's dive right in.",
        spoken_meaning: "Tout à fait d'accord, allons-y",
        written: "Acknowledged. Let's proceed with the implementation.",
        written_meaning: "D'accord. Procédons à l'implémentation",
        vocab: "on board with (être d'accord) · dive in (s'y mettre directement)",
      },
      {
        input: "Continuer",
        spoken: "Let's keep going.",
        spoken_meaning: "Continuons",
        written: "Proceed with the next steps.",
        written_meaning: "Passer aux étapes suivantes",
        vocab: "keep going (continuer) · proceed with (procéder à)",
      },
      {
        input: "Cette approche est trop complexe, autant utiliser la bibliothèque standard",
        spoken: "This feels a bit over-engineered; we'd be much better off just sticking with the standard library.",
        spoken_meaning: "Ça semble surdimensionné ; on ferait bien mieux de rester sur la bibliothèque standard",
        written: "The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.",
        written_meaning: "L'approche proposée introduit une complexité superflue. L'utilisation de la bibliothèque standard est recommandée",
        vocab: "over-engineered (surdimensionné) · be better off (avoir tout intérêt à) · stick with (s'en tenir à) · leverage (exploiter)",
      },
    ],
  },
  de: {
    name: "German",
    nativeName: "Deutsch",
    meaningInstruction: "in native German",
    vocabInstruction: "in German in parentheses separated by \" · \" (e.g. \"term1 (deutsche Definition) · term2 (...) · ...\")",
    anchors: [
      {
        input: "Einverstanden, fangen wir an",
        spoken: "Totally on board with that — let's dive right in.",
        spoken_meaning: "Voll einverstanden, packen wir es an",
        written: "Acknowledged. Let's proceed with the implementation.",
        written_meaning: "Bestätigt. Wir fahren mit der Implementierung fort",
        vocab: "on board with (einverstanden sein) · dive in (direkt loslegen)",
      },
      {
        input: "Weiter",
        spoken: "Let's keep going.",
        spoken_meaning: "Machen wir weiter",
        written: "Proceed with the next steps.",
        written_meaning: "Mit den nächsten Schritten fortfahren",
        vocab: "keep going (weitermachen) · proceed with (fortfahren mit)",
      },
      {
        input: "Dieser Ansatz ist überdimensioniert, nutzen wir lieber die Standardbibliothek",
        spoken: "This feels a bit over-engineered; we'd be much better off just sticking with the standard library.",
        spoken_meaning: "Das wirkt etwas überdimensioniert; mit der Standardbibliothek fahren wir deutlich besser",
        written: "The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.",
        written_meaning: "Der vorgeschlagene Ansatz bringt unnötige Komplexität mit sich. Die native Standardbibliothek wird empfohlen",
        vocab: "over-engineered (überdimensioniert) · be better off (besser dran sein mit) · stick with (bleiben bei) · leverage (nutzen/einsetzen)",
      },
    ],
  },
};

/**
 * 动态根据母语 A (sourceLang) 与目标学习语言 B (targetLang) 生成严格遵循【母语最高统治权】的系统提示词
 * 彻底替换提示词中的硬编码中文，使任意 A 语言使用者均获得 100% 本地化的语感解释与词汇注解。
 * 当 isLongInput 为 true 时，额外注入意图凝练与浓缩总结指令，确保长命令始终以高密度单卡呈现，无需翻页。
 */
export function buildSystemPrompt(sourceLang = "zh", targetLang = "en", isLongInput = false): string {
  const normSource = (sourceLang || "zh").toLowerCase().split("-")[0];
  const spec = LANGUAGE_SPECS[normSource] || LANGUAGE_SPECS.zh;
  const targetName = targetLang === "ja" ? "Japanese" : targetLang === "zh" ? "Chinese" : "English";

  const anchorText = spec.anchors
    .map(
      (a) => `Input: ${JSON.stringify(a.input)}\nOutput: ${JSON.stringify({
        spoken: a.spoken,
        spoken_meaning: a.spoken_meaning,
        written: a.written,
        written_meaning: a.written_meaning,
        vocab: a.vocab,
      })}`
    )
    .join("\n\n");

  const condensationDirective = isLongInput
    ? `\n\n[LONG INPUT CONDENSATION DIRECTIVE]:
The user's input text is long (>90 chars). DO NOT translate verbatim line by line with wordy padding.
First, distill and synthesize the core architectural/technical intent or question into a concise headline ("summary") in native ${spec.name} (strictly under 20 words).
Then, translate that distilled intent into concise, punchy spoken and written expressions in ${targetName} (strictly under 25 words each) so that the translation fits cleanly on a single terminal HUD card without information bloat.`
    : "";

  const jsonFormatHint = isLongInput
    ? `Strict JSON format:
{
  "summary": "Concise core intent/question in native ${spec.name} (under 20 words)",
  "spoken": "...",
  "spoken_meaning": "...",
  "written": "...",
  "written_meaning": "...",
  "vocab": "..."
}`
    : `Strict JSON format:
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
1. "spoken": Natural, fluent spoken ${targetName} (daily standup, Slack, pair programming, agile team collaboration, code reviews). Authentic Silicon Valley flow, contractions, native phrasal verbs, natural idioms.
2. "spoken_meaning": The exact colloquial nuance and meaning ${spec.meaningInstruction}.
3. "written": Clear, precise, modern technical written ${targetName} (PR descriptions, RFCs, issues, architecture docs). High-level Plain ${targetName}: active, concise, professional. STRICTLY AVOID archaic Victorian fluff (e.g. "we may now proceed", "precipitated", "parsimonious").
4. "written_meaning": The exact formal technical nuance and meaning ${spec.meaningInstruction}.
5. "vocab": Adaptively extract ALL key idiomatic collocations, phrasal verbs, technical idioms, or advanced expressions bridging the user to high-level/native developer fluency. Do NOT artificially cap at 1-2; extract as many as genuinely beneficial, while keeping each definition concise ${spec.vocabInstruction} to ensure the terminal HUD remains vertically compact.

[CODE & SYMBOL SHIELD - STRICT RULE]:
All inline code (\`foo()\`), file paths (@file, path/to/file), SQL keywords, variable names, and technical identifiers MUST be preserved 100% verbatim in both spoken and written outputs. Never translate, rephrase, or drop code tokens.
${condensationDirective}

[GOLDEN FEW-SHOT ANCHORS]:
${anchorText}

${jsonFormatHint}
Output valid JSON ONLY. Never output markdown code fences, backticks, quotes, or explanations.`;
}
