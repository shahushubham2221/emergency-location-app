import {
  doc,
  setDoc,
  updateDoc,
  collection,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  getPendingQueue,
  removeFromPendingQueue,
  addToPendingQueue,
} from '../lib/idb';
import type { PendingQueueItem, LocationPoint, SOSSession } from '../types/sos';
import { nanoid } from '../utils/nanoid';

export interface SyncResult {
  synced: number;
  failed: number;
  errors: string[];
}

const MAX_RETRIES = 3;

/**
 * Processes all items in the IndexedDB pending queue and writes them to
 * Firestore. Items that fail are re-queued with an incremented retry counter;
 * items that exceed MAX_RETRIES are discarded to prevent infinite loops.
 */
export async function syncPendingQueue(): Promise<SyncResult> {
  const result: SyncResult = { synced: 0, failed: 0, errors: [] };
  const items = await getPendingQueue();

  if (items.length === 0) return result;

  await Promise.allSettled(
    items.map(async (item) => {
      try {
        await processQueueItem(item);
        await removeFromPendingQueue(item.id);
        result.synced++;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : `Unknown error for item ${item.id}`;
        result.errors.push(message);
        result.failed++;

        if (item.retries < MAX_RETRIES) {
          // Re-queue with incremented retry count
          const updated: PendingQueueItem = {
            ...item,
            retries: item.retries + 1,
            // Exponential back-off: update createdAt so it sorts to the end
            createdAt: Date.now(),
          };
          await removeFromPendingQueue(item.id);
          await addToPendingQueue(updated);
        } else {
          // Give up — remove from queue to avoid blocking future syncs
          await removeFromPendingQueue(item.id);
          result.errors.push(
            `Item ${item.id} (type: ${item.type}) exceeded max retries and was discarded.`
          );
        }
      }
    })
  );

  return result;
}

async function processQueueItem(item: PendingQueueItem): Promise<void> {
  switch (item.type) {
    case 'sos_create': {
      const session = item.data as unknown as SOSSession;
      await setDoc(doc(db, 'sosSessions', session.id), {
        ...session,
        status: 'active',
        syncCompleted: true,
        updatedAt: Date.now(),
      });
      break;
    }

    case 'sos_end': {
      const { sessionId, endedAt, duration, lastLocation } = item.data as {
        sessionId: string;
        endedAt: number;
        duration: number;
        lastLocation: LocationPoint | null;
      };
      await updateDoc(doc(db, 'sosSessions', sessionId), {
        status: 'completed',
        endedAt,
        duration,
        lastLocation: lastLocation ?? null,
        syncCompleted: true,
        updatedAt: Date.now(),
      });
      break;
    }

    case 'location_update': {
      const point = item.data as unknown as LocationPoint;
      const locRef = doc(
        collection(db, 'sosSessions', point.sessionId, 'locationUpdates'),
        nanoid()
      );
      await setDoc(locRef, { ...point, synced: true });
      break;
    }

    case 'alert':
      // Alert records are informational — just mark them synced
      // (actual SMS delivery is not trackable from the web app)
      break;

    default: {
      const exhaustiveCheck: never = item.type;
      throw new Error(`Unknown queue item type: ${exhaustiveCheck}`);
    }
  }
}
