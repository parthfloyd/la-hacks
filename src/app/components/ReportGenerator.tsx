'use client';

import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReportTemplate from './ReportTemplate';
import { MdOutlineDownload, MdOutlineClose, MdCheckCircle } from 'react-icons/md';
import { motion } from 'framer-motion';

interface ReportGeneratorProps {
  reportContent: string;
  onClose: () => void;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ reportContent, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
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
      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Directly capture the entire report as one canvas
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // Fix image paths in the cloned document if needed
          const images = clonedDoc.querySelectorAll('img');
          images.forEach(img => {
            if (img.src.startsWith('/')) {
              // Convert relative paths to absolute for PDF generation
              img.src = window.location.origin + img.getAttribute('src');
            }
          });
        }
      });
      
      // Get dimensions
      const imgWidth = 190; // A4 width with margins in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 277; // A4 height (297) minus margins
      
      // If the report is longer than one page, split it into multiple pages
      let heightLeft = imgHeight;
      let position = 0;
      let pageOffset = 10; // Starting position on first page
      
      // Add first page
      pdf.addImage(canvas, 'PNG', 10, pageOffset, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      return pdf;
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Create a simple text-based PDF if image generation fails
      try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const soap = extractSOAPFromContent(reportContent);
        
        // Add a title
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 255);
        pdf.text('HEALTHCARE REPORT', 105, 20, { align: 'center' });
        
        // Add patient info
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Patient: ${patientName}`, 20, 40);
        pdf.text(`Date: ${date}`, 20, 50);
        
        // Add SOAP content
        let yPos = 70;
        const addSection = (title: string, content: string) => {
          pdf.setFontSize(14);
          pdf.setTextColor(0, 0, 150);
          pdf.text(title, 20, yPos);
          yPos += 10;
          
          pdf.setFontSize(12);
          pdf.setTextColor(0, 0, 0);
          const lines = pdf.splitTextToSize(content, 170);
          
          // Check if we need a new page
          if (yPos + lines.length * 7 > 270) {
            pdf.addPage();
            yPos = 20;
          }
          
          pdf.text(lines, 20, yPos);
          yPos += lines.length * 7 + 10;
        };
        
        addSection('S (Subjective)', soap.subjective);
        addSection('O (Objective)', soap.objective);  
        addSection('A (Assessment)', soap.assessment);
        addSection('P (Plan)', soap.plan);
        
        // Add references if any
        if (soap.references.length > 0) {
          addSection('References', soap.references.join('\n'));
        }
        
        return pdf;
      } catch (fallbackError) {
        console.error('Fallback PDF generation failed:', fallbackError);
        return null;
      }
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Helper function to extract SOAP sections from content
  const extractSOAPFromContent = (content: string) => {
    const subjectiveMatch = content.match(/\*\*S \(Subjective\)\*\*:?([\s\S]*?)(?=\*\*O \(Objective\)|$)/i);
    const objectiveMatch = content.match(/\*\*O \(Objective\)\*\*:?([\s\S]*?)(?=\*\*A \(Assessment\)|$)/i);
    const assessmentMatch = content.match(/\*\*A \(Assessment\)\*\*:?([\s\S]*?)(?=\*\*P \(Plan\)|$)/i);
    const planMatch = content.match(/\*\*P \(Plan\)\*\*:?([\s\S]*?)(?=$)/i);
    
    // Extract references using regex
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const allContent = content || '';
    const references = allContent.match(urlPattern) || [];
    
    return {
      subjective: subjectiveMatch ? subjectiveMatch[1].trim() : 'No subjective information available',
      objective: objectiveMatch ? objectiveMatch[1].trim() : 'No objective information available',
      assessment: assessmentMatch ? assessmentMatch[1].trim() : 'No assessment information available',
      plan: planMatch ? planMatch[1].trim() : 'No plan information available',
      references
    };
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
              You can download your report as a PDF for future reference.
            </p>
          </div>
          
          <div className="flex justify-center mb-6">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="px-4 py-2 flex items-center gap-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {isDownloaded ? <MdCheckCircle /> : <MdOutlineDownload />}
              {isDownloaded ? 'Downloaded!' : 'Download PDF'}
            </button>
          </div>
          
          {/* Preview of the report */}
          <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-[60vh]">
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
      </motion.div>
    </div>
  );
};

export default ReportGenerator; 