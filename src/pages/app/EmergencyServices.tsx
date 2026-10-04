import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2, MapPin, RefreshCw } from 'lucide-react';
import { useLocation as useGeoLocation } from '../../hooks/useLocation';
import { fetchNearbyEmergencyServices, type EmergencyService } from '../../lib/overpass';
import { EmergencyServiceCard } from '../../components/emergency/EmergencyServiceCard';
import { Header } from '../../components/layout/Header';
import { openEmergencyCall } from '../../services/notifications.service';

type FilterCategory = 'all' | EmergencyService['category'];

const FILTERS: { label: string; value: FilterCategory }[] = [
  { label: 'All', value: 'all' },
  { label: '🚔 Police', value: 'police' },
  { label: '🏥 Hospital', value: 'hospital' },
  { label: '🚒 Fire', value: 'fire_station' },
  { label: '💊 Pharmacy', value: 'pharmacy' },
];

const QUICK_DIAL = [
  { label: 'Emergency', number: '112', emoji: '🆘', color: 'bg-red-100 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/50' },
  { label: 'Police', number: '100', emoji: '🚔', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50' },
  { label: 'Ambulance', number: '108', emoji: '🚑', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' },
  { label: 'Fire', number: '101', emoji: '🚒', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/50' },
];

export default function EmergencyServices() {
  const { locationState, getCurrentLocation } = useGeoLocation(null);
  const [services, setServices] = useState<EmergencyService[]>([]);
  const [loadState, setLoadState] = useState<'idle' | 'locating' | 'fetching' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);

  const load = async () => {
    setLoadState('locating');
    setErrorMsg(null);
    try {
      const loc = await getCurrentLocation();
      setUserCoords({ lat: loc!.latitude, lon: loc!.longitude });
      setLoadState('fetching');
      const results = await fetchNearbyEmergencyServices(loc!.latitude, loc!.longitude, 5000);
      setServices(results);
      setLoadState('done');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load nearby services.';
      setErrorMsg(msg);
      setLoadState('error');
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'all' ? services : services.filter((s) => s.category === filter);

  return (
    <div className="min-h-dvh bg-[#F0F4FF] dark:bg-slate-950 transition-colors w-full overflow-x-hidden">
      <Header title="Nearby Emergency Services" showBack />

      <main className="px-3.5 sm:px-4 py-4 pb-24 max-w-lg mx-auto space-y-4 w-full">
        {/* Quick dial row */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {QUICK_DIAL.map(({ label, number, emoji, color }) => (
            <button
              key={number}
              onClick={() => openEmergencyCall(number)}
              className={`flex flex-col items-center justify-center gap-1 p-2 sm:p-2.5 rounded-2xl border text-center ${color} hover:opacity-80 transition-opacity active:scale-95 min-w-0 overflow-hidden`}
              aria-label={`Call ${label} at ${number}`}
            >
              <span className="text-lg sm:text-xl leading-none" aria-hidden="true">{emoji}</span>
              <span className="text-xs font-bold leading-tight">{number}</span>
              <span className="text-[9px] sm:text-[10px] opacity-80 truncate max-w-full leading-tight">{label}</span>
            </button>
          ))}
        </div>

        {/* Note about calls */}
        <p className="text-xs text-gray-400 text-center">
          Tapping a number opens your phone's dial pad. Actual call requires your confirmation.
        </p>

        {/* Section header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700">Services near you</h2>
          {loadState === 'done' && (
            <button
              onClick={load}
              className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
              aria-label="Refresh nearby services"
            >
              <RefreshCw size={12} aria-hidden="true" />
              Refresh
            </button>
          )}
        </div>

        {/* Filter tabs */}
        {loadState === 'done' && services.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1" role="tablist" aria-label="Filter emergency services">
            {FILTERS.map(({ label, value }) => (
              <button
                key={value}
                role="tab"
                aria-selected={filter === value}
                onClick={() => setFilter(value)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  filter === value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-900 transition-colors text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* States */}
        {(loadState === 'locating' || loadState === 'fetching') && (
          <div className="flex flex-col items-center gap-3 py-12" aria-live="polite">
            <Loader2 size={32} className="text-blue-500 animate-spin" aria-hidden="true" />
            <p className="text-sm text-gray-500">
              {loadState === 'locating' ? 'Getting your location…' : 'Finding nearby services…'}
            </p>
          </div>
        )}

        {loadState === 'error' && (
          <div
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl p-5 flex flex-col items-center gap-3 text-center"
            role="alert"
          >
            <AlertTriangle size={24} className="text-red-500" aria-hidden="true" />
            <p className="text-sm text-red-700 dark:text-red-300">{errorMsg}</p>
            <button
              onClick={load}
              className="text-sm font-semibold text-red-700 dark:text-red-300 underline underline-offset-2"
              aria-label="Retry loading nearby services"
            >
              Try again
            </button>
          </div>
        )}

        {loadState === 'done' && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-center" aria-live="polite">
            <MapPin size={32} className="text-gray-300" aria-hidden="true" />
            <p className="text-sm text-gray-500">
              {filter === 'all'
                ? 'No emergency services found within 5km.'
                : `No ${filter.replace('_', ' ')} services found nearby.`}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="text-sm text-blue-600 underline"
              >
                Show all categories
              </button>
            )}
          </div>
        )}

        {/* Services list */}
        <AnimatePresence mode="popLayout">
          {loadState === 'done' &&
            filtered.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                layout
              >
                <EmergencyServiceCard service={service} />
              </motion.div>
            ))}
        </AnimatePresence>

        {loadState === 'done' && filtered.length > 0 && (
          <p className="text-xs text-gray-400 text-center">
            Data from OpenStreetMap. Distance may vary. Verify before visiting.
          </p>
        )}
      </main>
    </div>
  );
}
