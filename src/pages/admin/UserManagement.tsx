import { Users, Server, Lock, Terminal, Info } from 'lucide-react';

export default function UserManagement() {
  return (
    <div className="p-8 text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-400" aria-hidden="true" />
          User Management
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage registered SOS Guardian accounts</p>
      </div>

      {/* Main Notice */}
      <div className="bg-slate-800 border border-amber-500/30 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-amber-400" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-white font-semibold mb-1">Elevated Server Permissions Required</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              User management requires the{' '}
              <strong className="text-slate-200">Firebase Admin SDK</strong>, which can only run in a
              trusted server environment — not in the browser. Listing all users, modifying roles,
              or deleting accounts must be done via a deployed{' '}
              <strong className="text-slate-200">Cloud Function</strong> or a secure backend API
              that uses a service account with Admin privileges.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {[
          {
            icon: <Users className="w-5 h-5 text-blue-400" aria-hidden="true" />,
            title: 'List All Users',
            available: false,
            note: 'Requires Admin SDK — Firebase Auth does not expose a user list via client SDK for security reasons.',
          },
          {
            icon: <Lock className="w-5 h-5 text-amber-400" aria-hidden="true" />,
            title: 'Assign / Revoke Admin Role',
            available: false,
            note: 'Write access to adminUsers collection is blocked by Firestore rules; must use Admin SDK server-side.',
          },
          {
            icon: <Terminal className="w-5 h-5 text-emerald-400" aria-hidden="true" />,
            title: 'Disable / Delete Account',
            available: false,
            note: 'Firebase Auth account operations (disable, delete) are Admin SDK only.',
          },
          {
            icon: <Server className="w-5 h-5 text-purple-400" aria-hidden="true" />,
            title: 'View Own Profile (per-user)',
            available: true,
            note: 'Each user can view and edit their own profile via the app. Admins can read /users/{uid} via Firestore rules.',
          },
        ].map(({ icon, title, available, note }) => (
          <div
            key={title}
            className={`bg-slate-800 border rounded-xl p-5 ${
              available ? 'border-emerald-500/30' : 'border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {icon}
                <span className="text-white text-sm font-medium">{title}</span>
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  available
                    ? 'bg-emerald-400/10 text-emerald-400'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {available ? 'Available' : 'Requires Backend'}
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">{note}</p>
          </div>
        ))}
      </div>

      {/* Backend Deployment Guide */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-blue-400" aria-hidden="true" />
          <h2 className="text-white font-semibold">How to Enable Full User Management</h2>
        </div>
        <ol className="space-y-3 text-sm text-slate-400" role="list">
          <li className="flex gap-3">
            <span className="text-slate-600 font-mono shrink-0">1.</span>
            <span>
              Deploy a <strong className="text-slate-200">Firebase Cloud Function</strong> (Node.js) that initialises the
              Admin SDK using a service account.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-slate-600 font-mono shrink-0">2.</span>
            <span>
              Protect that function with an <strong className="text-slate-200">HTTPS callable</strong> and verify the
              caller&apos;s Firebase ID token server-side, checking for the admin role.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-slate-600 font-mono shrink-0">3.</span>
            <span>
              Use <code className="bg-slate-700 px-1 rounded">admin.auth().listUsers()</code>,{' '}
              <code className="bg-slate-700 px-1 rounded">admin.auth().deleteUser(uid)</code>, etc. in the function body.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-slate-600 font-mono shrink-0">4.</span>
            <span>
              Call that Cloud Function from this admin panel using the Firebase Functions client SDK.
            </span>
          </li>
        </ol>
        <p className="mt-4 text-xs text-slate-500">
          See the Firebase docs:{' '}
          <a
            href="https://firebase.google.com/docs/admin/setup"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
            aria-label="Firebase Admin SDK setup documentation (opens in new tab)"
          >
            firebase.google.com/docs/admin/setup
          </a>
        </p>
      </div>
    </div>
  );
}
