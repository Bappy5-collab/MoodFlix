'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import ConsentModal from '@/components/ConsentModal';
import CameraFeed from '@/components/CameraFeed';
import EmotionDisplay from '@/components/EmotionDisplay';
import VideoGrid from '@/components/VideoGrid';
import VideoPlayer from '@/components/VideoPlayer';
import { Emotion, getRandomKeyword } from '@/lib/emotionMapping';
import { YouTubeVideo } from '@/lib/types';

/**
 * Main application page for Emo-Tone
 * Mood-Based YouTube Video Recommender
 */
export default function Home() {
  // Consent and camera state
  const [showConsent, setShowConsent] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanCountdown, setScanCountdown] = useState(0);

  // Emotion detection state
  const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string | null>(null);
  const lastSearchedEmotion = useRef<Emotion | null>(null);

  // Video state
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [hasLoadedVideos, setHasLoadedVideos] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Debounce timer for emotion changes
  const emotionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stableEmotionRef = useRef<Emotion | null>(null);
  const stableCountRef = useRef(0);

  /**
   * Fetch YouTube videos based on emotion keyword
   * Accumulates videos during the 5-minute scanning period
   */
  const fetchVideos = useCallback(async (keyword: string) => {
    setIsLoadingVideos(true);
    setVideoError(null);

    try {
      const response = await fetch(`/api/youtube?q=${encodeURIComponent(keyword)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch videos');
      }

      // Accumulate videos, avoid duplicates
      setVideos(prevVideos => {
        const existingIds = new Set(prevVideos.map(v => v.id));
        const newVideos = data.videos.filter((v: YouTubeVideo) => !existingIds.has(v.id));
        return [...prevVideos, ...newVideos];
      });
      setHasLoadedVideos(true);
      
    } catch (error) {
      console.error('Error fetching videos:', error);
      setVideoError(error instanceof Error ? error.message : 'Failed to fetch videos');
    } finally {
      setIsLoadingVideos(false);
    }
  }, []);

  // Track last fetch time for rate limiting
  const lastFetchTimeRef = useRef<number>(0);

  /**
   * Handle emotion detection from camera feed
   * Continuously fetches videos based on detected mood during scanning
   */
  const handleEmotionDetected = useCallback((emotion: Emotion, confidence: number) => {
    // Only process high confidence detections (90% or higher)
    if (confidence < 0.9) return;

    // Check for stable emotion (same emotion for 2 consecutive detections)
    if (emotion === stableEmotionRef.current) {
      stableCountRef.current++;
    } else {
      stableEmotionRef.current = emotion;
      stableCountRef.current = 1;
    }

    // Require 2 stable high-confidence detections
    if (stableCountRef.current < 2) return;

    // Update current emotion for display
    setCurrentEmotion(emotion);

    // Rate limit: fetch every 3 seconds to avoid API overload
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 3000) return;

    // Fetch videos for current mood
    if (emotionTimerRef.current) {
      clearTimeout(emotionTimerRef.current);
    }

    emotionTimerRef.current = setTimeout(() => {
      const keyword = getRandomKeyword(emotion);
      setSearchKeyword(keyword);
      fetchVideos(keyword);
      lastSearchedEmotion.current = emotion;
      lastFetchTimeRef.current = Date.now();
    }, 300);
  }, [fetchVideos]);

  /**
   * Handle consent acceptance - start camera
   */
  const handleAcceptConsent = useCallback(() => {
    setShowConsent(false);
    setCameraActive(true);
    setIsScanning(true);
    startCountdown();
  }, []);

  // Scan duration: 5 seconds
  const SCAN_DURATION = 5;

  /**
   * Start 5 minute countdown
   */
  const startCountdown = useCallback(() => {
    setScanCountdown(SCAN_DURATION);
    
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    
    countdownTimerRef.current = setInterval(() => {
      setScanCountdown(prev => {
        if (prev <= 1) {
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
          }
          // Stop scanning when time is up
          setCameraActive(false);
          setIsScanning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  /**
   * Handle consent decline - show alternative UI
   */
  const handleDeclineConsent = useCallback(() => {
    setShowConsent(false);
    setCameraError('Camera access was declined. You can refresh the page to try again.');
  }, []);

  /**
   * Handle camera stop
   */
  const handleCameraStop = useCallback(() => {
    setCameraActive(false);
    setIsScanning(false);
    if (emotionTimerRef.current) {
      clearTimeout(emotionTimerRef.current);
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
  }, []);

  /**
   * Handle camera errors
   */
  const handleCameraError = useCallback((error: string) => {
    setCameraError(error);
    setCameraActive(false);
    setIsScanning(false);
  }, []);

  /**
   * Start scanning for new songs
   */
  const handleScanAgain = useCallback(() => {
    setCameraError(null);
    setCameraActive(true);
    setIsScanning(true);
    setCurrentEmotion(null);
    setSearchKeyword(null);
    setVideos([]);
    setHasLoadedVideos(false);
    lastSearchedEmotion.current = null;
    stableEmotionRef.current = null;
    stableCountRef.current = 0;
    lastFetchTimeRef.current = 0;
    startCountdown();
  }, [startCountdown]);

  /**
   * Handle manual search
   */
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchKeyword(searchQuery.trim());
      setCurrentEmotion(null);
      fetchVideos(searchQuery.trim());
      // Stop camera if running
      if (cameraActive) {
        setCameraActive(false);
        setIsScanning(false);
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
        }
      }
    }
  }, [searchQuery, fetchVideos, cameraActive]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (emotionTimerRef.current) {
        clearTimeout(emotionTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  return (
    <main className="main-container">
      {/* Consent Modal */}
      {showConsent && (
        <ConsentModal
          onAccept={handleAcceptConsent}
          onDecline={handleDeclineConsent}
        />
      )}

      {/* Header */}
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🎬</span>
          <h1 className="logo-text">
            Mood<span className="text-gradient">Flix</span>
          </h1>
        </div>
        <p className="tagline">
          Hindi & Bangla songs based on your mood
        </p>
      </header>

      {/* Main Content */}
      <div className="content-grid">
        {/* Camera Section */}
        <section className="camera-section">
          <div className="section-header">
            <h2>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Emotion Detection
              {isScanning && scanCountdown > 0 && (
                <span className="countdown-badge">{scanCountdown}s</span>
              )}
            </h2>
          </div>

          {cameraError ? (
            <div className="error-card">
              <div className="error-icon">⚠️</div>
              <p>{cameraError}</p>
              <button className="btn btn-primary" onClick={handleScanAgain}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M23 4v6h-6M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                Try Again
              </button>
            </div>
          ) : cameraActive ? (
            <CameraFeed
              onEmotionDetected={handleEmotionDetected}
              onError={handleCameraError}
              isActive={cameraActive}
              onStop={handleCameraStop}
            />
          ) : !showConsent && (
            <div className="camera-placeholder">
              {hasLoadedVideos ? (
                <>
                  <div className="placeholder-icon">✅</div>
                  <p>Songs loaded successfully!</p>
                  <p className="sub-text">Click below to scan your face again for new songs</p>
                </>
              ) : (
                <>
                  <div className="placeholder-icon">📷</div>
                  <p>Camera is not active</p>
                </>
              )}
              <button className="btn btn-primary scan-again-btn" onClick={handleScanAgain}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M23 4v6h-6M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                🔍 Scan Again (5 sec)
              </button>
            </div>
          )}

          {/* Scanning status with big countdown */}
          {isScanning && scanCountdown > 0 && (
            <div className="scanning-status">
              <div className="countdown-timer">
                <div className="countdown-number">{scanCountdown}</div>
                <div className="countdown-label">seconds</div>
              </div>
              <div className="scanning-text">
                <div className="scanning-indicator" />
                <span>Scanning your expression...</span>
              </div>
              {currentEmotion && (
                <div className="detected-mood-status">
                  <span className="mood-label">Detected Mood:</span>
                  <span className={`mood-value mood-${currentEmotion}`}>
                    {currentEmotion === 'happy' && '😊 Happy'}
                    {currentEmotion === 'sad' && '😢 Sad'}
                    {currentEmotion === 'neutral' && '😐 Neutral'}
                  </span>
                </div>
              )}
              {videos.length > 0 && (
                <div className="video-count-status">
                  <span>{videos.length} videos loaded</span>
                </div>
              )}
            </div>
          )}

          {/* Privacy notice */}
          <div className="privacy-notice">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>All processing happens locally in your browser</span>
          </div>
        </section>

        {/* Videos Section */}
        <section className="videos-section">
          <div className="section-header">
            <h2>
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" className="youtube-icon">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              {currentEmotion === 'happy' ? '💕 Romantic Songs' : 
               currentEmotion === 'sad' ? '💔 Sad Songs' : 
               currentEmotion === 'neutral' ? '🎵 Romantic & Mix Songs' : 
               '🎵 Recommended Songs'}
            </h2>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" className="search-icon">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search any song... (Hindi, Bangla, English)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn" disabled={!searchQuery.trim()}>
                Search
              </button>
            </div>
          </form>

          {/* Emotion Display */}
          <EmotionDisplay emotion={currentEmotion} searchKeyword={searchKeyword} />

          {/* Video Grid */}
          <VideoGrid
            videos={videos}
            isLoading={isLoadingVideos}
            error={videoError}
            onVideoSelect={setSelectedVideo}
          />
        </section>
      </div>

      {/* Video Player Modal */}
      <VideoPlayer video={selectedVideo} onClose={() => setSelectedVideo(null)} />

      {/* Footer */}
      <footer className="footer">
        <div className="powered-by">
          <span>🚀 Powered by</span>
          <span className="developer-name">Chandon Kumar</span>
        </div>
        <p>
          Built with privacy in mind • No face data stored or uploaded
        </p>
      </footer>

      <style jsx>{`
        .main-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 2rem 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .logo-icon {
          font-size: 2.5rem;
        }

        .logo-text {
          font-size: 2.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .tagline {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 2rem;
          flex: 1;
        }

        .camera-section,
        .videos-section {
          display: flex;
          flex-direction: column;
        }

        .section-header {
          margin-bottom: 1.5rem;
        }

        .section-header h2 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .section-header .youtube-icon {
          color: var(--youtube-red);
        }

        .search-form {
          margin-bottom: 1.5rem;
        }

        .search-input-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 0.5rem 0.75rem;
          transition: all 0.3s ease;
        }

        .search-input-wrapper:focus-within {
          border-color: var(--accent-primary);
          box-shadow: 0 0 20px rgba(0, 245, 212, 0.2);
        }

        .search-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 1rem;
          font-family: var(--font-sans);
          outline: none;
          padding: 0.5rem 0;
        }

        .search-input::placeholder {
          color: var(--text-muted);
        }

        .search-btn {
          background: linear-gradient(135deg, var(--accent-primary) 0%, #00c4a7 100%);
          color: var(--bg-primary);
          border: none;
          padding: 0.625rem 1.25rem;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .search-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0, 245, 212, 0.4);
        }

        .search-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .countdown-badge {
          background: var(--accent-primary);
          color: var(--bg-primary);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-xl);
          font-size: 0.9rem;
          font-weight: 700;
          font-family: var(--font-mono);
          margin-left: auto;
        }

        .error-card {
          background: var(--bg-card);
          border: 1px solid rgba(255, 107, 107, 0.3);
          border-radius: var(--radius-lg);
          padding: 2rem;
          text-align: center;
        }

        .error-card .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .error-card p {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .camera-placeholder {
          background: var(--bg-card);
          border: 1px dashed var(--border-color);
          border-radius: var(--radius-lg);
          padding: 3rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .placeholder-icon {
          font-size: 4rem;
          opacity: 0.8;
        }

        .camera-placeholder p {
          color: var(--text-secondary);
          margin: 0;
        }

        .camera-placeholder .sub-text {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .scan-again-btn {
          font-size: 1.1rem;
          padding: 1.25rem 2rem;
          margin-top: 0.5rem;
          animation: pulse-btn 2s ease-in-out infinite;
        }

        @keyframes pulse-btn {
          0%, 100% { box-shadow: 0 4px 20px rgba(0, 245, 212, 0.3); }
          50% { box-shadow: 0 4px 30px rgba(0, 245, 212, 0.5); }
        }

        .scanning-status {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-top: 1rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(0, 245, 212, 0.15) 0%, rgba(0, 200, 180, 0.1) 100%);
          border: 2px solid var(--accent-primary);
          border-radius: var(--radius-lg);
          box-shadow: 0 0 30px rgba(0, 245, 212, 0.2);
        }

        .countdown-timer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .countdown-number {
          font-size: 4rem;
          font-weight: 700;
          font-family: var(--font-mono);
          color: var(--accent-primary);
          line-height: 1;
          text-shadow: 0 0 20px rgba(0, 245, 212, 0.5);
          animation: pulse-number 1s ease-in-out infinite;
        }

        .countdown-label {
          font-size: 0.9rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .scanning-text {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.95rem;
          color: var(--accent-primary);
        }

        .scanning-indicator {
          width: 12px;
          height: 12px;
          background: var(--accent-primary);
          border-radius: 50%;
          animation: pulse 1s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        @keyframes pulse-number {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .detected-mood-status {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          background: var(--bg-card);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
        }

        .mood-label {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .mood-value {
          font-size: 1.1rem;
          font-weight: 700;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-sm);
        }

        .mood-happy {
          background: linear-gradient(135deg, rgba(255, 217, 61, 0.2) 0%, rgba(255, 190, 0, 0.15) 100%);
          color: var(--color-happy);
          border: 1px solid var(--color-happy);
        }

        .mood-sad {
          background: linear-gradient(135deg, rgba(108, 155, 207, 0.2) 0%, rgba(70, 130, 180, 0.15) 100%);
          color: var(--color-sad);
          border: 1px solid var(--color-sad);
        }

        .mood-neutral {
          background: linear-gradient(135deg, rgba(149, 165, 166, 0.2) 0%, rgba(127, 140, 141, 0.15) 100%);
          color: var(--color-neutral);
          border: 1px solid var(--color-neutral);
        }

        .video-count-status {
          font-size: 0.85rem;
          color: var(--text-muted);
          padding: 0.5rem 1rem;
          background: rgba(0, 245, 212, 0.1);
          border-radius: var(--radius-sm);
        }

        .privacy-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
          padding: 0.75rem;
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .privacy-notice svg {
          color: var(--accent-primary);
        }

        .footer {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border-color);
          text-align: center;
        }

        .powered-by {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          font-size: 1rem;
          color: var(--text-secondary);
        }

        .developer-name {
          font-weight: 700;
          font-size: 1.1rem;
          background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .footer p {
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        /* Tablet - 1024px and below */
        @media (max-width: 1024px) {
          .content-grid {
            grid-template-columns: 1fr;
          }

          .camera-section {
            max-width: 500px;
            margin: 0 auto;
            width: 100%;
          }

          .section-header h2 {
            font-size: 1.1rem;
          }
        }

        /* Mobile Large - 768px and below */
        @media (max-width: 768px) {
          .main-container {
            padding: 1rem;
          }

          .header {
            margin-bottom: 2rem;
          }

          .logo-icon {
            font-size: 2rem;
          }

          .logo-text {
            font-size: 2rem;
          }

          .tagline {
            font-size: 0.95rem;
          }

          .content-grid {
            gap: 1.5rem;
          }

          .camera-section {
            max-width: 100%;
          }

          .search-input-wrapper {
            flex-wrap: wrap;
            padding: 0.75rem;
          }

          .search-input {
            width: 100%;
            order: 2;
            font-size: 0.95rem;
          }

          .search-icon {
            order: 1;
          }

          .search-btn {
            order: 3;
            width: 100%;
            margin-top: 0.5rem;
            padding: 0.75rem;
          }

          .countdown-number {
            font-size: 3rem;
          }

          .scanning-status {
            padding: 1rem;
          }

          .camera-placeholder {
            padding: 2rem 1rem;
          }

          .placeholder-icon {
            font-size: 3rem;
          }

          .scan-again-btn {
            font-size: 1rem;
            padding: 1rem 1.5rem;
            width: 100%;
          }

          .footer {
            margin-top: 2rem;
            padding-top: 1.5rem;
          }

          .powered-by {
            flex-direction: column;
            gap: 0.25rem;
          }
        }

        /* Mobile Small - 480px and below */
        @media (max-width: 480px) {
          .main-container {
            padding: 0.75rem;
          }

          .logo {
            gap: 0.5rem;
          }

          .logo-icon {
            font-size: 1.75rem;
          }

          .logo-text {
            font-size: 1.75rem;
          }

          .tagline {
            font-size: 0.85rem;
          }

          .section-header h2 {
            font-size: 1rem;
            flex-wrap: wrap;
          }

          .countdown-badge {
            font-size: 0.8rem;
            padding: 0.2rem 0.5rem;
          }

          .search-form {
            margin-bottom: 1rem;
          }

          .search-input {
            font-size: 0.9rem;
          }

          .search-input::placeholder {
            font-size: 0.85rem;
          }

          .search-btn {
            font-size: 0.85rem;
          }

          .countdown-number {
            font-size: 2.5rem;
          }

          .countdown-label {
            font-size: 0.8rem;
          }

          .scanning-text {
            font-size: 0.85rem;
          }

          .error-card {
            padding: 1.5rem 1rem;
          }

          .error-card .error-icon {
            font-size: 2.5rem;
          }

          .privacy-notice {
            font-size: 0.75rem;
            padding: 0.5rem;
            flex-wrap: wrap;
            text-align: center;
          }

          .footer p {
            font-size: 0.75rem;
          }

          .developer-name {
            font-size: 1rem;
          }
        }

        /* Very small screens - 360px and below */
        @media (max-width: 360px) {
          .logo-icon {
            font-size: 1.5rem;
          }

          .logo-text {
            font-size: 1.5rem;
          }

          .section-header h2 {
            font-size: 0.9rem;
          }

          .countdown-number {
            font-size: 2rem;
          }

          .scan-again-btn {
            font-size: 0.9rem;
            padding: 0.875rem 1rem;
          }
        }
      `}</style>
    </main>
  );
}
