export interface EnglishPriorityWord {
  id: string;
  word: string;
  phonetics: string;
  partOfSpeech: 'verb' | 'noun' | 'adjective' | 'adverb' | 'conjunction' | 'idiom' | 'phrasal_verb';
  level: 'A2' | 'B1' | 'B2' | 'C1';
  frenchMeaning: string;
  category: 
    | 'connectors' 
    | 'argumentation_verbs' 
    | 'false_friends' 
    | 'phrasal_verbs' 
    | 'society_issues' 
    | 'literary_analysis'
    | 'idioms';
  exampleSentence: string;
  frenchTranslation: string;
  collocations?: string[];
  notes?: string;
}

export interface EnglishStudyNoteSection {
  id: string;
  title: string;
  badge: string;
  summary: string;
  readTimeMinutes: number;
  contentMarkdown: string;
  keyTakeaways: string[];
}

export interface EnglishExercise {
  id: string;
  category: 'tenses' | 'false_friends' | 'phrasal_verbs' | 'inversion' | 'connectors' | 'conditionals';
  title: string;
  instruction: string;
  sentence: string; // contains blank [___]
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const ENGLISH_PRIORITY_WORDS: EnglishPriorityWord[] = [
  // --- 1. CONNECTEURS LOGIQUES & DISCOURSE MARKERS ---
  {
    id: 'en-conn-1',
    word: 'Furthermore / Moreover',
    phonetics: '/ˌfɜː.ðəˈmɔːr/ , /mɔːrˈoʊ.vər/',
    partOfSpeech: 'adverb',
    level: 'B2',
    frenchMeaning: 'De plus / En outre / Par ailleurs',
    category: 'connectors',
    exampleSentence: 'The policy will reduce carbon emissions; furthermore, it will create thousands of green jobs.',
    frenchTranslation: 'La politique réduira les émissions de carbone ; de plus, elle créera des milliers d\'emplois verts.',
    collocations: ['Furthermore, it is worth noting that...', 'Moreover, studies show...'],
    notes: 'Essentiel en dissertation pour ajouter un argument de poids supérieur.'
  },
  {
    id: 'en-conn-2',
    word: 'Nevertheless / Nonetheless',
    phonetics: '/ˌnev.ə.ðəˈles/',
    partOfSpeech: 'adverb',
    level: 'B2',
    frenchMeaning: 'Néanmoins / Toutefois / Malgré tout',
    category: 'connectors',
    exampleSentence: 'The experiment was fraught with difficulties; nevertheless, the researchers persevered.',
    frenchTranslation: 'L\'expérience était semée de difficultés ; néanmoins, les chercheurs ont persévéré.',
    collocations: ['Nevertheless, it remains true that...', 'Nonetheless, we must acknowledge...'],
    notes: 'Permet de nuancer une concession sans annuler la thèse principale.'
  },
  {
    id: 'en-conn-3',
    word: 'Whereas / While',
    phonetics: '/weərˈæz/',
    partOfSpeech: 'conjunction',
    level: 'B1',
    frenchMeaning: 'Tandis que / Alors que (opposition)',
    category: 'connectors',
    exampleSentence: 'Some countries invest heavily in nuclear power, whereas others rely primarily on solar energy.',
    frenchTranslation: 'Certains pays investissent massivement dans le nucléaire, tandis que d\'autres s\'appuient principalement sur le solaire.',
    collocations: ['Whereas in the past...', 'While it may be true that...'],
    notes: 'Idéal pour comparer deux graphiques, auteurs ou tendances historiques.'
  },
  {
    id: 'en-conn-4',
    word: 'Consequently / As a result',
    phonetics: '/ˈkɒn.sɪ.kwənt.li/',
    partOfSpeech: 'adverb',
    level: 'B2',
    frenchMeaning: 'Par conséquent / En conséquence / Il en résulte que',
    category: 'connectors',
    exampleSentence: 'Funding for public healthcare was curtailed; consequently, waiting times soared.',
    frenchTranslation: 'Le financement de la santé publique a été restreint ; par conséquent, les temps d\'attente ont grimpé en flèche.',
    collocations: ['Consequently, one can deduce that...', 'As a direct result of...'],
    notes: 'Introduit une conclusion logique incontestable.'
  },
  {
    id: 'en-conn-5',
    word: 'Notwithstanding',
    phonetics: '/ˌnɒt.wɪðˈstæn.dɪŋ/',
    partOfSpeech: 'conjunction',
    level: 'C1',
    frenchMeaning: 'Nonobstant / En dépit de / Malgré',
    category: 'connectors',
    exampleSentence: 'Notwithstanding the widespread skepticism, the new treaty was ratified unanimously.',
    frenchTranslation: 'En dépit du scepticisme généralisé, le nouveau traité a été ratifié à l\'unanimité.',
    collocations: ['Notwithstanding the fact that...', 'Injuries notwithstanding, they won.'],
    notes: 'Tournure très valorisée au Bac et dans les concours de l\'enseignement supérieur.'
  },
  {
    id: 'en-conn-6',
    word: 'On the other hand',
    phonetics: '/ɒn ði ˈʌð.ər hænd/',
    partOfSpeech: 'idiom',
    level: 'B1',
    frenchMeaning: 'D\'autre part / En revanche',
    category: 'connectors',
    exampleSentence: 'On the one hand, AI automates tedious tasks; on the other hand, it raises severe ethical dilemmas.',
    frenchTranslation: 'D\'une part, l\'IA automatise les tâches rébarbatives ; d\'autre part, elle soulève de sévères dilemmes éthiques.',
    collocations: ['On the one hand... on the other hand...'],
    notes: 'À utiliser de préférence en paire avec "On the one hand".'
  },

  // --- 2. VERBES D'ARGUMENTATION & ACADÉMIQUES ---
  {
    id: 'en-verb-1',
    word: 'To highlight / To emphasize',
    phonetics: '/ˈhaɪ.laɪt/ , /ˈem.fə.saɪz/',
    partOfSpeech: 'verb',
    level: 'B2',
    frenchMeaning: 'Mettre en lumière / Souligner / Insister sur',
    category: 'argumentation_verbs',
    exampleSentence: 'The author highlights the socio-economic inequalities that plague Victorian London.',
    frenchTranslation: 'L\'auteur met en lumière les inégalités socio-économiques qui frappent le Londres victorien.',
    collocations: ['To highlight a crucial issue', 'To emphasize the importance of'],
    notes: 'Verbe d\'analyse fondamental en commentaire de texte anglais.'
  },
  {
    id: 'en-verb-2',
    word: 'To shed light on',
    phonetics: '/tə ʃed laɪt ɒn/',
    partOfSpeech: 'idiom',
    level: 'B2',
    frenchMeaning: 'Éclairer / Apporter un éclairage nouveau sur',
    category: 'argumentation_verbs',
    exampleSentence: 'Recent archaeological findings shed new light on Bronze Age trade routes.',
    frenchTranslation: 'Les récentes découvertes archéologiques apportent un éclairage nouveau sur les routes commerciales de l\'âge du bronze.',
    collocations: ['To shed light on a mystery', 'To shed light on the motives'],
    notes: 'Métaphore élégante pour expliquer comment un document apporte des réponses.'
  },
  {
    id: 'en-verb-3',
    word: 'To advocate for',
    phonetics: '/tə ˈæd.və.keɪt fɔːr/',
    partOfSpeech: 'verb',
    level: 'B2',
    frenchMeaning: 'Plaider en faveur de / Préconiser / Défendre (une cause)',
    category: 'argumentation_verbs',
    exampleSentence: 'Environmental activists continuously advocate for stricter carbon tax regulations.',
    frenchTranslation: 'Les militants écologistes plaident sans relâche pour des réglementations plus strictes sur la taxe carbone.',
    collocations: ['To advocate for human rights', 'To advocate for reform'],
    notes: 'Attention : "an advocate" (nom) = un partisan / défenseur.'
  },
  {
    id: 'en-verb-4',
    word: 'To challenge / To call into question',
    phonetics: '/ˈtʃæl.ɪndʒ/',
    partOfSpeech: 'verb',
    level: 'B2',
    frenchMeaning: 'Remettre en question / Contester / Défier',
    category: 'argumentation_verbs',
    exampleSentence: 'This statistical report calls into question the veracity of official government data.',
    frenchTranslation: 'Ce rapport statistique remet en question la véracité des données gouvernementales officielles.',
    collocations: ['To challenge the status quo', 'To call into question an assumption'],
    notes: 'Clé pour exprimer la réfutation d\'un contre-argument.'
  },
  {
    id: 'en-verb-5',
    word: 'To depict / To portray',
    phonetics: '/dɪˈpɪkt/ , /pɔːˈtreɪ/',
    partOfSpeech: 'verb',
    level: 'B1',
    frenchMeaning: 'Dépeindre / Représenter / Dresser le portrait de',
    category: 'argumentation_verbs',
    exampleSentence: 'Orwell portrays a totalitarian dystopia where individuality is methodically eradicated.',
    frenchTranslation: 'Orwell dépeint une dystopie totalitaire où l\'individualité est méthodiquement éradiquée.',
    collocations: ['To depict a grim reality', 'To portray someone as a villain'],
    notes: 'Idéal pour commenter une oeuvre littéraire, un film ou un tableau.'
  },
  {
    id: 'en-verb-6',
    word: 'To trigger / To spark',
    phonetics: '/ˈtrɪɡ.ər/ , /spɑːk/',
    partOfSpeech: 'verb',
    level: 'B2',
    frenchMeaning: 'Déclencher / Susciter / Provoquer',
    category: 'argumentation_verbs',
    exampleSentence: 'The assassination of Archduke Franz Ferdinand triggered the outbreak of World War I.',
    frenchTranslation: 'L\'assassinat de l\'archiduc François-Ferdinand a déclenché le début de la Première Guerre mondiale.',
    collocations: ['To trigger a chain reaction', 'To spark widespread protests'],
    notes: 'Exprime la causalité immédiate et explosive.'
  },
  {
    id: 'en-verb-7',
    word: 'To cope with / To tackle',
    phonetics: '/kəʊp wɪð/ , /ˈtæk.əl/',
    partOfSpeech: 'verb',
    level: 'B2',
    frenchMeaning: 'Faire face à / S\'attaquer à / Venir à bout de',
    category: 'argumentation_verbs',
    exampleSentence: 'Governments must urgently tackle the burgeoning crisis of youth mental health.',
    frenchTranslation: 'Les gouvernements doivent s\'attaquer d\'urgence à la crise grandissante de la santé mentale chez les jeunes.',
    collocations: ['To cope with stress', 'To tackle an issue head-on'],
    notes: 'Cope with implique une adaptation face à l\'adversité ; Tackle implique une offensive volontaire.'
  },

  // --- 3. FAUX-AMIS MAJEURS (FALSE FRIENDS) ---
  {
    id: 'en-ff-1',
    word: 'Actually',
    phonetics: '/ˈæk.tʃu.ə.li/',
    partOfSpeech: 'adverb',
    level: 'A2',
    frenchMeaning: 'En réalité / En fait (et NON PAS actuellement !)',
    category: 'false_friends',
    exampleSentence: 'I thought he was British, but actually he comes from New Zealand.',
    frenchTranslation: 'Je pensais qu\'il était britannique, mais en réalité il vient de Nouvelle-Zélande.',
    collocations: ['Actually, that is not the case', 'As a matter of fact'],
    notes: 'Pour dire "actuellement", utilisez "Currently" ou "Nowadays".'
  },
  {
    id: 'en-ff-2',
    word: 'Eventually',
    phonetics: '/ɪˈven.tʃu.ə.li/',
    partOfSpeech: 'adverb',
    level: 'B1',
    frenchMeaning: 'Finalement / À terme / Au bout du compte (et NON PAS éventuellement !)',
    category: 'false_friends',
    exampleSentence: 'After years of fierce legal battles, justice eventually prevailed.',
    frenchTranslation: 'Après des années de féroces batailles judiciaires, la justice a fini par prévaloir.',
    collocations: ['Eventually succeed', 'Eventually lead to'],
    notes: 'Pour dire "éventuellement", utilisez "Possibly" ou "If need be".'
  },
  {
    id: 'en-ff-3',
    word: 'Comprehensive',
    phonetics: '/ˌkɒm.prɪˈhen.sɪv/',
    partOfSpeech: 'adjective',
    level: 'B2',
    frenchMeaning: 'Exhaustif / Complet / Global (et NON PAS compréhensif !)',
    category: 'false_friends',
    exampleSentence: 'The professor provided a comprehensive overview of European geopolitics.',
    frenchTranslation: 'Le professeur a fourni un aperçu exhaustif de la géopolitique européenne.',
    collocations: ['A comprehensive study', 'Comprehensive insurance'],
    notes: 'Pour dire "compréhensif (indulgent)", utilisez "Understanding" ou "Sympathetic".'
  },
  {
    id: 'en-ff-4',
    word: 'Deception',
    phonetics: '/dɪˈsep.ʃən/',
    partOfSpeech: 'noun',
    level: 'B2',
    frenchMeaning: 'Tromperie / Duperie / Supercherie (et NON PAS déception !)',
    category: 'false_friends',
    exampleSentence: 'The general was convicted of high treason and deceitful military deception.',
    frenchTranslation: 'Le général a été reconnu coupable de haute trahison et de supercherie militaire trompeuse.',
    collocations: ['Acts of deception', 'A web of deception'],
    notes: 'Pour dire "déception", utilisez "Disappointment".'
  },
  {
    id: 'en-ff-5',
    word: 'Sympathetic',
    phonetics: '/ˌsɪm.pəˈθet.ɪk/',
    partOfSpeech: 'adjective',
    level: 'B1',
    frenchMeaning: 'Compatissant / Empathique / Compréhensif (et NON PAS sympa !)',
    category: 'false_friends',
    exampleSentence: 'The counselor was remarkably sympathetic to the struggles of the young refugees.',
    frenchTranslation: 'Le conseiller a fait preuve d\'une remarquable compassion face aux épreuves des jeunes réfugiés.',
    collocations: ['A sympathetic ear', 'To be sympathetic towards someone'],
    notes: 'Pour dire "sympathique / sympa", utilisez "Friendly", "Nice" ou "Likable".'
  },
  {
    id: 'en-ff-6',
    word: 'To attend',
    phonetics: '/əˈtend/',
    partOfSpeech: 'verb',
    level: 'A2',
    frenchMeaning: 'Assister à / Participer à / Fréquenter (une école) (et NON PAS attendre !)',
    category: 'false_friends',
    exampleSentence: 'Over two hundred distinguished delegates attended the international climate summit.',
    frenchTranslation: 'Plus de deux cents délégués émérites ont assisté au sommet international sur le climat.',
    collocations: ['To attend a lecture', 'To attend school'],
    notes: 'Pour dire "attendre", utilisez "To wait for" ou "To expect".'
  },

  // --- 4. PHRASAL VERBS PRIORITAIRES ---
  {
    id: 'en-pv-1',
    word: 'To carry out',
    phonetics: '/tə ˈkær.i aʊt/',
    partOfSpeech: 'phrasal_verb',
    level: 'B2',
    frenchMeaning: 'Mener à bien / Effectuer / Exécuter (une enquête, un plan)',
    category: 'phrasal_verbs',
    exampleSentence: 'Scientists carried out an extensive survey on the effects of microplastics.',
    frenchTranslation: 'Les scientifiques ont mené une vaste étude sur les effets des microplastiques.',
    collocations: ['To carry out research', 'To carry out an order', 'To carry out a test'],
    notes: 'Verbe indispensable dans les dissertations scientifiques et sociologiques.'
  },
  {
    id: 'en-pv-2',
    word: 'To bring about',
    phonetics: '/tə brɪŋ əˈbaʊt/',
    partOfSpeech: 'phrasal_verb',
    level: 'B2',
    frenchMeaning: 'Provoquer / Entraîner / Engendrer (un changement)',
    category: 'phrasal_verbs',
    exampleSentence: 'The Industrial Revolution brought about profound transformations in urban life.',
    frenchTranslation: 'La révolution industrielle a engendré de profondes transformations dans la vie urbaine.',
    collocations: ['To bring about change', 'To bring about a revolution'],
    notes: 'Synonyme élégant de "To cause" ou "To lead to".'
  },
  {
    id: 'en-pv-3',
    word: 'To look forward to (+ V-ing)',
    phonetics: '/tə lʊk ˈfɔː.wəd tuː/',
    partOfSpeech: 'phrasal_verb',
    level: 'B1',
    frenchMeaning: 'Attendre avec impatience / Avoir hâte de',
    category: 'phrasal_verbs',
    exampleSentence: 'I look forward to hearing from you at your earliest convenience.',
    frenchTranslation: 'J\'attends avec impatience de vos nouvelles dans les meilleurs délais.',
    collocations: ['I look forward to meeting you', 'Looking forward to working together'],
    notes: 'ATTENTION : la préposition "to" est suivie du GÉRONDIF en -ING ! (ex: looking forward to meeting).'
  },
  {
    id: 'en-pv-4',
    word: 'To come across',
    phonetics: '/tə kʌm əˈkrɒs/',
    partOfSpeech: 'phrasal_verb',
    level: 'B1',
    frenchMeaning: 'Tomber sur / Rencontrer par hasard / Donner l\'impression de',
    category: 'phrasal_verbs',
    exampleSentence: 'While browsing the archives, the historian came across an unpublished manuscript.',
    frenchTranslation: 'En parcourant les archives, l\'historien est tombé par hasard sur un manuscrit inédit.',
    collocations: ['To come across an old friend', 'He comes across as confident'],
    notes: 'Sens 1 : découverte fortuite. Sens 2 : impression projetée sur autrui.'
  },
  {
    id: 'en-pv-5',
    word: 'To put off',
    phonetics: '/tə pʊt ɒf/',
    partOfSpeech: 'phrasal_verb',
    level: 'B1',
    frenchMeaning: 'Reporter / Remettre à plus tard (procrastiner) / Décourager',
    category: 'phrasal_verbs',
    exampleSentence: 'Never put off until tomorrow what you can accomplish today.',
    frenchTranslation: 'Ne remettez jamais à demain ce que vous pouvez accomplir aujourd\'hui.',
    collocations: ['To put off a meeting', 'Don\'t be put off by the difficulty'],
    notes: 'Synonyme soutenu : "To postpone" ou "To defer".'
  },
  {
    id: 'en-pv-6',
    word: 'To stand for',
    phonetics: '/tə stænd fɔːr/',
    partOfSpeech: 'phrasal_verb',
    level: 'B1',
    frenchMeaning: 'Signifier / Représenter / Défendre (des valeurs)',
    category: 'phrasal_verbs',
    exampleSentence: 'What does the acronym UNESCO stand for? It stands for educational and cultural cooperation.',
    frenchTranslation: 'Que signifie l\'acronyme UNESCO ? Il représente la coopération éducative et culturelle.',
    collocations: ['What does it stand for?', 'To stand for justice and peace'],
    notes: 'Très utile pour expliquer le sens d\'un symbole ou d\'un acronyme.'
  },

  // --- 5. SOCIÉTÉ, DÉBATS & MONDE CONTEMPORAIN (B2/C1) ---
  {
    id: 'en-soc-1',
    word: 'A double-edged sword',
    phonetics: '/ə ˈdʌb.əl edʒd sɔːd/',
    partOfSpeech: 'idiom',
    level: 'B2',
    frenchMeaning: 'Une arme à double tranchant',
    category: 'society_issues',
    exampleSentence: 'Social media is a double-edged sword: it connects communities while amplifying misinformation.',
    frenchTranslation: 'Les réseaux sociaux sont une arme à double tranchant : ils connectent les communautés tout en amplifiant la désinformation.',
    collocations: ['To prove to be a double-edged sword', 'A double-edged technological innovation'],
    notes: 'Idéal en conclusion d\'une dissertation sur le progrès technique.'
  },
  {
    id: 'en-soc-2',
    word: 'Digital footprint',
    phonetics: '/ˈdɪdʒ.ɪ.təl ˈfʊt.prɪnt/',
    partOfSpeech: 'noun',
    level: 'B1',
    frenchMeaning: 'Empreinte numérique (traces laissées en ligne)',
    category: 'society_issues',
    exampleSentence: 'Every online purchase and social media interaction contributes to your persistent digital footprint.',
    frenchTranslation: 'Chaque achat en ligne et interaction sur les réseaux sociaux contribue à votre empreinte numérique persistante.',
    collocations: ['To monitor one\'s digital footprint', 'To erase personal digital footprints'],
    notes: 'Thème récurrent des épreuves du Baccalauréat (Axe : Innovations & Éthique).'
  },
  {
    id: 'en-soc-3',
    word: 'Brain drain',
    phonetics: '/ˈbreɪn ˌdreɪn/',
    partOfSpeech: 'noun',
    level: 'B2',
    frenchMeaning: 'La fuite des cerveaux (émigration des personnes qualifiées)',
    category: 'society_issues',
    exampleSentence: 'Developing economies suffer intensely from brain drain as top engineers seek opportunities abroad.',
    frenchTranslation: 'Les économies en développement souffrent intensément de la fuite des cerveaux alors que les meilleurs ingénieurs cherchent des opportunités à l\'étranger.',
    collocations: ['To stem the brain drain', 'The phenomenon of brain drain'],
    notes: 'Vocabulaire clé des thématiques d\'immigration, de mondialisation et d\'économie.'
  },
  {
    id: 'en-soc-4',
    word: 'Discrepancy / Disparity',
    phonetics: '/dɪˈskrep.ən.si/ , /dɪˈspær.ə.ti/',
    partOfSpeech: 'noun',
    level: 'C1',
    frenchMeaning: 'Divergence / Écart / Disparité / Inégalité',
    category: 'society_issues',
    exampleSentence: 'There remains a striking disparity between executive compensation and the average worker\'s salary.',
    frenchTranslation: 'Il subsiste une disparité frappante entre la rémunération des dirigeants et le salaire moyen des travailleurs.',
    collocations: ['Income disparity', 'A glaring discrepancy in the data'],
    notes: 'Permet de qualifier avec précision des inégalités ou des incohérences de données.'
  },
  {
    id: 'en-soc-5',
    word: 'Whistleblower',
    phonetics: '/ˈwɪs.əlˌbləʊ.ər/',
    partOfSpeech: 'noun',
    level: 'B2',
    frenchMeaning: 'Lanceur d\'alerte',
    category: 'society_issues',
    exampleSentence: 'The brave whistleblower exposed clandestine surveillance operations conducted by the intelligence agency.',
    frenchTranslation: 'Le courageux lanceur d\'alerte a révélé des opérations de surveillance clandestine menées par l\'agence de renseignement.',
    collocations: ['Whistleblower protection laws', 'To act as a whistleblower'],
    notes: 'Exemples historiques : Edward Snowden, Chelsea Manning, Daniel Ellsberg.'
  },

  // --- 6. ANALYSE LITTÉRAIRE & RHÉTORIQUE (LLCER & TRONC COMMUN) ---
  {
    id: 'en-lit-1',
    word: 'Foreshadowing',
    phonetics: '/fɔːˈʃæd.əʊ.ɪŋ/',
    partOfSpeech: 'noun',
    level: 'B2',
    frenchMeaning: 'L\'annonce prémonitoire / Le présage narratif',
    category: 'literary_analysis',
    exampleSentence: 'The ominous thunderstorm in chapter one serves as foreshadowing of the protagonist\'s tragic demise.',
    frenchTranslation: 'Le menaçant orage du premier chapitre sert de présage à la fin tragique du protagoniste.',
    collocations: ['Subtle foreshadowing', 'To foreshadow an upcoming event'],
    notes: 'Procédé stylistique par lequel un indice annonce discrètement la suite du récit.'
  },
  {
    id: 'en-lit-2',
    word: 'Juxtaposition',
    phonetics: '/ˌdʒʌk.stə.pəˈzɪʃ.ən/',
    partOfSpeech: 'noun',
    level: 'B2',
    frenchMeaning: 'Juxtaposition / Mise en contraste frappante',
    category: 'literary_analysis',
    exampleSentence: 'The juxtaposition of opulent wealth and crippling poverty underscores the novel\'s moral critique.',
    frenchTranslation: 'La juxtaposition d\'une richesse opulente et d\'une pauvreté écrasante souligne la critique morale du roman.',
    collocations: ['A stark juxtaposition', 'To juxtapose two contrasting scenes'],
    notes: 'Pour désigner la mise côte à côte de deux éléments opposés pour créer un impact.'
  },
  {
    id: 'en-lit-3',
    word: 'Omniscient narrator',
    phonetics: '/ɒmˈnɪs.i.ənt nəˈreɪ.tər/',
    partOfSpeech: 'noun',
    level: 'B2',
    frenchMeaning: 'Narrateur omniscient (point de vue à la 3e personne connaissant tout)',
    category: 'literary_analysis',
    exampleSentence: 'Through an omniscient narrator, the reader gains privileged access to the innermost thoughts of every character.',
    frenchTranslation: 'Grâce à un narrateur omniscient, le lecteur obtient un accès privilégié aux pensées les plus intimes de chaque personnage.',
    collocations: ['Third-person omniscient perspective', 'An omniscient point of view'],
    notes: 'À distinguer du narrateur à la première personne (first-person narrator).'
  },
  {
    id: 'en-lit-4',
    word: 'Irony (Dramatic / Verbal)',
    phonetics: '/ˈaɪ.rə.ni/',
    partOfSpeech: 'noun',
    level: 'B1',
    frenchMeaning: 'Ironie (dramatique ou verbale)',
    category: 'literary_analysis',
    exampleSentence: 'Dramatic irony occurs when the audience knows Romeo believes Juliet is dead, while she is only asleep.',
    frenchTranslation: 'L\'ironie dramatique se produit lorsque le public sait que Roméo croit Juliette morte, alors qu\'elle est seulement endormie.',
    collocations: ['Dramatic irony', 'Biting verbal irony', 'The tragic irony of fate'],
    notes: 'Ironie verbale = dire le contraire de ce qu\'on pense. Ironie dramatique = le public en sait plus que les personnages.'
  }
];

export const ENGLISH_STUDY_NOTES: EnglishStudyNoteSection[] = [
  {
    id: 'en-note-1',
    title: '1. Master the English Tenses: Present Perfect vs Simple Past',
    badge: 'Conjugaison Fondamentale',
    readTimeMinutes: 6,
    summary: 'La distinction fondamentale entre une action coupée du présent (Prétérit) et une action ayant un lien/bilan avec le présent (Present Perfect).',
    keyTakeaways: [
      'Simple Past (Prétérit) = Événement daté, terminé, SANS lien direct avec le présent (yesterday, in 1998, two days ago).',
      'Present Perfect (Have + participe passé) = Action passée ayant un IMPACT, un RÉSULTAT ou un BILAN dans le présent.',
      'Depuis = "FOR" (durée chiffrée, ex: for 5 years) vs "SINCE" (point de départ précis, ex: since 2018).'
    ],
    contentMarkdown: `### 📌 La Règle d'Or de la Grammaire Anglaise

La langue anglaise accorde une importance primordiale à l'**aspect du verbe** : l'action est-elle terminée et coupée du présent, ou a-t-elle des répercussions directes sur la situation actuelle ?

---

#### 1. Le Simple Past (Prétérit Révolu)
* **Quand l'employer ?** Dès que l'action est localisée dans un passé révolu, souvent accompagnée d'un repère temporel précis.
* **Mots déclencheurs :** *yesterday, last week, in 1945, ago (two years ago), when I was young, then*.
* **Exemple clé :**  
  > *"Shakespeare wrote Hamlet in 1601."*  
  *(Shakespeare est mort, l'action est datée et définitivement clôturée).*

---

#### 2. Le Present Perfect Simple (have/has + Participe Passé)
* **Quand l'employer ?**
  1. **L'expérience / Le Bilan de vie :** L'action s'est produite à un moment non précisé, mais son souvenir ou sa trace existe encore.  
     > *"I have visited London three times in my life."* (Et je peux y retourner).
  2. **Le résultat présent d'une action récente :**  
     > *"I have lost my keys."* (= Conséquence actuelle : je ne peux pas entrer chez moi maintenant).
  3. **L'action commencée dans le passé et qui se poursuit maintenant :**  
     > *"She has lived in Dublin for ten years."* (= Elle y habite toujours aujourd'hui !).
* **Mots déclencheurs :** *already, yet, just, ever, never, so far, recently, for, since*.

---

#### 3. Tableau Comparatif FOR vs SINCE

| Préposition | Signification | Règle d'emploi | Exemple |
| :--- | :--- | :--- | :--- |
| **FOR** | Pendant / Depuis | Suivi d'une **DURÉE / QUANTITÉ de temps** | *I have studied English **for six years**.* |
| **SINCE** | Depuis | Suivi d'un **POINT DE DÉPART précis** (date, heure, événement) | *She has worked here **since 2019** / **since she graduated**.* |

> ⚠️ **Piège classique :** En français on dit *"J'habite ici depuis 3 ans"* (verbe au présent). En anglais, l'obligation grammaticale impose le **Present Perfect** : *"I have lived here for 3 years"* (et JAMAIS *"I live here since 3 years"* qui est faux !).`
  },
  {
    id: 'en-note-2',
    title: '2. Conditionals & Hypotheses: From Realities to Regrets',
    badge: 'Structures & Hypothèses',
    readTimeMinutes: 7,
    summary: 'Les 4 types de conditionnels (0, 1, 2, 3) et les structures de regret avec WISH et IF ONLY.',
    keyTakeaways: [
      'Conditionnel 1 (Probable) : If + Present Simple, WILL + Base Verbale.',
      'Conditionnel 2 (Imaginaire présent) : If + Past Simple, WOULD + Base Verbale.',
      'Conditionnel 3 (Regret passé) : If + Past Perfect (had + PP), WOULD HAVE + Participe Passé.',
      'WISH + Past pour un souhait actuel irréalisé ; WISH + Past Perfect pour un regret passé.'
    ],
    contentMarkdown: `### 🎯 Les 4 Piliers du Conditionnel Anglais

Le système hypothétique anglais est d'une rigueur mathématique : le recul dans le temps du verbe dans la subordonnée (en *If*) entraîne systématiquement le recul du modal dans la principale.

---

#### 1. Zero Conditional (Vérités Générales & Lois Scientifiques)
* **Structure :** \`If + Present Simple, Present Simple\`
* **Exemple :** *"If you heat water to 100°C, it boils."* (Si vous chauffez l'eau à 100°C, elle bout).

---

#### 2. First Conditional (Hypothèse Réelle & Probable dans le Futur)
* **Structure :** \`If + Present Simple, WILL + Base Verbale\`
* **Exemple :** *"If it rains tomorrow, we will stay at home."*
* ⚠️ **Attention :** Pas de *will* dans la proposition en *If* !

---

#### 3. Second Conditional (Hypothèse Imaginaire / Irréel du Présent)
* **Structure :** \`If + Past Simple (were), WOULD + Base Verbale\`
* **Exemple :** *"If I were the President, I would invest heavily in public schools."*
* 💡 **Astuce de style :** À l'écrit soutenu, on utilise *"If I were"* pour toutes les personnes (y compris he/she/it).

---

#### 4. Third Conditional (Regret d'un Passé Non-Réalisé / Irréel du Passé)
* **Structure :** \`If + Past Perfect (had + PP), WOULD HAVE + Participe Passé\`
* **Exemple :** *"If they had warned us in advance, we would not have made this grave mistake."*  
  *(S'ils nous avaient prévenus à l'avance, nous n'aurions pas commis cette grave erreur).*

---

#### 5. Exprimer le Regret : WISH & IF ONLY
* **Souhait présent (ce qui n'est pas) :** \`Subject + wish + Past Simple\`  
  > *"I wish I spoke fluent Japanese."* (J'aimerais parler japonais couramment).
* **Regret passé (ce qui a eu lieu) :** \`Subject + wish + Past Perfect\`  
  > *"I wish I had accepted that job offer."* (Je regrette de ne pas avoir accepté cette offre).`
  },
  {
    id: 'en-note-3',
    title: '3. Advanced Stylistic Inversion & Negative Adverbials',
    badge: 'Style Soutenu & Concours',
    readTimeMinutes: 5,
    summary: 'Comment manier l\'inversion stylistique avec des adverbes négatifs pour obtenir une note d\'excellence en expression écrite.',
    keyTakeaways: [
      'Inversion = Adverbe restrictif en tête de phrase + Auxiliaire + Sujet + Verbe.',
      'Adverbes majeurs : Seldom, Rarely, Never, Not only... but also, Scarcely, Under no circumstances.',
      'Produit un effet dramatique et une éloquence académique immédiate.'
    ],
    contentMarkdown: `### 🌟 L'Inversion Stylistique : La Marque du Niveau C1

Placer un adverbe à valeur négative ou restrictive au tout début d'une phrase permet d'attirer l'attention du lecteur. Cette structure impose une **inversion du sujet et de l'auxiliaire** (comme pour une question), bien que la phrase reste affirmative !

---

#### La Formule Fondamentale :
$$\\text{Adverbe Négatif} + \\text{Auxiliaire (did/have/is/can)} + \\text{Sujet} + \\text{Verbe Principal}$$

---

#### Les Exemples Incontournables à Réutiliser en Dissertation :

1. **SELDOM / RARELY (Rarement) :**
   * Phrase standard : *"Society has rarely witnessed such rapid changes."*
   * **Avec Inversion :**  
     > *"**Rarely has society witnessed** such rapid technological upheavals."*

2. **NOT ONLY... BUT ALSO (Non seulement... mais aussi) :**
   * **Avec Inversion :**  
     > *"**Not only did the government conceal** the environmental data, **but it also silenced** the whistleblowers."*  
     *(Non seulement le gouvernement a dissimulé les données environnementales, mais il a aussi fait taire les lanceurs d'alerte).*

3. **UNDER NO CIRCUMSTANCES (En aucun cas / Sous aucun prétexte) :**
   * **Avec Inversion :**  
     > *"**Under no circumstances should democratic rights be compromised**."*

4. **HARDLY / SCARCELY... WHEN (À peine... que) :**
   * **Avec Inversion :**  
     > *"**Hardly had the treaty been signed when** fresh hostilities erupted along the border."*`
  },
  {
    id: 'en-note-4',
    title: '4. Essay Writing Masterclass: The P.E.E.L Paragraph Method',
    badge: 'Méthodologie Écrit & Bac',
    readTimeMinutes: 8,
    summary: 'La méthode P.E.E.L (Point, Evidence, Explanation, Link) pour construire des paragraphes de dissertation impeccables et convaincants.',
    keyTakeaways: [
      'P = Point : Annoncer l\'idée directrice du paragraphe dès la première phrase.',
      'E = Evidence : Citer un fait précis, une statistique ou une citation du texte.',
      'E = Explanation : Analyser en quoi cette preuve valide votre thèse.',
      'L = Link : Relier le paragraphe à la problématique générale ou introduire la transition.'
    ],
    contentMarkdown: `### ✍️ La Structure Parfaite d'une Argumentation en Anglais

Dans le système académique anglo-saxon (TOEFL, Cambridge, Baccalauréat, Prépas), les paragraphes vagues sont sanctionnés. La méthode **P.E.E.L** garantit que chaque paragraphe est un bloc de persuasion solide.

---

#### Décomposition du Paragraphe P.E.E.L :

\`\`\`
[P] POINT         -> Première phrase d'accroche énonçant l'argument clair.
[E] EVIDENCE      -> Donnée factuelle, citation textuelle ou exemple historique.
[E] EXPLANATION   -> Démonstration critique : "Why does this matter?".
[L] LINK          -> Synthèse et connexion vers le grand thème du devoir.
\`\`\`

---

#### Exemple Concret Rédigé sur le Thème de l'Intelligence Artificielle :

> **[Point]** First and foremost, the rapid proliferation of artificial intelligence presents an existential threat to intellectual property rights.  
> **[Evidence]** For instance, numerous contemporary authors and digital artists have discovered that their copyrighted creative works were harvested without consent to train large language models.  
> **[Explanation]** This unauthorized appropriation not only undermines the financial livelihoods of creators, but it also blurs the legal boundaries between machine-generated synthesis and genuine human artistic innovation.  
> **[Link]** Consequently, establishing a stringent international regulatory framework is paramount to safeguarding human creativity in the digital era.

---

#### Boîte à Outils de Connecteurs pour Structurer l'Essai :
* **Pour introduire :** *It is widely acknowledged that... / This essay seeks to examine whether...*
* **Pour ajouter :** *Furthermore... / Moreover... / In addition to this...*
* **Pour contraster :** *Conversely... / In stark contrast to... / Although one might argue that...*
* **Pour conclure :** *All in all... / To sum up... / Taking all these elements into account, it becomes manifest that...*`
  }
];

export const ENGLISH_EXERCISES_DATABASE: EnglishExercise[] = [
  // Tenses
  {
    id: 'en-ex-1',
    category: 'tenses',
    title: 'Present Perfect vs Simple Past (1/3)',
    instruction: 'Complétez la phrase en choisissant la forme verbale adéquate :',
    sentence: 'Thomas Edison [___] the incandescent light bulb in 1879.',
    options: ['invented', 'has invented', 'was inventing', 'had invented'],
    correctAnswer: 'invented',
    explanation: 'L\'année "in 1879" est un repère temporel passé précis et révolu : le Simple Past (Prétérit) est obligatoire.'
  },
  {
    id: 'en-ex-2',
    category: 'tenses',
    title: 'Present Perfect vs Simple Past (2/3)',
    instruction: 'Identifiez le bon temps pour une action passée dont le résultat est visible maintenant :',
    sentence: 'Be careful! Someone [___] coffee on the keyboard and it is still wet.',
    options: ['has spilled', 'spilled', 'is spilling', 'spill'],
    correctAnswer: 'has spilled',
    explanation: 'Le café est encore mouillé (résultat présent d\'une action récente) : on utilise le Present Perfect (has spilled).'
  },
  {
    id: 'en-ex-3',
    category: 'tenses',
    title: 'FOR vs SINCE (3/3)',
    instruction: 'Choisissez la préposition temporelle appropriée :',
    sentence: 'Professor Watson has been lecturing at Oxford University [___] more than two decades.',
    options: ['for', 'since', 'during', 'from'],
    correctAnswer: 'for',
    explanation: '"More than two decades" est une durée chiffrée, donc on utilise FOR (alors que SINCE s\'emploie devant un point de départ précis comme "since 2004").'
  },

  // False Friends
  {
    id: 'en-ex-4',
    category: 'false_friends',
    title: 'Faux-Amis Incontournables (1/2)',
    instruction: 'Quel mot correspond au sens français "en réalité / en fait" ?',
    sentence: 'I thought the meeting was canceled, but [___] it is still taking place at 3 PM.',
    options: ['actually', 'currently', 'presently', 'eventually'],
    correctAnswer: 'actually',
    explanation: 'Actually signifie "en réalité / en fait". "Currently" signifie "actuellement".'
  },
  {
    id: 'en-ex-5',
    category: 'false_friends',
    title: 'Faux-Amis Incontournables (2/2)',
    instruction: 'Complétez pour exprimer "après beaucoup d\'efforts, ils ont fini par réussir" :',
    sentence: 'After endless hours of arduous negotiation, the diplomats [___] reached a peace agreement.',
    options: ['eventually', 'possibly', 'actually', 'conveniently'],
    correctAnswer: 'eventually',
    explanation: 'Eventually signifie "finalement / au bout du compte". Pour dire "éventuellement", on emploie "possibly".'
  },

  // Stylistic Inversion
  {
    id: 'en-ex-6',
    category: 'inversion',
    title: 'Inversion Stylistique Avancée (1/2)',
    instruction: 'Choisissez la formulation correcte respectant l\'inversion après un adverbe négatif :',
    sentence: 'Seldom [___] such a breathtaking performance on Broadway.',
    options: ['have I witnessed', 'I have witnessed', 'I witnessed', 'did I witnessed'],
    correctAnswer: 'have I witnessed',
    explanation: 'Après "Seldom" en tête de phrase, la structure impose : Auxiliaire + Sujet + Participe Passé -> "have I witnessed".'
  },
  {
    id: 'en-ex-7',
    category: 'inversion',
    title: 'Inversion Stylistique Avancée (2/2)',
    instruction: 'Complétez avec la bonne inversion après "Not only" :',
    sentence: 'Not only [___] the scholarship, but she also won first prize in the national debate.',
    options: ['did she receive', 'she received', 'she did receive', 'received she'],
    correctAnswer: 'did she receive',
    explanation: 'Après "Not only", au passé, on utilise l\'auxiliaire DID + Sujet + Base Verbale -> "did she receive".'
  },

  // Conditionals
  {
    id: 'en-ex-8',
    category: 'conditionals',
    title: 'Conditionnel & Regret Passé (Third Conditional)',
    instruction: 'Complétez l\'irréel du passé :',
    sentence: 'If you [___] me yesterday, I would have sent you the lecture notes.',
    options: ['had asked', 'asked', 'would ask', 'have asked'],
    correctAnswer: 'had asked',
    explanation: 'Third Conditional : If + Past Perfect (had asked) -> would have + Participe Passé (would have sent).'
  }
];
