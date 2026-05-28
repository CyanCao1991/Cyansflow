import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import AppLayout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Devices from "@/pages/Devices";
import Standards from "@/pages/Standards";
import Plans from "@/pages/Plans";
import Tasks from "@/pages/Tasks";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import { useAppStore } from "@/store";
import { mockDevices, mockStandards, mockPlans, mockTasks } from "@/utils/mockData";

export default function App() {
  const { setDevices, setStandards, setPlans, setTasks } = useAppStore();

  useEffect(() => {
    setDevices(mockDevices);
    setStandards(mockStandards);
    setPlans(mockPlans);
    setTasks(mockTasks);
  }, [setDevices, setStandards, setPlans, setTasks]);

  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/standards" element={<Standards />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}
