import { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, AlertTriangle, ListChecks, ChevronDown, ChevronUp } from 'lucide-react';
import { FMEA, CheckItem } from '../types';

const FMEAPage = () => {
  const { devices, fmeas, checkItems, getFMEAByDeviceId, getCheckItemsByFMEAId, addFMEA, updateFMEA, deleteFMEA, addCheckItem, updateCheckItem, deleteCheckItem } = useAppStore();
  const [selectedDevice, setSelectedDevice] = useState<string>(devices[0]?.id || '');
  const [showFMEAModal, setShowFMEAModal] = useState(false);
  const [showCheckItemModal, setShowCheckItemModal] = useState(false);
  const [editingFMEA, setEditingFMEA] = useState<FMEA | null>(null);
  const [editingCheckItem, setEditingCheckItem] = useState<CheckItem | null>(null);
  const [expandedFMEA, setExpandedFMEA] = useState<string | null>(null);
  
  const [fmeaFormData, setFmeaFormData] = useState<{
    failureMode: string;
    failureEffect: string;
    severity: number;
    occurrence: number;
    detection: number;
  }>({
    failureMode: "",
    failureEffect: "",
    severity: 5,
    occurrence: 5,
    detection: 5,
  });
  
  const [checkItemFormData, setCheckItemFormData] = useState<{
    name: string;
    standard: string;
    frequency: string;
    executorRole: "admin" | "engineer" | "inspector" | "manager";
    method: string;
    fmeaId: string;
  }>({
    name: "",
    standard: "",
    frequency: "每日",
    executorRole: "inspector",
    method: "",
    fmeaId: "",
  });

  const deviceFMEAs = getFMEAByDeviceId(selectedDevice);

  const getRPNColor = (rpn: number) => {
    if (rpn >= 200) return 'bg-red-100 text-red-800';
    if (rpn >= 100) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const handleFMEASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFMEA) {
      updateFMEA(editingFMEA.id, fmeaFormData);
    } else {
      addFMEA({ ...fmeaFormData, deviceId: selectedDevice });
    }
    setShowFMEAModal(false);
    setEditingFMEA(null);
    setFmeaFormData({ failureMode: '', failureEffect: '', severity: 5, occurrence: 5, detection: 5 });
  };

  const handleCheckItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCheckItem) {
      updateCheckItem(editingCheckItem.id, checkItemFormData);
    } else {
      addCheckItem(checkItemFormData);
    }
    setShowCheckItemModal(false);
    setEditingCheckItem(null);
    setCheckItemFormData({ name: '', standard: '', frequency: '每日', executorRole: 'inspector', method: '', fmeaId: '' });
  };

  const handleEditFMEA = (fmea: FMEA) => {
    setEditingFMEA(fmea);
    setFmeaFormData({
      failureMode: fmea.failureMode,
      failureEffect: fmea.failureEffect || "",
      severity: fmea.severity,
      occurrence: fmea.occurrence,
      detection: fmea.detection,
    });
    setShowFMEAModal(true);
  };

  const handleAddCheckItem = (fmeaId: string) => {
    setCheckItemFormData({ 
      name: "",
      standard: "",
      frequency: "每日",
      executorRole: "inspector",
      method: "",
      fmeaId 
    });
    setShowCheckItemModal(true);
  };

  const handleEditCheckItem = (item: CheckItem) => {
    setEditingCheckItem(item);
    setCheckItemFormData({
      name: item.name,
      standard: item.standard,
      frequency: item.frequency,
      executorRole: item.executorRole,
      method: item.method || "",
      fmeaId: item.fmeaId,
    });
    setShowCheckItemModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">FMEA 失效模式分析</h1>
        <button
          onClick={() => setShowFMEAModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>添加失效模式</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">选择设备</label>
        <select
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {devices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.code} - {device.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {deviceFMEAs.map((fmea) => {
          const items = getCheckItemsByFMEAId(fmea.id);
          const isExpanded = expandedFMEA === fmea.id;
          return (
            <div key={fmea.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedFMEA(isExpanded ? null : fmea.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{fmea.failureMode}</h3>
                      <p className="text-sm text-gray-500">{fmea.failureEffect}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-500">S:{fmea.severity}</span>
                      <span className="text-gray-500">O:{fmea.occurrence}</span>
                      <span className="text-gray-500">D:{fmea.detection}</span>
                    </div>
                    <span className={`px-3 py-1 text-sm font-bold rounded-full ${getRPNColor(fmea.rpn)}`}>
                      RPN: {fmea.rpn}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditFMEA(fmea);
                      }}
                      className="text-blue-600 hover:text-blue-900 p-1"
                    >
                      <ListChecks className="w-5 h-5" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div className="border-t border-gray-200">
                  <div className="p-4 bg-gray-50 flex items-center justify-between">
                    <h4 className="font-medium text-gray-700">点检项目</h4>
                    <button
                      onClick={() => handleAddCheckItem(fmea.id)}
                      className="text-sm text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>添加项目</span>
                    </button>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {items.map((item) => (
                      <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900">{item.name}</h5>
                            <p className="text-sm text-gray-600">标准: {item.standard}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-gray-500">频次: {item.frequency}</span>
                              <span className="text-xs text-gray-500">方法: {item.method || '-'}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleEditCheckItem(item)}
                            className="text-blue-600 hover:text-blue-900 text-sm"
                          >
                            编辑
                          </button>
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        暂无点检项目
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {deviceFMEAs.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无失效模式</h3>
            <p className="text-gray-500 mb-4">点击上方按钮添加第一个失效模式</p>
          </div>
        )}
      </div>

      {showFMEAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingFMEA ? '编辑失效模式' : '添加失效模式'}
              </h2>
              <form onSubmit={handleFMEASubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">失效模式</label>
                  <input
                    type="text"
                    required
                    value={fmeaFormData.failureMode}
                    onChange={(e) => setFmeaFormData({ ...fmeaFormData, failureMode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="如：主轴轴承磨损"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">失效影响</label>
                  <textarea
                    value={fmeaFormData.failureEffect}
                    onChange={(e) => setFmeaFormData({ ...fmeaFormData, failureEffect: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="描述失效后的影响"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">严重度 (S)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      required
                      value={fmeaFormData.severity}
                      onChange={(e) => setFmeaFormData({ ...fmeaFormData, severity: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">发生度 (O)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      required
                      value={fmeaFormData.occurrence}
                      onChange={(e) => setFmeaFormData({ ...fmeaFormData, occurrence: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">探测度 (D)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      required
                      value={fmeaFormData.detection}
                      onChange={(e) => setFmeaFormData({ ...fmeaFormData, detection: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowFMEAModal(false);
                      setEditingFMEA(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    保存
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showCheckItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingCheckItem ? '编辑点检项目' : '添加点检项目'}
              </h2>
              <form onSubmit={handleCheckItemSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">项目名称</label>
                  <input
                    type="text"
                    required
                    value={checkItemFormData.name}
                    onChange={(e) => setCheckItemFormData({ ...checkItemFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="如：主轴温度检查"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">点检标准</label>
                  <input
                    type="text"
                    required
                    value={checkItemFormData.standard}
                    onChange={(e) => setCheckItemFormData({ ...checkItemFormData, standard: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="如：温度 ≤ 60°C"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">点检频次</label>
                    <select
                      value={checkItemFormData.frequency}
                      onChange={(e) => setCheckItemFormData({ ...checkItemFormData, frequency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="每日">每日</option>
                      <option value="每周">每周</option>
                      <option value="每月">每月</option>
                      <option value="每季度">每季度</option>
                      <option value="每年">每年</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">执行角色</label>
                    <select
                      value={checkItemFormData.executorRole}
                      onChange={(e) => setCheckItemFormData({ ...checkItemFormData, executorRole: e.target.value as any })}
                    >
                      <option value="inspector">点检员</option>
                      <option value="engineer">工程师</option>
                      <option value="admin">管理员</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">点检方法</label>
                  <input
                    type="text"
                    value={checkItemFormData.method}
                    onChange={(e) => setCheckItemFormData({ ...checkItemFormData, method: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="如：使用测温枪"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCheckItemModal(false);
                      setEditingCheckItem(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    保存
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FMEAPage;
