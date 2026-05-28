import { Device, FMEA, CheckItem, Plan, Task, TaskItem, User } from '../types';

export const mockUsers: User[] = [
  { id: '1', name: '张管理员', email: 'admin@example.com', role: 'admin', createdAt: '2024-01-01' },
  { id: '2', name: '李工程师', email: 'engineer@example.com', role: 'engineer', createdAt: '2024-01-02' },
  { id: '3', name: '王点检员', email: 'inspector@example.com', role: 'inspector', createdAt: '2024-01-03' },
  { id: '4', name: '赵经理', email: 'manager@example.com', role: 'manager', createdAt: '2024-01-04' },
];

export const mockDevices: Device[] = [
  { id: 'd1', code: 'CNC-001', name: '数控加工中心', category: '加工设备', status: 'normal', createdBy: '1', createdAt: '2024-01-10' },
  { id: 'd2', code: 'LATHE-002', name: '精密车床', category: '加工设备', status: 'warning', createdBy: '1', createdAt: '2024-01-11' },
  { id: 'd3', code: 'MILL-003', name: '铣床', category: '加工设备', status: 'normal', createdBy: '1', createdAt: '2024-01-12' },
  { id: 'd4', code: 'ROBOT-004', name: '工业机器人', category: '自动化设备', status: 'critical', createdBy: '1', createdAt: '2024-01-13' },
  { id: 'd5', code: 'QC-005', name: '质量检测台', category: '检测设备', status: 'normal', createdBy: '1', createdAt: '2024-01-14' },
];

export const mockFMEA: FMEA[] = [
  { id: 'f1', deviceId: 'd1', failureMode: '主轴轴承磨损', failureEffect: '加工精度下降，振动加剧', severity: 8, occurrence: 5, detection: 3, rpn: 120, createdAt: '2024-01-15' },
  { id: 'f2', deviceId: 'd1', failureMode: '液压系统泄漏', failureEffect: '压力不足，设备停机', severity: 9, occurrence: 4, detection: 4, rpn: 144, createdAt: '2024-01-16' },
  { id: 'f3', deviceId: 'd2', failureMode: '丝杠副磨损', failureEffect: '定位精度误差', severity: 7, occurrence: 6, detection: 2, rpn: 84, createdAt: '2024-01-17' },
  { id: 'f4', deviceId: 'd4', failureMode: '伺服电机故障', failureEffect: '机器人无法动作', severity: 10, occurrence: 3, detection: 5, rpn: 150, createdAt: '2024-01-18' },
];

export const mockCheckItems: CheckItem[] = [
  { id: 'c1', fmeaId: 'f1', name: '主轴温度检查', standard: '温度 ≤ 60°C', frequency: '每日', executorRole: 'inspector', method: '使用测温枪', createdAt: '2024-01-15' },
  { id: 'c2', fmeaId: 'f1', name: '主轴振动检测', standard: '振动值 ≤ 2.5mm/s', frequency: '每周', executorRole: 'inspector', method: '使用振动仪', createdAt: '2024-01-15' },
  { id: 'c3', fmeaId: 'f2', name: '液压系统检查', standard: '无泄漏，压力正常', frequency: '每日', executorRole: 'inspector', method: '目视检查 + 压力表', createdAt: '2024-01-16' },
  { id: 'c4', fmeaId: 'f3', name: '丝杠润滑检查', standard: '润滑充分，无异响', frequency: '每周', executorRole: 'inspector', method: '目视 + 听音', createdAt: '2024-01-17' },
  { id: 'c5', fmeaId: 'f4', name: '伺服电机温度', standard: '温度 ≤ 70°C', frequency: '每日', executorRole: 'inspector', method: '测温枪', createdAt: '2024-01-18' },
];

export const mockPlans: Plan[] = [
  { id: 'p1', deviceId: 'd1', name: 'CNC-001 日常点检计划', startDate: '2024-05-01', endDate: '2024-12-31', status: 'active', createdBy: '2', createdAt: '2024-04-28' },
  { id: 'p2', deviceId: 'd2', name: 'LATHE-002 维护计划', startDate: '2024-05-01', status: 'active', createdBy: '2', createdAt: '2024-04-29' },
  { id: 'p3', deviceId: 'd4', name: 'ROBOT-004 保养计划', startDate: '2024-05-01', status: 'active', createdBy: '2', createdAt: '2024-04-30' },
];

export const mockTasks: Task[] = [
  { id: 't1', planId: 'p1', deviceId: 'd1', taskDate: '2024-05-28', status: 'pending', createdAt: '2024-05-27' },
  { id: 't2', planId: 'p1', deviceId: 'd1', taskDate: '2024-05-27', status: 'completed', executorId: '3', executedAt: '2024-05-27 09:30:00', createdAt: '2024-05-26' },
  { id: 't3', planId: 'p2', deviceId: 'd2', taskDate: '2024-05-28', status: 'in_progress', executorId: '3', createdAt: '2024-05-27' },
  { id: 't4', planId: 'p3', deviceId: 'd4', taskDate: '2024-05-28', status: 'pending', createdAt: '2024-05-27' },
];

export const mockTaskItems: TaskItem[] = [
  { id: 'ti1', taskId: 't2', checkItemId: 'c1', result: '52°C，正常', isAbnormal: false, createdAt: '2024-05-27' },
  { id: 'ti2', taskId: 't2', checkItemId: 'c3', result: '无泄漏，压力正常', isAbnormal: false, createdAt: '2024-05-27' },
];
