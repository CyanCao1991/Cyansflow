import { create } from 'zustand';
import { Device, FMEA, CheckItem, Plan, Task, TaskItem, User } from '../types';
import { mockDevices, mockFMEA, mockCheckItems, mockPlans, mockTasks, mockTaskItems, mockUsers } from './mockData';

interface AppStore {
  currentUser: User;
  devices: Device[];
  fmeas: FMEA[];
  checkItems: CheckItem[];
  plans: Plan[];
  tasks: Task[];
  taskItems: TaskItem[];
  
  addDevice: (device: Omit<Device, 'id' | 'createdAt'>) => void;
  updateDevice: (id: string, device: Partial<Device>) => void;
  deleteDevice: (id: string) => void;
  
  addFMEA: (fmea: Omit<FMEA, 'id' | 'createdAt' | 'rpn'>) => void;
  updateFMEA: (id: string, fmea: Partial<Omit<FMEA, 'rpn'>>) => void;
  deleteFMEA: (id: string) => void;
  
  addCheckItem: (item: Omit<CheckItem, 'id' | 'createdAt'>) => void;
  updateCheckItem: (id: string, item: Partial<CheckItem>) => void;
  deleteCheckItem: (id: string) => void;
  
  addPlan: (plan: Omit<Plan, 'id' | 'createdAt'>) => void;
  updatePlan: (id: string, plan: Partial<Plan>) => void;
  deletePlan: (id: string) => void;
  
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  addTaskItem: (item: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  updateTaskItem: (id: string, item: Partial<TaskItem>) => void;
  deleteTaskItem: (id: string) => void;
  
  getDeviceById: (id: string) => Device | undefined;
  getFMEAByDeviceId: (deviceId: string) => FMEA[];
  getCheckItemsByFMEAId: (fmeaId: string) => CheckItem[];
  getTasksByDeviceId: (deviceId: string) => Task[];
  getTaskItemsByTaskId: (taskId: string) => TaskItem[];
}

export const useAppStore = create<AppStore>((set, get) => ({
  currentUser: mockUsers[1],
  devices: mockDevices,
  fmeas: mockFMEA,
  checkItems: mockCheckItems,
  plans: mockPlans,
  tasks: mockTasks,
  taskItems: mockTaskItems,
  
  addDevice: (device) => set((state) => ({
    devices: [...state.devices, { ...device, id: `d${Date.now()}`, createdAt: new Date().toISOString() }]
  })),
  
  updateDevice: (id, device) => set((state) => ({
    devices: state.devices.map(d => d.id === id ? { ...d, ...device } : d)
  })),
  
  deleteDevice: (id) => set((state) => ({
    devices: state.devices.filter(d => d.id !== id)
  })),
  
  addFMEA: (fmea) => set((state) => ({
    fmeas: [...state.fmeas, { 
      ...fmea, 
      id: `f${Date.now()}`, 
      createdAt: new Date().toISOString(),
      rpn: fmea.severity * fmea.occurrence * fmea.detection
    }]
  })),
  
  updateFMEA: (id, fmea) => set((state) => ({
    fmeas: state.fmeas.map(f => {
      if (f.id === id) {
        const updated = { ...f, ...fmea };
        return { ...updated, rpn: updated.severity * updated.occurrence * updated.detection };
      }
      return f;
    })
  })),
  
  deleteFMEA: (id) => set((state) => ({
    fmeas: state.fmeas.filter(f => f.id !== id)
  })),
  
  addCheckItem: (item) => set((state) => ({
    checkItems: [...state.checkItems, { ...item, id: `c${Date.now()}`, createdAt: new Date().toISOString() }]
  })),
  
  updateCheckItem: (id, item) => set((state) => ({
    checkItems: state.checkItems.map(c => c.id === id ? { ...c, ...item } : c)
  })),
  
  deleteCheckItem: (id) => set((state) => ({
    checkItems: state.checkItems.filter(c => c.id !== id)
  })),
  
  addPlan: (plan) => set((state) => ({
    plans: [...state.plans, { ...plan, id: `p${Date.now()}`, createdAt: new Date().toISOString() }]
  })),
  
  updatePlan: (id, plan) => set((state) => ({
    plans: state.plans.map(p => p.id === id ? { ...p, ...plan } : p)
  })),
  
  deletePlan: (id) => set((state) => ({
    plans: state.plans.filter(p => p.id !== id)
  })),
  
  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, { ...task, id: `t${Date.now()}`, createdAt: new Date().toISOString() }]
  })),
  
  updateTask: (id, task) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, ...task } : t)
  })),
  
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id)
  })),
  
  addTaskItem: (item) => set((state) => ({
    taskItems: [...state.taskItems, { ...item, id: `ti${Date.now()}`, createdAt: new Date().toISOString() }]
  })),
  
  updateTaskItem: (id, item) => set((state) => ({
    taskItems: state.taskItems.map(ti => ti.id === id ? { ...ti, ...item } : ti)
  })),
  
  deleteTaskItem: (id) => set((state) => ({
    taskItems: state.taskItems.filter(ti => ti.id !== id)
  })),
  
  getDeviceById: (id) => get().devices.find(d => d.id === id),
  getFMEAByDeviceId: (deviceId) => get().fmeas.filter(f => f.deviceId === deviceId),
  getCheckItemsByFMEAId: (fmeaId) => get().checkItems.filter(c => c.fmeaId === fmeaId),
  getTasksByDeviceId: (deviceId) => get().tasks.filter(t => t.deviceId === deviceId),
  getTaskItemsByTaskId: (taskId) => get().taskItems.filter(ti => ti.taskId === taskId),
}));
