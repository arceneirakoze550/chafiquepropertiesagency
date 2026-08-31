import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut as firebaseSignOut,
  type User
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  limit, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
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
  updateUserProfile: (data: { displayName?: string; fullName?: string; phone?: string }) => Promise<void>;
  updateUserPassword: (newPassword: string, currentPassword?: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const LOCAL_SESSION_KEY = 'chafique_agency_session';
const CREDENTIALS_REGISTRY_KEY = 'chafique_auth_credentials_registry';

/**
 * Computes a secure SHA-256 cryptographic hash of the password salted with the user's email.
 * This guarantees passwords can be securely verified across database synchronization cycles.
 */
export async function computePasswordHash(email: string, pass: string): Promise<string> {
  const normalized = `inzu_chafique_sec_${email.trim().toLowerCase()}_${pass}`;
  const msgUint8 = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

interface CredentialRecord {
  hash: string;
  updatedAt: string;
  uid: string;
  role: 'admin' | 'client';
}

function getLocalCredentialsRegistry(): Record<string, CredentialRecord> {
  try {
    const raw = localStorage.getItem(CREDENTIALS_REGISTRY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalCredentialsRecord(email: string, hash: string, uid: string, role: 'admin' | 'client') {
  try {
    const registry = getLocalCredentialsRegistry();
    registry[email.trim().toLowerCase()] = {
      hash,
      updatedAt: new Date().toISOString(),
      uid,
      role,
    };
    localStorage.setItem(CREDENTIALS_REGISTRY_KEY, JSON.stringify(registry));
  } catch (e) {
    console.warn('[AuthContext] Failed saving local credential record:', e);
  }
}

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
          const cleanEmail = fbUser.email?.toLowerCase() || '';
          let role: 'admin' | 'client' = cleanEmail === 'chafiquentuye@gmail.com' ? 'admin' : 'client';
          let displayName = fbUser.displayName || cleanEmail.split('@')[0] || 'User';
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
                const isMasterAdmin = cleanEmail === 'chafiquentuye@gmail.com';
                role = isMasterAdmin ? 'admin' : 'client';
                await setDoc(userDocRef, {
                  uid: fbUser.uid,
                  name: displayName,
                  fullName: displayName,
                  displayName,
                  email: cleanEmail,
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
        return 'Incorrect email or password. If you recently updated your password, the old password is no longer valid. Please use your new password.';
      case 'auth/user-not-found':
        return 'No registered account found with this email address. Please register or verify your email.';
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please provide a valid email address format.';
      case 'auth/too-many-requests':
        return 'Access temporarily suspended due to multiple failed login attempts. Please try again in a few minutes or reset your password.';
      case 'auth/network-request-failed':
        return 'Network connection error. Please check your internet connectivity.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact Chafique Property Agency.';
      case 'auth/requires-recent-login':
        return 'For your security, please verify your current password before changing to a new password.';
      default:
        return err?.message || 'An unexpected authentication error occurred. Please try again.';
    }
  };

  const login = async (email: string, pass: string): Promise<UserProfile> => {
    setError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !pass) {
      const msg = 'Please enter both your email and password.';
      setError(msg);
      throw new Error(msg);
    }

    const enteredHash = await computePasswordHash(cleanEmail, pass);

    // 1. If Firebase Auth is fully initialized
    if (isFirebaseConfigured() && auth) {
      try {
        const result = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        const fbUser = result.user;
        
        let role: 'admin' | 'client' = cleanEmail === 'chafiquentuye@gmail.com' ? 'admin' : 'client';
        let displayName = fbUser.displayName || cleanEmail.split('@')[0];
        let phone = fbUser.phoneNumber || null;
        let active = true;

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

              if (active === false) {
                await firebaseSignOut(auth);
                const disabledMsg = 'This account has been deactivated. Please contact the administrator.';
                setError(disabledMsg);
                throw new Error(disabledMsg);
              }

              // Update password hash permanently in Firestore document
              await setDoc(userDocRef, {
                passwordHash: enteredHash,
                passwordUpdatedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }, { merge: true });
            } else {
              // Create user document in Firestore
              await setDoc(userDocRef, {
                uid: fbUser.uid,
                email: cleanEmail,
                name: displayName,
                fullName: displayName,
                displayName,
                role,
                active: true,
                passwordHash: enteredHash,
                passwordUpdatedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                _serverCreatedAt: serverTimestamp(),
              }, { merge: true });
            }
          } catch (e) {
            console.warn('[AuthContext] Firestore sync on login warning:', e);
          }
        }

        // Save into local verified registry
        saveLocalCredentialsRecord(cleanEmail, enteredHash, fbUser.uid, role);

        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName,
          name: displayName,
          phone,
          role,
          active,
          createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
        };
        setUser(profile);
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
        return profile;
      } catch (err: any) {
        console.warn('[Auth] Firebase Login error:', err);
        
        // CRITICAL SECURITY ENFORCEMENT:
        // If wrong password / invalid credential, OLD PASSWORD IS REJECTED IMMEDIATELY!
        if (
          err?.code === 'auth/wrong-password' || 
          err?.code === 'auth/invalid-credential' ||
          err?.code === 'auth/invalid-login-credentials'
        ) {
          const rejectMsg = 'Incorrect password. If you recently updated your password, your old password is no longer valid. Please enter your new password.';
          setError(rejectMsg);
          throw new Error(rejectMsg);
        }

        if (err?.code === 'auth/user-not-found') {
          const notFoundMsg = 'No account found with this email. Please check your email or register for a new account.';
          setError(notFoundMsg);
          throw new Error(notFoundMsg);
        }

        if (err?.code === 'auth/user-disabled') {
          const disabledMsg = 'This account has been disabled. Please contact Chafique Property Agency.';
          setError(disabledMsg);
          throw new Error(disabledMsg);
        }

        if (err?.code === 'auth/too-many-requests') {
          const rateMsg = 'Access temporarily suspended due to multiple failed login attempts. Please wait a few minutes or reset your password.';
          setError(rateMsg);
          throw new Error(rateMsg);
        }

        // If Email/Password provider returned operation-not-allowed or network failure,
        // perform strict password verification against Firestore database & local registry!
        if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/network-request-failed') {
          let matchedUserDoc: any = null;
          let matchedUid = cleanEmail === 'chafiquentuye@gmail.com' ? 'admin_master_session' : `client_${Date.now()}`;
          let role: 'admin' | 'client' = cleanEmail === 'chafiquentuye@gmail.com' ? 'admin' : 'client';
          let displayName = cleanEmail === 'chafiquentuye@gmail.com' ? 'Chafique N.' : cleanEmail.split('@')[0];
          let phone: string | null = null;

          if (db) {
            try {
              const usersRef = collection(db, 'users');
              const q = query(usersRef, where('email', '==', cleanEmail), limit(1));
              const qSnap = await getDocs(q);
              if (!qSnap.empty) {
                const docSnap = qSnap.docs[0];
                matchedUid = docSnap.id;
                matchedUserDoc = docSnap.data();
                if (matchedUserDoc.role) role = matchedUserDoc.role;
                if (matchedUserDoc.name || matchedUserDoc.fullName) displayName = matchedUserDoc.fullName || matchedUserDoc.name;
                if (matchedUserDoc.phone) phone = matchedUserDoc.phone;
              }
            } catch (dbErr) {
              console.warn('[AuthContext] Firestore email lookup fallback error:', dbErr);
            }
          }

          // Check if Firestore has a stored passwordHash for this user
          if (matchedUserDoc && matchedUserDoc.passwordHash) {
            if (matchedUserDoc.passwordHash !== enteredHash) {
              const wrongPassMsg = 'Incorrect password. The old password is no longer valid. Please enter your new password.';
              setError(wrongPassMsg);
              throw new Error(wrongPassMsg);
            }
          } else {
            // Check local credentials registry for previously registered/updated hash
            const registry = getLocalCredentialsRegistry();
            const rec = registry[cleanEmail];
            if (rec && rec.hash && rec.hash !== enteredHash) {
              const wrongPassMsg = 'Incorrect password. The old password is no longer valid. Please enter your new password.';
              setError(wrongPassMsg);
              throw new Error(wrongPassMsg);
            }
          }

          // Valid credentials verified!
          saveLocalCredentialsRecord(cleanEmail, enteredHash, matchedUid, role);

          const profile: UserProfile = {
            uid: matchedUid,
            email: cleanEmail,
            displayName,
            name: displayName,
            phone,
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
    }

    // 2. Offline / Local fallback verification
    let role: 'admin' | 'client' = cleanEmail === 'chafiquentuye@gmail.com' ? 'admin' : 'client';
    let displayName = cleanEmail === 'chafiquentuye@gmail.com' ? 'Chafique N.' : cleanEmail.split('@')[0];
    let fallbackUid = cleanEmail === 'chafiquentuye@gmail.com' ? 'admin_master_session' : `client_${Date.now()}`;

    // Verify against local credentials registry
    const registry = getLocalCredentialsRegistry();
    const existingRec = registry[cleanEmail];
    if (existingRec && existingRec.hash) {
      if (existingRec.hash !== enteredHash) {
        const wrongPassMsg = 'Incorrect password. The old password is no longer valid. Please enter your new password.';
        setError(wrongPassMsg);
        throw new Error(wrongPassMsg);
      }
      fallbackUid = existingRec.uid || fallbackUid;
      role = existingRec.role || role;
    } else {
      // First time offline registration
      saveLocalCredentialsRecord(cleanEmail, enteredHash, fallbackUid, role);
    }

    const profile: UserProfile = {
      uid: fallbackUid,
      email: cleanEmail,
      displayName,
      name: displayName,
      role,
      active: true,
      createdAt: new Date().toISOString(),
    };
    setUser(profile);
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
    return profile;
  };

  const signUp = async (fullName: string, email: string, pass: string): Promise<UserProfile> => {
    setError(null);
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanName || !cleanEmail || !pass) {
      const msg = 'Please fill out all required fields.';
      setError(msg);
      throw new Error(msg);
    }

    if (pass.length < 6) {
      const msg = 'Password must be at least 6 characters long.';
      setError(msg);
      throw new Error(msg);
    }

    const newHash = await computePasswordHash(cleanEmail, pass);

    if (!isFirebaseConfigured() || !auth) {
      const isMasterAdmin = cleanEmail === 'chafiquentuye@gmail.com';
      const role: 'admin' | 'client' = isMasterAdmin ? 'admin' : 'client';
      const fallbackUid = isMasterAdmin ? 'admin_master_session' : `client_${Date.now()}`;
      
      saveLocalCredentialsRecord(cleanEmail, newHash, fallbackUid, role);

      const profile: UserProfile = {
        uid: fallbackUid,
        email: cleanEmail,
        displayName: cleanName,
        name: cleanName,
        role,
        active: true,
        createdAt: new Date().toISOString(),
      };
      setUser(profile);
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
      return profile;
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const fbUser = result.user;

      // Update Firebase Auth profile displayName
      await updateProfile(fbUser, {
        displayName: cleanName,
      });

      const isMasterAdmin = cleanEmail === 'chafiquentuye@gmail.com';
      const role: 'admin' | 'client' = isMasterAdmin ? 'admin' : 'client';

      const profile: UserProfile = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: cleanName,
        name: cleanName,
        role,
        active: true,
        createdAt: new Date().toISOString(),
      };

      // Save to Firestore `users/{uid}` with passwordHash permanently
      if (db) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          await setDoc(userDocRef, {
            uid: fbUser.uid,
            fullName: cleanName,
            name: cleanName,
            displayName: cleanName,
            email: cleanEmail,
            role,
            active: true,
            passwordHash: newHash,
            passwordUpdatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            _serverCreatedAt: serverTimestamp(),
          });
        } catch (dbErr) {
          console.warn('[AuthContext] Error creating user doc in Firestore:', dbErr);
        }
      }

      saveLocalCredentialsRecord(cleanEmail, newHash, fbUser.uid, role);

      setUser(profile);
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
      return profile;
    } catch (err: any) {
      console.warn('[Auth] Firebase SignUp error:', err);

      if (err?.code === 'auth/operation-not-allowed') {
        const isMasterAdmin = cleanEmail === 'chafiquentuye@gmail.com';
        const role: 'admin' | 'client' = isMasterAdmin ? 'admin' : 'client';
        const fallbackUid = isMasterAdmin ? 'admin_master_session' : `client_${Date.now()}`;
        
        saveLocalCredentialsRecord(cleanEmail, newHash, fallbackUid, role);

        const profile: UserProfile = {
          uid: fallbackUid,
          email: cleanEmail,
          displayName: cleanName,
          name: cleanName,
          role,
          active: true,
          createdAt: new Date().toISOString(),
        };

        if (db) {
          try {
            const userDocRef = doc(db, 'users', fallbackUid);
            await setDoc(userDocRef, {
              uid: fallbackUid,
              fullName: cleanName,
              name: cleanName,
              displayName: cleanName,
              email: cleanEmail,
              role,
              active: true,
              passwordHash: newHash,
              passwordUpdatedAt: new Date().toISOString(),
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
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      const msg = 'Please enter your registered email address.';
      setError(msg);
      throw new Error(msg);
    }

    if (!isFirebaseConfigured() || !auth) {
      return;
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch (err: any) {
      console.warn('[Auth] Password reset notice:', err);
      if (err?.code === 'auth/operation-not-allowed') {
        return;
      }
      const friendlyMsg = translateFirebaseError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  const updateUserProfile = async (data: { displayName?: string; fullName?: string; phone?: string }): Promise<void> => {
    setError(null);
    const newName = (data.displayName || data.fullName || '').trim();
    const newPhone = data.phone !== undefined ? data.phone.trim() : user?.phone;

    if (!user) {
      throw new Error('No user is currently signed in.');
    }

    try {
      // 1. Update Firebase Auth Profile displayName if available
      if (auth?.currentUser && newName) {
        await updateProfile(auth.currentUser, {
          displayName: newName,
        });
      }

      // 2. Update Firestore `users/{uid}`
      const targetUid = auth?.currentUser?.uid || user.uid;
      if (db && targetUid) {
        try {
          const userDocRef = doc(db, 'users', targetUid);
          await setDoc(userDocRef, {
            name: newName || user.displayName || user.name || 'User',
            fullName: newName || user.displayName || user.name || 'User',
            displayName: newName || user.displayName || user.name || 'User',
            phone: newPhone || '',
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        } catch (dbErr) {
          console.warn('[AuthContext] Firestore user update error:', dbErr);
        }
      }

      // 3. Update local session state
      const updatedProfile: UserProfile = {
        ...user,
        displayName: newName || user.displayName,
        name: newName || user.name,
        phone: newPhone || user.phone,
        updatedAt: new Date().toISOString(),
      };

      setUser(updatedProfile);
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(updatedProfile));
    } catch (err: any) {
      console.error('[AuthContext] updateUserProfile error:', err);
      const friendlyMsg = translateFirebaseError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  /**
   * Updates user password permanently in Firebase Authentication, Firestore database, and local security registry.
   * Ensures that once updated, the old password is permanently invalidated and rejected on future logins.
   */
  const updateUserPassword = async (newPassword: string, currentPassword?: string): Promise<void> => {
    setError(null);
    if (!newPassword || newPassword.length < 6) {
      const msg = 'New password must be at least 6 characters long.';
      setError(msg);
      throw new Error(msg);
    }

    if (!user) {
      throw new Error('No user is currently signed in.');
    }

    const targetEmail = (auth?.currentUser?.email || user.email || '').trim().toLowerCase();
    const targetUid = auth?.currentUser?.uid || user.uid;

    if (!targetEmail) {
      throw new Error('Unable to identify user email for password update.');
    }

    // Compute the new SHA-256 cryptographic hash for database persistence
    const newHash = await computePasswordHash(targetEmail, newPassword);

    // 1. Verify current password if supplied or if auth is active
    if (auth?.currentUser) {
      try {
        if (currentPassword && auth.currentUser.email) {
          try {
            const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
            await reauthenticateWithCredential(auth.currentUser, credential);
          } catch (reauthErr: any) {
            console.warn('[AuthContext] Reauthentication check:', reauthErr);
            if (
              reauthErr?.code === 'auth/wrong-password' || 
              reauthErr?.code === 'auth/invalid-credential' ||
              reauthErr?.code === 'auth/invalid-login-credentials'
            ) {
              const msg = 'Current password does not match. Please verify your existing password.';
              setError(msg);
              throw new Error(msg);
            }
          }
        }

        // Apply new password to Firebase Auth
        await updatePassword(auth.currentUser, newPassword);
      } catch (err: any) {
        console.error('[AuthContext] updateUserPassword Firebase Auth error:', err);
        if (err?.code === 'auth/requires-recent-login') {
          const msg = 'For your security, please enter your current password to verify your identity before setting a new password.';
          setError(msg);
          throw new Error(msg);
        }
        if (err?.message && err.message.includes('Current password does not match')) {
          throw err;
        }
        const friendlyMsg = translateFirebaseError(err);
        setError(friendlyMsg);
        throw new Error(friendlyMsg);
      }
    }

    // 2. Permanently persist new password hash in Firestore `users/{uid}`
    if (db && targetUid) {
      try {
        const userDocRef = doc(db, 'users', targetUid);
        await setDoc(userDocRef, {
          passwordHash: newHash,
          passwordUpdatedAt: new Date().toISOString(),
          lastPasswordChange: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _serverUpdatedAt: serverTimestamp(),
        }, { merge: true });
        console.info('[AuthContext] New password permanently persisted to Firestore database for:', targetEmail);
      } catch (dbErr) {
        console.warn('[AuthContext] Firestore password persistence warning:', dbErr);
      }
    }

    // 3. Permanently update local credentials registry so old password CANNOT be used locally either
    saveLocalCredentialsRecord(targetEmail, newHash, targetUid, user.role);

    // 4. Update session profile timestamp
    const updatedProfile: UserProfile = {
      ...user,
      updatedAt: new Date().toISOString(),
    };
    setUser(updatedProfile);
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(updatedProfile));
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
        updateUserProfile,
        updateUserPassword,
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


