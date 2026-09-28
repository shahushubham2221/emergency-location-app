import { useEffect, useState, useRef } from 'react';
import {
  AlertTriangle,
  MapPin,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { getAllActiveSessions } from '../../services/sos.service';
import { formatRelativeTime, formatDuration } from '../../utils/formatters';
import type { SOSSession } from '../../types/sos';

// Dynamic import for MapView to avoid SSR issues
import { MapView } from '../../components/location/MapView';

const REFRESH_INTERVAL_MS = 30_000;

export default function ActiveEmergencies() {
  const [sessions, setSessions] = useState<SOSSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_MS / 1000);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllActiveSessions();
      setSessions(data);
      setLastRefresh(new Date());
      setCountdown(REFRESH_INTERVAL_MS / 1000);
    } catch (err) {
      console.error('[ActiveEmergencies] Failed:', err);
      setError('Failed to load sessions. Check Firestore permissions.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 30 s
  useEffect(() => {
    fetchSessions();

    intervalRef.current = setInterval(fetchSessions, REFRESH_INTERVAL_MS);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => (c <= 1 ? REFRESH_INTERVAL_MS / 1000 : c - 1));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Build map markers from latest location of each session
  const mapMarkers = sessions
    .filter((s) => s.lastLocation)
    .map((s) => ({
      id: s.id,
      lat: s.lastLocation!.latitude,
      lon: s.lastLocation!.longitude,
      label: `SOS — ${s.userId.slice(0, 8)}…`,
      accuracy: s.lastLocation!.accuracy,
    }));

  const getDuration = (session: SOSSession) => {
    const start = session.startedAt;
    return formatDuration(Math.floor((Date.now() - start) / 1000));
  };

  return (
    <div className="p-8 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" aria-hidden="true" />
            Active Emergencies
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Auto-refreshes every 30 s · Last updated {formatRelativeTime(lastRefresh)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500 text-sm" aria-live="polite" aria-atomic="true">
            Next refresh in <span className="text-slate-300 font-medium">{countdown}s</span>
          </span>
          <button
            onClick={fetchSessions}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-sm font-medium transition"
            aria-label="Refresh emergency data now"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-red-900/40 border border-red-700 text-red-300 rounded-xl px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Map */}
      {mapMarkers.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden mb-6" style={{ height: '360px' }}>
          <MapView
            center={[20.5937, 78.9629]}
              zoom={4}
              markers={mapMarkers}
            className="w-full h-full"
          />
        </div>
      )}

      {/* Session List */}
      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 bg-slate-800 border border-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl flex flex-col items-center justify-center py-16 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-4" aria-hidden="true" />
          <h2 className="text-white font-semibold text-lg">No active emergencies</h2>
          <p className="text-slate-400 text-sm mt-1">All systems clear — no ongoing SOS sessions detected.</p>
        </div>
      ) : (
        <div className="space-y-4" role="list" aria-label="Active emergency sessions">
          {sessions.map((session) => {
            const isOnline =
              session.lastLocation &&
              session.updatedAt &&
              Date.now() -
                (session.updatedAt
                ) <
                120_000;

            return (
              <article
                key={session.id}
                role="listitem"
                className="bg-slate-800 border border-red-500/30 rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  {/* User / Session Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" aria-hidden="true" />
                      <span className="text-red-400 text-xs font-semibold uppercase tracking-wide">Active SOS</span>
                    </div>
                    <p className="text-white font-semibold text-sm break-all">
                      User: <code className="text-slate-300 font-mono">{session.userId}</code>
                    </p>
                    <p className="text-xs text-slate-400 break-all mt-0.5">
                      Session: <code className="font-mono">{session.id}</code>
                    </p>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <span
                      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                        isOnline
                          ? 'bg-emerald-400/10 text-emerald-400'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                      aria-label={isOnline ? 'Device online' : 'Device offline'}
                    >
                      {isOnline ? (
                        <Wifi className="w-3 h-3" aria-hidden="true" />
                      ) : (
                        <WifiOff className="w-3 h-3" aria-hidden="true" />
                      )}
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                    {session.alertsSent && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-400">
                        Alert sent
                      </span>
                    )}
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  <div className="bg-slate-700/50 rounded-lg px-3 py-2">
                    <p className="text-slate-400 text-xs mb-0.5">Duration</p>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      <span className="text-white text-sm font-medium">{getDuration(session)}</span>
                    </div>
                  </div>

                  {session.lastLocation ? (
                    <div className="bg-slate-700/50 rounded-lg px-3 py-2 sm:col-span-2">
                      <p className="text-slate-400 text-xs mb-0.5">Last Location</p>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                        <span className="text-white text-sm font-medium font-mono">
                          {session.lastLocation.latitude.toFixed(5)},{' '}
                          {session.lastLocation.longitude.toFixed(5)}
                        </span>
                        <span className="text-slate-500 text-xs ml-1">
                          ±{Math.round(session.lastLocation.accuracy ?? 0)}m
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-700/50 rounded-lg px-3 py-2 sm:col-span-2">
                      <p className="text-slate-400 text-xs mb-0.5">Last Location</p>
                      <p className="text-slate-500 text-sm">No location data yet</p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
