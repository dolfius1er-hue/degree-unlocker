import React, { useState } from 'react';
import { AppLanguage, AppTheme } from '../types';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  GraduationCap, 
  CheckCircle2, 
  HelpCircle, 
  Copy, 
  Check, 
  Languages, 
  Bookmark, 
  ChevronRight, 
  Flame, 
  FileText,
  Volume2,
  Table,
  Compass,
  ArrowRight,
  Globe,
  Award,
  Zap,
  RotateCcw,
  BookMarked
} from 'lucide-react';

interface SpanishCourseViewProps {
  lang?: AppLanguage;
  activeTheme?: AppTheme;
  onOpenInBlocknote?: (title: string, subject: string, content: string) => void;
}

interface SpanishExercise {
  id: string;
  category: 'ser_estar' | 'por_para' | 'subjuntivo' | 'tiempos_pasados' | 'enclisis';
  title: string;
  instruction: string;
  sentence: string; // contains blank [___]
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const SPANISH_EXERCISES_DATABASE: SpanishExercise[] = [
  // Ser vs Estar
  {
    id: 'es-ex-1',
    category: 'ser_estar',
    title: 'SER vs ESTAR (1/4)',
    instruction: 'Complétez avec la forme conjuguée correcte au présent de l\'indicatif :',
    sentence: 'Madrid [___] la capital de España, pero hoy el tiempo [___] muy frío.',
    options: ['es / está', 'está / es', 'es / es', 'está / está'],
    correctAnswer: 'es / está',
    explanation: 'Madrid est une identité géographique permanente (SER -> es). L\'état météorologique du jour est une condition passagère (ESTAR -> está).'
  },
  {
    id: 'es-ex-2',
    category: 'ser_estar',
    title: 'SER vs ESTAR (2/4)',
    instruction: 'Identifiez le bon verbe pour exprimer un état d\'esprit passager :',
    sentence: 'Los estudiantes [___] muy cansados después del examen de matemáticas.',
    options: ['están', 'son', 'fueron', 'sean'],
    correctAnswer: 'están',
    explanation: 'La fatigue est un état résultant et transitoire, donc on emploie ESTAR.'
  },
  {
    id: 'es-ex-3',
    category: 'ser_estar',
    title: 'SER vs ESTAR (3/4)',
    instruction: 'Sens changeant selon le verbe (Listo) :',
    sentence: 'Este chico [___] muy listo, pero ahora no [___] listo para salir.',
    options: ['es / está', 'está / es', 'es / es', 'está / está'],
    correctAnswer: 'es / está',
    explanation: 'Ser listo = être intelligent (qualité essentielle). Estar listo = être prêt (état temporaire).'
  },
  {
    id: 'es-ex-4',
    category: 'ser_estar',
    title: 'SER vs ESTAR (4/4)',
    instruction: 'Localisation d\'un événement vs localisation d\'un lieu :',
    sentence: 'El concierto [___] en el estadio, que [___] cerca del centro.',
    options: ['es / está', 'está / está', 'es / es', 'está / es'],
    correctAnswer: 'es / está',
    explanation: 'Un événement (fête, concert, réunion) a lieu -> SER (es). Un bâtiment physique est situé -> ESTAR (está).'
  },

  // Por vs Para
  {
    id: 'es-ex-5',
    category: 'por_para',
    title: 'POR vs PARA (1/3)',
    instruction: 'Choisissez la bonne préposition de but ou de cause :',
    sentence: 'Estudio con mucha disciplina [___] aprobar la selectividad.',
    options: ['para', 'por', 'a', 'de'],
    correctAnswer: 'para',
    explanation: 'PARA exprime le but, l\'objectif futur (afin de).'
  },
  {
    id: 'es-ex-6',
    category: 'por_para',
    title: 'POR vs PARA (2/3)',
    instruction: 'Moyen de transport et cause :',
    sentence: 'Muchas gracias [___] tu ayuda. Te enviaré el documento [___] correo electrónico.',
    options: ['por / por', 'para / por', 'por / para', 'para / para'],
    correctAnswer: 'por / por',
    explanation: 'Gracias POR (cause du remerciement) et POR correo (moyen/vecteur de communication).'
  },
  {
    id: 'es-ex-7',
    category: 'por_para',
    title: 'POR vs PARA (3/3)',
    instruction: 'Destinataire et échéance :',
    sentence: 'Este regalo es [___] mi abuela y el informe debe estar listo [___] el lunes.',
    options: ['para / para', 'por / para', 'para / por', 'por / por'],
    correctAnswer: 'para / para',
    explanation: 'Destinataire (pour ma grand-mère) = PARA. Échéance temporelle (pour lundi) = PARA.'
  },

  // Subjuntivo
  {
    id: 'es-ex-8',
    category: 'subjuntivo',
    title: 'SUBJONCTIF PRÉSENT (1/3)',
    instruction: 'Concordance des temps et volonté :',
    sentence: 'El profesor quiere que los alumnos [___] (hacer) los ejercicios todos los días.',
    options: ['hagan', 'hacen', 'hicieran', 'haganos'],
    correctAnswer: 'hagan',
    explanation: 'Après un verbe de volonté (querer que), le subjonctif présent est obligatoire. Verbe HACER irrégulier : haga, hagas, haga, hagamos, hagáis, hagan.'
  },
  {
    id: 'es-ex-9',
    category: 'subjuntivo',
    title: 'SUBJONCTIF vs INDICATIF (Doute)',
    instruction: 'Expression de l\'opinion à la forme négative :',
    sentence: 'No creo que [___] (tener) razón en este debate histórico.',
    options: ['tenga', 'tiene', 'tuviera', 'teniendo'],
    correctAnswer: 'tenga',
    explanation: 'Creo que + indicatif (tiene), mais NO creo que + subjonctif (tenga).'
  },

  // Tiempos Pasados
  {
    id: 'es-ex-10',
    category: 'tiempos_pasados',
    title: 'INDÉFINI vs IMPARFAIT (1/2)',
    instruction: 'Alternance narration d\'action ponctuelle et description de fond :',
    sentence: 'Ayer, mientras yo [___] (leer) una novela, de repente [___] (sonar) el teléfono.',
    options: ['leía / sonó', 'leí / sonaba', 'leía / sonaba', 'leí / sonó'],
    correctAnswer: 'leía / sonó',
    explanation: 'L\'action d\'arrière-plan continue prend l\'imparfait (leía) et l\'action soudaine qui survient prend le passé simple indéfini (sonó).'
  },

  // Enclisis
  {
    id: 'es-ex-11',
    category: 'enclisis',
    title: 'ENCLISE DES PRONOMS',
    instruction: 'Règle de soudure des pronoms :',
    sentence: '¡No te olvides de [___] (dárselo / dar se lo / se lo dar) a tus padres!',
    options: ['dárselo', 'dar se lo', 'se lo dar', 'dárlelo'],
    correctAnswer: 'dárselo',
    explanation: 'À l\'infinitif, les pronoms compléments se soudent obligatoirement à la fin du verbe en un seul mot avec accent écrit (tilde) sur la voyelle tonique : dar + se + lo = dárselo.'
  }
];

export const SpanishCourseView: React.FC<SpanishCourseViewProps> = ({
  lang = 'fr',
  activeTheme = 'light',
  onOpenInBlocknote
}) => {
  const isFr = lang === 'fr';
  const [activeSection, setActiveSection] = useState<'all' | 'exercices' | 'bases' | 'grammaire' | 'conjugaison' | 'vocabulaire' | 'culture'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedVerb, setSelectedVerb] = useState<'ser' | 'estar' | 'tener' | 'hacer' | 'ir' | 'poder' | 'querer'>('ser');

