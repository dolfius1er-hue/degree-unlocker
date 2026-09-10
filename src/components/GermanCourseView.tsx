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
  FileText,
  Volume2,
  Table,
  Compass,
  ArrowRight,
  Globe,
  Split,
  Award,
  Zap,
  RotateCcw,
  BookMarked
} from 'lucide-react';

interface GermanCourseViewProps {
  lang?: AppLanguage;
  activeTheme?: AppTheme;
  onOpenInBlocknote?: (title: string, subject: string, content: string) => void;
}

interface GermanExercise {
  id: string;
  category: 'artikel' | 'wechselpraepositionen' | 'starke_verben' | 'nebensaetze' | 'passiv';
  title: string;
  instruction: string;
  sentence: string; // contains [___]
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const GERMAN_EXERCISES_DATABASE: GermanExercise[] = [
  // Déclinaisons des Articles
  {
    id: 'de-ex-1',
    category: 'artikel',
    title: 'DÉCLINAISON : ACCUSATIF MASCULIN',
    instruction: 'Choisissez l\'article défini ou indéfini adapté au COD (Akkusativ) :',
    sentence: 'Der Schüler liest [___] (der Roman / masculin) für die Deutschstunde.',
    options: ['den Roman', 'dem Roman', 'der Roman', 'des Romans'],
    correctAnswer: 'den Roman',
    explanation: 'Le verbe lesen appelle un Complément d\'Objet Direct (Akkusativ). L\'article défini masculin au singulier à l\'accusatif devient obligatoirement DEN.'
  },
  {
    id: 'de-ex-2',
    category: 'artikel',
    title: 'DÉCLINAISON : DATIF (COI / Complément d\'attribution)',
    instruction: 'Choisissez la bonne forme de l\'article au datif :',
    sentence: 'Ich gebe [___] (die Lehrerin / féminin) meine Hausaufgaben.',
    options: ['der Lehrerin', 'die Lehrerin', 'den Lehrerin', 'dem Lehrerin'],
    correctAnswer: 'der Lehrerin',
    explanation: 'Le verbe geben prend un COI au Datif (à qui ?). L\'article défini féminin au datif devient DER (die -> der).'
  },
  {
    id: 'de-ex-3',
    category: 'artikel',
    title: 'DÉCLINAISON : GÉNITIF (Complément du nom)',
    instruction: 'Complétez avec le génitif correct :',
    sentence: 'Das Auto [___] (mein Vater / masculin) steht in der Garage.',
    options: ['meines Vaters', 'meinem Vater', 'meinen Vater', 'mein Vater'],
    correctAnswer: 'meines Vaters',
    explanation: 'Le complément du nom (la voiture de mon père) se met au Génitif : l\'article/possessif prend la désinence -es et le nom masculin prend un -s final (meines Vaters).'
  },

  // Wechselpräpositionen
  {
    id: 'de-ex-4',
    category: 'wechselpraepositionen',
    title: 'WECHSELPOSITIONEN : LIEU FIXE (Wo? + Dativ)',
    instruction: 'Complétez la préposition mixte avec le cas requis :',
    sentence: 'Das Buch liegt auf [___] (der Tisch / masculin).',
    options: ['dem Tisch', 'den Tisch', 'der Tisch', 'des Tisches'],
    correctAnswer: 'dem Tisch',
    explanation: 'Le verbe liegen indique une position statique sans changement de lieu (Wo? = Où ?). On applique obligatoirement le DATIF : auf + dem Tisch.'
  },
  {
    id: 'de-ex-5',
    category: 'wechselpraepositionen',
    title: 'WECHSELPOSITIONEN : DÉPLACEMENT (Wohin? + Akkusativ)',
    instruction: 'Complétez la préposition avec le cas du mouvement :',
    sentence: 'Ich lege das Buch auf [___] (der Tisch / masculin).',
    options: ['den Tisch', 'dem Tisch', 'der Tisch', 'des Tisches'],
    correctAnswer: 'den Tisch',
    explanation: 'Le verbe legen exprime une action dynamique orientée vers un but (Wohin? = Vers où ?). On applique obligatoirement l\'ACCUSATIF : auf + den Tisch.'
  },
  {
    id: 'de-ex-6',
    category: 'wechselpraepositionen',
    title: 'WECHSELPOSITIONEN : IN (Dativ vs Akkusativ)',
    instruction: 'Mouvement dans un bâtiment :',
    sentence: 'Die Kinder gehen in [___] (die Schule / féminin).',
    options: ['die Schule', 'der Schule', 'den Schule', 'dem Schule'],
    correctAnswer: 'die Schule',
    explanation: 'Le verbe gehen indique un mouvement de direction (Wohin?). L\'accusatif féminin conserve DIE (in die Schule).'
  },

  // Starke Verben
  {
    id: 'de-ex-7',
    category: 'starke_verben',
    title: 'VERBES FORTS : PRÄTERITUM (Passé simple)',
    instruction: 'Identifiez la forme exacte au prétérit :',
    sentence: 'Gestern [___] (sprechen) der Bundeskanzler über die europäische Wirtschaft.',
    options: ['sprach', 'sprecht', 'gesprochen', 'sprichte'],
    correctAnswer: 'sprach',
    explanation: 'Stammformen de sprechen : sprechen / sprach / hat gesprochen. Le prétérit à la 3e personne du singulier est SPRACH.'
  },
  {
    id: 'de-ex-8',
    category: 'starke_verben',
    title: 'VERBES FORTS : PERFEKT AVEC SEIN',
    instruction: 'Choisissez l\'auxiliaire et le participe II adéquats :',
    sentence: 'Letzte Woche [___] meine Freunde nach Berlin [___] (fahren).',
    options: ['sind ... gefahren', 'haben ... gefahren', 'sind ... gefahrt', 'haben ... gefahrt'],
    correctAnswer: 'sind ... gefahren',
    explanation: 'Fahren exprime un déplacement physique, donc l\'auxiliaire du parfait est SEIN (sind), et son participe II fort est GEFAHREN.'
  },

  // Nebensätze
  {
    id: 'de-ex-9',
    category: 'nebensaetze',
    title: 'SUBORDONNÉE AVEC WEIL (Rejet du verbe)',
    instruction: 'Respectez l\'ordre canonique des mots dans la subordonnée :',
    sentence: 'Er lernt fleißig Deutsch, weil er in München studieren [___].',
    options: ['will', 'will er', 'er will', 'gewollt'],
    correctAnswer: 'will',
    explanation: 'Dans toute proposition subordonnée introduite par weil, dass, obwohl, wenn, le verbe conjugué est obligatoirement REJETÉ à la TOUTE FIN de la proposition.'
  },
  {
    id: 'de-ex-10',
    category: 'nebensaetze',
    title: 'SUBORDONNÉE CONCESSIVE AVEC OBWOHL',
    instruction: 'Complétez la phrase complexe :',
    sentence: 'Obwohl es stark [___] (regnen), gehen wir im Park spazieren.',
    options: ['regnet', 'regnete es', 'es regnet', 'geregnet hat'],
    correctAnswer: 'regnet',
    explanation: 'Après obwohl, la structure est Sujet (es) + Compléments + Verbe conjugué à la fin (regnet).'
  },

  // Passiv
  {
    id: 'de-ex-11',
    category: 'passiv',
    title: 'VOIX PASSIVE (Vorgangspassiv)',
    instruction: 'Formez le passif présent :',
    sentence: 'Das neue Museum [___] heute von dem Bürgermeister [___] (eröffnen).',
    options: ['wird ... eröffnet', 'ist ... eröffnet', 'wurde ... eröffnen', 'hat ... eröffnet'],
    correctAnswer: 'wird ... eröffnet',
    explanation: 'Le passif d\'action présent se forme avec WERDEN conjugué + Partizip II en fin de proposition : wird ... eröffnet.'
  }
];

export const GermanCourseView: React.FC<GermanCourseViewProps> = ({
  lang = 'fr',
  activeTheme = 'light',
  onOpenInBlocknote
}) => {
  const isFr = lang === 'fr';
  const [activeSection, setActiveSection] = useState<'all' | 'exercices' | 'bases' | 'cas' | 'syntaxe' | 'conjugaison' | 'culture'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaseTab, setSelectedCaseTab] = useState<'definis' | 'indefinis' | 'prepositions' | 'wechsel'>('definis');
  const [selectedVerb, setSelectedVerb] = useState<'sein' | 'haben' | 'werden' | 'können' | 'müssen' | 'wollen' | 'sprechen'>('sein');

