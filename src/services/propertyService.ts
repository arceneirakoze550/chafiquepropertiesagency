import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { Property, FilterParams, PropertyImage } from '../types';
import { INITIAL_PROPERTIES } from '../data/seedData';
import { deletePropertyImages } from './storageService';

const COLLECTION_NAME = 'properties';
const LOCAL_STORAGE_KEY = 'chafique_properties_cache';

// Helper: Get local properties
const getLocalProperties = (): Property[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed reading local properties cache', e);
  }
  // Initialize with seed data
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PROPERTIES));
  return INITIAL_PROPERTIES;
};

// Helper: Save local properties
const saveLocalProperties = (properties: Property[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(properties));
  } catch (e) {
    console.error('Failed saving local properties cache', e);
  }
};

/**
 * Format a raw Firestore document data object into a typed Property
 */
const formatPropertyDoc = (id: string, data: any): Property => {
  return {
    id,
    ...data,
    location: {
      country: data.country || data.location?.country || 'Rwanda',
      city: data.city || data.location?.city || 'Kigali',
      district: data.district || data.location?.district || 'Gasabo',
      sector: data.sector || data.location?.sector || '',
      cell: data.cell || data.location?.cell || '',
      village: data.village || data.location?.village || '',
      address: data.address || data.location?.address || 'Kigali, Rwanda',
      state: data.location?.state || 'Kigali City',
      zipCode: data.location?.zipCode || '00000',
      neighborhood: data.location?.neighborhood || data.sector || '',
      coordinates: data.location?.coordinates || (data.latitude && data.longitude ? { lat: data.latitude, lng: data.longitude } : undefined),
    },
    type: data.propertyType || data.type || 'house',
    listingType: data.listingType || (data.status === 'for-rent' || data.status === 'rented' ? 'rent' : 'sale'),
    areaSqFt: data.areaSqFt || (data.size ? data.size * 10.764 : 0),
    features: data.features || data.amenities || [],
    amenities: data.amenities || data.features || [],
  } as Property;
};

/**
 * Real-time subscription to Properties collection via onSnapshot
 */
export const subscribeToProperties = (
  onSuccess: (properties: Property[]) => void,
  onError?: (err: any) => void
): (() => void) => {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const unsubscribe: Unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const properties: Property[] = snapshot.docs.map((docSnap) =>
              formatPropertyDoc(docSnap.id, docSnap.data())
            );
            saveLocalProperties(properties);
            onSuccess(properties);
          } else {
            // If collection is completely empty in Firestore, check if we have cached or initial data
            const local = getLocalProperties();
            if (!local || local.length === 0) {
              onSuccess(INITIAL_PROPERTIES);
              seedPropertiesToFirestore(INITIAL_PROPERTIES).catch((err) =>
                console.warn('[PropertyService] Auto-seeding initial properties note:', err)
              );
            } else {
              onSuccess(local);
            }
          }
        },
        (error) => {
          console.warn('[PropertyService] onSnapshot listener error:', error);
          if (onError) onError(error);
          onSuccess(getLocalProperties());
        }
      );
      return unsubscribe;
    } catch (e) {
      console.warn('[PropertyService] Failed establishing onSnapshot, using local cache:', e);
      onSuccess(getLocalProperties());
      return () => {};
    }
  }

  // Fallback if Firebase not configured
  onSuccess(getLocalProperties());
  return () => {};
};

/**
 * Fetch all properties from Firestore (one-time read fallback)
 */
export const getProperties = async (): Promise<Property[]> => {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const properties: Property[] = snapshot.docs.map((docSnap) =>
          formatPropertyDoc(docSnap.id, docSnap.data())
        );
        saveLocalProperties(properties);
        return properties;
      } else {
        const local = getLocalProperties();
        if (!local || local.length === 0) {
          console.info('[PropertyService] Initializing Kigali properties to Firestore...');
          await seedPropertiesToFirestore(INITIAL_PROPERTIES);
          return INITIAL_PROPERTIES;
        }
        return local;
      }
    } catch (error) {
      console.warn('[PropertyService] Firestore fetch error, using local fallback:', error);
      return getLocalProperties();
    }
  }
  return getLocalProperties();
};

/**
 * Get a single property by ID or Slug
 */
export const getPropertyByIdOrSlug = async (identifier: string): Promise<Property | null> => {
  if (!identifier) return null;

  if (isFirebaseConfigured() && db) {
    try {
      // First try by doc ID
      const docRef = doc(db, COLLECTION_NAME, identifier);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return formatPropertyDoc(docSnap.id, docSnap.data());
      }

      // Then try by slug query
      const q = query(collection(db, COLLECTION_NAME), where('slug', '==', identifier), limit(1));
      const slugSnapshot = await getDocs(q);
      if (!slugSnapshot.empty) {
        const firstDoc = slugSnapshot.docs[0];
        return formatPropertyDoc(firstDoc.id, firstDoc.data());
      }
    } catch (error) {
      console.warn('[PropertyService] Firestore lookup error:', error);
    }
  }

  // Local fallback
  const local = getLocalProperties();
  const found = local.find((p) => p.id === identifier || p.slug === identifier);
  return found || null;
};

