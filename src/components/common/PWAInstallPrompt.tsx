import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, CheckCircle, Share2, Sparkles } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);

  useEffect(() => {
    // Check if already running in standalone mode (already installed app)
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    if (checkStandalone()) {
      return;
    }

    // Check localStorage if user previously dismissed or installed
    const dismissed = localStorage.getItem('inzu_pwa_install_dismissed');
    const installed = localStorage.getItem('inzu_pwa_installed');
    if (installed) {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt event (Chromium, Android, Edge, Chrome Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // If not dismissed recently, show the notification
      if (!dismissed) {
        // Small delay so user sees initial page comfortably first
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If on iOS and not dismissed, show install prompt
    if (isIOSDevice && !dismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2500);
      return () => clearTimeout(timer);
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      localStorage.setItem('inzu_pwa_installed', 'true');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
          localStorage.setItem('inzu_pwa_installed', 'true');
        } else {
          localStorage.setItem('inzu_pwa_install_dismissed', Date.now().toString());
        }
      } catch (err) {
        console.error('Error invoking PWA install prompt:', err);
      } finally {
        setDeferredPrompt(null);
        setIsVisible(false);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Fallback for browsers that don't support beforeinstallprompt
      alert('To install, open browser settings (three dots in top right) and select "Install app" or "Add to Home Screen".');
      setIsVisible(false);
      localStorage.setItem('inzu_pwa_install_dismissed', Date.now().toString());
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setShowIOSGuide(false);
    // Remember rejection so we don't nag the user continuously
    localStorage.setItem('inzu_pwa_install_dismissed', Date.now().toString());
  };

  if (!isVisible || isStandalone || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-700 shadow-2xl space-y-4">
        
        {/* Top bar with icon and close */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md shrink-0">
              <img 
                src="/logo.png" 
                alt="Inzu Chafique Properties Agency" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Fast Access App</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-white tracking-tight">
                Install Inzu Chafique App
              </h4>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Close install banner"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message body */}
        <p className="text-xs text-slate-300 leading-relaxed">
          Install our web application on your <strong className="text-white">Desktop or Mobile phone</strong> for 1-tap access to verified Kigali properties, offline listings, and direct WhatsApp broker bookings.
        </p>

        {/* iOS Instruction Helper Modal / Dropdown */}
        {showIOSGuide && (
          <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-xs text-slate-200 space-y-2">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5" />
              <span>How to Install on iPhone / iPad:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
              <li>Tap the <strong className="text-white">Share button</strong> (box with arrow up) at the bottom of Safari.</li>
              <li>Scroll down and tap <strong className="text-white">'Add to Home Screen'</strong>.</li>
              <li>Tap <strong className="text-white">'Add'</strong> in top-right corner to finish.</li>
            </ol>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleInstallClick}
            className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isIOS ? 'View Install Steps' : 'Install Application'}</span>
          </button>

          <button
            onClick={handleDismiss}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Not Now
          </button>
        </div>

      </div>
    </div>
  );
};
