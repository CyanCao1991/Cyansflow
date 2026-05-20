import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Delete, 
  Edit, 
  MousePointer2, 
  ArrowDown, 
  ArrowUp,
  X,
  Save,
  RefreshCw
} from 'lucide-react';
import { 
  AssetMap, 
  AssetNode, 
  AssetEdge, 
  AssetNodeType, 
  NODE_TYPE_COLORS,
  NODE_TYPE_ICONS 
} from '../types';
import { Button } from './common/Button';

interface AssetMapEditorProps {
  map: AssetMap;
  onUpdate: (updates: Partial<AssetMap>) => void;
  onClose: () => void;
}

type Tool = 'select' | 'process' | 'system' | 'data' | 'role' | 'milestone' | 'decision' | 'note' | 'connect';

export const AssetMapEditor: React.FC<AssetMapEditorProps> = ({ map, onUpdate, onClose }) => {
  const [nodes, setNodes] = useState<AssetNode[]>(map.nodes);
  const [edges, setEdges] = useState<AssetEdge[]>(map.edges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [currentTool, setCurrentTool] = useState<Tool>('select');
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const isPanningRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setNodes(map.nodes);
    setEdges(map.edges);
  }, [map.id]);

  const saveChanges = () => {
    onUpdate({ nodes, edges });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (currentTool !== 'select') return;
    
    const button = e.button;
    if (button === 1 || (button === 0 && e.altKey)) {
      isPanningRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    setSelectedNode(null);
    setSelectedEdge(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanningRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      setPan(p => ({ x: p.x + dx, y: p.y + dy }));
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    isPanningRef.current = false;
  };

  const getCanvasCoords = (e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom,
    };
  };

  const handleNodeMouseDown = (e: React.MouseEvent, node: AssetNode) => {
    e.stopPropagation();
    
    if (currentTool === 'select') {
      setSelectedNode(node.id);
      setIsDragging(true);
      const coords = getCanvasCoords(e);
      setDragOffset({ x: coords.x - node.x, y: coords.y - node.y });
    } else if (currentTool === 'connect') {
      setConnectingFrom(node.id);
    } else {
      addNode(currentTool, getCanvasCoords(e));
    }
  };

  const handleNodeMouseUp = (e: React.MouseEvent, node: AssetNode) => {
    e.stopPropagation();
    
    if (connectingFrom && connectingFrom !== node.id) {
      const newEdge: Omit<AssetEdge, 'id'> = {
        source: connectingFrom,
        target: node.id,
        type: 'solid',
      };
      setEdges(prev => [...prev, {
        ...newEdge,
        id: `edge_${Date.now()}`,
      }]);
      setConnectingFrom(null);
    }
    
    setIsDragging(false);
  };

  const handleNodeMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedNode) return;
    
    const coords = getCanvasCoords(e);
    setNodes(prev => prev.map(n => 
      n.id === selectedNode 
        ? { ...n, x: coords.x - dragOffset.x, y: coords.y - dragOffset.y }
        : n
    ));
  };

  const addNode = (type: AssetNodeType, position: { x: number; y: number }) => {
    const newNode: AssetNode = {
      id: `node_${Date.now()}`,
      type,
      label: `新${getNodeTypeName(type)}`,
      x: position.x - 80,
      y: position.y - 30,
      width: 160,
      height: 60,
    };
    
    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode.id);
    setCurrentTool('select');
  };

  const deleteSelected = () => {
    if (selectedNode) {
      setNodes(prev => prev.filter(n => n.id !== selectedNode));
      setEdges(prev => prev.filter(e => e.source !== selectedNode && e.target !== selectedNode));
      setSelectedNode(null);
    } else if (selectedEdge) {
      setEdges(prev => prev.filter(e => e.id !== selectedEdge));
      setSelectedEdge(null);
    }
  };

  const getNodeTypeName = (type: AssetNodeType) => {
    const names: Record<AssetNodeType, string> = {
      process: '流程',
      system: '系统',
      data: '数据',
      role: '角色',
      milestone: '里程碑',
      decision: '决策',
      note: '备注',
    };
    return names[type];
  };

  const getNodeCenter = (node: AssetNode) => {
    const width = node.width || 160;
    const height = node.height || 60;
    return {
      x: node.x + width / 2,
      y: node.y + height / 2,
    };
  };

  const renderEdgePath = (edge: AssetEdge) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return null;
    
    const source = getNodeCenter(sourceNode);
    const target = getNodeCenter(targetNode);
    
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const cx = source.x + dx / 2;
    const cy = source.y + dy / 2 - Math.min(Math.abs(dx), Math.abs(dy)) / 3;
    
    const path = `M ${source.x} ${source.y} Q ${cx} ${cy} ${target.x} ${target.y}`;
    
    return (
      <g key={edge.id} onClick={() => setSelectedEdge(edge.id)}>
        <path
          d={path}
          fill="none"
          stroke={selectedEdge === edge.id ? '#fff' : edge.color || '#6b7280'}
          strokeWidth={selectedEdge === edge.id ? 3 : 2}
          strokeDasharray={edge.type === 'dashed' ? '5,5' : edge.type === 'dotted' ? '2,2' : undefined}
          className="cursor-pointer"
        />
        <circle
          cx={target.x}
          cy={target.y}
          r={6}
          fill={selectedEdge === edge.id ? '#fff' : edge.color || '#6b7280'}
          className="pointer-events-none"
        />
      </g>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* 顶部工具栏 */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            关闭
          </Button>
          <div className="h-6 w-px bg-gray-600" />
          <h2 className="text-lg font-semibold text-white">{map.name}</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
            <ArrowDown className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
            <ArrowUp className="w-4 h-4" />
          </Button>
          <Button variant="ghost" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <div className="h-6 w-px bg-gray-600 mx-2" />
          <Button onClick={saveChanges}>
            <Save className="w-4 h-4 mr-2" />
            保存
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* 左侧工具面板 */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">工具</h3>
              <div className="grid grid-cols-2 gap-2">
                <ToolButton 
                  icon={<MousePointer2 className="w-4 h-4" />}
                  label="选择"
                  active={currentTool === 'select'}
                  onClick={() => setCurrentTool('select')}
                />
                <ToolButton 
                  icon={<Plus className="w-4 h-4" />}
                  label="连接"
                  active={currentTool === 'connect'}
                  onClick={() => setCurrentTool('connect')}
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">节点类型</h3>
              <div className="space-y-2">
                {(['process', 'system', 'data', 'role', 'milestone', 'decision', 'note'] as AssetNodeType[]).map(type => (
                  <ToolButton
                    key={type}
                    icon={<span className="text-lg">{NODE_TYPE_ICONS[type]}</span>}
                    label={getNodeTypeName(type)}
                    color={NODE_TYPE_COLORS[type]}
                    active={currentTool === type}
                    onClick={() => setCurrentTool(type)}
                  />
                ))}
              </div>
            </div>

            {/* 属性编辑 */}
            {selectedNode && (
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3">节点属性</h3>
                <NodeEditor 
                  node={nodes.find(n => n.id === selectedNode)!}
                  onUpdate={(updates) => setNodes(prev => prev.map(n => 
                    n.id === selectedNode ? { ...n, ...updates } : n
                  ))}
                />
                <Button 
                  variant="ghost" 
                  className="w-full mt-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  onClick={deleteSelected}
                >
                  <Delete className="w-4 h-4 mr-2" />
                  删除节点
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 绘图区域 */}
        <div 
          className="flex-1 overflow-hidden bg-gray-950"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            ref={canvasRef}
            className="w-full h-full cursor-crosshair relative"
            style={{
              backgroundImage: `
                radial-gradient(circle, #374151 1px, transparent 1px)
              `,
              backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
              backgroundPosition: `${pan.x}px ${pan.y}px`,
            }}
            onMouseDown={handleCanvasMouseDown}
            onClick={(e) => {
              if (currentTool !== 'select' && currentTool !== 'connect') {
                addNode(currentTool, getCanvasCoords(e));
              }
            }}
          >
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
              }}
              onMouseMove={handleNodeMouseMove}
              onMouseUp={handleNodeMouseUp}
              className="absolute inset-0"
            >
              {/* 绘制边 */}
              <svg className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
                {edges.map(renderEdgePath)}
              </svg>

              {/* 绘制节点 */}
              {nodes.map(node => (
                <div
                  key={node.id}
                  className={`absolute rounded-lg border-2 cursor-move transition-shadow ${
                    selectedNode === node.id ? 'ring-2 ring-white shadow-xl' : ''
                  }`}
                  style={{
                    left: node.x,
                    top: node.y,
                    width: node.width || 160,
                    height: node.height || 60,
                    backgroundColor: NODE_TYPE_COLORS[node.type] + '20',
                    borderColor: NODE_TYPE_COLORS[node.type],
                    boxShadow: connectingFrom === node.id ? '0 0 0 3px #fff' : undefined,
                  }}
                  onMouseDown={(e) => handleNodeMouseDown(e, node)}
                  onMouseUp={(e) => handleNodeMouseUp(e, node)}
                >
                  <div className="p-3 h-full flex items-center">
                    <span className="text-2xl mr-2">{NODE_TYPE_ICONS[node.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{node.label}</div>
                      {node.description && (
                        <div className="text-xs text-gray-400 truncate">{node.description}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 底部状态栏 */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex items-center justify-between text-xs text-gray-400">
        <div>
          {nodes.length} 个节点 · {edges.length} 条连接
        </div>
        <div>
          提示：按住中键/Alt+左键可平移画布，双击画布添加节点
        </div>
      </div>
    </div>
  );
};

const ToolButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  color?: string;
  onClick: () => void;
}> = ({ icon, label, active, color, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all ${
      active 
        ? 'bg-primary border-primary text-white' 
        : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700'
    }`}
    style={active && color ? { backgroundColor: color + '30', borderColor: color } : undefined}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

const NodeEditor: React.FC<{
  node: AssetNode;
  onUpdate: (updates: Partial<AssetNode>) => void;
}> = ({ node, onUpdate }) => (
  <div className="space-y-3">
    <div>
      <label className="block text-xs text-gray-400 mb-1">标签</label>
      <input
        type="text"
        value={node.label}
        onChange={(e) => onUpdate({ label: e.target.value })}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
      />
    </div>
    <div>
      <label className="block text-xs text-gray-400 mb-1">描述</label>
      <textarea
        value={node.description || ''}
        onChange={(e) => onUpdate({ description: e.target.value })}
        rows={3}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm resize-none"
      />
    </div>
  </div>
);
