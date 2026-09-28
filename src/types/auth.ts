export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  emergencyPreferences: EmergencyPreferences;
  onboardingCompleted: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface EmergencyPreferences {
  sosCountdownSeconds: number;
  autoNotifyContacts: boolean;
  locationUpdateIntervalMs: number;
}

export interface AuthState {
  user: import('firebase/auth').User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}
