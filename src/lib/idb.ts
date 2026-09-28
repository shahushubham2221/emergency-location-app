import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { SOSSession, LocationPoint, PendingQueueItem } from '../types/sos';

interface SOSGuardianDB extends DBSchema {
  activeSOS: {
    key: string;
    value: SOSSession;
  };
  pendingQueue: {
    key: string;
    value: PendingQueueItem;
    indexes: {
      'by-type': string;
      'by-createdAt': number;
    };
  };
  lastLocation: {
    key: string; // sessionId
    value: LocationPoint;
  };
  sosHistory: {
    key: string;
    value: SOSSession;
    indexes: {
      'by-userId': string;
      'by-startedAt': number;
    };
  };
}

const DB_NAME = 'sos-guardian';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<SOSGuardianDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<SOSGuardianDB>> {
  if (!dbPromise) {
    dbPromise = openDB<SOSGuardianDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // activeSOS — one record per active session
        if (!db.objectStoreNames.contains('activeSOS')) {
          db.createObjectStore('activeSOS', { keyPath: 'id' });
        }

        // pendingQueue — offline-sync queue
        if (!db.objectStoreNames.contains('pendingQueue')) {
          const pq = db.createObjectStore('pendingQueue', { keyPath: 'id' });
          pq.createIndex('by-type', 'type');
          pq.createIndex('by-createdAt', 'createdAt');
        }

        // lastLocation — one record per session (upsert by sessionId)
        if (!db.objectStoreNames.contains('lastLocation')) {
          db.createObjectStore('lastLocation', { keyPath: 'sessionId' });
        }

        // sosHistory — local cache for history page
        if (!db.objectStoreNames.contains('sosHistory')) {
          const sh = db.createObjectStore('sosHistory', { keyPath: 'id' });
          sh.createIndex('by-userId', 'userId');
          sh.createIndex('by-startedAt', 'startedAt');
        }
      },
    });
  }
  return dbPromise;
}

// ─── activeSOS ────────────────────────────────────────────────────────────────

export async function saveActiveSOS(session: SOSSession): Promise<void> {
  const db = await getDB();
  await db.put('activeSOS', session);
}

export async function getActiveSOS(): Promise<SOSSession | undefined> {
  const db = await getDB();
  // There should be at most one active session; return the first one.
  const all = await db.getAll('activeSOS');
  return all[0];
}

export async function clearActiveSOS(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('activeSOS', id);
}

// ─── lastLocation ─────────────────────────────────────────────────────────────

export async function saveLastLocation(point: LocationPoint): Promise<void> {
  const db = await getDB();
  await db.put('lastLocation', point);
}

export async function getLastLocation(
  sessionId: string
): Promise<LocationPoint | undefined> {
  const db = await getDB();
  return db.get('lastLocation', sessionId);
}

// ─── pendingQueue ─────────────────────────────────────────────────────────────

export async function addToPendingQueue(
  item: PendingQueueItem
): Promise<void> {
  const db = await getDB();
  await db.put('pendingQueue', item);
}

export async function getPendingQueue(): Promise<PendingQueueItem[]> {
  const db = await getDB();
  // Return items sorted by creation time so oldest are synced first.
  return db.getAllFromIndex('pendingQueue', 'by-createdAt');
}

export async function removeFromPendingQueue(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('pendingQueue', id);
}

export async function clearPendingQueue(): Promise<void> {
  const db = await getDB();
  await db.clear('pendingQueue');
}

// ─── sosHistory ───────────────────────────────────────────────────────────────

export async function cacheSosHistory(sessions: SOSSession[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('sosHistory', 'readwrite');
  await Promise.all([
    ...sessions.map((s) => tx.store.put(s)),
    tx.done,
  ]);
}

export async function getCachedSosHistory(
  userId: string
): Promise<SOSSession[]> {
  const db = await getDB();
  const results = await db.getAllFromIndex('sosHistory', 'by-userId', userId);
  // Sort descending by startedAt so newest sessions appear first.
  return results.sort((a, b) => b.startedAt - a.startedAt);
}
