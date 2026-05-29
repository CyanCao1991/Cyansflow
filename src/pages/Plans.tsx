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
  DatePicker,
  message,
  Typography,
  Badge,
} from 'antd';
import { PlusOutlined, EditOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useAppStore } from '@/store';
import { InspectionPlan } from '@/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const Plans: React.FC = () => {
  const { plans, standards, devices, addPlan, updatePlan } = useAppStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InspectionPlan | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingPlan(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: InspectionPlan) => {
    setEditingPlan(record);
    form.setFieldsValue({
      ...record,
      planned_date: dayjs(record.planned_date),
    });
    setIsModalVisible(true);
  };

  const handleVerify = (record: InspectionPlan) => {
    const device = devices.find(d => d.id === record.device_id);
    Modal.confirm({
      title: '执行点检前条件校验',
      content: (
        <div>
          <p>设备: {device?.name}</p>
          <p>状态: {device?.status === 'active' ? '运行中' : device?.status === 'maintenance' ? '维护中' : '停用'}</p>
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <Text type="warning">请确认设备当前是否满足点检条件（设备是否停机、生产计划是否允许等）</Text>
          </div>
        </div>
      ),
      okText: '条件满足，生成任务',
      cancelText: '条件不满足，跳过',
      onOk: () => {
        updatePlan(record.id, { status: 'executing', conditions_check_result: { passed: true } });
        message.success('点检任务已生成');
      },
      onCancel: () => {
        updatePlan(record.id, { status: 'skipped', skip_reason: '点检条件不满足' });
        message.info('已标记为跳过');
      },
    });
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      const now = dayjs().toISOString();
      const standard = standards.find(s => s.id === values.standard_id);
      
      if (editingPlan) {
        updatePlan(editingPlan.id, {
          ...values,
          planned_date: values.planned_date.toISOString(),
          updated_at: now,
        });
        message.success('点检计划更新成功');
      } else {
        const newPlan: InspectionPlan = {
          ...values,
          id: Date.now().toString(),
          planned_date: values.planned_date.toISOString(),
          status: 'draft',
          created_at: now,
          updated_at: now,
        };
        addPlan(newPlan);
        message.success('点检计划创建成功');
      }
      setIsModalVisible(false);
    });
  };

  const statusMap = {
    draft: { text: '草稿', color: 'default' },
    confirmed: { text: '已确认', color: 'blue' },
    executing: { text: '执行中', color: 'processing' },
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
      title: '点检标准',
      dataIndex: 'standard_id',
      key: 'standard_id',
      render: (id: string) => {
        const standard = standards.find(s => s.id === id);
        return standard?.name || '-';
      },
    },
    {
      title: '计划日期',
      dataIndex: 'planned_date',
      key: 'planned_date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
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
      title: '操作',
      key: 'action',
      render: (_: any, record: InspectionPlan) => (
        <Space size="middle">
          {record.status === 'draft' && (
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
              编辑
            </Button>
          )}
          {record.status === 'confirmed' && (
            <Button type="primary" size="small" icon={<CheckCircleOutlined />} onClick={() => handleVerify(record)}>
              执行校验
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Title level={2} className="!mb-0">点检计划管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建计划
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm" variant="borderless">
          <Statistic title="总计划数" value={plans.length} />
        </Card>
        <Card className="shadow-sm" variant="borderless">
          <Statistic title="待确认" value={plans.filter(p => p.status === 'draft').length} />
        </Card>
        <Card className="shadow-sm" variant="borderless">
          <Statistic title="执行中" value={plans.filter(p => p.status === 'executing').length} />
        </Card>
        <Card className="shadow-sm" variant="borderless">
          <Statistic title="已完成" value={plans.filter(p => p.status === 'completed').length} />
        </Card>
      </div>

      <Card className="shadow-sm" variant="borderless">
        <Table
          columns={columns}
          dataSource={plans}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title={editingPlan ? '编辑点检计划' : '新建点检计划'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        okText="确认"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="device_id"
            label="选择设备"
            rules={[{ required: true, message: '请选择设备' }]}
          >
            <Select placeholder="请选择设备">
              {devices.map(device => (
                <Option key={device.id} value={device.id}>{device.name} ({device.code})</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="standard_id"
            label="点检标准"
            rules={[{ required: true, message: '请选择点检标准' }]}
          >
            <Select placeholder="请选择点检标准">
              {standards.map(standard => (
                <Option key={standard.id} value={standard.id}>{standard.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="planned_date"
            label="计划日期"
            rules={[{ required: true, message: '请选择计划日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Simple Statistic component
const Statistic = ({ title, value }: { title: string; value: number }) => (
  <div>
    <Text type="secondary" className="text-sm">{title}</Text>
    <div className="text-2xl font-bold mt-1">{value}</div>
  </div>
);

export default Plans;
