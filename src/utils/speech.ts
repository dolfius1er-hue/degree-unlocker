// Natural Speech Engine with garbage collection protection & natural voice selection
export interface SpeechOptions {
  lang?: 'fr' | 'en';
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  onBoundary?: (charIndex: number) => void;
}

class SpeechEngine {
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isVoicesLoaded = false;
  private keepAliveInterval: any = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
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

  public getBestVoice(targetLang: 'fr' | 'en'): SpeechSynthesisVoice | null {
    if (!this.voices.length) {
      this.initVoices();
    }

    const langCode = targetLang === 'fr' ? 'fr' : 'en';
    const candidateVoices = this.voices.filter(v => v.lang.toLowerCase().startsWith(langCode));

    if (candidateVoices.length === 0) return null;

    // Preference keywords for natural/neural voices
    const preferredKeywords = [
      'natural',
      'neural',
      'google',
      'premium',
      'thomas',
      'audrey',
      'amélie',
      'sébastien',
      'aurélie',
      'julie',
      'paul',
      'samantha',
      'daniel',
      'oliver',
      'serena',
      'siri'
    ];

    for (const kw of preferredKeywords) {
      const found = candidateVoices.find(v => v.name.toLowerCase().includes(kw));
      if (found) return found;
    }

    // Default voice in candidate list
    const defaultVoice = candidateVoices.find(v => v.default);
    return defaultVoice || candidateVoices[0];
  }

  public speak(text: string, options: SpeechOptions = {}) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      options.onError?.('Speech synthesis not supported');
      return;
    }

    this.stop();

    if (!text || !text.trim()) {
      options.onEnd?.();
      return;
    }

    const cleanText = text.trim();
    const targetLang = options.lang || 'fr';
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Store in instance to avoid Chrome garbage-collection bug
    this.activeUtterance = utterance;

    const voice = this.getBestVoice(targetLang);
    if (voice) {
      utterance.voice = voice;
    }
    utterance.lang = targetLang === 'fr' ? 'fr-FR' : 'en-US';
    utterance.rate = options.rate ?? 0.98;
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
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    return window.speechSynthesis.speaking && !window.speechSynthesis.paused;
  }

  public pause() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  }

  public resume() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  }

  // Workaround for Chromium 15-second speech freeze
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
