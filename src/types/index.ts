export type UserRole = 'admin' | 'engineer' | 'inspector' | 'manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Device {
  id: string;
  code: string;
  name: string;
  category: string;
  status: 'normal' | 'warning' | 'critical';
  createdBy: string;
  createdAt: string;
}

export interface FMEA {
  id: string;
  deviceId: string;
  failureMode: string;
  failureEffect?: string;
  severity: number;
  occurrence: number;
  detection: number;
  rpn: number;
  createdAt: string;
}

export interface CheckItem {
  id: string;
  fmeaId: string;
  name: string;
  standard: string;
  frequency: string;
  executorRole: UserRole;
  method?: string;
  createdAt: string;
}

export interface Plan {
  id: string;
  deviceId: string;
  name: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'inactive';
  createdBy: string;
  createdAt: string;
}

export interface Task {
  id: string;
  planId: string;
  deviceId: string;
  taskDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  executorId?: string;
  executedAt?: string;
  createdAt: string;
}

export interface TaskItem {
  id: string;
  taskId: string;
  checkItemId: string;
  result?: string;
  remark?: string;
  isAbnormal: boolean;
  createdAt: string;
}
