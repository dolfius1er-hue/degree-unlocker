import React, { useState, useEffect, useRef } from 'react';
import { 
  SchoolDocument, 
  AppLanguage, 
  QuizScoreRecord, 
  Flashcard, 
  SavedVocabularyItem, 
  StudyProgressBackup,
  UIPreferences 
} from '../types';
import { 
  ShieldCheck, 
  Download, 
  Upload, 
  Flame, 
  Trophy, 
  BookOpen, 
  Layers, 
  Database, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Copy, 
  Check, 
  RefreshCw, 
  Calendar, 
  Clock, 
  ArrowRight, 
  HardDrive, 
  Sparkles,
  Trash2,
  Plus,
  BookMarked,
  Search,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BackupProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: SchoolDocument[];
  currentStreak: number;
  activityDates: string[];
  preferences?: UIPreferences;
  lang?: AppLanguage;
  onRestoreData?: (backup: StudyProgressBackup) => void;
}

export const BackupProgressModal: React.FC<BackupProgressModalProps> = ({
  isOpen,
  onClose,
  documents,
  currentStreak,
  activityDates,
  preferences,
  lang = 'fr',
  onRestoreData,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'vocabulary' | 'quizzes' | 'restore'>('overview');
  const [loading, setLoading] = useState(false);
  const [quizHistory, setQuizHistory] = useState<QuizScoreRecord[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [vocabulary, setVocabulary] = useState<SavedVocabularyItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Restore state
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [parsedBackup, setParsedBackup] = useState<StudyProgressBackup | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSuccessMsg, setRestoreSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Vocabulary search & filter
  const [vocabSearch, setVocabSearch] = useState('');
  const [newVocabSource, setNewVocabSource] = useState('');
  const [newVocabTarget, setNewVocabTarget] = useState('');
  const [newVocabDef, setNewVocabDef] = useState('');
  const [isAddingVocab, setIsAddingVocab] = useState(false);

  // Load all user progress data from server & localStorage
  const loadAllProgressData = async () => {
    setLoading(true);
    try {
      // 1. Quiz history
      try {
        const qRes = await fetch('/api/quiz/history');
        if (qRes.ok) {
          const qData = await qRes.json();
          setQuizHistory(qData.history || []);
        }
      } catch (e) {
        console.warn('Quiz history fetch fallback:', e);
      }

      // 2. Flashcards
      try {
        const fcRes = await fetch('/api/flashcards');
        if (fcRes.ok) {
          const fcData = await fcRes.json();
          setFlashcards(fcData.flashcards || []);
        }
      } catch (e) {
        console.warn('Flashcards fetch fallback:', e);
      }

      // 3. Vocabulary
      try {
        const vRes = await fetch('/api/vocabulary');
        if (vRes.ok) {
          const vData = await vRes.json();
          setVocabulary(vData.vocabulary || []);
        } else {
          // fallback to localStorage
          const localVocab = localStorage.getItem('degreelocker_vocabulary');
          if (localVocab) setVocabulary(JSON.parse(localVocab));
        }
      } catch (e) {
        const localVocab = localStorage.getItem('degreelocker_vocabulary');
        if (localVocab) setVocabulary(JSON.parse(localVocab));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAllProgressData();
      setExportSuccess(false);
      setRestoreError(null);
      setRestoreSuccessMsg(null);
      setParsedBackup(null);
      setRestoreFile(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build the complete standardized backup object
  const createBackupPayload = (): StudyProgressBackup => {
    const timestamp = new Date().toISOString();
    return {
      version: '1.0.0',
      exportedAt: timestamp,
      appName: 'DegreeLocker StudyVault AI',
      userStats: {
        streakDays: currentStreak,
        activityDates: activityDates,
        totalStudySessions: activityDates.length,
        totalDocuments: documents.length,
        totalQuizzesTaken: quizHistory.length,
        totalFlashcards: flashcards.length,
        totalVocabularyWords: vocabulary.length,
      },
      streaks: {
        activityDates: activityDates,
        currentStreak: currentStreak,
      },
      quizResults: quizHistory,
      vocabularyList: vocabulary,
      flashcards: flashcards,
      documents: documents,
      preferences: preferences,
    };
  };

  // Trigger instantaneous file download of the full JSON backup
  const handleDownloadBackup = () => {
    try {
      const backupData = createBackupPayload();
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const dateStr = new Date().toISOString().split('T')[0];
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `study_progress_backup_${dateStr}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (err: any) {
      console.error('Error creating backup file:', err);
    }
  };

  // Copy JSON backup to clipboard
  const handleCopyBackup = () => {
    const backupData = createBackupPayload();
    navigator.clipboard.writeText(JSON.stringify(backupData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Handle uploaded JSON file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreFile(file);
    setRestoreError(null);
    setRestoreSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Basic verification
        if (!parsed || typeof parsed !== 'object') {
          throw new Error(lang === 'fr' ? 'Fichier JSON non valide.' : 'Invalid JSON file format.');
        }

        setParsedBackup(parsed);
      } catch (err: any) {
        setRestoreError(lang === 'fr' ? `Erreur de lecture du fichier : ${err.message}` : `File read error: ${err.message}`);
        setParsedBackup(null);
      }
    };
    reader.readAsText(file);
  };

  // Execute restore
  const handleExecuteRestore = async () => {
    if (!parsedBackup) return;
    setLoading(true);
    setRestoreError(null);

    try {
      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedBackup),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to restore backup');
      }

      const result = await res.json();

      // Also persist to localStorage for client-side resiliency
      if (parsedBackup.streaks?.activityDates) {
        localStorage.setItem('degreelocker_activity_dates', JSON.stringify(parsedBackup.streaks.activityDates));
      }
      if (parsedBackup.vocabularyList) {
        localStorage.setItem('degreelocker_vocabulary', JSON.stringify(parsedBackup.vocabularyList));
      }

      setRestoreSuccessMsg(
        lang === 'fr'
          ? `Restauration réussie ! ${result.restoredCounts?.documents || 0} documents, ${result.restoredCounts?.flashcards || 0} flashcards, ${result.restoredCounts?.vocabularyList || 0} mots et ${result.restoredCounts?.quizResults || 0} quiz récupérés.`
          : `Restoration successful! Recovered ${result.restoredCounts?.documents || 0} docs, ${result.restoredCounts?.flashcards || 0} flashcards, ${result.restoredCounts?.vocabularyList || 0} vocab items, and ${result.restoredCounts?.quizResults || 0} quizzes.`
      );

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Notify parent app to reload state
      if (onRestoreData) {
        onRestoreData(parsedBackup);
      }

      // Refresh local modal data
      await loadAllProgressData();
    } catch (err: any) {
      setRestoreError(err.message || 'Restoration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Vocabulary handlers
  const handleAddVocabularyItem = async () => {
    if (!newVocabSource.trim() || !newVocabTarget.trim()) return;
    const newItem: SavedVocabularyItem = {
      id: `voc-${Date.now()}`,
      sourceWord: newVocabSource.trim(),
      targetWord: newVocabTarget.trim(),
      sourceLanguage: 'fr',
      targetLanguage: 'en',
      definition: newVocabDef.trim(),
      partOfSpeech: 'nom',
      addedAt: new Date().toISOString(),
      mastered: false,
    };

    const updated = [newItem, ...vocabulary];
    setVocabulary(updated);
    setNewVocabSource('');
    setNewVocabTarget('');
    setNewVocabDef('');
    setIsAddingVocab(false);

    try {
      await fetch('/api/vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      localStorage.setItem('degreelocker_vocabulary', JSON.stringify(updated));
    } catch (e) {
      console.warn('Vocab save error:', e);
    }
  };

  const handleDeleteVocabularyItem = async (id: string) => {
    const updated = vocabulary.filter(v => v.id !== id);
    setVocabulary(updated);
    try {
      await fetch(`/api/vocabulary/${id}`, { method: 'DELETE' });
      localStorage.setItem('degreelocker_vocabulary', JSON.stringify(updated));
    } catch (e) {
      console.warn('Vocab delete error:', e);
    }
  };

  const filteredVocab = vocabulary.filter(v => 
    v.sourceWord.toLowerCase().includes(vocabSearch.toLowerCase()) ||
    v.targetWord.toLowerCase().includes(vocabSearch.toLowerCase()) ||
    (v.definition && v.definition.toLowerCase().includes(vocabSearch.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  {lang === 'fr' ? 'Sauvegarde & Sécurité de Progression' : 'Study Progress Backup & Security'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono font-bold">
                  JSON Export
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {lang === 'fr'
                  ? 'Exportez vos séries, résultats de quiz et lexique pour garantir la pérennité de vos révisions.'
                  : 'Export streaks, quiz scores, and vocabulary to secure your study history across sessions.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50 dark:bg-slate-900/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? 'Exporter / Sauvegarder' : 'Export / Backup'}</span>
          </button>

          <button
            onClick={() => setActiveTab('vocabulary')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'vocabulary'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? `Lexique (${vocabulary.length})` : `Vocabulary (${vocabulary.length})`}</span>
          </button>

          <button
            onClick={() => setActiveTab('quizzes')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'quizzes'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? `Quiz (${quizHistory.length})` : `Quizzes (${quizHistory.length})`}</span>
          </button>

          <button
            onClick={() => setActiveTab('restore')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'restore'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? 'Restaurer une Sauvegarde' : 'Restore Backup'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* TAB 1: OVERVIEW & EXPORT */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Summary Stats Grid */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{lang === 'fr' ? 'Contenu inclus dans votre sauvegarde' : 'Data included in your backup'}</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">Format standard .JSON</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  
                  {/* Streak Card */}
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                        {lang === 'fr' ? 'Série d\'Étude' : 'Study Streak'}
                      </span>
                      <Flame className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                        {currentStreak} {lang === 'fr' ? 'jours' : 'days'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {activityDates.length} {lang === 'fr' ? 'sessions enregistrées' : 'recorded sessions'}
                      </div>
                    </div>
                  </div>

                  {/* Quiz Results Card */}
                  <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                        {lang === 'fr' ? 'Quiz & Évals' : 'Quiz Scores'}
                      </span>
                      <Trophy className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                        {quizHistory.length}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {lang === 'fr' ? 'tentatives & scores' : 'test attempts'}
                      </div>
                    </div>
                  </div>

                  {/* Vocabulary Card */}
                  <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-900 dark:text-teal-200">
                        {lang === 'fr' ? 'Vocabulaire' : 'Vocabulary'}
                      </span>
                      <BookMarked className="w-4 h-4 text-teal-500" />
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-black text-teal-600 dark:text-teal-400 font-mono">
                        {vocabulary.length}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {lang === 'fr' ? 'mots & définitions' : 'terms & definitions'}
                      </div>
                    </div>
                  </div>

                  {/* Flashcards Card */}
                  <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-900 dark:text-cyan-200">
                        {lang === 'fr' ? 'Flashcards' : 'Flashcards'}
                      </span>
                      <Layers className="w-4 h-4 text-cyan-500" />
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                        {flashcards.length}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {lang === 'fr' ? 'cartes & répétitions' : 'spaced cards'}
                      </div>
                    </div>
                  </div>

                  {/* Documents Card */}
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                        {lang === 'fr' ? 'Documents' : 'Documents'}
                      </span>
                      <FileText className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {documents.length}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {lang === 'fr' ? 'cours & résumés' : 'notes & guides'}
                      </div>
                    </div>
                  </div>

                  {/* UI Preferences Card */}
                  <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900 dark:text-purple-200">
                        {lang === 'fr' ? 'Configuration' : 'Settings'}
                      </span>
                      <SlidersHorizontal className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="mt-2">
                      <div className="text-sm font-extrabold text-purple-700 dark:text-purple-300 capitalize">
                        {preferences?.theme || 'Light'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {preferences?.menuPosition === 'top' ? 'Top bar' : 'Sidebar'} • {lang.toUpperCase()}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-50 dark:from-indigo-950/40 dark:to-slate-900/60 border border-indigo-100 dark:border-indigo-900/40 space-y-4">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-indigo-600" />
                    <span>{lang === 'fr' ? 'Générer le Fichier de Sauvegarde' : 'Generate Backup File'}</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {lang === 'fr'
                      ? 'Téléchargez une archive JSON autonome contenant l\'intégralité de vos cours, séries, fiches et scores.'
                      : 'Download a standalone JSON archive containing your full notes, streaks, decks, and scores.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleDownloadBackup}
                    className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs inline-flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {lang === 'fr'
                        ? '📥 Télécharger la Sauvegarde Complète (.JSON)'
                        : '📥 Download Complete Backup (.JSON)'}
                    </span>
                  </button>

                  <button
                    onClick={handleCopyBackup}
                    className="px-4 py-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? (lang === 'fr' ? 'Copié !' : 'Copied!') : (lang === 'fr' ? 'Copier le JSON' : 'Copy JSON')}</span>
                  </button>
                </div>

                {exportSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {lang === 'fr'
                        ? 'Votre fichier de sauvegarde a été généré et téléchargé avec succès !'
                        : 'Your backup file has been successfully generated and downloaded!'}
                    </span>
                  </div>
                )}
              </div>

              {/* Data Safety Notice */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {lang === 'fr'
                    ? '100% Hors-Cloud : Toutes vos données sont stockées sur votre espace de stockage local. Vous pouvez transférer ce fichier de sauvegarde vers un autre appareil à tout moment.'
                    : '100% Privacy: All study progress is stored locally on your machine. You can safely import this backup file on any other computer anytime.'}
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: VOCABULARY LIST */}
          {activeTab === 'vocabulary' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder={lang === 'fr' ? 'Rechercher un mot...' : 'Search word...'}
                    value={vocabSearch}
                    onChange={(e) => setVocabSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  onClick={() => setIsAddingVocab(!isAddingVocab)}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'fr' ? '+ Ajouter un terme' : '+ Add Word'}</span>
                </button>
              </div>

              {/* Add form */}
              {isAddingVocab && (
                <div className="p-4 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-2xl space-y-3">
                  <h5 className="font-bold text-xs text-teal-950 dark:text-teal-200">
                    {lang === 'fr' ? 'Ajouter un mot au lexique personnel' : 'Add term to personal vocabulary'}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      placeholder={lang === 'fr' ? 'Mot source (ex: Codicille)' : 'Source word'}
                      value={newVocabSource}
                      onChange={(e) => setNewVocabSource(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder={lang === 'fr' ? 'Traduction / Cible (ex: Codicil)' : 'Target word / Translation'}
                      value={newVocabTarget}
                      onChange={(e) => setNewVocabTarget(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder={lang === 'fr' ? 'Définition / Contexte (optionnel)' : 'Definition / Context (optional)'}
                    value={newVocabDef}
                    onChange={(e) => setNewVocabDef(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsAddingVocab(false)}
                      className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700"
                    >
                      {lang === 'fr' ? 'Annuler' : 'Cancel'}
                    </button>
                    <button
                      onClick={handleAddVocabularyItem}
                      className="px-3 py-1 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-500"
                    >
                      {lang === 'fr' ? 'Enregistrer' : 'Save'}
                    </button>
                  </div>
                </div>
              )}

              {/* Vocab Items List */}
              {filteredVocab.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <BookMarked className="w-8 h-8 mx-auto text-slate-400" />
                  <p className="text-xs text-slate-500">
                    {lang === 'fr'
                      ? 'Aucun mot dans votre lexique personnel pour le moment. Enregistrez des termes depuis l\'Atelier Bilingue ou ajoutez-en manuellement.'
                      : 'No vocabulary words saved yet. Add terms directly from the Bilingual Lab or manually above.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {filteredVocab.map((v) => (
                    <div 
                      key={v.id}
                      className="p-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-3 hover:border-teal-400 transition-colors"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                            {v.sourceWord}
                          </span>
                          <span className="text-slate-400 text-xs">→</span>
                          <span className="font-bold text-xs text-teal-600 dark:text-teal-400">
                            {v.targetWord}
                          </span>
                          {v.partOfSpeech && (
                            <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded text-[10px] font-mono">
                              {v.partOfSpeech}
                            </span>
                          )}
                        </div>
                        {v.definition && (
                          <p className="text-[11px] text-slate-500 truncate max-w-md">
                            {v.definition}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteVocabularyItem(v.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title={lang === 'fr' ? 'Supprimer' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: QUIZZES LOG */}
          {activeTab === 'quizzes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {lang === 'fr' ? 'Historique détaillé des évaluations' : 'Detailed Quiz History'}
                </h4>
                <span className="text-xs font-semibold text-indigo-600">
                  {quizHistory.length} {lang === 'fr' ? 'évaluations' : 'quizzes'}
                </span>
              </div>

              {quizHistory.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <Trophy className="w-8 h-8 mx-auto text-slate-400" />
                  <p className="text-xs text-slate-500">
                    {lang === 'fr'
                      ? 'Aucun quiz réalisé pour le moment. Lancez un quiz depuis l\'onglet Quiz & Évaluations.'
                      : 'No quiz attempts recorded yet. Start a quiz in the Quizzes tab.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                  {quizHistory.map((q) => {
                    const isGood = (q.percentage || 0) >= 70;
                    return (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {q.docTitle || 'Quiz'}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px]">
                              {q.subject || 'Général'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{q.timestamp ? new Date(q.timestamp).toLocaleDateString() : 'Aujourd\'hui'}</span>
                            </span>
                            <span>•</span>
                            <span>{q.score} / {q.totalQuestions} questions</span>
                          </div>
                        </div>

                        <div className={`px-3 py-1 rounded-xl font-mono font-black text-sm ${
                          isGood 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}>
                          {q.percentage || Math.round((q.score / (q.totalQuestions || 1)) * 100)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RESTORE BACKUP */}
          {activeTab === 'restore' && (
            <div className="space-y-5">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-3 text-xs text-amber-900 dark:text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">
                    {lang === 'fr' ? 'Restauration de Progression :' : 'Study Restoration:'}
                  </span>
                  <p className="mt-0.5 leading-relaxed">
                    {lang === 'fr'
                      ? 'L\'import d\'un fichier de sauvegarde restaurera vos cours, quiz, fiches flashcards et séries d\'activité.'
                      : 'Importing a backup will restore your documents, quizzes, flashcards, and activity streaks.'}
                  </p>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {restoreFile ? restoreFile.name : (lang === 'fr' ? 'Cliquez pour sélectionner un fichier .JSON' : 'Click to select .JSON file')}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {lang === 'fr' ? 'Accepte les fichiers de sauvegarde DegreeLocker / StudyVault' : 'Accepts DegreeLocker / StudyVault backup files'}
                  </p>
                </div>
              </div>

              {/* Parsed Preview */}
              {parsedBackup && (
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {lang === 'fr' ? 'Aperçu du contenu à restaurer :' : 'Restore preview:'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Exporté le : {parsedBackup.exportedAt ? new Date(parsedBackup.exportedAt).toLocaleDateString() : 'Inconnu'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-bold">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <div className="text-indigo-600 text-base">{parsedBackup.documents?.length || 0}</div>
                      <div className="text-[10px] text-slate-400">Documents</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <div className="text-cyan-600 text-base">{parsedBackup.flashcards?.length || 0}</div>
                      <div className="text-[10px] text-slate-400">Flashcards</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <div className="text-amber-600 text-base">{parsedBackup.streaks?.currentStreak || parsedBackup.userStats?.streakDays || 0}j</div>
                      <div className="text-[10px] text-slate-400">Série</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <div className="text-teal-600 text-base">{parsedBackup.vocabularyList?.length || 0}</div>
                      <div className="text-[10px] text-slate-400">Vocabulaire</div>
                    </div>
                  </div>

                  <button
                    onClick={handleExecuteRestore}
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>{lang === 'fr' ? 'Restaurer ces données maintenant' : 'Restore this data now'}</span>
                  </button>
                </div>
              )}

              {restoreError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{restoreError}</span>
                </div>
              )}

              {restoreSuccessMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{restoreSuccessMsg}</span>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>{lang === 'fr' ? 'Sauvegarde 100% sécurisée & locale' : '100% Safe & Local Storage'}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-all"
          >
            {lang === 'fr' ? 'Fermer' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
