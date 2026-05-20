import React from 'react';
import { AIMode } from '../../types';
import { HelpCircle, GitCompare, CheckCircle } from 'lucide-react';

interface ModeSwitcherProps {
  currentMode: AIMode;
  onModeChange: (mode: AIMode) => void;
}

const modes = [
  {
    type: 'questioning' as AIMode,
    label: '追问式',
    icon: HelpCircle,
    description: '深挖业务背景',
    color: '#8b5cf6'
  },
  {
    type: 'comparing' as AIMode,
    label: '对比式',
    icon: GitCompare,
    description: '方案对比选择',
    color: '#3b82f6'
  },
  {
    type: 'validating' as AIMode,
    label: '验证式',
    icon: CheckCircle,
    description: '检查完整性',
    color: '#10b981'
  }
];

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({
  currentMode,
  onModeChange
}) => {
  return (
    <div className="flex items-center space-x-2 bg-gray-900/50 rounded-lg p-1">
      {modes.map((mode) => {
        const isActive = currentMode === mode.type;
        const Icon = mode.icon;
        
        return (
          <button
            key={mode.type}
            onClick={() => onModeChange(mode.type)}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all ${
              isActive
                ? 'bg-gray-800 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            style={{
              background: isActive ? mode.color + '20' : undefined,
              color: isActive ? mode.color : undefined
            }}
          >
            <Icon className="w-4 h-4" />
            <span className="text-xs font-medium hidden md:inline">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
};
