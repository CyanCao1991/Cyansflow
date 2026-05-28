import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Table,
  Space,
  DatePicker,
  Select,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ToolOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useAppStore } from '@/store';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Analytics: React.FC = () => {
  const { devices, standards, plans, tasks } = useAppStore();
  const [dateRange, setDateRange] = useState<any>(null);
  const [selectedDevice, setSelectedDevice] = useState<string>('all');

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const skippedTasks = tasks.filter(t => t.status === 'skipped').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const taskTrendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['已完成', '已跳过'] },
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    yAxis: { type: 'value' },
    series: [
      { name: '已完成', type: 'line', data: [5, 8, 6, 9, 7, 2, 3], smooth: true, itemStyle: { color: '#52C41A' } },
      { name: '已跳过', type: 'line', data: [1, 0, 2, 0, 1, 0, 0], smooth: true, itemStyle: { color: '#FA8C16' } },
    ],
  };

  const deviceStatusOption = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: '设备状态',
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: devices.filter(d => d.status === 'active').length, name: '运行中', itemStyle: { color: '#52C41A' } },
          { value: devices.filter(d => d.status === 'maintenance').length, name: '维护中', itemStyle: { color: '#FA8C16' } },
          { value: devices.filter(d => d.status === 'inactive').length, name: '停用', itemStyle: { color: '#8C8C8C' } },
        ],
      },
    ],
  };

  const standardUsageOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: standards.map(s => s.name) },
    yAxis: { type: 'value' },
    series: [
      {
        name: '使用次数',
        type: 'bar',
        data: standards.map(() => Math.floor(Math.random() * 50) + 10),
        itemStyle: { color: '#165DFF' },
      },
    ],
  };

  const skipReasonsOption = {
    tooltip: { trigger: 'item' },
    series: [
      {
        name: '跳过原因',
        type: 'pie',
        radius: '60%',
        data: [
          { value: 4, name: '设备生产中', itemStyle: { color: '#FA8C16' } },
          { value: 2, name: '备件不足', itemStyle: { color: '#FF7D00' } },
          { value: 1, name: '人员缺席', itemStyle: { color: '#8C8C8C' } },
          { value: 1, name: '其他原因', itemStyle: { color: '#BFBFBF' } },
        ],
      },
    ],
  };

  const taskColumns = [
    {
      title: '设备',
      dataIndex: 'device_id',
      key: 'device_id',
      render: (id: string) => devices.find(d => d.id === id)?.name,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = { completed: 'success', pending: 'processing', skipped: 'warning', in_progress: 'blue' };
        const texts = { completed: '已完成', pending: '待执行', skipped: '已跳过', in_progress: '执行中' };
        return <span style={{ color: colors[status as keyof typeof colors] }}>{texts[status as keyof typeof texts]}</span>;
      },
    },
    {
      title: '执行时间',
      dataIndex: 'executed_at',
      key: 'executed_at',
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Title level={2} className="!mb-0">统计分析</Title>
        <Space>
          <RangePicker onChange={(dates) => setDateRange(dates)} />
          <Select style={{ width: 200 }} value={selectedDevice} onChange={setSelectedDevice} placeholder="选择设备">
            <Option value="all">全部设备</Option>
            {devices.map(device => (
              <Option key={device.id} value={device.id}>{device.name}</Option>
            ))}
          </Select>
        </Space>
      </div>

      {/* KPI 指标卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow" bordered={false}>
            <Statistic
              title="点检完成率"
              value={completionRate}
              suffix="%"
              valueStyle={{ color: completionRate >= 90 ? '#52C41A' : completionRate >= 70 ? '#FA8C16' : '#FF4D4F' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow" bordered={false}>
            <Statistic
              title="已完成任务"
              value={completedTasks}
              valueStyle={{ color: '#52C41A' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow" bordered={false}>
            <Statistic
              title="已跳过任务"
              value={skippedTasks}
              valueStyle={{ color: '#FA8C16' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow" bordered={false}>
            <Statistic
              title="设备总数"
              value={devices.length}
              valueStyle={{ color: '#165DFF' }}
              prefix={<ToolOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="点检执行趋势" className="shadow-sm" bordered={false}>
            <ReactECharts option={taskTrendOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="设备状态分布" className="shadow-sm" bordered={false}>
            <ReactECharts option={deviceStatusOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="点检标准使用情况" className="shadow-sm" bordered={false}>
            <ReactECharts option={standardUsageOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="任务跳过原因分布" className="shadow-sm" bordered={false}>
            <ReactECharts option={skipReasonsOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      {/* 任务详情表格 */}
      <Card title="任务执行记录" className="shadow-sm" bordered={false}>
        <Table
          columns={taskColumns}
          dataSource={tasks}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default Analytics;
