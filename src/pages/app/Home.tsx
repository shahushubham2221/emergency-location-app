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
    <div className="relative flex items-center justify-center">
      {/* Outer pulse rings */}
      <span
        className="absolute w-56 h-56 rounded-full bg-red-400/20 animate-ping"
        style={{ animationDuration: '2s' }}
        aria-hidden="true"
      />
      <span
        className="absolute w-44 h-44 rounded-full bg-red-400/30 animate-ping"
        style={{ animationDuration: '2s', animationDelay: '0.4s' }}
        aria-hidden="true"
      />

      {/* Button */}
      <motion.button
        onTapStart={() => setPressing(true)}
        onTap={() => { setPressing(false); onPress(); }}
        onTapCancel={() => setPressing(false)}
        onClick={onPress}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        animate={pressing ? { scale: 0.95 } : { scale: 1 }}
        className="relative z-10 w-40 h-40 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-2xl shadow-red-300 flex flex-col items-center justify-center gap-1 cursor-pointer select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-red-400 focus-visible:ring-offset-2"
        aria-label="Activate SOS emergency alert"
        role="button"
      >
        <Shield className="text-white" size={36} aria-hidden="true" />
        <span className="text-white font-extrabold text-2xl tracking-widest">SOS</span>
        <span className="text-red-200 text-xs font-medium">Hold to activate</span>
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
    <div onClick={onClick} className={`${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''} bg-white/70 dark:bg-slate-900/70 transition-colors backdrop-blur border border-white/60 rounded-2xl p-4 flex flex-col gap-2.5 shadow-sm`}> 
      <div className={`w-9 h-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center`}>
        <Icon size={18} aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className={`text-sm font-bold ${valueColor} mt-0.5 leading-tight`}>{value}</p>
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
    <div className="min-h-screen bg-[#F0F4FF] dark:bg-slate-950 transition-colors flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/70 transition-colors backdrop-blur border-b border-white/40 dark:border-slate-800 px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium">Good to see you</p>
          <h1 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 leading-tight">Hi, {displayName}!</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Status pill */}
          <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            <CheckCircle2 size={13} aria-hidden="true" />
            You're Safe
          </span>
          <Link
            to="/app/settings"
            className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
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
          className="mx-5 mt-4"
        >
          <Link
            to="/app/contacts"
            className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5"
            aria-label="Warning: No trusted contacts — tap to add"
          >
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-amber-800">No trusted contacts</p>
              <p className="text-xs text-amber-600 mt-0.5">SOS alerts require at least one contact. Tap to add →</p>
            </div>
          </Link>
        </motion.div>
      )}

      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 mt-3"
        >
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3.5" role="alert">
            <WifiOff size={16} className="text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-red-800">You're offline</p>
              <p className="text-xs text-red-600 mt-0.5">SOS will still work and sync when you reconnect.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── SOS Button ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="mb-4"
        >
          <SOSButton onPress={handleSOS} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-gray-400 font-medium mt-2"
        >
          Press the button in an emergency
        </motion.p>

        {/* ── Status Grid ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3 w-full max-w-xs mt-10"
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
            className="block"
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
            className="block"
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
      </main>
    </div>
  );
}
