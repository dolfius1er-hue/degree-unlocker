import { useState, useEffect, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface UseDownloadWindowsExeReturn {
  isDownloadingExe: boolean;
  downloadWindowsExe: () => void;
  copyPowershellExeCommand: () => void;
  copiedCommand: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  showInstallModal: boolean;
  setShowInstallModal: (show: boolean) => void;
}

/**
 * Custom hook to manage the browser-native PWA installation prompts and fallbacks
 */
export function useDownloadWindowsExe(): UseDownloadWindowsExeReturn {
  const [isDownloadingExe, setIsDownloadingExe] = useState<boolean>(false);
  const [copiedCommand, setCopiedCommand] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect standalone mode (already installed PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowInstallModal(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const downloadWindowsExe = useCallback(async () => {
    if (typeof window === 'undefined') return;
    setIsDownloadingExe(true);

    try {
      if (deferredPrompt) {
        // Trigger native browser install prompt
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
        }
      } else {
        // Open the beautiful step-by-step PWA install modal guide
        setShowInstallModal(true);
      }
    } catch (e) {
      console.warn('[useDownloadWindowsExe] Installation Prompt failed:', e);
      setShowInstallModal(true);
    } finally {
      setIsDownloadingExe(false);
    }
  }, [deferredPrompt]);

  const copyPowershellExeCommand = useCallback(() => {
    if (typeof window === 'undefined') return;
    const origin = window.location.origin;
    const command = `$d = [Environment]::GetFolderPath('Desktop'); $s = (New-Object -ComObject WScript.Shell).CreateShortcut("$d\\DegreeUnlocker.lnk"); $s.TargetPath = 'msedge.exe'; $s.Arguments = '--app=${origin} --window-size=1440,900 --start-maximized'; $s.Save(); Start-Process "$d\\DegreeUnlocker.lnk"`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(command);
      setCopiedCommand(true);
      setTimeout(() => setCopiedCommand(false), 2000);
    }
  }, []);

  return {
    isDownloadingExe,
    downloadWindowsExe,
    copyPowershellExeCommand,
    copiedCommand,
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    showInstallModal,
    setShowInstallModal,
  };
}

export default useDownloadWindowsExe;
