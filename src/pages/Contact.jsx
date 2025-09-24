import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      message: ''
    });
  };

  const contactInfo = [
    {
      icon: "📍",
      title: "Visit Our Office",
      details: ["123 Colombo Street", "Colombo 03", "Sri Lanka"],
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: "📞",
      title: "Call Us",
      details: ["+94 70 311 9860", "+94 76 573 8311", "+94 78 527 2899"],
      color: "from-green-500 to-green-600"
    },
    {
      icon: "✉️",
      title: "Email Us",
      details: ["sachintahdeshan72@gmail.com", "viduranga@gmail.com"],
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: "⏰",
      title: "Business Hours",
      details: ["Monday - Friday: 9:00 AM - 6:00 PM", "Saturday: 9:00 AM - 2:00 PM", "Sunday: Closed"],
      color: "from-orange-500 to-orange-600"
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
              Contact Us
            </motion.h1>
            <motion.p 
              className="text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed"
              variants={fadeInUp}
            >
              Ready to transform your apparel business? Let's start the conversation.
            </motion.p>
            <motion.div 
              className="w-24 h-1 bg-gradient-to-r from-[#005A54] to-[#EF6869] mx-auto rounded-full"
              variants={fadeInUp}
            ></motion.div>
          </div>
        </div>
      </motion.section>

      {/* Contact Info Cards */}
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
              Get In Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Multiple ways to reach us. Choose what works best for you.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 text-center group"
                variants={fadeInUp}
                whileHover={{ y: -10 }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${info.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-3xl">{info.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{info.title}</h3>
                <div className="space-y-2">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-600 text-sm leading-relaxed">
                      {detail}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Contact Form & Map Section */}
      <motion.section 
        className="py-20 bg-gray-50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={stagger}
      >
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div variants={fadeInUp}>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
                Send Us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005A54] focus:border-transparent transition-colors duration-300"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005A54] focus:border-transparent transition-colors duration-300"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005A54] focus:border-transparent transition-colors duration-300"
                      placeholder="+94 XX XXX XXXX"
                    />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005A54] focus:border-transparent transition-colors duration-300"
                      placeholder="Your company"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005A54] focus:border-transparent transition-colors duration-300"
                    placeholder="Tell us about your project or requirements..."
                  ></textarea>
                </div>
                <motion.button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#005A54] to-[#EF6869] text-white py-4 px-8 rounded-lg font-semibold hover:opacity-90 transition-opacity duration-300 shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Send Message
                </motion.button>
              </form>
            </motion.div>

            {/* Map & Additional Info */}
            <motion.div variants={fadeInUp} className="space-y-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
                  Visit Our Office
                </h2>
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">FabricFlow Headquarters</h3>
                    <div className="space-y-2 text-gray-600">
                      <p className="flex items-center">
                        <span className="w-2 h-2 bg-[#EF6869] rounded-full mr-3"></span>
                        123 Colombo Street, Colombo 03
                      </p>
                      <p className="flex items-center">
                        <span className="w-2 h-2 bg-[#EF6869] rounded-full mr-3"></span>
                        Sri Lanka
                      </p>
                    </div>
                  </div>
                  
                  {/* Map Placeholder */}
                  <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center mb-6">
                    <div className="text-center text-gray-500">
                      <div className="text-4xl mb-2">🗺️</div>
                      <p>Interactive Map</p>
                      <p className="text-sm">Colombo, Sri Lanka</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Public Transport</h4>
                      <p className="text-gray-600">Easily accessible by bus and train from anywhere in Colombo</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Parking</h4>
                      <p className="text-gray-600">Free parking available for visitors</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Questions?</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">How quickly can we get started?</h4>
                    <p className="text-gray-600 text-sm">Most projects can begin within 1-2 weeks of initial consultation.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Do you offer free consultations?</h4>
                    <p className="text-gray-600 text-sm">Yes, we provide free initial consultations to understand your needs.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">What industries do you work with?</h4>
                    <p className="text-gray-600 text-sm">We specialize in all segments of the apparel and fashion industry.</p>
                  </div>
                </div>
              </div>
            </motion.div>
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
            Ready to Transform Your Business?
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 opacity-90 max-w-3xl mx-auto"
            variants={fadeInUp}
          >
            Join hundreds of satisfied clients who have revolutionized their apparel operations with FabricFlow.
          </motion.p>
          <motion.div 
            className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            variants={fadeInUp}
          >
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="opacity-90">Happy Clients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="opacity-90">Support Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">99%</div>
              <div className="opacity-90">Client Satisfaction</div>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Contact;
