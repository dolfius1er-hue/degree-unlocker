import React, { useState, useMemo } from 'react';
import { AppLanguage, AppTheme } from '../types';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  X, 
  ChevronRight, 
  ChevronDown,
  FileText, 
  Layers, 
  PenTool, 
  Zap, 
  RotateCcw, 
  Copy, 
  Check, 
  Award, 
  Globe, 
  ShieldCheck, 
  Volume2, 
  Table, 
  Quote, 
  Lightbulb, 
  Bookmark, 
  ArrowRight,
  ExternalLink,
  BookMarked
} from 'lucide-react';

export type NotionSubjectKey = 'espagnol' | 'allemand' | 'francais' | 'philosophie';

interface NotionSubjectWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubject?: NotionSubjectKey;
  lang?: AppLanguage;
  activeTheme?: AppTheme;
  onOpenInBlocknote?: (title: string, subject: string, content: string) => void;
  onNavigateTab?: (tab: any) => void;
}

interface NotionSubPageItem {
  id: string;
  category: 'lesson' | 'exercise' | 'rule' | 'verb' | 'quote' | 'quiz' | 'method';
  categoryLabel: string;
  categoryIcon: string;
  title: string;
  subtitle: string;
  levelBadge: string;
  contentMarkdown: string;
  interactiveExercise?: {
    instruction: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    antiCheatClue: string;
  };
  keyTakeaways: string[];
  tableData?: { headers: string[]; rows: string[][] };
}

