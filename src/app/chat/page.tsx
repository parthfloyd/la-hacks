'use client';

import React, { useEffect } from 'react';
import ChatInterface from '../components/ChatInterface';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MdHealthAndSafety, MdArrowBack } from 'react-icons/md';

export default function ChatPage() {
  return (
    <div className="min-h-screen h-screen flex flex-col bg-gradient-to-br from-[#EBF5F9] to-[#F1F7FA]">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 bg-health-pattern opacity-20 pointer-events-none"></div>
      
      {/* Header Navigation */}
      <header className="bg-gradient-to-r from-primary-dark via-primary to-secondary text-white shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                <MdArrowBack className="text-xl" />
                <span>Back to Home</span>
              </Link>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <MdHealthAndSafety className="text-2xl text-primary" />
              </div>
              <span className="text-xl font-bold">HealthGuardian AI</span>
            </motion.div>
          </div>
        </div>
      </header>
      
      <div className="flex-1 p-4 md:p-8 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="h-full"
        >
          <ChatInterface />
        </motion.div>
      </div>
      
      {/* Footer */}
      <footer className="py-4 px-6 text-center text-sm text-primary-dark bg-white bg-opacity-50 shadow-inner">
        <p>HealthGuardian AI &copy; {new Date().getFullYear()} | This is a demo application. Not intended for real medical use.</p>
      </footer>
    </div>
  );
} 