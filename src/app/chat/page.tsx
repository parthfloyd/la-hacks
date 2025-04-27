'use client';

import React from 'react';
import ChatInterface from '../components/ChatInterface';
import Link from 'next/link';
import { MdHealthAndSafety, MdArrowBack } from 'react-icons/md';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Header Navigation */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-500 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <MdArrowBack className="text-xl" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <MdHealthAndSafety className="text-2xl" />
              <span className="text-xl font-bold">HealthGuardian AI</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <ChatInterface />
      </div>
    </div>
  );
} 