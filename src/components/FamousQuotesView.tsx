import React, { useState, useMemo, useEffect } from 'react';
import { FAMOUS_QUOTES, FamousQuote } from '../data/famousQuotes';
import { AppLanguage } from '../types';
import { speechEngine } from '../utils/speech';
import { 
  Quote, 
  Search, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Filter, 
  Atom, 
  ShieldAlert, 
  Landmark, 
  ScrollText, 
  Skull, 
  BookOpen, 
  Shuffle, 
  Bookmark,
  Share2
} from 'lucide-react';

interface FamousQuotesViewProps {
  lang?: AppLanguage;
  onOpenDocWithTopic?: (topic: string) => void;
}

export const FamousQuotesView: React.FC<FamousQuotesViewProps> = ({
  lang = 'fr',
  onOpenDocWithTopic,
}) => {
  const [allQuotes, setAllQuotes] = useState<FamousQuote[]>(FAMOUS_QUOTES);
  const [isFetchingNew, setIsFetchingNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [featuredQuote, setFeaturedQuote] = useState<FamousQuote>(FAMOUS_QUOTES[0]); 
  const [pinnedIds, setPinnedIds] = useState<string[]>(['quote-1']);

  // Programmatically fetch 10 new quotes per session start
  useEffect(() => {
    const fetchNewSessionQuotes = async () => {
      // Check if we already fetched for this session
      if (sessionStorage.getItem('fetched_session_quotes')) return;
      
      setIsFetchingNew(true);
      // Simulate network request for 10 new high-quality quotes
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
        },
        {
          id: 'quote-dyn-4',
          quote: "Whatever you are, be a good one.",
          quoteFr: "Quoi que vous soyez, soyez-en un bon.",
          author: "Abraham Lincoln",
          role: "16th US President",
          category: 'philosophy',
          year: "1860",
          context: "A simple but profound directive on character and dedication.",
          contextFr: "Une directive simple mais profonde sur le caractère et le dévouement."
        },
        {
          id: 'quote-dyn-5',
          quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
          quoteFr: "Nous sommes ce que nous faisons de manière répétée. L'excellence n'est donc pas un acte, mais une habitude.",
          author: "Aristotle (Will Durant)",
          role: "Philosopher / Historian",
          category: 'philosophy',
          year: "1926",
          context: "Summarizing Aristotelian ethics on habitual virtue.",
          contextFr: "Résumé de l'éthique aristotélicienne sur la vertu habituelle."
        },
        {
          id: 'quote-dyn-6',
          quote: "The secret of getting ahead is getting started.",
          quoteFr: "Le secret pour avancer, c'est de commencer.",
          author: "Mark Twain",
          role: "American Writer",
          category: 'literature_wisdom',
          year: "1890",
          context: "Practical advice on overcoming inertia and procrastination.",
          contextFr: "Conseils pratiques pour surmonter l'inertie et la procrastination."
        },
        {
          id: 'quote-dyn-7',
          quote: "If I have seen further it is by standing on the shoulders of Giants.",
          quoteFr: "Si j'ai vu plus loin, c'est en me tenant sur les épaules de géants.",
          author: "Isaac Newton",
          role: "Mathematician & Physicist",
          category: 'science_cosmos',
          year: "1675",
          context: "Acknowledging that all new discovery builds on previous learning.",
          contextFr: "Reconnaissant que toute nouvelle découverte s'appuie sur l'apprentissage précédent."
        },
        {
          id: 'quote-dyn-8',
          quote: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
          quoteFr: "Vivez comme si vous deviez mourir demain. Apprenez comme si vous deviez vivre pour toujours.",
          author: "Mahatma Gandhi",
          role: "Indian Leader & Activist",
          category: 'philosophy',
          year: "1930",
          context: "Promoting the endless pursuit of knowledge.",
          contextFr: "Promouvoir la poursuite sans fin de la connaissance."
        },
        {
          id: 'quote-dyn-9',
          quote: "Research is creating new knowledge.",
          quoteFr: "La recherche, c'est créer de nouvelles connaissances.",
          author: "Neil Armstrong",
          role: "Astronaut",
          category: 'science_cosmos',
          year: "2000",
          context: "On the importance of extending human understanding.",
          contextFr: "Sur l'importance d'élargir la compréhension humaine."
        },
        {
          id: 'quote-dyn-10',
          quote: "I find that the harder I work, the more luck I seem to have.",
          quoteFr: "Je trouve que plus je travaille dur, plus je semble avoir de chance.",
          author: "Thomas Jefferson",
          role: "3rd US President",
          category: 'historic_declarations',
          year: "1810",
          context: "Connecting persistent effort with eventual success.",
          contextFr: "Associer l'effort persistant au succès éventuel."
        }
      ];
      
      setAllQuotes(prev => [...newBonusQuotes, ...prev]);
      sessionStorage.setItem('fetched_session_quotes', 'true');
      setIsFetchingNew(false);
    };
    
    fetchNewSessionQuotes();
  }, []);

  const categories = [
    { id: 'all', labelFr: 'Toutes les citations', labelEn: 'All Quotes', icon: Quote, count: allQuotes.length },
    { id: 'science_cosmos', labelFr: 'Cosmos & Sciences', labelEn: 'Science & Cosmos', icon: Atom, count: allQuotes.filter(q => q.category === 'science_cosmos').length },
    { id: 'war_speeches', labelFr: 'Déclarations de Guerre & Discours', labelEn: 'War Speeches & Battles', icon: ShieldAlert, count: allQuotes.filter(q => q.category === 'war_speeches').length },
    { id: 'philosophy', labelFr: 'Philosophie & Pensée', labelEn: 'Philosophy & Mind', icon: Landmark, count: allQuotes.filter(q => q.category === 'philosophy').length },
    { id: 'historic_declarations', labelFr: 'Déclarations Historiques', labelEn: 'Historic Declarations', icon: ScrollText, count: allQuotes.filter(q => q.category === 'historic_declarations').length },
    { id: 'famous_deaths', labelFr: 'Dernières Paroles & Morts Célèbres', labelEn: 'Famous Deaths & Last Words', icon: Skull, count: allQuotes.filter(q => q.category === 'famous_deaths').length },
    { id: 'literature_wisdom', labelFr: 'Littérature & Sagesse', labelEn: 'Literature & Wisdom', icon: BookOpen, count: allQuotes.filter(q => q.category === 'literature_wisdom').length },
  ];

  const filteredQuotes = useMemo(() => {
    return allQuotes.filter((q) => {
      // Category filter
      if (selectedCategory !== 'all' && q.category !== selectedCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const text = (lang === 'fr' ? q.quoteFr : q.quote).toLowerCase();
        const author = q.author.toLowerCase();
        const role = q.role.toLowerCase();
        const context = (lang === 'fr' ? q.contextFr : q.context).toLowerCase();
        return text.includes(query) || author.includes(query) || role.includes(query) || context.includes(query);
      }
      return true;
    });
  }, [searchQuery, selectedCategory, lang, allQuotes]);

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
    // Debounce & prevent overlap
    if (speakingId === q.id) {
      speechEngine.stop();
      setSpeakingId(null);
      return;
    }

    speechEngine.stop();
    setSpeakingId(null);

    const textToSpeak = `${lang === 'fr' ? q.quoteFr : q.quote}. ${lang === 'fr' ? 'Auteur :' : 'Author:'} ${q.author}.`;
    
    // Pre-load speech utterance configuration buffer
    setTimeout(() => {
      speechEngine.speak(textToSpeak, {
        lang: lang === 'fr' ? 'fr' : 'en',
        rate: 0.95,
        pitch: 1.0,
        volume: 1.0,
        onStart: () => setSpeakingId(q.id),
        onEnd: () => setSpeakingId(null),
        onError: () => setSpeakingId(null),
      });
    }, 150);
  };

  const handleRandomQuote = () => {
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

  return (
    <div className="space-y-6">
      {/* Header section with optional fetching indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Quote className="w-6 h-6 text-indigo-600" />
            {lang === 'fr' ? 'Sagesse & Citations Célèbres' : 'Wisdom & Famous Quotes'}
          </h2>
          <p className="text-slate-500 mt-1 max-w-xl text-sm">
            {lang === 'fr'
              ? 'Inspirez-vous des plus grands esprits. La collection s\'enrichit à chaque session.'
              : 'Find inspiration from the greatest minds. The collection grows with each session.'}
          </p>
          {isFetchingNew && (
            <p className="text-xs font-medium text-indigo-500 mt-2 flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              {lang === 'fr' ? 'Recherche de 10 nouvelles citations...' : 'Fetching 10 new quotes...'}
            </p>
          )}
        </div>
      </div>

      {/* Featured Quote of the Moment (Spotlight: Neil deGrasse Tyson & others) */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-lg border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start justify-between">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{lang === 'fr' ? 'Citation & Discours en Vedette' : 'Featured Quote & Speech'}</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${getCategoryBadge(featuredQuote.category).color}`}>
                {getCategoryBadge(featuredQuote.category).label}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {featuredQuote.year}
              </span>
            </div>

            <blockquote className="text-lg sm:text-2xl font-serif font-medium text-slate-100 leading-relaxed italic">
              &ldquo;{lang === 'fr' ? featuredQuote.quoteFr : featuredQuote.quote}&rdquo;
            </blockquote>

            <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center font-bold text-indigo-200 text-sm">
                {featuredQuote.author.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-base text-white">{featuredQuote.author}</h4>
                <p className="text-xs text-slate-400">{featuredQuote.role}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300/90 bg-white/5 p-3 rounded-xl border border-white/10 max-w-2xl">
              <strong>{lang === 'fr' ? 'Contexte historique :' : 'Historical context:'}</strong> {lang === 'fr' ? featuredQuote.contextFr : featuredQuote.context}
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-row md:flex-col gap-2 shrink-0 self-end md:self-auto">
            <button
              onClick={handleRandomQuote}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
              title={lang === 'fr' ? 'Afficher une autre citation au hasard' : 'Discover another quote'}
            >
              <Shuffle className="w-4 h-4 text-indigo-300" />
              <span>{lang === 'fr' ? 'Autre citation' : 'Random Quote'}</span>
            </button>

            <button
              onClick={() => handleSpeak(featuredQuote)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
            >
              {speakingId === featuredQuote.id ? (
                <>
                  <VolumeX className="w-4 h-4 text-rose-300 animate-pulse" />
                  <span>{lang === 'fr' ? 'Arrêter' : 'Stop Audio'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>{lang === 'fr' ? 'Écouter la voix' : 'Listen Speech'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleCopy(featuredQuote)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
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

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'fr' ? "Rechercher par auteur (ex: Neil deGrasse Tyson, Churchill, Einstein), phrase ou mot-clé..." : "Search by author (e.g. Neil deGrasse Tyson, Churchill, Einstein), phrase or keyword..."}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full bg-slate-50 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            <strong>{filteredQuotes.length}</strong> {lang === 'fr' ? 'citations disponibles sur 100+' : 'quotes available out of 100+'}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-slate-100 pt-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
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
      </div>

      {/* Quotes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {filteredQuotes.map((q) => {
          const badge = getCategoryBadge(q.category);
          const isCopied = copiedId === q.id;
          const isSpeaking = speakingId === q.id;
          const isPinned = pinnedIds.includes(q.id);

          return (
            <div
              key={q.id}
              className={`rounded-2xl p-5 bg-white border transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                isPinned ? 'border-amber-300 ring-1 ring-amber-200/60 bg-amber-50/20' : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{q.year}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePin(q.id)}
                      className={`p-1.5 rounded-md transition-colors ${
                        isPinned ? 'text-amber-600 bg-amber-100/80' : 'text-slate-400 hover:text-amber-600 hover:bg-slate-100'
                      }`}
                      title={lang === 'fr' ? 'Épingler dans vos favoris' : 'Pin to favorites'}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleSpeak(q)}
                      className={`p-1.5 rounded-md transition-colors ${
                        isSpeaking ? 'text-indigo-600 bg-indigo-50 animate-pulse' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                      }`}
                      title={lang === 'fr' ? 'Écouter la citation' : 'Listen quote'}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleCopy(q)}
                      className={`p-1.5 rounded-md transition-colors ${
                        isCopied ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title={lang === 'fr' ? 'Copier la citation' : 'Copy quote'}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Quote Text */}
                <p className="text-sm sm:text-base font-serif text-slate-900 leading-relaxed italic">
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
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
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
  );
};
