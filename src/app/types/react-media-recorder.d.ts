declare module 'react-media-recorder' {
  interface MediaRecorderProps {
    audio?: boolean | MediaTrackConstraints;
    video?: boolean | MediaTrackConstraints;
    blobPropertyBag?: BlobPropertyBag;
    onStop?: (blobUrl: string, blob: Blob) => void;
  }

  interface MediaRecorderHookResult {
    status: string;
    startRecording: () => void;
    stopRecording: () => void;
    mediaBlobUrl: string | null;
    clearBlobUrl: () => void;
    error: string | null;
  }

  export function useReactMediaRecorder(props: MediaRecorderProps): MediaRecorderHookResult;
} 