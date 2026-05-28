import { create } from 'zustand';
import { Device, InspectionStandard, InspectionPlan, InspectionTask } from '@/types';

interface AppState {
  devices: Device[];
  standards: InspectionStandard[];
  plans: InspectionPlan[];
  tasks: InspectionTask[];
  currentUser: { id: string; name: string; role: string } | null;
  setDevices: (devices: Device[]) => void;
  setStandards: (standards: InspectionStandard[]) => void;
  setPlans: (plans: InspectionPlan[]) => void;
  setTasks: (tasks: InspectionTask[]) => void;
  addDevice: (device: Device) => void;
  updateDevice: (id: string, device: Partial<Device>) => void;
  addStandard: (standard: InspectionStandard) => void;
  updateStandard: (id: string, standard: Partial<InspectionStandard>) => void;
  addPlan: (plan: InspectionPlan) => void;
  updatePlan: (id: string, plan: Partial<InspectionPlan>) => void;
  addTask: (task: InspectionTask) => void;
  updateTask: (id: string, task: Partial<InspectionTask>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  devices: [],
  standards: [],
  plans: [],
  tasks: [],
  currentUser: { id: '1', name: '管理员', role: 'device_admin' },
  
  setDevices: (devices) => set({ devices }),
  setStandards: (standards) => set({ standards }),
  setPlans: (plans) => set({ plans }),
  setTasks: (tasks) => set({ tasks }),
  
  addDevice: (device) => set((state) => ({ devices: [...state.devices, device] })),
  updateDevice: (id, device) => set((state) => ({
    devices: state.devices.map(d => d.id === id ? { ...d, ...device } : d)
  })),
  
  addStandard: (standard) => set((state) => ({ standards: [...state.standards, standard] })),
  updateStandard: (id, standard) => set((state) => ({
    standards: state.standards.map(s => s.id === id ? { ...s, ...standard } : s)
  })),
  
  addPlan: (plan) => set((state) => ({ plans: [...state.plans, plan] })),
  updatePlan: (id, plan) => set((state) => ({
    plans: state.plans.map(p => p.id === id ? { ...p, ...plan } : p)
  })),
  
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, task) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, ...task } : t)
  })),
}));
