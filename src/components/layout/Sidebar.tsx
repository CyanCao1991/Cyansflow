import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebarCollapse } = useUIStore();
  
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: '工作台' },
    { path: '/projects', icon: FolderKanban, label: '项目列表' },
    { path: '/documents', icon: FileText, label: '文档中心' },
    { path: '/settings', icon: Settings, label: '设置' }
  ];
  
  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-gray-800/50 backdrop-blur border-r border-gray-700/50 transition-all duration-300 z-40 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700/50">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-sm font-bold text-gray-900">PM</span>
              </div>
              <span className="font-bold text-lg">工作流</span>
            </div>
          )}
          <button
            onClick={toggleSidebarCollapse}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-gray-200"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group ${
                  isActive
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>
        
        {!sidebarCollapsed && (
          <div className="px-4 py-4 border-t border-gray-700/50">
            <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-200 mb-1">AI协作助手</div>
              <div className="text-xs text-gray-400">全程陪伴您的需求旅程</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
