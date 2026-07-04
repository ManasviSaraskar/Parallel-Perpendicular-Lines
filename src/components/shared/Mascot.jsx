import React from 'react';

const Mascot = ({ mood = 'idle', className = '' }) => {
  // We'll use emoji approximations until SVG assets are provided
  const moodEmoji = {
    idle: '🤖',
    happy: '🤖✨',
    thinking: '🤖💭',
    celebrating: '🎉🤖🎉',
    encouraging: '🤖👍'
  };

  return (
    <div className={`mascot ${mood} ${className}`} style={{ fontSize: '3rem', textAlign: 'center' }}>
      {moodEmoji[mood]}
    </div>
  );
};

export default Mascot;
