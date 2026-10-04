import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Settings,
  MapPin,
  Wifi,
  WifiOff,
  Users,
  Building2,
  Shield,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useLocation } from '../../hooks/useLocation';
import { useTrustedContacts } from '../../hooks/useTrustedContacts';

// ─── Types ────────────────────────────────────────────────────────────────────

type LocationPermission = 'prompt' | 'granted' | 'denied' | 'unavailable' | 'checking';

// ─── SOSButton (self-contained for the Home page) ─────────────────────────────
// NOTE: Imports from ../../components/sos/SOSButton if that file exists;
// this local version is a production-ready fallback.

interface SOSButtonProps {
  onPress: () => void;
}

function SOSButton({ onPress }: SOSButtonProps) {
  const [pressing, setPressing] = useState(false);

  return (
    <div className="relative flex items-center justify-center p-4 max-w-full">
      {/* Outer pulse rings */}
      <span
        className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-red-400/20 animate-ping pointer-events-none"
        style={{ animationDuration: '2.5s' }}
        aria-hidden="true"
      />
      <span
        className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-red-400/30 animate-ping pointer-events-none"
        style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}
        aria-hidden="true"
      />

      {/* Button */}
      <motion.button
        onTapStart={() => setPressing(true)}
        onTap={() => { setPressing(false); onPress(); }}
        onTapCancel={() => setPressing(false)}
        onClick={onPress}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
        animate={pressing ? { scale: 0.94 } : { scale: 1 }}
        className="relative z-10 w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-2xl shadow-red-300 dark:shadow-red-950/60 flex flex-col items-center justify-center gap-1 cursor-pointer select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-red-400 focus-visible:ring-offset-2"
        aria-label="Activate SOS emergency alert"
        role="button"
      >
        <Shield className="text-white" size={34} aria-hidden="true" />
        <span className="text-white font-extrabold text-2xl sm:text-3xl tracking-widest leading-none">SOS</span>
        <span className="text-red-100 text-[11px] font-medium leading-tight">Hold to activate</span>
      </motion.button>
    </div>
  );
}

// ─── Status card ──────────────────────────────────────────────────────────────

interface StatusCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  valueColor?: string;
  iconColor?: string;
  iconBg?: string;
  onClick?: () => void;
}

