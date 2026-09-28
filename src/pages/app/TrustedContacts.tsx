import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, AlertTriangle, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTrustedContacts } from '../../hooks/useTrustedContacts';
import { ContactCard } from '../../components/contacts/ContactCard';
import { ContactForm } from '../../components/contacts/ContactForm';
import { Header } from '../../components/layout/Header';
import type { TrustedContact } from '../../types/contacts';

export default function TrustedContacts() {
  const { user } = useAuth();
  const { contacts, loading, error, add, update, remove, toggle } = useTrustedContacts(
    user?.uid ?? null
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TrustedContact | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleAdd = async (data: any) => {
    setActionError(null);
    try {
      await add(data);
      setFormOpen(false);
    } catch {
      setActionError('Failed to add contact. Check your connection and try again.');
    }
  };

  const handleEdit = async (data: any) => {
    if (!editing) return;
    setActionError(null);
    try {
      await update(editing.id, data);
      setEditing(null);
      setFormOpen(false);
    } catch {
      setActionError('Failed to update contact. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    setActionError(null);
    try {
      await remove(id);
    } catch {
      setActionError('Failed to delete contact. Please try again.');
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await toggle(id, enabled);
    } catch {
      setActionError('Failed to update contact status.');
    }
  };

  const enabledCount = contacts.filter((c) => c.enabled).length;

  return (
    <div className="min-h-screen bg-[#F0F4FF] dark:bg-slate-950 transition-colors">
      <Header
        title="Trusted Contacts"
        showBack={false}
        rightAction={
          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl min-h-[40px] hover:bg-blue-700 transition-colors"
            aria-label="Add trusted contact"
          >
            <Plus size={16} aria-hidden="true" />
            Add
          </button>
        }
      />

      <main className="px-4 py-4 pb-24 max-w-lg mx-auto space-y-3">
        {contacts.length > 0 && (
          <div className="bg-white/70 dark:bg-slate-900/70 transition-colors backdrop-blur rounded-2xl p-4 border border-white/60 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <Users size={18} className="text-blue-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {enabledCount} active · {contacts.length - enabledCount} disabled
              </p>
            </div>
          </div>
        )}

        {!loading && contacts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-5 flex items-start gap-3"
          >
            <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">No trusted contacts</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                SOS alerts require at least one trusted contact. Add someone who can help you
                in an emergency — family, friend, or neighbour.
              </p>
              <button
                onClick={() => setFormOpen(true)}
                className="mt-3 text-sm font-semibold text-amber-700 underline underline-offset-2"
                aria-label="Add your first trusted contact"
              >
                Add your first contact →
              </button>
            </div>
          </motion.div>
        )}

        {(error || actionError) && (
          <div
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl p-4 flex items-center gap-3"
            role="alert"
          >
            <AlertTriangle size={16} className="text-red-600 shrink-0" aria-hidden="true" />
            <p className="text-sm text-red-700 dark:text-red-300">{error ?? actionError}</p>
            {actionError && (
              <button
                onClick={() => setActionError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
                aria-label="Dismiss error"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-8" aria-label="Loading contacts">
            <Loader2 size={28} className="text-blue-500 animate-spin" aria-hidden="true" />
          </div>
        )}

        <AnimatePresence>
          {contacts.map((contact) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              layout
            >
              <ContactCard
                contact={contact}
                onEdit={(c) => { setEditing(c); setFormOpen(true); }}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {contacts.length > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center pt-2">
            Disabled contacts will not be notified during SOS.
          </p>
        )}
      </main>

      <ContactForm
        open={formOpen}
        title={editing ? 'Edit Contact' : 'Add Trusted Contact'}
        initialValues={editing ?? undefined}
        onSubmit={editing ? handleEdit : handleAdd}
        onClose={() => { setFormOpen(false); setEditing(null); }}
      />
    </div>
  );
}
