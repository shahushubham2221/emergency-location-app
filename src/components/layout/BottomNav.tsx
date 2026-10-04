import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, MapPin, Clock, User } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home',     to: '/app/home',     Icon: Home },
  { label: 'Contacts', to: '/app/contacts',  Icon: Users },
  { label: 'Map',      to: '/app/map',       Icon: MapPin },
  { label: 'History',  to: '/app/history',   Icon: Clock },
  { label: 'Profile',  to: '/app/profile',   Icon: User },
] as const;

export const BottomNav: React.FC = () => {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-30 w-full max-w-full
        bg-white/95 dark:bg-slate-900/95 backdrop-blur-md 
        border-t border-gray-100 dark:border-slate-800
        shadow-[0_-1px_12px_rgba(0,0,0,0.06)] dark:shadow-none
        transition-colors"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <ul
        className="flex items-stretch justify-around w-full max-w-lg mx-auto px-0.5 sm:px-1"
        role="list"
      >
        {NAV_ITEMS.map(({ label, to, Icon }) => (
          <li key={to} className="flex-1 min-w-0">
            <NavLink
              to={to}
              aria-label={label}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center justify-center gap-0.5 sm:gap-1',
                  'min-h-[52px] sm:min-h-[56px] py-1.5 sm:py-2 px-0.5 sm:px-1 w-full',
                  'text-[10px] sm:text-xs font-medium transition-colors duration-150',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset',
                  'relative select-none',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 active:text-gray-700',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-7 sm:w-8 h-0.5 rounded-b-full bg-blue-600 dark:bg-blue-400"
                    />
                  )}
                  <Icon
                    size={20}
                    className="sm:w-[22px] sm:h-[22px] shrink-0"
                    aria-hidden="true"
                    strokeWidth={isActive ? 2.2 : 1.7}
                  />
                  <span className="truncate max-w-full leading-none tracking-tight sm:tracking-normal">
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
