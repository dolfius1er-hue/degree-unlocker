import React, { useState } from 'react';
import { AppLanguage, AppTheme } from '../types';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  GraduationCap, 
  CheckCircle2, 
  HelpCircle, 
  Table, 
  Landmark, 
  FileText,
  ArrowRight,
  Globe,
  Scroll,
  Layers,
  Compass,
  History,
  Award,
  Zap,
  RotateCcw,
  Volume2
} from 'lucide-react';

interface ClassicalLanguagesViewProps {
  lang?: AppLanguage;
  activeTheme?: AppTheme;
  onOpenInBlocknote?: (title: string, subject: string, content: string) => void;
}

interface LatinExercise {
  id: string;
  category: 'declinaisons_1_2' | 'declinaison_3' | 'ablatif_absolu' | 'prop_infinitive' | 'version_textes';
  title: string;
  instruction: string;
  sentence: string; // contains [___]
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const LATIN_EXERCISES_DATABASE: LatinExercise[] = [
  // 1ère et 2ème déclinaisons
  {
    id: 'lat-ex-1',
    category: 'declinaisons_1_2',
    title: '1ÈRE DÉCLINAISON : ACCUSATIF SINGULIER (ROSA)',
    instruction: 'Complétez la désinence du COD féminin :',
    sentence: 'Poeta claram [___] (puella / la jeune fille) laudat.',
    options: ['puellam', 'puellae', 'puella', 'puellis'],
    correctAnswer: 'puellam',
    explanation: 'Le verbe laudare appelle un COD à l\'Accusatif singulier. Pour la 1ère déclinaison (rosa), la désinence de l\'accusatif singulier est -AM (puellam).'
  },
  {
    id: 'lat-ex-2',
    category: 'declinaisons_1_2',
    title: '2ÈME DÉCLINAISON : GÉNITIF SINGULIER (DOMINUS)',
    instruction: 'Complétez le complément du nom masculin :',
    sentence: 'Equus [___] (dominus / le maître) in agro currit.',
    options: ['domini', 'dominum', 'domino', 'dominis'],
    correctAnswer: 'domini',
    explanation: 'Le cheval du maître : le complément du nom se met au Génitif singulier, dont la terminaison pour les noms masculins en -us de la 2e déclinaison est -I (domini).'
  },
  {
    id: 'lat-ex-3',
    category: 'declinaisons_1_2',
    title: '2ÈME DÉCLINAISON NEUTRE : SUJET PLURIEL (TEMPLUM)',
    instruction: 'Identifiez le nominatif pluriel neutre :',
    sentence: 'Magna [___] (templum / le temple) in foro stant.',
    options: ['templa', 'templi', 'templorum', 'templis'],
    correctAnswer: 'templa',
    explanation: 'Règle absolue des neutres latins et grecs : au pluriel, le Nominatif, Vocatif et Accusatif se terminent TOUJOURS par -A (templa).'
  },

  // 3ème déclinaison
  {
    id: 'lat-ex-4',
    category: 'declinaison_3',
    title: '3ÈME DÉCLINAISON : ABLATIF SINGULIER (CONSUL)',
    instruction: 'Complétez avec l\'ablatif de moyen ou d\'agent :',
    sentence: 'Urbs a magno [___] (consul / le consul) defenditur.',
    options: ['consule', 'consuli', 'consulem', 'consulis'],
    correctAnswer: 'consule',
    explanation: 'Après la préposition a/ab (par), le complément d\'agent se met à l\'Ablatif. La 3e déclinaison consonnantique a pour désinence d\'ablatif singulier -E (consule).'
  },
  {
    id: 'lat-ex-5',
    category: 'declinaison_3',
    title: '3ÈME DÉCLINAISON : ACCUSATIF PLURIEL (CIVIS)',
    instruction: 'Accusatif pluriel des thèmes en -i :',
    sentence: 'Dux omnes [___] (civis / le citoyen) convocat.',
    options: ['cives', 'civium', 'civibus', 'civi'],
    correctAnswer: 'cives',
    explanation: 'L\'accusatif pluriel des noms parisyllabiques de la 3e déclinaison (civis, civis) est -ES (cives).'
  },

  // Ablatif Absolu
  {
    id: 'lat-ex-6',
    category: 'ablatif_absolu',
    title: 'SYNTAXE : ABLATIF ABSOLU (Proposition participiale)',
    instruction: 'Complétez la proposition circonstancielle autonome à l\'ablatif :',
    sentence: '[___] (Caesar / interfectus), cives terrore fugerunt.',
    options: ['Caesare interfecto', 'Caesarem interfectum', 'Caesaris interfecti', 'Caesar interfectus'],
    correctAnswer: 'Caesare interfecto',
    explanation: 'L\'ablatif absolu latin réunit un nom et un participe tous deux au cas Ablatif, sans lien grammatical avec la proposition principale : "César ayant été tué, les citoyens s\'enfuirent".'
  },

  // Proposition Infinitive
  {
    id: 'lat-ex-7',
    category: 'prop_infinitive',
    title: 'SYNTAXE : PROPOSITION INFINITIVE',
    instruction: 'Complétez le sujet à l\'accusatif de la proposition infinitive :',
    sentence: 'Scio [___] (Marcus / venire) ad urbem.',
    options: ['Marcum venire', 'Marcus venire', 'Marco venire', 'Marci venire'],
    correctAnswer: 'Marcum venire',
    explanation: 'En latin, après les verbes de déclaration, pensée ou perception (scio, puto, audio), la subordonnée complétive a son sujet à l\'Accusatif (Marcum) et son verbe à l\'Infinitif (venire) : "Je sais que Marcus vient".'
  }
];

export const ClassicalLanguagesView: React.FC<ClassicalLanguagesViewProps> = ({
  lang = 'fr',
  activeTheme = 'light',
  onOpenInBlocknote
}) => {
  const isFr = lang === 'fr';
  const [activeTab, setActiveTab] = useState<'latin' | 'grec'>('latin');
  const [latinSection, setLatinSection] = useState<'all' | 'exercices' | 'cas' | 'declinaisons' | 'conjugaison' | 'syntaxe' | 'civilisation'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive exercises state
  const [exerciseFilter, setExerciseFilter] = useState<'all' | 'declinaisons_1_2' | 'declinaison_3' | 'ablatif_absolu' | 'prop_infinitive'>('all');
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>({});

  const handleSelectAnswer = (exId: string, option: string) => {
    setUserAnswers(prev => ({ ...prev, [exId]: option }));
    setRevealedExplanations(prev => ({ ...prev, [exId]: true }));
  };

  const filteredExercises = LATIN_EXERCISES_DATABASE.filter(ex => {
    if (exerciseFilter !== 'all' && ex.category !== exerciseFilter) return false;
    return true;
  });

  const correctCount = Object.entries(userAnswers).filter(([id, ans]) => {
    const ex = LATIN_EXERCISES_DATABASE.find(e => e.id === id);
    return ex && ex.correctAnswer === ans;
  }).length;

  // Greek Alphabet Data
  const greekAlphabet = [
    { maj: 'Α', min: 'α', name: 'Alpha', sound: '[a]', fr: 'a' },
    { maj: 'Β', min: 'β', name: 'Bêta', sound: '[b]', fr: 'b' },
    { maj: 'Γ', min: 'γ', name: 'Gamma', sound: '[g]', fr: 'g dur' },
    { maj: 'Δ', min: 'δ', name: 'Delta', sound: '[d]', fr: 'd' },
    { maj: 'Ε', min: 'ε', name: 'Epsilon', sound: '[e]', fr: 'é bref' },
    { maj: 'Ζ', min: 'ζ', name: 'Zêta', sound: '[dz]', fr: 'z' },
    { maj: 'Η', min: 'η', name: 'Êta', sound: '[ɛː]', fr: 'è long' },
    { maj: 'Θ', min: 'θ', name: 'Thêta', sound: '[tʰ]', fr: 'th' },
    { maj: 'Ι', min: 'ι', name: 'Iota', sound: '[i]', fr: 'i' },
    { maj: 'Κ', min: 'κ', name: 'Kappa', sound: '[k]', fr: 'k, c dur' },
    { maj: 'Λ', min: 'λ', name: 'Lambda', sound: '[l]', fr: 'l' },
    { maj: 'Μ', min: 'μ', name: 'Mu', sound: '[m]', fr: 'm' },
    { maj: 'Ν', min: 'ν', name: 'Nu', sound: '[n]', fr: 'n' },
    { maj: 'Ξ', min: 'ξ', name: 'Xi', sound: '[ks]', fr: 'x' },
    { maj: 'Ο', min: 'ο', name: 'Omicron', sound: '[o]', fr: 'o bref' },
    { maj: 'Π', min: 'π', name: 'Pi', sound: '[p]', fr: 'p' },
    { maj: 'Ρ', min: 'ρ', name: 'Rhô', sound: '[r]', fr: 'r' },
    { maj: 'Σ', min: 'σ / ς', name: 'Sigma', sound: '[s]', fr: 's' },
    { maj: 'Τ', min: 'τ', name: 'Tau', sound: '[t]', fr: 't' },
    { maj: 'Υ', min: 'υ', name: 'Upsilon', sound: '[y]', fr: 'u français' },
    { maj: 'Φ', min: 'φ', name: 'Phi', sound: '[pʰ / f]', fr: 'ph, f' },
    { maj: 'Χ', min: 'χ', name: 'Khi', sound: '[kʰ]', fr: 'ch allemand' },
    { maj: 'Ψ', min: 'ψ', name: 'Psi', sound: '[ps]', fr: 'ps' },
    { maj: 'Ω', min: 'ω', name: 'Oméga', sound: '[ɔː]', fr: 'ô long' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Hero Header */}
      <div className="p-8 rounded-3xl bg-linear-to-r from-amber-800 via-amber-950 to-stone-900 text-white shadow-xl relative overflow-hidden space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-amber-400/30 text-xs font-black uppercase tracking-wider text-amber-200">
            <Landmark className="w-3.5 h-3.5" />
            <span>Humanités Classiques & Exercices Intégrés</span>
            <span className="text-stone-300">• Latin (Collège, Lycée & Prépa) & Grec Ancien</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveTab('latin')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'latin' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
                }`}
              >
                🏛️ Latin
              </button>
              <button
                onClick={() => setActiveTab('grec')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'grec' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
                }`}
              >
                🏺 Grec Ancien
              </button>
            </div>

