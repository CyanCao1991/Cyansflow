import React from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Typography,
  Space,
  Divider,
  message,
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Settings: React.FC = () => {
  const [form] = Form.useForm();

  const handleSave = () => {
    form.validateFields().then(() => {
      message.success('设置保存成功');
    });
  };

  return (
    <div className="space-y-6">
      <Title level={2} className="!mb-0">系统设置</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="基本设置" className="shadow-sm" variant="borderless">
            <Form form={form} layout="vertical" initialValues={{
              companyName: '',
              timezone: 'Asia/Shanghai',
              language: 'zh-CN',
              autoGeneratePlans: true,
              emailNotifications: true,
            }}>
              <Form.Item
                name="companyName"
                label="企业名称"
                rules={[{ required: true, message: '请输入企业名称' }]}
              >
                <Input placeholder="请输入企业名称" />
              </Form.Item>
              <Form.Item
                name="timezone"
                label="时区"
                rules={[{ required: true, message: '请选择时区' }]}
              >
                <Select placeholder="请选择时区">
                  <Option value="Asia/Shanghai">中国标准时间 (GMT+8)</Option>
                  <Option value="Asia/Tokyo">日本标准时间 (GMT+9)</Option>
                  <Option value="UTC">协调世界时 (UTC)</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="language"
                label="语言"
                rules={[{ required: true, message: '请选择语言' }]}
              >
                <Select placeholder="请选择语言">
                  <Option value="zh-CN">简体中文</Option>
                  <Option value="en-US">English</Option>
                </Select>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="点检配置" className="shadow-sm" variant="borderless">
            <Form form={form} layout="vertical">
              <Form.Item
                name="autoGeneratePlans"
                label="自动生成点检计划"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="emailNotifications"
                label="邮件通知"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="reminderTime"
                label="提醒时间"
              >
                <Select placeholder="请选择提醒时间">
                  <Option value="1">提前 1 小时</Option>
                  <Option value="4">提前 4 小时</Option>
                  <Option value="24">提前 1 天</Option>
                </Select>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      <Card title="数据管理" className="shadow-sm" variant="borderless">
        <Space orientation="vertical" size="middle" className="w-full">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div>
              <Text strong>导出数据</Text>
              <div className="text-gray-500 text-sm">导出系统数据为 Excel 或 CSV 格式</div>
            </div>
            <Space>
              <Button>导出为 CSV</Button>
              <Button>导出为 Excel</Button>
            </Space>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div>
              <Text strong>导入数据</Text>
              <div className="text-gray-500 text-sm">从文件导入设备、标准等数据</div>
            </div>
            <Button>导入数据</Button>
          </div>
          <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <Text strong className="text-red-600">重置数据</Text>
              <div className="text-red-500 text-sm">清除所有数据，恢复到初始状态（此操作不可恢复）</div>
            </div>
            <Button danger>重置系统</Button>
          </div>
        </Space>
      </Card>

      <div className="flex justify-end">
        <Button type="primary" size="large" icon={<SaveOutlined />} onClick={handleSave}>
          保存设置
        </Button>
      </div>
    </div>
  );
};

// 添加缺失的Row/Col导入
import { Row, Col } from 'antd';

export default Settings;
