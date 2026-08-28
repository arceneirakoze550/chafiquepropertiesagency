import React from 'react';
import { BrandLogo } from './BrandLogo';
import { ShieldCheck, MapPin, Sparkles } from 'lucide-react';

interface LoadingSplashProps {
  agencyName?: string;
  tagline?: string;
}

export const LoadingSplash: React.FC<LoadingSplashProps> = ({
  agencyName = 'Chafique Property Agency',
  tagline = "Kigali's Premier Real Estate Agency",
}) => {
  return (
    <div
      id="app-loading-splash"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white selection:bg-emerald-500 selection:text-white px-4"
    >
      {/* Subtle Background Glow Rings */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl animate-ping opacity-30" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full space-y-6">
        {/* Animated Brand Logo Container */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 rounded-3xl blur-lg opacity-40 animate-pulse group-hover:opacity-75 transition duration-1000"></div>
          <div className="relative bg-white p-3 sm:p-4 rounded-3xl shadow-2xl border border-slate-700/50 flex items-center justify-center">
            <BrandLogo
              size="xl"
              variant="minimal"
              className="justify-center"
            />
          </div>
        </div>

        {/* Agency Name & Branding */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
            <span>Chafique </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Property Agency
            </span>
          </h1>

          <p className="text-sm text-slate-300 font-medium max-w-xs mx-auto leading-relaxed">
            {tagline}
          </p>
        </div>

        {/* Dynamic Loading Progress Bar & Badges */}
        <div className="w-full max-w-xs space-y-4 pt-2">
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden border border-slate-700/60 p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 h-full rounded-full animate-[progress_1.8s_ease-in-out_infinite]"
              style={{
                width: '60%',
                animation: 'loadingSweep 1.5s ease-in-out infinite',
              }}
            />
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              Kigali, Rwanda
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              Verified Listings
            </span>
          </div>
        </div>
      </div>

      {/* Embedded Animation Keyframe */}
      <style>{`
        @keyframes loadingSweep {
          0% { transform: translateX(-100%); width: 30%; }
          50% { width: 70%; }
          100% { transform: translateX(350%); width: 30%; }
        }
      `}</style>
    </div>
  );
};
