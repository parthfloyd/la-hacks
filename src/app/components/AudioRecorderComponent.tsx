'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AudioRecorderProps } from './ChatInterface';

const AudioRecorderComponent: React.FC<AudioRecorderProps> = ({
  isDisabled,
  isRecording,
  onRecordingToggle,
  onAudioReady
}) => {
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStarted = useRef<boolean>(false);

  // Cleanup all resources
  const cleanupRecording = () => {
    console.log('Cleaning up recording resources');
    
    // Clear the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Stop the media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        console.log('Stopping MediaRecorder');
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error('Error stopping media recorder:', err);
      }
    }
    
    // Stop all audio tracks
    if (streamRef.current) {
      try {
        const tracks = streamRef.current.getTracks();
        console.log(`Stopping ${tracks.length} audio tracks`);
        tracks.forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      } catch (err) {
        console.error('Error stopping audio tracks:', err);
      }
    }
    
    mediaRecorderRef.current = null;
    recordingStarted.current = false;
  };
  
  // Handle component unmount
  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, []);
  
  // Start recording when isRecording becomes true
  useEffect(() => {
    if (isRecording && !recordingStarted.current) {
      startRecording();
    } else if (!isRecording && recordingStarted.current) {
      stopRecording();
    }
  }, [isRecording]);
  
  // Start the recording process
  const startRecording = async () => {
    try {
      console.log('Starting new audio recording');
      
      // Make sure any previous recording is cleaned up
      cleanupRecording();
      
      // Reset recording state
      audioChunks.current = [];
      setRecordingTime(0);
      
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Create new MediaRecorder
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = recorder;
      
      // Set up recording timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Collect audio data
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log(`Received audio chunk: ${event.data.size} bytes`);
          audioChunks.current.push(event.data);
        }
      };
      
      // Process audio when recording stops
      recorder.onstop = () => {
        console.log('MediaRecorder stopped - processing audio data');
        console.log(`Processing ${audioChunks.current.length} audio chunks`);
        
        if (audioChunks.current.length > 0) {
          // Create the final audio blob
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
          console.log(`Final audio size: ${audioBlob.size} bytes`);
          
          if (audioBlob.size > 0) {
            const audioUrl = URL.createObjectURL(audioBlob);
            console.log('Created audio URL:', audioUrl);
            
            // Send the complete audio to the parent component
            onAudioReady(audioUrl, audioBlob);
          } else {
            console.error('Created audio blob is empty');
          }
        } else {
          console.error('No audio chunks collected during recording');
        }
      };
      
      // Start recording with 1-second data chunks
      recorder.start(1000);
      console.log('MediaRecorder started');
      recordingStarted.current = true;
      
    } catch (err) {
      console.error('Error starting audio recording:', err);
      cleanupRecording();
      onRecordingToggle(); // Tell parent recording failed
    }
  };
  
  // Stop the current recording
  const stopRecording = () => {
    console.log('Stopping audio recording');
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        // Request any remaining data
        mediaRecorderRef.current.requestData();
        
        // Stop the recorder - this will trigger the onstop event
        mediaRecorderRef.current.stop();
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Clear the timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } catch (err) {
        console.error('Error stopping recording:', err);
      }
    }
    
    // Reset recording state
    recordingStarted.current = false;
  };
  
  // Handle stop button click
  const handleStopClick = () => {
    console.log('Stop recording button clicked');
    
    // Stop the recording
    stopRecording();
    
    // Tell parent component to update its state
    onRecordingToggle();
  };
  
  // Format the time display
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
        onClick={handleStopClick}
        disabled={isDisabled}
        className="px-3 py-1 rounded-full bg-danger text-white text-sm hover:bg-opacity-90 transition-colors"
      >
        Stop Recording
      </button>
    </div>
  );
};

export default AudioRecorderComponent; 