            {onOpenInBlocknote && (
              <button
                onClick={() => onOpenInBlocknote(
                  "Latin & Humanités - Déclinaisons & Exercices",
                  "Latin",
                  "# Synthèse Complète de Latin\n\n## Les 6 Cas Latins\n1. Nominatif (Sujet)\n2. Vocatif (Interpellation)\n3. Accusatif (COD)\n4. Génitif (Complément du nom)\n5. Datif (Attribution/COI)\n6. Ablatif (Compléments circonstanciels)\n\n## Les 5 Déclinaisons\n- 1e : rosa, rosae\n- 2e : dominus, domini / templum, templi\n- 3e : consul, consulis / civis, civis / corpus, corporis\n- 4e : manus, manus / cornu, cornus\n- 5e : res, rei"
                )}
                className="px-3.5 py-1.5 rounded-xl bg-white text-slate-900 hover:bg-amber-50 font-bold text-xs shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Exporter dans le Carnet</span>
              </button>
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-serif">
          {activeTab === 'latin' ? 'Lingua Latina : Grammaire, Déclinaisons & Textes' : 'Ἑλληνικὴ γλῶττα : Alphabet, Dialectes & Textes'}
        </h1>
        <p className="text-sm sm:text-base text-amber-100/90 max-w-3xl leading-relaxed font-serif">
          Retrouvez les 6 cas, les 5 déclinaisons latines, les verbes irréguliers (Esse, Velle, Ire), l'ablatif absolu et <span className="font-bold underline text-amber-300">un moteur complet d'exercices interactifs intégrés</span>.
        </p>

        {/* Navigation Tabs */}
        {activeTab === 'latin' && (
          <div className="pt-2 flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Vue Globale', icon: Globe },
              { id: 'exercices', label: '✍️ Exercices de Latin Intégrés', icon: Award, highlight: true },
              { id: 'cas', label: '1. Les 6 Cas & Fonctions', icon: Table },
              { id: 'declinaisons', label: '2. Les 5 Déclinaisons', icon: Layers },
              { id: 'conjugaison', label: '3. Conjugaisons & Esse', icon: Scroll },
              { id: 'syntaxe', label: '4. Ablatif Absolu & Prop. Inf.', icon: Compass },
              { id: 'civilisation', label: '5. Textes & Civilisation', icon: History },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = latinSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setLatinSection(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-stone-950 shadow-md scale-105'
                      : tab.highlight
                      ? 'bg-amber-500 text-stone-950 font-black hover:bg-amber-400'
                      : 'bg-black/30 hover:bg-black/40 text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION: DEDICATED LATIN INTERACTIVE EXERCISES NOTION HUB */}
      {activeTab === 'latin' && (latinSection === 'all' || latinSection === 'exercices') && (
        <div className="p-6 rounded-3xl bg-linear-to-b from-amber-600/5 to-transparent border-2 border-amber-600/30 shadow-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-black">
                <Award className="w-3.5 h-3.5" />
                <span>Entraînement Autonome de Latin</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white font-serif">
                Exercices de Latin avec Correction Morphologique Instantanée
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Maîtrisez les désinences des 5 déclinaisons, l'ablatif absolu et la proposition infinitive.
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
              { id: 'declinaisons_1_2', label: '1ère et 2ème déclinaisons' },
              { id: 'declinaison_3', label: '3ème déclinaison' },
              { id: 'ablatif_absolu', label: 'Ablatif Absolu' },
              { id: 'prop_infinitive', label: 'Proposition Infinitive' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setExerciseFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  exerciseFilter === f.id
                    ? 'bg-amber-700 text-white shadow-xs'
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

              return (
                <div
                  key={exo.id}
                  className={`p-5 rounded-2xl border transition-all text-left space-y-3 ${
                    isAnswered
                      ? isCorrect
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                        : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[10px] font-bold font-serif">
                      {exo.title}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {exo.instruction}
                  </p>

                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 text-sm font-semibold text-stone-900 dark:text-amber-100 font-serif">
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
                          className={`p-2 rounded-xl border text-xs font-semibold font-serif transition-all text-center cursor-pointer ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback Explanation */}
                  {isAnswered && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5 animate-fade-in">
                      <div className="flex items-center gap-1.5 text-xs font-bold font-serif">
                        {isCorrect ? (
                          <span className="text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Optime! Réponse exacte.
                          </span>
                        ) : (
                          <span className="text-rose-700 dark:text-rose-400 inline-flex items-center gap-1">
                            ✕ Erreur morphologique. La bonne réponse est : <strong className="underline">{exo.correctAnswer}</strong>
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

      {/* GREEK SECTION */}
      {activeTab === 'grec' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white font-serif">
                L'Alphabet Grec : Les 24 Lettres Canoniques
              </h3>
              <p className="text-xs text-slate-500">
                L'alphabet grec classique avec majuscule, minuscule, transcription phonétique et équivalence française.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {greekAlphabet.map((letter, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-center space-y-1">
                <div className="text-2xl font-serif font-black text-amber-900 dark:text-amber-300">
                  {letter.maj} {letter.min}
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{letter.name}</div>
                <div className="text-[10px] text-slate-500 font-mono">{letter.sound} ({letter.fr})</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
