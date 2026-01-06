'use client';

import { YouTubeVideo } from '@/lib/types';

interface VideoGridProps {
  videos: YouTubeVideo[];
  isLoading: boolean;
  error: string | null;
  onVideoSelect: (video: YouTubeVideo) => void;
}

/**
 * Responsive grid displaying YouTube video thumbnails
 * Shows loading skeletons and error states
 */
export default function VideoGrid({ 
  videos, 
  isLoading, 
  error, 
  onVideoSelect 
}: VideoGridProps) {
  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <h3>Unable to Load Videos</h3>
        <p>{error}</p>
        <style jsx>{`
          .error-state {
            text-align: center;
            padding: 3rem 1.5rem;
            background: var(--bg-card);
            border-radius: var(--radius-lg);
            border: 1px solid rgba(255, 107, 107, 0.3);
          }

          .error-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }

          .error-state h3 {
            color: var(--accent-secondary);
            margin-bottom: 0.5rem;
            font-size: 1.25rem;
          }

          .error-state p {
            color: var(--text-secondary);
            font-size: 0.95rem;
          }
        `}</style>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="video-grid">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="video-skeleton">
            <div className="skeleton thumbnail-skeleton" />
            <div className="skeleton-content">
              <div className="skeleton title-skeleton" />
              <div className="skeleton channel-skeleton" />
            </div>
          </div>
        ))}
        <style jsx>{`
          .video-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
          }

          .video-skeleton {
            background: var(--bg-card);
            border-radius: var(--radius-lg);
            overflow: hidden;
            border: 1px solid var(--border-color);
          }

          .thumbnail-skeleton {
            width: 100%;
            aspect-ratio: 16/9;
            border-radius: 0;
          }

          .skeleton-content {
            padding: 1rem;
          }

          .title-skeleton {
            height: 1rem;
            margin-bottom: 0.75rem;
            width: 90%;
          }

          .channel-skeleton {
            height: 0.875rem;
            width: 60%;
          }
        `}</style>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🎵</div>
        <h3>No Songs Yet</h3>
        <p>Allow camera access and show your expression to get Hindi & Bangla song recommendations!</p>
        <style jsx>{`
          .empty-state {
            text-align: center;
            padding: 4rem 1.5rem;
            background: var(--bg-card);
            border-radius: var(--radius-lg);
            border: 1px dashed var(--border-color);
          }

          .empty-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            opacity: 0.5;
          }

          .empty-state h3 {
            color: var(--text-primary);
            margin-bottom: 0.5rem;
            font-size: 1.25rem;
          }

          .empty-state p {
            color: var(--text-secondary);
            font-size: 0.95rem;
            max-width: 400px;
            margin: 0 auto;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="video-grid">
      {videos.map((video, index) => (
        <button
          key={video.id}
          className="video-card animate-fade-in"
          onClick={() => onVideoSelect(video)}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="thumbnail-container">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="thumbnail"
              loading="lazy"
            />
            <div className="play-overlay">
              <svg viewBox="0 0 24 24" fill="currentColor" className="play-icon">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            {/* YouTube branding */}
            <div className="youtube-badge">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
          </div>
          <div className="video-info">
            <h3 className="video-title">{video.title}</h3>
            {video.channelTitle && (
              <p className="channel-name">{video.channelTitle}</p>
            )}
          </div>
        </button>
      ))}

      <style jsx>{`
        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .video-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left;
          width: 100%;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .video-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent-primary);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3), 0 0 20px var(--accent-glow);
        }

        .thumbnail-container {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          overflow: hidden;
        }

        .thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .video-card:hover .thumbnail {
          transform: scale(1.05);
        }

        .play-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .video-card:hover .play-overlay {
          opacity: 1;
        }

        .play-icon {
          width: 64px;
          height: 64px;
          color: white;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
        }

        .youtube-badge {
          position: absolute;
          bottom: 0.5rem;
          right: 0.5rem;
          background: var(--youtube-red);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .video-info {
          padding: 1rem;
        }

        .video-title {
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-primary);
          line-height: 1.4;
          margin-bottom: 0.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .channel-name {
          font-size: 0.85rem;
          color: var(--text-secondary);
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Tablet */
        @media (max-width: 1024px) {
          .video-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 1.25rem;
          }
        }

        /* Mobile Large */
        @media (max-width: 768px) {
          .video-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1rem;
          }

          .video-info {
            padding: 0.75rem;
          }

          .video-title {
            font-size: 0.9rem;
          }

          .channel-name {
            font-size: 0.8rem;
          }

          .play-icon {
            width: 48px;
            height: 48px;
          }
        }

        /* Mobile Small */
        @media (max-width: 480px) {
          .video-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }

          .video-info {
            padding: 0.5rem;
          }

          .video-title {
            font-size: 0.8rem;
            -webkit-line-clamp: 2;
          }

          .channel-name {
            font-size: 0.7rem;
          }

          .youtube-badge {
            padding: 0.15rem 0.35rem;
          }

          .youtube-badge svg {
            width: 12px;
            height: 12px;
          }

          .play-icon {
            width: 36px;
            height: 36px;
          }
        }

        /* Very Small */
        @media (max-width: 360px) {
          .video-grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .video-title {
            font-size: 0.85rem;
          }

          .play-icon {
            width: 48px;
            height: 48px;
          }
        }
      `}</style>
    </div>
  );
}

