import React from 'react';
import { Header } from '../../components/layout/Header';
import { Shield, EyeOff, Database, Trash2 } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-dvh bg-[#F0F4FF] dark:bg-slate-950 transition-colors w-full overflow-x-hidden">
      <Header title="Privacy & Security" showBack />
      
      <main className="px-3.5 sm:px-4 py-6 pb-24 max-w-lg mx-auto space-y-4 w-full">
        
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
          <Shield className="text-emerald-500 shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-gray-900">Privacy First</h3>
            <p className="text-sm text-gray-600 mt-1">
              Your location is ONLY tracked when you activate an SOS emergency. We do not track your location in the background.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
          <EyeOff className="text-blue-500 shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-gray-900">Strict Access</h3>
            <p className="text-sm text-gray-600 mt-1">
              Only your authorized trusted contacts and our secure emergency backend can access your location data during an active SOS.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
          <Database className="text-purple-500 shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-gray-900">Secure Storage</h3>
            <p className="text-sm text-gray-600 mt-1">
              Data is stored securely on Google Firebase with strict Firestore Security Rules. Local offline data is kept in your browser's IndexedDB.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
          <Trash2 className="text-red-500 shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-gray-900">Your Data, Your Control</h3>
            <p className="text-sm text-gray-600 mt-1">
              You can delete your account and all associated emergency history at any time from the Profile page.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
