import React, { useState, useEffect } from 'react';
import { SchoolDocument, AppLanguage, AppTheme } from '../types';
import { calculateReadingTime } from '../utils/readingTime';
import { DailyStudyGoals } from './DailyStudyGoals';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  PenTool, 
  Brain, 
  Zap, 
  Languages, 
  Database, 
  FileText, 
  Upload, 
  Plus, 
  Quote, 
  Clock, 
  FolderCheck, 
  Star, 
  GraduationCap, 
  HardDrive, 
  ChevronRight,
  Atom,
  Flame,
  Globe2,
  FileSpreadsheet,
  FileCode,
  Layers,
  ArrowUpRight,
  Inbox,
  HelpCircle,
  CheckCircle2,
  Lightbulb,
  Repeat,
  Calendar,
  BarChart3,
  TrendingUp,
  Award,
  Check,
  Palette as PaletteIcon,
  Pin,
  PinOff,
  Copy,
  CheckCheck,
  X,
  Bookmark,
  StickyNote,
  Download,
  Laptop,
  Crown,
  Server,
  RefreshCw,
  Target,
  Headphones
} from 'lucide-react';
import { useDownloadWindowsExe } from '../hooks/useDownloadWindowsExe';
import { soundFx } from '../utils/soundEffects';

interface DashboardOverviewProps {
  documents: SchoolDocument[];
  onNavigateTab: (tab: any) => void;
  onSelectDoc: (doc: SchoolDocument) => void;
  onOpenNewNote: () => void;
  onOpenUpload: () => void;
  onOpenBackup?: () => void;
  onOpenTutorial?: () => void;
  onOpenTips?: () => void;
  onOpenCredits?: () => void;
  onFilterSubject?: (subject: string) => void;
  onTogglePinDoc?: (id: string) => void;
  onQuickCreatePinnedNote?: (note: Partial<SchoolDocument>) => Promise<SchoolDocument | void>;
  onOpenInstallGuide?: () => void;
  onOpenSyncManager?: () => void;
  onOpenSoundHUD?: () => void;
  lang: AppLanguage;
  activeTheme?: AppTheme;
}

// Subject icons & theme mappings
const DEFAULT_SUBJECT_META = { icon: BookOpen, color: 'text-indigo-400', bg: 'bg-indigo-950/60 border-indigo-800/60', defaultMastery: 75 };

