import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-[#EF6869] mb-4">FabricFlow</h3>
              <p className="text-gray-300 leading-relaxed">
                Leading the textile industry with innovative solutions, quality craftsmanship, 
                and sustainable practices. Your trusted partner in fabric manufacturing.
              </p>
            </div>
            
            {/* Social Media */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="w-10 h-10 bg-[#005A54] rounded-full flex items-center justify-center hover:bg-[#EF6869] transition-colors duration-300 text-sm font-bold"
                >
                  f
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-[#005A54] rounded-full flex items-center justify-center hover:bg-[#EF6869] transition-colors duration-300 text-sm font-bold"
                >
                  t
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-[#005A54] rounded-full flex items-center justify-center hover:bg-[#EF6869] transition-colors duration-300 text-sm font-bold"
                >
                  i
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-[#005A54] rounded-full flex items-center justify-center hover:bg-[#EF6869] transition-colors duration-300 text-sm font-bold"
                >
                  in
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-300 hover:text-[#EF6869] transition-colors duration-300 flex items-center"
                >
                  → Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-300 hover:text-[#EF6869] transition-colors duration-300"
                >
                  → About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/services" 
                  className="text-gray-300 hover:text-[#EF6869] transition-colors duration-300"
                >
                  → Our Services
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-300 hover:text-[#EF6869] transition-colors duration-300"
                >
                  → Contact
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className="text-gray-300 hover:text-[#EF6869] transition-colors duration-300"
                >
                  → Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Our Services</h4>
            <ul className="space-y-3">
              <li className="text-gray-300 flex items-center">
                <span className="w-2 h-2 bg-[#EF6869] rounded-full mr-3"></span>
                Textile Manufacturing
              </li>
              <li className="text-gray-300 flex items-center">
                <span className="w-2 h-2 bg-[#EF6869] rounded-full mr-3"></span>
                Quality Control
              </li>
              <li className="text-gray-300 flex items-center">
                <span className="w-2 h-2 bg-[#EF6869] rounded-full mr-3"></span>
                Custom Fabric Design
              </li>
              <li className="text-gray-300 flex items-center">
                <span className="w-2 h-2 bg-[#EF6869] rounded-full mr-3"></span>
                Supply Chain Management
              </li>
              <li className="text-gray-300 flex items-center">
                <span className="w-2 h-2 bg-[#EF6869] rounded-full mr-3"></span>
                Sustainable Production
              </li>
              <li className="text-gray-300 flex items-center">
                <span className="w-2 h-2 bg-[#EF6869] rounded-full mr-3"></span>
                Export Services
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-[#EF6869] rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                  <span className="text-xs font-bold">📍</span>
                </div>
                <div>
                  <p className="text-gray-300">
                    123 Textile Boulevard<br />
                    Industrial District<br />
                    Colombo 00100, Sri Lanka
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-[#EF6869] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold">📞</span>
                </div>
                <p className="text-gray-300">+94 11 234 5678</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-[#EF6869] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold">✉</span>
                </div>
                <p className="text-gray-300">info@fabricflow.lk</p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-[#EF6869] rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                  <span className="text-xs font-bold">🕒</span>
                </div>
                <div>
                  <p className="text-gray-300">Mon - Fri: 8:00 AM - 6:00 PM</p>
                  <p className="text-gray-300">Sat: 9:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 FabricFlow. All rights reserved. | Designed with care for the textile industry.
            </div>
            
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-[#EF6869] transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-[#EF6869] transition-colors duration-300">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-[#EF6869] transition-colors duration-300">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
