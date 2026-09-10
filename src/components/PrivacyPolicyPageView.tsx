import React from 'react';
import {
  ShieldCheck,
  ArrowLeft,
  Lock,
  HardDrive,
  Cpu,
  EyeOff,
  FileCheck,
  CheckCircle2
} from 'lucide-react';
import { AppLanguage, AppTheme } from '../types';

interface PrivacyPolicyPageViewProps {
  onBack: () => void;
  lang?: AppLanguage;
  activeTheme?: AppTheme;
}

export const PrivacyPolicyPageView: React.FC<PrivacyPolicyPageViewProps> = ({
  onBack,
  lang = 'fr',
  activeTheme = 'dark',
}) => {
  const isFr = lang === 'fr';

  const privacyPoints = [
    {
      title: isFr ? '1. Stockage 100% Local (IndexedDB / LocalStorage)' : '1. 100% Local Storage',
      icon: HardDrive,
      color: 'text-indigo-400',
      description: isFr
        ? 'Tous vos cours, résumés, notes Cornell manuscrites, fiches de révision Anki et historiques de quiz sont enregistrés exclusivement dans le stockage local de votre navigateur ou de votre application de bureau. Aucune base de données centrale ne collecte vos écrits personnels.'
        : 'All notes, Cornell handwriting files, Anki decks, and quiz histories remain stored strictly within your browser/desktop local client storage.',
    },
    {
      title: isFr ? '2. Confidentialité & Absence de Pistage Tiers' : '2. No Third-Party Tracking',
      icon: EyeOff,
      color: 'text-emerald-400',
      description: isFr
        ? 'Degree Unlocker Academy ne vend, ne loue et ne partage aucune de vos données scolaires ou personnelles avec des régies publicitaires. Il n\'y a aucun traceur commercial ni cookie tiers intrusif.'
        : 'No telemetry, advertising cookies, or commercial trackers are integrated.',
    },
    {
      title: isFr ? '3. Traitement IA Éthique & Sans Réentraînement' : '3. Ethical AI & Zero Model Re-training',
      icon: Cpu,
      color: 'text-amber-400',
      description: isFr
        ? 'Lorsque vous sollicitez une synthèse de cours, une extraction de notions ou une aide socratique, le texte transmis est traité de manière éphémère par l\'API Gemini côté serveur sécurisé et n\'est jamais utilisé pour réentraîner des modèles publics.'
        : 'When requesting an AI summary or coaching, text is handled ephemerally via secure server routes and never retained for public model training.',
    },
    {
      title: isFr ? '4. Sauvegarde & Export Souverain' : '4. Data Sovereignty & Portability',
      icon: FileCheck,
      color: 'text-rose-400',
      description: isFr
        ? 'Vous restez l\'unique propriétaire de l\'intégralité de vos cours et notes. Vous pouvez à tout moment exporter votre base complète au format JSON ou PDF d\'un simple clic depuis le tableau de bord.'
        : 'You retain full ownership. Export your entire academy database anytime in JSON or individual notes in PDF.',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200 pb-16">
      
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isFr ? 'Retour au tableau de bord' : 'Back to Dashboard'}</span>
        </button>

        <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{isFr ? 'Conformité RGPD & Souveraineté' : 'GDPR & Privacy Compliant'}</span>
        </span>
      </div>

      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-600/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/15 text-emerald-300 border border-emerald-400/30 text-xs font-black uppercase tracking-wider">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>{isFr ? 'Engagement de Confidentialité' : 'Privacy Commitment'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isFr ? 'Protection des Données & Souveraineté de l\'Élève' : 'Data Protection & Student Privacy'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isFr
              ? 'Vos cours, vos devoirs et vos réflexions vous appartiennent. Notre architecture est pensée dès le départ pour préserver votre vie privée et garantir un fonctionnement hors-ligne sécurisé.'
              : 'Your coursework, assignments, and study thoughts belong exclusively to you.'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center shrink-0">
          <div className="text-emerald-400 font-mono text-sm font-bold">100% Chiffré Local</div>
          <div className="text-[11px] text-slate-400 mt-1">Zéro revente de données</div>
        </div>
      </div>

      {/* Grid of Key Commitments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {privacyPoints.map((point, idx) => {
          const Icon = point.icon;
          return (
            <div key={idx} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
                    <Icon className={`w-5 h-5 ${point.color}`} />
                  </div>
                  <h3 className="text-sm font-extrabold text-white">{point.title}</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {point.description}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 pt-3 border-t border-slate-800/80">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isFr ? 'Garanti par le protocole local' : 'Enforced via local-first runtime'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Terms Note */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-400 leading-relaxed">
        <p>
          {isFr
            ? 'Pour toute question relative à vos données ou pour supprimer intégralement vos données locales, utilisez l\'outil « Réinitialiser la base locale » accessible dans l\'onglet Base Locale de la barre de navigation ou du grand menu.'
            : 'To reset or delete all local data, visit the Local Database section and select Reset Database.'}
        </p>
      </div>

    </div>
  );
};
