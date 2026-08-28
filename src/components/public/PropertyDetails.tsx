import React, { useState } from 'react';
import {
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Calendar,
  Car,
  CheckCircle,
  Share2,
  Heart,
  MessageCircle,
  Phone,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  Eye,
  Compass,
  FileCheck
} from 'lucide-react';
import { Property, SiteSettings } from '../../types';
import { useFavorites } from '../../context/FavoritesContext';
import { formatPrice } from '../../lib/seo';
import { SEOHead } from '../common/SEOHead';
import { ScheduleViewingModal } from '../common/ScheduleViewingModal';
import { InquiryModal } from '../common/InquiryModal';
import { ShareModal } from '../common/ShareModal';
import { PropertyCard } from './PropertyCard';
import { getPropertyWhatsAppUrl, openWhatsApp } from '../../lib/whatsapp';

interface PropertyDetailsProps {
  property: Property;
  allProperties: Property[];
  settings: SiteSettings;
  onBack: () => void;
  onSelectProperty: (prop: Property) => void;
}

export const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  property,
  allProperties,
  settings,
  onBack,
  onSelectProperty,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const favorite = isFavorite(property.id);

  const images = property.images && property.images.length > 0
    ? property.images
    : [{ id: 'fallback', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80', isCover: true, uploadedAt: '' }];

  const currentPhoto = images[selectedPhotoIndex] || images[0];

  const handleNextPhoto = () => {
    setSelectedPhotoIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevPhoto = () => {
    setSelectedPhotoIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleWhatsApp = () => {
    const formattedPrice = formatPrice(property.price, property.currency, settings.currencySymbol);
    const url = getPropertyWhatsAppUrl(
      property.title,
      property.id,
      formattedPrice,
      settings.whatsappNumber || '+250788348201'
    );
    openWhatsApp(url);
  };

  const isRent = property.listingType === 'rent' || property.status === 'for-rent' || property.status === 'rented';
  const isLand = property.propertyType === 'land' || property.type === 'land';

  const district = property.location?.district || property.district || 'Gasabo';
  const sector = property.location?.sector || property.sector || '';
  const cell = property.location?.cell || property.cell || '';
  const city = property.location?.city || property.city || 'Kigali';
  const country = property.location?.country || property.country || 'Rwanda';
  const address = property.location?.address || property.address || `${district}, ${city}, ${country}`;

  // Similar properties
  const similarProperties = allProperties
    .filter((p) => p.id !== property.id && (p.propertyType === property.propertyType || p.district === property.district))
    .slice(0, 3);

  const baseDomain = settings?.siteUrl || 'https://chafiquepropertiesagency.vercel.app';
  const breadcrumbs = [
    { name: 'Home', url: `${baseDomain}/` },
    { name: 'Properties in Kigali', url: `${baseDomain}/properties` },
    { name: property.title, url: `${baseDomain}/property/${property.slug || property.id}` }
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      {/* Dynamic SEO Meta, Open Graph, Twitter & Schema.org JSON-LD Structured Data */}
      <SEOHead
        property={property}
        settings={settings}
        ogImage={currentPhoto.url}
        breadcrumbs={breadcrumbs}
      />

      {/* Viewing / Inquire / Share Modals */}
      <ScheduleViewingModal
        property={property}
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />

      <InquiryModal
        property={property}
        settings={settings}
        isOpen={showInquiryModal}
        onClose={() => setShowInquiryModal(false)}
      />

      <ShareModal
        property={property}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Visual Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-xs text-slate-500">
          <button
            onClick={() => {
              window.history.pushState(null, '', '/');
              onBack();
            }}
            className="hover:text-emerald-700 transition-colors font-medium cursor-pointer"
          >
            Home
          </button>
          <span className="text-slate-400">/</span>
          <button
            onClick={onBack}
            className="hover:text-emerald-700 transition-colors font-medium cursor-pointer"
          >
            Properties in Kigali
          </button>
          <span className="text-slate-400">/</span>
          <span className="text-slate-500 font-medium">
            {district}
          </span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-semibold truncate max-w-[220px] sm:max-w-md">
            {property.title}
          </span>
        </nav>

        {/* Navigation & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600" /> Back to Kigali Listings
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(property)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                favorite
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${favorite ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{favorite ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="space-y-3">
          {/* Main Large Photo */}
          <div className="relative h-[340px] sm:h-[480px] lg:h-[540px] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 shadow-lg">
            <img
              src={currentPhoto.url}
              alt={`${property.title} - ${currentPhoto.caption || `${property.bedrooms ? `${property.bedrooms} bedroom ` : ''}${property.propertyType || 'property'} for ${isRent ? 'rent' : 'sale'} in ${district}, Kigali, Rwanda`}`}
              className="w-full h-full object-cover transition-opacity duration-300"
              referrerPolicy="no-referrer"
              loading="eager"
            />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg text-white shadow-md ${
                isRent ? 'bg-indigo-600' : 'bg-emerald-700'
              }`}>
                {isRent ? 'For Rent' : 'For Sale'}
              </span>
              {property.featured && (
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg bg-amber-500 text-white shadow-md flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Featured Listing
                </span>
              )}
            </div>

            {/* Photo Counter */}
            <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-slate-950/70 backdrop-blur-md rounded-lg text-white text-xs font-medium flex items-center gap-1.5 z-10">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Photo {selectedPhotoIndex + 1} of {images.length}</span>
            </div>

            {/* Caption */}
            {currentPhoto.caption && (
              <div className="absolute bottom-4 left-4 max-w-md hidden sm:block px-3.5 py-1.5 bg-slate-950/70 backdrop-blur-md rounded-lg text-white text-xs z-10">
                {currentPhoto.caption}
              </div>
            )}

            {/* Prev / Next Arrows */}
            {images.length > 1 && (
              <div className="absolute inset-y-0 inset-x-4 flex items-center justify-between pointer-events-none z-10">
                <button
                  onClick={handlePrevPhoto}
                  className="pointer-events-auto p-2.5 rounded-full bg-white/90 text-slate-800 hover:bg-white shadow-lg transition-transform hover:scale-105 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="pointer-events-auto p-2.5 rounded-full bg-white/90 text-slate-800 hover:bg-white shadow-lg transition-transform hover:scale-105 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Thumbnail Slider */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {images.map((img, index) => (
                <button
                  key={img.id || index}
                  onClick={() => setSelectedPhotoIndex(index)}
                  className={`relative w-24 h-18 sm:w-28 sm:h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    index === selectedPhotoIndex
                      ? 'border-emerald-600 ring-2 ring-emerald-600/30'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`${property.title} - Image ${index + 1} in ${district}, Kigali`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Layout: 2 Columns (Details & Sticky Booking Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title, Address & Price Headline */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-xs uppercase tracking-wider text-emerald-700 font-bold">
                  {property.propertyType || property.type} • {district}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Ref: #{property.id.toUpperCase()}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {property.title}
              </h1>

              <p className="text-sm text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{address}</span>
              </p>

              {/* Key Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
                {!isLand ? (
                  <>
                    <div className="p-3.5 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                        <Bed className="w-4 h-4 text-emerald-600" /> Bedrooms
                      </div>
                      <div className="text-lg font-extrabold text-slate-900 mt-1">
                        {property.bedrooms || 0}
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                        <Bath className="w-4 h-4 text-emerald-600" /> Bathrooms
                      </div>
                      <div className="text-lg font-extrabold text-slate-900 mt-1">
                        {property.bathrooms || 0}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2 p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                      <FileCheck className="w-4 h-4 text-emerald-600" /> Land Registry
                    </div>
                    <div className="text-sm font-bold text-slate-900 mt-1">
                      Clean UPI Land Title Ready
                    </div>
                  </div>
                )}

                <div className="p-3.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                    <Maximize2 className="w-4 h-4 text-emerald-600" /> Land / Floor Size
                  </div>
                  <div className="text-lg font-extrabold text-slate-900 mt-1">
                    {property.size || property.areaSqFt || 0} <span className="text-xs font-normal text-slate-500">sqm</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                    <Car className="w-4 h-4 text-emerald-600" /> Parking
                  </div>
                  <div className="text-lg font-extrabold text-slate-900 mt-1">
                    {property.parkingSpaces || 2} <span className="text-xs font-normal text-slate-500">Cars</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900">Property Overview & Location Details</h2>
              <div className="prose prose-sm text-slate-600 leading-relaxed max-w-none whitespace-pre-line">
                {property.description}
              </div>

              {/* Property Details Matrix */}
              <div className="pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">District</span>
                  <strong className="text-slate-800">{district}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Sector</span>
                  <strong className="text-slate-800">{sector || 'Central'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Listing Type</span>
                  <strong className="text-slate-800">{isRent ? 'For Rent' : 'For Sale'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Year Built</span>
                  <strong className="text-slate-800">{property.yearBuilt || '2024'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Furnishing</span>
                  <strong className="text-slate-800">{property.furnished ? 'Furnished' : 'Unfurnished'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">City / Country</span>
                  <strong className="text-slate-800">{city}, {country}</strong>
                </div>
              </div>
            </div>

            {/* Amenities Checklist */}
            {property.features && property.features.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900">Key Features & Amenities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {property.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-800"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location & Kigali Points of Interest */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Neighborhood & Accessibility</h2>
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" /> Kigali Metropolis
                </span>
              </div>

              {/* Map Box */}
              <div className="relative h-56 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center text-center p-6">
                <img
                  src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80"
                  alt="Kigali Map Area"
                  className="absolute inset-0 w-full h-full object-cover opacity-25"
                  referrerPolicy="no-referrer"
                />
                <div className="relative z-10 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg max-w-sm space-y-1 text-slate-900">
                  <div className="w-9 h-9 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold">{property.title}</p>
                  <p className="text-[11px] text-slate-500">
                    {district} • {sector ? `${sector}, ` : ''}{city}
                  </p>
                </div>
              </div>

              {/* Points of interest */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Kigali Int'l Airport</span>
                  <span className="font-semibold text-slate-800">10-15 mins drive</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Kigali Heights / KCC</span>
                  <span className="font-semibold text-slate-800">5-10 mins drive</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Tarmac Road & Security</span>
                  <span className="font-semibold text-slate-800">Direct Paved Access</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Action / Booking Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-24 bg-white rounded-2xl border border-slate-200 p-6 shadow-md space-y-6">
              {/* Price Banner */}
              <div className="space-y-1 pb-4 border-b border-slate-100">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Price
                </span>
                <div className="text-3xl font-black text-slate-900">
                  {formatPrice(property.price, property.currency, settings.currencySymbol)}
                  {isRent && <span className="text-xs font-normal text-slate-500"> /month</span>}
                </div>
                <p className="text-xs text-emerald-700 font-medium pt-1">
                  Direct Brokerage • WhatsApp: +250 788 348 201
                </p>
              </div>

              {/* Primary CTAs */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp (+250 788 348 201)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowScheduleModal(true)}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Schedule On-Site Tour</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowInquiryModal(true)}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-600" />
                  <span>Send Agency Inquiry</span>
                </button>
              </div>

              {/* Direct Brokerage Contact Box */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-100 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-emerald-400 font-bold flex items-center justify-center text-xs">
                    CPA
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{settings.companyName || 'Chafique Property Agency'}</h4>
                    <p className="text-[11px] text-slate-500">Kigali Real Estate Broker</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 space-y-2">
                  <a
                    href={`tel:${settings.phone || '+250788348201'}`}
                    className="flex items-center gap-2 text-slate-800 hover:text-emerald-700 font-bold"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{settings.phone || '+250 788 348 201'}</span>
                  </a>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Real Estate Brokerage in Rwanda</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties Section */}
        {similarProperties.length > 0 && (
          <div className="pt-12 border-t border-slate-200 space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Similar Kigali Listings</h2>
              <p className="text-xs text-slate-500 mt-1">Explore other available properties in {district} and Kigali</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarProperties.map((similar) => (
                <PropertyCard
                  key={similar.id}
                  property={similar}
                  settings={settings}
                  onSelectProperty={onSelectProperty}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
