import React from 'react';
import { 
  Crown, 
  Sparkles, 
  UserCheck, 
  Award, 
  Heart, 
  ShieldCheck, 
  Code2, 
  X, 
  GraduationCap, 
  Star,
  Terminal,
  Cpu,
  Tv,
  Mail,
  MessageSquare
} from 'lucide-react';
import { AppLanguage } from '../types';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: AppLanguage;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ isOpen, onClose, lang = 'fr' }) => {
  if (!isOpen) return null;

  const isFr = lang === 'fr';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="win11-window w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl border border-amber-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-6 border-b border-amber-500/30 bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
              <Crown className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-amber-200 tracking-tight">
                  {isFr ? 'Crédits & Générique' : 'Show Credits & Creators'}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-amber-400 text-slate-950 rounded-full">
                  OFFICIEL
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {isFr ? "Ceux grâce à qui l'application DegreeUnlocker est née" : 'The minds and visionaries behind DegreeUnlocker'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          
          {/* Creator Section */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-900/30 border border-amber-400/50 space-y-3 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isFr ? 'Créateur Fondateur' : 'Main Creator'}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl font-black border-2 border-amber-200 shadow-md">
                👑
              </div>
              <div>
                <h4 className="text-xl font-black text-white flex items-center gap-2">
                  Dolfius 1er
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/30 text-amber-300 font-bold border border-amber-400/40">
                    Fondateur
                  </span>
                </h4>
                <p className="text-xs text-amber-200/90 font-medium mt-0.5">
                  {isFr ? 'Initiateur du projet, Directeur de Création & Architecte de la Vision' : 'Project Founder & Chief Architect'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-amber-500/20">
              {isFr 
                ? "À l'origine de DegreeUnlocker : la volonté de révolutionner la révision scolaire avec une plateforme ultra-rapide, souveraine, hautement personnalisable et accessible partout hors-ligne."
                : "The driving force behind DegreeUnlocker: transforming academic review with speed, offline accessibility, and interactive mastery."
              }
            </p>
          </div>

          {/* Testers Section */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-300 font-extrabold text-xs uppercase tracking-wider">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                <span>{isFr ? 'Bêta-Testeurs & Débuggers Officiels' : 'Official Beta Testers & Bug Hunters'}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {isFr ? 'Session Bêta Active' : 'Active Beta Session'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* L0fya */}
              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-400/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 font-black text-sm shrink-0">
                  ⚡
                </div>
                <div>
                  <div className="text-sm font-bold text-indigo-100 flex items-center gap-1.5">
                    L0fya
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-[11px] text-indigo-300/80">
                    {isFr ? 'Bêta-Testeur Officiel & Spécialiste Exécutable PC' : 'Official Beta Tester & Desktop Build Specialist'}
                  </div>
                </div>
              </div>

              {/* Black2Myth */}
              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-400/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 font-black text-sm shrink-0">
                  🛡️
                </div>
                <div>
                  <div className="text-sm font-bold text-purple-100 flex items-center gap-1.5">
                    Black2Myth
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  </div>
                  <div className="text-[11px] text-purple-300/80">
                    {isFr ? 'Bêta-Testeur Officiel & Détection de Bugs' : 'Official Beta Tester & QA Specialist'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dev Team & Support Contact Section */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-400/50 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-300 font-extrabold text-xs uppercase tracking-wider">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>{isFr ? 'Équipe de Développement & Support' : 'Dev Team & Support'}</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-indigo-500/30 text-indigo-200 rounded-full border border-indigo-400/30">
                TEAM OFFICIELLE
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-black/50 border border-indigo-500/30 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-black text-amber-200">
                  <MessageSquare className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>degreeunlocker.devteam@yahoo.com</span>
                </div>
                <a 
                  href="mailto:degreeunlocker.devteam@yahoo.com"
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm text-center shrink-0 cursor-pointer"
                >
                  {isFr ? 'Envoyer un Email' : 'Send Email'}
                </a>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium pt-1 border-t border-white/10">
                {isFr 
                  ? "En cas de problème, veuillez utiliser cet email pour contacter l'équipe. Elle fera tout son possible pour régler les problèmes."
                  : "In case of any issue or feedback, please reach out to the team via this email. We will do everything possible to assist you."
                }
              </p>
            </div>
          </div>

          {/* Special Thanks & Technologies */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase tracking-wider">
              <Award className="w-4 h-4 text-amber-400" />
              <span>{isFr ? 'Technologies & Communauté' : 'Core Architecture'}</span>
            </div>
            
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" /> React 18 & TypeScript
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-400" /> Windows Native Launcher (.EXE)
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Firebase Open Sync
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
            <span>{isFr ? 'Merci à toute l\'équipe pour les retours précieux !' : 'Thank you to the whole team!'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition-all cursor-pointer shadow-md"
          >
            {isFr ? 'Fermer' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditsModal;
