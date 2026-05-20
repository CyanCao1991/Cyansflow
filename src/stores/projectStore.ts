import { create } from 'zustand';
import { Project, ProjectStatus, StageType } from '../types';
import { projectDB, stageDB } from '../services/db';
import { STAGE_ORDER } from '../constants/stages';
import { nanoid } from 'nanoid';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  
  loadProjects: () => Promise<void>;
  createProject: (name: string, description: string) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  getProjectById: (id: string) => Project | undefined;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  
  loadProjects: async () => {
    set({ loading: true });
    try {
      const projects = await projectDB.getAll();
      set({ projects: projects.sort((a, b) => b.updatedAt - a.updatedAt), loading: false });
    } catch (error) {
      console.error('Failed to load projects:', error);
      set({ loading: false });
    }
  },
  
  createProject: async (name: string, description: string) => {
    const now = Date.now();
    const project: Project = {
      id: nanoid(),
      name,
      description,
      status: 'planning',
      createdAt: now,
      updatedAt: now,
      currentStage: 'business-planning'
    };
    
    await projectDB.create(project);
    
    for (const stageType of STAGE_ORDER) {
      const stage = {
        id: nanoid(),
        projectId: project.id,
        type: stageType,
        status: stageType === 'business-planning' ? 'pending' as const : 'locked' as const,
        content: '',
        updatedAt: now
      };
      await stageDB.create(stage);
    }
    
    set(state => ({
      projects: [project, ...state.projects]
    }));
    
    return project;
  },
  
  updateProject: async (id: string, updates: Partial<Project>) => {
    await projectDB.update(id, updates);
    set(state => ({
      projects: state.projects.map(p => 
        p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
      ),
      currentProject: state.currentProject?.id === id 
        ? { ...state.currentProject, ...updates, updatedAt: Date.now() }
        : state.currentProject
    }));
  },
  
  deleteProject: async (id: string) => {
    await projectDB.delete(id);
    set(state => ({
      projects: state.projects.filter(p => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject
    }));
  },
  
  setCurrentProject: (project: Project | null) => {
    set({ currentProject: project });
  },
  
  getProjectById: (id: string) => {
    return get().projects.find(p => p.id === id);
  }
}));
