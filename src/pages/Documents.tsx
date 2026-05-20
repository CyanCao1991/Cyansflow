import React from 'react';
import { FileText, Search, Download, Eye } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { STAGES } from '../constants/stages';
import { formatDate } from '../utils/formatDate';

export const Documents: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">文档中心</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4">
            <h3 className="font-medium text-gray-100 mb-4">文档模板</h3>
            <div className="space-y-2">
              {STAGES.map((stage) => (
                <button
                  key={stage.type}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-colors text-left"
                >
                  <span 
                    className="w-2 h-2 rounded-full"
                    style={{ background: stage.color }}
                  />
                  <span className="text-sm text-gray-300">{stage.name}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="搜索文档..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-100 mb-2">暂无文档</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              在项目阶段中创建的文档会自动出现在这里，您也可以从模板库中选择模板开始创建
            </p>
            <Button>从模板创建</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
