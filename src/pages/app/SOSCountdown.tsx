import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { createSOSSession } from '../../services/sos.service';
import type { SOSSession } from '../../types/sos';

// ─── SOS Countdown Overlay ────────────────────────────────────────────────────

export default function SOSCountdown() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { isOnline } = useNetworkStatus();

  const countdownSeconds = profile?.emergencyPreferences?.sosCountdownSeconds ?? 5;
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);
  const [phase, setPhase] = useState<'countdown' | 'activating' | 'error'>('countdown');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionCreatedRef = useRef(false);

  // ── Activation ──
  const activateSOS = useCallback(async () => {
    if (sessionCreatedRef.current || !user) return;
    sessionCreatedRef.current = true;
    setPhase('activating');

    try {
      const session: SOSSession = await createSOSSession(user.uid, isOnline);
      navigate('/app/sos-active', { replace: true, state: { session } });
    } catch (err) {
      sessionCreatedRef.current = false;
      setErrorMsg(err instanceof Error ? err.message : 'Failed to start SOS. Please try again.');
      setPhase('error');
    }
  }, [user, isOnline, navigate]);

  // ── Countdown ticker ──
  useEffect(() => {
    if (cancelled || phase !== 'countdown') return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [cancelled, phase]);

  // ── When countdown hits 0 ──
  useEffect(() => {
    if (secondsLeft === 0 && phase === 'countdown') {
      activateSOS();
    }
  }, [secondsLeft, phase, activateSOS]);

  // ── Cancel ──
  function handleCancel() {
    clearInterval(intervalRef.current!);
    setCancelled(true);
    navigate('/app/home', {
      replace: true,
      state: { toast: { type: 'info', message: 'SOS cancelled.' } },
    });
  }

  // ── Progress ring ──
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const progress = (countdownSeconds - secondsLeft) / countdownSeconds;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div
      className="fixed inset-0 z-50 bg-red-600 flex flex-col items-center justify-center px-6"
      role="alertdialog"
      aria-modal="true"
      aria-label="SOS countdown in progress"
      aria-live="assertive"
    >
      {/* Background pulse */}
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 1.2 }}
        className="absolute inset-0 bg-red-500/40 rounded-full"
        style={{ width: '100%', height: '100%' }}
        aria-hidden="true"
      />

      <AnimatePresence mode="wait">
        {phase === 'countdown' && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative z-10 flex flex-col items-center text-center"
          >
            {/* Ring + number */}
            <div className="relative mb-8" aria-hidden="true">
              <svg width="180" height="180" className="-rotate-90">
                {/* Track */}
                <circle
                  cx="90" cy="90" r={radius}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress */}
                <circle
                  cx="90" cy="90" r={radius}
                  stroke="white"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <span
                className="absolute inset-0 flex items-center justify-center text-white font-extrabold text-7xl"
                aria-label={`${secondsLeft} seconds remaining`}
              >
                {secondsLeft}
              </span>
            </div>

            <Shield className="text-white/80 mb-3" size={32} aria-hidden="true" />
            <h1 className="text-white font-extrabold text-3xl mb-2">SOS Activating</h1>
            <p className="text-red-100 text-base mb-10">
              Your contacts will be alerted in <strong className="text-white">{secondsLeft}</strong> second{secondsLeft !== 1 ? 's' : ''}.
            </p>

            {/* Cancel button */}
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 bg-white text-red-700 font-bold text-base px-8 py-4 rounded-2xl shadow-lg min-h-[56px] hover:bg-red-50 transition-colors active:scale-95"
              aria-label="Cancel SOS activation"
            >
              <X size={20} aria-hidden="true" />
              Cancel SOS
            </button>
            <p className="text-red-200 text-xs mt-4">
              Tap cancel to abort — no alerts will be sent.
            </p>
          </motion.div>
        )}

        {phase === 'activating' && (
          <motion.div
            key="activating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 flex flex-col items-center text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-20 h-20 rounded-full border-4 border-white/30 border-t-white mb-6"
              aria-hidden="true"
            />
            <h1 className="text-white font-extrabold text-2xl mb-2">Starting SOS…</h1>
            <p className="text-red-100 text-sm">Setting up your emergency session.</p>
          </motion.div>
        )}

        {phase === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 flex flex-col items-center text-center max-w-xs"
          >
            <AlertTriangle className="text-white mb-4" size={48} aria-hidden="true" />
            <h1 className="text-white font-extrabold text-2xl mb-3">Something went wrong</h1>
            <p className="text-red-100 text-sm mb-8">{errorMsg}</p>
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => {
                  sessionCreatedRef.current = false;
                  setPhase('countdown');
                  setSecondsLeft(countdownSeconds);
                  setErrorMsg(null);
                }}
                className="bg-white text-red-700 font-bold py-4 rounded-2xl min-h-[52px] hover:bg-red-50 transition-colors"
                aria-label="Retry starting SOS"
              >
                Retry
              </button>
              <button
                onClick={handleCancel}
                className="bg-white/20 text-white font-semibold py-4 rounded-2xl min-h-[52px]"
                aria-label="Go back to home"
              >
                Go Home
              </button>
            </div>
            <p className="text-red-200 text-xs mt-4">
              In a real emergency, call <strong className="text-white">112</strong> immediately.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
