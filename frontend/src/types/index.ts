export type Role = 'MANAGER' | 'EMPLOYEE';
export type UserStatus = 'ACTIVE' | 'INVITED' | 'DISABLED';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  status: UserStatus;
  hourlyRate?: number | null;
  businessId: string;
  businessName?: string;
  timezone?: string;
  notificationPrefs?: { smsEnabled: boolean; emailEnabled: boolean };
}

export interface Business {
  id: string;
  name: string;
  timezone: string;
  address?: string;
  reminderLeadTimeMinutes: number;
}

export interface Shift {
  id: string;
  businessId: string;
  assignedUserId: string | null;
  assignedUser?: { id: string; firstName: string; lastName: string; email?: string } | null;
  title: string;
  startAt: string; // ISO UTC string
  endAt: string;   // ISO UTC string
  breakMinutes: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'SWAP_PENDING';
  notes?: string;
  createdBy: string;
}

export interface TimeOffRequest {
  id: string;
  userId: string;
  user?: { id: string; firstName: string; lastName: string; email: string };
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED' | 'CANCELLED';
  reviewedBy?: string | null;
  reviewer?: { firstName: string; lastName: string } | null;
  reviewedAt?: string | null;
  managerNote?: string | null;
  createdAt: string;
}

export interface ShiftSwapRequest {
  id: string;
  originalShiftId: string;
  originalShift: Shift;
  requestedByUserId: string;
  requestedByUser: { id: string; firstName: string; lastName: string };
  targetUserId?: string | null;
  targetUser?: { id: string; firstName: string; lastName: string } | null;
  claimedByUserId?: string | null;
  claimedByUser?: { id: string; firstName: string; lastName: string } | null;
  status: 'OPEN' | 'CLAIMED' | 'APPROVED' | 'DENIED' | 'CANCELLED';
  createdAt: string;
}

export interface TimeClockEntry {
  id: string;
  userId: string;
  user?: { id: string; firstName: string; lastName: string };
  shiftId?: string | null;
  shift?: { id: string; title: string; startAt: string; endAt: string } | null;
  clockInAt: string;
  clockOutAt?: string | null;
  editedByManager: boolean;
  originalClockIn?: string | null;
  originalClockOut?: string | null;
  editReason?: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'FLAGGED';
  flagReason?: string | null;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  channel: 'SMS' | 'EMAIL' | 'PUSH';
  payload: any;
  status: 'QUEUED' | 'SENT' | 'FAILED';
  createdAt: string;
}

export interface Notice {
  id: string;
  businessId: string;
  authorId: string;
  author?: { id: string; firstName: string; lastName: string; role: Role };
  title: string;
  content: string;
  priority: 'LOW' | 'NORMAL' | 'URGENT';
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}
