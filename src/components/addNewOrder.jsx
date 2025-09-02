import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSave, FaArrowLeft, FaPlus, FaMinus } from "react-icons/fa";

const URL = "http://localhost:5000/api/orders";

// Sample data for dropdowns
const PRODUCT_IDS = [
  "FABRIC001","FABRIC002", "FABRIC003","FABRIC004","FABRIC005","COTTON001","COTTON002","SILK001","SILK002","POLY001"
];

const SIZES = [
  "XS","S", "M","L","XL","XXL","XXXL","Custom"
];

const COLORS = [
  "Red","Blue","Green","Yellow","Black","White","Purple","Pink","Orange","Brown","Gray","Navy","Maroon","Turquoise","Beige"
];

// Function to generate auto order ID
const generateOrderId = () => {
  const prefix = "ORD";
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

// Function to calculate delivery date (1 week after order date)
const calculateDeliveryDate = (orderDate) => {
  const date = new Date(orderDate);
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0];
};

// Function to format date for display
const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Function to get date in YYYY-MM-DD format
const formatDateToString = (date) => {
  return date.toISOString().split('T')[0];
};

// Function to check if a date is within the disabled range (today to next 7 days)
const isDateDisabled = (dateString) => {
  const selectedDate = new Date(dateString);
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  // Reset time to compare only dates
  today.setHours(0, 0, 0, 0);
  nextWeek.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);
  
  return selectedDate >= today && selectedDate <= nextWeek;
};

// Function to get the minimum allowed date (8 days from today)
const getMinAllowedDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 8);
  return formatDateToString(date);
};

