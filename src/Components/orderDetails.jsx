import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus, FaCalendarAlt, FaTruck, FaSearch, FaFilter } from "react-icons/fa";

const URL = "https://fabricflow-backend1.onrender.com/api/orders";

// Function to get fabric consumption by category
const getFabricConsumptionByCategory = (categoryName) => {
  const consumption = {
    "Formal Shirts": 1.2,
    "Polos & Tees": 1.0,
    "Casual Shirts": 1.3,
    "Bottomwear": 1.5
  };
  return consumption[categoryName] || 1.0;
};

// Function to determine category from product ID
const getCategoryFromProductId = (productId) => {
  const id = parseInt(productId);
  if (id >= 1 && id <= 4) return "Formal Shirts";
  if (id >= 5 && id <= 8) return "Polos & Tees";
  if (id >= 9 && id <= 12) return "Casual Shirts";
  if (id >= 13 && id <= 16) return "Bottomwear";
  return "Polos & Tees"; // Default
};

// Function to get default material by product ID
const getDefaultMaterialByProductId = (productId) => {
  const id = parseInt(productId);
  
  // Formal Shirts (1-4)
  if (id >= 1 && id <= 4) {
    return "Premium Cotton (200 GSM)";
  }
  // Polos & Tees (5-8)
  else if (id >= 5 && id <= 8) {
    return "Cotton Blend (180 GSM)";
  }
  // Casual Shirts (9-12)
  else if (id >= 9 && id <= 12) {
    return "Cotton Stretch (220 GSM)";
  }
  // Bottomwear (13-16)
  else if (id >= 13 && id <= 16) {
    return "Cotton Stretch (260 GSM)";
  }
  
  return "Cotton Blend (180 GSM)"; // Default
};

