import React, { useState, useEffect, useRef } from 'react';
import { STUDY_PLAYLISTS, STUDY_TIPS, StudyPlaylist, StudyTip } from '../data/studyPlaylists';
import { AppLanguage } from '../types';
import { 
  Headphones, 
  Music, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Play, 
  Pause, 
  ExternalLink, 
  Clock, 
  Zap, 
  Brain, 
  CloudRain, 
  Coffee, 
  Waves, 
  Lightbulb, 
  Check, 
  X,
  Shuffle,
  ShieldCheck,
  Flame
} from 'lucide-react';

interface StudyPlaylistsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: AppLanguage;
}

export const StudyPlaylistsModal: React.FC<StudyPlaylistsModalProps> = ({
  isOpen,
  onClose,
  lang = 'fr',
}) => {
  const [activeTab, setActiveTab] = useState<'playlists' | 'ambient' | 'tips'>('playlists');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  
  // Ambient Sound Generator (Web Audio API)
  const [playingAmbient, setPlayingAmbient] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.5);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioNode | null>(null);

  // Stop sound on unmount or modal close
  const stopAmbientSound = () => {
    if (noiseSourceRef.current) {
      try {
        (noiseSourceRef.current as any).stop?.();
        noiseSourceRef.current.disconnect();
      } catch (e) {
        // ignore
      }
      noiseSourceRef.current = null;
    }
    setPlayingAmbient(null);
  };

  useEffect(() => {
    if (!isOpen) {
      stopAmbientSound();
    }
    return () => {
      stopAmbientSound();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, [isOpen]);

  const toggleAmbientSound = (type: 'rain' | 'brown' | 'binaural' | 'whitenoise') => {
    if (playingAmbient === type) {
      stopAmbientSound();
      return;
    }

    stopAmbientSound();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
      gain.connect(ctx.destination);
      gainNodeRef.current = gain;

      if (type === 'binaural') {
        // Create 2 oscillators: 200Hz left, 240Hz right (40Hz Gamma beat)
        const merger = ctx.createChannelMerger(2);
        const oscLeft = ctx.createOscillator();
        const oscRight = ctx.createOscillator();

        oscLeft.type = 'sine';
        oscLeft.frequency.value = 200;
        oscRight.type = 'sine';
        oscRight.frequency.value = 240;

        oscLeft.connect(merger, 0, 0);
        oscRight.connect(merger, 0, 1);
        merger.connect(gain);

        oscLeft.start();
        oscRight.start();

        noiseSourceRef.current = {
          disconnect: () => {
            oscLeft.stop();
            oscRight.stop();
            oscLeft.disconnect();
            oscRight.disconnect();
            merger.disconnect();
          }
        } as any;
      } else {
        // Buffer-based noise generator (Rain, Brown noise, White noise)
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (type === 'brown') {
            lastOut = (lastOut + 0.02 * white) / 1.02;
            data[i] = lastOut * 3.5;
          } else if (type === 'rain') {
            // Filtered rain drops simulation
            const drop = Math.random() > 0.98 ? Math.random() * 0.5 : 0;
            lastOut = (lastOut + 0.05 * white) / 1.05;
            data[i] = (lastOut * 1.5) + drop;
          } else {
            // White noise
            data[i] = white * 0.3;
          }
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        // Biquad Filter for natural warmth
        const filter = ctx.createBiquadFilter();
        filter.type = type === 'brown' ? 'lowpass' : type === 'rain' ? 'bandpass' : 'allpass';
        filter.frequency.value = type === 'brown' ? 350 : type === 'rain' ? 800 : 1000;

        noise.connect(filter);
        filter.connect(gain);
        noise.start();

        noiseSourceRef.current = noise;
      }

      setPlayingAmbient(type);
    } catch (e) {
      console.warn('Web Audio Ambient error:', e);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVol * 0.15, audioContextRef.current.currentTime);
    }
  };

  if (!isOpen) return null;

  const filteredPlaylists = selectedGenre === 'all' 
    ? STUDY_PLAYLISTS 
    : STUDY_PLAYLISTS.filter(p => p.genre === selectedGenre);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-12 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-white overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-400 shadow-inner">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {lang === 'fr' ? 'Playlists d\'Étude & Sons d\'Ambiance' : 'Study Playlists & Focus Soundscapes'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Focus Zone
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'fr' ? 'Stimulez votre concentration et accélérez votre mémorisation' : 'Optimal acoustic environments for sustained focus and deep recall'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800/80 bg-slate-950/30">
          <button
            onClick={() => setActiveTab('playlists')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'playlists'
                ? 'border-indigo-500 text-white bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music className="w-4 h-4 text-indigo-400" />
            <span>{lang === 'fr' ? 'Playlists Recommandées' : 'Curated Playlists'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-300 font-mono">
              {STUDY_PLAYLISTS.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ambient')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'ambient'
                ? 'border-amber-500 text-white bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Waves className="w-4 h-4 text-amber-400" />
            <span>{lang === 'fr' ? 'Générateur de Bruit Blanc & Pluie (Offline)' : 'Offline Soundscapes'}</span>
            {playingAmbient && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('tips')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'tips'
                ? 'border-purple-500 text-white bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-purple-400" />
            <span>{lang === 'fr' ? 'Conseils de Mémorisation' : 'Memory & Focus Tips'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-300 font-mono">
              {STUDY_TIPS.length}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
          
          {/* TAB 1: CURATED PLAYLISTS */}
          {activeTab === 'playlists' && (
            <div className="space-y-4">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: lang === 'fr' ? 'Tous les genres' : 'All Genres' },
                  { id: 'lofi', label: 'Lofi Chill' },
                  { id: 'classical', label: lang === 'fr' ? 'Piano Classique' : 'Classical Piano' },
                  { id: 'binaural', label: '40Hz Gamma Beats' },
                  { id: 'brown_noise', label: lang === 'fr' ? 'Bruit Brun' : 'Brown Noise' },
                  { id: 'ambience', label: lang === 'fr' ? 'Café & Pluie' : 'Cafe & Rain' },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGenre(g.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedGenre === g.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              {/* Playlist Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredPlaylists.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/60 transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                          {p.genre.toUpperCase()}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {p.duration}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                        {lang === 'fr' ? p.titleFr : p.title}
                      </h4>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        {lang === 'fr' ? p.descriptionFr : p.description}
                      </p>

                      <div className="text-[11px] text-emerald-400/90 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-900/60">
                        <span className="font-bold">{lang === 'fr' ? 'Idéal pour : ' : 'Ideal for: '}</span>
                        {lang === 'fr' ? p.idealForFr : p.idealFor}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800/80">
                      <span className="text-[11px] font-mono text-slate-400">
                        Tempo: {p.bpm}
                      </span>
                      <a
                        href={p.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{lang === 'fr' ? 'Écouter sur YouTube' : 'Play Track'}</span>
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: BUILT-IN OFFLINE AMBIENT GENERATOR */}
          {activeTab === 'ambient' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  {lang === 'fr'
                    ? 'Ces ambiances sonores sont synthétisées directement par votre navigateur (Web Audio API). Elles fonctionnent instantanément sans consommer de bande passante et même sans connexion Internet !'
                    : 'These soundscapes are generated directly in your browser using real-time Web Audio synthesis. They work offline with zero bandwidth consumption.'}
                </p>
              </div>

              {/* Volume Slider */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                  <span>{lang === 'fr' ? 'Volume sonore :' : 'Master Volume:'}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-48 accent-indigo-500 cursor-pointer"
                />
                <span className="text-xs font-mono text-slate-400 w-10 text-right">
                  {Math.round(volume * 100)}%
                </span>
              </div>

              {/* Sound Generator Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Rain */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  playingAmbient === 'rain' 
                    ? 'bg-indigo-950/70 border-indigo-500 shadow-lg' 
                    : 'bg-slate-950/70 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <CloudRain className="w-5 h-5" />
                    </div>
                    <button
                      onClick={() => toggleAmbientSound('rain')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        playingAmbient === 'rain'
                          ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {playingAmbient === 'rain' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>{playingAmbient === 'rain' ? (lang === 'fr' ? 'Arrêter' : 'Stop') : (lang === 'fr' ? 'Pluie Douce' : 'Gentle Rain')}</span>
                    </button>
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1">{lang === 'fr' ? 'Averse Calme sur Vitre' : 'Calm Raindrops'}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {lang === 'fr' ? 'Bruit de pluie relaxant pour créer un cocon d\'étude feutré.' : 'Relaxing continuous rainfall mask for sustained reading.'}
                  </p>
                </div>

                {/* 2. Brown Noise */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  playingAmbient === 'brown' 
                    ? 'bg-amber-950/70 border-amber-500 shadow-lg' 
                    : 'bg-slate-950/70 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Waves className="w-5 h-5" />
                    </div>
                    <button
                      onClick={() => toggleAmbientSound('brown')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        playingAmbient === 'brown'
                          ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                          : 'bg-amber-600 hover:bg-amber-500 text-white'
                      }`}
                    >
                      {playingAmbient === 'brown' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>{playingAmbient === 'brown' ? (lang === 'fr' ? 'Arrêter' : 'Stop') : (lang === 'fr' ? 'Bruit Brun' : 'Brown Noise')}</span>
                    </button>
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1">{lang === 'fr' ? 'Bruit Brun Fréquence Basse' : 'Deep Brown Noise'}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {lang === 'fr' ? 'Masque tous les bruits d\'ambiance et supprime les distractions mentales.' : 'Low-rumble acoustic mask that immediately quietens mind wandering.'}
                  </p>
                </div>

                {/* 3. Binaural 40Hz */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  playingAmbient === 'binaural' 
                    ? 'bg-purple-950/70 border-purple-500 shadow-lg' 
                    : 'bg-slate-950/70 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <Brain className="w-5 h-5" />
                    </div>
                    <button
                      onClick={() => toggleAmbientSound('binaural')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        playingAmbient === 'binaural'
                          ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                          : 'bg-purple-600 hover:bg-purple-500 text-white'
                      }`}
                    >
                      {playingAmbient === 'binaural' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>{playingAmbient === 'binaural' ? (lang === 'fr' ? 'Arrêter' : 'Stop') : (lang === 'fr' ? '40Hz Gamma' : '40Hz Gamma')}</span>
                    </button>
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1">{lang === 'fr' ? 'Ondes Gamma 40 Hz (Écouteurs)' : 'Binaural 40Hz Tone'}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {lang === 'fr' ? 'Nécessite un casque stéréo pour synchroniser l\'activité cérébrale d\'apprentissage.' : 'Stereo headphones required to induce hemisphere synchronization.'}
                  </p>
                </div>

                {/* 4. White Noise */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  playingAmbient === 'whitenoise' 
                    ? 'bg-teal-950/70 border-teal-500 shadow-lg' 
                    : 'bg-slate-950/70 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <button
                      onClick={() => toggleAmbientSound('whitenoise')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        playingAmbient === 'whitenoise'
                          ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                          : 'bg-teal-600 hover:bg-teal-500 text-white'
                      }`}
                    >
                      {playingAmbient === 'whitenoise' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>{playingAmbient === 'whitenoise' ? (lang === 'fr' ? 'Arrêter' : 'Stop') : (lang === 'fr' ? 'Bruit Blanc' : 'White Noise')}</span>
                    </button>
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1">{lang === 'fr' ? 'Bruit Blanc Continu' : 'Crisp White Noise'}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {lang === 'fr' ? 'Fréquence équilibrée idéale pour neutraliser les conversations alentour.' : 'Balanced frequency spectrum for masking nearby speech and background chatter.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STUDY TIPS & MEMORY STRATEGIES */}
          {activeTab === 'tips' && (
            <div className="space-y-4">
              {STUDY_TIPS.map((tip) => (
                <div
                  key={tip.id}
                  className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-white">
                      {lang === 'fr' ? tip.titleFr : tip.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-9">
                    {lang === 'fr' ? tip.tipFr : tip.tip}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {lang === 'fr' ? 'Optimisé pour les sessions d\'études intenses et examens' : 'Crafted for high-performance academic revision'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            {lang === 'fr' ? 'Fermer' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
