import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { SiteSettings } from '../types';
import { DEFAULT_SITE_SETTINGS } from '../data/seedData';

export const DEFAULT_SETTINGS = DEFAULT_SITE_SETTINGS;

const COLLECTION_NAME = 'settings';
const DOC_ID = 'site_config';
const LOCAL_STORAGE_KEY = 'estatehub_settings_cache';

const getLocalSettings = (): SiteSettings => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed reading local settings', e);
  }
  return DEFAULT_SITE_SETTINGS;
};

const saveLocalSettings = (settings: SiteSettings) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed saving local settings', e);
  }
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, DOC_ID);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = { ...DEFAULT_SITE_SETTINGS, ...snap.data() } as SiteSettings;
        saveLocalSettings(data);
        return data;
      } else {
        // Initial setup
        await setDoc(docRef, {
          ...DEFAULT_SITE_SETTINGS,
          _serverCreatedAt: serverTimestamp(),
        });
        return DEFAULT_SITE_SETTINGS;
      }
    } catch (error) {
      console.warn('[SettingsService] Error loading settings from Firestore:', error);
      return getLocalSettings();
    }
  }
  return getLocalSettings();
};

export const updateSiteSettings = async (updates: Partial<SiteSettings>): Promise<SiteSettings> => {
  const current = await getSiteSettings();
  const updated: SiteSettings = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, DOC_ID);
      await setDoc(docRef, {
        ...updated,
        _serverUpdatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('[SettingsService] Error updating settings in Firestore:', error);
    }
  }

  saveLocalSettings(updated);
  return updated;
};
