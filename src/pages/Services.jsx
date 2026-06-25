import React from 'react';
import { motion } from 'framer-motion';

const Services = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const services = [
    {
      icon: "🏭",
      title: "Production Management",
      description: "Streamline your entire production process from design to finished goods with our comprehensive management system.",
      features: ["Real-time tracking", "Quality control", "Resource optimization", "Timeline management"]
    },
    {
      icon: "📦",
      title: "Inventory Control",
      description: "Advanced inventory management with automated tracking, alerts, and optimization for maximum efficiency.",
      features: ["Stock monitoring", "Automated alerts", "Supplier management", "Cost optimization"]
    },
    {
      icon: "🎨",
      title: "Design & Development",
      description: "From concept to creation, manage your design workflow with collaborative tools and version control.",
      features: ["Design collaboration", "Version control", "Approval workflows", "Asset management"]
    },
    {
      icon: "📊",
      title: "Analytics & Reporting",
      description: "Make data-driven decisions with comprehensive analytics and customizable reporting dashboards.",
      features: ["Real-time analytics", "Custom reports", "Performance metrics", "Trend analysis"]
    },
    {
      icon: "🚚",
      title: "Supply Chain Management",
      description: "Optimize your supply chain with end-to-end visibility and automated coordination.",
      features: ["Supplier network", "Logistics tracking", "Cost analysis", "Risk management"]
    },
    {
      icon: "🛡️",
      title: "Quality Assurance",
      description: "Ensure product quality with comprehensive QA processes and automated compliance checking.",
      features: ["Quality standards", "Inspection workflows", "Compliance tracking", "Issue resolution"]
    }
  ];

  const processes = [
    {
      step: "01",
      title: "Consultation",
      description: "We analyze your current processes and identify optimization opportunities."
    },
    {
      step: "02",
      title: "Custom Solution",
      description: "Develop a tailored solution that fits your specific business requirements."
    },
    {
      step: "03",
      title: "Implementation",
      description: "Seamless deployment with minimal disruption to your operations."
    },
    {
      step: "04",
      title: "Training & Support",
      description: "Comprehensive training and ongoing support to ensure success."
    }
  ];

  const benefits = [
    {
      icon: "⚡",
      title: "Increased Efficiency",
      description: "Streamline operations and reduce manual processes by up to 60%"
    },
    {
      icon: "💰",
      title: "Cost Reduction",
      description: "Optimize resources and reduce operational costs by 30-40%"
    },
    {
      icon: "📈",
      title: "Scalable Growth",
      description: "Scale your operations effortlessly as your business grows"
    },
    {
      icon: "🎯",
      title: "Better Quality",
      description: "Improve product quality and reduce defects significantly"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <motion.section 
        className="relative py-20 lg:py-32 overflow-hidden"
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#005A54] to-[#EF6869] opacity-10"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-[#005A54] to-[#EF6869] bg-clip-text text-transparent"
              variants={fadeInUp}
            >
              Our Services
            </motion.h1>
            <motion.p 
              className="text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed"
              variants={fadeInUp}
            >
              Comprehensive apparel management solutions designed to transform your business operations.
            </motion.p>
            <motion.div 
              className="w-24 h-1 bg-gradient-to-r from-[#005A54] to-[#EF6869] mx-auto rounded-full"
              variants={fadeInUp}
            ></motion.div>
          </div>
        </div>
      </motion.section>

      {/* Services Grid */}
      <motion.section 
        className="py-20 bg-white"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={stagger}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              What We Offer
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              End-to-end solutions tailored for the modern apparel industry.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 group"
                variants={fadeInUp}
                whileHover={{ y: -10 }}
              >
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-500">
                      <span className="w-2 h-2 bg-[#EF6869] rounded-full mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Process Section */}
      <motion.section 
        className="py-20 bg-gray-50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={stagger}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Our Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A proven methodology that ensures successful implementation and results.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processes.map((process, index) => (
              <motion.div
                key={index}
                className="text-center"
                variants={fadeInUp}
              >
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#005A54] to-[#EF6869] rounded-full flex items-center justify-center mx-auto text-white font-bold text-xl">
                    {process.step}
                  </div>
                  {index < processes.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gray-300 transform -translate-y-0.5"></div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{process.title}</h3>
                <p className="text-gray-600 leading-relaxed">{process.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section 
        className="py-20 bg-white"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={stagger}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Why Choose Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the transformation that comes with our comprehensive solutions.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="text-center group"
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#005A54] to-[#EF6869] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">{benefit.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Industries Section */}
      <motion.section 
        className="py-20 bg-gray-50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={stagger}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Industries We Serve
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Specialized solutions for various segments of the apparel industry.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { icon: "👕", name: "Fashion Brands" },
              { icon: "🏭", name: "Manufacturers" },
              { icon: "🛍️", name: "Retailers" },
              { icon: "🎽", name: "Sportswear" },
              { icon: "👔", name: "Formal Wear" },
              { icon: "👶", name: "Kids Clothing" }
            ].map((industry, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow duration-300"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <div className="text-4xl mb-4">{industry.icon}</div>
                <h3 className="font-semibold text-gray-900">{industry.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 bg-gradient-to-r from-[#005A54] to-[#EF6869] text-white"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={stagger}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            className="text-4xl lg:text-5xl font-bold mb-6"
            variants={fadeInUp}
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 opacity-90 max-w-3xl mx-auto"
            variants={fadeInUp}
          >
            Let's discuss how our services can transform your apparel business operations.
          </motion.p>
          <motion.div 
            className="space-x-4"
            variants={fadeInUp}
          >
            <button className="bg-white text-[#005A54] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300 shadow-lg">
              Request Quote
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#005A54] transition-colors duration-300">
              Schedule Demo
            </button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Services;
