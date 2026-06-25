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
import Swal from "sweetalert2";

ChartJS.register(CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend);

const EXPENSE_URL = "http://localhost:5000/api/expenses";
const PURCHASE_URL = "http://localhost:5000/api/Purchase";
const PAYROLL_URL = "http://localhost:5000/api/payrolls";

const Expenses = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [payrolls, setPayrolls] = useState([]);

  // popup state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    date: "",
    category: "",
    amount: "",
    description: "",
  });

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

  const categoryTotals = {
    transport: expenses
      .filter((e) => e.category === "transport")
      .reduce((sum, e) => sum + Number(e.amount), 0),
    other: expenses
      .filter((e) => e.category === "other")
      .reduce((sum, e) => sum + Number(e.amount), 0),
  };
  const totalPurchases = purchases.reduce(
    (sum, p) => sum + Number(p.totalCost || 0),
    0
  );
  const totalPayrolls = payrolls.reduce(
    (sum, p) => sum + Number(p.netsalary || 0),
    0
  );
  const total =
    categoryTotals.transport +
    categoryTotals.other +
    totalPurchases +
    totalPayrolls;

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setUpdateForm({
      date: expense.date?.substring(0, 10) || "",
      category: expense.category || "",
      amount: expense.amount || "",
      description: expense.description || "",
    });
    setShowUpdateModal(true);
  };

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

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${EXPENSE_URL}/${selectedExpense.expenseId}`,
        updateForm
      );

      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Expense has been updated successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        setShowUpdateModal(false);
        fetchExpenses(); // refresh list
      }
    } catch (error) {
      console.error("Update failed:", error);
      Swal.fire("Error", "Failed to update expense.", "error");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#005654]">Expenses Management</h1>
        <button
          onClick={() => navigate("/admin/finance/expenses/addExpenses")}
          className="bg-[#005A54] text-white px-4 py-2 rounded-lg hover:bg-[#004A44] transition"
        >
          Add Expense
        </button>
      </div>

      <main className="grid gap-10">
        {/* Transport Table */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Transport & Logistics
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-[#005A54] text-[#FFEED6]">
                <tr>
                  <th className="p-3 border">ID</th>
                  <th className="p-3 border">Date</th>
                  <th className="p-3 border">Amount</th>
                  <th className="p-3 border">Description</th>
                  <th className="p-3 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses
                  .filter((e) => e.category === "transport")
                  .map((e) => (
                    <tr key={e.expenseId} className="hover:bg-gray-100 text-center">
                      <td className="p-3 border">{e.expenseId}</td>
                      <td className="p-3 border">{e.date?.substring(0, 10)}</td>
                      <td className="p-3 border text-green-700 font-medium">
                        Rs {Number(e.amount).toFixed(2)}
                      </td>
                      <td className="p-3 border">{e.description}</td>
                      <td className="p-3 border">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleEdit(e)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(e.expenseId)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {expenses.filter((e) => e.category === "transport").length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-4 text-gray-500 text-center">
                      No transport expenses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Other Expenses Table */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Other Expenses
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-[#005A54] text-[#FFEED6]">
                <tr>
                  <th className="p-3 border">ID</th>
                  <th className="p-3 border">Date</th>
                  <th className="p-3 border">Amount</th>
                  <th className="p-3 border">Description</th>
                  <th className="p-3 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses
                  .filter((e) => e.category === "other")
                  .map((e) => (
                    <tr key={e.expenseId} className="hover:bg-gray-100 text-center">
                      <td className="p-3 border">{e.expenseId}</td>
                      <td className="p-3 border">{e.date?.substring(0, 10)}</td>
                      <td className="p-3 border text-green-700 font-medium">
                        Rs {Number(e.amount).toFixed(2)}
                      </td>
                      <td className="p-3 border">{e.description}</td>
                      <td className="p-3 border">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleEdit(e)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(e.expenseId)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {expenses.filter((e) => e.category === "other").length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-4 text-gray-500 text-center">
                      No other expenses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Purchases Table */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Purchase Records
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-[#005A54] text-[#FFEED6]">
                <tr>
                  <th className="p-3 border">ID</th>
                  <th className="p-3 border">Date</th>
                  <th className="p-3 border">Material</th>
                  <th className="p-3 border">Amount</th>
                </tr>
              </thead>
              <tbody>
                {purchases.length > 0 ? (
                  purchases.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-100 text-center">
                      <td className="p-3 border">{p.purchaseId}</td>
                      <td className="p-3 border">
                        {p.date ? new Date(p.date).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="p-3 border">{p.materialId?.name || "N/A"}</td>
                      <td className="p-3 border text-green-700 font-medium">
                        Rs {Number(p.totalCost || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-4 text-gray-500 text-center">
                      No purchase records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payroll Table */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Payroll Records
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-[#005A54] text-[#FFEED6]">
                <tr>
                  <th className="p-3 border">Payroll ID</th>
                  <th className="p-3 border">Employee</th>
                  <th className="p-3 border">Net Salary</th>
                  <th className="p-3 border">Date</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.length > 0 ? (
                  payrolls.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-100 text-center">
                      <td className="p-3 border">{p.payrollId}</td>
                      <td className="p-3 border">{p.empName}</td>
                      <td className="p-3 border text-green-700 font-medium">
                        Rs {Number(p.netsalary || 0).toFixed(2)}
                      </td>
                      <td className="p-3 border">
                        {p.date?.substring(0, 10) || "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-4 text-gray-500 text-center">
                      No payroll records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-96 max-w-[90vw]">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Update Expense
            </h2>
            <form onSubmit={handleUpdateSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block font-medium mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={updateForm.date}
                  onChange={handleUpdateChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#005A54]"
                  required
                />
              </div>
              
              <div>
                <label className="block font-medium mb-1">Category</label>
                <select
                  name="category"
                  value={updateForm.category}
                  onChange={handleUpdateChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#005A54]"
                  required
                >
                  <option value="transport">Transport & Logistics</option>
                  <option value="other">Other Expenses</option>
                </select>
              </div>
              
              <div>
                <label className="block font-medium mb-1">Amount (Rs)</label>
                <input
                  type="number"
                  name="amount"
                  value={updateForm.amount}
                  onChange={handleUpdateChange}
                  step="0.01"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#005A54]"
                  required
                />
              </div>
              
              <div>
                <label className="block font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={updateForm.description}
                  onChange={handleUpdateChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#005A54] resize-vertical"
                  required
                />
              </div>
              
              <div className="flex justify-between mt-6 gap-3">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#005A54] text-white px-4 py-2 rounded-lg hover:bg-[#004A44] transition-colors"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;