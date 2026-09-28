import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  warning: 'bg-amber-100 text-amber-700 border border-amber-200',
  danger:  'bg-red-100 text-red-700 border border-red-200',
  info:    'bg-blue-100 text-blue-700 border border-blue-200',
  neutral: 'bg-gray-100 text-gray-600 border border-gray-200',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, className }) => {
  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap',
          variantClasses[variant]
        ),
        className
      )}
    >
      {children}
    </span>
  );
};
