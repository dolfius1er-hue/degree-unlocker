// ============================================================================
// DEGREE UNLOCKER ACADEMY - CYBERNETIC SOUND & AMBIENT AUDIO SYNTHESIZER
// 100% Offline, Native Web Audio API - Zero External Dependencies & 0 Latency
// ============================================================================

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private currentAmbientSource: { stop: () => void; type: string } | null = null;
  private ambientVolumeNode: GainNode | null = null;
  private ambientVolume: number = 0.25;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedSound = localStorage.getItem('degreelocker_sound_fx_enabled');
        this.soundEnabled = savedSound !== null ? savedSound === 'true' : true;
        const savedVol = localStorage.getItem('degreelocker_ambient_volume');
        if (savedVol) {
          this.ambientVolume = Math.max(0.05, Math.min(1, parseFloat(savedVol) || 0.25));
        }
      } catch {
        this.soundEnabled = true;
      }
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    try {
      localStorage.setItem('degreelocker_sound_fx_enabled', String(this.soundEnabled));
    } catch {}
    if (this.soundEnabled) {
      this.playChime();
    }
    return this.soundEnabled;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    try {
      localStorage.setItem('degreelocker_sound_fx_enabled', String(enabled));
    } catch {}
  }

  // Tactile futuristic UI click
  public playClick(pitch: number = 880): void {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.4, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {}
  }

  // Smooth mode/tab switch whoosh
  public playSwitch(): void {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.06);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.075);
    } catch {}
  }

  // Academic success / Flashcard mastered chime (crystalline arpeggio)
  public playSuccess(): void {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const now = ctx.currentTime + idx * 0.065;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
      });
    } catch {}
  }

  // Quick chime for button toggle
  public playChime(): void {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(880, now + 0.05); // A5

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.19);
    } catch {}
  }

  // Error / Subtle dissonance for wrong choice or error
  public playError(): void {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {}
  }

  // Executive Lock-in / Hardcore mode engage sound
  public playLockIn(): void {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Sub-bass hit
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(120, now);
      sub.frequency.exponentialRampToValueAtTime(55, now + 0.22);
      subGain.gain.setValueAtTime(0.18, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      sub.connect(subGain);
      subGain.connect(ctx.destination);
      sub.start(now);
      sub.stop(now + 0.26);

      // Sci-fi high ping
      const ping = ctx.createOscillator();
      const pingGain = ctx.createGain();
      ping.type = 'triangle';
      ping.frequency.setValueAtTime(880, now + 0.05);
      ping.frequency.exponentialRampToValueAtTime(1760, now + 0.18);
      pingGain.gain.setValueAtTime(0.06, now + 0.05);
      pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      ping.connect(pingGain);
      pingGain.connect(ctx.destination);
      ping.start(now + 0.05);
      ping.stop(now + 0.23);
    } catch {}
  }

  // --------------------------------------------------------------------------
  // AMBIENT STUDY SOUND GENERATOR (100% Offline Procedural Soundscapes)
  // --------------------------------------------------------------------------
  public getAmbientVolume(): number {
    return this.ambientVolume;
  }

  public setAmbientVolume(vol: number): void {
    this.ambientVolume = Math.max(0.01, Math.min(1, vol));
    try {
      localStorage.setItem('degreelocker_ambient_volume', String(this.ambientVolume));
    } catch {}
    if (this.ambientVolumeNode && this.ctx) {
      this.ambientVolumeNode.gain.setTargetAtTime(this.ambientVolume * 0.18, this.ctx.currentTime, 0.05);
    }
  }

  public getActiveAmbientType(): string | null {
    return this.currentAmbientSource?.type || null;
  }

  public isAmbientPlaying(): boolean {
    return this.currentAmbientSource !== null;
  }

  public stopAmbient(): void {
    if (this.currentAmbientSource) {
      try {
        this.currentAmbientSource.stop();
      } catch {}
      this.currentAmbientSource = null;
    }
  }

  public startAmbient(type: 'binaural_alpha' | 'deep_focus_theta' | 'rain_noise' | 'cosmic_drone'): void {
    this.stopAmbient();
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(this.ambientVolume * 0.18, ctx.currentTime + 1.2);
      masterGain.connect(ctx.destination);
      this.ambientVolumeNode = masterGain;

      let cleanupFn: () => void = () => {};

      if (type === 'binaural_alpha') {
        // Alpha Waves (10 Hz beat for calm focus & academic alertness: 210 Hz left, 220 Hz right)
        const merger = ctx.createChannelMerger(2);

        const oscL = ctx.createOscillator();
        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(210, ctx.currentTime);

        const oscR = ctx.createOscillator();
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(220, ctx.currentTime);

        oscL.connect(merger, 0, 0);
        oscR.connect(merger, 0, 1);
        merger.connect(masterGain);

        oscL.start();
        oscR.start();

        cleanupFn = () => {
          try {
            masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
            setTimeout(() => {
              oscL.stop();
              oscR.stop();
              oscL.disconnect();
              oscR.disconnect();
              merger.disconnect();
            }, 450);
          } catch {}
        };
      } else if (type === 'deep_focus_theta') {
        // Theta Waves (6 Hz beat for deep memorization & problem solving: 140 Hz & 146 Hz)
        const merger = ctx.createChannelMerger(2);

        const oscL = ctx.createOscillator();
        oscL.type = 'triangle';
        oscL.frequency.setValueAtTime(140, ctx.currentTime);

        const oscR = ctx.createOscillator();
        oscR.type = 'triangle';
        oscR.frequency.setValueAtTime(146, ctx.currentTime);

        // Lowpass filter for smooth warmth
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);

        oscL.connect(merger, 0, 0);
        oscR.connect(merger, 0, 1);
        merger.connect(filter);
        filter.connect(masterGain);

        oscL.start();
        oscR.start();

        cleanupFn = () => {
          try {
            masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
            setTimeout(() => {
              oscL.stop();
              oscR.stop();
              oscL.disconnect();
              oscR.disconnect();
              merger.disconnect();
              filter.disconnect();
            }, 450);
          } catch {}
        };
      } else if (type === 'rain_noise') {
        // Procedural Pink Noise / Rain Filter
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const rainFilter = ctx.createBiquadFilter();
        rainFilter.type = 'lowpass';
        rainFilter.frequency.setValueAtTime(850, ctx.currentTime);

        whiteNoise.connect(rainFilter);
        rainFilter.connect(masterGain);
        whiteNoise.start();

        cleanupFn = () => {
          try {
            masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
            setTimeout(() => {
              whiteNoise.stop();
              whiteNoise.disconnect();
              rainFilter.disconnect();
            }, 450);
          } catch {}
        };
      } else if (type === 'cosmic_drone') {
        // Deep Space Drone (Warm major chord at low octave with slow harmonic modulation)
        const chord = [65.41, 98.00, 130.81, 196.00]; // C2, G2, C3, G3
        const oscs: OscillatorNode[] = [];

        chord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(300 + idx * 60, ctx.currentTime);

          osc.connect(filter);
          filter.connect(masterGain);
          osc.start();
          oscs.push(osc);
        });

        cleanupFn = () => {
          try {
            masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
            setTimeout(() => {
              oscs.forEach(o => {
                o.stop();
                o.disconnect();
              });
            }, 450);
          } catch {}
        };
      }

      this.currentAmbientSource = {
        stop: cleanupFn,
        type,
      };
    } catch {}
  }
}

export const soundFx = new SoundEngine();
