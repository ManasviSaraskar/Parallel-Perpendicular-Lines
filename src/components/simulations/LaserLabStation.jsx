import React, { useState, useEffect, useRef } from 'react';
import { narrate, stopNarration } from '../../hooks/useAudio';
import { instruct, cheer, encourage } from '../../utils/narration';

export default function LaserLabStation({ onNext, audioEnabled, apiKey }) {
  const [angle, setAngle] = useState(0); // Mirror angle
  const [isHit, setIsHit] = useState(false);
  const [hasTried, setHasTried] = useState(false);
  const narratedRound = useRef(false);

  useEffect(() => {
    if (audioEnabled && !narratedRound.current) {
      narratedRound.current = true;
      narrate([
        instruct("Set the mirror to a 45-degree angle. That will make the laser bounce off at a perfect 90-degree turn and hit the gem!")
      ], apiKey);
    }
    return () => stopNarration();
  }, [audioEnabled, apiKey]);

  const handleCheck = () => {
    setHasTried(true);
    stopNarration();
    // A horizontal incoming beam reflects at a right angle (90°) to hit the
    // target only when the mirror itself is set to 45°. Keep the gameplay
    // logic, narration, and on-screen copy all in agreement about this.
    if (angle === 45) {
      setIsHit(true);
      if (audioEnabled) {
        narrate([cheer("Perfect! A 45-degree mirror makes the laser reflect at a right angle and hit the gem!")], apiKey);
      }
    } else {
      setIsHit(false);
      if (audioEnabled) {
        narrate([encourage("Not quite! Set the mirror to exactly 45 degrees so the laser reflects at a perfect 90-degree angle onto the gem.")], apiKey);
      }
    }
  };

  return (
    <div className="station-content">
      <h3 className="station-title">💥 Laser Lab</h3>
      <p className="station-instruction">
        Set the mirror to <strong>45°</strong> so the laser reflects at a <strong>PERPENDICULAR</strong> (90-degree) angle and hits the gem!
      </p>

      <div className="station-interactive laser-lab-container">
        <div className="laser-grid">
          {/* Incoming Laser from Left */}
          <div className="laser-beam incoming" />

          {/* Center Mirror */}
          <div className="mirror-wrapper" style={{ transform: `rotate(${angle}deg)` }}>
            <div className="mirror" />
          </div>

          {/* Outgoing Laser (Only visible if checked) */}
          {hasTried && (
            <div className={`laser-beam outgoing ${isHit ? 'hit' : 'miss'}`} style={{ transform: `rotate(${angle * 2 - 180}deg)` }} />
          )}

          {/* Target Gem (Top Center) */}
          <div className={`laser-target ${isHit ? 'activated' : ''}`}>💎</div>
        </div>

        <div className="laser-controls">
          <label>Mirror Angle: {angle}° <span style={{ opacity: 0.7, fontWeight: 400 }}>(target: 45°)</span></label>
          <input
            type="range"
            min="0"
            max="90"
            step="5"
            value={angle}
            onChange={(e) => {
              setAngle(Number(e.target.value));
              setHasTried(false);
              setIsHit(false);
            }}
            className="angle-slider"
          />
        </div>
      </div>

      <div className="station-actions">
        {!isHit ? (
          <button className="btn btn-primary btn-station-action" onClick={handleCheck}>
            Fire Laser!
          </button>
        ) : (
          <div className="station-result result-correct">
            <span className="result-icon">✅</span>
            <p className="result-text">Perfect! 45° mirror → 90° reflection!</p>
            <button className="btn btn-green btn-station-action" onClick={onNext}>
              Next Station →
            </button>
          </div>
        )}

        {hasTried && !isHit && (
          <div className="station-result result-wrong" style={{ marginTop: 8 }}>
            <span className="result-icon">❌</span>
            <p className="result-text">The laser missed! Set the mirror to exactly 45° to make it reflect at a perfect 90° turn.</p>
          </div>
        )}
      </div>
    </div>
  );
}
