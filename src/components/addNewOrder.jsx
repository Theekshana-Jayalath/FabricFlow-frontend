import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { FaSave, FaArrowLeft, FaPlus, FaMinus, FaShoppingCart, FaDownload, FaFilePdf, FaUser, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const URL = "http://localhost:5000/api/orders";

const SIZES = [
  "28", "30", "32", "34", "36", "38", // For Bottomwear
  "XS", "S", "M", "L", "XL", "XXL", "XXXL", "Custom"
];

const COLORS = [
  "Estate Blue", "Cashmere Blue", "Charcoal", "True Navy", "Magenta Purple", "Patriot Blue",
  "Sky Way", "Blazing Orange", "Princess Blue", "Little Boy Blue", "Jade Green", "Brown Henna",
  "Grey", "Cloud Burst", "Black",
  "Red", "Blue", "Green", "Yellow", "White", "Purple", "Pink", "Orange", "Brown", "Gray", "Navy", "Maroon", "Turquoise", "Beige"
];

const MATERIALS = [
  "Premium Cotton (200 GSM)",
  "Cotton Blend (180 GSM)", 
  "Cotton Stretch (220 GSM)",
  "Cotton Stretch (260 GSM)",
  "Linen Blend (150 GSM)",
  "Polyester Blend (170 GSM)",
  "Silk Blend (120 GSM)",
  "Denim (300 GSM)",
  "Organic Cotton (190 GSM)",
  "Bamboo Blend (160 GSM)"
];

// Function to map ProductDetails material names to addNewOrder material names
const mapMaterialName = (productDetailsMaterial) => {
  if (!productDetailsMaterial) return "";
  
  // Handle both object and string formats
  const materialName = typeof productDetailsMaterial === 'object' 
    ? productDetailsMaterial.name 
    : productDetailsMaterial;
  
  // Create mapping for different material name formats
  const materialMapping = {
    "Cotton Blend (140 GSM)": "Cotton Blend (180 GSM)",
    "Premium Cotton Blend (160 GSM)": "Premium Cotton (200 GSM)",
    "Cotton Polyester Blend (150 GSM)": "Cotton Blend (180 GSM)",
    "100% Pique Cotton (180 GSM)": "Cotton Blend (180 GSM)",
    "Cotton Jersey with Elastane (160 GSM)": "Cotton Stretch (220 GSM)",
    "Bamboo Cotton Blend (140 GSM)": "Bamboo Blend (160 GSM)",
    "Premium Linen Blend (130 GSM)": "Linen Blend (150 GSM)",
    "Polyester Cotton Blend (160 GSM)": "Polyester Blend (170 GSM)"
  };
  
  // Check if we have a direct mapping
  if (materialMapping[materialName]) {
    return materialMapping[materialName];
  }
  
  // If no exact match, try to find the closest match in MATERIALS array
  const closeMatch = MATERIALS.find(material => 
    material.toLowerCase().includes(materialName.toLowerCase().split(' ')[0]) ||
    materialName.toLowerCase().includes(material.toLowerCase().split(' ')[0])
  );
  
  return closeMatch || MATERIALS[0]; // Default to first material if no match
};

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

// Enhanced phone number validation
const validatePhoneNumber = (phone) => {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  // Return only first 10 digits
  return digitsOnly.slice(0, 10);
};

const isValidPhoneNumber = (phone) => {
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length === 10;
};

// Comprehensive validation functions
const validateCustomerName = (name) => {
  const trimmedName = name.trim();
  const errors = [];
  
  if (!trimmedName) {
    errors.push("Customer name is required");
  } else if (trimmedName.length < 2) {
    errors.push("Name must be at least 2 characters long");
  } else if (trimmedName.length > 50) {
    errors.push("Name must not exceed 50 characters");
  } else if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
    errors.push("Name can only contain letters and spaces");
  }
  
  return errors;
};

