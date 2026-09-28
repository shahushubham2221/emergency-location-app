export interface NotificationRecord {
  id: string;
  userId: string;
  sosSessionId: string;
  contactId: string;
  method: 'push' | 'sms_composer' | 'email';
  status: 'pending' | 'sent' | 'failed' | 'composer_opened';
  sentAt?: number;
  error?: string;
  createdAt: number;
}
