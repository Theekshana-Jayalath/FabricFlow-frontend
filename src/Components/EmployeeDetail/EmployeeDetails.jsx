// EmployeeDetails.jsx
import React, { useEffect, useState } from "react";
import EmployeeDisplay from "../EmployeeDisplay/EmployeeDisplay.jsx";
import axios from "axios";

const URL = "https://fabricflow-backend1.onrender.com/employees";

const fetchHandler = async () => {
  try {
    const response = await axios.get(URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
};

function EmployeeDetails() {
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchHandler().then((data) => {
      setEmployees(data?.employees || data || []);
      setAllEmployees(data?.employees || data || []);
    });
  }, []);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setEmployees(allEmployees);
      return;
    }

    const filteredEmployees = allEmployees.filter((emp) =>
      Object.values(emp).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setEmployees(filteredEmployees);
  };

  const downloadEmployeeDetails = () => {
    const csvContent = convertToCSV(employees);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = window.URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "employee_details.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertToCSV = (data) => {
    if (!data.length) return "";

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(",");

    const csvRows = data.map((row) =>
      headers.map((header) => `"${row[header] || ""}"`).join(",")
    );

    return [csvHeaders, ...csvRows].join("\n");
  };

  return (
    <div>
      <div className="p-5">
        <div className="flex gap-3 mb-5">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 flex-1"
          />
          <button
            onClick={handleSearch}
            className="bg-[#005A54] text-white px-4 py-2 rounded hover:bg-[#EF6869] transition-colors"
          >
            Search
          </button>
          <button
            onClick={downloadEmployeeDetails}
            className="bg-[#EF6869] text-white px-4 py-2 rounded hover:bg-[#005A54] transition-colors"
          >
            Download CSV
          </button>
        </div>

        {/* Employee Header */}
        <div className="bg-gradient-to-r from-[#005A54] to-[#EF6869] text-white p-8 rounded-lg mb-6">
          <h1 className="text-3xl font-bold mb-2">Employee Management</h1>
          <p className="text-lg opacity-90">Manage your workforce efficiently</p>
        </div>

        {/* Employee Display */}
        <div className="employees-container">
          {employees && employees.length > 0 ? (
            employees.map((employee, i) => (
              <div key={i}>
                <EmployeeDisplay employee={employee} />
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No employees found or backend not connected</p>
              <p className="text-sm text-gray-400 mt-2">
                Make sure your backend server is running on https://fabricflow-backend1.onrender.com
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeDetails;
