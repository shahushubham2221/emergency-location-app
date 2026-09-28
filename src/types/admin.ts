export interface AdminUser {
  uid: string;
  email: string;
  role: 'admin' | 'superadmin';
  createdAt: number;
}

export interface AuditLog {
  id: string;
  adminUid: string;
  action: string;
  targetUid?: string;
  details: Record<string, unknown>;
  timestamp: number;
}

export interface SystemStats {
  totalUsers: number;
  activeSOS: number;
  totalSOSSessions: number;
  systemHealthy: boolean;
}
