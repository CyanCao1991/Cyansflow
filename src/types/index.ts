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

export interface PromptTemplate {
  qa: string[];
  summary: string[];
  output: string[];
}

export interface StageActivity {
  name: string;
  description: string;
  inputs: string[];
  outputs: string[];
  checklist: string[];
  promptTemplates: PromptTemplate;
}

export interface StageConfig {
  type: StageType;
  name: string;
  icon: string;
  color: string;
  description: string;
  steps: string[];
  activities: StageActivity[];
}

export interface StageProgress {
  stage: StageType;
  status: StageStatus;
  progress: number;
}

// ============================================
// 流程资产地图类型定义
// ============================================

export type AssetNodeType = 
  | 'process'      // 流程节点
  | 'system'       // 系统节点
  | 'data'         // 数据节点
  | 'role'         // 角色节点
  | 'milestone'    // 里程碑节点
  | 'decision'     // 决策节点
  | 'note';        // 备注节点

export interface AssetNode {
  id: string;
  type: AssetNodeType;
  label: string;
  description?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  metadata?: Record<string, any>;
}

export interface AssetEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'solid' | 'dashed' | 'dotted';
  color?: string;
}

export interface AssetMap {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  nodes: AssetNode[];
  edges: AssetEdge[];
  createdAt: number;
  updatedAt: number;
}

export const NODE_TYPE_COLORS: Record<AssetNodeType, string> = {
  process: '#8b5cf6',      // 紫色
  system: '#3b82f6',       // 蓝色
  data: '#10b981',         // 绿色
  role: '#f59e0b',         // 橙色
  milestone: '#ef4444',    // 红色
  decision: '#ec4899',     // 粉色
  note: '#6b7280',         // 灰色
};

export const NODE_TYPE_ICONS: Record<AssetNodeType, string> = {
  process: '🔄',
  system: '💻',
  data: '📊',
  role: '👤',
  milestone: '🎯',
  decision: '⚡',
  note: '📝',
};
