import React, { useState, useMemo } from 'react';
import { AppLanguage, AppTheme } from '../types';
import { 
  ENGLISH_PRIORITY_WORDS, 
  ENGLISH_STUDY_NOTES, 
  ENGLISH_EXERCISES_DATABASE, 
  EnglishPriorityWord, 
  EnglishStudyNoteSection, 
  EnglishExercise 
} from '../data/englishCurriculumData';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  GraduationCap, 
  CheckCircle2, 
  HelpCircle, 
  Copy, 
  Check, 
  Languages, 
  Bookmark, 
  ChevronRight, 
  Flame, 
  FileText,
  Volume2,
  Table,
  Compass,
  ArrowRight,
  Globe,
  Award,
  Zap,
  RotateCcw,
  BookMarked,
  Layers,
  PenTool,
  Download
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface EnglishCourseViewProps {
  lang?: AppLanguage;
  activeTheme?: AppTheme;
  onOpenInBlocknote?: (title: string, subject: string, content: string) => void;
  onCreateFlashcard?: (question: string, answer: string, subject: string) => void;
}

export const EnglishCourseView: React.FC<EnglishCourseViewProps> = ({
  lang = 'fr',
  activeTheme = 'light',
  onOpenInBlocknote,
  onCreateFlashcard
}) => {
  const [activeTab, setActiveTab] = useState<'words' | 'notes' | 'exercises'>('words');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWordCategory, setSelectedWordCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string>(ENGLISH_STUDY_NOTES[0].id);
  const [speakingWordId, setSpeakingWordId] = useState<string | null>(null);

  // Exercises State
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, string>>({});
  const [validatedExercises, setValidatedExercises] = useState<Record<string, boolean>>({});

  // Pronounce word with SpeechSynthesis
  const speakEnglish = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.split('/')[0].trim());
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      setSpeakingWordId(id);
      utterance.onend = () => setSpeakingWordId(null);
      utterance.onerror = () => setSpeakingWordId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Filtered Priority Words
  const filteredWords = useMemo(() => {
    return ENGLISH_PRIORITY_WORDS.filter(w => {
      const matchesSearch = 
        w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.frenchMeaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.exampleSentence.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedWordCategory === 'all' || w.category === selectedWordCategory;
      const matchesLevel = selectedLevel === 'all' || w.level === selectedLevel;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [searchQuery, selectedWordCategory, selectedLevel]);

  // Selected Note
  const currentNote = useMemo(() => {
    return ENGLISH_STUDY_NOTES.find(n => n.id === activeNoteId) || ENGLISH_STUDY_NOTES[0];
  }, [activeNoteId]);

  // Copy text helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Exercise selection
  const handleSelectOption = (exerciseId: string, option: string) => {
    if (validatedExercises[exerciseId]) return;
    setExerciseAnswers(prev => ({ ...prev, [exerciseId]: option }));
  };

  const handleValidateExercise = (exerciseId: string) => {
    setValidatedExercises(prev => ({ ...prev, [exerciseId]: true }));
  };

  const handleResetExercises = () => {
    setExerciseAnswers({});
    setValidatedExercises({});
  };

  // Calculate exercises score
  const exerciseStats = useMemo(() => {
    const total = ENGLISH_EXERCISES_DATABASE.length;
    let completed = 0;
    let correct = 0;

    ENGLISH_EXERCISES_DATABASE.forEach(ex => {
      if (validatedExercises[ex.id]) {
        completed++;
        if (exerciseAnswers[ex.id] === ex.correctAnswer) {
          correct++;
        }
      }
    });

    return { total, completed, correct };
  }, [exerciseAnswers, validatedExercises]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      
      {/* Hero Banner with UK & USA Academic Flag Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-blue-500/30 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
              <span className="text-base">🇬🇧 🇺🇸</span>
              <span>English Academic Excellence</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-400/30 text-[10px] text-white">Collège → Lycée & Prépa</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Anglais : Mots Prioritaires & Notes de Cours</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Répertoire exhaustif de vocabulaire à haute valeur ajoutée, connecteurs d'argumentation, faux-amis incontournables et fiches méthodologiques pour le Bac et les concours.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold">
                <BookMarked className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Mots Clés B2/C1</p>
                <p className="text-lg font-black text-white">{ENGLISH_PRIORITY_WORDS.length}+</p>
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Fiches de Cours</p>
                <p className="text-lg font-black text-white">{ENGLISH_STUDY_NOTES.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="mt-8 flex items-center gap-2 border-t border-white/10 pt-4 overflow-x-auto scrollbar-none">
          <button
            id="tab-btn-english-words"
            onClick={() => setActiveTab('words')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'words'
                ? 'bg-white text-blue-950 shadow-md scale-102'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Mots Prioritaires ({filteredWords.length})</span>
          </button>

          <button
            id="tab-btn-english-notes"
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-white text-blue-950 shadow-md scale-102'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Fiches & Notes de Cours</span>
          </button>

          <button
            id="tab-btn-english-exercises"
            onClick={() => setActiveTab('exercises')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'exercises'
                ? 'bg-white text-blue-950 shadow-md scale-102'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>Drills & Exercices ({exerciseStats.completed}/{exerciseStats.total})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PRIORITY WORDS */}
      {activeTab === 'words' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un mot, connecteur, faux-ami ou traduction..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Level Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-xs font-semibold text-slate-400 shrink-0">Niveau :</span>
                {['all', 'B1', 'B2', 'C1'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedLevel === lvl
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {lvl === 'all' ? 'Tous' : lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {[
                { id: 'all', label: 'Tout le Vocabulaire' },
                { id: 'connectors', label: '🔗 Connecteurs Logiques' },
                { id: 'argumentation_verbs', label: '🎯 Verbes d\'Argumentation' },
                { id: 'false_friends', label: '⚠️ Faux-Amis Pièges' },
                { id: 'phrasal_verbs', label: '⚡ Phrasal Verbs' },
                { id: 'society_issues', label: '🌍 Société & Débats' },
                { id: 'literary_analysis', label: '📚 Analyse Littéraire' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedWordCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedWordCategory === cat.id
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Words Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWords.map((item) => (
              <div 
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 shadow-xs hover:border-blue-400/50 dark:hover:border-blue-500/40 transition-all space-y-3 group"
              >
                {/* Card Header: Word, Level Badge, Audio */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.word}
                      </h3>
                      <button
                        onClick={() => speakEnglish(item.word, item.id)}
                        className={`p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-blue-900/40 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-all cursor-pointer ${
                          speakingWordId === item.id ? 'animate-pulse text-blue-600' : ''
                        }`}
                        title="Écouter la prononciation anglaise"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">{item.phonetics}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.level === 'C1'
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                        : item.level === 'B2'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    }`}>
                      {item.level}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {item.partOfSpeech}
                    </span>
                  </div>
                </div>

                {/* French Translation */}
                <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                  <p className="text-xs sm:text-sm font-semibold text-blue-950 dark:text-blue-200">
                    🇫🇷 {item.frenchMeaning}
                  </p>
                </div>

                {/* Example sentence in Context */}
                <div className="space-y-1.5">
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic border-l-2 border-indigo-400 pl-3 leading-relaxed">
                    "{item.exampleSentence}"
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-3">
                    → {item.frenchTranslation}
                  </p>
                </div>

                {/* Collocations & Tips */}
                {item.collocations && item.collocations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.collocations.map((col, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-medium">
                        ✨ {col}
                      </span>
                    ))}
                  </div>
                )}

                {item.notes && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-300/90 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200/50 dark:border-amber-900/40">
                    💡 <strong>Astuce :</strong> {item.notes}
                  </p>
                )}

                {/* Actions: Copy to Blocknotes / Export to Flashcard */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  {onCreateFlashcard && (
                    <button
                      onClick={() => onCreateFlashcard(item.word, `${item.frenchMeaning}\n\nExemple: ${item.exampleSentence}`, 'Anglais')}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Créer une flashcard avec ce mot"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Flashcard</span>
                    </button>
                  )}

                  {onOpenInBlocknote && (
                    <button
                      onClick={() => onOpenInBlocknote(`Fiche Vocabulaire: ${item.word}`, 'Anglais', `# ${item.word} (${item.level})\n\n**Sens :** ${item.frenchMeaning}\n\n**Exemple :**\n> ${item.exampleSentence}\n\n*${item.frenchTranslation}*`)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Ouvrir dans le Bloc-notes"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Bloc-notes</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleCopy(`${item.word} : ${item.frenchMeaning}\nExemple: "${item.exampleSentence}"`, item.id)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Copier le mot et son exemple"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === item.id ? 'Copié' : 'Copier'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: STUDY NOTES & METHODOLOGY */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Notes Sidebar Selector */}
          <div className="lg:col-span-1 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Fiches Pédagogiques</p>
            {ENGLISH_STUDY_NOTES.map(note => (
              <button
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  activeNoteId === note.id
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                }`}
              >
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1.5 ${
                  activeNoteId === note.id ? 'bg-white/20 text-white' : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                }`}>
                  {note.badge}
                </span>
                <h4 className="text-xs sm:text-sm font-bold tracking-tight line-clamp-2">
                  {note.title}
                </h4>
                <p className={`text-[11px] mt-1 line-clamp-1 ${
                  activeNoteId === note.id ? 'text-blue-100' : 'text-slate-400'
                }`}>
                  ⏱️ {note.readTimeMinutes} min de lecture
                </p>
              </button>
            ))}
          </div>

          {/* Active Note Content Viewer */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
              
              {/* Note Header */}
              <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {currentNote.badge}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {onOpenInBlocknote && (
                      <button
                        onClick={() => onOpenInBlocknote(currentNote.title, 'Anglais', currentNote.contentMarkdown)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Transférer la fiche dans le Bloc-notes"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>Ouvrir dans Bloc-notes</span>
                      </button>
                    )}
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {currentNote.title}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {currentNote.summary}
                </p>
              </div>

              {/* Key Takeaways Box */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-2">
                <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>Points Clés à Retenir</span>
                </h4>
                <ul className="space-y-1.5">
                  {currentNote.keyTakeaways.map((point, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 flex items-start gap-2">
                      <span className="text-indigo-500 font-bold shrink-0">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Markdown Body */}
              <div className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed">
                <ReactMarkdown>{currentNote.contentMarkdown}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EXERCISES & DRILLS */}
      {activeTab === 'exercises' && (
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Auto-Évaluation & Drills Grammaticaux</h3>
                <p className="text-xs text-slate-400">Testez vos réflexes sur les temps, faux-amis, inversions et conditionnels</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-400 font-medium">Score Réalisé</p>
                <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                  {exerciseStats.correct} / {exerciseStats.completed} <span className="text-xs font-normal text-slate-400">({exerciseStats.total} total)</span>
                </p>
              </div>

              <button
                onClick={handleResetExercises}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Réinitialiser les exercices"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Exercise Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ENGLISH_EXERCISES_DATABASE.map((ex, index) => {
              const isDone = validatedExercises[ex.id];
              const selectedAns = exerciseAnswers[ex.id];
              const isCorrect = selectedAns === ex.correctAnswer;

              return (
                <div 
                  key={ex.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-xs space-y-4 transition-all ${
                    isDone
                      ? isCorrect
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : 'border-rose-500/50 bg-rose-500/5'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      Exercice #{index + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {ex.category}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{ex.instruction}</p>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {ex.sentence}
                    </h4>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-2 gap-2">
                    {ex.options.map((opt) => {
                      const isSelected = selectedAns === opt;
                      let btnStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200';

                      if (isSelected) {
                        btnStyle = 'bg-blue-600 text-white font-bold shadow-xs';
                      }

                      if (isDone) {
                        if (opt === ex.correctAnswer) {
                          btnStyle = 'bg-emerald-600 text-white font-bold shadow-xs';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'bg-rose-600 text-white font-bold shadow-xs';
                        }
                      }

                      return (
                        <button
                          key={opt}
                          disabled={isDone}
                          onClick={() => handleSelectOption(ex.id, opt)}
                          className={`p-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Validate / Explanation */}
                  {!isDone ? (
                    <button
                      disabled={!selectedAns}
                      onClick={() => handleValidateExercise(ex.id)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                        selectedAns
                          ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Valider ma réponse
                    </button>
                  ) : (
                    <div className={`p-3 rounded-xl text-xs space-y-1 border ${
                      isCorrect 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-900' 
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-900'
                    }`}>
                      <div className="flex items-center gap-1.5 font-bold">
                        {isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <HelpCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                        <span>{isCorrect ? 'Excellente réponse !' : `Réponse correcte : ${ex.correctAnswer}`}</span>
                      </div>
                      <p className="leading-relaxed opacity-90">{ex.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
