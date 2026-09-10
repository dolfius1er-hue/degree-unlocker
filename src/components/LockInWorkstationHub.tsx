import React, { useState, useEffect, useRef } from 'react';
import { AppLanguage } from '../types';
import { 
  Zap, 
  Clock, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Flame, 
  Play, 
  Pause, 
  RotateCcw, 
  ShieldAlert, 
  CheckCircle2, 
  Keyboard,
  Sparkles,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface LockInWorkstationHubProps {
  lang?: AppLanguage;
  onLaunchRevision?: () => void;
  onNewNote?: () => void;
  activeSubject?: string;
}

/**
 * LockInWorkstationHub - Dedicated Tactical Focus & Deep Work Suite for Hardcore PC Mode
 * Provides:
 * 1. Deep Work Chronometer / Pomodoro Timer
 * 2. Native Web Audio 40Hz Gamma Wave Focus Audio Generator
 * 3. Hotkey Navigation Matrix
 * 4. XP 2.0x Lock-In Multiplier
 */
export const LockInWorkstationHub: React.FC<LockInWorkstationHubProps> = ({
  lang = 'fr',
  onLaunchRevision,
  onNewNote,
  activeSubject
}) => {
  const isFr = lang === 'fr';

  // Timer State (default 25 minutes)
  const [targetMinutes, setTargetMinutes] = useState<number>(25);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Audio Synth State (40Hz Binaural Gamma Drone via Web Audio API)
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioVolume, setAudioVolume] = useState<number>(0.3);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Hardcore Zen Fullscreen
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  // Hotkey Helper Modal
  const [showHotkeys, setShowHotkeys] = useState<boolean>(false);

  // Timer countdown effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Play soft completion bell via Web Audio
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        g.gain.setValueAtTime(0.3, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.5);
      } catch {}
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsLeft]);

  // Audio Generator for 40Hz Gamma Focus Beats
  const toggleFocusAudio = () => {
    if (isPlayingAudio) {
      // Stop audio
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {}
        audioCtxRef.current = null;
      }
      setIsPlayingAudio(false);
    } else {
      // Start 40Hz Binaural Gamma Focus Wave
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const baseFreq = 200; // Base carrier 200Hz
        const gammaFreq = 40;  // 40Hz binaural shift (240Hz on right)

        // Left ear oscillator
        const oscL = ctx.createOscillator();
        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(baseFreq, ctx.currentTime);

        // Right ear oscillator
        const oscR = ctx.createOscillator();
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(baseFreq + gammaFreq, ctx.currentTime);

        const merger = ctx.createChannelMerger(2);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(audioVolume * 0.15, ctx.currentTime);
        gainNodeRef.current = gain;

        oscL.connect(merger, 0, 0);
        oscR.connect(merger, 0, 1);
        merger.connect(gain);
        gain.connect(ctx.destination);

        oscL.start();
        oscR.start();

        osc1Ref.current = oscL;
        osc2Ref.current = oscR;
        setIsPlayingAudio(true);
      } catch (e) {
        console.warn('Web Audio synthesis not supported or blocked:', e);
      }
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {}
      }
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const setTimerDuration = (mins: number) => {
    setTargetMinutes(mins);
    setSecondsLeft(mins * 60);
    setIsTimerRunning(false);
  };

  const toggleFullscreenZen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsZenMode(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsZenMode(false);
    }
  };

  return (
    <div className="mb-4 bg-gradient-to-r from-amber-950/40 via-[#0b0d13] to-[#050608] border-y sm:border sm:rounded-2xl border-amber-500/30 p-3 sm:p-4 text-white shadow-xl shadow-black/60 relative overflow-hidden">
      {/* Laser glow line indicator */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />

      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shrink-0 shadow-sm shadow-amber-500/30">
            <Zap className="w-4 h-4 fill-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs sm:text-sm tracking-wide text-white uppercase flex items-center gap-1.5">
                {isFr ? 'MODE PC HARDCORE — LOCK-IN ONYX' : 'HARDCORE PC WORKSTATION — LOCK-IN'}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-wider">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                XP x2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {isFr 
                ? 'Zéro distraction • Chronomètre Deep Work • Onde 40Hz Gamma • Raccourcis Clavier Pro'
                : 'Zero Distraction • Deep Work Timer • 40Hz Gamma Focus Wave • Pro Hotkeys'}
            </p>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowHotkeys(prev => !prev)}
            className="px-2.5 py-1.5 rounded-lg bg-[#11141c] hover:bg-[#1a1e2b] text-slate-300 hover:text-amber-400 border border-[#1e2230] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title={isFr ? "Matrice des Raccourcis Clavier" : "Keyboard Shortcuts Matrix"}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isFr ? 'Raccourcis' : 'Hotkeys'}</span>
          </button>

          <button
            onClick={toggleFullscreenZen}
            className="p-1.5 rounded-lg bg-[#11141c] hover:bg-[#1a1e2b] text-slate-300 hover:text-amber-400 border border-[#1e2230] text-xs transition-colors"
            title={isFr ? "Plein Écran Zen Focus" : "Zen Fullscreen"}
          >
            {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="p-1.5 rounded-lg bg-[#11141c] hover:bg-[#1a1e2b] text-slate-300 hover:text-amber-400 border border-[#1e2230] text-xs transition-colors"
            title={isExpanded ? (isFr ? "Réduire le module" : "Collapse") : (isFr ? "Déplier le module" : "Expand")}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Tools Panel */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-amber-500/20 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Module 1: Deep Work Pomodoro Timer */}
          <div className="bg-[#0b0d13]/80 rounded-xl p-2.5 border border-[#1e2230] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span className="flex items-center gap-1 text-amber-300">
                <Clock className="w-3.5 h-3.5" />
                {isFr ? 'Chronomètre Deep Work' : 'Deep Work Timer'}
              </span>
              <div className="flex items-center gap-1">
                {[15, 25, 50].map(m => (
                  <button
                    key={m}
                    onClick={() => setTimerDuration(m)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      targetMinutes === m 
                        ? 'bg-amber-400 text-slate-950' 
                        : 'bg-[#11141c] text-slate-400 hover:text-white'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="font-mono text-xl sm:text-2xl font-black text-amber-400 tracking-wider">
                {formatTime(secondsLeft)}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsTimerRunning(prev => !prev)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all ${
                    isTimerRunning
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110'
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-slate-950" />}
                  <span>{isTimerRunning ? (isFr ? 'Pause' : 'Pause') : (isFr ? 'Lock-In' : 'Start')}</span>
                </button>
                <button
                  onClick={() => setTimerDuration(targetMinutes)}
                  className="p-1 rounded-lg bg-[#11141c] hover:bg-[#1a1e2b] text-slate-400 hover:text-white border border-[#1e2230]"
                  title={isFr ? "Réinitialiser le temps" : "Reset Timer"}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Module 2: 40Hz Gamma Focus Audio Synthesizer */}
          <div className="bg-[#0b0d13]/80 rounded-xl p-2.5 border border-[#1e2230] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span className="flex items-center gap-1 text-cyan-400">
                <Volume2 className="w-3.5 h-3.5" />
                {isFr ? 'Onde 40Hz Gamma & Synth' : '40Hz Gamma Focus'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {isPlayingAudio ? (isFr ? 'Actif ⚡' : 'Active ⚡') : (isFr ? 'Inactif' : 'Off')}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 mt-1">
              <p className="text-[11px] text-slate-400 leading-tight">
                {isFr ? 'Battement binaural gamma synthétique pour concentration profonde' : 'Binaural gamma tone for peak mental focus'}
              </p>

              <button
                onClick={toggleFocusAudio}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                  isPlayingAudio
                    ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/30'
                    : 'bg-[#11141c] text-cyan-400 hover:bg-[#1a1e2b] border border-cyan-500/40'
                }`}
              >
                {isPlayingAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{isPlayingAudio ? (isFr ? 'Couper' : 'Mute') : (isFr ? 'Écouter' : 'Play')}</span>
              </button>
            </div>
          </div>

          {/* Module 3: Instant Lock-In Action Hub */}
          <div className="bg-[#0b0d13]/80 rounded-xl p-2.5 border border-[#1e2230] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span className="flex items-center gap-1 text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                {isFr ? 'Actions Immédiates' : 'Quick Actions'}
              </span>
              {activeSubject && (
                <span className="text-[10px] text-amber-400 font-bold truncate max-w-[110px]">
                  {activeSubject}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              {onLaunchRevision && (
                <button
                  onClick={onLaunchRevision}
                  className="flex-1 py-1 px-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-sm transition-all text-center truncate"
                >
                  {isFr ? '🚀 Réviser Flashcards' : '🚀 Review Flashcards'}
                </button>
              )}
              {onNewNote && (
                <button
                  onClick={onNewNote}
                  className="py-1 px-2.5 rounded-lg bg-[#11141c] hover:bg-[#1a1e2b] text-slate-200 hover:text-white border border-[#1e2230] font-semibold text-xs transition-colors shrink-0"
                  title={isFr ? "Créer une note rapide" : "Quick Note"}
                >
                  {isFr ? '+ Note' : '+ Note'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hotkey Matrix Popover */}
      {showHotkeys && (
        <div className="mt-3 p-3 rounded-xl bg-black/90 border border-amber-500/30 text-xs space-y-2 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5 font-bold text-amber-400">
            <span>{isFr ? '⌨️ Raccourcis Clavier Lock-In Pro' : '⌨️ Lock-In Keyboard Hotkeys'}</span>
            <button onClick={() => setShowHotkeys(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300">
            <div className="p-1.5 rounded bg-[#11141c] border border-[#1e2230]">
              <kbd className="px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold mr-1">Espace</kbd>
              <span>{isFr ? 'Retourner flashcard' : 'Flip card'}</span>
            </div>
            <div className="p-1.5 rounded bg-[#11141c] border border-[#1e2230]">
              <kbd className="px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold mr-1">1 - 4</kbd>
              <span>{isFr ? 'Noter révision' : 'Rate card'}</span>
            </div>
            <div className="p-1.5 rounded bg-[#11141c] border border-[#1e2230]">
              <kbd className="px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold mr-1">N</kbd>
              <span>{isFr ? 'Nouvelle Note' : 'New Note'}</span>
            </div>
            <div className="p-1.5 rounded bg-[#11141c] border border-[#1e2230]">
              <kbd className="px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold mr-1">F</kbd>
              <span>{isFr ? 'Plein écran Zen' : 'Fullscreen'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default LockInWorkstationHub;
