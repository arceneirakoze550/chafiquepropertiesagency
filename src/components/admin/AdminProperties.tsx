import React, { useState } from 'react';
import {
  Building2,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  Eye,
  ExternalLink,
  Filter,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Property, SiteSettings } from '../../types';
import { deleteProperty } from '../../services/propertyService';
import { formatPrice } from '../../lib/seo';

interface AdminPropertiesProps {
  properties: Property[];
  settings: SiteSettings;
  onEditProperty: (property: Property) => void;
  onAddNew: () => void;
  onViewProperty: (property: Property) => void;
  onRefresh: () => void;
}

export const AdminProperties: React.FC<AdminPropertiesProps> = ({
  properties,
  settings,
  onEditProperty,
  onAddNew,
  onViewProperty,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredProperties = properties.filter((p) => {
    const q = search.toLowerCase();
    const titleMatch = (p.title || '').toLowerCase().includes(q);
    const districtMatch = (p.district || p.location?.district || '').toLowerCase().includes(q);
    const sectorMatch = (p.sector || p.location?.sector || '').toLowerCase().includes(q);
    const upiMatch = (p.upi || '').toLowerCase().includes(q);
    const addressMatch = (p.address || p.location?.address || '').toLowerCase().includes(q);

    const matchesSearch = titleMatch || districtMatch || sectorMatch || upiMatch || addressMatch;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter || (statusFilter === 'for-sale' && p.listingType === 'sale') || (statusFilter === 'for-rent' && p.listingType === 'rent');
    const matchesType = typeFilter === 'all' || p.type === typeFilter || p.propertyType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    const targetImages = deleteTarget.images;
    setDeleteTarget(null); // Close modal instantly for fast responsive UI
    try {
      await deleteProperty(targetId, targetImages);
    } catch (err) {
      console.error('Failed to delete property:', err);
      alert('Failed to delete property.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Property Listing?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently remove <strong className="text-slate-800">"{deleteTarget.title}"</strong>?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Chafique Property Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage Kigali real estate inventory, media, UPI land records, and listing status.
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Kigali Property</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by title, district (Gasabo, Kicukiro), sector (Nyarutarama), or UPI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="for-sale">For Sale</option>
            <option value="for-rent">For Rent</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium capitalize"
          >
            <option value="all">All Types</option>
            <option value="house">House / Villa</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="land">Land / Plot</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Property</th>
                <th className="py-3.5 px-4">Location (Kigali)</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No properties match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredProperties.map((p) => {
                  const coverImg = p.images?.find((img) => img.isCover)?.url || p.images?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80';
                  const district = p.district || p.location?.district || 'Kigali';
                  const sector = p.sector || p.location?.sector || '';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Property Cover & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={coverImg}
                            alt={p.title}
                            className="w-12 h-10 object-cover rounded-lg shrink-0 border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                          <div className="max-w-xs">
                            <p className="font-bold text-slate-900 truncate">{p.title}</p>
                            <p className="text-[11px] text-slate-400 truncate">{p.upi ? `UPI: ${p.upi}` : (p.address || p.location?.address)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Location in Kigali */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{sector ? `${sector}, ` : ''}{district}</span>
                        <span className="block text-[11px] text-slate-400 capitalize">{p.type || p.propertyType}</span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatPrice(p.price, p.currency || 'USD')}
                        {(p.status === 'for-rent' || p.listingType === 'rent') && <span className="text-[10px] text-slate-400 font-normal"> /mo</span>}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                          p.status === 'available' || p.status === 'for-sale'
                            ? 'bg-emerald-50 text-emerald-700'
                            : p.status === 'for-rent'
                            ? 'bg-blue-50 text-blue-700'
                            : p.status === 'reserved'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onViewProperty(p)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Preview Public Listing"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditProperty(p)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Listing"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(p)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
