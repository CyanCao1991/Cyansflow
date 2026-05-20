import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  theme: 'dark' | 'light';
  aiPanelOpen: boolean;
  activeModal: string | null;
  
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleAIPanel: () => void;
  setActiveModal: (modal: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  theme: 'dark',
  aiPanelOpen: false,
  activeModal: null,
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  toggleSidebarCollapse: () => set((state) => ({ 
    sidebarCollapsed: !state.sidebarCollapsed,
    sidebarOpen: state.sidebarCollapsed ? true : state.sidebarOpen
  })),
  
  setTheme: (theme: 'dark' | 'light') => {
    set({ theme });
    localStorage.setItem('theme', theme);
  },
  
  toggleAIPanel: () => set((state) => ({ aiPanelOpen: !state.aiPanelOpen })),
  
  setActiveModal: (modal: string | null) => set({ activeModal: modal })
}));
