export interface StudyPlaylist {
  id: string;
  title: string;
  titleFr: string;
  genre: 'lofi' | 'classical' | 'binaural' | 'ambience' | 'brown_noise' | 'synthwave';
  description: string;
  descriptionFr: string;
  idealFor: string;
  idealForFr: string;
  duration: string;
  embedUrl?: string;
  externalUrl: string;
  color: string;
  bpm: string;
}

export interface StudyTip {
  id: string;
  title: string;
  titleFr: string;
  tip: string;
  tipFr: string;
  category: 'memorization' | 'focus' | 'exam_strategy' | 'health';
  icon: string;
}

export const STUDY_PLAYLISTS: StudyPlaylist[] = [
  {
    id: 'lofi-beats',
    title: 'Lofi Hip Hop Study Beats - 24/7 Chill Focus',
    titleFr: 'Lofi Hip Hop - Rythmes Calmes & Étude Continue',
    genre: 'lofi',
    description: 'Smooth vintage drums, dusty Rhodes piano chords, and soothing warmth designed to create a comfortable study bubble.',
    descriptionFr: 'Accords de piano Rhodes, battements doux et atmosphère chaleureuse pour rester concentré sans fatigue mentale.',
    idealFor: 'Reading notes, writing summaries, drafting essay outlines',
    idealForFr: 'Lecture de cours, rédaction de fiches de synthèse, devoirs réguliers',
    duration: '24/7 Live / 3h Mixes',
    externalUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    color: 'from-amber-700 via-orange-900 to-slate-900',
    bpm: '75-85 BPM',
  },
  {
    id: 'classical-piano',
    title: 'Chopin & Mozart Piano - Deep Synaptic Focus',
    titleFr: 'Piano Classique : Chopin, Bach & Mozart (Focus Synaptique)',
    genre: 'classical',
    description: 'Harmonic classical structures proven by neuroscience to reduce cortisol, stimulate alpha brain waves, and enhance memory consolidation.',
    descriptionFr: 'Structures polyphoniques stimulant les ondes cérébrales Alpha et favorisant la mémorisation à long terme sans paroles distrayantes.',
    idealFor: 'Complex math derivations, physics formulas, deep memorization',
    idealForFr: 'Résolution mathématique, physique quantique, mémorisation de dates et théorèmes',
    duration: '4 Hours Continuous',
    externalUrl: 'https://www.youtube.com/watch?v=4Tr0otuiQuU',
    color: 'from-indigo-900 via-slate-900 to-slate-950',
    bpm: '60-70 BPM (Andante)',
  },
  {
    id: 'binaural-gamma',
    title: '40Hz Gamma Binaural Beats - Super Memory Retention',
    titleFr: 'Battements Binauraux 40 Hz (Ondes Gamma & Rétention Éclair)',
    genre: 'binaural',
    description: 'Precise acoustic frequencies designed for stereo headphones to sync brain hemispheres for peak mental alertness and active recall.',
    descriptionFr: 'Fréquences binaurales 40 Hz pour synchroniser les hémisphères cérébraux lors de l\'apprentissage intense.',
    idealFor: 'Flashcard speed training, memorizing definitions, cramming exams',
    idealForFr: 'Entraînement rapide sur flashcards, révision avant épreuve, mémorisation pure',
    duration: '3 Hours Pure Tone',
    externalUrl: 'https://www.youtube.com/watch?v=WPni755-Krg',
    color: 'from-purple-900 via-violet-950 to-slate-900',
    bpm: '40 Hz Frequency',
  },
  {
    id: 'cafe-rain',
    title: 'Parisian Rainy Library & Coffee Shop Ambience',
    titleFr: 'Bibliothèque & Café Sous la Pluie Parisienne',
    genre: 'ambience',
    description: 'Subtle rain patter against high glass windows, distant coffee espresso machine, and delicate library book page turns.',
    descriptionFr: 'Bruit de pluie sur les vitres, tintement feutré de tasses et bruissement de pages de bibliothèque pour briser le silence pesant.',
    idealFor: 'Long late-night revision sessions, essay writing, coding',
    idealForFr: 'Longues sessions nocturnes, rédaction littéraire, fiches d’histoire-géo',
    duration: '8 Hours Atmospheric',
    externalUrl: 'https://www.youtube.com/watch?v=lTRiuFIWV54',
    color: 'from-teal-900 via-slate-900 to-slate-950',
    bpm: 'Natural Soundscape',
  },
  {
    id: 'brown-noise',
    title: 'Deep Brown Noise - Total Silence & ADHD Blocker',
    titleFr: 'Bruit Brun Profond (Blocage des Distractions & TDAH)',
    genre: 'brown_noise',
    description: 'Low-frequency continuous rumble that masks distracting background sounds, silences internal chatter, and triggers immediate flow state.',
    descriptionFr: 'Sonorité basse et profonde qui étouffe tous les bruits extérieurs parasites et calme l\'agitation mentale instantanément.',
    idealFor: 'Absolute concentration, noisy dorms, silencing anxiety',
    idealForFr: 'Concentration absolue en environnement bruyant, isolation sensorielle totale',
    duration: '10 Hours Pure Brown',
    externalUrl: 'https://www.youtube.com/watch?v=RqzGargX64E',
    color: 'from-amber-950 via-stone-900 to-slate-950',
    bpm: 'Continuous Cascade',
  },
  {
    id: 'synthwave-study',
    title: 'Synthwave & Retrowave Chill - Midnight Coding & Revision',
    titleFr: 'Synthwave & Rétro Chill - Session Nocturne & Projets',
    genre: 'synthwave',
    description: 'Dreamy analog synthesizers, neon melodic pulses, and steady tempo to keep your energy high without overwhelming your focus.',
    descriptionFr: 'Nappes de synthétiseurs analogiques et mélodies néon stimulantes pour garder le rythme et la motivation sans fatigue.',
    idealFor: 'Data analysis, spreadsheets, organizing notes, flashcard review',
    idealForFr: 'Analyse de données, réorganisation de dossiers de cours, sessions dynamiques',
    duration: '2.5 Hours Retrowave',
    externalUrl: 'https://www.youtube.com/watch?v=4xDzrJKXOOY',
    color: 'from-fuchsia-950 via-slate-900 to-slate-950',
    bpm: '90-100 BPM',
  },
];

