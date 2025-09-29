import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const URL = "http://localhost:5000/api/orders";

const fetchHandler = async () => {
  try {
    const response = await axios.get(URL);
    if (Array.isArray(response.data)) return response.data;
    if (response.data.orders && Array.isArray(response.data.orders)) return response.data.orders;
    if (response.data.data && Array.isArray(response.data.data)) return response.data.data;
    return [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

function InvoiceSummary() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paidTotalCount, setPaidTotalCount] = useState(0);
  const [pendingTotalCount, setPendingTotalCount] = useState(0);
  const [paidTotalAmount, setPaidTotalAmount] = useState(0);
  const [pendingTotalAmount, setPendingTotalAmount] = useState(0);

  useEffect(() => {
    const getOrders = async () => {
      try {
        setLoading(true);
        const data = await fetchHandler();
        const orderList = Array.isArray(data) ? data : [];
        setOrders(orderList);

        const paidOrders = orderList.filter(o => (o.paymentStatus || "PENDING").toUpperCase() === "PAID");
        const pendingOrders = orderList.filter(o => (o.paymentStatus || "PENDING").toUpperCase() === "PENDING");

        setPaidTotalCount(paidOrders.length);
        setPendingTotalCount(pendingOrders.length);

        const paidAmount = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const pendingAmount = pendingOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        setPaidTotalAmount(paidAmount);
        setPendingTotalAmount(pendingAmount);

        setError(null);
      } catch (err) {
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    getOrders();
  }, []);

  if (loading) return <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">Loading...</div>;
  if (error) return <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center text-red-500">{error}</div>;

  const chartData = [
    { name: "Paid", count: paidTotalCount, amount: paidTotalAmount },
    { name: "Pending", count: pendingTotalCount, amount: pendingTotalAmount },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-6 flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-4">Menu</h2>
        <button className="text-left px-4 py-2 rounded hover:bg-blue-100 font-semibold">
          Invoice
        </button>
        <button className="text-left px-4 py-2 rounded hover:bg-blue-100 font-semibold">
          Invoice Summary
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Invoice Summary</h1>

        {/* Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-green-100 p-6 rounded-lg shadow-md text-center">
            <p className="text-lg font-semibold text-green-700">Total Paid Orders</p>
            <p className="text-2xl font-bold text-green-800">{paidTotalCount}</p>
            <p className="text-lg font-semibold text-green-700 mt-2">
              Amount: Rs. {paidTotalAmount.toFixed(2)}
            </p>
          </div>
          <div className="bg-red-100 p-6 rounded-lg shadow-md text-center">
            <p className="text-lg font-semibold text-red-700">Total Pending Orders</p>
            <p className="text-2xl font-bold text-red-800">{pendingTotalCount}</p>
            <p className="text-lg font-semibold text-red-700 mt-2">
              Amount: Rs. {pendingTotalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Graph */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Payment Status Graph</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3182CE" name="Order Count" />
              <Bar dataKey="amount" fill="#38A169" name="Total Amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default InvoiceSummary;
