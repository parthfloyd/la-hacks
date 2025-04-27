'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DropzoneProps } from './ChatInterface';

const DropzoneComponent: React.FC<DropzoneProps> = ({ isDisabled, onFilesSelected }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      onFilesSelected(acceptedFiles);
    }
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isDisabled,
    multiple: false,
    maxSize: 10485760, // 10MB max
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    }
  });

  // This component only renders a hidden input
  // The parent component will render the visible button/label
  return (
    <div {...getRootProps()} className="relative w-0 h-0 overflow-hidden">
      <input {...getInputProps()} />
    </div>
  );
};

export default DropzoneComponent; 