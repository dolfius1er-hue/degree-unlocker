import React, { useState, useEffect, useMemo } from 'react';
import { SchoolDocument, Flashcard, FlashcardRating, AppTheme } from '../types';
import { INITIAL_FLASHCARDS } from '../data/seedFlashcards';
import { 
  Sparkles, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Brain, 
  Award, 
  Layers, 
  Shuffle, 
  Printer, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  Search, 
  Filter, 
  Lightbulb, 
  Check, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Flame, 
  Zap, 
  Play, 
  SlidersHorizontal, 
  CheckSquare, 
  Activity, 
  BarChart2, 
  Headphones,
  FileText,
  Bookmark,
  Inbox,
  PenTool,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FlashcardsViewProps {
  documents: SchoolDocument[];
  lang?: 'fr' | 'en';
  onOpenDocInBlocknote?: (doc: SchoolDocument) => void;
  onOpenPlaylists?: () => void;
  activeTheme?: AppTheme;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  documents,
  lang = 'fr',
  onOpenDocInBlocknote,
  onOpenPlaylists,
  activeTheme = 'light',
}) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'decks' | 'study' | 'list' | 'generate' | 'create'>('decks');
  
  // Study session state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    reviewedCount: 0,
    againCount: 0,
    hardCount: 0,
    goodCount: 0,
    easyCount: 0,
  });

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDocId, setSelectedDocId] = useState<string>('all');
  const [boxFilter, setBoxFilter] = useState<'all' | 'due' | 1 | 2 | 3 | 4>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // AI Generator state
  const [generateDocId, setGenerateDocId] = useState<string>(documents[0]?.id || 'custom');
  const [customChapterText, setCustomChapterText] = useState('');
  const [customSubjectName, setCustomSubjectName] = useState('');
  const [cardCount, setCardCount] = useState<number>(6);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateMsg, setGenerateMsg] = useState<string | null>(null);

  // Custom Card Creation State
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newHint, setNewHint] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newChapter, setNewChapter] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedSourceDocId, setSelectedSourceDocId] = useState<string>('custom');

  // Load cards from server or fallback
  useEffect(() => {
    async function loadCards() {
      try {
        setLoading(true);
        const res = await fetch('/api/flashcards');
        if (res.ok) {
          const data = await res.json();
          if (data.flashcards && Array.isArray(data.flashcards)) {
            setCards(data.flashcards);
          } else {
            setCards([]);
          }
        } else {
          setCards([]);
        }
      } catch (err) {
        console.error('Error loading flashcards:', err);
        setCards([]);
      } finally {
        setLoading(false);
      }
    }

    loadCards();
  }, []);

  // Keyboard navigation for study mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'study' || activeTab === 'create' || sessionCompleted) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped) {
        if (e.key === '1') handleRateCard('again');
        else if (e.key === '2') handleRateCard('hard');
        else if (e.key === '3') handleRateCard('good');
        else if (e.key === '4') handleRateCard('easy');
      } else {
        if (e.key === 'ArrowRight') handleNextCard();
        else if (e.key === 'ArrowLeft') handlePrevCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, isFlipped, currentIndex, sessionCompleted]);

  // Distinct subjects from actual user cards
  const subjects = useMemo(() => {
    const subs = new Set<string>();
    cards.forEach((c) => {
      if (c.subject) subs.add(c.subject);
    });
    return Array.from(subs);
  }, [cards]);

  // Today's date string YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filtered cards
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (selectedSubject !== 'all' && card.subject.toLowerCase() !== selectedSubject.toLowerCase()) {
        return false;
      }
      if (selectedDocId !== 'all' && card.docId !== selectedDocId) {
        return false;
      }
      if (boxFilter === 'due') {
        if (card.nextReviewDate > todayStr) return false;
      } else if (typeof boxFilter === 'number') {
        if (card.box !== boxFilter) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchQ = card.question.toLowerCase().includes(q);
        const matchA = card.answer.toLowerCase().includes(q);
        const matchSub = card.subject.toLowerCase().includes(q);
        if (!matchQ && !matchA && !matchSub) return false;
      }
      return true;
    });
  }, [cards, selectedSubject, selectedDocId, boxFilter, searchQuery, todayStr]);

  const currentCard: Flashcard | undefined = filteredCards[currentIndex];

  // Leitner stats
  const stats = useMemo(() => {
    const total = cards.length;
    const box1 = cards.filter((c) => c.box === 1).length;
    const box2 = cards.filter((c) => c.box === 2).length;
    const box3 = cards.filter((c) => c.box === 3).length;
    const box4 = cards.filter((c) => c.box === 4).length;
    const dueToday = cards.filter((c) => c.nextReviewDate <= todayStr).length;
    const masteryPercent = total > 0 ? Math.round((box4 / total) * 100) : 0;

    return { total, box1, box2, box3, box4, dueToday, masteryPercent };
  }, [cards, todayStr]);

  // Spaced Repetition Rating Handler
  const handleRateCard = async (rating: FlashcardRating) => {
    if (!currentCard) return;

    let newBox: 1 | 2 | 3 | 4 = currentCard.box;
    let newInterval = currentCard.intervalDays;
    let newConsecutive = currentCard.consecutiveCorrect;

    switch (rating) {
      case 'again':
        newBox = 1;
        newInterval = 1;
        newConsecutive = 0;
        break;
      case 'hard':
        newBox = currentCard.box === 1 ? 1 : 2;
        newInterval = Math.max(1, Math.round(currentCard.intervalDays * 1.2));
        newConsecutive = 0;
        break;
      case 'good':
        newConsecutive += 1;
        if (currentCard.box === 1) newBox = 2;
        else if (currentCard.box === 2) newBox = 3;
        else newBox = 4;
        newInterval = newBox === 2 ? 3 : newBox === 3 ? 7 : 14;
        break;
      case 'easy':
        newBox = 4;
        newInterval = 14;
        newConsecutive += 2;
        break;
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + newInterval);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    const updatedCard: Flashcard = {
      ...currentCard,
      box: newBox,
      intervalDays: newInterval,
      repetitionCount: currentCard.repetitionCount + 1,
      consecutiveCorrect: newConsecutive,
      lastReviewedAt: new Date().toISOString(),
      nextReviewDate: nextDateStr,
    };

    setCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));

    setSessionStats((prev) => ({
      ...prev,
      reviewedCount: prev.reviewedCount + 1,
      againCount: rating === 'again' ? prev.againCount + 1 : prev.againCount,
      hardCount: rating === 'hard' ? prev.hardCount + 1 : prev.hardCount,
      goodCount: rating === 'good' ? prev.goodCount + 1 : prev.goodCount,
      easyCount: rating === 'easy' ? prev.easyCount + 1 : prev.easyCount,
    }));

    try {
      await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCard),
      });
    } catch (err) {
      console.error('Failed to persist card review:', err);
    }

    if (currentIndex + 1 >= filteredCards.length) {
      setSessionCompleted(true);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const handleNextCard = () => {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const handleShuffleDeck = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  // Start study practice on a selected subject/deck
  const handleStartDeckPractice = (subject: string) => {
    setSelectedSubject(subject);
    setSelectedDocId('all');
    setBoxFilter('all');
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setSessionCompleted(false);
    setSessionStats({ reviewedCount: 0, againCount: 0, hardCount: 0, goodCount: 0, easyCount: 0 });
    setActiveTab('study');
  };

  // Create custom flashcard
  const handleCreateCustomCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    let linkedDoc = documents.find((d) => d.id === selectedSourceDocId);
    const subjectFinal = newSubject.trim() || linkedDoc?.subject || (lang === 'fr' ? 'Général' : 'General');
    const docTitleFinal = newChapter.trim() || linkedDoc?.title || undefined;

    const parsedTags = newTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const createdCard: Flashcard = {
      id: `fc-custom-${Date.now()}`,
      docId: linkedDoc?.id,
      docTitle: docTitleFinal,
      subject: subjectFinal,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      hints: newHint.trim() || undefined,
      difficulty: newDifficulty,
      tags: parsedTags.length > 0 ? parsedTags : [subjectFinal],
      box: 1,
      intervalDays: 1,
      repetitionCount: 0,
      consecutiveCorrect: 0,
      nextReviewDate: todayStr,
    };

    const updated = [createdCard, ...cards];
    setCards(updated);

    try {
      await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createdCard),
      });
    } catch (err) {
      console.error('Failed to persist custom flashcard:', err);
    }

    // Reset form
    setNewQuestion('');
    setNewAnswer('');
    setNewHint('');
    setNewChapter('');
    setNewTags('');
    setActiveTab('decks');
  };

  // Delete card
  const handleDeleteCard = async (cardId: string) => {
    const updated = cards.filter((c) => c.id !== cardId);
    setCards(updated);
    try {
      await fetch(`/api/flashcards/${cardId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete card:', err);
    }
  };

  // Auto-generate cards via AI from document or custom notes
  const handleAutoGenerateCards = async () => {
    setIsGenerating(true);
    setGenerateMsg(null);

    let docTitle = 'Chapitre Personnalisé';
    let subject = customSubjectName.trim() || 'Général';
    let content = customChapterText.trim();
    let docId: string | undefined = undefined;

    if (generateDocId !== 'custom') {
      const doc = documents.find((d) => d.id === generateDocId);
      if (doc) {
        docId = doc.id;
        docTitle = doc.title;
        subject = doc.subject;
        content = doc.content || doc.summary || '';
      }
    }

    if (!content) {
      setIsGenerating(false);
      setGenerateMsg(lang === 'fr' ? 'Veuillez saisir du texte ou sélectionner un document.' : 'Please enter notes or select a document.');
      return;
    }

    try {
      const res = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docId,
          docTitle,
          subject,
          content,
          cardCount,
          language: lang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.flashcards && data.flashcards.length > 0) {
          const newGeneratedCards: Flashcard[] = data.flashcards;
          setCards((prev) => [...newGeneratedCards, ...prev]);
          setGenerateMsg(
            lang === 'fr'
              ? `Succès ! ${newGeneratedCards.length} fiches créées dans "${subject}".`
              : `Success! ${newGeneratedCards.length} flashcards generated in "${subject}".`
          );
          setTimeout(() => {
            setActiveTab('decks');
          }, 1200);
        } else {
          setGenerateMsg(lang === 'fr' ? 'Aucune fiche n\'a pu être générée.' : 'No flashcards generated.');
        }
      } else {
        setGenerateMsg(lang === 'fr' ? 'Erreur lors de la génération des fiches.' : 'Error generating flashcards.');
      }
    } catch (err: any) {
      setGenerateMsg(err.message || 'Error generating cards');
    } finally {
      setIsGenerating(false);
    }
  };

  // Dynamic Decks: Group cards by their real subjects
  const decks = useMemo(() => {
    const map = new Map<string, Flashcard[]>();
    cards.forEach((c) => {
      const sub = c.subject || (lang === 'fr' ? 'Général' : 'General');
      if (!map.has(sub)) map.set(sub, []);
      map.get(sub)!.push(c);
    });

    return Array.from(map.entries()).map(([subjectName, deckCards]) => {
      const total = deckCards.length;
      const mastered = deckCards.filter((c) => c.box === 4).length;
      const due = deckCards.filter((c) => c.nextReviewDate <= todayStr).length;
      const masteryPct = total > 0 ? Math.round((mastered / total) * 100) : 0;
      return {
        subject: subjectName,
        cards: deckCards,
        total,
        mastered,
        due,
        masteryPct,
      };
    });
  }, [cards, todayStr, lang]);

  return (
    <div className="space-y-6">
      
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-200 dark:border-cyan-800">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {lang === 'fr' ? 'Fiches Flashcards Personnalisées' : 'Custom Flashcards & Spaced Repetition'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'fr'
                ? 'Créez vos fiches par chapitre, texte ou idée avec répétition espacée (Leitner).'
                : 'Create flashcards based on your notes, chapters, or ideas with spaced repetition.'}
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('decks')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'decks'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {lang === 'fr' ? 'Mes Paquets' : 'Decks'}
          </button>

          <button
            onClick={() => {
              if (cards.length > 0) {
                handleStartDeckPractice('all');
              }
            }}
            disabled={cards.length === 0}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40 ${
              activeTab === 'study'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{lang === 'fr' ? 'Réviser' : 'Practice'}</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'create'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-600 dark:text-indigo-400 font-extrabold hover:bg-white dark:hover:bg-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? '+ Créer une Fiche' : '+ Custom Card'}</span>
          </button>

          <button
            onClick={() => setActiveTab('generate')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'generate'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-600 dark:text-purple-400 hover:bg-white dark:hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>{lang === 'fr' ? 'Générer IA' : 'AI Generate'}</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'list'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {lang === 'fr' ? 'Toutes les fiches' : 'All Cards'} ({cards.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: DYNAMIC REAL DECKS */}
      {activeTab === 'decks' && (
        <div className="space-y-6">
          
          {/* Global Mastery & Leitner Box Stats */}
          {cards.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {lang === 'fr' ? 'Total Fiches' : 'Total Flashcards'}
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">
                    {stats.total}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">
                    {lang === 'fr' ? 'À réviser aujourd\'hui' : 'Due Today'}
                  </div>
                  <div className="text-2xl font-extrabold text-amber-500 font-mono mt-1">
                    {stats.dueToday}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    {lang === 'fr' ? 'Taux de Maîtrise' : 'Mastery Rate'}
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                    {stats.masteryPercent}%
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                    {lang === 'fr' ? 'Boîte 4 (Maîtrisées)' : 'Box 4 (Mastered)'}
                  </div>
                  <div className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono mt-1">
                    {stats.box4}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}

          {/* Decks Grid */}
          {decks.length === 0 ? (
            /* Clean Empty State */
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Layers className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {lang === 'fr' ? 'Aucune fiche créée pour le moment' : 'No flashcards created yet'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {lang === 'fr'
                    ? 'Créez votre première fiche mémo personnalisée à partir de vos notes de chapitre, ou utilisez l\'IA pour générer un paquet depuis votre cours.'
                    : 'Create your first custom flashcard based on your chapter notes, or use AI to generate cards from your imported lectures.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>{lang === 'fr' ? 'Créer une Fiche Personnalisée' : 'Create Custom Flashcard'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('generate')}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{lang === 'fr' ? 'Générer avec l\'IA depuis un texte/cours' : 'AI Generate from Notes'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  {lang === 'fr' ? 'Paquets par Matière' : 'Decks by Subject'} ({decks.length})
                </h3>
                <button
                  onClick={() => setActiveTab('create')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'fr' ? 'Ajouter une fiche' : 'Add card'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {decks.map((deck) => (
                  <div
                    key={deck.subject}
                    className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-400 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {deck.subject}
                        </span>
                        {deck.due > 0 ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            {deck.due} {lang === 'fr' ? 'à réviser' : 'due'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                            {lang === 'fr' ? 'À jour' : 'Up to date'}
                          </span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                        {deck.subject}
                      </h4>

                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {deck.total} {lang === 'fr' ? (deck.total > 1 ? 'Fiches mémo' : 'Fiche mémo') : (deck.total > 1 ? 'Cards' : 'Card')}
                      </p>

                      {/* Mastery Meter */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-400">{lang === 'fr' ? 'Maîtrise' : 'Mastery'}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{deck.masteryPct}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${deck.masteryPct}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => handleStartDeckPractice(deck.subject)}
                        className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{lang === 'fr' ? 'S\'entraîner' : 'Practice Deck'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* VIEW 2: CREATE CUSTOM FLASHCARD (Based on notes, chapter, text, idea) */}
      {activeTab === 'create' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {lang === 'fr' ? 'Créer une Fiche Mémo Personnalisée' : 'Create Custom Flashcard'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'fr'
                    ? 'Rédigez votre question et votre réponse à partir de vos notes de chapitre, d\'un texte ou d\'une idée.'
                    : 'Craft question & answer based on your chapter notes, text, or ideas.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('decks')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{lang === 'fr' ? 'Retour aux paquets' : 'Back to decks'}</span>
            </button>
          </div>

          <form onSubmit={handleCreateCustomCard} className="space-y-4 max-w-2xl">
            
            {/* Subject / Matière */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'fr' ? 'Matière / Discipline :' : 'Subject / Curriculum :'}
                </label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder={lang === 'fr' ? 'Ex: Philosophie, SVT, Mathématiques...' : 'e.g. Physics, History, Literature...'}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'fr' ? 'Chapitre ou Document Référence (Optionnel) :' : 'Chapter or Reference Note (Optional):'}
                </label>
                <input
                  type="text"
                  value={newChapter}
                  onChange={(e) => setNewChapter(e.target.value)}
                  placeholder={lang === 'fr' ? 'Ex: Chapitre 3 - La Conscience' : 'e.g. Chapter 4 - Thermodynamics'}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-indigo-500"
                />
              </div>
            </div>

            {/* Question */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'fr' ? 'Question d\'évaluation / Notion à retenir :' : 'Active Recall Question / Key Term :'}
              </label>
              <textarea
                rows={2}
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder={lang === 'fr' ? 'Ex: Quelle est la différence entre conscience réflexive et conscience immédiate ?' : 'e.g. What is the definition and core formula of Newton\'s Second Law?'}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-indigo-500"
                required
              />
            </div>

            {/* Answer */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'fr' ? 'Réponse / Définition / Solution attendue :' : 'Answer / Definition / Explanation :'}
              </label>
              <textarea
                rows={3}
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder={lang === 'fr' ? 'Ex: La conscience immédiate est la simple présence à soi et au monde, tandis que la conscience réflexive est le retour de l\'esprit sur lui-même.' : 'e.g. F = ma, where force equals mass times acceleration...'}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-indigo-500"
                required
              />
            </div>

            {/* Hint & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'fr' ? 'Indice ou Mnémonique (Optionnel) :' : 'Hint or Mnemonic (Optional):'}
                </label>
                <input
                  type="text"
                  value={newHint}
                  onChange={(e) => setNewHint(e.target.value)}
                  placeholder={lang === 'fr' ? 'Ex: Pensez au miroir de la réflexion' : 'e.g. Remember the kinetic link'}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'fr' ? 'Niveau de difficulté :' : 'Difficulty Level:'}
                </label>
                <select
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value as any)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-indigo-500"
                >
                  <option value="easy">{lang === 'fr' ? 'Facile' : 'Easy'}</option>
                  <option value="medium">{lang === 'fr' ? 'Moyen' : 'Medium'}</option>
                  <option value="hard">{lang === 'fr' ? 'Difficile' : 'Hard'}</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('decks')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                {lang === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
              >
                {lang === 'fr' ? 'Enregistrer la Fiche' : 'Save Flashcard'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 3: INTERACTIVE STUDY SESSION */}
      {activeTab === 'study' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('decks')}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Retour aux paquets"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-800 dark:text-white">
                {selectedSubject === 'all' ? (lang === 'fr' ? 'Tous les paquets' : 'All Decks') : selectedSubject}
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                ({currentIndex + 1} / {filteredCards.length})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onOpenPlaylists && (
                <button
                  onClick={onOpenPlaylists}
                  className="px-3 py-1.5 rounded-xl bg-pink-50 dark:bg-pink-950/40 hover:bg-pink-100 dark:hover:bg-pink-900/50 text-pink-700 dark:text-pink-300 text-xs font-bold flex items-center gap-1.5 border border-pink-200 dark:border-pink-800 transition-colors cursor-pointer"
                >
                  <Headphones className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                  <span>{lang === 'fr' ? 'Musique Focus' : 'Study Music'}</span>
                </button>
              )}

              <button
                onClick={handleShuffleDeck}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
                title="Mélanger"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Flashcard Component */}
          {filteredCards.length > 0 && currentCard && !sessionCompleted ? (
            <div className="space-y-6">
              {/* Flip Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className={`w-full min-h-[340px] sm:min-h-[380px] rounded-3xl p-8 cursor-pointer transition-all duration-300 transform border shadow-xl flex flex-col justify-between select-none relative overflow-hidden ${
                  isFlipped 
                    ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 border-indigo-500/80 text-white' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-indigo-400'
                }`}
              >
                {/* Top Card Details */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isFlipped ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {currentCard.subject}
                    </span>
                    {currentCard.docTitle && (
                      <span className="text-xs text-slate-400 truncate max-w-xs">
                        • {currentCard.docTitle}
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{lang === 'fr' ? 'Cliquer pour retourner (Espace)' : 'Click or press Space to flip'}</span>
                  </span>
                </div>

                {/* Question / Answer Center */}
                <div className="my-auto py-6 text-center space-y-4">
                  {!isFlipped ? (
                    <div className="space-y-3 max-w-xl mx-auto">
                      <span className="text-xs uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                        {lang === 'fr' ? 'Question d\'Évaluation' : 'Active Recall Question'}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold leading-snug">
                        {currentCard.question}
                      </h3>
                      {currentCard.hints && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowHint(!showHint);
                            }}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium inline-flex items-center gap-1"
                          >
                            <Lightbulb className="w-3.5 h-3.5" />
                            <span>{showHint ? currentCard.hints : (lang === 'fr' ? 'Afficher un indice' : 'Show hint')}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 max-w-xl mx-auto animate-fade-in">
                      <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                        {lang === 'fr' ? 'Réponse Attendue' : 'Key Answer'}
                      </span>
                      <p className="text-lg sm:text-xl font-medium leading-relaxed text-slate-100">
                        {currentCard.answer}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Card Footer */}
                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  <span>{lang === 'fr' ? 'Boîte Leitner' : 'Leitner Box'} {currentCard.box} / 4</span>
                  <span>{currentCard.repetitionCount} {lang === 'fr' ? 'répétitions' : 'reviews'}</span>
                </div>
              </div>

              {/* Leitner Rating Action Buttons */}
              {isFlipped ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    onClick={() => handleRateCard('again')}
                    className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex flex-col items-center gap-1 transition-all cursor-pointer shadow-xs"
                  >
                    <span className="text-xs font-bold">{lang === 'fr' ? 'À revoir (1)' : 'Again (1)'}</span>
                    <span className="text-[10px] text-rose-500 font-mono">1 jour</span>
                  </button>

                  <button
                    onClick={() => handleRateCard('hard')}
                    className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 flex flex-col items-center gap-1 transition-all cursor-pointer shadow-xs"
                  >
                    <span className="text-xs font-bold">{lang === 'fr' ? 'Difficile (2)' : 'Hard (2)'}</span>
                    <span className="text-[10px] text-amber-500 font-mono">2 jours</span>
                  </button>

                  <button
                    onClick={() => handleRateCard('good')}
                    className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 flex flex-col items-center gap-1 transition-all cursor-pointer shadow-xs"
                  >
                    <span className="text-xs font-bold">{lang === 'fr' ? 'Correct (3)' : 'Good (3)'}</span>
                    <span className="text-[10px] text-blue-500 font-mono">3-7 jours</span>
                  </button>

                  <button
                    onClick={() => handleRateCard('easy')}
                    className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex flex-col items-center gap-1 transition-all cursor-pointer shadow-xs"
                  >
                    <span className="text-xs font-bold">{lang === 'fr' ? 'Facile (4)' : 'Easy (4)'}</span>
                    <span className="text-[10px] text-emerald-500 font-mono">14 jours</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePrevCard}
                    disabled={currentIndex === 0}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{lang === 'fr' ? 'Précédente' : 'Previous'}</span>
                  </button>

                  <button
                    onClick={() => setIsFlipped(true)}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    {lang === 'fr' ? 'Afficher la réponse' : 'Flip to Answer'}
                  </button>

                  <button
                    onClick={handleNextCard}
                    disabled={currentIndex >= filteredCards.length - 1}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{lang === 'fr' ? 'Suivante' : 'Next'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : sessionCompleted ? (
            /* Session Completed Screen */
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-5 animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {lang === 'fr' ? 'Session de révision terminée !' : 'Review Session Completed!'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'fr'
                    ? 'Excellent travail. Vos répétitions ont été enregistrées dans votre base locale.'
                    : 'Great job! Your spaced repetition scores have been saved to your local database.'}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="text-xs text-slate-400">{lang === 'fr' ? 'Fiches révisées' : 'Reviewed'}</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{sessionStats.reviewedCount}</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                  <div className="text-xs">{lang === 'fr' ? 'Facile' : 'Easy'}</div>
                  <div className="text-lg font-bold">{sessionStats.easyCount}</div>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                  <div className="text-xs">{lang === 'fr' ? 'Correct' : 'Good'}</div>
                  <div className="text-lg font-bold">{sessionStats.goodCount}</div>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600">
                  <div className="text-xs">{lang === 'fr' ? 'À revoir' : 'Again'}</div>
                  <div className="text-lg font-bold">{sessionStats.againCount}</div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSessionCompleted(false);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                  setActiveTab('decks');
                }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                {lang === 'fr' ? 'Retour aux Paquets' : 'Back to Decks'}
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* VIEW 4: AI FLASHCARD GENERATOR */}
      {activeTab === 'generate' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {lang === 'fr' ? 'Générateur de Flashcards IA' : 'AI Flashcard Generator'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'fr' 
                  ? 'Générez automatiquement des fiches de mémorisation active à partir de vos cours importés ou d\'un texte collé.' 
                  : 'Automatically generate active recall flashcards from your imported notes or pasted text.'}
              </p>
            </div>
          </div>

          <div className="space-y-4 max-w-xl">
            {/* Source Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'fr' ? 'Source du cours :' : 'Course Source:'}
              </label>
              <select
                value={generateDocId}
                onChange={(e) => setGenerateDocId(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-indigo-500"
              >
                <option value="custom">{lang === 'fr' ? '📝 Saisir ou coller un chapitre de cours manuellement' : '📝 Paste custom lecture text directly'}</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    📄 {d.title} ({d.subject})
                  </option>
                ))}
              </select>
            </div>

            {/* If manual text is selected */}
            {generateDocId === 'custom' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'fr' ? 'Matière / Sujet :' : 'Subject Name:'}
                  </label>
                  <input
                    type="text"
                    value={customSubjectName}
                    onChange={(e) => setCustomSubjectName(e.target.value)}
                    placeholder={lang === 'fr' ? 'Ex: Droit Constitutionnel, SVT, Philosophie...' : 'e.g. Molecular Biology, Economics...'}
                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'fr' ? 'Texte ou notes du chapitre à transformer :' : 'Lecture text / notes to convert:'}
                  </label>
                  <textarea
                    rows={5}
                    value={customChapterText}
                    onChange={(e) => setCustomChapterText(e.target.value)}
                    placeholder={lang === 'fr' ? 'Collez ici le texte du cours, les notions, théorèmes ou résumés...' : 'Paste your course content, theorems, definitions or notes here...'}
                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'fr' ? 'Nombre de fiches à générer :' : 'Card Count:'}
              </label>
              <input
                type="number"
                min="2"
                max="15"
                value={cardCount}
                onChange={(e) => setCardCount(parseInt(e.target.value) || 6)}
                className="w-24 p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={handleAutoGenerateCards}
              disabled={isGenerating}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-50 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isGenerating 
                  ? (lang === 'fr' ? 'Génération par l\'IA...' : 'Generating cards...') 
                  : (lang === 'fr' ? 'Générer les Fiches' : 'Generate Cards')}
              </span>
            </button>

            {generateMsg && (
              <p className="text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 p-3 rounded-xl border border-purple-200 dark:border-purple-800">
                {generateMsg}
              </p>
            )}
          </div>
        </div>
      )}

      {/* VIEW 5: ALL CARDS LIST & SEARCH */}
      {activeTab === 'list' && (
        <div className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'fr' ? 'Filtrer par mot-clé...' : 'Search question or answer...'}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={() => setActiveTab('create')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Créer une Fiche' : 'Add Flashcard'}</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
            {filteredCards.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-xl">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                      {c.subject}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                      Box {c.box}
                    </span>
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white">{c.question}</h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{c.answer}</p>
                </div>

                <button
                  onClick={() => handleDeleteCard(c.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
