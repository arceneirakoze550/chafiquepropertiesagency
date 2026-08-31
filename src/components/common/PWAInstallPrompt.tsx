import React, { useState, useEffect } from 'react';
import { 
  Download, 
  X, 
  CheckCircle, 
  Share2, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  MessageCircle, 
  Home, 
  ArrowRight,
  ExternalLink,
  Laptop,
  MoreVertical
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallPromptProps {
  forceOpen?: boolean;
  onClose?: () => void;
  onInstalled?: () => void;
  onRejected?: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  forceOpen = false,
  onClose,
  onInstalled,
  onRejected,
}) => {
  const {
    deferredPrompt,
    isStandalone,
    isInstalled,
    isRejectedOrDismissed,
    isIOS,
    isPC,
    isInIframe,
    markInstalled,
    markRejectedOrDismissed,
  } = usePWAInstall();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);

  useEffect(() => {
    // If standalone or already installed or already rejected/dismissed, do not auto-open
    if (isStandalone || isInstalled || isRejectedOrDismissed) {
      return;
    }

    // First-time visitor prompt check
    const hasSeenFirstPrompt = sessionStorage.getItem('inzu_session_install_shown');

    if (!hasSeenFirstPrompt) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('inzu_session_install_shown', 'true');
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isStandalone, isInstalled, isRejectedOrDismissed]);

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
          setInstallSuccess(true);
          markInstalled();
          if (onInstalled) onInstalled();
          setTimeout(() => {
            setIsOpen(false);
            if (onClose) onClose();
          }, 2000);
        } else {
          // User rejected the browser native install prompt
          markRejectedOrDismissed();
          if (onRejected) onRejected();
          setIsOpen(false);
          if (onClose) onClose();
        }
      } catch (err) {
        console.error('Error invoking PWA install prompt:', err);
        setShowInstructions(true);
      }
    } else {
      // If browser doesn't offer programmatic prompt (e.g., in iframe, or already dismissed, or Safari/PC browser)
      setShowInstructions(true);
    }
  };

  const handleOpenDirectSite = () => {
    window.open('https://inzuchafiquepropertiesagency.netlify.app/', '_blank');
  };

  const handleDismiss = () => {
    setIsOpen(false);
    setShowInstructions(false);
    markRejectedOrDismissed();
    if (onRejected) onRejected();
    if (onClose) onClose();
  };

  if (!isOpen || isStandalone) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300"
      onClick={handleDismiss}
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative text-slate-900 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with Dark Slate Gradient & Square Official App Logo */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-5 sm:p-7 relative overflow-hidden shrink-0">
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer"
            aria-label="Close install modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 relative z-10">
            {/* Square App Icon with logo */}
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
                <span>{isPC ? 'Desktop App & PWA' : 'Official App'}</span>
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
        <div className="p-5 sm:p-7 space-y-4 overflow-y-auto">
          {installSuccess ? (
            <div className="py-6 text-center space-y-3 animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Application Installed Successfully!
              </h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Inzu Chafique is now installed on your device. You can launch it from your Desktop, Taskbar, or Applications list.
              </p>
            </div>
          ) : (
            <>
              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{isPC ? 'Desktop Window App' : '1-Tap Fast Launch'}</h4>
                    <p className="text-[11px] text-slate-500 leading-snug">Opens as a clean standalone app window</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Verified Listings</h4>
                    <p className="text-[11px] text-slate-500 leading-snug">Houses & plots in Kabeza, Kiyovu & Rebero</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">WhatsApp Broker</h4>
                    <p className="text-[11px] text-slate-500 leading-snug">Instant direct chat with verified agents</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Offline & Fast</h4>
                    <p className="text-[11px] text-slate-500 leading-snug">Instant cache & low data usage</p>
                  </div>
                </div>
              </div>

              {/* PC / Desktop Installation Step-by-Step Guide */}
              {(showInstructions || (!deferredPrompt && isPC)) && (
                <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-700 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
                      <Laptop className="w-4 h-4" />
                      <span>How to Install on PC (Chrome, Edge & Windows / Mac):</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-[11px] text-slate-200">
                    <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-800/80 border border-slate-700">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <div>
                        <strong>Look at the Address Bar (Top-Right):</strong>
                        <p className="text-slate-400 mt-0.5">Click the <span className="text-emerald-300 font-semibold">Install Icon</span> (a small computer monitor or <span className="text-white bg-slate-700 px-1 py-0.5 rounded text-[10px] font-mono">⤓</span> or <span className="text-white bg-slate-700 px-1 py-0.5 rounded text-[10px] font-mono">+</span> icon) inside your browser's address bar at the very top.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-800/80 border border-slate-700">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <div>
                        <strong>Or use Browser Menu (⋮):</strong>
                        <p className="text-slate-400 mt-0.5">Click the 3 dots (<MoreVertical className="w-3 h-3 inline text-emerald-400" />) in top-right of Chrome/Edge &rarr; Select <span className="text-emerald-300 font-semibold">"Install Inzu Chafique Properties Agency..."</span> (or "Save and share" &rarr; "Install page as app").</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-800/80 border border-slate-700">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <div>
                        <strong>Click "Install":</strong>
                        <p className="text-slate-400 mt-0.5">The app will appear as a standalone desktop shortcut on your Desktop and Taskbar!</p>
                      </div>
                    </div>
                  </div>

                  {isInIframe && (
                    <button
                      onClick={handleOpenDirectSite}
                      className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open in Full Browser Tab to Install</span>
                    </button>
                  )}
                </div>
              )}

              {/* iOS Mobile Step-by-Step Guide */}
              {(showInstructions || (!deferredPrompt && isIOS)) && isIOS && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-slate-800 space-y-2.5 animate-in fade-in duration-200">
                  <div className="font-bold text-emerald-800 flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-emerald-600" />
                    <span>How to Install on iPhone & Safari:</span>
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
                      <span>Tap <strong className="text-slate-900">"Add"</strong> in top-right corner.</span>
                    </li>
                  </ol>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 cursor-pointer group"
                >
                  <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                  <span>
                    {deferredPrompt ? 'Install Application on PC' : 'Install Inzu Chafique App'}
                  </span>
                </button>

                <button
                  onClick={handleDismiss}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-2xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Continue Browsing Website</span>
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
