/**
 * Splits text into atomic natural sentence chunks when long.
 * Preserves punctuation (。！？；\n and .!?\n).
 *
 * Line Budget & Ergonomics:
 * 切分仅作为防超出 Pi 10 行硬截断的兜底防线，绝不过度拆碎用户意图。
 * 结合 9 行硬预算折叠守卫（超行时语感子导轨自动内联进括号），单卡可容纳 80~100 字符的自然句群。
 * 默认预算提高至 90 字符：
 * - 80 字以内日常长句：100% 单卡完整呈现，0 翻页；
 * - 120~180 字中长句：顶多分为 2 页，杜绝因每个句号碎成 4 页；
 * - 只有真正多段大篇幅文本才适度切分为 3+ 页。
 */
export function splitSemanticChunks(text: string, maxChunkChars = 90): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // 如果全文未达到预算上限，坚决不切分，保持整句原子完整性
  if (trimmed.length <= maxChunkChars) {
    return [trimmed];
  }

  // Split along sentence terminators: 。 ！？ ； \n and english . ! ? \n
  const rawSentences = trimmed.split(/([。！？；\n]|(?<=[.!?])\s+)/);
  const sentences: string[] = [];
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

  // If input contains only 1 sentence or no terminal punctuation:
  if (sentences.length <= 1) {
    if (trimmed.length <= maxChunkChars) {
      return [trimmed];
    }
    // Sub-split by comma/clause if single sentence is gigantic
    const commaParts = trimmed.split(/([，,、])/);
    const subChunks: string[] = [];
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
    return subChunks.length > 0 ? subChunks : [trimmed];
  }

  // Combine small consecutive sentences if under maxChunkChars (budget ~40 chars)
  const chunks: string[] = [];
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
