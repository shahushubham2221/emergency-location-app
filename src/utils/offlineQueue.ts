/**
 * In-memory offline queue for location updates and alerts
 * that could not be sent while the device was offline.
 *
 * In a production app, this would be backed by IndexedDB or
 * localStorage for persistence across page reloads.
 */

export interface QueueItem {
  type: string;
  payload: Record<string, unknown>;
  /** ISO timestamp of when the item was enqueued */
  enqueuedAt?: string;
}

let queue: QueueItem[] = [];

/** Add an item to the offline queue. */
export function addToOfflineQueue(item: QueueItem): void {
  queue.push({ ...item, enqueuedAt: new Date().toISOString() });
}

/** Return a copy of the current queue. */
export function getOfflineQueue(): QueueItem[] {
  return [...queue];
}

/** Remove all items from the queue. */
export function clearOfflineQueue(): void {
  queue = [];
}

/** Remove and return the first item from the queue (FIFO dequeue). */
export function dequeueOfflineItem(): QueueItem | undefined {
  return queue.shift();
}

/** Return the number of items in the queue. */
export function getOfflineQueueLength(): number {
  return queue.length;
}
