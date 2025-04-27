'use client';

import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReportTemplate from './ReportTemplate';
import { MdOutlineEmail, MdOutlineDownload, MdOutlineClose, MdCheckCircle } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

interface ReportGeneratorProps {
  reportContent: string;
  onClose: () => void;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ reportContent, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Extract patient name, title, and date from the report content
  const extractReportInfo = () => {
    const patientNameMatch = reportContent.match(/Patient(?:'s)? Name:? ([^\n]+)/i);
    const titleMatch = reportContent.match(/Final Report Summary:? ([^\n]+)/i);
    
    return {
      patientName: patientNameMatch ? patientNameMatch[1].trim() : 'Anonymous Patient',
      title: titleMatch ? titleMatch[1].trim() : 'Healthcare Consultation Report',
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    };
  };
  
  const { patientName, title, date } = extractReportInfo();
  
  const generatePDF = async () => {
    if (!reportRef.current) return;
    
    setIsGenerating(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true,
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Return the PDF document for further use
      return pdf;
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDownload = async () => {
    const pdf = await generatePDF();
    if (pdf) {
      pdf.save(`HealthGuardian_Report_${Date.now()}.pdf`);
      setIsDownloaded(true);
      
      // Reset the download status after 3 seconds
      setTimeout(() => {
        setIsDownloaded(false);
      }, 3000);
    }
  };
  
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;
    
    try {
      const pdf = await generatePDF();
      if (pdf) {
        const pdfBase64 = pdf.output('datauristring');
        
        // Send email with PDF attachment
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            subject: `HealthGuardian Report: ${title}`,
            message: `Please find attached your medical report from HealthGuardian AI.`,
            pdfBase64,
            fileName: `HealthGuardian_Report_${Date.now()}.pdf`,
          }),
        });
        
        if (response.ok) {
          setIsEmailSent(true);
          setTimeout(() => {
            setShowEmailForm(false);
            setIsEmailSent(false);
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: 20 }}
        className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col"
      >
        <div className="p-4 bg-primary text-white flex justify-between items-center">
          <h2 className="text-xl font-bold">Medical Report</h2>
          <button onClick={onClose} className="p-2 hover:bg-primary-dark rounded-full transition-colors">
            <MdOutlineClose className="text-xl" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-[#F5FAFD] p-4 rounded-lg mb-6 border border-secondary-light border-opacity-30">
            <h3 className="text-primary font-bold mb-2">Your report is ready!</h3>
            <p className="text-gray-700">
              You can download your report as a PDF or have it sent to your email for future reference.
            </p>
          </div>
          
          <div className="flex justify-between mb-6">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="px-4 py-2 flex items-center gap-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {isDownloaded ? <MdCheckCircle /> : <MdOutlineDownload />}
              {isDownloaded ? 'Downloaded!' : 'Download PDF'}
            </button>
            
            <button
              onClick={() => setShowEmailForm(true)}
              className="px-4 py-2 flex items-center gap-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors"
            >
              <MdOutlineEmail />
              Email Report
            </button>
          </div>
          
          {/* Preview of the report */}
          <div className="bg-gray-100 p-4 rounded-lg overflow-hidden" style={{ transform: 'scale(0.75)', transformOrigin: 'top center' }}>
            <div ref={reportRef}>
              <ReportTemplate
                title={title}
                patientName={patientName}
                date={date}
                reportContent={reportContent}
              />
            </div>
          </div>
        </div>
        
        {/* Email form overlay */}
        <AnimatePresence>
          {showEmailForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-xl p-6 max-w-md w-full"
              >
                <h3 className="text-xl font-bold text-primary mb-4">Send to Email</h3>
                
                {isEmailSent ? (
                  <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-3">
                    <MdCheckCircle className="text-2xl" />
                    <p>Report sent successfully to your email!</p>
                  </div>
                ) : (
                  <form onSubmit={handleSendEmail}>
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowEmailForm(false)}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
                      >
                        <MdOutlineEmail />
                        Send Report
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ReportGenerator; 