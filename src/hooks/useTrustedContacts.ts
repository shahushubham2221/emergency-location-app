import { useState, useCallback, useEffect } from 'react';
import {
  getTrustedContacts,
  addTrustedContact,
  updateTrustedContact,
  deleteTrustedContact,
} from '../services/contacts.service';
import type { TrustedContact } from '../types/contacts';

interface UseTrustedContactsReturn {
  contacts: TrustedContact[];
  loading: boolean;
  error: string | null;
  add: (
    input: Omit<TrustedContact, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => Promise<TrustedContact>;
  update: (
    contactId: string,
    updates: Partial<Pick<TrustedContact, 'name' | 'phone' | 'relationship' | 'email' | 'enabled'>>
  ) => Promise<void>;
  remove: (contactId: string) => Promise<void>;
  toggle: (contactId: string, enabled: boolean) => Promise<void>;
  reload: () => Promise<void>;
}

export function useTrustedContacts(userId: string | null): UseTrustedContactsReturn {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!userId) {
      setContacts([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fetched = await getTrustedContacts(userId);
      setContacts(fetched);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load on mount / when userId changes
  useEffect(() => {
    reload();
  }, [reload]);

  const add = useCallback(
    async (
      input: Omit<TrustedContact, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
    ): Promise<TrustedContact> => {
      if (!userId) throw new Error('Not authenticated');
      const contact = await addTrustedContact(userId, input);
      setContacts((prev) => [...prev, contact]);
      return contact;
    },
    [userId]
  );

  const update = useCallback(
    async (
      contactId: string,
      updates: Partial<Pick<TrustedContact, 'name' | 'phone' | 'relationship' | 'email' | 'enabled'>>
    ): Promise<void> => {
      if (!userId) throw new Error('Not authenticated');
      await updateTrustedContact(userId, contactId, updates);
      setContacts((prev) =>
        prev.map((c) =>
          c.id === contactId ? { ...c, ...updates, updatedAt: Date.now() } : c
        )
      );
    },
    [userId]
  );

  const remove = useCallback(
    async (contactId: string): Promise<void> => {
      if (!userId) throw new Error('Not authenticated');
      await deleteTrustedContact(userId, contactId);
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
    },
    [userId]
  );

  const toggle = useCallback(
    (contactId: string, enabled: boolean): Promise<void> =>
      update(contactId, { enabled }),
    [update]
  );

  return { contacts, loading, error, add, update, remove, toggle, reload };
}
