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
      className="fixed bottom-0 left-0 right-0 z-30
        bg-white/90 dark:bg-slate-900/90 backdrop-blur-md 
        border-t border-gray-100 dark:border-slate-800
        shadow-[0_-1px_12px_rgba(0,0,0,0.06)] dark:shadow-none
        transition-colors"
    >
      <ul
        className="flex items-stretch justify-around max-w-lg mx-auto"
        role="list"
      >
        {NAV_ITEMS.map(({ label, to, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              aria-label={label}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center justify-center gap-1',
                  'min-h-[56px] py-2 px-1 w-full',
                  'text-xs font-medium transition-colors duration-150',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset',
                  'relative select-none',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 active:text-gray-700',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full bg-blue-600 dark:bg-blue-400"
                    />
                  )}
                  <Icon
                    size={22}
                    aria-hidden="true"
                    strokeWidth={isActive ? 2.2 : 1.7}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
