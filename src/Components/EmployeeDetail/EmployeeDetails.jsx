// EmployeeDetails.jsx
import React, { useEffect, useState } from "react";
import Nav from "../Nav/Nav.jsx";
import EmployeeDisplay from "../EmployeeDisplay/EmployeeDisplay.jsx"; // Make a similar display component
import axios from "axios";

const URL = "http://localhost:5000/employees"; // Employee backend URL

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
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (array) => {
    if (!array || array.length === 0) return "";

    const headers = Object.keys(array[0]).join(",");
    const rows = array
      .map((item) =>
        Object.values(item)
          .map((value) =>
            typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value
          )
          .join(",")
      )
      .join("\n");

    return `${headers}\n${rows}`;
  };

  return (
    <div>
      <Nav />
      <div className="p-5">
        <div className="flex gap-3 mb-5">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded flex-1 max-w-md"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Search
          </button>
          <button
            onClick={downloadEmployeeDetails}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Download Employee Details
          </button>
        </div>

        {employees && employees.length > 0 ? (
          employees.map((emp, i) => <EmployeeDisplay key={i} employee={emp} />)
        ) : (
          <p>No employees found</p>
        )}
      </div>
    </div>
  );
}

export default EmployeeDetails;
