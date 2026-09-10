import React, { useState, useRef, useEffect } from 'react';
import { AppLanguage, SocraticMessage, SchoolDocument } from '../types';
import { fetchJsonWithRetry } from '../lib/api-utils';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  Lightbulb, 
  HelpCircle, 
  X, 
  Loader2, 
  RotateCcw,
  GraduationCap,
  Compass,
  AlertCircle
} from 'lucide-react';

interface SocraticCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: SchoolDocument[];
  currentDocument?: SchoolDocument | null;
  lang: AppLanguage;
}

export type CoachPersonaId = 'socrate' | 'descartes' | 'curie' | 'hugo' | 'smith';

export interface CoachPersona {
  id: CoachPersonaId;
  nameFr: string;
  nameEn: string;
  titleFr: string;
  titleEn: string;
  icon: string;
  color: string;
  greetingFr: string;
  greetingEn: string;
  quickPromptsFr: string[];
  quickPromptsEn: string[];
}

export const COACH_PERSONAS: CoachPersona[] = [
  {
    id: 'socrate',
    nameFr: 'Coach Socrate',
    nameEn: 'Coach Socrates',
    titleFr: 'Maïeutique & Questionnement Actif',
    titleEn: 'Socratic Dialogue & Active Inquiry',
    icon: '🏛️',
    color: 'from-amber-600 to-indigo-700',
    greetingFr: "Bonjour ! Je suis Socrate. Je ne vous enseignerai rien, je poserai seulement des questions pour faire accoucher votre esprit de la vérité.",
    greetingEn: "Hello! I am Socrates. I shall teach you nothing; I will only ask questions to draw out the truth from your mind.",
    quickPromptsFr: [
      "Aide-moi à structurer mon plan de révision",
      "Quelle est la méthode pour analyser une citation ?",
      "Comment gérer mon temps pendant l'épreuve ?",
      "Donne-moi un indice pour retenir ce chapitre"
    ],
    quickPromptsEn: [
      "Help me structure my revision schedule",
      "What is the method to analyze a quote?",
      "How to manage my time during the exam?",
      "Give me a conceptual clue for this topic"
    ]
  },
  {
    id: 'descartes',
    nameFr: 'Coach René Descartes',
    nameEn: 'Coach René Descartes',
    titleFr: 'Rigueur Logique & Mathématiques',
    titleEn: 'Logical Rigor & Mathematics',
    icon: '📐',
    color: 'from-blue-600 to-cyan-700',
    greetingFr: "Bienvenue. Appliquons le doute méthodique : décomposons chaque problème complexe en autant de parcelles simples que possible.",
    greetingEn: "Welcome. Let us apply methodical doubt: divide each complex problem into as many simple parts as possible.",
    quickPromptsFr: [
      "Comment mener une démonstration par récurrence parfaite ?",
      "Aide-moi à vérifier ma logique dans ce problème de maths",
      "Quelles sont les 4 règles du Discours de la méthode ?",
      "Comment ne pas faire d'erreurs de calcul sous stress ?"
    ],
    quickPromptsEn: [
      "How to write a perfect proof by induction?",
      "Help me verify my step-by-step logic in math",
      "What are the 4 rules of Discourse on Method?",
      "How to avoid algebraic calculation errors under pressure?"
    ]
  },
  {
    id: 'curie',
    nameFr: 'Coach Marie Curie',
    nameEn: 'Coach Marie Curie',
    titleFr: 'Physique, Chimie & Démarche Expérimentale',
    titleEn: 'Physics, Chemistry & Experimental Method',
    icon: '⚛️',
    color: 'from-emerald-600 to-teal-800',
    greetingFr: "Bienvenue dans le laboratoire. En sciences, rien n'est à craindre, tout est à comprendre. Définissons l'expérience et les équations.",
    greetingEn: "Welcome to the laboratory. In science, nothing is to be feared, it is only to be understood. Let us structure the experiment and formulas.",
    quickPromptsFr: [
      "Comment réussir le bilan de matière et les équations-bilan ?",
      "Explique-moi la méthode de résolution des lois de Newton",
      "Comment analyser un spectre RMN ou UV-Visible au Bac ?",
      "Donne-moi les astuces pour réussir l'Épreuve Pratique (ECE)"
    ],
    quickPromptsEn: [
      "How to master stoichiometry and mole balances?",
      "Explain the step-by-step resolution of Newton's laws",
      "How to analyze NMR or UV-Vis spectra for exams?",
      "Give me tips for practical laboratory physics exams"
    ]
  },
  {
    id: 'hugo',
    nameFr: 'Coach Victor Hugo',
    nameEn: 'Coach Victor Hugo',
    titleFr: 'Littérature, Dissertation & Éloquence',
    titleEn: 'Literature, Essay Method & Eloquence',
    icon: '✒️',
    color: 'from-rose-600 to-purple-800',
    greetingFr: "Salutations ! La liberté commence où l'ignorance finit. Structurons votre problématique et votre plan dialectique avec puissance.",
    greetingEn: "Greetings! Freedom begins where ignorance ends. Let us craft your thesis statement and dialectic outline with power.",
    quickPromptsFr: [
      "Comment trouver une problématique percutante en dissertation ?",
      "Donne-moi la structure idéale du plan Thèse-Antithèse-Synthèse",
      "Comment réussir l'explication linéaire à l'Oral de Français ?",
      "Quelles figures de style mobiliser dans un commentaire ?"
    ],
    quickPromptsEn: [
      "How to formulate a compelling dissertation thesis?",
      "Give me the ideal outline structure for literature essays",
      "How to excel at oral text commentary exams?",
      "What rhetorical devices should I highlight in analysis?"
    ]
  },
  {
    id: 'smith',
    nameFr: 'Coach Adam Smith',
    nameEn: 'Coach Adam Smith',
    titleFr: 'Économie, SES & Sciences Politiques',
    titleEn: 'Economics, Social Sciences & Geopolitics',
    icon: '📊',
    color: 'from-amber-600 to-emerald-800',
    greetingFr: "Bonjour ! Analysons les mécanismes de marché, les politiques publiques et la dynamique économique globale avec méthode.",
    greetingEn: "Good day! Let us analyze market mechanisms, public policies, and global economic dynamics with systematic rigor.",
    quickPromptsFr: [
      "Comment expliquer la régulation du marché par les prix ?",
      "Quelle est la méthode de l'épreuve d'Épreuve Composée en SES ?",
      "Comment analyser les graphiques de politique monétaire ?",
      "Aide-moi à comprendre l'inflation et la croissance économique"
    ],
    quickPromptsEn: [
      "How to explain price elasticity and market equilibrium?",
      "What is the essay methodology for economics exams?",
      "How to analyze monetary policy and central bank charts?",
      "Help me understand inflation and economic growth cycles"
    ]
  }
];

