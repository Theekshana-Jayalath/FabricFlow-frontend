// App.jsx
import { Routes, Route } from "react-router-dom";
import "./App.css";
import UserDetails from "./Components/UserDetail/UserDetails";
import EmployeeDetails from "./Components/EmployeeDetail/EmployeeDetails";

// Admin Components
import AdminLayout from "./admin/components/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import UserTable from "./admin/components/UserTable";
import EmployeeTable from "./admin/components/EmployeeTable";
import Charts from "./admin/components/Charts";
import Widgets from "./admin/components/Widgets";

function App() {
  return (
    <div>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<UserDetails />} />  
        <Route path="/UserDetails" element={<UserDetails />} />
        <Route path="/Employees" element={<EmployeeDetails />} />
        <Route path="/Employees/:id" element={<EmployeeDetails />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserTable />} />
          <Route path="employees" element={<EmployeeTable />} />
          <Route path="charts" element={<Charts />} />
          <Route path="widgets" element={<Widgets />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
