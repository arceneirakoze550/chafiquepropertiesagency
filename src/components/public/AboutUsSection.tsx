import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Award, 
  Code2, 
  CheckCircle2, 
  Compass, 
  Users, 
  Laptop, 
  MessageCircle,
  FileCheck,
  TrendingUp,
  Sparkles,
  Smartphone,
  Database,
  Search,
  Globe2,
  FileSpreadsheet,
  Layers,
  Zap,
  BadgeCheck
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { BrandLogo } from '../common/BrandLogo';
import { SEOHead } from '../common/SEOHead';
import { getGeneralWhatsAppUrl, openWhatsApp } from '../../lib/whatsapp';

interface AboutUsSectionProps {
  settings: SiteSettings;
  onNavigate: (view: string, data?: any) => void;
}

export const AboutUsSection: React.FC<AboutUsSectionProps> = ({ settings, onNavigate }) => {
  const handleWhatsApp = () => {
    const text = 'Hello Inzu Chafique Properties Agency, I would like to schedule a consultation regarding property services in Kigali.';
    const url = getGeneralWhatsAppUrl(text, settings.whatsappNumber || '+250788348201');
    openWhatsApp(url);
  };

  const agencyAddress = settings.address || 'Kicukiro, Kanombe, Kabeza at Gamabe Gas Trading House near Kabeza Modern Market';

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-14">
      <SEOHead
        title="About Us & Platform Architecture | Inzu Chafique Properties Agency Kigali"
        description="Learn about Inzu Chafique Properties Agency in Kigali, Rwanda (Kicukiro, Kanombe, Kabeza at Gamabe Gas Trading House near Kabeza Modern Market). Meet our brokerage team and lead system developer Arcene IRAKOZE."
        settings={settings}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'About Us', url: '/about' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official Agency Profile & Platform Architecture • Kigali, Rwanda</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            About Inzu Chafique Properties Agency
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Your premier real estate brokerage and advisory partner in Kigali, Rwanda. Specializing in verified residential houses, executive villas, furnished apartments, titled land plots, and commercial assets.
          </p>
        </div>

        {/* Agency Overview & Office Location Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <BrandLogo size="md" showText={true} subtitle="Kigali Real Estate • Rwanda" variant="white-card" />
              </div>
              
              <h2 className="text-2xl font-extrabold text-slate-900">
                Pinnacle Real Estate Solutions in Kigali
              </h2>
              
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong className="text-slate-900">Inzu Chafique Properties Agency</strong> was established to bring transparency, legal rigor, and swift deal execution to the Rwandan property market. Whether you are a local family searching for a dream home, a diaspora investor seeking titled land with high appreciation, or an expatriate looking for a rental residence, we ensure seamless representation.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>RLMUA Title Verification</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    100% of property UPIs and ownership certificates are vetted directly through official Rwandan land registries before listing.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                    <Compass className="w-4 h-4 text-emerald-600" />
                    <span>Prime Metro Coverage</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Active listings across Kicukiro, Gasabo, and Nyarugenge including Kanombe, Kabeza, Nyarutarama, Kibagabaga, and Rebero.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('properties')}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Browse Kigali Properties
              </button>
              <button
                onClick={handleWhatsApp}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat with Broker</span>
              </button>
            </div>
          </div>

          {/* Location & Headquarters Card */}
          <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-xl">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800 text-emerald-400 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>Agency Office Headquarters</span>
              </div>

              <h3 className="text-xl font-bold text-white leading-snug">
                Visit Our Physical Office in Kigali
              </h3>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <div className="text-xs text-slate-400 font-medium">Headquarters Physical Location:</div>
                <p className="text-sm font-bold text-emerald-300 leading-relaxed">
                  {agencyAddress}
                </p>
                <p className="text-xs text-slate-400">{settings.city || 'Kigali'}, {settings.country || 'Rwanda'}</p>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Direct Phone / WhatsApp:</span>
                    <a href={`tel:${settings.phone || '+250788348201'}`} className="text-white font-bold hover:text-emerald-300 transition-colors">
                      {settings.phone || '+250 788 348 201'}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Official Agency Email:</span>
                    <a href={`mailto:${settings.email || 'chafiquentuye@gmail.com'}`} className="text-white hover:text-emerald-300 transition-colors">
                      {settings.email || 'chafiquentuye@gmail.com'}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => onNavigate('contact')}
                className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold rounded-xl text-center transition-colors cursor-pointer"
              >
                Get Directions & Book Viewing
              </button>
            </div>
          </div>
        </div>

        {/* Website Platform Capabilities & Architecture */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>Technology & Platform Features</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              About This Real Estate Web Platform
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Built as a modern, high-speed, progressive web application engineered specifically for the Rwandan property market.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Search className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Multi-Parametric Kigali Search</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter verified listings by District (Gasabo, Kicukiro, Nyarugenge), sector neighborhood, price range, bedrooms, and property category in real-time.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Live Cloud Synchronization</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Powered by Google Firestore with client security rules, keeping listings, inquiries, visit bookings, and market analytics up-to-date across all devices.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <MessageCircle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Direct WhatsApp Broker Gateway</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                One-click instant WhatsApp routing with auto-populated property details, reference codes, and viewing requests for rapid broker connection.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Automated PDF Dossier Generator</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clients and investors can instantly generate clean, printable property brochures and dossiers containing full specifications, UPIs, and broker contacts.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Smartphone className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Mobile & Desktop PWA Installation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Progressive Web Application functionality allowing users to install the app on any desktop, Android, or iOS device for 1-tap launcher access and offline support.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Globe2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Edge SEO & Netlify Performance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complete OpenGraph tags, JSON-LD Schema.org structured data, sitemap generation, and fast edge caching for maximum Google Search visibility.
              </p>
            </div>
          </div>
        </div>

        {/* Dedicated Developer Profile Section */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-12 border border-slate-800 shadow-2xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                <Code2 className="w-3.5 h-3.5" />
                <span>System Architecture & Engineering</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Platform Developer Information
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
                The technical architecture, real-time database synchronization, automated WhatsApp messaging, PDF reporting engine, and Netlify SEO infrastructure of Inzu Chafique Properties Agency are engineered and maintained by our lead software developer.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg">
                <Laptop className="w-7 h-7" />
              </div>
            </div>
          </div>

          {/* Developer Detailed Profile Card */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
                    Lead Software Engineer & Full-Stack System Architect
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Arcene IRAKOZE
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Full-Stack Software Engineer specialized in building mission-critical web platforms, high-performance real estate brokerage engines, progressive web apps, and automated cloud systems. Responsible for the technical development, SEO optimization, and infrastructure uptime for Inzu Chafique Properties Agency.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
                <a
                  href="mailto:arceneirakoze550@gmail.com"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email: arceneirakoze550@gmail.com</span>
                </a>
                <a
                  href="tel:0796599461"
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-700"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Call: 0796599461</span>
                </a>
              </div>
            </div>

            {/* Developer Skill & Tech Badges */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Technical Stack & Architecture Capabilities:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'React 18 & TypeScript',
                  'Tailwind CSS Responsive Design',
                  'Firebase Firestore Cloud Database',
                  'Progressive Web App (PWA) & Offline Caching',
                  'Client & Admin Role-Based Security',
                  'Automated WhatsApp Messaging Gateway',
                  'Client-side PDF Dossier Generation',
                  'Netlify Edge CDN & SEO Optimization',
                  'Schema.org RealEstateAgent Structured Data'
                ].map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs border border-slate-700/60 font-medium flex items-center gap-1.5"
                  >
                    <BadgeCheck className="w-3 h-3 text-emerald-400" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
