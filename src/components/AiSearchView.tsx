import React, { useState } from 'react';
import { SchoolDocument, SearchResponse, SourceValidationResult, AppLanguage, FullTextSearchResult } from '../types';
import { getSubjectBadgeClass } from '../utils/colors';
import { searchDocumentParagraphs } from '../utils/searchIndexer';
import { 
  Search, 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  CheckCircle, 
  HelpCircle, 
  PenTool, 
  Quote, 
  AlertCircle,
  Loader2,
  RefreshCw,
  ShieldCheck,
  FileText,
  Download,
  ExternalLink,
  Tag,
  Hash,
  Filter,
  CheckCircle2,
  FileSearch,
  FolderOpen,
  History,
  Clock,
  Trash2,
  X,
  Layers,
  FileCode,
  FileSpreadsheet
} from 'lucide-react';

interface AiSearchViewProps {
  documents: SchoolDocument[];
  onOpenDocInBlocknote: (doc: SchoolDocument) => void;
  onSelectDoc: (doc: SchoolDocument) => void;
  lang?: AppLanguage;
}

const SAMPLE_AI_QUERIES_EN = [
  "What are the 3 stages of cellular respiration and where does ATP synthase operate?",
  "How is impulse related to momentum according to Newton's mechanics?",
  "Explain the M-A-I-N root causes of World War I and the July crisis",
  "Which processes occur in the mitochondria vs the cytoplasm?",
  "What happens in a completely inelastic collision?",
];

const SAMPLE_AI_QUERIES_FR = [
  "Quelles sont les 3 étapes de la respiration cellulaire et où opère l'ATP synthase ?",
  "Comment l'impulsion est-elle liée à la quantité de mouvement selon Newton ?",
  "Expliquer les causes profondes de la Première Guerre Mondiale et la crise de juillet",
  "Quels processus se déroulent dans la mitochondrie par rapport au cytoplasme ?",
  "Que se passe-t-il lors d'une collision parfaitement inélastique ?",
];

const SAMPLE_KEYWORDS = [
  "ATP", "mitochondrie", "impulsion", "quantité de mouvement", "Sarajevo", 
  "glycolyse", "inélastique", "énergie cinétique", "cycle de Krebs", "Newton"
];

interface WordMatchLocation {
  doc: SchoolDocument;
  matchCount: number;
  snippets: {
    lineIndex: number;
    text: string;
    before: string;
    match: string;
    after: string;
  }[];
}

