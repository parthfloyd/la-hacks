'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AiOutlineSend } from 'react-icons/ai';
import { MdOutlineVideoCall, MdMic, MdMicOff } from 'react-icons/md';
import { RxAvatar } from 'react-icons/rx';
import { FaRobot, FaHeartbeat } from 'react-icons/fa';
import { geminiService, GeminiMessage } from '../services/gemini';
import dynamic from 'next/dynamic';
import EmergencyAlert from './EmergencyAlert';

// Dynamically import browser-only components
const WebcamComponent = dynamic(() => import('./WebcamComponent'), { ssr: false });
const AudioRecorderComponent = dynamic(() => import('./AudioRecorderComponent'), { ssr: false });
const ReportGenerator = dynamic(() => import('./ReportGenerator'), { ssr: false });

// Define interface for message structure
interface Message {
  type: 'user' | 'ai';
  content: string;
  mediaType?: 'text' | 'audio' | 'video';
  isPartial?: boolean;
}

// Create interfaces for component communication
export interface AudioRecorderProps {
  isDisabled: boolean;
  isRecording: boolean;
  onRecordingToggle: () => void;
  onAudioReady: (audioUrl: string, audioBlob: Blob) => void;
}

export interface WebcamProps {
  webcamRef: React.RefObject<any>;
}

