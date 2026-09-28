import { useEffect, useState, type FormEvent } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  Phone,
  Plus,
  Trash2,
  Info,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface EmergencyService {
  id: string;
  name: string;
  category: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface FormState {
  name: string;
  category: string;
  phone: string;
  address: string;
  latitude: string;
  longitude: string;
}

const BLANK_FORM: FormState = {
  name: '',
  category: '',
  phone: '',
  address: '',
  latitude: '',
  longitude: '',
};

const CATEGORY_OPTIONS = [
  'Police',
  'Fire Station',
  'Hospital',
  'Ambulance',
  'Poison Control',
  'Coast Guard',
  'Mountain Rescue',
  'Other',
];

export default function EmergencyServicesAdmin() {
  const [services, setServices] = useState<EmergencyService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(BLANK_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'emergencyServices'), orderBy('name', 'asc'));
      const snap = await getDocs(q);
      const data: EmergencyService[] = snap.docs.map((d) => ({
        id: d.id,
        name: d.data().name ?? '',
        category: d.data().category ?? '',
        phone: d.data().phone ?? '',
        address: d.data().address ?? '',
        latitude: d.data().latitude ?? 0,
        longitude: d.data().longitude ?? 0,
      }));
      setServices(data);
    } catch (err) {
      console.error('[EmergencyServicesAdmin] Error:', err);
      setError('Failed to load emergency services. Check Firestore permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await addDoc(collection(db, 'emergencyServices'), {
        name: form.name.trim(),
        category: form.category.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        createdAt: serverTimestamp(),
      });
      setForm(BLANK_FORM);
      setFormOpen(false);
      showSuccess(`"${form.name.trim()}" added successfully.`);
      await fetchServices();
    } catch (err) {
      console.error('[EmergencyServicesAdmin] Add error:', err);
      setError('Failed to add service. Check admin write permissions.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (service: EmergencyService) => {
    if (!window.confirm(`Delete "${service.name}"? This cannot be undone.`)) return;
    setDeletingId(service.id);
    try {
      await deleteDoc(doc(db, 'emergencyServices', service.id));
      showSuccess(`"${service.name}" deleted.`);
      setServices((prev) => prev.filter((s) => s.id !== service.id));
    } catch (err) {
      console.error('[EmergencyServicesAdmin] Delete error:', err);
      setError('Failed to delete. Check admin write permissions.');
    } finally {
      setDeletingId(null);
    }
  };

  const setField = (field: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="p-8 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Phone className="w-6 h-6 text-emerald-400" aria-hidden="true" />
            Emergency Services
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Manually curated entries in Firestore <code className="bg-slate-700 px-1 rounded text-xs">emergencyServices</code>
          </p>
        </div>
        <button
          onClick={() => setFormOpen((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm font-medium transition min-h-[44px]"
          aria-label={formOpen ? 'Cancel adding service' : 'Add new emergency service'}
          aria-expanded={formOpen}
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          {formOpen ? 'Cancel' : 'Add Service'}
        </button>
      </div>

      {/* API Note */}
      <div className="bg-slate-800 border border-blue-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-slate-400 text-sm leading-relaxed">
          These manually curated services supplement the live{' '}
          <strong className="text-slate-200">Overpass API</strong> data shown to users. Use this to
          add services not covered by OpenStreetMap, or to pin critical local contacts.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div role="alert" className="flex items-start gap-3 bg-red-900/40 border border-red-700 text-red-300 rounded-xl px-4 py-3 mb-4 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div role="status" aria-live="polite" className="flex items-center gap-3 bg-emerald-900/40 border border-emerald-700 text-emerald-300 rounded-xl px-4 py-3 mb-4 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add Form */}
      {formOpen && (
        <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-4">New Emergency Service</h2>
          <form onSubmit={handleAdd} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label htmlFor="svc-name" className="block text-slate-300 text-xs font-medium mb-1">
                  Name *
                </label>
                <input
                  id="svc-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="City General Hospital"
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder:text-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Service name"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="svc-category" className="block text-slate-300 text-xs font-medium mb-1">
                  Category *
                </label>
                <select
                  id="svc-category"
                  required
                  value={form.category}
                  onChange={(e) => setField('category', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Service category"
                >
                  <option value="">Select category…</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="svc-phone" className="block text-slate-300 text-xs font-medium mb-1">
                  Phone *
                </label>
                <input
                  id="svc-phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  placeholder="+1-800-555-0000"
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder:text-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Service phone number"
                />
              </div>

              {/* Address */}
              <div>
                <label htmlFor="svc-address" className="block text-slate-300 text-xs font-medium mb-1">
                  Address
                </label>
                <input
                  id="svc-address"
                  type="text"
                  value={form.address}
                  onChange={(e) => setField('address', e.target.value)}
                  placeholder="123 Main St, City, State"
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder:text-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Service address"
                />
              </div>

              {/* Latitude */}
              <div>
                <label htmlFor="svc-lat" className="block text-slate-300 text-xs font-medium mb-1">
                  Latitude *
                </label>
                <input
                  id="svc-lat"
                  type="number"
                  required
                  step="any"
                  value={form.latitude}
                  onChange={(e) => setField('latitude', e.target.value)}
                  placeholder="28.6139"
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder:text-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Service latitude coordinate"
                />
              </div>

              {/* Longitude */}
              <div>
                <label htmlFor="svc-lng" className="block text-slate-300 text-xs font-medium mb-1">
                  Longitude *
                </label>
                <input
                  id="svc-lng"
                  type="number"
                  required
                  step="any"
                  value={form.longitude}
                  onChange={(e) => setField('longitude', e.target.value)}
                  placeholder="77.2090"
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder:text-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Service longitude coordinate"
                />
              </div>
            </div>

            <div className="flex justify-end mt-5">
              <button
                type="submit"
                disabled={submitting || !form.name || !form.category || !form.phone || !form.latitude || !form.longitude}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-sm font-medium transition min-h-[44px]"
                aria-label="Save new emergency service"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                {submitting ? 'Saving…' : 'Save Service'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Services List */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-14">
            <Loader2 className="w-7 h-7 text-blue-400 animate-spin" role="status" aria-label="Loading services" />
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <Phone className="w-10 h-10 text-slate-600 mb-3" aria-hidden="true" />
            <p className="text-slate-300 font-medium">No curated services yet</p>
            <p className="text-slate-500 text-sm mt-1">Add your first service using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table" aria-label="Emergency services list">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50">
                  {['Name', 'Category', 'Phone', 'Address', 'Coordinates', 'Actions'].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="text-left text-slate-400 font-medium px-4 py-3 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.map((svc) => (
                  <tr
                    key={svc.id}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30 transition"
                  >
                    <td className="px-4 py-3 text-white font-medium">{svc.name}</td>
                    <td className="px-4 py-3">
                      <span className="bg-emerald-400/10 text-emerald-400 text-xs font-medium px-2 py-0.5 rounded">
                        {svc.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`tel:${svc.phone}`}
                        className="text-blue-400 hover:underline font-mono text-xs"
                        aria-label={`Call ${svc.name} at ${svc.phone}`}
                      >
                        {svc.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs max-w-[200px] truncate">
                      {svc.address || <span className="text-slate-600 italic">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs whitespace-nowrap">
                      {svc.latitude.toFixed(4)}, {svc.longitude.toFixed(4)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(svc)}
                        disabled={deletingId === svc.id}
                        className="flex items-center gap-1.5 text-red-400 hover:text-red-300 disabled:opacity-50 text-xs font-medium transition"
                        aria-label={`Delete ${svc.name}`}
                      >
                        {deletingId === svc.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
