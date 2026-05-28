import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  Input,
  message,
  Typography,
  Radio,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/store';
import { InspectionTask, InspectionResult } from '@/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Tasks: React.FC = () => {
  const { tasks, devices, standards, plans, addTask, updateTask } = useAppStore();
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<InspectionTask | null>(null);
  const [isExecuteModalVisible, setIsExecuteModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleView = (record: InspectionTask) => {
    setSelectedTask(record);
    setIsDetailModalVisible(true);
  };

  const handleExecute = (record: InspectionTask) => {
    setSelectedTask(record);
    const standard = standards.find(s => {
      const plan = plans.find(p => p.id === record.plan_id);
      return plan?.standard_id === s.id;
    });
    if (standard) {
      const initialResults = standard.items.map(item => ({
        item_id: item.id,
        result: 'pass' as const,
        value: '',
        notes: '',
      }));
      form.setFieldsValue({ results: initialResults });
    }
    setIsExecuteModalVisible(true);
  };

  const handleSkip = (record: InspectionTask) => {
    Modal.confirm({
      title: '确认跳过此任务',
      content: (
        <div>
          <p>请填写跳过原因:</p>
          <Input.TextArea
            rows={3}
            placeholder="请输入跳过原因"
            id="skipReasonInput"
          />
        </div>
      ),
      onOk: () => {
        const reasonInput = document.getElementById('skipReasonInput') as HTMLTextAreaElement;
        updateTask(record.id, {
          status: 'skipped',
          skip_reason: reasonInput?.value || '无原因',
        });
        message.success('任务已跳过');
      },
    });
  };

  const handleExecuteSubmit = () => {
    if (!selectedTask) return;
    form.validateFields().then(values => {
      updateTask(selectedTask.id, {
        status: 'completed',
        results: values.results,
        notes: values.notes,
        executed_at: dayjs().toISOString(),
      });
      message.success('点检执行完成');
      setIsExecuteModalVisible(false);
    });
  };

  const statusMap = {
    pending: { text: '待执行', color: 'processing' },
    in_progress: { text: '执行中', color: 'blue' },
    completed: { text: '已完成', color: 'success' },
    skipped: { text: '已跳过', color: 'warning' },
  };

  const columns = [
    {
      title: '设备',
      dataIndex: 'device_id',
      key: 'device_id',
      render: (id: string) => {
        const device = devices.find(d => d.id === id);
        return <Text strong>{device?.name || '-'}</Text>;
      },
    },
    {
      title: '执行时间',
      dataIndex: 'executed_at',
      key: 'executed_at',
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const info = statusMap[status as keyof typeof statusMap];
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '跳过原因',
      dataIndex: 'skip_reason',
      key: 'skip_reason',
      render: (reason: string) => reason || '-',
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes: string) => notes ? <Text ellipsis>{notes}</Text> : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: InspectionTask) => (
        <Space size="middle">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          {record.status === 'pending' && (
            <>
              <Button type="primary" size="small" icon={<PlayCircleOutlined />} onClick={() => handleExecute(record)}>
                执行
              </Button>
              <Button type="text" danger size="small" onClick={() => handleSkip(record)}>
                跳过
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const getTaskStandard = (task: InspectionTask) => {
    const plan = plans.find(p => p.id === task.plan_id);
    return standards.find(s => s.id === plan?.standard_id);
  };

  return (
    <div className="space-y-6">
      <Title level={2} className="!mb-0">点检任务执行</Title>

      <Card className="shadow-sm" bordered={false}>
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 详情模态框 */}
      <Modal
        title="点检任务详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {selectedTask && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text type="secondary">设备:</Text>
                <p className="font-medium">
                  {devices.find(d => d.id === selectedTask.device_id)?.name}
                </p>
              </div>
              <div>
                <Text type="secondary">状态:</Text>
                <div className="mt-1">
                  <Tag color={statusMap[selectedTask.status as keyof typeof statusMap].color}>
                    {statusMap[selectedTask.status as keyof typeof statusMap].text}
                  </Tag>
                </div>
              </div>
            </div>
            {selectedTask.executed_at && (
              <div>
                <Text type="secondary">执行时间:</Text>
                <p>{dayjs(selectedTask.executed_at).format('YYYY-MM-DD HH:mm:ss')}</p>
              </div>
            )}
            {selectedTask.notes && (
              <div>
                <Text type="secondary">备注:</Text>
                <p>{selectedTask.notes}</p>
              </div>
            )}
            {selectedTask.skip_reason && (
              <div>
                <Text type="secondary">跳过原因:</Text>
                <p className="text-orange-600">{selectedTask.skip_reason}</p>
              </div>
            )}
            {selectedTask.results && selectedTask.results.length > 0 && (
              <div className="border-t pt-4">
                <Text strong className="text-lg">点检结果:</Text>
                <div className="space-y-3 mt-3">
                  {(() => {
                    const standard = getTaskStandard(selectedTask);
                    return selectedTask.results.map((result, idx) => {
                      const item = standard?.items.find(i => i.id === result.item_id);
                      return (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <Text strong>{item?.name}</Text>
                              <div className="text-gray-500 text-sm">标准: {item?.standard}</div>
                              {result.value && <div className="text-gray-700 mt-1">实测: {result.value}</div>}
                              {result.notes && <div className="text-gray-500 text-sm mt-1">备注: {result.notes}</div>}
                            </div>
                            <Tag color={result.result === 'pass' ? 'success' : result.result === 'fail' ? 'error' : 'default'}>
                              {result.result === 'pass' ? '合格' : result.result === 'fail' ? '不合格' : '不适用'}
                            </Tag>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 执行模态框 */}
      <Modal
        title="执行点检任务"
        open={isExecuteModalVisible}
        onOk={handleExecuteSubmit}
        onCancel={() => setIsExecuteModalVisible(false)}
        okText="提交结果"
        cancelText="取消"
        width={800}
      >
        {selectedTask && (
          <Form form={form} layout="vertical">
            {(() => {
              const standard = getTaskStandard(selectedTask);
              return (
                <div className="space-y-4">
                  <div className="border-b pb-3 mb-4">
                    <Text strong className="text-lg">设备信息</Text>
                    <p className="text-gray-600">{devices.find(d => d.id === selectedTask.device_id)?.name}</p>
                  </div>
                  <Text strong className="text-lg">点检项目</Text>
                  <Form.List name="results">
                    {(fields) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => {
                          const item = standard?.items[key as number];
                          return (
                            <div key={key} className="p-4 bg-gray-50 rounded-lg mb-3">
                              <div className="flex justify-between items-start mb-3">
                                <Text strong>{item?.name}</Text>
                                {item?.is_critical && <Tag color="red">关键项</Tag>}
                              </div>
                              <div className="text-gray-500 text-sm mb-3">
                                标准: {item?.standard} | 方法: {item?.method}
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <Form.Item
                                  {...restField}
                                  name={[name, 'result']}
                                  label="检查结果"
                                  rules={[{ required: true, message: '请选择检查结果' }]}
                                >
                                  <Radio.Group>
                                    <Radio value="pass">合格</Radio>
                                    <Radio value="fail">不合格</Radio>
                                    <Radio value="na">不适用</Radio>
                                  </Radio.Group>
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'value']}
                                  label="实测值"
                                >
                                  <Input placeholder="请输入实测值" />
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'notes']}
                                  label="备注"
                                  className="col-span-2"
                                >
                                  <Input.TextArea rows={2} placeholder="备注" />
                                </Form.Item>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </Form.List>
                  <Form.Item name="notes" label="总体备注">
                    <TextArea rows={3} placeholder="请输入总体备注" />
                  </Form.Item>
                </div>
              );
            })()}
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default Tasks;