/**
 * Create a new property in Firestore
 */
export const createProperty = async (
  propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<Property> => {
  const propertyId = propertyData.id || `prop-${Date.now()}`;
  const now = new Date().toISOString();
  
  // Calculate price per sqft/sqm
  const sizeSqm = propertyData.size || (propertyData.areaSqFt ? Math.round(propertyData.areaSqFt / 10.764) : 0);
  const areaSqFt = propertyData.areaSqFt || (sizeSqm ? Math.round(sizeSqm * 10.764) : 0);
  const pricePerSqFt = areaSqFt > 0 ? Math.round(propertyData.price / areaSqFt) : undefined;
  
  // Generate clean slug
  const baseSlug = propertyData.slug || propertyData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

  const district = propertyData.location?.district || propertyData.district || 'Gasabo';
  const sector = propertyData.location?.sector || propertyData.sector || '';
  const city = propertyData.location?.city || propertyData.city || 'Kigali';
  const country = propertyData.location?.country || propertyData.country || 'Rwanda';

  const newProperty: Property = {
    ...propertyData,
    id: propertyId,
    slug,
    currency: propertyData.currency || 'USD',
    listingType: propertyData.listingType || (propertyData.status === 'for-rent' ? 'rent' : 'sale'),
    propertyType: propertyData.propertyType || propertyData.type || 'house',
    type: propertyData.type || propertyData.propertyType || 'house',
    district,
    sector,
    city,
    country,
    size: sizeSqm,
    areaSqFt,
    pricePerSqFt,
    amenities: propertyData.amenities || propertyData.features || [],
    features: propertyData.features || propertyData.amenities || [],
    createdAt: now,
    updatedAt: now,
    viewsCount: 0,
  };

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, COLLECTION_NAME, propertyId), {
        ...newProperty,
        _serverCreatedAt: serverTimestamp(),
        _serverUpdatedAt: serverTimestamp(),
      });
      console.info('[PropertyService] Property created in Firestore:', propertyId);
    } catch (error: any) {
      console.error('[PropertyService] Failed writing to Firestore:', error);
      throw new Error(`Firestore Error: ${error?.message || 'Could not save property to cloud database'}`);
    }
  }

  // Update local store
  const local = getLocalProperties();
  const updated = [newProperty, ...local.filter((p) => p.id !== propertyId)];
  saveLocalProperties(updated);

  return newProperty;
};

/**
 * Fast direct update of an existing property (No preliminary getDoc fetch required)
 */
export const updateProperty = async (id: string, updates: Partial<Property>): Promise<Partial<Property>> => {
  const now = new Date().toISOString();
  
  // Calculate pricePerSqFt if price or area is updated
  const cleanUpdates: any = {
    ...updates,
    updatedAt: now,
  };

  if (updates.size && !updates.areaSqFt) {
    cleanUpdates.areaSqFt = Math.round(updates.size * 10.764);
  }
  if (cleanUpdates.price && cleanUpdates.areaSqFt) {
    cleanUpdates.pricePerSqFt = Math.round(cleanUpdates.price / cleanUpdates.areaSqFt);
  }

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...cleanUpdates,
        _serverUpdatedAt: serverTimestamp(),
      });
      console.info('[PropertyService] Fast update completed in Firestore:', id);
    } catch (error: any) {
      console.error('[PropertyService] Failed updating in Firestore:', error);
      throw new Error(`Firestore Error: ${error?.message || 'Could not update property in cloud database'}`);
    }
  }

  // Optimistically update local cache
  const local = getLocalProperties();
  const index = local.findIndex((p) => p.id === id);
  if (index !== -1) {
    local[index] = { ...local[index], ...cleanUpdates };
    saveLocalProperties(local);
  }

  return cleanUpdates;
};

/**
 * Fast direct delete of a property (No preliminary getDoc fetch blocking UI)
 */
export const deleteProperty = async (id: string, images?: PropertyImage[]): Promise<boolean> => {
  // Fire and forget image cleanup
  if (images && images.length > 0) {
    deletePropertyImages(images).catch((e) => console.warn('[PropertyService] Image deletion note:', e));
  }

  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      console.info('[PropertyService] Direct property deleted from Firestore:', id);
    } catch (error: any) {
      console.error('[PropertyService] Failed deleting from Firestore:', error);
      throw new Error(`Firestore Error: ${error?.message || 'Could not delete property from cloud database'}`);
    }
  }

  // Optimistically update local cache
  const local = getLocalProperties().filter((p) => p.id !== id);
  saveLocalProperties(local);
  return true;
};

