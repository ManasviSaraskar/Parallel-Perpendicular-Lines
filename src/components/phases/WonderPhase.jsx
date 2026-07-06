import React, { useState, useEffect, useCallback, useRef } from 'react';
import { narrate, stopNarration } from '../../hooks/useAudio';
import { think, encourage } from '../../utils/narration';

export default function WonderPhase({ onComplete, audioEnabled, apiKey }) {
  const [stage, setStage] = useState(0);
  const [particles, setParticles] = useState([]);
  const [isLeaving, setIsLeaving] = useState(false);
  const [btnPulsing, setBtnPulsing] = useState(false);
  const completeTimer = useRef(null);
  const narrationStarted = useRef(false);

  useEffect(() => {
    const bgEmojis = ['🪜', '📐', '✨', '📏', '🔷', '⬛', '🔺'];
    const p = Array.from({ length: 22 }, (_, i) => ({
      id: i,
      emoji: bgEmojis[i % bgEmojis.length],
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 6,
      duration: 9 + Math.random() * 14,
      size: 1.0 + Math.random() * 1.4,
    }));
    setParticles(p);
  }, []);

  // Stagger the entrance of each element
  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 300);
    const t2 = setTimeout(() => setStage(2), 900);
    const t3 = setTimeout(() => setStage(3), 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Audio: play ONCE when stage reaches 2, not on every render
  useEffect(() => {
    if (stage >= 2 && audioEnabled && !narrationStarted.current) {
      narrationStarted.current = true;
      narrate(
        [
          think(
            'John is building a treehouse ladder. He needs the rungs to be evenly spaced, and the side rails to meet the floor at a perfect corner.'
          ),
          { text: "How can he check if his ladder is built correctly? Let's find out!", style: 'question' }
        ],
        apiKey
      );
    }
    // No stopNarration() in cleanup here — that would kill audio immediately
  }, [stage, audioEnabled, apiKey]);

  // Pulse the button attention after a delay
  useEffect(() => {
    if (stage >= 3) {
      const t = setTimeout(() => setBtnPulsing(true), 3000);
      return () => clearTimeout(t);
    }
  }, [stage]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      stopNarration();
      if (completeTimer.current) clearTimeout(completeTimer.current);
    };
  }, []);

  const handleDiscover = useCallback(() => {
    if (isLeaving) return; // prevent double-tap
    setIsLeaving(true);
    setBtnPulsing(false);
    stopNarration();



    // Delay is purely for the CSS exit animation (wonder-exit) to finish.
    // Do NOT wait for audio — StoryPhase should appear immediately after the transition.
    completeTimer.current = setTimeout(() => {
      onComplete();
    }, 420);
  }, [isLeaving, onComplete, audioEnabled, apiKey]);

  return (
    <div className={`wonder-phase ${isLeaving ? 'wonder-exit' : ''}`}>
      {/* Background particles */}
      <div className="wonder-particles">
        {particles.map(p => (
          <span
            key={p.id}
            className="wonder-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              fontSize: `${p.size}rem`,
            }}
          >
            {p.emoji}
          </span>
        ))}
      </div>

      <div className="wonder-content">
        {/* Animated question mark orb */}
        <div className={`wonder-qmark ${stage >= 1 ? 'revealed' : ''}`}>
          <span className="wonder-qmark-icon">?</span>
          <div className="wonder-qmark-glow" />
          <div className="wonder-qmark-ring" />
        </div>

        {/* Mascot + speech bubble */}
        <div className={`wonder-mascot ${stage >= 1 ? 'visible' : ''}`}>
          <div className="wonder-mascot-inner">
            <div className="mascot thinking">🤖</div>
            <div className="speech-bubble wonder-bubble">Hmm… I wonder… 🤔</div>
          </div>
        </div>

        {/* Story card */}
        <div className={`wonder-question-card ${stage >= 2 ? 'visible' : ''}`}>
          <div className="wonder-emoji">🪜</div>
          <h2 className="wonder-question-text">
            John is building a treehouse ladder. He needs the rungs to be evenly
            spaced, and the side rails to meet the floor at a perfect corner.
          </h2>
          <p className="wonder-subtext">
            How can he check if his ladder is built correctly? Let's find out!
          </p>
        </div>

        {/* CTA button */}
        <button
          className={`btn btn-wonder ${stage >= 3 ? 'visible' : ''} ${btnPulsing ? 'wonder-btn-attention' : ''} ${isLeaving ? 'wonder-btn-clicked' : ''}`}
          onClick={handleDiscover}
          id="discover-btn"
          disabled={stage < 3 || isLeaving}
        >
          <span className="wonder-btn-sparkle">✨</span>
          {isLeaving ? 'Loading…' : "Let's Discover!"}
          <span className="wonder-btn-sparkle">✨</span>
        </button>
      </div>
    </div>
  );
}
