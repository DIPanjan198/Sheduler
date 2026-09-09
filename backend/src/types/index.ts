import { Request } from 'express';

export type Role = 'MANAGER' | 'EMPLOYEE';
export type UserStatus = 'ACTIVE' | 'INVITED' | 'DISABLED';

export interface TokenPayload {
  userId: string;
  businessId: string;
  role: Role;
  email: string;
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export interface NotificationPrefs {
  smsEnabled: boolean;
  emailEnabled: boolean;
}
