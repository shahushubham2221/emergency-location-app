import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

type ModalSize = 'sm' | 'md' | 'lg';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: ModalSize;
  closable?: boolean;
}

const maxWidthMap: Record<ModalSize, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const unifiedModalVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring' as const, damping: 28, stiffness: 320 } 
  },
  exit: { 
    opacity: 0, 
    y: 20, 
    scale: 0.95,
    transition: { duration: 0.2 } 
  },
};

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  size = 'md',
  closable = true,
}) => {
  const closeButtonRef = useRef<any>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Focus management
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement;
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    } else {
      previouslyFocused.current?.focus();
    }
  }, [open]);

  // Trap focus inside modal
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && closable) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={closable ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Unified Modal Container */}
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none p-0 sm:p-4">
            <motion.div
              key="modal-content"
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'modal-title' : undefined}
              variants={unifiedModalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onKeyDown={handleKeyDown}
              className={twMerge(
                clsx(
                  'relative w-full bg-white dark:bg-slate-900 shadow-2xl pointer-events-auto',
                  'overflow-y-auto max-h-[92dvh] sm:max-h-[90vh]',
                  'rounded-t-3xl sm:rounded-2xl pb-safe sm:pb-0',
                  maxWidthMap[size]
                )
              )}
            >
              {/* drag handle (mobile only) */}
              <div className="flex sm:hidden justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-slate-700" aria-hidden="true" />
              </div>
              
              <div className="p-5">
                {(title || closable) && (
                  <div className="flex items-center justify-between mb-4">
                    {title ? (
                      <h2 id="modal-title" className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {title}
                      </h2>
                    ) : (
                      <span />
                    )}
                    {closable && (
                      <button
                        ref={closeButtonRef}
                        onClick={onClose}
                        aria-label="Close dialog"
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400
                          hover:bg-gray-100 dark:hover:bg-slate-800 active:bg-gray-200 dark:active:bg-slate-700 dark:bg-slate-700 transition-colors focus:outline-none
                          focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <X size={20} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )}
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