/**
 * Fast toggle of property featured status
 */
export const togglePropertyFeatured = async (id: string, featured: boolean): Promise<void> => {
  await updateProperty(id, { featured });
};

/**
 * Seed initial properties to Firestore
 */
export const seedPropertiesToFirestore = async (properties: Property[] = INITIAL_PROPERTIES): Promise<void> => {
  if (isFirebaseConfigured() && db) {
    const promises = properties.map((prop) => {
      const docRef = doc(db, COLLECTION_NAME, prop.id);
      return setDoc(docRef, {
        ...prop,
        _serverCreatedAt: serverTimestamp(),
      });
    });
    await Promise.all(promises);
    console.info(`[PropertyService] Seeded ${properties.length} Kigali properties to Firestore.`);
  }
};

/**
 * Filter and search properties
 */
export const filterProperties = (properties: Property[], params: FilterParams): Property[] => {
  return properties.filter((prop) => {
    // Search query
    if (params.searchQuery) {
      const q = params.searchQuery.toLowerCase();
      const matchTitle = prop.title?.toLowerCase().includes(q);
      const matchCity = prop.location?.city?.toLowerCase().includes(q) || prop.city?.toLowerCase().includes(q);
      const matchDistrict = prop.location?.district?.toLowerCase().includes(q) || prop.district?.toLowerCase().includes(q);
      const matchSector = prop.location?.sector?.toLowerCase().includes(q) || prop.sector?.toLowerCase().includes(q);
      const matchAddress = prop.location?.address?.toLowerCase().includes(q);
      const matchDesc = prop.description?.toLowerCase().includes(q);
      const matchNeighborhood = prop.location?.neighborhood?.toLowerCase().includes(q);
      if (!matchTitle && !matchCity && !matchDistrict && !matchSector && !matchAddress && !matchDesc && !matchNeighborhood) {
        return false;
      }
    }

    // Listing Type (sale / rent)
    if (params.listingType && params.listingType !== 'all') {
      const isRent = prop.listingType === 'rent' || prop.status === 'for-rent' || prop.status === 'rented';
      const isSale = prop.listingType === 'sale' || prop.status === 'for-sale' || prop.status === 'sold' || prop.status === 'available';
      if (params.listingType === 'rent' && !isRent) return false;
      if (params.listingType === 'sale' && !isSale) return false;
    }

    // Property Type
    if (params.propertyType && params.propertyType !== 'all') {
      const pType = prop.propertyType || prop.type;
      if (pType !== params.propertyType) return false;
    }

    // Status
    if (params.status && params.status !== 'all') {
      if (prop.status !== params.status) return false;
    }

    // District (Kicukiro, Gasabo, Nyarugenge)
    if (params.district && params.district !== 'all') {
      const propDist = prop.location?.district || prop.district || '';
      if (propDist.toLowerCase() !== params.district.toLowerCase()) return false;
    }

    // Sector
    if (params.sector && params.sector !== 'all') {
      const propSec = prop.location?.sector || prop.sector || '';
      if (propSec.toLowerCase() !== params.sector.toLowerCase()) return false;
    }

    // Min/Max Price
    if (params.minPrice !== undefined && params.minPrice > 0) {
      if (prop.price < params.minPrice) return false;
    }
    if (params.maxPrice !== undefined && params.maxPrice > 0) {
      if (prop.price > params.maxPrice) return false;
    }

    // Bedrooms
    if (params.minBeds !== undefined && params.minBeds > 0) {
      if ((prop.bedrooms || 0) < params.minBeds) return false;
    }

    // Bathrooms
    if (params.minBaths !== undefined && params.minBaths > 0) {
      if ((prop.bathrooms || 0) < params.minBaths) return false;
    }

    // Featured only
    if (params.featuredOnly) {
      if (!prop.featured) return false;
    }

    // Amenities/Features filter
    if (params.features && params.features.length > 0) {
      const allFeatures = [...(prop.features || []), ...(prop.amenities || [])];
      const hasAll = params.features.every((f) => 
        allFeatures.some((pf) => pf.toLowerCase().includes(f.toLowerCase()))
      );
      if (!hasAll) return false;
    }

    return true;
  }).sort((a, b) => {
    switch (params.sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'area-desc':
        return (b.size || b.areaSqFt || 0) - (a.size || a.areaSqFt || 0);
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
};

/**
 * Reset / Seed initial properties
 */
export const seedInitialData = async (): Promise<void> => {
  saveLocalProperties(INITIAL_PROPERTIES);
  if (isFirebaseConfigured() && db) {
    try {
      await seedPropertiesToFirestore(INITIAL_PROPERTIES);
    } catch (e) {
      console.warn('Failed seeding firestore properties:', e);
    }
  }
};

