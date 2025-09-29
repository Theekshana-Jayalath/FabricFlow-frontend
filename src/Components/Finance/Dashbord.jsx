import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import {
  FaDollarSign,
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaSignOutAlt,
  FaUserCircle,
} from 'react-icons/fa';
import '../../styles/Finance/Dashbord.css';
import '../../styles/Finance/Expenses.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpensesURL = "http://localhost:5000/api/expenses";
const PurchasesURL = "http://localhost:5000/purchases";
const PayrollURL = "http://localhost:5000/api/payrolls";
const ProfileURL = "http://localhost:5000/api/profile";
const OrdersURL = "http://localhost:5000/api/orders";

const Dashboard = ({ onTotalExpensesChange }) => {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [paidTotalAmount, setPaidTotalAmount] = useState(0);
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [greeting, setGreeting] = useState("");
  const [profile, setProfile] = useState({ name: "", email: "", avatar: "" });

  // Fetch data functions
  const fetchExpenses = async () => {
    try {
      const res = await axios.get(ExpensesURL);
      setExpenses(res.data.expenses || []);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  };

  const fetchPurchases = async () => {
    try {
      const res = await axios.get(PurchasesURL);
      setPurchases(res.data.purchases || res.data || []);
    } catch (err) {
      console.error("Error fetching purchases:", err);
    }
  };

  const fetchPayrolls = async () => {
    try {
      const res = await axios.get(PayrollURL);
      setPayrolls(res.data.payrolls || []);
    } catch (err) {
      console.error("Error fetching payrolls:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(OrdersURL);
      const allOrders = res.data.orders || [];

      const paidOrders = allOrders.filter(
        o => (o.paymentStatus || '').toUpperCase() === 'PAID'
      );
      const paidAmount = paidOrders.reduce(
        (sum, o) => sum + Number(o.totalAmount || 0), 0
      );
      setPaidTotalAmount(paidAmount);

      const sortedOrders = [...allOrders].sort(
        (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
      );
      setInvoices(sortedOrders);
      setFilteredInvoices(sortedOrders.slice(0, 5));
    } catch (err) {
      console.error("Orders fetch error:", err);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get(ProfileURL);
      setProfile(res.data.user || {});
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  };

  useEffect(() => {
    fetchExpenses();
    fetchPurchases();
    fetchPayrolls();
    fetchOrders();
    fetchProfile();
    updateGreeting();
  }, []);

  // Calculate totals
  useEffect(() => {
    const categoryTotals = {
      transport: expenses.filter(e => e.category === "transport").reduce((sum, e) => sum + Number(e.amount), 0),
      other: expenses.filter(e => e.category === "other").reduce((sum, e) => sum + Number(e.amount), 0),
    };
    const totalPurchases = purchases.reduce((sum, p) => sum + Number(p.totalCost || 0), 0);
    const totalPayrolls = payrolls.reduce((sum, p) => sum + Number(p.netsalary || 0), 0);

    const total = categoryTotals.transport + categoryTotals.other + totalPurchases + totalPayrolls;
    setTotalExpenses(total);

    if (onTotalExpensesChange) {
      onTotalExpensesChange(total);
    }
  }, [expenses, purchases, payrolls, onTotalExpensesChange]);

  // === Pie chart like Expenses.jsx ===
  const categoryTotals = {
    transport: expenses.filter(e => e.category === "transport").reduce((sum, e) => sum + Number(e.amount), 0),
    other: expenses.filter(e => e.category === "other").reduce((sum, e) => sum + Number(e.amount), 0),
  };
  const totalPurchases = purchases.reduce((sum, p) => sum + Number(p.totalCost || 0), 0);
  const totalPayrolls = payrolls.reduce((sum, p) => sum + Number(p.netsalary || 0), 0);
  const total = categoryTotals.transport + categoryTotals.other + totalPurchases + totalPayrolls;

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

  const pieOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#005a54] text-white shadow-lg flex flex-col">
        <div className="text-2xl font-bold p-5">Finance Admin</div>
        <nav className="flex-1">
          <ul className="space-y-1 px-2">
            <li><button className="nav-link w-full flex items-center gap-2" onClick={() => navigate('/')}>🏠 Home</button></li>
            <li><button className="nav-link w-full flex items-center gap-2" onClick={() => navigate('/expenses')}>💰 Expenses</button></li>
            <li><button className="nav-link w-full flex items-center gap-2" onClick={() => navigate('/invoices')}>🧾 Invoices</button></li>
            <li><button className="nav-link w-full flex items-center gap-2" onClick={() => navigate('/payroll')}>👥 Payroll</button></li>
            <li><button className="nav-link w-full flex items-center gap-2" onClick={() => navigate('/Report')}>📊 Report</button></li>
          </ul>
        </nav>

        <button className="btn-danger mt-auto flex items-center gap-2 mx-3 mb-3 justify-center" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow card-header flex justify-between items-center sticky top-0 z-10 p-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-700">{greeting}, {profile.name || "Admin"}!</h2>
            <p className="text-gray-500 text-sm">{profile.email}</p>
          </div>
          <div>
            {profile.avatar ? (
              <img src={profile.avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <FaUserCircle className="text-gray-400 text-3xl" />
            )}
          </div>
        </header>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col gap-6">
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card flex flex-col items-center justify-center p-6 bg-[#005a54] text-white">
              <FaDollarSign className="text-3xl mb-2" />
              <div>Total Revenue</div>
              <div className="text-2xl font-bold">Rs {paidTotalAmount.toLocaleString()}</div>
            </div>

            <div className="card flex flex-col items-center justify-center p-6 bg-[#005a54] text-white">
              <FaMoneyBillWave className="text-3xl mb-2" />
              <div>Total Expenses</div>
              <div className="text-2xl font-bold">Rs {totalExpenses.toLocaleString()}</div>
            </div>

            <div className="card flex flex-col items-center justify-center p-6 bg-[#005a54] text-white">
              <FaFileInvoiceDollar className="text-3xl mb-2" />
              <div>Profit</div>
              <div className="text-2xl font-bold">Rs {(paidTotalAmount - totalExpenses).toLocaleString()}</div>
            </div>
          </div>

          {/* Pie Chart & Recent Invoices */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="card flex-1 p-6 bg-white rounded-lg shadow-md">
              <h4 className="text-gray-600 text-sm mb-4 text-center">Category-wise Expenses</h4>
              <Pie data={pieData} options={pieOptions} />
            </div>

            <div className="card flex-1 bg-white rounded-lg shadow-md p-6">
              <h4 className="text-gray-700 text-lg font-semibold mb-4">Recent Invoices</h4>
              {(!filteredInvoices || filteredInvoices.length === 0) ? (
                <p className="text-gray-500">No invoices found.</p>
              ) : (
                filteredInvoices.map((invoice) => (
                  <div key={invoice._id} className="bg-blue-50 rounded-lg p-4 mb-4 shadow-sm">
                    <div className="flex justify-between mb-2">
                      <p className="font-semibold">Invoice ID: {invoice.invoiceId}</p>
                      <p className={`font-semibold ${ (invoice.paymentStatus || "Pending").toUpperCase() === "PAID" ? "text-green-600" : "text-red-600" }`}>
                        {invoice.paymentStatus || "Pending"}
                      </p>
                    </div>
                    <p>Date: {formatDate(invoice.orderDate)}</p>
                    <p>Total: Rs {Number(invoice.totalAmount).toFixed(2)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
