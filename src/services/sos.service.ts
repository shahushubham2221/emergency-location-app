import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { nanoid } from '../utils/nanoid';
import {
  saveActiveSOS,
  clearActiveSOS,
  saveLastLocation,
  addToPendingQueue,
  cacheSosHistory,
} from '../lib/idb';
import type { SOSSession, LocationPoint, PendingQueueItem } from '../types/sos';

function sessionsRef() {
  return collection(db, 'sosSessions');
}

function sessionDocRef(id: string) {
  return doc(db, 'sosSessions', id);
}

// ─── Create SOS session ───────────────────────────────────────────────────────

/**
 * Creates a new SOS session.
 * 1. Persists to IndexedDB immediately (works offline).
 * 2. If online, writes to Firestore; otherwise enqueues for later sync.
 */
export async function createSOSSession(
  userId: string,
  isOnline: boolean
): Promise<SOSSession> {
  const now = Date.now();
  const id = nanoid();

  const session: SOSSession = {
    id,
    userId,
    status: isOnline ? 'active' : 'offline_pending',
    startedAt: now,
    alertsSent: false,
    syncCompleted: isOnline,
    createdAt: now,
    updatedAt: now,
  };

  // Always save locally first
  await saveActiveSOS(session);

  if (isOnline) {
    await setDoc(sessionDocRef(id), session);
  } else {
    const queueItem: PendingQueueItem = {
      id: nanoid(),
      type: 'sos_create',
      data: session as unknown as Record<string, unknown>,
      createdAt: now,
      retries: 0,
    };
    await addToPendingQueue(queueItem);
  }

  return session;
}

// ─── End SOS session ──────────────────────────────────────────────────────────

export async function endSOSSession(
  session: SOSSession,
  finalLocation: LocationPoint | undefined,
  isOnline: boolean
): Promise<SOSSession> {
  const now = Date.now();
  const ended: SOSSession = {
    ...session,
    status: 'completed',
    endedAt: now,
    duration: Math.floor((now - session.startedAt) / 1000),
    lastLocation: finalLocation ?? session.lastLocation,
    syncCompleted: isOnline,
    updatedAt: now,
  };

  // Remove from active store
  await clearActiveSOS(session.id);

  if (isOnline) {
    await updateDoc(sessionDocRef(session.id), {
      status: ended.status,
      endedAt: ended.endedAt,
      duration: ended.duration,
      lastLocation: ended.lastLocation ?? null,
      syncCompleted: true,
      updatedAt: ended.updatedAt,
    });
  } else {
    const queueItem: PendingQueueItem = {
      id: nanoid(),
      type: 'sos_end',
      data: {
        sessionId: session.id,
        endedAt: now,
        duration: ended.duration,
        lastLocation: finalLocation ?? null,
      },
      createdAt: now,
      retries: 0,
    };
    await addToPendingQueue(queueItem);
  }

  return ended;
}

// ─── Location update ──────────────────────────────────────────────────────────

/**
 * Saves a new location point.
 * Always updates the local lastLocation store.
 * If online, writes to the session's `locationUpdates` sub-collection;
 * otherwise enqueues the point.
 */
export async function saveLocationUpdate(
  point: LocationPoint,
  isOnline: boolean
): Promise<void> {
  // Keep latest position in IDB regardless of connectivity
  await saveLastLocation(point);

  if (isOnline) {
    const locRef = doc(
      collection(db, 'sosSessions', point.sessionId, 'locationUpdates'),
      nanoid()
    );
    await setDoc(locRef, { ...point, synced: true });
  } else {
    const queueItem: PendingQueueItem = {
      id: nanoid(),
      type: 'location_update',
      data: point as unknown as Record<string, unknown>,
      createdAt: point.timestamp,
      retries: 0,
    };
    await addToPendingQueue(queueItem);
  }
}

// ─── History ──────────────────────────────────────────────────────────────────

export async function getUserSOSHistory(
  userId: string,
  maxResults = 50
): Promise<SOSSession[]> {
  const q = query(
    sessionsRef(),
    where('userId', '==', userId),
    orderBy('startedAt', 'desc'),
    limit(maxResults)
  );
  const snap = await getDocs(q);
  const sessions = snap.docs.map((d) => d.data() as SOSSession);

  // Cache results locally for offline access
  await cacheSosHistory(sessions);
  return sessions;
}

export async function getActiveSessions(userId: string): Promise<SOSSession[]> {
  const q = query(
    sessionsRef(),
    where('userId', '==', userId),
    where('status', 'in', ['active', 'countdown', 'offline_pending'])
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as SOSSession);
}

export async function getAllActiveSessions(): Promise<SOSSession[]> {
  const q = query(
    sessionsRef(),
    where('status', 'in', ['active', 'countdown', 'offline_pending'])
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as SOSSession);
}
