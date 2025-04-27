'use client';

import React from 'react';
import Link from 'next/link';
import { MdHealthAndSafety, MdOutlineMonitorHeart, MdOutlineAssignment, MdOutlineWarning, MdArrowForward, MdCheckCircle, MdPerson } from 'react-icons/md';
import { FaRobot, FaHeartbeat, FaBrain, FaUserMd, FaHospital, FaClipboardList } from 'react-icons/fa';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-teal-600 to-blue-500 text-white">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
          <nav className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <MdHealthAndSafety className="text-3xl" />
              <span className="text-xl font-bold">HealthGuardian AI</span>
            </div>
          </nav>
          
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Your Personal AI Doctor</h1>
              <p className="text-lg md:text-xl mb-6 text-blue-50">
                Advanced healthcare assistance powered by AI that understands your needs and provides personalized medical guidance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/chat" 
                  className="px-6 py-3 rounded-full bg-white text-teal-600 font-semibold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg">
                  Start Consultation <MdArrowForward />
                </Link>
                <button className="px-6 py-3 rounded-full border-2 border-white text-white font-semibold hover:bg-white hover:bg-opacity-10 transition-all flex items-center justify-center gap-2">
                  Learn More
                </button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-72 h-72 md:w-96 md:h-96">
                <div className="absolute inset-0 bg-teal-500 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute inset-4 bg-teal-400 rounded-full opacity-40 animate-pulse animation-delay-700"></div>
                <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center">
                  <FaRobot className="text-teal-600 text-8xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Key Features Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Key Features</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our AI-powered healthcare platform offers intelligent assistance with advanced capabilities for your health needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-teal-100">
              <div className="bg-red-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <MdOutlineWarning className="text-3xl text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Emergency Detection</h3>
              <p className="text-gray-600 mb-4">
                Our AI system detects potential danger signs in your symptoms and can escalate to emergency services or recommend immediate doctor consultation when necessary.
              </p>
              <ul className="text-gray-600">
                <li className="flex items-center gap-2 mb-2">
                  <MdCheckCircle className="text-green-500" />
                  <span>Immediate risk assessment</span>
                </li>
                <li className="flex items-center gap-2 mb-2">
                  <MdCheckCircle className="text-green-500" />
                  <span>Emergency recommendations</span>
                </li>
                <li className="flex items-center gap-2">
                  <MdCheckCircle className="text-green-500" />
                  <span>Priority escalation protocols</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-teal-100">
              <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <MdPerson className="text-3xl text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Personalized Health Profile</h3>
              <p className="text-gray-600 mb-4">
                We maintain your health profile to provide personalized advice without asking repetitive questions, creating a seamless experience on every visit.
              </p>
              <ul className="text-gray-600">
                <li className="flex items-center gap-2 mb-2">
                  <MdCheckCircle className="text-green-500" />
                  <span>Medical history tracking</span>
                </li>
                <li className="flex items-center gap-2 mb-2">
                  <MdCheckCircle className="text-green-500" />
                  <span>Personalized recommendations</span>
                </li>
                <li className="flex items-center gap-2">
                  <MdCheckCircle className="text-green-500" />
                  <span>Continuous learning from interactions</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-teal-100">
              <div className="bg-teal-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <MdOutlineAssignment className="text-3xl text-teal-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Consultation Reports</h3>
              <p className="text-gray-600 mb-4">
                After each consultation, receive a comprehensive report that you can share with your healthcare provider or keep for your records.
              </p>
              <ul className="text-gray-600">
                <li className="flex items-center gap-2 mb-2">
                  <MdCheckCircle className="text-green-500" />
                  <span>Detailed consultation summary</span>
                </li>
                <li className="flex items-center gap-2 mb-2">
                  <MdCheckCircle className="text-green-500" />
                  <span>Recommended next steps</span>
                </li>
                <li className="flex items-center gap-2">
                  <MdCheckCircle className="text-green-500" />
                  <span>Sharable PDF format</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Get started with our AI Doctor in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="bg-teal-100 w-20 h-20 rounded-full flex items-center justify-center mb-6 relative">
                <span className="absolute -top-2 -right-2 bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span>
                <FaUserMd className="text-3xl text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Start a Consultation</h3>
              <p className="text-gray-600">
                Begin a conversation with our AI Doctor by describing your symptoms or health concerns.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-teal-100 w-20 h-20 rounded-full flex items-center justify-center mb-6 relative">
                <span className="absolute -top-2 -right-2 bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span>
                <FaBrain className="text-3xl text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">AI Analysis</h3>
              <p className="text-gray-600">
                Our advanced AI analyzes your information, asks relevant questions, and assesses your condition.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-teal-100 w-20 h-20 rounded-full flex items-center justify-center mb-6 relative">
                <span className="absolute -top-2 -right-2 bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">3</span>
                <FaClipboardList className="text-3xl text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Get Recommendations</h3>
              <p className="text-gray-600">
                Receive personalized health recommendations, next steps, and a complete consultation report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">What Our Users Say</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Hear from people who have experienced the benefits of our AI Doctor
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-teal-200 rounded-full"></div>
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-sm text-gray-500">34, Healthcare Worker</p>
                </div>
              </div>
              <p className="text-gray-600">
                "As a busy healthcare worker, I don't always have time to visit a doctor for minor concerns. The AI Doctor has been incredibly helpful for initial assessments and peace of mind."
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-200 rounded-full"></div>
                <div>
                  <h4 className="font-semibold">Michael Rodriguez</h4>
                  <p className="text-sm text-gray-500">45, Software Engineer</p>
                </div>
              </div>
              <p className="text-gray-600">
                "What impressed me most was how the system remembered my chronic condition and tailored the advice accordingly. It feels like talking to a doctor who knows my history."
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-200 rounded-full"></div>
                <div>
                  <h4 className="font-semibold">Tanya Chen</h4>
                  <p className="text-sm text-gray-500">28, Student</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The consultation reports are fantastic. I was able to share the report with my doctor, who was impressed with the detailed information I could provide from my AI consultation."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-teal-600 to-blue-500 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Take Control of Your Health?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Start your AI consultation today and experience the future of healthcare at your fingertips.
          </p>
          <Link href="/chat" 
            className="px-8 py-4 rounded-full bg-white text-teal-600 font-bold hover:bg-opacity-90 transition-all inline-flex items-center gap-2 shadow-lg">
            Start Your Consultation <MdArrowForward />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MdHealthAndSafety className="text-2xl text-teal-400" />
                <span className="text-xl font-bold">HealthGuardian AI</span>
              </div>
              <p className="text-gray-400">
                Advanced AI-powered healthcare assistance for everyone.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>AI Doctor Consultation</li>
                <li>Health Profiles</li>
                <li>Emergency Detection</li>
                <li>Consultation Reports</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>FAQ</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>support@healthguardian.ai</li>
                <li>+1 (800) 123-4567</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} HealthGuardian AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
