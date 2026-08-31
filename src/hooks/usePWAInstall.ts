import { useState, useEffect, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const STORAGE_KEY_INSTALLED = 'inzu_pwa_installed';
const STORAGE_KEY_REJECTED = 'inzu_pwa_rejected';
const STORAGE_KEY_DISMISSED = 'inzu_pwa_dismissed';

export function checkIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

export function checkIsInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  if (checkIsStandalone()) return true;
  return localStorage.getItem(STORAGE_KEY_INSTALLED) === 'true';
}

export function checkIsRejectedOrDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    localStorage.getItem(STORAGE_KEY_REJECTED) === 'true' ||
    localStorage.getItem(STORAGE_KEY_DISMISSED) === 'true'
  );
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isRejectedOrDismissed, setIsRejectedOrDismissed] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [isPC, setIsPC] = useState<boolean>(false);
  const [isInIframe, setIsInIframe] = useState<boolean>(false);

  const syncState = useCallback(() => {
    const standalone = checkIsStandalone();
    const installed = checkIsInstalled();
    const rejected = checkIsRejectedOrDismissed();

    setIsStandalone(standalone);
    setIsInstalled(installed);
    setIsRejectedOrDismissed(rejected);
  }, []);

  useEffect(() => {
    // Initial device & environment detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    const isAndroidDevice = /android/.test(userAgent);
    const isDesktopPC = !isIOSDevice && !isAndroidDevice;

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);
    setIsPC(isDesktopPC);
    setIsInIframe(window.self !== window.top);

    syncState();

    // Listen for BeforeInstallPrompt event (Chrome, Edge, Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for App Installed event
    const handleAppInstalled = () => {
      localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
      setDeferredPrompt(null);
      syncState();
      window.dispatchEvent(new CustomEvent('inzu-pwa-state-change'));
    };

    // Custom sync event across components
    const handleCustomStateChange = () => {
      syncState();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('inzu-pwa-state-change', handleCustomStateChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('inzu-pwa-state-change', handleCustomStateChange);
    };
  }, [syncState]);

  const markInstalled = useCallback(() => {
    localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
    setDeferredPrompt(null);
    syncState();
    window.dispatchEvent(new CustomEvent('inzu-pwa-state-change'));
  }, [syncState]);

  const markRejectedOrDismissed = useCallback(() => {
    localStorage.setItem(STORAGE_KEY_REJECTED, 'true');
    localStorage.setItem(STORAGE_KEY_DISMISSED, 'true');
    syncState();
    window.dispatchEvent(new CustomEvent('inzu-pwa-state-change'));
  }, [syncState]);

  /**
   * The install button should ONLY be visible if:
   * 1. App is NOT running inside standalone installed window
   * 2. User has NOT finished installation
   * 3. User has NOT rejected or dismissed installation
   */
  const showInstallButton = !isStandalone && !isInstalled && !isRejectedOrDismissed;

  return {
    deferredPrompt,
    isStandalone,
    isInstalled,
    isRejectedOrDismissed,
    showInstallButton,
    isIOS,
    isAndroid,
    isPC,
    isInIframe,
    markInstalled,
    markRejectedOrDismissed,
    syncState,
  };
}
