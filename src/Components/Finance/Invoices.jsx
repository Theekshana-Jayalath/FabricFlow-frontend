import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

function OrderDetails() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL");      // ALL, PAID, PENDING
  const [monthFilter, setMonthFilter] = useState(""); // "" means ALL months
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Fetch orders from API
  const getOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchHandler();
      setOrders(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders(); // Fetch on mount
  }, []);

  // Apply filters
  useEffect(() => {
    let tempOrders = [...orders];

    // Payment status filter
    if (filter !== "ALL") {
      tempOrders = tempOrders.filter(
        (order) => (order.paymentStatus || "PENDING").toUpperCase() === filter
      );
    }

    // Month filter
    if (monthFilter) {
      tempOrders = tempOrders.filter((order) => {
        const orderMonth = order.orderDate ? order.orderDate.slice(0, 7) : ""; // "YYYY-MM"
        return orderMonth === monthFilter;
      });
    }

    setFilteredOrders(tempOrders);
  }, [filter, monthFilter, orders]);

  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={getOrders}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div>
        <button
          className="text-left px-4 py-2 rounded hover:bg-blue-100 font-semibold"
          onClick={() => setFilter("ALL")}
        >
          Invoice
        </button>
        <button
          className="text-left px-4 py-2 rounded hover:bg-blue-100 font-semibold"
          onClick={() => navigate("/invoiceSummury")}
        >
          Invoice Summary
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Invoices</h1>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          {/* Payment Status Filter */}
          <div>
            <label className="mr-2 font-semibold text-gray-700">Payment Status:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="ALL">All</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <label className="mr-2 font-semibold text-gray-700">Month:</label>
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {monthFilter && (
              <button
                onClick={() => setMonthFilter("")}
                className="ml-2 text-sm text-red-500 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Orders List */}
        {!filteredOrders || filteredOrders.length === 0 ? (
          <div className="text-center bg-white p-8 rounded-lg shadow-md">
            <p className="text-gray-500 mb-4">No orders found.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.orderId || order._id}
              className="bg-white rounded-2xl shadow-md p-6 mb-6"
            >
              {/* Order Date */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700">Invoice Date</p>
                <p className="text-gray-600">{formatDate(order.orderDate)}</p>
              </div>

              {/* Customer Info */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Customer Information:
                </h3>
                <p className="text-gray-600">
                  <span className="font-semibold">Name:</span>{" "}
                  {order.customer?.name || "N/A"}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Email:</span>{" "}
                  {order.customer?.email || "N/A"}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Phone:</span>{" "}
                  {order.customer?.phone || "N/A"}
                </p>
              </div>

              {/* Amount & Payment Status */}
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-gray-800">
                    Total Amount: Rs. {order.totalAmount?.toFixed(2) || "0.00"}
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      (order.paymentStatus || "PENDING").toUpperCase() === "PAID"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    Payment: {order.paymentStatus || "PENDING"}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default OrderDetails;