export const AiSearchView: React.FC<AiSearchViewProps> = ({
  documents,
  onOpenDocInBlocknote,
  onSelectDoc,
  lang = 'fr',
}) => {
  const [searchMode, setSearchMode] = useState<'paragraphs' | 'words' | 'ai'>('paragraphs'); // default to paragraph full-text search
  const [query, setQuery] = useState('');
  const [wordQuery, setWordQuery] = useState('');
  const [paragraphQuery, setParagraphQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [lastExecutedQuery, setLastExecutedQuery] = useState('');

  // Search History State (last 10 queries stored in localStorage)
  const SEARCH_HISTORY_STORAGE_KEY = 'degree_unlocker_ai_search_history';
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, 10);
        }
      }
    } catch (e) {
      console.warn('Failed to read search history from localStorage:', e);
    }
    return [];
  });

  const saveQueryToHistory = (newQuery: string) => {
    const trimmed = newQuery.trim();
    if (!trimmed) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save search history to localStorage:', e);
      }
      return updated;
    });
  };

  const removeHistoryItem = (queryToRemove: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSearchHistory((prev) => {
      const updated = prev.filter((item) => item !== queryToRemove);
      try {
        localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to update search history:', e);
      }
      return updated;
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear search history:', e);
    }
  };

  // Source auditing state for individual documents
  const [validatingDocId, setValidatingDocId] = useState<string | null>(null);
  const [auditedDocs, setAuditedDocs] = useState<Record<string, SourceValidationResult>>({});

  // Extract unique subjects
  const subjects = Array.from(new Set(documents.map(d => d.subject).filter(Boolean)));

  // AI Semantic Search execution
  const handleExecuteSearch = async (queryToRun: string) => {
    const q = queryToRun.trim();
    if (!q) return;

    saveQueryToHistory(q);
    setLoading(true);
    setError(null);
    setLastExecutedQuery(q);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          subjectFilter: subjectFilter,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to search school notes');
      }

      const result: SearchResponse = await res.json();
      setSearchResult(result);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Error executing search');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAi = (e: React.FormEvent) => {
    e.preventDefault();
    handleExecuteSearch(query);
  };

  // Run source validation for a specific document to verify reliability and enforce zero-hallucination
  const handleValidateDocSource = async (doc: SchoolDocument) => {
    setValidatingDocId(doc.id);
    try {
      const res = await fetch('/api/validate-source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: doc.id,
          title: doc.title,
          content: doc.content,
          subject: doc.subject,
        }),
      });

      if (res.ok) {
        const result: SourceValidationResult = await res.json();
        setAuditedDocs(prev => ({ ...prev, [doc.id]: result }));
      }
    } catch (err) {
      console.error('Validation error:', err);
    } finally {
      setValidatingDocId(null);
    }
  };

  // Word Search / Term Locator Logic
  const wordMatches: WordMatchLocation[] = React.useMemo(() => {
    const term = wordQuery.trim().toLowerCase();
    if (!term) return [];

    const results: WordMatchLocation[] = [];

    const filtered = documents.filter(d => subjectFilter === 'all' || d.subject === subjectFilter);

    for (const doc of filtered) {
      const lines = doc.content.split('\n');
      const docSnippets: WordMatchLocation['snippets'] = [];
      let totalDocMatches = 0;

      // Also check title and summary
      lines.forEach((line, idx) => {
        const lower = line.toLowerCase();
        const foundIdx = lower.indexOf(term);
        if (foundIdx !== -1) {
          totalDocMatches++;
          if (docSnippets.length < 5) { // Show up to 5 snippet occurrences per doc
            const start = Math.max(0, foundIdx - 40);
            const end = Math.min(line.length, foundIdx + term.length + 50);
            const before = line.substring(start, foundIdx);
            const match = line.substring(foundIdx, foundIdx + term.length);
            const after = line.substring(foundIdx + term.length, end);

            docSnippets.push({
              lineIndex: idx + 1,
              text: line,
              before: (start > 0 ? '...' : '') + before,
              match: match,
              after: after + (end < line.length ? '...' : ''),
            });
          }
        }
      });

      if (totalDocMatches > 0) {
        results.push({
          doc,
          matchCount: totalDocMatches,
          snippets: docSnippets,
        });
      }
    }

    // Sort by most occurrences
    return results.sort((a, b) => b.matchCount - a.matchCount);
  }, [wordQuery, documents, subjectFilter]);

  // Full-text PDF paragraph indexing results
  const paragraphResults: FullTextSearchResult[] = React.useMemo(() => {
    return searchDocumentParagraphs(documents, paragraphQuery, subjectFilter);
  }, [paragraphQuery, documents, subjectFilter]);

  const sampleQueries = lang === 'fr' ? SAMPLE_AI_QUERIES_FR : SAMPLE_AI_QUERIES_EN;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Mode Selector Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            id="tab-mode-paragraphs"
            onClick={() => setSearchMode('paragraphs')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              searchMode === 'paragraphs'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{lang === 'fr' ? 'Indexation Paragraphes PDF' : 'PDF Paragraph Indexer'}</span>
          </button>

          <button
            id="tab-mode-words"
            onClick={() => setSearchMode('words')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              searchMode === 'words'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileSearch className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{lang === 'fr' ? 'Mots & Sources' : 'Word Search'}</span>
          </button>

          <button
            id="tab-mode-ai"
            onClick={() => setSearchMode('ai')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              searchMode === 'ai'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{lang === 'fr' ? 'Recherche Sémantique IA' : 'AI Semantic Search'}</span>
          </button>
        </div>

        {/* Anti-hallucination policy badge */}
        <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            {lang === 'fr' 
              ? 'Garantie anti-invention : l\'IA cite strictement la source' 
              : 'Zero-hallucination guarantee: AI strictly grounds in sources'}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 0: FULL-TEXT PDF PARAGRAPH INDEXER & DEEP EXTRACTS                  */}
      {/* ========================================================================= */}
      {searchMode === 'paragraphs' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Layers className="w-4 h-4" />
                <span>{lang === 'fr' ? 'Indexation Plein Texte & Paragraphes PDF' : 'Full-Text PDF Paragraph Indexer'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {lang === 'fr' ? 'Retrouvez les paragraphes et définitions exacts au cœur de vos documents' : 'Surface exact paragraphs & deep excerpts inside your documents'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                {lang === 'fr'
                  ? 'Recherchez une notion, formule ou question pour extraire instantanément le paragraphe précis, le numéro de page et le contexte de cours.'
                  : 'Search any concept, formula or topic to extract verbatim paragraphs, page references, and key academic snippets.'}
              </p>
            </div>

            {/* Paragraph Search Input */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="paragraph-search-input"
                  type="text"
                  value={paragraphQuery}
                  onChange={(e) => setParagraphQuery(e.target.value)}
                  placeholder={lang === 'fr' ? 'Rechercher une notion (ex: ATP synthase, mitose, impulsion, guerre froide, équation...)' : 'Search paragraphs (e.g. ATP synthase, mitosis, impulse, Cold War, quadratic)...'}
                  className="w-full pl-11 pr-24 py-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-all shadow-xs"
                />
                {paragraphQuery && (
                  <button
                    onClick={() => setParagraphQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-200/70 dark:bg-slate-700 px-2 py-1 rounded-md cursor-pointer"
                  >
                    {lang === 'fr' ? 'Effacer' : 'Clear'}
                  </button>
                )}
              </div>

              {/* Subject Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <button
                  onClick={() => setSubjectFilter('all')}
                  className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                    subjectFilter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {lang === 'fr' ? 'Toutes les matières' : 'All Subjects'}
                </button>
                {Array.from(new Set(documents.map((d) => d.subject))).map((subj) => (
                  <button
                    key={subj}
                    onClick={() => setSubjectFilter(subj)}
                    className={`px-3 py-1 rounded-full font-semibold transition-colors shrink-0 cursor-pointer ${
                      subjectFilter === subj
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Paragraph Search Results List */}
          {paragraphQuery.trim() && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                <span>
                  {paragraphResults.length} {lang === 'fr' ? 'paragraphe(s) trouvé(s)' : 'paragraph(s) matched'}
                </span>
                <span>{lang === 'fr' ? 'Classé par score de pertinence' : 'Ranked by relevance score'}</span>
              </div>

              {paragraphResults.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
                  {lang === 'fr'
                    ? 'Aucun paragraphe correspondant trouvé. Essayez d\'autres termes ou vérifiez vos documents importés.'
                    : 'No matching paragraphs found. Try other keywords or check your imported documents.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {paragraphResults.map((res, rIdx) => {
                    const matchedDoc = documents.find((d) => d.id === res.docId);
                    return (
                      <div
                        key={rIdx}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all p-5 space-y-3"
                      >
                        {/* Header: Doc Title, Page/Paragraph Reference, Relevance Badge */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${getSubjectBadgeClass(res.subject)}`}>
                              {res.subject}
                            </span>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                              {res.docTitle}
                            </h3>
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] text-slate-600 dark:text-slate-300">
                              {lang === 'fr' ? 'Paragraphe' : 'Paragraph'} {res.paragraphIndex} {res.pageNumber ? `(Page ~${res.pageNumber})` : ''}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60">
                              {res.relevanceScore}% {lang === 'fr' ? 'Pertinence' : 'Match'}
                            </span>
                            {matchedDoc && (
                              <button
                                onClick={() => onOpenDocInBlocknote(matchedDoc)}
                                className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <PenTool className="w-3.5 h-3.5" />
                                <span>{lang === 'fr' ? 'Ouvrir Cahier' : 'Open Notes'}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Matched Keywords */}
                        {res.matchedKeywords.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap text-xs">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                              {lang === 'fr' ? 'Mots repérés :' : 'Keywords :'}
                            </span>
                            {res.matchedKeywords.map((kw, kwIdx) => (
                              <span
                                key={kwIdx}
                                className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-medium text-[11px] border border-amber-200/80 dark:border-amber-800/60"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Exact Paragraph Body with Highlighted terms */}
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 font-serif text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {res.paragraphText}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: WORD SEARCH BAR & SOURCE LOCATOR                                  */}
      {/* ========================================================================= */}
      {searchMode === 'words' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
                <FileSearch className="w-4 h-4" />
                <span>{lang === 'fr' ? 'Localisateur de Mots & Examen des Sources' : 'Exact Term Locator & Source Inspector'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {lang === 'fr' ? 'Retrouvez un mot précis dans vos cours & vérifiez sa source' : 'Locate specific terms across notes & verify source credibility'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                {lang === 'fr'
                  ? 'Tapez n\'importe quel mot-clé pour situer immédiatement le numéro de ligne, le document d\'origine et son audit de fiabilité.'
                  : 'Search any keyword to inspect matching line numbers, source document path, and verify academic quality.'}
              </p>
            </div>

            {/* Word Search Form */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="word-search-input"
                  type="text"
                  value={wordQuery}
                  onChange={(e) => setWordQuery(e.target.value)}
                  placeholder={lang === 'fr' ? 'Entrez un mot (ex: mitochondrie, ATP, impulsion, Sarajevo, collision...)' : 'Type a word (e.g. mitochondria, impulse, Sarajevo, collision)...'}
                  className="w-full pl-11 pr-24 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-all shadow-xs"
                />
                {wordQuery && (
                  <button
                    onClick={() => setWordQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 bg-slate-200/70 px-2 py-1 rounded-md"
                  >
                    {lang === 'fr' ? 'Effacer' : 'Clear'}
                  </button>
                )}
              </div>

              {/* Subject filter & Quick pills */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-500 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" />
                    {lang === 'fr' ? 'Matière :' : 'Subject:'}
                  </span>
                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                  >
                    <option value="all">{lang === 'fr' ? 'Toutes les matières' : 'All Subjects'} ({documents.length})</option>
                    {subjects.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub} ({documents.filter(d => d.subject === sub).length})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500">
                  <span className="text-[11px] font-medium">{lang === 'fr' ? 'Mots suggérés :' : 'Suggested keywords:'}</span>
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-sm scrollbar-thin">
                    {SAMPLE_KEYWORDS.slice(0, 5).map((kw, idx) => (
                      <button
                        key={idx}
                        onClick={() => setWordQuery(kw)}
                        className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-800 border border-slate-200 text-[10px] font-medium text-slate-600 transition-colors whitespace-nowrap"
                      >
                        {kw}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results for Word Search */}
          {wordQuery.trim() && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                <span className="font-bold text-slate-900">
                  {lang === 'fr' 
                    ? `${wordMatches.length} document(s) contenant "${wordQuery}"` 
                    : `${wordMatches.length} document(s) matching "${wordQuery}"`}
                </span>
                <span>
                  {wordMatches.reduce((acc, m) => acc + m.matchCount, 0)} {lang === 'fr' ? 'occurrences totales' : 'total occurrences'}
                </span>
              </div>

              {wordMatches.length === 0 ? (
                <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-xs space-y-2">
                  <p className="text-slate-600 font-medium">
                    {lang === 'fr' 
                      ? `Aucune occurrence trouvée pour "${wordQuery}". Essayez un mot plus général ou vérifiez l'orthographe.` 
                      : `No occurrences found for "${wordQuery}". Try a broader term or check spelling.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {wordMatches.map(({ doc, matchCount, snippets }) => {
                    const badge = getSubjectBadgeClass(doc.subject);
                    const audited = auditedDocs[doc.id] || doc.sourceValidation;

                    return (
                      <div 
                        key={doc.id}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-indigo-300 transition-all text-xs"
                      >
                        {/* Header: Document identification & source metadata */}
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                              {doc.subject}
                            </span>
                            <h3 className="font-bold text-slate-900 text-sm truncate max-w-sm sm:max-w-md">
                              {doc.title}
                            </h3>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono">
                              {matchCount} {lang === 'fr' ? 'occurrences' : 'matches'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onSelectDoc(doc)}
                              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                              <span>{lang === 'fr' ? 'Voir la note' : 'View Note'}</span>
                            </button>

                            <button
                              onClick={() => onOpenDocInBlocknote(doc)}
                              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors"
                            >
                              <PenTool className="w-3.5 h-3.5" />
                              <span>{lang === 'fr' ? 'Ouvrir en Blocknote' : 'Open in Blocknote'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Source Details & Storage disclosure */}
                        <div className="px-5 py-3 bg-slate-100/50 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="flex items-center gap-1 font-mono">
                              <FileText className="w-3.5 h-3.5 text-indigo-600" />
                              <span>{lang === 'fr' ? 'Fichier :' : 'File:'} {doc.fileName || `${doc.title}.txt`}</span>
                            </span>

                            {doc.localFilePath && (
                              <span className="flex items-center gap-1 font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <FolderOpen className="w-3 h-3 text-emerald-600" />
                                <span>{doc.localFilePath}</span>
                              </span>
                            )}

                            <span>•</span>
                            <span>{lang === 'fr' ? 'Date :' : 'Date:'} {doc.date}</span>
                            <span>•</span>
                            <span>{lang === 'fr' ? 'Niveau :' : 'Level:'} {doc.gradeLevel || 'Standard'}</span>
                          </div>

                          {/* Source Validation Badge */}
                          <div className="flex items-center gap-2">
                            {audited ? (
                              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-md font-semibold">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>
                                  {lang === 'fr' ? 'Source validée :' : 'Validated source:'} {audited.overallScore}/100 ({audited.academicLevel})
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleValidateDocSource(doc)}
                                disabled={validatingDocId === doc.id}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md border border-indigo-200 transition-colors"
                              >
                                <ShieldCheck className={`w-3 h-3 ${validatingDocId === doc.id ? 'animate-spin' : ''}`} />
                                <span>
                                  {validatingDocId === doc.id 
                                    ? (lang === 'fr' ? 'Validation en cours...' : 'Validating...') 
                                    : (lang === 'fr' ? 'Valider cette source' : 'Validate Source')}
                                </span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Audit Details dropdown/card if available */}
                        {audited && (
                          <div className="px-5 py-3 bg-emerald-50/40 border-b border-emerald-100 text-[11px] text-emerald-950 space-y-1">
                            <p className="font-semibold flex items-center gap-1 text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{audited.notesSummary}</span>
                            </p>
                            {audited.strengths && audited.strengths.length > 0 && (
                              <div className="flex items-center gap-2 flex-wrap text-emerald-700">
                                <span className="font-bold">{lang === 'fr' ? 'Points forts :' : 'Strengths:'}</span>
                                {audited.strengths.map((s, idx) => (
                                  <span key={idx} className="bg-white/80 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
                                    ✓ {s}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Matching Snippets with Line Numbers & Highlighted Text */}
                        <div className="p-5 space-y-2.5">
                          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            {lang === 'fr' ? 'Extraits textuels exacts & Lignes de repère :' : 'Verbatim snippets & Reference lines:'}
                          </h4>

                          <div className="space-y-2">
                            {snippets.map((snip, sIdx) => (
                              <div 
                                key={sIdx}
                                className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 flex items-start gap-3 font-mono text-xs text-slate-700 transition-colors"
                              >
                                <span className="bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded text-[10px] shrink-0 mt-0.5">
                                  Ligne {snip.lineIndex}
                                </span>
                                <div className="leading-relaxed">
                                  <span>{snip.before}</span>
                                  <mark className="bg-amber-300 text-slate-950 font-bold px-1 py-0.5 rounded mx-0.5">
                                    {snip.match}
                                  </mark>
                                  <span>{snip.after}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: AI SEMANTIC SEARCH                                               */}
      {/* ========================================================================= */}
      {searchMode === 'ai' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2.5 text-indigo-700 mb-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {lang === 'fr' ? 'Recherche Sémantique IA & Synthèse Sourcée' : 'Natural Language AI Semantic Search'}
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {lang === 'fr' ? 'Interrogez l\'ensemble de vos cours & fiches' : 'Query Your School Notes & PDFs'}
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              {lang === 'fr'
                ? 'Posez vos questions en français ou en anglais. Gemini AI parcourt tous vos documents pour synthétiser des réponses rigoureusement ancrées avec citations directes.'
                : 'Ask questions in plain English or French. Gemini AI scans all your documents to synthesize accurate answers strictly grounded in citations.'}
            </p>

            {/* Anti-Hallucination Callout Card */}
            <div className="mt-4 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-xl p-4 text-white relative overflow-hidden shadow-xs">
              <p className="text-[10px] uppercase text-emerald-400 tracking-widest font-bold mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {lang === 'fr' ? 'Garantie Zéro-Hallucination' : 'Zero-Hallucination Enforced'}
              </p>
              <p className="text-xs font-light italic text-slate-200">
                {lang === 'fr'
                  ? '« L\'IA n\'invente aucun fait : chaque réponse est impérativement appuyée par les cours présents dans votre base. »'
                  : '“The AI does not fabricate facts: every answer is strictly sourced from your verified notebook documents.”'}
              </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSubmitAi} className="mt-5 space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="ai-search-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={lang === 'fr' ? 'Ex: Quelles sont les étapes de la respiration cellulaire et où opère l\'ATP synthase ?' : 'e.g. What are the key stages of cellular respiration and where do they occur?'}
                  className="w-full pl-11 pr-32 py-3.5 bg-slate-50 border border-slate-200 rounded-full text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base font-medium transition-all shadow-xs"
                />
                <div className="absolute inset-y-1.5 right-1.5 flex items-center">
                  <button
                    id="btn-run-search"
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="h-full px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{lang === 'fr' ? 'Recherche...' : 'Searching...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{lang === 'fr' ? 'Rechercher' : 'Search'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Subject Filter & Sample Queries */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">{lang === 'fr' ? 'Filtrer par matière :' : 'Filter:'}</span>
                  <select
                    id="search-subject-filter"
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="all">{lang === 'fr' ? 'Toutes les matières' : 'All Subjects'} ({documents.length})</option>
                    {subjects.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub} ({documents.filter(d => d.subject === sub).length})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{lang === 'fr' ? 'Cliquez sur une suggestion :' : 'Click a prompt to try:'}</span>
                </div>
              </div>

              {/* Sample queries chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {sampleQueries.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuery(sample);
                      handleExecuteSearch(sample);
                    }}
                    className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-900 border border-slate-200 hover:border-indigo-300 text-slate-600 px-3 py-1.5 rounded-full transition-colors text-left font-medium cursor-pointer"
                  >
                    {sample}
                  </button>
                ))}
              </div>

              {/* Search History Section (Last 10 natural language queries) */}
              {searchHistory.length > 0 && (
                <div className="pt-3 mt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <History className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{lang === 'fr' ? 'Historique de recherche récent' : 'Recent Search History'}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({searchHistory.length}/10)</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearSearchHistory}
                      className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
                      title={lang === 'fr' ? 'Effacer tout l\'historique' : 'Clear search history'}
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{lang === 'fr' ? 'Effacer' : 'Clear'}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((histQuery, idx) => (
                      <div
                        key={idx}
                        className="group inline-flex items-center gap-1.5 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/70 rounded-full pl-3 pr-1.5 py-1 text-xs text-indigo-950 transition-all cursor-pointer shadow-2xs"
                        onClick={() => {
                          setQuery(histQuery);
                          handleExecuteSearch(histQuery);
                        }}
                      >
                        <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span className="max-w-[220px] sm:max-w-xs truncate font-medium">{histQuery}</span>
                        <button
                          type="button"
                          onClick={(e) => removeHistoryItem(histQuery, e)}
                          className="p-0.5 rounded-full hover:bg-indigo-200 text-indigo-400 hover:text-indigo-900 transition-colors ml-0.5 cursor-pointer"
                          title={lang === 'fr' ? 'Supprimer cette recherche' : 'Remove this search'}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Error State */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{lang === 'fr' ? 'Erreur de recherche' : 'Search Error'}</p>
                <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="bg-white rounded-xl p-8 border border-slate-200 animate-pulse space-y-4">
              <div className="h-4 bg-indigo-100 rounded-full w-1/4"></div>
              <div className="h-6 bg-slate-200 rounded-md w-3/4"></div>
              <div className="space-y-2 pt-2">
                <div className="h-3.5 bg-slate-100 rounded-sm w-full"></div>
                <div className="h-3.5 bg-slate-100 rounded-sm w-5/6"></div>
                <div className="h-3.5 bg-slate-100 rounded-sm w-4/6"></div>
              </div>
            </div>
          )}

          {/* AI Search Result */}
          {searchResult && !loading && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 sm:p-8 border border-indigo-200 shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                      {lang === 'fr' ? 'Synthèse Rédigée par l\'IA (Sourcée)' : 'Synthesized Answer from Notes'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    &ldquo;{lastExecutedQuery}&rdquo;
                  </span>
                </div>

                {/* Answer Content */}
                <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {searchResult.answer}
                </div>

                {/* Key Insights */}
                {searchResult.keyInsights && searchResult.keyInsights.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{lang === 'fr' ? 'Points Clés de Révision :' : 'Key Revision Insights:'}</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {searchResult.keyInsights.map((insight, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5"></span>
                          <span>{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Citations */}
              {searchResult.citations && searchResult.citations.length > 0 && (
                <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Quote className="w-4 h-4 text-indigo-600" />
                      <span>{lang === 'fr' ? 'Citations & Documents Sources' : 'Source Documents & Citations'} ({searchResult.citations.length})</span>
                    </h3>
                    <span className="text-xs text-slate-500">
                      {lang === 'fr' ? 'Garantie anti-invention : citations textuelles directes' : 'Strict direct textual citations'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResult.citations.map((cite, idx) => {
                      const matchedDoc = documents.find(d => d.id === cite.docId);
                      const badge = getSubjectBadgeClass(cite.subject);

                      return (
                        <div 
                          key={idx}
                          className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                                {cite.subject}
                              </span>
                              <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded-md">
                                {Math.round(cite.relevanceScore)}% {lang === 'fr' ? 'pertinence' : 'match'}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-slate-900 mb-1.5">
                              {cite.docTitle}
                            </h4>

                            <blockquote className="text-xs text-slate-600 italic border-l-2 border-indigo-400 pl-2.5 my-2 line-clamp-3">
                              &ldquo;{cite.quote}&rdquo;
                            </blockquote>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                            {matchedDoc && (
                              <>
                                <button
                                  onClick={() => onSelectDoc(matchedDoc)}
                                  className="text-xs text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1"
                                >
                                  <BookOpen className="w-3 h-3" />
                                  <span>{lang === 'fr' ? 'Consulter' : 'View Note'}</span>
                                </button>

                                <button
                                  onClick={() => onOpenDocInBlocknote(matchedDoc)}
                                  className="text-xs text-amber-800 hover:text-amber-950 font-semibold inline-flex items-center gap-1 bg-amber-100/80 hover:bg-amber-200 px-2.5 py-1 rounded-md transition-colors"
                                >
                                  <PenTool className="w-3 h-3 text-amber-600" />
                                  <span>{lang === 'fr' ? 'Blocknote' : 'Blocknote'}</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
