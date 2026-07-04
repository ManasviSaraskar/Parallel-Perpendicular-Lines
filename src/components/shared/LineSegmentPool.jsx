import React from 'react';

const LineSegmentPool = ({ segments = [], theme = 'road', onDragStart, onTap, selectedId }) => {
  return (
    <div className="segment-pool" style={{ display: 'flex', gap: '10px', padding: '10px', background: '#f5f5f5', borderRadius: '8px' }}>
      {segments.map((seg, i) => (
        <div 
          key={seg.id || i}
          className={`segment-item ${selectedId === seg.id ? 'selected' : ''}`}
          style={{ 
            width: '60px', 
            height: '10px', 
            background: theme === 'road' ? '#333' : theme === 'railway' ? '#666' : '#8B4513',
            cursor: 'pointer',
            border: selectedId === seg.id ? '2px solid #E8A23D' : 'none',
            boxShadow: selectedId === seg.id ? '0 0 8px rgba(232,162,61,0.6)' : 'none'
          }}
          draggable
          onDragStart={(e) => onDragStart && onDragStart(e, seg)}
          onClick={() => onTap && onTap(seg)}
        />
      ))}
    </div>
  );
};

export default LineSegmentPool;
