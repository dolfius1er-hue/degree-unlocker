/**
 * High-performance, offline-ready local text summarizer & Cornell note generator.
 * Used for instant client-side summary generation when offline or during high-demand periods.
 */

export interface GeneratedSummaryResult {
  summary: string;
  keyPoints: string[];
  examTips: string[];
}

export function generateClientSideSummary(
  title: string,
  subject: string,
  content: string,
  style: 'cornell' | 'concise' | 'exam_prep' | 'flashcards' = 'cornell',
  lang: 'fr' | 'en' = 'fr'
): GeneratedSummaryResult {
  const isFr = lang === 'fr';
  const cleanContent = (content || '').trim();
  
  if (!cleanContent) {
    return {
      summary: isFr 
        ? 'Aucun contenu textuel trouvé dans ce document pour générer une synthèse.' 
        : 'No text content found in this document to generate a summary.',
      keyPoints: [],
      examTips: []
    };
  }

  // Split lines & sentences
  const rawLines = cleanContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const headings = rawLines.filter(l => l.startsWith('#') || l.endsWith(':') || /^[A-Z0-9IVX\.\-\s]{3,40}$/.test(l));
  
  const sentences = cleanContent
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && !s.startsWith('http'));

  // Extract key concept sentences
  const keySentences = sentences.filter(s => {
    const lower = s.toLowerCase();
    return (
      lower.includes('est ') ||
      lower.includes('sont ') ||
      lower.includes('définit') ||
      lower.includes('signifie') ||
      lower.includes('formule') ||
      lower.includes('théorème') ||
      lower.includes('principe') ||
      lower.includes('important') ||
      lower.includes('règle') ||
      lower.includes('is ') ||
      lower.includes('means') ||
      lower.includes('formula') ||
      lower.includes('principle') ||
      lower.includes('theorem') ||
      lower.includes('defined')
    );
  });

  const bestSentences = (keySentences.length >= 3 ? keySentences : sentences).slice(0, 8);
  
  // Extract key points
  const points = bestSentences.slice(0, 5).map(s => s.replace(/^[-*•\d\.\s]+/, ''));
  if (points.length === 0) {
    points.push(isFr ? `Concepts fondamentaux de ${subject || 'la matière'}` : `Core concepts of ${subject || 'the course'}`);
    points.push(isFr ? `Méthodes et définitions clés du cours ${title || ''}` : `Key definitions and methods from ${title || 'lesson'}`);
    points.push(isFr ? 'Applications pratiques et formules' : 'Practical applications and formulas');
  }

  let summaryMarkdown = '';

  if (style === 'cornell') {
    summaryMarkdown = isFr
      ? `# Synthèse Cornell : ${title || 'Cours'}\n\n` +
        `**Matière :** ${subject || 'Général'}  |  **Format :** Prise de notes Cornell\n\n` +
        `---\n\n` +
        `### 📌 Mots-Clés & Questions Clés (Colonne de Gauche)\n` +
        points.map((p, i) => `* **Q${i + 1} :** Quels sont les éléments clés de *${p.slice(0, 45)}...* ?`).join('\n') +
        `\n\n### 📝 Notes & Développements (Corps de Synthèse)\n` +
        (bestSentences.length > 0 
          ? bestSentences.map((s, idx) => `**${idx + 1}.** ${s}`).join('\n\n')
          : rawLines.slice(0, 10).map(l => `• ${l}`).join('\n')) +
        `\n\n### 🎯 Bilan & Conclusion Rapide\n` +
        `Ce cours aborde les notions indispensables de **${subject || 'la discipline'}**. Retenez principalement que : ${points[0] || 'la régularité est la clé de la maîtrise'}.\n`
      : `# Cornell Summary: ${title || 'Notes'}\n\n` +
        `**Subject:** ${subject || 'General'}  |  **Format:** Cornell Note-Taking System\n\n` +
        `---\n\n` +
        `### 📌 Key Cues & Questions (Left Column)\n` +
        points.map((p, i) => `* **Q${i + 1}:** What defines *${p.slice(0, 45)}...* ?`).join('\n') +
        `\n\n### 📝 Notes & Content (Main Body)\n` +
        (bestSentences.length > 0 
          ? bestSentences.map((s, idx) => `**${idx + 1}.** ${s}`).join('\n\n')
          : rawLines.slice(0, 10).map(l => `• ${l}`).join('\n')) +
        `\n\n### 🎯 Executive Takeaway\n` +
        `This material covers essential insights for **${subject || 'the course'}**. Key takeaway: ${points[0] || 'consistent practice builds retention'}.\n`;
  } else if (style === 'exam_prep') {
    summaryMarkdown = isFr
      ? `# ⚡ Fiche Express pour Examen & Bac : ${title || 'Révision'}\n\n` +
        `**Discipline :** ${subject || 'Général'}\n\n` +
        `### 🎯 Ce qu'il faut absolument retenir :\n` +
        points.map(p => `• **${p}**`).join('\n') +
        `\n\n### 🔍 Développements et méthodes incontournables :\n` +
        (bestSentences.slice(0, 6).map((s, i) => `**Point ${i + 1} :** ${s}`).join('\n\n')) +
        `\n\n### ⚠️ Pièges classiques à éviter :\n` +
        `1. Ne confondez pas les définitions voisines et vérifiez scrupuleusement vos unités/justifications.\n` +
        `2. Citez toujours précisément la formule ou la règle de cours avant de calculer ou d'argumenter.\n`
      : `# ⚡ High-Yield Exam Sheet: ${title || 'Revision'}\n\n` +
        `**Subject:** ${subject || 'General'}\n\n` +
        `### 🎯 Must-Know Key Pointers:\n` +
        points.map(p => `• **${p}**`).join('\n') +
        `\n\n### 🔍 Essential Explanations:\n` +
        (bestSentences.slice(0, 6).map((s, i) => `**Pointer ${i + 1}:** ${s}`).join('\n\n')) +
        `\n\n### ⚠️ Pitfalls to Avoid:\n` +
        `1. Double-check all core definitions and formulas before deriving conclusions.\n` +
        `2. Always write out assumptions explicitly in your exam answers.\n`;
  } else {
    // Concise
    summaryMarkdown = isFr
      ? `# Résumé Structuré : ${title || 'Document'}\n\n` +
        `**Matière :** ${subject || 'Général'}\n\n` +
        `### Points Clés\n` +
        points.map(p => `• ${p}`).join('\n') +
        `\n\n### Synthèse du Texte\n` +
        (bestSentences.length > 0 
          ? bestSentences.join(' ') 
          : rawLines.slice(0, 8).join('\n\n'))
      : `# Structured Summary: ${title || 'Document'}\n\n` +
        `**Subject:** ${subject || 'General'}\n\n` +
        `### Key Takeaways\n` +
        points.map(p => `• ${p}`).join('\n') +
        `\n\n### Overview\n` +
        (bestSentences.length > 0 
          ? bestSentences.join(' ') 
          : rawLines.slice(0, 8).join('\n\n'));
  }

  const examTips = isFr
    ? [
        `Bien structurer les réponses autour des notions clés de ${subject || 'ce cours'}.`,
        'Vérifier les définitions et rédiger par étapes claires et numérotées.',
        'S\'entraîner à réécrire les points clés sans regarder la fiche.'
      ]
    : [
        `Structure all arguments clearly around the core concepts of ${subject || 'this course'}.`,
        'Check definitions and write responses in numbered logical steps.',
        'Practice active recall by writing out key formulas from memory.'
      ];

  return {
    summary: summaryMarkdown,
    keyPoints: points,
    examTips
  };
}
