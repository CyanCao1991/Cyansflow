import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '../../stores/uiStore';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { sidebarOpen, sidebarCollapsed } = useUIStore();
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Sidebar />
      
      <div 
        className={`transition-all duration-300 ${sidebarOpen && !sidebarCollapsed ? 'ml-64' : 'ml-16'}`}
      >
        <Header />
        
        <main className="p-6 mt-16">
          {children}
        </main>
      </div>
    </div>
  );
};
