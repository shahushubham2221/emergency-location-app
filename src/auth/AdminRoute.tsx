import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isAdmin } from '../services/auth.service';

/**
 * Wraps routes that require admin privileges.
 * Performs a real-time admin check against Firestore (not just local state)
 * so that revoked admins are handled correctly without a page refresh.
 */
export function AdminRoute() {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [adminStatus, setAdminStatus] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) {
      setAdminStatus(false);
      return;
    }

    let cancelled = false;
    isAdmin(user.uid).then((result) => {
      if (!cancelled) setAdminStatus(result);
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const isLoading = authLoading || adminStatus === null;

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Verifying admin access"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100dvh',
        }}
      >
        <span className="sr-only">Checking permissions…</span>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '4px solid #e5e7eb',
            borderTopColor: '#7c3aed',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!adminStatus) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
