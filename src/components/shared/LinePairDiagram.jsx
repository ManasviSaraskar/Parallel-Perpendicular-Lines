import React from 'react';

const LinePairDiagram = ({
  angleA = 0,
  angleB = 90,
  relationship = 'perpendicular', // 'parallel' | 'perpendicular' | 'intersecting' | 'neither' | null
  animated = false,
  size = 'medium', // 'small' | 'medium' | 'large'
}) => {
  const length = size === 'large' ? 140 : size === 'medium' ? 100 : 70;
  const cx = length + 20, cy = length + 20;
  const svgSize = (length + 20) * 2;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const lineA = {
    x1: cx - length * Math.cos(toRad(angleA)),
    y1: cy - length * Math.sin(toRad(angleA)),
    x2: cx + length * Math.cos(toRad(angleA)),
    y2: cy + length * Math.sin(toRad(angleA)),
  };
  const lineB = relationship === 'parallel'
    ? { // Parallel: same angle, offset perpendicular to itself
        x1: lineA.x1 - 40 * Math.sin(toRad(angleA)),
        y1: lineA.y1 + 40 * Math.cos(toRad(angleA)),
        x2: lineA.x2 - 40 * Math.sin(toRad(angleA)),
        y2: lineA.y2 + 40 * Math.cos(toRad(angleA)),
      }
    : {
        x1: cx - length * Math.cos(toRad(angleB)),
        y1: cy - length * Math.sin(toRad(angleB)),
        x2: cx + length * Math.cos(toRad(angleB)),
        y2: cy + length * Math.sin(toRad(angleB)),
      };

  return (
    <svg viewBox={`0 0 ${svgSize} ${svgSize}`}
         xmlns="http://www.w3.org/2000/svg"
         style={{ maxWidth: '100%', height: 'auto', '--line-length': length * 2 }}>
      <line {...lineA} stroke="#4A90D9" strokeWidth="4" strokeLinecap="round"
            className={animated ? 'draw-on' : ''} />
      <line {...lineB} stroke="#E8A23D" strokeWidth="4" strokeLinecap="round"
            className={animated ? 'draw-on' : ''} style={{ animationDelay: animated ? '150ms' : '0ms' }} />

      {relationship === 'parallel' && (
        <>
          <text x={lineA.x1 - 10} y={lineA.y1 - 6} fontSize="16">→</text>
          <text x={lineB.x1 - 10} y={lineB.y1 - 6} fontSize="16">→</text>
        </>
      )}

      {relationship === 'perpendicular' && (
        <rect x={cx - 12} y={cy - 12} width="12" height="12"
              fill="none" stroke="#3AA76D" strokeWidth="2.5" />
      )}

      {relationship === 'intersecting' && (
        <circle cx={cx} cy={cy} r="4" fill="#D9534F" />
      )}
      
      {relationship === null && (
        <text x={cx - 5} y={cy + 5} fontSize="16" fill="#666">?</text>
      )}
    </svg>
  );
};

export default LinePairDiagram;
