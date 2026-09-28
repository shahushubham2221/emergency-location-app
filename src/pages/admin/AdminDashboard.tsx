import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { getAllActiveSessions } from '../../services/sos.service';
import { formatRelativeTime } from '../../utils/formatters';
import type { SOSSession } from '../../types/sos';

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  link?: string;
}

export default function AdminDashboard() {
  const [activeSessions, setActiveSessions] = useState<SOSSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [firebaseStatus, setFirebaseStatus] = useState<'connected' | 'error' | 'loading'>('loading');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = async () => {
    setLoading(true);
    try {
      const sessions = await getAllActiveSessions();
      setActiveSessions(sessions);
      setFirebaseStatus('connected');
    } catch (err) {
      console.error('[AdminDashboard] Failed to fetch sessions:', err);
      setFirebaseStatus('error');
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statCards: StatCard[] = [
    {
      label: 'Active SOS',
      value: loading ? '…' : activeSessions.length,
      icon: <AlertTriangle className="w-5 h-5" aria-hidden="true" />,
      color: activeSessions.length > 0 ? 'text-red-400 bg-red-400/10' : 'text-slate-400 bg-slate-700',
      link: '/admin/active',
    },
    {
      label: 'Total Users',
      value: 'N/A',
      icon: <Users className="w-5 h-5" aria-hidden="true" />,
      color: 'text-blue-400 bg-blue-400/10',
      link: '/admin/users',
    },
    {
      label: 'System Status',
      value:
        firebaseStatus === 'loading'
          ? 'Checking…'
          : firebaseStatus === 'connected'
          ? 'Firebase Connected'
          : 'Firebase Error',
      icon:
        firebaseStatus === 'connected' ? (
          <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
        ) : (
          <XCircle className="w-5 h-5" aria-hidden="true" />
        ),
      color:
        firebaseStatus === 'connected'
          ? 'text-emerald-400 bg-emerald-400/10'
          : firebaseStatus === 'error'
          ? 'text-red-400 bg-red-400/10'
          : 'text-slate-400 bg-slate-700',
    },
    {
      label: 'Last Refresh',
      value: formatRelativeTime(lastRefresh.getTime()),
      icon: <Clock className="w-5 h-5" aria-hidden="true" />,
      color: 'text-purple-400 bg-purple-400/10',
    },
  ];

  const quickLinks = [
    { to: '/admin/active', label: 'Active Emergencies', desc: 'Real-time map of active SOS sessions', icon: <AlertTriangle className="w-4 h-4 text-red-400" aria-hidden="true" /> },
    { to: '/admin/users', label: 'User Management', desc: 'Manage user accounts (requires Admin SDK)', icon: <Users className="w-4 h-4 text-blue-400" aria-hidden="true" /> },
    { to: '/admin/services', label: 'Emergency Services', desc: 'Curate the emergency services database', icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden="true" /> },
    { to: '/admin/audit', label: 'Audit Logs', desc: 'View admin action history', icon: <Clock className="w-4 h-4 text-purple-400" aria-hidden="true" /> },
  ];

  return (
    <div className="p-8 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">SOS Guardian — Admin Overview</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-sm font-medium transition"
          aria-label="Refresh dashboard data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-slate-800 border border-slate-700 rounded-xl p-5"
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${card.color} mb-3`}>
              {card.icon}
            </div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{card.label}</p>
            <p className="text-white text-xl font-bold mt-1 leading-tight">{card.value}</p>
            {card.link && (
              <Link
                to={card.link}
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs mt-2 transition"
                aria-label={`View ${card.label}`}
              >
                View details <ChevronRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Active SOS Sessions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Active SOS Sessions</h2>
            <Link
              to="/admin/active"
              className="text-blue-400 hover:text-blue-300 text-sm transition"
              aria-label="View all active emergencies"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 bg-slate-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : activeSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" aria-hidden="true" />
              <p className="text-slate-300 font-medium">No active emergencies</p>
              <p className="text-slate-500 text-sm mt-1">All clear — no ongoing SOS sessions.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeSessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between bg-slate-700/50 rounded-lg px-4 py-3 border border-red-500/20"
                >
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{session.userId}</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Started {formatRelativeTime(session.startedAt)}
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-red-400 font-medium bg-red-400/10 px-2.5 py-1 rounded-full shrink-0 ml-3">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" aria-hidden="true" />
                    ACTIVE
                  </span>
                </div>
              ))}
              {activeSessions.length > 5 && (
                <p className="text-slate-400 text-xs text-center pt-1">
                  +{activeSessions.length - 5} more
                </p>
              )}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Quick Links</h2>
          <nav className="space-y-2" aria-label="Admin quick links">
            {quickLinks.map(({ to, label, desc, icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-700 transition group"
                aria-label={label}
              >
                <div className="mt-0.5">{icon}</div>
                <div className="min-w-0">
                  <p className="text-slate-200 text-sm font-medium group-hover:text-white transition">{label}</p>
                  <p className="text-slate-500 text-xs mt-0.5 leading-snug">{desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition ml-auto mt-0.5 shrink-0" aria-hidden="true" />
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
