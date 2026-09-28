import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

const RECONNECTED_BANNER_DURATION = 3500; // ms

export const OfflineBanner: React.FC = () => {
  const { isOnline } = useNetworkStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowReconnected(false);
    } else if (wasOffline && isOnline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, RECONNECTED_BANNER_DURATION);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  const showOffline = !isOnline;

  return (
    <AnimatePresence>
      {showOffline && (
        <motion.div
          key="offline-banner"
          initial={{ y: -56, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -56, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          role="status"
          aria-live="assertive"
          aria-label="You are offline"
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2
            bg-amber-500 text-white px-4 py-3 text-sm font-semibold
            shadow-md min-h-[48px]"
        >
          <WifiOff size={16} aria-hidden="true" />
          <span>You're offline — some features may not be available</span>
        </motion.div>
      )}

      {!showOffline && showReconnected && (
        <motion.div
          key="reconnected-banner"
          initial={{ y: -56, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -56, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          role="status"
          aria-live="polite"
          aria-label="You are back online"
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2
            bg-emerald-500 text-white px-4 py-3 text-sm font-semibold
            shadow-md min-h-[48px]"
        >
          <Wifi size={16} aria-hidden="true" />
          <span>Back online!</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
