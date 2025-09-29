import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaSearch, FaTimes, FaStar, FaHeart, FaEye } from "react-icons/fa";

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
                    className="group cursor-pointer transform transition-all duration-500 hover:scale-105"
                  >
                    {/* Enhanced Product Card */}
                    <div className="relative h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 mb-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200/50">
                      {/* Product Badge */}
                      {product.sale && (
                        <div className="absolute top-4 left-4 z-20">
                          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                            SALE
                          </span>
                        </div>
                      )}

                      {/* Hover Action Buttons */}
                      <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <div className="flex flex-col gap-2">
                          <button className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                            <FaHeart className="w-4 h-4" />
                          </button>
                          <button className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                            <FaEye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Product Image with Enhanced Styling */}
                      <div className="relative h-full overflow-hidden">
                        <img 
                          src={product.image}
                          alt={`${product.name} - ${product.color}`}
                          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                          onLoad={(e) => {
                            e.target.nextElementSibling.style.display = 'none';
                          }}
                        />

                        {/* Enhanced Fallback placeholder */}
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <div className="w-32 h-40 bg-white bg-opacity-60 rounded-xl flex items-center justify-center backdrop-blur-sm border border-gray-300/30">
                            <div className="text-center">
                              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <span className="text-gray-600 font-medium text-sm">{product.category}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                        
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      </div>
                    </div>

                    {/* Enhanced Product Info */}
                    <div className="space-y-3 px-2">
                      {/* Category Tag */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-gradient-to-r from-teal-100 to-blue-100 text-teal-700 px-3 py-1 rounded-full font-medium">
                          {product.category}
                        </span>
                        <div className="flex items-center space-x-1 text-yellow-400">
                          <FaStar className="w-3 h-3 fill-current" />
                          <FaStar className="w-3 h-3 fill-current" />
                          <FaStar className="w-3 h-3 fill-current" />
                          <FaStar className="w-3 h-3 fill-current" />
                          <FaStar className="w-3 h-3 fill-current" />
                          <span className="text-xs text-gray-500 ml-1">(4.8)</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-teal-600 transition-colors duration-300">
                        {product.name}
                      </h3>
                      
                      <p className="text-gray-600 font-medium">{product.color}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {product.sale ? (
                            <>
                              <span className="text-xl font-bold text-red-600">
                                Rs {product.price.toLocaleString()}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                Rs {product.originalPrice.toLocaleString()}
                              </span>
                            </>
                          ) : (
                            <span className="text-xl font-bold text-gray-900">
                              Rs {product.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        
                        {/* Add to Cart Button */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle add to cart
                          }}
                          className="opacity-0 group-hover:opacity-100 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-lg hover:shadow-xl"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Navigation Arrows */}
          {categories[category].length > 3 && (
            <>
              <button
                onClick={() => prevSlide(category)}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white/95 hover:bg-white backdrop-blur-sm text-gray-700 hover:text-teal-600 p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200/50 hover:border-teal-200 z-10 group"
              >
                <FaChevronLeft className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              </button>
              
              <button
                onClick={() => nextSlide(category)}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white/95 hover:bg-white backdrop-blur-sm text-gray-700 hover:text-teal-600 p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200/50 hover:border-teal-200 z-10 group"
              >
                <FaChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Enhanced Professional Design */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 text-white py-24 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-20 right-0 w-96 h-96 bg-slate-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        {/* Geometric Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Enhanced Search Icon with Backdrop */}
          <div className="absolute top-6 right-6">
            <button
              onClick={openSearchPanel}
              className="group relative bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-2xl transition-all duration-500 border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FaSearch className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Logo Section */}
          <div className="mb-8 animate-fade-in-up">
            <img 
              src="/images/fabricflow-logo-white.png" 
              alt="FabricFlow" 
              className="mx-auto mb-6 h-20 filter drop-shadow-lg"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'block';
              }}
            />
            <div className="text-5xl font-bold mb-4 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-teal-200" style={{ display: 'none' }}>
              FABRICFLOW
            </div>
          </div>

          {/* Main Heading with Animation */}
          <div className="mb-8 animate-fade-in-up animation-delay-300">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
              <span className="inline-block animate-float">REIMAGINE</span>
              <br />
              <span className="inline-block animate-float animation-delay-500 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-blue-300 to-purple-300">
                STYLE
              </span>
            </h1>
          </div>

          {/* Subtitle with Enhanced Typography */}
          <div className="animate-fade-in-up animation-delay-600 mb-8">
            <p className="text-xl md:text-3xl mb-6 text-slate-200 max-w-4xl mx-auto font-light leading-relaxed">
              Crafted for the Modern Man, Inspired by Heritage
            </p>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Celebrate our transformation with collections that redefine fashion—crafted for today, inspired by our heritage.
            </p>
          </div>

          {/* Call to Action Buttons */}
          <div className="animate-fade-in-up animation-delay-900 flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
            <button 
              onClick={() => navigate('/products')}
              className="group relative bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            >
              <span className="relative z-10">Explore Collection</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <button 
              onClick={() => navigate('/about')}
              className="group relative bg-transparent border-2 border-white/30 hover:border-white/60 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 backdrop-blur-sm hover:bg-white/10"
            >
              <span className="relative z-10">Our Story</span>
            </button>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search Panel (Right Sidebar) */}
      {isSearchPanelOpen && (
        <>
          {/* Enhanced Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={closeSearchPanel}
          ></div>
          
          {/* Enhanced Search Panel */}
          <div className="fixed right-0 top-0 h-full w-96 bg-white/95 backdrop-blur-xl shadow-2xl z-50 transform transition-all duration-500 ease-out border-l border-gray-200/50">
            <div className="flex flex-col h-full">
              {/* Enhanced Panel Header */}
              <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                    Search Products
                  </h2>
                  <button
                    onClick={closeSearchPanel}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all duration-300"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Enhanced Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, color, category..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full px-4 py-4 pl-12 pr-4 text-gray-900 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 shadow-lg transition-all duration-300"
                    autoFocus
                  />
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  {searchQuery && (
                    <button
                      onClick={() => handleSearch("")}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Enhanced Search Results */}
              <div className="flex-1 overflow-y-auto p-4">
                {searchQuery.trim() === "" ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-teal-100 to-blue-100 rounded-full flex items-center justify-center">
                      <FaSearch className="w-8 h-8 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Start Your Search</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Type to search through our premium collection of shirts and bottomwear
                    </p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-6 opacity-50">🔍</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-3">No products found</h3>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                      Try different keywords or browse our categories to find what you're looking for
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-gray-700 bg-gradient-to-r from-teal-50 to-blue-50 px-4 py-2 rounded-lg border border-teal-100">
                        {searchResults.length} product{searchResults.length !== 1 ? 's' : ''} found
                      </p>
                    </div>
                    
                    {searchResults.map((product, index) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="flex items-center p-4 bg-gradient-to-r from-gray-50/50 to-white/50 hover:from-teal-50/50 hover:to-blue-50/50 backdrop-blur-sm rounded-2xl cursor-pointer transition-all duration-300 border border-gray-200/50 hover:border-teal-200/50 shadow-sm hover:shadow-lg transform hover:scale-102"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Enhanced Product Image */}
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 mr-4 shadow-lg">
                          <img 
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-teal-100 to-blue-100" style={{ display: 'none' }}>
                            <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>

                        {/* Enhanced Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 px-3 py-1 rounded-full font-medium">
                              ID: {product.id}
                            </span>
                            <span className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-1 rounded-full font-medium">
                              {product.category}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-900 text-sm leading-tight truncate mb-1">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-600 mb-2 font-medium">{product.color}</p>
                          <div className="flex items-center justify-between">
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
                            <div className="flex items-center space-x-1 text-yellow-400">
                              <FaStar className="w-3 h-3 fill-current" />
                              <span className="text-xs text-gray-500">(4.8)</span>
                            </div>
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

      {/* Enhanced FAQ Section */}
      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 animate-fade-in-up animation-delay-300">
              Everything you need to know about our products and services
            </p>
          </div>
          
          <div className="space-y-6">
            <details className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <summary className="p-8 cursor-pointer font-semibold flex justify-between items-center hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-blue-50/50 transition-all duration-300">
                <span className="text-lg text-gray-900">I need help, how do I get in touch?</span>
                <svg className="w-6 h-6 transform transition-transform group-open:rotate-180 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-8 pb-8 text-gray-600 leading-relaxed">
                Reach out to us via Whatsapp on <span className="font-semibold text-teal-600">+94 70 140 6060</span> between 8.30am - 6.00pm, 
                or email us at <span className="font-semibold text-teal-600">support@fabricflow.com</span> for any assistance.
              </div>
            </details>
            
            <details className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <summary className="p-8 cursor-pointer font-semibold flex justify-between items-center hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-blue-50/50 transition-all duration-300">
                <span className="text-lg text-gray-900">How long will it take to get my orders?</span>
                <svg className="w-6 h-6 transform transition-transform group-open:rotate-180 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-8 pb-8 text-gray-600 leading-relaxed">
                <p className="mb-3">Delivery times depend on your location:</p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mr-3"></span>
                    <span><strong>Standard Delivery:</strong> 3-5 business days</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <span><strong>Express Shipping:</strong> Available for orders over Rs 10,000</span>
                  </li>
                </ul>
              </div>
            </details>
            
            <details className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <summary className="p-8 cursor-pointer font-semibold flex justify-between items-center hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-blue-50/50 transition-all duration-300">
                <span className="text-lg text-gray-900">I want to return an item I purchased</span>
                <svg className="w-6 h-6 transform transition-transform group-open:rotate-180 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-8 pb-8 text-gray-600 leading-relaxed">
                <p className="mb-4">Our return policy ensures your satisfaction:</p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mr-3 mt-2"></span>
                    <span>Returns must be made within <strong>14 days</strong> from receiving the order</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></span>
                    <span>Product must be <strong>unworn</strong> and with the <strong>original tags</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2"></span>
                    <span>Contact us with your details - we'll arrange courier pickup</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></span>
                    <span>Refund processed after quality check completion</span>
                  </li>
                </ul>
              </div>
            </details>
          </div>
          
          <div className="text-center mt-12">
            <button 
              onClick={() => navigate('/faq')}
              className="group relative bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-10 py-4 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
            >
              <span className="relative z-10">Read All FAQs</span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }

        .animation-delay-500 {
          animation-delay: 500ms;
        }

        .animation-delay-600 {
          animation-delay: 600ms;
        }

        .animation-delay-900 {
          animation-delay: 900ms;
        }

        .animation-delay-2000 {
          animation-delay: 2000ms;
        }

        .animation-delay-4000 {
          animation-delay: 4000ms;
        }

        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }

        /* Fix cursor blinking issues */
        * {
          cursor: inherit;
        }

        .cursor-pointer {
          cursor: pointer !important;
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Enhanced backdrop blur support */
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        .backdrop-blur-xl {
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
      `}</style>
    </div>
  );
};

export default ProductCatalog;