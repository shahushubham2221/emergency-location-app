import React, { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  WifiOff,
  Wifi,
  MapPin,
  AlertTriangle,
  Phone,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useLocation as useGeoLocation } from '../../hooks/useLocation';
import { useTrustedContacts } from '../../hooks/useTrustedContacts';
import { useSyncQueue } from '../../hooks/useSyncQueue';
import { useSOSStore } from '../../store/sos.store';
import { useAppStore } from '../../store/app.store';
import { saveLocationUpdate, endSOSSession } from '../../services/sos.service';
import { notifyContacts } from '../../services/notifications.service';
import { saveLastLocation } from '../../lib/idb';
import { formatCountdown, formatAccuracy, formatRelativeTime } from '../../utils/formatters';
import type { SOSSession } from '../../types/sos';

// ── Headless timer ──────────────────────────────────────────────────────────

function SOSTimer() {
  const { session, remainingSeconds, setRemainingSeconds, setPhase } = useSOSStore();
  const { isOnline } = useNetworkStatus();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!session || session.status !== 'active') return;

    intervalRef.current = setInterval(() => {
      setRemainingSeconds(
        (() => {
          const next = useSOSStore.getState().remainingSeconds - 1;
          if (next <= 0) {
            clearInterval(intervalRef.current!);
            endSOSSession(session, useSOSStore.getState().lastKnownLocation ?? undefined, isOnline).catch(console.error);
            setPhase('completed');
            return 0;
          }
          return next;
        })()
      );
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [session?.id]);

  return null;
}

// ── Stop Confirmation ───────────────────────────────────────────────────────

interface StopConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

