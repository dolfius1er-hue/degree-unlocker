import { useState, useEffect, useCallback } from 'react';

export type AdaFontSize = 'normal' | 'large' | 'xlarge' | 'huge';
export type AdaContrastMode = 'off' | 'contrast-light' | 'contrast-dark' | 'contrast-mono';
export type AdaLineSpacing = 'normal' | 'relaxed' | 'expanded';

export interface AdaAccessibilityState {
  fontSize: AdaFontSize;
  contrastMode: AdaContrastMode;
  reduceMotion: boolean;
  dyslexiaFont: boolean;
  focusRings: boolean;
  lineSpacing: AdaLineSpacing;
  readingRuler: boolean;
}

const STORAGE_KEY = 'degreelocker_ada_accessibility';

const DEFAULT_STATE: AdaAccessibilityState = {
  fontSize: 'normal',
  contrastMode: 'off',
  reduceMotion: false,
  dyslexiaFont: false,
  focusRings: false,
  lineSpacing: 'normal',
  readingRuler: false,
};

export function useAccessibilityEnhancements() {
  const [settings, setSettings] = useState<AdaAccessibilityState>(() => {
    if (typeof window === 'undefined') return DEFAULT_STATE;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_STATE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('[ADA] Failed to read accessibility settings from localStorage', e);
    }

    // Check system preference for reduced motion if no user setting was saved yet
    const systemReduceMotion = typeof window !== 'undefined' && 
      window.matchMedia && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return {
      ...DEFAULT_STATE,
      reduceMotion: systemReduceMotion,
    };
  });

  // Apply DOM classes whenever settings change
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (!root) return;

    // 1. Font Size Classes
    root.classList.remove('ada-font-large', 'ada-font-xlarge', 'ada-font-huge');
    if (settings.fontSize === 'large') root.classList.add('ada-font-large');
    else if (settings.fontSize === 'xlarge') root.classList.add('ada-font-xlarge');
    else if (settings.fontSize === 'huge') root.classList.add('ada-font-huge');

    // 2. Contrast Modes
    root.classList.remove('ada-contrast-light', 'ada-contrast-dark', 'ada-contrast-mono');
    if (settings.contrastMode === 'contrast-light') root.classList.add('ada-contrast-light');
    else if (settings.contrastMode === 'contrast-dark') root.classList.add('ada-contrast-dark');
    else if (settings.contrastMode === 'contrast-mono') root.classList.add('ada-contrast-mono');

    // 3. Reduced Motion
    if (settings.reduceMotion) {
      root.classList.add('ada-reduce-motion');
      if (body) body.classList.add('ada-reduce-motion');
    } else {
      root.classList.remove('ada-reduce-motion');
      if (body) body.classList.remove('ada-reduce-motion');
    }

    // 4. Dyslexia-friendly Font
    if (settings.dyslexiaFont) {
      root.classList.add('ada-font-dyslexia');
      if (body) body.classList.add('ada-font-dyslexia');
    } else {
      root.classList.remove('ada-font-dyslexia');
      if (body) body.classList.remove('ada-font-dyslexia');
    }

    // 5. Enhanced Focus Rings
    if (settings.focusRings) {
      root.classList.add('ada-focus-rings');
    } else {
      root.classList.remove('ada-focus-rings');
    }

    // 6. Line & Letter Spacing
    root.classList.remove('ada-spacing-relaxed', 'ada-spacing-expanded');
    if (settings.lineSpacing === 'relaxed') root.classList.add('ada-spacing-relaxed');
    else if (settings.lineSpacing === 'expanded') root.classList.add('ada-spacing-expanded');

    // Persist to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('[ADA] Failed to save accessibility settings to localStorage', e);
    }
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof AdaAccessibilityState>(
    key: K,
    value: AdaAccessibilityState[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetAll = useCallback(() => {
    setSettings(DEFAULT_STATE);
  }, []);

  const activeCount = 
    (settings.fontSize !== 'normal' ? 1 : 0) +
    (settings.contrastMode !== 'off' ? 1 : 0) +
    (settings.reduceMotion ? 1 : 0) +
    (settings.dyslexiaFont ? 1 : 0) +
    (settings.focusRings ? 1 : 0) +
    (settings.lineSpacing !== 'normal' ? 1 : 0) +
    (settings.readingRuler ? 1 : 0);

  return {
    settings,
    updateSetting,
    resetAll,
    activeCount,
  };
}
