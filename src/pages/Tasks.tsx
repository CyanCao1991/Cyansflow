import { useState } from 'react';
import { useAppStore } from '../store';
import { CheckCircle, Clock, Play, AlertCircle, ChevronRight } from 'lucide-react';
import { Task, TaskItem, CheckItem } from '../types';

const Tasks = () => {
  const { devices, tasks, checkItems, getDeviceById, getCheckItemsByFMEAId, fmeas, updateTask, addTaskItem, updateTaskItem, getTaskItemsByTaskId } = useAppStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [taskResults, setTaskResults] = useState<Record<string, { result: string; remark: string; isAbnormal: boolean }>>({});

  const filteredTasks = tasks.filter(task => 
    filterStatus === 'all' || task.status === filterStatus
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-gray-400" />;
      case 'in_progress': return <Play className="w-5 h-5 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待执行';
      case 'in_progress': return '执行中';
      case 'completed': return '已完成';
      default: return '未知';
    }
  };

  const handleStartTask = (task: Task) => {
    updateTask(task.id, { status: 'in_progress', executorId: '3' });
    setSelectedTask(task);
  };

  const handleTaskItemChange = (checkItemId: string, field: string, value: any) => {
    setTaskResults(prev => ({
      ...prev,
      [checkItemId]: {
        ...prev[checkItemId],
        [field]: value,
        isAbnormal: field === 'isAbnormal' ? value : prev[checkItemId]?.isAbnormal || false
      }
    }));
  };

  const handleSubmitTask = () => {
    if (!selectedTask) return;
    
    // Get all check items for this task
    const taskFMEAs = fmeas.filter(f => f.deviceId === selectedTask.deviceId);
    const allCheckItems = taskFMEAs.flatMap(f => getCheckItemsByFMEAId(f.id));
    
    // Submit each task item
    allCheckItems.forEach(item => {
      const result = taskResults[item.id];
      if (result) {
        addTaskItem({
          taskId: selectedTask.id,
          checkItemId: item.id,
          result: result.result,
          remark: result.remark,
          isAbnormal: result.isAbnormal
        });
      }
    });
    
    updateTask(selectedTask.id, { 
      status: 'completed', 
      executedAt: new Date().toISOString() 
    });
    
    setSelectedTask(null);
    setTaskResults({});
  };

  const getCheckItemsForTask = (task: Task) => {
    const taskFMEAs = fmeas.filter(f => f.deviceId === task.deviceId);
    return taskFMEAs.flatMap(f => getCheckItemsByFMEAId(f.id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">任务执行</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">筛选:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">全部</option>
            <option value="pending">待执行</option>
            <option value="in_progress">执行中</option>
            <option value="completed">已完成</option>
          </select>
        </div>
      </div>

      {!selectedTask ? (
        <div className="grid gap-4">
          {filteredTasks.map((task) => {
            const device = getDeviceById(task.deviceId);
            return (
              <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(task.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{device?.name || '未知设备'}</h3>
                      <p className="text-sm text-gray-500">{device?.code || ''} • {task.taskDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(task.status)}`}>
                      {getStatusText(task.status)}
                    </span>
                    {task.status === 'pending' && (
                      <button
                        onClick={() => handleStartTask(task)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Play className="w-4 h-4" />
                        <span>开始执行</span>
                      </button>
                    )}
                    {task.status === 'in_progress' && (
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <ChevronRight className="w-4 h-4" />
                        <span>继续执行</span>
                      </button>
                    )}
                    {task.status === 'completed' && (
                      <span className="text-sm text-gray-500">
                        完成于: {task.executedAt?.split('T')[0] || '-'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredTasks.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无任务</h3>
              <p className="text-gray-500">没有符合筛选条件的任务</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {getDeviceById(selectedTask.deviceId)?.name || '未知设备'}
                </h2>
                <p className="text-sm text-gray-500">
                  {getDeviceById(selectedTask.deviceId)?.code || ''} • {selectedTask.taskDate}
                </p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                返回
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">点检项目</h3>
            
            {getCheckItemsForTask(selectedTask).map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="mb-3">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600">标准: {item.standard}</p>
                  <p className="text-xs text-gray-500 mt-1">频次: {item.frequency} • 方法: {item.method || '-'}</p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">点检结果</label>
                    <input
                      type="text"
                      value={taskResults[item.id]?.result || ''}
                      onChange={(e) => handleTaskItemChange(item.id, 'result', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="输入点检结果..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                    <textarea
                      value={taskResults[item.id]?.remark || ''}
                      onChange={(e) => handleTaskItemChange(item.id, 'remark', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="添加备注..."
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`abnormal-${item.id}`}
                      checked={taskResults[item.id]?.isAbnormal || false}
                      onChange={(e) => handleTaskItemChange(item.id, 'isAbnormal', e.target.checked)}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label htmlFor={`abnormal-${item.id}`} className="text-sm text-gray-700 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span>标记为异常</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
            
            {getCheckItemsForTask(selectedTask).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                该任务暂无点检项目
              </div>
            )}
            
            {getCheckItemsForTask(selectedTask).length > 0 && (
              <div className="pt-6">
                <button
                  onClick={handleSubmitTask}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>提交任务</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
