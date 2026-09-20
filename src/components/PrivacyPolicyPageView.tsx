import React from 'react';
import {
  ShieldCheck,
  ArrowLeft,
  Lock,
  HardDrive,
  Cpu,
  EyeOff,
  FileCheck,
  CheckCircle2,
  Accessibility,
  UserCheck,
  Code2,
  AlertCircle,
  Mail,
  Scale
} from 'lucide-react';
import { AppLanguage, AppTheme } from '../types';
import { DisclaimerFooter } from './DisclaimerFooter';

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
        ? 'Tous vos cours, résumés, notes Cornell manuscrites, fiches de révision Anki et exercices sont enregistrés exclusivement dans le stockage local de votre navigateur ou de votre application. Aucune base de données centrale ne collecte vos écrits personnels.'
        : 'All notes, Cornell files, Anki decks, and textbook exercise records remain stored strictly within your browser/desktop local client storage.',
    },
    {
      title: isFr ? '2. Protection des Enfants & Majorité Numérique (COPPA & RGPD-K)' : "2. Children's Safety & COPPA Compliance",
      icon: UserCheck,
      color: 'text-rose-400',
      description: isFr
        ? 'Conformément au COPPA américain (15 U.S.C. § 6501-6506) et à l\'article 8 du RGPD, l\'application ne collecte sciemment aucune donnée personnelle d\'enfants de moins de 13 ans. Zéro ciblage publicitaire, zéro profilage comportemental.'
        : 'In strict adherence to COPPA and GDPR Article 8, no personal data from minors under 13 is collected or monetized. Zero behavioral tracking or advertising.',
    },
    {
      title: isFr ? '3. Accessibilité Universelle & Normes ADA Title III / Section 508' : '3. Universal ADA Title III & Section 508 Accessibility',
      icon: Accessibility,
      color: 'text-emerald-400',
      description: isFr
        ? 'Degree Unlocker Lite applique les critères WCAG 2.1 AA/AAA : navigation intégrale au clavier, support des polices DYS (OpenDyslexic, Luciole), synthèse vocale Text-to-Speech et respect du mode mouvement réduit.'
        : 'Full compliance with WCAG 2.1 AA/AAA, keyboard operability, DYS dyslexia typography, Text-to-Speech audio engine, and reduced motion sensitivity.',
    },
    {
      title: isFr ? '4. Confidentialité & Absence de Pistage Tiers' : '4. No Third-Party Tracking',
      icon: EyeOff,
      color: 'text-emerald-400',
      description: isFr
        ? 'Degree Unlocker Lite ne vend, ne loue et ne partage aucune de vos données scolaires ou personnelles avec des régies publicitaires. Il n\'y a aucun traceur commercial ni cookie tiers intrusif.'
        : 'No telemetry, advertising cookies, or commercial trackers are integrated.',
    },
    {
      title: isFr ? '5. Traitement IA Éthique & Sans Réentraînement' : '5. Ethical AI & Zero Model Re-training',
      icon: Cpu,
      color: 'text-amber-400',
      description: isFr
        ? 'Lorsque vous sollicitez une synthèse de cours ou une extraction de notions, le texte transmis est traité de manière éphémère par l\'API Gemini côté serveur sécurisé et n\'est jamais conservé ni utilisé pour réentraîner des modèles publics.'
        : 'When requesting an AI summary, text is handled ephemerally via secure server routes and never retained for public model training.',
    },
    {
      title: isFr ? '6. Souveraineté Éducative (FERPA & SOPIPA)' : '6. Student Data Sovereignty (FERPA)',
      icon: FileCheck,
      color: 'text-sky-400',
      description: isFr
        ? 'Vous restez l\'unique propriétaire de l\'intégralité de vos cours et devoirs selon les principes du Student Privacy Pledge. Vous pouvez à tout moment exporter votre base complète au format JSON ou PDF.'
        : 'You retain full ownership under FERPA and Student Privacy Pledge standards. Export your entire academy database anytime in JSON or individual notes in PDF.',
    },
    {
      title: isFr ? '7. Licences Typographiques Libres (OFL 1.1 / Apache 2.0)' : '7. Open Font Licensing & IP Clearance',
      icon: Code2,
      color: 'text-purple-400',
      description: isFr
        ? 'Toutes les polices de caractères utilisées (Outfit, Plus Jakarta Sans, Caveat, Kalam, Patrick Hand, OpenDyslexic, JetBrains Mono) sont certifiées sous licences libres (SIL OFL-1.1 / Apache 2.0) sans aucun risque de litige de droits d\'auteur.'
        : 'All integrated fonts are cleared and licensed under SIL Open Font License 1.1 or Apache 2.0 for legitimate distribution.',
    },
    {
      title: isFr ? '8. Non-Recours Collectif & Règlement Amiable' : '8. Dispute Resolution & Class Action Waiver',
      icon: Scale,
      color: 'text-indigo-400',
      description: isFr
        ? 'En utilisant l\'application, les utilisateurs acceptent de soumettre tout différend à un règlement amiable direct et renoncent expressément à engager toute action collective ou recours en classe de plaignants.'
        : 'Users agree to good-faith individual dispute resolution with the development team and waive rights to participate in class-action lawsuits.',
    },
    {
      title: isFr ? '9. Clause de Petite Équipe, Transparence & Amélioration Quotidienne' : '9. Small Team & Continuous Daily Improvements',
      icon: UserCheck,
      color: 'text-amber-400',
      description: isFr
        ? 'Nous sommes une petite équipe indépendante et passionnée. Tout n\'est pas parfait et nous ne pouvons garantir une absence totale d\'anomalies selon vos équipements, mais nous améliorons l\'application au jour le jour. Si vous avez besoin de quoi que ce soit ou rencontrez un problème, écrivez-nous à degreeunlocker.devteam@yahoo.com.'
        : 'We are a small, dedicated independent team. Not everything is flawless yet, but we iterate and improve daily. Reach out anytime at degreeunlocker.devteam@yahoo.com if you encounter any issue or need a specific accommodation.',
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
          <span>{isFr ? 'Conformité RGPD, ADA, COPPA & FERPA' : 'GDPR, ADA, COPPA & FERPA Compliant'}</span>
        </span>
      </div>

      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-600/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/15 text-emerald-300 border border-emerald-400/30 text-xs font-black uppercase tracking-wider">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>{isFr ? 'Protection Juridique & Confidentialité' : 'Legal & Privacy Compliance'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isFr ? 'Charte de Confidentialité, Accessibilité ADA & Sécurité' : 'Privacy, ADA Accessibility & Student Safety'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isFr
              ? 'Vos cours, vos devoirs et vos réflexions vous appartiennent. Notre architecture est conçue dès le départ pour préserver votre vie privée, respecter les normes d\'accessibilité universelles ADA et garantir la protection des mineurs.'
              : 'Your coursework and personal notes belong exclusively to you. Our architecture is designed from the ground up for strict privacy, full ADA accessibility, and children’s online safety.'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center shrink-0">
          <div className="text-emerald-400 font-mono text-sm font-bold">100% Chiffré Local</div>
          <div className="text-[11px] text-slate-400 mt-1">ADA &bull; COPPA &bull; RGPD</div>
        </div>
      </div>

      {/* Grid of Key Commitments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {privacyPoints.map((point, idx) => {
          const Icon = point.icon;
          return (
            <div key={idx} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
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
                <span>{isFr ? 'Garanti par le protocole sécurisé' : 'Certified Safe Protocol'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dedicated Legal and DMCA Notice */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-3 text-xs text-slate-300">
        <div className="flex items-center gap-2 font-bold text-white text-sm">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>{isFr ? 'Contact Officiel, Agent DMCA & Référent Accessibilité ADA' : 'Official Contacts, DMCA Agent & ADA Officer'}</span>
        </div>
        <p className="leading-relaxed text-slate-400">
          {isFr
            ? 'Pour toute demande d\'effacement de données, signalement d\'un obstacle d\'accessibilité (ADA/Section 508), notification de retrait de droit d\'auteur (DMCA) ou question relative à la protection des mineurs, contactez notre équipe officielle avec réponse garantie sous 48h :'
            : 'For data deletion requests, accessibility barrier reports (ADA/Section 508), DMCA copyright notifications, or minor privacy inquiries, contact our team with guaranteed 48-hour response:'}
        </p>
        <div className="flex flex-wrap items-center gap-4 font-mono text-xs pt-1">
          <a
            href="mailto:degreeunlocker.devteam@yahoo.com"
            className="text-amber-300 hover:text-amber-200 font-bold underline"
          >
            degreeunlocker.devteam@yahoo.com
          </a>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">DPO : <strong className="text-slate-200">dolfius1er@gmail.com</strong></span>
        </div>
      </div>

      {/* Professional Legal & Development Disclaimer Footer */}
      <DisclaimerFooter
        lang={lang}
      />

    </div>
  );
};

export default PrivacyPolicyPageView;
