import React, { useState } from 'react';
import { NOTE_TAKING_GUIDE } from '../data/noteTakingGuide';
import { AppLanguage, AppTheme, NavTabType } from '../types';
import {
  Lightbulb,
  ArrowLeft,
  CheckCircle,
  Columns,
  Palette,
  PenTool,
  Clock,
  ShieldCheck,
  Sparkles,
  BookOpen,
  FileText
} from 'lucide-react';

interface NoteTakingTipsPageViewProps {
  onBack?: () => void;
  onNavigate?: (tab: NavTabType) => void;
  onOpenDocInBlocknote?: (title: string, subject: string, content: string) => void;
  lang?: AppLanguage;
  activeTheme?: AppTheme;
}

export const NoteTakingTipsPageView: React.FC<NoteTakingTipsPageViewProps> = ({
  onBack,
  onNavigate,
  onOpenDocInBlocknote,
  lang = 'fr',
  activeTheme = 'dark',
}) => {
  const isFr = lang === 'fr';
  const [activeSectionId, setActiveSectionId] = useState<string>(NOTE_TAKING_GUIDE[0]?.id || 'cornell-method');

  const currentSection = NOTE_TAKING_GUIDE.find(s => s.id === activeSectionId) || NOTE_TAKING_GUIDE[0];

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else if (onNavigate) {
      onNavigate('dashboard');
    }
  };

  const getSectionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Columns': return <Columns className="w-4 h-4 text-indigo-400" />;
      case 'Palette': return <Palette className="w-4 h-4 text-emerald-400" />;
      case 'PenTool': return <PenTool className="w-4 h-4 text-amber-400" />;
      case 'Clock': return <Clock className="w-4 h-4 text-rose-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4 text-purple-400" />;
      default: return <BookOpen className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200 pb-16">
      
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isFr ? 'Retour au tableau de bord' : 'Back to Dashboard'}</span>
        </button>

        <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
          {isFr ? 'Pédagogie & Neurosciences' : 'Cognitive Learning'}
        </span>
      </div>

      {/* Page Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 border border-amber-600/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 text-xs font-black uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>{isFr ? 'Guide de Méthodologie' : 'Methodology Guide'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isFr ? 'L\'Art de la Prise de Notes Manuscrite Efficace' : 'Effective Handwritten Note-Taking'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isFr
              ? 'Basé sur les travaux scientifiques de l\'Université Cornell et les recherches en psychologie cognitive sur l\'encodage mnésique gestuel.'
              : 'Scientifically grounded techniques based on Cornell University and cognitive memory retention research.'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center shrink-0">
          <div className="text-2xl font-black text-amber-400">+34%</div>
          <div className="text-[11px] text-slate-300 max-w-[140px] leading-tight mt-1">
            {isFr ? 'de rétention à long terme par rapport au tapuscrit' : 'long-term retention vs verbatim typing'}
          </div>
        </div>
      </div>

      {/* Main Grid with Sidebar Sections and Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Navigation Buttons */}
        <div className="md:col-span-4 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
            {isFr ? 'Chapitres de la méthode :' : 'Method Chapters:'}
          </div>
          {NOTE_TAKING_GUIDE.map((section) => {
            const isSelected = section.id === activeSectionId;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSectionId(section.id)}
                className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-start gap-3 border cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-md'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${isSelected ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'}`}>
                  {getSectionIcon(section.icon)}
                </div>
                <div>
                  <div className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                    {isFr ? section.titleFr : section.titleEn}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {section.badge}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Detail Panel */}
        <div className="md:col-span-8 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          {currentSection && (
            <>
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                  {currentSection.badge}
                </span>
                <h2 className="text-xl font-black text-white mt-1">
                  {isFr ? currentSection.titleFr : currentSection.titleEn}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed mt-2">
                  {isFr ? currentSection.summaryFr : currentSection.summaryEn}
                </p>
              </div>

              {/* Actionable Advice List */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {isFr ? 'Règles d\'or & Recommandations concrètes :' : 'Actionable Rules & Best Practices:'}
                </div>
                {(isFr ? currentSection.stepsFr : currentSection.stepsEn).map((step, index) => (
                  <div key={index} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>

              {/* Golden Rule Callout */}
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isFr ? 'Règle Fondamentale :' : 'Golden Rule:'}</span>
                </div>
                <div className="text-xs text-slate-200 leading-relaxed">
                  {isFr ? currentSection.goldenRuleFr : currentSection.goldenRuleEn}
                </div>
              </div>

              {/* Practical Action Button: Open Blocknote */}
              {onOpenDocInBlocknote && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      const title = isFr ? currentSection.titleFr : currentSection.titleEn;
                      const content = `# ${title}\n\n**${currentSection.badge}**\n\n${isFr ? currentSection.summaryFr : currentSection.summaryEn}\n\n### Étapes Clés\n${(isFr ? currentSection.stepsFr : currentSection.stepsEn).map(s => `- ${s}`).join('\n')}\n\n> ${isFr ? currentSection.goldenRuleFr : currentSection.goldenRuleEn}`;
                      onOpenDocInBlocknote(title, 'Méthodologie', content);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{isFr ? 'Mettre en pratique dans le Bloc-Notes' : 'Apply in Blocknote Notebook'}</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};
