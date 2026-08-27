import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import appletConfig from '../../firebase-applet-config.json';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  firestoreDatabaseId?: string;
}

const env = (import.meta as any).env || {};

const firebaseConfig: FirebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || appletConfig?.apiKey || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig?.authDomain || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || appletConfig?.projectId || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig?.storageBucket || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig?.messagingSenderId || '',
  appId: env.VITE_FIREBASE_APP_ID || appletConfig?.appId || '',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || appletConfig?.measurementId || '',
  firestoreDatabaseId: env.VITE_FIREBASE_DATABASE_ID || appletConfig?.firestoreDatabaseId || '',
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== 'YOUR_PROJECT_ID' &&
    firebaseConfig.appId
  );
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

try {
  if (isFirebaseConfigured()) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    
    // Connect to specific Firestore database if databaseId is set
    if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') {
      db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    } else {
      db = getFirestore(app);
    }
    
    storage = getStorage(app);
    console.info('[Firebase] Connected to project:', firebaseConfig.projectId, 'Database:', firebaseConfig.firestoreDatabaseId || '(default)');
  } else {
    console.warn('[Firebase] Firebase configuration missing or incomplete.');
  }
} catch (error) {
  console.error('[Firebase] Initialization error:', error);
}

export { app, auth, db, storage, firebaseConfig };
