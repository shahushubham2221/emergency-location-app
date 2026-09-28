import React, { useState } from 'react';
import { Pencil, Trash2, ToggleLeft, ToggleRight, CheckCircle, XCircle } from 'lucide-react';
import type { TrustedContact } from '../../types/contacts';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface ContactCardProps {
  contact: TrustedContact;
  onEdit: (contact: TrustedContact) => void;
  onDelete: (contactId: string) => void;
  onToggle: (contactId: string, enabled: boolean) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onEdit,
  onDelete,
  onToggle,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteFirst = () => setConfirmDelete(true);
  const handleDeleteCancel = () => setConfirmDelete(false);
  const handleDeleteConfirm = () => {
    setConfirmDelete(false);
    onDelete(contact.id);
  };

  const handleToggle = () => onToggle(contact.id, !contact.enabled);

  // Build initials from name
  const initials = contact.name
    .split(' ')
    .map((w) => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');

  return (
    <Card className="flex flex-col gap-3">
      {/* Avatar + info */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          aria-hidden="true"
          className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center
            shrink-0 text-blue-700 dark:text-blue-400 font-bold text-sm select-none"
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {contact.name}
            </span>
            <Badge variant={contact.enabled ? 'success' : 'neutral'}>
              {contact.enabled ? (
                <>
                  <CheckCircle size={10} className="inline mr-0.5" aria-hidden="true" />
                  Active
                </>
              ) : (
                <>
                  <XCircle size={10} className="inline mr-0.5" aria-hidden="true" />
                  Disabled
                </>
              )}
            </Badge>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
            {contact.relationship}
          </p>

          <a
            href={`tel:${contact.phone}`}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-mono"
            aria-label={`Call ${contact.name} at ${contact.phone}`}
          >
            {contact.phone}
          </a>
        </div>
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-slate-800">
        {/* Toggle */}
        <button
          onClick={handleToggle}
          aria-label={`${contact.enabled ? 'Disable' : 'Enable'} ${contact.name} as emergency contact`}
          aria-pressed={contact.enabled}
          className="flex items-center gap-1.5 min-h-[40px] px-3 rounded-xl text-xs font-medium
            transition-colors duration-150 focus:outline-none
            focus-visible:ring-2 focus-visible:ring-blue-500
            text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 active:bg-gray-200 dark:active:bg-slate-700"
        >
          {contact.enabled ? (
            <ToggleRight size={18} className="text-emerald-500" aria-hidden="true" />
          ) : (
            <ToggleLeft size={18} className="text-gray-400" aria-hidden="true" />
          )}
          {contact.enabled ? 'Enabled' : 'Disabled'}
        </button>

        <div className="flex-1" />

        {/* Edit */}
        {!confirmDelete && (
          <button
            onClick={() => onEdit(contact)}
            aria-label={`Edit ${contact.name}`}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl
              text-gray-400 hover:text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 active:bg-blue-100 dark:active:bg-blue-900/60 dark:bg-blue-900/30
              transition-all duration-150 focus:outline-none focus-visible:ring-2
              focus-visible:ring-blue-500"
          >
            <Pencil size={16} aria-hidden="true" />
          </button>
        )}

        {/* Delete / Confirm */}
        {!confirmDelete ? (
          <button
            onClick={handleDeleteFirst}
            aria-label={`Delete ${contact.name}`}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl
              text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 active:bg-red-100 dark:active:bg-red-900/60
              transition-all duration-150 focus:outline-none focus-visible:ring-2
              focus-visible:ring-red-400"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteConfirm}
              aria-label={`Confirm delete ${contact.name}`}
            >
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteCancel}
              aria-label="Cancel delete"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
