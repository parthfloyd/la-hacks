'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MdOutlineClose, MdEmergency, MdCall, MdOutlineWarning } from 'react-icons/md';

interface EmergencyAlertProps {
  message: string;
  onClose: () => void;
}

const EmergencyAlert: React.FC<EmergencyAlertProps> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-3 md:p-4 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-md w-full max-h-[90vh] flex flex-col"
      >
        <div className="p-3 bg-danger text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <MdOutlineWarning className="text-xl md:text-2xl" />
            <h2 className="text-base md:text-xl font-bold truncate">EMERGENCY MEDICAL ALERT</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 md:p-2 hover:bg-opacity-80 rounded-full transition-colors"
            aria-label="Close alert"
          >
            <MdOutlineClose className="text-xl" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-danger bg-opacity-20 p-2 rounded-full shrink-0">
              <MdEmergency className="text-3xl text-danger" />
            </div>
            <div>
              <h3 className="text-base font-bold text-danger mb-1">Medical Emergency Detected</h3>
              <p className="text-gray-700 whitespace-pre-line text-sm md:text-base">{message}</p>
            </div>
          </div>
          
          <div className="bg-danger bg-opacity-10 p-3 rounded-lg mb-4 border border-danger border-opacity-30">
            <p className="font-medium text-white text-sm md:text-base">
              Based on your symptoms, you may need immediate medical attention.
              Please do not rely solely on this application for medical emergencies.
            </p>
          </div>
          
          <div className="bg-neutral-100 p-3 rounded-lg mb-4">
            <h4 className="font-bold mb-1 text-sm md:text-base">Recommended Actions:</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm md:text-base">
              <li>Call emergency services (911) immediately</li>
              <li>Do not delay seeking professional help</li>
              <li>Have someone stay with you if possible</li>
              <li>Inform responders about your symptoms</li>
            </ul>
          </div>
        </div>
        
        <div className="p-3 border-t border-gray-200 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href="tel:911"
              className="flex-1 flex items-center justify-center gap-2 bg-danger text-white py-2 px-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors text-sm md:text-base"
            >
              <MdCall className="text-lg" />
              Call 911 Now
            </a>
            <button
              onClick={onClose}
              className="flex-1 py-2 px-3 bg-neutral-200 text-gray-800 rounded-lg font-medium hover:bg-neutral-300 transition-colors text-sm md:text-base"
            >
              I Understand
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmergencyAlert; 