const validateEmail = (email) => {
  const trimmedEmail = email.trim();
  const errors = [];
  
  if (!trimmedEmail) {
    errors.push("Email is required");
    return errors;
  }
  
  // Length validation
  if (trimmedEmail.length > 100) {
    errors.push("Email must not exceed 100 characters");
  }
  
  // Check for spaces
  if (/\s/.test(trimmedEmail)) {
    errors.push("Email cannot contain spaces");
  }
  
  // First letter must be simple (lowercase letter)
  if (!/^[a-z]/.test(trimmedEmail)) {
    errors.push("Email must start with a simple lowercase letter (a-z)");
  }
  
  // Enhanced email format validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmedEmail)) {
    errors.push("Please enter a valid email address (e.g., user@example.com)");
  }
  
  // Check for consecutive dots
  if (/\.{2,}/.test(trimmedEmail)) {
    errors.push("Email cannot contain consecutive dots");
  }
  
  // Check for invalid characters at start/end
  if (/^[.-]|[.-]$/.test(trimmedEmail)) {
    errors.push("Email cannot start or end with dots or hyphens");
  }
  
  // Check domain part specifically
  const atIndex = trimmedEmail.indexOf('@');
  if (atIndex > 0) {
    const domain = trimmedEmail.substring(atIndex + 1);
    if (domain.length < 3) {
      errors.push("Domain must be at least 3 characters long");
    }
    if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
      errors.push("Domain contains invalid characters");
    }
  }
  
  return errors;
};

// Enhanced phone number validation with additional rules (ALLOWS starting with 0)
const validatePhoneNumberEnhanced = (phone) => {
  const trimmedPhone = phone.trim();
  const digitsOnly = trimmedPhone.replace(/\D/g, '');
  const errors = [];
  
  if (!trimmedPhone) {
    errors.push("Phone number is required");
  } else if (!/^\d+$/.test(digitsOnly)) {
    errors.push("Phone number can only contain digits");
  } else if (digitsOnly.length !== 10) {
    errors.push(`Phone number must be exactly 10 digits (${digitsOnly.length}/10)`);
  } else if (!/^[0-9]/.test(digitsOnly)) {
    errors.push("Phone number must contain only digits (0-9)");
  } else {
    // Check if all digits are the same
    const allSameDigit = digitsOnly.split('').every(digit => digit === digitsOnly.charAt(0));
    if (allSameDigit) {
      errors.push("Phone number cannot have all same digits (e.g., 1111111111)");
    }
    
    // Check for common invalid patterns
    const invalidPatterns = [
      '1234567890',
      '0987654321',
      '1111111111',
      '2222222222',
      '3333333333',
      '4444444444',
      '5555555555',
      '6666666666',
      '7777777777',
      '8888888888',
      '9999999999'
    ];
    
    if (invalidPatterns.includes(digitsOnly)) {
      errors.push("Please enter a valid phone number (not a sequence or repeated digits)");
    }
  }
  
  return errors;
};

const validateStreetAddress = (address) => {
  const trimmedAddress = address.trim();
  const errors = [];
  
  if (!trimmedAddress) {
    errors.push("Street address is required");
  } else if (trimmedAddress.length < 5) {
    errors.push("Street address must be at least 5 characters long");
  } else if (trimmedAddress.length > 200) {
    errors.push("Street address must not exceed 200 characters");
  } else if (!/^[a-zA-Z0-9\s,.\-/]+$/.test(trimmedAddress)) {
    errors.push("Street address can only contain letters, numbers, spaces, and symbols (, - / .)");
  }
  
  return errors;
};

const validateCity = (city) => {
  const trimmedCity = city.trim();
  const errors = [];
  
  if (!trimmedCity) {
    errors.push("City is required");
  } else if (trimmedCity.length < 2) {
    errors.push("City must be at least 2 characters long");
  } else if (trimmedCity.length > 50) {
    errors.push("City must not exceed 50 characters");
  } else if (!/^[a-zA-Z\s]+$/.test(trimmedCity)) {
    errors.push("City can only contain letters and spaces");
  }
  
  return errors;
};

const validatePostalCode = (postalCode) => {
  const trimmedCode = postalCode.trim();
  const errors = [];
  
  if (!trimmedCode) {
    errors.push("Postal code is required");
  } else if (!/^\d+$/.test(trimmedCode)) {
    errors.push("Postal code can only contain digits");
  } else if (trimmedCode.length !== 5) {
    errors.push("Postal code must be exactly 5 digits");
  }
  
  return errors;
};

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

// Calculate total fabric meters for all items
const calculateTotalFabricMeters = (items) => {
  return items.reduce((total, item) => {
    return total + calculateItemFabricMeters(item);
  }, 0);
};

