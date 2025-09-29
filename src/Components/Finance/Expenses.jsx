import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./Expenses.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const URL = "http://localhost:5000/api/expenses";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    expenseId: "",
    date: "",
    category: "rawMaterials",
    amount: "",
    description: "",
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(URL);
      setExpenses(res.data.expenses || []);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateExpenseId = () => `EXP${Date.now()}`;

  const addExpense = async () => {
    try {
      const newExpense = {
        ...formData,
        expenseId: formData.expenseId || generateExpenseId(),
      };
      const res = await axios.post(URL, newExpense);
      setExpenses([...expenses, res.data.expense]);
      resetForm();
    } catch (err) {
      console.error("Error adding expense:", err);
      setError("Error adding expense");
    }
  };

  const updateExpense = async () => {
    try {
      const updatedExpense = {
        ...formData,
        expenseId: formData.expenseId || generateExpenseId(),
      };
      const res = await axios.put(`${URL}/${editId}`, updatedExpense);
      setExpenses(
        expenses.map((exp) => (exp._id === editId ? res.data.expense : exp))
      );
      resetForm();
    } catch (err) {
      console.error("Error updating expense:", err);
      setError("Error updating expense");
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`${URL}/${id}`);
      setExpenses(expenses.filter((exp) => exp._id !== id));
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.date || !formData.category || !formData.amount || !formData.description) {
      setError("All fields are required.");
      return;
    }
    if (editId) updateExpense();
    else addExpense();
  };

  const handleEdit = (expense) => {
    setFormData({
      expenseId: expense.expenseId,
      date: expense.date?.substring(0, 10) || "",
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
    });
    setEditId(expense._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      expenseId: "",
      date: "",
      category: "rawMaterials",
      amount: "",
      description: "",
    });
    setShowForm(false);
    setEditId(null);
    setError("");
  };

  // Category-wise totals
  const categoryTotals = {
    rawMaterials: expenses
      .filter((e) => e.category === "rawMaterials")
      .reduce((sum, e) => sum + Number(e.amount), 0),
    transport: expenses
      .filter((e) => e.category === "transport")
      .reduce((sum, e) => sum + Number(e.amount), 0),
    other: expenses
      .filter((e) => e.category === "other")
      .reduce((sum, e) => sum + Number(e.amount), 0),
  };

  // Percentage breakdown
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const categoryPercent = {
    rawMaterials: totalExpenses
      ? ((categoryTotals.rawMaterials / totalExpenses) * 100).toFixed(1)
      : 0,
    transport: totalExpenses
      ? ((categoryTotals.transport / totalExpenses) * 100).toFixed(1)
      : 0,
    other: totalExpenses
      ? ((categoryTotals.other / totalExpenses) * 100).toFixed(1)
      : 0,
  };

  // Monthly trend
  const months = [...Array(12).keys()].map((i) => i + 1);
  const monthlyTotals = months.map(
    (m) =>
      expenses
        .filter((e) => new Date(e.date).getMonth() + 1 === m)
        .reduce((sum, e) => sum + Number(e.amount), 0)
  );

  // Top 3 largest expenses
  const topExpenses = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 3);

  // Chart data
  const trendChartData = {
    labels: months.map((m) => `Month ${m}`),
    datasets: [
      {
        label: "Monthly Expenses ($)",
        data: monthlyTotals,
        fill: false,
        borderColor: "#3b82f6",
        tension: 0.2,
      },
    ],
  };

  const pieChartData = {
    labels: ["Raw Materials", "Transport", "Other"],
    datasets: [
      {
        data: [categoryTotals.rawMaterials, categoryTotals.transport, categoryTotals.other],
        backgroundColor: ["#3b82f6", "#10b981", "#f97316"],
        hoverBackgroundColor: ["#1e40af", "#047857", "#dc2626"],
      },
    ],
  };

  return (
    <div className="flex flex-col h-screen bg-[#FEFAF4] font-sans">
      {/* Header Bar */}
      <header className="bg-[#0f4c5c] text-white px-6 py-4 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold">Finance Admin - Expenses</h1>
        <div className="flex items-center gap-4">
          <span>Welcome, Admin</span>
          <button className="bg-white text-[#0f4c5c] px-3 py-1 rounded hover:bg-gray-200">
            Logout
          </button>
        </div>
      </header>

      {/* Body Section */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-[#0f4c5c] shadow-lg p-4 text-white flex flex-col">
          <h2 className="text-2xl font-bold mb-6">Expenses</h2>
          <button
            className="flex items-center gap-2 w-full p-2 rounded hover:bg-[#107896] transition mb-4"
            onClick={() => setShowForm(true)}
          >
            ➕ Add Expense
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto space-y-8">
          {/* Add/Edit Form */}
          {showForm && (
            <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700">Expense ID</label>
                    <input
                      type="text"
                      name="expenseId"
                      value={formData.expenseId}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      placeholder="Leave blank for auto ID"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    >
                      <option value="rawMaterials">Raw Materials</option>
                      <option value="transport">Transport & Logistics</option>
                      <option value="other">Other Expenses</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700">Amount (Rs)</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-gray-700">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    placeholder="Enter expense description"
                    required
                  />
                </div>

                <div className="flex gap-4 mt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                  >
                    {editId ? "Update" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tables & Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Expense Tables */}
            <div className="space-y-6 overflow-auto max-h-[70vh]">
              {["rawMaterials", "transport", "other"].map((category) => (
                <div key={category}>
                  <h4 className="text-lg font-bold mb-2">
                    {category === "rawMaterials"
                      ? "Raw Material Expenses"
                      : category === "transport"
                      ? "Transport & Logistics"
                      : "Other Expenses"}
                  </h4>
                  <table className="w-full bg-white shadow-md rounded table-auto">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="p-2">Expense ID</th>
                        <th className="p-2">Date</th>
                        <th className="p-2">Amount</th>
                        <th className="p-2">Description</th>
                        <th className="p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses
                        .filter((exp) => exp.category === category)
                        .map((exp) => (
                          <tr key={exp._id}>
                            <td className="p-2">{exp.expenseId}</td>
                            <td className="p-2">{exp.date?.substring(0, 10)}</td>
                            <td className="p-2">
                              Rs{Number(exp.amount).toFixed(2)}
                            </td>
                            <td className="p-2">{exp.description}</td>
                            <td className="p-2 flex gap-2 justify-center">
                              <button
                                onClick={() => handleEdit(exp)}
                                className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => deleteExpense(exp._id)}
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
              ))}
            </div>

            {/* Analytics & Summary */}
            <div className="space-y-6">
              {/* Category-wise Pie Chart */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">
                  Category-wise Expenses
                </h3>
                <p className="mb-2 font-bold text-right">
                  Total Expenses: Rs{totalExpenses.toFixed(2)}
                </p>
                <Pie data={pieChartData} />
                <ul className="mt-2">
                  <li>Raw Materials: {categoryPercent.rawMaterials}%</li>
                  <li>Transport: {categoryPercent.transport}%</li>
                  <li>Other: {categoryPercent.other}%</li>
                </ul>
              </div>

              {/* Monthly Trend Line Chart */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">
                  Monthly Expense Trend
                </h3>
                <Line data={trendChartData} />
              </div>

              {/* Top 3 Largest Expenses */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">
                  Top 3 Largest Expenses
                </h3>
                <ol className="list-decimal list-inside">
                  {topExpenses.map((exp) => (
                    <li key={exp._id}>
                      {exp.expenseId} - Rs{Number(exp.amount).toFixed(2)} (
                      {exp.category})
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Expenses;
