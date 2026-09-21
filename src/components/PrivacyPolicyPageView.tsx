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
      title: isFr ? '1. Stockage Local par Défaut & Synchronisation Cloud Chiffrée' : '1. Local-First Storage & Optional Cloud Sync',
      icon: HardDrive,
      color: 'text-indigo-400',
      description: isFr
        ? 'Par défaut, vos cours, fiches, flashcards et notes sont stockés exclusivement sur votre appareil (IndexedDB / LocalStorage). Si vous choisissez de vous connecter avec un compte, une copie synchronisée et chiffrée est créée sur nos serveurs européens Google Cloud Firebase afin de vous permettre d’accéder à vos révisions depuis votre ordinateur et votre smartphone.'
        : 'By default, your notes, decks, and study files are stored locally on your device. When you log in, encrypted synchronization copies are stored on EU-based Google Cloud Firebase to enable seamless cross-device revision between desktop and mobile.',
    },
    {
      title: isFr ? '2. Majorité Numérique (15 Ans) & Protection des Élèves' : "2. Digital Age of Consent (15+) & Student Safety",
      icon: UserCheck,
      color: 'text-rose-400',
      description: isFr
        ? 'Conformément à la loi française sur la majorité numérique (loi n° 2018-493) et à l’article 8 du RGPD, l’accès autonome est fixé à 15 ans révolus. Pour les élèves de moins de 15 ans, l’utilisation requiert l’accord d’un parent ou représentant légal. Aucune donnée d’élève n’est revendue ni profilée à des fins publicitaires.'
        : 'In accordance with French digital age regulations and GDPR Article 8, standalone use is for students 15 years and older, or with parental/educator consent. Zero advertising profiling.',
    },
    {
      title: isFr ? '3. Accessibilité Numérique (RGAA & WCAG 2.1 AA)' : '3. Accessibility Standards (RGAA & WCAG 2.1 AA)',
      icon: Accessibility,
      color: 'text-emerald-400',
      description: isFr
        ? 'Degree Unlocker respecte les recommandations du RGAA et WCAG 2.1 niveau AA : navigation intégrale au clavier, polices adaptées aux élèves dyslexiques (OpenDyslexic), synthèse vocale, contrastes élevés et respect des préférences de mouvement réduit.'
        : 'Degree Unlocker adheres to RGAA and WCAG 2.1 AA accessibility guidelines: full keyboard navigation, dyslexia-friendly typography, high contrast ratios, and reduced motion settings.',
    },
    {
      title: isFr ? '4. Absence Totale de Pistage & Publicité' : '4. Zero Tracking & No Commercial Ads',
      icon: EyeOff,
      color: 'text-emerald-400',
      description: isFr
        ? 'L’application ne contient aucun traceur publicitaire, aucun cookie marketing tiers et ne revend aucune donnée scolaire. Vos révisions restent strictement privées.'
        : 'Zero commercial ads, zero marketing cookies, and zero sale of academic data.',
    },
    {
      title: isFr ? '5. Traitement IA Éthique & Sans Réentraînement' : '5. Ethical AI & Zero Model Re-training',
      icon: Cpu,
      color: 'text-amber-400',
      description: isFr
        ? 'Les fonctionnalités d’aide à la révision et de résumé s’appuient sur l’API Gemini de manière strictement éphémère. Vos cours ne sont jamais utilisés pour entraîner ou réentraîner des modèles publics tiers.'
        : 'Course summaries and study aids use the Gemini API ephemerally. Your study notes are never used to train public machine learning models.',
    },
    {
      title: isFr ? '6. Souveraineté & Portabilité des Données (Art. 20 RGPD)' : '6. Data Sovereignty & Portability (Art. 20 GDPR)',
      icon: FileCheck,
      color: 'text-sky-400',
      description: isFr
        ? 'Vous restez le propriétaire exclusif de l’ensemble de vos cours et fiches. Vous pouvez à tout moment exporter l’intégralité de vos données au format standard JSON ou télécharger vos fiches en PDF d’un simple clic.'
        : 'You own 100% of your coursework. Export your entire study database anytime in standard JSON format or download individual sheets as PDF.',
    },
    {
      title: isFr ? '7. Droits RGPD, Délégué aux Données & Réclamation CNIL' : '7. GDPR Rights & CNIL Redress',
      icon: Scale,
      color: 'text-purple-400',
      description: isFr
        ? 'Vous disposez d’un droit d’accès, de rectification, de portabilité et d’effacement immédiat de vos données (art. 15 à 21 RGPD). Pour toute question, contactez notre équipe à degreeunlocker.devteam@yahoo.com (DPO : dolfius1er@gmail.com). Vous pouvez également introduire une réclamation auprès de la CNIL (cnil.fr).'
        : 'You hold full rights of access, rectification, portability, and permanent erasure under GDPR Articles 15-21. Reach our team at degreeunlocker.devteam@yahoo.com (DPO: dolfius1er@gmail.com). You may also lodge a complaint with the CNIL data authority (cnil.fr).',
    },
    {
      title: isFr ? '8. Avertissement Pédagogique (Pas de Délivrance de Diplôme)' : '8. Academic Disclaimer (No Degree Issuance)',
      icon: Scale,
      color: 'text-indigo-400',
      description: isFr
        ? 'Degree Unlocker est un outil logiciel d’organisation et de révision méthodologique. L’application n’est pas un établissement d’enseignement et ne délivre aucun diplôme officiel, certification d’État ni validation académique.'
        : 'Degree Unlocker is a private revision and study workflow application. It is not an educational institution and does not issue any diplomas or official state certifications.',
    },
    {
      title: isFr ? '9. Contact Officiel & Support Pédagogique' : '9. Official Contact & Support',
      icon: UserCheck,
      color: 'text-amber-400',
      description: isFr
        ? 'Une question, une suggestion pédagogique ou un besoin d’aménagement d’accessibilité ? Écrivez à notre équipe à degreeunlocker.devteam@yahoo.com. Nous répondons à toutes les demandes avec bienveillance.'
        : 'Questions or accessibility accommodation requests? Contact our team anytime at degreeunlocker.devteam@yahoo.com.',
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
          <span>{isFr ? 'Protection RGPD & Accessibilité RGAA / WCAG 2.1 AA' : 'GDPR & RGAA / WCAG 2.1 AA Compliant'}</span>
        </span>
      </div>

      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-600/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/15 text-emerald-300 border border-emerald-400/30 text-xs font-black uppercase tracking-wider">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>{isFr ? 'Protection Juridique & Données Personnelles' : 'Legal & Privacy Compliance'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isFr ? 'Charte de Confidentialité & Engagement RGPD' : 'Privacy Policy & GDPR Statement'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isFr
              ? 'Vos cours, vos devoirs et vos réflexions vous appartiennent. Notre architecture est conçue dès le départ pour préserver votre vie privée (stockage local en priorité), respecter les normes d\'accessibilité universelles RGAA et garantir la protection des élèves.'
              : 'Your coursework and personal notes belong exclusively to you. Our architecture is designed from the ground up for strict privacy, full accessibility, and student safety.'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center shrink-0">
          <div className="text-emerald-400 font-mono text-sm font-bold">Local par défaut</div>
          <div className="text-[11px] text-slate-400 mt-1">RGPD &bull; RGAA &bull; 15 ans</div>
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
          <span>{isFr ? 'Contact Officiel, Délégué aux Données & Référent Accessibilité' : 'Official Contacts, DPO & Accessibility Officer'}</span>
        </div>
        <p className="leading-relaxed text-slate-400">
          {isFr
            ? 'Pour toute demande d’exercice de vos droits RGPD (accès, effacement, portabilité), signalement d’un aménagement d’accessibilité (RGAA / WCAG 2.1 AA) ou question relative à la confidentialité des élèves, contactez directement notre équipe :'
            : 'For GDPR rights requests (access, erasure, portability), accessibility reports (RGAA / WCAG 2.1 AA), or student data inquiries, contact our team directly:'}
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
