import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Users,
  MapPin,
  AlertTriangle,
  WifiOff,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  SkipForward,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTrustedContacts } from '../../hooks/useTrustedContacts';
import { updateUserProfile } from '../../services/auth.service';

// ─── Types ────────────────────────────────────────────────────────────────────

type PermissionStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';

// ─── Inline minimal ContactForm ───────────────────────────────────────────────

interface InlineContactFormProps {
  onSave: (data: { name: string; phone: string; relationship: string }) => Promise<void>;
  onSkip: () => void;
}

function InlineContactForm({ onSave, onSkip }: InlineContactFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  async function handleSave() {
    if (!name.trim() || !phone.trim()) {
      setErr('Name and phone are required.');
      return;
    }
    setSaving(true);
    setErr('');
    try {
      await onSave({ name: name.trim(), phone: phone.trim(), relationship: relationship.trim() || 'Contact' });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to save contact');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {err && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2" role="alert">
          {err}
        </p>
      )}
      <div>
        <label htmlFor="ob-name" className="block text-sm font-medium text-gray-700 mb-1">Full name *</label>
        <input
          id="ob-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px]"
        />
      </div>
      <div>
        <label htmlFor="ob-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone number *</label>
        <input
          id="ob-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px]"
        />
      </div>
      <div>
        <label htmlFor="ob-rel" className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
        <input
          id="ob-rel"
          type="text"
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          placeholder="e.g. Parent, Friend, Spouse"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px]"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 min-h-[48px] transition-colors"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
          Save Contact
        </button>
        <button
          onClick={onSkip}
          className="px-4 py-3 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl min-h-[48px] transition-colors"
          aria-label="Skip adding a contact for now"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

// ─── Step content ─────────────────────────────────────────────────────────────

const TOTAL_STEPS = 5;

