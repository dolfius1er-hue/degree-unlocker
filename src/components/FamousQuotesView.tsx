import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FAMOUS_QUOTES, FamousQuote } from '../data/famousQuotes';
import { 
  ALL_DOLFIUS_MAXIMS, 
  DOLFIUS_FOUR_MAXIMS, 
  DOLFIUS_NEW_MAXIMS, 
  IMAGE_MAXIMES_11, 
  PHILOSOPHY_AND_FOUR_MAXIMS 
} from '../data/quotes';
import { AppLanguage } from '../types';
import { speechEngine, VoiceDescriptor } from '../utils/speech';
import { 
  Quote, 
  Search, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Sparkles, 
  Atom, 
  Landmark, 
  ShieldAlert, 
  ScrollText, 
  Skull, 
  BookOpen, 
  Shuffle, 
  Bookmark,
  Share2,
  Crown,
  Brain,
  Sliders,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Settings2,
  Play,
  Square,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  Filter,
  X,
  RefreshCw
} from 'lucide-react';

interface FamousQuotesViewProps {
  lang?: AppLanguage;
  onOpenDocWithTopic?: (topic: string) => void;
  initialCategory?: string;
  initialSubcategory?: 'all' | 'dolfius_4_maximes' | 'image_maximes';
}

const shuffleQuotes = (quotes: FamousQuote[]): FamousQuote[] => {
  const shuffled = [...quotes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const MASTER_INITIAL_QUOTES: FamousQuote[] = FAMOUS_QUOTES;

const getRandomTwoDolfius = (): FamousQuote[] => {
  const shuffled = [...ALL_DOLFIUS_MAXIMS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 2);
};

export const FamousQuotesView: React.FC<FamousQuotesViewProps> = ({
  lang = 'fr',
  onOpenDocWithTopic,
  initialCategory = 'all',
  initialSubcategory = 'all',
}) => {
  // Randomize initial quotes on each app open / component mount
  const [allQuotes, setAllQuotes] = useState<FamousQuote[]>(() => shuffleQuotes(MASTER_INITIAL_QUOTES));
  const [isFetchingNew, setIsFetchingNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState<'all' | 'dolfius_4_maximes' | 'image_maximes'>(initialSubcategory);
  const [isPhilosophyGroupExpanded, setIsPhilosophyGroupExpanded] = useState<boolean>(true);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  
  // Voice engine state
  const [availableVoices, setAvailableVoices] = useState<VoiceDescriptor[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>(speechEngine.getPreferredVoiceURI() || '');
  const [speechRate, setSpeechRate] = useState<number>(0.92);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [featuredQuote, setFeaturedQuote] = useState<FamousQuote>(() => {
    const randomIndex = Math.floor(Math.random() * MASTER_INITIAL_QUOTES.length);
    return MASTER_INITIAL_QUOTES[randomIndex] || PHILOSOPHY_AND_FOUR_MAXIMS[0];
  }); 
  const [featuredCreatorQuotes, setFeaturedCreatorQuotes] = useState<FamousQuote[]>(() => getRandomTwoDolfius());
  const [pinnedIds, setPinnedIds] = useState<string[]>(['quote-dolfius-attitude-complete']);

  // Sync initialCategory / subcategory if prop changes
  useEffect(() => {
    if (initialCategory && initialCategory !== 'all') {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (initialSubcategory && initialSubcategory !== 'all') {
      setSelectedSubcategory(initialSubcategory);
    }
  }, [initialSubcategory]);

  // Load voices when available
  useEffect(() => {
    const targetLang: 'fr' | 'en' = lang === 'en' ? 'en' : 'fr';
    const updateVoices = () => {
      const list = speechEngine.getAvailableVoices(targetLang);
      setAvailableVoices(list);
      if (!selectedVoiceURI && list.length > 0) {
        const best = speechEngine.getBestVoice(targetLang);
        if (best) setSelectedVoiceURI(best.voiceURI);
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [lang]);

  // Fetch session quotes
  useEffect(() => {
    const fetchNewSessionQuotes = async () => {
      if (sessionStorage.getItem('fetched_session_quotes')) return;
      setIsFetchingNew(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newBonusQuotes: FamousQuote[] = [
        {
          id: 'quote-dyn-1',
          quote: "The only true wisdom is in knowing you know nothing.",
          quoteFr: "La seule vraie sagesse est de savoir que vous ne savez rien.",
          author: "Socrates",
          role: "Greek Philosopher",
          category: 'philosophy',
          year: "400 BC",
          context: "Foundational thought of Socratic questioning.",
          contextFr: "Pensée fondamentale du questionnement socratique."
        },
        {
          id: 'quote-dyn-2',
          quote: "I am not afraid of storms, for I am learning how to sail my ship.",
          quoteFr: "Je n'ai pas peur des tempêtes, car j'apprends à naviguer sur mon navire.",
          author: "Louisa May Alcott",
          role: "American Novelist",
          category: 'literature_wisdom',
          year: "1868",
          context: "From Little Women, highlighting personal growth through adversity.",
          contextFr: "Tiré des Quatre Filles du docteur March, soulignant la croissance personnelle par l'adversité."
        },
        {
          id: 'quote-dyn-3',
          quote: "In the middle of every difficulty lies opportunity.",
          quoteFr: "Au milieu de chaque difficulté se trouve une opportunité.",
          author: "Albert Einstein",
          role: "Theoretical Physicist",
          category: 'science_cosmos',
          year: "1942",
          context: "Encouraging a positive perspective on challenges.",
          contextFr: "Encouragement à adopter une perspective positive face aux défis."
        }
      ];
      
      setAllQuotes(prev => {
        const existingIds = new Set(prev.map(q => q.id));
        const toAdd = newBonusQuotes.filter(q => !existingIds.has(q.id));
        return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
      });
      sessionStorage.setItem('fetched_session_quotes', 'true');
      setIsFetchingNew(false);
    };
    
    fetchNewSessionQuotes();
  }, []);

  // Main featured categories (All categories are first-class, clearly separated)
  const mainCategories = useMemo(() => [
    { 
      id: 'all', 
      labelFr: 'Toutes les citations', 
      labelEn: 'All Quotes', 
      icon: Quote, 
      count: allQuotes.length 
    },
    { 
      id: 'philosophy_maxims', 
      labelFr: 'Maximes de Dolfius 1er & Sagesses', 
      labelEn: 'Dolfius 1st Maxims & Wisdom', 
      icon: Crown, 
      count: allQuotes.filter(q => q.category === 'philosophy_maxims').length 
    },
    { 
      id: 'philosophy', 
      labelFr: 'Philosophie Antique & Moderne', 
      labelEn: 'Ancient & Modern Philosophy', 
      icon: Landmark, 
      count: allQuotes.filter(q => q.category === 'philosophy').length 
    },
    { 
      id: 'science_cosmos', 
      labelFr: 'Cosmos & Sciences', 
      labelEn: 'Science & Cosmos', 
      icon: Atom, 
      count: allQuotes.filter(q => q.category === 'science_cosmos').length 
    },
    { 
      id: 'war_speeches', 
      labelFr: 'Déclarations de Guerre & Discours', 
      labelEn: 'War Speeches & Battles', 
      icon: ShieldAlert, 
      count: allQuotes.filter(q => q.category === 'war_speeches').length 
    },
    { 
      id: 'historic_declarations', 
      labelFr: 'Déclarations Historiques', 
      labelEn: 'Historic Declarations', 
      icon: ScrollText, 
      count: allQuotes.filter(q => q.category === 'historic_declarations').length 
    },
    { 
      id: 'famous_deaths', 
      labelFr: 'Dernières Paroles & Morts Célèbres', 
      labelEn: 'Famous Deaths & Last Words', 
      icon: Skull, 
      count: allQuotes.filter(q => q.category === 'famous_deaths').length 
    },
    { 
      id: 'literature_wisdom', 
      labelFr: 'Littérature & Sagesse', 
      labelEn: 'Literature & Wisdom', 
      icon: BookOpen, 
      count: allQuotes.filter(q => q.category === 'literature_wisdom').length 
    },
  ], [allQuotes]);

  const dolfiusQuotesCount = useMemo(() => 
    allQuotes.filter(q => q.category === 'philosophy_maxims' && q.author.includes('Dolfius')).length
  , [allQuotes]);

  const imageMaximesCount = useMemo(() => 
    allQuotes.filter(q => q.category === 'philosophy_maxims' && q.subcategory === 'image_maximes').length
  , [allQuotes]);

  // Filtered quotes based on search, category and subcategory
  const filteredQuotes = useMemo(() => {
    return allQuotes.filter((q) => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'philosophy_group') {
          if (q.category !== 'philosophy_maxims' && q.category !== 'philosophy') {
            return false;
          }
        } else if (q.category !== selectedCategory) {
          return false;
        }
      }
      // Subcategory filter for philosophy_maxims
      if ((selectedCategory === 'philosophy_maxims' || selectedCategory === 'philosophy_group') && selectedSubcategory !== 'all') {
        if (selectedSubcategory === 'dolfius_4_maximes') {
          if (!q.author.includes('Dolfius')) return false;
        } else if (selectedSubcategory === 'image_maximes') {
          if (q.subcategory !== 'image_maximes') return false;
        }
      }
      // Search filter across text, author, role, context, category and subcategory
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const text = (lang === 'fr' ? q.quoteFr : q.quote).toLowerCase();
        const author = q.author.toLowerCase();
        const role = q.role.toLowerCase();
        const context = (lang === 'fr' ? q.contextFr : q.context).toLowerCase();
        const categoryKey = (q.category || '').toLowerCase();
        const subcategoryKey = (q.subcategory || '').toLowerCase();

        const isMaximeMatch = (categoryKey === 'philosophy_maxims' || subcategoryKey.includes('maxime')) &&
          ('maximes'.includes(query) || 'maxime'.includes(query) || 'philosophie'.includes(query) || 'dolfius'.includes(query) || 'attitude'.includes(query) || 'respect'.includes(query));

        const isPhilosophyMatch = (categoryKey === 'philosophy' || categoryKey === 'philosophy_maxims') && ('philosophie'.includes(query) || 'antiquite'.includes(query) || 'sagesse'.includes(query));
        const isScienceMatch = categoryKey === 'science_cosmos' && ('science'.includes(query) || 'cosmos'.includes(query) || 'physique'.includes(query) || 'astronomie'.includes(query));
        const isWarMatch = categoryKey === 'war_speeches' && ('guerre'.includes(query) || 'discours'.includes(query) || 'bataille'.includes(query) || 'courage'.includes(query));
        const isHistoryMatch = categoryKey === 'historic_declarations' && ('histoire'.includes(query) || 'declaration'.includes(query) || 'politique'.includes(query));
        const isLitMatch = categoryKey === 'literature_wisdom' && ('litterature'.includes(query) || 'poesie'.includes(query) || 'romans'.includes(query));

        return text.includes(query) || 
               author.includes(query) || 
               role.includes(query) || 
               context.includes(query) || 
               categoryKey.includes(query) || 
               subcategoryKey.includes(query) || 
               isMaximeMatch || 
               isPhilosophyMatch || 
               isScienceMatch || 
               isWarMatch || 
               isHistoryMatch || 
               isLitMatch;
      }
      return true;
    });
  }, [searchQuery, selectedCategory, selectedSubcategory, lang, allQuotes]);

  useEffect(() => {
    return () => {
      speechEngine.stop();
    };
  }, []);

  const handleCopy = (q: FamousQuote) => {
    const textToCopy = `"${lang === 'fr' ? q.quoteFr : q.quote}" — ${q.author} (${q.year})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (q: FamousQuote) => {
    if (speakingId === q.id) {
      speechEngine.stop();
      setSpeakingId(null);
      return;
    }

    speechEngine.stop();
    setSpeakingId(null);

    const quoteText = lang === 'fr' ? q.quoteFr : q.quote;
    const authorPrefix = lang === 'fr' ? 'Auteur :' : 'Author:';
    const textToSpeak = `${quoteText}. ${authorPrefix} ${q.author}.`;

    speechEngine.speak(textToSpeak, {
      lang: lang === 'fr' ? 'fr' : 'en',
      voiceURI: selectedVoiceURI || undefined,
      rate: speechRate,
      pitch: speechPitch,
      volume: 1.0,
      onStart: () => setSpeakingId(q.id),
      onEnd: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  const handleTestVoice = (customText?: string) => {
    const testSample = customText || (lang === 'fr'
      ? "La culture ne s'hérite pas, elle se conquiert. La véritable sagesse commence par l'effort intellectuel et la curiosité au quotidien."
      : "Education is not inherited, it is conquered. True wisdom begins with intellectual effort and daily curiosity.");

    if (speakingId === 'test-voice') {
      speechEngine.stop();
      setSpeakingId(null);
      return;
    }

    speechEngine.stop();
    speechEngine.speak(testSample, {
      lang: lang === 'fr' ? 'fr' : 'en',
      voiceURI: selectedVoiceURI || undefined,
      rate: speechRate,
      pitch: speechPitch,
      volume: 1.0,
      onStart: () => setSpeakingId('test-voice'),
      onEnd: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  const handleRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * FAMOUS_QUOTES.length);
    setFeaturedQuote(FAMOUS_QUOTES[randomIndex]);
  };

  const handleReshuffleQuotes = () => {
    setAllQuotes(prev => shuffleQuotes(prev));
    const randomIndex = Math.floor(Math.random() * FAMOUS_QUOTES.length);
    setFeaturedQuote(FAMOUS_QUOTES[randomIndex]);
  };

  const togglePin = (id: string) => {
    setPinnedIds((prev) => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getCategoryBadge = (category: FamousQuote['category']) => {
    switch (category) {
      case 'philosophy_maxims':
        return { 
          label: lang === 'fr' ? 'Philosophie & 4 Maximes (15)' : 'Philosophy & 4 Maxims (15)', 
          color: 'bg-amber-100 text-amber-900 border-amber-300 font-bold' 
        };
      case 'science_cosmos':
        return { label: lang === 'fr' ? 'Cosmos & Sciences' : 'Science & Cosmos', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'war_speeches':
        return { label: lang === 'fr' ? 'Discours de Guerre' : 'War Speech', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'philosophy':
        return { label: lang === 'fr' ? 'Philosophie' : 'Philosophy', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'historic_declarations':
        return { label: lang === 'fr' ? 'Déclaration' : 'Declaration', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'famous_deaths':
        return { label: lang === 'fr' ? 'Dernières Paroles' : 'Last Words', color: 'bg-slate-100 text-slate-800 border-slate-300' };
      case 'literature_wisdom':
        return { label: lang === 'fr' ? 'Littérature & Sagesse' : 'Wisdom', color: 'bg-purple-50 text-purple-700 border-purple-200' };
    }
  };

  const activeLangCode: 'fr' | 'en' = lang === 'en' ? 'en' : 'fr';
  const bestVoice = speechEngine.getBestVoice(activeLangCode, selectedVoiceURI);

  return (
    <div className="space-y-6">
      {/* Header section with category shortcuts & voice studio trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Quote className="w-6 h-6 text-indigo-600" />
              {lang === 'fr' ? 'Sagesse, Discours & 4 Maximes' : 'Wisdom, Speeches & 4 Maxims'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              300+ Citations
            </span>
          </div>
          <p className="text-slate-500 mt-1 max-w-2xl text-xs sm:text-sm">
            {lang === 'fr'
              ? "Collection de plus de 300 citations et maximes d'éloquence, des maximes de Dolfius 1er aux grandes pensées scientifiques et philosophiques."
              : 'Collection of 300+ quotes and maxims, from Dolfius 1st foundational maxims to philosophical and scientific eloquence.'}
          </p>
        </div>

        {/* Action Controls: Voice Studio Toggle & Side Drawer Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsVoiceSettingsOpen(!isVoiceSettingsOpen)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border cursor-pointer ${
              isVoiceSettingsOpen 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-xs'
            }`}
            title={lang === 'fr' ? 'Configurer la voix naturelle et tester la diction' : 'Configure natural voice and diction'}
          >
            <Settings2 className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">{lang === 'fr' ? 'Studio Vocal HD' : 'Voice Studio'}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 font-mono font-bold">
              {bestVoice ? (bestVoice.name.includes('Natural') || bestVoice.name.includes('Online') ? 'HD Naturelle' : 'Améliorée') : 'Auto'}
            </span>
          </button>

          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border cursor-pointer ${
              isSidePanelOpen 
                ? 'bg-slate-900 text-white border-slate-800 shadow-sm' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-xs'
            }`}
            title={isSidePanelOpen ? 'Masquer le panneau latéral' : 'Afficher les sous-catégories sur le côté'}
          >
            {isSidePanelOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            <span className="hidden sm:inline">{lang === 'fr' ? 'Sous-Catégories' : 'Sub-Categories'}</span>
          </button>
        </div>
      </div>

      {/* Voice Studio Configuration Bar (Expandable) */}
      {isVoiceSettingsOpen && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white border border-indigo-800/80 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <h4 className="text-sm font-bold text-white">
                  {lang === 'fr' ? 'Studio Vocal & Voix Naturelle Haute Définition' : 'High-Definition Natural Voice Studio'}
                </h4>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {lang === 'fr'
                  ? 'Correction anti-robotique activée : suppression des tirets, ponctuation fluide et sélection des voix neuronales.'
                  : 'Anti-robotic normalization active: hyphen filtering, fluid pauses, and neural voice selection.'}
              </p>
            </div>

            <button
              onClick={() => handleTestVoice()}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
            >
              {speakingId === 'test-voice' ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>{lang === 'fr' ? 'Arrêter la lecture' : 'Stop Audio'}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{lang === 'fr' ? 'Tester la voix (Écouter un extrait)' : 'Test Voice (Listen Sample)'}</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Voice Dropdown */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">
                {lang === 'fr' ? 'Voix Détectée sur votre appareil :' : 'Detected Voice on Device:'}
              </label>
              <select
                value={selectedVoiceURI}
                onChange={(e) => {
                  const uri = e.target.value;
                  setSelectedVoiceURI(uri);
                  speechEngine.setPreferredVoiceURI(uri);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">{lang === 'fr' ? '🌟 Sélection Automatique (Meilleure Voix Naturelle)' : '🌟 Auto Select (Best Natural)'}</option>
                {availableVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.qualityLabel})
                  </option>
                ))}
              </select>
            </div>

            {/* Speech Rate & Pitch Sliders */}
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-300 font-semibold">
                  <span>{lang === 'fr' ? 'Cadence (Vitesse) :' : 'Speech Rate:'}</span>
                  <span className="font-mono text-amber-300 font-bold">{speechRate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.20"
                  step="0.05"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-300 font-semibold">
                  <span>{lang === 'fr' ? 'Tonalité (Pitch) :' : 'Voice Pitch:'}</span>
                  <span className="font-mono text-cyan-300 font-bold">{speechPitch.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.80"
                  max="1.25"
                  step="0.05"
                  value={speechPitch}
                  onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Voice Info Summary & Quick Presets */}
            <div className="bg-slate-850 p-3 rounded-xl border border-white/10 flex flex-col justify-between gap-2">
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Voix Active :</span>
                <span className="text-xs font-bold text-indigo-300 truncate block">
                  {bestVoice ? bestVoice.name : (lang === 'fr' ? 'Voix système standard' : 'Standard system voice')}
                </span>
                <span className="text-[10px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {lang === 'fr' ? 'Prêt pour l\'écoute haute fidélité' : 'Ready for high-fidelity audio'}
                </span>
              </div>

              {/* Presets */}
              <div className="pt-2 border-t border-white/10">
                <span className="text-[10px] text-slate-400 block mb-1">Préréglages d'intonation :</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => { setSpeechRate(0.92); setSpeechPitch(1.0); }}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-medium border border-white/10"
                  >
                    Naturel
                  </button>
                  <button
                    onClick={() => { setSpeechRate(0.86); setSpeechPitch(0.88); }}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-medium border border-white/10"
                  >
                    Grave & Solennel
                  </button>
                  <button
                    onClick={() => { setSpeechRate(1.02); setSpeechPitch(1.06); }}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-medium border border-white/10"
                  >
                    Vif & Expressif
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Expert Neural Voice Recommendation Box */}
          <div className="p-3 rounded-xl bg-indigo-900/40 border border-indigo-500/30 text-[11px] text-indigo-200 space-y-1">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'fr' ? 'Comment obtenir une vraie voix humaine non mécanique ?' : 'How to get a realistic non-robotic voice?'}</span>
            </span>
            <p className="leading-relaxed">
              {lang === 'fr'
                ? "Les anciennes voix Windows locales (ex: Paul, Hortense) sont mécaniques par défaut. Pour profiter gratuitement de voix humaines neuronales de qualité studio : utilisez l'application dans Microsoft Edge (voix 'Microsoft Denise Online' ou 'Henri Online') ou Google Chrome ('Google français'). Sous Windows 11, vous pouvez aussi installer des voix naturelles dans Paramètres > Heure et langue > Voix."
                : "Standard desktop synthesis engines may sound mechanical. For studio-grade neural voices: open the app in Microsoft Edge (featuring Denise or Henri Online) or Google Chrome (Google French). On Windows 11, download Natural voices in Settings > Time & Language > Speech."}
            </p>
          </div>
        </div>
      )}

      {/* Featured Quote of the Moment (Spotlight Banner) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-lg border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start justify-between">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-linear-to-r from-amber-400 to-amber-600 text-slate-950 flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? 'Citation en Vedette' : 'Featured Spotlight'}</span>
              </span>
              <span className="text-xs font-semibold text-indigo-300 font-mono">
                {featuredQuote.author} • {featuredQuote.year}
              </span>
            </div>

            <blockquote className="text-lg sm:text-2xl font-serif leading-relaxed italic border-l-4 border-amber-400 pl-4 py-1 whitespace-pre-line">
              &ldquo;{lang === 'fr' ? featuredQuote.quoteFr : featuredQuote.quote}&rdquo;
            </blockquote>

            <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-300">
              <span className="font-semibold text-white">{featuredQuote.author}</span>
              <span>•</span>
              <span className="text-slate-400">{featuredQuote.role}</span>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-row md:flex-col gap-2 shrink-0 self-end md:self-auto">
            <button
              onClick={handleRandomQuote}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
              title={lang === 'fr' ? 'Afficher une autre citation au hasard' : 'Discover another quote'}
            >
              <Shuffle className="w-4 h-4 text-indigo-300" />
              <span>{lang === 'fr' ? 'Autre citation' : 'Random Quote'}</span>
            </button>

            <button
              onClick={() => handleSpeak(featuredQuote)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
            >
              {speakingId === featuredQuote.id ? (
                <>
                  <VolumeX className="w-4 h-4 text-rose-300 animate-pulse" />
                  <span>{lang === 'fr' ? 'Arrêter' : 'Stop Audio'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-amber-300" />
                  <span>{lang === 'fr' ? 'Écouter la voix' : 'Listen Speech'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleCopy(featuredQuote)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              {copiedId === featuredQuote.id ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'fr' ? 'Copié !' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{lang === 'fr' ? 'Copier' : 'Copy Text'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout with Side Category Sub-panel */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* COLLAPSIBLE LATERAL SUB-CATEGORY PANEL (On the Side) */}
        {isSidePanelOpen && (
          <aside className="w-full lg:w-72 shrink-0 space-y-4 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  {lang === 'fr' ? 'Catégories & Maximes' : 'Categories & Maxims'}
                </h3>
              </div>
              <button
                onClick={() => setIsSidePanelOpen(false)}
                className="lg:hidden p-1 text-slate-400 hover:text-slate-600"
                title="Fermer"
              >
                ✕
              </button>
            </div>

            {/* All Categories Listed with Collapsible Group for Philosophy & Maxims */}
            <div className="space-y-1">
              {/* 1. All Quotes */}
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSubcategory('all');
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <Quote className={`w-3.5 h-3.5 shrink-0 ${selectedCategory === 'all' ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span className="truncate">{lang === 'fr' ? 'Toutes les citations' : 'All Quotes'}</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === 'all' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-600'
                }`}>
                  {allQuotes.length}
                </span>
              </button>

              {/* 2. Collapsible Group: Philosophie & Maximes de Dolfius 1er */}
              <div className="space-y-0.5 rounded-xl border border-amber-200/80 bg-gradient-to-b from-amber-50/60 to-white/40 p-1">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedCategory('philosophy_group');
                      setSelectedSubcategory('all');
                    }}
                    className={`flex-1 text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      selectedCategory === 'philosophy_group' || selectedCategory === 'philosophy_maxims' || selectedCategory === 'philosophy'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'text-amber-950 hover:bg-amber-100/70'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Crown className="w-4 h-4 text-amber-700 shrink-0" />
                      <span className="truncate">{lang === 'fr' ? 'Philosophie & Maximes' : 'Philosophy & Maxims'}</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-900/10 text-amber-950 font-black">
                      {allQuotes.filter(q => q.category === 'philosophy_maxims' || q.category === 'philosophy').length}
                    </span>
                  </button>

                  <button
                    onClick={() => setIsPhilosophyGroupExpanded(prev => !prev)}
                    className="p-1.5 text-amber-800 hover:text-amber-950 hover:bg-amber-200/50 rounded-md transition-transform cursor-pointer"
                    title={isPhilosophyGroupExpanded ? (lang === 'fr' ? 'Replier' : 'Collapse') : (lang === 'fr' ? 'Déplier' : 'Expand')}
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isPhilosophyGroupExpanded ? '' : '-rotate-90'}`} />
                  </button>
                </div>

                {/* Collapsible Sub-categories */}
                {isPhilosophyGroupExpanded && (
                  <div className="pl-2 pr-1 py-1 space-y-1 text-[11px] animate-in fade-in duration-150">
                    {/* Dolfius Maxims (All) */}
                    <button
                      onClick={() => {
                        setSelectedCategory('philosophy_maxims');
                        setSelectedSubcategory('all');
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg font-bold flex items-center justify-between transition-colors cursor-pointer ${
                        selectedCategory === 'philosophy_maxims' && selectedSubcategory === 'all'
                          ? 'bg-slate-900 text-amber-300 shadow-xs'
                          : 'text-amber-900 hover:bg-amber-100/80'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="truncate">{lang === 'fr' ? 'Maximes de Dolfius 1er' : 'Dolfius Maxims'}</span>
                      </span>
                      <span className="text-[10px] opacity-80">{dolfiusQuotesCount + imageMaximesCount}</span>
                    </button>

                    {/* Dolfius 4 Maximes Sub */}
                    <button
                      onClick={() => {
                        setSelectedCategory('philosophy_maxims');
                        setSelectedSubcategory('dolfius_4_maximes');
                      }}
                      className={`w-full text-left pl-5 pr-2.5 py-1 rounded-lg font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        selectedCategory === 'philosophy_maxims' && selectedSubcategory === 'dolfius_4_maximes'
                          ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                          : 'text-slate-700 hover:bg-amber-100/60'
                      }`}
                    >
                      <span className="truncate">{lang === 'fr' ? '• Discours & Piliers' : '• Speeches & Maxims'}</span>
                      <span className="text-[10px] opacity-80">{dolfiusQuotesCount}</span>
                    </button>

                    {/* Image Maximes Sub */}
                    <button
                      onClick={() => {
                        setSelectedCategory('philosophy_maxims');
                        setSelectedSubcategory('image_maximes');
                      }}
                      className={`w-full text-left pl-5 pr-2.5 py-1 rounded-lg font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        selectedCategory === 'philosophy_maxims' && selectedSubcategory === 'image_maximes'
                          ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                          : 'text-slate-700 hover:bg-amber-100/60'
                      }`}
                    >
                      <span className="truncate">{lang === 'fr' ? '• Maximes d\'Attitude' : '• Attitude Maxims'}</span>
                      <span className="text-[10px] opacity-80">{imageMaximesCount}</span>
                    </button>

                    {/* Ancient & Modern Philosophy */}
                    <button
                      onClick={() => {
                        setSelectedCategory('philosophy');
                        setSelectedSubcategory('all');
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg font-bold flex items-center justify-between transition-colors cursor-pointer ${
                        selectedCategory === 'philosophy'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <Landmark className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span className="truncate">{lang === 'fr' ? 'Philosophie Antique' : 'Philosophy'}</span>
                      </span>
                      <span className="text-[10px] opacity-80">{allQuotes.filter(q => q.category === 'philosophy').length}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Other Main Categories */}
              {mainCategories.filter(cat => cat.id !== 'all' && cat.id !== 'philosophy_maxims' && cat.id !== 'philosophy').map(cat => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedSubcategory('all');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-900 text-white shadow-xs' 
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                      <span className="truncate">{lang === 'fr' ? cat.labelFr : cat.labelEn}</span>
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* MAIN BODY: SEARCH, QUICK PILLS & QUOTES CARDS */}
        <div className="flex-1 w-full space-y-6 min-w-0">
          
          {/* Filter, Search & Shuffle Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'fr' ? "Rechercher une citation, auteur ou mot-clé (ex: Dolfius, Socrate, Einstein, Attitude)..." : "Search quotes, authors or keywords (e.g. Dolfius, Socrates, Einstein, Attitude)..."}
                  className="w-full pl-10 pr-9 py-2 border border-slate-200 rounded-full bg-slate-50 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full cursor-pointer"
                    title={lang === 'fr' ? 'Effacer la recherche' : 'Clear search'}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  onClick={handleReshuffleQuotes}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                  title={lang === 'fr' ? 'Mélanger l\'ordre des citations (nouvel ordre aléatoire)' : 'Shuffle quotes order (new random sequence)'}
                >
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{lang === 'fr' ? 'Ordre Aléatoire' : 'Reshuffle'}</span>
                </button>

                <div className="text-xs text-slate-500 font-medium">
                  <strong>{filteredQuotes.length}</strong> {lang === 'fr' ? 'citations' : 'quotes'}
                </div>
              </div>
            </div>

            {/* Horizontal Main Category Quick Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-slate-100 pt-3">
              {mainCategories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedSubcategory('all');
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{lang === 'fr' ? cat.labelFr : cat.labelEn}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-500'}`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* In-Line Subcategory Filter Pills (Displayed naturally when in Philosophy & Maxims) */}
            {selectedCategory === 'philosophy_maxims' && (
              <div className="pt-2 border-t border-amber-100 flex items-center gap-2 flex-wrap animate-in fade-in duration-150">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1 mr-1">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  <span>{lang === 'fr' ? 'Filtrer les maximes :' : 'Filter maxims:'}</span>
                </span>
                <button
                  onClick={() => setSelectedSubcategory('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedSubcategory === 'all'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-amber-50/70 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
                  }`}
                >
                  {lang === 'fr' ? 'Toutes les Maximes' : 'All Maxims'} ({dolfiusQuotesCount + imageMaximesCount})
                </button>
                <button
                  onClick={() => setSelectedSubcategory('dolfius_4_maximes')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedSubcategory === 'dolfius_4_maximes'
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'bg-amber-50/70 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
                  }`}
                >
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>{lang === 'fr' ? 'Maximes de Dolfius 1er' : 'Dolfius 1st Maxims'} ({dolfiusQuotesCount})</span>
                </button>
                <button
                  onClick={() => setSelectedSubcategory('image_maximes')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedSubcategory === 'image_maximes'
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'bg-amber-50/70 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  <span>{lang === 'fr' ? 'Maximes Illustrées' : 'Image Maxims'} ({imageMaximesCount})</span>
                </button>
              </div>
            )}
          </div>

          {/* Dedicated Section: Maximes & Principes de Dolfius 1er (Shown in philosophy_maxims when viewing all or dolfius maximes) */}
          {selectedCategory === 'philosophy_maxims' && selectedSubcategory !== 'image_maximes' && (
            <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-400/40 shadow-xl space-y-4 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-800/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-linear-to-r from-amber-400 to-amber-600 text-slate-950 flex items-center gap-1.5 shadow-xs">
                      <Crown className="w-3.5 h-3.5" />
                      <span>{lang === 'fr' ? "Citations en Vedette du Créateur" : "Featured Creator Quotes"}</span>
                    </span>
                    <span className="text-xs font-semibold text-amber-300 font-mono">
                      Dolfius 1er • DegreeUnlocker
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30">
                      {lang === 'fr' ? '2 maximes aléatoires' : '2 random maxims'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{lang === 'fr' ? "Maximes & Principes de Dolfius 1er" : "Maxims & Principles of Dolfius 1st"}</span>
                  </h3>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  <button
                    onClick={() => setFeaturedCreatorQuotes(getRandomTwoDolfius())}
                    className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 hover:text-white border border-amber-400/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    title={lang === 'fr' ? 'Tirer 2 autres maximes au sort' : 'Shuffle 2 random maxims'}
                  >
                    <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'fr' ? 'Changer (2 aléatoires)' : 'Shuffle (2 random)'}</span>
                  </button>

                  <button
                    onClick={() => setSelectedSubcategory('dolfius_4_maximes')}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <span>{lang === 'fr' ? `Voir les ${dolfiusQuotesCount}` : `View all ${dolfiusQuotesCount}`}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 2 Random Dolfius Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredCreatorQuotes.map((dq) => {
                  const isSpeaking = speakingId === dq.id;
                  const isCopied = copiedId === dq.id;
                  const isPinned = pinnedIds.includes(dq.id);

                  return (
                    <div
                      key={dq.id}
                      className="rounded-xl p-4 sm:p-5 bg-slate-900/95 border border-amber-400/40 hover:border-amber-400/90 transition-all flex flex-col justify-between space-y-3 hover:shadow-lg hover:shadow-amber-500/10 group"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                            <span>{dq.role}</span>
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => togglePin(dq.id)}
                              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                isPinned ? 'text-amber-400 bg-amber-950/60' : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
                              }`}
                              title={lang === 'fr' ? 'Épingler' : 'Pin'}
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleSpeak(dq)}
                              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                isSpeaking ? 'text-amber-400 bg-indigo-950 animate-pulse' : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
                              }`}
                              title={lang === 'fr' ? 'Écouter la voix naturelle' : 'Listen natural voice'}
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleCopy(dq)}
                              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                isCopied ? 'text-emerald-400 bg-emerald-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                              }`}
                              title={lang === 'fr' ? 'Copier' : 'Copy'}
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <p className="text-sm font-serif text-slate-100 leading-relaxed italic whitespace-pre-line border-l-2 border-amber-400/70 pl-3">
                          &ldquo;{lang === 'fr' ? dq.quoteFr : dq.quote}&rdquo;
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                        <div>
                          <span className="font-bold text-amber-300">{dq.author}</span>
                          <span className="text-slate-400 text-[11px] block">{dq.year}</span>
                        </div>
                        <button
                          onClick={() => setFeaturedQuote(dq)}
                          className="text-[11px] font-semibold text-amber-400 hover:text-amber-200 transition-colors cursor-pointer"
                        >
                          {lang === 'fr' ? 'Mettre en vedette' : 'Spotlight'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Staggered Masonry Quotes Columns (Eliminates Blank Space Between Unequal Lengths) */}
          <div className="columns-1 md:columns-2 xl:columns-3 gap-4 sm:gap-5 [column-fill:_balance]">
            {filteredQuotes.map((q) => {
              const badge = getCategoryBadge(q.category);
              const isCopied = copiedId === q.id;
              const isSpeaking = speakingId === q.id;
              const isPinned = pinnedIds.includes(q.id);
              const isNewtonParody = q.id === 'quote-newton-mass-attraction-parody';
              const isCreator = q.author.includes('Dolfius 1er');
              const isImageMaxim = q.subcategory === 'image_maximes';

              return (
                <div
                  key={q.id}
                  className={`break-inside-avoid mb-4 sm:mb-5 inline-block w-full align-top rounded-2xl p-4 sm:p-5 bg-white border transition-all duration-200 hover:shadow-md ${
                    isCreator
                      ? 'border-amber-400 ring-2 ring-amber-300/40 bg-gradient-to-br from-amber-50/50 via-white to-indigo-50/40 shadow-xs'
                      : isImageMaxim
                      ? 'border-indigo-300 ring-1 ring-indigo-200/50 bg-gradient-to-br from-indigo-50/30 via-white to-amber-50/20'
                      : isNewtonParody 
                      ? 'border-amber-400/80 ring-2 ring-amber-300/40 bg-gradient-to-br from-amber-50/40 via-white to-indigo-50/30 shadow-xs'
                      : isPinned 
                      ? 'border-amber-300 ring-1 ring-amber-200/60 bg-amber-50/20' 
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isCreator && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-xs flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-200" />
                            <span>{lang === 'fr' ? "Dolfius 1er" : 'Dolfius 1st'}</span>
                          </span>
                        )}
                        {isImageMaxim && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-200" />
                            <span>{lang === 'fr' ? "Maxime Illustrée" : 'Image Maxim'}</span>
                          </span>
                        )}
                        {isNewtonParody && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-xs flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-slate-950" />
                            <span>{lang === 'fr' ? 'Parodie Memetique' : 'Meme Parody'}</span>
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${badge?.color || 'bg-slate-100 text-slate-800'}`}>
                          {badge?.label || q.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{q.year}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => togglePin(q.id)}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            isPinned ? 'text-amber-600 bg-amber-100/80' : 'text-slate-400 hover:text-amber-600 hover:bg-slate-100'
                          }`}
                          title={lang === 'fr' ? 'Épingler dans vos favoris' : 'Pin to favorites'}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSpeak(q)}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            isSpeaking ? 'text-indigo-600 bg-indigo-50 animate-pulse' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                          }`}
                          title={lang === 'fr' ? 'Écouter la citation' : 'Listen quote'}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCopy(q)}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            isCopied ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                          }`}
                          title={lang === 'fr' ? 'Copier la citation' : 'Copy quote'}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Quote Text */}
                    <p className="text-sm sm:text-base font-serif text-slate-900 leading-relaxed italic whitespace-pre-line">
                      &ldquo;{lang === 'fr' ? q.quoteFr : q.quote}&rdquo;
                    </p>

                    {/* Author & Role */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-xs sm:text-sm text-slate-900">{q.author}</h5>
                        <p className="text-[11px] text-slate-500">{q.role}</p>
                      </div>
                      <button
                        onClick={() => setFeaturedQuote(q)}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                      >
                        {lang === 'fr' ? 'Mettre en vedette' : 'Spotlight'}
                      </button>
                    </div>
                  </div>

                  {/* Historical Context Footer */}
                  <div className="mt-3 pt-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-normal">
                    <span className="font-semibold text-slate-700">{lang === 'fr' ? 'Contexte : ' : 'Context: '}</span>
                    {lang === 'fr' ? q.contextFr : q.context}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
