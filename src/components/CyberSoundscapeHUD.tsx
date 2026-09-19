import React, { useState, useEffect, useRef } from 'react';
import { 
  Headphones, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Sliders, 
  Sparkles, 
  Timer, 
  Minimize2, 
  Maximize2, 
  Radio, 
  Zap,
  Activity,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundFx } from '../utils/soundEffects';
import { AppLanguage } from '../types';

interface CyberSoundscapeHUDProps {
  lang?: AppLanguage;
  onClose?: () => void;
  isFloating?: boolean;
}

type AmbientType = 'binaural_alpha' | 'deep_focus_theta' | 'rain_noise' | 'cosmic_drone';

const SOUNDSCAPES: {
  id: AmbientType;
  nameFr: string;
  nameEn: string;
  descFr: string;
  descEn: string;
  hzBadge: string;
  color: string;
  activeBorder: string;
}[] = [
  {
    id: 'binaural_alpha',
    nameFr: 'Ondes Alpha',
    nameEn: 'Alpha Waves',
    descFr: '10 Hz • Concentration fluide & clarté mentale',
    descEn: '10 Hz • Fluid focus & mental clarity',
    hzBadge: '10 HZ',
    color: 'from-amber-500/20 to-amber-600/10 text-amber-300',
    activeBorder: 'border-amber-400/80 bg-amber-500/20 shadow-amber-500/20',
  },
  {
    id: 'deep_focus_theta',
    nameFr: 'Ondes Thêta',
    nameEn: 'Theta Waves',
    descFr: '6 Hz • Ancrage mnésique & apprentissage intense',
    descEn: '6 Hz • Memory consolidation & deep study',
    hzBadge: '6 HZ',
    color: 'from-indigo-500/20 to-purple-600/10 text-indigo-300',
    activeBorder: 'border-indigo-400/80 bg-indigo-500/20 shadow-indigo-500/20',
  },
  {
    id: 'rain_noise',
    nameFr: 'Pluie Acoustique',
    nameEn: 'Acoustic Rain',
    descFr: 'Pink Noise • Masquage des bruits extérieurs',
    descEn: 'Pink Noise • Complete outside noise masking',
    hzBadge: 'PINK',
    color: 'from-cyan-500/20 to-blue-600/10 text-cyan-300',
    activeBorder: 'border-cyan-400/80 bg-cyan-500/20 shadow-cyan-500/20',
  },
  {
    id: 'cosmic_drone',
    nameFr: 'Cosmos Immersion',
    nameEn: 'Deep Space Drone',
    descFr: 'Harmoniques spatiales • État de Flow absolu',
    descEn: 'Space harmonics • Absolute Flow state',
    hzBadge: 'FLOW',
    color: 'from-emerald-500/20 to-teal-600/10 text-emerald-300',
    activeBorder: 'border-emerald-400/80 bg-emerald-500/20 shadow-emerald-500/20',
  },
];

