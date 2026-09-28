import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logoutUser } from '../../services/auth.service';
import { Header } from '../../components/layout/Header';
import { LogOut, User, Mail, ShieldAlert } from 'lucide-react';
import { formatTimestamp } from '../../utils/formatters';

export default function Profile() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4FF] dark:bg-slate-950 transition-colors">
      <Header title="Profile" showBack />
      
      <main className="px-4 py-6 pb-24 max-w-lg mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-900 transition-colors rounded-2xl shadow-sm border border-white/60 dark:border-slate-800 p-6 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 text-3xl font-bold">
            {profile?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{profile?.displayName || 'User'}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 transition-colors rounded-2xl shadow-sm border border-white/60 dark:border-slate-800 p-4 space-y-4">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-slate-800 pb-2">Account Details</h3>
          
          <div className="flex items-center gap-3">
            <User size={18} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Name</p>
              <p className="text-sm font-medium text-gray-800">{profile?.displayName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail size={18} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-800">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ShieldAlert size={18} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Account Created</p>
              <p className="text-sm font-medium text-gray-800">
                {profile?.createdAt ? formatTimestamp(profile.createdAt) : 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold py-4 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            <LogOut size={20} />
            Log Out
          </button>
        </div>
      </main>
    </div>
  );
}
