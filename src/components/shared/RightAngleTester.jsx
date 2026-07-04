import React, { useRef, useState, useEffect } from 'react';
import { testerFitsAngle } from '../../utils/geometry';

const RightAngleTester = ({ position, onDrag, onSnapCheck, angleA = 0, angleB = 90 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  const handlePointerDown = (e) => {
    e.target.setPointerCapture(e.pointerId);
    setIsDragging(true);
    const rect = svgRef.current.getBoundingClientRect();
    setOffset({
      x: e.clientX - rect.left - position.x,
      y: e.clientY - rect.top - position.y
    });
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const rect = svgRef.current.parentElement.getBoundingClientRect();
    let newX = e.clientX - rect.left - offset.x;
    let newY = e.clientY - rect.top - offset.y;
    
    // check if it's near the origin (0,0) which is intersection
    if (Math.abs(newX) < 20 && Math.abs(newY) < 20) {
       newX = 0; newY = 0; // snap
    }
    
    onDrag({ x: newX, y: newY });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
    if (position.x === 0 && position.y === 0) {
       const fits = testerFitsAngle(angleA, angleB);
       onSnapCheck(fits);
    } else {
       onSnapCheck(null);
    }
  };

  return (
    <svg 
      ref={svgRef}
      width="60" 
      height="60" 
      style={{
        position: 'absolute',
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: 10,
        touchAction: 'none'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Draw an L shape representing a set-square */}
      <path d="M 5,55 L 55,55 L 5,5 Z" fill="rgba(74, 144, 217, 0.4)" stroke="#4A90D9" strokeWidth="2" />
      <path d="M 5,55 L 55,55" stroke="#4A90D9" strokeWidth="4" />
      <path d="M 5,55 L 5,5" stroke="#4A90D9" strokeWidth="4" />
    </svg>
  );
};

export default RightAngleTester;
