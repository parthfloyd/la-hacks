'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Tilt } from 'react-tilt';
import AOS from 'aos';
import Slider from 'react-slick';
import { MdHealthAndSafety, MdOutlineMonitorHeart, MdOutlineAssignment, MdOutlineWarning, 
  MdArrowForward, MdCheckCircle, MdPerson, MdOutlineHealthAndSafety } from 'react-icons/md';
import { FaRobot, FaHeartbeat, FaBrain, FaUserMd, FaHospital, FaClipboardList, 
  FaStethoscope, FaUserNurse, FaShieldAlt } from 'react-icons/fa';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const TiltOptions = {
  max: 15,
  scale: 1.05,
  speed: 1000,
  glare: true,
  "max-glare": 0.3
};

const LandingPage = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const testimonialSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBF5F9] to-[#F1F7FA] overflow-hidden">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 bg-health-pattern opacity-20 pointer-events-none"></div>
      
      {/* Hero Section */}
      <header className="relative bg-gradient-to-r from-primary-dark via-primary to-secondary overflow-hidden">
        {/* Abstract wave shape */}
        <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 0L48 8.53333C96 17.0667 192 34.1333 288 45.3333C384 56.5333 480 62.1333 576 59.7333C672 56.5333 768 45.3333 864 51.7333C960 59.7333 1056 85.3333 1152 90.9333C1248 96.5333 1344 82.1333 1392 73.6L1440 65.0667V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V0Z" fill="#F8FBFD"/>
          </svg>
        </div>
        
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-24 relative z-10">
          <nav className="flex justify-between items-center mb-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <MdHealthAndSafety className="text-2xl text-primary" />
              </div>
              <span className="text-xl font-bold text-white">HealthGuardian AI</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="hidden md:flex items-center gap-6"
            >
              <a href="#features" className="text-white hover:text-secondary-light transition-all">Features</a>
              <a href="#how-it-works" className="text-white hover:text-secondary-light transition-all">How It Works</a>
              <a href="#testimonials" className="text-white hover:text-secondary-light transition-all">Testimonials</a>
              <Link 
                href="/chat" 
                className="px-4 py-2 rounded-full bg-white text-primary font-medium hover:bg-opacity-90 transition-all shadow-md"
              >
                Get Started
              </Link>
            </motion.div>
          </nav>
          
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="md:w-1/2"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white leading-tight">
                Your Personal <span className="text-accent">AI Doctor</span> Assistant
              </h1>
              <p className="text-lg md:text-xl mb-8 text-blue-50 opacity-90">
                Advanced healthcare guidance powered by artificial intelligence that understands your needs and provides personalized medical advice when you need it most.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/chat" 
                  className="px-6 py-3 rounded-full bg-white text-primary font-semibold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg group"
                >
                  Start Consultation 
                  <MdArrowForward className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="px-6 py-3 rounded-full border-2 border-white text-white font-semibold hover:bg-white hover:bg-opacity-10 transition-all flex items-center justify-center gap-2">
                  Learn More
                </button>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="md:w-1/2 flex justify-center"
            >
              <div className="relative w-72 h-72 md:w-96 md:h-96">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-secondary-light to-primary-light opacity-20"></div>
                <motion.div 
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.4, 0.7, 0.4]
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="absolute inset-4 rounded-full bg-gradient-to-tr from-secondary to-primary opacity-40"
                >
                </motion.div>
                <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <div className="relative w-32 h-32">
                    <Image 
                      src="/images/brain-tech.svg" 
                      alt="AI Healthcare" 
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Trusted badges */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mt-16 pt-8 border-t border-white border-opacity-20"
          >
            <p className="text-center text-white text-opacity-70 mb-6 text-sm font-medium">TRUSTED BY HEALTHCARE PROVIDERS</p>
            <div className="flex flex-wrap justify-center gap-8 items-center">
              <motion.div variants={fadeIn} className="flex items-center gap-2 text-white">
                <FaHospital className="text-2xl" />
                <span className="font-medium">MedCare</span>
              </motion.div>
              <motion.div variants={fadeIn} className="flex items-center gap-2 text-white">
                <FaStethoscope className="text-2xl" />
                <span className="font-medium">HealthPlus</span>
              </motion.div>
              <motion.div variants={fadeIn} className="flex items-center gap-2 text-white">
                <FaShieldAlt className="text-2xl" />
                <span className="font-medium">CareShield</span>
              </motion.div>
              <motion.div variants={fadeIn} className="flex items-center gap-2 text-white">
                <FaUserNurse className="text-2xl" />
                <span className="font-medium">NurseCare</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Key Features Section */}
      <section id="features" className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-primary-dark mb-4">Advanced Healthcare Features</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our AI-powered healthcare platform offers intelligent assistance with cutting-edge capabilities tailored for your well-being.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Tilt options={TiltOptions} className="h-full">
              <div className="h-full bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-secondary-light border-opacity-20 glass glow" data-aos="fade-up" data-aos-delay="100">
                <div className="bg-danger bg-opacity-10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <MdOutlineWarning className="text-3xl text-danger" />
                </div>
                <h3 className="text-xl font-bold text-primary-dark mb-3">Emergency Detection</h3>
                <p className="text-gray-600 mb-4">
                  Our AI system detects potential danger signs in your symptoms and can escalate to emergency services when necessary.
                </p>
                <ul className="text-gray-600">
                  <motion.li 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-2 mb-2"
                  >
                    <MdCheckCircle className="text-success" />
                    <span>Immediate risk assessment</span>
                  </motion.li>
                  <motion.li 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 mb-2"
                  >
                    <MdCheckCircle className="text-success" />
                    <span>Emergency recommendations</span>
                  </motion.li>
                  <motion.li 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2"
                  >
                    <MdCheckCircle className="text-success" />
                    <span>Priority escalation protocols</span>
                  </motion.li>
                </ul>
              </div>
            </Tilt>

            {/* Feature 2 */}
            <Tilt options={TiltOptions} className="h-full">
              <div className="h-full bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-secondary-light border-opacity-20 glass glow" data-aos="fade-up" data-aos-delay="200">
                <div className="bg-info bg-opacity-10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <MdPerson className="text-3xl text-info" />
                </div>
                <h3 className="text-xl font-bold text-primary-dark mb-3">Personalized Health Profile</h3>
                <p className="text-gray-600 mb-4">
                  We maintain your health profile to provide personalized advice without asking repetitive questions.
                </p>
                <ul className="text-gray-600">
                  <motion.li 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-2 mb-2"
                  >
                    <MdCheckCircle className="text-success" />
                    <span>Medical history tracking</span>
                  </motion.li>
                  <motion.li 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 mb-2"
                  >
                    <MdCheckCircle className="text-success" />
                    <span>Personalized recommendations</span>
                  </motion.li>
                  <motion.li 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2"
                  >
                    <MdCheckCircle className="text-success" />
                    <span>Continuous learning from interactions</span>
                  </motion.li>
                </ul>
              </div>
            </Tilt>

            {/* Feature 3 */}
            <Tilt options={TiltOptions} className="h-full">
              <div className="h-full bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-secondary-light border-opacity-20 glass glow" data-aos="fade-up" data-aos-delay="300">
                <div className="bg-secondary bg-opacity-10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <MdOutlineAssignment className="text-3xl text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-primary-dark mb-3">Consultation Reports</h3>
                <p className="text-gray-600 mb-4">
                  After each consultation, receive a comprehensive report that you can share with your healthcare provider.
                </p>
                <ul className="text-gray-600">
                  <motion.li 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-2 mb-2"
                  >
                    <MdCheckCircle className="text-success" />
                    <span>Detailed consultation summary</span>
                  </motion.li>
                  <motion.li 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 mb-2"
                  >
                    <MdCheckCircle className="text-success" />
                    <span>Recommended next steps</span>
                  </motion.li>
                  <motion.li 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2"
                  >
                    <MdCheckCircle className="text-success" />
                    <span>Sharable PDF format</span>
                  </motion.li>
                </ul>
              </div>
            </Tilt>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-primary-dark mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Experience healthcare reimagined with our simple three-step process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center" data-aos="fade-up" data-aos-delay="100">
              <div className="bg-primary-light bg-opacity-10 w-24 h-24 rounded-full flex items-center justify-center mb-6 relative shadow-md">
                <div className="absolute -right-3 top-0 bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg">1</div>
                <motion.div
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  className="text-primary"
                >
                  <FaUserMd className="text-4xl" />
                </motion.div>
              </div>
              <h3 className="text-xl font-bold text-primary-dark mb-3">Start a Consultation</h3>
              <p className="text-gray-600">
                Begin a conversation with our AI Doctor by describing your symptoms or health concerns in detail.
              </p>
            </div>

            <div className="flex flex-col items-center text-center" data-aos="fade-up" data-aos-delay="200">
              <div className="bg-primary-light bg-opacity-10 w-24 h-24 rounded-full flex items-center justify-center mb-6 relative shadow-md">
                <div className="absolute -right-3 top-0 bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg">2</div>
                <motion.div
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  className="text-primary"
                >
                  <FaBrain className="text-4xl" />
                </motion.div>
              </div>
              <h3 className="text-xl font-bold text-primary-dark mb-3">AI Analysis</h3>
              <p className="text-gray-600">
                Our advanced AI analyzes your information, asks relevant follow-up questions, and evaluates your condition.
              </p>
            </div>

            <div className="flex flex-col items-center text-center" data-aos="fade-up" data-aos-delay="300">
              <div className="bg-primary-light bg-opacity-10 w-24 h-24 rounded-full flex items-center justify-center mb-6 relative shadow-md">
                <div className="absolute -right-3 top-0 bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg">3</div>
                <motion.div
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  className="text-primary"
                >
                  <FaClipboardList className="text-4xl" />
                </motion.div>
              </div>
              <h3 className="text-xl font-bold text-primary-dark mb-3">Get Recommendations</h3>
              <p className="text-gray-600">
                Receive personalized health recommendations, suggested next steps, and a comprehensive consultation report.
              </p>
            </div>
          </div>
          
          <div className="mt-16 text-center" data-aos="fade-up" data-aos-delay="400">
            <Link 
              href="/chat" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full shadow-lg hover:shadow-xl transition-all font-semibold text-lg group"
            >
              Try It Now
              <MdArrowForward className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary-light opacity-5"></div>
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-secondary-light opacity-5"></div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6 bg-gradient-to-br from-[#EBF5F9] to-[#F1F7FA]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-primary-dark mb-4">Patient Success Stories</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover how our AI Doctor has helped people improve their healthcare experience
            </p>
          </div>

          <div className="max-w-3xl mx-auto" data-aos="fade-up">
            <Slider {...testimonialSettings}>
              <div className="p-4">
                <div className="bg-white p-8 rounded-2xl shadow-md glass relative">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white">
                    <span className="text-xl font-bold">"</span>
                  </div>
                  <div className="flex items-center gap-4 mb-6 mt-4">
                    <div className="w-16 h-16 rounded-full bg-primary-light bg-opacity-20 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">SM</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-primary-dark">Sarah Mitchell</h4>
                      <p className="text-gray-500">Mother of two, 34</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 italic">
                    "As a busy mom, I don't always have time to visit the doctor for minor concerns. HealthGuardian AI has been a lifesaver, providing reliable advice for my children's common health issues and helping me decide when we actually need to see a doctor."
                  </p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaHeartbeat key={i} className="text-accent" />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="bg-white p-8 rounded-2xl shadow-md glass relative">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white">
                    <span className="text-xl font-bold">"</span>
                  </div>
                  <div className="flex items-center gap-4 mb-6 mt-4">
                    <div className="w-16 h-16 rounded-full bg-primary-light bg-opacity-20 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">JT</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-primary-dark">James Thompson</h4>
                      <p className="text-gray-500">Chronic condition patient, 47</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 italic">
                    "Living with a chronic condition means I have lots of questions between doctor visits. The AI provides thoughtful answers that align with what my specialists recommend, and the consultation reports help me communicate better with my healthcare team."
                  </p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaHeartbeat key={i} className="text-accent" />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="bg-white p-8 rounded-2xl shadow-md glass relative">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white">
                    <span className="text-xl font-bold">"</span>
                  </div>
                  <div className="flex items-center gap-4 mb-6 mt-4">
                    <div className="w-16 h-16 rounded-full bg-primary-light bg-opacity-20 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">EL</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-primary-dark">Dr. Emily Liu</h4>
                      <p className="text-gray-500">Family Physician</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 italic">
                    "As a doctor, I appreciate how this tool helps patients come to appointments better informed. The AI gives medically sound advice and knows when to refer patients for professional care. It's becoming a valuable complement to traditional healthcare."
                  </p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaHeartbeat key={i} className="text-accent" />
                    ))}
                  </div>
                </div>
              </div>
            </Slider>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary-dark via-primary to-secondary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Experience the Future of Healthcare?</h2>
            <p className="text-xl mb-8 opacity-90">
              Start your first consultation today and discover how AI can help you manage your health more effectively.
            </p>
            
            <Link 
              href="/chat" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-full shadow-lg hover:shadow-xl transition-all font-semibold text-lg group"
            >
              Start Your Consultation
              <MdArrowForward className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-dark text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <MdHealthAndSafety className="text-2xl text-primary" />
              </div>
              <span className="text-xl font-bold">HealthGuardian AI</span>
            </div>
            
            <div className="flex flex-wrap gap-8 justify-center">
              <a href="#features" className="hover:text-secondary-light transition-all">Features</a>
              <a href="#how-it-works" className="hover:text-secondary-light transition-all">How It Works</a>
              <a href="#testimonials" className="hover:text-secondary-light transition-all">Testimonials</a>
              <Link href="/chat" className="hover:text-secondary-light transition-all">Chat</Link>
            </div>
          </div>
          
          <div className="border-t border-white border-opacity-20 pt-8 text-center text-sm text-white text-opacity-70">
            <p>© {new Date().getFullYear()} HealthGuardian AI. All rights reserved.</p>
            <p className="mt-2">This is a demo application. Not intended for real medical use.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
