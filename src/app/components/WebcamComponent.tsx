'use client';

import React from 'react';
import Webcam from 'react-webcam';
import { WebcamProps } from './ChatInterface';

const WebcamComponent: React.FC<WebcamProps> = ({ webcamRef }) => {
  return (
    <div className="fixed bottom-4 right-4 w-72">
      <div className="bg-white p-2 rounded-2xl shadow-lg">
        <Webcam
          audio={false}
          screenshotFormat="image/jpeg"
          className="rounded-xl w-full"
          ref={webcamRef}
        />
        <div className="text-xs text-center text-gray-500 mt-1">Live Camera Feed</div>
      </div>
    </div>
  );
};

export default WebcamComponent; 