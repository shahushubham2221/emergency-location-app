import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Wraps routes that require an authenticated user.
 * - Shows a centred spinner while auth is loading.
 * - Redirects to /login with the original path in `state` so the user
 *   can be sent back after sign-in.
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        role="status"
        aria-label="Verifying authentication"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100dvh',
        }}
      >
        <span className="sr-only">Loading…</span>
        {/* Spinner — replace with your design-system component */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '4px solid #e5e7eb',
            borderTopColor: '#ef4444',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
