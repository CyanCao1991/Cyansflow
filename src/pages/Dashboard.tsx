import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAppStore } from '../store';
import { Activity, AlertTriangle, CheckCircle, Clock, LayoutDashboard, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { devices, tasks, plans } = useAppStore();

  const deviceStatusData = [
    { name: '正常', value: devices.filter(d => d.status === 'normal').length, color: '#10b981' },
    { name: '警告', value: devices.filter(d => d.status === 'warning').length, color: '#f59e0b' },
    { name: '严重', value: devices.filter(d => d.status === 'critical').length, color: '#ef4444' },
  ];

  const taskStatusData = [
    { name: '待执行', value: tasks.filter(t => t.status === 'pending').length, color: '#6b7280' },
    { name: '进行中', value: tasks.filter(t => t.status === 'in_progress').length, color: '#3b82f6' },
    { name: '已完成', value: tasks.filter(t => t.status === 'completed').length, color: '#10b981' },
  ];

  const weeklyData = [
    { day: '周一', completed: 12, pending: 3 },
    { day: '周二', completed: 15, pending: 2 },
    { day: '周三', completed: 10, pending: 5 },
    { day: '周四', completed: 18, pending: 1 },
    { day: '周五', completed: 14, pending: 4 },
  ];

  const stats = [
    { title: '设备总数', value: devices.length, icon: LayoutDashboard, color: 'bg-blue-500' },
    { title: '待处理任务', value: tasks.filter(t => t.status === 'pending').length, icon: Clock, color: 'bg-yellow-500' },
    { title: '今日完成', value: tasks.filter(t => t.status === 'completed').length, icon: CheckCircle, color: 'bg-green-500' },
    { title: '活跃计划', value: plans.filter(p => p.status === 'active').length, icon: Activity, color: 'bg-purple-500' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">仪表板</h1>
        <div className="text-sm text-gray-500">2024年5月28日</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">设备状态分布</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deviceStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {deviceStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">任务执行趋势</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#10b981" name="已完成" />
              <Bar dataKey="pending" fill="#f59e0b" name="待处理" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">设备列表</h2>
          <div className="space-y-3">
            {devices.slice(0, 5).map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    device.status === 'normal' ? 'bg-green-500' :
                    device.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">{device.name}</p>
                    <p className="text-sm text-gray-500">{device.code}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  device.status === 'normal' ? 'bg-green-100 text-green-800' :
                  device.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {device.status === 'normal' ? '正常' : device.status === 'warning' ? '警告' : '严重'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">今日任务</h2>
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => {
              const device = devices.find(d => d.id === task.deviceId);
              return (
                <div key={task.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">{device?.name || '未知设备'}</p>
                    <p className="text-sm text-gray-500">{task.taskDate}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    task.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {task.status === 'pending' ? '待执行' : task.status === 'in_progress' ? '进行中' : '已完成'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
