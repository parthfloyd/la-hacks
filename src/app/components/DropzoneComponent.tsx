'use client';

import React from 'react';
import { useDropzone } from 'react-dropzone';
import { MdAttachFile } from 'react-icons/md';
import { DropzoneProps } from './ChatInterface';

const DropzoneComponent: React.FC<DropzoneProps> = ({ isDisabled, onFilesSelected }) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    onDrop: onFilesSelected,
    disabled: isDisabled
  });

  return (
    <div
      {...getRootProps()}
      className={`px-4 py-2 rounded-full ${
        isDisabled ? 'bg-gray-400' : 'bg-teal-600 hover:bg-teal-700'
      } text-white cursor-pointer flex items-center gap-2 transition-colors shadow-sm`}
      title="Upload a file for AI to analyze"
    >
      <input {...getInputProps()} disabled={isDisabled} />
      <MdAttachFile className="text-lg" />
      Upload File
    </div>
  );
};

export default DropzoneComponent; 