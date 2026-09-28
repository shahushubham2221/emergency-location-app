import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { nanoid } from '../utils/nanoid';
import type { TrustedContact } from '../types/contacts';

// Collection path: users/{userId}/trustedContacts
function contactsRef(userId: string) {
  return collection(db, 'users', userId, 'trustedContacts');
}

function contactDocRef(userId: string, contactId: string) {
  return doc(db, 'users', userId, 'trustedContacts', contactId);
}

export async function getTrustedContacts(
  userId: string
): Promise<TrustedContact[]> {
  const q = query(contactsRef(userId), orderBy('createdAt', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TrustedContact));
}

export async function addTrustedContact(
  userId: string,
  input: Omit<TrustedContact, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<TrustedContact> {
  const now = Date.now();
  const contact: Omit<TrustedContact, 'id'> = {
    ...input,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  // Use Firestore auto-id so the document id is the contact id
  const docRef = await addDoc(contactsRef(userId), contact);
  return { id: docRef.id, ...contact };
}

export async function updateTrustedContact(
  userId: string,
  contactId: string,
  updates: Partial<
    Pick<TrustedContact, 'name' | 'phone' | 'relationship' | 'email' | 'enabled'>
  >
): Promise<void> {
  await updateDoc(contactDocRef(userId, contactId), {
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function deleteTrustedContact(
  userId: string,
  contactId: string
): Promise<void> {
  await deleteDoc(contactDocRef(userId, contactId));
}
