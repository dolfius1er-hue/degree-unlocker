import React, { useState } from 'react';
import { NOTE_TAKING_GUIDE } from '../data/noteTakingGuide';
import { AppLanguage } from '../types';
import { 
  Lightbulb, 
  X, 
  CheckCircle, 
  Columns, 
  Palette, 
  PenTool, 
  Clock, 
  ShieldCheck,
  Sparkles,
  BookOpen,
  Award
} from 'lucide-react';

interface NoteTakingTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
}

export const NoteTakingTipsModal: React.FC<NoteTakingTipsModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<string>(NOTE_TAKING_GUIDE[0].id);

  if (!isOpen) return null;

  const currentSection = NOTE_TAKING_GUIDE.find(s => s.id === activeTab) || NOTE_TAKING_GUIDE[0];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Columns': return <Columns className="w-4 h-4 text-indigo-600" />;
      case 'Palette': return <Palette className="w-4 h-4 text-emerald-600" />;
      case 'PenTool': return <PenTool className="w-4 h-4 text-purple-600" />;
      case 'Clock': return <Clock className="w-4 h-4 text-amber-600" />;
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4 text-rose-600" />;
      default: return <BookOpen className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-start justify-center p-4 sm:pt-12">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-amber-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-600 text-white shadow-xs">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>
                  {lang === 'fr' 
                    ? 'Guide & Astuces pour Réussir ses Prises de Notes' 
                    : 'Master Guide & Practical Tips for Better Note-Taking'}
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                  {lang === 'fr' ? 'Méthode Recommandée' : 'Gold Standard'}
                </span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {lang === 'fr'
                  ? 'Organisation Cornell, code couleur Bic 4 couleurs, mémorisation active et rigueur des sources.'
                  : 'Cornell layout, 4-color pen allocation, active recall, and source verification principles.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto scrollbar-thin text-xs">
          {NOTE_TAKING_GUIDE.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === section.id
                  ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {getIcon(section.icon)}
              <span>{lang === 'fr' ? section.titleFr.split('(')[0] : section.titleEn.split('(')[0]}</span>
            </button>
          ))}
        </div>

        {/* Main Content Pane */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-5">
          {/* Top Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs shrink-0">
              {getIcon(currentSection.icon)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  {lang === 'fr' ? currentSection.titleFr : currentSection.titleEn}
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {currentSection.badge}
                </span>
              </div>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                {lang === 'fr' ? currentSection.summaryFr : currentSection.summaryEn}
              </p>
            </div>
          </div>

          {/* Actionable Steps */}
          <div>
            <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === 'fr' ? 'Méthodologie Étape par Étape :' : 'Step-by-Step Methodology:'}</span>
            </h5>

            <div className="space-y-2.5">
              {(lang === 'fr' ? currentSection.stepsFr : currentSection.stepsEn).map((step, idx) => (
                <div 
                  key={idx} 
                  className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                    {idx + 1}
                  </span>
                  <p className="text-slate-700 text-xs leading-relaxed">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Golden Rule Callout */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-700 shrink-0" />
            <p className="font-semibold text-xs leading-normal">
              {lang === 'fr' ? currentSection.goldenRuleFr : currentSection.goldenRuleEn}
            </p>
          </div>

          {/* Quick interactive checklist */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h5 className="font-bold text-slate-800 text-xs mb-2">
              {lang === 'fr' ? '✅ Checklist de vérification de votre page de cours :' : '✅ Quick Page Quality Checklist:'}
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-0" />
                <span>{lang === 'fr' ? 'Marge gauche libre pour les questions' : 'Cue margin left open for questions'}</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-0" />
                <span>{lang === 'fr' ? 'Formules & définitions encadrées en rouge' : 'Key formulas framed in red box'}</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-0" />
                <span>{lang === 'fr' ? 'Ligne sautée entre chaque section' : 'Blank line skipped between ideas'}</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-0" />
                <span>{lang === 'fr' ? 'Résumé en 2-3 phrases en bas de page' : 'Bottom 2-3 sentence summary written'}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            {lang === 'fr' 
              ? 'Appliquez ces conseils dans le mode Blocknote et exportez vos cahiers en PDF' 
              : 'Apply these guidelines in Blocknote mode and export printable notebooks'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors"
          >
            {lang === 'fr' ? 'Compris !' : 'Got it!'}
          </button>
        </div>

      </div>
    </div>
  );
};
