import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { AppNotification, NotificationType } from '../types';

const COLLECTION_NAME = 'notifications';
const LOCAL_STORAGE_KEY = 'estatehub_notifications_cache';

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'System Ready',
    message: 'Chafique Property Agency platform synchronized with Cloud Firestore and Cloudinary.',
    type: 'system',
    read: false,
    link: '/admin',
    createdAt: new Date().toISOString(),
  }
];

const getLocalNotifications = (): AppNotification[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading local notifications', e);
  }
  return INITIAL_NOTIFICATIONS;
};

const saveLocalNotifications = (notifications: AppNotification[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notifications));
  } catch (e) {
    console.error('Failed saving local notifications', e);
  }
};

/**
 * Real-time subscription to notifications collection via onSnapshot
 */
export const subscribeToNotifications = (
  onSuccess: (notifications: AppNotification[]) => void,
  onError?: (err: any) => void
): (() => void) => {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'), limit(50));
      const unsubscribe: Unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: AppNotification[] = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...docSnap.data(),
            } as AppNotification));
            saveLocalNotifications(list);
            onSuccess(list);
          } else {
            onSuccess(getLocalNotifications());
          }
        },
        (error) => {
          console.warn('[NotificationService] onSnapshot error:', error);
          if (onError) onError(error);
          onSuccess(getLocalNotifications());
        }
      );
      return unsubscribe;
    } catch (e) {
      console.warn('[NotificationService] onSnapshot initialization warning:', e);
    }
  }

  onSuccess(getLocalNotifications());
  return () => {};
};

export const getNotifications = async (): Promise<AppNotification[]> => {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const list: AppNotification[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as AppNotification);
        });
        saveLocalNotifications(list);
        return list;
      }
    } catch (error) {
      console.warn('[NotificationService] Error reading notifications from Firestore:', error);
    }
  }
  return getLocalNotifications();
};

export const createNotification = async (
  data: Omit<AppNotification, 'id' | 'read' | 'createdAt'>
): Promise<AppNotification> => {
  const id = `notif-${Date.now()}`;
  const now = new Date().toISOString();

  const newNotif: AppNotification = {
    ...data,
    id,
    read: false,
    createdAt: now,
  };

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, COLLECTION_NAME, id), {
        ...newNotif,
        _serverCreatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('[NotificationService] Error creating notification in Firestore:', error);
    }
  }

  const local = getLocalNotifications();
  saveLocalNotifications([newNotif, ...local]);
  return newNotif;
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  if (isFirebaseConfigured() && db) {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        read: true,
        _serverUpdatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('[NotificationService] Error marking notification as read:', error);
    }
  }

  const local = getLocalNotifications();
  const index = local.findIndex((n) => n.id === id);
  if (index !== -1) {
    local[index].read = true;
    saveLocalNotifications(local);
  }
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  const local = getLocalNotifications();
  const updated = local.map((n) => ({ ...n, read: true }));
  saveLocalNotifications(updated);

  if (isFirebaseConfigured() && db) {
    try {
      const promises = local.filter((n) => !n.read).map((n) => 
        updateDoc(doc(db, COLLECTION_NAME, n.id), {
          read: true,
          _serverUpdatedAt: serverTimestamp(),
        })
      );
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('[NotificationService] Error marking all notifications read in Firestore:', error);
    }
  }
};

export const clearNotifications = async (): Promise<void> => {
  saveLocalNotifications([]);
};

export const deleteNotification = async (id: string): Promise<void> => {
  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('[NotificationService] Error deleting notification from Firestore:', error);
    }
  }

  const local = getLocalNotifications().filter((n) => n.id !== id);
  saveLocalNotifications(local);
};

export const clearAllNotifications = async (): Promise<void> => {
  saveLocalNotifications([]);
};

