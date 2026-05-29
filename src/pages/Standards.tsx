import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Typography,
  Switch,
  InputNumber,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useAppStore } from '@/store';
import { InspectionStandard, InspectionItem } from '@/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Standards: React.FC = () => {
  const { standards, addStandard, updateStandard } = useAppStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStandard, setEditingStandard] = useState<InspectionStandard | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingStandard(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: InspectionStandard) => {
    setEditingStandard(record);
    form.setFieldsValue({
      ...record,
      device_types: record.device_types.join(','),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该点检标准吗？',
      onOk: () => {
        message.success('标准删除成功');
      },
    });
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      const now = dayjs().toISOString();
      const deviceTypes = values.device_types.split(',').map((t: string) => t.trim());
      
      if (editingStandard) {
        updateStandard(editingStandard.id, { 
          ...values,
          device_types: deviceTypes,
          updated_at: now 
        });
        message.success('点检标准更新成功');
      } else {
          const newStandard: InspectionStandard = {
            ...values,
            id: Date.now().toString(),
            device_types: deviceTypes,
            created_at: now,
            updated_at: now,
            fmea_data: { risk_level: 'medium' },
          };
          addStandard(newStandard);
          message.success('点检标准添加成功');
      }
      setIsModalVisible(false);
    });
  };

  const columns = [
    {
      title: '标准名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: '适用设备类型',
      dataIndex: 'device_types',
      key: 'device_types',
      render: (types: string[]) => (
        <Space wrap>
          {types.map(type => (
            <Tag key={type} color="blue">{type}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '点检项目数',
      dataIndex: 'items',
      key: 'items',
      render: (items: InspectionItem[]) => (
        <span>{items.length} 项</span>
      ),
    },
    {
      title: '频次',
      dataIndex: 'frequency',
      key: 'frequency',
      render: (freq: string) => {
        const map = {
          daily: '每日',
          weekly: '每周',
          monthly: '每月',
          quarterly: '每季度',
        };
        return <Tag color="green">{map[freq as keyof typeof map] || freq}</Tag>;
      },
    },
    {
      title: '执行角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const map = {
          maintenance_tech: '维护技术员',
          maintenance_supervisor: '维护主管',
          operator: '操作员',
        };
        return map[role as keyof typeof map] || role;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: InspectionStandard) => (
        <Space size="middle">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Title level={2} className="!mb-0">点检标准管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建标准
        </Button>
      </div>

      <Card className="shadow-sm" variant="borderless">
        <Table
          columns={columns}
          dataSource={standards}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          expandable={{
            expandedRowRender: (record) => (
              <div className="p-4">
                <Text strong className="mb-2 block">点检项目详情:</Text>
                <div className="space-y-3">
                  {record.items.map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex w-full justify-between items-center">
                        <div>
                          <Text strong>{item.name}</Text>
                          <div className="text-gray-500 text-sm mt-1">
                            标准: {item.standard} | 方法: {item.method}
                            {item.tool && ` | 工具: ${item.tool}`}
                          </div>
                        </div>
                        {item.is_critical && <Tag color="red">关键项</Tag>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ),
          }}
        />
      </Card>

      <Modal
        title={editingStandard ? '编辑点检标准' : '新建点检标准'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        okText="确认"
        cancelText="取消"
        width={700}
      >
        <Form form={form} layout="vertical" initialValues={{ items: [{ name: '', standard: '', method: '', tool: '', is_critical: false }] }}>
          <Form.Item
            name="name"
            label="标准名称"
            rules={[{ required: true, message: '请输入标准名称' }]}
          >
            <Input placeholder="请输入标准名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="请输入标准描述" />
          </Form.Item>
          <Form.Item
            name="device_types"
            label="适用设备类型"
            rules={[{ required: true, message: '请输入适用设备类型' }]}
            help="多个设备类型用逗号分隔"
          >
            <Input placeholder="例如: 数控车床,加工中心" />
          </Form.Item>
          <Form.Item
            name="frequency"
            label="点检频次"
            rules={[{ required: true, message: '请选择点检频次' }]}
          >
            <Select placeholder="请选择点检频次">
              <Option value="daily">每日</Option>
              <Option value="weekly">每周</Option>
              <Option value="monthly">每月</Option>
              <Option value="quarterly">每季度</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="role"
            label="执行角色"
            rules={[{ required: true, message: '请选择执行角色' }]}
          >
            <Select placeholder="请选择执行角色">
              <Option value="maintenance_tech">维护技术员</Option>
              <Option value="maintenance_supervisor">维护主管</Option>
              <Option value="operator">操作员</Option>
            </Select>
          </Form.Item>
          
          <div className="border-t pt-4 mt-4">
            <Text strong className="text-lg mb-4 block">点检项目配置</Text>
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="p-4 bg-gray-50 rounded-lg mb-3">
                      <div className="flex justify-between items-start mb-3">
                        <Text strong>项目 {key + 1}</Text>
                        <Button
                          type="text"
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(name)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          label="项目名称"
                          rules={[{ required: true, message: '请输入项目名称' }]}
                        >
                          <Input placeholder="请输入点检项目名称" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'standard']}
                          label="标准"
                          rules={[{ required: true, message: '请输入点检标准' }]}
                        >
                          <Input placeholder="请输入点检标准" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'method']}
                          label="检查方法"
                          rules={[{ required: true, message: '请输入检查方法' }]}
                        >
                          <Input placeholder="请输入检查方法" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'tool']}
                          label="使用工具"
                        >
                          <Input placeholder="请输入使用工具" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'is_critical']}
                          label="是否关键项"
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                      </div>
                    </div>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      添加点检项目
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Standards;
