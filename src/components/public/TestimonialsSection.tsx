import React from 'react';
import { Star, Quote } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const reviews = [
    {
      name: 'Julian Sterling',
      role: 'Property Investor, Nyarutarama',
      content: 'Chafique Property Agency secured our modern residential villa in Nyarutarama smoothly and with full title transparency. Their negotiation and fast communication were peerless.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Victoria & Harrison Cole',
      role: 'Homeowners, Kibagabaga',
      content: 'The property selection at Chafique Property Agency is top tier. The prompt on-site tour and seamless documentation made acquiring our Kibagabaga home effortless.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Marcus Thorne',
      role: 'Diaspora Investor, London / Kigali',
      content: 'As an overseas investor looking for rental properties in Gasabo, clear advice and swift direct WhatsApp responsiveness made Chafique Property Agency my permanent real estate partner.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-wider text-emerald-600 font-bold">
          Client Endorsements
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Trusted by Homeowners & Kigali Investors
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Discover why families, diaspora investors, and commercial clients choose Chafique Property Agency.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((r, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "{r.content}"
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <img
                src={r.image}
                alt={r.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-900">{r.name}</h4>
                <p className="text-[11px] text-slate-400">{r.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
