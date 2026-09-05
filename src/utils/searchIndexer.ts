import { SchoolDocument, DocumentIndexedParagraph, FullTextSearchResult } from '../types';

/**
 * Splits document content into clean, coherent paragraphs with metadata
 */
export function indexDocumentParagraphs(doc: SchoolDocument): DocumentIndexedParagraph[] {
  if (!doc.content) return [];

  // Split by double newlines or single newlines with headings/bullets
  const rawParagraphs = doc.content
    .split(/\n{2,}|\r\n\r\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20); // filter out empty or micro-lines

  if (rawParagraphs.length === 0) {
    // If no double newlines, fallback to line groups (every 3-5 lines)
    const lines = doc.content.split(/\n+/).map(l => l.trim()).filter(Boolean);
    const chunks: string[] = [];
    let currentChunk: string[] = [];
    
    lines.forEach((line) => {
      currentChunk.push(line);
      if (currentChunk.join(' ').length > 250) {
        chunks.push(currentChunk.join('\n'));
        currentChunk = [];
      }
    });
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join('\n'));
    }
    
    return chunks.map((chunk, idx) => ({
      id: `${doc.id}-p-${idx}`,
      docId: doc.id,
      docTitle: doc.title,
      subject: doc.subject,
      paragraphIndex: idx + 1,
      pageNumber: Math.floor(idx / 3) + 1,
      text: chunk,
      keywords: extractKeywords(chunk),
      charCount: chunk.length,
      wordCount: chunk.split(/\s+/).length,
    }));
  }

  return rawParagraphs.map((para, idx) => ({
    id: `${doc.id}-p-${idx}`,
    docId: doc.id,
    docTitle: doc.title,
    subject: doc.subject,
    paragraphIndex: idx + 1,
    pageNumber: Math.floor(idx / 2) + 1, // Approx 2 substantial paragraphs per page
    text: para,
    keywords: extractKeywords(para),
    charCount: para.length,
    wordCount: para.split(/\s+/).length,
  }));
}

/**
 * Extracts high-value academic and topic keywords from text
 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'en', 'dans', 'pour', 'par',
    'sur', 'avec', 'sans', 'sous', 'vers', 'chez', 'est', 'sont', 'ont', 'fait',
    'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'from',
    'this', 'that', 'these', 'those', 'are', 'is', 'was', 'were', 'been', 'have',
    'has', 'had', 'what', 'which', 'who', 'how', 'when', 'where', 'why', 'que',
    'qui', 'quoi', 'dont', 'où', 'comme', 'plus', 'moins', 'très', 'aussi', 'bien'
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\sàâäéèêëîïôöùûüç-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stopWords.has(w));

  const freq: Record<string, number> = {};
  words.forEach((w) => {
    freq[w] = (freq[w] || 0) + 1;
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w);
}

/**
 * Performs full-text deep paragraph search across all documents
 */
export function searchDocumentParagraphs(
  documents: SchoolDocument[],
  query: string,
  subjectFilter = 'all'
): FullTextSearchResult[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  const queryTerms = cleanQuery
    .replace(/[^\w\sàâäéèêëîïôöùûüç-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2);

  if (queryTerms.length === 0) return [];

  const results: FullTextSearchResult[] = [];

  const filteredDocs = documents.filter(
    (d) => subjectFilter === 'all' || d.subject.toLowerCase() === subjectFilter.toLowerCase()
  );

  filteredDocs.forEach((doc) => {
    const paragraphs = indexDocumentParagraphs(doc);

    paragraphs.forEach((p) => {
      const lowerPara = p.text.toLowerCase();
      let matchedCount = 0;
      const matchedTerms: string[] = [];
      let firstMatchIndex = -1;
      let matchedTermExact = '';

      queryTerms.forEach((term) => {
        const idx = lowerPara.indexOf(term);
        if (idx !== -1) {
          matchedCount++;
          matchedTerms.push(term);
          if (firstMatchIndex === -1 || idx < firstMatchIndex) {
            firstMatchIndex = idx;
            matchedTermExact = p.text.substring(idx, idx + term.length);
          }
        }
      });

      // Calculate relevance score
      if (matchedCount > 0) {
        const densityScore = (matchedCount / queryTerms.length) * 50;
        const exactPhraseBonus = lowerPara.includes(cleanQuery) ? 35 : 0;
        const subjectBonus = doc.subject.toLowerCase().includes(cleanQuery) ? 15 : 0;
        const score = Math.min(100, Math.round(densityScore + exactPhraseBonus + subjectBonus));

        // Create contextual snippet
        const start = Math.max(0, firstMatchIndex - 60);
        const end = Math.min(p.text.length, firstMatchIndex + matchedTermExact.length + 80);
        const before = (start > 0 ? '...' : '') + p.text.substring(start, firstMatchIndex);
        const match = matchedTermExact || queryTerms[0];
        const after = p.text.substring(firstMatchIndex + match.length, end) + (end < p.text.length ? '...' : '');

        results.push({
          docId: doc.id,
          docTitle: doc.title,
          subject: doc.subject,
          type: doc.type,
          paragraphIndex: p.paragraphIndex,
          pageNumber: p.pageNumber,
          paragraphText: p.text,
          matchedKeywords: Array.from(new Set(matchedTerms)),
          snippet: {
            before,
            match,
            after,
          },
          relevanceScore: score,
        });
      }
    });
  });

  // Sort by highest relevance score
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}
