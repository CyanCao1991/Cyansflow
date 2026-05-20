import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { fetchProcesses, fetchTemplates } from '../lib/api';
import { LayoutDashboard, FileText, ClipboardList, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { processes, templates, setProcesses, setTemplates } = useAppStore();

  useEffect(() => {
    const loadData = async () => {
      const [procs, temps] = await Promise.all([
        fetchProcesses(),
        fetchTemplates(),
      ]);
      setProcesses(procs);
      setTemplates(temps);
    };
    loadData();
  }, [setProcesses, setTemplates]);

  const stats = [
    {
      title: '总流程数',
      value: processes.length,
      icon: LayoutDashboard,
      color: 'bg-blue-500',
    },
    {
      title: '模板数量',
      value: templates.length,
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      title: '待审核',
      value: processes.filter(p => p.status === 'pending_review').length,
      icon: ClipboardList,
      color: 'bg-orange-500',
    },
    {
      title: '已发布',
      value: processes.filter(p => p.status === 'approved').length,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <p className="text-gray-600">业务流程管理概览</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">快速操作</h2>
          </div>
          <div className="space-y-3">
            <Link
              to="/templates"
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">浏览模板库</p>
                <p className="text-sm text-gray-600">从模板创建新流程</p>
              </div>
            </Link>
            <Link
              to="/processes"
              className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">查看所有流程</p>
                <p className="text-sm text-gray-600">管理和编辑业务流程</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">最近流程</h2>
          <div className="space-y-3">
            {processes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">暂无流程</p>
            ) : (
              processes.slice(0, 5).map((process) => (
                <Link
                  key={process.id}
                  to={`/processes/${process.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{process.name}</p>
                    <p className="text-sm text-gray-500">{process.code}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      process.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : process.status === 'pending_review'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {process.status === 'approved' ? '已发布' : process.status === 'pending_review' ? '待审核' : '草稿'}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
