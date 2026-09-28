import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { TrustedContact } from '../../types/contacts';

// ─── Validation schema ────────────────────────────────────────────────────────

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80, 'Name too long'),
  phone: z
    .string()
    .min(1, 'Phone is required')
    .regex(/^\+?[\d\s\-().]{10,}$/, 'Enter a valid phone number (at least 10 digits)'),
  relationship: z.string().min(1, 'Relationship is required').max(50, 'Relationship too long'),
  email: z
    .string()
    .email('Enter a valid email address')
    .or(z.literal(''))
    .optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ContactFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ContactFormValues) => void | Promise<void>;
  initialValues?: Partial<TrustedContact>;
  title?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const RELATIONSHIP_OPTIONS = [
  'Family',
  'Spouse / Partner',
  'Friend',
  'Colleague',
  'Neighbour',
  'Other',
];

export const ContactForm: React.FC<ContactFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  title = 'Add Contact',
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    mode: 'onTouched',
    defaultValues: {
      name: initialValues?.name ?? '',
      phone: initialValues?.phone ?? '',
      relationship: initialValues?.relationship ?? '',
      email: initialValues?.email ?? '',
    },
  });

  // Reset form when modal opens with (possibly different) initialValues
  useEffect(() => {
    if (open) {
      reset({
        name: initialValues?.name ?? '',
        phone: initialValues?.phone ?? '',
        relationship: initialValues?.relationship ?? '',
        email: initialValues?.email ?? '',
      });
    }
  }, [open, initialValues, reset]);

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  const onFormSubmit = async (values: ContactFormValues) => {
    await onSubmit(values);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      size="md"
      closable={!isSubmitting}
    >
      <form
        onSubmit={handleSubmit(onFormSubmit)}
        noValidate
        aria-label={title}
        className="flex flex-col gap-4"
      >
        {/* Name */}
        <Input
          label="Full Name"
          placeholder="e.g. Jane Smith"
          required
          autoComplete="name"
          aria-label="Contact full name"
          error={errors.name?.message}
          {...register('name')}
        />

        {/* Phone */}
        <Input
          label="Phone Number"
          placeholder="e.g. +91 98765 43210"
          type="tel"
          required
          autoComplete="tel"
          aria-label="Contact phone number"
          error={errors.phone?.message}
          helper="Include country code for international numbers"
          {...register('phone')}
        />

        {/* Relationship */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="contact-relationship"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Relationship <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <select
            id="contact-relationship"
            aria-label="Relationship to contact"
            aria-invalid={!!errors.relationship}
            aria-required="true"
            {...register('relationship')}
            className={[
              'min-h-[48px] rounded-xl border px-4 py-2.5 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900',
              'focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors',
              errors.relationship
                ? 'border-red-400 focus:border-red-500 focus:ring-red-400'
                : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 focus:border-blue-500 focus:ring-blue-400',
            ].join(' ')}
          >
            <option value="">Select relationship…</option>
            {RELATIONSHIP_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {errors.relationship && (
            <p role="alert" className="text-xs font-medium text-red-600">
              {errors.relationship.message}
            </p>
          )}
        </div>

        {/* Email (optional) */}
        <Input
          label="Email (optional)"
          placeholder="e.g. jane@example.com"
          type="email"
          autoComplete="email"
          aria-label="Contact email address (optional)"
          error={errors.email?.message}
          {...register('email')}
        />

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            disabled={isSubmitting || (!isDirty && !!initialValues)}
            aria-label="Save contact"
          >
            {initialValues ? 'Save Changes' : 'Add Contact'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="md"
            fullWidth
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Cancel"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};
