'use client';

import React from 'react';
import Image from 'next/image';

interface ReportTemplateProps {
  title: string;
  patientName: string;
  date: string;
  reportContent: string;
  doctor?: string;
}

const ReportTemplate: React.FC<ReportTemplateProps> = ({ 
  title, 
  patientName, 
  date, 
  reportContent, 
  doctor = "HealthGuardian AI"
}) => {
  // Extract the full report content starting from "Final Report Summary"
  const extractReportContent = () => {
    const reportStartIndex = reportContent.indexOf("**Final Report Summary**");
    if (reportStartIndex === -1) return reportContent; // Return full content if marker not found
    
    return reportContent.substring(reportStartIndex);
  };
  
  // Process the content to render markdown and make links clickable
  const processMarkdown = (content: string) => {
    // First extract any URL links to handle them separately
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const urls = content.match(urlPattern) || [];
    
    // Replace URLs with placeholders to process them separately
    let processedContent = content;
    urls.forEach((url, index) => {
      processedContent = processedContent.replace(url, `__URL_PLACEHOLDER_${index}__`);
    });
    
    // Split the content into blocks based on empty lines (paragraphs)
    const blocks = processedContent.split(/\n\n+/);
    
    return blocks.map((block, blockIndex) => {
      // Check if block is a list
      if (block.match(/^[\s]*[-*+] /m)) {
        // Unordered list
        const listItems = block.split(/\n/).filter(item => item.trim());
        return (
          <ul key={`ul-${blockIndex}`} className="list-disc pl-5 mb-4 space-y-1">
            {listItems.map((item, itemIndex) => {
              const listContent = item.replace(/^[\s]*[-*+] /, '');
              return (
                <li key={`li-${blockIndex}-${itemIndex}`} className="mb-1">
                  {processMdInline(listContent, urls)}
                </li>
              );
            })}
          </ul>
        );
      } else if (block.match(/^[\s]*\d+\. /m)) {
        // Ordered list
        const listItems = block.split(/\n/).filter(item => item.trim());
        return (
          <ol key={`ol-${blockIndex}`} className="list-decimal pl-5 mb-4 space-y-1">
            {listItems.map((item, itemIndex) => {
              const listContent = item.replace(/^[\s]*\d+\. /, '');
              return (
                <li key={`li-${blockIndex}-${itemIndex}`} className="mb-1">
                  {processMdInline(listContent, urls)}
                </li>
              );
            })}
          </ol>
        );
      } else if (block.match(/^[\s]*>/m)) {
        // Blockquote
        const quoteContent = block.replace(/^[\s]*> ?/gm, '');
        return (
          <blockquote 
            key={`quote-${blockIndex}`} 
            className="pl-4 border-l-4 border-blue-300 italic text-gray-700 mb-4"
          >
            {processMdInline(quoteContent, urls)}
          </blockquote>
        );
      } else if (block.match(/^[\s]*```/)) {
        // Code block
        const codeContent = block.replace(/^[\s]*```[\s\S]*?\n/, '').replace(/[\s]*```[\s]*$/, '');
        return (
          <pre key={`code-${blockIndex}`} className="bg-gray-100 p-3 rounded font-mono text-sm overflow-x-auto mb-4">
            <code>{codeContent}</code>
          </pre>
        );
      } else if (block.match(/^[\s]*---[\s]*$/)) {
        // Horizontal rule
        return <hr key={`hr-${blockIndex}`} className="my-4 border-t border-gray-300" />;
      } else if (block.startsWith('# ')) {
        // H1 header
        return (
          <h1 key={`h1-${blockIndex}`} className="text-2xl font-bold mt-6 mb-4 text-blue-700">
            {processMdInline(block.substring(2), urls)}
          </h1>
        );
      } else if (block.startsWith('## ')) {
        // H2 header
        return (
          <h2 key={`h2-${blockIndex}`} className="text-xl font-bold mt-5 mb-3 text-blue-600">
            {processMdInline(block.substring(3), urls)}
          </h2>
        );
      } else if (block.startsWith('### ')) {
        // H3 header
        return (
          <h3 key={`h3-${blockIndex}`} className="text-lg font-bold mt-4 mb-2 text-blue-600">
            {processMdInline(block.substring(4), urls)}
          </h3>
        );
      } else if (block.match(/^\*\*S \(Subjective\)\*\*/)) {
        // Special handling for SOAP sections
        return (
          <div key={`soap-s-${blockIndex}`} className="mt-6 mb-4">
            <h3 className="text-lg font-bold text-blue-600 pb-1 border-b border-blue-200">S (Subjective)</h3>
            <div className="pl-4 border-l-2 border-blue-100 mt-2">
              {processParagraphLines(block.replace(/^\*\*S \(Subjective\)\*\*:?/, ''), blockIndex, urls)}
            </div>
          </div>
        );
      } else if (block.match(/^\*\*O \(Objective\)\*\*/)) {
        return (
          <div key={`soap-o-${blockIndex}`} className="mt-6 mb-4">
            <h3 className="text-lg font-bold text-blue-600 pb-1 border-b border-blue-200">O (Objective)</h3>
            <div className="pl-4 border-l-2 border-blue-100 mt-2">
              {processParagraphLines(block.replace(/^\*\*O \(Objective\)\*\*:?/, ''), blockIndex, urls)}
            </div>
          </div>
        );
      } else if (block.match(/^\*\*A \(Assessment\)\*\*/)) {
        return (
          <div key={`soap-a-${blockIndex}`} className="mt-6 mb-4">
            <h3 className="text-lg font-bold text-blue-600 pb-1 border-b border-blue-200">A (Assessment)</h3>
            <div className="pl-4 border-l-2 border-blue-100 mt-2">
              {processParagraphLines(block.replace(/^\*\*A \(Assessment\)\*\*:?/, ''), blockIndex, urls)}
            </div>
          </div>
        );
      } else if (block.match(/^\*\*P \(Plan\)\*\*/)) {
        return (
          <div key={`soap-p-${blockIndex}`} className="mt-6 mb-4">
            <h3 className="text-lg font-bold text-blue-600 pb-1 border-b border-blue-200">P (Plan)</h3>
            <div className="pl-4 border-l-2 border-blue-100 mt-2">
              {processParagraphLines(block.replace(/^\*\*P \(Plan\)\*\*:?/, ''), blockIndex, urls)}
            </div>
          </div>
        );
      } else if (block.startsWith("Final Report Summary")) {
        // Special handling for the title
        return (
          <h2 key={`title-${blockIndex}`} className="text-xl font-bold text-center text-blue-700 my-4 pb-2 border-b-2 border-blue-600">
            {block}
          </h2>
        );
      } else {
        // Regular paragraph, but check for nested lines
        return processParagraphLines(block, blockIndex, urls);
      }
    });
  };
  
  // Helper to process individual lines within a paragraph block
  const processParagraphLines = (block: string, blockIndex: number, urls: string[]) => {
    const lines = block.split('\n');
    
    return lines.map((line, lineIndex) => {
      if (!line.trim()) {
        return <br key={`br-${blockIndex}-${lineIndex}`} />;
      }
      
      if (line.match(/^\*\*[^*]+\*\*:/) || line.match(/^\*\*[^*]+\*\*$/)) {
        // Bold header
        return (
          <h4 key={`h4-${blockIndex}-${lineIndex}`} className="font-bold mt-3 mb-1 text-blue-600">
            {processMdInline(line, urls)}
          </h4>
        );
      }
      
      return (
        <p key={`p-${blockIndex}-${lineIndex}`} className="mb-2">
          {processMdInline(line, urls)}
        </p>
      );
    });
  };
  
  // Helper to process inline markdown elements
  const processMdInline = (text: string, urls: string[]) => {
    // Replace URL placeholders with actual link components
    let processedText = text;
    
    // Process markdown elements - in this order to avoid conflicts
    const elements: React.ReactNode[] = [];
    
    // Split by various delimiters while preserving them
    const parts = processedText.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|__URL_PLACEHOLDER_\d+__)/g);
    
    parts.forEach((part, index) => {
      if (!part) return; // Skip empty parts
      
      // Bold text
      if (part.startsWith('**') && part.endsWith('**')) {
        elements.push(
          <strong key={`strong-${index}`} className="font-bold">
            {part.substring(2, part.length - 2)}
          </strong>
        );
      }
      // Italic text
      else if (part.startsWith('*') && part.endsWith('*')) {
        elements.push(
          <em key={`em-${index}`} className="italic">
            {part.substring(1, part.length - 1)}
          </em>
        );
      }
      // Inline code
      else if (part.startsWith('`') && part.endsWith('`')) {
        elements.push(
          <code key={`code-${index}`} className="bg-gray-100 px-1 rounded font-mono text-sm">
            {part.substring(1, part.length - 1)}
          </code>
        );
      }
      // URL placeholder
      else if (part.startsWith('__URL_PLACEHOLDER_')) {
        const urlIndex = parseInt(part.replace('__URL_PLACEHOLDER_', '').replace('__', ''));
        const url = urls[urlIndex];
        
        if (url) {
          elements.push(
            <a 
              key={`link-${index}`} 
              href={url.startsWith('http') ? url : `https://${url}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline break-all inline-block"
            >
              {url}
            </a>
          );
        }
      }
      // Regular text
      else {
        elements.push(part);
      }
    });
    
    return elements;
  };
  
  const fullReport = extractReportContent();
  const processedContent = processMarkdown(fullReport);
  
  return (
    <div id="report-template" className="w-[800px] bg-white text-gray-800 font-sans p-8">
      {/* Header */}
      <div className="flex justify-between items-center pb-6 border-b-2 border-blue-600">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 relative">
            <Image src="/images/medical-cross.svg" width={64} height={64} alt="HealthGuardian Logo" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-600">HealthGuardian AI</h1>
            <p className="text-sm text-gray-500">Advanced Healthcare Assistance</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-blue-600">Medical Report</h2>
          <p className="text-sm text-gray-500">{date}</p>
        </div>
      </div>
      
      {/* Patient Information */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-gray-200">
        <h2 className="text-lg font-bold text-blue-600 mb-4">Patient Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Patient Name:</p>
            <p className="font-medium">{patientName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date:</p>
            <p className="font-medium">{date}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Report ID:</p>
            <p className="font-medium">{`HG-${Date.now().toString().slice(-8)}`}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Provider:</p>
            <p className="font-medium">{doctor}</p>
          </div>
        </div>
      </div>
      
      {/* Report Content */}
      <div className="mt-8 report-content markdown-body">
        {processedContent}
      </div>
      
      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Generated by HealthGuardian AI</p>
            <p className="text-xs text-gray-400">This report is for informational purposes only and is not a substitute for professional medical advice.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded-full text-blue-600 font-bold text-xs">
              AI
            </div>
            <p className="text-sm font-medium text-blue-600">AI-Powered Healthcare</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportTemplate; 