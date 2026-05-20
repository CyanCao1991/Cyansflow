import React from 'react';
import { Project } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { formatRelativeTime } from '../../utils/formatDate';
import { getStageConfig, getStageIndex } from '../../constants/stages';
import { Calendar, Clock, MoreVertical } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const currentStageConfig = getStageConfig(project.currentStage);
  const stageIndex = getStageIndex(project.currentStage);
  const totalStages = 11;
  const progress = Math.round((stageIndex / (totalStages - 1)) * 100);
  
  const statusConfig = {
    planning: { label: '规划中', variant: 'default' as const },
    active: { label: '进行中', variant: 'primary' as const },
    completed: { label: '已完成', variant: 'success' as const },
    archived: { label: '已归档', variant: 'default' as const }
  };
  
  const status = statusConfig[project.status];
  
  return (
    <Card hover onClick={onClick} className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-100 mb-1 group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-2">
            {project.description || '暂无描述'}
          </p>
        </div>
        <button className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-gray-200">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex items-center space-x-4 mb-4">
        <Badge variant={status.variant}>
          {status.label}
        </Badge>
        {currentStageConfig && (
          <div 
            className="flex items-center space-x-1 text-xs px-2 py-1 rounded"
            style={{ background: currentStageConfig.color + '20', color: currentStageConfig.color }}
          >
            <span>{currentStageConfig.name}</span>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>项目进度</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${progress}%`,
              background: currentStageConfig?.color || '#6366f1'
            }}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatRelativeTime(project.createdAt)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatRelativeTime(project.updatedAt)}</span>
        </div>
      </div>
    </Card>
  );
};
