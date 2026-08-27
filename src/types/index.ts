export type ListingType = 'sale' | 'rent';
export type PropertyType = 'house' | 'apartment' | 'villa' | 'land' | 'commercial' | 'penthouse' | 'townhouse';
export type PropertyStatus = 'available' | 'reserved' | 'sold' | 'rented' | 'inactive' | 'for-sale' | 'for-rent';

export interface PropertyLocation {
  country: string;
  city: string;
  district: string; // e.g. Kicukiro, Gasabo, Nyarugenge
  sector?: string;   // e.g. Nyarugunga, Kacyiru, Remera, Gisozi, Kiyovu
  cell?: string;     // e.g. Kamashashi, Kibaza
  village?: string;
  address: string;
  state?: string;
  zipCode?: string;
  neighborhood?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  latitude?: number;
  longitude?: number;
}

export interface PropertyImage {
  id: string;
  url: string;
  publicId?: string;
  storagePath?: string;
  path?: string; // alias for publicId or storagePath
  alt?: string;
  order?: number;
  isCover: boolean;
  caption?: string;
  uploadedAt: string;
  size?: number;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string; // "USD" or "RWF"
  listingType?: ListingType; // "sale" or "rent"
  propertyType?: PropertyType;
  type?: PropertyType; // alias
  status: PropertyStatus;
  
  // Location Hierarchy in Rwanda
  country?: string;
  city?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  location: PropertyLocation;

  // Details
  bedrooms: number;
  bathrooms: number;
  toilets?: number;
  size?: number; // Interior floor area in sqm / sqft
  areaSqFt: number; // For compatibility
  landSize?: number; // Plot/Land size in sqm
  parkingSpaces?: number;
  yearBuilt?: number;
  furnished?: boolean;
  
  // Amenities & Features
  amenities?: string[];
  features: string[]; // List of key amenities/features
  
  // Media
  images: PropertyImage[];
  virtualTourUrl?: string;
  videoUrl?: string;
  
  // Management & Flags
  featured: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  viewsCount?: number;
  pricePerSqFt?: number;
}

export type InquiryType = 'inquiry' | 'viewing' | 'purchase_request' | 'rental_request';
export type InquiryStatus = 'new' | 'contacted' | 'viewing' | 'negotiating' | 'completed' | 'cancelled' | 'in-progress' | 'responded' | 'archived';

export interface Inquiry {
  id: string;
  propertyId?: string;
  propertyTitle?: string;
  propertySlug?: string;
  propertyImage?: string;
  propertyPrice?: number;
  clientName?: string;
  name?: string; // compatibility
  phone: string;
  email: string;
  message: string;
  type?: InquiryType;
  preferredContactMethod?: 'email' | 'phone' | 'whatsapp';
  status: InquiryStatus;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

export type ReservationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed' | 'confirmed';

export interface Reservation {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertySlug?: string;
  propertyImage?: string;
  propertyLocation?: string;
  clientName: string;
  userName?: string; // compatibility
  clientEmail: string;
  userEmail?: string;
  clientPhone: string;
  userPhone?: string;
  status: ReservationStatus;
  notes?: string;
  tourType: 'in-person' | 'video-call';
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM", "02:30 PM"
  createdAt: string;
  updatedAt?: string;
}

export type NotificationType = 'inquiry' | 'purchase_request' | 'reservation_request' | 'reservation' | 'property' | 'system';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedId?: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface FavoriteItem {
  id: string;
  userId?: string;
  propertyId: string;
  addedAt: string;
}

export interface SiteSettings {
  companyName: string;
  companyTagline: string;
  email: string;
  phone: string;
  whatsappNumber: string; // "+250788348201"
  address: string;
  city: string;
  country: string;
  currency: string;
  currencySymbol: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  metaTitle: string;
  metaDescription: string;
  ogImage?: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  siteUrl: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  name?: string;
  displayName: string | null;
  email: string | null;
  phone?: string | null;
  photoURL?: string | null;
  role: 'admin' | 'client' | 'agent' | 'user';
  active?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface FilterParams {
  searchQuery?: string;
  listingType?: ListingType | 'all';
  propertyType?: PropertyType | 'all';
  status?: PropertyStatus | 'all';
  country?: string;
  city?: string;
  district?: string;
  sector?: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  minBaths?: number;
  minArea?: number;
  features?: string[];
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'area-desc';
  featuredOnly?: boolean;
}

export interface UploadProgressItem {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  downloadUrl?: string;
  storagePath?: string;
}
