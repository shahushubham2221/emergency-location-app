export type SOSStatus =
  | 'countdown'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'interrupted'
  | 'offline_pending'
  | 'synced';

export interface SOSSession {
  id: string;
  userId: string;
  status: SOSStatus;
  startedAt: number;
  endedAt?: number;
  cancelledAt?: number;
  duration?: number;
  lastLocation?: LocationPoint;
  alertsSent: boolean;
  alertsSentAt?: number;
  syncCompleted: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface LocationPoint {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  sessionId: string;
  synced: boolean;
}

export interface PendingQueueItem {
  id: string;
  type: 'location_update' | 'sos_create' | 'sos_end' | 'alert';
  data: Record<string, unknown>;
  createdAt: number;
  retries: number;
}