function StatusCard({ icon: Icon, label, value, valueColor = 'text-gray-900 dark:text-gray-100', iconColor = 'text-blue-600', iconBg = 'bg-blue-50', onClick }: StatusCardProps) {
  return (
    <div onClick={onClick} className={`${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''} bg-white/70 dark:bg-slate-900/70 transition-colors backdrop-blur border border-white/60 dark:border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col gap-2 shadow-sm min-w-0 overflow-hidden`}> 
      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
        <Icon size={18} aria-hidden="true" />
      </div>
      <div className="min-w-0 w-full">
        <p className="text-[11px] sm:text-xs text-gray-400 font-medium truncate">{label}</p>
        <p className={`text-xs sm:text-sm font-bold ${valueColor} mt-0.5 leading-tight truncate`}>{value}</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const { getCurrentLocation } = useLocation(null);
  const { contacts } = useTrustedContacts(user?.uid ?? null);
  const [locationPerm, setLocationPerm] = useState<LocationPermission>('checking');

  // Poll location permission status
  useEffect(() => {
    let mounted = true;

    async function checkPermission() {
      if (!('permissions' in navigator)) {
        setLocationPerm('unavailable');
        return;
      }
      try {
        const perm = await navigator.permissions.query({ name: 'geolocation' });
        if (mounted) setLocationPerm(perm.state as LocationPermission);
        perm.onchange = () => {
          if (mounted) setLocationPerm(perm.state as LocationPermission);
        };
      } catch {
        setLocationPerm('unavailable');
      }
    }

    checkPermission();
    return () => { mounted = false; };
  }, []);

  const enabledContacts = contacts.filter((c) => c.enabled);
  const displayName = profile?.displayName ?? user?.displayName ?? 'there';

  // ── GPS status helpers ──
  const gpsLabel: Record<LocationPermission, string> = {
    checking: 'Checking…',
    prompt: 'Not granted',
    granted: 'Available',
    denied: 'Denied',
    unavailable: 'Unavailable',
  };
  const gpsColor: Record<LocationPermission, string> = {
    checking: 'text-gray-500',
    prompt: 'text-amber-600',
    granted: 'text-green-600',
    denied: 'text-red-600',
    unavailable: 'text-gray-400',
  };

  function handleSOS() {
    navigate('/app/sos-countdown');
  }

  return (
    <div className="w-full flex-1 flex flex-col overflow-x-hidden">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/70 transition-colors backdrop-blur border-b border-white/40 dark:border-slate-800 px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-2.5 w-full max-w-full">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-400 font-medium truncate">Good to see you</p>
          <h1 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-gray-100 leading-tight truncate">
            Hi, {displayName}!
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Status pill */}
          <span className="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900/40 text-green-700 dark:text-green-400 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-full whitespace-nowrap">
            <CheckCircle2 size={13} className="shrink-0" aria-hidden="true" />
            <span>You're Safe</span>
          </span>
          <Link
            to="/app/settings"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm shrink-0"
            aria-label="Open settings"
          >
            <Settings size={18} className="text-gray-600 dark:text-gray-300" aria-hidden="true" />
          </Link>
        </div>
      </header>

      {/* ── Warnings ── */}
      {enabledContacts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 sm:mx-5 mt-3 sm:mt-4"
        >
          <Link
            to="/app/contacts"
            className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-3.5 sm:p-4"
            aria-label="Warning: No trusted contacts — tap to add"
          >
            <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">No trusted contacts</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">SOS alerts require at least one contact. Tap to add →</p>
            </div>
          </Link>
        </motion.div>
      )}

      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 sm:mx-5 mt-3"
        >
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl p-3.5 sm:p-4" role="alert">
            <WifiOff size={16} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">You're offline</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">SOS will still work and sync when you reconnect.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── SOS Content ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-5 py-6 sm:py-8 w-full max-w-full overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="my-2 flex items-center justify-center w-full"
        >
          <SOSButton onPress={handleSOS} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs sm:text-sm text-gray-400 font-medium mt-1 text-center"
        >
          Press the button in an emergency
        </motion.p>

        {/* ── Status Grid ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full max-w-sm mt-6 sm:mt-8"
        >
          <StatusCard
            icon={MapPin}
            label="GPS"
            onClick={() => getCurrentLocation()}
            value={gpsLabel[locationPerm]}
            valueColor={gpsColor[locationPerm]}
            iconBg={locationPerm === 'granted' ? 'bg-green-50' : 'bg-amber-50'}
            iconColor={locationPerm === 'granted' ? 'text-green-600' : 'text-amber-600'}
          />
          <StatusCard
            icon={isOnline ? Wifi : WifiOff}
            label="Network"
            value={isOnline ? 'Online' : 'Offline'}
            valueColor={isOnline ? 'text-green-600' : 'text-red-600'}
            iconBg={isOnline ? 'bg-green-50' : 'bg-red-50'}
            iconColor={isOnline ? 'text-green-600' : 'text-red-600'}
          />
          <Link
            to="/app/contacts"
            className="block min-w-0"
            aria-label={`Trusted contacts: ${enabledContacts.length} enabled`}
          >
            <StatusCard
              icon={Users}
              label="Contacts"
              value={enabledContacts.length === 0 ? 'None added' : `${enabledContacts.length} active`}
              valueColor={enabledContacts.length === 0 ? 'text-amber-600' : 'text-green-600'}
              iconBg={enabledContacts.length === 0 ? 'bg-amber-50' : 'bg-green-50'}
              iconColor={enabledContacts.length === 0 ? 'text-amber-600' : 'text-green-600'}
            />
          </Link>
          <Link
            to="/app/emergency-services"
            className="block min-w-0"
            aria-label="Find nearby help"
          >
            <StatusCard
              icon={Building2}
              label="Nearby Help"
              value="Tap to check"
              valueColor="text-blue-600"
            />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