export const NOTION_SUBJECTS_METADATA: Record<NotionSubjectKey, {
  name: string;
  flagEmoji: string;
  coverGradient: string;
  accentColor: string;
  description: string;
  subPages: NotionSubPageItem[];
}> = {
  espagnol: {
    name: 'Espagnol (5e → Terminale)',
    flagEmoji: '🇪🇸',
    coverGradient: 'from-amber-600 via-orange-600 to-rose-700',
    accentColor: 'amber',
    description: 'Cahier Notion d\'Espagnol complet : Grammaire (Ser/Estar, Por/Para, Subjonctif), 60+ Verbes irréguliers, Exercices d\'entraînement et Textes.',
    subPages: [
      {
        id: 'es-p1',
        category: 'rule',
        categoryLabel: 'Règle Grammaticale',
        categoryIcon: '📏',
        title: 'SER vs ESTAR : La règle définitive',
        subtitle: 'Essence permanente vs état résultant ou circonstance',
        levelBadge: 'Collège & Lycée',
        contentMarkdown: `### 1. Le Verbe SER (Essence & Identité)
Le verbe **SER** exprime ce qui définit le sujet dans sa nature profonde :
- **Identité & Origine** : *Soy francés* (Je suis français), *Es Madrid* (C'est Madrid).
- **Caractéristiques permanentes** : *La mesa es de madera* (La table est en bois).
- **Date, heure et prix unitaire** : *Hoy es lunes* (Aujourd'hui c'est lundi).
- **Lieu d'un événement** : *El concierto es en el estadio* (Le concert a lieu au stade).

### 2. Le Verbe ESTAR (État passager & Localisation)
Le verbe **ESTAR** décrit l'état d'un sujet ou sa situation dans l'espace :
- **Localisation d'un lieu physique** : *París está en Francia* (Paris est en France).
- **État d'esprit ou état physique temporaire** : *Estoy muy cansado hoy* (Je suis très fatigué aujourd'hui).
- **Action en cours (Estar + Gérondif)** : *Estamos estudiando* (Nous sommes en train d'étudier).

### 3. Changement de sens selon le verbe
- *Ser listo* = Être intelligent (qualité).
- *Estar listo* = Être prêt (état).
- *Ser bueno* = Être bon/gentil.
- *Estar bueno* = Être bon au goût (aliment) ou en bonne santé.`,
        keyTakeaways: [
          'SER = Identité, matière, heure, origine, lieu d\'un événement.',
          'ESTAR = Localisation géographique, état temporaire, fatigue, santé.',
          'Attention aux faux amis et changements de sens (listo, rico, bueno).'
        ],
        interactiveExercise: {
          instruction: 'Choisissez le verbe approprié au présent de l\'indicatif :',
          question: 'Mi hermano [___] médico y hoy [___] de guardia en el hospital.',
          options: ['es / está', 'está / es', 'es / es', 'está / está'],
          correctIndex: 0,
          explanation: 'La profession est considérée comme une caractéristique d\'identité (SER -> es). Être de garde est une circonstance temporaire (ESTAR -> está).',
          antiCheatClue: 'Pensez : métier = identité sociale (SER) ; planning du jour = état temporaire (ESTAR).'
        }
      },
      {
        id: 'es-p2',
        category: 'exercise',
        categoryLabel: 'Exercice Interactif',
        categoryIcon: '✍️',
        title: 'POR vs PARA : Maîtriser le but et la cause',
        subtitle: 'Distinction clé pour les épreuves du Bac et examens',
        levelBadge: 'Niveau B1/B2',
        contentMarkdown: `### Règle synthétique :
- **PARA** = BUT, DESTINATION, ÉCHÉANCE TEMPORELLE (*afin de, pour qui, pour quand*).
  * *Estudio para aprobar el examen.* (J'étudie pour réussir l'examen -> But)
  * *Este regalo es para ti.* (Ce cadeau est pour toi -> Destinataire)
- **POR** = CAUSE, MOTIF, MOYEN, ÉCHANGE, LIEU DE PASSAGE (*à cause de, par, en échange de*).
  * *Llegó tarde por la lluvia.* (Il est arrivé en retard à cause de la pluie -> Cause)
  * *Viajamos por España.* (Nous voyageons à travers l'Espagne -> Lieu de passage)`,
        keyTakeaways: [
          'PARA regarde vers l\'avant (le futur, l\'objectif, le destinataire).',
          'POR regarde vers l\'arrière (la cause, le motif, ce qui provoque l\'action).'
        ],
        interactiveExercise: {
          instruction: 'Complétez la phrase avec la bonne préposition :',
          question: 'Gracias [___] tu ayuda. Mañana salgo [___] Sevilla.',
          options: ['por / para', 'para / por', 'por / por', 'para / para'],
          correctIndex: 0,
          explanation: 'On remercie POUR une cause passée (gracias por). On part VERS une destination (salir para).',
          antiCheatClue: 'Remerciement = cause (POR) ; destination géographique du voyage = objectif (PARA).'
        }
      },
      {
        id: 'es-p3',
        category: 'verb',
        categoryLabel: 'Tableau de Verbes',
        categoryIcon: '🔄',
        title: 'Les 10 Verbes les plus irréguliers et à diphtongue',
        subtitle: 'Tableau mémo-technique des verbes indispensables',
        levelBadge: 'Tous Niveaux',
        contentMarkdown: `### Particularités majeures :
1. **Diphtongue** : Le *e* devient *ie* (*querer -> quiero*), le *o* devient *ue* (*poder -> puedo*). Attention : NOUS (*nosotros*) et VOUS (*vosotros*) ne diphtonguent JAMAIS !
2. **Affaiblissement** : Le *e* devient *i* (*pedir -> pido, pides, pide, pedimos, pedís, piden*).
3. **Irréguliers à la 1ère personne** : *Hacer (hago), Poner (pongo), Salir (salgo), Tener (tengo), Venir (vengo)*.`,
        keyTakeaways: [
          'Nosotros et Vosotros conservent le radical régulier.',
          'Le passé simple espagnol (indefinido) a des radicaux forts : tuv-, pud-, sup-, quis-, dij-.'
        ],
        tableData: {
          headers: ['Infinitif', 'Présent (Yo)', 'Passé Simple (Yo)', 'Subjonctif (Yo)', 'Sens'],
          rows: [
            ['Hacer', 'hago', 'hice', 'haga', 'Faire'],
            ['Tener', 'tengo', 'tuve', 'tenga', 'Avoir / Posséder'],
            ['Poder', 'puedo', 'pude', 'pueda', 'Pouvoir'],
            ['Decir', 'digo', 'dije', 'diga', 'Dire'],
            ['Ir', 'voy', 'fui', 'vaya', 'Aller'],
            ['Saber', 'sé', 'supe', 'sepa', 'Savoir']
          ]
        }
      }
    ]
  },
  allemand: {
    name: 'Allemand (5e → Terminale)',
    flagEmoji: '🇩🇪',
    coverGradient: 'from-yellow-600 via-amber-700 to-slate-900',
    accentColor: 'yellow',
    description: 'Cahier Notion d\'Allemand complet : Déclinaisons (Nominatif, Accusatif, Datif, Génitif), Verbes modaux, Place du verbe, Parfait et Prétérit.',
    subPages: [
      {
        id: 'de-p1',
        category: 'rule',
        categoryLabel: 'Règle Grammaticale',
        categoryIcon: '📏',
        title: 'Les 4 Cas Allemands & Déclinaison de l\'article défini',
        subtitle: 'Nominatif, Accusatif, Datif, Génitif expliqués simplement',
        levelBadge: 'Collège & Lycée',
        contentMarkdown: `### 1. Tableau mnémotechnique (RESE NESE MRMN SESE)
- **Nominatif (Sujet)** : *der* (Masc), *die* (Fém), *das* (Neutre), *die* (Pluriel).
- **Accusatif (COD / Déplacement)** : Seul le masculin change en ***den*** ! Les autres restent *die, das, die*.
- **Datif (COI / Position sans mouvement)** : ***dem*** (Masc), ***der*** (Fém), ***dem*** (Neutre), ***den + n*** (Pluriel).
- **Génitif (Complément du nom / Possession)** : ***des + s*** (Masc/Neutre), ***der*** (Fém/Pluriel).

### 2. Prépositions suivies du Datif obligatoire (Mnemonic : AUS BEI MIT NACH SEIT VON ZU)
Ces 7 prépositions exigent TOUJOURS le Datif sans exception !`,
        keyTakeaways: [
          'Accusatif = Seulement le masculin devient DEN (einen).',
          'Datif = M, F, N, Pl deviennent DEM, DER, DEM, DEN + n.',
          'Aus, bei, mit, nach, seit, von, zu prennent TOUJOURS le Datif.'
        ],
        interactiveExercise: {
          instruction: 'Choisissez l\'article correct après la préposition "mit" (Datif obligatoire) :',
          question: 'Ich fahre mit [___] (der Zug -> Masc) nach Berlin.',
          options: ['dem Zug', 'den Zug', 'der Zug', 'des Zuges'],
          correctIndex: 0,
          explanation: '"mit" exige le Datif. L\'article défini masculin "der" devient "dem" au Datif.',
          antiCheatClue: 'Rappel : "mit" fait partie de la liste magique du Datif (Aus bei mit nach seit von zu).'
        },
        tableData: {
          headers: ['Cas', 'Masculin', 'Féminin', 'Neutre', 'Pluriel'],
          rows: [
            ['Nominatif', 'der / ein', 'die / eine', 'das / ein', 'die / -'],
            ['Accusatif', 'den / einen', 'die / eine', 'das / ein', 'die / -'],
            ['Datif', 'dem / einem', 'der / einer', 'dem / einem', 'den / -n'],
            ['Génitif', 'des (-s) / eines', 'der / einer', 'des (-s) / eines', 'der / -']
          ]
        }
      },
      {
        id: 'de-p2',
        category: 'exercise',
        categoryLabel: 'Exercice Interactif',
        categoryIcon: '✍️',
        title: 'La Place du Verbe dans la Subordonnée (weil, dass, wenn, ob)',
        subtitle: 'Règle du verbe conjugué rejeté à la toute fin de la proposition',
        levelBadge: 'Niveau A2/B1/B2',
        contentMarkdown: `### Règle d'or de la syntaxe allemande :
Dans une proposition subordonnée introduite par une conjonction de subordination (**weil**, **dass**, **wenn**, **ob**, **obwohl**, **als**), **le verbe conjugué est toujours placé en TOUTE FIN de proposition**.

Exemple :
- Phrase principale : *Er kommt heute nicht.* (Il ne vient pas aujourd'hui.)
- Subordonnée : *Ich weiß, dass er heute nicht **kommt**.* (Je sais qu'il ne vient pas aujourd'hui.)
- Avec un verbe modal : *...weil er das Buch **lesen muss**.* (l'auxiliaire modal conjugué va tout à la fin !)`,
        keyTakeaways: [
          'Weil, dass, wenn, obwohl, ob rejettent le verbe conjugué à la fin.',
          'Dans une subordonnée avec verbe composé, l\'auxiliaire conjugué est le dernier mot.'
        ],
        interactiveExercise: {
          instruction: 'Reconstituez la subordonnée correcte introduite par "weil" :',
          question: 'Er bleibt zu Hause, weil er krank [___].',
          options: ['ist', 'hat', 'sein', 'wird'],
          correctIndex: 0,
          explanation: 'Le verbe conjugué "ist" se place tout à la fin après la conjonction "weil".',
          antiCheatClue: 'Le sujet "er" demande la 3e personne du verbe sein à l\'indicatif présent : "ist".'
        }
      }
    ]
  },
  francais: {
    name: 'Français (Classe de Seconde)',
    flagEmoji: '🇫🇷',
    coverGradient: 'from-blue-700 via-indigo-800 to-slate-950',
    accentColor: 'indigo',
    description: 'Cahier Notion de Français Seconde : Poésie du Moyen Âge au XVIIIe (Ronsard, Carpe Diem), Théâtre du XVIIe (Molière), Roman et récit réaliste, Méthode du commentaire linéaire et de la dissertation.',
    subPages: [
      {
        id: 'fr-p1',
        category: 'lesson',
        categoryLabel: 'Cours & Méthode',
        categoryIcon: '📖',
        title: 'La Poésie : Ronsard, La Pléiade & le Carpe Diem',
        subtitle: 'Analyse méthodique du sonnet et des figures de style',
        levelBadge: 'Programme Officiel 2nde',
        contentMarkdown: `### 1. Le contexte de la Pléiade (XVIe siècle)
Pierre de Ronsard et Joachim du Bellay fondent le groupe de la Pléiade (1549, *Défense et Illustration de la langue française*). Leurs objectifs :
- Défendre et enrichir la langue française en empruntant aux chefs-d'œuvre gréco-latins.
- Importer la forme noble du **sonnet pétrarquiste** (deux quatrains, deux tercets, vers décasyllabiques ou alexandrins).
- Réactiver les grands topos poétiques antiques : le **Carpe Diem** (Horace), la fuite du temps (*Tempus fugit*), la vanité des grandeurs humaines.

### 2. Procédés d'analyse linéaire indispensables
- **Métaphore filée** : Comparaison prolongée sans outil de comparaison (la jeune fille comparée à la rose éphémère).
- **Allégorie** : Représentation concrète d'une idée abstraite (Chronos ou la Parque représentant la Mort).
- **Rythme et versification** : Césure à l'hémistiche (6 // 6 pour l'alexandrin), diérèse, enjambements, rejets et contre-rejets.`,
        keyTakeaways: [
          'Le sonnet se compose de 14 vers : 2 quatrains (ABBA ABBA) et 2 tercets (CCD EED ou CCD EDE).',
          'Toujours structurer son analyse linéaire en 2 ou 3 mouvements logiques de lecture.'
        ],
        interactiveExercise: {
          instruction: 'Dans le vers de Ronsard "Cueillez, cueillez vostre jeunesse", quel est le procédé rhétorique et sa portée ?',
          question: 'Identifiez la figure de style dominante et son effet :',
          options: [
            'Répétition à l\'impératif (épanalepse) créant une exhortation pressante (Carpe Diem)',
            'Oxymore alliant deux termes contraires',
            'Litote suggérant le moins pour dire le plus',
            'Chiasme croisé en structure ABBA'
          ],
          correctIndex: 0,
          explanation: 'La répétition de l\'impératif "Cueillez, cueillez" insiste avec urgence sur la brièveté de la vie et invite Cassandre à céder à l\'amour sans tarder.',
          antiCheatClue: 'Observez la forme verbale répétée à l\'impératif pour pousser le destinataire à l\'action immédiate.'
        }
      },
      {
        id: 'fr-p2',
        category: 'method',
        categoryLabel: 'Fiche Méthode',
        categoryIcon: '📝',
        title: 'La Méthodologie du Commentaire Composé & de la Dissertation',
        subtitle: 'Les étapes pas-à-pas pour réussir au lycée',
        levelBadge: 'Méthodologie Lycée',
        contentMarkdown: `### 1. Structure canonique de l'Introduction (4 étapes obligatoires) :
1. **Accroche (Amorce)** : Éléments de contexte historique ou littéraire pertinent (jamais de formule creuse comme "De tout temps...").
2. **Présentation du texte ou de l'auteur** : Titre, date, registre, genre et situation dans l'œuvre.
3. **Problématique** : Question directrice qui interroge les enjeux et paradoxes du texte.
4. **Annonce du plan** : Annonce fluide des 2 ou 3 grands axes d'analyse (sans écrire "Dans une première partie...").

### 2. Règle d'or du paragraphe analytique (A.C.I.) :
- **A**ffirmation : L'idée directrice du sous-axe.
- **C**itation : La citation exacte du texte entre guillemets.
- **I**nterprétation : L'analyse stylistique précise (procédé formel + effet produit sur le lecteur).`,
        keyTakeaways: [
          'Toujours nommer le procédé technique (métaphore, anaphore, rejet) ET son sens.',
          'Une transition soignée est obligatoire entre chaque grande partie.'
        ]
      }
    ]
  },
  philosophie: {
    name: 'Philosophie (Classe de Terminale)',
    flagEmoji: '🏛️',
    coverGradient: 'from-purple-800 via-indigo-900 to-slate-950',
    accentColor: 'purple',
    description: 'Cahier Notion de Philosophie Terminale : Notions clés du programme (La Conscience, L\'Inconscient, La Liberté, Le Devoir, La Justice, La Vérité), Méthode de la dissertation et repères conceptuels.',
    subPages: [
      {
        id: 'ph-p1',
        category: 'lesson',
        categoryLabel: 'Cours Magistral',
        categoryIcon: '🧠',
        title: 'La Conscience et L\'Inconscient : Descartes, Freud et Sartre',
        subtitle: 'Du "Cogito ergo sum" aux théories de la psychanalyse et de la mauvaise foi',
        levelBadge: 'Programme Officiel Terminale',
        contentMarkdown: `### 1. Descartes et le Sujet Transparent à Lui-Même (*Méditations Métaphysiques*, 1641)
Par l'expérience du doute méthodique radical, Descartes découvre la première vérité indubitable :
> *"Cogito, ergo sum"* (Je pense, donc je suis).
Pour Descartes, la conscience de soi est immédiate, transparente et infaillible. L'âme est une "substance pensante" (*res cogitans*).

### 2. Freud et l'Inconscient Psychique : La Troisième Blessure Narcissique
Sigmund Freud (*Introduction à la psychanalyse*) démontre que le psychisme humain ne se réduit pas à la conscience :
> *"Le Moi n'est pas maître dans sa propre maison."*
La 2e topique freudienne divise l'esprit en trois instances :
- **Le Ça** : Pulsions primitives inconscientes régies par le principe de plaisir.
- **Le Surmoi** : Intériorisation des interdits parentaux et sociaux (censure morale).
- **Le Moi** : Instance consciente qui arbitre entre les exigences du Ça, du Surmoi et de la réalité.

### 3. Sartre et le Refus de l'Inconscient (*L'Être et le Néant*, 1943)
Pour Jean-Paul Sartre, l'inconscient freudien est une illusion qui sert d'excuse pour fuir notre responsabilité : c'est la **mauvaise foi**. L'Homme est condamné à être libre et pleinement responsable de tous ses choix.`,
        keyTakeaways: [
          'Descartes : La conscience est certitude première et transparence.',
          'Freud : L\'inconscient détermine nos actes manqués, rêves et symptômes.',
          'Sartre : L\'Homme n\'a pas d\'excuse, il est liberté absolue.'
        ],
        interactiveExercise: {
          instruction: 'Pourquoi Sartre critique-t-il la notion d\'inconscient freudien ?',
          question: 'Selon Jean-Paul Sartre, le recours à l\'inconscient constitue :',
          options: [
            'Une attitude de "mauvaise foi" visant à fuir sa liberté et sa responsabilité',
            'Une découverte scientifique indéniable sur le fonctionnement neuronal',
            'Une confirmation de la toute-puissance du destin stoïcien',
            'Une illusion biologique sans impact moral'
          ],
          correctIndex: 0,
          explanation: 'Pour Sartre, affirmer "je n\'ai pas pu m\'en empêcher, c\'est mon inconscient" est une fuite lâche de notre liberté totale : c\'est le concept existentialiste de la mauvaise foi.',
          antiCheatClue: 'Pensez à la célèbre formule sartrienne : "L\'existence précède l\'essence" et au concept de responsabilité absolue.'
        }
      },
      {
        id: 'ph-p2',
        category: 'rule',
        categoryLabel: 'Repères Conceptuels',
        categoryIcon: '📏',
        title: 'Les 17 Repères Conceptuels Officiels du Bac de Philosophie',
        subtitle: 'Distinctions indispensables pour structurer les dissertations',
        levelBadge: 'Bac Terminale',
        contentMarkdown: `### Les couples de repères indispensables :
1. **Absolu / Relatif** : Ce qui ne dépend de rien d'autre (inconditionné) vs ce qui dépend d'un contexte ou d'une relation.
2. **En fait / En droit** : Ce qui existe réellement dans l'expérience (la réalité empirique) vs ce qui est légitime ou conforme à la justice idéale.
3. **Essentiel / Accidentel** : Ce qui fait qu'une chose est ce qu'elle est (sans quoi elle disparaît) vs ce qui peut changer sans modifier sa nature.
4. **Médiat / Immédiat** : Ce qui passe par un intermédiaire (le raisonnement, le temps, le langage) vs ce qui est saisi d'un coup sans filtre.
5. **Nécessaire / Contingent / Impossible** : Ce qui ne peut pas ne pas être vs ce qui pourrait être autrement vs ce qui ne peut absolument pas être.`,
        keyTakeaways: [
          'Mobiliser au moins deux couples de repères par dissertation pour élever le niveau d\'analyse.',
          'La distinction "en fait / en droit" est la clé universelle des sujets sur la justice, l\'État et la liberté.'
        ]
      }
    ]
  }
};