export interface DropzoneProps {
  isDisabled: boolean;
  onFilesSelected: (files: File[]) => void;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isStreamingResponse, setIsStreamingResponse] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const webcamRef = useRef<any>(null);
  const videoInterval = useRef<NodeJS.Timeout>();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if we're in browser environment
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Focus input after receiving a response
  const focusInput = () => {
    if (inputRef.current && !isRecording) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  useEffect(() => {
    if (!isBrowser) return;
    
    // Initialize Gemini session when component mounts
    initGeminiSession();

    // Initial welcome message
    setTimeout(() => {
      setMessages([
        {
          type: 'ai',
          content: "Hello! I'm your HealthGuardian AI assistant.",
          mediaType: 'text',
        },
        {
          type: 'ai',
          content: "To begin consultation can you please tell me your age & gender first?",
          mediaType: 'text',
        }
      ]);
    }, 1000);

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
  }, [isBrowser]);

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

  // Auto-focus input when processing finishes
  useEffect(() => {
    if (!isProcessing && !isRecording && isBrowser) {
      focusInput();
    }
  }, [isProcessing, isRecording]);

  // Check if a message contains a medical report
  const checkForReport = (content: string): boolean => {
    return content.includes('Final Report Summary') || content.includes('Healthcare Consultation Report');
  };
  
  // Check if a message contains danger signs
  const checkForDangerSigns = (content: string): boolean => {
    return content.includes('##Danger Signs##');
  };
  
  // Extract the danger signs message
  const extractDangerSignsMessage = (content: string): string => {
    const dangerSignsPattern = /##Danger Signs##([\s\S]*?)(?=##End Danger Signs##|$)/;
    const match = content.match(dangerSignsPattern);
    return match ? match[1].trim() : 'Potential medical emergency detected. Please seek immediate medical attention.';
  };
  
  // Close the report modal
  const handleCloseReport = () => {
    setReportContent(null);
    
    // Clear only the UI chat messages
    // The conversation context is preserved in the Gemini service since we don't restart the session
    setMessages([]);
    
    // Add a new welcome message
    setTimeout(() => {
      setMessages([
        {
          type: 'ai',
          content: "Hello! I'm your HealthGuardian AI assistant.",
          mediaType: 'text',
        },
        {
          type: 'ai',
          content: "Your previous consultation has been saved and I still have the context from our conversation. How can I help you today?",
          mediaType: 'text',
        }
      ]);
    }, 300);
  };
  
  // Close the emergency alert
  const handleCloseEmergencyAlert = () => {
    setShowEmergencyAlert(false);
  };

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
              
              // Check if this is a report
              if (checkForReport(message.text)) {
                setReportContent(message.text);
              }
              
              // Check if this contains danger signs
              if (checkForDangerSigns(message.text)) {
                const dangerMessage = extractDangerSignsMessage(message.text);
                setEmergencyMessage(dangerMessage);
                setShowEmergencyAlert(true);
                
                // Clean the message displayed in chat by removing the danger signs markers
                const cleanedMessage = message.text
                  .replace(/##Danger Signs##[\s\S]*?##End Danger Signs##/g, '')
                  .replace(/##Danger Signs##[\s\S]*/g, '')
                  .trim();
                
                // Update message.text to the cleaned version for display
                message.text = cleanedMessage || message.text;
              }
              
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
              
              // Return focus to input after message is processed
              focusInput();
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
    setIsRecording(prev => !prev);
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
      
      // Maintain focus on input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      
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
      
      // Return focus to input even if there was an error
      focusInput();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAudioUpload = async (audioUrl: string, audioBlob: Blob) => {
    if (isProcessing || !geminiService.isSessionActive() || isStreamingResponse) {
      console.log('Cannot process audio: processing state or streaming state active');
      return;
    }
    
    console.log('Processing audio upload, blob size:', audioBlob.size);
    setIsProcessing(true);
    
    try {
      // Add user audio message
      const newMessage: Message = {
        type: 'user',
        content: 'Sent an audio message',
        mediaType: 'audio',
      };
      setMessages(prev => [...prev, newMessage]);
      
      // Ensure we have a valid blob with data
      if (!audioBlob || audioBlob.size === 0) {
        throw new Error('Empty audio recording received');
      }
      
      // Send audio to Gemini
      if (geminiService.sendAudioMessage) {
        console.log('Sending audio to Gemini service...');
        await geminiService.sendAudioMessage(audioBlob);
        console.log('Audio sent successfully');
      } else {
        // Fallback to text message until audio processing is implemented
        console.log('Audio processing not available, using text fallback');
        await geminiService.sendTextMessage("I've recorded an audio message about my symptoms. Please analyze it.");
      }
      
    } catch (error) {
      console.error('Error processing audio:', error);
      
      // Check if session is still active
      if (!geminiService.isSessionActive()) {
        console.log('Session closed during audio processing, attempting to reconnect');
        try {
          await initGeminiSession();
          setMessages(prev => [
            ...prev,
            {
              type: 'ai',
              content: 'Connection was reset. Please try recording your message again.',
              mediaType: 'text',
            },
          ]);
        } catch (reconnectError) {
          console.error('Failed to reconnect:', reconnectError);
          setMessages(prev => [
            ...prev,
            {
              type: 'ai',
              content: 'Connection lost. Please refresh the page and try again.',
              mediaType: 'text',
            },
          ]);
        }
      } else {
        setMessages(prev => [
          ...prev,
          {
            type: 'ai',
            content: 'Sorry, I encountered an error processing your audio. Please try again or type your message instead.',
            mediaType: 'text',
          },
        ]);
      }
    } finally {
      setIsProcessing(false);
      setIsRecording(false); // Ensure recording state is reset
    }
  };

  const reconnectSession = async () => {
    if (isConnected) return;
    
    try {
      await initGeminiSession();
    } catch (error) {
      console.error('Error reconnecting:', error);
    }
  };

  // Use a more robust message formatting function
  const formatMessageContent = (content: string) => {
    // Handle empty content
    if (!content || content.trim() === '') {
      return <span className="opacity-70 italic">Empty message</span>;
    }

    // Split by newlines and handle empty lines
    return content.split('\n').map((line, i) => (
      <span key={i} className="block">
        {line || <br />}
      </span>
    ));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden border border-secondary-light border-opacity-20">
        {/* Chat messages container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 min-h-[300px]"
          style={{ scrollBehavior: 'smooth' }}
        >
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`flex max-w-[70%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-primary-light ml-2' 
                      : 'bg-secondary-light mr-2'
                  }`}>
                    {message.type === 'user' ? (
                      <RxAvatar className="text-white text-xl" />
                    ) : (
                      <FaRobot className="text-white text-xl" />
                    )}
                  </div>
                  
                  <div className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                    <div 
                      className={`rounded-2xl p-4 shadow-sm chat-message ${
                        message.type === 'user'
                          ? 'bg-primary text-white'
                          : message.isPartial
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-[#E5F6FF] text-gray-800 border border-secondary-light border-opacity-20'
                      }`}
                    >
                      {formatMessageContent(message.content)}
                      
                      {message.isPartial && (
                        <div className="flex items-center gap-1 mt-2 text-gray-500">
                          <span className="animate-pulse">●</span>
                          <span className="animate-pulse animation-delay-100">●</span>
                          <span className="animate-pulse animation-delay-200">●</span>
                        </div>
                      )}
                    </div>
                    
                    <div className={`text-xs text-gray-500 mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                      {message.type === 'user' ? 'You' : 'HealthGuardian AI'} • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isStreamingResponse && messages.length === 0 && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl p-4 flex items-center gap-2">
                <span className="animate-pulse">●</span>
                <span className="animate-pulse animation-delay-100">●</span>
                <span className="animate-pulse animation-delay-200">●</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Chat input and controls */}
        <div className="border-t border-gray-200 p-4 md:p-6 bg-gray-50">
          {!isConnected && (
            <div className="text-center mb-4">
              <span className="text-danger bg-danger bg-opacity-10 px-3 py-1 rounded-full text-sm">
                Connection lost. 
              </span>
              <button 
                onClick={reconnectSession} 
                className="ml-2 text-primary font-medium hover:underline text-sm"
              >
                Reconnect
              </button>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row gap-3">
            {/* Input with expandable media options */}
            <div className="flex-1 flex">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your health question here..."
                  className="w-full px-4 py-3 pr-10 rounded-l-xl border-y border-l border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={isProcessing || !isConnected || isStreamingResponse}
                  ref={inputRef}
                />
                
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isProcessing || !isConnected || isStreamingResponse}
                  className="absolute right-0 top-0 bottom-0 px-3 text-primary hover:text-primary-dark disabled:text-gray-400 transition-colors"
                  aria-label="Send message"
                >
                  <AiOutlineSend className="text-xl" />
                </button>
              </div>
              
              <div className="flex">
                <button
                  onClick={toggleAudioRecording}
                  disabled={isProcessing || !isConnected || isStreamingResponse}
                  className={`px-3 py-2 border-y border-l border-gray-300 rounded-l-xl ${
                    isRecording ? 'bg-danger text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                  } transition-colors`}
                  aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                >
                  {isRecording ? <MdMicOff className="text-xl" /> : <MdMic className="text-xl" />}
                </button>
                
                <button
                  onClick={toggleVideo}
                  disabled={isProcessing || !isConnected || isStreamingResponse}
                  className={`px-3 py-2 border border-gray-300 rounded-r-xl ${
                    isVideoEnabled ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                  } transition-colors`}
                  aria-label={isVideoEnabled ? 'Disable video' : 'Enable video'}
                >
                  <MdOutlineVideoCall className="text-xl" />
                </button>
              </div>
            </div>
          </div>
          
          {isRecording && (
            <div className="mt-3 p-3 bg-danger bg-opacity-10 rounded-lg">
              <AudioRecorderComponent 
                isDisabled={false} 
                isRecording={isRecording}
                onRecordingToggle={toggleAudioRecording}
                onAudioReady={handleAudioUpload}
              />
            </div>
          )}
          
          <div className="flex items-center justify-center mt-4 text-gray-500 text-xs gap-1">
            <FaHeartbeat className="text-accent" />
            <span>For informational purposes only • Not a substitute for professional medical advice</span>
          </div>
        </div>
      </div>
      
      {/* Webcam displayed in bottom-right corner when enabled */}
      {isVideoEnabled && (
        <div className="fixed bottom-4 right-4 w-64 h-36 z-50 rounded-lg overflow-hidden shadow-lg border-2 border-primary">
          <WebcamComponent webcamRef={webcamRef} />
        </div>
      )}

      {/* Report Generator Modal */}
      {reportContent && (
        <ReportGenerator 
          reportContent={reportContent}
          onClose={handleCloseReport}
        />
      )}

      {/* Emergency Alert Modal */}
      {showEmergencyAlert && (
        <EmergencyAlert 
          message={emergencyMessage}
          onClose={handleCloseEmergencyAlert}
        />
      )}
    </div>
  );
};

export default ChatInterface; 