import React, { useState, useEffect } from 'react';
import { SCHOOL_TEXTBOOKS_LIBRARY, SchoolTextbook, TextbookChapter, TextbookExercise } from '../data/schoolBooksLibrary';
import { OFFICIAL_HIGH_SCHOOL_TEXTBOOKS_CATALOG, GradeLevelCatalog } from '../data/officialSchoolCurriculum';
import { LANGUAGES_PEDAGOGICAL_ANTHOLOGY, LanguageCoursePage } from '../data/languagesAnthologyData';
import { AppLanguage, AppTheme } from '../types';
import { TextbookWorkoutEngine } from './TextbookWorkoutEngine';
import { SpanishCourseView } from './SpanishCourseView';
import { GermanCourseView } from './GermanCourseView';
import { ClassicalLanguagesView } from './ClassicalLanguagesView';
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  GraduationCap, 
  BookMarked, 
  Layers, 
  Lightbulb, 
  FileText, 
  ArrowLeft,
  Eye,
  EyeOff,
  Filter,
  Check,
  Zap,
  Tag,
  Compass,
  Bookmark,
  Languages,
  Landmark,
  Award,
  Keyboard,
  Edit3,
  Send,
  Clock,
  Timer
} from 'lucide-react';

export interface NotionSubjectWorkspaceMeta {
  id: 'espagnol' | 'allemand' | 'latin' | 'francais' | 'philosophie';
  title: string;
  subject: string;
  level: string;
  icon: string;
  tag: string;
  desc: string;
  gradient: string;
  topics: string[];
}

export const NOTION_SUBJECT_WORKSPACES: NotionSubjectWorkspaceMeta[] = [
  {
    id: 'francais',
    title: 'Cahier de Français & Méthodes Littéraires',
    subject: 'Français (2nde)',
    level: 'Seconde (Tronc Commun)',
    icon: '📚',
    tag: 'Commentaire & Dissertation',
    desc: 'Fiches Notion interactives : méthodologie pas à pas du commentaire composé, dissertation littéraire, figures de style et mouvements littéraires.',
    gradient: 'from-blue-600 via-indigo-800 to-slate-900',
    topics: ['Commentaire composé', 'Dissertation littéraire', 'Figures de style', 'Poésie & Théâtre'],
  },
  {
    id: 'philosophie',
    title: 'Atelier de Philosophie & Notions Fondatrices',
    subject: 'Philosophie (Tale)',
    level: 'Terminale (Toutes Séries)',
    icon: '🏛️',
    tag: 'Les 17 Notions & Citations',
    desc: 'Fiches Notion interactives : fiches sur les 17 notions du programme, repères conceptuels majeurs, citations analysées et plan type d\'explication de texte.',
    gradient: 'from-purple-700 via-violet-900 to-slate-900',
    topics: ['La Liberté', 'La Vérité & Science', 'Conscience & Inconscient', 'L\'État & Justice'],
  },
  {
    id: 'espagnol',
    title: 'Espace Notion Espagnol & Grammaire Hispanique',
    subject: 'Espagnol (Lycée)',
    level: 'LVA / LVB (Lycée)',
    icon: '🇪🇸',
    tag: 'Grammaire & Conjugaison',
    desc: 'Fiches Notion interactives : Ser vs Estar, temps du passé, subjonctif, verbes irréguliers et vocabulaire thématique.',
    gradient: 'from-rose-600 via-red-800 to-slate-900',
    topics: ['Ser et Estar', 'Le Subjonctif', 'Por vs Para', 'Passé Simple (Indefinido)'],
  },
  {
    id: 'allemand',
    title: 'Espace Notion Allemand & Déclinaisons Germaniques',
    subject: 'Allemand (Lycée)',
    level: 'LVA / LVB (Lycée)',
    icon: '🇩🇪',
    tag: 'Les 4 Cas & Verbes Forts',
    desc: 'Fiches Notion interactives : Nominatif, Accusatif, Datif, Génitif, verbes à particules séparables et connecteurs logiques.',
    gradient: 'from-amber-600 via-orange-800 to-slate-900',
    topics: ['Les 4 Déclinaisons', 'Verbes à Particule', 'Le Subjonctif II', 'Ordre des Mots'],
  },
  {
    id: 'latin',
    title: 'Atelier Latin & Humanités Classiques',
    subject: 'Latin & Antiquité',
    level: 'Option & Spécialité HLP',
    icon: '🏛️',
    tag: 'Déclinaisons & Civilisation',
    desc: 'Fiches Notion interactives : les 5 déclinaisons latines, ablatif absolu, étymologie des racines grecques et latines et textes traduits.',
    gradient: 'from-emerald-700 via-teal-900 to-slate-900',
    topics: ['Les 5 Déclinaisons', 'Système Verbal & Supin', 'L\'Ablatif Absolu', 'Étymologie'],
  },
];

