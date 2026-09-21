import React, { useId, useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Lock, 
  FileText, 
  UserCheck, 
  AlertCircle,
  Accessibility,
  Code2,
  FileCheck,
  Scale,
  Mail
} from 'lucide-react';
import { AppLanguage } from '../types';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: AppLanguage;
  initialTab?: 'privacy' | 'terms' | 'ada' | 'licenses' | 'team';
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  lang = 'fr',
  initialTab = 'privacy',
}) => {
  const baseId = useId();
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'ada' | 'licenses' | 'team'>(initialTab);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isFr = lang === 'fr';
  const publicPrivacyUrl = `${window.location.origin}/privacy`;
  const publicTermsUrl = `${window.location.origin}/terms`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeTab === 'privacy' ? publicPrivacyUrl : publicTermsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      id={`${baseId}-overlay`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id={`${baseId}-container`}
        className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-500 p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>{isFr ? 'Juridique, Confidentialité, ADA & Propriété' : 'Legal, Privacy, ADA & IP Compliance'}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  RGPD &bull; ADA &bull; COPPA &bull; FERPA
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isFr
                  ? 'Protection des données scolaires, conformité ADA/WCAG 2.1 AA, majorité numérique et licences libres'
                  : 'Student data protection, ADA/WCAG 2.1 AA, COPPA children privacy, and open font licensing'}
              </p>
            </div>
          </div>

          <button
            id={`${baseId}-close-btn`}
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label={isFr ? "Fermer" : "Close"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-bar: Tabs & Copy Link */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-800/50'
              }`}
            >
              <Lock className="w-3.5 h-3.5 inline mr-1.5" />
              {isFr ? 'Confidentialité (RGPD & COPPA)' : 'Privacy (GDPR & COPPA)'}
            </button>
            <button
              onClick={() => setActiveTab('ada')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ada'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-800/50'
              }`}
            >
              <Accessibility className="w-3.5 h-3.5 inline mr-1.5" />
              {isFr ? 'Accessibilité (ADA & Section 508)' : 'Accessibility (ADA & Sec 508)'}
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'terms'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-800/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5 inline mr-1.5" />
              {isFr ? 'CGU & Non-Recours' : 'Terms & Waiver'}
            </button>
            <button
              onClick={() => setActiveTab('licenses')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'licenses'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-800/50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 inline mr-1.5" />
              {isFr ? 'Polices & DMCA' : 'Fonts & DMCA Safe Harbor'}
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'team'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-400 hover:text-white bg-amber-950/40 border border-amber-500/30'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 inline mr-1.5" />
              {isFr ? 'Petite Équipe & Transparence' : 'Small Team Notice'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copier l'URL publique"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isFr ? 'Lien copié !' : 'Link copied!') : (isFr ? 'Copier le lien' : 'Copy link')}</span>
            </button>
            <a
              href={activeTab === 'privacy' ? '/privacy' : '/terms'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-300 text-xs sm:text-sm space-y-4 leading-relaxed custom-scrollbar">
          
          {/* TAB 1: PRIVACY & MINORS */}
          {activeTab === 'privacy' && (
            <>
              {/* Age Gate & Children Policy (COPPA / Art 8 GDPR) */}
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 text-indigo-200 space-y-1.5">
                <p className="font-bold text-sm text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{isFr ? "Protection des Enfants & Majorité Numérique (COPPA & Article 8 RGPD)" : "Children's Privacy Protection (COPPA & GDPR Article 8)"}</span>
                </p>
                <p className="text-xs text-indigo-300/90 leading-relaxed">
                  {isFr
                    ? "L'accès direct autonome à Degree Unlocker Lite est réservé aux élèves âgés d'au moins 15 ans révolus (seuil de la majorité numérique en France et UE). En conformité stricte avec l'article 8 du RGPD et le COPPA américain, aucune donnée personnelle d'enfant n'est collectée, conservée ni commercialisée sans accord légal. Tout mineur utilisant la plateforme sous supervision scolaire ou parentale bénéficie du droit d'effacement immédiat sur simple demande à degreeunlocker.devteam@yahoo.com."
                    : "Direct standalone access is intended for users aged 15 and above. In strict compliance with GDPR Article 8 and COPPA, no personal data from children is knowingly collected, tracked, or sold. Any school-supervised account data can be permanently erased upon request at degreeunlocker.devteam@yahoo.com."}
                </p>
              </div>

              {/* FERPA & Student Privacy Pledge */}
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 space-y-1.5">
                <p className="font-bold text-sm text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isFr ? "Respect des Données Éducatives (FERPA & SOPIPA)" : "Student Educational Records (FERPA & SOPIPA Standards)"}</span>
                </p>
                <p className="text-xs text-emerald-300/90 leading-relaxed">
                  {isFr
                    ? "Tous les cours, synthèses Cornell, fiches mémoires et notes importés par l'élève restent la propriété inaliénable de l'élève ou de son établissement. Aucune note ni production scolaire n'est monétisée, cédée à des tiers, ni utilisée pour entraîner des modèles IA publics."
                    : "All coursework, Cornell notes, flashcards, and study files remain the sole property of the student or educational institution. No student data is commercialized or used for training public models."}
                </p>
              </div>

              {/* Google API Limited Use Requirements */}
              <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/40 text-sky-200 space-y-1.5">
                <p className="font-bold text-sm text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>{isFr ? "Conformité aux règles d'utilisation limitée des API Google" : "Google API Limited Use Disclosure"}</span>
                </p>
                <p className="text-xs text-sky-300/90 leading-relaxed">
                  {isFr
                    ? "L'utilisation par Degree Unlocker des informations reçues des API Google (Drive, Docs) respecte scrupuleusement la politique d'utilisation limitée des données des utilisateurs de Google (Limited Use Policy). Les jetons d'accès ne sont manipulés qu'en mémoire volatile pour importer les fichiers explicitement choisis."
                    : "Degree Unlocker's use and transfer of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements."}
                </p>
              </div>

              {/* Data Rights & Deletion Contact */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-400" />
                  <span>{isFr ? "Exercice de vos Droits & Délégué aux Données (DPO)" : "GDPR / CCPA Rights & Data Protection"}</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isFr
                    ? "Conformément au RGPD et au CCPA, vous pouvez à tout moment exporter ou effacer l'intégralité de votre base locale et distante directement depuis l'application ou en adressant un email à notre équipe officielle :"
                    : "Under GDPR and CCPA, you retain the right to export, rectify, or purge all personal data at any time directly in-app or by contacting our team:"}
                </p>
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-300">
                  <span>degreeunlocker.devteam@yahoo.com</span>
                  <span className="text-slate-500 font-sans">| Délégué (DPO) : dolfius1er@gmail.com</span>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: ADA & ACCESSIBILITY COMPLIANCE */}
          {activeTab === 'ada' && (
            <>
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 text-indigo-200 space-y-2">
                <p className="font-bold text-sm text-white flex items-center gap-2">
                  <Accessibility className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{isFr ? "Engagement d'Accessibilité Numérique ADA Title III & Section 508" : "ADA Title III & Section 508 Accessibility Statement"}</span>
                </p>
                <p className="text-xs text-indigo-300/90 leading-relaxed">
                  {isFr
                    ? "Degree Unlocker Lite applique rigoureusement les directives WCAG 2.1 (Web Content Accessibility Guidelines) aux niveaux AA et AAA, conformément aux exigences de l'Americans with Disabilities Act (ADA Title III) et de la Section 508 du Rehabilitation Act. L'application est conçue pour garantir un accès équitable et autonome à tous les apprenants présentant des handicaps visuels, moteurs, auditifs ou cognitifs."
                    : "Degree Unlocker Lite is committed to digital accessibility and complies with WCAG 2.1 Levels AA/AAA under Title III of the Americans with Disabilities Act (ADA) and Section 508 of the Rehabilitation Act, ensuring equitable study access for all students with disabilities."}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-sm">
                  {isFr ? "Aménagements & Fonctionnalités d'Accessibilité Intégrées" : "Built-in Accessibility & Accommodations"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-indigo-300 block mb-1">{isFr ? "1. Polices & Support DYS" : "1. DYS & Readability Fonts"}</strong>
                    <p className="text-slate-400">{isFr ? "Support des polices adaptées aux personnes dyslexiques (OpenDyslexic, Luciole) avec espacement modulable." : "OpenDyslexic typography support with customizable letter tracking and line height."}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-amber-300 block mb-1">{isFr ? "2. Navigation Clavier Complète" : "2. Full Keyboard Operability"}</strong>
                    <p className="text-slate-400">{isFr ? "Tous les contrôles sont manœuvrables par Tab, Entrée, Espace et Flèches avec anneaux de focus nets." : "All interactive elements are fully operable via keyboard with high-visibility focus indicators."}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-emerald-300 block mb-1">{isFr ? "3. Contraste & Mouvement Réduit" : "3. Contrast & Reduced Motion"}</strong>
                    <p className="text-slate-400">{isFr ? "Ratios de contraste supérieurs à 4.5:1 / 7:1 et désactivation automatique des animations via 'prefers-reduced-motion'." : "Contrast ratios exceeding 4.5:1/7:1 with automated respect for system 'prefers-reduced-motion'."}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-sky-300 block mb-1">{isFr ? "4. Lecteurs d'Écran (ARIA)" : "4. Screen Readers & Semantics"}</strong>
                    <p className="text-slate-400">{isFr ? "Sémantique HTML5 complète, labels ARIA explicites et compatibilité NVDA, JAWS et VoiceOver." : "HTML5 landmarks and ARIA live regions certified for NVDA, JAWS, and VoiceOver."}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isFr ? "Procédure d'Aménagement Raisonnable & Assistance ADA (SLA 48h)" : "Reasonable Accommodation & ADA Officer (48h SLA)"}</span>
                </p>
                <p className="text-slate-300">
                  {isFr
                    ? "Si vous constatez un obstacle d'accessibilité ou souhaitez demander une adaptation sur mesure, écrivez à :"
                    : "If you encounter any accessibility barrier or require tailored accommodations, please reach out to:"}
                </p>
                <p className="font-bold text-amber-300 font-mono">degreeunlocker.devteam@yahoo.com</p>
              </div>
            </>
          )}

          {/* TAB 3: TERMS OF SERVICE & WAIVER */}
          {activeTab === 'terms' && (
            <>
              <div>
                <h4 className="font-bold text-white text-sm mb-1">{isFr ? "1. Nature du Service & Aide à l'Étude" : "1. Nature of the Educational Service"}</h4>
                <p className="text-slate-400">
                  {isFr
                    ? "Degree Unlocker Lite est un poste de travail méthodologique indépendant conçu pour aider les étudiants dans l'organisation de leurs cours, la mémorisation espacée et la révision. L'application ne délivre aucun diplôme officiel et n'engage pas la responsabilité des établissements scolaires."
                    : "Degree Unlocker Lite is an independent study assistant designed to aid student organization and spaced repetition. It does not confer official degrees or accreditation."}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">{isFr ? "2. Exclusion de Garantie & Limitation de Responsabilité" : "2. Disclaimer of Warranties & Liability Limitation"}</h4>
                <p className="text-slate-400">
                  {isFr
                    ? "Le service est fourni 'EN L'ÉTAT' sans garantie expresse ou implicite. Dans toute la mesure permise par la loi applicable, l'éditeur ne pourra être tenu responsable des dommages directs, indirects ou accessoires liés à l'utilisation ou l'indisponibilité du service."
                    : "The service is provided 'AS IS' without warranty of any kind. To the fullest extent permitted by applicable law, the authors and contributors disclaim liability for any direct, indirect, or incidental damages."}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">{isFr ? "3. Clause de Règlement des Différends & Renonciation aux Recours Collectifs" : "3. Dispute Resolution & Class Action Waiver"}</h4>
                <p className="text-slate-400">
                  {isFr
                    ? "Tout différend relatif à l'utilisation de la plateforme sera d'abord soumis à une tentative de règlement amiable via un contact préalable à degreeunlocker.devteam@yahoo.com. Les parties conviennent de régler tout litige sur une base strictement individuelle et renoncent expressément à toute action collective ('Class Action Waiver')."
                    : "Any dispute shall first be addressed through informal good-faith negotiation by emailing degreeunlocker.devteam@yahoo.com. To the extent permitted by law, you agree to resolve all disputes on an individual basis and waive any right to participate in a class action lawsuit."}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isFr ? "Loi Applicable & Juridiction" : "Governing Law"}</span>
                </p>
                <p>
                  {isFr
                    ? "Les présentes conditions sont régies par le droit français et les règlements de l'Union Européenne régissant les services numériques grand public."
                    : "These terms are governed by the laws of France and European Union digital service regulations."}
                </p>
              </div>
            </>
          )}

          {/* TAB 4: FONTS LICENSING & DMCA SAFE HARBOR */}
          {activeTab === 'licenses' && (
            <>
              {/* Font Licensing Audit */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span>{isFr ? "Audits des Polices Typographiques & Licences Libres" : "Font Licensing & Open Source IP Clearance"}</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isFr
                    ? "Toutes les polices de caractères intégrées ou chargées par l'application sont certifiées libres de droits commerciaux et distribuées sous licence officielle SIL Open Font License v1.1 (OFL-1.1) ou Apache License 2.0. Aucune police propriétaire soumise à redevance n'est utilisée sans licence valide."
                    : "All typefaces loaded or embedded within Degree Unlocker are distributed under the SIL Open Font License v1.1 (OFL-1.1) or Apache License 2.0, permitting royalty-free redistribution for web and desktop applications without copyright infringement."}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                    <span className="font-bold text-indigo-300">Plus Jakarta Sans / Outfit / JetBrains Mono</span>
                    <span className="text-[11px] text-slate-500 block">Licence SIL OFL 1.1 / Apache 2.0</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                    <span className="font-bold text-emerald-300">Caveat / Kalam / Patrick Hand</span>
                    <span className="text-[11px] text-slate-500 block">Licence SIL OFL 1.1 (Google Fonts)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 sm:col-span-2">
                    <span className="font-bold text-amber-300">OpenDyslexic & Luciole</span>
                    <span className="text-[11px] text-slate-500 block">Licences libres éducatives & DYS universelles</span>
                  </div>
                </div>
              </div>

              {/* DMCA Safe Harbor Notice (17 U.S.C. § 512) */}
              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-2 text-xs text-rose-200">
                <p className="font-bold text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>{isFr ? "Notification DMCA & Procédure de Retrait (17 U.S.C. § 512)" : "DMCA Notice & Safe Harbor Procedure (17 U.S.C. § 512)"}</span>
                </p>
                <p className="text-slate-300 leading-relaxed">
                  {isFr
                    ? "Si vous êtes titulaire de droits d'auteur et estimez qu'un contenu tiers hébergé dans un espace partagé porte atteinte à vos droits, vous pouvez notifier notre agent désigné DMCA. Nous traiterons votre demande et procéderons au retrait dans les meilleurs délais."
                    : "If you are a copyright owner and believe content hosted infringes your intellectual property, please submit a formal DMCA takedown notice to our designated agent. We enforce an expedited takedown policy."}
                </p>
                <div className="p-2.5 rounded-xl bg-black/40 border border-rose-500/20 font-mono text-[11px] text-rose-300">
                  Contact Agent DMCA / Propriété intellectuelle : <strong>degreeunlocker.devteam@yahoo.com</strong>
                </div>
              </div>
            </>
          )}

          {/* TAB 5: SMALL TEAM & CONTINUOUS IMPROVEMENT CLAUSE */}
          {activeTab === 'team' && (
            <>
              <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-950/50 via-slate-900 to-indigo-950/50 border-2 border-amber-500/40 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-base">
                      {isFr ? 'Clause de Transparence & Amélioration Quotidienne' : 'Small Team & Continuous Improvement Notice'}
                    </h4>
                    <span className="text-[11px] text-amber-300/90 font-medium">
                      {isFr ? 'Développement indépendant & engagement direct' : 'Independent passion project & user-first support'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/20 space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed">
                  <p>
                    {isFr ? (
                      <>
                        <strong>Nous sommes une petite équipe indépendante et passionnée</strong> travaillant activement à rendre l’apprentissage scolaire plus structuré, accessible et motivant.
                      </>
                    ) : (
                      <>
                        <strong>We are a small, dedicated independent development team</strong> committed to making academic study more organized, accessible, and rewarding.
                      </>
                    )}
                  </p>
                  <p className="text-amber-200/90">
                    {isFr ? (
                      <>
                        ⚠️ <strong>Clause de non-perfection & amélioration au jour le jour :</strong> Tout n'est pas encore parfait et nous ne pouvons pas assurer que tout marchera de manière irréprochable sur chaque machine ou navigateur. Nous améliorons l'application au jour le jour pour vous offrir la meilleure expérience possible.
                      </>
                    ) : (
                      <>
                        ⚠️ <strong>Continuous Improvement Notice:</strong> Not everything is flawless yet, and we cannot guarantee that every edge case will run without hiccups across all environments. We actively iterate and improve the software day by day.
                      </>
                    )}
                  </p>
                  <p>
                    {isFr ? (
                      <>
                        <strong>Besoin de quelque chose ou un problème constaté ?</strong> Si vous avez la moindre suggestion, un besoin spécifique ou si vous remarquez un comportement inattendu, écrivez-nous directement. Nous lisons chaque message et intégrons vos retours en priorité !
                      </>
                    ) : (
                      <>
                        <strong>Need something or found an issue?</strong> If you have any feature request, specific need, or notice any bug, reach out to us directly. We value every piece of feedback and prioritize your needs!
                      </>
                    )}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <span className="text-slate-400">
                    {isFr ? 'Contact direct de l\'équipe de développement :' : 'Direct Developer Team Contact:'}
                  </span>
                  <a
                    href="mailto:degreeunlocker.devteam@yahoo.com"
                    className="font-mono font-bold text-amber-400 hover:text-amber-300 underline flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>degreeunlocker.devteam@yahoo.com</span>
                  </a>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Degree Unlocker Lite &bull; Version Sécurisée & Conforme 2026</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors cursor-pointer shadow-xs"
          >
            {isFr ? 'Fermer' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;
