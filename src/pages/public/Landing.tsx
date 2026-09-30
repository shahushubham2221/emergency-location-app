import React, { useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  MapPin,
  Bell,
  Users,
  Lock,
  WifiOff,
  Navigation,
  PhoneCall,
  ChevronDown,
} from 'lucide-react';

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

// ─── How-it-works data ────────────────────────────────────────────────────────

const STEPS = [
  {
    icon: Shield,
    label: 'Tap SOS',
    desc: 'Press the big red button. A 5-second countdown lets you cancel if it was accidental.',
    color: 'bg-red-50 text-red-600',
  },
  {
    icon: MapPin,
    label: 'Location Shared',
    desc: 'Your precise GPS coordinates are captured and stored securely.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Bell,
    label: 'Contacts Alerted',
    desc: 'Your trusted contacts receive an SMS with your location link immediately.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Users,
    label: 'Help Arrives',
    desc: 'Your contacts can see your live location and coordinate help for you.',
    color: 'bg-green-50 text-green-600',
  },
];

// ─── Features data ────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Lock,
    title: 'Privacy-first',
    desc: 'Your location is only shared during an active SOS. Nothing is collected passively.',
  },
  {
    icon: WifiOff,
    title: 'Offline capable',
    desc: 'SOS sessions are saved locally and sync automatically when you reconnect.',
  },
  {
    icon: Navigation,
    title: 'Live location',
    desc: 'Continuous GPS updates so your contacts always know exactly where you are.',
  },
  {
    icon: PhoneCall,
    title: 'Emergency services',
    desc: 'Nearby hospitals, police stations, and fire services shown on an interactive map.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

import { useAuth } from '../../hooks/useAuth';

export default function Landing() {
  const { user, loading } = useAuth();
  const howItWorksRef = useRef<HTMLElement>(null);

  if (!loading && user) {
    return <Navigate to="/app/home" replace />;
  }

  function scrollToHowItWorks() {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-[#F0F4FF] font-sans">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-white/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="text-red-600" size={24} aria-hidden="true" />
          <span className="font-bold text-gray-900 text-lg tracking-tight">SOS Guardian</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-sm font-semibold bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors min-h-[44px] flex items-center"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pt-20 pb-28 flex flex-col items-center text-center">
        {/* Gradient blob */}
        <div
          aria-hidden="true"
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-red-200/60 via-blue-200/40 to-transparent blur-3xl pointer-events-none"
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative z-10 max-w-xl"
        >
          {/* Badge */}
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-white/60 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm mb-6">
              <Shield size={13} aria-hidden="true" />
              Personal Safety App
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4"
          >
            Help is{' '}
            <span className="text-red-600">one tap</span>{' '}
            away.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg text-gray-600 leading-relaxed mb-10"
          >
            SOS Guardian instantly alerts your trusted contacts with your live location the moment you need help — even without internet.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/register"
              className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-lg shadow-red-200 transition-all min-h-[52px] flex items-center justify-center"
              aria-label="Create a free account and get started"
            >
              Get Started — it's free
            </Link>
            <button
              onClick={scrollToHowItWorks}
              className="flex items-center justify-center gap-2 bg-white/80 backdrop-blur border border-gray-200 text-gray-700 font-semibold text-base px-6 py-4 rounded-2xl hover:bg-white transition-all min-h-[52px]"
              aria-label="Scroll to learn how SOS Guardian works"
            >
              How it works
              <ChevronDown size={18} aria-hidden="true" />
            </button>
          </motion.div>
        </motion.div>

        {/* Floating shield illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.7, type: 'spring' }}
          className="relative z-10 mt-16"
          aria-hidden="true"
        >
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-2xl shadow-red-300">
            <Shield className="text-white" size={72} />
          </div>
          <div className="absolute inset-0 rounded-full bg-red-400/20 animate-ping" style={{ animationDuration: '2s' }} />
        </motion.div>
      </section>

      {/* ── How it works ── */}
      <section
        ref={howItWorksRef}
        id="how-it-works"
        className="px-6 py-20 max-w-4xl mx-auto"
      >
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">How it works</h2>
            <p className="text-gray-500 text-base max-w-md mx-auto">
              Four simple steps between you and safety.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.label}
                variants={fadeUp}
                className="bg-white/70 backdrop-blur border border-white/60 rounded-2xl p-6 shadow-sm flex gap-4"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${step.color}`}>
                  <step.icon size={22} aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Step {i + 1}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{step.label}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-20 bg-white/40">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Built for real emergencies</h2>
            <p className="text-gray-500 text-base max-w-md mx-auto">
              Every feature is designed with privacy and reliability at its core.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className="bg-white/80 backdrop-blur border border-white/60 rounded-2xl p-6 shadow-sm"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <f.icon size={21} aria-hidden="true" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── CTA banner ── */}
      <section className="px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto text-center"
        >
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Stay safe. Always.
          </h2>
          <p className="text-gray-500 mb-8">
            Create your free account in under a minute. No credit card required.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold px-10 py-4 rounded-2xl shadow-lg shadow-red-200 transition-all min-h-[52px] text-base"
          >
            Create Free Account
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200/60 bg-white/50 backdrop-blur px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Shield className="text-red-600" size={18} aria-hidden="true" />
              <span className="font-semibold text-gray-700">SOS Guardian</span>
            </div>
            <div className="flex gap-4 text-sm text-gray-500">
              <Link to="/login" className="hover:text-gray-800 transition-colors">Sign In</Link>
              <Link to="/register" className="hover:text-gray-800 transition-colors">Register</Link>
              <Link to="/app/privacy" className="hover:text-gray-800 transition-colors">Privacy</Link>
              <Link to="/app/help" className="hover:text-gray-800 transition-colors">Help</Link>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            ⚠️ <strong>Disclaimer:</strong> SOS Guardian requires location permissions and an active internet connection to send alerts. In a genuine emergency, always call{' '}
            <strong>112</strong> (India) or your local emergency services directly. This app supplements but does not replace emergency services.
          </p>
          <p className="text-xs text-gray-400 text-center mt-2">
            © {new Date().getFullYear()} SOS Guardian. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
