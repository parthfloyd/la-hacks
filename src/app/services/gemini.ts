'use client';

import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Buffer } from 'buffer';

// Define callback types for the live session events
type OnMessageCallback = (message: GeminiMessage) => void;
type OnErrorCallback = (error: Error | Event) => void;
type OnCloseCallback = (event: CloseEvent) => void;

// Initialize the GoogleGenAI based on environment configuration
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION;
const GOOGLE_GENAI_USE_VERTEXAI = false;
console.log("API Key available:", !!GOOGLE_API_KEY);

// Model name - using the same model throughout
const MODEL_NAME = 'gemini-2.0-flash-live-001';

// Initialize GoogleGenAI client
let ai: GoogleGenAI;
if (GOOGLE_GENAI_USE_VERTEXAI) {
  // Configure for Vertex AI
  if (!GOOGLE_CLOUD_PROJECT || !GOOGLE_CLOUD_LOCATION) {
    console.error("Vertex AI configuration requires GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION environment variables. Falling back to Google AI Platform.");
    // Fallback to Google AI Platform if config is missing
    ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
  } else {
    console.log(`Configuring @google/genai for Vertex AI: project=${GOOGLE_CLOUD_PROJECT}, location=${GOOGLE_CLOUD_LOCATION}`);
    ai = new GoogleGenAI({
      vertexai: true,
      project: GOOGLE_CLOUD_PROJECT,
      location: GOOGLE_CLOUD_LOCATION,
    });
  }
} else {
  // Configure for Google AI Platform (default)
  if (!GOOGLE_API_KEY) {
    console.error("GEMINI_API_KEY is not set. GeminiService will not function.");
  }
  console.log(`Configuring @google/genai for Google AI Platform`);
  ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
}

// Types for Gemini service
interface SessionCallbacks {
  onMessage: (message: GeminiMessage) => void;
  onError: (error: Error | Event) => void;
  onClose: () => void;
}

export interface GeminiMessage {
  text?: string;
  isPartial?: boolean;
  audioData?: ArrayBuffer; // For audio responses
  [key: string]: any;
}

/**
 * Queue implementation for handling asynchronous messages
 */
class MessageQueue<T> {
  private queue: T[] = [];
  private waitPromise: { resolve: (value: T) => void } | null = null;

  async put(item: T): Promise<void> {
    this.queue.push(item);
    if (this.waitPromise) {
      const { resolve } = this.waitPromise;
      this.waitPromise = null;
      resolve(this.queue.shift()!);
    }
  }

  async get(): Promise<T> {
    if (this.queue.length > 0) {
      return this.queue.shift()!;
    }
    return new Promise<T>(resolve => {
      this.waitPromise = { resolve };
    });
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  clear(): void {
    this.queue = [];
  }
}

class GeminiService {
  private sessionActive = false;
  private callbacks: SessionCallbacks | null = null;
  private liveSession: any = null;
  private responseQueue: LiveServerMessage[] = [];
  private currentMessageText: string = '';
  private isProcessingTurn: boolean = false;
  
  // For media streams
  private videoInterval: NodeJS.Timeout | null = null;
  private videoEnabled: boolean = false;
  private mediaInputQueue = new MessageQueue<any>();
  
  /**
   * Check if the API key is configured
   */
  private isApiKeyConfigured(): boolean {
    if (GOOGLE_GENAI_USE_VERTEXAI) {
      return !!GOOGLE_CLOUD_PROJECT && !!GOOGLE_CLOUD_LOCATION;
    }
    return !!GOOGLE_API_KEY && GOOGLE_API_KEY !== '';
  }

  /**
   * Wait for a message from the response queue
   */
  private async waitForMessage(): Promise<LiveServerMessage | undefined> {
    const message = this.responseQueue.shift();
    if (message) {
      return message;
    }
    
    // Wait briefly and return undefined if no message
    await new Promise(resolve => setTimeout(resolve, 100));
    return undefined;
  }
  