function AddNewOrder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showDateWarning, setShowDateWarning] = useState(false);
  const [formData, setFormData] = useState({
    orderId: "",
    orderDate: getMinAllowedDate(), // Set to 8 days from today as default
    deliveryDate: "",
    customer: {
      name: "",
      email: "",
      phone: "",
      shippingAddress: {
        street: "",
        city: "",
        postalCode: "",
        country: ""
      }
    },
    items: [
      {
        productId: "",
        size: "",
        color: "",
        quantity: 1,
        price: 0
      }
    ],
    orderStatus: "PROCESSING",
    paymentStatus: "PENDING"
  });

  // Auto-generate order ID and set delivery date when component mounts
  useEffect(() => {
    const defaultOrderDate = getMinAllowedDate();
    const deliveryDate = calculateDeliveryDate(defaultOrderDate);
    
    setFormData(prev => ({
      ...prev,
      orderId: generateOrderId(),
      orderDate: defaultOrderDate,
      deliveryDate: deliveryDate
    }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle order date change and auto-calculate delivery date
    if (name === 'orderDate') {
      // Check if the selected date is in the disabled range
      if (isDateDisabled(value)) {
        setShowDateWarning(true);
        setTimeout(() => setShowDateWarning(false), 3000); // Hide warning after 3 seconds
        return; // Don't update the date
      }
      
      setShowDateWarning(false);
      const deliveryDate = calculateDeliveryDate(value);
      setFormData(prev => ({
        ...prev,
        orderDate: value,
        deliveryDate: deliveryDate
      }));
      return;
    }
    
    // Handle nested customer fields
    if (name.startsWith('customer.')) {
      const fieldPath = name.replace('customer.', '');
      
      if (fieldPath.startsWith('shippingAddress.')) {
        const addressField = fieldPath.replace('shippingAddress.', '');
        setFormData(prev => ({
          ...prev,
          customer: {
            ...prev.customer,
            shippingAddress: {
              ...prev.customer.shippingAddress,
              [addressField]: value
            }
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          customer: {
            ...prev.customer,
            [fieldPath]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Function to regenerate order ID
  const regenerateOrderId = () => {
    setFormData(prev => ({
      ...prev,
      orderId: generateOrderId()
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'quantity' || field === 'price' ? Number(value) || 0 : value
    };
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: "",
          size: "",
          color: "",
          quantity: 1,
          price: 0
        }
      ]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      return total + (quantity * price);
    }, 0);
  };

  // Validation function
  const validateForm = () => {
    // Check customer information
    if (!formData.customer.name.trim()) {
      alert("Customer name is required");
      return false;
    }
    if (!formData.customer.email.trim()) {
      alert("Customer email is required");
      return false;
    }
    if (!formData.customer.phone.trim()) {
      alert("Customer phone is required");
      return false;
    }
    if (!formData.customer.shippingAddress.street.trim()) {
      alert("Street address is required");
      return false;
    }
    if (!formData.customer.shippingAddress.city.trim()) {
      alert("City is required");
      return false;
    }

    // Check items
    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      if (!item.productId) {
        alert(`Product ID is required for item ${i + 1}`);
        return false;
      }
      if (!item.size) {
        alert(`Size is required for item ${i + 1}`);
        return false;
      }
      if (!item.color) {
        alert(`Color is required for item ${i + 1}`);
        return false;
      }
      if (!item.quantity || item.quantity <= 0) {
        alert(`Valid quantity is required for item ${i + 1}`);
        return false;
      }
      if (!item.price || item.price <= 0) {
        alert(`Valid price is required for item ${i + 1}`);
        return false;
      }
    }

    // Check if order date is valid
    if (isDateDisabled(formData.orderDate)) {
      alert("Please select a valid order date. Orders cannot be placed for today to next 7 days.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare order data with proper structure
      const orderData = {
        orderId: formData.orderId,
        orderDate: formData.orderDate, // Keep as string, backend will convert
        deliveryDate: formData.deliveryDate, // Keep as string, backend will convert
        customer: {
          name: formData.customer.name.trim(),
          email: formData.customer.email.trim(),
          phone: formData.customer.phone.trim(),
          shippingAddress: {
            street: formData.customer.shippingAddress.street.trim(),
            city: formData.customer.shippingAddress.city.trim(),
            postalCode: formData.customer.shippingAddress.postalCode.trim() || "",
            country: formData.customer.shippingAddress.country.trim() || ""
          }
        },
        items: formData.items.map(item => ({
          productId: item.productId,
          size: item.size,
          color: item.color,
          quantity: Number(item.quantity),
          price: Number(item.price)
        })),
        totalAmount: calculateTotal(),
        orderStatus: formData.orderStatus,
        paymentStatus: formData.paymentStatus
      };

      console.log("Submitting order data:", orderData);
      
      const response = await axios.post(URL, orderData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log("Order created successfully:", response.data);
      alert("Order created successfully!");
      
      // Redirect back to order details
      navigate('/order-details');
    } catch (error) {
      console.error("Error creating order:", error);
      
      // More detailed error handling
      if (error.response) {
        console.error("Server error response:", error.response.data);
        const errorMessage = error.response.data.message || "Server error occurred";
        alert(`Failed to create order: ${errorMessage}`);
      } else if (error.request) {
        console.error("No response from server:", error.request);
        alert("Failed to create order: No response from server. Please check your connection.");
      } else {
        console.error("Error setting up request:", error.message);
        alert(`Failed to create order: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/order-details');
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow"
          >
            <FaArrowLeft /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Add New Order</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6">
        {/* Order ID and Dates Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Order Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Order ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="orderId"
                  value={formData.orderId || ""}
                  readOnly
                  className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="Order ID will be generated automatically"
                />
                <button
                  type="button"
                  onClick={regenerateOrderId}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow"
                  title="Generate new Order ID"
                >
                  🔄
                </button>
              </div>
              
            </div>

            {/* Order Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Date *
              </label>
              <input
                type="date"
                name="orderDate"
                value={formData.orderDate || ""}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {showDateWarning && (
                <p className="text-xs text-red-500 mt-1 animate-pulse">
                  ⚠️ Cannot select dates from today to next 7 days. Please choose a different date.
                </p>
              )}
              
            </div>

            {/* Delivery Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Delivery Date
              </label>
              <input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate || ""}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              
            </div>
          </div>

          {/* Date Information Display */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-700">Order Date: </span>
                <span className="text-blue-600">{formatDateForDisplay(formData.orderDate)}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Expected Delivery: </span>
                <span className="text-blue-600">{formatDateForDisplay(formData.deliveryDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                name="customer.name"
                value={formData.customer.name || ""}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="customer.email"
                value={formData.customer.email || ""}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="text"
                name="customer.phone"
                value={formData.customer.phone || ""}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Status
              </label>
              <select
                name="orderStatus"
                value={formData.orderStatus || "PROCESSING"}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PROCESSING">PROCESSING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Shipping Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                name="customer.shippingAddress.street"
                value={formData.customer.shippingAddress.street || ""}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                value={formData.customer.shippingAddress.city || ""}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter city"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                name="customer.shippingAddress.postalCode"
                value={formData.customer.shippingAddress.postalCode || ""}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter postal code"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                name="customer.shippingAddress.country"
                value={formData.customer.shippingAddress.country || ""}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter country"
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Order Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow"
            >
              <FaPlus /> Add Item
            </button>
          </div>
          
          {formData.items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-700">Item {index + 1}</h4>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaMinus />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product ID *
                  </label>
                  <select
                    value={item.productId || ""}
                    onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Product</option>
                    {PRODUCT_IDS.map((productId) => (
                      <option key={productId} value={productId}>
                        {productId}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size *
                  </label>
                  <select
                    value={item.size || ""}
                    onChange={(e) => handleItemChange(index, 'size', e.target.value)}
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Size</option>
                    {SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color *
                  </label>
                  <select
                    value={item.color || ""}
                    onChange={(e) => handleItemChange(index, 'color', e.target.value)}
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Color</option>
                    {COLORS.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity || ""}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Qty"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (Rs.) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price || ""}
                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Price"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
            <span className="text-xl font-bold text-gray-800">Rs. {calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            <FaSave /> {loading ? 'Creating Order...' : 'Create Order'}
          </button>
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddNewOrder;