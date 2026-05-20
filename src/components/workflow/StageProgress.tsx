import React from 'react';
import { StageProgress as StageProgressType } from '../../types';
import { STAGES } from '../../constants/stages';
import { Lock, Circle, CheckCircle2 } from 'lucide-react';

interface StageProgressProps {
  progress: StageProgressType[];
  currentStage: string;
  onStageClick: (stageType: string) => void;
}

export const StageProgress: React.FC<StageProgressProps> = ({
  progress,
  currentStage,
  onStageClick
}) => {
  return (
    <div className="relative">
      <div className="flex items-center justify-between overflow-x-auto pb-4">
        {progress.map((item, index) => {
          const config = STAGES.find(s => s.type === item.stage);
          if (!config) return null;
          
          const isCompleted = item.status === 'completed';
          const isCurrent = item.stage === currentStage;
          const isLocked = item.status === 'locked';
          const isPending = item.status === 'pending' || item.status === 'in_progress';
          
          return (
            <div key={item.stage} className="flex flex-col items-center min-w-0">
              <div 
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isLocked 
                    ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                    : isCompleted
                    ? 'bg-green-500/20 text-green-400 cursor-pointer hover:scale-110'
                    : isCurrent
                    ? 'bg-primary/20 text-primary cursor-pointer hover:scale-110'
                    : 'bg-gray-700 text-gray-400 cursor-pointer hover:scale-110'
                }`}
                style={{
                  background: !isLocked && !isCompleted && !isCurrent 
                    ? config.color + '20' 
                    : undefined,
                  color: !isLocked && !isCompleted && !isCurrent 
                    ? config.color 
                    : undefined
                }}
                onClick={() => !isLocked && onStageClick(item.stage)}
              >
                {isLocked ? (
                  <Lock className="w-4 h-4" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isCurrent ? (
                  <Circle className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>
              
              <div className="mt-2 text-center">
                <div className={`text-xs font-medium truncate max-w-20 ${
                  isCurrent ? 'text-primary' : 'text-gray-400'
                }`}>
                  {config.name}
                </div>
              </div>
              
              {index < progress.length - 1 && (
                <div 
                  className={`absolute top-5 left-full w-full h-0.5 -translate-y-1/2 ${
                    isCompleted ? 'bg-green-500/50' : 'bg-gray-700/50'
                  }`}
                  style={{ width: 'calc(100% - 2.5rem)' }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
