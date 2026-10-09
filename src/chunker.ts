/**
 * Splits text into atomic natural sentence chunks when long.
 * Preserves punctuation (。！？；\n and .!?\n).
 *
 * Line Budget & Ergonomics:
 * 结合 9 行硬预算折叠守卫与树状全景舒展度，单卡最舒适自然容量为 60~70 字符（约 30~35 汉字）。
 * 默认预算校准至 65 字符：
 * - 确保多句诗文/长段落切分后，每一卡均能以 6~8 行完整树状形式优雅展开，绝不触发单行胶囊降级；
 * - 绝不过度粉碎短句，保留自然停顿。
 */
export function splitSemanticChunks(text: string, maxChunkChars = 65): string[] {
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
