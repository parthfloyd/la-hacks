'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactWebcam from 'react-webcam';
import { useDropzone } from 'react-dropzone';
import { useReactMediaRecorder } from 'react-media-recorder';
import { geminiService, GeminiMessage } from '../services/gemini';
import { AiOutlineSend, AiOutlineAudio } from 'react-icons/ai';
import { MdOutlineVideoCall, MdAttachFile } from 'react-icons/md';
import { RxAvatar } from 'react-icons/rx';
import { FaRobot } from 'react-icons/fa';

// Define interface for message structure
interface Message {
  type: 'user' | 'ai';
  content: string;
  mediaType?: 'text' | 'audio' | 'video' | 'file';
  isPartial?: boolean;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isStreamingResponse, setIsStreamingResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const webcamRef = useRef<ReactWebcam>(null);
  const videoInterval = useRef<NodeJS.Timeout>();

  const { status: audioStatus, startRecording: startAudioRecording, stopRecording: stopAudioRecording, mediaBlobUrl, clearBlobUrl } = useReactMediaRecorder({
    audio: true,
    video: false,
    blobPropertyBag: { type: 'audio/wav' },
    onStop: (blobUrl: string, blob: Blob) => {
      if (blob) {
        handleAudioUpload(blobUrl);
      }
    }
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    onDrop: (acceptedFiles) => {
      handleFileUpload(acceptedFiles);
    },
  });

