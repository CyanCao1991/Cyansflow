import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, FileText, Users } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { StageCard } from '../components/workflow/StageCard';
import { StageProgress } from '../components/workflow/StageProgress';
import { AIChatPanel } from '../components/ai/AIChatPanel';
import { useProjectStore } from '../stores/projectStore';
import { useStageStore } from '../stores/stageStore';
import { useAIStore } from '../stores/aiStore';
import { STAGES, getStageConfig, getStageIndex, canAccessStage } from '../constants/stages';
import { formatDate } from '../utils/formatDate';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProjectById, setCurrentProject, currentProject } = useProjectStore();
  const { stages, loadStages, getStageProgress } = useStageStore();
  const { loadDialogues } = useAIStore();
  
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  
  useEffect(() => {
    if (id) {
      const project = getProjectById(id);
      if (project) {
        setCurrentProject(project);
        loadStages(id);
      } else {
        navigate('/projects');
      }
    }
  }, [id, getProjectById, setCurrentProject, loadStages, navigate]);
  
  const progress = currentProject ? getStageProgress(currentProject.id) : [];
  
  const handleStageClick = async (stageType: string) => {
    if (!currentProject) return;
    
    const stage = stages.find(s => s.projectId === currentProject.id && s.type === stageType);
    if (stage && stage.status !== 'locked') {
      await loadDialogues(stage.id);
      setSelectedStageId(stage.id);
      setAiPanelOpen(true);
    }
  };
  
  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }
  
  const statusConfig = {
    planning: { label: '规划中', variant: 'default' as const },
    active: { label: '进行中', variant: 'primary' as const },
    completed: { label: '已完成', variant: 'success' as const },
    archived: { label: '已归档', variant: 'default' as const }
  };
  
  const currentStageConfig = getStageConfig(currentProject.currentStage);
  const currentStageIndex = getStageIndex(currentProject.currentStage);
  const overallProgress = Math.round((currentStageIndex / (STAGES.length - 1)) * 100);
  
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/projects')}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-gray-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-100">{currentProject.name}</h1>
            <Badge variant={statusConfig[currentProject.status].variant}>
              {statusConfig[currentProject.status].label}
            </Badge>
          </div>
          {currentProject.description && (
            <p className="text-sm text-gray-400 mt-1">{currentProject.description}</p>
          )}
        </div>
        <Button variant="secondary" onClick={() => setAiPanelOpen(true)}>
          <Sparkles className="w-4 h-4 mr-2" />
          AI助手
        </Button>
      </div>
      
      <Card className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">整体进度</span>
            <span className="text-sm font-medium text-gray-100">{overallProgress}%</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${overallProgress}%`,
                background: currentStageConfig?.color || '#6366f1'
              }}
            />
          </div>
        </div>
        
        <StageProgress
          progress={progress}
          currentStage={currentProject.currentStage}
          onStageClick={handleStageClick}
        />
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-100">工作流阶段</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STAGES.map((config) => {
              const stage = stages.find(s => s.projectId === currentProject.id && s.type === config.type);
              const isCurrent = currentProject.currentStage === config.type;
              const isAccessible = canAccessStage(currentProject.currentStage, config.type);
              
              return (
                <StageCard
                  key={config.type}
                  stage={stage || {
                    id: '',
                    projectId: currentProject.id,
                    type: config.type,
                    status: 'locked',
                    content: '',
                    updatedAt: 0
                  }}
                  config={config}
                  isCurrent={isCurrent}
                  isAccessible={isAccessible}
                  onClick={() => handleStageClick(config.type)}
                />
              );
            })}
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-100">项目信息</h2>
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500">创建时间</label>
                <p className="text-sm text-gray-100">{formatDate(currentProject.createdAt)}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">最后更新</label>
                <p className="text-sm text-gray-100">{formatDate(currentProject.updatedAt)}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">当前阶段</label>
                <p className="text-sm text-gray-100">{currentStageConfig?.name || '-'}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-4 h-4 text-gray-400" />
              <h3 className="font-medium text-gray-100">快速操作</h3>
            </div>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                导出需求文档
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                查看项目报告
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                归档项目
              </Button>
            </div>
          </Card>
        </div>
      </div>
      
      <AIChatPanel
        stageId={selectedStageId || ''}
        stageType={currentProject.currentStage}
        isOpen={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
      />
    </div>
  );
};
