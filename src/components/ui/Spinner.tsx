import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  size?: SpinnerSize;
  color?: string;
  className?: string;
  label?: string;
}

const sizeMap: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-4',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'border-blue-600',
  className,
  label = 'Loading…',
}) => {
  return (
    <span
      role="status"
      aria-label={label}
      className={twMerge(
        clsx(
          'inline-block rounded-full border-transparent animate-spin',
          'border-t-current',
          sizeMap[size],
          color
        ),
        className
      )}
    />
  );
};

export const FullScreenSpinner: React.FC<{ label?: string }> = ({
  label = 'Loading…',
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F0F4FF]"
      role="status"
      aria-label={label}
      aria-live="polite"
    >
      <div className="relative flex items-center justify-center">
        {/* outer ring */}
        <span className="absolute inline-block w-20 h-20 rounded-full border-4 border-blue-100" />
        {/* spinning ring */}
        <span className="inline-block w-20 h-20 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
      </div>
      <p className="mt-6 text-sm font-medium text-gray-500">{label}</p>
    </div>
  );
};
