'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactWebcam from 'react-webcam';
import { useDropzone } from 'react-dropzone';
import { useReactMediaRecorder } from 'react-media-recorder';
import { geminiService, GeminiMessage } from '../services/gemini';
import { AiOutlineSend, AiOutlineAudio } from 'react-icons/ai';
import { MdOutlineVideoCall, MdAttachFile, MdHealthAndSafety } from 'react-icons/md';
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
                  
                  // Check if this message already exists (to prevent duplicates)
                  const isDuplicate = prev.length > 0 && 
                    prev[prev.length - 1].type === 'ai' && 
                    prev[prev.length - 1].content === message.text;
                  
                  if (isDuplicate) {
                    console.log('Skipping duplicate message');
                    return prev;
                  }
                  
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
    <div className="flex flex-col h-screen max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header has been moved to the page component */}
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 relative">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-6 ${
              message.type === 'user' ? 'flex justify-end' : 'flex justify-start'
            }`}
          >
            <div className={`flex items-start gap-3 max-w-[80%] ${
              message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                message.type === 'user' ? 'bg-teal-600' : 'bg-blue-500' 
              }`}>
                {message.type === 'ai' ? (
                  <FaRobot className="text-white text-lg" />
                ) : (
                  <RxAvatar className="text-white text-lg" />
                )}
              </div>
              <div
                className={`px-4 py-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-teal-600 text-white rounded-tr-none'
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                } ${
                  message.isPartial 
                    ? 'border-2 border-blue-300 relative' 
                    : ''
                }`}
              >
                {message.content}
                {message.isPartial && (
                  <div className="absolute bottom-1 right-1 flex">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce mx-0.5"></span>
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce mx-0.5" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce mx-0.5" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isStreamingResponse && !messages.some(m => m.isPartial) && (
          <div className="mb-4 flex justify-start">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <FaRobot className="text-white text-lg" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-gray-100 rounded-tl-none">
                <div className="flex">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce mx-0.5"></span>
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce mx-0.5" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce mx-0.5" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="mx-6 mb-4 p-4 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-2xl text-center shadow-md">
          <p className="mb-2 font-medium">Connection to AI service is closed.</p>
          <button 
            onClick={reconnectSession}
            className="px-5 py-2 bg-teal-600 text-white rounded-full shadow-md hover:bg-teal-700 transition-colors"
            disabled={isProcessing}
          >
            Reconnect
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="px-6 py-5 border-t border-gray-200 bg-white">
        <div className="flex gap-2 mb-3">
          <button
            onClick={toggleVideo}
            className={`px-4 py-2 rounded-full ${
              isVideoEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-600 hover:bg-teal-700'
            } text-white flex items-center gap-2 transition-colors shadow-sm`}
            disabled={isProcessing || !isConnected}
            title={isVideoEnabled ? "Video is enabled - AI can see you" : "Enable video to let AI see you"}
          >
            <MdOutlineVideoCall className="text-lg" />
            {isVideoEnabled ? 'Video On' : 'Video Off'}
          </button>
          
          <div
            {...getRootProps()}
            className={`px-4 py-2 rounded-full ${
              isProcessing || !isConnected || isStreamingResponse ? 'bg-gray-400' : 'bg-teal-600 hover:bg-teal-700'
            } text-white cursor-pointer flex items-center gap-2 transition-colors shadow-sm`}
            title="Upload a file for AI to analyze"
          >
            <input {...getInputProps()} disabled={isProcessing || !isConnected || isStreamingResponse} />
            <MdAttachFile className="text-lg" />
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
            className="flex-1 p-3 border border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-full outline-none"
            placeholder={isVideoEnabled ? "Type your message (video is enabled)" : "Type your message..."}
            disabled={isProcessing || !isConnected || isStreamingResponse}
          />
          
          <button
            onClick={toggleAudioRecording}
            className={`p-3 rounded-full ${
              isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-600 hover:bg-teal-700'
            } text-white flex items-center justify-center transition-colors shadow-sm`}
            disabled={isProcessing || !isConnected || isStreamingResponse}
            title={isRecording ? "Recording audio" : "Record audio message"}
          >
            <AiOutlineAudio className="text-xl" />
          </button>
          
          <button
            onClick={handleSendMessage}
            className={`p-3 rounded-full ${
              isProcessing || !isConnected || isStreamingResponse || !inputText.trim() ? 'bg-gray-400' : 'bg-teal-600 hover:bg-teal-700'
            } text-white flex items-center justify-center transition-colors shadow-sm`}
            disabled={isProcessing || !isConnected || isStreamingResponse || !inputText.trim()}
          >
            <AiOutlineSend className="text-xl" />
          </button>
        </div>
        {isStreamingResponse && (
          <div className="text-xs text-gray-500 mt-2">
            AI is generating a response...
          </div>
        )}
        {isVideoEnabled && (
          <div className="text-xs text-gray-500 mt-2">
            Video mode is active - AI can see through your camera
          </div>
        )}
        {isRecording && (
          <div className="text-xs text-red-500 mt-2 flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1"></span>
            Recording audio...
          </div>
        )}
      </div>

      {/* Video Window */}
      {isVideoEnabled && (
        <div className="fixed bottom-4 right-4 w-72">
          <div className="bg-white p-2 rounded-2xl shadow-lg">
            <ReactWebcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="rounded-xl w-full"
            />
            <div className="text-xs text-center text-gray-500 mt-1">Live Camera Feed</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface; 