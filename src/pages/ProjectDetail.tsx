import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Users, Map, Plus, Edit, Trash2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { StageCard } from '../components/workflow/StageCard';
import { StageProgress } from '../components/workflow/StageProgress';
import { AssetMapEditor } from '../components/AssetMapEditor';
import { useProjectStore } from '../stores/projectStore';
import { useStageStore } from '../stores/stageStore';
import { STAGES, getStageConfig, getStageIndex, canAccessStage } from '../constants/stages';
import { formatDate } from '../utils/formatDate';
import { 
  getAssetMapsByProject, 
  createAssetMap, 
  updateAssetMap, 
  deleteAssetMap, 
  duplicateAssetMap 
} from '../services/assetMapService';
import { AssetMap } from '../types';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProjectById, setCurrentProject, currentProject } = useProjectStore();
  const { stages, loadStages, getStageProgress } = useStageStore();
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [assetMaps, setAssetMaps] = useState<AssetMap[]>([]);
  const [selectedMap, setSelectedMap] = useState<AssetMap | null>(null);
  const [activeTab, setActiveTab] = useState<'workflow' | 'assets'>('workflow');
  
  useEffect(() => {
    if (id) {
      const project = getProjectById(id);
      if (project) {
        setCurrentProject(project);
        loadStages(id);
        setAssetMaps(getAssetMapsByProject(id));
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
      navigate(`/project/${currentProject.id}/stage/${stageType}`);
    }
  };
  
  const handleCreateMap = () => {
    if (!currentProject) return;
    
    const mapName = `流程地图 ${assetMaps.length + 1}`;
    const newMap = createAssetMap(currentProject.id, mapName, '流程梳理和业务管理地图');
    setAssetMaps(prev => [...prev, newMap]);
    setSelectedMap(newMap);
  };
  
  const handleUpdateMap = (mapId: string, updates: Partial<AssetMap>) => {
    const updated = updateAssetMap(mapId, updates);
    if (updated) {
      setAssetMaps(prev => prev.map(m => m.id === mapId ? updated : m));
      setSelectedMap(updated);
    }
  };
  
  const handleDeleteMap = (mapId: string) => {
    if (window.confirm('确定要删除这个流程地图吗？')) {
      deleteAssetMap(mapId);
      setAssetMaps(prev => prev.filter(m => m.id !== mapId));
    }
  };
  
  const handleDuplicateMap = (mapId: string) => {
    const duplicated = duplicateAssetMap(mapId);
    if (duplicated) {
      setAssetMaps(prev => [...prev, duplicated]);
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
    <>
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
        </div>
        
        {/* 导航标签 */}
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('workflow')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'workflow' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>工作流</span>
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'assets' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>流程资产地图</span>
            {assetMaps.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-purple-600 text-xs rounded-full">{assetMaps.length}</span>
            )}
          </button>
        </div>
        
        {/* 工作流标签页 */}
        {activeTab === 'workflow' && (
          <>
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
          </>
        )}
        
        {/* 流程资产地图标签页 */}
        {activeTab === 'assets' && (
          <>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-100">流程资产地图</h2>
                  <p className="text-sm text-gray-400 mt-1">用于业务梳理、系统规划和流程管理的可视化工具</p>
                </div>
                <Button onClick={handleCreateMap}>
                  <Plus className="w-4 h-4 mr-2" />
                  创建地图
                </Button>
              </div>
              
              {assetMaps.length === 0 ? (
                <div className="text-center py-12">
                  <Map className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">还没有流程地图</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    创建一个流程地图来可视化你的业务流程、系统架构和数据流向
                  </p>
                  <Button onClick={handleCreateMap}>
                    <Plus className="w-4 h-4 mr-2" />
                    创建第一个地图
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assetMaps.map(map => (
                    <Card key={map.id} className="p-4 group hover:border-purple-500/50 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Map className="w-4 h-4 text-purple-400" />
                          <h3 className="font-medium text-gray-100 truncate">{map.name}</h3>
                        </div>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleDuplicateMap(map.id)}
                            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200"
                            title="复制"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => handleDeleteMap(map.id)}
                            className="p-1 hover:bg-red-900/30 rounded text-gray-400 hover:text-red-400"
                            title="删除"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      {map.description && (
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{map.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span>{map.nodes.length} 个节点 · {map.edges.length} 条连接</span>
                        <span>{formatDate(map.updatedAt)}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button className="flex-1" onClick={() => setSelectedMap(map)}>
                          <Edit className="w-4 h-4 mr-2" />
                          编辑
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
      
      {/* 流程地图编辑器弹窗 */}
      {selectedMap && (
        <AssetMapEditor
          map={selectedMap}
          onUpdate={(updates) => handleUpdateMap(selectedMap.id, updates)}
          onClose={() => setSelectedMap(null)}
        />
      )}
    </>
  );
};