export const NotionSubjectWorkspaceModal: React.FC<NotionSubjectWorkspaceModalProps> = ({
  isOpen,
  onClose,
  initialSubject = 'espagnol',
  lang = 'fr',
  activeTheme = 'light',
  onOpenInBlocknote,
  onNavigateTab
}) => {
  const isFr = lang === 'fr';

  const [activeSubject, setActiveSubject] = useState<NotionSubjectKey>(initialSubject);
  const [activeFilterCategory, setActiveFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubPageId, setSelectedSubPageId] = useState<string>('');
  
  // Interactive exercise state inside sub-page
  const [userSelectedOption, setUserSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [showAntiCheatHint, setShowAntiCheatHint] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Sync initialSubject if prop updates
  React.useEffect(() => {
    if (initialSubject) {
      setActiveSubject(initialSubject);
      setSelectedSubPageId('');
      setUserSelectedOption(null);
      setIsAnswerChecked(false);
      setShowAntiCheatHint(false);
    }
  }, [initialSubject]);

  const currentSubjectData = NOTION_SUBJECTS_METADATA[activeSubject];

  // Filtered sub-pages based on category & search query
  const filteredSubPages = useMemo(() => {
    return currentSubjectData.subPages.filter((page) => {
      if (activeFilterCategory !== 'all' && page.category !== activeFilterCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = page.title.toLowerCase().includes(q);
        const matchSub = page.subtitle.toLowerCase().includes(q);
        const matchCat = page.categoryLabel.toLowerCase().includes(q);
        const matchText = page.contentMarkdown.toLowerCase().includes(q);
        if (!matchTitle && !matchSub && !matchCat && !matchText) return false;
      }
      return true;
    });
  }, [currentSubjectData, activeFilterCategory, searchQuery]);

  // Current active sub-page
  const activeSubPage = useMemo(() => {
    if (!selectedSubPageId) return filteredSubPages[0] || currentSubjectData.subPages[0];
    return currentSubjectData.subPages.find(p => p.id === selectedSubPageId) || currentSubjectData.subPages[0];
  }, [selectedSubPageId, filteredSubPages, currentSubjectData]);

  if (!isOpen) return null;

  const handleExportBlocknote = () => {
    if (onOpenInBlocknote && activeSubPage) {
      const exportContent = `# ${currentSubjectData.name} - ${activeSubPage.title}\n\n${activeSubPage.contentMarkdown}\n\n### Points Clés à Retenir :\n${activeSubPage.keyTakeaways.map(k => `- ${k}`).join('\n')}`;
      onOpenInBlocknote(`${currentSubjectData.name} - ${activeSubPage.title}`, currentSubjectData.name, exportContent);
    }
  };

  const handleCopyContent = () => {
    if (activeSubPage) {
      navigator.clipboard.writeText(`${activeSubPage.title}\n\n${activeSubPage.contentMarkdown}`);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/70 transition-all animate-in fade-in duration-150"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="w-full max-w-5xl h-[94vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-900 dark:text-white transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Notion Workspace Header Cover Banner */}
        <div className={`p-4 sm:p-6 bg-linear-to-r ${currentSubjectData.coverGradient} text-white relative flex flex-col justify-between shrink-0 shadow-md`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
              <span>Degree Unlocker</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              <span>{isFr ? 'Cahiers & Exercices Notion' : 'Notion Workspaces'}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              <span className="text-amber-300 font-bold">{currentSubjectData.name}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
              title="Fermer la page Notion"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-black/30 backdrop-blur-xs border border-white/20 flex items-center justify-center text-2xl shadow-inner">
                {currentSubjectData.flagEmoji}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight drop-shadow-sm">
                  {currentSubjectData.name}
                </h2>
                <p className="text-xs sm:text-sm text-white/90 line-clamp-1 max-w-xl">
                  {currentSubjectData.description}
                </p>
              </div>
            </div>

            {/* Socratic Anti-Cheat Badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 border border-white/20 text-xs font-bold text-emerald-300 backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isFr ? 'IA Pédagogique Socratique & Anti-Triche' : 'Anti-Cheat Socratic Engine'}</span>
            </div>
          </div>

          {/* Subject Switcher Pills */}
          <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {(Object.keys(NOTION_SUBJECTS_METADATA) as NotionSubjectKey[]).map((subjKey) => {
              const info = NOTION_SUBJECTS_METADATA[subjKey];
              const isCurrent = activeSubject === subjKey;
              return (
                <button
                  key={subjKey}
                  onClick={() => {
                    setActiveSubject(subjKey);
                    setSelectedSubPageId('');
                    setUserSelectedOption(null);
                    setIsAnswerChecked(false);
                    setShowAntiCheatHint(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-white text-slate-950 shadow-md scale-105'
                      : 'bg-black/25 text-white/90 hover:bg-black/40'
                  }`}
                >
                  <span>{info.flagEmoji}</span>
                  <span>{info.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notion Search & Intent Bar (User interaction inquiry) */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 space-y-2.5 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isFr ? "Qu'est-ce que vous souhaitez étudier ou faire aujourd'hui ? (leçons, règles, verbes, exercices...)" : "What would you like to study today? (lessons, rules, verbs, exercises...)"}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: 'all', label: isFr ? 'Tout voir' : 'All', icon: '⚡' },
                { id: 'lesson', label: isFr ? 'Leçons & Cours' : 'Lessons', icon: '📖' },
                { id: 'exercise', label: isFr ? 'Exercices' : 'Drills', icon: '✍️' },
                { id: 'rule', label: isFr ? 'Règles' : 'Rules', icon: '📏' },
                { id: 'verb', label: isFr ? 'Verbes' : 'Verbs', icon: '🔄' },
                { id: 'quote', label: isFr ? 'Citations' : 'Quotes', icon: '🏛️' },
                { id: 'method', label: isFr ? 'Méthode' : 'Methods', icon: '📝' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveFilterCategory(cat.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 whitespace-nowrap transition-all cursor-pointer ${
                    activeFilterCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Body: Sub-pages sidebar + Sub-page content reader */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* Sub-Pages Explorer List */}
          <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 overflow-y-auto p-2 sm:p-3 space-y-1.5 shrink-0 scrollbar-thin max-h-48 md:max-h-none">
            <div className="px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>{isFr ? 'Sommaire des Sous-Pages' : 'Notion Sub-Pages'}</span>
              <span className="text-[10px] font-mono font-bold text-indigo-500">{filteredSubPages.length}</span>
            </div>

            {filteredSubPages.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                {isFr ? 'Aucun résultat pour cette recherche.' : 'No results found.'}
              </div>
            ) : (
              filteredSubPages.map((subPage) => {
                const isSelected = activeSubPage.id === subPage.id;
                return (
                  <button
                    key={subPage.id}
                    onClick={() => {
                      setSelectedSubPageId(subPage.id);
                      setUserSelectedOption(null);
                      setIsAnswerChecked(false);
                      setShowAntiCheatHint(false);
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-md text-slate-900 dark:text-white'
                        : 'bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800/80 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                        <span>{subPage.categoryIcon}</span>
                        <span>{subPage.categoryLabel}</span>
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">{subPage.levelBadge}</span>
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm line-clamp-1 leading-snug">
                      {subPage.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {subPage.subtitle}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Sub-Page Detailed Content Canvas */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin bg-white dark:bg-slate-900">
            {activeSubPage && (
              <div className="space-y-6 max-w-3xl mx-auto">
                
                {/* Sub-page Title & Actions Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{activeSubPage.categoryIcon}</span>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {activeSubPage.categoryLabel} • {activeSubPage.levelBadge}
                      </span>
                    </div>
                    <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                      {activeSubPage.title}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      {activeSubPage.subtitle}
                    </p>
                  </div>

                  {/* Fast Action Buttons: Export to Blocknote & Copy */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleCopyContent}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      title="Copier le contenu"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copié !' : 'Copier'}</span>
                    </button>

                    {onOpenInBlocknote && (
                      <button
                        onClick={handleExportBlocknote}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-amber-300"
                        title="Ouvrir dans le Bloc-Notes manuscrit"
                      >
                        <PenTool className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{isFr ? 'Exporter Bloc-Notes' : 'To Blocknote'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-page Markdown Content */}
                <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-4">
                  {activeSubPage.contentMarkdown}
                </div>

                {/* Optional Table Data rendering */}
                {activeSubPage.tableData && (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                          {activeSubPage.tableData.headers.map((h, idx) => (
                            <th key={idx} className="p-2.5 font-bold text-slate-700 dark:text-slate-200">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {activeSubPage.tableData.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className={`p-2.5 text-slate-600 dark:text-slate-300 ${cIdx === 0 ? 'font-bold' : ''}`}>
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Key Takeaways Card */}
                {activeSubPage.keyTakeaways && activeSubPage.keyTakeaways.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-900 dark:text-amber-100 space-y-2 shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span>{isFr ? 'Points Clés & Mémo Bac' : 'Key Takeaways'}</span>
                    </div>
                    <ul className="space-y-1.5 text-xs">
                      {activeSubPage.keyTakeaways.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Interactive Exercise & Anti-Cheat Validation */}
                {activeSubPage.interactiveExercise && (
                  <div className="p-5 rounded-3xl bg-indigo-50/50 dark:bg-slate-800/60 border border-indigo-200/80 dark:border-indigo-900/60 space-y-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span>{isFr ? 'Exercice d\'Entraînement Interactif' : 'Interactive Practice Drill'}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-bold">
                        {isFr ? 'Vérification Instantanée' : 'Instant Feedback'}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {activeSubPage.interactiveExercise.instruction}
                    </p>

                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-700 font-medium text-xs sm:text-sm text-slate-900 dark:text-white">
                      {activeSubPage.interactiveExercise.question}
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeSubPage.interactiveExercise.options.map((opt, idx) => {
                        const isSelected = userSelectedOption === idx;
                        const isCorrect = idx === activeSubPage.interactiveExercise!.correctIndex;
                        let btnStyle = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400';
                        
                        if (isSelected && !isAnswerChecked) {
                          btnStyle = 'bg-indigo-600 text-white border-indigo-600 shadow-xs';
                        } else if (isAnswerChecked) {
                          if (isCorrect) {
                            btnStyle = 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold';
                          } else if (isSelected && !isCorrect) {
                            btnStyle = 'bg-rose-600 text-white border-rose-600 shadow-xs';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              if (!isAnswerChecked) {
                                setUserSelectedOption(idx);
                              }
                            }}
                            className={`p-3 rounded-2xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {isAnswerChecked && isCorrect && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Verification & Anti-Cheat Hint controls */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-indigo-100 dark:border-slate-700/60">
                      <button
                        onClick={() => setShowAntiCheatHint(prev => !prev)}
                        className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>{showAntiCheatHint ? (isFr ? 'Masquer l\'indice socratique' : 'Hide hint') : (isFr ? '💡 Besoin d\'un indice (sans tricher) ?' : '💡 Socratic Hint')}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {isAnswerChecked && (
                          <button
                            onClick={() => {
                              setUserSelectedOption(null);
                              setIsAnswerChecked(false);
                            }}
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                            title="Recommencer"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (userSelectedOption !== null) {
                              setIsAnswerChecked(true);
                            }
                          }}
                          disabled={userSelectedOption === null}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                            userSelectedOption !== null
                              ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {isFr ? 'Valider la réponse' : 'Check Answer'}
                        </button>
                      </div>
                    </div>

                    {/* Anti-Cheat Clue display */}
                    {showAntiCheatHint && (
                      <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-800 dark:text-purple-200 text-xs flex items-start gap-2 animate-in fade-in duration-150">
                        <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">{isFr ? 'Indice Pédagogique : ' : 'Pedagogical Hint: '}</span>
                          <span>{activeSubPage.interactiveExercise.antiCheatClue}</span>
                        </div>
                      </div>
                    )}

                    {/* Solution Explanation display */}
                    {isAnswerChecked && (
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs space-y-1.5 animate-in fade-in duration-200">
                        <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>{isFr ? 'Explication détaillée & Règle appliquée :' : 'Detailed Explanation:'}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {activeSubPage.interactiveExercise.explanation}
                        </p>
                      </div>
                    )}

                  </div>
                )}

              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
