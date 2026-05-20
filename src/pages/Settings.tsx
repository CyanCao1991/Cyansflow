import React, { useState, useEffect } from 'react';
import { Moon, Sun, Bell, Database, Info, Bot, Settings2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useUIStore } from '../stores/uiStore';
import { setAIConfig, getAIConfig, AIProvider } from '../services/aiProvider';

export const Settings: React.FC = () => {
  const { theme, setTheme } = useUIStore();
  const [aiProvider, setAiProvider] = useState<AIProvider>('template');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const config = getAIConfig();
    setAiProvider(config.provider);
    setApiKey(config.apiKey || '');
    setBaseUrl(config.baseUrl || '');
    setModel(config.model || '');
  }, []);

  const handleSaveAIConfig = () => {
    setAIConfig({
      provider: aiProvider,
      apiKey: apiKey || undefined,
      baseUrl: baseUrl || undefined,
      model: model || undefined,
    });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">设置</h1>
        {showSuccess && (
          <span className="text-sm text-green-400 animate-pulse">
            配置已保存！
          </span>
        )}
      </div>
      
      <Card>
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <Bot className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-gray-100">AI 配置</h2>
              <p className="text-sm text-gray-400">配置 AI 服务提供商和 API</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-100">AI 服务提供商</label>
            <div className="flex items-center space-x-2 bg-gray-900/50 rounded-lg p-1">
              {(['template', 'openai'] as AIProvider[]).map((provider) => (
                <button
                  key={provider}
                  onClick={() => setAiProvider(provider)}
                  className={`px-4 py-2 rounded text-sm transition-all ${
                    aiProvider === provider
                      ? 'bg-primary text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {provider === 'template' ? '模板模式' : provider === 'openai' ? 'OpenAI' : provider}
                </button>
              ))}
            </div>
          </div>

          {aiProvider !== 'template' && (
            <>
              <Input
              label="API Key"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Input
              label="API 基础 URL"
              placeholder="https://api.openai.com/v1"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
            <Input
              label="模型名称"
              placeholder="gpt-4o"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
            </>
          )}

          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveAIConfig}>
              <Settings2 className="w-4 h-4 mr-2" />
              保存配置
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6 border-b border-gray-700/50">
          <h2 className="text-lg font-semibold text-gray-100">外观</h2>
          <p className="text-sm text-gray-400">自定义应用的外观和主题</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-gray-400" />
              ) : (
                <Sun className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-100">主题模式</p>
                <p className="text-xs text-gray-500">
                  {theme === 'dark' ? '深色模式' : '浅色模式'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-gray-900/50 rounded-lg p-1">
              <button
                onClick={() => setTheme('light')}
                className={`px-3 py-1.5 rounded text-sm transition-all ${
                  theme === 'light' ? 'bg-gray-700 text-gray-100' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                浅色
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`px-3 py-1.5 rounded text-sm transition-all ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                深色
              </button>
            </div>
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="p-6 border-b border-gray-700/50">
          <h2 className="text-lg font-semibold text-gray-100">通知</h2>
          <p className="text-sm text-gray-400">管理通知和提醒</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-100">阶段完成提醒</p>
                <p className="text-xs text-gray-500">当项目阶段完成时发送通知</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="p-6 border-b border-gray-700/50">
          <h2 className="text-lg font-semibold text-gray-100">数据管理</h2>
          <p className="text-sm text-gray-400">管理本地存储和数据</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-100">本地存储</p>
                <p className="text-xs text-gray-500">所有数据都保存在本地浏览器中</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">
              清除数据
            </Button>
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="p-6 border-b border-gray-700/50">
          <h2 className="text-lg font-semibold text-gray-100">关于</h2>
          <p className="text-sm text-gray-400">应用信息和版本</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <Info className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-100">甲方PM工作流操作台</p>
              <p className="text-xs text-gray-500">版本 1.0.0</p>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            帮助甲方PM从模糊业务诉求到可交付系统的完整生命周期管理，AI在每个阶段扮演"思考加速器+验证器"角色。
          </p>
        </div>
      </Card>
    </div>
  );
};
