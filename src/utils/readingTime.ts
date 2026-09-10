/**
 * Reading Time Estimation Utility
 * Calculates estimated academic reading time based on standard study word count (200 words/min).
 * Helps students efficiently plan and organize their study sessions.
 */

export interface ReadingTimeEstimate {
  wordCount: number;
  minutes: number;
  seconds: number;
  formatted: string;
  labelFr: string;
  labelEn: string;
  badgeTextFr: string;
  badgeTextEn: string;
  sessionCategoryFr: string;
  sessionCategoryEn: string;
  badgeColorClass: string;
}

/**
 * Strips HTML tags, Markdown symbols, and normalizes whitespaces
 */
export function countWords(rawText: string = ''): number {
  if (!rawText) return 0;

  // Remove HTML tags
  const textWithoutHtml = rawText.replace(/<[^>]*>/g, ' ');

  // Remove Markdown links and image tags
  const cleanText = textWithoutHtml
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[#*`_~>[\]\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) return 0;

  // Match words using international regex
  const words = cleanText.match(/[\p{L}\p{N}_\-]+/gu);
  return words ? words.length : 0;
}

/**
 * Calculates academic reading time.
 * Standard college/high-school academic reading rate is ~190-210 words per minute.
 * @param content The main document content or summary
 * @param additionalText Optional secondary text (e.g., summary or notes)
 * @param wordsPerMinute Default 200 wpm
 */
export function calculateReadingTime(
  content: string = '',
  additionalText: string = '',
  wordsPerMinute: number = 200
): ReadingTimeEstimate {
  const totalText = `${content} ${additionalText}`.trim();
  const wordCount = countWords(totalText);

  if (wordCount === 0) {
    return {
      wordCount: 0,
      minutes: 1,
      seconds: 30,
      formatted: '< 1 min',
      labelFr: '< 1 min',
      labelEn: '< 1 min',
      badgeTextFr: '< 1 min de lecture',
      badgeTextEn: '< 1 min read',
      sessionCategoryFr: 'Aperçu rapide',
      sessionCategoryEn: 'Quick peek',
      badgeColorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40',
    };
  }

  // Exact time in minutes
  const rawMinutes = wordCount / wordsPerMinute;
  const minutes = Math.max(1, Math.round(rawMinutes));
  const totalSeconds = Math.round(rawMinutes * 60);

  // Session categories for study session planning
  let sessionCategoryFr = 'Session flash (court)';
  let sessionCategoryEn = 'Quick read';
  let badgeColorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40';

  if (minutes > 15) {
    sessionCategoryFr = 'Session approfondie (+15m)';
    sessionCategoryEn = 'Deep study session';
    badgeColorClass = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40';
  } else if (minutes >= 8) {
    sessionCategoryFr = 'Session normale (8-15m)';
    sessionCategoryEn = 'Standard session';
    badgeColorClass = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40';
  } else if (minutes >= 3) {
    sessionCategoryFr = 'Session ciblée (3-7m)';
    sessionCategoryEn = 'Focused session';
    badgeColorClass = 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/40';
  }

  const labelFr = minutes <= 1 ? '~1 min' : `~${minutes} min`;
  const labelEn = minutes <= 1 ? '~1 min' : `~${minutes} min`;
  const formatted = labelFr;
  const badgeTextFr = minutes <= 1 ? '1 min de lecture' : `${minutes} min de lecture`;
  const badgeTextEn = minutes <= 1 ? '1 min read' : `${minutes} min read`;

  return {
    wordCount,
    minutes,
    seconds: totalSeconds,
    formatted,
    labelFr,
    labelEn,
    badgeTextFr,
    badgeTextEn,
    sessionCategoryFr,
    sessionCategoryEn,
    badgeColorClass,
  };
}
