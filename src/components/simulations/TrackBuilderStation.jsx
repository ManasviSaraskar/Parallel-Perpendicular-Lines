import React, { useState, useEffect, useRef } from 'react';
import { narrate, stopNarration } from '../../hooks/useAudio';
import { instruct, cheer, encourage } from '../../utils/narration';

export default function TrackBuilderStation({ onNext, audioEnabled, apiKey }) {
  const [angle, setAngle] = useState(15);
  const [isHit, setIsHit] = useState(false);
  const [hasTried, setHasTried] = useState(false);
  const narratedRound = useRef(false);

  useEffect(() => {
    if (audioEnabled && !narratedRound.current) {
      narratedRound.current = true;
      narrate([
        instruct("Adjust the new track to be PERFECTLY parallel to the existing bridge so the train can cross!")
      ], apiKey);
    }
    return () => stopNarration();
  }, [audioEnabled, apiKey]);

  const handleCheck = () => {
    setHasTried(true);
    stopNarration();
    if (angle === 0) {
      setIsHit(true);
      if (audioEnabled) {
        narrate([cheer("Awesome! The tracks are parallel and the train is safe!")], apiKey);
      }
    } else {
      setIsHit(false);
      if (audioEnabled) {
        narrate([encourage("Not quite parallel! The train will crash if the tracks aren't straight.")], apiKey);
      }
    }
  };

  return (
    <div className="station-content">
      <h3 className="station-title">🚂 Track Builder</h3>
      <p className="station-instruction">
        Adjust the second rail so it is <strong>PARALLEL</strong> to the first one!
      </p>

      <div className="station-interactive track-builder-container">
        <div className="track-area">
          <div className="water-background" />
          {/* First rail (fixed, horizontal) */}
          <div className="rail fixed-rail" />
          
          {/* Second rail (adjustable) */}
          <div className="rail adjustable-rail" style={{ transform: `translateY(40px) rotate(${angle}deg)` }} />
          
          {/* Train */}
          <div className={`train ${isHit ? 'train-move' : ''}`}>🚂</div>
        </div>

        <div className="track-controls">
          <label>Track Tilt: {angle}°</label>
          <input
            type="range"
            min="-30"
            max="30"
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
            Test Tracks!
          </button>
        ) : (
          <div className="station-result result-correct">
            <span className="result-icon">✅</span>
            <p className="result-text">Perfectly Parallel!</p>
            <button className="btn btn-green btn-station-action" onClick={onNext}>
              Next Station →
            </button>
          </div>
        )}
        
        {hasTried && !isHit && (
           <div className="station-result result-wrong" style={{marginTop: 8}}>
             <span className="result-icon">❌</span>
             <p className="result-text">The tracks are tilted! Make sure the angle difference is 0°.</p>
           </div>
        )}
      </div>
    </div>
  );
}
