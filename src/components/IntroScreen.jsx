import React, { useEffect, useRef } from 'react';
import { narrate, stopNarration } from '../hooks/useAudio';
import { cheer } from '../utils/narration';

const JOURNEY_PHASES = [
  { icon: '🔍', label: 'Wonder', desc: 'A geometry mystery!' },
  { icon: '📖', label: 'Story', desc: 'See lines in action' },
  { icon: '🧪', label: 'Simulate', desc: 'Build the lines' },
  { icon: '🎮', label: 'Play', desc: 'Gamified challenges' },
  { icon: '📓', label: 'Reflect', desc: 'What did you learn?' },
];

export default function IntroScreen({ onStart, audioEnabled, onToggleAudio, apiKey }) {
  const narrationRef = useRef(null);

  useEffect(() => {
    if (audioEnabled) {
      narrate([cheer("Hello! Today we are going to explore Parallel and Perpendicular Lines!")], apiKey);
      return () => {
        stopNarration();
      };
    }
  }, [audioEnabled, apiKey]);

  const handleStart = () => {
    stopNarration();
    onStart();
  };

  return (
    <div className="intro-screen">
      <div className="intro-badge">
        ✨  · Geometry Basics
      </div>

      <h1 className="intro-title">
        <span style={{ color: 'var(--gold)' }}>Lines</span>{' '}—{' '}
        <span style={{ color: 'var(--coral)' }}>Parallel & Perpendicular</span>
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: 4, fontFamily: 'var(--font-display)' }}>
        Lesson 1.1 · Introduction to Geometry
      </p>

      <div className="mascot-container">
        <div className="mascot">🤖</div>
        <div className="speech-bubble">
          Let's explore lines! 📐
        </div>
      </div>

      <p className="intro-desc">
        Learn to see <strong style={{ color: 'var(--gold)' }}>parallel</strong> and <strong style={{ color: 'var(--coral)' }}>perpendicular</strong> lines everywhere, build them, and discover the secrets of geometry!
      </p>

      <div className="intro-journey-map">
        <h3 className="intro-journey-title">Your Learning Journey</h3>
        <div className="intro-journey-steps">
          {JOURNEY_PHASES.map((p, i) => (
            <div key={i} className="intro-journey-step">
              <div className="intro-journey-icon">{p.icon}</div>
              <div className="intro-journey-info">
                <div className="intro-journey-label">{p.label}</div>
                <div className="intro-journey-desc">{p.desc}</div>
              </div>
              {i < JOURNEY_PHASES.length - 1 && <div className="intro-journey-arrow">→</div>}
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-primary btn-lg intro-start-btn" onClick={handleStart} id="start-journey-btn">
        🚀 Begin Your Journey!
      </button>

      <div className="feature-cards">
        <div className="feature-card">
          <div className="feature-card-icon">🎯</div>
          <div className="feature-card-label">100 Challenges</div>
        </div>
        <div className="feature-card">
          <div className="feature-card-icon">📐</div>
          <div className="feature-card-label">Geometry Lines</div>
        </div>
        <div className="feature-card">
          <div className="feature-card-icon">✨</div>
          <div className="feature-card-label">Badges & XP</div>
        </div>
      </div>
    </div>
  );
}