  // Interactive exercises state
  const [exerciseFilter, setExerciseFilter] = useState<'all' | 'artikel' | 'wechselpraepositionen' | 'starke_verben' | 'nebensaetze' | 'passiv'>('all');
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>({});

  const playSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelectAnswer = (exId: string, option: string) => {
    setUserAnswers(prev => ({ ...prev, [exId]: option }));
    setRevealedExplanations(prev => ({ ...prev, [exId]: true }));
  };

  const filteredExercises = GERMAN_EXERCISES_DATABASE.filter(ex => {
    if (exerciseFilter !== 'all' && ex.category !== exerciseFilter) return false;
    return true;
  });

  const correctCount = Object.entries(userAnswers).filter(([id, ans]) => {
    const ex = GERMAN_EXERCISES_DATABASE.find(e => e.id === id);
    return ex && ex.correctAnswer === ans;
  }).length;

  const germanVerbs = {
    sein: {
      name: 'SEIN (Être - Auxiliaire & verbe fondamental)',
      pres: ['ich bin', 'du bist', 'er/sie/es ist', 'wir sind', 'ihr seid', 'sie/Sie sind'],
      pret: ['ich war', 'du warst', 'er/sie/es war', 'wir waren', 'ihr wart', 'sie/Sie waren'],
      perf: 'ist gewesen (auxiliaire sein)',
      konj2: ['ich wäre', 'du wärest', 'er wäre', 'wir wären', 'ihr wäret', 'sie wären']
    },
    haben: {
      name: 'HABEN (Avoir, posséder - Auxiliaire)',
      pres: ['ich habe', 'du hast', 'er/sie/es hat', 'wir haben', 'ihr habt', 'sie/Sie haben'],
      pret: ['ich hatte', 'du hattest', 'er/sie/es hatte', 'wir hatten', 'ihr hattet', 'sie/Sie hatten'],
      perf: 'hat gehabt (auxiliaire haben)',
      konj2: ['ich hätte', 'du hättest', 'er hätte', 'wir hätten', 'ihr hättet', 'sie hätten']
    },
    werden: {
      name: 'WERDEN (Devenir - Auxiliaire du Futur et du Passif)',
      pres: ['ich werde', 'du wirst', 'er/sie/es wird', 'wir werden', 'ihr werdet', 'sie/Sie werden'],
      pret: ['ich wurde', 'du wurdest', 'er/sie/es wurde', 'wir wurden', 'ihr wurdet', 'sie/Sie wurden'],
      perf: 'ist geworden',
      konj2: ['ich würde', 'du würdest', 'er würde', 'wir würden', 'ihr würdet', 'sie würden']
    },
    können: {
      name: 'KÖNNEN (Pouvoir, capacité, savoir-faire)',
      pres: ['ich kann', 'du kannst', 'er/sie/es kann', 'wir können', 'ihr könnt', 'sie/Sie können'],
      pret: ['ich konnte', 'du konntest', 'er/sie/es konnte', 'wir konnten', 'ihr konntet', 'sie/Sie konnten'],
      perf: 'hat gekonnt',
      konj2: ['ich könnte', 'du könntest', 'er könnte', 'wir könnten', 'ihr könntet', 'sie könnten']
    },
    müssen: {
      name: 'MÜSSEN (Devoir, obligation absolue, nécessité physique)',
      pres: ['ich muss', 'du musst', 'er/sie/es muss', 'wir müssen', 'ihr müsst', 'sie/Sie müssen'],
      pret: ['ich musste', 'du musstest', 'er/sie/es musste', 'wir mussten', 'ihr musstet', 'sie/Sie mussten'],
      perf: 'hat gemusst',
      konj2: ['ich müsste', 'du müsstest', 'er müsste', 'wir müssten', 'ihr müsstet', 'sie müssten']
    },
    wollen: {
      name: 'WOLLEN (Vouloir, avoir l\'intention ferme)',
      pres: ['ich will', 'du willst', 'er/sie/es will', 'wir wollen', 'ihr wollt', 'sie/Sie wollen'],
      pret: ['ich wollte', 'du wolltest', 'er/sie/es wollte', 'wir wollten', 'ihr wolltet', 'sie/Sie wollten'],
      perf: 'hat gewollt',
      konj2: ['ich wollte', 'du wolltest', 'er wollte', 'wir wollten', 'ihr wolltet', 'sie wollten']
    },
    sprechen: {
      name: 'SPRECHEN (Parler - Verbe fort à alternance e -> i)',
      pres: ['ich spreche', 'du sprichst', 'er/sie/es spricht', 'wir sprechen', 'ihr sprecht', 'sie/Sie sprechen'],
      pret: ['ich sprach', 'du sprachst', 'er/sie/es sprach', 'wir sprachen', 'ihr spracht', 'sie/Sie sprachen'],
      perf: 'hat gesprochen',
      konj2: ['ich spräche', 'du sprächest', 'er spräche', 'wir sprächen', 'ihr sprächet', 'sie sprächen']
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Hero Header */}
      <div className="p-8 rounded-3xl bg-linear-to-r from-amber-600 via-slate-900 to-black text-white shadow-xl relative overflow-hidden space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-amber-500/30 text-xs font-black uppercase tracking-wider text-amber-300">
            <span>🇩🇪 Manuel & Exercices d'Allemand</span>
            <span className="text-slate-300">• Programme Officiel Collège, Seconde & Cycle Terminal</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => playSpeech("Herzlich willkommen zum vollständigen Deutschkurs! Hier finden Sie Grammatik, Deklinationen und interaktive Übungen.")}
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Prononciation Audio</span>
            </button>
            {onOpenInBlocknote && (
              <button
                onClick={() => onOpenInBlocknote(
                  "Allemand - Tableaux des 4 Cas et Prépositions",
                  "Allemand",
                  "# Manuel Complet d'Allemand\n\n## 1. Les 4 Cas\n- Nominatif : Sujet\n- Accusatif : COD et prépositions (durch, für, gegen, ohne, um)\n- Datif : COI et prépositions (aus, bei, mit, nach, seit, von, zu)\n- Génitif : Complément du nom\n\n## 2. Wechselpräpositionen\nWo? + Dativ vs Wohin? + Akkusativ"
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
          L'Allemand : Du Collège au Baccalauréat (A1 → B2/C1)
        </h1>
        <p className="text-sm sm:text-base text-slate-200 max-w-3xl leading-relaxed">
          Espace Notion autonome regroupant les 4 cas (der/die/das/den/dem/des), les prépositions mixtes, les verbes forts (Stammformen), l'ordre des mots dans les subordonnées et <span className="font-bold underline text-amber-300">un moteur d'exercices interactifs intégré</span>.
        </p>

        {/* Navigation Tabs */}
        <div className="pt-2 flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Vue Globale', icon: Globe },
            { id: 'exercices', label: '✍️ Exercices Interactifs Intégrés', icon: Award, highlight: true },
            { id: 'bases', label: '1. Bases & Phonétique', icon: BookOpen },
            { id: 'cas', label: '2. Les 4 Cas & Prépositions', icon: Table },
            { id: 'syntaxe', label: '3. Ordre des Mots & Subordonnées', icon: Split },
            { id: 'conjugaison', label: '4. Verbes Forts & Stammformen', icon: GraduationCap },
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
                    ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                    : tab.highlight
                    ? 'bg-amber-500 text-slate-950 font-black hover:bg-amber-400'
                    : 'bg-white/10 hover:bg-white/20 text-white'
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
        <div className="p-6 rounded-3xl bg-linear-to-b from-amber-500/5 to-transparent border-2 border-amber-500/30 shadow-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-black">
                <Award className="w-3.5 h-3.5" />
                <span>Entraînement Autonome d'Allemand</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Exercices d'Application avec Correction Instantanée
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Entraînez-vous sur les 4 cas, les Wechselpräpositionen (Wo? vs Wohin?), les Stammformen des verbes forts et la syntaxe des subordonnées.
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
              { id: 'artikel', label: 'Déclinaisons (4 cas)' },
              { id: 'wechselpraepositionen', label: 'Wechselpräpositionen' },
              { id: 'starke_verben', label: 'Verbes forts' },
              { id: 'nebensaetze', label: 'Subordonnées (weil/obwohl)' },
              { id: 'passiv', label: 'Voix Passive' },
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
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                      {exo.title}
                    </span>
                    <button
                      onClick={() => playSpeech(exo.sentence.replace('[___]', '...'))}
                      className="p-1 rounded-lg text-slate-400 hover:text-amber-600 cursor-pointer"
                      title="Écouter la phrase en allemand"
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
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ausgezeichnet! Réponse exacte.
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

      {/* SECTION: LES 4 CAS & TABLEAU RECAPITULATIF */}
      {(activeSection === 'all' || activeSection === 'cas') && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Tableau Canonique des 4 Cas de la Langue Allemande
              </h3>
              <p className="text-xs text-slate-500">
                La clé de voûte de la morphologie allemande : les articles définis et indéfinis.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase font-black">
                  <th className="p-3">Cas</th>
                  <th className="p-3">Fonction Syntaxique</th>
                  <th className="p-3 text-blue-600">Masculin</th>
                  <th className="p-3 text-red-600">Féminin</th>
                  <th className="p-3 text-emerald-600">Neutre</th>
                  <th className="p-3 text-amber-600">Pluriel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 font-medium">
                  <td className="p-3 font-bold">1. Nominativ</td>
                  <td className="p-3 text-slate-500">Sujet / Attribut du sujet (Wer? Was?)</td>
                  <td className="p-3 font-mono font-bold text-blue-600">DER / ein</td>
                  <td className="p-3 font-mono font-bold text-red-600">DIE / eine</td>
                  <td className="p-3 font-mono font-bold text-emerald-600">DAS / ein</td>
                  <td className="p-3 font-mono font-bold text-amber-600">DIE / keine</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 font-medium">
                  <td className="p-3 font-bold">2. Akkusativ</td>
                  <td className="p-3 text-slate-500">COD / Mouvement (Wen? Was?)</td>
                  <td className="p-3 font-mono font-bold text-blue-600 bg-blue-50/50 dark:bg-blue-950/30">DEN / einen</td>
                  <td className="p-3 font-mono font-bold text-red-600">DIE / eine</td>
                  <td className="p-3 font-mono font-bold text-emerald-600">DAS / ein</td>
                  <td className="p-3 font-mono font-bold text-amber-600">DIE / keine</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 font-medium">
                  <td className="p-3 font-bold">3. Dativ</td>
                  <td className="p-3 text-slate-500">COI / Lieu statique (Wem? Wo?)</td>
                  <td className="p-3 font-mono font-bold text-blue-600">DEM / einem</td>
                  <td className="p-3 font-mono font-bold text-red-600 bg-red-50/50 dark:bg-red-950/30">DER / einer</td>
                  <td className="p-3 font-mono font-bold text-emerald-600">DEM / einem</td>
                  <td className="p-3 font-mono font-bold text-amber-600">DEN (+n) / keinen</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 font-medium">
                  <td className="p-3 font-bold">4. Genitiv</td>
                  <td className="p-3 text-slate-500">Complément du nom (Wessen?)</td>
                  <td className="p-3 font-mono font-bold text-blue-600">DES (+s) / eines</td>
                  <td className="p-3 font-mono font-bold text-red-600">DER / einer</td>
                  <td className="p-3 font-mono font-bold text-emerald-600">DES (+s) / eines</td>
                  <td className="p-3 font-mono font-bold text-amber-600">DER / keiner</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