// Circular progress indicator component with buttery smooth transition animations and live numerical interpolation
const CircularProgress: React.FC<{
  percent: number;
  size?: number;
  strokeWidth?: number;
  solvedCount?: number;
  totalCount?: number;
  showDetails?: boolean;
}> = ({ percent, size = 48, strokeWidth = 4, solvedCount, totalCount, showDetails = true }) => {
  const [displayPercent, setDisplayPercent] = useState(percent);
  const [isPulsing, setIsPulsing] = useState(false);
  const prevPercentRef = React.useRef(percent);

  React.useEffect(() => {
    if (prevPercentRef.current !== percent) {
      setIsPulsing(true);
      const pulseTimer = setTimeout(() => setIsPulsing(false), 700);

      // Smooth number counter animation
      const start = displayPercent;
      const end = Math.min(100, Math.max(0, percent));
      const duration = 650;
      const startTime = performance.now();

      let animationFrameId: number;
      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing out cubic
        const ease = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.round(start + (end - start) * ease);
        setDisplayPercent(currentVal);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else {
          setDisplayPercent(end);
        }
      };

      animationFrameId = requestAnimationFrame(step);
      prevPercentRef.current = percent;

      return () => {
        clearTimeout(pulseTimer);
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, [percent]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circumference - (clamped / 100) * circumference;
  const color =
    clamped >= 100
      ? '#10b981'
      : clamped > 60
      ? '#6366f1'
      : clamped > 30
      ? '#06b6d4'
      : clamped > 0
      ? '#f59e0b'
      : '#64748b';

  return (
    <div className="flex items-center gap-2 shrink-0">
      <div
        className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-500 ease-out ${
          isPulsing ? 'scale-110' : 'scale-100'
        }`}
        style={{ width: size, height: size }}
      >
        <svg
          className="w-full h-full -rotate-90 filter transition-all duration-700"
          style={{
            filter: isPulsing
              ? `drop-shadow(0 0 7px ${color})`
              : clamped > 0
              ? `drop-shadow(0 0 2px ${color}88)`
              : 'none',
          }}
          viewBox={`0 0 ${size} ${size}`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-black/40"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 850ms cubic-bezier(0.34, 1.4, 0.64, 1), stroke 500ms ease',
            }}
            fill="transparent"
          />
        </svg>
        <span
          className="absolute text-[10px] font-black tracking-tight transition-colors duration-300 flex items-center justify-center"
          style={{ color }}
        >
          {clamped === 100 ? '100%' : `${displayPercent}%`}
        </span>
      </div>
      {showDetails && solvedCount !== undefined && totalCount !== undefined && (
        <div className="text-left hidden sm:block">
          <div className="text-[9px] uppercase font-bold text-slate-300">Revu</div>
          <div className="text-[11px] font-extrabold text-white">
            {solvedCount}/{totalCount} ex.
          </div>
        </div>
      )}
    </div>
  );
};

interface SchoolBooksLibraryViewProps {
  lang?: AppLanguage;
  activeTheme?: AppTheme;
  onOpenDocInBlocknote?: (title: string, subject: string, content: string) => void;
  onOpenNotionWorkspace?: (subjectKey?: 'espagnol' | 'allemand' | 'latin' | 'francais' | 'philosophie') => void;
}

export const SchoolBooksLibraryView: React.FC<SchoolBooksLibraryViewProps> = ({
  lang = 'fr',
  activeTheme = 'light',
  onOpenDocInBlocknote,
  onOpenNotionWorkspace,
}) => {
  const isFr = lang === 'fr';

  // Sub-navigation tabs
  const [activeMainTab, setActiveMainTab] = useState<'workout' | 'exercises' | 'official_catalog' | 'languages'>('workout');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'textbooks' | 'notion'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedBook, setSelectedBook] = useState<SchoolTextbook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<TextbookChapter | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<TextbookExercise | null>(null);
  
  // Interactive exercise state
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});

  // Student written response and micro-redaction state
  const [userResponses, setUserResponses] = useState<Record<string, string>>({});
  const [keyboardLayout, setKeyboardLayout] = useState<'azerty' | 'qwerty'>('azerty');
  const [responseMode, setResponseMode] = useState<Record<string, 'reduced' | 'detailed'>>({});
  const [microGoal, setMicroGoal] = useState<Record<string, 'concise' | 'connectives' | 'steps'>>({});
  const [showTypingZone, setShowTypingZone] = useState<Record<string, boolean>>({});

  // Official catalog filters
  const [selectedGradeId, setSelectedGradeId] = useState<'all' | 'seconde' | 'premiere' | 'terminale'>('all');
  const [catalogSearch, setCatalogSearch] = useState('');

  // Languages tab state
  const [selectedLanguageId, setSelectedLanguageId] = useState<'anglais' | 'espagnol' | 'allemand' | 'antiquite'>('anglais');

  // Reading progress and bookmark state (bookId_chapterId -> { page, totalPages, isFinished })
  const [readingBookmarks, setReadingBookmarks] = useState<Record<string, { page: number; totalPages: number; isFinished?: boolean }>>({});
  const [readingSpeedMinsPerPage, setReadingSpeedMinsPerPage] = useState<number>(2);

  // Hydrate completed exercises and bookmarks client-side to prevent hydration mismatch
  useEffect(() => {
    try {
      const raw = localStorage.getItem('degreelocker_completed_exercises');
      if (raw) {
        setCompletedExercises(JSON.parse(raw));
      }
      const rawBookmarks = localStorage.getItem('degreelocker_reading_bookmarks');
      if (rawBookmarks) {
        setReadingBookmarks(JSON.parse(rawBookmarks));
      }
    } catch {}
  }, []);

  const saveReadingBookmark = (key: string, page: number, totalPages: number, isFinished = false) => {
    setReadingBookmarks(prev => {
      const next = {
        ...prev,
        [key]: { page: Math.min(totalPages, Math.max(1, page)), totalPages, isFinished }
      };
      try {
        localStorage.setItem('degreelocker_reading_bookmarks', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const toggleSolution = (exId: string) => {
    setRevealedSolutions(prev => ({ ...prev, [exId]: !prev[exId] }));
  };

  const toggleHint = (exId: string) => {
    setRevealedHints(prev => ({ ...prev, [exId]: !prev[exId] }));
  };

  const toggleExerciseComplete = (exId: string) => {
    setCompletedExercises(prev => {
      const next = { ...prev, [exId]: !prev[exId] };
      try {
        localStorage.setItem('degreelocker_completed_exercises', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Filter Notion workspaces matching search query and subject
  const filteredNotionWorkspaces = NOTION_SUBJECT_WORKSPACES.filter(w => {
    if (filterCategory === 'textbooks') return false;
    if (selectedSubject !== 'all') {
      const s = selectedSubject.toLowerCase();
      if (s.includes('français') && w.id !== 'francais') return false;
      if (s.includes('philosophie') && w.id !== 'philosophie') return false;
      if (s.includes('espagnol') && w.id !== 'espagnol') return false;
      if (s.includes('allemand') && w.id !== 'allemand') return false;
      if (s.includes('latin') && w.id !== 'latin') return false;
      if (!['français', 'philosophie', 'espagnol', 'allemand', 'latin'].some(k => s.includes(k))) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = w.title.toLowerCase().includes(q) || w.subject.toLowerCase().includes(q) || w.desc.toLowerCase().includes(q);
      const matchTopics = w.topics.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchTopics) return false;
    }
    return true;
  });

  // Filter books
  const filteredBooks = filterCategory === 'notion' ? [] : SCHOOL_TEXTBOOKS_LIBRARY.filter(book => {
    if (selectedSubject !== 'all' && !book.subject.toLowerCase().includes(selectedSubject.toLowerCase())) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = book.title.toLowerCase().includes(q) || book.subtitle.toLowerCase().includes(q);
      const matchChapter = book.chapters.some(c => 
        c.title.toLowerCase().includes(q) || 
        c.exercises.some(e => e.question.toLowerCase().includes(q) || e.title.toLowerCase().includes(q))
      );
      if (!matchTitle && !matchChapter) return false;
    }
    return true;
  });

  const handleExportToBlocknote = (exercise: TextbookExercise, chapter: TextbookChapter, book: SchoolTextbook) => {
    if (onOpenDocInBlocknote) {
      const formattedContent = `# ${book.title} - ${chapter.title}\n## Exercice ${exercise.number} : ${exercise.title}\n\n**Énoncé :**\n${exercise.question}\n\n**Formules Clés :**\n${(exercise.keyFormulas || []).map(f => `- ${f}`).join('\n')}\n\n**Solution Détaillée :**\n${exercise.solution.map(s => `Étape ${s.stepNumber} : ${s.explanation}\n${s.formulaOrCalculation ? `> ${s.formulaOrCalculation}\n` : ''}Résultat : ${s.result}`).join('\n\n')}`;
      onOpenDocInBlocknote(`${book.title} - Ex ${exercise.number}`, book.subject, formattedContent);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header Card with Quick Global Search Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 border border-indigo-700/50 text-white shadow-xl flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 font-black shrink-0">
              <BookOpen className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight text-white">
                  {isFr ? 'Bibliothèque de Manuels Scolaires & Exercices' : 'School Textbooks & Exercises Library'}
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  100% PC Direct
                </span>
              </div>
              <p className="text-xs text-indigo-200/90 mt-0.5">
                {isFr
                  ? 'Manuels officiels, cours structurés et annales d\'exercices corrigés pas à pas sans distraction multimédia.'
                  : 'Official curriculum textbooks, structured lessons, and step-by-step solved exercises.'}
              </p>
            </div>
          </div>

          {/* Global stats */}
          <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-2xl border border-white/10 self-stretch md:self-auto justify-between md:justify-start">
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase font-bold">{isFr ? 'Manuels' : 'Books'}</div>
              <div className="text-sm font-black text-amber-300">{SCHOOL_TEXTBOOKS_LIBRARY.length}</div>
            </div>
            <div className="h-6 w-[1px] bg-white/10 mx-1" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase font-bold">{isFr ? 'Exercices' : 'Exercises'}</div>
              <div className="text-sm font-black text-emerald-400">
                {SCHOOL_TEXTBOOKS_LIBRARY.reduce((acc, b) => acc + b.exercisesCount, 0)}
              </div>
            </div>
            <div className="h-6 w-[1px] bg-white/10 mx-1" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase font-bold">{isFr ? 'Complétés' : 'Solved'}</div>
              <div className="text-sm font-black text-indigo-300">
                {Object.values(completedExercises).filter(Boolean).length}
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated Search Bar in Header for Textbooks and Notion Workspaces */}
        <div className="pt-3 border-t border-indigo-800/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (val.trim() && activeMainTab !== 'exercises') {
                  setActiveMainTab('exercises');
                  setSelectedBook(null);
                }
              }}
              placeholder={
                isFr
                  ? '🔍 Filtrer les manuels et espaces Notion par titre ou matière (ex: Maths, Philo, Espagnol, Bac...)'
                  : '🔍 Filter textbooks and Notion workspaces by subject or title...'
              }
              className="w-full pl-10 pr-10 py-2.5 bg-black/40 border border-indigo-500/40 rounded-2xl text-xs sm:text-sm text-white placeholder:text-indigo-200/60 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800 cursor-pointer"
                title={isFr ? 'Effacer la recherche' : 'Clear search'}
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filter Categories in Header */}
          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            <button
              onClick={() => {
                setFilterCategory('all');
                if (activeMainTab !== 'exercises') {
                  setActiveMainTab('exercises');
                  setSelectedBook(null);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterCategory === 'all'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'bg-black/30 text-indigo-200 hover:text-white hover:bg-black/50 border border-white/10'
              }`}
            >
              {isFr ? 'Tout' : 'All'} ({filteredBooks.length + filteredNotionWorkspaces.length})
            </button>
            <button
              onClick={() => {
                setFilterCategory('textbooks');
                if (activeMainTab !== 'exercises') {
                  setActiveMainTab('exercises');
                  setSelectedBook(null);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterCategory === 'textbooks'
                  ? 'bg-indigo-600 text-white font-black shadow-md'
                  : 'bg-black/30 text-indigo-200 hover:text-white hover:bg-black/50 border border-white/10'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 inline mr-1" />
              {isFr ? 'Manuels' : 'Books'} ({filteredBooks.length})
            </button>
            <button
              onClick={() => {
                setFilterCategory('notion');
                if (activeMainTab !== 'exercises') {
                  setActiveMainTab('exercises');
                  setSelectedBook(null);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterCategory === 'notion'
                  ? 'bg-emerald-600 text-white font-black shadow-md'
                  : 'bg-black/30 text-indigo-200 hover:text-white hover:bg-black/50 border border-white/10'
              }`}
            >
              <Languages className="w-3.5 h-3.5 inline mr-1" />
              {isFr ? 'Espaces Notion' : 'Notion'} ({filteredNotionWorkspaces.length})
            </button>
          </div>
        </div>
      </div>

      {/* Global Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/60 rounded-2xl border border-white/5 overflow-x-auto scrollbar-thin">
        <button
          onClick={() => {
            setActiveMainTab('workout');
            setSelectedBook(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeMainTab === 'workout'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>{isFr ? 'Moteur d\'Exercices Personnalisés (Par Manuel)' : 'Personalized Workout Engine'}</span>
        </button>

        <button
          onClick={() => {
            setActiveMainTab('exercises');
            setSelectedBook(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeMainTab === 'exercises'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{isFr ? 'Manuels Numériques & Exercices' : 'Interactive Textbooks & Exercises'}</span>
        </button>

        <button
          onClick={() => setActiveMainTab('official_catalog')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeMainTab === 'official_catalog'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>{isFr ? 'Catalogue Officiel Lycée (2nde, 1ère, Tale)' : 'Official High School Textbooks Catalog'}</span>
        </button>

        <button
          onClick={() => setActiveMainTab('languages')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeMainTab === 'languages'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Languages className="w-4 h-4" />
          <span>{isFr ? 'Cours Exhaustifs de Langues (Espagnol, Allemand, Antiquité)' : 'Exhaustive Language Courses'}</span>
        </button>
      </div>

      {/* VIEW 0: WORKOUT ENGINE (Custom exercises generated from textbooks) */}
      {activeMainTab === 'workout' && (
        <div className="animate-in fade-in duration-200">
          <TextbookWorkoutEngine
            lang={lang}
            activeTheme={activeTheme}
            onOpenInBlocknote={onOpenDocInBlocknote}
            onNavigateToLanguage={(langId) => {
              setSelectedLanguageId(langId);
              setActiveMainTab('languages');
            }}
          />
        </div>
      )}

      {/* VIEW 2: OFFICIAL HIGH SCHOOL TEXTBOOKS CATALOG */}
      {activeMainTab === 'official_catalog' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Filters and search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/50 p-4 rounded-2xl border border-white/5">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder={isFr ? 'Rechercher matière, collection, éditeur...' : 'Search subject, collection, publisher...'}
                className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-thin">
              {[
                { id: 'all', label: isFr ? 'Tous les niveaux' : 'All Levels' },
                { id: 'seconde', label: 'Seconde (Tronc Commun)' },
                { id: 'premiere', label: 'Première' },
                { id: 'terminale', label: 'Terminale' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setSelectedGradeId(lvl.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedGradeId === lvl.id
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Level Sections */}
          <div className="space-y-8">
            {OFFICIAL_HIGH_SCHOOL_TEXTBOOKS_CATALOG
              .filter(grade => selectedGradeId === 'all' || grade.gradeId === selectedGradeId)
              .map(grade => {
                return (
                  <div key={grade.gradeId} className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-black text-amber-300 flex items-center gap-2">
                          <Bookmark className="w-5 h-5 text-amber-400" />
                          {grade.gradeTitle}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">{grade.gradeDescription}</p>
                      </div>
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 self-start md:self-auto">
                        Programmes Officiels
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {grade.sections.flatMap(section => 
                        section.items
                          .filter(item => {
                            if (!catalogSearch.trim()) return true;
                            const q = catalogSearch.toLowerCase();
                            return (
                              item.subject.toLowerCase().includes(q) ||
                              item.collections.toLowerCase().includes(q) ||
                              item.publishers.some(p => p.toLowerCase().includes(q))
                            );
                          })
                          .map((item, idx) => (
                            <div
                              key={`${grade.gradeId}-${idx}`}
                              className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <h4 className="text-sm font-extrabold text-white">{item.subject}</h4>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                    item.track === 'tronc_commun'
                                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                      : item.track === 'specialite'
                                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  }`}>
                                    {item.track === 'tronc_commun' ? 'Tronc Commun' : item.track === 'specialite' ? 'Spécialité' : 'Option'}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-300 leading-relaxed font-medium">
                                  <span className="text-slate-400 font-semibold">{isFr ? 'Collections :' : 'Collections:'} </span>
                                  {item.collections}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
                                <span className="text-[10px] text-slate-400 font-semibold">{isFr ? 'Éditeurs :' : 'Publishers:'}</span>
                                {item.publishers.map(pub => (
                                  <span
                                    key={pub}
                                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
                                  >
                                    {pub}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* VIEW 3: LANGUAGES PEDAGOGICAL ANTHOLOGY */}
      {activeMainTab === 'languages' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Sub-selector for the three language programs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {LANGUAGES_PEDAGOGICAL_ANTHOLOGY.map((course) => (
              <button
                key={course.id}
                onClick={() => setSelectedLanguageId(course.id)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedLanguageId === course.id
                    ? 'bg-slate-800 text-white border-2 border-emerald-500 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900/50 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800/60'
                }`}
              >
                <span className="text-lg">{course.flagOrIcon}</span>
                <div className="text-left">
                  <div className="font-extrabold text-white">{course.title}</div>
                  <div className="text-[10px] text-slate-400">{course.levelSpan}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Active Language Course Content */}
          {selectedLanguageId === 'espagnol' && (
            <SpanishCourseView 
              lang={lang} 
              activeTheme={activeTheme} 
              onOpenInBlocknote={onOpenDocInBlocknote} 
            />
          )}

          {selectedLanguageId === 'allemand' && (
            <GermanCourseView 
              lang={lang} 
              activeTheme={activeTheme} 
              onOpenInBlocknote={onOpenDocInBlocknote} 
            />
          )}

          {selectedLanguageId === 'antiquite' && (
            <ClassicalLanguagesView 
              lang={lang} 
              activeTheme={activeTheme} 
              onOpenInBlocknote={onOpenDocInBlocknote} 
            />
          )}
        </div>
      )}

      {/* VIEW 1: BOOK SELECTION GRID & EXERCISES */}
      {activeMainTab === 'exercises' && (
        <>
          {/* Navigation Breadcrumb if in book view */}
          {selectedBook && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <button
                onClick={() => {
                  setSelectedBook(null);
                  setSelectedChapter(null);
                  setSelectedExercise(null);
                }}
                className="hover:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isFr ? 'Tous les manuels' : 'All Textbooks'}</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-slate-200 font-bold truncate">{selectedBook.title}</span>
              {selectedChapter && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-indigo-300 truncate">{selectedChapter.title}</span>
                </>
              )}
            </div>
          )}

      {/* VIEW 1: BOOK SELECTION GRID */}
      {!selectedBook && (
        <div className="space-y-6">
          {/* Enhanced Search and Dual Filters (Books & Notion Workspaces) */}
          <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isFr ? 'Rechercher un manuel, une notion, un espace Notion (Espagnol, Philo, Latin...) ou un exercice...' : 'Search textbooks, concepts, Notion workspaces, or exercises...'}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700/90 rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Filter Pills: All / Textbooks / Notion */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin shrink-0">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterCategory === 'all'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {isFr ? 'Tout afficher' : 'All'}
                </button>
                <button
                  onClick={() => setFilterCategory('textbooks')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterCategory === 'textbooks'
                      ? 'bg-indigo-600 text-white font-black shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 inline mr-1" />
                  {isFr ? 'Manuels' : 'Books'}
                </button>
                <button
                  onClick={() => setFilterCategory('notion')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterCategory === 'notion'
                      ? 'bg-emerald-600 text-white font-black shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Languages className="w-3.5 h-3.5 inline mr-1" />
                  {isFr ? 'Espaces Notion' : 'Notion'}
                </button>
              </div>
            </div>

            {/* Subject Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 scrollbar-thin pt-1 border-t border-slate-800/80">
              {[
                { id: 'all', label: isFr ? 'Toutes les matières' : 'All Subjects' },
                { id: 'Français', label: '📚 Français (2nde)' },
                { id: 'Philosophie', label: '🏛️ Philosophie (Tale)' },
                { id: 'Mathématiques', label: '📐 Mathématiques' },
                { id: 'Physique-Chimie', label: '⚡ Physique-Chimie' },
                { id: 'SVT', label: '🧬 SVT & Biologie' },
                { id: 'Histoire-Géographie', label: '🌍 Histoire-Géo' },
                { id: 'Espagnol', label: '🇪🇸 Espagnol' },
                { id: 'Allemand', label: '🇩🇪 Allemand' },
                { id: 'Latin', label: '🏛️ Latin' },
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedSubject === sub.id
                      ? 'bg-indigo-600 text-white shadow-md border border-indigo-400/40'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION: MATCHING NOTION WORKSPACES (If any) */}
          {filteredNotionWorkspaces.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  <span>{isFr ? 'Espaces Notion Spécialisés Associés' : 'Matching Notion Workspaces'}</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {filteredNotionWorkspaces.length} {isFr ? 'espaces trouvés' : 'workspaces'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNotionWorkspaces.map((notion) => (
                  <div
                    key={notion.id}
                    className="p-4 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 transition-all flex flex-col justify-between gap-3 shadow-lg group hover:scale-[1.01]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{notion.icon}</span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {notion.level}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors">
                        {notion.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {notion.desc}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {notion.topics.slice(0, 3).map((t, idx) => (
                          <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-amber-300 font-bold uppercase">{notion.tag}</span>
                      <button
                        onClick={() => onOpenNotionWorkspace && onOpenNotionWorkspace(notion.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-md cursor-pointer"
                      >
                        <span>{isFr ? 'Ouvrir l\'Espace Notion' : 'Open Workspace'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: TEXTBOOKS GRID WITH CIRCULAR PROGRESS */}
          {filteredBooks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>{isFr ? 'Manuels Scolaires Officiels & Exercices Corrigés' : 'Official Textbooks & Worked Solutions'}</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {filteredBooks.length} {isFr ? 'manuels' : 'textbooks'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredBooks.map((book) => {
                  const solvedExercises = book.chapters.reduce((acc, chap) => 
                    acc + chap.exercises.filter(ex => completedExercises[ex.id]).length, 0);
                  const totalExercises = book.exercisesCount || book.chapters.reduce((acc, chap) => acc + chap.exercises.length, 0);
                  const progressPercent = totalExercises > 0 ? Math.min(100, Math.round((solvedExercises / totalExercises) * 100)) : 0;

                  return (
                    <div
                      key={book.id}
                      onClick={() => {
                        setSelectedBook(book);
                        setSelectedChapter(book.chapters[0] || null);
                      }}
                      className="group p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 transition-all flex flex-col justify-between shadow-lg hover:shadow-2xl hover:scale-[1.01] cursor-pointer"
                    >
                      <div>
                        {/* Book Banner with Circular Progress Indicator */}
                        <div className={`w-full rounded-2xl bg-gradient-to-r ${book.coverColor} p-4 flex flex-col justify-between text-white shadow-inner relative overflow-hidden mb-4`}>
                          <div className="absolute right-[-10px] bottom-[-10px] opacity-15 rotate-12">
                            <BookOpen className="w-24 h-24 text-white" />
                          </div>
                          
                          <div className="flex items-center justify-between z-10">
                            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-black/50 border border-white/20">
                              {book.gradeLevel}
                            </span>
                            {/* Circular progress indicator showing material review completion */}
                            <div className="bg-black/50 p-1.5 rounded-2xl border border-white/10 shadow-xs">
                              <CircularProgress
                                percent={progressPercent}
                                size={44}
                                strokeWidth={4}
                                solvedCount={solvedExercises}
                                totalCount={totalExercises}
                              />
                            </div>
                          </div>

                          <div className="mt-3 z-10">
                            <h3 className="font-extrabold text-sm sm:text-base leading-tight drop-shadow-md">
                              {book.title}
                            </h3>
                            <span className="text-[10px] font-bold text-amber-200">
                              {book.edition}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                          {book.subtitle}
                        </p>

                        {/* Chapters Preview */}
                        <div className="space-y-1.5 mb-4">
                          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            {isFr ? 'Sommaire des chapitres :' : 'Chapters :'}
                          </div>
                          {book.chapters.map((chap) => {
                            const chapSolved = chap.exercises.filter(e => completedExercises[e.id]).length;
                            return (
                              <div key={chap.id} className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/40 p-2 rounded-xl border border-white/5">
                                <span className="truncate flex-1">
                                  <span className="font-bold text-indigo-400 mr-1.5">Ch {chap.chapterNumber}.</span>
                                  {chap.title}
                                </span>
                                <span className="text-[10px] font-mono text-amber-300 shrink-0 ml-2">
                                  {chapSolved > 0 ? `${chapSolved}/${chap.exercises.length}` : `${chap.exercises.length} ex`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-400 font-mono">
                            {book.chaptersCount} Ch. • {book.exercisesCount} Ex.
                          </span>
                          {progressPercent > 0 && (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                              progressPercent === 100
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {progressPercent}%
                            </span>
                          )}
                        </div>
                        <button className="px-3.5 py-1.5 rounded-xl bg-indigo-600 group-hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-md">
                          <span>{isFr ? 'Ouvrir le Manuel' : 'Open Textbook'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {filteredBooks.length === 0 && filteredNotionWorkspaces.length === 0 && (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <Search className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="text-sm font-bold text-white">
                {isFr ? 'Aucun résultat trouvé pour votre recherche' : 'No textbooks or Notion workspaces found'}
              </div>
              <p className="text-xs text-slate-400">
                {isFr ? 'Essayez de rechercher "Maths", "Espagnol", "Philosophie" ou réinitialisez les filtres.' : 'Try searching another subject or clear the filters.'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubject('all');
                  setFilterCategory('all');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
              >
                {isFr ? 'Réinitialiser la recherche' : 'Clear search'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: INSIDE SELECTED BOOK (CHAPTERS & EXERCISES WORKSPACE) */}
      {selectedBook && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Chapters Navigation (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>{isFr ? 'Chapitres du Manuel' : 'Textbook Chapters'}</span>
              </h3>

              <div className="space-y-2">
                {selectedBook.chapters.map((chap) => {
                  const bookmarkKey = `${selectedBook.id}_${chap.id}`;
                  const bookmark = readingBookmarks[bookmarkKey];
                  const totalChapPages = 20; // Default estimate per chapter
                  const curPage = bookmark ? bookmark.page : 1;
                  const isFinished = bookmark?.isFinished || false;
                  const chapProgress = isFinished ? 100 : Math.round((curPage / totalChapPages) * 100);

                  return (
                    <button
                      key={chap.id}
                      onClick={() => {
                        setSelectedChapter(chap);
                        setSelectedExercise(chap.exercises[0] || null);
                      }}
                      className={`w-full text-left p-3 rounded-2xl transition-all border cursor-pointer ${
                        selectedChapter?.id === chap.id
                          ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-950/50 border-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold">
                          Chapitre {chap.chapterNumber}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {bookmark && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              p.{curPage} ({chapProgress}%)
                            </span>
                          )}
                          <span className="text-[10px] text-amber-300 font-bold">
                            {chap.exercises.length} {isFr ? 'ex.' : 'ex.'}
                          </span>
                        </div>
                      </div>
                      <div className="font-bold text-xs sm:text-sm leading-snug">
                        {chap.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* READING PROGRESS & BOOKMARK TRACKER */}
            {selectedChapter && (() => {
              const bookmarkKey = `${selectedBook.id}_${selectedChapter.id}`;
              const bookmark = readingBookmarks[bookmarkKey];
              const totalChapPages = 20;
              const curPage = bookmark ? bookmark.page : 1;
              const isFinished = bookmark?.isFinished || false;
              const readPercent = isFinished ? 100 : Math.min(100, Math.round((curPage / totalChapPages) * 100));
              const pagesLeft = Math.max(0, totalChapPages - curPage);
              const estMinsLeft = isFinished ? 0 : pagesLeft * readingSpeedMinsPerPage;

              return (
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Bookmark className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{isFr ? 'Marque-Page & Lecture' : 'Reading Bookmark'}</span>
                    </h4>
                    <span className="text-[10px] font-bold text-indigo-300">
                      {isFinished ? (isFr ? 'Terminé 🎉' : 'Done 🎉') : `${readPercent}%`}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        isFinished ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-amber-500'
                      }`}
                      style={{ width: `${readPercent}%` }}
                    />
                  </div>

                  {/* Page Controls */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-300 font-bold">
                      {isFr ? `Page ${curPage} / ${totalChapPages}` : `Page ${curPage} of ${totalChapPages}`}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => saveReadingBookmark(bookmarkKey, curPage - 1, totalChapPages, false)}
                        disabled={curPage <= 1}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold flex items-center justify-center cursor-pointer"
                        title="-1 page"
                      >
                        -
                      </button>
                      <button
                        onClick={() => saveReadingBookmark(bookmarkKey, curPage + 1, totalChapPages, curPage + 1 >= totalChapPages)}
                        disabled={curPage >= totalChapPages}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold flex items-center justify-center cursor-pointer"
                        title="+1 page"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Time Remaining Estimation */}
                  <div className="flex items-center justify-between text-[11px] text-slate-300 pt-2 border-t border-indigo-900/50">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{isFr ? 'Temps restant estimé :' : 'Est. time left:'}</span>
                    </span>
                    <span className="font-extrabold text-amber-300">
                      {isFinished ? (isFr ? '0 min' : '0 min') : `~${estMinsLeft} min (${pagesLeft} pages)`}
                    </span>
                  </div>

                  {/* Mark as Finished button */}
                  <button
                    onClick={() => saveReadingBookmark(bookmarkKey, totalChapPages, totalChapPages, !isFinished)}
                    className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isFinished
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/50'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isFinished ? (isFr ? 'Chapitre Lu (Décocher)' : 'Finished (Uncheck)') : (isFr ? 'Marquer chapitre comme lu' : 'Mark as Read')}</span>
                  </button>
                </div>
              );
            })()}

            {/* Chapter Summary Card */}
            {selectedChapter && (
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4" />
                  <span>{isFr ? 'Notions Clés du Chapitre' : 'Key Chapter Concepts'}</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedChapter.summary}
                </p>
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  {selectedChapter.keyConcepts.map((kc, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{kc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Exercises & Step-by-Step Solutions (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {selectedChapter ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white">
                      {selectedChapter.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isFr
                        ? `${selectedChapter.exercises.length} exercices d'application directe et de type épreuve`
                        : `${selectedChapter.exercises.length} practical exercises & exam-style problems`}
                    </p>
                  </div>
                </div>

                {/* Exercises List */}
                <div className="space-y-5">
                  {selectedChapter.exercises.map((ex) => {
                    const isSolved = !!completedExercises[ex.id];
                    const isSolRevealed = !!revealedSolutions[ex.id];
                    const isHintRevealed = !!revealedHints[ex.id];

                    return (
                      <div
                        key={ex.id}
                        className={`p-5 rounded-3xl border transition-all ${
                          isSolved
                            ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg'
                            : 'bg-slate-900 border-slate-800 shadow-md'
                        }`}
                      >
                        {/* Header of Exercise */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
                              #{ex.number}
                            </span>
                            <h4 className="font-bold text-sm text-white">
                              {ex.title}
                            </h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              ex.difficulty === 'easy'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : ex.difficulty === 'medium'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            }`}>
                              {ex.difficulty.toUpperCase()}
                            </span>
                          </div>

                          <button
                            onClick={() => toggleExerciseComplete(ex.id)}
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${
                              isSolved
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                                : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                            }`}
                            title={isSolved ? (isFr ? 'Marqué comme réussi' : 'Marked as solved') : (isFr ? 'Marquer comme réussi' : 'Mark as solved')}
                          >
                            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </div>

                        {/* Question Text */}
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans mb-4">
                          {ex.question}
                        </div>

                        {/* Key Formulas */}
                        {ex.keyFormulas && ex.keyFormulas.length > 0 && (
                          <div className="mb-4 p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                              {isFr ? 'Formules Clés / Propriétés :' : 'Key Formulas :'}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {ex.keyFormulas.map((f, idx) => (
                                <span key={idx} className="font-mono text-xs px-2 py-0.5 rounded-md bg-indigo-900/50 text-indigo-200 border border-indigo-400/20">
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons: Hint, Solution, Blocknote */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                          {/* Hint Toggle */}
                          {ex.hints.length > 0 && (
                            <button
                              onClick={() => toggleHint(ex.id)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                              <span>{isHintRevealed ? (isFr ? 'Masquer Indice' : 'Hide Hint') : (isFr ? 'Indice de Résolution' : 'Show Hint')}</span>
                            </button>
                          )}

                          {/* Solution Reveal Toggle */}
                          <button
                            onClick={() => toggleSolution(ex.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                          >
                            {isSolRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span>{isSolRevealed ? (isFr ? 'Masquer Corrigé' : 'Hide Solution') : (isFr ? 'Voir Corrigé Détaillé' : 'View Full Solution')}</span>
                          </button>

                          {/* Export to Blocknote */}
                          {onOpenDocInBlocknote && (
                            <button
                              onClick={() => handleExportToBlocknote(ex, selectedChapter, selectedBook)}
                              className="px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all border border-amber-400/30 cursor-pointer ml-auto"
                              title={isFr ? 'Copier cet exercice vers le Bloc-Notes Cahier' : 'Copy exercise to Blocknote'}
                            >
                              <FileText className="w-3.5 h-3.5 text-amber-300" />
                              <span>{isFr ? 'Exporter en Fiche Cahier' : 'Export to Blocknote'}</span>
                            </button>
                          )}
                        </div>

                        {/* Student Interactive Answer & Micro-Rédaction Area */}
                        <div className="mt-3 pt-3 border-t border-slate-800 space-y-2.5">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <button
                              onClick={() => setShowTypingZone(prev => ({ ...prev, [ex.id]: !prev[ex.id] }))}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                                showTypingZone[ex.id]
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                              }`}
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                              <span>{showTypingZone[ex.id] ? (isFr ? 'Masquer la saisie' : 'Hide Typing') : (isFr ? '✍️ Rédiger ma réponse / Entraînement Micro-Rédaction' : '✍️ Type My Answer / Micro-Training')}</span>
                            </button>

                            {showTypingZone[ex.id] && (
                              <div className="flex items-center gap-2">
                                {/* Format toggle: Réduite vs Détaillée */}
                                <div className="inline-flex rounded-xl bg-slate-950 p-0.5 border border-slate-800 text-[11px] font-bold">
                                  <button
                                    onClick={() => setResponseMode(prev => ({ ...prev, [ex.id]: 'reduced' }))}
                                    className={`px-2.5 py-1 rounded-lg transition-all ${
                                      (responseMode[ex.id] || 'reduced') === 'reduced'
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'text-slate-400 hover:text-white'
                                    }`}
                                  >
                                    {isFr ? 'Réponse Réduite' : 'Short Answer'}
                                  </button>
                                  <button
                                    onClick={() => setResponseMode(prev => ({ ...prev, [ex.id]: 'detailed' }))}
                                    className={`px-2.5 py-1 rounded-lg transition-all ${
                                      responseMode[ex.id] === 'detailed'
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'text-slate-400 hover:text-white'
                                    }`}
                                  >
                                    {isFr ? 'Rédaction Développée' : 'Full Essay'}
                                  </button>
                                </div>

                                {/* Keyboard layout toggle */}
                                <button
                                  onClick={() => setKeyboardLayout(prev => prev === 'azerty' ? 'qwerty' : 'azerty')}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-mono font-bold text-slate-300 hover:text-white cursor-pointer"
                                  title="Basculer disposition clavier AZERTY / QWERTY"
                                >
                                  {keyboardLayout.toUpperCase()}
                                </button>
                              </div>
                            )}
                          </div>

                          {showTypingZone[ex.id] && (
                            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2.5 animate-in fade-in duration-150">
                              {/* Micro-training goal selector */}
                              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                                  <Timer className="w-3.5 h-3.5" />
                                  <span>{isFr ? 'Objectif micro-rédaction :' : 'Micro-target:'}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-1">
                                  {[
                                    { id: 'concise', label: isFr ? 'Moins de 40 mots' : '< 40 words' },
                                    { id: 'connectives', label: isFr ? '2 connecteurs logiques' : 'Logical connectives' },
                                    { id: 'steps', label: isFr ? 'Démonstration + Résultat' : 'Proof + Result' },
                                  ].map((goal) => (
                                    <button
                                      key={goal.id}
                                      onClick={() => setMicroGoal(prev => ({ ...prev, [ex.id]: goal.id as any }))}
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                                        (microGoal[ex.id] || 'concise') === goal.id
                                          ? 'bg-amber-400 text-slate-950 font-black'
                                          : 'bg-slate-900 text-slate-400 hover:text-white'
                                      }`}
                                    >
                                      {goal.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Keyboard Quick Accents bar */}
                              <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none text-xs">
                                <span className="text-[10px] font-mono text-slate-400 mr-1">{keyboardLayout.toUpperCase()}:</span>
                                {(keyboardLayout === 'azerty' 
                                  ? ['é', 'è', 'à', 'ç', 'â', 'ê', 'î', 'ô', 'û', 'œ', '«', '»', '≈', '≠', '≤', '≥']
                                  : ['é', 'è', 'à', 'ç', 'ñ', 'ü', 'ß', '¿', '¡', 'ä', 'ö', '≈', '≠', '≤', '≥']
                                ).map((char, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setUserResponses(prev => ({ ...prev, [ex.id]: (prev[ex.id] || '') + char }))}
                                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-mono text-xs cursor-pointer active:scale-90"
                                  >
                                    {char}
                                  </button>
                                ))}
                              </div>

                              {/* Textarea */}
                              <textarea
                                rows={(responseMode[ex.id] || 'reduced') === 'reduced' ? 3 : 5}
                                value={userResponses[ex.id] || ''}
                                onChange={(e) => setUserResponses(prev => ({ ...prev, [ex.id]: e.target.value }))}
                                placeholder={
                                  (responseMode[ex.id] || 'reduced') === 'reduced'
                                    ? (isFr ? 'Rédigez une réponse concise et synthétique (ex : formule + résultat encadré)...' : 'Write a short and synthetic answer...')
                                    : (isFr ? 'Développez ici votre argumentation complète avec justifications étape par étape...' : 'Write your detailed step-by-step reasoning...')
                                }
                                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 font-sans leading-relaxed"
                              />

                              {/* Live feedback counter and submission button */}
                              <div className="flex items-center justify-between text-xs pt-1">
                                <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                                  <span>
                                    {isFr ? 'Mots :' : 'Words:'}{' '}
                                    <strong className="text-white">
                                      {(userResponses[ex.id] || '').trim() ? (userResponses[ex.id] || '').trim().split(/\s+/).length : 0}
                                    </strong>
                                  </span>
                                  {['donc', 'ainsi', 'or', 'car', 'en effet', 'par conséquent', 'alors'].some(c => (userResponses[ex.id] || '').toLowerCase().includes(c)) && (
                                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                                      <Check className="w-3 h-3" />
                                      {isFr ? 'Connecteur logique validé' : 'Logical connector ok'}
                                    </span>
                                  )}
                                </div>

                                <button
                                  onClick={() => {
                                    toggleExerciseComplete(ex.id);
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    isSolved
                                      ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                                      : 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-black'
                                  }`}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{isSolved ? (isFr ? 'Validé & Résolu ✓' : 'Solved ✓') : (isFr ? 'Valider ma réponse' : 'Submit & Complete')}</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Hints Box */}
                        {isHintRevealed && (
                          <div className="mt-3 p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2 animate-in fade-in duration-150">
                            <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{isFr ? 'Indication Méthodique :' : 'Hint:'}</span>
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                              {ex.hints.map((h, i) => (
                                <li key={i}>{h}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Step-by-Step Solved Solution Box */}
                        {isSolRevealed && (
                          <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                              <h5 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>{isFr ? 'Corrigé Pas-à-Pas Officiel' : 'Step-by-Step Solution'}</span>
                              </h5>
                              <span className="text-[10px] font-mono text-slate-400">
                                {ex.solution.length} {isFr ? 'étapes' : 'steps'}
                              </span>
                            </div>

                            <div className="space-y-3">
                              {ex.solution.map((sol) => (
                                <div key={sol.stepNumber} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                                  <div className="text-xs font-bold text-amber-300">
                                    Étape {sol.stepNumber} :
                                  </div>
                                  <p className="text-xs text-slate-200 leading-relaxed">
                                    {sol.explanation}
                                  </p>
                                  {sol.formulaOrCalculation && (
                                    <div className="p-2 rounded-lg bg-black/60 font-mono text-xs text-indigo-300 border border-indigo-400/20">
                                      {sol.formulaOrCalculation}
                                    </div>
                                  )}
                                  <div className="text-xs font-semibold text-emerald-400">
                                    ✓ {sol.result}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/40 text-slate-400">
                <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p>{isFr ? 'Sélectionnez un chapitre dans la liste à gauche.' : 'Select a chapter on the left to view exercises.'}</p>
              </div>
            )}
          </div>

        </div>
      )}
      </>
      )}

    </div>
  );
};
