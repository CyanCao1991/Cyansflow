import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Typography,
  Space,
  Avatar,
  Badge,
} from 'antd';
import {
  DashboardOutlined,
  ToolOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: <Link to="/">数据概览</Link>,
  },
  {
    key: '/devices',
    icon: <ToolOutlined />,
    label: <Link to="/devices">设备档案</Link>,
  },
  {
    key: '/standards',
    icon: <FileTextOutlined />,
    label: <Link to="/standards">点检标准</Link>,
  },
  {
    key: '/plans',
    icon: <CalendarOutlined />,
    label: <Link to="/plans">点检计划</Link>,
  },
  {
    key: '/tasks',
    icon: <CheckSquareOutlined />,
    label: <Link to="/tasks">任务执行</Link>,
  },
  {
    key: '/analytics',
    icon: <BarChartOutlined />,
    label: <Link to="/analytics">统计分析</Link>,
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: <Link to="/settings">系统设置</Link>,
  },
];

const AppLayout: React.FC = () => {
  const location = useLocation();

  return (
    <Layout className="min-h-screen">
      <Sider
        theme="dark"
        width={240}
        style={{
          background: 'linear-gradient(180deg, #165DFF 0%, #0E42D2 100%)',
        }}
      >
        <div className="h-16 flex items-center justify-center border-b border-blue-800/30">
          <Title level={4} className="!m-0 !text-white flex items-center gap-2">
            <ToolOutlined className="text-xl" />
            点检管理系统
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="!bg-transparent border-none mt-4"
          style={{ background: 'transparent' }}
        />
      </Sider>
      <Layout className="flex flex-col bg-gray-50">
        <Header className="!bg-white !px-6 !h-16 flex items-center justify-between border-b border-gray-200 shadow-sm">
          <div></div>
          <Space className="flex items-center">
            <Badge count={3} className="cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <FileTextOutlined className="text-gray-600" />
              </div>
            </Badge>
            <Space className="cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
              <Avatar className="!bg-blue-600" size="small">
                管
              </Avatar>
              <span className="text-gray-700 font-medium">管理员</span>
            </Space>
          </Space>
        </Header>
        <Content className="flex-1 p-6 overflow-auto">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
