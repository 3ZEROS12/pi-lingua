/**
 * Splits text into atomic natural sentence chunks when long.
 * Preserves punctuation (。！？；\n and .!?\n).
 *
 * Line Budget Philosophy:
 * In an 80-column terminal, a 40-char Chinese sentence translates to:
 * - 1 line: Source text
 * - 2 lines: Spoken target language B
 * - 1 line: Spoken native language A sub-rail
 * - 2 lines: Written target language B
 * - 1 line: Written native language A sub-rail
 * - 1 line: Key vocab highlights
 * Total = 8 lines (strictly <= 9 lines, guaranteeing immunity against Pi's 10-line hard truncation cap!).
 */
export function splitSemanticChunks(text: string, maxChunkChars = 40): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

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
