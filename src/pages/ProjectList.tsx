import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ProjectCard } from '../components/project/ProjectCard';
import { Modal } from '../components/common/Modal';
import { Textarea } from '../components/common/Input';
import { useProjectStore } from '../stores/projectStore';

export const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const { projects, loadProjects, createProject } = useProjectStore();
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
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
  
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">项目列表</h1>
        <Button onClick={() => setShowNewProject(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新建项目
        </Button>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="搜索项目..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        <Button variant="secondary">
          <Filter className="w-4 h-4 mr-2" />
          筛选
        </Button>
      </div>
      
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">
            {searchTerm ? '没有找到匹配的项目' : '暂无项目'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowNewProject(true)}>
              <Plus className="w-4 h-4 mr-2" />
              创建第一个项目
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => navigate(`/project/${project.id}`)}
            />
          ))}
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
