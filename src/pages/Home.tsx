import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, FileText, Clock, Sparkles } from 'lucide-react';
import { Card, CardBody } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input, Textarea } from '../components/common/Input';
import { useProjectStore } from '../stores/projectStore';
import { formatRelativeTime } from '../utils/formatDate';
import { getStageConfig } from '../constants/stages';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { projects, loadProjects, createProject } = useProjectStore();
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);
  
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    
    const project = await createProject(newProjectName, newProjectDesc);
    setShowNewProject(false);
    setNewProjectName('');
    setNewProjectDesc('');
    navigate(`/project/${project.id}`);
  };
  
  const activeProjects = projects.filter(p => p.status === 'active');
  const recentProjects = projects.slice(0, 3);
  
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-100">{projects.length}</p>
              <p className="text-sm text-gray-400">总项目数</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-100">{activeProjects.length}</p>
              <p className="text-sm text-gray-400">进行中</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-100">
                {projects.filter(p => p.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-400">已完成</p>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-100">欢迎回来</h2>
        <Button onClick={() => setShowNewProject(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新建项目
        </Button>
      </div>
      
      {projects.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-gray-100 mb-2">开始您的第一个项目</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            使用AI协作工作流，从模糊的业务诉求到清晰可交付的系统需求文档
          </p>
          <Button onClick={() => setShowNewProject(true)}>
            <Plus className="w-4 h-4 mr-2" />
            创建第一个项目
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentProjects.map(project => {
            const stageConfig = getStageConfig(project.currentStage);
            return (
              <Card 
                key={project.id} 
                hover 
                onClick={() => navigate(`/project/${project.id}`)}
                className="p-5 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-100 mb-1">{project.name}</h3>
                    <Badge variant={project.status === 'active' ? 'primary' : 'default'}>
                      {project.status === 'active' ? '进行中' : project.status}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {project.description || '暂无描述'}
                </p>
                
                {stageConfig && (
                  <div 
                    className="inline-flex items-center space-x-2 text-xs px-2 py-1 rounded"
                    style={{ background: stageConfig.color + '20', color: stageConfig.color }}
                  >
                    <span>当前阶段：{stageConfig.name}</span>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-3">
                  {formatRelativeTime(project.updatedAt)}
                </p>
              </Card>
            );
          })}
        </div>
      )}
      
      <Modal
        isOpen={showNewProject}
        onClose={() => setShowNewProject(false)}
        title="创建新项目"
      >
        <div className="space-y-4">
          <Input
            label="项目名称"
            placeholder="请输入项目名称"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
          <Textarea
            label="项目描述"
            placeholder="请简要描述项目背景和目标"
            value={newProjectDesc}
            onChange={(e) => setNewProjectDesc(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" onClick={() => setShowNewProject(false)}>
              取消
            </Button>
            <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
              创建项目
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
