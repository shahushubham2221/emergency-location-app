import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  Phone,
  ClipboardList,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { logoutUser } from '../services/auth.service';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/active', label: 'Active Emergencies', icon: AlertTriangle, end: false },
  { to: '/admin/users', label: 'Users', icon: Users, end: false },
  { to: '/admin/services', label: 'Emergency Services', icon: Phone, end: false },
  { to: '/admin/audit', label: 'Audit Logs', icon: ClipboardList, end: false },
];

export default function AdminLayout() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside className="w-64 bg-slate-800 flex flex-col shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-700">
          <Shield className="w-7 h-7 text-red-500" aria-hidden="true" />
          <div>
            <p className="text-white font-bold text-sm leading-tight">SOS Guardian</p>
            <p className="text-slate-400 text-xs">Admin Console</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1" aria-label="Admin navigation">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
              aria-label={label}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <p className="text-slate-500 text-xs truncate mb-3">{currentUser?.email}</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            aria-label="Log out of admin console"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Log out
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
