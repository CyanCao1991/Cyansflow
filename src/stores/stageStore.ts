import { create } from 'zustand';
import { Stage, StageStatus, StageType, StageProgress } from '../types';
import { stageDB } from '../services/db';
import { STAGE_ORDER, getStageConfig } from '../constants/stages';

interface StageState {
  stages: Stage[];
  currentStage: Stage | null;
  loading: boolean;
  
  loadStages: (projectId: string) => Promise<void>;
  updateStage: (id: string, updates: Partial<Stage>) => Promise<void>;
  setCurrentStage: (stage: Stage | null) => void;
  getStageProgress: (projectId: string) => StageProgress[];
  unlockNextStage: (projectId: string, currentType: StageType) => Promise<void>;
  completeStage: (projectId: string, type: StageType) => Promise<void>;
}

export const useStageStore = create<StageState>((set, get) => ({
  stages: [],
  currentStage: null,
  loading: false,
  
  loadStages: async (projectId: string) => {
    set({ loading: true });
    try {
      const stages = await stageDB.getByProject(projectId);
      set({ stages, loading: false });
    } catch (error) {
      console.error('Failed to load stages:', error);
      set({ loading: false });
    }
  },
  
  updateStage: async (id: string, updates: Partial<Stage>) => {
    await stageDB.update(id, updates);
    set(state => ({
      stages: state.stages.map(s => 
        s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s
      ),
      currentStage: state.currentStage?.id === id 
        ? { ...state.currentStage, ...updates, updatedAt: Date.now() }
        : state.currentStage
    }));
  },
  
  setCurrentStage: (stage: Stage | null) => {
    set({ currentStage: stage });
  },
  
  getStageProgress: (projectId: string) => {
    const stages = get().stages.filter(s => s.projectId === projectId);
    
    return STAGE_ORDER.map(type => {
      const stage = stages.find(s => s.type === type);
      const config = getStageConfig(type);
      
      let status: StageStatus = 'locked';
      let progress = 0;
      
      if (stage) {
        status = stage.status;
        if (status === 'completed') {
          progress = 100;
        } else if (status === 'in_progress') {
          progress = 50;
        }
      }
      
      return {
        stage: type,
        status,
        progress
      };
    });
  },
  
  unlockNextStage: async (projectId: string, currentType: StageType) => {
    const currentIndex = STAGE_ORDER.indexOf(currentType);
    if (currentIndex < STAGE_ORDER.length - 1) {
      const nextType = STAGE_ORDER[currentIndex + 1];
      const nextStage = get().stages.find(s => s.projectId === projectId && s.type === nextType);
      
      if (nextStage && nextStage.status === 'locked') {
        await stageDB.update(nextStage.id, { status: 'pending' });
        set(state => ({
          stages: state.stages.map(s => 
            s.id === nextStage.id ? { ...s, status: 'pending' as StageStatus } : s
          )
        }));
      }
    }
  },
  
  completeStage: async (projectId: string, type: StageType) => {
    const stage = get().stages.find(s => s.projectId === projectId && s.type === type);
    
    if (stage) {
      await stageDB.update(stage.id, { status: 'completed' });
      
      set(state => ({
        stages: state.stages.map(s => 
          s.id === stage.id ? { ...s, status: 'completed' as StageStatus } : s
        ),
        currentStage: state.currentStage?.id === stage.id 
          ? { ...state.currentStage, status: 'completed' as StageStatus }
          : state.currentStage
      }));
      
      await get().unlockNextStage(projectId, type);
    }
  }
}));
