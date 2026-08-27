import React, { useState } from 'react';
import { Share2, Copy, CheckCircle2, X, MessageCircle } from 'lucide-react';
import { Property } from '../../types';

interface ShareModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  property,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? `${window.location.origin}/property/${property.slug}` : '';
  const shareText = `Explore "${property.title}" on Chafique Property Agency:`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${currentUrl}`)}`, '_blank');
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-semibold text-slate-900">Share This Property</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600">
          Share <strong className="text-slate-900">{property.title}</strong> with family, partners, or investors.
        </p>

        {/* Social channels */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <button
            onClick={shareToWhatsApp}
            className="p-3 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[11px] font-medium">WhatsApp</span>
          </button>
          <button
            onClick={shareToTwitter}
            className="p-3 rounded-xl border border-sky-100 bg-sky-50 text-sky-700 hover:bg-sky-100 flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="font-bold text-base">𝕏</span>
            <span className="text-[11px] font-medium">Twitter/X</span>
          </button>
          <button
            onClick={shareToLinkedIn}
            className="p-3 rounded-xl border border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100 flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="font-bold text-sm">in</span>
            <span className="text-[11px] font-medium">LinkedIn</span>
          </button>
          <button
            onClick={shareToFacebook}
            className="p-3 rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="font-bold text-sm">f</span>
            <span className="text-[11px] font-medium">Facebook</span>
          </button>
        </div>

        {/* Copy Link Input */}
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Copy Direct Listing URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-600 select-all"
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
