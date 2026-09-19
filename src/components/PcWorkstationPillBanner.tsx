import React, { useState, useId } from 'react';
import { AppLanguage, NavTabType } from '../types';
import { 
  Sparkles, 
  Crown, 
  BookOpen, 
  Layers, 
  Flame, 
  Zap, 
  Sliders, 
  Shield, 
  Scroll, 
  ChevronRight, 
  Maximize2,
  Atom,
  Binary,
  Compass,
  Landmark,
  Feather,
  Coffee,
  Lightbulb,
  Swords,
  Timer,
  Brain,
  CheckCircle2,
  HelpCircle,
  GraduationCap,
  Headphones,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundFx } from '../utils/soundEffects';

export type SessionMode = 'hardcore' | 'detente' | 'facile';

export interface PillBannerModel {
  id: string;
  nameFr: string;
  nameEn: string;
  styleFr: string;
  styleEn: string;
  revisedTopicFr: string;
  revisedTopicEn: string;
  quoteFr: string;
  quoteEn: string;
  accentColor: string; // Tailwind color class or hex
  gradientBg: string;  // Background gradient for the 5 pills
  pillColors: string[]; // 5 pill background colors/gradients
  characterType: 'monarch' | 'emperor' | 'philosopher' | 'scholar' | 'scientist' | 'general' | 'cyber';
  badgeIcon: any;
}

interface PcWorkstationPillBannerProps {
  activeTab: NavTabType;
  selectedSubject?: string;
  lang: AppLanguage;
  onLaunchRevision?: () => void;
  onOpenInstallGuide?: () => void;
  onOpenSoundHUD?: () => void;
  className?: string;
}

// Session details with tutorials, memory hacks, and actionable tips
const SESSION_MODES_CONFIG = {
  hardcore: {
    id: 'hardcore' as SessionMode,
    labelFr: 'Hardcore mode Degree Unlocker Lite',
    labelEn: 'Hardcore mode Degree Unlocker Lite',
    badgeFr: 'MODE COMMANDO & CONCOURS',
    badgeEn: 'COMMANDO PREP MODE',
    icon: Swords,
    accentColor: '#ef4444',
    borderColor: 'border-red-500/60',
    bgGradient: 'from-red-950/80 via-zinc-950 to-black',
    activeBadgeBg: 'bg-red-500 text-black',
    descriptionFr: 'Immersion totale de 50 min sans distraction, chrono commando, prépa concours et SRS haute intensité.',
    descriptionEn: '50-minute zero-distraction immersion, commando timer, exam prep & high-intensity SRS.',
    tipsFr: [
      {
        title: '1. Règle des 50/10 Commando',
        desc: 'Travaillez 50 min chrono fermé, téléphone retourné. Zéro notification. Pause active de 10 min.',
        icon: '⏱️'
      },
      {
        title: '2. Restitution Aveugle',
        desc: 'Fermez le cours et réécrivez immédiatement de mémoire les 5 concepts clés sur une feuille blanche.',
        icon: '🧠'
      },
      {
        title: '3. Analyse des 3 Erreurs',
        desc: 'Chaque erreur en quiz est décortiquée immédiatement pour fixer l\'ancre mnésique définitive.',
        icon: '🎯'
      }
    ],
    tipsEn: [
      {
        title: '1. 50/10 Commando Rule',
        desc: 'Work 50 minutes strictly, phone flipped down. Zero notifications. 10 min active rest.',
        icon: '⏱️'
      },
      {
        title: '2. Blind Recall Hack',
        desc: 'Close the course and immediately write down the 5 key concepts from memory on paper.',
        icon: '🧠'
      },
      {
        title: '3. 3-Error Breakdown',
        desc: 'Every wrong quiz answer is thoroughly analyzed to seal the permanent memory anchor.',
        icon: '🎯'
      }
    ]
  },

  detente: {
    id: 'detente' as SessionMode,
    labelFr: 'Chill mode DegreeUnlocker',
    labelEn: 'Chill mode DegreeUnlocker',
    badgeFr: 'MODE ASSIMILATION ZEN',
    badgeEn: 'ZEN RETENTION MODE',
    icon: Coffee,
    accentColor: '#38bdf8',
    borderColor: 'border-sky-500/60',
    bgGradient: 'from-sky-950/80 via-zinc-950 to-black',
    activeBadgeBg: 'bg-sky-400 text-black',
    descriptionFr: 'Assimilation douce et fluide : écoute active des synthèses audio, fiches illustrées et ambiance sonore alpha.',
    descriptionEn: 'Gentle & smooth absorption: active listening of audio summaries, illustrated cards & alpha beats.',
    tipsFr: [
      {
        title: '1. Écoute Active & Audio',
        desc: 'Laissez la voix de l\'assistant lire la fiche pendant que vous observez le schéma conceptuel sans stress.',
        icon: '🎧'
      },
      {
        title: '2. Ondes Alpha (10 Hz)',
        desc: 'Active le mode de concentration calme du cerveau pour absorber les notions complexes sans fatigue.',
        icon: '🌊'
      },
      {
        title: '3. Technique des 3 Survols',
        desc: '1er survol rapide des titres, 2e lecture des termes en gras, 3e mémorisation des exemples clés.',
        icon: '📖'
      }
    ],
    tipsEn: [
      {
        title: '1. Active Listening & Audio',
        desc: 'Let the assistant read the summary aloud while you review the visual map effortlessly.',
        icon: '🎧'
      },
      {
        title: '2. Alpha Waves (10 Hz)',
        desc: 'Triggers the brain\'s calm focus state to absorb complex subjects without mental exhaustion.',
        icon: '🌊'
      },
      {
        title: '3. 3-Pass Reading Technique',
        desc: '1st quick scan of headings, 2nd read of bold terms, 3rd retention of core examples.',
        icon: '📖'
      }
    ]
  },

  facile: {
    id: 'facile' as SessionMode,
    labelFr: 'Normal mode DegreeUnlocker',
    labelEn: 'Normal mode DegreeUnlocker',
    badgeFr: 'MODE ANCRAGE EXPRESS',
    badgeEn: 'EXPRESS ANCHOR MODE',
    icon: Zap,
    accentColor: '#f59e0b',
    borderColor: 'border-amber-500/60',
    bgGradient: 'from-amber-950/80 via-zinc-950 to-black',
    activeBadgeBg: 'bg-amber-400 text-black',
    descriptionFr: 'Apprentissage ultra-intuitif : cartes mémoire révisées par algorithme SRS, acronymes et résumés visuels.',
    descriptionEn: 'Ultra-intuitive learning: flashcards tuned by SRS algorithms, mnemonics & visual cheat sheets.',
    tipsFr: [
      {
        title: '1. Acronymes 3G Automatiques',
        desc: 'Mémorisez les listes et dates clés grâce à des mots-repères simples générés intelligemment.',
        icon: '💡'
      },
      {
        title: '2. Flashcards SRS Express',
        desc: 'Faites 10 cartes par jour. L\'algorithme ne vous montre que les éléments que vous hésitez à retenir.',
        icon: '⚡'
      },
      {
        title: '3. Règle 1 Notion = 1 Exemple',
        desc: 'Associez toujours une formule théorique à une anecdote historique ou application concrète.',
        icon: '✨'
      }
    ],
    tipsEn: [
      {
        title: '1. Automatic 3G Mnemonics',
        desc: 'Memorize lists and dates using simple key phrases generated intelligently for you.',
        icon: '💡'
      },
      {
        title: '2. Express SRS Flashcards',
        desc: 'Review 10 cards daily. The algorithm automatically targets your exact weak memory spots.',
        icon: '⚡'
      },
      {
        title: '3. 1 Concept = 1 Example Rule',
        desc: 'Always link a theoretical concept to a real-world story or concrete calculation.',
        icon: '✨'
      }
    ]
  }
};

