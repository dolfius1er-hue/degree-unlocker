import React, { useState, useRef } from 'react';
import { SchoolDocument, AppLanguage, CustomTag } from '../types';
import { DocumentCard } from './DocumentCard';
import { TagManagerModal, TAG_COLORS } from './TagManagerModal';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  Upload, 
  PenTool, 
  Sparkles, 
  FileText, 
  SlidersHorizontal,
  FolderOpen,
  Tag,
  HelpCircle,
  X,
  Check,
  Smartphone,
  Sliders,
  LayoutGrid,
  List,
  Trash2,
  Edit3,
  Zap,
  Languages,
  Calendar,
  Layers,
  Clock,
  History,
  ArrowUpRight,
  Eye,
  Highlighter
} from 'lucide-react';

interface DocumentListViewProps {
  documents: SchoolDocument[];
  onOpenBlocknote: (doc: SchoolDocument) => void;
  onSummarize: (doc: SchoolDocument) => void;
  onEdit: (doc: SchoolDocument) => void;
  onDelete: (id: string) => void;
  onNewNote: () => void;
  onUploadPdf: () => void;
  onSwitchToSearch: () => void;
  onOpenFlashcards?: (doc: SchoolDocument) => void;
  onOpenQuiz?: (doc: SchoolDocument) => void;
  onOpenBilingual?: (doc: SchoolDocument) => void;
  onOpenAnnotate?: (doc: SchoolDocument) => void;
  onOpenTutorial?: () => void;
  selectedDocForBlocknoteId?: string;
  lang?: AppLanguage;
  customTags?: CustomTag[];
  onCreateTag?: (newTag: CustomTag) => void;
  onDeleteTag?: (tagName: string) => void;
  onUpdateDocumentTags?: (docId: string, tags: string[]) => void;
  onSendToPhone?: (doc: SchoolDocument) => void;
}

