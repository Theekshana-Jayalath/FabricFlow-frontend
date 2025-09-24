import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
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

  const stats = [
    { number: "500+", label: "Happy Clients", icon: "👥" },
    { number: "1000+", label: "Products Delivered", icon: "📦" },
    { number: "50+", label: "Expert Team Members", icon: "👨‍💼" },
    { number: "5+", label: "Years of Excellence", icon: "🏆" }
  ];

  const values = [
    {
      icon: "🎯",
      title: "Quality First",
      description: "We never compromise on quality. Every product is crafted with precision and attention to detail."
    },
    {
      icon: "⚡",
      title: "Innovation",
      description: "Embracing cutting-edge technology to deliver innovative solutions in apparel management."
    },
    {
      icon: "🤝",
      title: "Trust & Reliability",
      description: "Building lasting relationships through transparent communication and reliable service delivery."
    },
    {
      icon: "🌱",
      title: "Sustainability",
      description: "Committed to eco-friendly practices and sustainable fashion for a better tomorrow."
    }
  ];

  const team = [
    {
      name: "Sachintha Deshan",
      role: "CEO & Founder",
      image: "�‍💼",
      description: "Visionary leader with expertise in apparel management solutions"
    },
    {
      name: "Dushantha Viduranga",
      role: "CTO",
      image: "👨‍💻",
      description: "Tech innovator specializing in supply chain solutions"
    },
    {
      name: "Theekshana Jayalath",
      role: "Head of Operations",
      image: "👨‍🏭",
      description: "Operations expert ensuring seamless production flow"
    },
    {
      name: "Pramudi Jayasingha",
      role: "Head of Design",
      image: "👩‍🎨",
      description: "Creative genius with expertise in sustainable fashion"
    },
    {
      name: "Pehasarani Dissanayaka",
      role: "Quality Assurance Manager",
      image: "�‍💼",
      description: "Quality expert ensuring excellence in every product"
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
              About FabricFlow
            </motion.h1>
            <motion.p 
              className="text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed"
              variants={fadeInUp}
            >
              Revolutionizing the apparel industry through innovative management solutions and sustainable practices.
            </motion.p>
            <motion.div 
              className="w-24 h-1 bg-gradient-to-r from-[#005A54] to-[#EF6869] mx-auto rounded-full"
              variants={fadeInUp}
            ></motion.div>
          </div>
        </div>
      </motion.section>

      {/* Our Story Section */}
      <motion.section 
        className="py-20 bg-white"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={stagger}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div variants={fadeInUp}>
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                  Our Story
                </h2>
                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                  <p>
                    Founded in the heart of Colombo, FabricFlow emerged from a simple yet powerful vision: 
                    to transform how the apparel industry manages its operations, from design to delivery.
                  </p>
                  <p>
                    What started as a small team of passionate individuals has grown into a leading 
                    technology company serving hundreds of businesses across the globe. Our journey 
                    has been driven by innovation, sustainability, and an unwavering commitment to excellence.
                  </p>
                  <p>
                    Today, we proudly serve clients from our headquarters in Colombo, Sri Lanka, 
                    combining local expertise with global standards to deliver world-class solutions.
                  </p>
                </div>
              </motion.div>
              <motion.div 
                className="relative"
                variants={fadeInUp}
              >
                <div className="bg-gradient-to-br from-[#005A54] to-[#EF6869] rounded-3xl p-8 text-white">
                  <div className="text-6xl mb-4">🏢</div>
                  <h3 className="text-2xl font-bold mb-4">Headquartered in Colombo</h3>
                  <p className="text-lg opacity-90">
                    Strategically located in the commercial capital of Sri Lanka, 
                    we leverage our position to serve clients across South Asia and beyond.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
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
              Numbers That Speak
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our commitment to excellence is reflected in the trust our clients place in us.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-4xl mb-4">{stat.icon}</div>
                <div className="text-3xl lg:text-4xl font-bold text-[#005A54] mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Values Section */}
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
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do and shape our company culture.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="text-center group"
                variants={fadeInUp}
                whileHover={{ y: -10 }}
              >
                <div className="bg-gradient-to-br from-[#005A54] to-[#EF6869] w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">{value.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Team Section */}
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
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate individuals behind FabricFlow's success.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {member.image}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <div className="text-[#EF6869] font-semibold mb-3">{member.role}</div>
                <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
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
            Ready to Transform Your Business?
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 opacity-90 max-w-3xl mx-auto"
            variants={fadeInUp}
          >
            Join hundreds of businesses that trust FabricFlow for their apparel management needs.
          </motion.p>
          <motion.div 
            className="space-x-4"
            variants={fadeInUp}
          >
            <button className="bg-white text-[#005A54] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300 shadow-lg">
              Get Started Today
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#005A54] transition-colors duration-300">
              Learn More
            </button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default About;