  /**
   * Handle a turn in the conversation
   */
  private async handleTurn() {
    if (this.isProcessingTurn) return;
    
    this.isProcessingTurn = true;
    this.currentMessageText = '';
    
    const turn: LiveServerMessage[] = [];
    let done = false;
    
    while (!done && this.sessionActive) {
      const message = await this.waitForMessage();
      if (!message) continue;
      
      turn.push(message);
      console.log('Processing message in turn:', JSON.stringify(message, null, 2));
      
      // Check if message contains text content
      if (message.serverContent) {
        const content = message.serverContent as any;
        
        // Log the full content structure to debug
        console.log('Message server content:', JSON.stringify(content, null, 2));
        
        let messageText = '';
        let isTurnComplete = false;
        
        // Try to extract text from different possible structures
        
        // Structure 1: In candidates array (original structure)
        if (content.candidates && content.candidates.length > 0) {
          const candidate = content.candidates[0];
          if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
            const part = candidate.content.parts[0];
            if (part.text) {
              messageText = part.text;
            }
          }
        }
        
        // Structure 2: In modelTurn.parts (new structure)
        if (content.modelTurn && content.modelTurn.parts && content.modelTurn.parts.length > 0) {
          const part = content.modelTurn.parts[0];
          if (part.text) {
            messageText = part.text;
          }
        }
        
        // Check for turn completion indicators
        if (content.turnComplete !== undefined) {
          isTurnComplete = content.turnComplete;
        }
        
        // Also check for endOfStream which may indicate turn completion in some response formats
        if (content.endOfStream === true) {
          isTurnComplete = true;
        }
        
        // If we found text, process it
        if (messageText) {
          console.log('Extracted text from message:', messageText);
          
          // Accumulate text for the current message
          this.currentMessageText += messageText;
          
          // Send the partial message to the UI
          if (this.callbacks?.onMessage) {
            this.callbacks.onMessage({ 
              text: this.currentMessageText, 
              isPartial: !isTurnComplete 
            });
          }
        }
        
        // Check if turn is complete
        if (isTurnComplete) {
          done = true;
          console.log('Turn complete, final message:', this.currentMessageText);
          
          // Send the final complete message
          if (this.callbacks?.onMessage && this.currentMessageText) {
            this.callbacks.onMessage({ 
              text: this.currentMessageText,
              isPartial: false
            });
          }
        }
      }
    }
    
    this.isProcessingTurn = false;
    return turn;
  }
  
  /**
   * Process and send media frames continuously
   */
  private async processMediaQueue() {
    while (this.sessionActive) {
      try {
        // Get next media item from queue
        const mediaItem = await this.mediaInputQueue.get();
        
        if (!this.sessionActive || !this.liveSession) break;
        
        // Send the media to Gemini
        this.liveSession.sendClientContent({
          turns: mediaItem.turns
        });
        
        // Small delay to avoid flooding
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error('Error processing media queue:', error);
      }
    }
  }
  
