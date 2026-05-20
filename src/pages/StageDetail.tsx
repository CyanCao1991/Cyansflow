import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Lock, Edit2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { TemplateEditor } from '../components/common/TemplateEditor';
import { useProjectStore } from '../stores/projectStore';
import { useStageStore } from '../stores/stageStore';
import { getStageConfig, STAGE_ORDER, getStageIndex } from '../constants/stages';
import { StageType } from '../types';

export const StageDetail: React.FC = () => {
  const { id, stageType } = useParams<{ id: string; stageType: string }>();
  const navigate = useNavigate();
  const { currentProject, updateProject } = useProjectStore();
  const { stages, loadStages, updateStage, completeStage } = useStageStore();
  
  const [content, setContent] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<{
    stageType: string;
    activityIndex: number;
    activityName: string;
  } | null>(null);
  
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
    }
  }, [currentStage]);
  
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
              
              {config.activities && config.activities.length > 0 && (
                <Card>
                  <div className="p-6 border-b border-gray-700/50">
                    <h2 className="text-lg font-semibold text-gray-100">关键活动</h2>
                    <p className="text-sm text-gray-400 mt-1">此阶段的详细活动指引</p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      {config.activities.map((activity, index) => (
                        <div key={index} className="border border-gray-700/50 rounded-lg overflow-hidden">
                          <div 
                            className="px-4 py-3 font-medium flex items-center justify-between"
                            style={{ background: config.color + '10', color: config.color }}
                          >
                            <div className="flex items-center space-x-2">
                              <span>{index + 1}.</span>
                              <span>{activity.name}</span>
                            </div>
                            <button
                              onClick={() => setEditingTemplate({
                                stageType: stageType as string,
                                activityIndex: index,
                                activityName: activity.name,
                              })}
                              className="p-1 hover:bg-white/10 rounded transition-colors"
                              title="编辑提示词模板"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="p-4 space-y-4">
                            <p className="text-sm text-gray-400">{activity.description}</p>
                            
                            {activity.inputs && activity.inputs.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-300 mb-2">📥 输入</h4>
                                <div className="flex flex-wrap gap-2">
                                  {activity.inputs.map((input, i) => (
                                    <span key={i} className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded">
                                      {input}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {activity.outputs && activity.outputs.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-300 mb-2">📤 输出</h4>
                                <div className="flex flex-wrap gap-2">
                                  {activity.outputs.map((output, i) => (
                                    <span key={i} className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded">
                                      {output}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {activity.checklist && activity.checklist.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-300 mb-2">✅ Checklist</h4>
                                <ul className="space-y-1">
                                  {activity.checklist.map((item, i) => (
                                    <li key={i} className="text-sm text-gray-400 flex items-start space-x-2">
                                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0"></span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {activity.promptTemplates && (
                              <div className="space-y-4">
                                {activity.promptTemplates.qa && activity.promptTemplates.qa.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-300 mb-2">💬 问答提示词</h4>
                                    <p className="text-xs text-gray-500 mb-2">用于与AI进行问答交流，深入探讨此活动</p>
                                    <div className="space-y-2">
                                      {activity.promptTemplates.qa.map((prompt, i) => (
                                        <div key={`qa-${i}`} className="p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
                                          <p className="text-sm text-blue-300">{prompt}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {activity.promptTemplates.summary && activity.promptTemplates.summary.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-300 mb-2">📝 总结提示词</h4>
                                    <p className="text-xs text-gray-500 mb-2">用于总结问答记录，形成清晰认知</p>
                                    <div className="space-y-2">
                                      {activity.promptTemplates.summary.map((prompt, i) => (
                                        <div key={`summary-${i}`} className="p-3 bg-green-900/20 border border-green-800/30 rounded-lg">
                                          <p className="text-sm text-green-300">{prompt}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {activity.promptTemplates.output && activity.promptTemplates.output.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-300 mb-2">📄 输出物提示词</h4>
                                    <p className="text-xs text-gray-500 mb-2">用于基于总结结果，产出正式文档</p>
                                    <div className="space-y-2">
                                      {activity.promptTemplates.output.map((prompt, i) => (
                                        <div key={`output-${i}`} className="p-3 bg-purple-900/20 border border-purple-800/30 rounded-lg">
                                          <p className="text-sm text-purple-300">{prompt}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
              
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
                <h3 className="font-medium text-gray-100 mb-4">阶段操作</h3>
                <div className="space-y-2">
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
        </>
      )}
      
      {editingTemplate && (
        <TemplateEditor
          stageType={editingTemplate.stageType}
          activityIndex={editingTemplate.activityIndex}
          activityName={editingTemplate.activityName}
          isOpen={true}
          onClose={() => setEditingTemplate(null)}
        />
      )}
    </div>
  );
};
