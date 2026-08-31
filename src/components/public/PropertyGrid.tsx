import React, { useState, useMemo } from 'react';
import { LayoutGrid, List, SlidersHorizontal, ArrowUpDown, X, Filter, RotateCcw } from 'lucide-react';
import { Property, FilterParams, SiteSettings } from '../../types';
import { PropertyCard } from './PropertyCard';
import { filterProperties } from '../../services/propertyService';

interface PropertyGridProps {
  properties: Property[];
  settings: SiteSettings;
  initialFilters?: FilterParams;
  onSelectProperty: (property: Property) => void;
  title?: string;
  subtitle?: string;
}

const ITEMS_PER_PAGE = 6;

const AMENITY_OPTIONS = [
  'Pool',
  'Spa',
  'Yacht Dock',
  'Cinema',
  'Wine Cellar',
  'Garage',
  'Elevator',
  'Smart Home',
  'Tennis',
  'Security'
];

export const PropertyGrid: React.FC<PropertyGridProps> = ({
  properties,
  settings,
  initialFilters = {},
  onSelectProperty,
  title = 'Featured Portfolio',
  subtitle = 'Discover our hand-curated collection of ultra-prime residences and investment developments',
}) => {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<FilterParams>({
    propertyType: 'all',
    status: 'all',
    sortBy: 'newest',
    ...initialFilters,
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Sync initial filters when props change
  React.useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      setFilters((prev) => ({ ...prev, ...initialFilters }));
    }
  }, [initialFilters]);

  // Compute filtered properties
  const filteredList = useMemo(() => {
    return filterProperties(properties, filters);
  }, [properties, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredList.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredList, currentPage]);

  const updateFilter = (key: keyof FilterParams, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const toggleFeature = (feature: string) => {
    setFilters((prev) => {
      const current = prev.features || [];
      const updated = current.includes(feature)
        ? current.filter((f) => f !== feature)
        : [...current, feature];
      return { ...prev, features: updated };
    });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      propertyType: 'all',
      status: 'all',
      sortBy: 'newest',
      searchQuery: '',
      minPrice: undefined,
      maxPrice: undefined,
      minBeds: undefined,
      minBaths: undefined,
      features: [],
    });
    setCurrentPage(1);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.propertyType && filters.propertyType !== 'all') count++;
    if (filters.status && filters.status !== 'all') count++;
    if (filters.city && filters.city !== 'all') count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.minBeds) count++;
    if (filters.minBaths) count++;
    if (filters.features && filters.features.length > 0) count += filters.features.length;
    return count;
  }, [filters]);

  return (
    <section id="property-catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            {subtitle}
          </p>
        </div>

        {/* View Toggle & Mobile Filter Trigger */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>Filters ({activeFiltersCount})</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.sortBy || 'newest'}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="area-desc">Area: Largest First</option>
            </select>
          </div>

          {/* Grid / List Layout switch */}
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setLayout('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                layout === 'grid' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                layout === 'list' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar (Desktop & Mobile Dropdown) */}
        <div className={`lg:block ${showMobileFilters ? 'block' : 'hidden'} space-y-6`}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" /> Filter Listings
              </span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Search Keywords</label>
              <input
                type="text"
                placeholder="Title, City, Street..."
                value={filters.searchQuery || ''}
                onChange={(e) => updateFilter('searchQuery', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Status (For Sale / For Rent) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Listing Status</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'All', val: 'all' },
                  { label: 'Buy', val: 'for-sale' },
                  { label: 'Rent', val: 'for-rent' }
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => updateFilter('status', item.val)}
                    className={`py-1.5 text-xs rounded-lg font-medium border text-center transition-all cursor-pointer ${
                      filters.status === item.val
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Property Type</label>
              <select
                value={filters.propertyType || 'all'}
                onChange={(e) => updateFilter('propertyType', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg capitalize focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Types</option>
                <option value="villa">Villa</option>
                <option value="penthouse">Penthouse</option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land</option>
              </select>
            </div>

            {/* Bedrooms & Bathrooms */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Min Beds</label>
                <select
                  value={filters.minBeds || 0}
                  onChange={(e) => updateFilter('minBeds', Number(e.target.value) || undefined)}
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={0}>Any Beds</option>
                  <option value={2}>2+ Beds</option>
                  <option value={3}>3+ Beds</option>
                  <option value={4}>4+ Beds</option>
                  <option value={5}>5+ Beds</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Min Baths</label>
                <select
                  value={filters.minBaths || 0}
                  onChange={(e) => updateFilter('minBaths', Number(e.target.value) || undefined)}
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={0}>Any Baths</option>
                  <option value={2}>2+ Baths</option>
                  <option value={3}>3+ Baths</option>
                  <option value={4}>4+ Baths</option>
                </select>
              </div>
            </div>

            {/* Amenities Checklist */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-medium text-slate-700 block">Amenities & Features</label>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {AMENITY_OPTIONS.map((amenity) => {
                  const isChecked = filters.features?.includes(amenity);
                  return (
                    <label
                      key={amenity}
                      className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(isChecked)}
                        onChange={() => toggleFeature(amenity)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span>{amenity}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Properties Display Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active filter tags */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Active filters:</span>
              {filters.searchQuery && (
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full flex items-center gap-1">
                  "{filters.searchQuery}"
                  <button onClick={() => updateFilter('searchQuery', '')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {filters.propertyType && filters.propertyType !== 'all' && (
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full flex items-center gap-1 capitalize">
                  {filters.propertyType}
                  <button onClick={() => updateFilter('propertyType', 'all')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {filters.status && filters.status !== 'all' && (
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full flex items-center gap-1">
                  {filters.status === 'for-rent' ? 'For Rent' : 'For Sale'}
                  <button onClick={() => updateFilter('status', 'all')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {filters.features?.map((f) => (
                <span key={f} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full flex items-center gap-1">
                  {f}
                  <button onClick={() => toggleFeature(f)}><X className="w-3 h-3" /></button>
                </span>
              ))}
              <button
                onClick={resetFilters}
                className="text-xs text-slate-500 hover:text-slate-800 underline ml-2 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Results Counter */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-900">{filteredList.length}</strong> available properties
            </span>
          </div>

          {/* Property Cards */}
          {paginatedList.length === 0 ? (
            <div className="py-16 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-4 p-8">
              <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No properties matched your criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try expanding your price range, clearing specific amenity filters, or resetting search keywords.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              className={
                layout === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
                  : 'space-y-4'
              }
            >
              {paginatedList.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  settings={settings}
                  onSelectProperty={onSelectProperty}
                  layout={layout}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