function StopConfirm({ onConfirm, onCancel, loading }: StopConfirmProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 transition-colors rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Stop Emergency Alert?</h2>
          <p className="text-gray-500 text-sm">
            This will end the SOS session. Your trusted contacts will not receive further location updates.
          </p>
        </div>
        <div className="flex flex-col gap-2 px-6 pb-6">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl min-h-[56px] hover:bg-red-700 disabled:opacity-50 transition-colors active:scale-95"
          >
            {loading ? 'Stopping...' : 'Yes, Stop SOS'}
          </button>
          <button
            onClick={onCancel}
            className="w-full py-4 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl min-h-[56px] hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            Keep SOS Active
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function SOSActive() {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const { user, profile } = useAuth();
  const { isOnline } = useNetworkStatus();
  const { contacts } = useTrustedContacts(user?.uid ?? null);
  const addToast = useAppStore((s) => s.addToast);

  const {
    session,
    setSession,
    setPhase,
    currentLocation,
    setCurrentLocation,
    lastKnownLocation,
    remainingSeconds,
    alertResults,
    setAlertResults,
    isOfflineDuringSOS,
    setIsOfflineDuringSOS,
  } = useSOSStore();

  const [showStopConfirm, setShowStopConfirm] = React.useState(false);
  const [stopping, setStopping] = React.useState(false);
  const alertsSentRef = useRef(false);

  // Track offline status during SOS
  useEffect(() => {
    if (!isOnline) setIsOfflineDuringSOS(true);
  }, [isOnline, setIsOfflineDuringSOS]);

  // Sync queue on reconnect
  useSyncQueue();

  // GPS tracking
  const { locationState, startWatching } = useGeoLocation(session?.id ?? null);

  const handleLocationUpdate = useCallback(
    async (point: Parameters<typeof saveLocationUpdate>[0]) => {
      setCurrentLocation(point);
      await saveLastLocation(point);
      await saveLocationUpdate(point, isOnline);
    },
    [isOnline, setCurrentLocation]
  );

  useEffect(() => {
    if (!session) return;
    startWatching(session.id, handleLocationUpdate);
  }, [session?.id]);

  // Send alerts to trusted contacts (once per session)
  useEffect(() => {
    if (!session || !profile || alertsSentRef.current) return;
    if (contacts.length === 0) return;

    const tryNotify = () => {
      if (alertsSentRef.current) return;
      alertsSentRef.current = true;
      const loc = useSOSStore.getState().currentLocation ?? useSOSStore.getState().lastKnownLocation ?? undefined;
      notifyContacts(profile, contacts, loc)
        .then((results) => {
          setAlertResults(results);
          const opened = results.filter((r) => r.status === 'composer_opened').length;
          if (opened > 0) {
            addToast({
              type: 'info',
              
              message: `Opened SMS composer. PLEASE TAP 'SEND' IN YOUR MESSAGING APP.`,
              duration: 10000,
            });
          }
        })
        .catch(() => {
          addToast({ type: 'warning',  message: 'Could not open alert composer. Check your contacts.' });
        });
    };

    if (currentLocation || lastKnownLocation) {
      tryNotify();
    } else {
      const timer = setTimeout(tryNotify, 4000); // wait up to 4s for GPS
      return () => clearTimeout(timer);
    }
  }, [session?.id, profile, contacts, currentLocation, lastKnownLocation]);

  const handleStop = async () => {
    if (!session) return;
    setStopping(true);
    try {
      await endSOSSession(session, lastKnownLocation ?? undefined, isOnline);
      setPhase('completed');
      navigate('/app/sos-completed', { replace: true });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error',  message: 'Failed to stop session' });
      setStopping(false);
      setShowStopConfirm(false);
    }
  };

  const isLive = isOnline && (currentLocation !== null || locationState === 'available');
  const locationPoint = currentLocation ?? lastKnownLocation;
  const hasGPSError = locationState === 'error' || locationState === 'denied' || locationState === 'unavailable';

  return (
    <div className="min-h-dvh bg-red-600 flex flex-col w-full max-w-full overflow-x-hidden">
      <SOSTimer />

      {/* Header */}
      <header className="px-5 pt-12 pb-6 text-center text-white">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="inline-flex items-center gap-2 bg-red-500/40 rounded-full px-5 py-2 mb-4"
        >
          <span className="w-2 h-2 rounded-full bg-white dark:bg-slate-900 transition-colors animate-pulse" aria-hidden="true" />
          <span className="font-bold text-sm tracking-wider">SOS ACTIVE</span>
        </motion.div>
        <h1 className="text-3xl font-black">Help alert is active</h1>
        <p className="text-red-200 text-sm mt-1">Your trusted contacts are being notified</p>
      </header>

      {/* Timer */}
      <div className="text-center px-5 mb-4">
        <p className="text-red-200 text-xs mb-1">Auto-ends in</p>
        <p className="text-white font-black text-4xl tabular-nums">
          {formatCountdown(remainingSeconds)}
        </p>
      </div>

      {/* Content cards */}
      <div className="flex-1 bg-[#F0F4FF] dark:bg-slate-950 transition-colors rounded-t-3xl px-4 pt-5 pb-32 space-y-3 w-full">
        {/* Network/sync status */}
        <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${isOnline ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50' : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50'}`}>
          {isOnline ? (
            <Wifi size={18} className="text-emerald-600 shrink-0" aria-hidden="true" />
          ) : (
            <WifiOff size={18} className="text-amber-600 shrink-0" aria-hidden="true" />
          )}
          <div>
            <p className={`text-sm font-semibold ${isOnline ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'}`}>
              {isOnline ? 'Connected — live sync active' : 'Offline — last known location saved'}
            </p>
            {isOfflineDuringSOS && isOnline && (
              <p className="text-xs text-emerald-600 mt-0.5">Back online — syncing data…</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="bg-white dark:bg-slate-900 transition-colors rounded-2xl p-4 shadow-sm border border-white/60 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={16} className="text-blue-600" aria-hidden="true" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Your Location</p>
            <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${isLive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {isLive ? 'Live' : 'Last Known'}
            </span>
          </div>

          {locationPoint ? (
            <div>
              <p className="text-gray-900 dark:text-gray-100 font-mono text-sm">
                {locationPoint.latitude.toFixed(5)}, {locationPoint.longitude.toFixed(5)}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Accuracy: {formatAccuracy(locationPoint.accuracy)} ·{' '}
                {formatRelativeTime(locationPoint.timestamp)}
              </p>
              {locationPoint.accuracy > 100 && (
                <p className="text-amber-600 text-xs mt-1 flex items-center gap-1">
                  <AlertTriangle size={12} aria-hidden="true" />
                  Location accuracy is low
                </p>
              )}
            </div>
          ) : (
            <div>
              {locationState === 'requesting' && (
                <p className="text-gray-400 text-sm">Acquiring GPS signal…</p>
              )}
              {hasGPSError && (
                <div className="flex items-start gap-2 text-amber-700">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm">
                    {locationState === 'denied'
                      ? 'Location permission denied. Enable in browser settings.'
                      : 'GPS unavailable. Call 112 for immediate help.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Alert status */}
        {alertResults.length > 0 && (
          <div className="bg-white dark:bg-slate-900 transition-colors rounded-2xl p-4 shadow-sm border border-white/60 dark:border-slate-800">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Alert Status</p>
            <div className="space-y-1.5">
              {alertResults.map((r) => (
                <div key={r.contactId} className="flex items-center gap-2 text-xs">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${r.status === 'composer_opened' ? 'bg-emerald-50 dark:bg-emerald-900/200' : 'bg-red-400'}`} aria-hidden="true" />
                  <span className="text-gray-600 dark:text-gray-400">{r.contactName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Stop SOS button — fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] bg-[#F0F4FF]/95 dark:bg-slate-950/95 transition-colors backdrop-blur border-t border-gray-100 dark:border-slate-800 z-30">
        <button
          onClick={() => setShowStopConfirm(true)}
          className="w-full max-w-lg mx-auto flex items-center justify-center gap-2 py-4 bg-white dark:bg-slate-900 transition-colors border-2 border-red-500 text-red-600 font-bold text-lg rounded-2xl min-h-[64px] hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors active:scale-95 shadow-sm"
        >
          <Phone size={20} aria-hidden="true" />
          STOP SOS
        </button>
      </div>

      {showStopConfirm && (
        <StopConfirm
          onConfirm={handleStop}
          onCancel={() => setShowStopConfirm(false)}
          loading={stopping}
        />
      )}
    </div>
  );
}
