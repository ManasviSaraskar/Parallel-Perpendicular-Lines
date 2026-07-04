import React, { useState, useEffect, useRef } from 'react';
import { narrate, stopNarration } from '../../hooks/useAudio';
import { instruct, cheer, encourage } from '../../utils/narration';

export default function ShapeSlicerStation({ onNext, audioEnabled, apiKey }) {
  const [angle, setAngle] = useState(30);
  const [isHit, setIsHit] = useState(false);
  const [hasTried, setHasTried] = useState(false);
  const narratedRound = useRef(false);

  useEffect(() => {
    if (audioEnabled && !narratedRound.current) {
      narratedRound.current = true;
      narrate([
        instruct("Slice the shape PERPENDICULAR to the glowing bottom edge!")
      ], apiKey);
    }
    return () => stopNarration();
  }, [audioEnabled, apiKey]);

  const handleCheck = () => {
    setHasTried(true);
    stopNarration();
    // The bottom edge is horizontal (0 degrees). So perpendicular is 90 degrees.
    // Because it's a slice, 90 or -90 are perpendicular.
    if (Math.abs(angle) === 90) {
      setIsHit(true);
      if (audioEnabled) {
        narrate([cheer("Ninja slice! Perfect perpendicular cut!")], apiKey);
      }
    } else {
      setIsHit(false);
      if (audioEnabled) {
        narrate([encourage("Not quite! A perpendicular cut needs to be exactly straight up and down here.")], apiKey);
      }
    }
  };

  return (
    <div className="station-content">
      <h3 className="station-title">🥷 Shape Slicer</h3>
      <p className="station-instruction">
        Slice the wooden block <strong>PERPENDICULAR</strong> to the glowing bottom edge!
      </p>

      <div className="station-interactive shape-slicer-container">
        <div className="slicer-area">
          {/* Wood Block that splits */}
          <div className={`wood-block ${isHit ? 'split' : ''}`}>
            <div className="wood-half left-half" />
            <div className="wood-half right-half" />
            {/* Glowing base line reference */}
            <div className="glowing-base" />
          </div>

          {/* Slicing Line placed over it */}
          <div className="slicer-line" style={{ transform: `rotate(${angle}deg)` }} />
        </div>

        <div className="slicer-controls">
          <label>Slice Angle: {angle}°</label>
          <input
            type="range"
            min="-90"
            max="90"
            step="15"
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
            SLICE!
          </button>
        ) : (
          <div className="station-result result-correct">
            <span className="result-icon">✅</span>
            <p className="result-text">Perfect Perpendicular Cut!</p>
            <button className="btn btn-green btn-station-action" onClick={onNext}>
              Finish Simulations →
            </button>
          </div>
        )}

        {hasTried && !isHit && (
          <div className="station-result result-wrong" style={{ marginTop: 8 }}>
            <span className="result-icon">❌</span>
            <p className="result-text">That cut isn't perpendicular! Try 90 degrees.</p>
          </div>
        )}
      </div>
    </div>
  );
}
