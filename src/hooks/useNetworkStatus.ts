import { useState, useEffect, useRef } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  /** True for 3 seconds immediately after re-connecting. */
  justReconnected: boolean;
}

const RECONNECT_FLAG_DURATION_MS = 3_000;

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [justReconnected, setJustReconnected] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      setJustReconnected(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setJustReconnected(false);
      }, RECONNECT_FLAG_DURATION_MS);
    }

    function handleOffline() {
      setIsOnline(false);
      setJustReconnected(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { isOnline, justReconnected };
}
