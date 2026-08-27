import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { Property } from '../../types';

interface NeighborhoodSpotlightProps {
  properties: Property[];
  onSelectDistrictSector: (district?: string, sector?: string) => void;
}

const NEIGHBORHOODS = [
  {
    name: 'Nyarutarama',
    district: 'Gasabo',
    sector: 'Nyarutarama',
    tagline: 'Kigali Golf Course & Embassy Residences',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Kibagabaga & Gacuriro',
    district: 'Gasabo',
    sector: 'Kibagabaga',
    tagline: 'Scenic Hillside Villas & Vision City',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Niboye & Rebero',
    district: 'Kicukiro',
    sector: 'Niboye',
    tagline: 'Panoramic Valley Views & Calm Mansions',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Kiyovu & Downtown',
    district: 'Nyarugenge',
    sector: 'Kiyovu',
    tagline: 'Historic Diplomatic Quarter & Prime CBD',
    image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
  },
];

export const NeighborhoodSpotlight: React.FC<NeighborhoodSpotlightProps> = ({
  properties,
  onSelectDistrictSector,
}) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-emerald-700 font-bold">
            Prime Kigali Locations
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Explore Prime Districts & Residential Sectors
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Find the perfect location across Kigali's most prestigious and high-growth investment neighborhoods.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {NEIGHBORHOODS.map((n) => {
          const count = properties.filter((p) => {
            const propDistrict = p.location?.district || p.district || '';
            const propSector = p.location?.sector || p.sector || '';
            return (
              propDistrict.toLowerCase() === n.district.toLowerCase() ||
              propSector.toLowerCase().includes(n.sector.toLowerCase())
            );
          }).length;

          return (
            <div
              key={n.name}
              onClick={() => onSelectDistrictSector(n.district, n.sector)}
              className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <img
                src={n.image}
                alt={`${n.name} real estate Kigali`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-5 space-y-1 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold group-hover:text-emerald-300 transition-colors">
                    {n.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-semibold text-white">
                    {count} {count === 1 ? 'Property' : 'Properties'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-1">{n.tagline}</p>
                <div className="pt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>View listings in {n.district}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
