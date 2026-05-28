import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Cpu, AlertTriangle, CheckSquare, BarChart3 } from "lucide-react";
import Dashboard from "@/pages/Dashboard";
import Devices from "@/pages/Devices";
import FMEAPage from "@/pages/FMEA";
import Tasks from "@/pages/Tasks";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "仪表板" },
  { path: "/devices", icon: Cpu, label: "设备管理" },
  { path: "/fmea", icon: AlertTriangle, label: "FMEA分析" },
  { path: "/tasks", icon: CheckSquare, label: "任务执行" },
];

function Sidebar() {
  const location = useLocation();
  
  return (
    <div className="w-64 bg-gray-900 min-h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white">设备点巡检系统</h1>
      </div>
      <nav className="mt-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
                isActive ? "bg-blue-600 text-white" : ""
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 bg-gray-50 min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/fmea" element={<FMEAPage />} />
            <Route path="/tasks" element={<Tasks />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
