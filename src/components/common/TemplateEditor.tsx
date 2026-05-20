import React, { useState } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';
import { Button } from './Button';
import { getActivityWithOverrides, saveActivityTemplate, resetActivityTemplate } from '../../services/templateService';
import { PromptTemplate } from '../../types';

interface TemplateEditorProps {
  stageType: string;
  activityIndex: number;
  activityName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  stageType,
  activityIndex,
  activityName,
  isOpen,
  onClose,
}) => {
  const activity = getActivityWithOverrides(stageType, activityIndex);
  
  const [qaTemplates, setQaTemplates] = useState<string[]>(activity.promptTemplates.qa);
  const [summaryTemplates, setSummaryTemplates] = useState<string[]>(activity.promptTemplates.summary);
  const [outputTemplates, setOutputTemplates] = useState<string[]>(activity.promptTemplates.output);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const template: PromptTemplate = {
      qa: qaTemplates.filter(t => t.trim()),
      summary: summaryTemplates.filter(t => t.trim()),
      output: outputTemplates.filter(t => t.trim()),
    };
    
    saveActivityTemplate(stageType, activityIndex, template);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('确定要重置为默认模板吗？')) {
      resetActivityTemplate(stageType, activityIndex);
      const defaultActivity = getActivityWithOverrides(stageType, activityIndex);
      setQaTemplates(defaultActivity.promptTemplates.qa);
      setSummaryTemplates(defaultActivity.promptTemplates.summary);
      setOutputTemplates(defaultActivity.promptTemplates.output);
    }
  };

  const addTemplate = (
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(prev => [...prev, '']);
  };

  const updateTemplate = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    setter(prev => {
      const newTemplates = [...prev];
      newTemplates[index] = value;
      return newTemplates;
    });
  };

  const removeTemplate = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-100">编辑提示词模板</h2>
            <p className="text-sm text-gray-400 mt-1">{activityName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-blue-400">💬 问答提示词</h3>
                <p className="text-xs text-gray-500">用于与AI进行深入交流探讨</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addTemplate(setQaTemplates)}
              >
                + 添加
              </Button>
            </div>
            <div className="space-y-2">
              {qaTemplates.map((template, index) => (
                <div key={index} className="flex gap-2">
                  <textarea
                    value={template}
                    onChange={(e) => updateTemplate(setQaTemplates, index, e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-900/50 border border-blue-800/30 rounded-lg text-gray-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="输入问答提示词..."
                  />
                  <button
                    onClick={() => removeTemplate(setQaTemplates, index)}
                    className="px-3 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-green-400">📝 总结提示词</h3>
                <p className="text-xs text-gray-500">用于总结归纳讨论内容</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addTemplate(setSummaryTemplates)}
              >
                + 添加
              </Button>
            </div>
            <div className="space-y-2">
              {summaryTemplates.map((template, index) => (
                <div key={index} className="flex gap-2">
                  <textarea
                    value={template}
                    onChange={(e) => updateTemplate(setSummaryTemplates, index, e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-900/50 border border-green-800/30 rounded-lg text-gray-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={2}
                    placeholder="输入总结提示词..."
                  />
                  <button
                    onClick={() => removeTemplate(setSummaryTemplates, index)}
                    className="px-3 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-purple-400">📄 输出物提示词</h3>
                <p className="text-xs text-gray-500">用于基于总结产出正式文档</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addTemplate(setOutputTemplates)}
              >
                + 添加
              </Button>
            </div>
            <div className="space-y-2">
              {outputTemplates.map((template, index) => (
                <div key={index} className="flex gap-2">
                  <textarea
                    value={template}
                    onChange={(e) => updateTemplate(setOutputTemplates, index, e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-900/50 border border-purple-800/30 rounded-lg text-gray-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={2}
                    placeholder="输入输出物提示词..."
                  />
                  <button
                    onClick={() => removeTemplate(setOutputTemplates, index)}
                    className="px-3 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 flex items-center justify-between">
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            重置为默认
          </Button>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              {showSuccess ? '已保存！' : '保存修改'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
