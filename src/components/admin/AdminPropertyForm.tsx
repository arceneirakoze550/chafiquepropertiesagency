import React, { useState } from 'react';
import {
  ArrowLeft,
  Save,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  Sparkles,
  MapPin,
  Trash2,
  Star
} from 'lucide-react';
import { Property, PropertyImage, PropertyType, PropertyStatus } from '../../types';
import { createProperty, updateProperty } from '../../services/propertyService';
import { ImageUploadModal } from '../common/ImageUploadModal';
import { slugify } from '../../lib/seo';

interface AdminPropertyFormProps {
  property?: Property | null;
  onSave: () => void;
  onCancel: () => void;
}

const DEFAULT_RWANDA_AMENITIES = [
  'Paved Tarmac Access',
  'Water Reserve Tank (5,000L+)',
  'Solar Water Heating',
  'Perimeter Wall & Electric Fence',
  '24/7 Security Post / Guard House',
  'Scenic Kigali Hill Views',
  'Landscaped Green Garden',
  'Staff / Domestic Servant Quarters (DSQ)',
  'Covered Carport / Multi-car Parking',
  'Modern Fitted Open Kitchen',
  'Balcony with Panoramic View',
  'Clean UPI Land Title Deed',
];

const RWANDA_DISTRICTS = ['Gasabo', 'Kicukiro', 'Nyarugenge'];

const RWANDA_SECTORS: Record<string, string[]> = {
  Gasabo: ['Nyarutarama', 'Kibagabaga', 'Gacuriro', 'Kimironko', 'Kacyiru', 'Gisozi', 'Remera', 'Bumbogo', 'Jabana', 'Ndera'],
  Kicukiro: ['Niboye', 'Rebero', 'Kanombe', 'Gikondo', 'Kagarama', 'Masaka', 'Nyarugunga', 'Gahanga'],
  Nyarugenge: ['Kiyovu', 'Nyarugenge CBD', 'Nyamirambo', 'Kimisagara', 'Muhima', 'Mageragere'],
};

