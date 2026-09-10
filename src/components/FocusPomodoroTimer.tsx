import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Sparkles, Coffee, Bell, Volume2, VolumeX, Settings2, Check } from 'lucide-react';

interface FocusPomodoroTimerProps {
  lang?: 'fr' | 'en';
  onSessionComplete?: (sessionType: 'work' | 'break', durationMinutes: number) => void;
}

export const FocusPomodoroTimer: React.FC<FocusPomodoroTimerProps> = ({
  lang = 'fr',
  onSessionComplete,
}) => {
  const [mode, setMode] = useState<'work' | 'short_break' | 'long_break'>('work');
  const [workDuration, setWorkDuration] = useState<number>(25); // minutes
  const [shortBreakDuration, setShortBreakDuration] = useState<number>(5);
  const [longBreakDuration, setLongBreakDuration] = useState<number>(15);
  const [customWorkInput, setCustomWorkInput] = useState<string>('25');
  
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [completedCycles, setCompletedCycles] = useState<number>(0);

  const popoverRef = useRef<HTMLDivElement>(null);

  // Helper to get duration in seconds for current mode
  const getInitialSeconds = (targetMode: 'work' | 'short_break' | 'long_break') => {
    if (targetMode === 'work') return workDuration * 60;
    if (targetMode === 'short_break') return shortBreakDuration * 60;
    return longBreakDuration * 60;
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsPopoverOpen(false);
      }
    };
    if (isPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPopoverOpen]);

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Play chime if sound is enabled
      if (soundEnabled) {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
          osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
          gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.8);
        } catch {}
      }

      if (mode === 'work') {
        setCompletedCycles((c) => c + 1);
        if (onSessionComplete) onSessionComplete('work', workDuration);
        // Switch to short break or long break after 4 sessions
        const nextBreak = (completedCycles + 1) % 4 === 0 ? 'long_break' : 'short_break';
        setMode(nextBreak);
        setTimeLeft(getInitialSeconds(nextBreak));
      } else {
        if (onSessionComplete) onSessionComplete('break', mode === 'short_break' ? shortBreakDuration : longBreakDuration);
        setMode('work');
        setTimeLeft(getInitialSeconds('work'));
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, workDuration, shortBreakDuration, longBreakDuration, soundEnabled, completedCycles]);

  const handleSwitchMode = (newMode: 'work' | 'short_break' | 'long_break') => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(getInitialSeconds(newMode));
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(getInitialSeconds(mode));
  };

  const handleSaveCustomSettings = () => {
    const parsed = parseInt(customWorkInput, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 120) {
      setWorkDuration(parsed);
      if (mode === 'work') {
        setIsRunning(false);
        setTimeLeft(parsed * 60);
      }
    }
    setIsSettingsOpen(false);
  };

  // Format time
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Progress percentage
  const totalSeconds = getInitialSeconds(mode);
  const progressPercent = totalSeconds > 0 ? Math.round(((totalSeconds - timeLeft) / totalSeconds) * 100) : 0;

  return (
    <div className="relative" ref={popoverRef}>
      {/* Header Pill Button */}
      <button
        id="btn-pomodoro-timer-pill"
        onClick={() => setIsPopoverOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer select-none text-xs font-bold ${
          isRunning
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 shadow-xs'
            : 'bg-slate-100/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
        }`}
        title={lang === 'fr' ? 'Minuteur de Focus Pomodoro' : 'Pomodoro Focus Timer'}
      >
        <div className="relative flex items-center justify-center">
          {mode === 'work' ? (
            <Timer className={`w-3.5 h-3.5 ${isRunning ? 'animate-pulse text-amber-500' : 'text-slate-400'}`} />
          ) : (
            <Coffee className="w-3.5 h-3.5 text-emerald-500" />
          )}
          {isRunning && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
          )}
        </div>
        
        <span className="font-mono tracking-tight text-xs font-black">
          {formattedTime}
        </span>

        <span className="hidden sm:inline-block text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded-md bg-slate-200/70 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300">
          {mode === 'work' ? (lang === 'fr' ? 'Focus' : 'Focus') : (lang === 'fr' ? 'Pause' : 'Break')}
        </span>
      </button>

      {/* Popover Card */}
      {isPopoverOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                mode === 'work' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
              }`}>
                {mode === 'work' ? <Timer className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {lang === 'fr' ? 'Session de Focus' : 'Study Focus Timer'}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {lang === 'fr' ? `${completedCycles} cycle(s) validé(s)` : `${completedCycles} cycle(s) completed`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={soundEnabled ? (lang === 'fr' ? 'Son activé' : 'Sound ON') : (lang === 'fr' ? 'Son coupé' : 'Sound OFF')}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-500" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isSettingsOpen ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={lang === 'fr' ? 'Personnaliser durées' : 'Custom Durations'}
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => handleSwitchMode('work')}
              className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'work'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {lang === 'fr' ? `Focus (${workDuration}m)` : `Work (${workDuration}m)`}
            </button>
            <button
              onClick={() => handleSwitchMode('short_break')}
              className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'short_break'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {lang === 'fr' ? `Pause (${shortBreakDuration}m)` : `Short (${shortBreakDuration}m)`}
            </button>
            <button
              onClick={() => handleSwitchMode('long_break')}
              className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'long_break'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {lang === 'fr' ? `Longue (${longBreakDuration}m)` : `Long (${longBreakDuration}m)`}
            </button>
          </div>

          {/* Settings Sub-panel */}
          {isSettingsOpen && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 text-xs">
              <span className="font-extrabold text-[11px] text-slate-700 dark:text-slate-300">
                {lang === 'fr' ? 'Durée de travail personnalisée' : 'Custom Work Duration'}
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  {[15, 25, 45, 50, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => {
                        setCustomWorkInput(mins.toString());
                        setWorkDuration(mins);
                        if (mode === 'work') {
                          setIsRunning(false);
                          setTimeLeft(mins * 60);
                        }
                      }}
                      className={`px-2 py-1 rounded-md font-bold text-[10px] transition-colors cursor-pointer ${
                        workDuration === mins
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Big Time Display & Progress */}
          <div className="text-center py-2 space-y-2">
            <div className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              {formattedTime}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  mode === 'work' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span>0%</span>
              <span>{progressPercent}% {lang === 'fr' ? 'écoulé' : 'elapsed'}</span>
              <span>100%</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-slate-950" />
                  <span>{lang === 'fr' ? 'Pause' : 'Pause'}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>{lang === 'fr' ? 'Démarrer' : 'Start'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title={lang === 'fr' ? 'Réinitialiser' : 'Reset'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
