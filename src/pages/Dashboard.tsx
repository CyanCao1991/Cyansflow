import React, { useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Typography, Space, Tag } from 'antd';
import {
  ToolOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useAppStore } from '@/store';
import { mockDevices, mockStandards, mockPlans, mockTasks } from '@/utils/mockData';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const { setDevices, setStandards, setPlans, setTasks, devices, standards, plans, tasks } = useAppStore();

  useEffect(() => {
    setDevices(mockDevices);
    setStandards(mockStandards);
    setPlans(mockPlans);
    setTasks(mockTasks);
  }, []);

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const skippedTasks = tasks.filter(t => t.status === 'skipped').length;
  const activeDevices = devices.filter(d => d.status === 'active').length;

  const chartOption = {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['已完成', '进行中', '已跳过'],
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '已完成',
        type: 'bar',
        stack: 'total',
        data: [12, 13, 10, 13, 9, 3, 2],
        itemStyle: { color: '#52C41A' },
      },
      {
        name: '进行中',
        type: 'bar',
        stack: 'total',
        data: [2, 1, 3, 2, 1, 0, 0],
        itemStyle: { color: '#165DFF' },
      },
      {
        name: '已跳过',
        type: 'bar',
        stack: 'total',
        data: [1, 0, 1, 0, 2, 0, 0],
        itemStyle: { color: '#FA8C16' },
      },
    ],
  };

  const pieOption = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: '设备状态',
        type: 'pie',
        radius: '60%',
        data: [
          { value: activeDevices, name: '运行中', itemStyle: { color: '#52C41A' } },
          { value: devices.filter(d => d.status === 'maintenance').length, name: '维护中', itemStyle: { color: '#FA8C16' } },
          { value: devices.filter(d => d.status === 'inactive').length, name: '停用', itemStyle: { color: '#D9D9D9' } },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  return (
    <div className="space-y-6">
      <Title level={2} className="!mb-0">数据概览</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow" variant="borderless">
            <Statistic
              title="设备总数"
              value={devices.length}
              prefix={<ToolOutlined className="text-blue-600" />}
              styles={{ content: { color: '#165DFF' } }}
            />
            <div className="mt-4">
              <Progress percent={(activeDevices / devices.length) * 100} status="active" strokeColor="#52C41A" />
              <Text type="secondary" className="text-sm">在线设备: {activeDevices}</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow" variant="borderless">
            <Statistic
              title="已完成点检"
              value={completedTasks}
              prefix={<CheckCircleOutlined className="text-green-600" />}
              styles={{ content: { color: '#52C41A' } }}
            />
            <div className="mt-4">
              <Progress percent={tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0} strokeColor="#52C41A" />
              <Text type="secondary" className="text-sm">完成率</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow" variant="borderless">
            <Statistic
              title="待处理任务"
              value={pendingTasks}
              prefix={<ClockCircleOutlined className="text-orange-600" />}
              styles={{ content: { color: '#FA8C16' } }}
            />
            <div className="mt-4">
              <Space size="small">
                {pendingTasks > 0 && <Tag color="warning">需要关注</Tag>}
                {pendingTasks === 0 && <Tag color="success">全部处理</Tag>}
              </Space>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow" variant="borderless">
            <Statistic
              title="已跳过任务"
              value={skippedTasks}
              prefix={<WarningOutlined className="text-gray-500" />}
              styles={{ content: { color: '#8C8C8C' } }}
            />
            <div className="mt-4">
              <Text type="secondary" className="text-sm">
                需要跟进未执行原因
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
          title="本周点检执行情况"
          className="shadow-sm"
          variant="borderless"
        >
            <ReactECharts option={chartOption} style={{ height: 350 }} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
          title="设备状态分布"
          className="shadow-sm"
          variant="borderless"
        >
            <ReactECharts option={pieOption} style={{ height: 350 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
          title="点检标准概览"
          className="shadow-sm"
          variant="borderless"
        >
            <Space orientation="vertical" className="w-full" size="middle">
              {standards.map(standard => (
                <div key={standard.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <Text strong className="text-lg">{standard.name}</Text>
                      <div className="text-gray-500 text-sm mt-1">
                        适用设备: {standard.device_types.join(', ')}
                      </div>
                      <div className="text-gray-500 text-sm">
                        点检项目: {standard.items.length} 项
                      </div>
                    </div>
                    <Tag color="blue">
                      {standard.frequency === 'daily' ? '每日' : standard.frequency === 'weekly' ? '每周' : '定期'}
                    </Tag>
                  </div>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
          title="最近执行记录"
          className="shadow-sm"
          variant="borderless"
        >
            <Space orientation="vertical" className="w-full" size="middle">
              {tasks.slice(0, 3).map(task => {
                const device = devices.find(d => d.id === task.device_id);
                return (
                  <div key={task.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <Text strong>{device?.name || '未知设备'}</Text>
                        <div className="text-gray-500 text-sm mt-1">
                          {task.status === 'completed' ? '点检完成' : task.status === 'skipped' ? '已跳过' : '进行中'}
                        </div>
                        {task.notes && (
                          <div className="text-gray-600 text-sm mt-1">{task.notes}</div>
                        )}
                        {task.skip_reason && (
                          <div className="text-orange-600 text-sm mt-1">跳过原因: {task.skip_reason}</div>
                        )}
                      </div>
                      <Tag color={task.status === 'completed' ? 'success' : task.status === 'skipped' ? 'warning' : 'processing'}>
                        {task.status === 'completed' ? '完成' : task.status === 'skipped' ? '跳过' : '进行中'}
                      </Tag>
                    </div>
                  </div>
                );
              })}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
