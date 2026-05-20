import { StageConfig, StageType } from '../types';

export const STAGES: StageConfig[] = [
  {
    type: 'business-planning',
    name: '业务规划',
    icon: 'Target',
    color: '#8b5cf6',
    description: '从模糊意图到清晰的业务目标和范围',
    mode: 'questioning',
    steps: ['明确业务背景与痛点', '定义业务目标(SMART)', '划定业务边界', '利益相关方分析', '输出业务规划书']
  },
  {
    type: 'process-mapping',
    name: '流程梳理',
    icon: 'GitBranch',
    color: '#06b6d4',
    description: '把现状和目标流程画清楚',
    mode: 'questioning',
    steps: ['现状流程(AS-IS)描述', '痛点标注', '目标流程(TO-BE)设计', '差异分析(GAP)', '流程泳道图', '输出流程文档']
  },
  {
    type: 'solution-design',
    name: '方案设计',
    icon: 'FileText',
    color: '#f59e0b',
    description: '从流程到可落地的业务规则',
    mode: 'comparing',
    steps: ['业务规则提取', '数据实体识别', '角色权限矩阵', '异常与边界场景', '输出业务方案说明书']
  },
  {
    type: 'system-architecture',
    name: '概要设计',
    icon: 'Layers',
    color: '#3b82f6',
    description: '业务方案翻译为技术架构语言',
    mode: 'comparing',
    steps: ['系统架构选型', '模块划分', '技术约束标注', '集成与接口', '输出概要设计文档']
  },
  {
    type: 'prototype-design',
    name: '原型设计',
    icon: 'Layout',
    color: '#ec4899',
    description: '可视化用户体验',
    mode: 'comparing',
    steps: ['页面清单', '信息架构', '交互流程', '线框图生成', '输出原型+交互说明']
  },
  {
    type: 'detailed-design',
    name: '详细设计',
    icon: 'Database',
    color: '#14b8a6',
    description: '概要设计细化为可开发交付物',
    mode: 'validating',
    steps: ['数据库设计', '接口详细设计', '状态机设计', '配置项定义', '输出详细设计文档']
  },
  {
    type: 'test-cases',
    name: '用例编写',
    icon: 'CheckSquare',
    color: '#84cc16',
    description: '测试用例覆盖所有业务场景',
    mode: 'validating',
    steps: ['正向用例', '异常用例', '数据驱动用例', '用例矩阵', '输出测试用例集']
  },
  {
    type: 'bp-testing',
    name: 'BP测试',
    icon: 'TestTube',
    color: '#f97316',
    description: '验证业务流程端到端走通',
    mode: 'validating',
    steps: ['测试场景编排', '测试执行记录', '缺陷分析', '回归策略', '输出BP测试报告']
  },
  {
    type: 'acceptance',
    name: '验收',
    icon: 'ClipboardCheck',
    color: '#22c55e',
    description: '正式确认系统满足业务要求',
    mode: 'validating',
    steps: ['验收标准制定', '验收场景编写', '验收执行', '遗留问题清单', '输出验收报告']
  },
  {
    type: 'configuration',
    name: '配置',
    icon: 'Settings',
    color: '#6366f1',
    description: '系统参数配置对接实际业务',
    mode: 'validating',
    steps: ['配置清单梳理', '配置值设定', '配置验证', '输出配置手册']
  },
  {
    type: 'operations',
    name: '运维',
    icon: 'Server',
    color: '#71717a',
    description: '上线后的持续保障',
    mode: 'validating',
    steps: ['运维场景梳理', '应急预案', '知识库建设', '输出运维手册']
  }
];

export const STAGE_ORDER: StageType[] = STAGES.map(s => s.type);

export const getStageIndex = (type: StageType): number => STAGE_ORDER.indexOf(type);

export const getStageConfig = (type: StageType): StageConfig | undefined => 
  STAGES.find(s => s.type === type);

export const getStageProgress = (currentStage: StageType): number => {
  const index = getStageIndex(currentStage);
  return Math.round((index / (STAGES.length - 1)) * 100);
};

export const canAccessStage = (currentStage: StageType, targetStage: StageType): boolean => {
  const currentIndex = getStageIndex(currentStage);
  const targetIndex = getStageIndex(targetStage);
  return targetIndex <= currentIndex + 1;
};
