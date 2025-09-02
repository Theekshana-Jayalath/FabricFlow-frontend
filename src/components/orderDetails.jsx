import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus, FaCalendarAlt, FaTruck } from "react-icons/fa";

const URL = "http://localhost:5000/api/orders";

const fetchHandler = async () => {
  try {
    console.log("Fetching from:", URL);
    const response = await axios.get(URL);
    console.log("Response:", response.data);
    
    // Check if response.data is an array or object with orders property
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.orders && Array.isArray(response.data.orders)) {
      return response.data.orders;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      console.log("Unexpected data structure:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    console.error("Error details:", error.response?.data);
    return [];
  }
};

function OrderDetails() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Function to format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Function to get date with day name
  const formatDateWithDay = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    const getOrders = async () => {
      try {
        setLoading(true);
        console.log("Starting to fetch orders...");
        const data = await fetchHandler();
        console.log("Received data:", data);
        console.log("Is array?", Array.isArray(data));
        setOrders(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error("Error in getOrders:", err);
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    getOrders();
  }, []);

  const handleEdit = (orderId) => {
    console.log("Edit order:", orderId);
  };

  const handleDelete = async (orderId) => {
    try {
      await axios.delete(`${URL}/${orderId}`);
      setOrders(orders.filter(order => order._id !== orderId));
    } catch (error) {
      console.error("Error deleting order:", error);
      setError("Failed to delete order");
    }
  };

  const handleAddNewOrder = () => {
    navigate('/add-new-order');
  };

  // Debug logs
  console.log("Current state:", { orders, loading, error });
  console.log("Orders is array?", Array.isArray(orders));

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
        <p className="text-gray-500">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header with Add New Order Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
        <button 
          onClick={handleAddNewOrder}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg"
        >
          <FaPlus /> Add New Order
        </button>
      </div>
      
      {/* Debug info */}
      <p className="text-sm text-gray-500 mb-4">
        Found {orders.length} orders
      </p>

      {!Array.isArray(orders) || orders.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-500">No orders found.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Refresh
          </button>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="bg-white rounded-2xl shadow-md p-6 mb-6">
            {/* Order Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Order ID: {order.orderId}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.orderStatus === "PROCESSING"
                    ? "bg-yellow-100 text-yellow-700"
                    : order.orderStatus === "COMPLETED"
                    ? "bg-green-100 text-green-700"
                    : order.orderStatus === "CANCELLED"
                    ? "bg-red-100 text-red-700"
                    : order.orderStatus === "SHIPPED"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {order.orderStatus}
              </span>
            </div>

            {/* Order Dates Section */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Order Date</p>
                    <p className="text-gray-600">{formatDateWithDay(order.orderDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FaTruck className="text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Expected Delivery</p>
                    <p className="text-gray-600">{formatDateWithDay(order.deliveryDate)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">Customer Information:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">
                    <span className="font-semibold">Name:</span> {order.customer?.name || "N/A"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Email:</span> {order.customer?.email || "N/A"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Phone:</span> {order.customer?.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <span className="font-semibold">Shipping Address:</span>
                  </p>
                  <p className="text-gray-600 text-sm">
                    {order.customer?.shippingAddress?.street || "N/A"}<br />
                    {order.customer?.shippingAddress?.city || "N/A"}{" "}
                    {order.customer?.shippingAddress?.postalCode || ""}<br />
                    {order.customer?.shippingAddress?.country || ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">Order Items:</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 text-sm">
                      <th className="p-3 border text-left">Product ID</th>
                      <th className="p-3 border text-left">Size</th>
                      <th className="p-3 border text-left">Color</th>
                      <th className="p-3 border text-center">Quantity</th>
                      <th className="p-3 border text-right">Unit Price</th>
                      <th className="p-3 border text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, index) => (
                      <tr key={item._id || index} className="text-sm text-gray-600 hover:bg-gray-50">
                        <td className="p-3 border font-medium">{item.productId}</td>
                        <td className="p-3 border">{item.size}</td>
                        <td className="p-3 border">
                          <span className="inline-block w-4 h-4 rounded-full mr-2" 
                                style={{backgroundColor: item.color.toLowerCase()}}></span>
                          {item.color}
                        </td>
                        <td className="p-3 border text-center">{item.quantity}</td>
                        <td className="p-3 border text-right">Rs. {item.price.toFixed(2)}</td>
                        <td className="p-3 border text-right font-medium">
                          Rs. {(item.quantity * item.price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <p>Items: {order.items?.length || 0}</p>
                  <p>Status Updated: {formatDate(order.statusUpdateDate || order.updatedAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-800">
                    Total Amount: Rs. {order.totalAmount?.toFixed(2) || "0.00"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Payment: {order.paymentStatus || "PENDING"}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center border-t pt-4">
              <div className="text-xs text-gray-500">
                Created: {formatDate(order.createdAt)}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleEdit(order._id)}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition-colors"
                >
                  <FaEdit /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(order._id)}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow transition-colors"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default OrderDetails;