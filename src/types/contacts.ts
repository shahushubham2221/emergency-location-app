export interface TrustedContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: string;
  email?: string;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}
