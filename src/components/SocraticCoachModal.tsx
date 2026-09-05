import React, { useState, useRef, useEffect } from 'react';
import { AppLanguage, SocraticMessage, SchoolDocument } from '../types';
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

export const SocraticCoachModal: React.FC<SocraticCoachModalProps> = ({
  isOpen,
  onClose,
  documents,
  currentDocument,
  lang = 'fr',
}) => {
  const [messages, setMessages] = useState<SocraticMessage[]>([
    {
      id: 'welcome-1',
      sender: 'coach',
      text: lang === 'fr'
        ? "Bonjour ! Je suis votre Conseiller Pédagogique Socratique. Je suis là pour vous aider à comprendre la méthode, structurer vos révisions, et vous poser les bonnes questions pour réussir — sans jamais faire le travail ou donner la réponse à votre place !"
        : "Hello! I am your Socratic Study Coach. I am here to help you understand academic methods, structure your revision plans, and guide your thinking with hints — without ever giving direct answers or solving homework for you!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hints: lang === 'fr'
        ? ["Méthode de dissertation", "Plan de révision", "Indices conceptuels"]
        : ["Essay methodology", "Revision scheduling", "Conceptual clues"],
      suggestedQuestions: lang === 'fr'
        ? [
            "Comment mémoriser les formules et dates clés ?",
            "Aide-moi à comprendre la méthodologie d'analyse de texte",
            "Comment organiser ma semaine avant un examen ?",
          ]
        : [
            "How can I memorize core formulas and key dates?",
            "Help me understand the textual analysis methodology",
            "How should I structure my study week before exams?",
          ],
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>(
    currentDocument?.subject || (documents[0]?.subject ?? (lang === 'fr' ? 'Général' : 'General'))
  );
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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
      const res = await fetch('/api/coach/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          history: messages,
          currentSubject: selectedSubject,
          currentDocTitle: currentDocument?.title || 'Session de travail',
          language: lang,
        }),
      });

      if (!res.ok) {
        throw new Error(lang === 'fr' ? 'Erreur lors de la réponse du tuteur' : 'Error contacting tutor');
      }

      const data = await res.json();
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
      const errorMsg: SocraticMessage = {
        id: `err-${Date.now()}`,
        sender: 'coach',
        text: lang === 'fr'
          ? "Désolé, une petite interruption est survenue. Veuillez reformuler votre question méthodologique !"
          : "Sorry, a temporary interruption occurred. Please rephrase your study question!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = lang === 'fr' ? [
    "Aide-moi à structurer mon plan de révision",
    "Quelle est la méthode pour analyser une citation ?",
    "Donne-moi un indice pour retenir ce chapitre",
    "Comment gérer mon temps pendant l'épreuve ?",
  ] : [
    "Help me structure my revision schedule",
    "What is the method to analyze a quote?",
    "Give me a conceptual clue for this topic",
    "How to manage my time during the exam?",
  ];

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
