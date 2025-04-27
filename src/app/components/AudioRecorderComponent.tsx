'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AudioRecorderProps } from './ChatInterface';

const AudioRecorderComponent: React.FC<AudioRecorderProps> = ({
  isDisabled,
  isRecording,
  onRecordingToggle,
  onAudioReady
}) => {
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const hasStartedRecordingRef = useRef<boolean>(false);
  
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
  
  // Cleanup function to ensure microphone is properly released
  const cleanupRecording = () => {
    console.log('Cleaning up recording resources');
    
    // Stop the media recorder if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error('Error stopping recorder:', err);
      }
    }
    
    // Stop all audio tracks and release microphone
    if (streamRef.current) {
      try {
        const tracks = streamRef.current.getTracks();
        console.log(`Stopping ${tracks.length} audio tracks`);
        tracks.forEach(track => {
          track.stop();
          streamRef.current?.removeTrack(track);
        });
      } catch (err) {
        console.error('Error stopping audio tracks:', err);
      }
    }
    
    // Reset references
    streamRef.current = null;
    mediaRecorderRef.current = null;
    hasStartedRecordingRef.current = false;
  };
  
  // Handle initial recording on mount
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      cleanupRecording();
    };
  }, []);
  
  // Handle recording state changes
  useEffect(() => {
    console.log('Recording state changed:', isRecording, 'hasStarted:', hasStartedRecordingRef.current);
    
    const startRecording = async () => {
      if (hasStartedRecordingRef.current) return;
      
      // Ensure any previous recording is cleaned up
      cleanupRecording();
      
      // Clear previous recording data
      chunks.current = [];
      setAudioURL(null);
      hasStartedRecordingRef.current = true;
      
      try {
        console.log('Starting audio recording');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        
        recorder.ondataavailable = (e) => {
          console.log('Data available from recorder', e.data.size);
          if (e.data.size > 0) {
            chunks.current.push(e.data);
          }
        };
        
        recorder.onstop = () => {
          console.log('Recorder stopped, processing data');
          if (chunks.current.length > 0) {
            const blob = new Blob(chunks.current, { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            setAudioURL(url);
            console.log('Audio ready, sending to parent');
            onAudioReady(url, blob);
          } else {
            console.warn('No audio data collected');
          }
          
          // Cleanup after successful recording
          cleanupRecording();
        };
        
        // Start recording with 10ms timeslice to ensure ondataavailable fires
        recorder.start(10);
        console.log('Recorder started');
      } catch (err) {
        console.error('Error accessing microphone:', err);
        cleanupRecording();
        onRecordingToggle(); // Turn off recording state if there's an error
      }
    };
    
    if (isRecording && !hasStartedRecordingRef.current) {
      startRecording();
    } else if (!isRecording && hasStartedRecordingRef.current) {
      console.log('Stopping recording from state change');
      cleanupRecording();
    }
  }, [isRecording]);
  
  // Handle stop button click directly
  const handleStopRecording = () => {
    console.log('Stop recording button clicked');
    // Call onRecordingToggle first to update isRecording state in parent
    onRecordingToggle();
    // Then cleanup the recording resources after state change
    setTimeout(() => {
      cleanupRecording();
    }, 10);
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
        onClick={handleStopRecording}
        disabled={isDisabled}
        className="px-3 py-1 rounded-full bg-danger text-white text-sm hover:bg-opacity-90 transition-colors"
      >
        Stop Recording
      </button>
    </div>
  );
};

export default AudioRecorderComponent; 