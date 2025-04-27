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
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-xl w-full"
      >
        <div className="p-4 bg-danger text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MdOutlineWarning className="text-2xl" />
            <h2 className="text-xl font-bold">EMERGENCY MEDICAL ALERT</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-opacity-80 rounded-full transition-colors"
            aria-label="Close alert"
          >
            <MdOutlineClose className="text-xl" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-danger bg-opacity-20 p-3 rounded-full">
              <MdEmergency className="text-4xl text-danger" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-danger mb-2">Potential Medical Emergency Detected</h3>
              <p className="text-gray-700 whitespace-pre-line">{message}</p>
            </div>
          </div>
          
          <div className="bg-danger bg-opacity-10 p-4 rounded-lg mb-6 border border-danger border-opacity-30">
            <p className="font-medium text-danger">
              Based on the information provided, you may be experiencing symptoms that require immediate medical attention. 
              Please do not rely solely on this application for medical emergencies.
            </p>
          </div>
          
          <div className="bg-neutral-100 p-4 rounded-lg mb-6">
            <h4 className="font-bold mb-2">Recommended Actions:</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li>Call emergency services (911 in the US) immediately</li>
              <li>Do not delay seeking professional medical help</li>
              <li>If possible, have someone stay with you</li>
              <li>Inform emergency responders about your symptoms</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="tel:911"
              className="flex-1 flex items-center justify-center gap-2 bg-danger text-white py-3 px-4 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
            >
              <MdCall className="text-xl" />
              Call 911 Now
            </a>
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-neutral-200 text-gray-800 rounded-lg font-medium hover:bg-neutral-300 transition-colors"
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