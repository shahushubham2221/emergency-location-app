import { useContext } from 'react';
import { AuthContext } from '../auth/AuthProvider';
import type { AuthState } from '../types/auth';

/**
 * Consumes the AuthContext. Must be used inside <AuthProvider>.
 */
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
