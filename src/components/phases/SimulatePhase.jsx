import React, { useState, useCallback, useEffect, useRef } from 'react';
import LaserLabStation from '../simulations/LaserLabStation';
import TrackBuilderStation from '../simulations/TrackBuilderStation';
import ShapeSlicerStation from '../simulations/ShapeSlicerStation';

const STATIONS = [
  {
    id: 0,
    title: 'Laser Lab',
    subtitle: 'Reflect the laser perpendicularly',
    icon: '💥',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  },
  {
    id: 1,
    title: 'Track Builder',
    subtitle: 'Build parallel train tracks',
    icon: '🚂',
    color: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
  },
  {
    id: 2,
    title: 'Shape Slicer',
    subtitle: 'Slice shapes perpendicularly',
    icon: '🥷',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
  },
];

export default function SimulatePhase({
  onComplete,
  audioEnabled,
  apiKey,
  onTesterCheck,
}) {
  const [station, setStation] = useState(0);
  const [animState, setAnimState] = useState('enter'); // 'enter' | 'idle' | 'exit'
  const [completedStations, setCompletedStations] = useState([]);
  const [showBadge, setShowBadge] = useState(false);
  const transitionTimer = useRef(null);

  // Entrance animation on mount
  useEffect(() => {
    setAnimState('enter');
    const t = setTimeout(() => setAnimState('idle'), 600);
    return () => clearTimeout(t);
  }, []);

  const nextStation = useCallback(() => {
    setCompletedStations(prev => [...prev, station]);
    setShowBadge(true);

    transitionTimer.current = setTimeout(() => {
      setShowBadge(false);
      if (station < 2) {
        setAnimState('exit');
        setTimeout(() => {
          setStation(s => s + 1);
          setAnimState('enter');
          setTimeout(() => setAnimState('idle'), 600);
        }, 400);
      } else {
        setAnimState('exit');
        setTimeout(() => onComplete(), 500);
      }
    }, 1200);
  }, [station, onComplete]);

  useEffect(() => {
    return () => {
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
    };
  }, []);

  const current = STATIONS[station];

  return (
    <div className="simulate-phase">
      {/* Header */}
      <div className="simulate-header">
        <div className="simulate-phase-badge">
          <span className="simulate-phase-icon">🧪</span>
          <span className="simulate-phase-name">Simulate</span>
        </div>
        <p className="simulate-sublabel">Explore and discover — no wrong answers!</p>
      </div>

      {/* Station navigation strip */}
      <div className="simulate-stations-nav">
        {STATIONS.map((s, i) => {
          const isCompleted = completedStations.includes(i);
          const isActive = i === station;
          const isLocked = i > station && !completedStations.includes(i);
          return (
            <div
              key={s.id}
              className={`sim-nav-station ${isActive ? 'sim-nav-active' : ''} ${isCompleted ? 'sim-nav-completed' : ''} ${isLocked ? 'sim-nav-locked' : ''}`}
              style={{ '--station-color': s.color }}
            >
              <div className="sim-nav-icon-wrap">
                <span className="sim-nav-icon">{isCompleted ? '✓' : s.icon}</span>
                {isActive && <div className="sim-nav-pulse" />}
              </div>
              <div className="sim-nav-info">
                <span className="sim-nav-title">{s.title}</span>
                <span className="sim-nav-subtitle">{s.subtitle}</span>
              </div>
              {i < STATIONS.length - 1 && (
                <div className={`sim-nav-connector ${isCompleted ? 'filled' : ''}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Station card */}
      <div
        className={`simulate-card-wrap ${
          animState === 'enter' ? 'sim-anim-enter' : animState === 'exit' ? 'sim-anim-exit' : 'sim-anim-idle'
        }`}
      >
        {/* Station card header */}
        <div
          className="sim-station-header"
          style={{ background: current.gradient }}
        >
          <div className="sim-station-header-content">
            <span className="sim-station-icon">{current.icon}</span>
            <div>
              <h2 className="sim-station-title">{current.title}</h2>
              <p className="sim-station-desc">{current.subtitle}</p>
            </div>
            <div className="sim-station-number">
              {station + 1} / {STATIONS.length}
            </div>
          </div>
          <div className="sim-station-progress-bar">
            <div
              className="sim-station-progress-fill"
              style={{ width: `${((station + 1) / STATIONS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Station content */}
        <div className="sim-station-body glass-card">
          {station === 0 && (
            <LaserLabStation
              audioEnabled={audioEnabled}
              onNext={nextStation}
              apiKey={apiKey}
            />
          )}
          {station === 1 && (
            <TrackBuilderStation
              audioEnabled={audioEnabled}
              onNext={nextStation}
              apiKey={apiKey}
            />
          )}
          {station === 2 && (
            <ShapeSlicerStation
              audioEnabled={audioEnabled}
              onNext={nextStation}
              apiKey={apiKey}
            />
          )}
        </div>
      </div>

      {/* Station complete badge popup */}
      {showBadge && (
        <div className="sim-badge-popup">
          <span className="sim-badge-icon">⭐</span>
          <span className="sim-badge-text">
            {station < 2 ? `Station ${station + 1} Complete!` : '🎉 All Stations Done!'}
          </span>
        </div>
      )}
    </div>
  );
}