// Data models for each tab/subject (3 models each)
const TAB_PRESETS: Record<string, PillBannerModel[]> = {
  // 1. Histoire-Géographie / Géopolitique
  history: [
    {
      id: 'history_m1',
      nameFr: 'Modèle 1 : Hardcore mode DegreeUnlocker (Géopolitique & HGGSP)',
      nameEn: 'Model 1: Hardcore mode DegreeUnlocker (Geopolitics & History)',
      styleFr: 'Écarlate Profond & Masque Couronné Sombre',
      styleEn: 'Imperial Crimson & Dark Medieval Mask',
      revisedTopicFr: 'Croisades, Pouvoir Royal, Géopolitique des Océans & Grandes Puissances',
      revisedTopicEn: 'Crusades, Royal Power, Ocean Geopolitics & Major Powers',
      quoteFr: '« Que chaque décision soit forgée dans la rigueur et l\'étude approfondie. »',
      quoteEn: '« Let every decision be forged in rigor and deep study. »',
      accentColor: '#dc2626',
      gradientBg: 'from-red-950/60 via-zinc-950 to-black',
      pillColors: [
        'bg-gradient-to-b from-red-600 via-red-700 to-red-900',
        'bg-gradient-to-b from-red-500 via-red-600 to-red-800',
        'bg-gradient-to-b from-red-600 via-rose-700 to-red-950',
        'bg-gradient-to-b from-red-500 via-red-600 to-red-800',
        'bg-gradient-to-b from-red-600 via-red-700 to-red-900',
      ],
      characterType: 'monarch',
      badgeIcon: Crown,
    },
    {
      id: 'history_m2',
      nameFr: 'Modèle 2 : Normal mode DegreeUnlocker (Rome & Démocratie)',
      nameEn: 'Model 2: Normal mode DegreeUnlocker (Rome & Democracy)',
      styleFr: 'Marbre Antique, Bronze & Pourpre Sénatoriale',
      styleEn: 'Antique Marble, Bronze & Senatorial Purple',
      revisedTopicFr: 'Pax Romana, Institutions Républicaines & Expansion Méditerranéenne',
      revisedTopicEn: 'Pax Romana, Republican Institutions & Mediterranean Expansion',
      quoteFr: '« Veni, vidi, vici — La maîtrise des textes façonne la réussite. »',
      quoteEn: '« Veni, vidi, vici — The mastery of knowledge shapes success. »',
      accentColor: '#f59e0b',
      gradientBg: 'from-amber-950/60 via-zinc-950 to-black',
      pillColors: [
        'bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900',
        'bg-gradient-to-b from-amber-500 via-amber-600 to-amber-800',
        'bg-gradient-to-b from-amber-400 via-yellow-600 to-amber-950',
        'bg-gradient-to-b from-amber-500 via-amber-600 to-amber-800',
        'bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900',
      ],
      characterType: 'emperor',
      badgeIcon: Landmark,
    },
    {
      id: 'history_m3',
      nameFr: 'Modèle 3 : Chill mode DegreeUnlocker (Mondialisation & Cartographie)',
      nameEn: 'Model 3: Chill mode DegreeUnlocker (Globalization & Cartography)',
      styleFr: 'Gris Acier Tactique & Cartographie Géopolitique',
      styleEn: 'Tactical Steel Gray & Geopolitical Cartography',
      revisedTopicFr: 'Guerre Froide, Décolonisation & Nouvel Ordre Mondial (1945-2026)',
      revisedTopicEn: 'Cold War, Decolonization & New World Order (1945-2026)',
      quoteFr: '« L\'histoire est un guide pour le présent et une clé pour l\'avenir. »',
      quoteEn: '« History is a guide for the present and a key to the future. »',
      accentColor: '#38bdf8',
      gradientBg: 'from-sky-950/60 via-zinc-950 to-black',
      pillColors: [
        'bg-gradient-to-b from-slate-600 via-slate-700 to-slate-900',
        'bg-gradient-to-b from-sky-600 via-slate-700 to-slate-900',
        'bg-gradient-to-b from-cyan-500 via-sky-700 to-slate-950',
        'bg-gradient-to-b from-sky-600 via-slate-700 to-slate-900',
        'bg-gradient-to-b from-slate-600 via-slate-700 to-slate-900',
      ],
      characterType: 'general',
      badgeIcon: Compass,
    },
  ],

  // 2. Philosophie & Humanités
  philosophy: [
    {
      id: 'philo_m1',
      nameFr: 'Modèle 1 : Hardcore mode DegreeUnlocker (Métaphysique & Dissert)',
      nameEn: 'Model 1: Hardcore mode DegreeUnlocker (Metaphysics & Essay)',
      styleFr: 'Marbre Céleste & Orphisme Hellénique',
      styleEn: 'Celestial Marble & Hellenic Orphism',
      revisedTopicFr: 'L\'Allégorie de la Caverne, La Vérité, Le Beau et le Bien',
      revisedTopicEn: 'The Allegory of the Cave, Truth, Beauty and the Good',
      quoteFr: '« Connais-toi toi-même et tu connaîtras l\'univers et les dieux. »',
      quoteEn: '« Know thyself and thou shalt know the universe and the gods. »',
      accentColor: '#a855f7',
      gradientBg: 'from-purple-950/60 via-zinc-950 to-black',
      pillColors: [
        'bg-gradient-to-b from-purple-600 via-purple-800 to-slate-950',
        'bg-gradient-to-b from-violet-500 via-purple-700 to-slate-900',
        'bg-gradient-to-b from-purple-400 via-fuchsia-600 to-zinc-950',
        'bg-gradient-to-b from-violet-500 via-purple-700 to-slate-900',
        'bg-gradient-to-b from-purple-600 via-purple-800 to-slate-950',
      ],
      characterType: 'philosopher',
      badgeIcon: Feather,
    },
    {
      id: 'philo_m2',
      nameFr: 'Modèle 2 : Normal mode DegreeUnlocker (Lumières & Descartes)',
      nameEn: 'Model 2: Normal mode DegreeUnlocker (Enlightenment & Descartes)',
      styleFr: 'Parchemin Enlumineur & Rayonnement Critique',
      styleEn: 'Illuminated Parchment & Critical Illumination',
      revisedTopicFr: 'Cogito Ergo Sum, Méthode, Doute Hyperbolique & Liberté',
      revisedTopicEn: 'Cogito Ergo Sum, Method, Hyperbolic Doubt & Freedom',
      quoteFr: '« Penser par soi-même est la première règle de l\'émancipation. »',
      quoteEn: '« To think for oneself is the primary rule of emancipation. »',
      accentColor: '#f59e0b',
      gradientBg: 'from-amber-950/60 via-zinc-950 to-black',
      pillColors: [
        'bg-gradient-to-b from-amber-600 via-amber-800 to-zinc-950',
        'bg-gradient-to-b from-yellow-500 via-amber-700 to-zinc-900',
        'bg-gradient-to-b from-amber-300 via-amber-600 to-zinc-950',
        'bg-gradient-to-b from-yellow-500 via-amber-700 to-zinc-900',
        'bg-gradient-to-b from-amber-600 via-amber-800 to-zinc-950',
      ],
      characterType: 'scholar',
      badgeIcon: Scroll,
    },
    {
      id: 'philo_m3',
      nameFr: 'Modèle 3 : Chill mode DegreeUnlocker (Existentialisme & Conscience)',
      nameEn: 'Model 3: Chill mode DegreeUnlocker (Existentialism & Consciousness)',
      styleFr: 'Noir Absolu & Vertige de la Conscience',
      styleEn: 'Absolute Black & Vertigo of Consciousness',
      revisedTopicFr: 'L\'Existence précède l\'Essence, Angoisse & Responsabilité Universelle',
      revisedTopicEn: 'Existence precedes Essence, Anguish & Universal Responsibility',
      quoteFr: '« L\'homme est condamné à être libre. » — Jean-Paul Sartre',
      quoteEn: '« Man is condemned to be free. » — Jean-Paul Sartre',
      accentColor: '#06b6d4',
      gradientBg: 'from-cyan-950/60 via-zinc-950 to-black',
      pillColors: [
        'bg-gradient-to-b from-cyan-600 via-slate-800 to-black',
        'bg-gradient-to-b from-teal-500 via-cyan-800 to-black',
        'bg-gradient-to-b from-cyan-400 via-sky-600 to-black',
        'bg-gradient-to-b from-teal-500 via-cyan-800 to-black',
        'bg-gradient-to-b from-cyan-600 via-slate-800 to-black',
      ],
      characterType: 'scholar',
      badgeIcon: Sparkles,
    },
  ],

  // 3. Mathématiques & Sciences (Physique, NSI, SVT)
  math: [
    {
      id: 'math_m1',
      nameFr: 'Modèle 1 : Hardcore mode DegreeUnlocker (Olympiades & Prépa STEM)',
      nameEn: 'Model 1: Hardcore mode DegreeUnlocker (Olympiads & STEM)',
      styleFr: 'Néon Cyan Boréal & Géométrie Non-Euclidienne',
      styleEn: 'Boreal Cyan Neon & Non-Euclidean Geometry',
      revisedTopicFr: 'Calcul Intégral, Nombres Complexes & Théorème Fondamental de l\'Algèbre',
      revisedTopicEn: 'Integral Calculus, Complex Numbers & Fundamental Theorem of Algebra',
      quoteFr: '« Les mathématiques sont l\'alphabet avec lequel l\'univers s\'explique. »',
      quoteEn: '« Mathematics is the alphabet with which the universe expresses itself. »',
      accentColor: '#38bdf8',
      gradientBg: 'from-cyan-950/60 via-zinc-950 to-black',
      pillColors: [
        'bg-gradient-to-b from-cyan-500 via-blue-700 to-slate-950',
        'bg-gradient-to-b from-sky-400 via-indigo-700 to-slate-900',
        'bg-gradient-to-b from-cyan-300 via-sky-500 to-slate-950',
        'bg-gradient-to-b from-sky-400 via-indigo-700 to-slate-900',
        'bg-gradient-to-b from-cyan-500 via-blue-700 to-slate-950',
      ],
      characterType: 'scientist',
      badgeIcon: Atom,
    },
    {
      id: 'math_m2',
      nameFr: 'Modèle 2 : Normal mode DegreeUnlocker (Physique Quantique & Relativité)',
      nameEn: 'Model 2: Normal mode DegreeUnlocker (Quantum Physics & Relativity)',
      styleFr: 'Cosmos Pourpre & Tenseur Espace-Temps',
      styleEn: 'Purple Cosmos & Space-Time Tensor',
      revisedTopicFr: 'Mécanique Céleste, Ondes Gravitationnelles & Thermodynamique',
      revisedTopicEn: 'Celestial Mechanics, Gravitational Waves & Thermodynamics',
      quoteFr: '« L\'imagination est le moteur principal de la découverte scientifique. »',
      quoteEn: '« Imagination is the main engine of scientific discovery. »',
      accentColor: '#ec4899',
      gradientBg: 'from-fuchsia-950/60 via-zinc-950 to-black',
      pillColors: [
        'bg-gradient-to-b from-pink-600 via-purple-800 to-black',
        'bg-gradient-to-b from-fuchsia-500 via-indigo-700 to-black',
        'bg-gradient-to-b from-rose-400 via-fuchsia-600 to-black',
        'bg-gradient-to-b from-fuchsia-500 via-indigo-700 to-black',
        'bg-gradient-to-b from-pink-600 via-purple-800 to-black',
      ],
      characterType: 'scientist',
      badgeIcon: Sparkles,
    },
    {
      id: 'math_m3',
      nameFr: 'Modèle 3 : Chill mode DegreeUnlocker (Cyber-Algorithmique & NSI)',
      nameEn: 'Model 3: Chill mode DegreeUnlocker (Cyber-Algorithms & NSI)',
      styleFr: 'Vert Émeraude Terminal & Graphes Binaires',
      styleEn: 'Terminal Emerald Green & Binary Graphs',
      revisedTopicFr: 'Arbres Binaires, Complexité Temporelle O(N) & Cryptographie RSA',
      revisedTopicEn: 'Binary Trees, Time Complexity O(N) & RSA Cryptography',
      quoteFr: '« Tout problème calculable peut être résolu avec méthode. »',
      quoteEn: '« Any computable problem can be solved with method. »',
      accentColor: '#10b981',
      gradientBg: 'from-emerald-950/60 via-zinc-950 to-black',
      pillColors: [
        'bg-gradient-to-b from-emerald-600 via-teal-800 to-black',
        'bg-gradient-to-b from-green-500 via-emerald-700 to-black',
        'bg-gradient-to-b from-emerald-400 via-teal-600 to-black',
        'bg-gradient-to-b from-green-500 via-emerald-700 to-black',
        'bg-gradient-to-b from-emerald-600 via-teal-800 to-black',
      ],
      characterType: 'cyber',
      badgeIcon: Binary,
    },
  ],

  // 4. Default / Dashboard / Vue d'ensemble (DegreeUnlocker Workstation Core)
  dashboard: [
    {
      id: 'dash_m1',
      nameFr: 'Modèle 1 : Hardcore mode DegreeUnlocker',
      nameEn: 'Model 1: Hardcore mode DegreeUnlocker',
      styleFr: 'Écarlate Profond & Masque Couronné Sombre',
      styleEn: 'Deep Crimson & Crowned Dark Mask',
      revisedTopicFr: 'Synthèse Magistrale : Histoire, Philo, Mathématiques & Sciences',
      revisedTopicEn: 'Mastery Overview: History, Philosophy, Mathematics & Sciences',
      quoteFr: '« La discipline forgera votre maîtrise; la répétition scellera votre succès. »',
      quoteEn: '« Discipline will forge your mastery; repetition will seal your success. »',
      accentColor: '#dc2626',
      gradientBg: 'from-red-950/70 via-zinc-950 to-black',
      pillColors: [
        'bg-gradient-to-b from-red-600 via-red-700 to-red-950',
        'bg-gradient-to-b from-red-500 via-red-600 to-red-900',
        'bg-gradient-to-b from-red-600 via-rose-700 to-red-950',
        'bg-gradient-to-b from-red-500 via-red-600 to-red-900',
        'bg-gradient-to-b from-red-600 via-red-700 to-red-950',
      ],
      characterType: 'monarch',
      badgeIcon: Crown,
    },
    {
      id: 'dash_m2',
      nameFr: 'Modèle 2 : Normal mode DegreeUnlocker',
      nameEn: 'Model 2: Normal mode DegreeUnlocker',
      styleFr: 'Noir Fusain Hardcore & Or Impérial',
      styleEn: 'Hardcore Charcoal Black & Imperial Gold',
      revisedTopicFr: 'Rétention SRS Active, Base Locale SQLite & Automatisation',
      revisedTopicEn: 'Active SRS Retention, Local SQLite Database & Automation',
      quoteFr: '« Dans les ténèbres de l\'ignorance, le savoir est l\'unique armure. »',
      quoteEn: '« In the darkness of ignorance, knowledge is the only armor. »',
      accentColor: '#f59e0b',
      gradientBg: 'from-amber-950/70 via-zinc-950 to-black',
      pillColors: [
        'bg-gradient-to-b from-zinc-700 via-zinc-800 to-black',
        'bg-gradient-to-b from-amber-600 via-amber-800 to-zinc-950',
        'bg-gradient-to-b from-amber-500 via-yellow-700 to-black',
        'bg-gradient-to-b from-amber-600 via-amber-800 to-zinc-950',
        'bg-gradient-to-b from-zinc-700 via-zinc-800 to-black',
      ],
      characterType: 'emperor',
      badgeIcon: Shield,
    },
    {
      id: 'dash_m3',
      nameFr: 'Modèle 3 : Chill mode DegreeUnlocker',
      nameEn: 'Model 3: Chill mode DegreeUnlocker',
      styleFr: 'Cyan Glacial & Vitesse d\'Exécution Maximale',
      styleEn: 'Glacial Ice Cyan & Maximum Execution Speed',
      revisedTopicFr: 'Indexation Sémantique Rapide, Recherche IA & Mode Station 120 FPS',
      revisedTopicEn: 'Fast Semantic Indexing, AI Search & 120 FPS Workstation Mode',
      quoteFr: '« Vitesse, clarté et précision : l\'alliance absolue de la réussite. »',
      quoteEn: '« Speed, clarity and precision: the ultimate alliance of success. »',
      accentColor: '#38bdf8',
      gradientBg: 'from-sky-950/70 via-zinc-950 to-black',
      pillColors: [
        'bg-gradient-to-b from-sky-600 via-slate-800 to-black',
        'bg-gradient-to-b from-cyan-500 via-sky-800 to-black',
        'bg-gradient-to-b from-sky-400 via-cyan-600 to-black',
        'bg-gradient-to-b from-cyan-500 via-sky-800 to-black',
        'bg-gradient-to-b from-sky-600 via-slate-800 to-black',
      ],
      characterType: 'scientist',
      badgeIcon: Zap,
    },
  ],
};

