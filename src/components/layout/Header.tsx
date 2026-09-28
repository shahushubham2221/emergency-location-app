import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  rightAction,
  className,
}) => {
  const navigate = useNavigate();

  return (
    <header
      className={twMerge(
        'sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 transition-colors backdrop-blur-md border-b border-gray-100 dark:border-slate-800',
        'shadow-[0_1px_8px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_8px_rgba(0,0,0,0.3)]',
        className
      )}
    >
      <div className="flex items-center min-h-[56px] px-4 gap-2 max-w-lg mx-auto">
        {/* Back button */}
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="min-h-[40px] min-w-[40px] -ml-1 flex items-center justify-center
              rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 active:bg-gray-200 dark:active:bg-slate-700 active:scale-95
              transition-all duration-150 focus:outline-none focus-visible:ring-2
              focus-visible:ring-blue-500 shrink-0"
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
        ) : (
          <span className="w-0" />
        )}

        {/* Title */}
        <h1 className="flex-1 text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
          {title}
        </h1>

        {/* Right action slot */}
        {rightAction ? (
          <div className="shrink-0">{rightAction}</div>
        ) : (
          <span className="w-10" />
        )}
      </div>
    </header>
  );
};
