import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const EXPENSE_URL = "http://localhost:5000/api/expenses";

const AddExpense = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // If editing, prefill with state from navigate
  const expenseToEdit = location.state?.expense;

  const [formData, setFormData] = useState({
    date: expenseToEdit?.date?.substring(0, 10) || "",
    category: expenseToEdit?.category || "transport",
    amount: expenseToEdit?.amount || "",
    description: expenseToEdit?.description || "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.category || !formData.amount || !formData.description) {
      setError("All fields are required");
      return;
    }

    try {
      if (expenseToEdit) {
        // ✅ Update existing expense by expenseId
        await axios.put(`${EXPENSE_URL}/${expenseToEdit.expenseId}`, formData);
      } else {
        // ✅ Add new expense (backend will generate expenseId)
        await axios.post(EXPENSE_URL, formData);
      }
      navigate("/"); // Go back to Expenses page
    } catch (err) {
      console.error(err);
      setError(expenseToEdit ? "Failed to update expense" : "Failed to add expense");
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFAF4] flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-[#0f4c5c] mb-6 text-center">
          {expenseToEdit ? "Edit Expense" : "Add Expense"}
        </h2>

        {error && <p className="text-red-500 font-medium mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]"
            >
              <option value="transport">Transport & Logistics</option>
              <option value="other">Other Expenses</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Amount (Rs)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter expense description"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#0f4c5c] text-white font-semibold py-3 rounded-lg hover:bg-[#107896] transition-colors"
          >
            {expenseToEdit ? "Update Expense" : "Save Expense"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
