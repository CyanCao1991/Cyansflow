import { create } from 'zustand';
import { Process, ProcessNode, User } from '../../shared/types';

interface AppState {
  processes: Process[];
  templates: Process[];
  users: User[];
  currentUser: User | null;
  selectedProcess: Process | null;
  selectedNode: ProcessNode | null;
  setProcesses: (processes: Process[]) => void;
  setTemplates: (templates: Process[]) => void;
  setUsers: (users: User[]) => void;
  setSelectedProcess: (process: Process | null) => void;
  setSelectedNode: (node: ProcessNode | null) => void;
  updateSelectedProcess: (process: Partial<Process>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  processes: [],
  templates: [],
  users: [],
  currentUser: null,
  selectedProcess: null,
  selectedNode: null,
  
  setProcesses: (processes) => set({ processes }),
  setTemplates: (templates) => set({ templates }),
  setUsers: (users) => set({ users }),
  setSelectedProcess: (process) => set({ selectedProcess: process }),
  setSelectedNode: (node) => set({ selectedNode: node }),
  updateSelectedProcess: (updates) =>
    set((state) => ({
      selectedProcess: state.selectedProcess
        ? { ...state.selectedProcess, ...updates }
        : null,
    })),
}));
