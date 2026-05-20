import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Templates from "./pages/Templates";
import ProcessList from "./pages/ProcessList";
import ProcessEditor from "./pages/ProcessEditor";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/processes" element={<ProcessList />} />
          <Route path="/processes/:id" element={<ProcessEditor />} />
        </Routes>
      </Layout>
    </Router>
  );
}
