import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EXPENSE_URL = "http://localhost:5000/api/expenses";

const AddExpense = () => {
  const [formData, setFormData] = useState({
    date: "",
    category: "transport",
    amount: "",
    description: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { date, category, amount, description } = formData;

    // Check all fields
    if (!date || !category || !amount || !description) {
      return "All fields are required";
    }

    // Date validation (cannot be future)
    const selectedDate = new Date(date);
    if (selectedDate > new Date()) {
      return "Date cannot be in the future";
    }

    // Amount validation
    if (isNaN(amount) || Number(amount) <= 0) {
      return "Amount must be a valid number greater than 0";
    }

    // Description validation
    if (description.length > 200) {
      return "Description cannot exceed 200 characters";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await axios.post(EXPENSE_URL, {
        ...formData,
        expenseId: `EXP${Date.now()}`, // generate unique ID
      });
      navigate("/"); // redirect back
    } catch (err) {
      console.error(err);
      setError("Failed to add expense");
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFAF4] flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-[#0f4c5c] mb-6 text-center">Add Expense</h2>
        
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
              required
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
              min="1"
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
              maxLength="200"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.description.length}/200 characters
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0f4c5c] text-white font-semibold py-3 rounded-lg hover:bg-[#107896] transition-colors"
          >
            Save Expense
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
