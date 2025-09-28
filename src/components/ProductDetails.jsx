import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FaShoppingCart, FaCheck, FaInfoCircle, FaChevronDown, FaUndo, FaTimes, FaRuler } from "react-icons/fa";

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { state: cartState, dispatch } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Fabric consumption per product category (meters per item)
  const getFabricConsumption = (category) => {
    const fabricConsumption = {
      "Formal Shirts": {
        metersPerItem: 1.2,
        description: "Each formal shirt requires 1.2 meters of fabric",
        fabricType: "Dress shirt fabric"
      },
      "Polos & Tees": {
        metersPerItem: 1.0,
        description: "Each polo/tee requires 1.0 meter of fabric",
        fabricType: "Jersey/Pique fabric"
      },
      "Casual Shirts": {
        metersPerItem: 1.3,
        description: "Each casual shirt requires 1.3 meters of fabric",
        fabricType: "Casual shirt fabric"
      },
      "Bottomwear": {
        metersPerItem: 1.5,
        description: "Each trouser requires 1.5 meters of fabric",
        fabricType: "Trouser fabric"
      }
    };
    return fabricConsumption[category] || { metersPerItem: 1.0, description: "Standard fabric consumption", fabricType: "Standard fabric" };
  };

  // Calculate total fabric meters needed
  const calculateFabricMeters = () => {
    if (!product || quantity <= 0) return 0;
    const fabricInfo = getFabricConsumption(product.category);
    return quantity * fabricInfo.metersPerItem;
  };

  // Material options for different product categories
  const getMaterialOptions = (category) => {
    const materialOptions = {
      "Formal Shirts": [
        {
          id: "cotton-blend-140",
          name: "Cotton Blend (140 GSM)",
          composition: "60% Cotton, 40% Polyester",
          fabricType: "Cotton Blend",
          weight: "140 GSM",
          texture: "Smooth Twill",
          careInstructions: ["Machine wash cold", "Do not bleach", "Tumble dry low", "Iron on medium heat"],
          priceModifier: 0
        },
        {
          id: "premium-cotton-160",
          name: "Premium Cotton Blend (160 GSM)",
          composition: "70% Cotton, 30% Polyester",
          fabricType: "Premium Cotton Blend",
          weight: "160 GSM",
          texture: "Fine Twill",
          careInstructions: ["Machine wash cold", "Do not bleach", "Tumble dry low", "Iron on medium heat", "Dry clean recommended"],
          priceModifier: 500
        },
        {
          id: "cotton-poly-150",
          name: "Cotton Polyester Blend (150 GSM)",
          composition: "65% Cotton, 35% Polyester",
          fabricType: "Cotton Polyester Blend",
          weight: "150 GSM",
          texture: "Striped Weave",
          careInstructions: ["Machine wash cold", "Do not bleach", "Tumble dry low", "Iron on medium heat"],
          priceModifier: 200
        }
      ],
      "Polos & Tees": [
        {
          id: "pique-cotton-180",
          name: "100% Pique Cotton (180 GSM)",
          composition: "100% Cotton",
          fabricType: "Pique Cotton",
          weight: "180 GSM",
          texture: "Textured Pique",
          careInstructions: ["Machine wash warm", "Do not bleach", "Tumble dry medium", "Iron on medium heat"],
          priceModifier: 0
        },
        {
          id: "cotton-jersey-160",
          name: "Cotton Jersey with Elastane (160 GSM)",
          composition: "95% Cotton, 5% Elastane",
          fabricType: "Cotton Jersey",
          weight: "160 GSM",
          texture: "Soft Jersey",
          careInstructions: ["Machine wash warm", "Do not bleach", "Tumble dry low", "Iron on low heat"],
          priceModifier: 300
        },
        {
          id: "organic-cotton-170",
          name: "Organic Cotton (170 GSM)",
          composition: "100% Organic Cotton",
          fabricType: "Organic Cotton",
          weight: "170 GSM",
          texture: "Soft Organic Weave",
          careInstructions: ["Machine wash warm", "Use eco-friendly detergent", "Tumble dry low", "Iron on medium heat"],
          priceModifier: 400
        }
      ],
      "Casual Shirts": [
        {
          id: "cotton-linen-120",
          name: "Cotton Linen Blend (120 GSM)",
          composition: "80% Cotton, 20% Linen",
          fabricType: "Cotton Linen Blend",
          weight: "120 GSM",
          texture: "Relaxed Weave",
          careInstructions: ["Machine wash cold", "Do not bleach", "Hang dry", "Iron on medium heat"],
          priceModifier: 0
        },
        {
          id: "cotton-poly-140",
          name: "Cotton Poly Blend (140 GSM)",
          composition: "75% Cotton, 25% Polyester",
          fabricType: "Cotton Poly Blend",
          weight: "140 GSM",
          texture: "Printed Canvas",
          careInstructions: ["Machine wash cold", "Do not bleach", "Tumble dry low", "Iron inside out on low"],
          priceModifier: 250
        },
        {
          id: "linen-cotton-110",
          name: "Premium Linen Cotton (110 GSM)",
          composition: "60% Linen, 40% Cotton",
          fabricType: "Linen Cotton",
          weight: "110 GSM",
          texture: "Breathable Linen Weave",
          careInstructions: ["Machine wash cold", "Do not bleach", "Hang dry", "Iron on high heat"],
          priceModifier: 600
        }
      ],
      "Bottomwear": [
        {
          id: "stretch-suiting-280",
          name: "Stretch Suiting (280 GSM)",
          composition: "65% Polyester, 32% Viscose, 3% Elastane",
          fabricType: "Stretch Suiting",
          weight: "280 GSM",
          texture: "Fine Twill",
          careInstructions: ["Dry clean only", "Do not bleach", "Iron on medium heat", "Store hanging"],
          priceModifier: 0
        },
        {
          id: "premium-wool-300",
          name: "Premium Wool Blend (300 GSM)",
          composition: "70% Wool, 25% Polyester, 5% Elastane",
          fabricType: "Wool Blend",
          weight: "300 GSM",
          texture: "Luxury Wool Twill",
          careInstructions: ["Dry clean only", "Do not bleach", "Professional pressing", "Store with mothballs"],
          priceModifier: 1000
        },
        {
          id: "cotton-stretch-260",
          name: "Cotton Stretch (260 GSM)",
          composition: "92% Cotton, 6% Polyester, 2% Elastane",
          fabricType: "Cotton Stretch",
          weight: "260 GSM",
          texture: "Soft Cotton Twill",
          careInstructions: ["Machine wash cold", "Do not bleach", "Tumble dry low", "Iron on medium heat"],
          priceModifier: 400
        }
      ]
    };

    return materialOptions[category] || [];
  };

  // Enhanced product database with base material information
  const productDatabase = [
    { 
      id: 1, 
      name: "Majesty Plain Slim Fit", 
      color: "Estate Blue", 
      category: "Formal Shirts", 
      price: 3495.00, 
      image: "/images/men/img1.jpg"
    },
    { 
      id: 2, 
      name: "Majesty Plain Slim Fit", 
      color: "Cashmere Blue", 
      category: "Formal Shirts", 
      price: 3495.00, 
      image: "/images/men/img2.jpg"
    },
    { 
      id: 3, 
      name: "Majesty Stripe Regular Fit", 
      color: "Charcoal", 
      category: "Formal Shirts", 
      price: 3495.00, 
      image: "/images/men/img3.jpg"
    },
    { 
      id: 4, 
      name: "Formal Plain Slim Fit", 
      color: "True Navy", 
      category: "Formal Shirts", 
      price: 3995.00, 
      image: "/images/men/img13.jpg"
    },
    { 
      id: 5, 
      name: "Polo Plain Slim Fit", 
      color: "Magenta Purple", 
      category: "Polos & Tees", 
      price: 2795.00, 
      image: "/images/men/img4.jpg"
    },
    { 
      id: 6, 
      name: "Polo Plain Slim Fit", 
      color: "Patriot Blue", 
      category: "Polos & Tees", 
      price: 2795.00, 
      image: "/images/men/img5.jpg"
    },
    { 
      id: 7, 
      name: "Crew Neck Tee", 
      color: "Sky Way", 
      category: "Polos & Tees", 
      price: 2795.00, 
      image: "/images/men/img6.jpg"
    },
    { 
      id: 8, 
      name: "Crew Neck Tee", 
      color: "Blazing Orange", 
      category: "Polos & Tees", 
      price: 2795.00, 
      image: "/images/men/img14.jpg"
    },
    { 
      id: 9, 
      name: "Oversized Shirt-Little Boy Blue", 
      color: "Princess Blue", 
      category: "Casual Shirts", 
      price: 3495.00, 
      image: "/images/men/img7.jpg"
    },
    { 
      id: 10, 
      name: "Oversized Shirt-Jade Green", 
      color: "Little Boy Blue", 
      category: "Casual Shirts", 
      price: 3495.00, 
      originalPrice: 3795.00, 
      sale: true, 
      image: "/images/men/img8.jpg"
    },
    { 
      id: 11, 
      name: "Oversized Shirt-Brown Henna", 
      color: "Jade Green", 
      category: "Casual Shirts", 
      price: 3495.00, 
      originalPrice: 3795.00, 
      sale: true, 
      image: "/images/men/img9.jpg"
    },
    { 
      id: 12, 
      name: "Slim Fit Denim Shirt-Astral Aura", 
      color: "Brown Henna", 
      category: "Casual Shirts", 
      price: 3495.50, 
      originalPrice: 3795.00, 
      sale: true, 
      image: "/images/men/img15.jpg"
    },
    { 
      id: 13, 
      name: "Formal Trouser Plain Ultra Slim Fit", 
      color: "Estate Blue", 
      category: "Bottomwear", 
      price: 3495.00, 
      image: "/images/men/img10.jpg"
    },
    { 
      id: 14, 
      name: "Mansak Formal Trouser Plain Extra Slim Fit", 
      color: "Grey", 
      category: "Bottomwear", 
      price: 3495.00, 
      image: "/images/men/img11.jpg"
    },
    { 
      id: 15, 
      name: "Mansak Formal Trouser Plain Extra Slim Fit", 
      color: "Cloud Burst", 
      category: "Bottomwear", 
      price: 3495.00, 
      image: "/images/men/img12.jpg"
    },
    { 
      id: 16, 
      name: "Formal Trouser Plain Ultra Slim Fit", 
      color: "Black", 
      category: "Bottomwear", 
      price: 3495.00, 
      image: "/images/men/img16.jpg"
    }
  ];

  // Size options based on category
  const getSizeOptions = (category) => {
    if (category === "Bottomwear") {
      return ["28", "30", "32", "34", "36", "38"];
    } else {
      return ["S", "M", "L", "XL", "XXL"];
    }
  };

  // Get selected material details
  const getSelectedMaterialDetails = () => {
    if (!product || !selectedMaterial) return null;
    const materialOptions = getMaterialOptions(product.category);
    return materialOptions.find(material => material.id === selectedMaterial);
  };

  // Calculate total price including material modifier
  const getTotalPrice = () => {
    const validQuantity = quantity === '' ? 0 : quantity;
    if (!product) return 0;
    
    const materialDetails = getSelectedMaterialDetails();
    const materialModifier = materialDetails ? materialDetails.priceModifier : 0;
    const finalPrice = product.price + materialModifier;
    
    return finalPrice * validQuantity;
  };

  // Calculate unit price with material modifier
  const getUnitPrice = () => {
    if (!product) return 0;
    const materialDetails = getSelectedMaterialDetails();
    const materialModifier = materialDetails ? materialDetails.priceModifier : 0;
    return product.price + materialModifier;
  };

  // Clear all selections function
  const handleClearSelections = () => {
    setSelectedSize('');
    setSelectedMaterial('');
    setQuantity(1);
    setAddedToCart(false);
  };

  // Check if any selection has been made
  const hasSelections = () => {
    return selectedSize !== '' || selectedMaterial !== '' || quantity !== 1;
  };

  // Check if all required selections are made for total calculation
  const hasCompleteSelection = () => {
    return selectedSize !== '' && selectedMaterial !== '' && quantity >= 1;
  };

  useEffect(() => {
    setLoading(true);
    const foundProduct = productDatabase.find(p => p.id === parseInt(productId));
    setTimeout(() => {
      setProduct(foundProduct || null);
      setLoading(false);
      setSelectedSize('');
      setSelectedMaterial('');
      setQuantity(1);
      setAddedToCart(false);
    }, 500);
  }, [productId]);

  const formatPrice = (price) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  const handleDirectQuantityChange = (e) => {
    const value = e.target.value;
    
    if (value === '') {
      setQuantity('');
      return;
    }
    
    const numValue = parseInt(value);
    
    if (!isNaN(numValue)) {
      setQuantity(numValue);
    }
  };

  const handleQuantityBlur = () => {
    if (quantity === '' || quantity < 1) {
      setQuantity(1);
    } else if (quantity > 1000) {
      setQuantity(1000);
    }
  };

  const isAddToCartDisabled = () => {
    return !selectedSize || !selectedMaterial || quantity < 1 || quantity === '';
  };

  const handleAddToCart = () => {
    if (isAddToCartDisabled()) return;

    const materialDetails = getSelectedMaterialDetails();
    const fabricInfo = getFabricConsumption(product.category);
    
    const cartItem = {
      id: `${product.id}-${selectedSize}-${selectedMaterial}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      color: product.color,
      category: product.category,
      size: selectedSize,
      quantity: quantity,
      price: getUnitPrice(),
      image: product.image,
      totalPrice: getTotalPrice(),
      material: materialDetails,
      fabricMeters: calculateFabricMeters(),
      metersPerItem: fabricInfo.metersPerItem
    };

    dispatch({ type: 'ADD_TO_CART', payload: cartItem });
    setAddedToCart(true);
    
    setTimeout(() => {
      setSelectedSize('');
      setSelectedMaterial('');
      setQuantity(0);
      setAddedToCart(false);
    }, 2000);
  };

  const handleProceedToOrder = () => {
    const orderItems = cartState.items.map(item => ({
      productId: item.productId.toString(),
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: item.price,
      material: item.material,
      fabricMeters: item.fabricMeters,
      metersPerItem: item.metersPerItem
    }));

    navigate('/add-new-order', {
      state: {
        cartItems: orderItems,
        totalAmount: cartState.totalAmount,
        totalItems: cartState.totalItems,
        totalFabricMeters: cartState.items.reduce((sum, item) => sum + (item.fabricMeters || 0), 0)
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-4">Product with ID {productId} does not exist.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const materialOptions = getMaterialOptions(product.category);
  const selectedMaterialDetails = getSelectedMaterialDetails();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Cart Info */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mr-4"
              >
                ← Back
              </button>
            </div>
            
            {/* Cart Summary */}
            {cartState.totalItems > 0 && (
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaShoppingCart className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      {cartState.totalItems} items in cart
                    </span>
                    <span className="text-sm font-bold text-blue-900">
                      {formatPrice(cartState.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden relative">
              <img 
                src={product.image}
                alt={`${product.name} - ${product.color}`}
                className="absolute inset-0 w-full h-full object-cover object-center"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center" style={{ display: 'none' }}>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-2xl">📷</span>
                  </div>
                  <span className="text-gray-500 font-medium text-sm">{product.category}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="text-sm text-gray-500 mb-2">Product ID: {product.id}</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-xl text-gray-600 mb-4">Color: {product.color}</p>
              
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(getUnitPrice())}
                </span>
                {selectedMaterialDetails && selectedMaterialDetails.priceModifier > 0 && (
                  <div className="flex flex-col">
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm text-green-600 font-medium">
                      +{formatPrice(selectedMaterialDetails.priceModifier)} material upgrade
                    </span>
                  </div>
                )}
                {product.originalPrice && product.sale && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                    Sale!
                  </span>
                )}
              </div>

              <div className="mb-6">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {product.category}
                </span>
              </div>
            </div>




            {/* Material Selection Dropdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Select Material: {selectedMaterial && selectedMaterialDetails && (
                    <span className="text-blue-600 font-semibold">{selectedMaterialDetails.name}</span>
                  )}
                </label>
                {selectedMaterial && (
                  <button
                    onClick={() => setSelectedMaterial('')}
                    className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <FaTimes /> Clear
                  </button>
                )}
              </div>
              <div className="relative">
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-10"
                >
                  <option value="">Choose material...</option>
                  {materialOptions.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.name} {material.priceModifier > 0 && `(+${formatPrice(material.priceModifier)})`}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {!selectedMaterial && (
                <p className="text-sm text-red-600">Please select a material</p>
              )}
            </div>

            {/* Material Information Display */}
            {selectedMaterialDetails && (
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <FaInfoCircle className="text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">Selected Material Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-semibold text-gray-700">Composition:</span>
                      <p className="text-sm text-gray-900 font-medium">{selectedMaterialDetails.composition}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-semibold text-gray-700">Fabric Type:</span>
                      <p className="text-sm text-gray-900">{selectedMaterialDetails.fabricType}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-semibold text-gray-700">Weight:</span>
                      <p className="text-sm text-gray-900">{selectedMaterialDetails.weight}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-semibold text-gray-700">Texture:</span>
                      <p className="text-sm text-gray-900">{selectedMaterialDetails.texture}</p>
                    </div>
                  </div>
                </div>
                
                {/* Care Instructions */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm font-semibold text-gray-700 mb-2 block">Care Instructions:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedMaterialDetails.careInstructions.map((instruction, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-white text-gray-700 px-2 py-1 rounded border border-gray-300"
                      >
                        {instruction}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Size: {selectedSize && <span className="text-blue-600 font-semibold">{selectedSize}</span>}
                </label>
                {selectedSize && (
                  <button
                    onClick={() => setSelectedSize('')}
                    className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <FaTimes /> Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {getSizeOptions(product.category).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                      selectedSize === size
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && (
                <p className="text-sm text-red-600">Please select a size</p>
              )}
            </div>

            {/* Quantity Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Quantity:
                </label>
                {quantity !== 1 && (
                  <button
                    onClick={() => setQuantity(1)}
                    className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <FaUndo /> Reset to 1
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={quantity}
                  onChange={handleDirectQuantityChange}
                  onBlur={handleQuantityBlur}
                  placeholder="Enter quantity (1-1000)"
                  className={`w-48 text-center border rounded-lg py-3 px-4 text-lg ${
                    quantity < 1 || quantity > 1000 || quantity === ''
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                />
                <span className="text-sm text-gray-500">Range: 1-1000</span>
              </div>
              {(quantity < 1 || quantity > 1000 || quantity === '') && (
                <p className="text-sm text-red-600">
                  {quantity === '' ? 'Please enter a quantity' : 
                   quantity < 1 ? 'Minimum quantity is 1' : 
                   'Maximum quantity is 1000'}
                </p>
              )}
            </div>

            {/* Clear All Selections Button */}
            {hasSelections() && (
              <div className="flex justify-center">
                <button
                  onClick={handleClearSelections}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <FaUndo /> Clear All Selections
                </button>
              </div>
            )}

            {/* Current Selection Total - Only show when complete selection is made */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                {hasCompleteSelection() ? (
                  <>
                    <span className="text-gray-700">Selection Total ({quantity} items):</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(getTotalPrice())}
                      </span>
                      {selectedMaterialDetails && selectedMaterialDetails.priceModifier > 0 && (
                        <div className="text-sm text-gray-600">
                          Unit: {formatPrice(getUnitPrice())} (incl. material upgrade)
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-gray-500">Complete selection to see total price</span>
                    <div className="text-right">
                      <span className="text-lg text-gray-500">
                        Base price: {formatPrice(product.price)} per item
                      </span>
                      <div className="text-sm text-gray-400">
                        Min. order quantity: 1 item
                      </div>
                    </div>
                  </>
                )}
              </div>
            
            </div>

            {/* Cart Summary */}
            {cartState.totalItems > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">🛒 Cart Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Total Items in Cart:</span>
                    <span className="font-semibold text-blue-900">{cartState.totalItems}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Cart Total:</span>
                    <span className="font-bold text-blue-900">{formatPrice(cartState.totalAmount)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={isAddToCartDisabled() || addedToCart}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  addedToCart
                    ? 'bg-green-600 text-white'
                    : isAddToCartDisabled()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {addedToCart ? (
                  <>
                    <FaCheck /> Added to Cart!
                  </>
                ) : (
                  <>
                    <FaShoppingCart />
                    {isAddToCartDisabled() 
                      ? 'Select Material, Size & Valid Quantity' 
                      : `Add to Cart - ${formatPrice(getTotalPrice())}`
                    }
                  </>
                )}
              </button>

              {cartState.totalItems > 0 && (
                <button
                  onClick={handleProceedToOrder}
                  className="w-full py-3 px-6 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  Proceed to Order ({cartState.totalItems} items - {formatPrice(cartState.totalAmount)})
                </button>
              )}

              <button
                onClick={() => navigate(-1)}
                className="w-full border border-gray-300 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back to Products
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;