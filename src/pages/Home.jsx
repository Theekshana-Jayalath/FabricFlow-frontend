import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

function Home() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero carousel images
  const heroImages = [
    '/src/images/pexels-lribeirofotografia-2112651.jpg',
    '/src/images/pexels-marleneleppanen-1183266.jpg',
    '/src/images/pexels-mart-production-7679454.jpg',
    '/src/images/pexels-olly-3755706.jpg'
  ];

  const features = [
    {
      icon: '🏭',
      title: 'Smart Production',
      description: 'Streamline manufacturing with AI-powered production planning and quality control systems.',
      image: '/src/images/pexels-mart-production-7679454.jpg'
    },
    {
      icon: '📊',
      title: 'Real-time Analytics',
      description: 'Get insights with comprehensive dashboards, reports, and performance metrics.',
      image: '/src/images/a553b66b-6ec5-4f93-b75b-b4e6d6d294c2.jpg'
    },
    {
      icon: '👥',
      title: 'Team Management',
      description: 'Manage your workforce efficiently with role-based access and task assignments.',
      image: '/src/images/pexels-olly-3755706.jpg'
    },
    {
      icon: '🎯',
      title: 'Quality Assurance',
      description: 'Ensure excellence with automated quality checks and compliance monitoring.',
      image: '/src/images/bc299b19-0574-4eb4-b972-af9d03053ca5.jpg'
    }
  ];

  const stats = [
    { number: '500+', label: 'Active Users', icon: '👥' },
    { number: '1M+', label: 'Products Managed', icon: '📦' },
    { number: '99.9%', label: 'Uptime', icon: '⚡' },
    { number: '24/7', label: 'Support', icon: '🛟' }
  ];

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // Redirect based on user role
      switch (user?.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'employee':
          navigate('/employee/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section with Carousel */}
      <section className="relative h-screen flex items-center justify-center text-white overflow-hidden">
        {/* Background Image Carousel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-0"
          >
            <img
              src={heroImages[currentSlide]}
              alt="Fashion Manufacturing"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#005A54]/90 via-[#005A54]/70 to-[#EF6869]/80"></div>
          </motion.div>
        </AnimatePresence>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              TEXTILES ART HAS
              <br />
              <span className="bg-gradient-to-r from-[#FFEED6] to-white bg-clip-text text-transparent">
                VERSATILE FASHION
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
              We're On Our Mission to be the Best Textile Company in NY.
              <br />
              Advanced apparel management system for modern manufacturers.
            </p>
            <motion.button
              onClick={handleGetStarted}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#EF6869] hover:bg-[#EF6869]/90 text-white px-10 py-4 rounded-full font-bold text-lg shadow-2xl transition-all duration-300 transform hover:shadow-3xl"
            >
              DISCOVER MORE →
            </motion.button>
          </motion.div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Production Excellence Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              WE GIVE TOP PRODUCTION
              <br />
              <span className="text-[#005A54]">FROM EVERY ANGLE.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.slice(0, 3).map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-[#EF6869] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Creative Collaboration Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <img
                src="/src/images/pexels-lribeirofotografia-2112651.jpg"
                alt="Fashion Production"
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-[#EF6869] font-bold mb-4 flex items-center">
                <span className="w-12 h-0.5 bg-[#EF6869] mr-4"></span>
                GET INSPIRED
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                LET'S BUILD SOMETHING
                <br />
                <span className="text-[#005A54]">CREATIVE TOGETHER</span>
              </h2>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                We're in this business <strong>Since 2017</strong> and we provide the best service.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-[#005A54] rounded-full flex items-center justify-center mr-4">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">It can be very well produced using fiber, yarn, fashion, or any.</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-[#005A54] rounded-full flex items-center justify-center mr-4">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">It is one of the most extensive forms of manufacturing industry.</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-[#005A54] rounded-full flex items-center justify-center mr-4">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">It might be a Standard or unfinished item, It has its particular use.</span>
                </div>
              </div>

              {/* Experience Badge */}
              <div className="bg-[#005A54] text-white rounded-2xl p-6 inline-block">
                <div className="text-3xl font-bold">25+</div>
                <div className="text-sm opacity-90">Year experience</div>
                <div className="text-sm opacity-90">in Facilities</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-[#005A54]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center text-white"
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-white/80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              QUALITY <span className="text-[#EF6869]">CRAFTSMANSHIP</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From concept to creation, we ensure every piece meets the highest standards of quality and style.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                image: '/src/images/bc299b19-0574-4eb4-b972-af9d03053ca5.jpg',
                title: 'Premium Denim',
                description: 'Expertly crafted with attention to detail'
              },
              {
                image: '/src/images/a553b66b-6ec5-4f93-b75b-b4e6d6d294c2.jpg',
                title: 'Fashion Forward',
                description: 'Trendsetting designs for modern lifestyle'
              },
              {
                image: '/src/images/dd0d5b02-ddf6-4c51-9f98-2d68e55c684d.jpg',
                title: 'Sustainable Materials',
                description: 'Eco-friendly production for a better future'
              }
            ].map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl shadow-lg">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-6 left-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-xl font-bold mb-2">{product.title}</h3>
                    <p className="text-sm">{product.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-20 bg-gradient-to-r from-[#005A54] to-[#EF6869]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join hundreds of apparel manufacturers who trust FabricFlow to streamline their operations and boost productivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={handleGetStarted}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-[#005A54] px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:bg-[#FFEED6] transition-all duration-300"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-[#005A54] transition-all duration-300"
              >
                <Link to="/contact">Contact Sales</Link>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default Home;
