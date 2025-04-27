'use client';

import React, { useState, useEffect } from 'react';
import { AudioRecorderProps } from './ChatInterface';

const AudioRecorderComponent: React.FC<AudioRecorderProps> = ({
  isDisabled,
  isRecording,
  onRecordingToggle,
  onAudioReady
}) => {
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const chunks = React.useRef<Blob[]>([]);
  
  // Set up timer for recording duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      setRecordingTime(0);
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);
  
  // Initialize media recorder when recording starts
  useEffect(() => {
    if (isRecording && !mediaRecorder) {
      startRecording();
    } else if (!isRecording && mediaRecorder) {
      stopRecording();
    }
  }, [isRecording, mediaRecorder]);
  
  const startRecording = async () => {
    chunks.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        onAudioReady(url);
        
        // Stop all audio tracks to release microphone
        stream.getAudioTracks().forEach(track => track.stop());
        setMediaRecorder(null);
      };
      
      recorder.start();
      setMediaRecorder(recorder);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      onRecordingToggle(); // Turn off recording state if there's an error
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-danger animate-pulse"></div>
        <span className="text-danger font-medium">Recording audio: {formatTime(recordingTime)}</span>
      </div>
      
      <button
        onClick={onRecordingToggle}
        disabled={isDisabled}
        className="px-3 py-1 rounded-full bg-danger text-white text-sm hover:bg-opacity-90 transition-colors"
      >
        Stop Recording
      </button>
    </div>
  );
};

export default AudioRecorderComponent; 