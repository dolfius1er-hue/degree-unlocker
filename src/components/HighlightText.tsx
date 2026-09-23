import React from 'react';

interface HighlightTextProps {
  text: string;
  query?: string;
  className?: string;
}

/**
 * Robust, real-time diacritic-insensitive & case-insensitive keyword highlighter.
 * Highlights matching tokens in document titles, subjects, and tags as the user types.
 */
export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  query,
  className = '',
}) => {
  if (!text) return null;
  if (!query || !query.trim()) {
    return <span className={className}>{text}</span>;
  }

  // Strip leading '#' for tag search queries
  const cleanQuery = query.replace(/^#+/, '').trim();
  if (!cleanQuery) {
    return <span className={className}>{text}</span>;
  }

  // Normalize string for diacritics (e.g. "Géométrie" -> "geometrie")
  const normalize = (str: string) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const normalizedText = normalize(text);
  const terms = cleanQuery
    .split(/\s+/)
    .map(normalize)
    .filter((t) => t.length > 0);

  if (terms.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Find all match intervals in the normalized text
  const intervals: { start: number; end: number }[] = [];
  for (const term of terms) {
    let pos = 0;
    while ((pos = normalizedText.indexOf(term, pos)) !== -1) {
      intervals.push({ start: pos, end: pos + term.length });
      pos += term.length;
    }
  }

  if (intervals.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Sort intervals by starting index
  intervals.sort((a, b) => a.start - b.start);

  // Merge overlapping or adjacent intervals
  const merged: { start: number; end: number }[] = [];
  let current = intervals[0];
  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i].start <= current.end) {
      current.end = Math.max(current.end, intervals[i].end);
    } else {
      merged.push(current);
      current = intervals[i];
    }
  }
  merged.push(current);

  // Split original text using the merged intervals
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  merged.forEach((interval, idx) => {
    if (interval.start > lastIndex) {
      parts.push(text.slice(lastIndex, interval.start));
    }
    parts.push(
      <mark
        key={idx}
        className="bg-amber-200/90 dark:bg-amber-400/40 text-amber-950 dark:text-amber-100 font-extrabold px-0.5 rounded-xs"
      >
        {text.slice(interval.start, interval.end)}
      </mark>
    );
    lastIndex = interval.end;
  });

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <span className={className}>{parts}</span>;
};
