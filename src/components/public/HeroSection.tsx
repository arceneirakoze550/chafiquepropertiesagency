import React, { useState } from 'react';
import { Search, MapPin, Home, DollarSign, Bed, ShieldCheck, MessageCircle } from 'lucide-react';
import { FilterParams, PropertyType, SiteSettings } from '../../types';
import { getGeneralWhatsAppUrl, openWhatsApp } from '../../lib/whatsapp';

interface HeroSectionProps {
  settings: SiteSettings;
  onSearch: (params: FilterParams) => void;
  totalListingsCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  settings,
  onSearch,
  totalListingsCount,
}) => {
  const [activeTab, setActiveTab] = useState<'sale' | 'rent'>('sale');
  const [location, setLocation] = useState('');
  const [district, setDistrict] = useState('all');
  const [propertyType, setPropertyType] = useState<PropertyType | 'all'>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [bedrooms, setBedrooms] = useState<string>('all');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let minPrice: number | undefined;
    let maxPrice: number | undefined;

    if (priceRange === 'under-100k') {
      maxPrice = 100000;
    } else if (priceRange === '100k-250k') {
      minPrice = 100000;
      maxPrice = 250000;
    } else if (priceRange === '250k-500k') {
      minPrice = 250000;
      maxPrice = 500000;
    } else if (priceRange === '500k-plus') {
      minPrice = 500000;
    } else if (priceRange === 'under-1k-rent') {
      maxPrice = 1000;
    } else if (priceRange === '1k-2.5k-rent') {
      minPrice = 1000;
      maxPrice = 2500;
    } else if (priceRange === '2.5k-plus-rent') {
      minPrice = 2500;
    }

    const minBeds = bedrooms !== 'all' ? parseInt(bedrooms, 10) : undefined;

    onSearch({
      listingType: activeTab,
      status: activeTab === 'sale' ? 'for-sale' : 'for-rent',
      searchQuery: location.trim() || undefined,
      district: district !== 'all' ? district : undefined,
      propertyType: propertyType !== 'all' ? propertyType : undefined,
      minPrice,
      maxPrice,
      minBeds,
    });
  };

  const handleWhatsAppHelp = () => {
    const url = getGeneralWhatsAppUrl(
      'Hello Chafique Property Agency, I am looking for a property in Kigali. Can you recommend available options matching my budget?',
      settings.whatsappNumber || '+250788348201'
    );
    openWhatsApp(url);
  };

  return (
    <section className="relative bg-slate-950 text-white min-h-[560px] lg:min-h-[620px] flex items-center justify-center overflow-hidden">
      {/* Background Image with dark luxury gradient overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80"
          alt="Luxury architectural residence Kigali Rwanda"
          className="w-full h-full object-cover opacity-30 scale-105 transform animate-in fade-in duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/45" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center space-y-7">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>{settings.heroBadge || 'Verified Kigali Listings • 2026'}</span>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="space-y-3 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {settings.heroTitle || 'Find Your Dream Home & Prime Land in Kigali'}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {settings.heroSubtitle || 'Explore verified residential villas, modern apartments, family homes, commercial properties, and investment plots across Kicukiro, Gasabo, and Nyarugenge.'}
          </p>
        </div>

        {/* Search Box Widget */}
        <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl shadow-2xl border border-white/20 text-slate-900 text-left">
          {/* Buy / Rent Switcher */}
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveTab('sale')}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'sale'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              For Sale
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rent')}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'rent'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              For Rent
            </button>

            <button
              type="button"
              onClick={handleWhatsAppHelp}
              className="ml-auto hidden sm:flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Direct WhatsApp (+250 788 348 201)</span>
            </button>
          </div>

          {/* Multi-criteria filter form */}
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* District Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
              >
                <option value="all">All Kigali Districts</option>
                <option value="Gasabo">Gasabo (Nyarutarama, Kibagabaga...)</option>
                <option value="Kicukiro">Kicukiro (Niboye, Rebero, Kanombe)</option>
                <option value="Nyarugenge">Nyarugenge (Kiyovu, Downtown)</option>
              </select>
            </div>

            {/* Keyword / Neighborhood Search */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Search className="w-3.5 h-3.5 text-emerald-600" /> Sector / Area
              </label>
              <input
                type="text"
                placeholder="Nyarutarama, Gacuriro, Rebero..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
              />
            </div>

            {/* Property Type */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Home className="w-3.5 h-3.5 text-emerald-600" /> Property Type
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 capitalize"
              >
                <option value="all">All Types</option>
                <option value="villa">Luxury Villa</option>
                <option value="house">Family House</option>
                <option value="apartment">Apartment</option>
                <option value="land">Land / Plot (UPI)</option>
                <option value="commercial">Commercial Building</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Budget
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
              >
                <option value="all">Any Price</option>
                {activeTab === 'sale' ? (
                  <>
                    <option value="under-100k">Under $100,000</option>
                    <option value="100k-250k">$100,000 - $250,000</option>
                    <option value="250k-500k">$250,000 - $500,000</option>
                    <option value="500k-plus">$500,000+</option>
                  </>
                ) : (
                  <>
                    <option value="under-1k-rent">Under $1,000 / month</option>
                    <option value="1k-2.5k-rent">$1,000 - $2,500 / month</option>
                    <option value="2.5k-plus-rent">$2,500+ / month</option>
                  </>
                )}
              </select>
            </div>

            {/* Search Submit Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full h-[38px] px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Listings</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
