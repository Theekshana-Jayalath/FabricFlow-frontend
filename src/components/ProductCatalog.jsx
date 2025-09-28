import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaSearch, FaTimes } from "react-icons/fa";

const ProductCatalog = () => {
  const navigate = useNavigate();
  const [currentSlideKids, setCurrentSlideKids] = useState(0);
  const [currentSlideMen, setCurrentSlideMen] = useState(0);
  const [currentSlideWomen, setCurrentSlideWomen] = useState(0);
  const [currentSlideBottom, setCurrentSlideBottom] = useState(0);
  
  // Search functionality state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);

  // Enhanced product data with proper images and styling
  const categories = {
    formalShirts: [
      {
        id: 1,
        name: "Majesty Plain Slim Fit",
        color: "Estate Blue",
        price: 3495.00,
        image: "/images/men/img1.jpg",
        backgroundColor: "bg-gradient-to-br from-blue-600 to-blue-800",
        category: "Formal Shirts"
      },
      {
        id: 2,
        name: "Majesty Plain Slim Fit",
        color: "Cashmere Blue",
        price: 3495.00,
        image: "/images/men/img2.jpg",
        backgroundColor: "bg-gradient-to-br from-blue-400 to-blue-600",
        category: "Formal Shirts"
      },
      {
        id: 3,
        name: "Majesty Stripe Regular Fit",
        color: "Charcoal",
        price: 3495.00,
        image: "/images/men/img3.jpg",
        backgroundColor: "bg-gradient-to-br from-gray-600 to-gray-800",
        category: "Formal Shirts"
      },
      {
        id: 4,
        name: "Formal Plain Slim Fit",
        color: "True Navy",
        price: 3995.00,
        image: "/images/men/img13.jpg",
        backgroundColor: "bg-gradient-to-br from-blue-700 to-blue-900",
        category: "Formal Shirts"
      }
    ],
    polosTees: [
      {
        id: 5,
        name: "Polo Plain Slim Fit",
        color: "Magenta Purple",
        price: 2795.00,
        image: "/images/men/img4.jpg",
        backgroundColor: "bg-gradient-to-br from-purple-500 to-pink-600",
        category: "Polos & Tees"
      },
      {
        id: 6,
        name: "Polo Plain Slim Fit",
        color: "Patriot Blue",
        price: 2795.00,
        image: "/images/men/img5.jpg",
        backgroundColor: "bg-gradient-to-br from-blue-600 to-blue-800",
        category: "Polos & Tees"
      },
      {
        id: 7,
        name: "Crew Neck Tee",
        color: "Sky Way",
        price: 2795.00,
        image: "/images/men/img6.jpg",
        backgroundColor: "bg-gradient-to-br from-sky-400 to-blue-500",
        category: "Polos & Tees"
      },
      {
        id: 8,
        name: "Crew Neck Tee",
        color: "Blazing Orange",
        price: 2795.00,
        image: "/images/men/img14.jpg",
        backgroundColor: "bg-gradient-to-br from-orange-400 to-red-500",
        category: "Polos & Tees"
      }
    ],
    casualShirts: [
      {
        id: 9,
        name: "Oversized Shirt-Little Boy Blue",
        color: "Princess Blue",
        price: 3495.00,
        image: "/images/men/img7.jpg",
        backgroundColor: "bg-gradient-to-br from-blue-300 to-blue-500",
        category: "Casual Shirts"
      },
      {
        id: 10,
        name: "Oversized Shirt-Jade Green",
        color: "Little Boy Blue",
        price: 3495.00,
        originalPrice: 3795.00,
        sale: true,
        image: "/images/men/img8.jpg",
        backgroundColor: "bg-gradient-to-br from-blue-200 to-blue-400",
        category: "Casual Shirts"
      },
      {
        id: 11,
        name: "Oversized Shirt-Brown Henna",
        color: "Jade Green",
        price: 3495.00,
        originalPrice: 3795.00,
        sale: true,
        image: "/images/men/img9.jpg",
        backgroundColor: "bg-gradient-to-br from-green-400 to-emerald-600",
        category: "Casual Shirts"
      },
      {
        id: 12,
        name: "Slim Fit Denim Shirt-Astral Aura",
        color: "Brown Henna",
        price: 3495.50,
        originalPrice: 3795.00,
        sale: true,
        image: "/images/men/img15.jpg",
        backgroundColor: "bg-gradient-to-br from-amber-600 to-orange-700",
        category: "Casual Shirts"
      }
    ],
    bottomwear: [
      {
        id: 13,
        name: "Formal Trouser Plain Ultra Slim Fit",
        color: "Estate Blue",
        price: 3495.00,
        image: "/images/men/img10.jpg",
        backgroundColor: "bg-gradient-to-br from-blue-600 to-blue-800",
        category: "Bottomwear"
      },
      {
        id: 14,
        name: "Mansak Formal Trouser Plain Extra Slim Fit",
        color: "Grey",
        price: 3495.00,
        image: "/images/men/img11.jpg",
        backgroundColor: "bg-gradient-to-br from-gray-500 to-gray-700",
        category: "Bottomwear"
      },
      {
        id: 15,
        name: "Mansak Formal Trouser Plain Extra Slim Fit",
        color: "Cloud Burst",
        price: 3495.00,
        image: "/images/men/img12.jpg",
        backgroundColor: "bg-gradient-to-br from-slate-500 to-slate-700",
        category: "Bottomwear"
      },
      {
        id: 16,
        name: "Mansak Formal Trouser Plain Extra Slim Fit",
        color: "Black",
        price: 3495.00,
        image: "/images/men/img16.jpg",
        backgroundColor: "bg-gradient-to-br from-gray-800 to-black",
        category: "Bottomwear"
      }
    ]
  };

  // Get all products for search
  const getAllProducts = () => {
    return Object.values(categories).flat();
  };

  // Open search panel
  const openSearchPanel = () => {
    setIsSearchPanelOpen(true);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Close search panel
  const closeSearchPanel = () => {
    setIsSearchPanelOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Search function
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    const allProducts = getAllProducts();
    const filtered = allProducts.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.color.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase()) ||
      product.id.toString().includes(query)
    );
    
    setSearchResults(filtered);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    closeSearchPanel(); // Close search panel when navigating to product
  };

  const nextSlide = (category) => {
    const maxSlide = categories[category].length - 3; // Show 3 items at once
    if (category === 'formalShirts') {
      setCurrentSlideKids(prev => (prev >= maxSlide ? 0 : prev + 1));
    } else if (category === 'polosTees') {
      setCurrentSlideMen(prev => (prev >= maxSlide ? 0 : prev + 1));
    } else if (category === 'casualShirts') {
      setCurrentSlideWomen(prev => (prev >= maxSlide ? 0 : prev + 1));
    } else if (category === 'bottomwear') {
      setCurrentSlideBottom(prev => (prev >= maxSlide ? 0 : prev + 1));
    }
  };

  const prevSlide = (category) => {
    const maxSlide = categories[category].length - 3;
    if (category === 'formalShirts') {
      setCurrentSlideKids(prev => (prev <= 0 ? maxSlide : prev - 1));
    } else if (category === 'polosTees') {
      setCurrentSlideMen(prev => (prev <= 0 ? maxSlide : prev - 1));
    } else if (category === 'casualShirts') {
      setCurrentSlideWomen(prev => (prev <= 0 ? maxSlide : prev - 1));
    } else if (category === 'bottomwear') {
      setCurrentSlideBottom(prev => (prev <= 0 ? maxSlide : prev - 1));
    }
  };

  const getCurrentSlide = (category) => {
    switch (category) {
      case 'formalShirts': return currentSlideKids;
      case 'polosTees': return currentSlideMen;
      case 'casualShirts': return currentSlideWomen;
      case 'bottomwear': return currentSlideBottom;
      default: return 0;
    }
  };

  const CategorySection = ({ title, description, category, products }) => {
    const currentSlide = getCurrentSlide(category);
    
    return (
      <div className="mb-24">
        {/* Section Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              {title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {description}
            </p>
          </div>
        </div>

        {/* Products Carousel */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * (100 / 3)}%)` }}
            >
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="w-1/3 flex-shrink-0 px-3"
                >
                  <div 
                    onClick={() => handleProductClick(product.id)}
                    className="group cursor-pointer"
                  >
                    {/* Product Card */}
                    <div className={`relative h-96 rounded-lg overflow-hidden ${product.backgroundColor} mb-4`}>
                      

                      {/* Product Image */}
                      <img 
                        src={product.image}
                        alt={`${product.name} - ${product.color}`}
                        className="absolute inset-0 w-full h-full object-cover object-center"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                        onLoad={(e) => {
                          e.target.nextElementSibling.style.display = 'none';
                        }}
                      />

                      {/* Fallback placeholder */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-40 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-2 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
                              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="text-white font-medium text-sm">{product.category}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                        {product.name}
                      </h3>
                      <p className="text-gray-600">{product.color}</p>
                      <div className="flex items-center space-x-2">
                        {product.sale ? (
                          <>
                            <span className="text-lg font-bold text-red-600">
                              Rs {product.price.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              Rs {product.originalPrice.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">
                            Rs {product.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {categories[category].length > 3 && (
            <>
              <button
                onClick={() => prevSlide(category)}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white hover:bg-gray-50 rounded-full p-3 shadow-lg transition-all z-10 border"
              >
                <FaChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <button
                onClick={() => nextSlide(category)}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white hover:bg-gray-50 rounded-full p-3 shadow-lg transition-all z-10 border"
              >
                <FaChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Search Icon */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 text-white py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Top Navigation with Search Icon */}
          <div className="absolute top-6 right-6">
            <button
              onClick={openSearchPanel}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-300"
            >
              <FaSearch className="w-5 h-5" />
            </button>
          </div>

          <img 
            src="/images/fabricflow-logo-white.png" 
            alt="FabricFlow" 
            className="mx-auto mb-6 h-16"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
          <div className="text-4xl font-bold mb-4" style={{ display: 'none' }}>
            FABRICFLOW
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            REIMAGINE STYLE
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-teal-100 max-w-3xl mx-auto">
            Crafted for the Modern Man, Inspired by Heritage
          </p>
          <p className="text-lg text-teal-200 max-w-2xl mx-auto">
            Celebrate our transformation with collections that redefine fashion—crafted for today, inspired by our heritage.
          </p>
        </div>
      </div>

      {/* Search Panel (Right Sidebar) */}
      {isSearchPanelOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeSearchPanel}
          ></div>
          
          {/* Search Panel */}
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Panel Header */}
              <div className="p-6 border-b bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Search Products</h2>
                  <button
                    onClick={closeSearchPanel}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, color, category..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full px-4 py-3 pl-10 pr-4 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    autoFocus
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                
              </div>

              {/* Search Results */}
              <div className="flex-1 overflow-y-auto p-4">
                {searchQuery.trim() === "" ? (
                  <div className="text-center py-8">
                    <FaSearch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Start typing to search products</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl text-gray-300 mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No products found</h3>
                    <p className="text-gray-500 text-sm">
                      Try different keywords or browse all products
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700">
                        {searchResults.length} product{searchResults.length !== 1 ? 's' : ''} found
                      </p>
                    </div>
                    
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                      >
                        {/* Product Image */}
                        <div className={`w-16 h-16 rounded-lg ${product.backgroundColor} flex-shrink-0 mr-3 relative overflow-hidden`}>
                          <img 
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center" style={{ display: 'none' }}>
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded">
                              ID: {product.id}
                            </span>
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                              {product.category}
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-900 text-sm leading-tight truncate">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-600 mb-1">{product.color}</p>
                          <div className="flex items-center space-x-2">
                            {product.sale ? (
                              <>
                                <span className="text-sm font-bold text-red-600">
                                  Rs {product.price.toLocaleString()}
                                </span>
                                <span className="text-xs text-gray-500 line-through">
                                  Rs {product.originalPrice.toLocaleString()}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-bold text-gray-900">
                                Rs {product.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content - Product Categories */}
      <div className="py-16">
        {/* Formal Shirts Section */}
        <CategorySection
          title="Formal Shirts"
          description="Step into confidence with shirts that mean business. Premium fabrics and precision tailoring for the professional man."
          category="formalShirts"
          products={categories.formalShirts}
        />

        {/* Polos & Tees Section */}
        <CategorySection
          title="Polos & Tees"
          description="Your go-to for casual comfort with a sharp edge. Versatile pieces that transition seamlessly from day to night."
          category="polosTees"
          products={categories.polosTees}
        />

        {/* Casual Shirts Section */}
        <CategorySection
          title="Casual Shirts"
          description="Stay sharp, stay comfortable—your weekend essentials. Relaxed fits with contemporary style."
          category="casualShirts"
          products={categories.casualShirts}
        />

        {/* Bottomwear Section */}
        <CategorySection
          title="Bottomwear"
          description="Move freely with style built for every step. From formal trousers to casual chinos, find your perfect fit."
          category="bottomwear"
          products={categories.bottomwear}
        />
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="space-y-4">
            <details className="bg-white rounded-lg border">
              <summary className="p-6 cursor-pointer font-semibold flex justify-between items-center hover:bg-gray-50">
                I need help, how do I get in touch?
                <svg className="w-5 h-5 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Reach out to us via Whatsapp on +94 70 140 6060 8.30am - 6.00pm, or email us at support@fabricflow.com.
              </div>
            </details>
            
            <details className="bg-white rounded-lg border">
              <summary className="p-6 cursor-pointer font-semibold flex justify-between items-center hover:bg-gray-50">
                How long will it take to get my orders?
                <svg className="w-5 h-5 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                It depends on where you are. Orders processed here will take 3-5 business days to arrive. Express shipping available for orders over Rs 10,000.
              </div>
            </details>
            
            <details className="bg-white rounded-lg border">
              <summary className="p-6 cursor-pointer font-semibold flex justify-between items-center hover:bg-gray-50">
                I want to return an item I purchased
                <svg className="w-5 h-5 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                <ul className="list-disc list-inside space-y-1">
                  <li>Returns have to be made within 14 days from receiving the order.</li>
                  <li>Product must be unworn and with the original tags.</li>
                  <li>Please contact us with your details, we will arrange a courier to pick up the item.</li>
                  <li>The refund will be made once the product is received and after conducting a quality check.</li>
                </ul>
              </div>
            </details>

          </div>
          
          <div className="text-center mt-8">
            <button 
              onClick={() => navigate('/faq')}
              className="bg-teal-700 text-white px-8 py-3 font-medium hover:bg-teal-800 transition-colors rounded-lg"
            >
              Read all the FAQs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;