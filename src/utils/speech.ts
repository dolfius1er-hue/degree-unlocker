// Dual-Engine Natural Speech System:
// 1. Studio Neural Cloud TTS (Ultra-realistic, fluid human pronunciation via server API)
// 2. Enhanced Web Speech API with specific voice selection & neural voice prioritizing
export type TtsEngineMode = 'cloud' | 'browser';

export interface SpeechOptions {
  lang?: 'fr' | 'en';
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceURI?: string;
  engineMode?: TtsEngineMode;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  onBoundary?: (charIndex: number) => void;
}

export interface VoiceDescriptor {
  name: string;
  lang: string;
  voiceURI: string;
  isNatural: boolean;
  qualityLabel: string;
  isDefault: boolean;
}

class SpeechEngine {
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private activeAudio: HTMLAudioElement | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isVoicesLoaded = false;
  private keepAliveInterval: any = null;
  private preferredVoiceURI: string | null = null;
  private engineMode: TtsEngineMode = 'cloud';
  private audioBlobUrls: string[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedVoice = localStorage.getItem('degree_unlocker_tts_voice');
        if (savedVoice) this.preferredVoiceURI = savedVoice;

        const savedMode = localStorage.getItem('degree_unlocker_tts_mode') as TtsEngineMode;
        if (savedMode === 'cloud' || savedMode === 'browser') {
          this.engineMode = savedMode;
        } else {
          this.engineMode = 'cloud'; // Default to cloud for realistic human tone
        }
      } catch {
        // Ignored
      }

