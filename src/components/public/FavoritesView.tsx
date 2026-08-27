import React from 'react';
import { Heart, ArrowLeft, ArrowRight, Building2 } from 'lucide-react';
import { Property, SiteSettings } from '../../types';
import { useFavorites } from '../../context/FavoritesContext';
import { PropertyCard } from './PropertyCard';
import { SEOHead } from '../common/SEOHead';

interface FavoritesViewProps {
  settings: SiteSettings;
  onSelectProperty: (property: Property) => void;
  onNavigateHome: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  settings,
  onSelectProperty,
  onNavigateHome,
}) => {
  const { favoriteProperties, favoritesCount } = useFavorites();

  return (
    <section className="bg-slate-50 min-h-screen py-12">
      <SEOHead
        title="Your Saved Luxury Residences"
        description="Review your shortlisted properties and luxury villas on EstateHub."
        settings={settings}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Saved Properties & Favorites
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              You have <strong className="text-slate-900">{favoritesCount}</strong> {favoritesCount === 1 ? 'residence' : 'residences'} saved in your private shortlist.
            </p>
          </div>

          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse more homes</span>
          </button>
        </div>

        {favoriteProperties.length === 0 ? (
          <div className="py-20 text-center bg-white border border-slate-200 rounded-3xl p-8 max-w-lg mx-auto space-y-4 shadow-xs">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Your Saved Portfolio is Empty</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore our collection of luxury homes and click the heart icon on any property card to bookmark it for comparison or private viewing.
            </p>
            <button
              onClick={onNavigateHome}
              className="px-6 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-indigo-600 transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Portfolio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                settings={settings}
                onSelectProperty={onSelectProperty}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
