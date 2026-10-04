import React, { useEffect, useState } from 'react';
import { Header } from '../../components/layout/Header';
import { useAuth } from '../../hooks/useAuth';
import { getUserSOSHistory } from '../../services/sos.service';
import type { SOSSession } from '../../types/sos';
import { formatTimestamp, formatDuration } from '../../utils/formatters';
import { Loader2, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export default function SOSHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<SOSSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      if (!user) return;
      try {
        const data = await getUserSOSHistory(user.uid, 20);
        if (isMounted) {
          setHistory(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("History fetch error:", err);
          setError(err.message || 'Failed to load history.');
          setLoading(false);
        }
      }
    }

    loadHistory();

    const timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        setError('Loading is taking too long. Firestore might be missing an index or permissions.');
        setLoading(false);
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [user, loading]);

  const getStatusBadge = (status: SOSSession['status']) => {
    switch (status) {
      case 'completed': return <Badge variant="success">Completed</Badge>;
      case 'cancelled': return <Badge variant="neutral">Cancelled</Badge>;
      case 'interrupted': return <Badge variant="warning">Interrupted</Badge>;
      case 'offline_pending': return <Badge variant="warning">Offline Pending</Badge>;
      case 'synced': return <Badge variant="success">Synced</Badge>;
      case 'active': return <Badge variant="danger">Active</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-dvh bg-[#F0F4FF] dark:bg-slate-950 transition-colors w-full overflow-x-hidden">
      <Header title="Emergency History" showBack />
      
      <main className="px-3.5 sm:px-4 py-4 pb-24 max-w-lg mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={32} className="text-blue-500 animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Fetching history...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl flex items-start gap-3 border border-red-100 dark:border-red-800/50">
            <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-semibold text-red-800">Error loading data</p>
              <p className="text-sm text-red-600 mt-1 break-all">{error.split(/(https:\/\/[^\s]+)/).map((part, i) => part.startsWith("https://") ? <a key={i} href={part} target="_blank" rel="noreferrer" className="underline font-bold text-red-800 hover:text-red-900">{part}</a> : part)}</p>
            </div>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 transition-colors rounded-3xl shadow-sm border border-white/60 dark:border-slate-800 p-8 text-center mt-4">
            <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">No emergency history</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">You haven't activated SOS yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((session) => (
              <div key={session.id} className="bg-white dark:bg-slate-900 transition-colors rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatTimestamp(session.startedAt)}</p>
                    {session.duration !== undefined && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Duration: {formatDuration(session.duration)}</p>
                    )}
                  </div>
                  {getStatusBadge(session.status)}
                </div>
                
                {session.lastLocation && (
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 p-2 rounded-lg flex items-center justify-between border border-gray-100 dark:border-slate-700">
                    <span className="font-medium">Last Location</span>
                    <span className="font-mono text-gray-500 dark:text-gray-400">
                      {typeof session.lastLocation.latitude === 'number' ? session.lastLocation.latitude.toFixed(4) : '?'}
                      ,{' '}
                      {typeof session.lastLocation.longitude === 'number' ? session.lastLocation.longitude.toFixed(4) : '?'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
