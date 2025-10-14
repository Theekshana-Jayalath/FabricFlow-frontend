<<<<<<< Updated upstream
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
=======
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import './addExpenses.css';

const EXPENSE_URL = "http://localhost:5000/api/expenses";

const FinanceAddExpenses = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: '',
    category: 'transport', // default to Transport
>>>>>>> Stashed changes
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

<<<<<<< Updated upstream
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
=======
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description || !formData.amount || !formData.date) {
      setError('All fields are required.');
>>>>>>> Stashed changes
      return;
    }

    try {
<<<<<<< Updated upstream
      await axios.post(EXPENSE_URL, {
        ...formData,
        expenseId: `EXP${Date.now()}`, // generate unique ID
      });
      navigate("/"); // redirect back
    } catch (err) {
      console.error(err);
      setError("Failed to add expense");
=======
      // Save expense to backend
      await axios.post(EXPENSE_URL, {
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: formData.date,
        category: formData.category,
      });

      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Added!',
        text: 'Expense has been added successfully.',
        timer: 1500,
        showConfirmButton: false,
      });

      setError('');
      // Navigate to the correct route of Expenses.jsx
      navigate('/admin/finance/expenses', { replace: true });
    } catch (err) {
      console.error('Failed to add expense:', err.response?.data || err.message);
      setError('Failed to save expense. Check console for details.');
>>>>>>> Stashed changes
    }
  };

  return (
<<<<<<< Updated upstream
    <div className="min-h-screen bg-[#FEFAF4] flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-[#0f4c5c] mb-6 text-center">Add Expense</h2>
        
        {error && <p className="text-red-500 font-medium mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Date</label>
=======
    <div className="min-h-screen bg-gradient-to-r ">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Add New Expense</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
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
          <div className="mb-4">
            <label className="block text-gray-700">Amount ($)</label>
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
          <div className="mb-4">
            <label className="block text-gray-700">Date</label>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
            className="w-full bg-[#0f4c5c] text-white font-semibold py-3 rounded-lg hover:bg-[#107896] transition-colors"
=======
            className="w-full bg-[#005A54]  text-white p-2 rounded hover:bg-[#005A54]"
>>>>>>> Stashed changes
          >
            Save Expense
          </button>
        </form>
<<<<<<< Updated upstream
=======
        <button
          onClick={() => navigate('/admin/finance/expenses')}
          className="mt-4 w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
        >
          Cancel
        </button>
>>>>>>> Stashed changes
      </div>
    </div>
  );
};

<<<<<<< Updated upstream
export default AddExpense;
=======
export default FinanceAddExpenses;
>>>>>>> Stashed changes
