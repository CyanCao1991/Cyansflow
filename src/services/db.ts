import Dexie, { Table } from 'dexie';
import { Project, Stage, AIDialogue, Document, Task } from '../types';

class PMWorkflowDB extends Dexie {
  projects!: Table<Project>;
  stages!: Table<Stage>;
  dialogues!: Table<AIDialogue>;
  documents!: Table<Document>;
  tasks!: Table<Task>;

  constructor() {
    super('pm-workflow-db');
    this.version(1).stores({
      projects: 'id, name, status, createdAt',
      stages: 'id, projectId, type, status',
      dialogues: 'id, stageId, mode, createdAt',
      documents: 'id, projectId, stageId, title, createdAt',
      tasks: 'id, projectId, stageId, status'
    });
  }
}

export const db = new PMWorkflowDB();

export const projectDB = {
  async getAll(): Promise<Project[]> {
    return db.projects.toArray();
  },
  
  async getById(id: string): Promise<Project | undefined> {
    return db.projects.get(id);
  },
  
  async create(project: Project): Promise<string> {
    return db.projects.add(project);
  },
  
  async update(id: string, updates: Partial<Project>): Promise<number> {
    return db.projects.update(id, { ...updates, updatedAt: Date.now() });
  },
  
  async delete(id: string): Promise<void> {
    await db.projects.delete(id);
  }
};

export const stageDB = {
  async getByProject(projectId: string): Promise<Stage[]> {
    return db.stages.where('projectId').equals(projectId).toArray();
  },
  
  async getById(id: string): Promise<Stage | undefined> {
    return db.stages.get(id);
  },
  
  async getByType(projectId: string, type: string): Promise<Stage | undefined> {
    return db.stages.where({ projectId, type }).first();
  },
  
  async create(stage: Stage): Promise<string> {
    return db.stages.add(stage);
  },
  
  async update(id: string, updates: Partial<Stage>): Promise<number> {
    return db.stages.update(id, { ...updates, updatedAt: Date.now() });
  }
};

export const dialogueDB = {
  async getByStage(stageId: string): Promise<AIDialogue[]> {
    return db.dialogues.where('stageId').equals(stageId).toArray();
  },
  
  async create(dialogue: AIDialogue): Promise<string> {
    return db.dialogues.add(dialogue);
  },
  
  async update(id: string, updates: Partial<AIDialogue>): Promise<number> {
    return db.dialogues.update(id, updates);
  }
};

export const documentDB = {
  async getByProject(projectId: string): Promise<Document[]> {
    return db.documents.where('projectId').equals(projectId).toArray();
  },
  
  async getByStage(stageId: string): Promise<Document[]> {
    return db.documents.where('stageId').equals(stageId).toArray();
  },
  
  async getById(id: string): Promise<Document | undefined> {
    return db.documents.get(id);
  },
  
  async create(doc: Document): Promise<string> {
    return db.documents.add(doc);
  },
  
  async update(id: string, updates: Partial<Document>): Promise<number> {
    return db.documents.update(id, { ...updates, updatedAt: Date.now() });
  },
  
  async delete(id: string): Promise<void> {
    await db.documents.delete(id);
  }
};

export const taskDB = {
  async getByProject(projectId: string): Promise<Task[]> {
    return db.tasks.where('projectId').equals(projectId).toArray();
  },
  
  async getByStage(stageId: string): Promise<Task[]> {
    return db.tasks.where('stageId').equals(stageId).toArray();
  },
  
  async create(task: Task): Promise<string> {
    return db.tasks.add(task);
  },
  
  async update(id: string, updates: Partial<Task>): Promise<number> {
    return db.tasks.update(id, updates);
  },
  
  async delete(id: string): Promise<void> {
    await db.tasks.delete(id);
  }
};