/**
 * PcWorkstationPillBanner - The PC Desktop / DegreeUnlocker 5-Pill Vertical Segmented Hero Banner
 * Recreates the exact segmented rounded pill art layout from the user's screenshot,
 * supporting 3 switchable models per subject with subject badges, style tags, and revised topic displays.
 */
export const PcWorkstationPillBanner: React.FC<PcWorkstationPillBannerProps> = ({
  activeTab,
  selectedSubject,
  lang,
  onLaunchRevision,
  onOpenInstallGuide,
  onOpenSoundHUD,
  className = '',
}) => {
  const gradientId = useId();

  // Determine preset list based on active tab or subject
  let presetKey = 'dashboard';
  if (selectedSubject) {
    const sub = selectedSubject.toLowerCase();
    if (sub.includes('hist') || sub.includes('géo') || sub.includes('hggsp')) {
      presetKey = 'history';
    } else if (sub.includes('phil') || sub.includes('hlp') || sub.includes('franc') || sub.includes('litt')) {
      presetKey = 'philosophy';
    } else if (sub.includes('math') || sub.includes('phys') || sub.includes('nsi') || sub.includes('svt') || sub.includes('sci')) {
      presetKey = 'math';
    }
  } else {
    if (activeTab === 'flashcards' || activeTab === 'quiz') {
      presetKey = 'philosophy';
    } else if (activeTab === 'search' || activeTab === 'blocknote') {
      presetKey = 'math';
    } else if (activeTab === 'library') {
      presetKey = 'history';
    }
  }

  const models = TAB_PRESETS[presetKey] || TAB_PRESETS.dashboard;
  const [selectedModelIdx, setSelectedModelIdx] = useState<number>(0);
  const [selectedSessionMode, setSelectedSessionMode] = useState<SessionMode>('hardcore');

  const currentModel = models[selectedModelIdx] || models[0] || TAB_PRESETS.dashboard[0];
  const BadgeIcon = currentModel?.badgeIcon || Zap;
  const activeSessionConfig = SESSION_MODES_CONFIG[selectedSessionMode] || SESSION_MODES_CONFIG.hardcore;
  const SessionModeIcon = activeSessionConfig?.icon || Zap;

  return (
    <div className={`w-full mb-6 rounded-3xl bg-gradient-to-b ${currentModel.gradientBg} border border-zinc-800/80 shadow-2xl p-5 sm:p-6 text-white relative overflow-hidden select-none ${className}`}>
      
      {/* Background ambient lighting */}
      <div 
        className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none -z-0"
        style={{ backgroundColor: activeSessionConfig.accentColor || currentModel.accentColor }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none -z-0 opacity-40" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: 5-PILL VERTICAL SEGMENTED ARTWORK (MATCHING USER SCREENSHOT) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 flex items-center justify-center py-2">
          <div className="relative flex items-center justify-center gap-2.5 sm:gap-3 group">
            
            {/* 5 Vertical Rounded Pill Bars with varied heights */}
            {/* Pill 1 (Outer Left) */}
            <div 
              className={`w-10 sm:w-12 h-32 sm:h-36 rounded-full shadow-lg ${currentModel.pillColors[0]} border border-white/10 transform transition-all duration-300 group-hover:scale-105 flex items-center justify-center relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/20" />
            </div>

            {/* Pill 2 (Mid Left) */}
            <div 
              className={`w-10 sm:w-12 h-40 sm:h-44 rounded-full shadow-xl ${currentModel.pillColors[1]} border border-white/10 transform transition-all duration-300 group-hover:scale-105 flex items-center justify-center relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/20" />
              {/* Hood / Robe contour slice */}
              <div className="absolute bottom-4 -right-3 w-16 h-24 bg-black/80 rounded-full blur-xs transform -rotate-12 opacity-90" />
              <div className="absolute bottom-2 -right-1 w-12 h-16 bg-red-950/90 rounded-full transform -rotate-6" />
            </div>

            {/* Pill 3 (CENTER - TALLEST: Features the King/Figure Crown & Mask) */}
            <div 
              className={`w-12 sm:w-14 h-48 sm:h-56 rounded-full shadow-2xl ${currentModel.pillColors[2]} border-2 border-white/20 transform transition-all duration-300 group-hover:scale-105 flex flex-col items-center justify-start pt-6 relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-white/25" />
              
              {/* Illustrated Character Avatar (Monarch / Masked Sovereign in Crimson Robes) */}
              <div className="relative z-10 flex flex-col items-center">
                {/* Imperial Crown with jewels */}
                <svg className="w-9 h-9 drop-shadow-lg" viewBox="0 0 100 100" fill="none">
                  <path
                    d="M15 65 L25 35 L40 50 L50 20 L60 50 L75 35 L85 65 Z"
                    fill={`url(#${gradientId}-crown)`}
                    stroke="#18181b"
                    strokeWidth="3"
                  />
                  <circle cx="50" cy="22" r="4" fill="#ffffff" />
                  <circle cx="25" cy="37" r="3" fill="#f59e0b" />
                  <circle cx="75" cy="37" r="3" fill="#f59e0b" />
                  <rect x="20" y="62" width="60" height="8" rx="2" fill="#09090b" stroke="#71717a" strokeWidth="1" />
                  <defs>
                    <linearGradient id={`${gradientId}-crown`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#d4d4d8" />
                      <stop offset="50%" stopColor="#71717a" />
                      <stop offset="100%" stopColor="#27272a" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Dark Masked Head (Silver/Black Veil) */}
                <div className="w-8 h-12 bg-gradient-to-b from-zinc-800 via-zinc-950 to-black rounded-lg mt-0.5 border border-zinc-700/60 shadow-inner flex items-center justify-center relative">
                  {/* Eye slits */}
                  <div className="flex gap-1.5 mt-2">
                    <div className="w-1.5 h-0.5 bg-amber-400/80 rounded-full" />
                    <div className="w-1.5 h-0.5 bg-amber-400/80 rounded-full" />
                  </div>
                </div>

                {/* Crimson / Velvet Royal Robe */}
                <div className="w-12 h-20 bg-gradient-to-b from-red-950 via-zinc-950 to-black rounded-t-xl mt-1 border-t border-red-800/60" />
              </div>
            </div>

            {/* Pill 4 (Mid Right) */}
            <div 
              className={`w-10 sm:w-12 h-40 sm:h-44 rounded-full shadow-xl ${currentModel.pillColors[3]} border border-white/10 transform transition-all duration-300 group-hover:scale-105 flex items-center justify-center relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/20" />
            </div>

            {/* Pill 5 (Outer Right) */}
            <div 
              className={`w-10 sm:w-12 h-32 sm:h-36 rounded-full shadow-lg ${currentModel.pillColors[4]} border border-white/10 transform transition-all duration-300 group-hover:scale-105 flex items-center justify-center relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/20" />
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: SUBJECT, STYLE & REVISED TOPIC METADATA + 3-MODEL SWITCHER  */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Top Bar: Station Badge & 3-Model Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white font-mono text-[11px] font-bold tracking-wider flex items-center gap-1.5 border border-white/10">
                <BadgeIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>DEGREEUNLOCKER PC WORKSTATION</span>
              </span>
              <span 
                className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider"
                style={{ backgroundColor: `${currentModel.accentColor}25`, color: currentModel.accentColor }}
              >
                {lang === 'fr' ? 'Édition Bureau' : 'Desktop Edition'}
              </span>
            </div>

            {/* 3 Model Selector Buttons */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold text-zinc-400 px-2">
                {lang === 'fr' ? 'Modèles :' : 'Models:'}
              </span>
              {models.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => {
                    soundFx.playClick(900 + idx * 60);
                    setSelectedModelIdx(idx);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    selectedModelIdx === idx
                      ? 'bg-amber-500 text-black shadow-md font-extrabold scale-105'
                      : 'text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                  title={lang === 'fr' ? m.nameFr : m.nameEn}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Model Title & Aesthetic Style */}
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-serif flex items-center gap-2">
              <span>{lang === 'fr' ? currentModel.nameFr : currentModel.nameEn}</span>
            </h2>

            {/* Style & Discipline Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-zinc-200">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  <strong className="text-zinc-400 mr-1">{lang === 'fr' ? 'Style :' : 'Style:'}</strong>
                  {lang === 'fr' ? currentModel.styleFr : currentModel.styleEn}
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-zinc-200">
                <BookOpen className="w-3.5 h-3.5 text-red-400" />
                <span>
                  <strong className="text-zinc-400 mr-1">{lang === 'fr' ? 'Matière :' : 'Subject:'}</strong>
                  {selectedSubject || (lang === 'fr' ? 'Histoire-Géo & Tronc Commun' : 'History-Geo & Core')}
                </span>
              </div>
            </div>
          </div>

          {/* 3 SESSION MODES SELECTOR (Séance Hardcore, Séance Détente, Apprentissage Facile) */}
          <div className="space-y-2 pt-1">
            <div className="text-xs font-extrabold tracking-wider text-amber-300 uppercase flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'fr' ? 'Mode de Séance de Révision :' : 'Revision Session Mode:'}</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-normal">
                {lang === 'fr' ? 'Choisissez votre rythme d\'étude' : 'Select your study pace'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['hardcore', 'detente', 'facile'] as SessionMode[]).map((modeKey) => {
                const conf = SESSION_MODES_CONFIG[modeKey] || SESSION_MODES_CONFIG.hardcore;
                const IconComp = conf?.icon || Zap;
                const isActive = selectedSessionMode === modeKey;
                return (
                  <button
                    key={modeKey}
                    onClick={() => {
                      if (modeKey === 'hardcore') {
                        soundFx.playLockIn();
                      } else {
                        soundFx.playSwitch();
                      }
                      setSelectedSessionMode(modeKey);
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                      isActive
                        ? `${conf.borderColor} bg-black/80 shadow-lg`
                        : 'border-white/10 bg-black/30 hover:bg-black/50 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <div 
                        className="absolute inset-0 opacity-15 pointer-events-none"
                        style={{ backgroundColor: conf.accentColor }}
                      />
                    )}
                    <div className="flex items-center justify-between">
                      <IconComp 
                        className={`w-4 h-4 ${isActive ? '' : 'text-zinc-400'}`}
                        style={{ color: isActive ? conf.accentColor : undefined }}
                      />
                      <span 
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                          isActive ? conf.activeBadgeBg : 'bg-white/10 text-zinc-400'
                        }`}
                      >
                        {modeKey === 'hardcore' ? '🔥' : modeKey === 'detente' ? '☕' : '⚡'}
                      </span>
                    </div>

                    <div className="mt-1.5">
                      <div className={`text-xs font-black leading-tight ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                        {lang === 'fr' ? conf.labelFr : conf.labelEn}
                      </div>
                      <div className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                        {lang === 'fr' ? conf.badgeFr : conf.badgeEn}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DYNAMIC TUTORIALS & ADVICE CARD FOR ACTIVE SESSION MODE */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedSessionMode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-2.5 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <span 
                    className="p-1 rounded-lg"
                    style={{ backgroundColor: `${activeSessionConfig.accentColor}25`, color: activeSessionConfig.accentColor }}
                  >
                    <SessionModeIcon className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                      <span>{lang === 'fr' ? activeSessionConfig.labelFr : activeSessionConfig.labelEn}</span>
                      <span className="text-[10px] text-zinc-400 font-normal">({lang === 'fr' ? activeSessionConfig.badgeFr : activeSessionConfig.badgeEn})</span>
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono font-bold">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>TRUCS & ASTUCES DEGREEUNLOCKER</span>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                {lang === 'fr' ? activeSessionConfig.descriptionFr : activeSessionConfig.descriptionEn}
              </p>

              {/* 3 Micro Tuto Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {(lang === 'fr' ? activeSessionConfig.tipsFr : activeSessionConfig.tipsEn).map((tip, i) => (
                  <div 
                    key={i}
                    className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 transition-colors space-y-1"
                  >
                    <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                      <span>{tip.icon}</span>
                      <span className="line-clamp-1">{tip.title}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-snug">
                      {tip.desc}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* What is being revised ("Ce qui est révisé") Card */}
          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'fr' ? 'Sujet actuellement révisé :' : 'Currently revised topic:'}</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Modèle {selectedModelIdx + 1}/3</span>
            </div>
            <p className="text-xs font-medium text-zinc-200 leading-snug">
              {lang === 'fr' ? currentModel.revisedTopicFr : currentModel.revisedTopicEn}
            </p>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {onLaunchRevision && (
              <button
                onClick={() => {
                  soundFx.playSuccess();
                  onLaunchRevision();
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>
                  {lang === 'fr' 
                    ? `Démarrer (${activeSessionConfig.labelFr})` 
                    : `Start (${activeSessionConfig.labelEn})`
                  }
                </span>
              </button>
            )}

            <button
              onClick={() => {
                soundFx.playClick(900);
                setSelectedModelIdx((prev) => (prev + 1) % models.length);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-white font-bold text-xs transition-colors border border-zinc-700 cursor-pointer flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'fr' ? 'Changer de Modèle (1-3)' : 'Switch Model (1-3)'}</span>
            </button>

            {onOpenSoundHUD && (
              <button
                onClick={() => {
                  soundFx.playClick(850);
                  onOpenSoundHUD();
                }}
                className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-indigo-600/30 to-amber-500/20 hover:from-amber-500/35 hover:to-indigo-500/40 text-amber-300 font-bold text-xs transition-all border border-amber-400/40 cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-500/10 group"
                title={lang === 'fr' ? 'Activer le Studio Audio & Fréquences Alpha/Thêta' : 'Activate Quantum Focus Audio Studio'}
              >
                <Headphones className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform animate-pulse" />
                <span>{lang === 'fr' ? 'Studio Focus 🎧' : 'Focus Studio 🎧'}</span>
              </button>
            )}

            {onOpenInstallGuide && (
              <button
                onClick={() => {
                  soundFx.playClick(750);
                  onOpenInstallGuide();
                }}
                className="px-3.5 py-2.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold text-xs transition-all border border-indigo-400/40 cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                title={lang === 'fr' ? 'Télécharger le Launcher PC Tauri / PWA' : 'Download PC Tauri / PWA Launcher'}
              >
                <Maximize2 className="w-3.5 h-3.5 text-indigo-300" />
                <span>{lang === 'fr' ? 'Installer App PC / Launcher 💻' : 'Install PC App / Launcher 💻'}</span>
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default PcWorkstationPillBanner;
