import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  ClipboardList,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: Date;
  admin: string;
  action: string;
  target: string;
  details: string;
}

const PAGE_SIZE = 100;

function exportToCsv(logs: AuditLog[]) {
  const headers = ['Timestamp', 'Admin', 'Action', 'Target', 'Details'];
  const rows = logs.map((log) => [
    log.timestamp.toISOString(),
    log.admin,
    log.action,
    log.target,
    log.details,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, 'auditLogs'),
        orderBy('timestamp', 'desc'),
        limit(PAGE_SIZE)
      );
      const snap = await getDocs(q);
      const data: AuditLog[] = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          timestamp:
            d.timestamp?.toDate?.() instanceof Date
              ? d.timestamp.toDate()
              : new Date(d.timestamp ?? Date.now()),
          admin: d.admin ?? '—',
          action: d.action ?? '—',
          target: d.target ?? '—',
          details: d.details ?? '',
        };
      });
      setLogs(data);
    } catch (err) {
      console.error('[AuditLogs] Error:', err);
      setError(
        'Failed to load audit logs. Ensure your account has admin privileges and the auditLogs collection exists.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatTimestamp = (d: Date) =>
    d.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  return (
    <div className="p-8 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-purple-400" aria-hidden="true" />
            Audit Logs
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Admin action history (latest {PAGE_SIZE} entries)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-sm font-medium transition"
            aria-label="Refresh audit logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Refresh
          </button>

          <button
            onClick={() => exportToCsv(logs)}
            disabled={logs.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-sm font-medium transition"
            aria-label="Export audit logs to CSV file"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 bg-red-900/40 border border-red-700 text-red-300 rounded-xl px-4 py-3 mb-6 text-sm"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Table / States */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div
              className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
              role="status"
              aria-label="Loading audit logs"
            />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CheckCircle2 className="w-10 h-10 text-slate-600 mb-3" aria-hidden="true" />
            <p className="text-slate-300 font-medium">No audit logs found</p>
            <p className="text-slate-500 text-sm mt-1">
              Logs are written by server-side Cloud Functions when admins perform actions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table" aria-label="Audit logs table">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50">
                  <th
                    scope="col"
                    className="text-left text-slate-400 font-medium px-4 py-3 whitespace-nowrap"
                  >
                    Timestamp
                  </th>
                  <th
                    scope="col"
                    className="text-left text-slate-400 font-medium px-4 py-3 whitespace-nowrap"
                  >
                    Admin
                  </th>
                  <th
                    scope="col"
                    className="text-left text-slate-400 font-medium px-4 py-3 whitespace-nowrap"
                  >
                    Action
                  </th>
                  <th
                    scope="col"
                    className="text-left text-slate-400 font-medium px-4 py-3 whitespace-nowrap"
                  >
                    Target
                  </th>
                  <th
                    scope="col"
                    className="text-left text-slate-400 font-medium px-4 py-3"
                  >
                    Details
                  </th>
                </tr>
              </thead>
              <tbody role="rowgroup">
                {logs.map((log, i) => (
                  <tr
                    key={log.id}
                    className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition ${
                      i % 2 === 0 ? '' : 'bg-slate-800/50'
                    }`}
                  >
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap font-mono text-xs">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-slate-200 whitespace-nowrap max-w-[180px] truncate">
                      {log.admin}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-purple-400/10 text-purple-300 text-xs font-medium px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs whitespace-nowrap max-w-[160px] truncate">
                      {log.target}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs max-w-[300px]">
                      {log.details || <span className="text-slate-600 italic">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && logs.length > 0 && (
        <p className="text-slate-500 text-xs mt-3 text-right">
          Showing {logs.length} of up to {PAGE_SIZE} most recent entries
        </p>
      )}
    </div>
  );
}
