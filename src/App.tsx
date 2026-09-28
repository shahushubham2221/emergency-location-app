import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { ErrorBoundary } from './components/ErrorBoundary';

// Layouts
import { AppLayout } from './components/layout/AppLayout';
import AdminLayout from './layouts/AdminLayout';

// Route Guards
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AdminRoute } from './auth/AdminRoute';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';

// Onboarding
import Onboarding from './pages/onboarding/Onboarding';

// App Pages
import Home from './pages/app/Home';
import SOSCountdown from './pages/app/SOSCountdown';
import SOSActive from './pages/app/SOSActive';
import SOSCompleted from './pages/app/SOSCompleted';
import TrustedContacts from './pages/app/TrustedContacts';
import EmergencyServices from './pages/app/EmergencyServices';
import MapPage from './pages/app/MapPage';
import SOSHistory from './pages/app/SOSHistory';
import Profile from './pages/app/Profile';
import Settings from './pages/app/Settings';
import Privacy from './pages/app/Privacy';
import Help from './pages/app/Help';
import GuardianAssistant from './pages/app/GuardianAssistant';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ActiveEmergencies from './pages/admin/ActiveEmergencies';
import UserManagement from './pages/admin/UserManagement';
import EmergencyServicesAdmin from './pages/admin/EmergencyServicesAdmin';
import AuditLogs from './pages/admin/AuditLogs';
import AdminLogin from './pages/admin/AdminLogin';

export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<Onboarding />} />

            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Navigate to="/app/home" replace />} />
              <Route path="home" element={<Home />} />
              <Route path="sos-countdown" element={<SOSCountdown />} />
              <Route path="sos-active" element={<SOSActive />} />
              <Route path="sos-completed" element={<SOSCompleted />} />
              <Route path="contacts" element={<TrustedContacts />} />
              <Route path="emergency-services" element={<EmergencyServices />} />
              <Route path="map" element={<MapPage />} />
              <Route path="history" element={<SOSHistory />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="help" element={<Help />} />
              <Route path="assistant" element={<GuardianAssistant />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="active" element={<ActiveEmergencies />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="services" element={<EmergencyServicesAdmin />} />
              <Route path="audit" element={<AuditLogs />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  );
}