  // Interactive Exercises State
  const [exerciseFilter, setExerciseFilter] = useState<'all' | 'ser_estar' | 'por_para' | 'subjuntivo' | 'tiempos_pasados' | 'enclisis'>('all');
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>({});

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const playSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelectAnswer = (exId: string, option: string) => {
    setUserAnswers(prev => ({ ...prev, [exId]: option }));
    setRevealedExplanations(prev => ({ ...prev, [exId]: true }));
  };

  const filteredExercises = SPANISH_EXERCISES_DATABASE.filter(ex => {
    if (exerciseFilter !== 'all' && ex.category !== exerciseFilter) return false;
    return true;
  });

  const correctCount = Object.entries(userAnswers).filter(([id, ans]) => {
    const ex = SPANISH_EXERCISES_DATABASE.find(e => e.id === id);
    return ex && ex.correctAnswer === ans;
  }).length;

  const verbTables = {
    ser: {
      name: 'SER (Être - Essence, identité, origine, heure, voix passive)',
      pres: ['soy', 'eres', 'es', 'somos', 'sois', 'son'],
      pret: ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'],
      imp: ['era', 'eras', 'era', 'éramos', 'erais', 'eran'],
      fut: ['seré', 'serás', 'será', 'seremos', 'seréis', 'serán'],
      subPres: ['sea', 'seas', 'sea', 'seamos', 'seáis', 'sean'],
      subImp: ['fuera / fuese', 'fueras', 'fuera', 'fuéramos', 'fuerais', 'fueran']
    },
    estar: {
      name: 'ESTAR (Être - Localisation, état passager, aspect progressif estar + gérondif)',
      pres: ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están'],
      pret: ['estuve', 'estuviste', 'estuvo', 'estuvimos', 'estuvisteis', 'estuvieron'],
      imp: ['estaba', 'estabas', 'estaba', 'estábamos', 'estabais', 'estaban'],
      fut: ['estaré', 'estarás', 'estará', 'estaremos', 'estaréis', 'estarán'],
      subPres: ['esté', 'estés', 'esté', 'estemos', 'estéis', 'estén'],
      subImp: ['estuviera', 'estuvieras', 'estuviera', 'estuviéramos', 'estuvierais', 'estuvieran']
    },
    tener: {
      name: 'TENER (Avoir, posséder, tener que + inf = obligation)',
      pres: ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'],
      pret: ['tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvisteis', 'tuvieron'],
      imp: ['tenía', 'tenías', 'tenía', 'teníamos', 'teníais', 'tenían'],
      fut: ['tendré', 'tendrás', 'tendrá', 'tendremos', 'tendréis', 'tendrán'],
      subPres: ['tenga', 'tengas', 'tenga', 'tengamos', 'tengáis', 'tengan'],
      subImp: ['tuviera', 'tuvieras', 'tuviera', 'tuviéramos', 'tuvierais', 'tuvieran']
    },
    hacer: {
      name: 'HACER (Faire, fabriquer, météo : hace frío, temps écoulé : hace dos años)',
      pres: ['hago', 'haces', 'hace', 'hacemos', 'hacéis', 'hacen'],
      pret: ['hice', 'hiciste', 'hizo', 'hicimos', 'hicisteis', 'hicieron'],
      imp: ['hacía', 'hacías', 'hacía', 'hacíamos', 'hacíais', 'hacían'],
      fut: ['haré', 'harás', 'hará', 'haremos', 'haréis', 'harán'],
      subPres: ['haga', 'hagas', 'haga', 'hagamos', 'hagáis', 'hagan'],
      subImp: ['hiciera', 'hicieras', 'hiciera', 'hiciéramos', 'hicierais', 'hicieran']
    },
    ir: {
      name: 'IR (Aller, ir a + infinitif = futur proche)',
      pres: ['voy', 'vas', 'va', 'vamos', 'vais', 'van'],
      pret: ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'],
      imp: ['iba', 'ibas', 'iba', 'íbamos', 'ibais', 'iban'],
      fut: ['iré', 'irás', 'irá', 'iremos', 'iréis', 'irán'],
      subPres: ['vaya', 'vayas', 'vaya', 'vayamos', 'vayáis', 'vayan'],
      subImp: ['fuera', 'fueras', 'fuera', 'fuéramos', 'fuerais', 'fueran']
    },
    poder: {
      name: 'PODER (Pouvoir, capacité - Verbe à diphtongue o -> ue)',
      pres: ['puedo', 'puedes', 'puede', 'podemos', 'podéis', 'pueden'],
      pret: ['pude', 'pudiste', 'pudo', 'pudimos', 'pudisteis', 'pudieron'],
      imp: ['podía', 'podías', 'podía', 'podíamos', 'podíais', 'podían'],
      fut: ['podré', 'podrás', 'podrá', 'podremos', 'podréis', 'podrán'],
      subPres: ['pueda', 'puedas', 'pueda', 'podamos', 'podáis', 'puedan'],
      subImp: ['pudiera', 'pudieras', 'pudiera', 'pudiéramos', 'pudierais', 'pudieran']
    },
    querer: {
      name: 'QUERER (Vouloir, aimer - Verbe à diphtongue e -> ie)',
      pres: ['quiero', 'quieres', 'quiere', 'queremos', 'queréis', 'quieren'],
      pret: ['quise', 'quisiste', 'quiso', 'quisimos', 'quisisteis', 'quisieron'],
      imp: ['quería', 'querías', 'quería', 'queríamos', 'queríais', 'querían'],
      fut: ['querré', 'querrás', 'querrá', 'querremos', 'querréis', 'querrán'],
      subPres: ['quiera', 'quieras', 'quiera', 'queramos', 'queráis', 'quieran'],
      subImp: ['quisiera', 'quisieras', 'quisiera', 'quisiéramos', 'quisierais', 'quisieran']
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Hero Header */}
      <div className="p-8 rounded-3xl bg-linear-to-r from-red-700 via-amber-600 to-amber-700 text-white shadow-xl relative overflow-hidden space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-wider">
            <span>🇪🇸 Manuel & Exercices d'Espagnol</span>
            <span className="text-amber-300">• Programme Officiel Collège, Seconde & Cycle Terminal</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => playSpeech("¡Bienvenidos al curso completo de español! Aquí aprenderán gramática, conjugación y ejercicios interactivos.")}
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Prononciation Audio</span>
            </button>
            {onOpenInBlocknote && (
              <button
                onClick={() => onOpenInBlocknote(
                  "Espagnol - Synthèse de Grammaire & Conjugaison",
                  "Espagnol",
                  "# Manuel Complet d'Espagnol\n\n## 1. Ser vs Estar\nSER pour l'essence, ESTAR pour l'état passager et la localisation.\n\n## 2. Por vs Para\nPOR pour la cause et le moyen, PARA pour le but et le destinataire.\n\n## 3. Subjonctif\nUtilisé après volonté, doute, opinion négative."
                )}
                className="px-3.5 py-1.5 rounded-xl bg-white text-slate-900 hover:bg-amber-50 font-bold text-xs shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Exporter dans le Carnet</span>
              </button>
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          L'Espagnol : Du Collège au Baccalauréat (A1 → B2/C1)
        </h1>
        <p className="text-sm sm:text-base text-red-50 max-w-3xl leading-relaxed">
          Espace Notion autonome regroupant phonétique, règles d'accentuation, distinction Ser/Estar et Por/Para, tableaux des verbes irréguliers, littérature hispanique et <span className="font-bold underline text-white">moteur d'exercices interactifs intégré</span>.
        </p>

        {/* Navigation Tabs */}
        <div className="pt-2 flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Vue Globale', icon: Globe },
            { id: 'exercices', label: '✍️ Exercices Interactifs Intégrés', icon: Award, highlight: true },
            { id: 'bases', label: '1. Bases & Accentuation', icon: BookOpen },
            { id: 'grammaire', label: '2. Grammaire & Por/Para', icon: Table },
            { id: 'conjugaison', label: '3. Verbes & Subjonctif', icon: Flame },
            { id: 'vocabulaire', label: '4. Lexique & Débats B2', icon: Bookmark },
            { id: 'culture', label: '5. Littérature & Civilisation', icon: Compass },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-md scale-105'
                    : tab.highlight
                    ? 'bg-amber-400 text-slate-950 font-black hover:bg-amber-300'
                    : 'bg-black/20 hover:bg-black/30 text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION: DEDICATED INTERACTIVE EXERCISES NOTION HUB */}
      {(activeSection === 'all' || activeSection === 'exercices') && (
        <div className="p-6 rounded-3xl bg-linear-to-b from-amber-500/5 to-transparent border-2 border-amber-500/20 shadow-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-black">
                <Award className="w-3.5 h-3.5" />
                <span>Entraînement Autonome d'Espagnol</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Exercices d'Application avec Correction Instantanée
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Testez vos réflexes sur les pièges classiques du Bac : Ser vs Estar, Por vs Para, le Subjonctif et l'Enclise.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs">
                Score : <span className="text-amber-600 dark:text-amber-400 font-black text-sm">{correctCount}</span> / {Object.keys(userAnswers).length} répondu(s)
              </div>
              <button
                onClick={() => {
                  setUserAnswers({});
                  setRevealedExplanations({});
                }}
                className="px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réinitialiser</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            {[
              { id: 'all', label: 'Tous les exercices' },
              { id: 'ser_estar', label: 'Ser vs Estar' },
              { id: 'por_para', label: 'Por vs Para' },
              { id: 'subjuntivo', label: 'Subjonctif' },
              { id: 'tiempos_pasados', label: 'Passé simple vs Imparfait' },
              { id: 'enclisis', label: 'Enclise des pronoms' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setExerciseFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  exerciseFilter === f.id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Exercise Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExercises.map((exo) => {
              const selectedAns = userAnswers[exo.id];
              const isAnswered = !!selectedAns;
              const isCorrect = selectedAns === exo.correctAnswer;
              const isExplanationOpen = revealedExplanations[exo.id];

              return (
                <div
                  key={exo.id}
                  className={`p-5 rounded-2xl border transition-all text-left space-y-3 ${
                    isAnswered
                      ? isCorrect
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                        : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                      {exo.title}
                    </span>
                    <button
                      onClick={() => playSpeech(exo.sentence.replace('[___]', '...'))}
                      className="p-1 rounded-lg text-slate-400 hover:text-amber-600 cursor-pointer"
                      title="Écouter la phrase en espagnol"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {exo.instruction}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white">
                    {exo.sentence}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {exo.options.map((opt) => {
                      const isOptionSelected = selectedAns === opt;
                      const isOptionCorrect = opt === exo.correctAnswer;
                      let btnStyle = 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50';
                      if (isAnswered) {
                        if (isOptionCorrect) {
                          btnStyle = 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-xs';
                        } else if (isOptionSelected) {
                          btnStyle = 'bg-rose-600 text-white font-bold border-rose-600';
                        } else {
                          btnStyle = 'opacity-40 bg-slate-100 dark:bg-slate-800 border-transparent';
                        }
                      }

                      return (
                        <button
                          key={opt}
                          disabled={isAnswered}
                          onClick={() => handleSelectAnswer(exo.id, opt)}
                          className={`p-2 rounded-xl border text-xs font-semibold transition-all text-center cursor-pointer ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback Explanation */}
                  {isAnswered && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5 animate-fade-in">
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        {isCorrect ? (
                          <span className="text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> ¡Excelente! Réponse exacte.
                          </span>
                        ) : (
                          <span className="text-rose-700 dark:text-rose-400 inline-flex items-center gap-1">
                            ✕ Réponse incorrecte. La bonne réponse est : <strong className="underline">{exo.correctAnswer}</strong>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white/60 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                        {exo.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 1: BASES & ACCENTUATION */}
      {(activeSection === 'all' || activeSection === 'bases') && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                1. Les 3 Règles d'Or de l'Accent Tonique (Acento Prosódico)
              </h3>
              <p className="text-xs text-slate-500">
                En espagnol, la prononciation est 100% logique et prévisible grâce à la règle des 3 catégories de mots.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-[10px] font-black uppercase">
                Palabras Llanas (80% des mots)
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Terminaison par Voyelle, N ou S</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                L'accent tonique porte obligatoirement sur l'<strong className="text-amber-700 dark:text-amber-400">avant-dernière syllabe</strong> (penúltima).
              </p>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200">
                ca-<strong>SA</strong>, ha-<strong>BLAN</strong>, me-<strong>SA</strong>, li-<strong>BRO</strong>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-2">
              <span className="px-2 py-0.5 rounded-md bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-200 text-[10px] font-black uppercase">
                Palabras Agudas
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Terminaison par Consonne (sauf N et S)</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                L'accent tonique porte obligatoirement sur la <strong className="text-red-700 dark:text-red-400">toute dernière syllabe</strong> (última).
              </p>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200">
                ha-<strong>BLAR</strong>, pa-<strong>PEL</strong>, ver-<strong>DAD</strong>, mu-<strong>JER</strong>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 space-y-2">
              <span className="px-2 py-0.5 rounded-md bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200 text-[10px] font-black uppercase">
                Palabras Esdrújulas
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Accent sur l'antépénultième</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Portent <strong className="text-purple-700 dark:text-purple-400">TOUJOURS un accent écrit (tilde)</strong> sans aucune exception !
              </p>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200">
                <strong>PÁ</strong>-gi-na, <strong>MÚ</strong>-si-ca, <strong>RÁ</strong>-pi-do, te-<strong>LÉ</strong>-fo-no
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: VERBES & CONJUGAISON INTERACTIVE */}
      {(activeSection === 'all' || activeSection === 'conjugaison') && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Tableaux des Verbes Irréguliers Fondamentaux
                </h3>
                <p className="text-xs text-slate-500">
                  Cliquez sur un verbe pour visualiser instantanément sa conjugaison à tous les temps du programme.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(['ser', 'estar', 'tener', 'hacer', 'ir', 'poder', 'querer'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setSelectedVerb(v)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                    selectedVerb === v
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Active Verb Table */}
          {selectedVerb && verbTables[selectedVerb] && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  {verbTables[selectedVerb].name}
                </h4>
                <button
                  onClick={() => playSpeech(`${verbTables[selectedVerb].pres.join(', ')}`)}
                  className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Écouter
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="font-bold text-slate-400 text-[10px] uppercase">Présent</span>
                  {verbTables[selectedVerb].pres.map((p, i) => (
                    <div key={i} className="font-mono text-slate-800 dark:text-slate-200">{p}</div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="font-bold text-amber-500 text-[10px] uppercase">Passé Simple (Indéfini)</span>
                  {verbTables[selectedVerb].pret.map((p, i) => (
                    <div key={i} className="font-mono text-slate-800 dark:text-slate-200">{p}</div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="font-bold text-slate-400 text-[10px] uppercase">Imparfait</span>
                  {verbTables[selectedVerb].imp.map((p, i) => (
                    <div key={i} className="font-mono text-slate-800 dark:text-slate-200">{p}</div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="font-bold text-indigo-500 text-[10px] uppercase">Futur Simple</span>
                  {verbTables[selectedVerb].fut.map((p, i) => (
                    <div key={i} className="font-mono text-slate-800 dark:text-slate-200">{p}</div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="font-bold text-red-500 text-[10px] uppercase">Subjonctif Présent</span>
                  {verbTables[selectedVerb].subPres.map((p, i) => (
                    <div key={i} className="font-mono text-slate-800 dark:text-slate-200">{p}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