  useEffect(() => {
    // Initialize Gemini session when component mounts
    initGeminiSession();

    return () => {
      // Clean up on unmount
      if (videoInterval.current) {
        clearInterval(videoInterval.current);
      }
      
      // Close Gemini session
      if (geminiService.isSessionActive()) {
        geminiService.endSession().catch(console.error);
      }
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Effect to handle video enabling/disabling
  useEffect(() => {
    if (geminiService.isSessionActive() && webcamRef.current) {
      geminiService.toggleVideoStreaming(isVideoEnabled, webcamRef);
    }
  }, [isVideoEnabled]);

  const initGeminiSession = async () => {
    try {
      setIsProcessing(true);
      
      await geminiService.startSession({
        onMessage: (message: GeminiMessage) => {
          console.log('Received message in ChatInterface:', message);
          
          if (message.text) {
            console.log('Processing message with text:', message.text, 'isPartial:', message.isPartial);
            
            // Set streaming state based on message type
            setIsStreamingResponse(Boolean(message.isPartial));
            
            // Check if this is a partial update or new message
            if (message.isPartial) {
              // Update the last AI message if it exists and is partial
              setMessages(prev => {
                console.log('Current messages state:', prev);
                const lastMessage = prev[prev.length - 1];
                
                if (lastMessage && lastMessage.type === 'ai' && lastMessage.isPartial) {
                  console.log('Updating existing partial message');
                  const updatedMessages = [...prev];
                  updatedMessages[prev.length - 1] = {
                    ...lastMessage,
                    content: message.text || '',
                    isPartial: true
                  };
                  return updatedMessages;
                } else {
                  console.log('Adding new partial message');
                  // Add as new message with isPartial flag
                  return [
                    ...prev,
                    {
                      type: 'ai',
                      content: message.text || '',
                      mediaType: 'text',
                      isPartial: true
                    }
                  ];
                }
              });
            } else {
              // Final message (or complete update)
              console.log('Processing complete message');
              setIsStreamingResponse(false);
              
              setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                
                if (lastMessage && lastMessage.type === 'ai' && lastMessage.isPartial) {
                  console.log('Replacing partial message with complete version');
                  // Replace the partial message with the complete one
                  const updatedMessages = [...prev];
                  updatedMessages[prev.length - 1] = {
                    type: 'ai',
                    content: message.text || '',
                    mediaType: 'text',
                    isPartial: false
                  };
                  return updatedMessages;
                } else {
                  console.log('Adding new complete message');
                  // Add as new message
                  return [
                    ...prev,
                    {
                      type: 'ai',
                      content: message.text || '',
                      mediaType: 'text'
                    }
                  ];
                }
              });
            }
          } else {
            console.warn('Received message without text content:', message);
          }
        },
        onError: (error: Error | Event) => {
          console.error('Gemini session error:', error);
          setMessages(prev => [
            ...prev,
            {
              type: 'ai',
              content: 'An error occurred with the AI service. Please try again later.',
              mediaType: 'text',
            },
          ]);
          setIsConnected(false);
        },
        onClose: () => {
          console.log('Gemini session closed');
          setIsConnected(false);
        }
      });
      
      setIsConnected(true);
    } catch (error) {
      console.error('Error initializing Gemini session:', error);
      setMessages([{
        type: 'ai',
        content: 'Failed to initialize chat session. Please try again later.',
        mediaType: 'text'
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleVideo = () => {
    setIsVideoEnabled(prev => !prev);
  };

  const toggleAudioRecording = () => {
    if (isRecording) {
      stopAudioRecording();
    } else {
      startAudioRecording();
    }
    setIsRecording(!isRecording);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing || !geminiService.isSessionActive() || isStreamingResponse) return;

    setIsProcessing(true);
    try {
      // Add user message to chat
      const newMessage: Message = {
        type: 'user',
        content: inputText,
        mediaType: 'text',
      };
      setMessages(prev => [...prev, newMessage]);
      
      // Clear input field immediately after sending
      const messageCopy = inputText;
      setInputText('');
      
      // Send message to Gemini
      await geminiService.sendTextMessage(messageCopy);
      
      // Response is handled by onMessage callback
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        {
          type: 'ai',
          content: 'Sorry, I encountered an error processing your message.',
          mediaType: 'text',
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const captureAndSendFrame = async () => {
    if (!webcamRef.current || !geminiService.isSessionActive()) return;
    
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // Add a user message indicating frame capture
        setMessages(prev => [
          ...prev,
          {
            type: 'user',
            content: 'Sent a video frame',
            mediaType: 'video',
          }
        ]);
        
        // Send the frame to Gemini
        await geminiService.sendVideoFrame(imageSrc);
      }
    } catch (error) {
      console.error('Error capturing and sending frame:', error);
    }
  };

  const handleAudioUpload = async (audioUrl: string) => {
    if (isProcessing || !geminiService.isSessionActive()) return;

    setIsProcessing(true);
    try {
      setMessages(prev => [
        ...prev,
        {
          type: 'user',
          content: 'Sent an audio message',
          mediaType: 'audio',
        },
      ]);

      const audioBlob = await fetch(audioUrl).then(r => r.blob());
      const audioBuffer = await audioBlob.arrayBuffer();
      await geminiService.sendAudioMessage({
        data: Buffer.from(audioBuffer).toString('base64'),
        mimeType: 'audio/wav'
      });
      
      // Response is handled by onMessage callback
      clearBlobUrl();
    } catch (error) {
      console.error('Error processing audio:', error);
      setMessages(prev => [
        ...prev,
        {
          type: 'ai',
          content: 'Sorry, I encountered an error processing your audio.',
          mediaType: 'text',
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    const file = files[0];
    if (!file || isProcessing || !geminiService.isSessionActive()) return;

    setIsProcessing(true);
    try {
      setMessages(prev => [
        ...prev,
        {
          type: 'user',
          content: `Uploaded file: ${file.name}`,
          mediaType: 'text',
        },
      ]);

      await geminiService.sendFile(file);
      
      // Response is handled by onMessage callback
    } catch (error) {
      console.error('Error processing file:', error);
      setMessages(prev => [
        ...prev,
        {
          type: 'ai',
          content: 'Sorry, I encountered an error processing your file.',
          mediaType: 'text',
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const reconnectSession = async () => {
    await initGeminiSession();
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg relative">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.type === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <FaRobot className="text-white" />
                </div>
              )}
              <div
                className={`inline-block p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                } ${
                  message.isPartial 
                    ? 'border-2 border-blue-400 relative' 
                    : ''
                }`}
              >
                {message.content}
                {message.isPartial && (
                  <div className="absolute bottom-1 right-1 flex">
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce mx-0.5"></span>
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce mx-0.5" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce mx-0.5" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                )}
              </div>
              {message.type === 'user' && (
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                  <RxAvatar className="text-white" />
                </div>
              )}
            </div>
          </div>
        ))}
        {isStreamingResponse && !messages.some(m => m.isPartial) && (
          <div className="mb-4 text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <FaRobot className="text-white" />
              </div>
              <div className="inline-block p-3 rounded-lg bg-gray-200 text-gray-800">
                <div className="flex">
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce mx-0.5"></span>
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce mx-0.5" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce mx-0.5" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded-lg text-center">
          <p className="mb-2">Connection to AI service is closed.</p>
          <button 
            onClick={reconnectSession}
            className="px-4 py-1 bg-blue-500 text-white rounded"
            disabled={isProcessing}
          >
            Reconnect
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex gap-2 mb-2">
          <button
            onClick={toggleVideo}
            className={`p-2 rounded ${
              isVideoEnabled ? 'bg-red-500' : 'bg-blue-500'
            } text-white flex items-center gap-1`}
            disabled={isProcessing || !isConnected}
            title={isVideoEnabled ? "Video is enabled - AI can see you" : "Enable video to let AI see you"}
          >
            <MdOutlineVideoCall />
            {isVideoEnabled ? 'Video On' : 'Video Off'}
          </button>
          <button
            onClick={captureAndSendFrame}
            className={`p-2 rounded bg-purple-500 text-white flex items-center gap-1`}
            disabled={isProcessing || !isConnected || !webcamRef.current || isStreamingResponse}
            title="Send a single frame from your camera to the AI"
          >
            <MdOutlineVideoCall />
            Send Frame
          </button>
          <button
            onClick={toggleAudioRecording}
            className={`p-2 rounded ${
              isRecording ? 'bg-red-500' : 'bg-blue-500'
            } text-white flex items-center gap-1`}
            disabled={isProcessing || !isConnected || isStreamingResponse}
            title={isRecording ? "Recording audio" : "Record audio message"}
          >
            <AiOutlineAudio />
            {isRecording ? 'Recording...' : 'Record Audio'}
          </button>
          <div
            {...getRootProps()}
            className={`p-2 rounded ${
              isProcessing || !isConnected || isStreamingResponse ? 'bg-gray-400' : 'bg-blue-500'
            } text-white cursor-pointer flex items-center gap-1`}
            title="Upload a file for AI to analyze"
          >
            <input {...getInputProps()} disabled={isProcessing || !isConnected || isStreamingResponse} />
            <MdAttachFile />
            Upload File
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 p-2 border rounded"
            placeholder={isVideoEnabled ? "Type your message (video is enabled)" : "Type your message..."}
            disabled={isProcessing || !isConnected || isStreamingResponse}
          />
          <button
            onClick={handleSendMessage}
            className={`p-2 rounded ${
              isProcessing || !isConnected || isStreamingResponse || !inputText.trim() ? 'bg-gray-400' : 'bg-blue-500'
            } text-white flex items-center gap-1`}
            disabled={isProcessing || !isConnected || isStreamingResponse || !inputText.trim()}
          >
            <AiOutlineSend />
            {isProcessing ? 'Processing...' : 'Send'}
          </button>
        </div>
        {isStreamingResponse && (
          <div className="text-xs text-gray-500 mt-1">
            AI is generating a response...
          </div>
        )}
        {isVideoEnabled && (
          <div className="text-xs text-gray-500 mt-1">
            Video mode is active - AI can see through your camera
          </div>
        )}
      </div>

      {/* Video Window */}
      {isVideoEnabled && (
        <div className="fixed bottom-4 right-4 w-64">
          <ReactWebcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            className="rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default ChatInterface; 