export const SocraticCoachModal: React.FC<SocraticCoachModalProps> = ({
  isOpen,
  onClose,
  documents,
  currentDocument,
  lang = 'fr',
}) => {
  const [activePersonaId, setActivePersonaId] = useState<CoachPersonaId>('socrate');
  const activePersona = COACH_PERSONAS.find(p => p.id === activePersonaId) || COACH_PERSONAS[0];

  const [messages, setMessages] = useState<SocraticMessage[]>([
    {
      id: 'welcome-1',
      sender: 'coach',
      text: lang === 'fr'
        ? activePersona.greetingFr
        : activePersona.greetingEn,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hints: lang === 'fr'
        ? ["Méthode de travail", "Plan de révision", "Indices conceptuels"]
        : ["Study method", "Revision plan", "Conceptual clues"],
      suggestedQuestions: lang === 'fr'
        ? activePersona.quickPromptsFr.slice(0, 3)
        : activePersona.quickPromptsEn.slice(0, 3),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>(
    currentDocument?.subject || (documents[0]?.subject ?? (lang === 'fr' ? 'Général' : 'General'))
  );
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Switch persona reset
  const handleSelectPersona = (persona: CoachPersona) => {
    setActivePersonaId(persona.id);
    setMessages([
      {
        id: `welcome-${persona.id}-${Date.now()}`,
        sender: 'coach',
        text: lang === 'fr' ? persona.greetingFr : persona.greetingEn,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hints: lang === 'fr'
          ? ["Spécialité " + persona.nameFr, "Problématique", "Méthodologie"]
          : ["Specialty " + persona.nameEn, "Thesis statement", "Methodology"],
        suggestedQuestions: lang === 'fr' ? persona.quickPromptsFr.slice(0, 3) : persona.quickPromptsEn.slice(0, 3),
      }
    ]);
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || loading) return;

    const userMsg: SocraticMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await fetchJsonWithRetry<{ text: string; hints?: string[]; suggestedQuestions?: string[] }>('/api/coach/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          history: messages,
          currentSubject: selectedSubject,
          currentDocTitle: currentDocument?.title || 'Session de travail',
          language: lang,
        }),
      }, { retries: 3, initialDelayMs: 600 });

      const coachMsg: SocraticMessage = {
        id: `coach-${Date.now()}`,
        sender: 'coach',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hints: data.hints || [],
        suggestedQuestions: data.suggestedQuestions || [],
      };

      setMessages((prev) => [...prev, coachMsg]);
    } catch (err: any) {
      const isUnavailable = err.message?.includes('503') || err.message?.includes('high demand') || err.status === 503;
      const errorMsg: SocraticMessage = {
        id: `err-${Date.now()}`,
        sender: 'coach',
        text: isUnavailable
          ? (lang === 'fr'
              ? "Le modèle IA est actuellement très sollicité. Une nouvelle tentative automatique a été faite. Merci de réessayer dans quelques instants !"
              : "The AI model is experiencing high demand. Automatic retries completed. Please try again in a moment!")
          : (lang === 'fr'
              ? "Désolé, une petite interruption est survenue. Veuillez reformuler votre question méthodologique !"
              : "Sorry, a temporary interruption occurred. Please rephrase your study question!"),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const savedPrompt = sessionStorage.getItem('socratic_initial_prompt');
      if (savedPrompt) {
        sessionStorage.removeItem('socratic_initial_prompt');
        setTimeout(() => {
          handleSendMessage(savedPrompt);
        }, 150);
      }
    }
  }, [isOpen]);

  const quickPrompts = lang === 'fr' 
    ? activePersona.quickPromptsFr 
    : activePersona.quickPromptsEn;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 bg-linear-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-indigo-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-xs">
              <Bot className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  {lang === 'fr' ? 'Conseiller Pédagogique Socratique' : 'Socratic Study Coach'}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{lang === 'fr' ? 'Anti-Triche' : 'Anti-Cheat'}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {lang === 'fr' ? 'Orientation, méthode & questionnement actif' : 'Guidance, study methods & active reflection'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Anti-Cheat Notice Banner */}
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between text-xs text-amber-900 dark:text-amber-300 shrink-0">
          <div className="flex items-center gap-2 text-[11px] leading-tight">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              {lang === 'fr'
                ? "Le coach ne donne pas les réponses des devoirs. Il vous guide pas à pas avec des indices pour construire votre propre raisonnement."
                : "The coach will not give direct answers to tests. It guides you step-by-step with hints so you build your own understanding."}
            </span>
          </div>
        </div>

        {/* Coach Personas Selector Bar */}
        <div className="px-3 py-2 bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 shrink-0">
            {lang === 'fr' ? 'Coachs :' : 'Coaches:'}
          </span>
          {COACH_PERSONAS.map((persona) => {
            const isSelected = persona.id === activePersonaId;
            return (
              <button
                key={persona.id}
                onClick={() => handleSelectPersona(persona)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-indigo-400'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className="text-sm">{persona.icon}</span>
                <span className="whitespace-nowrap">{lang === 'fr' ? persona.nameFr : persona.nameEn}</span>
              </button>
            );
          })}
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-slate-50/50 dark:bg-slate-950/30">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-xs font-medium'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs border border-slate-200 dark:border-slate-700 whitespace-pre-line'
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Hints chips if available */}
                  {m.hints && m.hints.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-amber-500" />
                        <span>{lang === 'fr' ? 'Indices méthodologiques :' : 'Method hints:'}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {m.hints.map((hint, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/40 rounded-lg text-[11px] font-medium"
                          >
                            💡 {hint}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested reflection questions */}
                  {m.suggestedQuestions && m.suggestedQuestions.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1">
                        <HelpCircle className="w-3 h-3 text-indigo-500" />
                        <span>{lang === 'fr' ? 'Questions de relance :' : 'Follow-up questions:'}</span>
                      </div>
                      <div className="space-y-1">
                        {m.suggestedQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(q)}
                            className="w-full text-left p-2 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 text-xs border border-indigo-200/60 dark:border-indigo-800/40 transition-colors flex items-center justify-between gap-2"
                          >
                            <span>👉 {q}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 px-1 block">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>{lang === 'fr' ? 'Le conseiller analyse la méthode...' : 'Coach is preparing Socratic guidance...'}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt suggestions */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto scrollbar-none flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
            {lang === 'fr' ? 'Suggestions :' : 'Quick prompts:'}
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs whitespace-nowrap transition-colors shrink-0 disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              lang === 'fr'
                ? "Demandez un conseil méthodologique, un indice ou un plan de révision..."
                : "Ask for study advice, a method hint, or a revision plan..."
            }
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'fr' ? 'Envoyer' : 'Send'}</span>
          </button>
        </form>

      </div>
    </div>
  );
};
