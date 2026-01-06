'use client';

import { YouTubeVideo } from '@/lib/types';

interface VideoPlayerProps {
  video: YouTubeVideo | null;
  onClose: () => void;
}

/**
 * YouTube video player modal using official iframe embed
 * Follows YouTube Terms of Service for embedding
 */
export default function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  if (!video) return null;

  return (
    <div className="player-overlay" onClick={onClose}>
      <div className="player-container animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="close-button" onClick={onClose} aria-label="Close video">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Video player */}
        <div className="video-wrapper">
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="video-iframe"
          />
        </div>

        {/* Video info */}
        <div className="video-info">
          <h3 className="video-title">{video.title}</h3>
          {video.channelTitle && (
            <p className="channel-name">{video.channelTitle}</p>
          )}
          <a
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="youtube-link"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            Watch on YouTube
          </a>
        </div>
      </div>

      <style jsx>{`
        .player-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .player-container {
          position: relative;
          width: 100%;
          max-width: 1000px;
          background: var(--bg-card);
          border-radius: var(--radius-xl);
          overflow: hidden;
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-lg);
        }

        .close-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 40px;
          height: 40px;
          background: rgba(0, 0, 0, 0.6);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: var(--accent-secondary);
          transform: scale(1.1);
        }

        .close-button svg {
          width: 20px;
          height: 20px;
        }

        .video-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          background: black;
        }

        .video-iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }

        .video-info {
          padding: 1.5rem;
        }

        .video-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        .channel-name {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .youtube-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--youtube-red);
          font-size: 0.9rem;
          font-weight: 500;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }

        .youtube-link:hover {
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          .player-overlay {
            padding: 0.5rem;
            align-items: flex-start;
            padding-top: 2rem;
          }

          .player-container {
            max-width: 100%;
            margin: 0;
            border-radius: var(--radius-md);
          }

          .close-button {
            top: 0.5rem;
            right: 0.5rem;
            width: 36px;
            height: 36px;
          }

          .close-button svg {
            width: 18px;
            height: 18px;
          }

          .video-info {
            padding: 1rem;
          }

          .video-title {
            font-size: 1rem;
          }

          .channel-name {
            font-size: 0.85rem;
          }
        }

        @media (max-width: 480px) {
          .player-overlay {
            padding: 0;
            padding-top: 0;
            align-items: center;
          }

          .player-container {
            border-radius: 0;
            max-height: 100vh;
            overflow-y: auto;
          }

          .video-info {
            padding: 0.75rem;
          }

          .video-title {
            font-size: 0.9rem;
          }

          .channel-name {
            font-size: 0.8rem;
            margin-bottom: 0.75rem;
          }

          .youtube-link {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}

