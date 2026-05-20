import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { AIChatPanel } from '../components/ai/AIChatPanel';
import { useProjectStore } from '../stores/projectStore';
import { useStageStore } from '../stores/stageStore';
import { useAIStore } from '../stores/aiStore';
import { getStageConfig, STAGES, STAGE_ORDER, getStageIndex } from '../constants/stages';
import { StageType } from '../types';

export const StageDetail: React.FC = () => {
  const { id, stageType } = useParams<{ id: string; stageType: string }>();
  const navigate = useNavigate();
  const { currentProject, updateProject } = useProjectStore();
  const { stages, loadStages, updateStage, completeStage } = useStageStore();
  const { loadDialogues, createDialogue, currentMode } = useAIStore();
  
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [content, setContent] = useState('');
  
  const config = getStageConfig(stageType as StageType);
  const currentStage = stages.find(s => s.projectId === id && s.type === stageType);
  
  useEffect(() => {
    if (id) {
      loadStages(id);
    }
  }, [id, loadStages]);
  
  useEffect(() => {
    if (currentStage) {
      setContent(currentStage.content);
      loadDialogues(currentStage.id);
    }
  }, [currentStage, loadDialogues]);
  
  const handleSave = async () => {
    if (!currentStage) return;
    await updateStage(currentStage.id, { content });
  };
  
  const handleComplete = async () => {
    if (!currentProject || !stageType) return;
    await completeStage(currentProject.id, stageType as StageType);
    await updateStage(currentStage!.id, { status: 'completed' });
    
    // 更新项目的 currentStage 为下一个阶段
    const currentIndex = getStageIndex(stageType as StageType);
    if (currentIndex < STAGE_ORDER.length - 1) {
      const nextStageType = STAGE_ORDER[currentIndex + 1];
      await updateProject(currentProject.id, { currentStage: nextStageType });
    } else {
      // 如果是最后一个阶段，标记项目为完成
      await updateProject(currentProject.id, { status: 'completed' });
    }
    
    // 导航回项目详情页面
    navigate(`/project/${id}`);
  };
  
  if (!config || !currentProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }
  
  const isLocked = currentStage?.status === 'locked';
  
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/project/${id}`)}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-gray-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-100">{config.name}</h1>
            <Badge variant={currentStage?.status === 'completed' ? 'success' : 'primary'}>
              {currentStage?.status === 'completed' ? '已完成' : '进行中'}
            </Badge>
          </div>
          <p className="text-sm text-gray-400 mt-1">{config.description}</p>
        </div>
        <Button variant="secondary" onClick={() => setAiPanelOpen(true)}>
          <Sparkles className="w-4 h-4 mr-2" />
          AI协作
        </Button>
      </div>
      
      {isLocked ? (
        <Card className="p-12 text-center">
          <Lock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-100 mb-2">阶段已锁定</h3>
          <p className="text-gray-400 mb-6">请先完成前一阶段以解锁此阶段</p>
          <Button onClick={() => navigate(`/project/${id}`)}>
            返回项目
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <div className="p-6 border-b border-gray-700/50">
                  <h2 className="text-lg font-semibold text-gray-100">阶段步骤</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {config.steps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                          style={{ background: config.color + '20', color: config.color }}
                        >
                          {index + 1}
                        </div>
                        <span className="text-gray-300">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
              
              <Card>
                <div className="p-6 border-b border-gray-700/50">
                  <h2 className="text-lg font-semibold text-gray-100">内容编辑</h2>
                </div>
                <div className="p-6">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={`在此输入${config.name}的内容...`}
                    className="w-full h-64 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                  <div className="flex justify-end mt-4">
                    <Button onClick={handleSave}>
                      保存内容
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card className="p-4">
                <h3 className="font-medium text-gray-100 mb-4">AI协作模式</h3>
                <div className="space-y-2">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ background: currentMode === 'questioning' ? '#8b5cf620' : '#1f2937' }}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-400">💭</span>
                      <span className={`text-sm ${currentMode === 'questioning' ? 'text-purple-400' : 'text-gray-400'}`}>
                        追问式 - 深挖背景
                      </span>
                    </div>
                  </div>
                  <div 
                    className="p-3 rounded-lg"
                    style={{ background: currentMode === 'comparing' ? '#3b82f620' : '#1f2937' }}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-400">⚖️</span>
                      <span className={`text-sm ${currentMode === 'comparing' ? 'text-blue-400' : 'text-gray-400'}`}>
                        对比式 - 方案选择
                      </span>
                    </div>
                  </div>
                  <div 
                    className="p-3 rounded-lg"
                    style={{ background: currentMode === 'validating' ? '#10b98120' : '#1f2937' }}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400">✓</span>
                      <span className={`text-sm ${currentMode === 'validating' ? 'text-green-400' : 'text-gray-400'}`}>
                        验证式 - 检查完整性
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <h3 className="font-medium text-gray-100 mb-4">阶段操作</h3>
                <div className="space-y-2">
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => setAiPanelOpen(true)}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    开始AI协作
                  </Button>
                  <Button 
                    className="w-full"
                    onClick={handleComplete}
                    disabled={currentStage?.status === 'completed'}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    完成此阶段
                  </Button>
                </div>
              </Card>
            </div>
          </div>
          
          <AIChatPanel
            stageId={currentStage?.id || ''}
            stageType={stageType as StageType}
            isOpen={aiPanelOpen}
            onClose={() => setAiPanelOpen(false)}
          />
        </>
      )}
    </div>
  );
};