      if ('speechSynthesis' in window) {
        this.initVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = () => this.initVoices();
        }
      }
    }
  }

  public getEngineMode(): TtsEngineMode {
    return this.engineMode;
  }

  public setEngineMode(mode: TtsEngineMode) {
    this.engineMode = mode;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('degree_unlocker_tts_mode', mode);
      } catch {
        // Ignored
      }
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      this.voices = window.speechSynthesis.getVoices();
      if (this.voices.length > 0) {
        this.isVoicesLoaded = true;
      }
    } catch {
      // Ignored
    }
  }

  /**
   * Cleans text for prosody: removes robotic bullet hyphens, strips raw emojis,
   * normalizes quotes and inserts slight breath pauses between thoughts.
   */
  public cleanTextForSpeech(text: string): string {
    if (!text) return '';

    let cleaned = text;

    // 1. Remove emojis (which cause TTS engines to say "visage avec larmes", etc.)
    cleaned = cleaned.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu, '');

    // 2. Remove bullet hyphens or asterisks at start of lines
    cleaned = cleaned.replace(/^[\s\t]*[-•*–—]\s*/gm, '');

    // 3. Normalize quotes and brackets
    cleaned = cleaned.replace(/[«»""'']/g, "'");
    cleaned = cleaned.replace(/\s*\(\s*(empire|c'est une blague|parodie)[^)]*\)/gi, '');

    // 4. Transform line breaks into natural breath pauses (commas or periods)
    cleaned = cleaned.replace(/\n\s*\n/g, '. ');
    cleaned = cleaned.replace(/\n/g, ', ');

    // 5. Clean consecutive punctuation and extra spaces
    cleaned = cleaned.replace(/\s*([,.;:!?])\s*/g, '$1 ');
    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();

    return cleaned;
  }

  /**
   * Returns list of available browser voices for target language
   */
  public getAvailableVoices(targetLang: 'fr' | 'en'): VoiceDescriptor[] {
    if (!this.voices.length) {
      this.initVoices();
    }

    const langPrefix = targetLang === 'fr' ? 'fr' : 'en';
    const filtered = this.voices.filter(v => v.lang.toLowerCase().startsWith(langPrefix));

    return filtered.map(v => {
      const lower = v.name.toLowerCase();
      const isOnline = lower.includes('online') || lower.includes('en ligne');
      const isNatural = lower.includes('natural') || lower.includes('naturel') || lower.includes('neural') || isOnline;
      const isGoogle = lower.includes('google');
      const isEnhanced = lower.includes('enhanced') || lower.includes('premium');
      const isDesktop = lower.includes('desktop') || lower.includes('espeak');

      let qualityLabel = 'Standard';
      if (isNatural) qualityLabel = 'Voix Neuronale HD (Recommandée)';
      else if (isGoogle) qualityLabel = 'Google Studio Naturelle';
      else if (isEnhanced) qualityLabel = 'Améliorée Apple HD';
      else if (isDesktop) qualityLabel = 'Voix Système Locale';

      return {
        name: v.name,
        lang: v.lang,
        voiceURI: v.voiceURI,
        isNatural: isNatural || isGoogle || isEnhanced,
        qualityLabel,
        isDefault: v.default
      };
    }).sort((a, b) => {
      if (a.isNatural && !b.isNatural) return -1;
      if (!a.isNatural && b.isNatural) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  public setPreferredVoiceURI(uri: string | null) {
    this.preferredVoiceURI = uri;
    if (typeof window !== 'undefined') {
      try {
        if (uri) {
          localStorage.setItem('degree_unlocker_tts_voice', uri);
        } else {
          localStorage.removeItem('degree_unlocker_tts_voice');
        }
      } catch {
        // Ignored
      }
    }
  }

  public getPreferredVoiceURI(): string | null {
    return this.preferredVoiceURI;
  }

  /**
   * Selects best browser voice available, prioritizing neural/natural voices
   */
  public getBestVoice(targetLang: 'fr' | 'en', explicitURI?: string): SpeechSynthesisVoice | null {
    if (!this.voices.length) {
      this.initVoices();
    }

    const langCode = targetLang === 'fr' ? 'fr' : 'en';
    const candidateVoices = this.voices.filter(v => v.lang.toLowerCase().startsWith(langCode));

    if (candidateVoices.length === 0) return null;

    const uriToFind = explicitURI || this.preferredVoiceURI;
    if (uriToFind) {
      const explicit = candidateVoices.find(v => v.voiceURI === uriToFind || v.name === uriToFind);
      if (explicit) return explicit;
    }

    // Tier 1: Microsoft Natural Online Neural & Google Neural
    const tier1Voice = candidateVoices.find(v => {
      const lower = v.name.toLowerCase();
      return (
        (lower.includes('natural') && lower.includes('online')) ||
        (lower.includes('online') && (lower.includes('denise') || lower.includes('henri') || lower.includes('eloise'))) ||
        lower.includes('google')
      );
    });
    if (tier1Voice) return tier1Voice;

    // Tier 2: Any voice tagged Natural, Neural, Enhanced or Premium
    const tier2Voice = candidateVoices.find(v => {
      const lower = v.name.toLowerCase();
      const hasNaturalTag = lower.includes('natural') || lower.includes('naturel') || lower.includes('neural') || lower.includes('enhanced') || lower.includes('premium');
      const isNotRoboticDesktop = !lower.includes('desktop') && !lower.includes('espeak');
      return hasNaturalTag && isNotRoboticDesktop;
    });
    if (tier2Voice) return tier2Voice;

    // Tier 3: Known warm human names
    const tier3Voice = candidateVoices.find(v => {
      const lower = v.name.toLowerCase();
      const isNotDesktop = !lower.includes('desktop') && !lower.includes('espeak');
      const isWarmName = lower.includes('denise') || lower.includes('henri') || lower.includes('amélie') || lower.includes('amelie') || lower.includes('audrey') || lower.includes('thomas') || lower.includes('julie') || lower.includes('hortense');
      return isWarmName && isNotDesktop;
    });
    if (tier3Voice) return tier3Voice;

    // Fallback: non-desktop voice
    const nonDesktop = candidateVoices.find(v => !v.name.toLowerCase().includes('desktop') && !v.name.toLowerCase().includes('espeak'));
    if (nonDesktop) return nonDesktop;

    const defaultVoice = candidateVoices.find(v => v.default);
    return defaultVoice || candidateVoices[0];
  }

  /**
   * Speak function that seamlessly selects between Studio Cloud Neural Audio and Web Speech API
   */
  public speak(text: string, options: SpeechOptions = {}) {
    this.stop();

    if (!text || !text.trim()) {
      options.onEnd?.();
      return;
    }

    const cleanedText = this.cleanTextForSpeech(text);
    const targetLang = options.lang || 'fr';
    const chosenMode = options.engineMode || this.engineMode;

    if (chosenMode === 'cloud') {
      this.speakViaCloud(cleanedText, targetLang, options);
    } else {
      this.speakViaBrowser(cleanedText, targetLang, options);
    }
  }

  /**
   * Plays realistic studio-grade voice via server /api/tts endpoint
   */
  private speakViaCloud(cleanedText: string, targetLang: 'fr' | 'en', options: SpeechOptions) {
    if (typeof window === 'undefined') {
      options.onError?.('Audio playback not supported in current environment');
      return;
    }

    try {
      const isSlow = (options.rate || 0.92) < 0.85;
      const audioUrl = `/api/tts?text=${encodeURIComponent(cleanedText)}&lang=${targetLang}&slow=${isSlow ? 'true' : 'false'}`;
      
      const audio = new Audio(audioUrl);
      this.activeAudio = audio;

      if (options.volume !== undefined) {
        audio.volume = Math.max(0, Math.min(1, options.volume));
      }

      if (options.rate && options.rate >= 0.85 && options.rate <= 1.5) {
        audio.playbackRate = options.rate;
      }

      audio.onplay = () => {
        options.onStart?.();
      };

      audio.onended = () => {
        this.activeAudio = null;
        options.onEnd?.();
      };

      audio.onerror = (e) => {
        console.warn('Cloud TTS playback error, falling back to local speech synthesis:', e);
        this.activeAudio = null;
        // Graceful fallback to local browser synthesis if network is unavailable
        this.speakViaBrowser(cleanedText, targetLang, options);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err.name !== 'AbortError') {
            console.warn('Audio play failed, falling back to local speech:', err);
            this.speakViaBrowser(cleanedText, targetLang, options);
          }
        });
      }
    } catch (err) {
      console.warn('Error launching cloud audio, falling back to browser speech:', err);
      this.speakViaBrowser(cleanedText, targetLang, options);
    }
  }

  /**
   * Fallback or local engine: Web Speech API
   */
  private speakViaBrowser(cleanedText: string, targetLang: 'fr' | 'en', options: SpeechOptions) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      options.onError?.('Speech synthesis not supported');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    this.activeUtterance = utterance;

    const voice = this.getBestVoice(targetLang, options.voiceURI);
    if (voice) {
      utterance.voice = voice;
    }
    utterance.lang = targetLang === 'fr' ? 'fr-FR' : 'en-US';

    utterance.rate = options.rate ?? 0.92;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 1.0;

    utterance.onstart = () => {
      this.startKeepAlive();
      options.onStart?.();
    };

    utterance.onend = () => {
      this.stopKeepAlive();
      this.activeUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.stopKeepAlive();
      this.activeUtterance = null;
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        options.onError?.(e);
      } else {
        options.onEnd?.();
      }
    };

    if (options.onBoundary) {
      utterance.onboundary = (e) => {
        options.onBoundary?.(e.charIndex);
      };
    }

    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      options.onError?.(e);
    }
  }

  public stop() {
    this.stopKeepAlive();

    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
        this.activeAudio.src = '';
      } catch {
        // Ignored
      }
      this.activeAudio = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignored
      }
    }
    this.activeUtterance = null;
  }

  public isSpeaking(): boolean {
    if (this.activeAudio && !this.activeAudio.paused && !this.activeAudio.ended) {
      return true;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return window.speechSynthesis.speaking && !window.speechSynthesis.paused;
    }
    return false;
  }

  public pause() {
    if (this.activeAudio) {
      this.activeAudio.pause();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  }

  public resume() {
    if (this.activeAudio) {
      this.activeAudio.play();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  }

  private startKeepAlive() {
    this.stopKeepAlive();
    this.keepAliveInterval = setInterval(() => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        this.stopKeepAlive();
      }
    }, 10000);
  }

  private stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }
}

export const speechEngine = new SpeechEngine();
