export type UserRole = 'admin' | 'investor' | 'guest';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  type: string;
  basePrice: number;
  investorId: string;
  revenueSplit: number;
  status: 'Available' | 'Maintenance';
  imageUrl?: string;
}

export interface Booking {
  id: string;
  roomId: string;
  guestId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'Confirmed' | 'Cancelled';
  createdAt: string;
}

export interface AvailabilityOverride {
  id: string;
  roomId: string;
  investorId: string;
  startDate: string;
  endDate: string;
  status: 'Pending_Admin' | 'Approved' | 'Rejected';
  type: 'Block';
  reason: string;
}

export interface Transaction {
  id: string;
  bookingId?: string;
  roomId: string;
  investorAmount: number;
  centerAmount: number;
  type: 'Revenue' | 'Maintenance_Deduction';
  date: string;
}

export interface MaintenanceLog {
  id: string;
  roomId: string;
  description: string;
  cost: number;
  proofUrl?: string;
  date: string;
  adminId: string;
}

export interface AuditLog {
  id: string;
  targetId: string;
  targetType: 'room' | 'booking' | 'override';
  action: string;
  changedBy: string;
  timestamp: string;
}
