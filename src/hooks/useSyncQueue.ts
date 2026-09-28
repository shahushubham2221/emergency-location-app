import { useEffect, useRef } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { syncPendingQueue } from '../services/offline.service';
import { useAppStore } from '../store/app.store';

/**
 * Automatically syncs the offline pending queue whenever the device
 * transitions from offline → online. Prevents concurrent sync runs.
 */
export function useSyncQueue(): void {
  const { justReconnected } = useNetworkStatus();
  const isSyncingRef = useRef(false);
  const { setSyncStatus, addToast } = useAppStore();

  useEffect(() => {
    if (!justReconnected || isSyncingRef.current) return;

    const run = async () => {
      isSyncingRef.current = true;
      setSyncStatus('syncing');

      try {
        const result = await syncPendingQueue();
        setSyncStatus('idle');

        if (result.synced > 0) {
          addToast({
            message: `${result.synced} offline action${result.synced !== 1 ? 's' : ''} synced successfully.`,
            type: 'success',
          });
        }
        if (result.failed > 0) {
          addToast({
            message: `${result.failed} item${result.failed !== 1 ? 's' : ''} failed to sync.`,
            type: 'error',
          });
        }
      } catch (err) {
        setSyncStatus('error');
        const message =
          err instanceof Error ? err.message : 'Sync failed unexpectedly';
        addToast({ message, type: 'error' });
      } finally {
        isSyncingRef.current = false;
      }
    };

    run();
  }, [justReconnected, setSyncStatus, addToast]);
}
