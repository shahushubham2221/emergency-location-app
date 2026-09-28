import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Home, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { useSOSStore } from '../../store/sos.store';
import { formatTimestamp, formatDuration, formatAccuracy } from '../../utils/formatters';

export default function SOSCompleted() {
  const navigate = useNavigate();
  const { session, lastKnownLocation, alertResults, reset } = useSOSStore();

  const duration = session?.startedAt
    ? Math.floor((Date.now() - session.startedAt) / 1000)
    : null;

  const alertsOpened = alertResults.filter((r) => r.status === 'composer_opened').length;

  function handleGoHome() {
    reset();
    navigate('/app/home', { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#F0F4FF] dark:bg-slate-950 transition-colors flex flex-col items-center justify-center px-5 py-10">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="flex flex-col items-center text-center max-w-sm w-full"
      >
        {/* Success icon */}
        <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
          <CheckCircle size={48} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-2">SOS Ended</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
          Your emergency session has been completed. Stay safe.
        </p>

        {/* Session summary card */}
        <div className="w-full bg-white dark:bg-slate-900 transition-colors rounded-2xl shadow-sm border border-white/60 dark:border-slate-800 p-5 mb-6 text-left space-y-4">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-slate-800 pb-2">
            Session Summary
          </p>

          {session?.startedAt && (
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-gray-400 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs text-gray-400">Started</p>
                <p className="text-sm font-medium text-gray-800">
                  {formatTimestamp(session.startedAt)}
                </p>
              </div>
            </div>
          )}

          {duration !== null && (
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-gray-400 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs text-gray-400">Duration</p>
                <p className="text-sm font-medium text-gray-800">{formatDuration(duration)}</p>
              </div>
            </div>
          )}

          {lastKnownLocation && (
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-xs text-gray-400">Last Known Location</p>
                <p className="text-sm font-mono text-gray-800">
                  {lastKnownLocation.latitude.toFixed(5)},{' '}
                  {lastKnownLocation.longitude.toFixed(5)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatAccuracy(lastKnownLocation.accuracy)}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${lastKnownLocation.latitude},${lastKnownLocation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-xs hover:underline"
                  aria-label="View last location in Google Maps"
                >
                  View on map
                </a>
              </div>
            </div>
          )}

          {/* Alert status */}
          <div className="flex items-start gap-3">
            <CheckCircle size={16} className={`shrink-0 mt-0.5 ${alertsOpened > 0 ? 'text-emerald-500' : 'text-amber-400'}`} aria-hidden="true" />
            <div>
              <p className="text-xs text-gray-400">Contacts Notified</p>
              {alertsOpened > 0 ? (
                <p className="text-sm font-medium text-emerald-700">
                  SMS composer opened for {alertsOpened} contact{alertsOpened > 1 ? 's' : ''}
                </p>
              ) : (
                <div className="flex items-center gap-1">
                  <AlertTriangle size={12} className="text-amber-500" aria-hidden="true" />
                  <p className="text-sm font-medium text-amber-700">
                    Alerts not confirmed — check contacts manually
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-0.5">
                Note: SMS delivery depends on your device and carrier.
              </p>
            </div>
          </div>

          {/* Sync status */}
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 shrink-0 flex items-center justify-center">
              <div className={`w-2 h-2 rounded-full ${session?.syncCompleted ? 'bg-emerald-500' : 'bg-amber-400'}`} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Data Sync</p>
              <p className="text-sm font-medium text-gray-800">
                {session?.syncCompleted ? 'Synchronized' : 'Will sync when online'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={handleGoHome}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl min-h-[56px] hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 active:scale-95"
            aria-label="Return to home screen"
          >
            <Home size={20} aria-hidden="true" />
            Go Home
          </button>
          <button
            onClick={() => { reset(); navigate('/app/history', { replace: true }); }}
            className="w-full py-4 bg-white dark:bg-slate-900 transition-colors border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl min-h-[56px] hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            aria-label="View SOS history"
          >
            View History
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center">
          If this was a real emergency and you need further assistance, please call{' '}
          <a href="tel:112" className="text-blue-600 font-semibold">
            112
          </a>
          .
        </p>
      </motion.div>
    </div>
  );
}