export const AdminPropertyForm: React.FC<AdminPropertyFormProps> = ({
  property,
  onSave,
  onCancel,
}) => {
  const isEditing = Boolean(property && property.id);

  // Form State
  const [title, setTitle] = useState(property?.title || '');
  const [slug, setSlug] = useState(property?.slug || '');
  const [description, setDescription] = useState(property?.description || '');
  const [price, setPrice] = useState<number>(property?.price || 150000);
  const [currency, setCurrency] = useState(property?.currency || 'USD');
  const [type, setType] = useState<PropertyType>(property?.propertyType || property?.type || 'house');
  const [listingType, setListingType] = useState<'sale' | 'rent'>(
    property?.listingType || (property?.status === 'for-rent' ? 'rent' : 'sale')
  );
  const [status, setStatus] = useState<PropertyStatus>(property?.status || 'available');
  const [bedrooms, setBedrooms] = useState<number>(property?.bedrooms ?? 4);
  const [bathrooms, setBathrooms] = useState<number>(property?.bathrooms ?? 3);
  const [size, setSize] = useState<number>(property?.size || (property?.areaSqFt ? Math.round(property.areaSqFt / 10.764) : 400));
  const [parkingSpaces, setParkingSpaces] = useState<number>(property?.parkingSpaces ?? 3);
  const [yearBuilt, setYearBuilt] = useState<number>(property?.yearBuilt || 2024);
  const [furnished, setFurnished] = useState<boolean>(property?.furnished ?? false);
  const [featured, setFeatured] = useState<boolean>(property?.featured ?? false);

  // Location State
  const [district, setDistrict] = useState(property?.location?.district || property?.district || 'Gasabo');
  const [sector, setSector] = useState(property?.location?.sector || property?.sector || 'Nyarutarama');
  const [cell, setCell] = useState(property?.location?.cell || property?.cell || '');
  const [village, setVillage] = useState(property?.location?.village || property?.village || '');
  const [address, setAddress] = useState(property?.location?.address || property?.address || 'Kigali, Rwanda');
  const [upi, setUpi] = useState(property?.upi || '');
  const [latitude, setLatitude] = useState<number>(property?.location?.coordinates?.lat || -1.9441);
  const [longitude, setLongitude] = useState<number>(property?.location?.coordinates?.lng || 30.0619);

  // Features
  const [features, setFeatures] = useState<string[]>(
    property?.features || property?.amenities || ['Paved Tarmac Access', 'Water Reserve Tank (5,000L+)', 'Perimeter Wall & Electric Fence', '24/7 Security Post / Guard House']
  );
  const [customFeature, setCustomFeature] = useState('');

  // Images
  const [images, setImages] = useState<PropertyImage[]>(
    property?.images && property.images.length > 0 ? property.images : []
  );

  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing || !slug) {
      setSlug(slugify(val));
    }
  };

  const toggleFeature = (f: string) => {
    setFeatures((prev) => (prev.includes(f) ? prev.filter((item) => item !== f) : [...prev, f]));
  };

  const addCustomFeature = () => {
    if (customFeature.trim() && !features.includes(customFeature.trim())) {
      setFeatures((prev) => [...prev, customFeature.trim()]);
      setCustomFeature('');
    }
  };

  const handleImagesUploaded = (newImages: PropertyImage[]) => {
    setImages((prev) => {
      const combined = [...prev, ...newImages];
      if (!combined.some((img) => img.isCover) && combined.length > 0) {
        combined[0].isCover = true;
      }
      return combined;
    });
  };

  const setCoverImage = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isCover: img.id === id,
      }))
    );
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      if (filtered.length > 0 && !filtered.some((img) => img.isCover)) {
        filtered[0].isCover = true;
      }
      return filtered;
    });
  };

  const updateCaption = (id: string, caption: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, caption } : img))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title || !price || !district) {
      setErrorMessage('Please fill in all required fields (Title, Price, District).');
      return;
    }

    if (images.length === 0) {
      setErrorMessage('Please upload at least 1 image for the property listing.');
      return;
    }

    setIsSubmitting(true);
    try {
      const areaSqFt = Math.round(Number(size) * 10.764);
      const pricePerSqFt = areaSqFt > 0 ? Math.round(price / areaSqFt) : undefined;
      const cleanAddress = address || `${sector ? `${sector}, ` : ''}${district}, Kigali, Rwanda`;

      const propertyPayload = {
        title,
        slug: slug || slugify(title),
        description,
        price: Number(price),
        currency,
        type,
        propertyType: type,
        listingType,
        status: status || (listingType === 'rent' ? 'for-rent' : 'available'),
        bedrooms: type === 'land' ? 0 : Number(bedrooms),
        bathrooms: type === 'land' ? 0 : Number(bathrooms),
        size: Number(size),
        areaSqFt,
        pricePerSqFt,
        parkingSpaces: type === 'land' ? 0 : Number(parkingSpaces),
        yearBuilt: Number(yearBuilt),
        furnished,
        featured,
        images,
        features,
        amenities: features,
        district,
        sector,
        cell,
        village,
        upi,
        city: 'Kigali',
        country: 'Rwanda',
        location: {
          address: cleanAddress,
          district,
          sector,
          cell,
          village,
          city: 'Kigali',
          state: 'Kigali City',
          zipCode: '00000',
          country: 'Rwanda',
          neighborhood: sector || district,
          coordinates: {
            lat: Number(latitude),
            lng: Number(longitude),
          },
        },
      };

      if (isEditing && property) {
        await updateProperty(property.id, propertyPayload as any);
      } else {
        await createProperty(propertyPayload as any);
      }

      onSave();
    } catch (err: any) {
      console.error('[AdminPropertyForm] Save error:', err);
      setErrorMessage(err?.message || 'Failed to save property listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Upload Media Modal */}
      <ImageUploadModal
        isOpen={showImageUploadModal}
        onClose={() => setShowImageUploadModal(false)}
        onUploadComplete={handleImagesUploaded}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {isEditing ? `Edit: ${property.title}` : 'Add New Kigali Property Listing'}
            </h1>
            <p className="text-xs text-slate-500">
              {isEditing ? 'Update Kigali property details and images' : 'Publish a new residential house, apartment, commercial property, or land plot'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save & Publish Listing'}</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start justify-between gap-3 text-rose-800 text-xs">
          <div>
            <strong className="font-bold">Validation or Save Error: </strong>
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-600 hover:text-rose-900 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900">Basic Information & Pricing</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-slate-700">Property Title *</label>
              <input
                type="text"
                required
                placeholder="e.g., Luxury 4-Bedroom Villa in Nyarutarama with Pool & Garden"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">SEO URL Slug</label>
              <input
                type="text"
                placeholder="luxury-4-bedroom-villa-nyarutarama"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Price *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="RWF">RWF (Frw)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Listing Purpose</label>
              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value as 'sale' | 'rent')}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Property Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize"
              >
                <option value="house">Modern House / Villa</option>
                <option value="apartment">Modern Apartment</option>
                <option value="villa">Luxury Villa</option>
                <option value="land">Land / Plot (UPI)</option>
                <option value="commercial">Commercial Building / Office</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Availability Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="available">Available</option>
                <option value="for-sale">For Sale</option>
                <option value="for-rent">For Rent</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs font-medium text-slate-700">Property Description *</label>
            <textarea
              rows={5}
              required
              placeholder="Describe the rooms, compound, neighborhood accessibility, water pressure, view, security, tarmac access..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Section 2: Rwanda Administrative Location */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-2xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Rwanda Location (District, Sector, UPI)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">District *</label>
              <select
                value={district}
                onChange={(e) => {
                  const newDist = e.target.value;
                  setDistrict(newDist);
                  if (RWANDA_SECTORS[newDist] && RWANDA_SECTORS[newDist].length > 0) {
                    setSector(RWANDA_SECTORS[newDist][0]);
                  }
                }}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                {RWANDA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Sector *</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {(RWANDA_SECTORS[district] || []).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Cell (Akagari)</label>
              <input
                type="text"
                placeholder="e.g., Nyarutarama, Ruhango, Nyabisindu"
                value={cell}
                onChange={(e) => setCell(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-slate-700">Street / Area Address</label>
              <input
                type="text"
                placeholder="e.g., KG 9 Ave, near Golf Course / MTN Center"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Land Title UPI Number (If Applicable)</label>
              <input
                type="text"
                placeholder="e.g., 1/02/08/04/1234"
                value={upi}
                onChange={(e) => setUpi(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Dimensions & Specifications */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900">Dimensions & Key Specifications</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Bedrooms</label>
              <input
                type="number"
                min={0}
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Bathrooms</label>
              <input
                type="number"
                step="0.5"
                min={0}
                value={bathrooms}
                onChange={(e) => setBathrooms(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Area / Plot Size (sqm)</label>
              <input
                type="number"
                min={0}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Parking Spaces</label>
              <input
                type="number"
                min={0}
                value={parkingSpaces}
                onChange={(e) => setParkingSpaces(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Year Built</label>
              <input
                type="number"
                value={yearBuilt}
                onChange={(e) => setYearBuilt(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Furnishing</label>
              <select
                value={furnished ? 'yes' : 'no'}
                onChange={(e) => setFurnished(e.target.value === 'yes')}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="no">Unfurnished</option>
                <option value="yes">Furnished</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex items-center gap-6 pt-5">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Featured on Homepage Spotlight
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 4: Amenities & Rwanda Features */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900">Amenities & Rwandan Property Features</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DEFAULT_RWANDA_AMENITIES.map((am) => (
              <label
                key={am}
                className="flex items-center gap-2 text-xs text-slate-700 hover:text-slate-900 cursor-pointer p-2 rounded-lg hover:bg-slate-50 border border-slate-100"
              >
                <input
                  type="checkbox"
                  checked={features.includes(am)}
                  onChange={() => toggleFeature(am)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
                <span>{am}</span>
              </label>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Add custom feature (e.g., Swimming Pool, Generator Backup, Annex)..."
              value={customFeature}
              onChange={(e) => setCustomFeature(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomFeature();
                }
              }}
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={addCustomFeature}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              Add Feature
            </button>
          </div>
        </div>

        {/* Section 5: High-Res Photo Gallery & Cover Selector */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Property Media Gallery</h2>
              <p className="text-xs text-slate-500">Upload multiple photos, select a primary cover image, and set captions.</p>
            </div>

            <button
              type="button"
              onClick={() => setShowImageUploadModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload / Add Photos</span>
            </button>
          </div>

          {images.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-3">
              <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500">No images added yet.</p>
              <button
                type="button"
                onClick={() => setShowImageUploadModal(true)}
                className="px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-100"
              >
                Upload Cover Photo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((img) => (
                <div
                  key={img.id}
                  className={`relative bg-slate-900 rounded-xl overflow-hidden border-2 transition-all p-2 flex flex-col justify-between space-y-2 ${
                    img.isCover ? 'border-emerald-600 ring-2 ring-emerald-600/30' : 'border-slate-200'
                  }`}
                >
                  <div className="relative h-40 w-full rounded-lg overflow-hidden bg-slate-950">
                    <img
                      src={img.url}
                      alt={img.caption || 'Property image'}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {img.isCover && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold shadow-md flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> Cover Photo
                      </span>
                    )}
                  </div>

                  {/* Caption edit */}
                  <input
                    type="text"
                    placeholder="Photo caption (e.g., Living Room, Compound)..."
                    value={img.caption || ''}
                    onChange={(e) => updateCaption(img.id, e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-800 text-slate-200 border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500"
                  />

                  {/* Controls */}
                  <div className="flex items-center justify-between pt-1">
                    {!img.isCover ? (
                      <button
                        type="button"
                        onClick={() => setCoverImage(img.id)}
                        className="text-[11px] text-emerald-300 hover:text-white font-medium cursor-pointer"
                      >
                        Make Primary Cover
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-semibold">Primary Cover</span>
                    )}

                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Save Bar */}
        <div className="pt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            Discard Changes
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Publishing...' : 'Publish Property Listing'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
