import React, { useState } from 'react';
import { Building2, Mail, Phone, MapPin, Send, MessageCircle, Download } from 'lucide-react';
import { SiteSettings } from '../../types';
import { BrandLogo } from '../common/BrandLogo';
import { getGeneralWhatsAppUrl, openWhatsApp } from '../../lib/whatsapp';

interface FooterProps {
  settings: SiteSettings;
  onNavigate: (view: string, data?: any) => void;
  onOpenInstall?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate, onOpenInstall }) => {
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
      'Hello Inzu Chafique Properties Agency, I would like to inquire regarding off-market acquisitions and prime properties in Kigali.',
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
            <BrandLogo
              size="md"
              showText={true}
              textColor="light"
              subtitle="Kigali, Rwanda • Verified Properties"
              variant="white-card"
            />
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              {settings.companyTagline || 'Prime Real Estate in Kigali & Across Rwanda'}. Your verified partner for premium residential houses, modern apartments, commercial buildings, and titled land plots in Kigali.
            </p>

            <div className="space-y-2 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{settings.address || 'Kicukiro, Kanombe, Kabeza at Gamabe Gas Trading House near Kabeza Modern Market'}, {settings.city || 'Kigali'}, {settings.country || 'Rwanda'}</span>
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
                  onClick={() => onNavigate('contact')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Contact & Tour Booking
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

        {/* Bottom bar with Developer Credit */}
        <div className="pt-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} {settings.companyName || 'Inzu Chafique Properties Agency'}. All Rights Reserved. Verified Real Estate Brokerage in Kigali, Rwanda.</p>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-400">
              <button onClick={() => onNavigate('home')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                Home
              </button>
              <button onClick={() => onNavigate('properties')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                Properties
              </button>
              <button onClick={() => onNavigate('about')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                About Us
              </button>
              <button onClick={() => onNavigate('contact')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                Contact & Location
              </button>
              {onOpenInstall && (
                <button 
                  onClick={onOpenInstall} 
                  className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install App</span>
                </button>
              )}
            </div>
          </div>

          {/* Developer Attribution Card */}
          <div className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-400">System Developer:</span>
              <span className="text-emerald-400 font-bold tracking-wide">Arcene IRAKOZE</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-slate-300">
              <a
                href="mailto:arceneirakoze550@gmail.com"
                className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                title="Email Developer"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-500" />
                <span>arceneirakoze550@gmail.com</span>
              </a>
              <span className="text-slate-700 hidden sm:inline">•</span>
              <a
                href="tel:0796599461"
                className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors font-medium"
                title="Call Developer"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>0796599461</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
