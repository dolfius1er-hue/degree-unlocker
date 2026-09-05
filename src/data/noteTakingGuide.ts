export interface NoteTakingSection {
  id: string;
  titleFr: string;
  titleEn: string;
  badge: string;
  icon: string;
  summaryFr: string;
  summaryEn: string;
  stepsFr: string[];
  stepsEn: string[];
  goldenRuleFr: string;
  goldenRuleEn: string;
}

export const NOTE_TAKING_GUIDE: NoteTakingSection[] = [
  {
    id: 'cornell-method',
    titleFr: '1. La Méthode Cornell (Système de Révision Ultime)',
    titleEn: '1. The Cornell Note-Taking System',
    badge: 'Standard Mondial',
    icon: 'Columns',
    summaryFr: 'Divisez chaque page de cahier en 3 zones distinctes : la colonne des repères à gauche (6 cm), la zone de notes au centre, et le résumé en bas (5 cm).',
    summaryEn: 'Divide each page into 3 clear zones: the left cue column (2.5 inches / 6 cm), the central note-taking area, and the bottom summary block (2 inches / 5 cm).',
    stepsFr: [
      'Pendant le cours : Notez les idées clés, formules et exemples dans la grande colonne de droite en utilisant des puces et abréviations.',
      'Juste après le cours (J+0) : Écrivez dans la colonne de gauche (marge rouge) des mots-clés et questions d\'examen ("Qu\'est-ce que...", "Formule de...").',
      'En bas de page : Rédigez une synthèse en 2 ou 3 phrases qui résume l\'essentiel du cours avec vos propres mots.',
      'Lors des révisions : Cachez la colonne de droite avec une feuille et essayez de répondre aux questions de la marge gauche de mémoire.',
    ],
    stepsEn: [
      'During class: Record concise facts, formulas, and examples in the main right-hand column using bullet points and standard abbreviations.',
      'Right after class (Day 0): Formulate test questions and high-yield keywords in the left cue margin.',
      'Bottom of page: Write a 2-3 sentence executive summary capturing the core lesson in your own words.',
      'During exam review: Cover the main note area and test yourself aloud using only the cue column questions.',
    ],
    goldenRuleFr: 'Règle d\'or : La marge gauche sert à questionner votre cerveau, pas seulement à décorer.',
    goldenRuleEn: 'Golden Rule: The left margin must question your active memory, not just sit as passive decoration.',
  },
  {
    id: 'color-coding',
    titleFr: '2. Le Code Couleur Rationnel (Stylo Bic 4 Couleurs)',
    titleEn: '2. Rational Color-Coding (4-Color Pen Method)',
    badge: 'Mémoire Visuelle',
    icon: 'Palette',
    summaryFr: 'Limitez-vous à 4 couleurs constantes pour que votre cerveau associe instantanément une couleur à un type d\'information.',
    summaryEn: 'Stick strictly to 4 consistent colors so your brain instantaneously categorizes information without cognitive overload.',
    stepsFr: [
      '🔵 Stylo Bleu : Corps du texte, explications détaillées, démonstrations et étapes de calcul.',
      '⚫ Stylo Noir : Titres de parties, définitions formelles et termes fondamentaux.',
      '🔴 Stylo Rouge : Formules encadrées, théorèmes majeurs, dates clés et pièges classiques d\'examen.',
      '🟢 Stylo Vert : Exemples concrets, vocabulaire technique nouveau, annotations personnelles et renvois.',
    ],
    stepsEn: [
      '🔵 Blue Ink: Core body text, explanatory notes, calculation steps, and general narrative.',
      '⚫ Black Ink: Section headers, formal definitions, and foundational structural terms.',
      '🔴 Red Ink: Boxed formulas, major theorems, crucial dates, and common exam pitfalls.',
      '🟢 Green Ink: Concrete examples, new technical vocabulary, and personal revision cross-references.',
    ],
    goldenRuleFr: 'Règle d\'or : Si tout est surligné en fluo, plus rien n\'est important. N\'encadrez que l\'essentiel absolu.',
    goldenRuleEn: 'Golden Rule: When everything is highlighted, nothing is important. Frame only the absolute essentials.',
  },
  {
    id: 'sketchnoting',
    titleFr: '3. Sketchnoting & Hiérarchie Visuelle',
    titleEn: '3. Visual Hierarchy & Sketchnoting',
    badge: 'Mémorisation Rapide',
    icon: 'PenTool',
    summaryFr: 'Remplacez les longs pavés de texte par des schémas simplifiés, flèches causales et encadrés mémorables.',
    summaryEn: 'Replace dense walls of prose with simplified cause-and-effect arrows, nested bullet trees, and callout boxes.',
    stepsFr: [
      'Utilisez des symboles standardisés : "→" (entraîne / cause), "≠" (différent de), "⚡" (attention / piège), "★" (question récurrente au bac).',
      'Encadrez les lois fondamentales avec une règle pour créer des repères visuels immédiats lors du feuilletage.',
      'Intégrez des schémas d\'écolier simplifiés (ex: cellule avec flèches vers noyau/mitochondrie, triangle des forces).',
      'Adoptez une indentation systématique : Titre I > 1. Sous-titre > • Point clé > - Exemple.',
    ],
    stepsEn: [
      'Standardize your symbols: "→" (causes / leads to), "≠" (differs from), "⚡" (danger / exam trap), "★" (frequent test question).',
      'Draw neat boxes around critical laws and equations to anchor visual landmarks while skimming.',
      'Sketch minimal hand-drawn diagrams (e.g., cell components with pointing arrows, coordinate axis).',
      'Enforce rigorous indentation: Section I > 1. Subsection > • Core point > - Supporting example.',
    ],
    goldenRuleFr: 'Règle d\'or : Une image ou un schéma bien fléché vaut mieux que 10 lignes de texte ininterrompu.',
    goldenRuleEn: 'Golden Rule: A clean labeled diagram with directional arrows outperforms ten lines of plain text.',
  },
  {
    id: 'feynman-spaced',
    titleFr: '4. La Répétition Espacée & Technique Feynman',
    titleEn: '4. Spaced Repetition & The Feynman Technique',
    badge: 'Ancrage Durable',
    icon: 'Clock',
    summaryFr: 'La prise de note manuscrite active stimule le cortex moteur. Pour ne rien oublier, appliquez le rythme J+1, J+7, J+30.',
    summaryEn: 'Handwritten notes physically stimulate motor cortex retention. Lock knowledge in with the Day 1, Day 7, Day 30 review cadence.',
    stepsFr: [
      'Jour J+1 : Relisez vos notes pendant 5 minutes. Complétez les abréviations incompréhensibles à tête reposée.',
      'Technique Feynman : Fermez votre cahier et expliquez le concept à voix haute comme si vous parliez à un collégien de 12 ans.',
      'Jour J+7 : Faites une auto-évaluation rapide à partir des questions de la marge gauche.',
      'Jour J+30 : Recopiez sur une feuille blanche les 5 formules ou concepts clés sans regarder.',
    ],
    stepsEn: [
      'Day +1: Re-read your notes for 5 minutes. Expand any cryptic shorthand while the lecture is still fresh.',
      'Feynman Technique: Close the notebook and explain the lesson aloud as if teaching a 12-year-old child.',
      'Day +7: Self-test your memory using only the prompts written in your left Cornell margin.',
      'Day +30: Take a blank sheet and write down the 5 core formulas and definitions completely from scratch.',
    ],
    goldenRuleFr: 'Règle d\'or : Si vous n\'arrivez pas à l\'expliquer simplement, c\'est que vous ne l\'avez pas encore compris.',
    goldenRuleEn: 'Golden Rule: If you cannot explain it simply, you have not truly understood it yet.',
  },
  {
    id: 'anti-hallucination-source',
    titleFr: '5. Rigueur des Sources & Vérification Anti-Invention',
    titleEn: '5. Source Rigor & Grounded Anti-Hallucination',
    badge: 'Fiabilité Académique',
    icon: 'ShieldCheck',
    summaryFr: 'Ne jamais faire confiance aveuglément à des résumés génériques. Vérifiez toujours la source exacte dans vos documents de cours officiels.',
    summaryEn: 'Never blindly trust unverified summaries. Cross-reference every definition with your official course syllabus and teacher notes.',
    stepsFr: [
      'Vérifiez la provenance : Le document provient-il d\'un manuel officiel, du polycopié du professeur ou de notes rapides ?',
      'Contrôle des définitions : Les termes techniques sont-ils définis mot pour mot selon le programme officiel ?',
      'Recherche textuelle exacte : Utilisez la barre de recherche par mot pour retrouver l\'occurrence exacte dans le polycopié source.',
      'Garde-fou IA : Assurez-vous que l\'IA cite le paragraphe source et signale explicitement si un point n\'est pas dans vos notes.',
    ],
    stepsEn: [
      'Check origin: Did this note originate from an official syllabus, a professor\'s lecture handout, or student scratch paper?',
      'Inspect terminology: Are technical keywords defined accurately according to the exam board rubric?',
      'Exact word retrieval: Use the exact-match search bar to verify line numbers and original citations.',
      'AI Guardrail: Ensure that AI search cites the exact source paragraph and never invents extra claims beyond your notes.',
    ],
    goldenRuleFr: 'Règle d\'or : Une note fiable est une note dont vous pouvez citer la source exacte mot pour mot.',
    goldenRuleEn: 'Golden Rule: A reliable study note is one whose exact source and paragraph can be verified verbatim.',
  },
];
