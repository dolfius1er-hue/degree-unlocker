import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  BookOpen,
  LayoutDashboard,
  Sparkles,
  Zap,
  HelpCircle,
  FileText,
  Keyboard,
  ShieldCheck,
  Languages,
  HardDrive,
  Quote,
  Layers,
  GraduationCap,
  Bookmark,
  FilePlus,
  Upload,
  Cloud,
  Palette,
  Check,
  ArrowRight
} from 'lucide-react';
import { AppLanguage, AppTheme, NavTabType } from '../types';

interface FullScreenCommandDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: NavTabType;
  onSelectTab: (tab: NavTabType) => void;
  onOpenNotionWorkspace?: (subjectKey?: 'espagnol' | 'allemand' | 'latin' | 'francais' | 'philosophie') => void;
  onOpenNewNote?: () => void;
  onOpenUpload?: () => void;
  onOpenSync?: () => void;
  lang?: AppLanguage;
  activeTheme?: AppTheme;
  onSelectTheme?: (theme: AppTheme) => void;
  keyboardLayout?: 'azerty' | 'qwerty';
  onToggleKeyboardLayout?: () => void;
}

export const FullScreenCommandDeckModal: React.FC<FullScreenCommandDeckModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  onOpenNotionWorkspace,
  onOpenNewNote,
  onOpenUpload,
  onOpenSync,
  lang = 'fr',
  activeTheme = 'dark',
  onSelectTheme,
  keyboardLayout = 'azerty',
  onToggleKeyboardLayout,
}) => {
  const isFr = lang === 'fr';
  const [searchQuery, setSearchQuery] = useState('');

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const mainStudyPages = [
    {
      id: 'dashboard' as NavTabType,
      title: isFr ? 'Tableau de Bord' : 'Dashboard',
      subtitle: isFr ? 'Vue générale, statistiques et révisions prioritaires' : 'Overview, daily stats & focus',
      icon: LayoutDashboard,
      badge: isFr ? 'Accueil' : 'Home',
      color: 'from-blue-600 to-indigo-700',
    },
    {
      id: 'school_books' as NavTabType,
      title: isFr ? 'Manuels Scolaires & Exercices' : 'School Textbooks & Exercises',
      subtitle: isFr ? 'Programmes officiels Seconde, Première, Tale et exercices résolus' : 'Official high school curriculum & step-by-step solutions',
      icon: BookOpen,
      badge: isFr ? 'Curriculum' : 'Curriculum',
      color: 'from-amber-500 to-amber-700',
    },
    {
      id: 'library' as NavTabType,
      title: isFr ? 'Mes Fichiers & Documents' : 'My Files & Docs',
      subtitle: isFr ? 'Gestionnaire complet de tous vos cours et fiches importées' : 'All your imported PDF, scanned and typed documents',
      icon: Layers,
      badge: isFr ? 'Base de cours' : 'Repository',
      color: 'from-slate-700 to-slate-900',
    },
    {
      id: 'search' as NavTabType,
      title: isFr ? 'Recherche Plein Texte & Sémantique IA' : 'AI Semantic & Full-Text Search',
      subtitle: isFr ? 'Indexation intelligente de tous vos cours, paragraphes et fiches' : 'Smart deep indexing of all your notes, paragraphs, and study materials',
      icon: Search,
      badge: isFr ? 'Indexation' : 'Deep Search',
      color: 'from-cyan-600 to-blue-800',
    },
    {
      id: 'flashcards' as NavTabType,
      title: isFr ? 'Fiches Mémoire (Anki Spaced Repetition)' : 'Flashcards & Anki Leitner',
      subtitle: isFr ? 'Mémorisation active avec répétition espacée en 4 boîtes' : 'Spaced repetition system for long-term retention',
      icon: Zap,
      badge: isFr ? 'Neurosciences' : 'Cognitive',
      color: 'from-amber-600 to-orange-700',
    },
    {
      id: 'quiz' as NavTabType,
      title: isFr ? 'Quiz & Annales Interactives' : 'Quiz & Practice Tests',
      subtitle: isFr ? 'Auto-évaluation instantanée avec QCM et justifications' : 'Self-assessment with detailed worked corrections',
      icon: HelpCircle,
      badge: isFr ? 'Auto-test' : 'Practice',
      color: 'from-emerald-600 to-teal-800',
    },
    {
      id: 'blocknote' as NavTabType,
      title: isFr ? 'Bloc-Notes & Cahier Séyès Cornell' : 'Cornell Notebook & Handwriting',
      subtitle: isFr ? 'Mise en page formatée pour préparer la recopie manuscrite sur cahier' : 'Structured notes tailored for physical handwriting transfer',
      icon: FileText,
      badge: isFr ? 'Méthode' : 'Method',
      color: 'from-indigo-600 to-purple-800',
    },
    {
      id: 'resumer' as NavTabType,
      title: isFr ? 'Résumeur IA de Documents' : 'AI Document Summarizer',
      subtitle: isFr ? 'Synthèses percutantes, mots-clés et extraction des formules clés' : 'Instant smart executive summaries and key takeaway extractions',
      icon: Sparkles,
      badge: isFr ? 'Synthèse' : 'Summaries',
      color: 'from-purple-600 to-pink-800',
    },
    {
      id: 'quotes' as NavTabType,
      title: isFr ? 'Citations & Maximes Philosophiques' : 'Philosophical Quotes & Maxims',
      subtitle: isFr ? 'Citations d\'auteurs classées par thèmes pour dissertations' : 'Curated quotes for essays and arguments',
      icon: Quote,
      badge: isFr ? 'Culture' : 'Culture',
      color: 'from-rose-600 to-red-800',
    },
    {
      id: 'bilingual' as NavTabType,
      title: isFr ? 'Atelier Bilingue & Phonétique' : 'Bilingual Lab & Speech',
      subtitle: isFr ? 'Comparateur bilingue et pratique orale avec synthèse vocale' : 'Parallel bilingual texts and speech training',
      icon: Languages,
      badge: isFr ? 'Oral' : 'Oral',
      color: 'from-teal-600 to-cyan-800',
    },
    {
      id: 'database' as NavTabType,
      title: isFr ? 'Base Locale & Sauvegarde' : 'Local Database & Storage',
      subtitle: isFr ? 'Sauvegardes JSON, exportations, chiffrement et restauration' : 'Backups, export, storage inspector and reset',
      icon: HardDrive,
      badge: isFr ? 'Local' : 'Offline',
      color: 'from-slate-600 to-slate-800',
    },
  ];

  const notionWorkspaces = [
    {
      id: 'francais' as const,
      title: 'Cahier de Français & Méthodes Littéraires',
      subject: 'Français (Seconde)',
      icon: '📚',
      desc: 'Méthode du commentaire composé, dissertation littéraire, figures de style et mouvements.',
    },
    {
      id: 'philosophie' as const,
      title: 'Atelier de Philosophie & Notions Fondatrices',
      subject: 'Philosophie (Terminale)',
      icon: '🏛️',
      desc: 'Les 17 notions du bac, repères conceptuels, citations analysées et explication de texte.',
    },
    {
      id: 'espagnol' as const,
      title: 'Espace Notion Espagnol',
      subject: 'Espagnol (Lycée)',
      icon: '🇪🇸',
      desc: 'Ser vs Estar, subjonctif, verbes irréguliers et vocabulaire thématique.',
    },
    {
      id: 'allemand' as const,
      title: 'Espace Notion Allemand',
      subject: 'Allemand (Lycée)',
      icon: '🇩🇪',
      desc: 'Les 4 déclinaisons (Nominatif, Accusatif, Datif, Génitif) et verbes forts.',
    },
    {
      id: 'latin' as const,
      title: 'Atelier Latin & Humanités Classiques',
      subject: 'Latin & Antiquité',
      icon: '🏛️',
      desc: 'Déclinaisons latines, ablatif absolu, étymologie et chefs-d\'œuvre antiques.',
    },
  ];

  const dedicatedGuidePages = [
    {
      id: 'tutorial' as NavTabType,
      title: isFr ? 'Tutoriel Complet de l\'Application' : 'Complete App Tutorial',
      subtitle: isFr ? 'Guide pas-à-pas interactif mis à jour avec toutes les nouveautés v6.5' : 'Step-by-step interactive guide updated with latest v6.5 features',
      icon: GraduationCap,
      badge: isFr ? 'Page Dédiée' : 'Full Page',
    },
    {
      id: 'tips' as NavTabType,
      title: isFr ? 'Guide & Astuces de Prise de Notes' : 'Note-Taking Tips & Methods',
      subtitle: isFr ? 'Méthode Cornell, code couleur, abréviations et mémorisation gestuelle' : 'Cornell technique, Séyès ruling, color coding and cognitive retention',
      icon: Sparkles,
      badge: isFr ? 'Page Dédiée' : 'Full Page',
    },
    {
      id: 'privacy' as NavTabType,
      title: isFr ? 'Confidentialité & Politiques' : 'Privacy & Data Protection',
      subtitle: isFr ? 'Stockage souverain 100% local, conformité RGPD et absence de pistage' : 'Local-first zero telemetry and data sovereignty',
      icon: ShieldCheck,
      badge: isFr ? 'Page Dédiée' : 'Full Page',
    },
  ];

  const themes: { id: AppTheme; label: string; icon: string; bgClass: string }[] = [
    { id: 'dark', label: isFr ? 'Sombre Élégant' : 'Dark', icon: '🌙', bgClass: 'bg-slate-800' },
    { id: 'midnight', label: isFr ? 'Bleu Minuit' : 'Midnight', icon: '🌌', bgClass: 'bg-slate-950 border-indigo-500/40' },
    { id: 'light', label: isFr ? 'Clair Lumineux' : 'Light', icon: '☀️', bgClass: 'bg-slate-200 text-slate-900' },
    { id: 'paper', label: isFr ? 'Papier Ivoire' : 'Paper', icon: '📜', bgClass: 'bg-amber-100 text-amber-950' },
    { id: 'hardcore', label: 'Hardcore mode DegreeUnlocker', icon: '⚡', bgClass: 'bg-black border-amber-500' },
  ];

  // Filter based on search query
  const query = searchQuery.trim().toLowerCase();

  const filteredStudyPages = useMemo(() => {
    if (!query) return mainStudyPages;
    return mainStudyPages.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.subtitle.toLowerCase().includes(query) ||
      p.badge.toLowerCase().includes(query)
    );
  }, [query, isFr]);

  const filteredNotion = useMemo(() => {
    if (!query) return notionWorkspaces;
    return notionWorkspaces.filter(n => 
      n.title.toLowerCase().includes(query) || 
      n.subject.toLowerCase().includes(query) ||
      n.desc.toLowerCase().includes(query)
    );
  }, [query]);

  const filteredGuides = useMemo(() => {
    if (!query) return dedicatedGuidePages;
    return dedicatedGuidePages.filter(g => 
      g.title.toLowerCase().includes(query) || 
      g.subtitle.toLowerCase().includes(query)
    );
  }, [query, isFr]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/98 backdrop-blur-sm text-white p-4 sm:p-8 animate-in fade-in duration-200">
      
      {/* Container max-w-7xl */}
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Degree Unlocker Lite
                </h1>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-black border border-amber-300">
                  LITE DECK
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isFr ? 'Station d\'étude allégée : options et révisions accessibles en un coup d\'œil' : 'Lightweight study station: options and revision at a glance'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Keyboard Layout Quick Toggle */}
            {onToggleKeyboardLayout && (
              <button
                onClick={onToggleKeyboardLayout}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-600 transition-all cursor-pointer"
                title={isFr ? 'Changer de disposition clavier' : 'Switch keyboard layout'}
              >
                <Keyboard className="w-4 h-4 text-indigo-400" />
                <span>{keyboardLayout.toUpperCase()}</span>
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer shadow-md"
              title="Fermer (Échap)"
            >
              <span>{isFr ? 'Fermer' : 'Close'}</span>
              <kbd className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">Échap</kbd>
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Search Input in Command Deck */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-3xl border border-slate-800 shadow-xl">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isFr ? 'Rechercher une matière, une page, un outil ou un exercice...' : 'Search any subject, page, tool, or exercise...'}
              className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner"
            />
          </div>

          {/* Color Themes Quick Picker */}
          {onSelectTheme && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>{isFr ? 'Couleurs :' : 'Theme:'}</span>
              </span>
              {themes.map((th) => {
                const isCurrent = activeTheme === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => onSelectTheme(th.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                      isCurrent
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-2 ring-indigo-400/30'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>{th.icon}</span>
                    <span>{th.label}</span>
                    {isCurrent && <Check className="w-3 h-3 text-emerald-300" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 1: STUDY MODULES & CURRICULUM PAGES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>{isFr ? '1. Espaces Principaux d\'Étude & Révision' : '1. Main Study Modules & Workspaces'}</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              {filteredStudyPages.length} {isFr ? 'modules' : 'modules'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStudyPages.map((page) => {
              const Icon = page.icon;
              const isCurrent = activeTab === page.id;
              return (
                <button
                  key={page.id}
                  onClick={() => {
                    onSelectTab(page.id);
                    onClose();
                  }}
                  className={`p-4 rounded-3xl text-left transition-all flex flex-col justify-between gap-3 border group cursor-pointer shadow-lg ${
                    isCurrent
                      ? 'bg-gradient-to-br from-indigo-900/60 to-slate-900 border-indigo-500 shadow-indigo-500/10 ring-2 ring-indigo-500/20'
                      : 'bg-slate-900/70 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700 hover:scale-[1.01]'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-slate-800 group-hover:bg-slate-700 border border-white/5 flex items-center justify-center text-white transition-colors">
                        <Icon className="w-5 h-5 text-amber-400" />
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {page.badge}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white group-hover:text-amber-300 transition-colors">
                        {page.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {page.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-white">
                    <span>{isFr ? 'Accéder à la page' : 'Open page'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: SPECIALIZED NOTION WORKSPACES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Languages className="w-4 h-4 text-emerald-400" />
              <span>{isFr ? '2. Espaces Notion Spécialisés (Langues, Français, Philo)' : '2. Specialized Notion Workspaces'}</span>
            </h2>
            <span className="text-xs text-emerald-400 font-bold">
              100% Interactif
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotion.map((notion) => (
              <div
                key={notion.id}
                onClick={() => {
                  if (onOpenNotionWorkspace) {
                    onOpenNotionWorkspace(notion.id);
                  }
                  onClose();
                }}
                className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all flex flex-col justify-between gap-3 cursor-pointer group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{notion.icon}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {notion.subject}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                    {notion.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {notion.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span>{isFr ? 'Ouvrir l\'Espace Notion' : 'Open Notion Workspace'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: DEDICATED FULL PAGES (TUTORIAL, TIPS, PRIVACY) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>{isFr ? '3. Pages Dédiées : Tutoriel, Astuces & Confidentialité' : '3. Dedicated Pages: Tutorial, Tips & Privacy'}</span>
            </h2>
            <span className="text-xs text-indigo-400 font-bold">
              {isFr ? 'Pages complètes indépendantes' : 'Independent full pages'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredGuides.map((guide) => {
              const Icon = guide.icon;
              const isCurrent = activeTab === guide.id;
              return (
                <button
                  key={guide.id}
                  onClick={() => {
                    onSelectTab(guide.id);
                    onClose();
                  }}
                  className={`p-5 rounded-3xl text-left transition-all flex flex-col justify-between gap-3 border cursor-pointer group shadow-lg ${
                    isCurrent
                      ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {guide.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {guide.subtitle}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-300">
                    <span>{isFr ? 'Ouvrir la page' : 'Open full page'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: ACTIONS & SHORTCUTS */}
        <div className="p-5 rounded-3xl bg-slate-900/50 border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
              {isFr ? 'Actions Rapides :' : 'Quick Actions:'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenNewNote && (
              <button
                onClick={() => {
                  onOpenNewNote();
                  onClose();
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                <FilePlus className="w-4 h-4 text-emerald-400" />
                <span>{isFr ? 'Nouvelle Note' : 'New Note'}</span>
              </button>
            )}

            {onOpenUpload && (
              <div className="relative group/docbtn">
                <button
                  onClick={() => {
                    onOpenUpload();
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer shadow-xs transition-colors"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>{isFr ? 'Importer Document' : 'Import Document'}</span>
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-2.5 bg-slate-900 text-white rounded-xl shadow-xl z-50 text-[10px] border border-slate-700 pointer-events-none opacity-0 group-hover/docbtn:opacity-100 transition-opacity">
                  <p className="font-semibold text-amber-300 mb-0.5">{isFr ? 'Importer des documents' : 'Import Documents'}</p>
                  <p className="text-slate-300 leading-tight">
                    {isFr ? 'PDF, Word (.docx), Scans & Photos de cours, TXT, Markdown avec OCR.' : 'PDF, Word (.docx), Notes Scans, TXT, Markdown with OCR.'}
                  </p>
                </div>
              </div>
            )}

            {onOpenSync && (
              <button
                onClick={() => {
                  onOpenSync();
                  onClose();
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                <Cloud className="w-4 h-4 text-indigo-400" />
                <span>{isFr ? 'Synchronisation Cloud' : 'Cloud Sync'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
