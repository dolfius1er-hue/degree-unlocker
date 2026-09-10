export interface ExerciseSolution {
  stepNumber: number;
  explanation: string;
  formulaOrCalculation?: string;
  result: string;
}

export interface TextbookExercise {
  id: string;
  number: number;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'olympiad' | 'accessible' | 'standard_bac' | 'approfondissement';
  question: string;
  hints: string[];
  solution: ExerciseSolution[];
  keyFormulas?: string[];
  tags: string[];
}

export interface TextbookChapter {
  id: string;
  chapterNumber: number;
  title: string;
  titleEn: string;
  summary: string;
  keyConcepts: string[];
  exercises: TextbookExercise[];
}

export interface SchoolTextbook {
  id: string;
  title: string;
  subtitle: string;
  subject: string;
  gradeLevel: 'Collège (3ème)' | 'Lycée (2nde)' | 'Lycée (1ère)' | 'Lycée (Terminale Spé)' | 'Prépa / Supérieur';
  edition: string;
  authorOrCurriculum: string;
  coverColor: string;
  chaptersCount: number;
  exercisesCount: number;
  chapters: TextbookChapter[];
}

export const SCHOOL_TEXTBOOKS_LIBRARY: SchoolTextbook[] = [
  // =============================================================
  // FRANÇAIS TROISIÈME (FLEURS D'ENCRE - HACHETTE ÉDUCATION)
  // =============================================================
  {
    id: 'book-fleurs-dencre-3eme',
    title: 'Fleurs d\'encre — Français 3ème (Cycle 4)',
    subtitle: 'Programme Officiel Brevet des Collèges : Littérature, Écriture, Grammaire & Dictées',
    subject: 'Français',
    gradeLevel: 'Collège (3ème)',
    edition: 'Hachette Éducation (Collection Fleurs d\'encre)',
    authorOrCurriculum: 'Chantal Bertagna, Françoise Carrier-Nayrolles & Programme Ministère Éducation Nationale',
    coverColor: 'from-pink-600 via-rose-600 to-indigo-700',
    chaptersCount: 5,
    exercisesCount: 5,
    chapters: [
      {
        id: 'fleurs-chap-1',
        chapterNumber: 1,
        title: 'Se raconter, se représenter : Souvenirs d\'enfance et quête de soi',
        titleEn: 'Telling One\'s Story: Childhood Memories and Autobiography',
        summary: 'Étude du genre autobiographique (Rousseau, Perec, Sarraute, Leiris). Les pactes autobiographiques de Philippe Lejeune, l\'écriture rétrospective, le double jeu de la mémoire et les difficultés du souvenir authentique.',
        keyConcepts: [
          'Pacte autobiographique (Auteur = Narrateur = Personnage)',
          'Double énonciation et distance temporelle (Je d\'hier vs Je d\'aujourd\'hui)',
          'Figures du souvenir et métaphores de la mémoire',
          'Vocabulaire des sentiments et de l\'introspection'
        ],
        exercises: [
          {
            id: 'fleurs-ex-1',
            number: 1,
            title: 'Sujet type Brevet : Analyse d\'un extrait d\'Enfance de Nathalie Sarraute',
            difficulty: 'medium',
            question: "Dans cet extrait, l'autrice dialogue avec son double intérieur sur l'acte d'écrire ses souvenirs. 1) Relever deux marques de dialogue intérieur. 2) Expliquer pourquoi l'expression 'des mots tout faits' constitue une menace pour la sincérité du souvenir.",
            hints: [
              "Observer l'utilisation des italiques et des tirets d'interlocution fictive ('Tu vas vraiment faire ça ?').",
              "Montrer que les 'mots tout faits' désignent les clichés littéraires qui étouffent l'émotion brute d'un souvenir d'enfant."
            ],
            tags: ['3ème', 'Brevet', 'Autobiographie', 'Sarraute', 'Fleurs d\'encre'],
            solution: [
              {
                stepNumber: 1,
                explanation: "Les deux voix en confrontation sont marquées par des questions rhétoriques et l'emploi de la 2e personne ('Tu') dialoguant avec la 1re personne ('Je').",
                result: "Dédoublement réflexif typique de l'autobiographie moderne."
              },
              {
                stepNumber: 2,
                explanation: "Les 'mots tout faits' sont les stéréotypes linguistiques. Pour Sarraute, le risque est de trahir la sensation naissante et indécise (le 'tropisme') au profit d'un récit conventionnel.",
                result: "Nécessité d'une écriture sensorielle et méticuleuse."
              }
            ]
          }
        ]
      },
      {
        id: 'fleurs-chap-2',
        chapterNumber: 2,
        title: 'Dénoncer les travers de la société : L\'art de la satire et l\'ironie',
        titleEn: 'Denouncing Society\'s Flaws: Satire and Irony',
        summary: 'De Voltaire à La Fontaine et Montesquieu : l\'arme du conte philosophique, de la fable et du pamphlet pour contester l\'esclavage, l\'injustice, le despotisme et l\'obscurantisme.',
        keyConcepts: [
          'Ironie voltairienne (antiphrase, faux éloge, chute comique)',
          'Apologue et double registre (plaire et instruire)',
          'Dénonciation de l\'esclavage et du fanatisme religieux',
          'Argumentation directe vs argumentation indirecte'
        ],
        exercises: [
          {
            id: 'fleurs-ex-2',
            number: 2,
            title: 'Analyse stylistique : Le nègre de Surinam (Candide, Voltaire)',
            difficulty: 'medium',
            question: "Analyser la phrase clé : 'C'est à ce prix que vous mangez du sucre en Europe.' Quelle figure de rhétorique Voltaire emploie-t-il pour frapper la conscience du lecteur européen ?",
            hints: [
              "Identifier le contraste entre la banalité gourmande du 'sucre' et le sacrifice corporel de l'esclave mutilé.",
              "Parler de réquisitoire et de raccourci moral percutant."
            ],
            tags: ['3ème', 'Voltaire', 'Candide', 'Lumières', 'Satire'],
            solution: [
              {
                stepNumber: 1,
                explanation: "Voltaire met en relation directe le plaisir superflu du consommateur européen ('mangez du sucre') avec l'horreur physique de l'amputation de l'esclave.",
                result: "Condamnation sans appel du système colonial mercantile."
              }
            ]
          }
        ]
      },
      {
        id: 'fleurs-chap-3',
        chapterNumber: 3,
        title: 'Agir dans la cité : Résister par les mots et par les arts',
        titleEn: 'Acting in Society: Resistance through Words and Art',
        summary: 'La littérature engagée sous l\'Occupation et dans les luttes d\'émancipation : Paul Éluard (Liberté), Robert Desnos, Louis Aragon, Boris Vian et le poème comme arme de ralliement et de mémoire.',
        keyConcepts: [
          'Poésie de la Résistance et clandestinité',
          'Anaphore et incantation poétique',
          'Devoir de mémoire et transmission républicaine',
          'Figures d\'insoumission et de fraternité'
        ],
        exercises: [
          {
            id: 'fleurs-ex-3',
            number: 3,
            title: 'Étude d\'un poème engagé : Liberté de Paul Éluard',
            difficulty: 'accessible',
            question: "Expliquer l'effet produit par la répétition obsessionnelle de la formule 'Sur mes cahiers d'écolier / Sur mon pupitre et les arbres / J'écris ton nom' jusqu'à la révélation finale.",
            hints: [
              "Montrer comment le poème part du quotidien de l'enfance pour s'élargir au cosmos tout entier.",
              "Souligner l'effet d'attente (suspense poétique) jusqu'au mot 'Liberté'."
            ],
            tags: ['3ème', 'Éluard', 'Résistance', 'Poésie', 'Brevet'],
            solution: [
              {
                stepNumber: 1,
                explanation: "L'anaphore 'Sur...' rythme le poème comme une prière laïque et universelle. Le poète réenchante le monde brisé par la guerre en gravant le nom partout.",
                result: "L'écriture poétique devient un acte de foi et d'espérance invincible."
              }
            ]
          }
        ]
      },
      {
        id: 'fleurs-chap-4',
        chapterNumber: 4,
        title: 'Progrès et rêves scientifiques : Utopies et fictions d\'anticipation',
        titleEn: 'Scientific Progress: Dystopias and Science Fiction',
        summary: 'La science-fiction comme miroir des angoisses technologiques : René Barjavel (Ravage, La Nuit des temps), Ray Bradbury (Fahrenheit 451, Chroniques martiennes) et George Orwell (1984).',
        keyConcepts: [
          'Différence entre Utopie et Dystopie',
          'Critique du scientisme aveugle et de l\'aliénation numérique',
          'Champ lexical de la technologie et de la déshumanisation',
          'Rôle de l\'écrivain visionnaire et lanceur d\'alerte'
        ],
        exercises: [
          {
            id: 'fleurs-ex-4',
            number: 4,
            title: 'Question de réflexion Brevet : La science peut-elle déshumaniser l\'Homme ?',
            difficulty: 'approfondissement',
            question: "Rédiger un paragraphe argumenté (15 lignes) en mobilisant un exemple d'œuvre dystopique et un exemple contemporain pour répondre à cette problématique.",
            hints: [
              "Structurer avec Thèse, Argument, Exemple précis (ex: Barjavel ou Bradbury) et Connecteurs logiques."
            ],
            tags: ['3ème', 'Brevet', 'Dystopie', 'Argumentation'],
            solution: [
              {
                stepNumber: 1,
                explanation: "Dans Ravage de Barjavel, l'effondrement subit de l'électricité plonge la mégapole ultra-technologique dans la barbarie immédiate.",
                result: "Démontre la vulnérabilité de l'homme lorsqu'il délègue sa pensée aux machines."
              }
            ]
          }
        ]
      },
      {
        id: 'fleurs-chap-5',
        chapterNumber: 5,
        title: 'Maîtrise de la langue : Grammaire, Orthographe & Méthode de Rédaction',
        titleEn: 'Grammar, Syntax and Composition Mastery',
        summary: 'Les accords complexes du participe passé, les propositions subordonnées relatives et conjonctives, le système des temps du récit (imparfait/passé simple) et le discours rapporté (direct, indirect, indirect libre).',
        keyConcepts: [
          'Accord du participe passé avec être, avoir et verbes pronominaux',
          'Subordonnées complétives, circonstancielles et relatives',
          'Valeurs de l\'imparfait (description, habitude) et du passé simple (action de premier plan)',
          'Discours indirect libre et polyphonie narrative'
        ],
        exercises: [
          {
            id: 'fleurs-ex-5',
            number: 5,
            title: 'Exercice de réécriture Brevet : Accord des temps et personnes',
            difficulty: 'medium',
            question: "Réécrire la phrase au passé simple et à la 3e personne du pluriel : 'Je marche dans la forêt silencieuse et je vois soudain une ombre qui s'enfuit.'",
            hints: [
              "Faire attention aux terminaisons du passé simple : marchèrent, virent, s'enfuit."
            ],
            tags: ['3ème', 'Grammaire', 'Passé simple', 'Réécriture'],
            solution: [
              {
                stepNumber: 1,
                explanation: "Application des règles de concordance au passé simple pour le pluriel.",
                result: "« Ils marchèrent dans la forêt silencieuse et ils virent soudain une ombre qui s'enfuit. »"
              }
            ]
          }
        ]
      }
    ]
  },

  // =============================================================
  // FRANÇAIS SECONDE
  // =============================================================
  {
    id: 'book-francais-seconde',
    title: 'Manuel de Français Seconde (Tronc Commun)',
    subtitle: 'Objets d\'étude du Programme : Poésie, Théâtre, Roman & Littérature d\'idées',
    subject: 'Français',
    gradeLevel: 'Lycée (2nde)',
    edition: 'Édition Conforme Programme Officiel - L\'Écume des lettres & Magnard',
    authorOrCurriculum: 'Programme Officiel Ministère de l\'Éducation Nationale',
    coverColor: 'from-amber-600 to-rose-700',
    chaptersCount: 4,
    exercisesCount: 4,
    chapters: [
      {
        id: 'fr2-chap-1',
        chapterNumber: 1,
        title: 'La poésie du Moyen Âge au XVIIIe siècle : Formes fixes et renouveau lyrique',
        titleEn: 'French Poetry from Middle Ages to 18th Century',
        summary: 'Étude des grands courants poétiques : la poésie courtoise, la Pléiade humaniste (Ronsard, Du Bellay), le Baroque et le Classicisme. Maîtrise de la versification, du sonnet, des césures et des figures de rhétorique.',
        keyConcepts: ['Sonnet régulier et alexandrin', 'Topos du Carpe Diem et vanité du monde', 'Métrique poétique : diérèse, synérèse, hémistiche', 'Figures d\'analogie et de rythme'],
        exercises: [
          {
            id: 'fr2-ex-1',
            number: 1,
            title: 'Explication linéaire d\'un sonnet de Pierre de Ronsard',
            difficulty: 'medium',
            question: "Dans le sonnet 'Comme on voit sur la branche au mois de mai la rose' (Amours de Marie, 1578), analyser comment Ronsard mêle l'éloge funèbre à la métaphore florale. Dégager 3 mouvements d'analyse stylistique.",
            hints: [
              "Identifier la comparaison initiale 'Comme on voit...' qui déploie la beauté radieuse de Marie.",
              "Observer la rupture brutale avec la faucheuse et le trépas dans les tercets.",
              "Relever l'hommage funéraire final avec les offrandes végétales ('obsèques', 'roses', 'larmes')."
            ],
            tags: ['Seconde', 'Français', 'Ronsard', 'Pléiade', 'Sonnet'],
            solution: [
              {
                stepNumber: 1,
                explanation: "1er mouvement (strophes 1-2) : Le tableau gracieux de la rose printanière, métaphore de la jeunesse éclatante de Marie avant la maladie.",
                result: "Harmonie lyrique célébrant la grâce et la fraîcheur."
              },
              {
                stepNumber: 2,
                explanation: "2e mouvement (strophe 3) : L'irruption tragique de la mort prématurée sous la figure de la Parque jalouse coupant le fil de la vie.",
                result: "Déchirement élégiaque et stupeur devant la caducité."
              },
              {
                stepNumber: 3,
                explanation: "3e mouvement (strophe 4) : La transfiguration immortelle par le chant poétique et le tombeau de vers.",
                result: "La poésie triomphe de la mort en éternisant le souvenir."
              }
            ]
          }
        ]
      },
      {
        id: 'fr2-chap-2',
        chapterNumber: 2,
        title: 'Le théâtre du XVIIe au XXIe siècle : Texte et représentation',
        titleEn: 'Theater from 17th to 21st Century',
        summary: 'Analyse du texte de théâtre et de sa mise en scène : tragédie cornélienne et racinienne (règles des trois unités, bienséances, catharsis), comédie moliéresque (satire des mœurs), et renouveau contemporain.',
        keyConcepts: ['Règle des trois unités (lieu, temps, action)', 'Didascalies et double énonciation théâtrale', 'Quiproquos, tirades et stichomythies', 'Catharsis tragique et rire critique'],
        exercises: [
          {
            id: 'fr2-ex-2',
            number: 1,
            title: 'Analyse dramaturgique de la scène d\'exposition du Bourgeois Gentilhomme',
            difficulty: 'accessible',
            question: "Dans la scène 1 de l'Acte I du 'Bourgeois Gentilhomme' de Molière (Dialogue entre le Maître de musique et le Maître à danser), montrer comment Molière présente le personnage éponyme de Monsieur Jourdain avant même son entrée en scène.",
            hints: [
              "Analyser le procédé classique de l'exposition différée : parler du héros absent pour piquer la curiosité.",
              "Mettre en évidence le contraste entre l'argent de Jourdain et son absence totale de culture artistique."
            ],
            tags: ['Seconde', 'Théâtre', 'Molière', 'Comédie-ballet', 'Exposition'],
            solution: [
              {
                stepNumber: 1,
                explanation: "Molière caractérise immédiatement Monsieur Jourdain comme un roturier vaniteux et naïf : 'un homme dont les lumières sont petites... mais son argent redresse les jugements de son esprit'.",
                result: "Portrait satirique posant le thème de l'ambition sociale ridicule."
              },
              {
                stepNumber: 2,
                explanation: "Cette scène pose également la satire du monde des artistes courtisans, prêts à flatter les travers du riche pour financer leurs arts.",
                result: "Double satire sociale : la bourgeoisie parvenue et le parasitisme mondain."
              }
            ]
          }
        ]
      }
    ]
  },

  // =============================================================
  // PHILOSOPHIE TERMINALE TRONC COMMUN
  // =============================================================
  {
    id: 'book-philo-terminale',
    title: 'Manuel de Philosophie Terminale (Programme Officiel Bac)',
    subtitle: 'Les 17 Notions Canoniques, Grands Textes & Méthodologie Dissertation / Explication',
    subject: 'Philosophie',
    gradeLevel: 'Lycée (Terminale Spé)',
    edition: 'Conforme Réforme du Baccalauréat Général & Technologique',
    authorOrCurriculum: 'Programme Officiel National de Philosophie',
    coverColor: 'from-violet-700 to-purple-900',
    chaptersCount: 5,
    exercisesCount: 5,
    chapters: [
      {
        id: 'philo-chap-1',
        chapterNumber: 1,
        title: 'La Conscience, L\'Inconscient et Le Sujet',
        titleEn: 'Consciousness, Unconscious and the Subject',
        summary: 'Étude du sujet pensant : du doute méthodique cartésien (cogito ergo sum) à la phénoménologie de Husserl et Sartre (toute conscience est conscience de quelque chose), confrontés à la théorie psychanalytique de l\'inconscient freudien.',
        keyConcepts: ['Cogito cartésien et substance pensante (res cogitans)', 'Intentionnalité phénoménologique (Husserl)', 'Première et Deuxième topique freudienne (Ça, Moi, Surmoi)', 'Critique de la mauvaise foi (Sartre)'],
        exercises: [
          {
            id: 'philo-ex-1',
            number: 1,
            title: 'Dissertation : La conscience de soi est-elle une connaissance de soi ?',
            difficulty: 'hard',
            question: "Analyser le sujet de dissertation : 'La conscience de soi est-elle une connaissance de soi ?' Déterminer le paradoxe, formuler la problématique philosophique et élaborer un plan en 3 parties articulant Descartes, Kant et Freud.",
            hints: [
              "Distinguer la certitude immédiate d'exister (conscience de soi) de la saisie objective de sa nature psychologique complexe (connaissance de soi).",
              "La conscience immédiate est subjective et peut être le lieu d'illusions narcissiques.",
              "La connaissance scientifique de soi requiert la médiation d'autrui et l'analyse critique de nos actes."
            ],
            tags: ['Terminale', 'Philo', 'Conscience', 'Descartes', 'Kant', 'Freud'],
            solution: [
              {
                stepNumber: 1,
                explanation: "Problématique : Si la conscience de soi offre l'évidence indubitable de mon existence pensante (Descartes), suffit-elle à me faire savoir qui je suis, ou bien la connaissance de soi exige-t-elle le détour difficile par le monde, autrui et l'inconscient ?",
                result: "Tension conceptuelle posée avec clarté."
              },
              {
                stepNumber: 2,
                explanation: "I. Thèse : L'illusion de la transparence immédiate (Descartes, le Cogito comme certitude première mais purement formelle). II. Antithèse : Les opacités du moi : l'inconscient et les déterminismes sociaux (Freud, Spinoza, Marx : nous ignorons les causes réelles de nos désirs). III. Synthèse : La connaissance de soi comme conquête éthique et relationnelle (Kant, Hegel, Sartre : se connaître à travers ses œuvres et le regard d'autrui).",
                result: "Plan dialectique complet conforme aux attendus du Bac."
              }
            ]
          }
        ]
      },
      {
        id: 'philo-chap-2',
        chapterNumber: 2,
        title: 'La Liberté, Le Devoir et La Morale',
        titleEn: 'Freedom, Duty and Moral Philosophy',
        summary: 'Examen de l\'autonomie de la volonté face aux déterminismes naturels et sociaux. De l\'impératif catégorique kantien à l\'existentialisme sartrien et au stoïcisme antique.',
        keyConcepts: ['Libre arbitre vs Nécessité déterministe', 'Impératif catégorique et autonomie de la volonté (Kant)', 'La liberté en situation et la responsabilité (Sartre)', 'Stoïcisme : ce qui dépend de nous et ce qui n\'en dépend pas (Épictète)'],
        exercises: [
          {
            id: 'philo-ex-2',
            number: 2,
            title: 'Explication de texte : Kant, Fondements de la métaphysique des mœurs',
            difficulty: 'hard',
            question: "Dans les 'Fondements de la métaphysique des mœurs' (1785), Kant énonce : 'Agis uniquement d'après la maxime qui fait que tu peux vouloir en même temps qu'elle devienne une loi universelle'. Expliquer le critère d'universalisation de la maxime et le distinguer de l'intérêt personnel égoïste.",
            hints: [
              "Montrer que le devoir moral chez Kant ne dépend pas des conséquences heureuses ou malheureuses de l'acte, mais de la pureté de l'intention.",
              "Prendre l'exemple de la fausse promesse pour prouver que sa généralisation détruit la notion même de promesse (contradiction logique interne)."
            ],
            tags: ['Terminale', 'Philo', 'Morale', 'Devoir', 'Kant', 'Impératif catégorique'],
            solution: [
              {
                stepNumber: 1,
                explanation: "Kant fonde la moralité sur la raison pure pratique : une action n'est authentiquement morale que si sa règle d'action (maxime) peut être érigée en loi universelle pour tous les êtres raisonnables sans contradiction.",
                result: "Le devoir moral s'oppose à l'intérêt égoïste et aux mobiles sensibles."
              },
              {
                stepNumber: 2,
                explanation: "L'épreuve de l'universalisation démontre qu'emprunter de l'argent en promettant faussement de le rembourser rend la promesse impossible : si chacun mentait, plus personne ne croirait aux promesses.",
                result: "Démonstration de l'immoralité du mensonge par contradiction rationnelle."
              }
            ]
          }
        ]
      }
    ]
  },

  // =============================================================
  // MATHÉMATIQUES SPÉCIALITÉ TERMINALE
  // =============================================================
  {
    id: 'book-math-term-spe',
    title: 'Manuel de Mathématiques Spécialité Terminale',
    subtitle: 'Analyse, Suites, Géométrie dans l\'Espace & Probabilités',
    subject: 'Mathématiques',
    gradeLevel: 'Lycée (Terminale Spé)',
    edition: 'Édition Conforme Programme Officiel - Indice Bordas & Hyperbole',
    authorOrCurriculum: 'Programme Officiel Baccalauréat Général & Concours',
    coverColor: 'from-blue-600 to-indigo-800',
    chaptersCount: 3,
    exercisesCount: 6,
    chapters: [
      {
        id: 'math-chap-1',
        chapterNumber: 1,
        title: 'Suites numériques, Limites et Récurrence',
        titleEn: 'Sequences, Limits and Mathematical Induction',
        summary: 'Raisonnement par récurrence, théorème de convergence monotone, limites finies et infinies de suites.',
        keyConcepts: ['Initialisation et Hérédité', 'Majoration et convergence', 'Théorème des gendarmes'],
        exercises: [
          {
            id: 'math-ex-1',
            number: 1,
            title: 'Démonstration par récurrence classique',
            difficulty: 'medium',
            question: 'Soit la suite (u_n) définie par u_0 = 2 et pour tout entier n >= 0, u_{n+1} = 0.5 * u_n + 3. Démontrer par récurrence que pour tout n >= 0, u_n <= 6.',
            hints: [
              'Vérifier d\'abord la propriété pour le premier terme u_0 = 2.',
              'Supposer que u_k <= 6 pour un certain entier k et calculer 0.5 * u_k + 3.'
            ],
            keyFormulas: ['P(n): u_n <= 6', 'u_{n+1} = 0.5 * u_n + 3'],
            tags: ['Suites', 'Récurrence', 'Bac'],
            solution: [
              {
                stepNumber: 1,
                explanation: 'Initialisation pour n = 0 : u_0 = 2. Or 2 <= 6, donc la propriété P(0) est vraie.',
                result: 'P(0) est validée.'
              },
              {
                stepNumber: 2,
                explanation: 'Hérédité : Supposons que pour un entier k fixé, u_k <= 6 (hypothèse de récurrence). On a alors 0.5 * u_k <= 3, donc 0.5 * u_k + 3 <= 6, ce qui signifie que u_{k+1} <= 6.',
                formulaOrCalculation: 'u_k <= 6 => 0.5*u_k + 3 <= 3 + 3 = 6 => u_{k+1} <= 6',
                result: 'P(k+1) est vraie.'
              },
              {
                stepNumber: 3,
                explanation: 'Conclusion : Par le principe de récurrence, la propriété P(n) est vraie pour tout entier naturel n.',
                result: 'Pour tout n >= 0, u_n <= 6.'
              }
            ]
          }
        ]
      }
    ]
  },

  // =============================================================
  // HISTOIRE-GÉOGRAPHIE TERMINALE TRONC COMMUN & HGGSP
  // =============================================================
  {
    id: 'book-hg-terminale',
    title: 'Manuel d\'Histoire-Géographie Terminale',
    subtitle: 'Guerres mondiales, Guerre froide, Mondialisation & Mers/Océans',
    subject: 'Histoire-Géographie',
    gradeLevel: 'Lycée (Terminale Spé)',
    edition: 'Collection Le Quintrec Nathan & Hatier',
    authorOrCurriculum: 'Programme Officiel Baccalauréat',
    coverColor: 'from-emerald-600 to-teal-800',
    chaptersCount: 3,
    exercisesCount: 3,
    chapters: [
      {
        id: 'hg-chap-1',
        chapterNumber: 1,
        title: 'Mers et Océans au cœur de la mondialisation',
        titleEn: 'Seas and Oceans in Globalization',
        summary: 'Étude de la maritimisation des flux économiques, de la conteneurisation, des détroits stratégiques et des conflits de délimitation maritime (ZEE, convention de Montego Bay).',
        keyConcepts: ['Maritimisation et façades maritimes', 'Points de passage stratégiques (chokepoints)', 'Zone Économique Exclusive (ZEE de 200 milles nautiques)', 'Surexploitation et protection des ressources marines'],
        exercises: [
          {
            id: 'hg-ex-1',
            number: 1,
            title: 'Étude critique de documents : Le détroit de Malacca',
            difficulty: 'standard_bac',
            question: "À partir de la carte des flux maritimes asiatiques, expliquer pourquoi le détroit de Malacca concentre à la fois des intérêts économiques vitaux pour la Chine et le Japon, et des vulnérabilités géopolitiques majeures (piraterie, risque de blocus).",
            hints: [
              "Évoquer le 'dilemme de Malacca' théorisé par le président chinois Hu Jintao en 2003.",
              "Mentionner que 80% des importations pétrolières chinoises empruntent ce goulet d'étranglement de moins de 3 km de large par endroits."
            ],
            tags: ['Terminale', 'Histoire-Géo', 'Malacca', 'Mondialisation', 'Flux'],
            solution: [
              {
                stepNumber: 1,
                explanation: "Le détroit de Malacca relie l'océan Indien à la mer de Chine méridionale. C'est l'artère maritime la plus fréquentée du globe avec plus de 100 000 navires marchands par an.",
                result: "Verrou géostratégique capital pour l'approvisionnement énergétique de l'Asie de l'Est."
              },
              {
                stepNumber: 2,
                explanation: "Pour contourner cette vulnérabilité, la Chine a lancé les Nouvelles Routes de la Soie (BRI) avec des oléoducs terrestres via le Pakistan (Gwadar) et le Myanmar (Kyaukpyu).",
                result: "Moteur direct des recompositions d'infrastructures mondiales."
              }
            ]
          }
        ]
      }
    ]
  },

  // =============================================================
  // PHYSIQUE-CHIMIE TERMINALE SPÉCIALITÉ (COLLECTION HACHETTE)
  // =============================================================
  {
    id: 'book-physique-chimie-terminale',
    title: 'Physique-Chimie Terminale Spécialité — Ondes, Mécanique & Quantique',
    subtitle: 'Programme Spécialité Baccalauréat : Interférences, Newton, Effet Photoélectrique & Chimie Acido-Basique',
    subject: 'Physique-Chimie',
    gradeLevel: 'Lycée (Terminale Spé)',
    edition: 'Hachette Éducation (Collection Dulaurans / Durandeau)',
    authorOrCurriculum: 'Spécialité Terminale Ministère Éducation Nationale',
    coverColor: 'from-amber-600 via-orange-600 to-indigo-800',
    chaptersCount: 4,
    exercisesCount: 4,
    chapters: [
      {
        id: 'pc-chap-1',
        chapterNumber: 1,
        title: 'Physique Quantique : Dualité Onde-Particule & Effet Photoélectrique',
        titleEn: 'Quantum Physics: Wave-Particle Duality and Photoelectric Effect',
        summary: 'Comprendre l\'hypothèse de Planck-Einstein E = h*nu, la formule de De Broglie lambda = h/p, le travail d\'extraction des métaux et le spectre des photons.',
        keyConcepts: [
          'Photon et quantité de mouvement p = h / lambda',
          'Relation d\'Einstein E = h * f = h * c / lambda',
          'Travail d\'extraction W_0 et énergie cinétique maximale E_c = hf - W_0',
          'Transitions d\'énergie atomique et spectre d\'émission'
        ],
        exercises: [
          {
            id: 'pc-ex-1',
            number: 1,
            title: 'Exercice Bac : Effet photoélectrique sur une plaque de zinc',
            difficulty: 'standard_bac',
            question: "Une plaque de zinc (travail d'extraction W_0 = 4.31 eV) est éclairée par un rayonnement ultraviolet de longueur d'onde lambda = 254 nm. 1) Calculer l'énergie d'un photon UV incident en Joules et en eV. 2) Déterminer si l'effet photoélectrique se produit et calculer l'énergie cinétique maximale des électrons émis.",
            hints: [
              "Constante de Planck h = 6.63 x 10^-34 J.s, c = 3.00 x 10^8 m/s, 1 eV = 1.60 x 10^-19 J.",
              "Utiliser E = h*c / lambda puis convertir en eV. Vérifier si E >= W_0."
            ],
            keyFormulas: ['E = (h * c) / lambda', '1 eV = 1.602 x 10^-19 J', 'E_c_max = E_photon - W_0'],
            tags: ['Terminale', 'Physique Quantique', 'Photon', 'Bac', 'Zinc'],
            solution: [
              {
                stepNumber: 1,
                explanation: "Calcul de l'énergie du photon incident : E = (6.63e-34 * 3.00e8) / (254e-9) = 7.83e-19 Joules.",
                formulaOrCalculation: "E = 7.83 x 10^-19 J = (7.83 x 10^-19) / (1.60 x 10^-19) = 4.89 eV",
                result: "L'énergie de chaque photon incident est de 4.89 eV."
              },
              {
                stepNumber: 2,
                explanation: "Comparaison avec le travail d'extraction : Comme E (4.89 eV) > W_0 (4.31 eV), l'effet photoélectrique a lieu.",
                formulaOrCalculation: "E_c_max = 4.89 eV - 4.31 eV = 0.58 eV = 9.28 x 10^-20 J",
                result: "Des électrons sont éjectés avec une énergie cinétique maximale de 0.58 eV."
              }
            ]
          }
        ]
      }
    ]
  },

  // =============================================================
  // INFORMATIQUE & ALGORITHMIQUE SUPÉRIEUR (DUNOD / O'REILLY)
  // =============================================================
  {
    id: 'book-info-algorithmique-sup',
    title: 'Informatique & Algorithmique Supérieur — Graphes & Complexité',
    subtitle: 'Licence, CPGE & Master : Dijkstra, Arbres, BFS/DFS & Complexité O(n log n)',
    subject: 'Informatique',
    gradeLevel: 'Prépa / Supérieur',
    edition: 'Collection Dunod Informatique & Algorithmique',
    authorOrCurriculum: 'Cormen, Leiserson, Rivest & Stein (CLRS Adapté)',
    coverColor: 'from-cyan-700 via-blue-800 to-slate-900',
    chaptersCount: 3,
    exercisesCount: 3,
    chapters: [
      {
        id: 'info-chap-1',
        chapterNumber: 1,
        title: 'Algorithme de Dijkstra & Plus Courts Chemins',
        titleEn: 'Dijkstra\'s Shortest Path Algorithm and Graph Theory',
        summary: 'Étude des graphes pondérés orientés à poids positifs, démonstration par récurrence du principe de relâchement et implémentation avec file de priorité (Min-Heap).',
        keyConcepts: [
          'Graphe orienté G = (V, E) et matrice/liste d\'adjacence',
          'Principe d\'optimalité des sous-chemins (Bellman)',
          'Opération de relâchement d(v) = min(d(v), d(u) + w(u,v))',
          'Complexité O((|V| + |E|) log |V|) avec tas binaire'
        ],
        exercises: [
          {
            id: 'info-ex-1',
            number: 1,
            title: 'Exercice Supérieur : Déroulement pas-à-pas de Dijkstra',
            difficulty: 'approfondissement',
            question: "Soit un graphe orienté de sommets A, B, C, D, E. Les arêtes pondérées sont : A->B (4), A->C (2), C->B (1), C->D (5), B->D (2), D->E (1). 1) Donner la suite des sommets visités depuis A. 2) Donner le plus court chemin de A vers E et sa distance totale.",
            hints: [
              "Initialiser la table de distances : d[A]=0, d[autres]=infini. Choisir le sommet non visité de distance minimale.",
              "Relaxer les voisins à chaque étape."
            ],
            keyFormulas: ['d[v] = min(d[v], d[u] + weight(u,v))', 'Time Complexity: O((V+E)logV)'],
            tags: ['Supérieur', 'Informatique', 'Graphes', 'Dijkstra', 'Complexité'],
            solution: [
              {
                stepNumber: 1,
                explanation: "Initialisation : A=0. Voisins de A : B(4), C(2). Sommet extrait : C (dist 2). Voisins de C : B passe de 4 à min(4, 2+1=3), D devient 2+5=7.",
                result: "Sommets fixés : A (0), C (2)."
              },
              {
                stepNumber: 2,
                explanation: "Sommet suivant extrait : B (dist 3). Voisins de B : D passe de 7 à min(7, 3+2=5). Sommet suivant extrait : D (dist 5). Voisins de D : E devient 5+1=6. Extrait final : E (dist 6).",
                result: "Chemin optimal : A -> C -> B -> D -> E avec une distance totale de 6."
              }
            ]
          }
        ]
      }
    ]
  },

  // =============================================================
  // 1. FRANÇAIS PREMIÈRE (L'ÉCUME DES LETTRES - HACHETTE)
  // =============================================================
  {
    id: 'book-francais-premiere',
    title: 'L\'Écume des lettres — Français Première (EAF)',
    subtitle: 'Programme Officiel Baccalauréat : Poésie, Théâtre, Roman, Littérature d\'idées & Épreuves EAF',
    subject: 'Français',
    gradeLevel: 'Lycée (1ère)',
    edition: 'Hachette Éducation (Collection L\'Écume des Lettres)',
    authorOrCurriculum: 'Chantal Bertagna, François Binetruy & Ministère de l\'Éducation Nationale',
    coverColor: 'from-rose-600 via-pink-700 to-amber-600',
    chaptersCount: 4,
    exercisesCount: 4,
    chapters: [
      {
        id: 'fr1-chap-1',
        chapterNumber: 1,
        title: 'La Poésie du XIXe au XXIe siècle : Émancipation, Modernité et Alchimie poétique',
        titleEn: 'French Poetry and Poetic Alchemy (Baudelaire & Ponge)',
        summary: 'Étude approfondie de Baudelaire (Les Fleurs du Mal) et de la modernité poétique. Analyse de la boue transformée en or, du spleen et de l\'idéal, et du renouveau du langage poétique chez Rimbaud, Verlaine et Francis Ponge.',
        keyConcepts: [
          'Alchimie poétique et métaphore du poète alchimiste',
          'Spleen, Idéal et correspondances baudelairiennes (Synesthésies)',
          'Poème en prose et affranchissement de la métrique traditionnelle',
          'Méthodologie du commentaire de texte EAF'
        ],
        exercises: [
          {
            id: 'fr1-ex-1',
            number: 1,
            title: 'Explication linéaire Bac : « L\'Albatros » (Les Fleurs du Mal, Baudelaire)',
            difficulty: 'standard_bac',
            question: "Analyser comment Baudelaire construit une allégorie de la condition du poète à travers le conflit entre le monde terrestre et l'espace céleste.",
            hints: [
              "Découper l'explication en 3 mouvements : la capture burlesque, le ridicule de l'oiseau captif, la chute allégorique.",
              "Observer les contrastes d'adjectifs ('prince des nuées' vs 'gauche et veule')."
            ],
            tags: ['Première', 'Français', 'EAF', 'Baudelaire', 'Poésie'],
            solution: [
              {
                stepNumber: 1,
                explanation: "1er mouvement (strophe 1) : La majesté spatiale de l'albatros en vol, symbole de la liberté créatrice et du génie poétique.",
                result: "Élévation et maîtrise de l'élément aérien."
              },
              {
                stepNumber: 2,
                explanation: "2e mouvement (strophes 2-3) : La déchéance ridicule sur le pont du navire. Les marins moqueurs représentent la société bourgeoise hostile à l'art.",
                result: "Plaie du réel et handicap des 'ailes de géant'."
              },
              {
                stepNumber: 3,
                explanation: "3e mouvement (strophe 4) : L'explicitation du symbole allégorique : 'Le Poète est semblable au prince des nuées'.",
                result: "Sublime incompris et destinée tragique du poète."
              }
            ]
          }
        ]
      }
    ]
  },

  // =============================================================
  // 2. MATHÉMATIQUES SECONDE (BARBAZO - HACHETTE)
  // =============================================================
  {
    id: 'book-maths-seconde',
    title: 'Barbazo — Mathématiques Seconde (Tronc Commun)',
    subtitle: 'Nouveau Programme : Fonctions, Calcul littéral, Géométrie vectorielle & Algorithmique Python',
    subject: 'Mathématiques',
    gradeLevel: 'Lycée (2nde)',
    edition: 'Hachette Éducation (Collection Barbazo)',
    authorOrCurriculum: 'Éric Barbazo, Julien Jacquet & Ministère de l\'Éducation Nationale',
    coverColor: 'from-blue-600 via-indigo-700 to-cyan-600',
    chaptersCount: 4,
    exercisesCount: 4,
    chapters: [
      {
        id: 'm2-chap-1',
        chapterNumber: 1,
        title: 'Généralités sur les Fonctions & Tableaux de Variations',
        titleEn: 'Functions, Variations, and Quadratic Models',
        summary: 'Notions d\'image, d\'antécédent, de courbe représentative f(x), résolution graphique d\'équations et d\'inéquations f(x) = k, f(x) < g(x), et établissement rigoureux d\'un tableau de variations.',
        keyConcepts: [
          'Définitions formelles : Domaine de définition Df, image et antécédents',
          'Monotonie : Croissance et décroissance sur un intervalle I',
          'Extremums : Maximum et minimum locaux et globaux',
          'Résolution graphique et algébrique d\'inéquations'
        ],
        exercises: [
          {
            id: 'm2-ex-1',
            number: 1,
            title: 'Exercice Type Seconde : Étude de variations et optimisation de surface',
            difficulty: 'standard_bac',
            question: "Soit f(x) = -2x² + 8x + 10 définie sur [0; 5]. 1) Mettre f(x) sous forme canonique. 2) En déduire le maximum de la fonction f et la valeur de x pour laquelle il est atteint.",
            hints: [
              "Pour la forme canonique a(x - alpha)² + beta, calculer alpha = -b/(2a).",
              "Ici a = -2, b = 8, donc alpha = -8 / (-4) = 2."
            ],
            keyFormulas: ['f(x) = a(x - α)² + β avec α = -b/(2a)', 'Maximum β si a < 0'],
            tags: ['Seconde', 'Mathématiques', 'Fonctions', 'Barbazo', 'Variations'],
            solution: [
              {
                stepNumber: 1,
                explanation: "Calcul de alpha = -8 / (2 * (-2)) = 2. Calcul de beta = f(2) = -2(2)² + 8(2) + 10 = -8 + 16 + 10 = 18.",
                result: "Forme canonique : f(x) = -2(x - 2)² + 18."
              },
              {
                stepNumber: 2,
                explanation: "Comme a = -2 < 0, le carré (x - 2)² est toujours >= 0, donc -2(x-2)² <= 0. Par conséquent f(x) <= 18.",
                result: "Le maximum est 18, atteint exactement pour x = 2."
              }
            ]
          }
        ]
      }
    ]
  },

  // =============================================================
  // 3. SES SECONDE (PASSERELLES - BORDAS)
  // =============================================================
  {
    id: 'book-ses-seconde',
    title: 'Passerelles — SES Seconde (Sciences Économiques & Sociales)',
    subtitle: 'Comprendre le Monde Contemporain : Marchés, Socialisation, Entreprises & Institutions',
    subject: 'SES',
    gradeLevel: 'Lycée (2nde)',
    edition: 'Bordas Éducation (Collection Passerelles)',
    authorOrCurriculum: 'Marc Montoussé & Agrégés de Sciences Sociales',
    coverColor: 'from-emerald-600 via-teal-700 to-indigo-800',
    chaptersCount: 3,
    exercisesCount: 3,
    chapters: [
      {
        id: 'ses2-chap-1',
        chapterNumber: 1,
        title: 'Comment un Marché Concurrentiel Fonctionne-t-il ?',
        titleEn: 'How Competitive Markets Work: Demand, Supply and Equilibrium',
        summary: 'Étude des modèles de marché en concurrence pure et parfaite (CPP). Construction des courbes d\'offre et de demande, notion de prix d\'équilibre, surplus du consommateur et du producteur, et impact d\'une taxe forfaitaire.',
        keyConcepts: [
          'Loi de la demande (décroissante selon le prix) et loi de l\'offre (croissante)',
          'Prix et quantité d\'équilibre au point d\'intersection Offre = Demande',
          'Rationnement, pénurie et excédent de production',
          'Gains à l\'échange et notion de surplus économique'
        ],
        exercises: [
          {
            id: 'ses2-ex-1',
            number: 1,
            title: 'Analyse Documentaire SES : Effet d\'une taxe carbone sur le marché des carburants',
            difficulty: 'standard_bac',
            question: "En utilisant la loi de l'offre et de la demande, expliquer comment l'instauration d'une taxe carbone sur le litre d'essence déplace la courbe d'offre et modifie l'équilibre de marché.",
            hints: [
              "La taxe augmente le coût marginal de production/distribution pour les offreurs.",
              "Montrer que la courbe d'offre se déplace vers le haut/gauche, augmentant le prix d'équilibre et réduisant les quantités consommées."
            ],
            tags: ['Seconde', 'SES', 'Marché', 'Équilibre', 'Passerelles'],
            solution: [
              {
                stepNumber: 1,
                explanation: "La taxe carbone représente un coût supplémentaire pour les producteurs à chaque litre vendu. Pour maintenir leur rentabilité, ils exigent un prix plus élevé pour une même quantité.",
                result: "Déplacement de la courbe d'offre vers la gauche."
              },
              {
                stepNumber: 2,
                explanation: "Le nouveau point d'intersection avec la courbe de demande établit un nouveau prix d'équilibre plus élevé et une quantité consommée plus faible.",
                result: "Incitations économiques orientées vers la transition écologique."
              }
            ]
          }
        ]
      }
    ]
  },

  // =============================================================
  // 4. SVT PREMIÈRE SPÉCIALITÉ (BAUDE-JUSSERAND - BORDAS)
  // =============================================================
  {
    id: 'book-svt-premiere',
    title: 'Collection Baude-Jusserand — SVT Première Spécialité',
    subtitle: 'Programme Spécialité : Génétique, Tectonique des Plaques, Système Nerveux & Pathologies',
    subject: 'SVT',
    gradeLevel: 'Lycée (1ère)',
    edition: 'Bordas (Collection Baude-Jusserand)',
    authorOrCurriculum: 'Gérard Baude, Yves Jusserand & Inspecteurs Académiques SVT',
    coverColor: 'from-green-600 via-emerald-700 to-teal-800',
    chaptersCount: 3,
    exercisesCount: 3,
    chapters: [
      {
        id: 'svt1-chap-1',
        chapterNumber: 1,
        title: 'Transmission, Variation et Expression du Patrimoine Génétique',
        titleEn: 'Genetics: Mitosis, DNA Replication and Gene Mutations',
        summary: 'Étude du cycle cellulaire, de la réplication semi-conservative de l\'ADN durant la phase S, des étapes de la mitose, et des mécanismes de réparation ou de conservation des mutations nucléotidiques.',
        keyConcepts: [
          'Réplication semi-conservative de l\'ADN (Expérience de Meselson et Stahl)',
          'Enzyme ADN Polymérase et correction d\'épreuves (Proofreading)',
          'Maintien du caryotype lors de la mitose (Prophase, Métaphase, Anaphase, Télophase)',
          'Mutations somatiques vs mutations germinales transmises à la descendance'
        ],
        exercises: [
          {
            id: 'svt1-ex-1',
            number: 1,
            title: 'Raisonnement Scientifique SVT : Expérience de Meselson et Stahl',
            difficulty: 'standard_bac',
            question: "Expliquer comment l'utilisation de l'azote lourd 15N et de l'azote léger 14N a permis de valider l'hypothèse d'une réplication semi-conservative de l'ADN plutôt que conservative.",
            hints: [
              "Analyser la densité de l'ADN à la génération 0 (100% lourd), génération 1 (100% intermédiaire hybride) et génération 2 (50% hybride, 50% léger).",
              "Montrer que la présence de la bande hybride exclut le modèle conservatif."
            ],
            tags: ['Première', 'SVT', 'Génétique', 'ADN', 'Meselson-Stahl'],
            solution: [
              {
                stepNumber: 1,
                explanation: "À la génération 1 (G1), une seule bande d'ADN de densité intermédiaire est observée. Cela réfute le modèle conservatif qui prédisait deux bandes distinctes (lourde et légère).",
                result: "Exclusion du modèle conservatif."
              },
              {
                stepNumber: 2,
                explanation: "À la génération 2 (G2), deux bandes de même intensité apparaissent : une intermédiaire et une légère. Chaque brin lourd parental sert de matrice pour synthétiser un nouveau brin léger.",
                result: "Démonstration irréfutable de la réplication semi-conservative."
              }
            ]
          }
        ]
      }
    ]
  },

  // =============================================================
  // 5. PHYSIQUE-CHIMIE PREMIÈRE SPÉCIALITÉ (SIRIUS - NATHAN)
  // =============================================================
  {
    id: 'book-sirius-physique-premiere',
    title: 'Sirius — Physique-Chimie Première Spécialité',
    subtitle: 'Constitution de la Matière, Mouvement, Énergie & Ondes Mécaniques',
    subject: 'Physique-Chimie',
    gradeLevel: 'Lycée (1ère)',
    edition: 'Nathan (Collection Sirius)',
    authorOrCurriculum: 'Michel Barde, François Binetruy & Enseignants de Spécialité PC',
    coverColor: 'from-purple-600 via-violet-700 to-blue-800',
    chaptersCount: 3,
    exercisesCount: 3,
    chapters: [
      {
        id: 'pc1-chap-1',
        chapterNumber: 1,
        title: 'Oxydoréduction et Titrages Colorimétriques avec Équivalence',
        titleEn: 'Redox Reactions, Titrations and Equivalence Point',
        summary: 'Notions de couple oxydant/réducteur, demi-équations électroniques, équation bilan d\'oxydoréduction, et détermination expérimentale d\'une concentration inconnue par titrage direct.',
        keyConcepts: [
          'Oxydant (gagne des e-) et Réducteur (perd des e-)',
          'Condition d\'équivalence : Réactifs introduits dans les proportions stœchiométriques',
          'Relation à l\'équivalence : nA / a = nB / b => C_A * V_A / a = C_B * V_eq / b',
          'Repérage du changement de couleur du réactif titrant en excès'
        ],
        exercises: [
          {
            id: 'pc1-ex-1',
            number: 1,
            title: 'Exercice Type Spé PC : Titrage du fer II par le permanganate de potassium',
            difficulty: 'standard_bac',
            question: "On titre un volume V1 = 20,0 mL d'une solution d'ions Fe2+ de concentration C1 inconnue par une solution de permanganate MnO4- de concentration C2 = 0,020 mol/L. L'équivalence est atteinte pour Veq = 12,5 mL. Sachant que MnO4- + 5 Fe2+ + 8 H+ -> Mn2+ + 5 Fe3+ + 4 H2O, calculer C1.",
            hints: [
              "À l'équivalence : n(Fe2+)/5 = n(MnO4-)/1.",
              "Donc C1 * V1 / 5 = C2 * Veq / 1 => C1 = (5 * C2 * Veq) / V1."
            ],
            keyFormulas: ['C1 = (5 * C2 * Veq) / V1', 'n = C * V'],
            tags: ['Première', 'Physique-Chimie', 'Oxydoréduction', 'Titrage', 'Sirius'],
            solution: [
              {
                stepNumber: 1,
                explanation: "Relation de stœchiométrie à l'équivalence : C1 * V1 / 5 = C2 * Veq / 1.",
                result: "C1 = (5 * 0.020 * 12.5) / 20.0"
              },
              {
                stepNumber: 2,
                explanation: "Calcul : C1 = (5 * 0.020 * 12.5) / 20.0 = 1.25 / 20.0 = 0.0625 mol/L.",
                result: "La concentration en ions Fe2+ est égale à 6.25 × 10^-2 mol/L."
              }
            ]
          }
        ]
      }
    ]
  },

  // =============================================================
  // 6. HGGSP PREMIÈRE SPÉCIALITÉ (HATIER / LE QUINTREC)
  // =============================================================
  {
    id: 'book-hggsp-premiere',
    title: 'HGGSP Première Spécialité — Histoire-Géo, Géopolitique & Sc. Politiques',
    subtitle: 'Les 5 Thèmes du Programme : Démocratie, Puissances, Frontières, Information & État',
    subject: 'HGGSP',
    gradeLevel: 'Lycée (1ère)',
    edition: 'Hatier / Collection Le Quintrec',
    authorOrCurriculum: 'Guillaume Le Quintrec & Professeurs Agrégés d\'Histoire-Géographie',
    coverColor: 'from-amber-600 via-orange-700 to-red-800',
    chaptersCount: 3,
    exercisesCount: 3,
    chapters: [
      {
        id: 'hggsp1-chap-1',
        chapterNumber: 1,
        title: 'Comprendre un Régime Politique : La Démocratie de l\'Athènes Antique à Nos Jours',
        titleEn: 'Understanding Political Regimes: Athenian Democracy to Modern Representative Systems',
        summary: 'Étude comparative entre la démocratie directe athénienne (Ecclésia, Isegoria, Ostracisme) et la démocratie représentative moderne (Benjamin Constant, séparation des pouvoirs de Montesquieu, et crises contemporaines).',
        keyConcepts: [
          'Démocratie directe vs Démocratie représentative (Liberté des Anciens vs des Modernes)',
          'Principes fondateurs : Souveraineté populaire, État de droit, pluralisme politique',
          'Mécanismes de contrôle et contre-pouvoirs (Montesquieu)',
          'Crises et résilience des démocraties contemporaines face aux régimes autoritaires'
        ],
        exercises: [
          {
            id: 'hggsp1-ex-1',
            number: 1,
            title: 'Sujet Type Bac HGGSP : Dissertation sur la Démocratie représentative',
            difficulty: 'standard_bac',
            question: "En quoi la démocratie représentative moderne se distingue-t-elle du modèle athénien direct tout en répondant aux exigences des sociétés de masse ?",
            hints: [
              "Rappeler la thèse de Benjamin Constant sur la 'Liberté des Anciens' (participation politique directe) et la 'Liberté des Modernes' (jouissance des droits individuels privés).",
              "Montrer la nécessité de l'élection et de la représentation dans les États à grande échelle démographique."
            ],
            tags: ['Première', 'HGGSP', 'Démocratie', 'Benjamin Constant', 'Bac'],
            solution: [
              {
                stepNumber: 1,
                explanation: "Axe 1 : Athènes reposait sur une citoyenneté directe mais restreinte (excluant femmes, métèques et esclaves) sur un territoire restreint.",
                result: "Participation directe vs exclusion systémique."
              },
              {
                stepNumber: 2,
                explanation: "Axe 2 : Les démocraties modernes reposent sur le suffrage universel et la délégation du pouvoir à des représentants élus, garantissant l'État de droit et les libertés individuelles.",
                result: "Souveraineté nationale et mandat représentatif."
              }
            ]
          }
        ]
      }
    ]
  },

  // =============================================================
  // 7. NSI PREMIÈRE SPÉCIALITÉ (ELLIPSES / HATIER NSI)
  // =============================================================
  {
    id: 'book-nsi-premiere',
    title: 'NSI Première Spécialité — Numérique et Sciences Informatiques',
    subtitle: 'Algorithmes, Python, Types de Données, Architecture Von Neumann & Réseaux IP',
    subject: 'NSI',
    gradeLevel: 'Lycée (1ère)',
    edition: 'Ellipses / Hatier NSI',
    authorOrCurriculum: 'Thierry Balabonski, Sylvain Conchon, Jean-Christophe Filliâtre & Kim Nguyen',
    coverColor: 'from-cyan-600 via-blue-700 to-slate-900',
    chaptersCount: 3,
    exercisesCount: 3,
    chapters: [
      {
        id: 'nsi1-chap-1',
        chapterNumber: 1,
        title: 'Représentation des Données : Encodage Binaire, Entiers et Texte UTF-8',
        titleEn: 'Data Representation: Binary Encoding, Integers and UTF-8 Character Standards',
        summary: 'Conversion de bases (Binaire, Octal, Hexadécimal), complément à deux pour les entiers signés, norme IEEE 754 pour les flottants et codage des caractères texte (ASCII vs Unicode UTF-8).',
        keyConcepts: [
          'Base 2 (0, 1), Base 16 (0-9, A-F) et conversions directes par paquets de 4 bits',
          'Complément à deux : Inversion des bits + 1 pour représenter les entiers négatifs',
          'Encodage UTF-8 à longueur variable (1 à 4 octets) pour compatibilité ASCII',
          'Opérateurs bit à bit : AND, OR, XOR, NOT, Décalages à gauche/droite'
        ],
        exercises: [
          {
            id: 'nsi1-ex-1',
            number: 1,
            title: 'Exercice Type NSI : Conversion Hexadécimale et Complément à 2',
            difficulty: 'standard_bac',
            question: "1) Convertir la valeur hexadécimale 0x2F en binaire sur 8 bits. 2) Donner le complément à deux sur 8 bits du nombre decimal -12.",
            hints: [
              "0x2 = 0010 en binaire, 0xF = 1111 en binaire.",
              "Pour -12 : +12 = 0000 1100. Inverser les bits : 1111 0011. Ajouter 1 : 1111 0100."
            ],
            keyFormulas: ['0x2F = 0010 1111_2 = 47_10', 'Complément à 2 = NOT(x) + 1'],
            tags: ['Première', 'NSI', 'Binaire', 'Hexadécimal', 'Python'],
            solution: [
              {
                stepNumber: 1,
                explanation: "0x2 en binaire sur 4 bits est 0010. 0xF en binaire est 1111.",
                result: "0x2F = 0010 1111 en binaire (soit 32 + 8 + 4 + 2 + 1 = 47 en décimal)."
              },
              {
                stepNumber: 2,
                explanation: "12 en binaire sur 8 bits : 0000 1100. Inversion bit à bit (NOT) : 1111 0011. Addition de 1 : 1111 0100.",
                result: "-12 est représenté par 1111 0100 en complément à 2 sur 8 bits."
              }
            ]
          }
        ]
      }
    ]
  },

  // =============================================================
  // 8. ENSEIGNEMENT SCIENTIFIQUE PREMIÈRE (HATIER)
  // =============================================================
  {
    id: 'book-enseignement-scientifique-premiere',
    title: 'Enseignement Scientifique Première (Tronc Commun)',
    subtitle: 'Le Soleil Source d\'Énergie, La Musique et le Son, La Terre et l\'Histoire de sa Mesure',
    subject: 'Enseignement Scientifique',
    gradeLevel: 'Lycée (1ère)',
    edition: 'Hatier Éducation',
    authorOrCurriculum: 'Collectif sous la direction d\'Inspecteurs Généraux de l\'Éducation Nationale',
    coverColor: 'from-yellow-600 via-amber-700 to-emerald-800',
    chaptersCount: 3,
    exercisesCount: 3,
    chapters: [
      {
        id: 'es1-chap-1',
        chapterNumber: 1,
        title: 'Le Rayonnement Solaire et le Bilan Thermique de la Terre',
        titleEn: 'Solar Radiation, Fusion and Earth Energy Balance',
        summary: 'Étude des réactions de fusion nucléaire au cœur du Soleil (E = mc²), loi de Wien pour le corps noir, albédo terrestre, effet de serre et bilan d\'énergie radiatif en équilibre.',
        keyConcepts: [
          'Équivalence masse-énergie d\'Einstein : ΔE = Δm * c²',
          'Loi de Wien : λ_max * T = 2,898 × 10^-3 m·K',
          'Albédo moyen de la Terre (~0.3 ou 30%) et puissance solaire absorbée',
          'Effet de serre atmosphérique et réémission du rayonnement infrarouge'
        ],
        exercises: [
          {
            id: 'es1-ex-1',
            number: 1,
            title: 'Exercice Type Bac ES : Pertes de masse du Soleil et Loi de Wien',
            difficulty: 'standard_bac',
            question: "La température de surface du Soleil est T = 5778 K. 1) Calculer la longueur d'onde d'émission maximale λ_max du Soleil. 2) Sachant que la puissance rayonnée par le Soleil est P = 3,8 × 10^26 W, calculer la masse perdue par le Soleil chaque seconde.",
            hints: [
              "Appliquer la loi de Wien : λ_max = (2.898 × 10^-3) / 5778.",
              "En 1 seconde, l'énergie rayonnée est ΔE = P * 1s. Utiliser Δm = ΔE / c² avec c = 3.0 × 10^8 m/s."
            ],
            keyFormulas: ['λ_max = 2.898 × 10^-3 / T', 'Δm = ΔE / c²'],
            tags: ['Première', 'Enseignement Scientifique', 'Soleil', 'Wien', 'Einstein'],
            solution: [
              {
                stepNumber: 1,
                explanation: "Loi de Wien : λ_max = 2.898 × 10^-3 / 5778 ≈ 5.01 × 10^-7 m = 501 nm.",
                result: "Longueur d'onde maximale située dans le domaine du visible (vert-jaune)."
              },
              {
                stepNumber: 2,
                explanation: "ΔE en 1s = 3.8 × 10^26 J. Δm = ΔE / (3.0 × 10^8)² = (3.8 × 10^26) / (9.0 × 10^16) = 4.22 × 10^9 kg/s.",
                result: "Le Soleil perd environ 4.2 millions de tonnes de matière par seconde."
              }
            ]
          }
        ]
      }
    ]
  },

  // =============================================================
  // 9. HLP PREMIÈRE SPÉCIALITÉ (NATHAN / HATIER)
  // =============================================================
  {
    id: 'book-hlp-premiere',
    title: 'HLP Première Spécialité — Humanités, Littérature et Philosophie',
    subtitle: 'Les Pouvoirs de la Parole & Les Métamorphoses du Moi : Rhétorique & Philosophie',
    subject: 'HLP',
    gradeLevel: 'Lycée (1ère)',
    edition: 'Nathan / Hatier (Collection HLP)',
    authorOrCurriculum: 'Agrégés de Lettres Modernes & de Philosophie',
    coverColor: 'from-fuchsia-600 via-purple-700 to-indigo-900',
    chaptersCount: 3,
    exercisesCount: 3,
    chapters: [
      {
        id: 'hlp1-chap-1',
        chapterNumber: 1,
        title: 'Les Pouvoirs de la Parole : Art de Persuader, Éloquence et Démagogie',
        titleEn: 'The Power of Speech: Rhetoric, Persuasion and Political Discourse',
        summary: 'Étude des trois piliers rhétoriques d\'Aristote (Ethos, Pathos, Logos), du statut de la vérité dans le discours politique, de la sophistique athénienne et des dérives de la manipulation verbale.',
        keyConcepts: [
          'Ethos (Credibilité de l\'orateur), Pathos (Émotion de l\'auditoire), Logos (Logique du discours)',
          'Opposition entre Sophistes (Protagoras, Gorgias) et Platon (Recherche de la Vérité absolue)',
          'L\'art de la persuasion vs l\'art de la conviction rationnelle',
          'Éloquence contemporaine, plaidoirie judiciaire et débat démocratique'
        ],
        exercises: [
          {
            id: 'hlp1-ex-1',
            number: 1,
            title: 'Essai Philosophique HLP : Platon et la critique de la Sophistique',
            difficulty: 'standard_bac',
            question: "Dans le Gorgias, Platon compare la rhétorique à la flatterie et à la cuisine. En quoi cette critique met-elle en garde contre la confusion entre persuader et convaincre ?",
            hints: [
              "Montrer que la cuisine flatte le palais sans donner de santé, tout comme la sophistique flatte l'opinion sans apporter la vérité.",
              "Distinguer la conviction rationnelle fondée sur la démonstration et la persuasion s'appuyant sur l'illusion des émotions."
            ],
            tags: ['Première', 'HLP', 'Platon', 'Rhétorique', 'Philosophie'],
            solution: [
              {
                stepNumber: 1,
                explanation: "Pour Platon, le sophiste recherche le succès électoral ou judiciaire immédiat par la séduction verbale (Pathos), sans se soucier du juste et de l'injuste.",
                result: "Mise à jour des dangers de la démagogie."
              },
              {
                stepNumber: 2,
                explanation: "Le philosophe recherche la vérité par la dialectique et le Logos. La parole philosophique vise à rendre l'âme meilleure et éclairée par la raison.",
                result: "Inspiration du modèle d'éloquence éthique et démocratique."
              }
            ]
          }
        ]
      }
    ]
  },

  // =============================================================
  // 10. MATHÉMATIQUES EXPERTES TERMINALE (INDICE - BORDAS)
  // =============================================================
  {
    id: 'book-maths-expertes-terminale',
    title: 'Indice — Mathématiques Expertes Terminale (Option Bac)',
    subtitle: 'Nombres Complexes, Arithmétique Modulaire, Matrices & Graphes de Markov',
    subject: 'Mathématiques',
    gradeLevel: 'Lycée (Terminale Spé)',
    edition: 'Bordas (Collection Indice)',
    authorOrCurriculum: 'Mathieu Pradel, Laurent Darracq & Enseignants de Chaire Supérieure',
    coverColor: 'from-indigo-600 via-purple-800 to-slate-900',
    chaptersCount: 3,
    exercisesCount: 3,
    chapters: [
      {
        id: 'me-chap-1',
        chapterNumber: 1,
        title: 'Nombres Complexes : Forme Trigonométrique, Formule de Moivre & Géométrie',
        titleEn: 'Complex Numbers: Trigonometric Form, Euler Formula and Plane Transformations',
        summary: 'Forme algébrique z = a + ib, forme trigonométrique z = r(cos θ + i sin θ), forme exponentielle r e^(iθ), formule de De Moivre (cos θ + i sin θ)^n = cos(nθ) + i sin(nθ) et applications aux rotations du plan.',
        keyConcepts: [
          'Module |z| = √(a² + b²) et Argument arg(z) = θ [2π]',
          'Formules d\'Euler : cos θ = (e^iθ + e^-iθ)/2 et sin θ = (e^iθ - e^-iθ)/(2i)',
          'Formule de De Moivre : (e^iθ)^n = e^(inθ)',
          'Résolution des équations du second degré à coefficients réels et complexes'
        ],
        exercises: [
          {
            id: 'me-ex-1',
            number: 1,
            title: 'Exercice Type Maths Expertes : Utilisation de la formule de De Moivre',
            difficulty: 'approfondissement',
            question: "Soit z = 1 + i. 1) Écrire z sous forme exponentielle r e^(iθ). 2) En déduire la forme algébrique exacte de z^12.",
            hints: [
              "Calculer le module |z| = √(1² + 1²) = √2.",
              "Factoriser √2 : z = √2 (1/√2 + i 1/√2) = √2 e^(i π/4).",
              "Appliquer les règles de puissance : z^12 = (√2)^12 * e^(i 12π/4) = 2^6 * e^(i 3π)."
            ],
            keyFormulas: ['(r e^iθ)^n = r^n e^(inθ)', 'e^(i 3π) = -1'],
            tags: ['Terminale', 'Maths Expertes', 'Complexes', 'De Moivre', 'Indice'],
            solution: [
              {
                stepNumber: 1,
                explanation: "Module : r = √(1 + 1) = √2. Argument : cos θ = 1/√2, sin θ = 1/√2 => θ = π/4 [2π]. Donc z = √2 e^(i π/4).",
                result: "Forme exponentielle : z = √2 e^(i π/4)."
              },
              {
                stepNumber: 2,
                explanation: "z^12 = (√2)^12 * e^(i * 12π/4) = 2^6 * e^(i 3π) = 64 * (-1) = -64.",
                result: "z^12 est un nombre réel pur égal à -64."
              }
            ]
          }
        ]
      }
    ]
  }
];

