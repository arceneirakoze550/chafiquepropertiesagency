import React from 'react';
import { ShieldCheck, Award, Lock, TrendingUp } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const points = [
    {
      icon: ShieldCheck,
      title: 'Verified Title & Ownership',
      description: 'Every estate undergoing our representation is vetted through comprehensive legal, structural, and financial due diligence.'
    },
    {
      icon: Lock,
      title: 'Confidential & Off-Market',
      description: 'Exclusive access to unlisted trophy assets, discreet private transactions, and high-net-worth buyer networks.'
    },
    {
      icon: Award,
      title: 'Pinnacle Architecture',
      description: 'Curating world-renowned architectural signatures, contemporary engineering masterpieces, and historic landmarks.'
    },
    {
      icon: TrendingUp,
      title: 'Strategic Capital Growth',
      description: 'Institutional-grade investment advisory, historical yield models, and strategic metro real estate positioning.'
    }
  ];

  return (
    <section className="bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
            The Chafique Standard
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Uncompromising Excellence in Luxury Representation
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Advising global private clients, family offices, and developers on landmark acquisitions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {points.map((pt, idx) => {
            const Icon = pt.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-indigo-500/50 transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">{pt.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{pt.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
