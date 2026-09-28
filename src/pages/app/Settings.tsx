import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { useAuth } from '../../hooks/useAuth';
import { logoutUser } from '../../services/auth.service';
import { useAppStore } from '../../store/app.store';
import { 
  User, Users, Shield, Bell, Lock, HelpCircle, LogOut, ChevronRight, Moon, Sun
} from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { theme, setTheme } = useAppStore();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  const sections = [
    {
      title: 'Account & Safety',
      items: [
        { label: 'Profile', icon: User, to: '/app/profile' },
        { label: 'Trusted Contacts', icon: Users, to: '/app/contacts' },
        { label: 'Emergency Preferences', icon: Shield, to: '/app/profile' }, // Simplified
      ]
    },
    {
      title: 'App Settings',
      items: [
        { label: 'Notifications', icon: Bell, to: '/app/settings' }, // Placeholder
        { 
          label: 'Dark Mode', 
          icon: theme === 'dark' ? Sun : Moon, 
          isToggle: true, 
          onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark') 
        },
        { label: 'Privacy & Permissions', icon: Lock, to: '/app/privacy' },
      ]
    },
    {
      title: 'Support',
      items: [
        { label: 'Help & FAQ', icon: HelpCircle, to: '/app/help' },
        { label: 'Guardian Assistant', icon: Shield, to: '/app/assistant' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F0F4FF] dark:bg-slate-950 transition-colors">
      <Header title="Settings" showBack={false} />
      
      <main className="px-4 py-6 pb-24 max-w-lg mx-auto space-y-8">
        
        {sections.map((section, i) => (
          <div key={i}>
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">
              {section.title}
            </h3>
            <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
              {section.items.map((item, j) => {
                const className = `flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${j !== section.items.length - 1 ? 'border-b border-gray-50 dark:border-slate-800' : ''}`;
                
                if (item.isToggle) {
                  return (
                    <button 
                      key={item.label}
                      onClick={item.onClick}
                      className={`w-full text-left ${className}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <item.icon size={16} />
                      </div>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1">{item.label}</span>
                      <div className={`w-11 h-6 rounded-full flex items-center p-1 transition-colors ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-5' : ''}`} />
                      </div>
                    </button>
                  );
                }

                return (
                  <Link 
                    key={item.label}
                    to={item.to as string}
                    className={className}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                      <item.icon size={16} />
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1">{item.label}</span>
                    <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div className="pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            <LogOut size={20} />
            Log Out
          </button>
        </div>
      </main>
    </div>
  );
}
