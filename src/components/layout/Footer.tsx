import React, { useState } from 'react';
import { Building2, Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { SiteSettings } from '../../types';
import { getGeneralWhatsAppUrl, openWhatsApp } from '../../lib/whatsapp';

interface FooterProps {
  settings: SiteSettings;
  onNavigate: (view: string, data?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  const handleWhatsApp = () => {
    const url = getGeneralWhatsAppUrl(
      'Hello Chafique Property Agency, I would like to inquire regarding off-market acquisitions and prime properties in Kigali.',
      settings.whatsappNumber || '+250788348201'
    );
    openWhatsApp(url);
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white block">
                  {settings.companyName || 'Chafique Property Agency'}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase block">
                  Kigali, Rwanda
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              {settings.companyTagline || 'Prime Real Estate in Kigali & Across Rwanda'}. Your verified partner for premium residential houses, modern apartments, commercial buildings, and titled land plots in Kigali.
            </p>

            <div className="space-y-2 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{settings.address || 'KG 7 Ave, Kigali Heights & KG 11 Ave'}, {settings.city || 'Kigali'}, {settings.country || 'Rwanda'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${settings.phone || '+250788348201'}`} className="hover:text-white transition-colors">
                  {settings.phone || '+250788348201'}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`mailto:${settings.email || 'chafiquentuye@gmail.com'}`} className="hover:text-white transition-colors">
                  {settings.email || 'chafiquentuye@gmail.com'}
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Kigali Listings
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('properties', { listingType: 'sale' })}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Houses For Sale
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('properties', { listingType: 'rent' })}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Houses & Apts For Rent
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('properties', { propertyType: 'villa' })}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Executive Luxury Villas
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('properties', { propertyType: 'land' })}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Titled Land & Plots (UPI)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('properties', { propertyType: 'commercial' })}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Commercial Buildings
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Key Kigali Neighborhoods */}
          <div className="space-y-3 text-xs">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Prime Districts & Areas
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('properties', { district: 'Gasabo', sector: 'Nyarutarama' })}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Gasabo • Nyarutarama
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('properties', { district: 'Gasabo', sector: 'Kibagabaga' })}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Gasabo • Kibagabaga & Gacuriro
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('properties', { district: 'Kicukiro', sector: 'Niboye' })}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Kicukiro • Niboye & Rebero
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('properties', { district: 'Nyarugenge', sector: 'Kiyovu' })}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Nyarugenge • Kiyovu Embassy Zone
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('favorites')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Saved Favorites
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Private VIP Newsletter & WhatsApp */}
          <div className="space-y-3 text-xs">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Instant WhatsApp Service
            </h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Need fast response or want to book an immediate on-site property tour in Kigali? Chat directly with our principal broker.
            </p>

            <button
              onClick={handleWhatsApp}
              className="mt-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp +250 788 348 201</span>
            </button>

            {subscribed ? (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/30 rounded-lg text-emerald-200 text-xs">
                ✓ You are now subscribed to our new listing alerts.
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="space-y-2 pt-2">
                <span className="text-[11px] text-slate-400 block font-medium">Get New Listings Email Alerts:</span>
                <div className="flex">
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 text-white rounded-l-lg text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-r-lg flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {settings.companyName || 'Chafique Property Agency'}. Registered Real Estate Brokerage in Rwanda.</p>
          <div className="flex items-center gap-6">
            <a href="/robots.txt" target="_blank" className="hover:text-slate-300">Robots.txt</a>
            <a href="/sitemap.xml" target="_blank" className="hover:text-slate-300">Sitemap.xml</a>
            <button onClick={() => onNavigate('contact')} className="hover:text-slate-300 cursor-pointer">
              Contact & Location
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
