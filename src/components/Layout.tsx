import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Typography,
  Space,
  Avatar,
  Badge,
  Button,
  Drawer,
} from 'antd';
import {
  DashboardOutlined,
  ToolOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  BarChartOutlined,
  SettingOutlined,
  MenuOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: '数据概览',
  },
  {
    key: '/devices',
    icon: <ToolOutlined />,
    label: '设备档案',
  },
  {
    key: '/standards',
    icon: <FileTextOutlined />,
    label: '点检标准',
  },
  {
    key: '/plans',
    icon: <CalendarOutlined />,
    label: '点检计划',
  },
  {
    key: '/tasks',
    icon: <CheckSquareOutlined />,
    label: '任务执行',
  },
  {
    key: '/analytics',
    icon: <BarChartOutlined />,
    label: '统计分析',
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: '系统设置',
  },
];

const AppLayout: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getMenuIcon = (key: string) => {
    const item = menuItems.find(m => m.key === key);
    return item?.icon || <DashboardOutlined />;
  };

  const MobileMenu = () => (
    <div className="p-4">
      <div className="mb-4 pb-4 border-b border-gray-300">
        <div className="flex items-center gap-3">
          <Avatar className="!bg-blue-600" size="large">
            管
          </Avatar>
          <div>
            <Text strong className="text-lg">管理员</Text>
            <div className="text-gray-500 text-sm">设备管理员</div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.key;
          return (
            <div
              key={item.key}
              className={`cursor-pointer transition-all px-4 py-3 rounded-lg mb-2 ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => setMobileMenuVisible(false)}
            >
              <Link to={item.key} className={`flex items-center gap-3 ${isActive ? 'text-blue-600' : 'text-gray-700'}`}>
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Layout className="min-h-screen bg-gray-50">
        <Header className="!bg-white !px-4 !h-14 flex items-center justify-between border-b border-gray-200 shadow-sm fixed top-0 left-0 right-0 z-50">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileMenuVisible(true)}
            className="!text-xl"
          />
          <Title level={5} className="!m-0 flex items-center gap-2">
            <ToolOutlined className="text-blue-600" />
            <span>点检管理</span>
          </Title>
          <Badge count={3}>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <FileTextOutlined className="text-gray-600" />
            </div>
          </Badge>
        </Header>

        <Content className="pt-14 pb-16 px-4 min-h-screen">
          <Outlet />
        </Content>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-14 z-50">
          {menuItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.key;
            return (
              <Link
                key={item.key}
                to={item.key}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <Drawer
          title="导航菜单"
          placement="left"
          onClose={() => setMobileMenuVisible(false)}
          open={mobileMenuVisible}
          size={280}
          styles={{ body: { padding: 0 } }}
        >
          <MobileMenu />
        </Drawer>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen">
      <Sider
        theme="dark"
        width={240}
        collapsedWidth={80}
        collapsed={collapsed}
        style={{
          background: 'linear-gradient(180deg, #165DFF 0%, #0E42D2 100%)',
          transition: 'all 0.2s',
        }}
        trigger={
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            className="!text-white"
          />
        }
        onCollapse={setCollapsed}
      >
        <div className={`h-16 flex items-center justify-center border-b border-blue-800/30 transition-all ${
          collapsed ? 'px-2' : 'px-4'
        }`}>
          <Title level={4} className={`!m-0 !text-white flex items-center gap-2 transition-all ${
            collapsed ? 'justify-center' : ''
          }`}>
            <ToolOutlined className={collapsed ? 'text-xl' : 'text-xl'} />
            {!collapsed && <span>点检管理系统</span>}
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          inlineCollapsed={collapsed}
          items={menuItems.map(item => ({
            ...item,
            label: collapsed ? '' : item.label,
          }))}
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
