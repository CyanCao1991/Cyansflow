import { ProcessNode as ProcessNodeType } from '../../shared/types';
import { useAppStore } from '../store';
import { Link2, Plus, Lock } from 'lucide-react';

interface ProcessNodeProps {
  node: ProcessNodeType;
  level: number;
}

export default function ProcessNode({ node, level }: ProcessNodeProps) {
  const { selectedNode, setSelectedNode } = useAppStore();
  const isSelected = selectedNode?.id === node.id;
  const isTrunk = node.type === 'trunk';
  const hasFeishuLinks = node.feishuTableLink || node.feishuDocLink;

  const handleSelect = () => {
    setSelectedNode(node);
  };

  return (
    <div className="mb-3">
      <div
        className={`
          relative p-4 rounded-lg border-2 cursor-pointer transition-all
          ${isTrunk 
            ? 'bg-blue-50 border-blue-200 hover:border-blue-400' 
            : 'bg-white border-gray-200 hover:border-blue-300'}
          ${isSelected ? 'border-orange-500 shadow-md ring-2 ring-orange-200' : ''}
        `}
        onClick={handleSelect}
        style={{ marginLeft: `${level * 24}px` }}
      >
        {isTrunk && (
          <div className="absolute -top-2 -left-2">
            <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
              <Lock className="w-3 h-3 text-white" />
            </div>
          </div>
        )}
        
        {hasFeishuLinks && (
          <div className="absolute -top-2 -right-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Link2 className="w-3 h-3 text-white" />
            </div>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-semibold ${isTrunk ? 'text-blue-900' : 'text-gray-800'}`}>
                {node.name}
              </h3>
              <span className={`
                text-xs px-2 py-0.5 rounded-full
                ${isTrunk ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-600'}
              `}>
                {isTrunk ? '主干节点' : '子流程'}
              </span>
            </div>
            {node.description && (
              <p className="text-sm text-gray-600 mb-2">{node.description}</p>
            )}
            <div className="flex gap-4 text-xs text-gray-500">
              <span>部门: {node.department}</span>
              <span>负责人: {node.owner}</span>
            </div>
            {(node.input || node.output) && (
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                {node.input && (
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500">输入: </span>
                    <span className="text-gray-700">{node.input}</span>
                  </div>
                )}
                {node.output && (
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500">输出: </span>
                    <span className="text-gray-700">{node.output}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {node.children.length > 0 && (
        <div className="mt-2">
          {node.children.map(child => (
            <ProcessNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
