import React, { useState } from 'react';
import { Bed, Bath, Maximize2, MapPin, MessageCircle, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Property, SiteSettings } from '../../types';
import { formatPrice } from '../../lib/seo';
import { getPropertyWhatsAppUrl, openWhatsApp } from '../../lib/whatsapp';

interface PropertyCardProps {
  property: Property;
  settings?: SiteSettings;
  onSelectProperty: (property: Property) => void;
  layout?: 'grid' | 'list';
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  settings,
  onSelectProperty,
  layout = 'grid',
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = property.images && property.images.length > 0
    ? property.images
    : [{ id: 'fallback', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', isCover: true, uploadedAt: '' }];

  const currentImg = images[currentImageIndex] || images[0];

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const formattedPrice = formatPrice(property.price, property.currency, settings?.currencySymbol);
    const url = getPropertyWhatsAppUrl(
      property.title,
      property.id,
      formattedPrice,
      settings?.whatsappNumber || '+250788348201'
    );
    openWhatsApp(url);
  };

  const isRent = property.listingType === 'rent' || property.status === 'for-rent' || property.status === 'rented';
  const isLand = property.propertyType === 'land' || property.type === 'land';

  const district = property.location?.district || property.district || 'Gasabo';
  const sector = property.location?.sector || property.sector || '';
  const city = property.location?.city || property.city || 'Kigali';
  const address = property.location?.address || property.address || `${district}, ${city}`;
  const imageAlt = `${property.title} - ${property.bedrooms ? `${property.bedrooms} bedroom ` : ''}${property.propertyType || 'property'} for ${isRent ? 'rent' : 'sale'} in ${sector ? `${sector}, ` : ''}${district}, Kigali, Rwanda`;

  if (layout === 'list') {
    return (
      <article
        id={`property-card-${property.id}`}
        onClick={() => onSelectProperty(property)}
        className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col sm:flex-row cursor-pointer"
      >
        {/* Image Container */}
        <div className="relative sm:w-72 md:w-80 h-56 sm:h-auto shrink-0 bg-slate-900 overflow-hidden">
          <img
            src={currentImg.url}
            alt={imageAlt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md text-white shadow-xs ${
              isRent ? 'bg-indigo-600' : 'bg-emerald-700'
            }`}>
              {isRent ? 'For Rent' : 'For Sale'}
            </span>
            {property.featured && (
              <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-500 text-white shadow-xs">
                Featured
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs uppercase tracking-wider text-emerald-700 font-bold">
                {property.propertyType || property.type} • {district}
              </span>
              <div className="text-xl font-extrabold text-slate-900">
                {formatPrice(property.price, property.currency, settings?.currencySymbol)}
                {isRent && <span className="text-xs font-normal text-slate-500"> /mo</span>}
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 mt-1">
              {property.title}
            </h3>

            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{address}</span>
            </p>

            <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Specs Bar & WhatsApp Button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-4">
              {!isLand ? (
                <>
                  <span className="flex items-center gap-1.5">
                    <Bed className="w-4 h-4 text-slate-400" />
                    <strong className="font-semibold text-slate-800">{property.bedrooms || 0}</strong> Beds
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Bath className="w-4 h-4 text-slate-400" />
                    <strong className="font-semibold text-slate-800">{property.bathrooms || 0}</strong> Baths
                  </span>
                </>
              ) : null}
              <span className="flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4 text-slate-400" />
                <strong className="font-semibold text-slate-800">{property.size || property.areaSqFt || 0}</strong> sqm
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleWhatsApp}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
                title="WhatsApp Inquiry"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Details <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Grid layout (Default)
  return (
    <article
      id={`property-card-${property.id}`}
      onClick={() => onSelectProperty(property)}
      className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Image Carousel */}
      <div className="relative h-60 w-full bg-slate-900 overflow-hidden">
        <img
          src={currentImg.url}
          alt={imageAlt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md text-white shadow-xs ${
            isRent ? 'bg-indigo-600' : 'bg-emerald-700'
          }`}>
            {isRent ? 'For Rent' : 'For Sale'}
          </span>
          {property.featured && (
            <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-500 text-white shadow-xs">
              Featured
            </span>
          )}
        </div>

        {/* Image navigation controls if multi-image */}
        {images.length > 1 && (
          <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              type="button"
              onClick={handlePrevImage}
              className="p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              className="p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Image counter dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex items-center gap-1 z-10">
            {images.slice(0, 5).map((_, idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentImageIndex ? 'bg-white w-3' : 'bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Body Info */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-emerald-700 font-extrabold">
              {property.propertyType || property.type}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {district} {sector ? `• ${sector}` : ''}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
            {property.title}
          </h3>

          <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{address}</span>
          </p>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-100 text-xs text-slate-600">
          {!isLand ? (
            <>
              <div className="flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5 text-slate-400" />
                <span><strong className="font-semibold text-slate-900">{property.bedrooms || 0}</strong> Beds</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bath className="w-3.5 h-3.5 text-slate-400" />
                <span><strong className="font-semibold text-slate-900">{property.bathrooms || 0}</strong> Baths</span>
              </div>
            </>
          ) : (
            <div className="col-span-2 flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span>Ready UPI Title Deed</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 truncate">
            <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate"><strong className="font-semibold text-slate-900">{property.size || property.areaSqFt || 0}</strong> sqm</span>
          </div>
        </div>

        {/* Price & WhatsApp CTA */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-[10px] uppercase text-slate-400 block font-medium">Price</span>
            <div className="text-lg font-extrabold text-slate-900">
              {formatPrice(property.price, property.currency, settings?.currencySymbol)}
              {isRent && <span className="text-xs font-normal text-slate-500">/mo</span>}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleWhatsApp}
              className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl transition-colors cursor-pointer"
              title="Fast WhatsApp Inquiry (+250788348201)"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="px-3.5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl group-hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              View
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
