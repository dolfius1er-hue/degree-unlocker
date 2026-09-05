import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Tag, 
  Search, 
  PenTool, 
  FileDown, 
  CheckCircle2, 
  Sparkles, 
  Volume2, 
  Layers, 
  HelpCircle,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { AppLanguage } from '../types';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSampleBlocknote?: () => void;
  lang?: AppLanguage;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  onOpenSampleBlocknote,
  lang = 'fr',
}) => {
  const [activeStep, setActiveStep] = useState(0);

  if (!isOpen) return null;

  const steps = lang === 'fr' ? [
    {
      id: 'step-intro',
      badge: 'Vue d\'ensemble',
      title: 'Bienvenue sur ScholarMind',
      subtitle: 'Votre base de connaissances scolaires du numérique au cahier d\'écolier',
      icon: <GraduationCap className="w-6 h-6 text-indigo-600" />,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            ScholarMind est conçu pour résoudre le dilemme de l'étudiant moderne : 
            <strong> centraliser ses cours numériques et PDF</strong> dans une base de données locale intelligente, 
            tout en <strong>facilitant la recopie manuscrite sur cahier</strong> pour une rétention mnémotechnique maximale.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-indigo-700 block mb-1">1. Numérique & Local</span>
              <p className="text-[11px] text-slate-600">Stockage 100% sur PC de vos cours saisis et PDF avec extraction automatique par IA.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-amber-700 block mb-1">2. Pédagogique</span>
              <p className="text-[11px] text-slate-600">Résumés Cornell, quiz QCM, atelier bilingue et recherche sémantique.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-emerald-700 block mb-1">3. Manuscrit & PDF</span>
              <p className="text-[11px] text-slate-600">Guides de recopie pas-à-pas avec dictée audio et export PDF format cahier d'écolier.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'step-tags',
      badge: 'Organisation & Filtres',
      title: 'Filtrer par Tags et Collections',
      subtitle: 'Retrouvez instantanément vos cours selon vos révisions',
      icon: <Tag className="w-6 h-6 text-indigo-600" />,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            Chaque note ou PDF importé peut être tagué (ex: <code>#ExamPrep</code>, <code>#Formules</code>, <code>#Chimie</code>).
          </p>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">Comment utiliser les filtres :</span>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600">
              <li><strong>Barre de Tags :</strong> Cliquez sur n'importe quel badge de tag en haut de la bibliothèque pour restreindre l'affichage aux fiches correspondantes.</li>
              <li><strong>Filtres par Matière :</strong> Filtrez en un clic par Biologie, Chimie, Mathématiques, Histoire, etc.</li>
              <li><strong>Filtres par Type :</strong> Isolez vos notes saisies ou vos documents PDF importés.</li>
              <li><strong>Recherche textuelle :</strong> Tapez n'importe quel mot-clé, formule ou terme clé dans la barre de recherche.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'step-blocknote',
      badge: 'Méthode Manuscrite',
      title: 'Le Compagnon Blocknote & Dictée',
      subtitle: 'Transcription physique active pour mémoriser durablement',
      icon: <PenTool className="w-6 h-6 text-amber-600" />,
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            La recopie manuscrite augmente la rétention mnémotechnique de <strong>35%</strong> par rapport à la simple lecture sur écran. 
            L'onglet <strong>Blocknote</strong> vous assiste pour recopier votre cours :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
              <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5 text-amber-700" />
                Papier d'écolier au choix
              </span>
              <p className="text-amber-800 text-[11px]">
                Choisissez entre <strong>Ligné classique</strong>, <strong>Grands Carreaux Seyès français</strong>, <strong>Petits Carreaux 5mm</strong> ou <strong>Bloc-notes jaune</strong>.
              </p>
            </div>

            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
              <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                Dictée vocale rythmée
              </span>
              <p className="text-amber-800 text-[11px]">
                Le bouton <strong>&laquo; Dicter au stylo &raquo;</strong> lit les phrases avec des pauses de 3 secondes pour vous laisser le temps d'écrire sans lever les yeux de votre feuille.
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            À mesure que vous écrivez sur votre cahier, cochez les lignes sur l'écran pour voir votre jauge de progression grimper jusqu'à 100%.
          </p>
        </div>
      ),
    },
    {
      id: 'step-pdf',
      badge: 'Export Cahier',
      title: 'Exporter en Cahier PDF Prêt à Imprimer',
      subtitle: 'Générez un véritable fichier PDF au format cahier d\'écolier A4',
      icon: <FileDown className="w-6 h-6 text-emerald-600" />,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            Vous préférez travailler sur papier imprimé ? 
            Vous pouvez <strong>exporter le guide sous forme de véritable fichier PDF téléchargeable</strong>.
          </p>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-2 text-xs text-emerald-950">
            <span className="font-bold flex items-center gap-1.5 text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Ce que contient le fichier PDF généré :
            </span>
            <ul className="list-disc list-inside space-y-1 text-emerald-900/90 text-[11px]">
              <li><strong>Trame authentique de cahier :</strong> Lignes Seyès françaises ou lignes réglées avec la <strong>marge rouge verticale</strong> d'écolier.</li>
              <li><strong>En-tête étudiant :</strong> Zone préremplie pour le Nom, la Date et la Matière.</li>
              <li><strong>Colonne de marge Cornell :</strong> Mots-clés, définitions et questions de révision inscrits dans la marge rouge.</li>
              <li><strong>Code couleur des stylos :</strong> Repères visuels pour stylo bleu, rouge, vert et violet.</li>
              <li><strong>Formules encadrées & bilan :</strong> Encadrés pointillés pour les lois fondamentales et bilan de fin de page.</li>
            </ul>
          </div>

          <p className="text-[11px] text-slate-600">
            Le fichier <code>.pdf</code> est téléchargé directement sur votre machine et prêt pour impression directe.
          </p>
        </div>
      ),
    },
  ] : [
    {
      id: 'step-intro',
      badge: 'Overview',
      title: 'Welcome to ScholarMind',
      subtitle: 'Your school knowledge base from digital notes to paper student notebooks',
      icon: <GraduationCap className="w-6 h-6 text-indigo-600" />,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            ScholarMind solves the student challenge: 
            <strong> centralize lecture notes and PDFs</strong> in an intelligent local database, 
            while <strong>facilitating handwriting reproduction in your physical notebook</strong> for peak mnemonic retention.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-indigo-700 block mb-1">1. Digital & Local</span>
              <p className="text-[11px] text-slate-600">100% on-device storage of notes and PDFs with AI-powered extraction.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-amber-700 block mb-1">2. Pedagogical</span>
              <p className="text-[11px] text-slate-600">Cornell summaries, MCQ quizzes, bilingual lab, and semantic search.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-emerald-700 block mb-1">3. Handwritten & PDF</span>
              <p className="text-[11px] text-slate-600">Step-by-step reproduction guides with audio dictation and printable notebook PDF export.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'step-tags',
      badge: 'Organization & Filters',
      title: 'Filter by Tags and Collections',
      subtitle: 'Instantly retrieve courses matching your revision goals',
      icon: <Tag className="w-6 h-6 text-indigo-600" />,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            Every note or uploaded PDF can be tagged (e.g., <code>#ExamPrep</code>, <code>#Formulas</code>, <code>#Chemistry</code>).
          </p>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">How to use filters:</span>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600">
              <li><strong>Tag Bar:</strong> Click any tag pill in the library header to filter notes matching the subject.</li>
              <li><strong>Subject Filter:</strong> Filter in one click by Biology, Chemistry, Mathematics, History, etc.</li>
              <li><strong>Type Filter:</strong> Isolate typed notes or uploaded PDF course sheets.</li>
              <li><strong>Full-text Search:</strong> Type any keyword, formula, or concept name in the search bar.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'step-blocknote',
      badge: 'Handwriting Method',
      title: 'The Blocknote Companion & Dictation',
      subtitle: 'Active physical transcription to remember concepts for exams',
      icon: <PenTool className="w-6 h-6 text-amber-600" />,
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            Handwriting notes increases mnemonic retention by <strong>35%</strong> compared to screen reading. 
            The <strong>Blocknote</strong> tab guides your handwriting process:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
              <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5 text-amber-700" />
                Selectable Paper Pattern
              </span>
              <p className="text-amber-800 text-[11px]">
                Choose between <strong>College Ruled</strong>, <strong>French Seyès Grid</strong>, <strong>5mm Graph</strong>, or <strong>Yellow Legal Pad</strong>.
              </p>
            </div>

            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
              <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                Paced Audio Dictation
              </span>
              <p className="text-amber-800 text-[11px]">
                Click <strong>&ldquo;Dictate to Pen&rdquo;</strong> to hear lines read aloud with 3-second pauses so you can write without looking at your screen.
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            As you write into your physical notebook, check off lines on screen to watch your paper progress reach 100%.
          </p>
        </div>
      ),
    },
    {
      id: 'step-pdf',
      badge: 'Notebook Export',
      title: 'Export as Printable Notebook PDF',
      subtitle: 'Generate a real A4 student notebook PDF ready for printing',
      icon: <FileDown className="w-6 h-6 text-emerald-600" />,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            Prefer working on paper without your laptop? 
            You can <strong>export the reproduction guide as a downloadable PDF</strong>.
          </p>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-2 text-xs text-emerald-950">
            <span className="font-bold flex items-center gap-1.5 text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              What the exported PDF includes:
            </span>
            <ul className="list-disc list-inside space-y-1 text-emerald-900/90 text-[11px]">
              <li><strong>Authentic notebook rulings:</strong> French Seyès grids or standard lines with a red vertical student margin.</li>
              <li><strong>Student Header:</strong> Prefilled field for Student Name, Date, and Subject.</li>
              <li><strong>Cornell Margin Column:</strong> High-yield keywords, definitions, and review cues.</li>
              <li><strong>4-Color Pen Codes:</strong> Clear visual cues for Blue, Red, Green, and Purple ink.</li>
              <li><strong>Framed Law Boxes & Summary:</strong> Dashed boxes for formulas and bottom page summary.</li>
            </ul>
          </div>

          <p className="text-[11px] text-slate-600">
            The <code>.pdf</code> file downloads straight to your device, ready for printing.
          </p>
        </div>
      ),
    },
  ];

  const current = steps[activeStep];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 sm:pt-12">
      <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'fr' ? 'Guide d\'Utilisation & Tutoriel' : 'User Guide & Tutorial'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {lang === 'fr' 
                  ? `Étape ${activeStep + 1} sur ${steps.length} • ${current.badge}`
                  : `Step ${activeStep + 1} of ${steps.length} • ${current.badge}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Dots / Tabs */}
        <div className="flex items-center border-b border-slate-100 px-6 py-2 bg-white gap-2 overflow-x-auto">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(idx)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeStep === idx
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{idx + 1}.</span>
              <span>{step.badge}</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 shrink-0">
              {current.icon}
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 leading-tight">
                {current.title}
              </h4>
              <p className="text-xs text-indigo-600 font-medium mt-0.5">
                {current.subtitle}
              </p>
            </div>
          </div>

          <div className="pt-2">
            {current.content}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 transition-colors"
          >
            {lang === 'fr' ? 'Précédent' : 'Previous'}
          </button>

          <div className="flex items-center gap-2">
            {activeStep === steps.length - 1 ? (
              <button
                onClick={() => {
                  onClose();
                  if (onOpenSampleBlocknote) onOpenSampleBlocknote();
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>{lang === 'fr' ? 'J\'ai compris, commencer !' : 'Got it, let\'s start!'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setActiveStep(prev => Math.min(steps.length - 1, prev + 1))}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>{lang === 'fr' ? 'Étape suivante' : 'Next Step'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
