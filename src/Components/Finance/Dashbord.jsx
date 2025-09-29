import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { FaDollarSign, FaFileInvoiceDollar, FaMoneyBillWave, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import './Dashbord.css';
import './Expenses.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpensesURL = "http://localhost:5000/api/expenses";
const InvoicesURL = "http://localhost:5000/api/invoices";
const ProfileURL = "http://localhost:5000/api/profile";

const FinanceDashboard = () => {
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    invoices: 0,
    clients: 1423, // placeholder
    loyalty: 78,   // placeholder
  });

  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [greeting, setGreeting] = useState("");
  const [profile, setProfile] = useState({ name: "", email: "", avatar: "" });

  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      const res = await axios.get(ExpensesURL);
      const allExpenses = res.data.expenses || [];
      setExpenses(allExpenses);
      const total = allExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
      setTotalExpenses(total);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  };

  // Fetch invoices (for revenue & count)
  const fetchInvoices = async () => {
    try {
      const res = await axios.get(InvoicesURL);
      const allInvoices = res.data.invoices || [];
      const totalRevenue = allInvoices.reduce((sum, inv) => sum + Number(inv.Amount || 0), 0);
      setMetrics(prev => ({
        ...prev,
        totalRevenue,
        invoices: allInvoices.length,
      }));
    } catch (err) {
      console.error("Error fetching invoices:", err);
    }
  };

  // Fetch profile
  const fetchProfile = async () => {
    try {
      const res = await axios.get(ProfileURL);
      setProfile(res.data.user || {});
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  // Update greeting
  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  };

  useEffect(() => {
    fetchExpenses();
    fetchInvoices();
    fetchProfile();
    updateGreeting();

    const expenseInterval = setInterval(fetchExpenses, 5000);
    const invoiceInterval = setInterval(fetchInvoices, 5000);
    const profileInterval = setInterval(fetchProfile, 10000);
    const greetingInterval = setInterval(updateGreeting, 60000);

    return () => {
      clearInterval(expenseInterval);
      clearInterval(invoiceInterval);
      clearInterval(profileInterval);
      clearInterval(greetingInterval);
    };
  }, []);

  // Pie chart data
  const categoryTotals = { rawMaterials: 0, transport: 0, other: 0 };
  expenses.forEach(exp => {
    if (exp.category === 'rawMaterials') categoryTotals.rawMaterials += Number(exp.amount);
    else if (exp.category === 'transport') categoryTotals.transport += Number(exp.amount);
    else categoryTotals.other += Number(exp.amount);
  });

  const pieData = {
    labels: ['Raw Materials', 'Transport', 'Other'],
    datasets: [
      {
        data: [categoryTotals.rawMaterials, categoryTotals.transport, categoryTotals.other],
        backgroundColor: ['#facc15', '#10b981', '#f97316'],
        borderColor: ['#d97706', '#047857', '#dc2626'],
        borderWidth: 1,
      }
    ]
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Category-wise Expenses' }
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#FEFAF4] font-sans">
      {/* Sidebar */}
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header */}
        <header className="flex justify-between items-center bg-white shadow p-4 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-700">{greeting}, {profile.name || "Admin"}!</h2>
            <p className="text-gray-500 text-sm">{profile.email}</p>
          </div>
          <div className="flex items-center gap-4">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <FaUserCircle className="text-gray-400 text-3xl" />
            )}
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 flex-1 flex flex-col gap-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#005a54] p-5 rounded-xl shadow-lg flex flex-col items-center justify-center">
              <FaDollarSign className="text-white text-3xl mb-2" />
              <div className="text-white">Total Revenue</div>
              <div className="text-2xl font-bold text-white">Rs {metrics.totalRevenue.toLocaleString()}</div>
            </div>

            <div className="bg-[#005a54] p-5 rounded-xl shadow-lg flex flex-col items-center justify-center">
              <FaFileInvoiceDollar className="text-white text-3xl mb-2" />
              <div className="text-white">Invoices</div>
              <div className="text-2xl font-bold text-white">{metrics.invoices}</div>
            </div>

            <div className="bg-[#005a54] p-5 rounded-xl shadow-lg flex flex-col items-center justify-center">
              <FaMoneyBillWave className="text-white text-3xl mb-2" />
              <div className="text-white">Total Expenses</div>
              <div className="text-2xl font-bold text-white">Rs {totalExpenses.toLocaleString()}</div>
            </div>

            <div className="bg-[#005a54] p-5 rounded-xl shadow-lg flex flex-col items-center justify-center">
              <FaMoneyBillWave className="text-white text-3xl mb-2" />
              <div className="text-white">Profit</div>
              <div className="text-2xl font-bold text-white">Rs {(metrics.totalRevenue - totalExpenses).toLocaleString()}</div>
            </div>
          </div>

          {/* Pie Chart & Recent Expenses */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="bg-white p-4 rounded-xl shadow-lg flex-1">
              <h4 className="text-gray-500 text-sm mb-2 text-center">Category-wise Expenses</h4>
              <Pie data={pieData} options={pieOptions} />
            </div>

            <div className="bg-white rounded-xl shadow-lg flex-1 overflow-x-auto">
              <h3 className="text-xl font-semibold p-5 border-b border-gray-200">Recent Expenses</h3>
              <table className="w-full text-sm divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left text-gray-500">ID</th>
                    <th className="p-3 text-left text-gray-500">Date</th>
                    <th className="p-3 text-left text-gray-500">Category</th>
                    <th className="p-3 text-left text-gray-500">Amount</th>
                    <th className="p-3 text-left text-gray-500">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {expenses.slice(-5).reverse().map(exp => (
                    <tr key={exp._id} className="hover:bg-gray-50 transition">
                      <td className="p-3">{exp.expenseId}</td>
                      <td className="p-3">{exp.date?.substring(0, 10)}</td>
                      <td className="p-3">{exp.category}</td>
                      <td className="p-3 text-red-600">Rs {Number(exp.amount).toFixed(2)}</td>
                      <td className="p-3">{exp.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
