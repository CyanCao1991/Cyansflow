import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useProjectStore } from '../../stores/projectStore';

export const Header: React.FC = () => {
  const location = useLocation();
  const { theme, setTheme } = useUIStore();
  const { currentProject } = useProjectStore();
  
  const getPageTitle = () => {
    if (currentProject) {
      if (location.pathname.includes('/stage/')) {
        return currentProject.name;
      }
    }
    
    const titles: Record<string, string> = {
      '/': '工作台',
      '/projects': '项目列表',
      '/documents': '文档中心',
      '/settings': '设置'
    };
    
    return titles[location.pathname] || '工作台';
  };
  
  return (
    <header className="fixed top-0 right-0 h-16 bg-gray-900/80 backdrop-blur border-b border-gray-700/50 z-30 flex items-center justify-between px-6 transition-all duration-300">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-gray-100">{getPageTitle()}</h1>
        {currentProject && location.pathname.includes('/stage/') && (
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            {currentProject.status === 'active' ? '进行中' : currentProject.status}
          </span>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="搜索项目、文档..."
            className="w-64 pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-gray-200"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
        
        <button className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-gray-200">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
          P
        </div>
      </div>
    </header>
  );
};
