import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { fetchProcess, submitProcess, approveProcess, rejectProcess } from '../lib/api';
import ProcessNode from '../components/ProcessNode';
import NodeDetailPanel from '../components/NodeDetailPanel';
import { ArrowLeft, Send, CheckCircle, XCircle, Lock } from 'lucide-react';

export default function ProcessEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedProcess, setSelectedProcess, setSelectedNode } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const process = await fetchProcess(id);
      setSelectedProcess(process);
      setLoading(false);
    };
    load();
    return () => {
      setSelectedProcess(null);
      setSelectedNode(null);
    };
  }, [id, setSelectedProcess, setSelectedNode]);

  const handleSubmit = async () => {
    if (!id || !selectedProcess) return;
    const updated = await submitProcess(id);
    setSelectedProcess(updated);
  };

  const handleApprove = async () => {
    if (!id || !selectedProcess) return;
    const updated = await approveProcess(id, approvalComment);
    setSelectedProcess(updated);
    setShowApprovalModal(false);
    setApprovalComment('');
  };

  const handleReject = async () => {
    if (!id || !selectedProcess) return;
    const updated = await rejectProcess(id, approvalComment);
    setSelectedProcess(updated);
    setShowApprovalModal(false);
    setApprovalComment('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!selectedProcess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-gray-500 mb-4">流程不存在</div>
        <Link
          to="/processes"
          className="text-blue-600 hover:text-blue-800"
        >
          返回流程列表
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      approved: 'bg-green-100 text-green-800',
      pending_review: 'bg-orange-100 text-orange-800',
      draft: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = {
      approved: '已发布',
      pending_review: '待审核',
      draft: '草稿',
    };
    return { style: styles[status] || styles.draft, label: labels[status] || status };
  };

  const status = getStatusBadge(selectedProcess.status);

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/processes')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{selectedProcess.name}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>{selectedProcess.code}</span>
              <span>•</span>
              <span>版本 {selectedProcess.version}</span>
              <span>•</span>
              <span className={`px-2 py-0.5 rounded-full ${status.style}`}>
                {status.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedProcess.status === 'draft' && (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Send className="w-4 h-4" />
              提交审核
            </button>
          )}
          {selectedProcess.status === 'pending_review' && (
            <button
              onClick={() => setShowApprovalModal(true)}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              审核
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              主干基线（只读，不可修改）
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {selectedProcess.trunkNodes.map((node) => (
                <ProcessNode key={node.id} node={node} level={0} />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <NodeDetailPanel processId={id!} />
        </div>
      </div>

      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">审核流程</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  审核意见
                </label>
                <textarea
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入审核意见..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleReject}
                  className="flex items-center justify-center gap-2 flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  拒绝
                </button>
                <button
                  onClick={handleApprove}
                  className="flex items-center justify-center gap-2 flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  通过
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
