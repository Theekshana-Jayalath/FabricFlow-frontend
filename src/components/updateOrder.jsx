import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaSave, FaArrowLeft } from "react-icons/fa";

const URL = "http://localhost:5000/api/orders";

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

// Calculate fabric meters for a single item
const calculateItemFabricMeters = (item) => {
  if (!item.productId || !item.quantity) return 0;
  const category = getCategoryFromProductId(item.productId);
  const metersPerItem = getFabricConsumptionByCategory(category);
  return item.quantity * metersPerItem;
};

function UpdateOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    orderStatus: "",
    deliveryDate: "",
    paymentStatus: "",
    customer: {
      name: "",
      email: "",
      phone: "",
      shippingAddress: { street: "", city: "", postalCode: "" },
    },
    items: [],
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching order with ID:", orderId);
        console.log("Full URL:", `${URL}/${orderId}`);
        const response = await axios.get(`${URL}/${orderId}`);
        console.log("Order data received:", response.data);
        const orderData = response.data;
        setOrder(orderData);
        // Handle different possible date formats
        const deliveryDate = orderData.deliveryDate
          ? typeof orderData.deliveryDate === "string"
            ? orderData.deliveryDate.split("T")[0]
            : new Date(orderData.deliveryDate).toISOString().split("T")[0]
          : "";
        setFormData({
          orderStatus: orderData.orderStatus || "PROCESSING",
          deliveryDate: deliveryDate,
          paymentStatus: orderData.paymentStatus || "PENDING",
          customer: {
            name: orderData.customer?.name || "",
            email: orderData.customer?.email || "",
            phone: orderData.customer?.phone || "",
            shippingAddress: {
              street: orderData.customer?.shippingAddress?.street || "",
              city: orderData.customer?.shippingAddress?.city || "",
              postalCode: orderData.customer?.shippingAddress?.postalCode || "",
            },
          },
          items: orderData.items || [],
        });
      } catch (err) {
        console.error("Error fetching order:", err);
        console.error("Error response:", err.response);
        if (err.response?.status === 404) {
          setError("Order not found. Please check the order ID or verify the backend API.");
        } else if (err.response?.status === 400) {
          setError("Invalid order ID format. Please check the URL.");
        } else if (err.request) {
          setError("No response from server. Please check if the backend is running.");
        } else {
          setError("Failed to fetch order details. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    console.log("Order ID from params:", orderId);
    console.log("Order ID type:", typeof orderId);
    console.log("Order ID length:", orderId?.length);
    if (!orderId) {
      setError("No order ID provided in the URL");
      setLoading(false);
      return;
    }
    fetchOrder();
  }, [orderId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("customer.")) {
      const [parent, field] = name.split(".");
      if (field.includes("shippingAddress.")) {
        const [, subField] = field.split(".");
        setFormData((prev) => ({
          ...prev,
          customer: {
            ...prev.customer,
            shippingAddress: {
              ...prev.customer.shippingAddress,
              [subField]: value,
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          customer: { ...prev.customer, [field]: value },
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = [];
    if (!formData.customer.name.trim()) {
      errors.push("Customer name is required");
    }
    if (!formData.customer.email.trim()) {
      errors.push("Customer email is required");
    } else if (!/\S+@\S+\.\S+/.test(formData.customer.email)) {
      errors.push("Please enter a valid email address");
    }
    if (!formData.customer.phone.trim()) {
      errors.push("Customer phone is required");
    }
    if (!formData.customer.shippingAddress.street.trim()) {
      errors.push("Shipping street address is required");
    }
    if (!formData.customer.shippingAddress.city.trim()) {
      errors.push("Shipping city is required");
    }
    // Removed postal code and country validation since they're optional
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError("Please fix the following errors:\n" + validationErrors.join("\n"));
      return;
    }
    try {
      setLoading(true);
      setError(null);
      console.log("Updating order with data:", formData);
      // Only send fields that might have changed
      const updateData = {
        orderStatus: formData.orderStatus,
        deliveryDate: formData.deliveryDate,
        paymentStatus: formData.paymentStatus,
        customer: {
          name: formData.customer.name.trim(),
          email: formData.customer.email.trim(),
          phone: formData.customer.phone.trim(),
          shippingAddress: {
            street: formData.customer.shippingAddress.street.trim(),
            city: formData.customer.shippingAddress.city.trim(),
            postalCode: formData.customer.shippingAddress.postalCode.trim() || "",
            country: "", // Always empty since country is not important
          },
        },
      };
      const response = await axios.put(`${URL}/${orderId}`, updateData);
      console.log("Update response:", response.data);
      alert("Order updated successfully!");
      // Navigate back to order details
      navigate("/order-details");
    } catch (err) {
      console.error("Error updating order:", err);
      const errorMessage = err.response?.data?.message || err.message;
      setError("Failed to update order: " + errorMessage);
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/order-details");
  };

  // Calculate total amount
  const totalAmount = formData.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Loading order...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <pre className="text-red-500 mb-4 whitespace-pre-wrap text-sm">{error}</pre>
          <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
            <p>
              <strong>Debug Info:</strong>
            </p>
            <p>Order ID: {orderId || "undefined"}</p>
            <p>Order ID Type: {typeof orderId}</p>
            <p>URL: {window.location.href}</p>
          </div>
          <button
            onClick={handleBack}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
          >
            <FaArrowLeft /> Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Update Order</h1>
            <p className="text-gray-600 mt-2">Edit order information and track changes</p>
          </div>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg shadow-lg transition-colors"
          >
            <FaArrowLeft /> Back to Orders
          </button>
        </div>

        {/* Order ID Display */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">Editing Order ID:</span> {orderId}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Order Status Information */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Order Status & Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Status *
                </label>
                <select
                  name="orderStatus"
                  value={formData.orderStatus}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="DELIVERED">Delivered</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Date
                </label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status *
                </label>
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>
            </div>
          </div>
          {/* Customer Information */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  name="customer.name"
                  value={formData.customer.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="customer.email"
                  value={formData.customer.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="example@domain.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="customer.phone"
                  value={formData.customer.phone}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="10-digit phone number"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Shipping Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="customer.shippingAddress.street"
                  value={formData.customer.shippingAddress.street}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter street address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="customer.shippingAddress.city"
                  value={formData.customer.shippingAddress.city}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code <span className="text-xs text-gray-500">(5 digits)</span>
                </label>
                <input
                  type="text"
                  name="customer.shippingAddress.postalCode"
                  value={formData.customer.shippingAddress.postalCode}
                  onChange={handleChange}
                  maxLength="5"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter 5-digit postal code"
                  pattern="[0-9]{5}"
                />
              </div>
            </div>
          </div>
          {/* Order Items Section */}
          {formData.items && formData.items.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-6 bg-white">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Order Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 text-sm">
                      <th className="p-3 border text-left">Product ID</th>
                      <th className="p-3 border text-left">Size</th>
                      <th className="p-3 border text-left">Color</th>
                      <th className="p-3 border text-center">Quantity</th>
                      <th className="p-3 border text-center">Fabric (Meters)</th>
                      <th className="p-3 border text-right">Unit Price</th>
                      <th className="p-3 border text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index} className="text-sm text-gray-600 hover:bg-gray-50">
                        <td className="p-3 border font-medium">{item.productId}</td>
                        <td className="p-3 border">{item.size}</td>
                        <td className="p-3 border">
                          <span className="inline-block w-4 h-4 rounded-full mr-2" 
                                style={{backgroundColor: item.color.toLowerCase()}}></span>
                          {item.color}
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
                  <tfoot>
                    <tr className="bg-blue-50">
                      <td colSpan="6" className="p-3 border text-right font-semibold text-blue-700">
                        Total Amount:
                      </td>
                      <td className="p-3 border text-right font-semibold text-blue-700">
                        Rs. {totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg shadow-lg transition-colors"
            >
              <FaArrowLeft /> Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg shadow-lg transition-colors"
            >
              <FaSave /> {loading ? "Updating..." : "Update Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateOrder;