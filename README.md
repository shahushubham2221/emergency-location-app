# SOS Guardian

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-FFCA28?logo=firebase)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

> **SOS Guardian** — A mobile-first Progressive Web App for emergency response with live GPS location sharing, trusted contact alerts, and real-time admin monitoring.

---

## Features

### ✅ What's Real & Functional
| Feature | Status |
|---|---|
| Email/password authentication (Firebase Auth) | ✅ Live |
| SOS countdown & active session (Firestore) | ✅ Live |
| Real-time GPS location tracking (Geolocation API) | ✅ Live |
| Location updates written to Firestore sub-collection | ✅ Live |
| Trusted contacts (stored in Firestore) | ✅ Live |
| Emergency services lookup (Overpass API + Firestore overrides) | ✅ Live |
| Map view with Leaflet | ✅ Live |
| SOS session history | ✅ Live |
| Admin dashboard with real Firestore stats | ✅ Live |
| Active emergencies admin view with 30-second auto-refresh | ✅ Live |
| Emergency services CRUD (admin) | ✅ Live |
| Audit log viewer (admin) | ✅ Live |
| PWA install support (manifest + service worker) | ✅ Live |
| Offline fallback cache | ✅ Basic |

### ⚠️ What Requires Additional Setup
| Feature | Notes |
|---|---|
| SMS alerts to trusted contacts | Requires Twilio or Firebase Extension. Browser cannot send SMS. |
| Web push notifications | Requires FCM VAPID key + backend trigger. See Firebase docs. |
| Background sync (offline location queue) | Requires Background Sync API (Chrome only, not in Safari). |
| User listing & management | Requires Firebase Admin SDK Cloud Function. |
| Audit log writes | Require server-side Admin SDK (cannot be written from client per Firestore rules). |

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 + TypeScript |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Animations | Framer Motion |
| Icons | Lucide React |
| Routing | React Router v6 |
| Backend | Firebase (Auth + Firestore) |
| Maps | Leaflet + React-Leaflet |
| Build | Vite |
| Tests | Vitest |
| PWA | Web App Manifest + Service Worker |

---

## Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (or pnpm/yarn)
- A **Firebase project** (free Spark plan works for development)

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-username/sos-guardian.git
cd sos-guardian

# 2. Install dependencies
npm install

# 3. Copy environment template and fill in your Firebase config
cp .env.example .env
# Edit .env with your Firebase credentials

# 4. Deploy Firestore security rules
firebase deploy --only firestore:rules

# 5. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Firebase Setup

### 1. Create a Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it `sos-guardian`
3. Disable Google Analytics (optional)

### 2. Enable Authentication
1. In the Firebase console: **Build → Authentication → Get started**
2. Enable **Email/Password** sign-in provider

### 3. Create Firestore Database
1. **Build → Firestore Database → Create database**
2. Choose **Start in production mode**
3. Select your preferred region (e.g. `asia-south1` for India)

### 4. Register Web App & Get Config
1. **Project settings → Your apps → Add app → Web (</> icon)**
2. Copy the `firebaseConfig` object
3. Paste the values into your `.env` file

### 5. Deploy Security Rules
```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login
firebase login

# Initialize (select Firestore)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

### 6. Create Admin Users
Since admin role assignment requires the Firebase Admin SDK, use the Firebase console or a one-time script:
```javascript
// Run in Firebase Admin SDK (Node.js)
await admin.firestore().collection('adminUsers').doc('<UID>').set({
  email: 'admin@example.com',
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
});
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | ✅ | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | ✅ | Firestore project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅ | FCM sender ID |
| `VITE_FIREBASE_APP_ID` | ✅ | Firebase app ID |
| `VITE_FIREBASE_VAPID_KEY` | ⬜ | VAPID key for Web Push (FCM) |
| `VITE_ENV` | ⬜ | `development` or `production` |

---

## Known Browser Limitations

| Feature | Chrome | Safari (iOS) | Firefox |
|---|---|---|---|
| Geolocation | ✅ | ✅ (HTTPS only) | ✅ |
| Background Sync | ✅ | ❌ | ❌ |
| Web Push (FCM) | ✅ | ⚠️ iOS 16.4+ only | ✅ |
| PWA Install prompt | ✅ | ⚠️ Manual "Add to Home Screen" | ❌ |
| SMS (Web API) | ❌ | ❌ | ❌ |

> **SMS alerts cannot be sent from the browser.** This requires a server-side service such as Twilio, Firebase Extensions (Send SMS), or a Cloud Function.

---

## Firebase Free Tier Limits (Spark Plan)

| Resource | Free Limit |
|---|---|
| Firestore reads | 50,000 / day |
| Firestore writes | 20,000 / day |
| Firestore deletes | 20,000 / day |
| Firestore storage | 1 GiB |
| Firebase Auth users | 10,000 / month |
| Firebase Hosting | 10 GB storage, 360 MB/day transfer |

For active SOS tracking (1 location write/5 seconds), **a single active SOS session consumes ~17,280 writes/day** — leaving limited headroom on the free tier. Upgrade to Blaze (pay-as-you-go) for production.

---

## Running Tests

```bash
npm run test
```

Tests use [Vitest](https://vitest.dev) and cover pure logic functions:
- SOS countdown timer behavior
- ID generation uniqueness
- `formatDuration` / `formatCountdown` / `formatRelativeTime`
- `haversineKm` with known real-world distances
- Offline queue operations

---

## Production Deployment (Firebase Hosting)

```bash
# Build production bundle
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

Or deploy both hosting and rules at once:
```bash
firebase deploy
```

Configure `firebase.json` to point to the `dist/` folder:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

---

## Project Structure

```
sos-guardian/
├── public/
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service worker
├── src/
│   ├── components/         # Reusable components
│   ├── contexts/           # React contexts (Auth, SOS)
│   ├── layouts/            # AppLayout, AdminLayout
│   ├── pages/
│   │   ├── admin/          # Admin pages
│   │   ├── app/            # Main app pages
│   │   └── auth/           # Auth pages
│   ├── services/           # Firebase service modules
│   ├── tests/              # Vitest unit tests
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Pure utility functions
│   ├── App.tsx             # Router
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── firestore.rules         # Firestore security rules
├── vite.config.ts          # Vite + Tailwind config
└── .env.example            # Environment template
```

---

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please follow the existing code style and ensure tests pass before submitting.

---

## License

MIT © 2026 — SOS Guardian Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
