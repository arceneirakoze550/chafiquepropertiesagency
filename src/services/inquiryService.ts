import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { Inquiry, InquiryStatus } from '../types';
import { createNotification } from './notificationService';

const COLLECTION_NAME = 'inquiries';
const LOCAL_STORAGE_KEY = 'estatehub_inquiries_cache';

const getLocalInquiries = (): Inquiry[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading local inquiries', e);
  }
  return [];
};

const saveLocalInquiries = (inquiries: Inquiry[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(inquiries));
  } catch (e) {
    console.error('Failed saving local inquiries', e);
  }
};

/**
 * Real-time subscription to inquiries collection via onSnapshot
 */
export const subscribeToInquiries = (
  onSuccess: (inquiries: Inquiry[]) => void,
  onError?: (err: any) => void
): (() => void) => {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const unsubscribe: Unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const inquiries: Inquiry[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          } as Inquiry));
          saveLocalInquiries(inquiries);
          onSuccess(inquiries);
        },
        (error) => {
          console.warn('[InquiryService] onSnapshot error:', error);
          if (onError) onError(error);
          onSuccess(getLocalInquiries());
        }
      );
      return unsubscribe;
    } catch (e) {
      console.warn('[InquiryService] onSnapshot failed to initialize:', e);
    }
  }

  onSuccess(getLocalInquiries());
  return () => {};
};

export const getInquiries = async (): Promise<Inquiry[]> => {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const inquiries: Inquiry[] = [];
      snapshot.forEach((doc) => {
        inquiries.push({ id: doc.id, ...doc.data() } as Inquiry);
      });
      saveLocalInquiries(inquiries);
      return inquiries;
    } catch (error) {
      console.warn('[InquiryService] Error fetching inquiries from Firestore:', error);
      return getLocalInquiries();
    }
  }
  return getLocalInquiries();
};

export const createInquiry = async (
  inquiryData: Omit<Inquiry, 'id' | 'status' | 'createdAt'>
): Promise<Inquiry> => {
  const id = `inq-${Date.now()}`;
  const now = new Date().toISOString();
  const clientName = inquiryData.clientName || inquiryData.name || 'Client';

  const newInquiry: Inquiry = {
    ...inquiryData,
    clientName,
    name: clientName,
    id,
    status: 'new',
    createdAt: now,
  };

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, COLLECTION_NAME, id), {
        ...newInquiry,
        _serverCreatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('[InquiryService] Error saving inquiry to Firestore:', error);
    }
  }

  // Update local storage
  const local = getLocalInquiries();
  saveLocalInquiries([newInquiry, ...local]);

  // Create admin notification
  await createNotification({
    title: 'New Property Inquiry Received',
    message: `${clientName} inquired regarding "${inquiryData.propertyTitle || 'General Inquiry'}" (${inquiryData.email})`,
    type: 'inquiry',
    link: '/admin/inquiries',
  });

  return newInquiry;
};

export const updateInquiryStatus = async (id: string, status: InquiryStatus, notes?: string): Promise<void> => {
  if (isFirebaseConfigured() && db) {
    try {
      const updates: Record<string, unknown> = { status, _serverUpdatedAt: serverTimestamp() };
      if (notes !== undefined) updates.notes = notes;
      await updateDoc(doc(db, COLLECTION_NAME, id), updates);
    } catch (error) {
      console.error('[InquiryService] Error updating inquiry in Firestore:', error);
    }
  }

  const local = getLocalInquiries();
  const index = local.findIndex((i) => i.id === id);
  if (index !== -1) {
    local[index].status = status;
    if (notes !== undefined) local[index].notes = notes;
    saveLocalInquiries(local);
  }
};

export const updateInquiryNotes = async (id: string, notes: string): Promise<void> => {
  if (isFirebaseConfigured() && db) {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        notes,
        _serverUpdatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('[InquiryService] Error updating inquiry notes in Firestore:', error);
    }
  }

  const local = getLocalInquiries();
  const index = local.findIndex((i) => i.id === id);
  if (index !== -1) {
    local[index].notes = notes;
    saveLocalInquiries(local);
  }
};

export const deleteInquiry = async (id: string): Promise<void> => {
  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('[InquiryService] Error deleting inquiry in Firestore:', error);
    }
  }

  const local = getLocalInquiries().filter((i) => i.id !== id);
  saveLocalInquiries(local);
};