export const CyberSoundscapeHUD: React.FC<CyberSoundscapeHUDProps> = ({
  lang = 'fr',
  onClose,
  isFloating = true,
}) => {
  const isFr = lang === 'fr';

  const [isPlaying, setIsPlaying] = useState<boolean>(() => soundFx.isAmbientPlaying());
  const [activeTrack, setActiveTrack] = useState<AmbientType>('binaural_alpha');
  const [volume, setVolume] = useState<number>(() => soundFx.getAmbientVolume());
  const [isFxSoundEnabled, setIsFxSoundEnabled] = useState<boolean>(() => soundFx.isEnabled());
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Focus Sprint Timer
  const [timerDurationMin, setTimerDurationMin] = useState<number>(25);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerIntervalRef = useRef<any>(null);

  // Sync state with audio engine
  useEffect(() => {
    setIsPlaying(soundFx.isAmbientPlaying());
  }, []);

  // Timer tick
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            soundFx.playSuccess();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  const togglePlayAmbient = () => {
    soundFx.playClick(600);
    if (isPlaying) {
      soundFx.stopAmbient();
      setIsPlaying(false);
    } else {
      soundFx.startAmbient(activeTrack);
      setIsPlaying(true);
    }
  };

  const selectTrack = (trackId: AmbientType) => {
    soundFx.playClick(750);
    setActiveTrack(trackId);
    if (isPlaying) {
      soundFx.startAmbient(trackId);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundFx.setAmbientVolume(val);
  };

  const toggleFx = () => {
    const next = soundFx.toggleSound();
    setIsFxSoundEnabled(next);
  };

  const startOrResetTimer = (minutes: number) => {
    soundFx.playClick(850);
    setTimerDurationMin(minutes);
    setSecondsRemaining(minutes * 60);
    setIsTimerRunning(true);
  };

  const toggleTimerPause = () => {
    soundFx.playClick(700);
    setIsTimerRunning((prev) => !prev);
  };

  const resetTimer = () => {
    soundFx.playClick(500);
    setIsTimerRunning(false);
    setSecondsRemaining(timerDurationMin * 60);
  };

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Minimized Floating Pill View
  if (isMinimized && isFloating) {
    return (
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-950/90 text-white backdrop-blur-xl border border-amber-500/40 rounded-full px-3.5 py-2 shadow-2xl hover:border-amber-400 transition-all cursor-pointer group"
        onClick={() => {
          soundFx.playClick();
          setIsMinimized(false);
        }}
      >
        <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
        <Headphones className="w-4 h-4 text-amber-400" />
        <span className="text-xs font-black tracking-wide text-amber-200 uppercase">
          {isPlaying ? 'FLOW ON' : 'STUDIO MATRIX'}
        </span>
        {isTimerRunning && (
          <span className="px-1.5 py-0.5 rounded bg-black/60 font-mono text-[10px] text-emerald-400 border border-emerald-500/30 font-bold">
            {formatTimer(secondsRemaining)}
          </span>
        )}
        <Maximize2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors ml-1" />
      </motion.div>
    );
  }

  return (
    <div className={`select-none ${isFloating ? 'fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md w-full' : 'w-full'}`}>
      <div className="bg-gradient-to-b from-slate-950/95 via-slate-900/95 to-black/95 text-white backdrop-blur-2xl rounded-3xl border border-amber-500/40 shadow-[0_12px_45px_-8px_rgba(0,0,0,0.85)] p-4 sm:p-5 relative overflow-hidden transition-all">
        
        {/* Subtle holographic glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md font-black">
              <Headphones className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-black text-amber-200 tracking-tight">
                  {isFr ? 'STUDIO QUANTIQUE & FOCUS' : 'QUANTUM FOCUS MATRIX'}
                </h4>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  V7 APEX
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {isFr ? 'Synthétiseur binaural 100% hors-ligne' : 'Offline binaural audio engine'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Sound FX Toggle Button */}
            <button
              onClick={toggleFx}
              className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                isFxSoundEnabled
                  ? 'bg-amber-500/20 border-amber-400/60 text-amber-300'
                  : 'bg-slate-800/60 border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
              title={isFr ? 'Effets sonores tactiles UI (Clics & Arpèges)' : 'Tactile UI sound effects'}
            >
              <Zap className="w-3.5 h-3.5" />
            </button>

            {isFloating && (
              <>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setIsMinimized(true);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer"
                  title={isFr ? 'Réduire en capsule flottante' : 'Minimize'}
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
                {onClose && (
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onClose();
                    }}
                    className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-slate-700 hover:border-red-500/40 transition-all cursor-pointer"
                    title={isFr ? 'Fermer' : 'Close'}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Ambient Waves Visualizer & Play Bar */}
        <div className="py-3.5 flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayAmbient}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-lg cursor-pointer ${
                isPlaying 
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black ring-4 ring-emerald-500/20'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 ring-2 ring-amber-400/40'
              }`}
              title={isPlaying ? 'Mettre en pause' : 'Lancer le flux audio'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>{isPlaying ? (isFr ? 'Diffusion active' : 'Audio Active') : (isFr ? 'En attente' : 'Standby')}</span>
                {isPlaying && (
                  <span className="flex items-center gap-0.5 h-3">
                    <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1 h-3.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:450ms]" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-amber-300 font-medium">
                {SOUNDSCAPES.find(s => s.id === activeTrack)?.[isFr ? 'nameFr' : 'nameEn']}
              </p>
            </div>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-2 w-28 sm:w-32 bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/10">
            {volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
            <input 
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full accent-amber-400 h-1.5 rounded-full cursor-pointer bg-slate-800"
              title={`Volume : ${Math.round(volume * 100)}%`}
            />
          </div>
        </div>

        {/* 4 Frequency Selector Chips */}
        <div className="grid grid-cols-2 gap-2 relative z-10 pt-1">
          {SOUNDSCAPES.map((sc) => {
            const isSelected = activeTrack === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => selectTrack(sc.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected 
                    ? `${sc.activeBorder} ring-1 ring-white/20 shadow-md` 
                    : 'bg-black/40 hover:bg-white/5 border-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[11px] font-extrabold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {isFr ? sc.nameFr : sc.nameEn}
                  </span>
                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-sm font-mono ${
                    isSelected ? 'bg-black/50 text-amber-300' : 'bg-slate-800/80 text-slate-400'
                  }`}>
                    {sc.hzBadge}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-1 font-medium">
                  {isFr ? sc.descFr : sc.descEn}
                </p>
              </button>
            );
          })}
        </div>

        {/* Focus Sprint Countdown Bar (25 min / 50 min Commando) */}
        <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-mono font-bold text-white">
              {formatTimer(secondsRemaining)}
            </span>
            <span className="text-[10px] text-slate-400">
              ({timerDurationMin}m {isTimerRunning ? (isFr ? 'en cours' : 'running') : (isFr ? 'pause' : 'paused')})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => startOrResetTimer(25)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                timerDurationMin === 25 && isTimerRunning
                  ? 'bg-amber-500 text-black border-amber-400'
                  : 'bg-black/40 hover:bg-white/10 border-white/10 text-slate-300'
              }`}
            >
              25m
            </button>
            <button
              onClick={() => startOrResetTimer(50)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                timerDurationMin === 50 && isTimerRunning
                  ? 'bg-red-500 text-black border-red-400'
                  : 'bg-black/40 hover:bg-white/10 border-white/10 text-slate-300'
              }`}
            >
              50m Commando
            </button>

            <button
              onClick={toggleTimerPause}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title={isTimerRunning ? 'Pause timer' : 'Démarrer timer'}
            >
              {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
