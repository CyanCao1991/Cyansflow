import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { fetchTemplates, createProcessFromTemplate } from '../lib/api';
import { FileText, Plus, ArrowRight } from 'lucide-react';

export default function Templates() {
  const navigate = useNavigate();
  const { templates, setTemplates } = useAppStore();
  const [isCreating, setIsCreating] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await fetchTemplates();
      setTemplates(data);
    };
    load();
  }, [setTemplates]);

  const handleCreateProcess = async (templateId: string) => {
    setIsCreating(templateId);
    try {
      const newProcess = await createProcessFromTemplate(templateId);
      navigate(`/processes/${newProcess.id}`);
    } catch (error) {
      console.error('Failed to create process:', error);
    } finally {
      setIsCreating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">流程模板库</h1>
          <p className="text-gray-600">从模板创建新的业务流程</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  可用
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {template.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{template.code}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-20">版本:</span>
                  <span className="font-medium">{template.version}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-20">节点数:</span>
                  <span className="font-medium">{template.trunkNodes.length} 个</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-20">所有者:</span>
                  <span className="font-medium">{template.owner}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-gray-500 mb-3">主干节点:</p>
                <div className="flex flex-wrap gap-2">
                  {template.trunkNodes.map((node) => (
                    <span
                      key={node.id}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {node.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4">
              <button
                onClick={() => handleCreateProcess(template.id)}
                disabled={isCreating === template.id}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isCreating === template.id ? (
                  '创建中...'
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    使用此模板
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无模板</h3>
          <p className="text-gray-500">请联系管理员添加流程模板</p>
        </div>
      )}
    </div>
  );
}
