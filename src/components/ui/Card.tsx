import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, glass = false, onClick }) => {
  const isInteractive = typeof onClick === 'function';

  const baseClasses = clsx(
    'rounded-2xl border border-white/60 dark:border-slate-800 p-4',
    glass
      ? 'bg-white/70 dark:bg-slate-900/70 transition-colors backdrop-blur-md shadow-md'
      : 'bg-white/80 dark:bg-slate-900/80 transition-colors shadow-sm',
    isInteractive && [
      'cursor-pointer select-none',
      'transition-transform duration-150 ease-in-out',
      'hover:-translate-y-0.5 hover:shadow-md',
      'active:scale-[0.98]',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
    ]
  );

  if (isInteractive) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
        className={twMerge(baseClasses, className)}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={twMerge(baseClasses, className)}>
      {children}
    </div>
  );
};
