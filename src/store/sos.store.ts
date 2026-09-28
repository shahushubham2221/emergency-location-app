import { create } from 'zustand';
import type { SOSSession, LocationPoint } from '../types/sos';
import type { AlertResult } from '../services/notifications.service';

export type SOSPhase =
  | 'idle'
  | 'countdown'
  | 'active'
  | 'stopping'
  | 'completed';

interface SOSState {
  phase: SOSPhase;
  session: SOSSession | null;
  currentLocation: LocationPoint | null;
  lastKnownLocation: LocationPoint | null;
  alertResults: AlertResult[];
  remainingSeconds: number;
  isOfflineDuringSOS: boolean;

  // Actions
  setPhase: (phase: SOSPhase) => void;
  setSession: (session: SOSSession | null) => void;
  setCurrentLocation: (point: LocationPoint) => void;
  setAlertResults: (results: AlertResult[]) => void;
  setRemainingSeconds: (seconds: number) => void;
  setIsOfflineDuringSOS: (offline: boolean) => void;
  reset: () => void;
}

const INITIAL_REMAINING_SECONDS = 3_600; // 1 hour hard cap

const initialState: Omit<
  SOSState,
  | 'setPhase'
  | 'setSession'
  | 'setCurrentLocation'
  | 'setAlertResults'
  | 'setRemainingSeconds'
  | 'setIsOfflineDuringSOS'
  | 'reset'
> = {
  phase: 'idle',
  session: null,
  currentLocation: null,
  lastKnownLocation: null,
  alertResults: [],
  remainingSeconds: INITIAL_REMAINING_SECONDS,
  isOfflineDuringSOS: false,
};

export const useSOSStore = create<SOSState>((set, get) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),

  setSession: (session) => set({ session }),

  setCurrentLocation: (point) =>
    set({
      currentLocation: point,
      // Always keep lastKnownLocation updated so we have it after SOS ends
      lastKnownLocation: point,
    }),

  setAlertResults: (alertResults) => set({ alertResults }),

  setRemainingSeconds: (remainingSeconds) => set({ remainingSeconds }),

  setIsOfflineDuringSOS: (isOfflineDuringSOS) => set({ isOfflineDuringSOS }),

  reset: () =>
    set({
      ...initialState,
      // Preserve lastKnownLocation so it can be displayed on the summary screen
      lastKnownLocation: get().lastKnownLocation,
    }),
}));
