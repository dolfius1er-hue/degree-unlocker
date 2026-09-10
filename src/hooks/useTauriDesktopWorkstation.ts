import { useState, useEffect, useCallback } from 'react';
import { isTauri } from '../lib/tauri-bridge';

export interface UseTauriDesktopWorkstationOptions {
  /**
   * Whether to automatically toggle the .pc-hardcore-onyx class when running in Tauri
   * @default true
   */
  autoEnableOnTauri?: boolean;
  /**
   * Custom storage key for user override
   * @default 'degreelocker_workstation_onyx_mode'
   */
  storageKey?: string;
  /**
   * Callback fired when workstation mode changes
   */
  onModeChange?: (isWorkstation: boolean) => void;
}

export interface UseTauriDesktopWorkstationReturn {
  isTauriEnvironment: boolean;
  isWorkstationMode: boolean;
  toggleWorkstationMode: (forceState?: boolean) => void;
  enableWorkstationMode: () => void;
  disableWorkstationMode: () => void;
  environmentInfo: {
    platform: 'tauri' | 'browser';
    userAgent: string;
    isDesktopScreen: boolean;
  };
}

/**
 * Hook to detect the Tauri native desktop container and automatically apply
 * or toggle the 'pc-hardcore-onyx' class on document.documentElement for
 * a dense, ultra-low-latency, black/charcoal workstation environment.
 */
export function useTauriDesktopWorkstation(
  options: UseTauriDesktopWorkstationOptions = {}
): UseTauriDesktopWorkstationReturn {
  const {
    autoEnableOnTauri = true,
    storageKey = 'degreelocker_workstation_onyx_mode',
    onModeChange,
  } = options;

  // Detect Tauri native desktop environment
  const [isTauriEnvironment, setIsTauriEnvironment] = useState<boolean>(() => {
    return isTauri();
  });

  const [isDesktopScreen, setIsDesktopScreen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024;
  });

  // Workstation Onyx mode state
  const [isWorkstationMode, setIsWorkstationMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;

    // Check query params (?workstation=1, ?onyx=1)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('workstation') === 'true' || urlParams.get('onyx') === 'true') {
        return true;
      }
    } catch (_) {}

    // Check user preference in localStorage
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        return stored === 'true';
      }
    } catch (_) {}

    // Default to enabled if running in native Tauri desktop container
    return autoEnableOnTauri && isTauri();
  });

  // Keep screen size reactive
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsDesktopScreen(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync class on document root and body whenever isWorkstationMode changes
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const body = document.body;
    const ONYX_CLASS = 'pc-hardcore-onyx';

    if (isWorkstationMode) {
      root.classList.add(ONYX_CLASS);
      root.classList.add('dark');
      if (body) body.classList.add(ONYX_CLASS);
      root.setAttribute('data-theme', 'hardcore-onyx');
      root.setAttribute('data-workstation', 'true');
    } else {
      root.classList.remove(ONYX_CLASS);
      if (body) body.classList.remove(ONYX_CLASS);
      root.removeAttribute('data-workstation');
      if (root.getAttribute('data-theme') === 'hardcore-onyx') {
        root.removeAttribute('data-theme');
      }
    }

    if (onModeChange) {
      onModeChange(isWorkstationMode);
    }
  }, [isWorkstationMode, onModeChange]);

  // Toggle helper
  const toggleWorkstationMode = useCallback((forceState?: boolean) => {
    setIsWorkstationMode((prev) => {
      const next = typeof forceState === 'boolean' ? forceState : !prev;
      try {
        localStorage.setItem(storageKey, String(next));
      } catch (e) {
        console.warn('[useTauriDesktopWorkstation] Storage error:', e);
      }
      return next;
    });
  }, [storageKey]);

  const enableWorkstationMode = useCallback(() => {
    toggleWorkstationMode(true);
  }, [toggleWorkstationMode]);

  const disableWorkstationMode = useCallback(() => {
    toggleWorkstationMode(false);
  }, [toggleWorkstationMode]);

  return {
    isTauriEnvironment,
    isWorkstationMode,
    toggleWorkstationMode,
    enableWorkstationMode,
    disableWorkstationMode,
    environmentInfo: {
      platform: isTauriEnvironment ? 'tauri' : 'browser',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      isDesktopScreen,
    },
  };
}

export default useTauriDesktopWorkstation;