// Get fabric breakdown by category
const getFabricBreakdown = (items) => {
  const breakdown = {};

  items.forEach(item => {
    if (item.productId && item.quantity) {
      const category = getCategoryFromProductId(item.productId);
      if (!breakdown[category]) {
        breakdown[category] = { meters: 0, items: 0 };
      }
      breakdown[category].meters += calculateItemFabricMeters(item);
      breakdown[category].items += parseInt(item.quantity) || 0;
    }
  });

  return Object.entries(breakdown).map(([category, data]) => ({
    category,
    meters: data.meters,
    items: data.items
  }));
};

function AddNewOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, getDisplayName } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDateWarning, setShowDateWarning] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [cartDataApplied, setCartDataApplied] = useState(false);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [customerDataLoaded, setCustomerDataLoaded] = useState(false);

  // Validation error states
  const [validationErrors, setValidationErrors] = useState({
    customerName: [],
    customerEmail: [],
    customerPhone: [],
    streetAddress: [],
    city: [],
    postalCode: []
  });

  // Extract cart data from ProductDetails navigation
  const cartData = location.state?.cartItems || null;
  const cartTotalAmount = location.state?.totalAmount || 0;
  const cartTotalItems = location.state?.totalItems || 0;

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
        postalCode: ""
      }
    },
    items: [
      {
        productId: "",
        size: "",
        color: "",
        material: "",
        quantity: 1,
        price: 0
      }
    ],
    orderStatus: "PROCESSING", // Changed from PENDING to PROCESSING
    paymentStatus: "PENDING"
  });

  // PDF Generation Function
  const generatePDF = () => {
    try {
      const doc = new jsPDF();

      // Set font
      doc.setFont("helvetica");

      // Header with background - Professional style
      doc.setFillColor(0, 90, 84); // Dark teal color matching the report
      doc.rect(0, 0, 210, 25, 'F');

      // FF Logo circle
      doc.setFillColor(255, 255, 255);
      doc.circle(15, 12.5, 5, 'F');
      doc.setFillColor(0, 90, 84);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("FF", 12.5, 15);

      // Company name and subtitle
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("FABRIC FLOW", 25, 15);

      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(220, 220, 220);
      doc.text("Management System", 25, 20);

      // Reset text color
      doc.setTextColor(0, 0, 0);

      // Report section with background
      doc.setFillColor(247, 248, 248);
      doc.roundedRect(10, 35, 190, 20, 2, 2, 'F');

      // Report title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 90, 84);
      doc.text("ORDER MANAGEMENT REPORT", 15, 45);

      // Report metadata
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      const currentDate = new Date();
      doc.text(`Report Generated: ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`, 15, 52);
      doc.text(`Generated By: System Administrator`, 15, 49);
      doc.text(`Total Records: ${formData.items.length} items`, 105, 52);
      doc.text(`Report ID: ORD-${Date.now().toString().slice(-6)}`, 105, 49);

      // Order Information Section
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Order Information", 20, 70);

      // Draw line under section
      doc.setLineWidth(0.5);
      doc.line(20, 72, 190, 72);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      doc.text(`Order ID: ${formData.orderId || 'Not Generated'}`, 20, 82);
      doc.text(`Order Date: ${formatDateForDisplay(formData.orderDate)}`, 20, 90);
      doc.text(`Delivery Date: ${formatDateForDisplay(formData.deliveryDate)}`, 20, 98);
      doc.text(`Order Status: ${formData.orderStatus}`, 20, 106);
      doc.text(`Payment Status: ${formData.paymentStatus}`, 20, 114);

      // Customer Information Section
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Customer Information", 20, 130);

      // Draw line under section
      doc.line(20, 132, 190, 132);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      doc.text(`Name: ${formData.customer.name || 'Not provided'}`, 20, 142);
      doc.text(`Email: ${formData.customer.email || 'Not provided'}`, 20, 150);
      doc.text(`Phone: ${formData.customer.phone || 'Not provided'}`, 20, 158);

      // Shipping Address
      const address = formData.customer.shippingAddress;
      const addressText = `Address: ${address.street || 'Not provided'}, ${address.city || ''} ${address.postalCode || ''}`;
      doc.text(addressText, 20, 166);

      // Order Items Section
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Order Items", 20, 185);

      // Draw line under section
      doc.line(20, 187, 190, 187);

      // Prepare table data with fabric information
      const tableData = formData.items.map((item, index) => [
        index + 1,
        item.productId || 'N/A',
        item.size || 'N/A',
        item.color || 'N/A',
        item.material || 'N/A',
        item.quantity || 0,
        `${calculateItemFabricMeters(item).toFixed(1)}m`,
        `Rs ${(item.price || 0).toLocaleString()}`,
        `Rs ${((item.quantity || 0) * (item.price || 0)).toLocaleString()}`
      ]);

      // Add table with autoTable plugin - Professional style
      autoTable(doc, {
        startY: 195,
        head: [['#', 'Product ID', 'Size', 'Color', 'Material', 'Qty', 'Fabric', 'Unit Price', 'Total Price']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [0, 90, 84], // Dark teal matching the header
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center',
          lineWidth: 0.5,
          lineColor: [200, 200, 200]
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [60, 60, 60],
          halign: 'center',
          lineWidth: 0.5,
          lineColor: [200, 200, 200]
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 12 },
          1: { halign: 'center', cellWidth: 25 },
          2: { halign: 'center', cellWidth: 15 },
          3: { halign: 'center', cellWidth: 20 },
          4: { halign: 'center', cellWidth: 30 },
          5: { halign: 'center', cellWidth: 15 },
          6: { halign: 'center', cellWidth: 18 },
          7: { halign: 'right', cellWidth: 25 },
          8: { halign: 'right', cellWidth: 30 }
        },
        margin: { left: 10, right: 10 }
      });

      // Summary section - Professional style
      const finalY = doc.lastAutoTable.finalY + 15;

      // Summary section with background
      doc.setFillColor(0, 90, 84);
      doc.roundedRect(10, finalY, 190, 25, 2, 2, 'F');

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("REPORT SUMMARY", 15, finalY + 8);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const totalItems = formData.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const totalFabric = calculateTotalFabricMeters(formData.items);

      doc.text(`Total Items: ${totalItems}`, 15, finalY + 15);
      doc.text(`Total Fabric: ${totalFabric.toFixed(1)}m`, 70, finalY + 15);
      doc.text(`Total Amount: Rs ${calculateTotal().toLocaleString()}`, 130, finalY + 15);

      // Footer section - Professional style with lines
      doc.setTextColor(0, 90, 84);
      doc.setLineWidth(2);
      doc.line(10, finalY + 40, 200, finalY + 40);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      const footerY = finalY + 50;

      doc.text("Fabric Flow Management System | Confidential Document", 10, footerY);
      doc.text("Page 1", 185, footerY);
      doc.text("Generated on " + new Date().toLocaleDateString(), 10, footerY + 10);
      doc.text("© 2025 Fabric Flow. All rights reserved.", 140, footerY + 10);



      
      // Save the PDF with new naming convention
      const fileName = `FabricFlow_Order_${formData.orderId || Date.now()}.pdf`;
      doc.save(fileName);

      // Show success message
      alert(`PDF downloaded successfully as "${fileName}"`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

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

  // Auto-populate customer information from authenticated user
  useEffect(() => {
    if (isAuthenticated && user && !customerDataLoaded) {
      console.log("Auto-populating customer data from user:", user);
      
      setFormData(prev => ({
        ...prev,
        customer: {
          name: getDisplayName() || user.firstName + " " + user.lastName || user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          shippingAddress: {
            street: user.address?.street || "",
            city: user.address?.city || "",
            postalCode: user.address?.postalCode || ""
          }
        }
      }));
      
      setCustomerDataLoaded(true);
      console.log("Customer data auto-populated");
    }
  }, [isAuthenticated, user, customerDataLoaded, getDisplayName]);

  // Auto-fill order items when cart data is passed from ProductDetails
  useEffect(() => {
    if (cartData && cartData.length > 0 && !cartDataApplied) {
      console.log("Auto-filling order items from cart:", cartData);
      
      // Debug: Log the material data being passed
      cartData.forEach((item, index) => {
        console.log(`Item ${index} material:`, item.material);
      });

      const autoFilledItems = cartData.map(item => ({
        productId: item.productId.toString(),
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price,
        material: mapMaterialName(item.material)
      }));

      // Debug: Log the final mapped items
      console.log("Auto-filled items with materials:", autoFilledItems);

      setFormData(prev => ({
        ...prev,
        items: autoFilledItems
      }));

      setCartDataApplied(true);
      console.log("Auto-filled items:", autoFilledItems);
    }
  }, [cartData, cartDataApplied]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Real-time validation with immediate feedback
    const validateField = (fieldName, fieldValue) => {
      let errors = [];
      
      switch (fieldName) {
        case 'customer.name':
          errors = validateCustomerName(fieldValue);
          setValidationErrors(prev => ({ ...prev, customerName: errors }));
          break;
        case 'customer.email':
          errors = validateEmail(fieldValue);
          setValidationErrors(prev => ({ ...prev, customerEmail: errors }));
          break;
        case 'customer.phone':
          errors = validatePhoneNumberEnhanced(fieldValue);
          setValidationErrors(prev => ({ ...prev, customerPhone: errors }));
          break;
        case 'customer.shippingAddress.street':
          errors = validateStreetAddress(fieldValue);
          setValidationErrors(prev => ({ ...prev, streetAddress: errors }));
          break;
        case 'customer.shippingAddress.city':
          errors = validateCity(fieldValue);
          setValidationErrors(prev => ({ ...prev, city: errors }));
          break;
        case 'customer.shippingAddress.postalCode':
          errors = validatePostalCode(fieldValue);
          setValidationErrors(prev => ({ ...prev, postalCode: errors }));
          break;
        default:
          break;
      }
      return errors;
    };

    // Handle phone number validation and formatting
    if (name === 'customer.phone') {
      // Allow only digits and limit to 10 characters
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      const errors = validateField(name, digitsOnly);
      
      // Keep old phone error for backward compatibility
      if (errors.length > 0) {
        setPhoneError(errors[0]);
      } else {
        setPhoneError("");
      }

      setFormData(prev => ({
        ...prev,
        customer: {
          ...prev.customer,
          phone: digitsOnly
        }
      }));
      return;
    }

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

    // Validate field in real-time
    validateField(name, value);

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

  // Helper component for displaying validation errors
  const ValidationErrors = ({ errors }) => {
    if (!errors || errors.length === 0) return null;
    
    return (
      <div className="mt-1 space-y-1">
        {errors.map((error, index) => (
          <p key={index} className="text-xs text-red-600">
            {error}
          </p>
        ))}
      </div>
    );
  };

  // Helper function to get border color based on validation
  const getBorderColor = (errors) => {
    if (errors && errors.length > 0) {
      return 'border-red-300';
    }
    return 'border-gray-300';
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
          material: "",
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

  // Enhanced validation function
  const validateForm = () => {
    // Validate all fields and collect errors
    const nameErrors = validateCustomerName(formData.customer.name);
    const emailErrors = validateEmail(formData.customer.email);
    const phoneErrors = validatePhoneNumberEnhanced(formData.customer.phone);
    const streetErrors = validateStreetAddress(formData.customer.shippingAddress.street);
    const cityErrors = validateCity(formData.customer.shippingAddress.city);
    const postalErrors = validatePostalCode(formData.customer.shippingAddress.postalCode);

    // Update validation errors state
    setValidationErrors({
      customerName: nameErrors,
      customerEmail: emailErrors,
      customerPhone: phoneErrors,
      streetAddress: streetErrors,
      city: cityErrors,
      postalCode: postalErrors
    });

    // Check if any validation errors exist
    const hasErrors = nameErrors.length > 0 || emailErrors.length > 0 || phoneErrors.length > 0 || 
                     streetErrors.length > 0 || cityErrors.length > 0 || postalErrors.length > 0;

    if (hasErrors) {
      alert("Please fix all validation errors before submitting the form.");
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
      if (!item.material) {
        alert(`Material is required for item ${i + 1}`);
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
            country: "" // Always empty since country is not important
          }
        },
        items: formData.items.map(item => ({
          productId: item.productId,
          size: item.size,
          color: item.color,
          material: item.material,
          quantity: Number(item.quantity),
          price: Number(item.price)
        })),
        totalAmount: calculateTotal(),
        orderStatus: "PROCESSING", // Changed from PENDING to PROCESSING
        paymentStatus: "PENDING"
      };

      console.log("Submitting order data:", orderData);

      const response = await axios.post(URL, orderData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log("Order created successfully:", response.data);
      alert("Order created successfully!");

      // Order created successfully - no navigation, just show popup
      // User can manually navigate or use the back button if needed
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
    navigate('/products');
  };

  // Handle customer editing toggle
  const toggleCustomerEdit = () => {
    setIsEditingCustomer(!isEditingCustomer);
  };

  // Save customer edits
  const saveCustomerEdits = () => {
    setIsEditingCustomer(false);
  };

  // Cancel customer edits and reset to original data
  const cancelCustomerEdits = () => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        customer: {
          name: getDisplayName() || user.firstName + " " + user.lastName || user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          shippingAddress: {
            street: user.address?.street || "",
            city: user.address?.city || "",
            postalCode: user.address?.postalCode || ""
          }
        }
      }));
    }
    setIsEditingCustomer(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors"
            >
              <FaArrowLeft /> Back
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Add New Order</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Order Information Section */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Order Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Order ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order ID</label>
                <input
                  type="text"
                  name="orderId"
                  value={formData.orderId || ""}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  placeholder="Order ID will be generated automatically"
                />
              </div>
              {/* Order Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Date *</label>
                <input
                  type="date"
                  name="orderDate"
                  value={formData.orderDate || ""}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                {showDateWarning && (
                  <p className="text-xs text-red-500 mt-1 animate-pulse">
                    ⚠️ Cannot select dates from today to next 7 days. Please choose a different date.
                  </p>
                )}
              </div>
              {/* Delivery Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Delivery Date</label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate || ""}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>
            {/* Date Information Display */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
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
          <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
            {/* Customer Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Customer Information</h3>
                    {isAuthenticated && user && (
                      <p className="text-sm text-gray-600">
                        Welcome, {getDisplayName()}! Your details are auto-filled.
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!isEditingCustomer ? (
                    <button
                      type="button"
                      onClick={toggleCustomerEdit}
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FaEdit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={saveCustomerEdits}
                        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <FaCheck className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                      <button
                        type="button"
                        onClick={cancelCustomerEdits}
                        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FaTimes className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="p-6">
              {!isEditingCustomer ? (
                /* Display Mode */
                <div className="space-y-6">
                  {/* Personal Information Display */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Customer Name</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {formData.customer.name || "Not provided"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {formData.customer.email || "Not provided"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {formData.customer.phone || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {/* Shipping Address Display */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-600 mb-2">Shipping Address</label>
                    <div className="text-lg font-semibold text-gray-900">
                      {formData.customer.shippingAddress.street && formData.customer.shippingAddress.city ? (
                        <div className="space-y-1">
                          <p>{formData.customer.shippingAddress.street}</p>
                          <p>
                            {formData.customer.shippingAddress.city}
                            {formData.customer.shippingAddress.postalCode && (
                              <span> - {formData.customer.shippingAddress.postalCode}</span>
                            )}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">Address not provided</p>
                      )}
                    </div>
                  </div>

                  {/* Status Indicators */}
                  <div className="flex flex-wrap gap-2">
                    {formData.customer.name && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Name provided
                      </span>
                    )}
                    {formData.customer.email && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Email provided
                      </span>
                    )}
                    {formData.customer.phone && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Phone provided
                      </span>
                    )}
                    {formData.customer.shippingAddress.street && formData.customer.shippingAddress.city && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Address provided
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                /* Edit Mode */
                <div className="space-y-6">
                  {/* Personal Information Editing */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Name * <span className="text-xs text-gray-500">(2-50 chars, letters only)</span>
                      </label>
                      <input
                        type="text"
                        name="customer.name"
                        value={formData.customer.name || ""}
                        onChange={handleInputChange}
                        required
                        maxLength="50"
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${getBorderColor(validationErrors.customerName)}`}
                        placeholder="Enter full name (letters and spaces only)"
                      />
                      <ValidationErrors errors={validationErrors.customerName} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address * <span className="text-xs text-gray-500">(max 100 chars, valid format required)</span>
                      </label>
                      <input
                        type="email"
                        name="customer.email"
                        value={formData.customer.email || ""}
                        onChange={handleInputChange}
                        required
                        maxLength="100"
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${getBorderColor(validationErrors.customerEmail)}`}
                        placeholder="user@example.com (no spaces, valid domain required)"
                        autoComplete="email"
                      />
                      <ValidationErrors errors={validationErrors.customerEmail} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number * <span className="text-xs text-gray-500">(10 digits, no repeating digits)</span>
                      </label>
                      <input
                        type="tel"
                        name="customer.phone"
                        value={formData.customer.phone || ""}
                        onChange={handleInputChange}
                        required
                        maxLength="10"
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${getBorderColor(validationErrors.customerPhone)}`}
                        placeholder="Enter 10-digit number (e.g., 0712345678)"
                        pattern="[0-9]{10}"
                      />
                      <ValidationErrors errors={validationErrors.customerPhone} />
                      {formData.customer.phone && formData.customer.phone.length === 10 && validationErrors.customerPhone.length === 0 && (
                        <p className="text-sm text-green-600 mt-1">✓ Valid phone number</p>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address Editing */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-700 mb-3">Shipping Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street Address * <span className="text-xs text-gray-500">(5-200 chars)</span>
                        </label>
                        <input
                          type="text"
                          name="customer.shippingAddress.street"
                          value={formData.customer.shippingAddress.street || ""}
                          onChange={handleInputChange}
                          required
                          maxLength="200"
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${getBorderColor(validationErrors.streetAddress)}`}
                          placeholder="123 Main Street, Apt 4B"
                        />
                        <ValidationErrors errors={validationErrors.streetAddress} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City * <span className="text-xs text-gray-500">(2-50 chars, letters only)</span>
                        </label>
                        <input
                          type="text"
                          name="customer.shippingAddress.city"
                          value={formData.customer.shippingAddress.city || ""}
                          onChange={handleInputChange}
                          required
                          maxLength="50"
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${getBorderColor(validationErrors.city)}`}
                          placeholder="Enter city name"
                        />
                        <ValidationErrors errors={validationErrors.city} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Postal Code * <span className="text-xs text-gray-500">(5 digits)</span>
                        </label>
                        <input
                          type="text"
                          name="customer.shippingAddress.postalCode"
                          value={formData.customer.shippingAddress.postalCode || ""}
                          onChange={handleInputChange}
                          required
                          maxLength="5"
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${getBorderColor(validationErrors.postalCode)}`}
                          placeholder="Enter 5-digit postal code"
                          pattern="[0-9]{5}"
                        />
                        <ValidationErrors errors={validationErrors.postalCode} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Order Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors"
              >
                <FaPlus /> Add Item
              </button>
            </div>
            {formData.items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-700">Item {index + 1}</h4>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FaMinus />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product ID *</label>
                    <input
                      type="text"
                      value={item.productId || ""}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                      placeholder="Enter Product ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Size *</label>
                    <select
                      value={item.size || ""}
                      onChange={(e) => handleItemChange(index, 'size', e.target.value)}
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color *</label>
                    <select
                      value={item.color || ""}
                      onChange={(e) => handleItemChange(index, 'color', e.target.value)}
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Material *</label>
                    <select
                      value={item.material || ""}
                      onChange={(e) => handleItemChange(index, 'material', e.target.value)}
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                    >
                      <option value="">Select Material</option>
                      {MATERIALS.map((material) => (
                        <option key={material} value={material}>
                          {material}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity || ""}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                      placeholder="Qty"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price || ""}
                      onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                      placeholder="Price"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fabric (Meters)</label>
                    <input
                      type="number"
                      value={calculateItemFabricMeters(item)}
                      readOnly
                      className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-calculated</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white">
            <div className="space-y-3">
              {/* Subtotal */}
              <div className="flex justify-between items-center py-1">
                <span className="text-sm font-medium text-gray-700">Subtotal</span>
                <span className="text-sm font-semibold text-gray-800">Rs {calculateTotal().toFixed(2)}</span>
              </div>
              
              {/* Shipping */}
              <div className="flex justify-between items-center py-1">
                <span className="text-sm font-medium text-gray-700">
                  Shipping 
                </span>
                <span className="text-sm font-semibold text-gray-800">Rs 350.00</span>
              </div>
              
              {/* Divider */}
              <hr className="border-gray-200" />
              
              {/* Total */}
              <div className="flex justify-between items-center py-1">
                <span className="text-lg font-bold text-gray-800">Total</span>
                <span className="text-lg font-bold text-gray-800">
                  Rs {(calculateTotal() + 350).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 flex-wrap">
            <button
              type="submit"
              disabled={loading || phoneError}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg shadow-md transition-colors"
            >
              <FaSave /> {loading ? 'Creating Order...' : 'Create Order'}
            </button>
            <button
              type="button"
              onClick={generatePDF}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition-colors"
            >
              <FaDownload /> Download PDF Preview
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg shadow-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddNewOrder;