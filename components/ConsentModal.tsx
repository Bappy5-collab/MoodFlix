'use client';

import { useState } from 'react';

interface ConsentModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

/**
 * Privacy consent modal for camera access
 * Displays clear information about data usage before camera activation
 */
export default function ConsentModal({ onAccept, onDecline }: ConsentModalProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleAccept = () => {
    setIsVisible(false);
    onAccept();
  };

  const handleDecline = () => {
    setIsVisible(false);
    onDecline();
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container animate-fade-in">
        {/* Icon */}
        <div className="modal-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="modal-title">Camera Access Required</h2>

        {/* Description */}
        <p className="modal-description">
          Emo-Tone uses your camera to detect facial expressions and recommend videos 
          based on your mood.
        </p>

        {/* Privacy Points */}
        <div className="privacy-list">
          <h3>🔒 Your Privacy is Protected</h3>
          <ul>
            <li>
              <span className="check-icon">✓</span>
              <span>All face analysis runs <strong>locally</strong> in your browser</span>
            </li>
            <li>
              <span className="check-icon">✓</span>
              <span>No face images or data are <strong>stored or uploaded</strong></span>
            </li>
            <li>
              <span className="check-icon">✓</span>
              <span>Only emotion is detected - <strong>no face recognition</strong></span>
            </li>
            <li>
              <span className="check-icon">✓</span>
              <span>You can <strong>stop the camera anytime</strong></span>
            </li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="modal-buttons">
          <button className="btn btn-primary" onClick={handleAccept}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Allow Camera
          </button>
          <button className="btn btn-secondary" onClick={handleDecline}>
            Maybe Later
          </button>
        </div>

        {/* Powered by */}
        <div className="powered-by-modal">
          <span>Powered by</span>
          <span className="developer-name">Chandon kumar</span>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-container {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 2.5rem;
          max-width: 480px;
          width: 100%;
          text-align: center;
          box-shadow: var(--shadow-lg), var(--shadow-glow);
        }

        .modal-icon {
          width: 72px;
          height: 72px;
          margin: 0 auto 1.5rem;
          background: linear-gradient(135deg, var(--accent-primary) 0%, #00c4a7 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--bg-primary);
        }

        .modal-icon svg {
          width: 36px;
          height: 36px;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }

        .modal-description {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          font-size: 1rem;
          line-height: 1.6;
        }

        .privacy-list {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          margin-bottom: 2rem;
          text-align: left;
        }

        .privacy-list h3 {
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .privacy-list ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .privacy-list li {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .check-icon {
          color: var(--accent-primary);
          font-weight: bold;
          flex-shrink: 0;
        }

        .privacy-list li strong {
          color: var(--text-primary);
        }

        .modal-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .modal-buttons .btn {
          width: 100%;
          padding: 1rem 1.5rem;
          font-size: 1rem;
        }

        .powered-by-modal {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .powered-by-modal .developer-name {
          font-weight: 700;
          background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @media (min-width: 480px) {
          .modal-buttons {
            flex-direction: row;
          }

          .modal-buttons .btn {
            flex: 1;
          }
        }

        /* Mobile Small */
        @media (max-width: 480px) {
          .modal-overlay {
            padding: 0.75rem;
          }

          .modal-container {
            padding: 1.5rem;
            border-radius: var(--radius-lg);
          }

          .modal-icon {
            width: 60px;
            height: 60px;
            margin-bottom: 1rem;
          }

          .modal-icon svg {
            width: 28px;
            height: 28px;
          }

          .modal-title {
            font-size: 1.25rem;
          }

          .modal-description {
            font-size: 0.9rem;
            margin-bottom: 1.25rem;
          }

          .privacy-list {
            padding: 1rem;
            margin-bottom: 1.5rem;
          }

          .privacy-list h3 {
            font-size: 0.9rem;
          }

          .privacy-list li {
            font-size: 0.85rem;
          }

          .modal-buttons .btn {
            padding: 0.875rem 1rem;
            font-size: 0.9rem;
          }

          .powered-by-modal {
            margin-top: 1rem;
            font-size: 0.8rem;
          }
        }

        /* Very Small */
        @media (max-width: 360px) {
          .modal-container {
            padding: 1.25rem;
          }

          .modal-icon {
            width: 50px;
            height: 50px;
          }

          .modal-icon svg {
            width: 24px;
            height: 24px;
          }

          .modal-title {
            font-size: 1.1rem;
          }

          .modal-description {
            font-size: 0.85rem;
          }

          .privacy-list h3 {
            font-size: 0.85rem;
          }

          .privacy-list li {
            font-size: 0.8rem;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}

