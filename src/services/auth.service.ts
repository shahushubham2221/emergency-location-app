import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  deleteUser,
  onAuthStateChanged,
  updateProfile,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { UserProfile, EmergencyPreferences } from '../types/auth';

const DEFAULT_PREFERENCES: EmergencyPreferences = {
  sosCountdownSeconds: 5,
  autoNotifyContacts: true,
  locationUpdateIntervalMs: 10_000,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function userProfileRef(uid: string) {
  return doc(db, 'users', uid);
}

function adminRef(uid: string) {
  return doc(db, 'admins', uid);
}

// ─── Auth operations ─────────────────────────────────────────────────────────

export async function registerUser(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const { user } = credential;

  // Update Firebase Auth display name
  await updateProfile(user, { displayName });

  // Create Firestore profile document
  const now = Date.now();
  const profile: UserProfile = {
    uid: user.uid,
    email: user.email ?? email,
    displayName,
    emergencyPreferences: DEFAULT_PREFERENCES,
    onboardingCompleted: false,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(userProfileRef(user.uid), profile);
  return user;
}

export async function loginUser(
  email: string,
  password: string
): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function deleteUserAccount(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  // Remove Firestore profile first, then the Auth account
  await deleteDoc(userProfileRef(user.uid));
  await deleteUser(user);
}

// ─── Profile operations ───────────────────────────────────────────────────────

export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  const snap = await getDoc(userProfileRef(uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<
    Pick<
      UserProfile,
      | 'displayName'
      | 'phoneNumber'
      | 'photoURL'
      | 'emergencyPreferences'
      | 'onboardingCompleted'
    >
  >
): Promise<void> {
  const payload = { ...updates, updatedAt: Date.now() };
  await updateDoc(userProfileRef(uid), payload);

  // Sync displayName to Firebase Auth if it changed
  if (updates.displayName && auth.currentUser) {
    await updateProfile(auth.currentUser, {
      displayName: updates.displayName,
    });
  }
}

// ─── Auth state observer ──────────────────────────────────────────────────────

export function onAuthStateChange(
  callback: (user: User | null) => void
): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

// ─── Admin check ──────────────────────────────────────────────────────────────

/**
 * Returns true if the given uid exists in the top-level `admins` collection.
 * The Firestore security rules must allow authenticated users to read their
 * own admin document.
 */
export async function isAdmin(uid: string): Promise<boolean> {
  try {
    const snap = await getDoc(adminRef(uid));
    return snap.exists();
  } catch {
    return false;
  }
}