export const STUDY_TIPS: StudyTip[] = [
  {
    id: 'tip-1',
    title: 'The Feynman Technique',
    titleFr: 'La Méthode Feynman (Expliquer simplement)',
    tip: 'If you cannot explain a concept to a 10-year-old in plain language, you don’t fully understand it yet. Use the Blocknote view to write definitions in your own words.',
    tipFr: 'Si vous ne pouvez pas expliquer un théorème ou une notion avec des mots simples comme à un enfant de 10 ans, vous ne le maîtrisez pas encore. Reformulez avec vos propres mots sur votre cahier.',
    category: 'memorization',
    icon: 'Brain',
  },
  {
    id: 'tip-2',
    title: 'Spaced Repetition intervals',
    titleFr: 'La Courbe de l\'Oubli d\'Ebbinghaus',
    tip: 'Review flashcards at Day 1, Day 3, Day 7, Day 14, and Day 30 to transition knowledge from working memory into permanent crystalline long-term memory.',
    tipFr: 'Révisez vos flashcards à J+1, J+3, J+7, J+14 et J+30. Ce calendrier compense la courbe de l\'oubli et ancre les connaissances dans la mémoire définitive.',
    category: 'memorization',
    icon: 'Sparkles',
  },
  {
    id: 'tip-3',
    title: 'Dual-Coding Pen Strategy',
    titleFr: 'Code Couleur des Stylos & Mémoire Visuelle',
    tip: 'Writing with 4 distinct pen colors (Black for text, Blue for explanations, Red for formulas/theorems, Green for examples) boosts optical retrieval by 35%.',
    tipFr: 'L\'utilisation de 4 stylos distincts (Noir pour la structure, Bleu pour le cours, Rouge pour les formules indispensables, Vert pour les exemples) booste le rappel visuel de 35%.',
    category: 'focus',
    icon: 'PenTool',
  },
  {
    id: 'tip-4',
    title: 'Active Recall vs Passive Reading',
    titleFr: 'Rappel Actif vs Lecture Passive',
    tip: 'Merely re-reading a textbook yields only 10-15% retention after 48 hours. Closing your eyes and quizzing yourself produces 80%+ recall.',
    tipFr: 'Relire passivement un polycopié ne laisse que 10-15% de souvenirs après 48h. Se tester immédiatement à l\'aide des Flashcards et du Quiz Arena monte la rétention à plus de 80%.',
    category: 'exam_strategy',
    icon: 'Zap',
  },
  {
    id: 'tip-5',
    title: 'The 50/10 Brain Rest Cycle',
    titleFr: 'La Règle des 50/10 pour le Cerveau',
    tip: 'Study intensely for 50 minutes, then look at a distance of 20 meters and drink cold water for 10 minutes. This flushes adenosine and resets cognitive focus.',
    tipFr: 'Étudiez intensément pendant 50 minutes, puis regardez au loin (par la fenêtre) et buvez un grand verre d\'eau pendant 10 minutes pour régénérer les neurotransmetteurs.',
    category: 'health',
    icon: 'Clock',
  },
];
