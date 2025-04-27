'use client';

import React, { useEffect } from 'react';
import Webcam from 'react-webcam';
import { WebcamProps } from './ChatInterface';

const WebcamComponent: React.FC<WebcamProps> = ({ webcamRef }) => {
  const videoConstraints = {
    width: 640,
    height: 360,
    facingMode: "user"
  };

  return (
    <div className="webcam-container">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        className="webcam-video rounded-lg"
        mirrored={true}
      />
    </div>
  );
};

export default WebcamComponent; 