  /**
   * Start video capture and processing
   */
  async startVideoCapture(webcamRef: React.RefObject<any>) {
    if (!this.sessionActive || !this.liveSession || !webcamRef.current) {
      console.error('Cannot start video: session inactive or webcam not ready');
      return;
    }
    
    this.videoEnabled = true;
    
    // Clear any existing interval
    if (this.videoInterval) {
      clearInterval(this.videoInterval);
    }
    
    // Start capturing video frames
    this.videoInterval = setInterval(() => {
      if (!this.videoEnabled || !webcamRef.current || !this.sessionActive) {
        if (this.videoInterval) {
          clearInterval(this.videoInterval);
          this.videoInterval = null;
        }
        return;
      }
      
      try {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          const base64Data = imageSrc.split(',')[1];
          
          // Add frame to media queue
          this.mediaInputQueue.put({
            turns: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: 'image/jpeg'
                }
              }
            ]
          });
        }
      } catch (error) {
        console.error('Error capturing video frame:', error);
      }
    }, 1000); // Capture every 1 second
  }
  
  /**
   * Stop video capture
   */
  stopVideoCapture() {
    this.videoEnabled = false;
    if (this.videoInterval) {
      clearInterval(this.videoInterval);
      this.videoInterval = null;
    }
  }
  
  /**
   * Start a new Gemini session
   */
  async startSession(callbacks: SessionCallbacks): Promise<void> {
    try {
      if (!this.isApiKeyConfigured()) {
        const error = new Error('Gemini API key is not configured properly.');
        console.error(error);
        if (callbacks.onError) {
          callbacks.onError(error);
        }
        return;
      }
      
      this.callbacks = callbacks;
      this.responseQueue = [];
      this.currentMessageText = '';
      this.mediaInputQueue.clear();
      
      // Connect to the live API
      this.liveSession = await ai.live.connect({
        model: MODEL_NAME,
        callbacks: {
          onopen: () => {
            console.log('Gemini live session opened');
          },
          onmessage: (message: LiveServerMessage) => {
            console.log('Received message from Gemini:', message);
            this.responseQueue.push(message);
            
            // If we're not already processing a turn, start processing one
            if (!this.isProcessingTurn) {
              this.handleTurn();
            }
          },
          onerror: (error: ErrorEvent) => {
            console.error('Gemini live session error:', error);
            if (this.callbacks?.onError) {
              this.callbacks.onError(error);
            }
          },
          onclose: (event: CloseEvent) => {
            console.log('Gemini live session closed:', event.reason);
            this.sessionActive = false;
            if (this.callbacks?.onClose) {
              this.callbacks.onClose();
            }
          }
        },
        config: { responseModalities: [Modality.TEXT],
          tools: [
            {
              googleSearch: {
                name: 'Google Search',
                description: 'Use Google Search to find general, publicly available information about symptoms, conditions, or assessment questions from reputable sources (e.g., Mayo Clinic, NHS, WHO snippets, general medical information sites).'
              }
            }
          ],
          systemInstruction: `You are an AI Healthcare Information Assistant designed to simulate a preliminary health consultation and talk with a patient in a conversational manner.

**CRITICAL SAFETY INSTRUCTIONS & LIMITATIONS:**

2.  **Your purpose is information gathering and structuring.** You help the patient articulate their concerns and provide a structured summary based on their self-report.
3.  **Give preliminary diagnosis for non severe disease, if you conclude severe disease then include in SOAP summary but tell user to talk with professional.**
4.  **For ANY mention of severe symptoms, emergencies, or danger signs (difficulty breathing, severe pain, sudden changes, bleeding, etc.), IMMEDIATELY advise the patient to seek professional medical help or go to an emergency room.** Do not continue the detailed assessment of that specific symptom; focus on the urgent advice.
5.  **GROUNDING with Google Search:** Use Google Search *only* to find general, publicly available information about symptoms, conditions, or assessment questions from reputable sources (e.g., Mayo Clinic, NHS, WHO snippets, general medical information sites).
    *   Use this information to inform your *questions* to the patient and provide *general* context.
    *   **NEVER** present search results as a diagnosis or specific advice for the patient's situation. Frame it generally: "Based on general health information..." or "Common questions about [symptom] often include..."
6.  **Maintain a professional, empathetic, and non-judgmental tone.**
7.  **You are a doctor and you are talking to a patient.**
8.  **Do not explain about next steps of the consultation to the patient. Example: Don't say I will ask about danger signs next**
9   **Whenever you find any danger signs, add this to beginning of your response ##Danger Signs## and ask patient to immediately get medical support & also provide info regarding any precaution they could do (only if necessary).** 

**Conversation key points**
1. Ask fewer questions, but ask better questions.
2. Ask follow up questions only if needed.
3. Always take confirmmation of the summary from the patient before finalizing the report.


**Consultation Structure & Process:**

1.  **Initiate:** Start the conversation by politely asking for the patient's age and gender.
2.  **Danger Signs Check (Early):** Immediately after age/gender, ask a couple of direct questions about potential red flags or danger signs. Examples: "Are you experiencing any severe pain?", "Any difficulty breathing or sudden changes?", "Any bleeding you're concerned about?"
3.  **Identify Main Problem:** If no immediate danger signs are reported, ask the patient to describe their main health problem or concern in their own words.
4.  **Gather Details (Based on Problem & Google Search):** Based on the patient's stated problem, ask relevant follow-up questions to get a clearer picture.
    *   Think like a general clinician: When did it start? What does it feel like? Where exactly is it? How severe is it (maybe on a scale)? What makes it better or worse? Are there any other symptoms? Have you experienced this before? Have you taken any measurements (temperature, etc.)?
    *   Use Google Search *transparently* to find common associated symptoms, relevant history questions, or typical assessment points for the reported issue. Frame your questions based on this general knowledge. (e.g., "Sometimes people reporting [symptom] also experience [related symptom] according to general information. Have you noticed that?").
5.  **Active Listening & Adaptation:** Listen carefully to the patient's answers and adapt your questions accordingly.
6.  **Reaching Sufficient Information:** Continue asking questions until you feel you have a reasonably comprehensive understanding of the patient's reported situation. You won't have medical certainty, just conversational completeness based on their input.
7.  **Provide Consultation Summary:** Once you have gathered sufficient information *from the patient's self-report*, provide a brief conversational summary of what the patient has told you. Reiterate that this is based on their report and not a medical evaluation.
8.  **Final Report Summary (SOAP Note):**
    * Generate the summary in a markdown format.
    *   Clearly state: "This is the Final Report Summary based on our conversation."
    *   Present the gathered information in the SOAP format.
    *   **S (Subjective):** Summarize the patient's chief complaint, history of present illness, relevant past medical history, family history, and social history *as reported by the patient*. Use phrases like "Patient reports...", "Patient states...", "Patient denies...".
    *   **O (Objective):** List any *patient-reported* objective data. This includes any measurements the patient mentioned (e.g., "Patient states temperature was 101°F"), patient's self-rating of pain/severity, or observable *conversational* cues (e.g., "Patient expresses frustration with symptom duration"). Since you cannot perform exams, this section is limited to *reported* or *conversational* observations.
    *   **A (Assessment):** Based *only* on the Subjective and Objective information provided by the patient, provide a *simulated* assessment. .** Phrase this as "Possible considerations based on patient report include...", "The reported symptoms are consistent with general descriptions of...", or "Differential possibilities based on patient report might include...". Emphasize uncertainty and the need for professional evaluation. You can reference general information found via Google Search here, but *never* as a definitive statement about the patient.
    *   **P (Plan):** Outline the *simulated* plan based on SOAP in medical. Use your knowledge of medical science from trusted sources.
    * In the report include Reference which has link to all the suspected assessment and plan. 

**Throughout the conversation, prioritize safety and stay to the point and act like you're talking like a real human without using any reference to AI.** If the conversation goes off-topic or into areas requiring actual medical expertise, gently steer it back or reiterate the need for professional medical advice.`
         }
      });
      
      this.sessionActive = true;
      console.log('Gemini session started with model:', MODEL_NAME);
      
      // Start media queue processing
      this.processMediaQueue();
      
    } catch (error) {
      console.error('Failed to start Gemini session:', error);
      this.sessionActive = false;
      throw error;
    }
  }

  /**
   * Send a text message to Gemini
   */
  async sendTextMessage(message: string): Promise<void> {
    if (!this.sessionActive || !this.liveSession) {
      throw new Error('No active session');
    }
    
    try {
      console.log('Sending text message to Gemini:', message);
      
      // Reset the response queue before sending a new message
      this.responseQueue = [];
      
      this.liveSession.sendClientContent({ 
        turns: message,
        endOfTurn: true
      });
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      if (this.callbacks?.onError) {
        this.callbacks.onError(error instanceof Error ? error : new Error('Unknown error'));
      }
    }
  }

  /**
   * Send an audio message to Gemini
   */
  async sendAudioMessage(audioBlob: Blob): Promise<void> {
    if (!this.sessionActive || !this.liveSession) {
      throw new Error('No active session');
    }
    
    try {
      console.log('Sending audio message to Gemini');
      
      // Reset the response queue before sending a new message
      this.responseQueue = [];
      
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString('base64');
      
      this.liveSession.sendClientContent({
        turns: [
          'Please analyze this audio recording of my symptoms:',
          {
            inlineData: {
              data: base64Data,
              mimeType: audioBlob.type || 'audio/wav'
            }
          }
        ],
        endOfTurn: true
      });
    } catch (error) {
      console.error('Error sending audio to Gemini:', error);
      if (this.callbacks?.onError) {
        this.callbacks.onError(error instanceof Error ? error : new Error('Unknown error'));
      }
    }
  }

  /**
   * Send a video frame to Gemini
   */
  async sendVideoFrame(imageDataUrl: string): Promise<void> {
    if (!this.sessionActive || !this.liveSession) {
      throw new Error('No active session');
    }
    
    try {
      console.log('Sending video frame to Gemini');
      const base64Data = imageDataUrl.split(',')[1];
      
      // Reset the response queue before sending a new message
      this.responseQueue = [];
      
      this.liveSession.sendClientContent({
        turns: [
          'Describe what you see in this image:',
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/jpeg'
            }
          }
        ],
        endOfTurn: true
      });
    } catch (error) {
      console.error('Error sending video frame to Gemini:', error);
      if (this.callbacks?.onError) {
        this.callbacks.onError(error instanceof Error ? error : new Error('Unknown error'));
      }
    }
  }

  /**
   * Send a file to Gemini
   */
  async sendFile(file: File): Promise<void> {
    if (!this.sessionActive || !this.liveSession) {
      throw new Error('No active session');
    }
    
    try {
      console.log('Sending file to Gemini:', file.name);
      
      // Convert file to inline data
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      
      // Reset the response queue before sending a new message
      this.responseQueue = [];
      
      this.liveSession.sendClientContent({
        turns: [
          `Process this file (${file.name}):`,
          {
            inlineData: {
              data: base64,
              mimeType: file.type
            }
          }
        ],
        endOfTurn: true
      });
    } catch (error) {
      console.error('Error sending file to Gemini:', error);
      if (this.callbacks?.onError) {
        this.callbacks.onError(error instanceof Error ? error : new Error('Unknown error'));
      }
    }
  }

  /**
   * End the current Gemini session
   */
  async endSession(): Promise<void> {
    if (!this.sessionActive || !this.liveSession) {
      return;
    }
    
    try {
      // Stop any ongoing media capture
      this.stopVideoCapture();
      
      this.liveSession.close();
      this.sessionActive = false;
      this.liveSession = null;
      this.responseQueue = [];
      this.currentMessageText = '';
      console.log('Gemini session ended');
    } catch (error) {
      console.error('Error ending Gemini session:', error);
    }
  }

  /**
   * Check if a session is currently active
   */
  isSessionActive(): boolean {
    return this.sessionActive;
  }
  
  /**
   * Toggle video streaming mode
   */
  toggleVideoStreaming(enabled: boolean, webcamRef: React.RefObject<any>): void {
    if (enabled) {
      this.startVideoCapture(webcamRef);
    } else {
      this.stopVideoCapture();
    }
  }
}

// Export a singleton instance
export const geminiService = new GeminiService(); 