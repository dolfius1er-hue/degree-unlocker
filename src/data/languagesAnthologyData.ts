export interface LanguagePageSection {
  id: string;
  title: string;
  badge?: string;
  subsections: {
    subtitle: string;
    description?: string;
    table?: {
      headers: string[];
      rows: string[][];
    };
    bulletPoints?: string[];
    notes?: string[];
  }[];
}

export interface LanguageCoursePage {
  id: 'anglais' | 'espagnol' | 'allemand' | 'antiquite';
  title: string;
  subtitle: string;
  flagOrIcon: string;
  levelSpan: string;
  summary: string;
  sections: LanguagePageSection[];
}

export const LANGUAGES_PEDAGOGICAL_ANTHOLOGY: LanguageCoursePage[] = [
  {
    id: 'anglais',
    title: "L'Anglais : Vocabulaire Prioritaire, Grammaire & Rhétorique",
    subtitle: 'Programme d\'excellence du Collège aux Concours et Prépas (A2 → C1)',
    flagOrIcon: '🇬🇧',
    levelSpan: 'Collège → Terminale & Prépas (A2 → C1)',
    summary: 'Maîtrise des connecteurs logiques, verbes d\'argumentation, faux-amis, temps fondamentaux et méthode P.E.E.L pour réussir à l\'écrit comme à l\'oral.',
    sections: [
      {
        id: 'en-priority-vocab',
        title: '1. Mots Prioritaires & Vocabulaire Académique',
        badge: 'Lexique Fondamental B2/C1',
        subsections: [
          {
            subtitle: 'Connecteurs Logiques et Articulateurs du Discours',
            description: 'Les connecteurs permettent de fluidifier l\'argumentation et d\'élever le registre de langue :',
            table: {
              headers: ['Connecteur', 'Équivalent Français', 'Usage Académique / Exemple'],
              rows: [
                ['Furthermore / Moreover', 'De plus / En outre', 'Ajout d\'un argument d\'autorité : "Furthermore, empirical evidence demonstrates..."'],
                ['Nevertheless / Nonetheless', 'Néanmoins / Toutefois', 'Nuance et concession : "The hypothesis is bold; nevertheless, it holds merit."'],
                ['Whereas / While', 'Tandis que / Alors que', 'Opposition et contraste : "Some nations adapt rapidly, whereas others lag behind."'],
                ['Consequently / As a result', 'Par conséquent / Il s\'ensuit que', 'Conclusion logique : "Funding was reduced; consequently, services declined."'],
                ['Notwithstanding', 'Nonobstant / En dépit de', 'Registre très soutenu : "Notwithstanding public skepticism, the reform passed."']
              ]
            }
          },
          {
            subtitle: 'Faux-Amis Incontournables (False Friends)',
            description: 'Les pièges de traduction les plus fréquents au Baccalauréat et dans l\'enseignement supérieur :',
            table: {
              headers: ['Mot Anglais', 'Sens Réel en Français', 'Sens Erroné à Éviter', 'Comment Dire le Faux-Ami ?'],
              rows: [
                ['Actually', 'En réalité / En fait', 'Actuellement', 'Currently / Nowadays'],
                ['Eventually', 'Finalement / À terme', 'Éventuellement', 'Possibly / If necessary'],
                ['Comprehensive', 'Exhaustif / Complet', 'Compréhensif', 'Understanding / Sympathetic'],
                ['Deception', 'Tromperie / Supercherie', 'Déception', 'Disappointment'],
                ['Sympathetic', 'Compatissant / Empathique', 'Sympathique / Sympa', 'Friendly / Nice / Likable'],
                ['To attend', 'Assister à / Participer à', 'Attendre', 'To wait for / To expect']
              ]
            }
          }
        ]
      },
      {
        id: 'en-grammar-notes',
        title: '2. Fiches de Grammaire & Conjugaison Stratégiques',
        badge: 'Syntaxe & Rigueur',
        subsections: [
          {
            subtitle: 'Present Perfect vs Simple Past (Prétérit)',
            bulletPoints: [
              "Simple Past (Prétérit) : Action révolue, terminée, coupée du présent avec repère temporel précis (yesterday, in 2012, 3 years ago).",
              "Present Perfect (have + participe passé) : Action liée au présent par un bilan de vie, un résultat visible ou une continuité temporelle.",
              "FOR vs SINCE : 'FOR' est suivi d'une durée chiffrée ('for ten years'), tandis que 'SINCE' introduit un point de départ précis ('since Monday', 'since 2020')."
            ]
          },
          {
            subtitle: 'Inversion Stylistique après Adverbes Négatifs',
            description: 'Structure de prestige pour obtenir la note maximale aux concours (Auxiliaire + Sujet + Base Verbale) :',
            bulletPoints: [
              "Seldom / Rarely : 'Rarely have we witnessed such remarkable scientific progress.'",
              "Not only... but also : 'Not only did they identify the error, but they also rectified it immediately.'",
              "Under no circumstances : 'Under no circumstances should the integrity of the data be compromised.'"
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'espagnol',
    title: "L'Espagnol : Du Collège au Baccalauréat",
    subtitle: 'Programme d\'excellence de la 5ème à la Terminale (Cycle 4, Seconde, Cycle Terminal)',
    flagOrIcon: '🇪🇸',
    levelSpan: '5ème → Terminale (A1 → B2)',
    summary: 'Synthèse exhaustive et rigoureuse des bases phonétiques, grammaticales, verbales, lexicales et culturelles de la langue hispanique.',
    sections: [
      {
        id: 'es-bases',
        title: '1. Bases Fondamentales : Prononciation, Accentuation & Alphabet',
        badge: 'Phonétique & Orthographe',
        subsections: [
          {
            subtitle: "L'Alphabet et les Particularités Phonétiques",
            description: "L'espagnol compte 27 lettres officielles depuis la réforme de l'Académie Royale (RAE). Chaque graphème correspond à une prononciation stable et claire :",
            bulletPoints: [
              "La Jota (j) et le g devant e/i : consonne fricative vélaire sourde [x], râlée depuis le fond de la gorge (ex: 'jardín', 'gente').",
              "La Ñ (eñe) : consonne nasale palatale voisée [ɲ], équivalente au son 'gn' en français (ex: 'España', 'año').",
              "Le R simple et le RR roulé : le r simple est battu contre les alvéoles [ɾ] (ex: 'pero'), tandis que le double rr ou le r initial est fortement roulé [r] (ex: 'perro', 'Roma').",
              "Le Z et le C devant e/i : en Espagne péninsulaire, prononciation interdentale [θ] ('th' anglais, ex: 'zapato', 'cinco') ; en Amérique latine, seseo universel [s].",
              "Le H est toujours muet (ex: 'hijo', 'hablar').",
              "Le V et le B se prononcent de façon bilabiale identique : occlusive [b] ou fricative [β] (ex: 'vino' et 'bien' sonnent avec la même consonne bilabiale)."
            ],
          },
          {
            subtitle: "Les 3 Règles d'Or de l'Accent Tonique (Acento Prosódico)",
            description: "En espagnol, chaque mot possède une syllabe accentuée obligatoirement déterminée par sa terminaison, sauf présence d'un accent écrit (acento gráfico/tilde) :",
            table: {
              headers: ['Règle', 'Terminaison du mot', 'Syllabe accentuée', 'Exemples sans tilde', 'Exemples avec tilde (exception)'],
              rows: [
                ['Palabras Llanas (Paroxytons)', 'Voyelle (a, e, i, o, u) ou consonne N ou S', 'Avant-dernière syllabe (penúltima)', 'ca-SA, ha-BLAN, me-SA, li-BRO', 'ÁR-bol, LÁ-piz, DÉ-bil'],
                ['Palabras Agudas (Oxytons)', 'Consonne (sauf N et S)', 'Dernière syllabe (última)', 'ha-BLAR, pa-PEL, ver-DAD, mu-JER', 'ca-MIÓN, in-GLÉS, ca-FÉ'],
                ['Palabras Esdrújulas (Proparoxytons)', 'Toute terminaison', 'Antépénultième ou avant', 'Toujours accent écrit !', 'PÁ-gi-na, MÚ-si-ca, RÁ-pi-do']
              ]
            },
            notes: [
              "Accent diacritique : sert à différencier deux homonymes grammaticaux : 'el' (l'article) vs 'él' (le pronom personnel), 'tu' (adjectif possessif) vs 'tú' (sujet tu), 'si' (si conditionnel) vs 'sí' (oui / soi-même)."
            ]
          }
        ]
      },
      {
        id: 'es-grammaire',
        title: '2. Grammaire et Syntaxe Hispanique',
        badge: 'Morphosyntaxe',
        subsections: [
          {
            subtitle: 'Articles, Genre et Nombre',
            description: "Les articles définis sont 'el, la, los, las' avec l'article neutre 'lo' (ex: 'lo importante' = ce qui est important). Les articles indéfinis sont 'un, una, unos, unas'. Attention : devant un nom féminin singulier commençant par un 'a' tonique, on utilise 'el' par euphonie (ex: 'el agua clara', 'el águila').",
          },
          {
            subtitle: 'Distinction Incontournable : POR vs PARA',
            description: "Confusion majeure des apprenants francophones résolue rigoureusement :",
            table: {
              headers: ['Préposition', 'Valeur Principale', 'Contextes d\'emploi', 'Exemples types'],
              rows: [
                ['POR', 'La cause, le motif, le passage, le moyen, la durée imprécise', 'Parce que, à travers, par le moyen de, en échange de', "Lo hago por ti (pour toi/par amour pour toi). Paso por la calle. Gracias por la ayuda."],
                ['PARA', 'Le but, la destination, l\'échéance temporelle, le point de vue', 'Afin de, destiné à, pour telle date, selon quelqu\'un', "Estudio para aprobar el examen. El regalo es para María. Para mí, es fundamental."]
              ]
            }
          },
          {
            subtitle: 'Pronoms Compléments et Enclise',
            description: "À l'indicatif standard, les pronoms compléments se placent AVANT le verbe conjugué (COD: lo, la, los, las ; COI: me, te, le, nos, os, les). Quand COI et COD se suivent, 'le/les' devient 'se' : 'Se lo digo' (Je le lui dis).",
            bulletPoints: [
              "L'Enclise obligatoire : les pronoms se soudent à la fin du verbe dans 3 cas stricts : à l'INFINITIF ('hacerlo'), au GÉRONDIF ('haciéndolo'), et à l'IMPÉRATIF AFFIRMATIF ('¡hazlo!').",
              "La préposition 'A' devant un COD de personne : obligatoire pour toute personne déterminée (ex: 'Veo a Carlos', 'Conozco a los alumnos')."
            ]
          }
        ]
      },
      {
        id: 'es-conjugaison',
        title: '3. Conjugaison Complète : Verbes Réguliers, Irréguliers & Subjonctif',
        badge: 'Système Verbal',
        subsections: [
          {
            subtitle: 'Les Verbes SER vs ESTAR',
            table: {
              headers: ['Verbe', 'Emploi Fondamental', 'Exemples', 'Différences de sens'],
              rows: [
                ['SER (soy, eres, es, somos, sois, son)', 'Identité intrinsèque, nature permanente, origine, nationalité, heure, voix passive', 'Soy estudiante. Es de Madrid. Son las tres. Es inteligente.', 'Es bueno (Il est bon/gentil). Es listo (Il est intelligent).'],
                ['ESTAR (estoy, estás, está, estamos, estáis, están)', 'Localisation dans l\'espace, état passager ou résultant, sentiments, aspect progressif (estar + gérondif)', 'Estoy en clase. Está cansado. Está cerrada la puerta. Está comiendo.', 'Está bueno (C\'est bon au goût). Está listo (Il est prêt).']
              ]
            }
          },
          {
            subtitle: 'Phénomènes d\'Alternance : Diphtongues et Affaiblissements',
            bulletPoints: [
              "Diphtongue : e -> ie (querer: quiero, quieres, quiere, queremos, queréis, quieren) et o -> ue (poder: puedo, puedes, puede, podemos, podéis, pueden) aux personnes 1, 2, 3 du singulier et 3 du pluriel.",
              "Affaiblissement : e -> i (pedir: pido, pides, pide, pedimos, pedís, piden ; servir: sirvo).",
              "Gérondif régulier : verbes en -ar -> -ando ; verbes en -er/-ir -> -iendo."
            ]
          },
          {
            subtitle: 'Le Subjonctif : Présent et Imparfait',
            description: "Le subjonctif exprime le doute, le souhait, l'ordre négatif, l'hypothèse et les sentiments. Formé sur la base de la 1ère personne du présent avec inversion des voyelles thématiques (-ar devient -e, -er/-ir devient -a) :",
            table: {
              headers: ['Temps', 'Verbes en -AR (ex: Hablar)', 'Verbes en -ER/-IR (ex: Comer / Vivir)', 'Irréguliers Clés'],
              rows: [
                ['Subjonctif Présent', 'hable, hables, hable, hablemos, habléis, hablen', 'coma, comas, coma, comamos, comáis, coman', 'sea, esté, vaya, tenga, haga, pueda, sepa'],
                ['Subjonctif Imparfait', 'hablara / hablase, hablaras, hablara, habláramos...', 'comiera / comiese, comieras, comiera...', 'tuviera, fuera, hiciera, pudiera, supiera']
              ]
            },
            notes: [
              "Concordance des temps conditionnelle : 'Si tuviera dinero, viajaría por el mundo' (Si + imparfait du subjonctif -> conditionnel présent)."
            ]
          }
        ]
      },
      {
        id: 'es-lexique',
        title: '4. Vocabulaire par Cycles : De la Vie Quotidienne aux Enjeux du Bac',
        badge: 'Lexique Progressif',
        subsections: [
          {
            subtitle: 'Cycle 4 (Collège : 5ème, 4ème, 3ème)',
            bulletPoints: [
              "La présentation et la famille : el padre, la madre, los hermanos, el abuelo, tener ... años, llamarse, vivir en.",
              "La vie scolaire et quotidienne : la rutina diaria, despertarse, desayunar, el colegio, la asignatura, los deberes, la ropa.",
              "L'environnement urbain et les loisirs : la ciudad, la plaza, el mercado, el ocio, jugar al fútbol, escuchar música, ir de compras."
            ]
          },
          {
            subtitle: 'Cycle Terminal (Lycée : Seconde, Première, Terminale - Axes du Bac)',
            bulletPoints: [
              "Axe 1 - Identités et échanges : la migración, la frontera, el exilio, la integración, el enriquecimiento cultural, la acogida.",
              "Axe 2 - Espace privé et espace public : el papel de la mujer, el machismo, la emancipación, las manifestaciones, el empoderamiento.",
              "Axe 3 - Art et pouvoir : el muralismo mexicano (Diego Rivera, Siqueiros), el compromiso político, la censura, la propaganda, el Guernica de Picasso.",
              "Axe 4 - Citoyenneté et mondes virtuels : las redes sociales, la brecha digital, la privacidad, la desinformación (fake news), la inteligencia artificial.",
              "Axe 5 - Fictions et réalités : el realismo mágico (Gabriel García Márquez), los mitos precolombinos, la leyenda del Dorado.",
              "Axe 6 - Innovations scientifiques et responsabilité : la transición ecológica, la energía renovable, la contaminación, la deforestación del Amazonas."
            ]
          }
        ]
      },
      {
        id: 'es-culture',
        title: '5. Histoire et Grandes Figures du Monde Hispanique',
        badge: 'Civilisation',
        subsections: [
          {
            subtitle: 'Repères Historiques Majeurs',
            bulletPoints: [
              "1492 (Année charnière) : Fin de la Reconquista avec la prise de Grenade par les Rois Catholiques (Isabel et Fernando) et arrivée de Christophe Colomb en Amérique (conquête des empires aztèque par Cortés et inca par Pizarro).",
              "La Guerre Civile Espagnole (1936-1939) : Confrontation entre Républicains et Nationalistes dirigés par Francisco Franco. Dictature franquiste jusqu'à la mort de Franco en 1975 et transition démocratique.",
              "Les Dictatures Latino-Américaines (XXe siècle) : Coup d'État d'Augusto Pinochet au Chili (11 septembre 1973 contre Salvador Allende), la junte militaire en Argentine (les Mères de la Place de Mai)."
            ]
          },
          {
            subtitle: 'Figures Artistiques et Littéraires Clés',
            bulletPoints: [
              "Littérature : Miguel de Cervantes (Don Quijote de la Mancha, 1605), Federico García Lorca (poète assassiné en 1936), Gabriel García Márquez (Cent Ans de Solitude, Nobel 1982), Isabel Allende.",
              "Arts Visuels : Diego Velázquez (Las Meninas), Francisco de Goya (El tres de mayo de 1808), Pablo Picasso (Guernica), Salvador Dalí, Frida Kahlo."
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'allemand',
    title: "L'Allemand : Du Collège au Baccalauréat",
    subtitle: 'Programme d\'excellence de la 5ème à la Terminale (Cycle 4, Seconde, Cycle Terminal)',
    flagOrIcon: '🇩🇪',
    levelSpan: '5ème → Terminale (A1 → B2)',
    summary: 'Système rigoureux des 4 cas, règles de construction de phrase, verbes forts, subjonctif II et fresque culturelle germanique.',
    sections: [
      {
        id: 'de-bases',
        title: '1. Bases Fondamentales : Prononciation, Alphabet & Règles de Lecture',
        badge: 'Phonétique & Graphie',
        subsections: [
          {
            subtitle: "Alphabet, Voyelles à Umlaut et Consonnes Spécifiques",
            bulletPoints: [
              "L'Eszett (ß) : remplace le double s après une voyelle longue ou une diphtongue (ex: 'groß', 'die Straße'). Il se prononce toujours comme un 's' sourd.",
              "Les Umlauts : ä prononcé [ɛ] comme 'è' (ex: 'Mädchen'), ö prononcé [œ/ø] comme 'eu' (ex: 'schön'), ü prononcé [y] comme 'u' français (ex: 'über').",
              "Les Diphtongues : 'ei' et 'ai' se prononcent [aɪ] comme 'aïe' (ex: 'mein', 'arbeiten') ; 'ie' se prononce [iː] comme un long 'i' (ex: 'sieben') ; 'eu' et 'äu' se prononcent [ɔʏ] comme 'oille' (ex: 'heute', 'Häuser').",
              "Le 'ch' : prononcé [ç] après e, i, ä, ö, ü ('Ich-Laut', ex: 'ich', 'nicht') et [x] guttural après a, o, u, au ('Ach-Laut', ex: 'Buch', 'machen').",
              "Majuscule obligatoire : TOUS les noms communs s'écrivent avec une lettre MAJUSCULE (ex: 'der Tisch', 'die Freiheit', 'das Leben').",
              "L'accent tonique : porte généralement sur la première syllabe du radical (ex: 'AR-bei-ten', 'KÖN-nen')."
            ]
          }
        ]
      },
      {
        id: 'de-cas',
        title: '2. Le Système des 4 Cas et les Déclinaisons',
        badge: 'Grammaire & Cas',
        subsections: [
          {
            subtitle: 'Rôles des 4 Cas dans la Phrase',
            bulletPoints: [
              "Nominatif (Wer? Was?) : Sujet et attribut du sujet.",
              "Accusatif (Wen? Was?) : Complément d'Objet Direct (COD) et après prépositions spatiales de changement de lieu (Wohin?).",
              "Datif (Wem?) : Complément d'Objet Indirect (COI/Attribution) et après prépositions de localisation fixe (Wo?).",
              "Génitif (Wessen?) : Complément du nom exprimant l'appartenance (ex: 'das Auto meines Vaters')."
            ]
          },
          {
            subtitle: 'Tableau Exhaustif des Articles Définis et Indéfinis aux 4 Cas',
            table: {
              headers: ['Cas', 'Masculin (der/ein)', 'Féminin (die/eine)', 'Neutre (das/ein)', 'Pluriel (die/-)'],
              rows: [
                ['Nominatif', 'der / ein', 'die / eine', 'das / ein', 'die / -'],
                ['Accusatif', 'den / einen', 'die / eine', 'das / ein', 'die / -'],
                ['Datif', 'dem / einem', 'der / einer', 'dem / einem', 'den + n / -n'],
                ['Génitif', 'des + (e)s / eines', 'der / einer', 'des + (e)s / eines', 'der / -']
              ]
            },
            notes: [
              "Astuce mnémotechnique masculine : RE-SE-ME-SE pour les articles définis masculins (deR, deN, deM, deS).",
              "Règle spatiale Wechselpräpositionen (an, auf, hinter, in, neben, über, unter, vor, zwischen) : Déplacement vers un lieu (Wohin?) = ACCUSATIF ; Emplacement fixe sans changement de lieu (Wo?) = DATIF."
            ]
          },
          {
            subtitle: 'La Déclinaison de l\'Adjectif Épithète',
            description: "L'adjectif épithète précédant le nom prend une terminaison : soit faible (après der/die/das : terminaison en -e ou -en), soit forte (sans article, reprenant la marque de l'article défini), soit mixte (après ein/kein/mein).",
          }
        ]
      },
      {
        id: 'de-syntaxe',
        title: '3. Syntaxe et Construction de la Phrase Allemande',
        badge: 'Ordre des Mots',
        subsections: [
          {
            subtitle: 'La Règle d\'Or du Verbe Conjugué',
            bulletPoints: [
              "Phrase déclarative indépendante : Le verbe conjugué occupe TOUJOURS la 2ème POSITION (ex: 'Heute gehe ich ins Kino' ou 'Ich gehe heute ins Kino'). L'inversion sujet-verbe est automatique si un élément autre que le sujet débute la phrase.",
              "Phrase subordonnée (introduite par weil, dass, wenn, ob, obwohl, etc.) : Le verbe conjugué est rejeté TOUT À LA FIN de la proposition (ex: 'Ich weiß, dass er heute nicht kommt').",
              "Parenthèse verbale (Satzklammer) : Avec un verbe à particule séparable, un temps composé ou un verbe de modalité, la forme conjuguée est en 2ème position et le second élément verbal est rejeté à la fin (ex: 'Er steht um 7 Uhr auf', 'Ich habe ein Buch gelesen', 'Du musst deine Hausaufgaben machen')."
            ]
          }
        ]
      },
      {
        id: 'de-conjugaison',
        title: '4. Conjugaison Complète : Faibles, Forts, Modaux & Subjonctif II',
        badge: 'Système Verbal',
        subsections: [
          {
            subtitle: 'Les 6 Verbes de Modalité (Modalverben)',
            description: "Ils modifient le sens du verbe principal (qui se place à l'infinitif en fin de phrase) :",
            table: {
              headers: ['Verbe', 'Sens Principal', 'Présent (ich, du, er, wir, ihr, sie)', 'Prétérit'],
              rows: [
                ['können', 'Capacité, possibilité (pouvoir)', 'kann, kannst, kann, können, könnt, können', 'konnte'],
                ['müssen', 'Obligation incontournable (devoir)', 'muss, musst, muss, müssen, müsst, müssen', 'musste'],
                ['dürfen', 'Permission, interdiction avec nicht', 'darf, darfst, darf, dürfen, dürft, dürfen', 'durfte'],
                ['wollen', 'Volonté ferme, intention (vouloir)', 'will, willst, will, wollen, wollt, wollen', 'wollte'],
                ['sollen', 'Devoir moral, consigne reçue', 'soll, sollst, soll, sollen, sollt, sollen', 'sollte'],
                ['mögen', 'Apprécier / möchte (aimerait)', 'mag, magst, mag, mögen, mögt, mögen', 'mochte']
              ]
            }
          },
          {
            subtitle: 'Temps du Passé : Prétérit vs Parfait',
            bulletPoints: [
              "Prétérit (Präteritum) : Temps privilégié de l'écrit et du récit littéraire. Verbes faibles : radical + -te (ex: 'er lernte'). Verbes forts : changement de voyelle radicale (ex: 'sehen -> sah', 'gehen -> ging').",
              "Parfait (Perfekt) : Temps usuel de l'oral et de la conversation courante. Formé avec l'auxiliaire haben ou sein + Participe II (ex: 'Ich habe geschlafen', 'Er ist angekommen')."
            ]
          },
          {
            subtitle: 'Le Subjonctif II (Konjunktiv II) : L\'Irréel et la Politesse',
            description: "Exprime le souhait, le regret ou l'hypothèse. Formé couramment avec l'auxiliaire 'würde' + infinitif (ex: 'Wenn ich Zeit hätte, würde ich reisen' = Si j'avais le temps, je voyagerais). Pour les verbes être (sein) et avoir (haben) : 'ich wäre' (je serais), 'ich hätte' (j'aurais)."
          }
        ]
      },
      {
        id: 'de-culture',
        title: '5. Histoire, Société et Culture Germanique',
        badge: 'Civilisation',
        subsections: [
          {
            subtitle: 'Grandes Périodes Historiques',
            bulletPoints: [
              "Le Saint-Empire romain germanique (962-1806) et la Réforme de Martin Luther (traduction de la Bible en allemand fondant la langue moderne).",
              "La République de Weimar (1919-1933) : Effervescence artistique (Bauhaus, cinéma expressionniste) fragilisée par la crise économique.",
              "Le régime nazi et la Seconde Guerre mondiale (1933-1945) : Le devoir de mémoire (Erinnerungskultur) pierre angulaire de l'Allemagne d'après-guerre.",
              "La Guerre Froide et la division (1949-1989) : RFA (démocratie capitaliste) et RDA (régime communiste). Construction du Mur de Berlin (13 août 1961) et Chute du Mur (9 novembre 1989).",
              "La Réunification (3 octobre 1990) et le rôle moteur de l'Allemagne au sein de l'Union Européenne."
            ]
          },
          {
            subtitle: 'Héritage Intellectuel et Artistique',
            bulletPoints: [
              "Littérature et Philosophie : Goethe (Faust), Schiller, Kant (l'Impératif catégorique), Nietzsche, Kafka, Thomas Mann, Bertolt Brecht.",
              "Musique : Bach, Beethoven, Brahms, Mozart."
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'antiquite',
    title: 'Langues et Cultures de l\'Antiquité (Latin & Grec Ancien)',
    subtitle: 'Programme d\'excellence humaniste : Grammaire fondamentale, Déclinaisons, Syntaxe & Civilisation',
    flagOrIcon: '🏛️',
    levelSpan: '5ème → Terminale / Supérieur',
    summary: 'Maîtrise structurée du système flexionnel latin et grec, étymologie féconde et repères fondateurs de la civilisation gréco-romaine.',
    sections: [
      {
        id: 'la-systeme',
        title: 'Section A : Le Latin – Système Linguistique et Déclinaisons',
        badge: 'Latin : Morphosyntaxe',
        subsections: [
          {
            subtitle: 'Les 6 Cas Latins et Leurs Fonctions Fondamentales',
            table: {
              headers: ['Cas', 'Fonction Principale', 'Exemple', 'Traduction'],
              rows: [
                ['Nominatif', 'Sujet ou attribut du sujet', 'Rosa floret', 'La rose fleurit'],
                ['Vocatif', 'Apostrophe, interpellation directe', 'O Marce !', 'Ô Marcus !'],
                ['Accusatif', 'COD ou direction avec préposition (in, ad)', 'Puer rosam videt', 'L\'enfant voit la rose'],
                ['Génitif', 'Complément du nom (possession, matière)', 'Natura rosae', 'La nature de la rose'],
                ['Datif', 'Complément d\'attribution (COI)', 'Librum amico do', 'Je donne le livre à un ami'],
                ['Ablatif', 'Compléments circonstanciels (moyen, lieu, cause)', 'Gladio pugnat', 'Il combat avec un glaive']
              ]
            }
          },
          {
            subtitle: 'Tableau des 5 Déclinaisons Latines (Modèles Types au Singulier et Pluriel)',
            table: {
              headers: ['Cas', '1ère (Rosa, -ae f.)', '2ème (Dominus, -i m. / Templum, -i n.)', '3ème (Consul, -is m. / Mare, -is n.)', '4ème (Manus, -us f.)', '5ème (Res, -ei f.)'],
              rows: [
                ['Nom. Sing.', 'rosa', 'dominus / templum', 'consul / mare', 'manus', 'res'],
                ['Acc. Sing.', 'rosam', 'dominum / templum', 'consulem / mare', 'manum', 'rem'],
                ['Gén. Sing.', 'rosae', 'domini / templi', 'consulis / maris', 'manus', 'rei'],
                ['Dat. Sing.', 'rosae', 'domino / templo', 'consuli / mari', 'manui', 'rei'],
                ['Abl. Sing.', 'rosa', 'domino / templo', 'consule / mari', 'manu', 're'],
                ['Nom. Plur.', 'rosae', 'domini / templa', 'consules / maria', 'manus', 'res'],
                ['Acc. Plur.', 'rosas', 'dominos / templa', 'consules / maria', 'manus', 'res'],
                ['Gén. Plur.', 'rosarum', 'dominorum / templorum', 'consulum / marium', 'manuum', 'rerum'],
                ['Dat/Abl Pl.', 'rosis', 'dominis / templis', 'consulibus / maribus', 'manibus', 'rebus']
              ]
            }
          }
        ]
      },
      {
        id: 'la-conjugaison',
        title: 'Section A : Conjugaison et Syntaxe Latine Avancée',
        badge: 'Latin : Verbes & Syntaxe',
        subsections: [
          {
            subtitle: 'Les 4 Groupes de Verbes et le Verbe Être (Esse)',
            description: "Les 5 temps primitifs d'un verbe latin (ex: amo, amas, amare, amavi, amatum) fournissent les trois radicaux indispensables : le radical du présent (am-), le radical du parfait (amav-) et le supin (amat-).",
            bulletPoints: [
              "Présent de l'indicatif de SUM (être) : sum, es, est, sumus, estis, sunt. Imparfait : eram, eras, erat, eramus, eratis, erant. Parfait : fui, fuisti, fuit...",
              "Voix passive : terminaisons -or, -ris, -tur, -mur, -mini, -ntur (ex: 'amor' = je suis aimé, 'amatur' = il est aimé).",
              "Verbes déponents : verbes de forme passive mais de sens actif (ex: 'sequor' = je suis, 'hortor' = j'exhorte)."
            ]
          },
          {
            subtitle: 'Constructions Syntaxiques Incontournables',
            bulletPoints: [
              "La Proposition Infinitive : Dépend d'un verbe de déclaration ou de pensée. Le sujet se met à l'ACCUSATIF et le verbe à l'INFINITIF (ex: 'Scio te bonum esse' = Je sais que tu es bon).",
              "L'Ablatif Absolu : Proposition participiale indépendante détachée du reste de la phrase, composée d'un nom à l'ablatif et d'un participe (souvent parfait passif) à l'ablatif (ex: 'Caesare duce' = César étant chef ; 'Urbe capta' = La ville ayant été prise / une fois la ville prise).",
              "Le Cum historique : 'Cum' + subjonctif imparfait ou plus-que-parfait exprimant une circonstance temporelle ou causale (ex: 'Cum Athenis essem' = Comme j'étais à Athènes)."
            ]
          },
          {
            subtitle: 'Civilisation et Grands Auteurs Romains',
            bulletPoints: [
              "Repères historiques : Fondation légendaire de Rome (753 av. J.-C. par Romulus), la République (509 - 27 av. J.-C.) avec les guerres puniques et Jules César, l'Empire d'Auguste (-27) jusqu'à la chute de Rome (476 ap. J.-C.).",
              "Auteurs majeurs : Cicéron (art oratoire et philosophie stoïcienne), Virgile (L'Énéide, épopée nationale romaine), Ovide (Les Métamorphoses), Sénèque (Lettres à Lucilius)."
            ]
          }
        ]
      },
      {
        id: 'gr-fondations',
        title: 'Section B : Initiation Complète au Grec Ancien',
        badge: 'Grec Ancien : Alphabet & Grammaire',
        subsections: [
          {
            subtitle: "L'Alphabet Grec et Règles de Lecture",
            table: {
              headers: ['Lettre Maj./Min.', 'Nom Grec', 'Prononciation', 'Équivalent Français / Exemple'],
              rows: [
                ['Α α', 'Alpha', '[a]', 'a (ex: ἀγορά / agora)'],
                ['Β β', 'Bêta', '[b]', 'b (ex: βίος / bios)'],
                ['Γ γ', 'Gamma', '[g]', 'g dur (ex: γῆ / gê ; [ŋ] devant γ, κ, χ)'],
                ['Δ δ', 'Delta', '[d]', 'd (ex: δῆμος / dêmos)'],
                ['Ε ε', 'Epsilon', '[e]', 'e bref fermé'],
                ['Ζ ζ', 'Dzêta', '[dz]', 'dz ou z (ex: ζῷον / zôon)'],
                ['Η η', 'Êta', '[ɛː]', 'è long ouvert'],
                ['Θ θ', 'Thêta', '[tʰ]', 't aspiré (ex: θεός / theos)'],
                ['Ι ι', 'Iota', '[i]', 'i (iota souscrit: ᾳ, ῃ, ῳ)'],
                ['Κ κ', 'Kappa', '[k]', 'k dur (ex: καρδία / kardia)'],
                ['Λ λ', 'Lambda', '[l]', 'l (ex: λόγος / logos)'],
                ['Μ μ', 'Mu', '[m]', 'm (ex: μῦθος / muthos)'],
                ['Ν ν', 'Nu', '[n]', 'n (ex: νόμος / nomos)'],
                ['Ξ ξ', 'Xi', '[ks]', 'x / ks (ex: ξένος / xenos)'],
                ['Ο ο', 'Omicron', '[o]', 'o bref fermé'],
                ['Π π', 'Pi', '[p]', 'p (ex: πόλις / polis)'],
                ['Ρ ρ', 'Rhô', '[r]', 'r roulé (avec esprit rude: ῥ)'],
                ['Σ σ / ς', 'Sigma', '[s]', 's sourd (ς en fin de mot, σ au début/milieu)'],
                ['Τ τ', 'Tau', '[t]', 't (ex: τέχνη / technê)'],
                ['Υ υ', 'Upsilon', '[y]', 'u français (ex: ὕδωρ / hudôr)'],
                ['Φ φ', 'Phi', '[pʰ]', 'f / ph (ex: φιλοσοφία / philosophia)'],
                ['Χ χ', 'Khi', '[kʰ]', 'ch allemand dur (ex: χρόνος / chronos)'],
                ['Ψ ψ', 'Psi', '[ps]', 'ps (ex: ψυχή / psukhê)'],
                ['Ω ω', 'Oméga', '[ɔː]', 'o long ouvert (ex: ὥρα / hôra)']
              ]
            },
            notes: [
              "Esprits : Tout mot grec commençant par une voyelle ou un rhô porte un esprit. L'esprit doux (᾿) ne se prononce pas. L'esprit rude (῾) indique une aspiration [h] (ex: ἵππος / hippos = le cheval)."
            ]
          },
          {
            subtitle: 'Conjugaison Grecque de Base : Le Verbe Être (εἰμί) et les Verbes en -ω',
            table: {
              headers: ['Personne', 'εἰμί (être au présent)', 'λύω (délier / présent de l\'indicatif actif)'],
              rows: [
                ['1ère Singulier (je)', 'εἰμί (eimi)', 'λύ-ω (luô)'],
                ['2ème Singulier (tu)', 'εἶ (ei)', 'λύ-εις (lueis)'],
                ['3ème Singulier (il/elle)', 'ἐστί(ν) (esti)', 'λύ-ει (luei)'],
                ['1ère Pluriel (nous)', 'ἐσμέν (esmen)', 'λύ-ομεν (luomen)'],
                ['2ème Pluriel (vous)', 'ἐστέ (este)', 'λύ-ετε (luete)'],
                ['3ème Pluriel (ils/elles)', 'εἰσί(ν) (eisi)', 'λύ-ουσι(ν) (luousi)']
              ]
            }
          },
          {
            subtitle: 'Étymologie : L\'Héritage Grec Fondateur dans la Langue Française',
            bulletPoints: [
              "Médecine et Biologie : βίος (la vie) -> biologie ; καρδία (le cœur) -> cardiologie ; ὀφθαλμός (l'œil) -> ophtalmologie ; αἷμα (le sang) -> hématome, hémorragie.",
              "Sciences et Philosophie : λόγος (la parole, la raison, l'étude) -> logique, dialogue ; σοφία (la sagesse) -> philosophie ; ψυχή (l'âme, l'esprit) -> psychologie ; γῆ (la terre) + μετρέω (mesurer) -> géométrie.",
              "Politique et Société : δῆμος (le peuple) + κράτος (le pouvoir) -> démocratie ; πόλις (la cité) -> politique, métropole ; αὐτός (soi-même) + νομία (la règle) -> autonomie."
            ]
          },
          {
            subtitle: 'Culture Hellénistique et Pensée Mythologique',
            bulletPoints: [
              "Le Panthéon Olympien : Zeus (maître du ciel et de la foudre), Poséidon (les mers), Hadès (les Enfers), Athéna (sagesse et stratégie militaire), Apollon (lumière, musique et prophétie), Dionysos (vigne et théâtre).",
              "Athènes et Sparte : Opposition du modèle démocratique athénien (Isonomie, théâtre tragique de Sophocle et Eschyle) et de la cité guerrière et oligarchique spartiate.",
              "La Triade Philosophique Fondatrice : Socrate (la maïeutique et 'Connais-toi toi-même'), Platon (La République, Allégorie de la Caverne et Théorie des Idées), Aristote (Logique, Éthique à Nicomaque et fondation des sciences naturelles)."
            ]
          }
        ]
      }
    ]
  }
];
