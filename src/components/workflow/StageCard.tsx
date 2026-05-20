import React from 'react';
import { Stage, StageStatus } from '../../types';
import { StageConfig } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Lock, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatDate';

interface StageCardProps {
  stage: Stage;
  config: StageConfig;
  isCurrent: boolean;
  isAccessible: boolean;
  onClick: () => void;
}

export const StageCard: React.FC<StageCardProps> = ({
  stage,
  config,
  isCurrent,
  isAccessible,
  onClick
}) => {
  const getStatusBadge = (status: StageStatus) => {
    const variants: Record<StageStatus, { label: string; variant: any }> = {
      locked: { label: '锁定', variant: 'default' },
      pending: { label: '待开始', variant: 'default' },
      in_progress: { label: '进行中', variant: 'primary' },
      review: { label: '待审核', variant: 'warning' },
      completed: { label: '已完成', variant: 'success' }
    };
    
    const { label, variant } = variants[stage.status];
    return <Badge variant={variant}>{label}</Badge>;
  };
  
  const getStatusIcon = () => {
    switch (stage.status) {
      case 'locked':
        return <Lock className="w-5 h-5 text-gray-500" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-primary" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };
  
  return (
    <Card 
      hover={isAccessible}
      onClick={isAccessible ? onClick : undefined}
      className={`relative overflow-hidden ${
        isCurrent ? 'ring-2 ring-primary/50' : ''
      } ${!isAccessible ? 'opacity-60' : ''}`}
    >
      <div 
        className="absolute top-0 left-0 w-1 h-full"
        style={{ background: config.color }}
      />
      
      <div className="p-4 pl-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: config.color + '20' }}
            >
              <span className="text-lg" style={{ color: config.color }}>
                {config.type === 'business-planning' && '🎯'}
                {config.type === 'process-mapping' && '🔀'}
                {config.type === 'solution-design' && '📋'}
                {config.type === 'system-architecture' && '🏗️'}
                {config.type === 'prototype-design' && '🎨'}
                {config.type === 'detailed-design' && '⚙️'}
                {config.type === 'test-cases' && '✅'}
                {config.type === 'bp-testing' && '🧪'}
                {config.type === 'acceptance' && '✔️'}
                {config.type === 'configuration' && '🔧'}
                {config.type === 'operations' && '📊'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-100">{config.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {isAccessible ? '可进入' : '需先完成前一阶段'}
              </p>
            </div>
          </div>
          {getStatusIcon()}
        </div>
        
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {config.description}
        </p>
        
        <div className="flex items-center justify-between">
          {getStatusBadge(stage.status)}
          {stage.updatedAt > 0 && (
            <span className="text-xs text-gray-500">
              {formatRelativeTime(stage.updatedAt)}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
