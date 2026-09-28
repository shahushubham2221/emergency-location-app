import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { User } from 'firebase/auth';
import type { AuthState, UserProfile } from '../types/auth';
import { onAuthStateChange, getUserProfile, isAdmin } from '../services/auth.service';

// Export context so useAuth can consume it without a circular dependency
export const AuthContext = createContext<AuthState | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  const loadProfileAndAdminStatus = useCallback(async (user: User) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // Fetch profile and admin status in parallel
      const [profile] = await Promise.all([
        getUserProfile(user.uid),
        isAdmin(user.uid), // result used implicitly to warm the cache; can be exposed if needed
      ]);

      setState({
        user,
        profile,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState({
        user,
        profile: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load profile',
      });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user: User | null) => {
      if (user) {
        await loadProfileAndAdminStatus(user);
      } else {
        setState({ user: null, profile: null, loading: false, error: null });
      }
    });

    return unsubscribe;
  }, [loadProfileAndAdminStatus]);

  return (
    <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
  );
}

/**
 * Convenience hook — re-exported here so callers can import from either
 * AuthProvider or useAuth depending on preference.
 */
export function useAuthContext(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within <AuthProvider>');
  }
  return ctx;
}
