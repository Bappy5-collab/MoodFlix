'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Emotion, mapExpressionToEmotion, emotionMapping } from '@/lib/emotionMapping';

interface CameraFeedProps {
  onEmotionDetected: (emotion: Emotion, confidence: number) => void;
  onError: (error: string) => void;
  isActive: boolean;
  onStop: () => void;
}

/**
 * Camera feed component with real-time emotion detection
 * Uses face-api.js for local, privacy-preserving facial expression analysis
 */
export default function CameraFeed({ 
  onEmotionDetected, 
  onError, 
  isActive,
  onStop 
}: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [faceApiModule, setFaceApiModule] = useState<typeof import('@vladmandic/face-api') | null>(null);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        
        // Dynamic import of face-api.js (only runs in browser)
        const faceapi = await import('@vladmandic/face-api');
        setFaceApiModule(faceapi);
        
        // Load models from CDN (more reliable than local hosting)
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.14/model';
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        
        setIsModelLoaded(true);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load face-api models:', err);
        onError('Failed to load emotion detection models. Please refresh and try again.');
        setIsLoading(false);
      }
    };

    loadModels();
  }, [onError]);

  // Start camera stream
  const startCamera = useCallback(async () => {
    if (!videoRef.current || !isModelLoaded) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    } catch (err) {
      console.error('Camera access error:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          onError('Camera access was denied. Please allow camera access in your browser settings.');
        } else if (err.name === 'NotFoundError') {
          onError('No camera found. Please connect a camera and try again.');
        } else {
          onError('Failed to access camera. Please check your permissions.');
        }
      }
    }
  }, [isModelLoaded, onError]);

  // Stop camera and cleanup
  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCurrentEmotion(null);
    setConfidence(0);
    onStop();
  }, [onStop]);

  // Detect emotions in real-time
  const detectEmotions = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !faceApiModule || !isActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Ensure video is ready
    if (video.readyState !== 4) {
      animationRef.current = requestAnimationFrame(detectEmotions);
      return;
    }

    try {
      // Detect face with expressions
      const detection = await faceApiModule
        .detectSingleFace(video, new faceApiModule.TinyFaceDetectorOptions({
          inputSize: 320,
          scoreThreshold: 0.5,
        }))
        .withFaceExpressions();

      // Clear previous drawings
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      if (detection) {
        // Draw face detection box
        if (ctx) {
          const { x, y, width, height } = detection.detection.box;
          ctx.strokeStyle = 'var(--accent-primary)';
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, width, height);
          
          // Draw corner accents
          const cornerLength = 15;
          ctx.strokeStyle = emotionMapping[currentEmotion || 'neutral'].color;
          ctx.lineWidth = 4;
          
          // Top-left
          ctx.beginPath();
          ctx.moveTo(x, y + cornerLength);
          ctx.lineTo(x, y);
          ctx.lineTo(x + cornerLength, y);
          ctx.stroke();
          
          // Top-right
          ctx.beginPath();
          ctx.moveTo(x + width - cornerLength, y);
          ctx.lineTo(x + width, y);
          ctx.lineTo(x + width, y + cornerLength);
          ctx.stroke();
          
          // Bottom-left
          ctx.beginPath();
          ctx.moveTo(x, y + height - cornerLength);
          ctx.lineTo(x, y + height);
          ctx.lineTo(x + cornerLength, y + height);
          ctx.stroke();
          
          // Bottom-right
          ctx.beginPath();
          ctx.moveTo(x + width - cornerLength, y + height);
          ctx.lineTo(x + width, y + height);
          ctx.lineTo(x + width, y + height - cornerLength);
          ctx.stroke();
        }

        // Map expressions to our emotion types
        const expressions = detection.expressions;
        const emotion = mapExpressionToEmotion({
          happy: expressions.happy,
          sad: expressions.sad,
          neutral: expressions.neutral,
          surprised: expressions.surprised,
          angry: expressions.angry,
          fearful: expressions.fearful,
          disgusted: expressions.disgusted,
        });

        const emotionConfidence = expressions[emotion];
        
        setCurrentEmotion(emotion);
        setConfidence(emotionConfidence);
        onEmotionDetected(emotion, emotionConfidence);
      }
    } catch (err) {
      console.error('Detection error:', err);
    }

    // Continue detection loop (throttled to ~15fps for performance)
    animationRef.current = requestAnimationFrame(() => {
      setTimeout(detectEmotions, 66);
    });
  }, [faceApiModule, isActive, currentEmotion, onEmotionDetected]);

  // Start/stop camera based on isActive and model state
  useEffect(() => {
    if (isActive && isModelLoaded) {
      startCamera();
    } else if (!isActive) {
      stopCamera();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, isModelLoaded, startCamera, stopCamera]);

  // Start emotion detection when video plays
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      detectEmotions();
    };

    video.addEventListener('playing', handlePlay);
    return () => video.removeEventListener('playing', handlePlay);
  }, [detectEmotions]);

  return (
    <div className="camera-container">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <p>Loading emotion detection models...</p>
        </div>
      )}

      <div className="video-wrapper">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera-video"
        />
        <canvas ref={canvasRef} className="detection-canvas" />
        
        {currentEmotion && isActive && (
          <div 
            className="emotion-badge"
            style={{ '--emotion-color': emotionMapping[currentEmotion].color } as React.CSSProperties}
          >
            <span className="emotion-emoji">{emotionMapping[currentEmotion].emoji}</span>
            <span className="emotion-label">{emotionMapping[currentEmotion].label}</span>
            <span className="emotion-confidence">{Math.round(confidence * 100)}%</span>
          </div>
        )}
      </div>

      {isActive && (
        <button className="btn btn-danger stop-button" onClick={stopCamera}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
          Stop Camera
        </button>
      )}

      <style jsx>{`
        .camera-container {
          position: relative;
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
        }

        .loading-overlay {
          position: absolute;
          inset: 0;
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          z-index: 10;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 3px solid var(--bg-tertiary);
          border-top-color: var(--accent-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-overlay p {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .video-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 4/3;
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 2px solid var(--border-color);
          box-shadow: var(--shadow-lg);
        }

        .camera-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1);
        }

        .detection-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transform: scaleX(-1);
          pointer-events: none;
        }

        .emotion-badge {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(10px);
          padding: 0.75rem 1.25rem;
          border-radius: var(--radius-xl);
          border: 2px solid var(--emotion-color);
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
          animation: fadeIn 0.3s ease;
        }

        .emotion-emoji {
          font-size: 1.5rem;
        }

        .emotion-label {
          font-weight: 600;
          color: var(--emotion-color);
          font-size: 1rem;
        }

        .emotion-confidence {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--text-secondary);
          background: var(--bg-tertiary);
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
        }

        .stop-button {
          margin-top: 1rem;
          width: 100%;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .camera-container {
            max-width: 100%;
          }

          .emotion-badge {
            padding: 0.5rem 1rem;
            bottom: 0.75rem;
          }

          .emotion-emoji {
            font-size: 1.25rem;
          }

          .emotion-label {
            font-size: 0.9rem;
          }

          .emotion-confidence {
            font-size: 0.75rem;
            padding: 0.2rem 0.4rem;
          }

          .loading-spinner {
            width: 40px;
            height: 40px;
          }

          .loading-overlay p {
            font-size: 0.85rem;
          }
        }

        @media (max-width: 480px) {
          .emotion-badge {
            padding: 0.4rem 0.75rem;
            gap: 0.35rem;
            bottom: 0.5rem;
          }

          .emotion-emoji {
            font-size: 1.1rem;
          }

          .emotion-label {
            font-size: 0.8rem;
          }

          .emotion-confidence {
            font-size: 0.7rem;
          }

          .stop-button {
            font-size: 0.9rem;
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}