// ─── Main component ───────────────────────────────────────────────────────────

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { add: addContact, contacts } = useTrustedContacts(user?.uid ?? null);

  const [step, setStep] = useState(1);
  const [contactAdded, setContactAdded] = useState(contacts.length > 0);
  const [locationStatus, setLocationStatus] = useState<PermissionStatus>('idle');
  const [finishing, setFinishing] = useState(false);

  const next = useCallback(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS)), []);
  const back = useCallback(() => setStep((s) => Math.max(s - 1, 1)), []);

  async function requestLocation() {
    if (!('geolocation' in navigator)) {
      setLocationStatus('unavailable');
      return;
    }
    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      () => setLocationStatus('granted'),
      (err) => {
        setLocationStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable');
      },
      { timeout: 10000 }
    );
  }

  async function handleContactSave(data: { name: string; phone: string; relationship: string }) {
    await addContact({ ...data, email: '', enabled: true });
    setContactAdded(true);
    next();
  }

  async function finish() {
    if (!user) return;
    setFinishing(true);
    try {
      await updateUserProfile(user.uid, { onboardingCompleted: true });
      navigate('/app/home', { replace: true });
    } catch {
      setFinishing(false);
    }
  }

  // ── Progress dots ──
  function ProgressDots() {
    return (
      <div className="flex items-center justify-center gap-2 mb-8" aria-label={`Step ${step} of ${TOTAL_STEPS}`}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
          <div
            key={n}
            className={`rounded-full transition-all duration-300 ${
              n === step
                ? 'w-8 h-2.5 bg-blue-600'
                : n < step
                ? 'w-2.5 h-2.5 bg-blue-300'
                : 'w-2.5 h-2.5 bg-gray-200'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  // ── Step 1: Welcome ──
  function StepWelcome() {
    return (
      <div className="text-center">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-200">
          <Shield size={48} className="text-white" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Welcome to SOS Guardian</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-4">
          Hi <strong>{profile?.displayName ?? 'there'}</strong>! Let's set up your emergency profile in a few quick steps so help is always one tap away.
        </p>
        <p className="text-xs text-gray-400">This takes about 2 minutes.</p>
      </div>
    );
  }

  // ── Step 2: Trusted contact ──
  function StepContact() {
    return (
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users size={22} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Add a trusted contact</h2>
            <p className="text-xs text-gray-400">They'll be alerted when you trigger SOS.</p>
          </div>
        </div>

        {contactAdded ? (
          <div className="text-center py-6">
            <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" aria-hidden="true" />
            <p className="font-semibold text-gray-900">Contact saved!</p>
            <p className="text-sm text-gray-500 mt-1">You can add more contacts later in the Contacts page.</p>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
              <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-xs text-amber-700">SOS alerts require at least one trusted contact. You can skip for now but alerts won't work until you add one.</p>
            </div>
            <InlineContactForm onSave={handleContactSave} onSkip={next} />
          </>
        )}
      </div>
    );
  }

  // ── Step 3: Location ──
  function StepLocation() {
    const statusMap: Record<PermissionStatus, { label: string; color: string }> = {
      idle: { label: 'Not requested yet', color: 'text-gray-400' },
      requesting: { label: 'Requesting…', color: 'text-blue-600' },
      granted: { label: 'Location access granted ✓', color: 'text-green-600' },
      denied: { label: 'Permission denied — please enable in browser settings', color: 'text-red-600' },
      unavailable: { label: 'GPS not available on this device', color: 'text-amber-600' },
    };
    const s = statusMap[locationStatus];

    return (
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <MapPin size={22} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Location permission</h2>
            <p className="text-xs text-gray-400">Required to share your position during SOS.</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-5 leading-relaxed">
          SOS Guardian <strong>only</strong> accesses your location during an active SOS session. No background tracking ever.
        </p>
        <button
          onClick={requestLocation}
          disabled={locationStatus === 'requesting' || locationStatus === 'granted'}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 min-h-[52px] transition-colors mb-4"
          aria-label="Allow location access"
        >
          {locationStatus === 'requesting' ? (
            <><Loader2 size={18} className="animate-spin" /> Requesting…</>
          ) : locationStatus === 'granted' ? (
            <><CheckCircle2 size={18} /> Permission granted</>
          ) : (
            <><MapPin size={18} /> Allow Location Access</>
          )}
        </button>
        <p className={`text-xs text-center font-medium ${s.color}`} aria-live="polite">
          {s.label}
        </p>
        {(locationStatus === 'denied' || locationStatus === 'unavailable') && (
          <p className="text-xs text-gray-400 text-center mt-2">You can continue without it — you'll be prompted again during SOS.</p>
        )}
      </div>
    );
  }

  // ── Step 4: How SOS works ──
  function StepHowSOS() {
    return (
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <Shield size={22} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">How SOS works</h2>
            <p className="text-xs text-gray-400">What happens when you press the big red button.</p>
          </div>
        </div>

        <ol className="space-y-4">
          {[
            { n: 1, label: '5-second countdown begins', desc: "A loud visual countdown starts. Tap 'Cancel' at any time to abort." },
            { n: 2, label: 'SOS session starts', desc: 'After 5 seconds, SOS activates and your location is captured.' },
            { n: 3, label: 'Contacts are alerted', desc: 'Your trusted contacts receive an SMS with your live location link.' },
            { n: 4, label: 'You press STOP SOS', desc: "When you're safe, press STOP SOS, confirm, and the session ends with a summary." },
          ].map((item) => (
            <li key={item.n} className="flex gap-4">
              <span className="w-7 h-7 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {item.n}
              </span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs text-blue-700">
            <strong>Tip:</strong> The countdown default is 5 seconds. You can change it in Settings → Emergency Preferences.
          </p>
        </div>
      </div>
    );
  }

  // ── Step 5: Offline behavior ──
  function StepOffline() {
    return (
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <WifiOff size={22} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Works offline too</h2>
            <p className="text-xs text-gray-400">Your safety doesn't depend on internet.</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {[
            { title: 'SOS still starts', desc: 'Even without internet, the SOS session is recorded locally on your device.' },
            { title: 'Location is saved', desc: 'GPS coordinates are saved to your device and will sync when you reconnect.' },
            { title: 'Alerts queue up', desc: 'Contact alerts are queued and sent automatically once you\'re back online.' },
            { title: 'Auto-sync on reconnect', desc: 'Everything syncs to the cloud the moment your connection is restored.' },
          ].map((item) => (
            <div key={item.title} className="flex gap-3">
              <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-xs text-green-700 font-medium">
            You're all set! Press 'Finish' to start using SOS Guardian.
          </p>
        </div>
      </div>
    );
  }

  // ── Render ──
  const stepComponents: Record<number, React.ReactElement> = {
    1: <StepWelcome />,
    2: <StepContact />,
    3: <StepLocation />,
    4: <StepHowSOS />,
    5: <StepOffline />,
  };

  return (
    <div className="min-h-screen bg-[#F0F4FF] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2">
            <Shield className="text-red-600" size={24} aria-hidden="true" />
            <span className="font-extrabold text-gray-900 tracking-tight">SOS Guardian</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Setup — {step} of {TOTAL_STEPS}</p>
        </div>

        <div className="bg-white/70 backdrop-blur border border-white/60 rounded-3xl shadow-xl p-8">
          <ProgressDots />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {stepComponents[step]}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 gap-3">
            {step > 1 ? (
              <button
                onClick={back}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors px-3 py-2 rounded-xl min-h-[48px]"
                aria-label="Go to previous step"
              >
                <ChevronLeft size={16} aria-hidden="true" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < TOTAL_STEPS ? (
              /* Show skip on steps 2 and 3 to avoid blocking */
              step === 2 && !contactAdded ? null : (
                <button
                  onClick={next}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-3 rounded-xl min-h-[48px] transition-colors"
                  aria-label="Continue to next step"
                >
                  Next
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              )
            ) : (
              <button
                onClick={finish}
                disabled={finishing}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-xl min-h-[48px] transition-colors"
                aria-busy={finishing}
                aria-label="Finish setup and go to home"
              >
                {finishing ? (
                  <><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Finishing…</>
                ) : (
                  <>
                    <CheckCircle2 size={16} aria-hidden="true" />
                    Finish Setup
                  </>
                )}
              </button>
            )}
          </div>

          {step < TOTAL_STEPS && step !== 2 && (
            <button
              onClick={() => {
                if (step === TOTAL_STEPS - 1) finish();
                else next();
              }}
              className="flex items-center justify-center gap-1 w-full mt-3 text-xs text-gray-400 hover:text-gray-600 py-2 min-h-[36px] transition-colors"
              aria-label="Skip this step"
            >
              <SkipForward size={12} aria-hidden="true" />
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
