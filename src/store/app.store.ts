import { create } from 'zustand';
import { nanoid } from '../utils/nanoid';

export type SyncStatus = 'idle' | 'syncing' | 'error';
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  title?: string;
  type: ToastType;
  duration: number;
}

interface AppState {
  isOnline: boolean;
  syncStatus: SyncStatus;
  toasts: Toast[];
  theme: 'light' | 'dark';

  // Actions
  setIsOnline: (online: boolean) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addToast: (options: {
    message: string;
    type?: ToastType;
    duration?: number;
  }) => void;
  removeToast: (id: string) => void;
}

const getInitialTheme = (): 'light' | 'dark' => {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || saved === 'light') return saved;
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

export const useAppStore = create<AppState>((set) => ({
  isOnline: navigator.onLine,
  syncStatus: 'idle',
  toasts: [],
  theme: getInitialTheme(),

  setIsOnline: (isOnline) => set({ isOnline }),

  setSyncStatus: (syncStatus) => set({ syncStatus }),

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },

  addToast: ({ message, type = 'info', duration = 4_000 }) => {
    const id = nanoid(12);
    const toast: Toast = { id, message, type, duration };

    set((state) => ({ toasts: [...state.toasts, toast] }));

    // Auto-remove after duration
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
