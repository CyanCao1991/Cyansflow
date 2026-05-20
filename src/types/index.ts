export type StageType = 
  | 'business-planning'      // 业务规划
  | 'process-mapping'        // 流程梳理
  | 'solution-design'        // 方案设计
  | 'system-architecture'   // 概要设计
  | 'prototype-design'      // 原型设计
  | 'detailed-design'       // 详细设计
  | 'test-cases'            // 用例编写
  | 'bp-testing'            // BP测试
  | 'acceptance'            // 验收
  | 'configuration'         // 配置
  | 'operations';           // 运维

export type ProjectStatus = 'planning' | 'active' | 'completed' | 'archived';
export type StageStatus = 'locked' | 'pending' | 'in_progress' | 'review' | 'completed';
export type AIMode = 'questioning' | 'comparing' | 'validating';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type MessageRole = 'user' | 'ai' | 'system';
export type MessageType = 'question' | 'answer' | 'suggestion' | 'validation';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: number;
  updatedAt: number;
  currentStage: StageType;
}

export interface ProjectMember {
  id: string;
  name: string;
  role: 'admin' | 'member' | 'viewer';
  avatar?: string;
  lastActive: number;
}

export interface Stage {
  id: string;
  projectId: string;
  type: StageType;
  status: StageStatus;
  content: string;
  updatedAt: number;
}

export interface AIMessage {
  id: string;
  role: MessageRole;
  content: string;
  type?: MessageType;
  intentTags?: string[];
  timestamp: number;
}

export interface AIDialogue {
  id: string;
  stageId: string;
  mode: AIMode;
  messages: AIMessage[];
  currentRound: number;
  createdAt: number;
}

export interface Document {
  id: string;
  projectId: string;
  stageId: string;
  title: string;
  content: string;
  version: number;
  createdAt: number;
  updatedAt: number;
}

export interface Task {
  id: string;
  projectId: string;
  stageId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assigneeId?: string;
  dueDate?: number;
  createdAt: number;
}

export interface StageActivity {
  name: string;
  description: string;
  inputs: string[];
  outputs: string[];
  checklist: string[];
  promptTemplates: string[];
}

export interface StageConfig {
  type: StageType;
  name: string;
  icon: string;
  color: string;
  description: string;
  mode: AIMode;
  steps: string[];
  activities: StageActivity[];
}

export interface StageProgress {
  stage: StageType;
  status: StageStatus;
  progress: number;
}
