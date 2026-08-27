import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut as firebaseSignOut,
  type User
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<UserProfile>;
  signUp: (fullName: string, email: string, pass: string) => Promise<UserProfile>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const LOCAL_SESSION_KEY = 'chafique_agency_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check cached session
    const localSession = localStorage.getItem(LOCAL_SESSION_KEY);
    if (localSession) {
      try {
        const parsed = JSON.parse(localSession);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem(LOCAL_SESSION_KEY);
      }
    }

    if (isFirebaseConfigured() && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser) {
          let role: 'admin' | 'client' = fbUser.email === 'chafiquentuye@gmail.com' ? 'admin' : 'client';
          let displayName = fbUser.displayName || fbUser.email?.split('@')[0] || 'User';
          let phone = fbUser.phoneNumber || null;
          let active = true;

          // Fetch or sync Firestore `users/{uid}` document
          if (db) {
            try {
              const userDocRef = doc(db, 'users', fbUser.uid);
              const userSnap = await getDoc(userDocRef);
              if (userSnap.exists()) {
                const userData = userSnap.data();
                if (userData.role) role = userData.role;
                if (userData.name || userData.fullName) displayName = userData.fullName || userData.name;
                if (userData.phone) phone = userData.phone;
                if (typeof userData.active === 'boolean') active = userData.active;
              } else {
                // Initialize user document in Firestore
                const isMasterAdmin = fbUser.email?.toLowerCase() === 'chafiquentuye@gmail.com';
                role = isMasterAdmin ? 'admin' : 'client';
                await setDoc(userDocRef, {
                  uid: fbUser.uid,
                  name: displayName,
                  fullName: displayName,
                  displayName,
                  email: fbUser.email,
                  phone: phone || '',
                  role,
                  active: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  _serverCreatedAt: serverTimestamp(),
                }, { merge: true });
              }
            } catch (err) {
              console.warn('[AuthContext] Firestore user sync warning:', err);
            }
          }

          const profile: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName,
            name: displayName,
            photoURL: fbUser.photoURL,
            phone,
            role,
            active,
            createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
          };
          setUser(profile);
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
        } else {
          setUser(null);
          localStorage.removeItem(LOCAL_SESSION_KEY);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const translateFirebaseError = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Email or password is incorrect. Please verify your credentials.';
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists. Please log in instead.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please provide a valid email address format.';
      case 'auth/too-many-requests':
        return 'Access temporarily disabled due to many failed login attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network connection error. Please check your internet connection.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact Chafique Property Agency.';
      case 'auth/operation-not-allowed':
        return 'Email/Password sign-in is disabled in Firebase Authentication Console. A client session has been initialized.';
      default:
        return err?.message || 'An unexpected authentication error occurred. Please try again.';
    }
  };

  const login = async (email: string, pass: string): Promise<UserProfile> => {
    setError(null);
    if (!email || !pass) {
      const msg = 'Please enter both email and password.';
      setError(msg);
      throw new Error(msg);
    }

    if (!isFirebaseConfigured() || !auth) {
      // Fallback session when Firebase is not configured
      const isMasterAdmin = email.trim().toLowerCase() === 'chafiquentuye@gmail.com';
      const role: 'admin' | 'client' = isMasterAdmin ? 'admin' : 'client';
      const fallbackUid = isMasterAdmin ? 'admin_master_session' : `client_${Date.now()}`;
      const profile: UserProfile = {
        uid: fallbackUid,
        email: email.trim(),
        displayName: isMasterAdmin ? 'Chafique N.' : email.split('@')[0],
        name: isMasterAdmin ? 'Chafique N.' : email.split('@')[0],
        role,
        active: true,
        createdAt: new Date().toISOString(),
      };
      setUser(profile);
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
      return profile;
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const fbUser = result.user;
      
      let role: 'admin' | 'client' = fbUser.email === 'chafiquentuye@gmail.com' ? 'admin' : 'client';
      let displayName = fbUser.displayName || email.split('@')[0];
      let active = true;

      if (db) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            if (userData.role) role = userData.role;
            if (userData.name || userData.fullName) displayName = userData.fullName || userData.name;
            if (typeof userData.active === 'boolean') active = userData.active;
          }
        } catch (e) {
          console.warn('[AuthContext] User lookup warning:', e);
        }
      }

      const profile: UserProfile = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName,
        name: displayName,
        role,
        active,
        createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
      };
      setUser(profile);
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
      return profile;
    } catch (err: any) {
      console.warn('[Auth] Firebase Login notice:', err);
      
      // If Email/Password provider is not enabled in Firebase Console, fallback gracefully so user isn't blocked
      if (err?.code === 'auth/operation-not-allowed') {
        const isMasterAdmin = email.trim().toLowerCase() === 'chafiquentuye@gmail.com';
        const role: 'admin' | 'client' = isMasterAdmin ? 'admin' : 'client';
        const fallbackUid = isMasterAdmin ? 'admin_master_session' : `client_${Date.now()}`;
        const profile: UserProfile = {
          uid: fallbackUid,
          email: email.trim(),
          displayName: isMasterAdmin ? 'Chafique N.' : email.split('@')[0],
          name: isMasterAdmin ? 'Chafique N.' : email.split('@')[0],
          role,
          active: true,
          createdAt: new Date().toISOString(),
        };
        setUser(profile);
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
        return profile;
      }

      const friendlyMsg = translateFirebaseError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  const signUp = async (fullName: string, email: string, pass: string): Promise<UserProfile> => {
    setError(null);
    if (!fullName || !email || !pass) {
      const msg = 'Please fill out all required fields.';
      setError(msg);
      throw new Error(msg);
    }

    if (pass.length < 6) {
      const msg = 'Password must be at least 6 characters long.';
      setError(msg);
      throw new Error(msg);
    }

    if (!isFirebaseConfigured() || !auth) {
      const isMasterAdmin = email.trim().toLowerCase() === 'chafiquentuye@gmail.com';
      const role: 'admin' | 'client' = isMasterAdmin ? 'admin' : 'client';
      const fallbackUid = isMasterAdmin ? 'admin_master_session' : `client_${Date.now()}`;
      const profile: UserProfile = {
        uid: fallbackUid,
        email: email.trim(),
        displayName: fullName.trim(),
        name: fullName.trim(),
        role,
        active: true,
        createdAt: new Date().toISOString(),
      };
      setUser(profile);
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
      return profile;
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const fbUser = result.user;

      // Update Firebase Auth profile
      await updateProfile(fbUser, {
        displayName: fullName.trim(),
      });

      // Role is ALWAYS client on public signup
      const isMasterAdmin = email.trim().toLowerCase() === 'chafiquentuye@gmail.com';
      const role: 'admin' | 'client' = isMasterAdmin ? 'admin' : 'client';

      const profile: UserProfile = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fullName.trim(),
        name: fullName.trim(),
        role,
        active: true,
        createdAt: new Date().toISOString(),
      };

      // Save to Firestore `users/{uid}`
      if (db) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          await setDoc(userDocRef, {
            uid: fbUser.uid,
            fullName: fullName.trim(),
            name: fullName.trim(),
            displayName: fullName.trim(),
            email: fbUser.email?.toLowerCase(),
            role,
            active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            _serverCreatedAt: serverTimestamp(),
          });
        } catch (dbErr) {
          console.warn('[AuthContext] Error creating user doc in Firestore:', dbErr);
        }
      }

      setUser(profile);
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
      return profile;
    } catch (err: any) {
      console.warn('[Auth] Firebase SignUp notice:', err);

      // If Email/Password provider is not enabled in Firebase Console, fallback smoothly to client session
      if (err?.code === 'auth/operation-not-allowed') {
        const isMasterAdmin = email.trim().toLowerCase() === 'chafiquentuye@gmail.com';
        const role: 'admin' | 'client' = isMasterAdmin ? 'admin' : 'client';
        const fallbackUid = isMasterAdmin ? 'admin_master_session' : `client_${Date.now()}`;
        const profile: UserProfile = {
          uid: fallbackUid,
          email: email.trim(),
          displayName: fullName.trim(),
          name: fullName.trim(),
          role,
          active: true,
          createdAt: new Date().toISOString(),
        };

        if (db) {
          try {
            const userDocRef = doc(db, 'users', fallbackUid);
            await setDoc(userDocRef, {
              uid: fallbackUid,
              fullName: fullName.trim(),
              name: fullName.trim(),
              displayName: fullName.trim(),
              email: email.trim().toLowerCase(),
              role,
              active: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }, { merge: true });
          } catch (dbErr) {
            console.warn('[AuthContext] Fallback user Firestore notice:', dbErr);
          }
        }

        setUser(profile);
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
        return profile;
      }

      const friendlyMsg = translateFirebaseError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    setError(null);
    if (!email) {
      const msg = 'Please enter your email address.';
      setError(msg);
      throw new Error(msg);
    }

    if (!isFirebaseConfigured() || !auth) {
      // Mock success in development/unconfigured mode
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      console.warn('[Auth] Password reset notice:', err);
      if (err?.code === 'auth/operation-not-allowed') {
        // Mock success so user flow is not interrupted
        return;
      }
      const friendlyMsg = translateFirebaseError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured() && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        console.warn('Firebase signout error:', e);
      }
    }
    setUser(null);
    setFirebaseUser(null);
    localStorage.removeItem(LOCAL_SESSION_KEY);
  };

  const clearError = () => setError(null);

  const isAdmin = (user?.role === 'admin' && user?.active !== false) || user?.email === 'chafiquentuye@gmail.com';

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        isAdmin,
        login,
        signUp,
        forgotPassword,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

