// Expenses.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // SweetAlert2

ChartJS.register(CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend);

const EXPENSE_URL = "http://localhost:5000/api/expenses";
const PURCHASE_URL = "http://localhost:5000/purchases";
const PAYROLL_URL = "http://localhost:5000/api/payrolls";

const Expenses = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [payrolls, setPayrolls] = useState([]);

  useEffect(() => {
    fetchExpenses();
    fetchPurchases();
    fetchPayrolls();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(EXPENSE_URL);
      setExpenses(res.data.expenses || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPurchases = async () => {
    try {
      const res = await axios.get(PURCHASE_URL);
      setPurchases(res.data.purchases || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPayrolls = async () => {
    try {
      const res = await axios.get(PAYROLL_URL);
      setPayrolls(res.data.payrolls || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Totals
  const categoryTotals = {
    transport: expenses
      .filter((e) => e.category === "transport")
      .reduce((sum, e) => sum + Number(e.amount), 0),
    other: expenses
      .filter((e) => e.category === "other")
      .reduce((sum, e) => sum + Number(e.amount), 0),
  };
  const totalPurchases = purchases.reduce((sum, p) => sum + Number(p.totalCost || 0), 0);
  const totalPayrolls = payrolls.reduce((sum, p) => sum + Number(p.netsalary || 0), 0);
  const total = categoryTotals.transport + categoryTotals.other + totalPurchases + totalPayrolls;

  const categoryPercent = {
    transport: total ? ((categoryTotals.transport / total) * 100).toFixed(1) : 0,
    other: total ? ((categoryTotals.other / total) * 100).toFixed(1) : 0,
    purchases: total ? ((totalPurchases / total) * 100).toFixed(1) : 0,
    payroll: total ? ((totalPayrolls / total) * 100).toFixed(1) : 0,
  };

  const pieData = {
    labels: ["Transport", "Other", "Purchases", "Payroll"],
    datasets: [
      {
        data: [categoryTotals.transport, categoryTotals.other, totalPurchases, totalPayrolls],
        backgroundColor: ["#10b981", "#f97316", "#3b82f6", "#facc15"],
        hoverBackgroundColor: ["#047857", "#dc2626", "#1e40af", "#ca8a04"],
      },
    ],
  };

  // === Handlers ===
  const handleEdit = (expense) => {
    navigate("/updateExpenses", { state: { expense } });
  };

  // Delete expense handler with SweetAlert2
  const handleDelete = async (expenseId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This expense will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${EXPENSE_URL}/${expenseId}`);
        setExpenses((prevExpenses) =>
          prevExpenses.filter((expense) => expense.expenseId !== expenseId)
        );

        Swal.fire("Deleted!", "Expense has been deleted.", "success");
      } catch (err) {
        console.error("Delete failed:", err);
        Swal.fire("Error", "Failed to delete expense.", "error");
      }
    }
  };

  // Update success message
  const handleUpdateSuccess = () => {
    Swal.fire({
      icon: "success",
      title: "Updated!",
      text: "Expense has been updated successfully.",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
     <aside className="w-64 bg-[#005a54] text-white shadow-lg flex flex-col">
        <h2 className="text-2xl font-bold mb-6">Finance</h2>
        <button
          className="bg-[#10b981] p-2 rounded hover:bg-[#047857] mb-4"
          onClick={() => navigate("/admin/finance/expenses/addExpenses")}
        >
          ➕ Add Expense
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto space-y-8">
        {/* Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Transport Table */}
          <div className="bg-white p-4 rounded-lg shadow-md overflow-auto max-h-[40vh]">
            <h3 className="font-bold mb-2">Transport & Logistics</h3>
            <table className="min-w-full table-auto">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2">ID</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Description</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses
                  .filter((e) => e.category === "transport")
                  .map((e) => (
                    <tr key={e.expenseId} className="border-b">
                      <td className="p-2">{e.expenseId}</td>
                      <td className="p-2">{e.date?.substring(0, 10)}</td>
                      <td className="p-2">Rs {Number(e.amount).toFixed(2)}</td>
                      <td className="p-2">{e.description}</td>
                      <td className="p-2 flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(e)}
                          className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(e.expenseId)}
                          className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Other Expenses Table */}
          <div className="bg-white p-4 rounded-lg shadow-md overflow-auto max-h-[40vh]">
            <h3 className="font-bold mb-2">Other Expenses</h3>
            <table className="min-w-full table-auto">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2">ID</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Description</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses
                  .filter((e) => e.category === "other")
                  .map((e) => (
                    <tr key={e.expenseId} className="border-b">
                      <td className="p-2">{e.expenseId}</td>
                      <td className="p-2">{e.date?.substring(0, 10)}</td>
                      <td className="p-2">Rs {Number(e.amount).toFixed(2)}</td>
                      <td className="p-2">{e.description}</td>
                      <td className="p-2 flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(e)}
                          className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(e.expenseId)}
                          className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Purchases Table */}
          <div className="bg-white p-4 rounded-lg shadow-md overflow-auto max-h-[40vh]">
            <h3 className="font-bold mb-2">Purchase Records</h3>
            <table className="min-w-full table-auto">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2">ID</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Material</th>
                  <th className="p-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p._id} className="border-b">
                    <td className="p-2">{p.purchaseId}</td>
                    <td className="p-2">{p.date ? new Date(p.date).toLocaleDateString() : "N/A"}</td>
                    <td className="p-2">{p.materialId?.name || "N/A"}</td>
                    <td className="p-2">Rs {Number(p.totalCost || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payroll Table */}
          <div className="bg-white p-4 rounded-lg shadow-md overflow-auto max-h-[40vh]">
            <h3 className="font-bold mb-2">Payroll Records</h3>
            <table className="min-w-full table-auto">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2">Payroll ID</th>
                  <th className="p-2">Employee</th>
                  <th className="p-2">Net Salary</th>
                  <th className="p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.length ? (
                  payrolls.map((p) => (
                    <tr key={p._id} className="border-b">
                      <td className="p-2">{p.payrollId}</td>
                      <td className="p-2">{p.empName}</td>
                      <td className="p-2">Rs {Number(p.netsalary || 0).toFixed(2)}</td>
                      <td className="p-2">{p.date?.substring(0, 10) || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center p-4">
                      No payroll records.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Category-wise Expenses
          </h2>
          <p className="font-bold text-right mb-4">
            Total Expenses: Rs {total.toFixed(2)}
          </p>
          <div className="max-w-md mx-auto">
            <Pie data={pieData} />
          </div>
          <ul className="mt-2 text-sm text-center">
            <li>Transport: {categoryPercent.transport}%</li>
            <li>Other: {categoryPercent.other}%</li>
            <li>Purchases: {categoryPercent.purchases}%</li>
            <li>Payroll: {categoryPercent.payroll}%</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Expenses;