export const DocumentListView: React.FC<DocumentListViewProps> = ({
  documents,
  onOpenBlocknote,
  onSummarize,
  onEdit,
  onDelete,
  onNewNote,
  onUploadPdf,
  onSwitchToSearch,
  onOpenFlashcards,
  onOpenQuiz,
  onOpenBilingual,
  onOpenAnnotate,
  onOpenTutorial,
  selectedDocForBlocknoteId,
  lang = 'fr',
  customTags = [],
  onCreateTag,
  onDeleteTag,
  onUpdateDocumentTags,
  onSendToPhone,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<'all' | 'note' | 'pdf'>('all');
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [inlineNewTag, setInlineNewTag] = useState('');
  const [showTagAutocomplete, setShowTagAutocomplete] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    try {
      return (localStorage.getItem('degree_unlocker_library_view_mode') as 'grid' | 'list') || 'grid';
    } catch {
      return 'grid';
    }
  });

  // Recently Viewed Documents (Top 5)
  const RECENT_DOCS_STORAGE_KEY = 'degreelocker_recently_viewed_docs';
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(RECENT_DOCS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.slice(0, 5);
      }
    } catch (e) {
      console.warn('Failed to load recently viewed documents:', e);
    }
    return [];
  });

  const recordDocumentView = (docId: string) => {
    if (!docId) return;
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((id) => id !== docId);
      const updated = [docId, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(RECENT_DOCS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save recently viewed documents:', e);
      }
      return updated;
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewedIds([]);
    try {
      localStorage.removeItem(RECENT_DOCS_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear recently viewed documents:', e);
    }
  };

  const removeRecentlyViewedItem = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentlyViewedIds((prev) => {
      const updated = prev.filter((id) => id !== docId);
      try {
        localStorage.setItem(RECENT_DOCS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to update recently viewed:', err);
      }
      return updated;
    });
  };

  // Wrapped document actions that track recent view
  const handleDocOpenBlocknote = (doc: SchoolDocument) => {
    recordDocumentView(doc.id);
    onOpenBlocknote(doc);
  };

  const handleDocSummarize = (doc: SchoolDocument) => {
    recordDocumentView(doc.id);
    onSummarize(doc);
  };

  const handleDocEdit = (doc: SchoolDocument) => {
    recordDocumentView(doc.id);
    onEdit(doc);
  };

  const handleDocOpenFlashcards = (doc: SchoolDocument) => {
    recordDocumentView(doc.id);
    if (onOpenFlashcards) onOpenFlashcards(doc);
  };

  const handleDocOpenQuiz = (doc: SchoolDocument) => {
    recordDocumentView(doc.id);
    if (onOpenQuiz) onOpenQuiz(doc);
  };

  const handleDocOpenBilingual = (doc: SchoolDocument) => {
    recordDocumentView(doc.id);
    if (onOpenBilingual) onOpenBilingual(doc);
  };

  // Resolve recently viewed documents objects
  const recentlyViewedDocuments = React.useMemo(() => {
    return recentlyViewedIds
      .map((id) => documents.find((d) => d.id === id))
      .filter((d): d is SchoolDocument => Boolean(d));
  }, [recentlyViewedIds, documents]);

  const handleSetViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    try {
      localStorage.setItem('degree_unlocker_library_view_mode', mode);
    } catch (e) {
      console.warn('Failed to save viewMode:', e);
    }
  };

  // Subjects list
  const subjects: string[] = Array.from(
    new Set<string>(documents.map(d => d.subject).filter((s): s is string => Boolean(s)))
  );

  // Extract all unique tags (combining custom tags and document tags)
  const allTags: string[] = Array.from(
    new Set<string>([
      ...customTags.map((ct) => ct.name),
      ...documents.flatMap((d) => d.tags || []),
    ].filter((t): t is string => Boolean(t?.trim())))
  ).sort((a, b) => a.localeCompare(b));

  // Handle autocomplete matching when user types '#'
  const tagQuery = searchFilter.includes('#')
    ? searchFilter.split('#').pop()?.toLowerCase().trim() || ''
    : '';

  const matchingAutocompleteTags = searchFilter.includes('#')
    ? allTags.filter((t) => t.toLowerCase().includes(tagQuery))
    : [];

  const toggleTagFilter = (tag: string) => {
    const lower = tag.toLowerCase();
    setSelectedTags((prev) => {
      const exists = prev.some((t) => t.toLowerCase() === lower);
      if (exists) {
        return prev.filter((t) => t.toLowerCase() !== lower);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleSelectAutocompleteTag = (tag: string) => {
    toggleTagFilter(tag);
    const clean = searchFilter.replace(/#\w*$/, '').trim();
    setSearchFilter(clean);
    setShowTagAutocomplete(false);
  };

  const handleCreateInlineTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inlineNewTag.trim().replace(/^#+/, '');
    if (!clean) return;

    if (onCreateTag) {
      onCreateTag({
        id: `tag-${Date.now()}`,
        name: clean,
        color: 'indigo',
      });
    }
    toggleTagFilter(clean);
    setInlineNewTag('');
  };

  // Filtered documents
  const filteredDocs = documents.filter(doc => {
    // Subject filter
    if (selectedSubject !== 'all' && doc.subject?.toLowerCase() !== selectedSubject.toLowerCase()) {
      return false;
    }
    // Type filter
    if (typeFilter === 'note' && doc.type === 'pdf') return false;
    if (typeFilter === 'pdf' && doc.type !== 'pdf') return false;

    // Multi-Tag filter (must match all selected tags)
    if (selectedTags.length > 0) {
      const docTagsLower = (doc.tags || []).map((t) => t.toLowerCase());
      const hasAllTags = selectedTags.every((st) => docTagsLower.includes(st.toLowerCase()));
      if (!hasAllTags) return false;
    }

    // Search query filter
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchSubject = doc.subject.toLowerCase().includes(q);
      const matchContent = doc.content.toLowerCase().includes(q);
      const matchTag = doc.tags?.some(t => t.toLowerCase().includes(q));
      return matchTitle || matchSubject || matchContent || matchTag;
    }

    return true;
  });

  const clearAllFilters = () => {
    setSearchFilter('');
    setSelectedSubject('all');
    setSelectedTags([]);
    setTypeFilter('all');
  };

  const hasActiveFilters = searchFilter.trim() !== '' || selectedSubject !== 'all' || selectedTags.length > 0 || typeFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Top Banner / Feature Callout */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-md border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? 'Base Scolaire & Académique Intelligente' : 'ScholarMind Academic Knowledge Base'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {lang === 'fr' ? 'Cours, Fiches & Compagnon Cahier Blocknote' : 'Academic Notes, PDFs & Handwrite Companion'}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            {lang === 'fr'
              ? 'Centralisez tous vos cours scolaires, polycopiés et PDF sur votre disque PC. Créez des labels sur-mesure (#Examen, #Formules), filtrez en 1 clic et synchronisez vos cours avec votre smartphone.'
              : 'Store lecture notes and uploaded PDFs. Create custom tags (#Exam, #Formulas), filter effortlessly, and sync notes with your mobile phone.'}
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={onSwitchToSearch}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Poser une Question à l’IA' : 'Ask AI in Natural Language'}</span>
            </button>

            <button
              onClick={onUploadPdf}
              className="px-4 py-2 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-slate-100 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? '+ Importer un PDF' : '+ Upload PDF'}</span>
            </button>

            <button
              onClick={onNewNote}
              className="px-4 py-2 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-slate-100 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? '+ Nouvelle Note' : '+ New Note'}</span>
            </button>

            <button
              onClick={() => setIsTagManagerOpen(true)}
              className="px-4 py-2 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5 text-amber-300" />
              <span>{lang === 'fr' ? 'Gérer les Labels' : 'Manage Tags'}</span>
            </button>

            {onOpenTutorial && (
              <button
                onClick={onOpenTutorial}
                className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>{lang === 'fr' ? 'Guide & Tuto' : 'User Guide'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Decorative background visual */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <PenTool className="w-72 h-72 text-indigo-400" />
        </div>
      </div>

      {/* Recently Viewed Documents Section (Last 5 accessed documents) */}
      {recentlyViewedDocuments.length > 0 && (
        <div id="recently-viewed-section" className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-indigo-500/30 shadow-lg relative overflow-hidden animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-indigo-900/60">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                    {lang === 'fr' ? 'Récemment consultés' : 'Recently Viewed'}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    {recentlyViewedDocuments.length} / 5
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {lang === 'fr'
                    ? 'Accès rapide aux 5 derniers cours ouverts pour reprendre votre travail instantanément.'
                    : 'Quick access to your last 5 accessed notes to resume your study flow.'}
                </p>
              </div>
            </div>

            <button
              onClick={clearRecentlyViewed}
              className="text-[11px] font-semibold text-slate-400 hover:text-rose-300 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer border border-transparent hover:border-rose-900/50"
              title={lang === 'fr' ? 'Effacer la liste des récents' : 'Clear recent list'}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'fr' ? 'Effacer l’historique' : 'Clear history'}</span>
            </button>
          </div>

          {/* Cards carousel / grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {recentlyViewedDocuments.map((doc) => {
              return (
                <div
                  key={doc.id}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-400/50 rounded-xl p-3 flex flex-col justify-between transition-all group shadow-sm hover:shadow-md relative"
                >
                  {/* Remove pill */}
                  <button
                    onClick={(e) => removeRecentlyViewedItem(doc.id, e)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-rose-400 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-slate-700"
                    title={lang === 'fr' ? 'Retirer de la liste' : 'Remove from recent'}
                  >
                    <X className="w-3 h-3" />
                  </button>

                  <div className="space-y-1.5 pr-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/20 truncate max-w-[120px]">
                        {doc.subject}
                      </span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                        {doc.type === 'pdf' ? 'PDF' : doc.type === 'word_docx' ? 'Word' : doc.type === 'excel_sheet' ? 'Excel' : 'Note'}
                      </span>
                    </div>

                    <h4
                      onClick={() => handleDocOpenBlocknote(doc)}
                      className="text-xs font-bold text-slate-100 hover:text-amber-300 transition-colors line-clamp-2 cursor-pointer pt-0.5"
                      title={doc.title}
                    >
                      {doc.title}
                    </h4>
                  </div>

                  {/* Fast Action Buttons */}
                  <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between gap-1">
                    <button
                      onClick={() => handleDocOpenBlocknote(doc)}
                      className="flex-1 py-1 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                      title={lang === 'fr' ? 'Ouvrir dans le Cahier Cornell' : 'Open in Cornell Blocknote'}
                    >
                      <PenTool className="w-3 h-3" />
                      <span>{lang === 'fr' ? 'Cahier' : 'Notes'}</span>
                    </button>

                    <button
                      onClick={() => handleDocSummarize(doc)}
                      className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-amber-300 transition-colors cursor-pointer"
                      title={lang === 'fr' ? 'Résumé IA' : 'AI Summary'}
                    >
                      <Sparkles className="w-3 h-3" />
                    </button>

                    {onOpenFlashcards && (
                      <button
                        onClick={() => handleDocOpenFlashcards(doc)}
                        className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-cyan-300 transition-colors cursor-pointer"
                        title={lang === 'fr' ? 'Flashcards' : 'Flashcards'}
                      >
                        <Layers className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter & Search Console */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3.5">
        
        {/* Row 1: Search with # Tag Autocomplete and Type filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          
          {/* Search Input with Tag Suggestion Popup */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="filter-search-input"
              type="text"
              value={searchFilter}
              onChange={(e) => {
                const val = e.target.value;
                setSearchFilter(val);
                setShowTagAutocomplete(val.includes('#'));
              }}
              onFocus={() => {
                if (searchFilter.includes('#')) setShowTagAutocomplete(true);
              }}
              placeholder={lang === 'fr' ? "Rechercher un cours, une matière, ou tapez # pour filtrer par tag..." : "Search documents, topics, or type # to filter by tag..."}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full bg-slate-50 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />

            {/* Tag Autocomplete Dropdown when user types '#' */}
            {showTagAutocomplete && matchingAutocompleteTags.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden p-1.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100 mb-1">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-indigo-500" />
                    {lang === 'fr' ? 'Labels suggérés' : 'Suggested labels'}
                  </span>
                  <button
                    onClick={() => setShowTagAutocomplete(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {matchingAutocompleteTags.map((tag) => {
                    const matchedCustom = customTags.find((ct) => ct.name.toLowerCase() === tag.toLowerCase());
                    const colorKey = matchedCustom?.color || 'indigo';
                    const style = TAG_COLORS[colorKey] || TAG_COLORS.indigo;
                    const isSelected = selectedTags.some((st) => st.toLowerCase() === tag.toLowerCase());
                    const count = documents.filter((d) => (d.tags || []).some((t) => t.toLowerCase() === tag.toLowerCase())).length;

                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleSelectAutocompleteTag(tag)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                          isSelected ? `${style.bg} font-bold ${style.text}` : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                          <span>#{tag}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {count} {lang === 'fr' ? 'cours' : 'notes'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Controls: Type filters + Grid/List View Mode Toggle */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            {/* Type filters */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  typeFilter === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'fr' ? 'Tous' : 'All'} ({documents.length})
              </button>
              <button
                onClick={() => setTypeFilter('note')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  typeFilter === 'note' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'fr' ? 'Notes' : 'Notes'} ({documents.filter(d => d.type !== 'pdf').length})
              </button>
              <button
                onClick={() => setTypeFilter('pdf')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  typeFilter === 'pdf' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                PDFs ({documents.filter(d => d.type === 'pdf').length})
              </button>
            </div>

            {/* Grid / List compact toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
              <button
                id="btn-view-mode-grid"
                onClick={() => handleSetViewMode('grid')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title={lang === 'fr' ? 'Vue Grille' : 'Grid View'}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                id="btn-view-mode-list"
                onClick={() => handleSetViewMode('list')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title={lang === 'fr' ? 'Vue Liste Compacte (Idéal mobile)' : 'Compact List View (Mobile-friendly)'}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Subject Collections Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 border-t border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0">
            {lang === 'fr' ? 'Matières :' : 'Subject:'}
          </span>
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedSubject === 'all'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {lang === 'fr' ? 'Toutes les matières' : 'All Collections'}
          </button>
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sub} ({documents.filter(d => d.subject === sub).length})
            </button>
          ))}
        </div>

        {/* Row 3: Tag Filtering Bar with Multi-tag support, Inline Create, and Tag Manager */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 flex-wrap">
          <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1 shrink-0">
            <Tag className="w-3 h-3 text-indigo-500" />
            <span>{lang === 'fr' ? 'Labels :' : 'Tags:'}</span>
          </div>

          <button
            onClick={() => setSelectedTags([])}
            className={`px-2.5 py-0.5 rounded-md text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedTags.length === 0
                ? 'bg-slate-800 text-white font-semibold shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {lang === 'fr' ? 'Tous les labels' : 'All Tags'}
          </button>

          {allTags.map((tag) => {
            const count = documents.filter(d => d.tags?.some(t => t.toLowerCase() === tag.toLowerCase())).length;
            const isSelected = selectedTags.some(st => st.toLowerCase() === tag.toLowerCase());
            const matchedCustom = customTags.find(ct => ct.name.toLowerCase() === tag.toLowerCase());
            const colorKey = matchedCustom?.color || 'indigo';
            const style = TAG_COLORS[colorKey] || TAG_COLORS.indigo;

            return (
              <button
                key={tag}
                onClick={() => toggleTagFilter(tag)}
                className={`px-2.5 py-0.5 rounded-md text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer ${
                  isSelected
                    ? `${style.bg} ${style.border} ${style.text} font-bold shadow-2xs ring-1 ring-indigo-400/40`
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                <span>#{tag}</span>
                <span className={`text-[10px] font-mono px-1 rounded-full ${isSelected ? 'bg-white/80 text-indigo-800' : 'text-slate-400'}`}>
                  {count}
                </span>
                {isSelected && <X className="w-3 h-3 ml-0.5" />}
              </button>
            );
          })}

          {/* Inline Quick Add Tag */}
          <form onSubmit={handleCreateInlineTag} className="inline-flex items-center gap-1 ml-auto shrink-0">
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">#</span>
              <input
                type="text"
                value={inlineNewTag}
                onChange={(e) => setInlineNewTag(e.target.value)}
                placeholder={lang === 'fr' ? 'Nouveau label...' : 'New tag...'}
                className="pl-5 pr-2 py-0.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-28 sm:w-32"
              />
            </div>
            <button
              type="submit"
              disabled={!inlineNewTag.trim()}
              className="p-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-md text-xs cursor-pointer"
              title={lang === 'fr' ? 'Créer ce label' : 'Create tag'}
            >
              <Plus className="w-3 h-3" />
            </button>
          </form>

          {/* Manage Tags Button */}
          <button
            onClick={() => setIsTagManagerOpen(true)}
            className="px-2 py-0.5 rounded-md text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/70 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
            title={lang === 'fr' ? 'Ouvrir le gestionnaire de labels' : 'Open label manager'}
          >
            <Sliders className="w-3 h-3 text-indigo-500" />
            <span>{lang === 'fr' ? 'Gérer' : 'Manage'}</span>
          </button>
        </div>

        {/* Active Filters Bar (if any filter is applied) */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-600">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-700">
                {lang === 'fr' ? 'Filtres actifs :' : 'Active Filters:'}
              </span>
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md font-medium text-[11px] flex items-center gap-1"
                >
                  Tag: #{tag}
                  <button onClick={() => toggleTagFilter(tag)} className="cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedSubject !== 'all' && (
                <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md font-medium text-[11px] flex items-center gap-1">
                  {lang === 'fr' ? 'Matière :' : 'Subject:'} {selectedSubject}
                  <button onClick={() => setSelectedSubject('all')} className="cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {typeFilter !== 'all' && (
                <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md font-medium text-[11px] flex items-center gap-1">
                  Type: {typeFilter.toUpperCase()}
                  <button onClick={() => setTypeFilter('all')} className="cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchFilter.trim() && (
                <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md font-medium text-[11px] flex items-center gap-1">
                  {lang === 'fr' ? 'Recherche :' : 'Search:'} &quot;{searchFilter}&quot;
                  <button onClick={() => setSearchFilter('')} className="cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <span className="text-slate-400 text-[11px]">
                ({filteredDocs.length} {lang === 'fr' ? (filteredDocs.length > 1 ? 'notes trouvées' : 'note trouvée') : (filteredDocs.length > 1 ? 'notes found' : 'note found')})
              </span>
            </div>

            <button
              onClick={clearAllFilters}
              className="text-indigo-600 hover:text-indigo-800 font-medium underline text-[11px] ml-2 shrink-0 cursor-pointer"
            >
              {lang === 'fr' ? 'Effacer tous les filtres' : 'Reset all'}
            </button>
          </div>
        )}
      </div>

      {/* Document Grid or Compact List */}
      {filteredDocs.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onOpenBlocknote={handleDocOpenBlocknote}
                onSummarize={handleDocSummarize}
                onEdit={handleDocEdit}
                onDelete={onDelete}
                onOpenFlashcards={handleDocOpenFlashcards}
                onOpenQuiz={handleDocOpenQuiz}
                onOpenBilingual={handleDocOpenBilingual}
                onOpenAnnotate={onOpenAnnotate}
                isSelectedForBlocknote={doc.id === selectedDocForBlocknoteId}
                lang={lang}
                allTags={allTags}
                customTags={customTags}
                onUpdateTags={onUpdateDocumentTags}
                onCreateTag={onCreateTag}
                onFilterByTag={(tag) => toggleTagFilter(tag)}
                onSendToPhone={onSendToPhone}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredDocs.map((doc) => {
              const isSelected = doc.id === selectedDocForBlocknoteId;
              return (
                <div
                  key={doc.id}
                  className={`bg-white rounded-xl p-3 sm:p-4 border transition-all ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Main Info */}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60 max-w-[200px] truncate">
                          {doc.subject}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {doc.type === 'pdf' ? 'PDF' : doc.type === 'word_docx' ? 'Word' : doc.type === 'excel_sheet' ? 'Excel' : 'Note'}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>{doc.date}</span>
                        </span>
                      </div>

                      <h3
                        onClick={() => handleDocOpenBlocknote(doc)}
                        className="text-sm sm:text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer break-words"
                      >
                        {doc.title}
                      </h3>

                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-0.5">
                          {doc.tags.map((t) => (
                            <button
                              key={t}
                              onClick={() => toggleTagFilter(t)}
                              className="text-[10px] font-medium text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100 px-1.5 py-0.5 rounded border border-indigo-200/40 cursor-pointer transition-colors"
                            >
                              #{t}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <button
                        onClick={() => handleDocOpenBlocknote(doc)}
                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                        title={lang === 'fr' ? 'Ouvrir dans le Cahier' : 'Open Notebook'}
                      >
                        <PenTool className="w-3.5 h-3.5 shrink-0" />
                        <span>{lang === 'fr' ? 'Cahier' : 'Notes'}</span>
                      </button>

                      <button
                        onClick={() => handleDocSummarize(doc)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border border-slate-200"
                        title={lang === 'fr' ? 'Générer le résumé' : 'Generate Summary'}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="hidden xs:inline">{lang === 'fr' ? 'Résumé' : 'Summary'}</span>
                      </button>

                      {onOpenAnnotate && (
                        <button
                          onClick={() => onOpenAnnotate(doc)}
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg transition-all cursor-pointer border border-amber-200"
                          title={lang === 'fr' ? 'Surligner & Dessiner (PDF)' : 'Highlight & Draw'}
                        >
                          <Highlighter className="w-4 h-4 text-amber-600 shrink-0" />
                        </button>
                      )}

                      {onOpenFlashcards && (
                        <button
                          onClick={() => handleDocOpenFlashcards(doc)}
                          className="p-1.5 bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-600 rounded-lg transition-all cursor-pointer border border-slate-200"
                          title={lang === 'fr' ? 'Fiches Flashcards' : 'Flashcards'}
                        >
                          <Layers className="w-4 h-4 text-cyan-600 shrink-0" />
                        </button>
                      )}

                      {onOpenQuiz && (
                        <button
                          onClick={() => handleDocOpenQuiz(doc)}
                          className="p-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-lg transition-all cursor-pointer border border-slate-200"
                          title={lang === 'fr' ? 'Quiz Active Recall' : 'Recall Quiz'}
                        >
                          <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                        </button>
                      )}

                      {onSendToPhone && (
                        <button
                          onClick={() => onSendToPhone(doc)}
                          className="p-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg transition-all cursor-pointer border border-slate-200"
                          title={lang === 'fr' ? 'Transférer sur Téléphone / PC' : 'Send to Phone / PC'}
                        >
                          <Smartphone className="w-4 h-4 text-indigo-500 shrink-0" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDocEdit(doc)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all cursor-pointer border border-slate-200"
                        title={lang === 'fr' ? 'Modifier' : 'Edit'}
                      >
                        <Edit3 className="w-4 h-4 shrink-0" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(lang === 'fr' ? `Supprimer "${doc.title}" ?` : `Delete "${doc.title}"?`)) {
                            onDelete(doc.id);
                          }
                        }}
                        className="p-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-lg transition-all cursor-pointer border border-slate-200"
                        title={lang === 'fr' ? 'Supprimer' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4 shrink-0" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center shadow-sm">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">
            {lang === 'fr' ? 'Aucun document correspondant' : 'No matching documents found'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {lang === 'fr'
              ? 'Essayez de modifier vos filtres ou vos termes de recherche, ou ajoutez un nouveau cours dans votre base PC.'
              : 'Try adjusting your search query or tag/collection filters, or add a new school note to your database.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                {lang === 'fr' ? 'Effacer les filtres' : 'Clear all filters'}
              </button>
            )}
            <button
              onClick={onNewNote}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              {lang === 'fr' ? '+ Nouvelle Note' : '+ Create Note'}
            </button>
            <button
              onClick={onUploadPdf}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              {lang === 'fr' ? '+ Importer un PDF' : '+ Upload PDF'}
            </button>
          </div>
        </div>
      )}

      {/* Tag Manager Modal */}
      <TagManagerModal
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
        customTags={customTags}
        documents={documents}
        onCreateTag={(newTag) => {
          if (onCreateTag) onCreateTag(newTag);
        }}
        onDeleteTag={(tagName) => {
          if (onDeleteTag) onDeleteTag(tagName);
          setSelectedTags((prev) => prev.filter((t) => t.toLowerCase() !== tagName.toLowerCase()));
        }}
        onSelectTagFilter={(tagName) => {
          toggleTagFilter(tagName);
        }}
        lang={lang}
      />
    </div>
  );
};