const SUBJECT_METADATA: Record<string, { icon: any; color: string; bg: string; defaultMastery: number }> = {
  'General': DEFAULT_SUBJECT_META,
  'Général': DEFAULT_SUBJECT_META,
  'Biologie': { icon: Globe2, color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-800/60', defaultMastery: 85 },
  'SVT': { icon: Globe2, color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-800/60', defaultMastery: 85 },
  'Physique-Chimie': { icon: Atom, color: 'text-cyan-400', bg: 'bg-cyan-950/60 border-cyan-800/60', defaultMastery: 80 },
  'Physique': { icon: Atom, color: 'text-cyan-400', bg: 'bg-cyan-950/60 border-cyan-800/60', defaultMastery: 80 },
  'Chimie': { icon: Atom, color: 'text-cyan-400', bg: 'bg-cyan-950/60 border-cyan-800/60', defaultMastery: 80 },
  'Histoire & Géo': { icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-800/60', defaultMastery: 40 },
  'Histoire-Géographie': { icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-800/60', defaultMastery: 40 },
  'Histoire': { icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-800/60', defaultMastery: 65 },
  'Géographie': { icon: Globe2, color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-800/60', defaultMastery: 65 },
  'Mathématiques': { icon: FileCode, color: 'text-indigo-400', bg: 'bg-indigo-950/60 border-indigo-800/60', defaultMastery: 92 },
  'Maths': { icon: FileCode, color: 'text-indigo-400', bg: 'bg-indigo-950/60 border-indigo-800/60', defaultMastery: 92 },
  'Philosophie': { icon: Lightbulb, color: 'text-purple-400', bg: 'bg-purple-950/60 border-purple-800/60', defaultMastery: 70 },
  'Philo': { icon: Lightbulb, color: 'text-purple-400', bg: 'bg-purple-950/60 border-purple-800/60', defaultMastery: 70 },
  'Français': { icon: BookOpen, color: 'text-rose-400', bg: 'bg-rose-950/60 border-rose-800/60', defaultMastery: 78 },
  'Littérature': { icon: BookOpen, color: 'text-rose-400', bg: 'bg-rose-950/60 border-rose-800/60', defaultMastery: 78 },
  'Anglais': { icon: Languages, color: 'text-rose-400', bg: 'bg-rose-950/60 border-rose-800/60', defaultMastery: 88 },
  'Espagnol': { icon: Languages, color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-800/60', defaultMastery: 75 },
  'Allemand': { icon: Languages, color: 'text-red-400', bg: 'bg-red-950/60 border-red-800/60', defaultMastery: 70 },
  'Informatique': { icon: FileCode, color: 'text-blue-400', bg: 'bg-blue-950/60 border-blue-800/60', defaultMastery: 85 },
  'Économie': { icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-800/60', defaultMastery: 72 },
  'SES': { icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-800/60', defaultMastery: 72 },
  'Droit': { icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-800/60', defaultMastery: 68 },
};

// Luxury Color Themes for Pinned Note Cards
const PIN_COLOR_THEMES: Record<string, {
  border: string;
  badge: string;
  dot: string;
  text: string;
  glow: string;
  accentBar: string;
}> = {
  amber: {
    border: 'border-amber-400/40 hover:border-amber-400/70 dark:border-amber-500/30 dark:hover:border-amber-400/60',
    badge: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/80 dark:border-amber-700/60',
    dot: 'bg-amber-400 shadow-[0_0_8px_#f59e0b]',
    text: 'text-amber-600 dark:text-amber-400',
    glow: 'from-amber-500/10 via-amber-500/5 to-transparent',
    accentBar: 'bg-gradient-to-r from-amber-500 to-amber-400',
  },
  indigo: {
    border: 'border-indigo-400/40 hover:border-indigo-400/70 dark:border-indigo-500/30 dark:hover:border-indigo-400/60',
    badge: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-700/60',
    dot: 'bg-indigo-400 shadow-[0_0_8px_#6366f1]',
    text: 'text-indigo-600 dark:text-indigo-400',
    glow: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
    accentBar: 'bg-gradient-to-r from-indigo-500 to-indigo-400',
  },
  emerald: {
    border: 'border-emerald-400/40 hover:border-emerald-400/70 dark:border-emerald-500/30 dark:hover:border-emerald-400/60',
    badge: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-700/60',
    dot: 'bg-emerald-400 shadow-[0_0_8px_#10b981]',
    text: 'text-emerald-600 dark:text-emerald-400',
    glow: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    accentBar: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
  },
  cyan: {
    border: 'border-cyan-400/40 hover:border-cyan-400/70 dark:border-cyan-500/30 dark:hover:border-cyan-400/60',
    badge: 'bg-cyan-50 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-700/60',
    dot: 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]',
    text: 'text-cyan-600 dark:text-cyan-400',
    glow: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
    accentBar: 'bg-gradient-to-r from-cyan-500 to-cyan-400',
  },
  purple: {
    border: 'border-purple-400/40 hover:border-purple-400/70 dark:border-purple-500/30 dark:hover:border-purple-400/60',
    badge: 'bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/80 dark:border-purple-700/60',
    dot: 'bg-purple-400 shadow-[0_0_8px_#a855f7]',
    text: 'text-purple-600 dark:text-purple-400',
    glow: 'from-purple-500/10 via-purple-500/5 to-transparent',
    accentBar: 'bg-gradient-to-r from-purple-500 to-purple-400',
  },
  rose: {
    border: 'border-rose-400/40 hover:border-rose-400/70 dark:border-rose-500/30 dark:hover:border-rose-400/60',
    badge: 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/80 dark:border-rose-700/60',
    dot: 'bg-rose-400 shadow-[0_0_8px_#f43f5e]',
    text: 'text-rose-600 dark:text-rose-400',
    glow: 'from-rose-500/10 via-rose-500/5 to-transparent',
    accentBar: 'bg-gradient-to-r from-rose-500 to-rose-400',
  },
};

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  documents,
  onNavigateTab,
  onSelectDoc,
  onOpenNewNote,
  onOpenUpload,
  onOpenBackup,
  onOpenTutorial,
  onOpenTips,
  onOpenCredits,
  onFilterSubject,
  onTogglePinDoc,
  onQuickCreatePinnedNote,
  onOpenInstallGuide,
  onOpenSyncManager,
  onOpenSoundHUD,
  lang = 'fr',
  activeTheme = 'light',
}) => {
  const {
    isDownloadingExe,
    downloadWindowsExe,
    isInstalled,
  } = useDownloadWindowsExe();
  const [selectedFilterPill, setSelectedFilterPill] = useState<string>('all');
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [streakData, setStreakData] = useState<{ activityDates: string[]; currentStreak: number }>({
    activityDates: [],
    currentStreak: 0,
  });

  // Pinned Notes State & Persistence
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('degreelocker_pinned_ids');
      if (stored) return JSON.parse(stored);
    } catch {}
    const docPinned = documents.filter((d) => d.isPinned).map((d) => d.id);
    if (docPinned.length > 0) return docPinned;
    return documents.slice(0, 3).map((d) => d.id);
  });

  const [customQuickNotes, setCustomQuickNotes] = useState<SchoolDocument[]>(() => {
    try {
      const stored = localStorage.getItem('degreelocker_custom_pinned_notes');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [pinnedSubjectFilter, setPinnedSubjectFilter] = useState<string>('all');
  const [isQuickNoteModalOpen, setIsQuickNoteModalOpen] = useState(false);
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  // New Quick Note form inputs
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteSubject, setNewNoteSubject] = useState('Mathématiques');
  const [newNoteTag, setNewNoteTag] = useState('Bac 2025');
  const [newNoteColor, setNewNoteColor] = useState<'amber' | 'indigo' | 'emerald' | 'cyan' | 'purple' | 'rose'>('amber');
  const [newNotePriority, setNewNotePriority] = useState<'high' | 'medium' | 'normal'>('high');
  const [newNoteContent, setNewNoteContent] = useState('');

  // Curated fallback pinned notes to guarantee an immediate 9/10 experience
  const defaultCuratedPinnedNotes = React.useMemo<SchoolDocument[]>(() => [
    {
      id: 'curated-pin-bac',
      title: lang === 'fr' ? '🎯 Méthodologie Bac 2025 : Dissertation & Grand Oral' : '🎯 Baccalaureate 2025 Methodology: Essay & Oral Exam',
      subject: lang === 'fr' ? 'Méthodologie' : 'Methodology',
      date: new Date().toISOString().split('T')[0],
      type: 'typed_note',
      tags: ['Bac 2025', 'Prioritaire', 'Oral'],
      content: lang === 'fr'
        ? '• Structure dissertation : Problématique, Thèse, Antithèse, Dépassement / Synthèse.\n• Grand Oral : 5 min exposé debout sans notes, 10 min échange avec le jury, 5 min projet.\n• Règle d\'or : Toujours définir les termes clés de l\'énoncé dès l\'introduction.'
        : '• Essay structure: Problem statement, Thesis, Antithesis, Synthesis.\n• Grand Oral: 5 min standing presentation without notes, 10 min Q&A with jury.\n• Golden Rule: Always define key terms in the introduction.',
      summary: lang === 'fr'
        ? 'Structure dissertation et conduite du Grand Oral du Bac 2025 : temps de parole, problématisation et règles d\'or.'
        : 'Essay structure and Grand Oral guidelines: timing, problem formulation, and key rules.',
      isPinned: true,
      pinColor: 'amber',
      pinPriority: 'high',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'curated-pin-math',
      title: lang === 'fr' ? '⚡ Formules Clés : Dérivation, Logarithmes & Suites' : '⚡ Key Formulas: Derivatives, Logarithms & Sequences',
      subject: lang === 'fr' ? 'Mathématiques' : 'Mathematics',
      date: new Date().toISOString().split('T')[0],
      type: 'typed_note',
      tags: ['Formules', 'Examen', 'Analyse'],
      content: lang === 'fr'
        ? '• Dérivée d\'un quotient : (u/v)\' = (u\'v - uv\') / v²\n• Fonction exponentielle : (e^u)\' = u\' · e^u  |  ln(a·b) = ln(a) + ln(b)\n• Suites géométriques : u_n = u_0 · q^n  |  Somme = 1er terme · (1 - q^(n+1)) / (1 - q)\n• Croissance comparée : lim (e^x / x^n) = +∞ quand x → +∞.'
        : '• Derivative of quotient: (u/v)\' = (u\'v - uv\') / v²\n• Exponential: (e^u)\' = u\' · e^u  |  ln(a·b) = ln(a) + ln(b)\n• Geometric sequence: u_n = u_0 · q^n\n• Asymptotics: lim (e^x / x^n) = +∞ as x → +∞.',
      summary: lang === 'fr'
        ? 'Recueil des formules incontournables d\'analyse mathématique pour les épreuves écrites et orales.'
        : 'Essential formulas for calculus and algebra.',
      isPinned: true,
      pinColor: 'indigo',
      pinPriority: 'high',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'curated-pin-bio',
      title: lang === 'fr' ? '🧬 Métabolisme Cellulaire : Respiration & Bilan ATP' : '🧬 Cellular Metabolism: Respiration & ATP Balance',
      subject: lang === 'fr' ? 'Biologie' : 'Biology',
      date: new Date().toISOString().split('T')[0],
      type: 'typed_note',
      tags: ['SVT', 'Cycle de Krebs', 'Schéma'],
      content: lang === 'fr'
        ? '• Glycolyse (Cytosol) : Glucose → 2 Pyruvates + 2 ATP + 2 NADH,H+\n• Cycle de Krebs (Matrice mitochondriale) : Décarboxylation & coenzymes réduits\n• Chaîne respiratoire (Crêtes) : Gradient de protons et synthèse de ~32 ATP au total.'
        : '• Glycolysis (Cytosol): Glucose → 2 Pyruvate + 2 ATP + 2 NADH,H+\n• Krebs Cycle (Mitochondrial matrix): Decarboxylation & reduced coenzymes\n• Respiratory chain: Proton gradient & synthesis of ~32 ATP.',
      summary: lang === 'fr'
        ? 'Étapes clés de la respiration cellulaire, rendements énergétiques et localisation mitochondriale.'
        : 'Key stages of cellular respiration and energy balance.',
      isPinned: true,
      pinColor: 'emerald',
      pinPriority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ], [lang]);

  // Combine user documents pinned + custom quick notes + default curated if empty
  const allUserPinned = React.useMemo(() => {
    const fromDocs = documents.filter((d) => pinnedIds.includes(d.id) || d.isPinned);
    const combined = [...customQuickNotes, ...fromDocs];
    // De-duplicate by id
    const seen = new Set<string>();
    const unique: SchoolDocument[] = [];
    combined.forEach((doc) => {
      if (!seen.has(doc.id)) {
        seen.add(doc.id);
        unique.push(doc);
      }
    });

    if (unique.length === 0) {
      const hasUnpinnedAll = localStorage.getItem('degreelocker_unpinned_all') === 'true';
      if (!hasUnpinnedAll) {
        return defaultCuratedPinnedNotes;
      }
    }
    return unique;
  }, [documents, pinnedIds, customQuickNotes, defaultCuratedPinnedNotes]);

  // Filter pinned notes by subject
  const displayedPinnedNotes = React.useMemo(() => {
    if (pinnedSubjectFilter === 'all') return allUserPinned;
    return allUserPinned.filter((n) => n.subject?.toLowerCase() === pinnedSubjectFilter.toLowerCase());
  }, [allUserPinned, pinnedSubjectFilter]);

  // Distinct subjects in pinned notes
  const pinnedSubjects = React.useMemo(() => {
    const list: string[] = [];
    allUserPinned.forEach((n) => {
      if (n.subject && !list.includes(n.subject)) {
        list.push(n.subject);
      }
    });
    return list;
  }, [allUserPinned]);

  const handleTogglePin = (docId: string) => {
    setPinnedIds((prev) => {
      let next: string[];
      if (prev.includes(docId)) {
        next = prev.filter((id) => id !== docId);
      } else {
        next = [...prev, docId];
      }
      try {
        localStorage.setItem('degreelocker_pinned_ids', JSON.stringify(next));
        if (next.length === 0) {
          localStorage.setItem('degreelocker_unpinned_all', 'true');
        } else {
          localStorage.removeItem('degreelocker_unpinned_all');
        }
      } catch {}
      return next;
    });

    setCustomQuickNotes((prev) => {
      const exists = prev.some((n) => n.id === docId);
      if (exists) {
        const next = prev.filter((n) => n.id !== docId);
        try {
          localStorage.setItem('degreelocker_custom_pinned_notes', JSON.stringify(next));
        } catch {}
        return next;
      }
      return prev;
    });

    if (onTogglePinDoc) {
      onTogglePinDoc(docId);
    }
  };

  const handleCopyNote = (note: SchoolDocument) => {
    const text = `${note.title}\n\n${note.content || note.summary || ''}`;
    try {
      navigator.clipboard?.writeText(text);
    } catch {}
    setCopiedNoteId(note.id);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  const handleCreateQuickNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() && !newNoteContent.trim()) return;

    const newDoc: SchoolDocument = {
      id: `quick-pinned-${Date.now()}`,
      title: newNoteTitle.trim() || (lang === 'fr' ? 'Note Rapide Épinglée' : 'Pinned Quick Note'),
      subject: newNoteSubject,
      date: new Date().toISOString().split('T')[0],
      type: 'typed_note',
      tags: [newNoteTag, 'Épinglé'],
      content: newNoteContent,
      summary: newNoteContent.slice(0, 160),
      isPinned: true,
      pinColor: newNoteColor,
      pinPriority: newNotePriority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (onQuickCreatePinnedNote) {
      try {
        await onQuickCreatePinnedNote(newDoc);
      } catch (err) {
        console.warn('Could not save note via prop:', err);
      }
    }

    setCustomQuickNotes((prev) => {
      const next = [newDoc, ...prev];
      try {
        localStorage.setItem('degreelocker_custom_pinned_notes', JSON.stringify(next));
      } catch {}
      return next;
    });

    setPinnedIds((prev) => {
      const next = [newDoc.id, ...prev];
      try {
        localStorage.setItem('degreelocker_pinned_ids', JSON.stringify(next));
        localStorage.removeItem('degreelocker_unpinned_all');
      } catch {}
      return next;
    });

    setNewNoteTitle('');
    setNewNoteContent('');
    setIsQuickNoteModalOpen(false);
  };

  // Fetch real study streaks and flashcards from server
  useEffect(() => {
    fetch('/api/streaks')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStreakData({
            activityDates: data.activityDates || [],
            currentStreak: data.currentStreak || 0,
          });
        }
      })
      .catch(() => {});

    fetch('/api/flashcards')
      .then((res) => res.json())
      .then((data) => {
        if (data.flashcards && Array.isArray(data.flashcards)) {
          setFlashcards(data.flashcards);
        }
      })
      .catch(() => {});
  }, []);

  // Live stats calculation hook using documents state and real flashcards
  const liveStats = React.useMemo(() => {
    const subjectMap: Record<string, { count: number; docs: SchoolDocument[]; totalWords: number }> = {};
    documents.forEach((d) => {
      const subj = d.subject || (lang === 'fr' ? 'Général' : 'General');
      if (!subjectMap[subj]) {
        subjectMap[subj] = { count: 0, docs: [], totalWords: 0 };
      }
      subjectMap[subj].count += 1;
      subjectMap[subj].docs.push(d);
      subjectMap[subj].totalWords += d.wordCount || 150;
    });

    const subjectsList = Object.keys(subjectMap).map((subj) => {
      const data = subjectMap[subj];
      const subjCards = flashcards.filter(c => (c.subject || '').toLowerCase() === subj.toLowerCase());
      const masteredCards = subjCards.filter(c => c.box === 4).length;
      const mastery = subjCards.length > 0 
        ? Math.round((masteredCards / subjCards.length) * 100)
        : Math.min(95, Math.max(30, 50 + data.count * 10));

      return {
        subject: subj,
        count: data.count,
        docs: data.docs,
        cardCount: subjCards.length,
        mastery,
        frequencyScore: data.count * 20 + data.totalWords,
      };
    }).sort((a, b) => b.frequencyScore - a.frequencyScore);

    const totalMasteredCards = flashcards.filter(c => c.box === 4).length;
    const srsRetention = flashcards.length > 0 
      ? Math.round((totalMasteredCards / flashcards.length) * 100) 
      : documents.length > 0 ? 75 : 0;

    return {
      subjectMap,
      subjectsList,
      totalDocs: documents.length,
      totalSubjects: subjectsList.length,
      srsRetention,
    };
  }, [documents, flashcards, lang]);

  // Real subjects breakdown from actual documents
  const subjectsMap: Record<string, number> = {};
  liveStats.subjectsList.forEach(item => {
    subjectsMap[item.subject] = item.count;
  });

  const distinctSubjects = liveStats.subjectsList.map(item => item.subject);

  // Filtered documents based on active pill
  const filteredDocuments = selectedFilterPill === 'all'
    ? documents
    : documents.filter((d) => d.subject?.toLowerCase() === selectedFilterPill.toLowerCase());

  // Last 7 days for study activity visualizer
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'short' });
    const isToday = i === 6;
    const isStudied = streakData.activityDates.includes(iso);
    return {
      date: iso,
      dayName,
      isToday,
      isStudied,
    };
  });

  const totalDocsCount = liveStats.totalDocs;
  const totalSubjectsCount = liveStats.totalSubjects;
  const srsRetentionPercent = liveStats.srsRetention;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. HERO WELCOME BANNER (Exact Match with Redesign Mockup)                 */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-[#111827] to-[#1e1b4b] p-6 sm:p-8 text-white shadow-2xl border border-slate-800">
        
        {/* Subtle decorative mesh gradients */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start justify-between">
          
          {/* Left Hero Content */}
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {lang === 'fr' ? 'Réussissez vos Évaluations & Examens' : 'Master Your Courses & Exams'}
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              {lang === 'fr'
                ? 'Importez vos supports de cours (PDF, Docx) ou créez des fiches adaptées pour mémoriser durablement.'
                : 'Import your course files (PDF, Docx) or craft custom revision cards to build lasting memory.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {!isInstalled && (
                <button
                  onClick={onOpenInstallGuide ? onOpenInstallGuide : downloadWindowsExe}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm inline-flex items-center gap-2.5 transition-all shadow-xl shadow-amber-500/20 active:scale-95 cursor-pointer"
                  title={lang === 'fr' ? 'Installer l\'application DegreeUnlocker sur votre ordinateur ou mobile (PWA)' : 'Install DegreeUnlocker on your computer or mobile device (PWA)'}
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>
                    {lang === 'fr' ? "Installer l'Application" : 'Install App'}
                  </span>
                </button>
              )}

              <button
                onClick={onOpenUpload}
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2.5 transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>{lang === 'fr' ? 'Importer un Document' : 'Import Document'}</span>
              </button>

              <button
                onClick={() => onNavigateTab('flashcards')}
                className="px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition-all border border-slate-700 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>{lang === 'fr' ? 'Créer une Fiche' : 'Create Card'}</span>
              </button>

              {onOpenSoundHUD && (
                <button
                  onClick={() => {
                    soundFx.playClick(850);
                    onOpenSoundHUD();
                  }}
                  className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500/25 via-indigo-600/30 to-amber-500/20 hover:from-amber-500/35 hover:to-indigo-500/40 text-amber-300 border border-amber-400/50 font-black text-xs sm:text-sm inline-flex items-center gap-2.5 transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95 cursor-pointer group"
                  title={lang === 'fr' ? 'Activer le Studio Audio Focus (Ondes Alpha, Thêta, Pluie & Synthétiseur)' : 'Activate Quantum Focus Audio Studio'}
                >
                  <Headphones className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform animate-pulse" />
                  <span>{lang === 'fr' ? 'Studio Focus 🎧' : 'Focus Studio 🎧'}</span>
                </button>
              )}

              {onOpenSyncManager && (
                <button
                  onClick={onOpenSyncManager}
                  className="px-4 py-3 rounded-2xl bg-slate-900/90 hover:bg-indigo-950/60 text-indigo-300 hover:text-indigo-200 border border-indigo-500/40 font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                  title={lang === 'fr' ? 'Ouvrir le Gestionnaire de Synchronisation Hors-Ligne' : 'Open Offline Sync Manager'}
                >
                  <Server className="w-4 h-4 text-cyan-400" />
                  <span>{lang === 'fr' ? 'Sync Cloud' : 'Cloud Sync'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Hero Stats Card (Base Locale Active) */}
          <div className="w-full lg:w-80 bg-slate-900 rounded-2xl p-5 border border-slate-700/60 shadow-xl space-y-4 shrink-0">
            
            {/* Status Header */}
            <div className="flex items-center justify-between gap-2 text-xs font-bold">
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{lang === 'fr' ? 'Base Locale Active' : 'Active Local Database'}</span>
              </div>
              {onOpenSyncManager && (
                <button
                  onClick={onOpenSyncManager}
                  className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                >
                  {lang === 'fr' ? 'Gérer sync' : 'Manage sync'}
                </button>
              )}
            </div>

            {/* 3 Metrics Row */}
            <div className="grid grid-cols-3 gap-3 pt-1 text-center">
              
              {/* Metric 1: Documents */}
              <div className="space-y-1.5">
                <div className="text-2xl font-black text-white font-mono">
                  {totalDocsCount}
                </div>
                <div className="text-[11px] font-medium text-slate-400">
                  {lang === 'fr' ? 'Documents' : 'Documents'}
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: totalDocsCount > 0 ? '75%' : '0%' }} />
                </div>
              </div>

              {/* Metric 2: Matières */}
              <div className="space-y-1.5">
                <div className="text-2xl font-black text-white font-mono">
                  {totalSubjectsCount}
                </div>
                <div className="text-[11px] font-medium text-slate-400">
                  {lang === 'fr' ? 'Matières' : 'Subjects'}
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: totalSubjectsCount > 0 ? '60%' : '0%' }} />
                </div>
              </div>

              {/* Metric 3: Rétention SRS */}
              <div className="space-y-1.5">
                <div className="text-2xl font-black text-white font-mono">
                  {srsRetentionPercent}%
                </div>
                <div className="text-[11px] font-medium text-slate-400">
                  {lang === 'fr' ? 'Rétention SRS' : 'SRS Retention'}
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: '88%' }} />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DAILY STUDY GOALS & MILESTONES (NEW FEATURE)                           */}
      {/* ========================================================================= */}
      <DailyStudyGoals 
        lang={lang} 
        activeTheme={activeTheme} 
        onNavigateTab={onNavigateTab} 
      />

      {/* ========================================================================= */}
      {/* PINNED NOTES SECTION (Priority Quick Memos & Exam Keys)                   */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-1">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-500 dark:text-amber-400 flex items-center justify-center shadow-xs shrink-0">
              <Pin className="w-4.5 h-4.5 fill-amber-400/80 rotate-12" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {lang === 'fr' ? 'Notes Épinglées & Mémos Prioritaires' : 'Pinned Notes & Priority Memos'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  {allUserPinned.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'fr' 
                  ? 'Vos repères d\'examen, formules clés et rappels essentiels en tête de tableau'
                  : 'Your exam guidelines, key formulas and essential reminders pinned at top'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {/* Subject filter if multiple subjects */}
            {pinnedSubjects.length > 1 && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80">
                <button
                  onClick={() => setPinnedSubjectFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    pinnedSubjectFilter === 'all'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {lang === 'fr' ? 'Toutes' : 'All'}
                </button>
                {pinnedSubjects.slice(0, 3).map((subj) => (
                  <button
                    key={subj}
                    onClick={() => setPinnedSubjectFilter(subj)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      pinnedSubjectFilter === subj
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>
            )}

            {/* Quick Add Note Button */}
            <button
              onClick={() => setIsQuickNoteModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{lang === 'fr' ? 'Nouveau Mémo' : 'New Memo'}</span>
            </button>
          </div>
        </div>

        {/* Pinned Notes Grid */}
        {displayedPinnedNotes.length === 0 ? (
          <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
              <Pin className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {lang === 'fr' ? 'Aucune note épinglée pour ce filtre.' : 'No pinned notes matching this filter.'}
            </p>
            <button
              onClick={() => {
                setPinnedIds(defaultCuratedPinnedNotes.map((d) => d.id));
                localStorage.removeItem('degreelocker_unpinned_all');
                setPinnedSubjectFilter('all');
              }}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              {lang === 'fr' ? 'Restaurer les mémos suggérés' : 'Restore suggested memos'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {displayedPinnedNotes.map((note) => {
              const colorKey = (note.pinColor as any) || (
                note.subject?.toLowerCase().includes('bio') ? 'emerald' :
                note.subject?.toLowerCase().includes('phys') ? 'cyan' :
                note.subject?.toLowerCase().includes('math') ? 'indigo' :
                note.subject?.toLowerCase().includes('philo') ? 'purple' :
                note.subject?.toLowerCase().includes('angl') ? 'rose' :
                'amber'
              );
              const colorTheme = PIN_COLOR_THEMES[colorKey] || PIN_COLOR_THEMES.amber;
              const est = calculateReadingTime(note.content, note.summary);
              const isCopied = copiedNoteId === note.id;

              return (
                <div
                  key={note.id}
                  className={`group relative rounded-2xl bg-white dark:bg-slate-900/90 p-4.5 border ${colorTheme.border} shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between gap-3.5 overflow-hidden`}
                >
                  {/* Subtle top accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${colorTheme.accentBar}`} />

                  {/* Header row */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border ${colorTheme.badge}`}>
                          {note.subject || (lang === 'fr' ? 'Général' : 'General')}
                        </span>
                        {note.tags && note.tags.length > 0 && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            #{note.tags[0]}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Copy button */}
                        <button
                          onClick={() => handleCopyNote(note)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title={lang === 'fr' ? 'Copier le contenu' : 'Copy note content'}
                        >
                          {isCopied ? (
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Unpin button */}
                        <button
                          onClick={() => handleTogglePin(note.id)}
                          className="p-1.5 rounded-lg text-amber-500 dark:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                          title={lang === 'fr' ? 'Détacher la note' : 'Unpin note'}
                        >
                          <Pin className="w-3.5 h-3.5 fill-amber-400" />
                        </button>
                      </div>
                    </div>

                    {/* Note Title */}
                    <h3
                      onClick={() => onSelectDoc(note)}
                      className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-snug line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                      title={note.title}
                    >
                      {note.title}
                    </h3>

                    {/* Note Content Preview */}
                    <div 
                      onClick={() => onSelectDoc(note)}
                      className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-1 bg-slate-50/80 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                    >
                      {(note.content || note.summary || '')
                        .split('\n')
                        .filter(l => l.trim().length > 0)
                        .slice(0, 3)
                        .map((line, idx) => (
                          <div key={idx} className="line-clamp-1 flex items-start gap-1">
                            <span className="text-amber-500 font-bold shrink-0">•</span>
                            <span className="truncate">{line.replace(/^[•\-\*]\s*/, '')}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{est.formatted}</span>
                    </div>

                    <button
                      onClick={() => onSelectDoc(note)}
                      className="font-bold text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{lang === 'fr' ? 'Ouvrir' : 'Open'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 2. SUBJECTS & ACTIVE REVISIONS SECTION (Matching Mockup)                 */}
      {/* ========================================================================= */}
      <div className="space-y-5">
        
        {/* Section Title */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>{lang === 'fr' ? 'Vos Matières & Révisions en cours' : 'Your Subjects & Active Revisions'}</span>
          </h2>
          <button
            onClick={() => onNavigateTab('library')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{lang === 'fr' ? 'Voir tous les cours' : 'View all'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedFilterPill('all')}
            className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
              selectedFilterPill === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {lang === 'fr' ? 'Toutes' : 'All'}
          </button>

          {distinctSubjects.map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedFilterPill(subj)}
              className={`px-4 py-1.5 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
                selectedFilterPill.toLowerCase() === subj.toLowerCase()
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>

        {/* Dynamic Course Cards Grid based on genuine user documents / subjects */}
        {filteredDocuments.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {lang === 'fr' ? 'Aucun cours dans cette section' : 'No courses in this section'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'fr'
                  ? 'Importez vos documents (PDF, Word, Doc) ou rédigez vos premières fiches pour commencer vos révisions.'
                  : 'Import your study materials or craft notes to populate your personal course deck.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={onOpenUpload}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? 'Importer un cours' : 'Import course'}</span>
              </button>
              <button
                onClick={onOpenNewNote}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? 'Créer une note' : 'Create note'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredDocuments.slice(0, 8).map((doc) => {
              const meta = (doc.subject && SUBJECT_METADATA[doc.subject]) || SUBJECT_METADATA['General'] || DEFAULT_SUBJECT_META;
              const SubjectIcon = meta?.icon || BookOpen;
              const docCards = flashcards.filter(c => c.docId === doc.id || (c.subject && doc.subject && c.subject.toLowerCase() === doc.subject.toLowerCase()));
              const masteredCount = docCards.filter(c => c.box === 4).length;
              const mastery = docCards.length > 0 ? Math.round((masteredCount / docCards.length) * 100) : 60;

              return (
                <div 
                  key={doc.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col justify-between gap-4 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <SubjectIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            {doc.subject || (lang === 'fr' ? 'Général' : 'General')}
                          </span>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2" title={doc.title}>
                            {doc.title}
                          </h4>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePin(doc.id);
                        }}
                        className={`p-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                          pinnedIds.includes(doc.id) || doc.isPinned
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-500 dark:text-amber-400 hover:bg-amber-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10'
                        }`}
                        title={
                          pinnedIds.includes(doc.id) || doc.isPinned
                            ? (lang === 'fr' ? 'Détacher des notes épinglées' : 'Unpin note')
                            : (lang === 'fr' ? 'Épingler en haut' : 'Pin note to top')
                        }
                      >
                        <Pin className={`w-3.5 h-3.5 ${pinnedIds.includes(doc.id) || doc.isPinned ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>

                    {/* Mastery progress */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <span>{mastery}% {lang === 'fr' ? 'Maîtrisé' : 'Mastered'}</span>
                        <span className="text-[10px] text-slate-400">{docCards.length} {lang === 'fr' ? 'fiches' : 'cards'}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${mastery}%` }} />
                      </div>
                    </div>

                    {/* Tags & Reading Time */}
                    <div className="flex items-center gap-1.5 pt-1 flex-wrap text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center gap-1 text-[10px]">
                        <Layers className="w-3 h-3 text-indigo-500" />
                        <span>{(doc.type || 'DOCUMENT').toUpperCase()}</span>
                      </span>
                      {(() => {
                        const est = calculateReadingTime(doc.content, doc.summary);
                        return (
                          <span 
                            className={`px-2 py-0.5 rounded-lg flex items-center gap-1 text-[10px] font-bold border ${
                              est.minutes <= 5
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60'
                                : est.minutes <= 15
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60'
                                : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60'
                            }`}
                            title={`${est.wordCount} ${lang === 'fr' ? 'mots' : 'words'}`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{est.formatted}</span>
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectDoc(doc)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{lang === 'fr' ? 'Consulter & Réviser' : 'Review Note'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 3. VISUALIZATION: SUBJECTS BREAKDOWN & 7-DAY STUDY ACTIVITY WIDGET        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Widget A: Documents per Subject Breakdown Visualizer */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                {lang === 'fr' ? 'Répartition des Documents par Matière' : 'Documents per Subject Distribution'}
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {totalDocsCount} {lang === 'fr' ? 'fichiers' : 'files'}
            </span>
          </div>

          {/* Progress Distribution Bars */}
          <div className="space-y-3 pt-2">
            {distinctSubjects.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                <p>{lang === 'fr' ? 'Aucun document enregistré' : 'No documents recorded yet'}</p>
                <p className="text-[11px] text-slate-500">{lang === 'fr' ? 'Les matières apparaîtront dès que vous ajouterez des fichiers.' : 'Subjects will appear once you add files.'}</p>
              </div>
            ) : (
              distinctSubjects.map((subj, idx) => {
                const count = subjectsMap[subj] || 0;
                const percent = totalDocsCount > 0 ? Math.min(100, Math.round((count / totalDocsCount) * 100)) : 0;
                const colors = ['bg-emerald-500', 'bg-cyan-500', 'bg-amber-500', 'bg-indigo-500', 'bg-purple-500', 'bg-rose-500'];
                const color = colors[idx % colors.length];

                return (
                  <div key={subj} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{subj}</span>
                      <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                        {count} {lang === 'fr' ? 'doc(s)' : 'doc(s)'} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className={`${color} h-full rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Widget B: 7-Day Recent Study Activity & Streak Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                {lang === 'fr' ? 'Activité & Assiduité Récente (7 Jours)' : 'Recent Study Activity & Streaks'}
              </h3>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{streakData.currentStreak} {lang === 'fr' ? 'Jours d\'affilée' : 'Day Streak'}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lang === 'fr'
              ? 'Consultez vos sessions quotidiennes d\'active recall, consultations de fiches et rédactions de notes.'
              : 'Track your daily active recall completions, flashcard reviews, and study notebook sessions.'}
          </p>

          {/* 7 Days Timeline Heatmap Bar */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-2 text-center overflow-x-auto pb-2 min-w-[300px]">
            {last7Days.map((d, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-2xl border transition-all flex flex-col items-center justify-between gap-2 ${
                  d.isStudied
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 text-slate-400'
                } ${d.isToday ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''}`}
              >
                <span className="text-[10px] font-bold uppercase">{d.dayName}</span>
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                    d.isStudied
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {d.isStudied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '—'}
                </div>
                <span className="text-[9px] font-mono text-slate-400">
                  {d.isToday ? (lang === 'fr' ? 'Auj.' : 'Today') : d.date.slice(8)}
                </span>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. ACADEMIC AI TOOLS GRID                                                */}
      {/* ========================================================================= */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>{lang === 'fr' ? 'Outils d’Étude & Révision' : 'Study & Revision Tools'}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div 
            onClick={() => onNavigateTab('flashcards')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:shadow-md cursor-pointer transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{lang === 'fr' ? 'Fiches Flashcards Personnalisées' : 'Custom Flashcards'}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === 'fr' ? 'Créez vos fiches à partir de vos notes de chapitre avec répétition espacée Leitner.' : 'Build flashcards from chapter notes with Leitner spaced repetition.'}
            </p>
          </div>

          <div 
            onClick={() => onNavigateTab('resumer')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{lang === 'fr' ? 'Synthèse & Résumé IA' : 'AI Summarizer'}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === 'fr' ? 'Condensé automatique en points clés, définitions et formules prêtes pour l’évaluation.' : 'Extract core key points, essential formulas, and testable concepts.'}
            </p>
          </div>

          <div 
            onClick={() => onNavigateTab('blocknote')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:shadow-md cursor-pointer transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <PenTool className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{lang === 'fr' ? 'Cahier Blocknote & Manuscrit' : 'Blocknote Companion'}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === 'fr' ? 'Génération de gabarits structurés avec code couleur de stylos pour l’écriture.' : 'Structured handwriting reproduction layout with pen color codes.'}
            </p>
          </div>

          <div 
            onClick={() => onNavigateTab('quiz')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{lang === 'fr' ? 'Quiz Recall & QCM' : 'Active Recall Quiz'}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === 'fr' ? 'Évaluations générées automatiquement avec corrigés détaillés et chronomètre.' : 'Timed exam simulations with automatic grading.'}
            </p>
          </div>

        </div>
      </div>

      {/* Guide & Study Methods Tutorial Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {lang === 'fr' ? 'Guide & Tutoriels d\'Étude' : 'Study Guide & Tutorials'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'fr'
                ? 'Tutoriel complet de l\'application, prise de notes, code couleur rationalisé et répétition espacée.'
                : 'Interactive application tour, note-taking craft, 4-color rationale, and spaced repetition strategy.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenTutorial && (
              <button
                id="btn-overview-open-tutorial"
                onClick={onOpenTutorial}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{lang === 'fr' ? 'Tutoriel App' : 'App Tutorial'}</span>
              </button>
            )}
            {onOpenTips && (
              <button
                id="btn-overview-open-tips"
                onClick={onOpenTips}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{lang === 'fr' ? 'Guide Méthodes' : 'Methods Guide'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Highlight Method Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-indigo-600 dark:text-indigo-400">
              <PaletteIcon className="w-4 h-4" />
              <span>{lang === 'fr' ? 'Code Couleur Rationnel 4 Couleurs' : '4-Color Pen System'}</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {lang === 'fr'
                ? '🔵 Bleu : Cours • ⚫ Noir : Titres & définitions • 🔴 Rouge : Formules & pièges • 🟢 Vert : Vocabulaire & exemples.'
                : '🔵 Blue: Body text • ⚫ Black: Headings • 🔴 Red: Formulas • 🟢 Green: Examples.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-600 dark:text-emerald-400">
              <Repeat className="w-4 h-4" />
              <span>{lang === 'fr' ? 'Répétition Espacée & Méthode Cornell' : 'Spaced Repetition & Cornell'}</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {lang === 'fr'
                ? 'Révisions à J+0, J+1, J+3, J+7, J+30 pour contrer la courbe de l\'oubli d\'Ebbinghaus.'
                : 'Review intervals at D+0, D+1, D+3, D+7, D+30 to optimize memory consolidation.'}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Footer with Credits & Copyright at the bottom of the page */}
      <footer className="mt-8 pt-6 pb-2 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-tight text-slate-500 dark:text-slate-400">
            DegreeUnlocker
          </span>
          <span>•</span>
          <span>© {new Date().getFullYear()} — {lang === 'fr' ? 'Tous droits réservés' : 'All rights reserved'}</span>
        </div>

        {onOpenCredits && (
          <button
            onClick={onOpenCredits}
            className="px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 font-bold text-xs inline-flex items-center gap-1.5 transition-all border border-slate-200/60 dark:border-slate-800/80 hover:border-amber-400/40 cursor-pointer shadow-2xs"
            title={lang === 'fr' ? 'Voir le générique et les crédits du show' : 'Show credits'}
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>{lang === 'fr' ? 'Crédits & Générique' : 'Show Credits'}</span>
          </button>
        )}
      </footer>

      {/* ========================================================================= */}
      {/* QUICK NOTE MODAL (Add new pinned memo directly from dashboard)           */}
      {/* ========================================================================= */}
      {isQuickNoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Pin className="w-4 h-4 fill-amber-400 rotate-12" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {lang === 'fr' ? 'Créer un Mémo Épinglé' : 'Create Pinned Memo'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {lang === 'fr' ? 'Sera affiché immédiatement en haut de votre tableau' : 'Will be displayed right at the top of your dashboard'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsQuickNoteModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateQuickNote} className="space-y-4 text-xs">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {lang === 'fr' ? 'Titre du Mémo' : 'Memo Title'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'fr' ? 'ex: ⚡ Formules Trigonométrie & Bac 2025' : 'e.g. ⚡ Trig Formulas & Key Exam Rules'}
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-xs"
                />
              </div>

              {/* Subject & Theme Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {lang === 'fr' ? 'Matière' : 'Subject'}
                  </label>
                  <select
                    value={newNoteSubject}
                    onChange={(e) => setNewNoteSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-xs"
                  >
                    <option value="Mathématiques">Mathématiques</option>
                    <option value="Biologie">Biologie</option>
                    <option value="Physique-Chimie">Physique-Chimie</option>
                    <option value="Histoire & Géo">Histoire & Géo</option>
                    <option value="Philosophie">Philosophie</option>
                    <option value="Anglais">Anglais</option>
                    <option value="Méthodologie">Méthodologie</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {lang === 'fr' ? 'Thème Couleur' : 'Color Theme'}
                  </label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {(['amber', 'indigo', 'emerald', 'cyan', 'purple', 'rose'] as const).map((color) => {
                      const bgMap: Record<string, string> = {
                        amber: 'bg-amber-400',
                        indigo: 'bg-indigo-500',
                        emerald: 'bg-emerald-500',
                        cyan: 'bg-cyan-400',
                        purple: 'bg-purple-500',
                        rose: 'bg-rose-500',
                      };
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewNoteColor(color)}
                          className={`w-6 h-6 rounded-full ${bgMap[color]} transition-all cursor-pointer ${
                            newNoteColor === color ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' : 'opacity-70 hover:opacity-100'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tag Selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {lang === 'fr' ? 'Tag / Mot-clé' : 'Tag'}
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['Bac 2025', 'Formules', 'Examen', 'Important', 'Synthèse', 'Oral'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewNoteTag(preset)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        newNoteTag === preset
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      #{preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Body */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {lang === 'fr' ? 'Points Clés & Contenu' : 'Key Notes & Content'} *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={lang === 'fr' ? '• Point clé 1\n• Formule ou théorème\n• Erreur fréquente à éviter' : '• Key concept 1\n• Formula or theorem\n• Pitfall to avoid'}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono text-xs leading-relaxed"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQuickNoteModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {lang === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold inline-flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
                >
                  <Pin className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{lang === 'fr' ? 'Épingler en Tête' : 'Pin to Dashboard'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardOverview;
