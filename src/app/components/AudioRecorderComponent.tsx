'use client';

import React, { useEffect } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { AiOutlineAudio } from 'react-icons/ai';
import { AudioRecorderProps } from './ChatInterface';

const AudioRecorderComponent: React.FC<AudioRecorderProps> = ({ 
  isDisabled, 
  isRecording, 
  onRecordingToggle,
  onAudioReady
}) => {
  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } = useReactMediaRecorder({
    audio: true,
    video: false,
    blobPropertyBag: { type: 'audio/wav' },
    onStop: (blobUrl: string, blob: Blob) => {
      if (blob) {
        onAudioReady(blobUrl);
      }
    }
  });

  // Start or stop recording when isRecording changes
  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else if (status === 'recording') {
      stopRecording();
    }
  }, [isRecording, status, startRecording, stopRecording]);

  // Clean up blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (mediaBlobUrl) {
        clearBlobUrl();
      }
    };
  }, [mediaBlobUrl, clearBlobUrl]);

  return (
    <button
      onClick={onRecordingToggle}
      className={`p-3 rounded-full ${
        isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-600 hover:bg-teal-700'
      } text-white flex items-center justify-center transition-colors shadow-sm`}
      disabled={isDisabled}
      title={isRecording ? "Recording audio" : "Record audio message"}
    >
      <AiOutlineAudio className="text-xl" />
    </button>
  );
};

export default AudioRecorderComponent; 