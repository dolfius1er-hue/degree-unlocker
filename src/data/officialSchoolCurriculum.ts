export interface TextbookReferenceItem {
  subject: string;
  collections: string;
  publishers: string[];
  track: 'tronc_commun' | 'specialite' | 'option';
}

export interface GradeLevelCatalog {
  gradeId: 'seconde' | 'premiere' | 'terminale';
  gradeTitle: string;
  gradeDescription: string;
  sections: {
    sectionTitle: string;
    items: TextbookReferenceItem[];
  }[];
}

export const OFFICIAL_HIGH_SCHOOL_TEXTBOOKS_CATALOG: GradeLevelCatalog[] = [
  {
    gradeId: 'seconde',
    gradeTitle: 'Classe de Seconde (Tronc Commun)',
    gradeDescription: 'En classe de Seconde, tous les élèves suivent un tronc commun identique pour consolider les fondamentaux et préparer les choix d\'orientation.',
    sections: [
      {
        sectionTitle: 'Tronc Commun Obligatoire',
        items: [
          {
            subject: 'Français',
            collections: "L'Écume des lettres (Hachette Éducation), Empreintes Littéraires (Magnard), Passeurs de textes (Le Robert/Bordas)",
            publishers: ['Hachette Éducation', 'Magnard', 'Le Robert', 'Bordas'],
            track: 'tronc_commun',
          },
          {
            subject: 'Mathématiques',
            collections: 'Indice (Bordas), Hyperbole (Nathan), Variations (Hatier), Mission Indigo (Hachette)',
            publishers: ['Bordas', 'Nathan', 'Hatier', 'Hachette'],
            track: 'tronc_commun',
          },
          {
            subject: 'Histoire-Géographie',
            collections: 'Collection Le Quintrec (Nathan), Histoire-Géographie (Hatier), Magnard',
            publishers: ['Nathan', 'Hatier', 'Magnard'],
            track: 'tronc_commun',
          },
          {
            subject: 'Physique-Chimie',
            collections: 'Sirius (Nathan), Microméga (Hatier), Espace (Bordas)',
            publishers: ['Nathan', 'Hatier', 'Bordas'],
            track: 'tronc_commun',
          },
          {
            subject: 'Sciences de la Vie et de la Terre (SVT)',
            collections: 'Collection Baude-Jusserand (Bordas), SVT Lycée (Nathan), Hatier',
            publishers: ['Bordas', 'Nathan', 'Hatier'],
            track: 'tronc_commun',
          },
          {
            subject: 'Sciences Économiques et Sociales (SES)',
            collections: 'Passerelles (Bordas), SES (Hatier), Magnard',
            publishers: ['Bordas', 'Hatier', 'Magnard'],
            track: 'tronc_commun',
          },
          {
            subject: 'Sciences Numériques et Technologie (SNT)',
            collections: 'Déclic (Hachette), SNT (Delagrave), Bordas',
            publishers: ['Hachette', 'Delagrave', 'Bordas'],
            track: 'tronc_commun',
          },
          {
            subject: 'Langues Vivantes (Anglais, Espagnol, Allemand)',
            collections: 'Shine Bright (Nathan - Anglais), Pura Vida (Maison des Langues - Espagnol), Fantastisch! (Maison des Langues - Allemand)',
            publishers: ['Nathan', 'Maison des Langues'],
            track: 'tronc_commun',
          },
        ],
      },
    ],
  },
  {
    gradeId: 'premiere',
    gradeTitle: 'Classe de Première',
    gradeDescription: "L'année de Première introduit les enseignements de spécialité, permettant d'approfondir trois disciplines spécifiques en plus du tronc commun.",
    sections: [
      {
        sectionTitle: 'Tronc Commun Obligatoire',
        items: [
          {
            subject: 'Français (Épreuves Anticipées du Bac)',
            collections: "L'Écume des lettres (Hachette), Empreintes Littéraires (Magnard)",
            publishers: ['Hachette', 'Magnard'],
            track: 'tronc_commun',
          },
          {
            subject: 'Histoire-Géographie',
            collections: 'Collection Le Quintrec / Cote (Nathan), Hatier',
            publishers: ['Nathan', 'Hatier'],
            track: 'tronc_commun',
          },
          {
            subject: 'Enseignement Scientifique',
            collections: 'Enseignement Scientifique (Hatier), Nathan, Bordas',
            publishers: ['Hatier', 'Nathan', 'Bordas'],
            track: 'tronc_commun',
          },
        ],
      },
      {
        sectionTitle: 'Enseignements de Spécialité (Choix de 3 matières)',
        items: [
          {
            subject: 'Spécialité Mathématiques',
            collections: 'Barbazo (Hachette), Indice (Bordas), Hyperbole (Nathan), Odyssée (Hatier)',
            publishers: ['Hachette', 'Bordas', 'Nathan', 'Hatier'],
            track: 'specialite',
          },
          {
            subject: 'Spécialité Physique-Chimie',
            collections: 'Sirius (Nathan), Microméga (Hatier)',
            publishers: ['Nathan', 'Hatier'],
            track: 'specialite',
          },
          {
            subject: 'Spécialité SVT',
            collections: 'Collection Baude-Jusserand (Bordas), SVT Lycée (Nathan)',
            publishers: ['Bordas', 'Nathan'],
            track: 'specialite',
          },
          {
            subject: 'Spécialité Sciences Économiques et Sociales (SES)',
            collections: 'Passerelles (Bordas), SES (Hatier), Belin Éducation',
            publishers: ['Bordas', 'Hatier', 'Belin Éducation'],
            track: 'specialite',
          },
          {
            subject: 'Histoire-Géo, Géopolitique et Sc. Politiques (HGGSP)',
            collections: 'HGGSP (Hatier), HGGSP (Nathan), Magnard',
            publishers: ['Hatier', 'Nathan', 'Magnard'],
            track: 'specialite',
          },
          {
            subject: 'Humanités, Littérature, Philosophie (HLP)',
            collections: 'HLP (Hatier), Nathan, Bordas',
            publishers: ['Hatier', 'Nathan', 'Bordas'],
            track: 'specialite',
          },
          {
            subject: 'Numérique et Sciences Informatiques (NSI)',
            collections: 'NSI (Ellipses), NSI (Hatier), Bordas',
            publishers: ['Ellipses', 'Hatier', 'Bordas'],
            track: 'specialite',
          },
          {
            subject: 'Langues, Littératures et Cultures Étrangères (LLCE)',
            collections: 'Meeting Point (Hatier), Bridges (Nathan)',
            publishers: ['Hatier', 'Nathan'],
            track: 'specialite',
          },
        ],
      },
    ],
  },
  {
    gradeId: 'terminale',
    gradeTitle: 'Classe de Terminale',
    gradeDescription: "L'année de Terminale conserve deux des trois spécialités choisies en Première et introduit la Philosophie dans le tronc commun, avec options facultatives.",
    sections: [
      {
        sectionTitle: 'Tronc Commun Obligatoire',
        items: [
          {
            subject: 'Philosophie',
            collections: 'Passerelles (Nathan), Philosophie (Hatier), La Philo en Terminale (Hachette)',
            publishers: ['Nathan', 'Hatier', 'Hachette'],
            track: 'tronc_commun',
          },
          {
            subject: 'Histoire-Géographie',
            collections: 'Collection Le Quintrec / Cote (Nathan), Hatier',
            publishers: ['Nathan', 'Hatier'],
            track: 'tronc_commun',
          },
          {
            subject: 'Enseignement Scientifique',
            collections: 'Enseignement Scientifique (Hatier), Bordas',
            publishers: ['Hatier', 'Bordas'],
            track: 'tronc_commun',
          },
        ],
      },
      {
        sectionTitle: 'Enseignements de Spécialité (2 matières conservées) & Options',
        items: [
          {
            subject: 'Spécialité Mathématiques',
            collections: 'Barbazo (Hachette), Indice (Bordas), Odyssée (Hatier)',
            publishers: ['Hachette', 'Bordas', 'Hatier'],
            track: 'specialite',
          },
          {
            subject: 'Mathématiques Expertes / Complémentaires (Options)',
            collections: 'Indice Maths Expertes/Complémentaires (Bordas), Hyperbole (Nathan)',
            publishers: ['Bordas', 'Nathan'],
            track: 'option',
          },
          {
            subject: 'Spécialité Physique-Chimie',
            collections: 'Sirius (Nathan), Microméga (Hatier)',
            publishers: ['Nathan', 'Hatier'],
            track: 'specialite',
          },
          {
            subject: 'Spécialité SVT',
            collections: 'Collection Baude-Jusserand (Bordas), SVT Lycée (Nathan)',
            publishers: ['Bordas', 'Nathan'],
            track: 'specialite',
          },
          {
            subject: 'Spécialité SES',
            collections: 'Passerelles (Bordas), Hatier, Magnard',
            publishers: ['Bordas', 'Hatier', 'Magnard'],
            track: 'specialite',
          },
          {
            subject: 'Spécialité HGGSP',
            collections: 'HGGSP (Hatier), HGGSP (Nathan)',
            publishers: ['Hatier', 'Nathan'],
            track: 'specialite',
          },
          {
            subject: 'Spécialité NSI',
            collections: 'NSI (Ellipses), Hatier',
            publishers: ['Ellipses', 'Hatier'],
            track: 'specialite',
          },
          {
            subject: 'Droit et Grands Enjeux du Monde Contemporain (DGEMC)',
            collections: 'DGEMC (Hatier), Nathan',
            publishers: ['Hatier', 'Nathan'],
            track: 'option',
          },
        ],
      },
    ],
  },
];
