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
  difficulty: 'easy' | 'medium' | 'hard' | 'olympiad';
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
  coverColor: string; // Tailwind color class or hex
  chaptersCount: number;
  exercisesCount: number;
  chapters: TextbookChapter[];
}

export const SCHOOL_TEXTBOOKS_LIBRARY: SchoolTextbook[] = [
  {
    id: 'book-math-term-spe',
    title: 'Manuel de Mathématiques Spécialité Terminale',
    subtitle: 'Analyse, Suites, Géométrie dans l\'Espace & Probabilités',
    subject: 'Mathematics',
    gradeLevel: 'Lycée (Terminale Spé)',
    edition: 'Édition Conforme Programme Officiel',
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
          },
          {
            id: 'math-ex-2',
            number: 2,
            title: 'Limite et convergence de suite géométrique auxiliaire',
            difficulty: 'hard',
            question: 'En posant v_n = u_n - 6 avec la suite précédente, déterminer l\'expression explicite de u_n en fonction de n, puis calculer la limite de (u_n) en +infini.',
            hints: [
              'Exprimer v_{n+1} en fonction de v_n.',
              'Montrer que (v_n) est une suite géométrique de raison q = 0.5.',
              'Utiliser lim (0.5)^n = 0 quand n tend vers +infini.'
            ],
            keyFormulas: ['v_{n+1} = u_{n+1} - 6 = 0.5*(u_n - 6) = 0.5*v_n', 'v_n = v_0 * q^n'],
            tags: ['Suites', 'Limites', 'Terminale'],
            solution: [
              {
                stepNumber: 1,
                explanation: 'Calcul de v_{n+1} : v_{n+1} = u_{n+1} - 6 = (0.5 * u_n + 3) - 6 = 0.5 * u_n - 3 = 0.5 * (u_n - 6) = 0.5 * v_n.',
                result: '(v_n) est une suite géométrique de raison q = 0.5 et de premier terme v_0 = 2 - 6 = -4.'
              },
              {
                stepNumber: 2,
                explanation: 'Expression explicite : v_n = -4 * (0.5)^n. Comme u_n = v_n + 6, on a u_n = 6 - 4 * (0.5)^n.',
                formulaOrCalculation: 'u_n = 6 - 4 * (0.5)^n',
                result: 'Formule explicite obtenue.'
              },
              {
                stepNumber: 3,
                explanation: 'Limite : Comme -1 < 0.5 < 1, on a lim_{n->+inf} (0.5)^n = 0. Par conséquent, lim_{n->+inf} u_n = 6 - 0 = 6.',
                formulaOrCalculation: 'lim_{n->+inf} u_n = 6',
                result: 'La suite converge vers 6.'
              }
            ]
          }
        ]
      },
      {
        id: 'math-chap-2',
        chapterNumber: 2,
        title: 'Fonctions Exponentielle et Logarithme Népérien',
        titleEn: 'Exponential and Natural Logarithm Functions',
        summary: 'Dérivation, équations différentielles y\' = ay, limites remarquables et croissances comparées.',
        keyConcepts: ['exp(x) > 0', 'ln(ab) = ln(a) + ln(b)', 'Croissances comparées lim x->+inf exp(x)/x = +inf'],
        exercises: [
          {
            id: 'math-ex-3',
            number: 3,
            title: 'Étude complète de fonction avec exponentielle',
            difficulty: 'medium',
            question: 'Soit f(x) = (2x - 1) * exp(-x) définie sur R. Calculer la dérivée f\'(x), dresser le tableau de variations de f, et déterminer l\'équation de la tangente au point d\'abscisse x = 0.',
            hints: [
              'Appliquer la formule de dérivation du produit (u*v)\' = u\'v + uv\'.',
              'La dérivée de exp(-x) est -exp(-x).'
            ],
            keyFormulas: ['f\'(x) = 2*exp(-x) - (2x - 1)*exp(-x) = (3 - 2x)*exp(-x)', 'T_0 : y = f\'(0)*(x - 0) + f(0)'],
            tags: ['Exponentielle', 'Dérivée', 'Variations'],
            solution: [
              {
                stepNumber: 1,
                explanation: 'Dérivation : f(x) = u(x)*v(x) avec u(x) = 2x - 1 (u\'(x)=2) et v(x) = exp(-x) (v\'(x)=-exp(-x)). f\'(x) = 2*exp(-x) + (2x - 1)*(-exp(-x)) = (3 - 2x)*exp(-x).',
                formulaOrCalculation: 'f\'(x) = (3 - 2x) * e^{-x}',
                result: 'Comme e^{-x} > 0, le signe de f\'(x) est celui de 3 - 2x.'
              },
              {
                stepNumber: 2,
                explanation: 'Variations : f\'(x) > 0 sur ]-inf; 1.5[ et f\'(x) < 0 sur ]1.5; +inf[. La fonction admet un maximum en x = 1.5 valant f(1.5) = 2 * exp(-1.5).',
                result: 'f est strictement croissante puis strictement décroissante.'
              },
              {
                stepNumber: 3,
                explanation: 'Tangente en 0 : f(0) = -1 et f\'(0) = 3. L\'équation de la tangente est y = 3x - 1.',
                formulaOrCalculation: 'y = 3x - 1',
                result: 'Équation de tangente obtenue.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'book-phys-term-spe',
    title: 'Manuel de Physique-Chimie Terminale Spécialité',
    subtitle: 'Mécanique de Newton, Ondes, Cinétique & Acido-Basicité',
    subject: 'Physics',
    gradeLevel: 'Lycée (Terminale Spé)',
    edition: 'Édition Prépas & Épreuves Nationales',
    authorOrCurriculum: 'Programme Officiel de Physique-Chimie',
    coverColor: 'from-amber-600 to-rose-700',
    chaptersCount: 2,
    exercisesCount: 4,
    chapters: [
      {
        id: 'phys-chap-1',
        chapterNumber: 1,
        title: 'Mouvement dans un champ de pesanteur uniforme',
        titleEn: 'Projectile Motion in a Uniform Gravitational Field',
        summary: 'Deuxième loi de Newton, équations horaires du mouvement, équation de la trajectoire parabolique et portée.',
        keyConcepts: ['Somme des forces = m * a', 'a_x = 0, a_y = -g', 'Trajectoire parabolique'],
        exercises: [
          {
            id: 'phys-ex-1',
            number: 1,
            title: 'Équations horaires d\'un lancer de projectile',
            difficulty: 'medium',
            question: 'Un projectile est lancé depuis l\'origine (x_0=0, y_0=0) avec une vitesse initiale v_0 faisant un angle alpha avec l\'horizontale dans le champ de pesanteur g. Établir les équations horaires x(t) et y(t), puis l\'équation de la trajectoire y(x).',
            hints: [
              'Projeter le vecteur vitesse initiale sur les axes Ox et Oy : v_{0x} = v_0*cos(alpha), v_{0y} = v_0*sin(alpha).',
              'Intégrer le vecteur accélération a = (0, -g).'
            ],
            keyFormulas: ['x(t) = (v_0 * cos(alpha)) * t', 'y(t) = -0.5 * g * t^2 + (v_0 * sin(alpha)) * t'],
            tags: ['Mécanique', 'Newton', 'Trajectoire'],
            solution: [
              {
                stepNumber: 1,
                explanation: 'Accélération : La seule force étant le poids P = m*g, la 2nde loi de Newton donne m*a = m*g => a = g. En coordonnées : a_x(t) = 0 et a_y(t) = -g.',
                result: 'a_x = 0, a_y = -g'
              },
              {
                stepNumber: 2,
                explanation: 'Vitesse et position par intégration : v_x(t) = v_0*cos(alpha) et v_y(t) = -g*t + v_0*sin(alpha). En intégrant à nouveau avec x(0)=0 et y(0)=0 : x(t) = (v_0*cos(alpha))*t et y(t) = -0.5*g*t^2 + (v_0*sin(alpha))*t.',
                result: 'Équations horaires établies.'
              },
              {
                stepNumber: 3,
                explanation: 'Équation de trajectoire : On extrait t = x / (v_0*cos(alpha)) et on substitue dans y(t) : y(x) = -g / (2 * v_0^2 * cos^2(alpha)) * x^2 + tan(alpha) * x.',
                formulaOrCalculation: 'y(x) = - (g / (2*v_0^2*cos^2(alpha))) * x^2 + tan(alpha) * x',
                result: 'Trajectoire parabolique confirmée.'
              }
            ]
          }
        ]
      },
      {
        id: 'phys-chap-2',
        chapterNumber: 2,
        title: 'Cinétique Chimique et Suivi Temporel',
        titleEn: 'Chemical Kinetics and Rate of Reaction',
        summary: 'Vitesse volumique de disparition et d\'apparition, loi d\'ordre 1, temps de demi-réaction t_{1/2}.',
        keyConcepts: ['v = -d[R]/dt = d[P]/dt', '[A](t) = [A]_0 * exp(-k*t)', 't_{1/2} = ln(2) / k'],
        exercises: [
          {
            id: 'chem-ex-1',
            number: 2,
            title: 'Vérification d\'une loi de cinétique d\'ordre 1',
            difficulty: 'easy',
            question: 'Soit la réaction de décomposition d\'un réactif A dont la concentration suit une loi d\'ordre 1 avec k = 0.035 min^{-1} et [A]_0 = 0.20 mol/L. Calculer la concentration [A] à t = 20 min et le temps de demi-réaction t_{1/2}.',
            hints: [
              'Utiliser [A](t) = [A]_0 * exp(-k*t).',
              't_{1/2} = ln(2) / k.'
            ],
            keyFormulas: ['[A](t) = [A]_0 * e^{-k*t}', 't_{1/2} = ln(2) / k'],
            tags: ['Chimie', 'Cinétique', 'Ordre 1'],
            solution: [
              {
                stepNumber: 1,
                explanation: 'Calcul de concentration : [A](20) = 0.20 * exp(-0.035 * 20) = 0.20 * exp(-0.70) = 0.20 * 0.4966 = 0.0993 mol/L.',
                formulaOrCalculation: '[A](20) = 0.099 mol/L (ou ~0.10 mol/L)',
                result: '[A] a diminué de moitié environ.'
              },
              {
                stepNumber: 2,
                explanation: 'Temps de demi-réaction : t_{1/2} = ln(2) / 0.035 = 0.69315 / 0.035 = 19.8 min.',
                formulaOrCalculation: 't_{1/2} = 19.8 minutes',
                result: 'Résultat cohérent avec la valeur calculée à 20 min.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'book-svt-term',
    title: 'Manuel de SVT Terminale Spécialité',
    subtitle: 'Génétique, Évolution, Climatologie & Système Immunitaire',
    subject: 'Biology',
    gradeLevel: 'Lycée (Terminale Spé)',
    edition: 'Édition SVT Références & Grand Oral',
    authorOrCurriculum: 'Programme SVT Sciences de la Vie et de la Terre',
    coverColor: 'from-emerald-600 to-teal-800',
    chaptersCount: 2,
    exercisesCount: 3,
    chapters: [
      {
        id: 'svt-chap-1',
        chapterNumber: 1,
        title: 'Brassages génétiques et diversification des génomes',
        titleEn: 'Genetic Recombination and Meiosis',
        summary: 'Méiose, crossing-over (brassage intra-chromosomique), brassage inter-chromosomique et anomalies caryotypiques.',
        keyConcepts: ['Prophase I & Crossing-over', 'Anaphase I & Ségrégation indépendante', 'Test-cross 1:1:1:1 vs recombinés'],
        exercises: [
          {
            id: 'svt-ex-1',
            number: 1,
            title: 'Interprétation d\'un croisement test (Test-cross)',
            difficulty: 'medium',
            question: 'Chez la drosophile, on croise une femelle hétérozygote pour deux gènes liés avec un mâle double récessif. On obtient : 42% de phénotype parental A, 42% de phénotype parental B, 8% de phénotype recombiné C, 8% de phénotype recombiné D. Interpréter ces pourcentages et évaluer la distance génétique en cM (centiMorgan).',
            hints: [
              'Les phénotypes recombinés proviennent du brassage intra-chromosomique (crossing-over).',
              'La fréquence de recombinaison est le pourcentage total d\'individus recombinés.'
            ],
            keyFormulas: ['Distance (cM) = (Nombre recombinés / Nombre total) * 100'],
            tags: ['Génétique', 'Méiose', 'Crossing-over'],
            solution: [
              {
                stepNumber: 1,
                explanation: 'Analyse des proportions : Les phénotypes parentaux sont très majoritaires (84%) et les recombinés minoritaires (16%). Cela prouve que les deux gènes sont physiquement liés sur le même chromosome (liaison génétique).',
                result: 'Gènes liés.'
              },
              {
                stepNumber: 2,
                explanation: 'Calcul du taux de recombinaison : Fréquence recombinés = 8% + 8% = 16%.',
                formulaOrCalculation: '16% de recombinaison => Distance = 16 cM',
                result: 'Distance génétique de 16 centiMorgans entre les deux loci.'
              }
            ]
          }
        ]
      }
    ]
  }
];
