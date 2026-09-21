import React from 'react';
import {
  Accessibility,
  ArrowLeft,
  CheckCircle2,
  Eye,
  Keyboard,
  Contrast,
  Volume2,
  Sparkles,
  ShieldCheck,
  Mail,
  Zap
} from 'lucide-react';
import { AppLanguage } from '../types';
import { DisclaimerFooter } from './DisclaimerFooter';

interface AccessibilityPageViewProps {
  onBack: () => void;
  lang?: AppLanguage;
}

export const AccessibilityPageView: React.FC<AccessibilityPageViewProps> = ({
  onBack,
  lang = 'fr',
}) => {
  const isFr = lang === 'fr';

  const adaFeatures = [
    {
      title: isFr ? '1. Navigation Intégrale au Clavier (Keyboard Accessible)' : '1. Full Keyboard Navigation',
      icon: Keyboard,
      color: 'text-indigo-400',
      description: isFr
        ? 'L\'ensemble des fonctionnalités, formulaires, fiches de révision et boutons est accessible au clavier via les touches Tab, Entrée, Espace et Échap. Des contours de focalisation (focus rings) haute visibilité sont intégrés pour chaque contrôle.'
        : 'All features, forms, study decks, and buttons can be operated via keyboard (Tab, Enter, Space, Esc) with high-visibility focus indicators.',
    },
    {
      title: isFr ? '2. Contraste Visuel & Conformité WCAG 2.1 AA' : '2. High Contrast & WCAG 2.1 AA',
      icon: Contrast,
      color: 'text-amber-400',
      description: isFr
        ? 'Les ratios de contraste de texte et des éléments interactifs respectent le seuil minimal de 4.5:1 exigé par les normes WCAG 2.1 niveau AA. Les modes Sombre et Clair sont optimisés pour réduire la fatigue oculaire.'
        : 'Text and interactive elements exceed the 4.5:1 contrast ratio required by WCAG 2.1 AA standards. Dark and Light themes prevent eye strain.',
    },
    {
      title: isFr ? '3. Compatibilité Lecteurs d\'Écran (Screen Readers & ARIA)' : '3. Screen Reader Compatibility',
      icon: Eye,
      color: 'text-emerald-400',
      description: isFr
        ? 'La structure sémantique utilise des repères HTML5 (header, main, nav, aside), des rôles ARIA explicites et des annonces dynamiques pour tenir informés les utilisateurs d\'outils d\'assistance (NVDA, JAWS, VoiceOver).'
        : 'Semantic HTML5 landmarks (header, main, nav), explicit ARIA roles, and aria-live regions keep assistive tech users informed.',
    },
    {
      title: isFr ? '4. Synthèse Vocale & Aide Auditive (Text-to-Speech)' : '4. Text-to-Speech & Audio Learning',
      icon: Volume2,
      color: 'text-sky-400',
      description: isFr
        ? 'Un moteur de lecture vocale haute fidélité permet d\'écouter les synthèses de cours, les questions de quiz et les flashcards avec contrôle précis de la vitesse d\'élocution.'
        : 'An integrated speech synthesis engine enables listening to course notes, flashcards, and exam questions at adjustable speeds.',
    },
    {
      title: isFr ? '5. Respect des Préférences de Mouvement Réduit' : '5. Reduced Motion Support',
      icon: Sparkles,
      color: 'text-purple-400',
      description: isFr
        ? 'L\'application honore les réglages système "prefers-reduced-motion". Les animations intenses sont atténuées ou désactivées pour les personnes sensibles aux effets visuels ou souffrant de troubles vestibulaires.'
        : 'The interface respects system "prefers-reduced-motion" settings to eliminate dizzying animations for vestibular motion sensitivity.',
    },
    {
      title: isFr ? '6. Protection des Utilisateurs & Respect de l\'Âge Légal' : '6. User Protection & Legal Age Gate',
      icon: ShieldCheck,
      color: 'text-rose-400',
      description: isFr
        ? 'Un module de vérification d\'âge (15 ans minimum) et des garde-fous de confirmation avec option d\'annulation (Undo) protègent les utilisateurs contre les pertes accidentelles de données.'
        : 'Digital age verification (15+ requirement) and confirmation undo safeguards protect users from accidental data loss.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 flex justify-center selection:bg-indigo-500 selection:text-white">
      <main id="main-content" className="w-full max-w-4xl space-y-8 animate-in fade-in duration-200">
        {/* Navigation Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors text-sm font-semibold cursor-pointer shadow-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            aria-label={isFr ? "Retour à l'application" : "Back to application"}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isFr ? 'Retour à l\'application' : 'Back to App'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Conforme WCAG 2.1 AA / ADA</span>
            </span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 mb-2 shadow-lg shadow-indigo-950/50">
            <Accessibility className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isFr ? 'Déclaration d\'Accessibilité & Conformité ADA' : 'Accessibility Statement & ADA Compliance'}
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {isFr
              ? 'Degree Unlocker s\'engage à garantir l\'égalité d\'accès à l\'éducation et aux outils de révision pour tous les apprenants, quelles que soient leurs capacités physiques ou cognitives.'
              : 'Degree Unlocker is committed to providing equal access to education and study tools for all learners, regardless of physical or cognitive abilities.'}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <section aria-label={isFr ? "Fonctionnalités d'accessibilité" : "Accessibility Features"} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adaFeatures.map((item, idx) => {
            const Icon = item.icon;
            return (
              <article
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 space-y-2.5 shadow-sm hover:border-slate-700/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="font-bold text-sm text-white">{item.title}</h2>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pl-1">
                  {item.description}
                </p>
              </article>
            );
          })}
        </section>

        {/* Keyboard Shortcuts Summary */}
        <section aria-label={isFr ? "Raccourcis clavier essentiels" : "Keyboard Shortcuts"} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base text-white">
              {isFr ? 'Raccourcis Clavier & Aide Rapide' : 'Keyboard Navigation Guide'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/60">
              <kbd className="px-2 py-1 rounded-md bg-slate-800 text-indigo-300 font-mono text-[11px] font-bold">Tab / Shift+Tab</kbd>
              <p className="text-slate-400 mt-2">{isFr ? 'Naviguer entre les éléments interactifs' : 'Cycle through interactive elements'}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/60">
              <kbd className="px-2 py-1 rounded-md bg-slate-800 text-indigo-300 font-mono text-[11px] font-bold">Entrée / Espace</kbd>
              <p className="text-slate-400 mt-2">{isFr ? 'Activer un bouton, quiz ou flashcard' : 'Activate button, quiz or flip flashcard'}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/60">
              <kbd className="px-2 py-1 rounded-md bg-slate-800 text-indigo-300 font-mono text-[11px] font-bold">Échap (Esc)</kbd>
              <p className="text-slate-400 mt-2">{isFr ? 'Fermer une modale ou un menu' : 'Close open modal or menu'}</p>
            </div>
          </div>
        </section>

        {/* Feedback and Contact Channel */}
        <section aria-label={isFr ? "Contact pour l'accessibilité" : "Accessibility Contact"} className="p-6 rounded-3xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-200 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-white">
            <Mail className="w-4 h-4 text-indigo-400" />
            <span>{isFr ? 'Signaler une difficulté d\'accessibilité' : 'Accessibility Feedback & Assistance'}</span>
          </div>
          <p className="text-xs text-indigo-200/90 leading-relaxed">
            {isFr
              ? 'Si vous rencontrez un obstacle d\'accessibilité ou si vous souhaitez suggérer des améliorations pour les technologies d\'assistance, contactez directement notre équipe : '
              : 'If you encounter an accessibility barrier or require assistance, please contact our team at: '}
            <a href="mailto:degreeunlocker.devteam@yahoo.com" className="text-white font-bold underline font-mono ml-1">degreeunlocker.devteam@yahoo.com</a>.
            {isFr ? ' Nous accordons la priorité absolue aux aménagements pour les élèves.' : ' We prioritize student accessibility accommodations.'}
          </p>
        </section>

        {/* Professional Disclaimer & Legal Notice Footer */}
        <DisclaimerFooter
          lang={lang}
        />
      </main>
    </div>
  );
};

export default AccessibilityPageView;
