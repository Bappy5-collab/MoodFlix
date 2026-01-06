'use client';

import { Emotion, emotionMapping } from '@/lib/emotionMapping';

interface EmotionDisplayProps {
  emotion: Emotion | null;
  searchKeyword: string | null;
}

/**
 * Displays the currently detected emotion and search context
 */
export default function EmotionDisplay({ emotion, searchKeyword }: EmotionDisplayProps) {
  if (!emotion) return null;

  const config = emotionMapping[emotion];

  return (
    <div className="emotion-display animate-fade-in">
      <div 
        className="emotion-indicator"
        style={{ '--emotion-color': config.color } as React.CSSProperties}
      >
        <span className="emotion-emoji">{config.emoji}</span>
        <div className="emotion-text">
          <span className="emotion-label">Detected Mood</span>
          <span className="emotion-value">{config.label}</span>
        </div>
      </div>
      
      <p className="emotion-description">{config.description}</p>
      
      {searchKeyword && (
        <div className="search-info">
          <span className="search-label">Searching for:</span>
          <span className="search-keyword">{searchKeyword}</span>
        </div>
      )}

      <style jsx>{`
        .emotion-display {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .emotion-indicator {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .emotion-emoji {
          font-size: 3rem;
          line-height: 1;
        }

        .emotion-text {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .emotion-label {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
        }

        .emotion-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--emotion-color);
        }

        .emotion-description {
          color: var(--text-secondary);
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .search-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .search-label {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .search-keyword {
          font-family: var(--font-mono);
          font-size: 0.9rem;
          background: var(--bg-secondary);
          padding: 0.375rem 0.75rem;
          border-radius: var(--radius-sm);
          color: var(--accent-primary);
        }

        @media (max-width: 480px) {
          .emotion-display {
            padding: 1rem;
          }

          .emotion-emoji {
            font-size: 2.5rem;
          }

          .emotion-value {
            font-size: 1.5rem;
          }

          .search-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}

