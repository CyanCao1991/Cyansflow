import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-xl">
                工
              </div>
              <div>
                <h1 className="text-xl font-bold">业务流程管理系统</h1>
                <p className="text-blue-200 text-sm">Enterprise Process Management</p>
              </div>
            </div>
            <nav className="flex space-x-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  isActive('/')
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-700/50'
                }`}
              >
                仪表盘
              </Link>
              <Link
                to="/templates"
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  isActive('/templates')
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-700/50'
                }`}
              >
                模板库
              </Link>
              <Link
                to="/processes"
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  isActive('/processes')
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-700/50'
                }`}
              >
                流程列表
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
