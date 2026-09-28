import React from 'react';
import { motion } from 'framer-motion';

export const SOSButton: React.FC<{
  onPress: () => void;
  disabled?: boolean;
}> = ({ onPress, disabled = false }) => {
  return (
    <div className="flex flex-col items-center gap-4 select-none">
      {/* Pulsing ring container */}
      <div className="relative flex items-center justify-center w-44 h-44">
        {/* Outer pulse rings — only when idle (not disabled) */}
        {!disabled && (
          <>
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-red-400/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"
              style={{ animationDelay: '0s' }}
            />
            <span
              aria-hidden="true"
              className="absolute inset-3 rounded-full bg-red-400/25 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"
              style={{ animationDelay: '0.4s' }}
            />
          </>
        )}

        {/* Button */}
        <motion.button
          whileTap={disabled ? {} : { scale: 0.93 }}
          whileHover={disabled ? {} : { scale: 1.04 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          onClick={disabled ? undefined : onPress}
          disabled={disabled}
          aria-label="Press to activate SOS emergency alert"
          aria-disabled={disabled}
          className={[
            'relative z-10 w-36 h-36 rounded-full',
            'flex flex-col items-center justify-center gap-1',
            'shadow-[0_8px_32px_rgba(220,38,38,0.45)]',
            'focus:outline-none focus-visible:ring-4 focus-visible:ring-red-400 focus-visible:ring-offset-4',
            'transition-opacity duration-200',
            disabled
              ? 'bg-red-300 cursor-not-allowed opacity-70 shadow-none'
              : 'bg-red-600 hover:bg-red-700 cursor-pointer',
          ].join(' ')}
        >
          {/* SOS text */}
          <span
            aria-hidden="true"
            className="text-white font-black text-3xl tracking-widest leading-none"
          >
            SOS
          </span>
          {/* Shield icon as simple SVG */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white/80"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </motion.button>
      </div>

      {/* Sub-label */}
      <p className="text-sm text-gray-500 font-medium tracking-wide">
        {disabled ? 'SOS Active' : 'Press for help'}
      </p>
    </div>
  );
};
