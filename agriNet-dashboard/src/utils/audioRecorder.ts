/**
 * Browser Audio Recording Utility using native MediaRecorder API
 */

export interface RecordedAudioResult {
  base64Data: string;
  mimeType: string;
  blob: Blob;
  durationMs: number;
}

let mediaStream: MediaStream | null = null;
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let startTime: number = 0;

/**
 * Check if the browser supports Audio Recording
 */
export function isAudioRecordingSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!navigator.mediaDevices &&
    !!navigator.mediaDevices.getUserMedia &&
    typeof MediaRecorder !== 'undefined'
  );
}

/**
 * Detect the best supported audio MIME type for MediaRecorder
 */
export function getSupportedMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return 'audio/webm';

  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/aac',
    'audio/ogg;codecs=opus',
    'audio/ogg',
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return '';
}

/**
 * Convert a Blob to Base64 (without the data URL prefix)
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Strip data:audio/...;base64, prefix
        const base64 = reader.result.split(',')[1] || reader.result;
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64 string'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Start recording audio from the user's microphone
 */
export async function startAudioRecording(): Promise<void> {
  if (!isAudioRecordingSupported()) {
    throw new Error('Audio recording is not supported in this browser.');
  }

  // Release any previous stream
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }

  audioChunks = [];
  startTime = Date.now();

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const mimeType = getSupportedMimeType();
    const options: MediaRecorderOptions = mimeType ? { mimeType } : {};

    mediaRecorder = new MediaRecorder(mediaStream, options);

    mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    // Collect data chunks every 250ms
    mediaRecorder.start(250);
  } catch (error) {
    console.error('Error starting audio recording:', error);
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      mediaStream = null;
    }
    throw error;
  }
}

/**
 * Stop recording and return the encoded Base64 audio payload
 */
export function stopAudioRecording(): Promise<RecordedAudioResult> {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      reject(new Error('No active audio recording found.'));
      return;
    }

    const durationMs = Date.now() - startTime;
    const resolvedMimeType = mediaRecorder.mimeType || getSupportedMimeType() || 'audio/webm';

    mediaRecorder.onstop = async () => {
      try {
        const audioBlob = new Blob(audioChunks, { type: resolvedMimeType });
        const base64Data = await blobToBase64(audioBlob);

        // Stop all audio tracks to turn off the microphone indicator
        if (mediaStream) {
          mediaStream.getTracks().forEach((track) => track.stop());
          mediaStream = null;
        }

        mediaRecorder = null;
        audioChunks = [];

        resolve({
          base64Data,
          mimeType: resolvedMimeType.split(';')[0], // e.g. audio/webm or audio/mp4
          blob: audioBlob,
          durationMs,
        });
      } catch (err) {
        reject(err);
      }
    };

    // Trigger stop
    mediaRecorder.stop();
  });
}

/**
 * Cancel and discard current recording session
 */
export function cancelAudioRecording(): void {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    try {
      mediaRecorder.stop();
    } catch {
      // Ignore
    }
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }

  mediaRecorder = null;
  audioChunks = [];
}
