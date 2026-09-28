import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'danger' | 'ghost' | 'outline' | 'success';
type Size = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus-visible:ring-blue-500 shadow-sm shadow-blue-200 disabled:bg-blue-300',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500 shadow-sm shadow-red-200 disabled:bg-red-300',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-gray-400 disabled:text-gray-300',
  outline:
    'bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50 active:bg-blue-100 focus-visible:ring-blue-500 disabled:border-blue-200 disabled:text-blue-200',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus-visible:ring-emerald-500 shadow-sm shadow-emerald-200 disabled:bg-emerald-300',
};

const sizeClasses: Record<Size, string> = {
  sm: 'min-h-[36px] px-3 py-1.5 text-sm gap-1.5',
  md: 'min-h-[48px] px-4 py-2.5 text-base gap-2',
  lg: 'min-h-[56px] px-6 py-3 text-lg gap-2',
  xl: 'min-h-[64px] px-8 py-4 text-xl gap-2.5',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      className,
      children,
      onClick,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        onClick={isDisabled ? undefined : onClick}
        className={twMerge(
          clsx(
            // base
            'inline-flex items-center justify-center font-semibold rounded-xl',
            'transition-all duration-150 ease-in-out',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            'active:scale-95 select-none cursor-pointer',
            'disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100',
            variantClasses[variant],
            sizeClasses[size],
            fullWidth && 'w-full',
            className
          )
        )}
        {...rest}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin shrink-0" size={size === 'sm' ? 14 : size === 'xl' ? 22 : 18} />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
