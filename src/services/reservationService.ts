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
import { Reservation, ReservationStatus } from '../types';
import { createNotification } from './notificationService';

const COLLECTION_NAME = 'reservations';
const LOCAL_STORAGE_KEY = 'estatehub_reservations_cache';

const getLocalReservations = (): Reservation[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading local reservations', e);
  }
  return [];
};

const saveLocalReservations = (reservations: Reservation[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reservations));
  } catch (e) {
    console.error('Failed saving local reservations', e);
  }
};

/**
 * Real-time subscription to reservations (viewing requests) collection via onSnapshot
 */
export const subscribeToReservations = (
  onSuccess: (reservations: Reservation[]) => void,
  onError?: (err: any) => void
): (() => void) => {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const unsubscribe: Unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: Reservation[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          } as Reservation));
          saveLocalReservations(list);
          onSuccess(list);
        },
        (error) => {
          console.warn('[ReservationService] onSnapshot error:', error);
          if (onError) onError(error);
          onSuccess(getLocalReservations());
        }
      );
      return unsubscribe;
    } catch (e) {
      console.warn('[ReservationService] onSnapshot failed to initialize:', e);
    }
  }

  onSuccess(getLocalReservations());
  return () => {};
};

export const getReservations = async (): Promise<Reservation[]> => {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list: Reservation[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Reservation);
      });
      saveLocalReservations(list);
      return list;
    } catch (error) {
      console.warn('[ReservationService] Error fetching reservations from Firestore:', error);
      return getLocalReservations();
    }
  }
  return getLocalReservations();
};

export const createReservation = async (
  reservationData: Omit<Reservation, 'id' | 'status' | 'createdAt'>
): Promise<Reservation> => {
  const id = `res-${Date.now()}`;
  const now = new Date().toISOString();

  const newReservation: Reservation = {
    ...reservationData,
    id,
    status: 'pending',
    createdAt: now,
  };

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, COLLECTION_NAME, id), {
        ...newReservation,
        _serverCreatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('[ReservationService] Error saving reservation in Firestore:', error);
    }
  }

  const local = getLocalReservations();
  saveLocalReservations([newReservation, ...local]);

  // Create notification
  await createNotification({
    title: 'New Property Viewing Scheduled',
    message: `${reservationData.userName} requested a ${reservationData.tourType} viewing for "${reservationData.propertyTitle}" on ${reservationData.date} at ${reservationData.timeSlot}.`,
    type: 'reservation',
    link: '/admin/reservations',
  });

  return newReservation;
};

export const updateReservationStatus = async (
  id: string,
  status: ReservationStatus,
  notes?: string
): Promise<void> => {
  if (isFirebaseConfigured() && db) {
    try {
      const updates: Record<string, unknown> = { status, _serverUpdatedAt: serverTimestamp() };
      if (notes !== undefined) updates.notes = notes;
      await updateDoc(doc(db, COLLECTION_NAME, id), updates);
    } catch (error) {
      console.error('[ReservationService] Error updating reservation in Firestore:', error);
    }
  }

  const local = getLocalReservations();
  const index = local.findIndex((r) => r.id === id);
  if (index !== -1) {
    local[index].status = status;
    if (notes !== undefined) local[index].notes = notes;
    saveLocalReservations(local);
  }
};

export const deleteReservation = async (id: string): Promise<void> => {
  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('[ReservationService] Error deleting reservation in Firestore:', error);
    }
  }

  const local = getLocalReservations().filter((r) => r.id !== id);
  saveLocalReservations(local);
};