// Calculate fabric meters for a single item
const calculateItemFabricMeters = (item) => {
  if (!item.productId || !item.quantity) return 0;
  const category = getCategoryFromProductId(item.productId);
  const metersPerItem = getFabricConsumptionByCategory(category);
  return item.quantity * metersPerItem;
};

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
  const [deleting, setDeleting] = useState(null); // Track which order is being deleted
  const [searchTerm, setSearchTerm] = useState(""); // Search term state
  const [showSearchInput, setShowSearchInput] = useState(false); // Show/hide search input
  const [showFilters, setShowFilters] = useState(false); // Show/hide filter options
  const [orderStatusFilter, setOrderStatusFilter] = useState(""); // Order status filter
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(""); // Payment status filter
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
    navigate(`/update-order/${orderId}`);
  };

  const handleDelete = async (orderId, orderStatus) => {
    // Check if order can be deleted based on status
    if (orderStatus === 'SHIPPED' || orderStatus === 'DELIVERED') {
      alert("Cannot delete shipped or delivered orders");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete order ${orderId}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeleting(orderId); // Set loading state for this specific order
      console.log("Deleting order:", orderId);
      
      // Make the delete request
      const response = await axios.delete(`${URL}/${orderId}`);
      console.log("Delete response:", response.data);
      
      // Remove the order from the local state
      setOrders(prevOrders => prevOrders.filter(order => order.orderId !== orderId));
      
      alert("Order deleted successfully!");
      
    } catch (error) {
      console.error("Error deleting order:", error);
      console.error("Error response:", error.response);
      
      // Handle specific error cases
      let errorMessage = "Failed to delete order. Please try again.";
      
      if (error.response?.status === 404) {
        errorMessage = "Order not found. It may have already been deleted.";
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || "Cannot delete this order due to its current status.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
      setError("Failed to delete order: " + errorMessage);
    } finally {
      setDeleting(null); // Clear loading state
    }
  };

  const handleAddNewOrder = () => {
    navigate('/add-new-order');
  };

  // Filter and sort orders - most recent first
  const filteredAndSortedOrders = orders
    .filter(order => {
      // Search filter
      const matchesSearch = !searchTerm.trim() || 
        order.orderId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Order status filter
      const matchesOrderStatus = !orderStatusFilter || 
        order.orderStatus === orderStatusFilter;
      
      // Payment status filter
      const matchesPaymentStatus = !paymentStatusFilter || 
        order.paymentStatus === paymentStatusFilter;
      
      return matchesSearch && matchesOrderStatus && matchesPaymentStatus;
    })
    .sort((a, b) => {
      // Sort by creation date - most recent first
      const dateA = new Date(a.createdAt || a.orderDate);
      const dateB = new Date(b.createdAt || b.orderDate);
      return dateB - dateA; // Descending order (newest first)
    });

  // Debug logs
  console.log("Current state:", { orders, loading, error });
  console.log("Orders is array?", Array.isArray(orders));
  console.log("Search term:", searchTerm);
  console.log("Filtered and sorted orders:", filteredAndSortedOrders.length);

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Loading orders...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header with Search and Add New Order Buttons */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg shadow-lg"
          >
            <FaFilter />
          </button>
          <button 
            onClick={() => setShowSearchInput(!showSearchInput)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg"
          >
            <FaSearch />
          </button>
          <button 
            onClick={handleAddNewOrder}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            <FaPlus /> Add New Order
          </button>
        </div>
      </div>
      
      {/* Search Input Section - Only show when search button is clicked */}
      {showSearchInput && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                }}
                className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => {
                setShowSearchInput(false);
                setSearchTerm("");
              }}
              className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {/* Filter Section - Only show when filter button is clicked */}
      {showFilters && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center gap-4 flex-wrap">
            <FaFilter className="text-gray-400" />
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Order Status:</label>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              >
                <option value="">All Status</option>
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Payment Status:</label>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              >
                <option value="">All Payments</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {(orderStatusFilter || paymentStatusFilter) && (
                <button
                  onClick={() => {
                    setOrderStatusFilter("");
                    setPaymentStatusFilter("");
                  }}
                  className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => {
                  setShowFilters(false);
                  setOrderStatusFilter("");
                  setPaymentStatusFilter("");
                }}
                className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Debug info */}
      <p className="text-sm text-gray-500 mb-4">
        {(searchTerm || orderStatusFilter || paymentStatusFilter) 
          ? `Showing ${filteredAndSortedOrders.length} of ${orders.length} orders` +
            (searchTerm ? ` matching "${searchTerm}"` : "") +
            (orderStatusFilter ? ` with order status "${orderStatusFilter}"` : "") +
            (paymentStatusFilter ? ` with payment status "${paymentStatusFilter}"` : "")
          : `Found ${orders.length} orders`
        }
      </p>

      {!Array.isArray(orders) || orders.length === 0 ? (
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <p className="text-gray-500 mb-4">No orders found.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
          >
            Refresh
          </button>
          <button 
            onClick={handleAddNewOrder}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add First Order
          </button>
        </div>
      ) : filteredAndSortedOrders.length === 0 && (searchTerm || orderStatusFilter || paymentStatusFilter) ? (
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <FaFilter className="mx-auto text-gray-400 text-4xl mb-4" />
          <p className="text-gray-500 mb-4">
            No orders found matching the current filters
          </p>
          <div className="flex gap-2 justify-center">
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Clear Search
              </button>
            )}
            {(orderStatusFilter || paymentStatusFilter) && (
              <button 
                onClick={() => {
                  setOrderStatusFilter("");
                  setPaymentStatusFilter("");
                }}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Clear Filters
              </button>
            )}
            <button 
              onClick={() => {
                setSearchTerm("");
                setOrderStatusFilter("");
                setPaymentStatusFilter("");
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Clear All
            </button>
          </div>
        </div>
      ) : (
        filteredAndSortedOrders.map((order) => (
          <div key={order.orderId || order._id} className="bg-white rounded-2xl shadow-md p-6 mb-6">
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
                    : order.orderStatus === "DELIVERED"
                    ? "bg-purple-100 text-purple-700"
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
                      <th className="p-3 border text-left">Material</th>
                      <th className="p-3 border text-center">Quantity</th>
                      <th className="p-3 border text-center">Fabric (Meters)</th>
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
                        <td className="p-3 border">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {item.material || getDefaultMaterialByProductId(item.productId)}
                          </span>
                        </td>
                        <td className="p-3 border text-center">{item.quantity}</td>
                        <td className="p-3 border text-center font-medium text-green-600">
                          {calculateItemFabricMeters(item).toFixed(1)}m
                        </td>
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
                  onClick={() => handleEdit(order.orderId)}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition-colors"
                >
                  <FaEdit /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(order.orderId, order.orderStatus)}
                  disabled={deleting === order.orderId}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow transition-colors ${
                    deleting === order.orderId
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : order.orderStatus === 'SHIPPED' || order.orderStatus === 'DELIVERED'
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  <FaTrash /> 
                  {deleting === order.orderId 
                    ? "Deleting..." 
                    : (order.orderStatus === 'SHIPPED' || order.orderStatus === 'DELIVERED')
                    ? "Cannot Delete"
                    : "Delete"
                  }
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