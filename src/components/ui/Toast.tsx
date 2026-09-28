import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useAppStore } from '../../store/app.store';
import type { Toast as ToastType } from '../../store/app.store';

// ─── Per-type styling ────────────────────────────────────────────────────────

const toastConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-emerald-50 border-emerald-200',
    iconColor: 'text-emerald-600',
    titleColor: 'text-emerald-800',
    messageColor: 'text-emerald-700',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-50 border-red-200',
    iconColor: 'text-red-600',
    titleColor: 'text-red-800',
    messageColor: 'text-red-700',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-800',
    messageColor: 'text-blue-700',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-800',
    messageColor: 'text-amber-700',
  },
} as const;

// ─── Single toast item ───────────────────────────────────────────────────────

interface ToastItemProps {
  toast: ToastType;
}

const TOAST_DURATION = 4500; // ms

const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
  const removeToast = useAppStore((s) => s.removeToast);
  const { icon: Icon, bg, iconColor, titleColor, messageColor } = toastConfig[toast.type];

  // Auto-dismiss
  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', damping: 24, stiffness: 280 }}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`flex items-start gap-3 w-full max-w-sm rounded-2xl border p-4 shadow-lg ${bg}`}
    >
      <Icon
        size={20}
        className={`shrink-0 mt-0.5 ${iconColor}`}
        aria-hidden="true"
      />

      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={`text-sm font-semibold leading-snug ${titleColor}`}>
            {toast.title}
          </p>
        )}
        {toast.message && (
          <p className={`text-xs mt-0.5 leading-relaxed ${messageColor}`}>
            {toast.message}
          </p>
        )}
      </div>

      <button
        onClick={() => removeToast(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 min-h-[28px] min-w-[28px] flex items-center justify-center rounded-lg
          text-gray-400 hover:text-gray-600 hover:bg-white/60 active:scale-95
          transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </motion.div>
  );
};

// ─── Toast container ─────────────────────────────────────────────────────────

export const ToastContainer: React.FC = () => {
  const toasts = useAppStore((s) => s.toasts);

  return (
    <div
      aria-label="Notifications"
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
