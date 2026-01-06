/**
 * Type definitions for the Emo-Tone application
 */

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle?: string;
}

export interface YouTubeApiResponse {
  videos: YouTubeVideo[];
  error?: string;
}

export interface CameraState {
  isActive: boolean;
  hasPermission: boolean | null;
  error: string | null;
}

export interface EmotionDetectionResult {
  emotion: import('./emotionMapping').Emotion;
  confidence: number;
  timestamp: number;
}

