import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SOSCountdownOverlayProps {
  /** Initial countdown in seconds (e.g. 10) */
  seconds: number;
  onCancel: () => void;
  onComplete: () => void;
}

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const SOSCountdownOverlay: React.FC<SOSCountdownOverlayProps> = ({
  seconds: initialSeconds,
  onCancel,
  onComplete,
}) => {
  const [remaining, setRemaining] = useState(initialSeconds);
  const completedRef = useRef(false);

  // Countdown ticker
  useEffect(() => {
    if (remaining <= 0) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
      return;
    }

    const id = setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, onComplete]);

  const progress = remaining / initialSeconds; // 1→0 as time elapses
  const dashOffset = CIRCUMFERENCE * progress; // shrinks the stroke

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      role="dialog"
      aria-modal="true"
      aria-label={`SOS countdown: ${remaining} seconds remaining`}
      aria-live="assertive"
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center
        bg-red-600 px-6 py-10"
    >
      {/* Header */}
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="text-white font-black text-3xl tracking-widest mb-2"
      >
        SOS ALERT
      </motion.h2>
      <motion.p
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="text-red-100 text-base text-center mb-10 max-w-xs"
      >
        Emergency alert will be sent in…
      </motion.p>

      {/* Circular countdown */}
      <div className="relative flex items-center justify-center mb-10">
        <svg
          width="140"
          height="140"
          viewBox="0 0 140 140"
          aria-hidden="true"
          className="-rotate-90"
        >
          {/* Track */}
          <circle
            cx="70"
            cy="70"
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="10"
          />
          {/* Progress */}
          <circle
            cx="70"
            cy="70"
            r={RADIUS}
            fill="none"
            stroke="white"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE - dashOffset}
            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
          />
        </svg>

        {/* Number */}
        <AnimatePresence mode="popLayout">
          <motion.span
            key={remaining}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.3, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 22 }}
            className="absolute text-white font-black text-5xl tabular-nums"
            aria-hidden="true"
          >
            {remaining}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Cancel button */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onCancel}
        aria-label="Cancel SOS emergency alert"
        className="min-h-[56px] w-full max-w-xs px-8
          flex items-center justify-center
          rounded-2xl border-2 border-white/60 bg-white/10
          text-white font-bold text-lg
          hover:bg-white/20 active:bg-white/30
          transition-colors duration-150
          focus:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2
          focus-visible:ring-offset-red-600"
      >
        Cancel
      </motion.button>

      <p className="text-red-200 text-xs mt-4 text-center">
        Tap Cancel to abort the alert
      </p>
    </motion.div>
  );
};
