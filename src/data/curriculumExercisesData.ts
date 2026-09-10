export interface CurriculumGeneratedExercise {
  id: string;
  gradeLevel: 'seconde' | 'premiere' | 'terminale';
  gradeLevelLabel: string;
  subject: string;
  chapterTitle: string;
  textbookCollection: string;
  publisher: string;
  difficulty: 'accessible' | 'standard_bac' | 'approfondissement';
  question: string;
  contextOrDoc?: string;
  keyFormulas?: string[];
  hints: string[];
  correctionSteps: {
    stepTitle: string;
    explanation: string;
    formula?: string;
    conclusion: string;
  }[];
  tags: string[];
}

export const CURRICULUM_EXERCISES_DATABASE: CurriculumGeneratedExercise[] = [
  // =============================================================
  // CLASSE DE SECONDE - FRANÇAIS
  // =============================================================
  {
    id: 'sec-fr-1',
    gradeLevel: 'seconde',
    gradeLevelLabel: 'Classe de Seconde',
    subject: 'Français',
    chapterTitle: 'La poésie du Moyen Âge au XVIIIe siècle : Analyse linéaire et figures de style',
    textbookCollection: "L'Écume des lettres (Hachette) & Empreintes Littéraires (Magnard)",
    publisher: 'Hachette / Magnard',
    difficulty: 'standard_bac',
    question: "Analyser le sonnet 'Mignonne, allons voir si la rose...' de Pierre de Ronsard (Odes, 1550). 1) Identifier le topos poétique du Carpe Diem et la métaphore filée végétale. 2) Relever les figures de style majeures (allégorie, métaphore, impératif injonctif). 3) Proposer un plan d'explication linéaire en 3 mouvements.",
    contextOrDoc: "Objet d'étude officiel Seconde : 'La poésie du Moyen Âge au XVIIIe siècle'. Poème addressé à Cassandre Salviati.",
    hints: [
      "Le topos du Carpe Diem ('cueille le jour') invite à profiter de la jeunesse avant l'inévitable flétrissement.",
      "Observer le parallélisme entre la robe pourprée de la fleur et la jeunesse de la jeune fille.",
      "Le dernier tercet bascule vers l'injonction morale avec les verbes à l'impératif ('Cueillez, cueillez...')."
    ],
    correctionSteps: [
      {
        stepTitle: "1. Identification du topos et de la métaphore filée",
        explanation: "Ronsard réactive le motif épicurien et horatien du Carpe Diem. La rose n'est pas un simple ornement bucolique : elle incarne l'allégorie de la jeunesse éphémère et de la fragilité de la beauté féminine face à la fuite inexorable du temps (Chronos).",
        conclusion: "Métaphore filée associant l'éclosion matinale de la rose à l'épanouissement juvénile, et son déclin vespéral à la vieillesse."
      },
      {
        stepTitle: "2. Relevé des procédés stylistiques clés",
        explanation: "• Personnification de la fleur : 'sa robe de pourpre au soleil'. • Allitération en [r] et [m] soulignant la douceur mélancolique. • Champ lexical du temps et de la décrépitude : 'veprée', 'dessus l'herbe', 'flétrie'. • Injonction au tercet final : 'Cueillez, cueillez vostre jeunesse'.",
        conclusion: "L'art poétique ronsardien associe élégie lyrique et argumentation séductrice."
      },
      {
        stepTitle: "3. Mouvements de l'explication linéaire",
        explanation: "1er mouvement (strophes 1-2) : La contemplation matinale de la beauté éclatante de la rose. 2e mouvement (strophe 3) : La déception vespérale et le constat tragique de la caducité naturelle. 3e mouvement (strophe 4) : La leçon épicurienne et l'exhortation amoureuse (Carpe Diem).",
        conclusion: "Plan linéaire rigoureux répondant aux exigences des épreuves orales et écrites du lycée."
      }
    ],
    tags: ['Seconde', 'Français', 'Poésie', 'Ronsard', 'Pléiade', 'Carpe Diem']
  },
  {
    id: 'sec-fr-2',
    gradeLevel: 'seconde',
    gradeLevelLabel: 'Classe de Seconde',
    subject: 'Français',
    chapterTitle: 'Le théâtre du XVIIe au XXIe siècle : Le comique et la satire sociale chez Molière',
    textbookCollection: "Passeurs de textes (Le Robert) & L'Écume des lettres (Hachette)",
    publisher: 'Le Robert / Hachette',
    difficulty: 'standard_bac',
    question: "Dans 'L'Avare' (Acte I, scène 3) ou 'Le Malade imaginaire' de Molière, analyser comment le dramaturge articule le comique de caractère, le comique de gestes et la dénonciation des travers humains ('castigat ridendo mores').",
    contextOrDoc: "Objet d'étude officiel Seconde : 'Le théâtre du XVIIe au XXIe siècle'.",
    hints: [
      "Rappeler la devise de la comédie classique : 'corriger les mœurs par le rire'.",
      "Distinguer les 4 formes traditionnelles de comique : mots, gestes, situation, caractère.",
      "Montrer que l'avarice chez Harpagon ou l'hypocondrie chez Argan est une obsession aliénante qui détruit les liens familiaux."
    ],
    correctionSteps: [
      {
        stepTitle: "1. Typologie des ressorts comiques moliéresques",
        explanation: "Molière imbrique : • Comique de geste (bastonnades, fouille des poches de La Flèche). • Comique de mots (répétitions obsessionnelles, quiproquos, jargon médical parodique). • Comique de caractère (monomanie tyrannique qui aveugle le personnage).",
        conclusion: "Le rire naît de la mécanisation du comportement humain (théorie de Bergson)."
      },
      {
        stepTitle: "2. Portée morale et subversive de la satire",
        explanation: "Sous le masque du divertissement de cour, Molière fustige l'arbitraire patriarcal, la tyrannie financière et le dogmatisme aveugle des médecins du Grand Siècle. L'obsession dénature l'humanité même du père de famille.",
        conclusion: "La comédie classique élève le rire au rang d'outil critique philosophique."
      }
    ],
    tags: ['Seconde', 'Français', 'Théâtre', 'Molière', 'Comédie', 'Classicisme']
  },
  {
    id: 'sec-fr-3',
    gradeLevel: 'seconde',
    gradeLevelLabel: 'Classe de Seconde',
    subject: 'Français',
    chapterTitle: 'Le roman et le récit : Incipit, réalisme et portrait chez Balzac ou Maupassant',
    textbookCollection: 'Empreintes Littéraires (Magnard) & Bordas',
    publisher: 'Magnard / Bordas',
    difficulty: 'accessible',
    question: "Analyser les fonctions d'un incipit romanesque réaliste (ex: la pension Vauquer dans 'Le Père Goriot' de Balzac ou le début d''Une Vie' de Maupassant). Quelles sont ses 3 fonctions fondamentales (informative, dramatique, esthétique) ?",
    contextOrDoc: "Objet d'étude officiel Seconde : 'Le roman et le récit du XVIIIe au XXIe siècle'.",
    hints: [
      "L'incipit pose le cadre spatio-temporel, les personnages et le pacte de lecture.",
      "Chez Balzac, le décor extérieur reflète métonymiquement l'intériorité morale des habitants.",
      "Analyser l'effet de réel (Roland Barthes) à travers la précision documentaire."
    ],
    correctionSteps: [
      {
        stepTitle: "1. Les trois fonctions canoniques de l'incipit",
        explanation: "1) Fonction informative : définir le chronotope (Paris sous la Restauration, 1819), le milieu social et les protagonistes. 2) Fonction dramatique : nouer l'intrigue et susciter l'horizon d'attente du lecteur. 3) Fonction esthétique : instaurer le registre réaliste et la vision du monde de l'auteur.",
        conclusion: "L'incipit programme l'ensemble de la trajectoire narrative."
      },
      {
        stepTitle: "2. Le principe balzacien de la causalité du milieu",
        explanation: "Balzac applique les sciences naturelles à la société : la sordide pension Vauquer imprègne ses pensionnaires tout comme leur misère imprègne les murs ('l'odeur de pension'). Le décor devient un personnage à part entière.",
        conclusion: "Réalisme sociologique et visionnaire de La Comédie Humaine."
      }
    ],
    tags: ['Seconde', 'Français', 'Roman', 'Balzac', 'Réalisme', 'Incipit']
  },

  // =============================================================
  // CLASSE DE SECONDE - MATHÉMATIQUES & SCIENCES
  // =============================================================
  {
    id: 'sec-math-1',
    gradeLevel: 'seconde',
    gradeLevelLabel: 'Classe de Seconde',
    subject: 'Mathématiques',
    chapterTitle: 'Fonctions de référence & Variations',
    textbookCollection: 'Indice (Bordas) & Hyperbole (Nathan)',
    publisher: 'Bordas / Nathan',
    difficulty: 'standard_bac',
    question: "Soit f la fonction définie sur R par f(x) = -2(x - 3)^2 + 8. Déterminer la forme développée de f, son sommet S, et dresser son tableau de variations complet sur R.",
    contextOrDoc: "Extrait conforme au programme officiel de Seconde - Chapitre 'Fonctions polynômes du second degré et extremum'.",
    keyFormulas: [
      "Forme canonique : f(x) = a(x - α)^2 + β",
      "Sommet S(α ; β) = S(3 ; 8)",
      "Signe de a = -2 < 0 → Parabole orientée vers le bas (maximum en α)"
    ],
    hints: [
      "Développer d'abord le carré (x - 3)^2 = x^2 - 6x + 9 avant de distribuer le facteur -2.",
      "Identifier α et β dans l'expression canonique f(x) = a(x - α)^2 + β.",
      "Comme a = -2 est négatif, la fonction est strictement croissante puis strictement décroissante."
    ],
    correctionSteps: [
      {
        stepTitle: "1. Développement algébrique",
        explanation: "On développe l'identité remarquable puis on distribue -2 : f(x) = -2(x^2 - 6x + 9) + 8 = -2x^2 + 12x - 18 + 8.",
        formula: "f(x) = -2x^2 + 12x - 10",
        conclusion: "La forme développée est f(x) = -2x^2 + 12x - 10."
      },
      {
        stepTitle: "2. Coordonnées du sommet",
        explanation: "D'après la forme canonique f(x) = a(x - α)^2 + β, avec α = 3 et β = 8, le sommet a pour coordonnées S(3 ; 8).",
        formula: "S(3 ; 8)",
        conclusion: "Le maximum de la fonction f sur R est 8, atteint pour x = 3."
      },
      {
        stepTitle: "3. Tableau de variations",
        explanation: "Puisque le coefficient dominant a = -2 est strictement négatif, la parabole est tournée vers le bas.",
        conclusion: "f est strictement croissante sur ]-∞ ; 3] et strictement décroissante sur [3 ; +∞[."
      }
    ],
    tags: ['Seconde', 'Mathématiques', 'Indice', 'Hyperbole', 'Polynômes']
  },
  {
    id: 'sec-pc-1',
    gradeLevel: 'seconde',
    gradeLevelLabel: 'Classe de Seconde',
    subject: 'Physique-Chimie',
    chapterTitle: 'Quantité de matière & Concentration molaire',
    textbookCollection: 'Sirius (Nathan) & Microméga (Hatier)',
    publisher: 'Nathan / Hatier',
    difficulty: 'standard_bac',
    question: "On dissout une masse m = 5,85 g de chlorure de sodium (NaCl) solide dans de l'eau distillée afin d'obtenir un volume V = 250 mL de solution aqueuse. Données : M(Na) = 23,0 g/mol, M(Cl) = 35,5 g/mol. Calculer la quantité de matière n de NaCl dissoute, puis la concentration molaire C de la solution obtenue.",
    contextOrDoc: "Manuel Sirius Nathan, Chapitre 'Solutions aqueuses et dosage par étalonnage'.",
    keyFormulas: [
      "M(NaCl) = M(Na) + M(Cl)",
      "n = m / M",
      "C = n / V (avec V exprimé en Litres !)"
    ],
    hints: [
      "Calculer en premier lieu la masse molaire moléculaire M de NaCl.",
      "Veiller impérativement à convertir le volume de 250 mL en litres (V = 0,250 L)."
    ],
    correctionSteps: [
      {
        stepTitle: "1. Calcul de la masse molaire moléculaire de NaCl",
        explanation: "M(NaCl) = 23,0 + 35,5 = 58,5 g/mol.",
        formula: "M = 58,5 g·mol⁻¹",
        conclusion: "Une mole de NaCl a une masse de 58,5 grammes."
      },
      {
        stepTitle: "2. Quantité de matière dissoute n",
        explanation: "On applique la relation n = m / M avec m = 5,85 g et M = 58,5 g/mol.",
        formula: "n = 5,85 / 58,5 = 0,100 mol",
        conclusion: "La quantité de matière dissoute est n = 0,100 mol."
      },
      {
        stepTitle: "3. Calcul de la concentration molaire C",
        explanation: "Le volume de la solution est V = 250 mL = 0,250 L. C = n / V = 0,100 / 0,250.",
        formula: "C = 0,400 mol·L⁻¹",
        conclusion: "La concentration en soluté apporté est C = 0,40 mol/L."
      }
    ],
    tags: ['Seconde', 'Physique-Chimie', 'Sirius', 'Microméga', 'Moles']
  },
  {
    id: 'sec-svt-1',
    gradeLevel: 'seconde',
    gradeLevelLabel: 'Classe de Seconde',
    subject: 'SVT',
    chapterTitle: "L'ADN et l'expression de l'information génétique",
    textbookCollection: 'Baude-Jusserand (Bordas) & SVT Lycée (Nathan)',
    publisher: 'Bordas / Nathan',
    difficulty: 'standard_bac',
    question: "Expliquer les deux étapes fondamentales permettant le passage d'un gène à une protéine fonctionnelle : la transcription dans le noyau et la traduction dans le cytoplasme. Préciser le rôle de l'ARNm, des ribosomes et du code génétique universel.",
    contextOrDoc: "Programme officiel de Seconde - Partie 'L'organisme pluricellulaire, un ensemble de cellules spécialisées'.",
    hints: [
      "La transcription fabrique une copie d'ARN pré-messager complémentaire du brin matrice d'ADN (remplacement de T par U).",
      "La traduction lit les codons (triplets de nucléotides) par le ribosome selon la table du code génétique (AUG codon initiateur)."
    ],
    correctionSteps: [
      {
        stepTitle: "1. La transcription nucléaire",
        explanation: "L'ARN polymérase ouvre la double hélice d'ADN et polymérise un brin d'ARN messager (ARNm) par complémentarité des bases azotées (A-U, T-A, C-G, G-C). Chez les eucaryotes, la maturation (épissage) élimine les introns.",
        conclusion: "L'ARNm mature exporte l'information génétique du noyau vers le cytosol."
      },
      {
        stepTitle: "2. La traduction cytoplasmique",
        explanation: "Le ribosome s'associe à l'ARNm au niveau du codon initiateur AUG (Méthionine). Les ARNt apportent les acides aminés spécifiques. Le code génétique est universel, univoque et dégénéré (redondant). La chaîne polypeptidique s'achève à un codon stop (UAA, UAG, UGA).",
        conclusion: "La séquence de nucléotides dicte la structure primaire de la protéine."
      }
    ],
    tags: ['Seconde', 'SVT', 'Génétique', 'ADN', 'Traduction', 'Transcription']
  },
  {
    id: 'sec-hg-1',
    gradeLevel: 'seconde',
    gradeLevelLabel: 'Classe de Seconde',
    subject: 'Histoire-Géographie',
    chapterTitle: "Le monde méditerranéen antique : L'empreinte de Rome et d'Athènes",
    textbookCollection: 'Collection Le Quintrec (Nathan) & Hatier',
    publisher: 'Nathan / Hatier',
    difficulty: 'accessible',
    question: "Comparer le modèle de citoyenneté athénienne (démocratie directe fermée au Ve siècle av. J.-C.) et le modèle d'intégration romaine (octroi progressif de la civitas, Edit de Caracalla en 212 ap. J.-C.).",
    contextOrDoc: "Programme officiel Seconde - Thème 2 : 'Le monde méditerranéen : empreintes de l'Antiquité et du Moyen Âge'.",
    hints: [
      "À Athènes, la citoyenneté est exclusive (réservée aux hommes libres nés de père et mère citoyens, exclusion des femmes, métèques, esclaves).",
      "À Rome, l'Empire pratique une politique d'assimilation des élites provinciales jusqu'à la citoyenneté universelle en 212."
    ],
    correctionSteps: [
      {
        stepTitle: "1. Athènes : une démocratie directe mais sélective",
        explanation: "À Athènes (époque de Périclès), la citoyenneté confère la participation directe à l'Ecclésia et aux tribunaux (Héliée). Elle concerne seulement 10 à 15% de la population globale de l'Attique.",
        conclusion: "Modèle démocratique civique intense mais restrictif et non exportable."
      },
      {
        stepTitle: "2. Rome : l'empire intégrateur et la romanisation",
        explanation: "Rome utilise le droit de cité comme instrument impérial : affranchissement des esclaves devenant citoyens, droit latin pour les cités alliées, et apogée avec l'Édit de Caracalla (212) accordant la citoyenneté à tous les hommes libres de l'Empire.",
        conclusion: "La civitas romaine fonde un empire juridique et culturel universel."
      }
    ],
    tags: ['Seconde', 'Histoire-Géo', 'Rome', 'Athènes', 'Citoyenneté', 'Caracalla']
  },

  // =============================================================
  // CLASSE DE PREMIÈRE - SPÉCIALITÉS & FRANÇAIS (EAF)
  // =============================================================
  {
    id: 'prem-fr-1',
    gradeLevel: 'premiere',
    gradeLevelLabel: 'Classe de Première',
    subject: 'Français (Épreuves Anticipées du Bac)',
    chapterTitle: 'Méthodologie du Commentaire composé littéraire & Axes de lecture',
    textbookCollection: "L'Écume des lettres (Hachette) & Empreintes Littéraires (Magnard)",
    publisher: 'Hachette / Magnard',
    difficulty: 'standard_bac',
    question: "Pour un extrait de 'Alchimie de la douleur' de Baudelaire (Les Fleurs du Mal), dégager la problématique littéraire et structurer un plan en 2 axes majeurs comportant chacun 3 sous-parties illustrées d'analyses stylistiques (fond et forme indissociables).",
    contextOrDoc: "Objet d'étude EAF : 'La poésie du XIXe siècle au XXIe siècle'. Parcours : Alchimie poétique : la boue et l'or.",
    hints: [
      "La problématique doit interroger la tension entre la malédiction du poète et sa capacité à transmuer la souffrance en or poétique.",
      "Axe I : L'expérience tragique de l'angoisse et de l'alchimie inversée.",
      "Axe II : La création poétique paradoxale triomphant de la déchéance."
    ],
    correctionSteps: [
      {
        stepTitle: "1. Problématique littéraire",
        explanation: "Comment Baudelaire subvertit-il le mythe alchimique traditionnel pour transformer l'or en boue, tout en faisant de ce désespoir la matière même du sublime poétique ?",
        conclusion: "Problématique dynamique articulant esthétique et métaphysique baudelairienne."
      },
      {
        stepTitle: "2. Structure de l'Axe I (L'alchimie inversée du Spleen)",
        explanation: "A) La malédiction d'Hermès et le feu destructeur. B) L'antithèse systématique de Midas (l'or transformé en fer et en deuil). C) L'enfermement spatial et mental dans les ténèbres.",
        conclusion: "Démonstration appuyée sur les figures d'antithèse, oxymore et métaphore funèbre."
      },
      {
        stepTitle: "3. Structure de l'Axe II (Le triomphe esthétique de l'Art)",
        explanation: "A) La perfection rigoureuse de la forme fixe du sonnet. B) La puissance suggestive des correspondances et des images. C) L'alchimie poétique authentique : la souffrance transfigurée en chef-d'œuvre impérissable.",
        conclusion: "Le commentaire démontre que la forme poétique rachète la noirceur du réel."
      }
    ],
    tags: ['Première', 'EAF', 'Français', 'Baudelaire', 'Commentaire', 'Bac']
  },
  {
    id: 'prem-math-1',
    gradeLevel: 'premiere',
    gradeLevelLabel: 'Classe de Première',
    subject: 'Spécialité Mathématiques',
    chapterTitle: 'Dérivation locale, Équation de tangente & Extremum',
    textbookCollection: 'Barbazo (Hachette) & Indice (Bordas)',
    publisher: 'Hachette / Bordas',
    difficulty: 'standard_bac',
    question: "Soit f la fonction définie sur R par f(x) = x^3 - 3x^2 - 9x + 5. Calculer la dérivée f'(x), déterminer les points où la tangente est horizontale, et donner l'équation de la tangente (T) à la courbe au point d'abscisse a = 1.",
    contextOrDoc: "Manuel Barbazo Première Spécialité - Chapitre 'Dérivation et applications à l'optimisation'.",
    keyFormulas: [
      "(x^n)' = n·x^(n-1)",
      "Équation de tangente : y = f'(a)(x - a) + f(a)",
      "Tangente horizontale ↔ f'(x) = 0"
    ],
    hints: [
      "Dériver terme à terme : dérivée de x^3 est 3x^2, dérivée de -3x^2 est -6x, dérivée de -9x est -9.",
      "Pour les tangentes horizontales, résoudre le polynôme du second degré 3x^2 - 6x - 9 = 0 en factorisant par 3.",
      "Pour l'équation en a = 1, calculer f(1) puis f'(1)."
    ],
    correctionSteps: [
      {
        stepTitle: "1. Calcul de la dérivée f'(x)",
        explanation: "f'(x) = 3x^2 - 3(2x) - 9 + 0 = 3x^2 - 6x - 9 = 3(x^2 - 2x - 3).",
        formula: "f'(x) = 3(x + 1)(x - 3)",
        conclusion: "La dérivée est f'(x) = 3x^2 - 6x - 9."
      },
      {
        stepTitle: "2. Recherche des tangentes horizontales",
        explanation: "On résout f'(x) = 0 ↔ 3(x + 1)(x - 3) = 0. Les racines sont x = -1 et x = 3.",
        conclusion: "La courbe admet deux tangentes horizontales en x = -1 (maximum local) et x = 3 (minimum local)."
      },
      {
        stepTitle: "3. Équation de la tangente au point d'abscisse a = 1",
        explanation: "f(1) = 1 - 3 - 9 + 5 = -6. f'(1) = 3 - 6 - 9 = -12. Formule : y = -12(x - 1) + (-6) = -12x + 12 - 6.",
        formula: "y = -12x + 6",
        conclusion: "L'équation de la tangente (T) en x = 1 est y = -12x + 6."
      }
    ],
    tags: ['Première', 'Spé Maths', 'Barbazo', 'Indice', 'Dérivation']
  },
  {
    id: 'prem-pc-1',
    gradeLevel: 'premiere',
    gradeLevelLabel: 'Classe de Première',
    subject: 'Spécialité Physique-Chimie',
    chapterTitle: 'Ondes mécaniques périodiques & Effet Doppler',
    textbookCollection: 'Sirius (Nathan) & Microméga (Hatier)',
    publisher: 'Nathan / Hatier',
    difficulty: 'standard_bac',
    question: "Une source sonore émettant à f_0 = 440 Hz s'approche d'un observateur à la vitesse v_s = 72 km/h. La célérité du son est c = 340 m/s. Calculer la vitesse en m/s et la fréquence perçue f_R.",
    contextOrDoc: "Extrait Sirius Première Spécialité - Chapitre 'Ondes et signaux'.",
    keyFormulas: [
      "v (m/s) = v (km/h) / 3,6",
      "Approche : f_R = f_0 × [c / (c - v_s)]"
    ],
    hints: [
      "72 km/h correspond exactement à 20 m/s.",
      "À l'approche, le dénominateur est réduit (c - v_s), augmentant la fréquence perçue."
    ],
    correctionSteps: [
      {
        stepTitle: "1. Conversion",
        explanation: "v_s = 72 / 3,6 = 20,0 m/s.",
        formula: "v_s = 20 m/s",
        conclusion: "Vitesse = 20 m/s."
      },
      {
        stepTitle: "2. Fréquence Doppler",
        explanation: "f_R = 440 × (340 / (340 - 20)) = 440 × (340 / 320) = 467,5 Hz.",
        formula: "f_R ≈ 468 Hz",
        conclusion: "Le son perçu est plus aigu (468 Hz > 440 Hz)."
      }
    ],
    tags: ['Première', 'Spé PC', 'Sirius', 'Microméga', 'Doppler']
  },
  {
    id: 'prem-nsi-1',
    gradeLevel: 'premiere',
    gradeLevelLabel: 'Classe de Première',
    subject: 'NSI (Informatique)',
    chapterTitle: 'Algorithmes de recherche : Linéaire vs Dichotomique',
    textbookCollection: 'NSI (Ellipses) & NSI (Hatier)',
    publisher: 'Ellipses / Hatier',
    difficulty: 'standard_bac',
    question: "1) Quelle est la précondition indispensable pour appliquer la recherche dichotomique ? 2) Comparer les complexités O(N) et O(log₂(N)). 3) Combien d'itérations au maximum pour 1 000 000 d'éléments ?",
    contextOrDoc: "Manuel NSI Première Éditions Ellipses.",
    hints: [
      "Le tableau doit être obligatoirement trié.",
      "Calculer la puissance de 2 immédiatement supérieure à 1 000 000."
    ],
    correctionSteps: [
      {
        stepTitle: "1. Précondition",
        explanation: "Le tableau doit être préalablement trié par ordre croissant ou décroissant.",
        conclusion: "Précondition : tableau trié."
      },
      {
        stepTitle: "2. Complexité",
        explanation: "Recherche linéaire en O(N) vs Recherche dichotomique en O(log₂(N)).",
        conclusion: "Gain exponentiel de performance."
      },
      {
        stepTitle: "3. Nombre maximal d'itérations",
        explanation: "Comme 2¹⁹ = 524 288 et 2²⁰ = 1 048 576, 20 itérations suffisent.",
        formula: "k = 20 itérations",
        conclusion: "20 comparaisons au maximum pour un million de données."
      }
    ],
    tags: ['Première', 'Spé NSI', 'Ellipses', 'Hatier', 'Dichotomie']
  },

  // =============================================================
  // CLASSE DE TERMINALE - PHILOSOPHIE DU BAC (17 NOTIONS OFFICIELLES)
  // =============================================================
  {
    id: 'term-philo-1',
    gradeLevel: 'terminale',
    gradeLevelLabel: 'Classe de Terminale',
    subject: 'Philosophie',
    chapterTitle: 'La Liberté : Libre arbitre, Déterminisme & Responsabilité',
    textbookCollection: 'Passerelles (Nathan) & Philosophie (Hatier)',
    publisher: 'Nathan / Hatier',
    difficulty: 'standard_bac',
    question: "Sujet de dissertation : 'Sommes-nous d'autant plus libres que nous avons le choix ?' Dégager le paradoxe central, formuler la problématique et proposer un plan dialectique en trois parties articulant Descartes, Spinoza et Sartre.",
    contextOrDoc: "Notion officielle du Baccalauréat : La Liberté. Manuel Passerelles Nathan.",
    hints: [
      "Le sens commun identifie la liberté au choix illimité (société de consommation).",
      "Mais le libre arbitre n'est-il pas une illusion masquant les déterminismes psychologiques et sociaux (Spinoza) ?",
      "Penser à Sartre : 'Nous sommes condamnés à être libres' (l'angoisse du choix)."
    ],
    correctionSteps: [
      {
        stepTitle: "1. Paradoxe et Problématique",
        explanation: "Si le choix est la condition visible de la volonté, la prolifération des options peut engendrer l'illusion du libre arbitre ou l'angoisse de l'indécision. Problématique : La liberté réside-t-elle dans l'arbitraire indifférent du choix ou dans la conscience lucide de la nécessité rationnelle ?",
        conclusion: "Problématique dialectique rigoureuse."
      },
      {
        stepTitle: "2. Plan dialectique structuré",
        explanation: "I. Thèse : Le choix comme expression souveraine du libre arbitre (Descartes : la volonté infinie humaine). II. Antithèse : L'illusion du libre arbitre et la critique des déterminismes (Spinoza : la pierre qui roule et qui croit vouloir son mouvement). III. Synthèse : La liberté existentielle comme engagement lucide et responsabilité inconditionnelle (Sartre).",
        conclusion: "Plan équilibré conforme aux critères d'évaluation du Baccalauréat."
      }
    ],
    tags: ['Terminale', 'Philosophie', 'Passerelles', 'Hatier', 'Liberté', 'Descartes', 'Spinoza', 'Sartre']
  },
  {
    id: 'term-philo-2',
    gradeLevel: 'terminale',
    gradeLevelLabel: 'Classe de Terminale',
    subject: 'Philosophie',
    chapterTitle: 'La Conscience et L\'Inconscient : Suis-je maître de moi-même ?',
    textbookCollection: 'Philosophie (Hatier) & Nathan',
    publisher: 'Hatier / Nathan',
    difficulty: 'standard_bac',
    question: "Explication de texte philosophique : Dans les 'Cinq Leçons sur la psychanalyse' (1909), Freud affirme que 'le Moi n'est pas maître dans sa propre maison'. Analyser la rupture épistémologique freudienne face au cogito cartésien (Descartes) et les objections éthiques d'Alain et Sartre contre l'inconscient comme excuse de mauvaise foi.",
    contextOrDoc: "Notions officielles du Bac : La Conscience / L'Inconscient.",
    hints: [
      "Le Cogito cartésien identifie le sujet à sa conscience transparente ('Je pense donc je suis').",
      "Freud introduit la 1ère et 2ème topique (Ça, Moi, Surmoi) et le refoulement.",
      "Sartre et Alain dénoncent l'inconscient comme une démission morale (la 'mauvaise foi' existentialiste)."
    ],
    correctionSteps: [
      {
        stepTitle: "1. La troisième blessure narcissique de l'humanité",
        explanation: "Après Copernic (l'homme n'est pas au centre de l'univers) et Darwin (l'homme est issu de l'évolution animale), Freud inflige la blessure psychologique : la conscience n'est que la surface d'une vie psychique dominée par des pulsions inconscientes refoulées.",
        conclusion: "Rupture radicale avec la souveraineté cartésienne du sujet conscient."
      },
      {
        stepTitle: "2. Les objections philosophiques majeures",
        explanation: "Pour Alain, 'l'inconscient est une illusion de la mauvaise psychologie'. Pour Sartre, l'inconscient est un stratagème de la mauvaise foi pour fuir sa liberté ('ce n'est pas moi, c'est mon inconscient'). Il n'y a pas d'inconscient, mais des projets fondamentaux que nous choisissons.",
        conclusion: "Tension féconde entre déterminisme psychanalytique et responsabilité existentielle."
      }
    ],
    tags: ['Terminale', 'Philosophie', 'Conscience', 'Inconscient', 'Freud', 'Descartes', 'Sartre']
  },
  {
    id: 'term-philo-3',
    gradeLevel: 'terminale',
    gradeLevelLabel: 'Classe de Terminale',
    subject: 'Philosophie',
    chapterTitle: 'La Justice et Le Droit : Le légal et le légitime',
    textbookCollection: 'Philosophie (Hachette) & Hatier',
    publisher: 'Hachette / Hatier',
    difficulty: 'standard_bac',
    question: "Dissertation : 'Suffit-il d'obéir aux lois pour être juste ?' Distinguer droit positif (légal) et droit naturel (légitime) à travers les figures d'Antigone (Sophocle), la théorie du contrat social (Hobbes, Rousseau) et la désobéissance civile (Thoreau, Rawls).",
    contextOrDoc: "Notions officielles du Bac : La Justice / L'État / Le Devoir.",
    hints: [
      "Une loi peut être légale sans être moralement juste (ex: lois ségrégationnistes ou totalitaires).",
      "Antigone oppose les 'lois non écrites et immuables des dieux' aux décrets politiques de Créon.",
      "John Rawls théorise la désobéissance civile comme ultime recours public et non-violent pour corriger une injustice grave."
    ],
    correctionSteps: [
      {
        stepTitle: "1. Le légalisme et la nécessité de l'ordre public",
        explanation: "Pour Hobbes (Léviathan), hors de la loi civile, règne l'état de nature (guerre de tous contre tous). Obéir à la loi est la condition sine qua non de la sécurité et de la paix civile. La justice naît avec le pacte civil.",
        conclusion: "Thèse positiviste : nul n'est juste contre la loi."
      },
      {
        stepTitle: "2. Les limites du droit positif et l'exigence morale du légitime",
        explanation: "La légalité n'est pas garante de la justice (ex: lois iniques). L'idéal de justice transcende le droit écrit. Rousseau rappelle qu'obéir à la force ou à la contrainte n'est pas un devoir moral.",
        conclusion: "Nécessité d'un idéal régulateur de justice universelle (droit naturel)."
      },
      {
        stepTitle: "3. La désobéissance civile et la justice équitable",
        explanation: "Face à une injustice institutionnalisée, le citoyen a le devoir éthique d'entrer en résistance pacifique pour interpeller la conscience collective (Thoreau, Gandhi, Martin Luther King, Rawls).",
        conclusion: "La véritable justice est vigilance critique et perfectionnement continu des lois."
      }
    ],
    tags: ['Terminale', 'Philosophie', 'Justice', 'Droit', 'Rawls', 'Hobbes', 'Rousseau', 'Antigone']
  },

  // =============================================================
  // CLASSE DE TERMINALE - MATHÉMATIQUES & SCIENCES
  // =============================================================
  {
    id: 'term-math-1',
    gradeLevel: 'terminale',
    gradeLevelLabel: 'Classe de Terminale',
    subject: 'Spécialité Mathématiques',
    chapterTitle: 'Calcul intégral & Intégration par parties (IPP)',
    textbookCollection: 'Barbazo (Hachette) & Indice (Bordas)',
    publisher: 'Hachette / Bordas',
    difficulty: 'approfondissement',
    question: "Calculer l'intégrale I = ∫_0^1 (2x + 1) e^x dx à l'aide de l'intégration par parties. Justifier le choix de u(x) et v'(x).",
    contextOrDoc: "Manuel Barbazo Terminale Spécialité - Chapitre 'Calcul intégral'.",
    keyFormulas: [
      "Formule d'IPP : ∫ u(x)v'(x)dx = [u(x)v(x)] - ∫ u'(x)v(x)dx",
      "Règle ALPES : Polynôme u(x) = 2x + 1 avant Exponentielle v'(x) = e^x"
    ],
    hints: [
      "Poser u(x) = 2x + 1 d'où u'(x) = 2.",
      "Poser v'(x) = e^x d'où v(x) = e^x."
    ],
    correctionSteps: [
      {
        stepTitle: "1. Choix et dérivation",
        explanation: "u(x) = 2x + 1 => u'(x) = 2. v'(x) = e^x => v(x) = e^x. Fonctions de classe C¹ sur [0, 1].",
        conclusion: "Conditions de régularité vérifiées."
      },
      {
        stepTitle: "2. Application de la formule",
        explanation: "I = [(2x + 1)e^x]_0^1 - ∫_0^1 2e^x dx = [3e - 1] - [2e^x]_0^1 = (3e - 1) - (2e - 2).",
        formula: "I = e + 1",
        conclusion: "Valeur exacte : I = e + 1 ≈ 3,718."
      }
    ],
    tags: ['Terminale', 'Spé Maths', 'Barbazo', 'Indice', 'Intégrales', 'IPP']
  },
  {
    id: 'term-ses-1',
    gradeLevel: 'terminale',
    gradeLevelLabel: 'Classe de Terminale',
    subject: 'Spécialité SES',
    chapterTitle: 'Quelles sont les sources et les défis de la croissance économique ?',
    textbookCollection: 'Passerelles (Bordas) & SES (Hatier)',
    publisher: 'Bordas / Hatier',
    difficulty: 'standard_bac',
    question: "Démontrer en quoi le progrès technique est endogène selon la théorie économique moderne (Romer, Lucas, Barro) et analyser la dynamique de 'destruction créatrice' de Schumpeter.",
    contextOrDoc: "Manuel Passerelles Terminale Spécialité SES.",
    hints: [
      "Opposer le progrès exogène de Solow au progrès endogène issu de la R&D et du capital humain.",
      "Expliquer comment l'innovation rend obsolètes les anciennes structures industrielles."
    ],
    correctionSteps: [
      {
        stepTitle: "1. La théorie de la croissance endogène",
        explanation: "Le progrès technique résulte d'investissements stratégiques : R&D (Romer), capital humain (Lucas) et infrastructures publiques (Barro), générant des rendements croissants.",
        conclusion: "Le progrès technique est produit au sein même du système économique."
      },
      {
        stepTitle: "2. La destruction créatrice schumpetérienne",
        explanation: "L'innovation de rupture crée de nouvelles filières tout en détruisant les entreprises obsolètes (ex: smartphones remplaçant les appareils photo argentiques).",
        conclusion: "Moteur fondamental des cycles longs de Kondratieff."
      }
    ],
    tags: ['Terminale', 'Spé SES', 'Passerelles', 'Hatier', 'Croissance', 'Schumpeter']
  },
  {
    id: 'term-hggsp-1',
    gradeLevel: 'terminale',
    gradeLevelLabel: 'Classe de Terminale',
    subject: 'HGGSP (Géopolitique)',
    chapterTitle: "De nouveaux espaces de conquête : Mers, océans et espace extra-atmosphérique",
    textbookCollection: 'HGGSP (Hatier) & Nathan',
    publisher: 'Hatier / Nathan',
    difficulty: 'standard_bac',
    question: "Analyser les enjeux de souveraineté et de militarisation des espaces maritimes (détroit de Malacca, Mer de Chine méridionale) et de l'espace exo-atmosphérique (Course à la Lune, satellites militaires et New Space).",
    contextOrDoc: "Thème 1 officiel Terminale HGGSP.",
    hints: [
      "Rappeler la convention de Montego Bay (1982) fixant les ZEE (Zone Économique Exclusive).",
      "Distinguer le Traité de l'espace de 1967 de l'essor des acteurs privés (SpaceX, New Space) et des tensions sino-américaines."
    ],
    correctionSteps: [
      {
        stepTitle: "1. La maritimisation et les goulets d'étranglement stratégiques",
        explanation: "90% du commerce mondial de marchandises transite par la mer. Les détroits (Ormuz, Malacca, Bab-el-Mandeb) sont des chokepoints vitaux et des théâtres de démonstration de puissance (thalassopolitique).",
        conclusion: "La maîtrise des mers reste le pilier de l'hégémonie géopolitique."
      },
      {
        stepTitle: "2. L'espace extra-atmosphérique : nouveau sanctuaire et champ de bataille",
        explanation: "De la conquête spatiale de la Guerre froide à la militarisation actuelle (armes anti-satellites, guerre cyber-électronique), l'espace devient indispensable pour le guidage GPS, les télécommunications et le renseignement tactique.",
        conclusion: "L'espace est un bien commun mondial menacé de privatisation et de conflictualité."
      }
    ],
    tags: ['Terminale', 'HGGSP', 'Mers', 'Océans', 'Espace', 'Géopolitique', 'New Space']
  }
];
