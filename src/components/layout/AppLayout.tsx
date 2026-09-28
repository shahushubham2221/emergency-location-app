import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { ToastContainer } from '../ui/Toast';
import { OfflineBanner } from '../location/OfflineBanner';
import { useSOSHydration } from '../../hooks/useSOSHydration';

export const AppLayout: React.FC = () => {
  useSOSHydration();
  return (
    <div className="min-h-dvh bg-[#F0F4FF] dark:bg-slate-950 transition-colors flex flex-col">
      {/* Offline status banner – fixed top */}
      <OfflineBanner />

      {/* Page content */}
      <main
        id="main-content"
        className="flex-1 pb-20 w-full max-w-lg mx-auto px-0"
        aria-label="Page content"
      >
        <Outlet />
      </main>

      {/* Fixed bottom navigation */}
      <BottomNav />

      {/* Global toast notifications */}
      <ToastContainer />
    </div>
  );
};
