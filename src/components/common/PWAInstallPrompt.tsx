import React, { useState, useEffect } from 'react';
import { 
  Download, 
  X, 
  Smartphone, 
  Monitor, 
  CheckCircle, 
  Share2, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  MessageCircle, 
  Home, 
  ArrowRight,
  PlusSquare
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallPromptProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  forceOpen = false,
  onClose,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState<boolean>(false);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Check if running in standalone mode (already launched as installed app)
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) {
      return;
    }

    // Detect iOS (iPhone / iPad / iPod)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const previouslyInstalled = localStorage.getItem('inzu_pwa_installed') === 'true';
    if (previouslyInstalled) {
      setIsInstalled(true);
    }

    // Capture beforeinstallprompt event (Chrome, Android, Edge, Samsung Internet, Desktop Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallSuccess(true);
      localStorage.setItem('inzu_pwa_installed', 'true');
      setTimeout(() => {
        setIsOpen(false);
        if (onClose) onClose();
      }, 2000);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if this is the first visit or if install prompt was dismissed in this session
    const dismissedTimestamp = localStorage.getItem('inzu_first_install_modal_dismissed');
    const hasSeenFirstPrompt = sessionStorage.getItem('inzu_session_install_shown');

    // First time visitor prompt: Show full-screen blur modal immediately upon initial open
    if (!isStandaloneMode && !previouslyInstalled && !hasSeenFirstPrompt) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('inzu_session_install_shown', 'true');
      }, 700);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onClose]);

  // Handle external open trigger (e.g. from Navbar "Install App" button)
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
          setInstallSuccess(true);
          localStorage.setItem('inzu_pwa_installed', 'true');
          setTimeout(() => {
            setIsOpen(false);
            if (onClose) onClose();
          }, 1800);
        } else {
          localStorage.setItem('inzu_first_install_modal_dismissed', Date.now().toString());
        }
      } catch (err) {
        console.error('Error invoking PWA install prompt:', err);
      } finally {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      // Fallback for browsers without direct prompt API (Firefox, Safari Mac, or unsupported mobile)
      setShowIOSInstructions(true);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    setShowIOSInstructions(false);
    localStorage.setItem('inzu_first_install_modal_dismissed', Date.now().toString());
    if (onClose) onClose();
  };

  if (!isOpen || isStandalone) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
      onClick={handleDismiss}
    >
      <div 
        className="bg-white rounded-3xl max-w-md sm:max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative text-slate-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with Dark Slate Gradient & Real Square Logo */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-6 sm:p-7 relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer"
            aria-label="Close install modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 relative z-10">
            {/* Square App Icon with crisp border & shadow */}
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-white p-2 flex items-center justify-center shadow-xl border-2 border-emerald-500/40 shrink-0">
              <img 
                src="/icon-192.png" 
                alt="Inzu Chafique Properties Agency Logo" 
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold tracking-wide uppercase mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Official App</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-tight">
                Install Inzu Chafique App
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Kigali Verified Real Estate • Houses, Apartments & Plots
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {installSuccess ? (
            <div className="py-6 text-center space-y-3 animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Application Installed Successfully!
              </h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                You can now launch Inzu Chafique directly from your Home Screen or Application Drawer.
              </p>
            </div>
          ) : (
            <>
              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">1-Tap Fast Access</h4>
                    <p className="text-[11px] text-slate-500 leading-snug">Launch immediately without typing URLs</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Verified Listings</h4>
                    <p className="text-[11px] text-slate-500 leading-snug">Houses & plots in Kabeza, Kiyovu & Rebero</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">WhatsApp Broker</h4>
                    <p className="text-[11px] text-slate-500 leading-snug">Instant direct chat with verified agents</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Offline & Secure</h4>
                    <p className="text-[11px] text-slate-500 leading-snug">Fast loading even with low data</p>
                  </div>
                </div>
              </div>

              {/* iOS / Manual Safari / Browser Instructions Box */}
              {(showIOSInstructions || isIOS) && (
                <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs text-slate-800 space-y-2.5 animate-in fade-in duration-200">
                  <div className="font-bold text-emerald-800 flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-emerald-600" />
                    <span>How to Install on iPhone, iPad & Safari:</span>
                  </div>
                  <ol className="space-y-1.5 text-[11px] text-slate-700">
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                      <span>Tap the <strong className="text-slate-900">Share button</strong> (square with up arrow) in Safari bottom bar.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                      <span>Scroll down and tap <strong className="text-slate-900">"Add to Home Screen"</strong>.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                      <span>Tap <strong className="text-slate-900">"Add"</strong> in top-right corner to finish.</span>
                    </li>
                  </ol>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 cursor-pointer group"
                >
                  <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                  <span>{isIOS ? 'Show Installation Guide' : 'Install Application (Free)'}</span>
                </button>

                <button
                  onClick={handleDismiss}
                  className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-2xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Continue in Browser</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
