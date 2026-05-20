import { useState, useEffect } from 'react';
import { ProcessNode } from '../../shared/types';
import { useAppStore } from '../store';
import { updateNode, addSubNode } from '../lib/api';
import { Plus, Save, Link2 } from 'lucide-react';

interface NodeDetailPanelProps {
  processId: string;
}

export default function NodeDetailPanel({ processId }: NodeDetailPanelProps) {
  const { selectedNode, selectedProcess, updateSelectedProcess, setSelectedNode } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<ProcessNode>>({});
  const [isAddingSub, setIsAddingSub] = useState(false);
  const [newSubData, setNewSubData] = useState({
    name: '',
    department: '',
    owner: '',
    description: '',
    input: '',
    output: '',
  });

  useEffect(() => {
    if (selectedNode) {
      setEditData(selectedNode);
      setIsEditing(false);
    }
  }, [selectedNode]);

  const handleSave = async () => {
    if (!selectedNode) return;
    try {
      const updatedProcess = await updateNode(processId, selectedNode.id, editData);
      updateSelectedProcess(updatedProcess);
      const findNode = (nodes: ProcessNode[]): ProcessNode | null => {
        for (const node of nodes) {
          if (node.id === selectedNode.id) return node;
          const found = findNode(node.children);
          if (found) return found;
        }
        return null;
      };
      const newSelectedNode = findNode(updatedProcess.trunkNodes);
      if (newSelectedNode) {
        setSelectedNode(newSelectedNode);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update node:', error);
    }
  };

  const handleAddSub = async () => {
    if (!selectedNode) return;
    try {
      const updatedProcess = await addSubNode(processId, selectedNode.id, newSubData);
      updateSelectedProcess(updatedProcess);
      setIsAddingSub(false);
      setNewSubData({
        name: '',
        department: '',
        owner: '',
        description: '',
        input: '',
        output: '',
      });
    } catch (error) {
      console.error('Failed to add sub node:', error);
    }
  };

  if (!selectedNode) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📋</div>
          <p>选择一个节点查看详情</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-gray-50">
        <h2 className="font-semibold text-gray-800">节点详情</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">节点名称</label>
                <input
                  type="text"
                  value={editData.name || ''}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">部门</label>
                <input
                  type="text"
                  value={editData.department || ''}
                  onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">负责人</label>
                <input
                  type="text"
                  value={editData.owner || ''}
                  onChange={(e) => setEditData({ ...editData, owner: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={editData.description || ''}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">输入</label>
                <input
                  type="text"
                  value={editData.input || ''}
                  onChange={(e) => setEditData({ ...editData, input: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">输出</label>
                <input
                  type="text"
                  value={editData.output || ''}
                  onChange={(e) => setEditData({ ...editData, output: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  飞书链接
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">多维表格链接</label>
                    <input
                      type="text"
                      value={editData.feishuTableLink || ''}
                      onChange={(e) => setEditData({ ...editData, feishuTableLink: e.target.value })}
                      placeholder="https://feishu.cn/..."
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">文档链接</label>
                    <input
                      type="text"
                      value={editData.feishuDocLink || ''}
                      onChange={(e) => setEditData({ ...editData, feishuDocLink: e.target.value })}
                      placeholder="https://feishu.cn/..."
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">节点名称</label>
                <p className="text-gray-800">{selectedNode.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">部门</label>
                <p className="text-gray-800">{selectedNode.department}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">负责人</label>
                <p className="text-gray-800">{selectedNode.owner}</p>
              </div>
              {selectedNode.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">描述</label>
                  <p className="text-gray-800">{selectedNode.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">输入</label>
                  <p className="text-gray-800">{selectedNode.input || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">输出</label>
                  <p className="text-gray-800">{selectedNode.output || '-'}</p>
                </div>
              </div>
              {(selectedNode.feishuTableLink || selectedNode.feishuDocLink) && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    飞书链接
                  </h3>
                  <div className="space-y-2">
                    {selectedNode.feishuTableLink && (
                      <a
                        href={selectedNode.feishuTableLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-blue-600 hover:text-blue-800 truncate"
                      >
                        📊 多维表格
                      </a>
                    )}
                    {selectedNode.feishuDocLink && (
                      <a
                        href={selectedNode.feishuDocLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-blue-600 hover:text-blue-800 truncate"
                      >
                        📄 文档
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {isAddingSub && (
          <div className="pt-4 border-t mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">添加子流程</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="子流程名称"
                value={newSubData.name}
                onChange={(e) => setNewSubData({ ...newSubData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="部门"
                value={newSubData.department}
                onChange={(e) => setNewSubData({ ...newSubData, department: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="负责人"
                value={newSubData.owner}
                onChange={(e) => setNewSubData({ ...newSubData, owner: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <textarea
                placeholder="描述"
                value={newSubData.description}
                onChange={(e) => setNewSubData({ ...newSubData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-gray-50 space-y-2">
        {isEditing ? (
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            编辑
          </button>
        )}
        
        {!isAddingSub ? (
          <button
            onClick={() => setIsAddingSub(true)}
            className="w-full flex items-center justify-center gap-2 border border-orange-500 text-orange-600 py-2 px-4 rounded-lg hover:bg-orange-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加子流程
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleAddSub}
              className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
            >
              确认添加
            </button>
            <button
              onClick={() => setIsAddingSub(false)}
              className="flex-1 border border-gray-300 text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
            >
              取消
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
