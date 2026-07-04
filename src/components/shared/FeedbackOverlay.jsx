import React from 'react';

const FeedbackOverlay = ({ isCorrect, explanation, xpEarned, onContinue }) => {
  return (
    <div className="feedback-overlay" style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(255,255,255,0.85)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 100,
      animation: isCorrect ? 'bounceIn 0.5s ease-out' : 'shake 0.5s ease-in-out'
    }}>
      <h2 style={{ color: isCorrect ? '#3AA76D' : '#D9534F', fontSize: '2.5rem', margin: '0 0 20px 0' }}>
        {isCorrect ? 'Awesome! 🎉' : 'Not Quite!'}
      </h2>
      
      {isCorrect && (
        <div style={{ fontSize: '1.5rem', color: '#E8A23D', fontWeight: 'bold', marginBottom: '30px' }}>
          +{xpEarned} XP
        </div>
      )}
      
      {explanation && (
        <p style={{ maxWidth: '400px', textAlign: 'center', fontSize: '1.2rem', color: '#333', lineHeight: 1.5, marginBottom: '30px' }}>
          {explanation}
        </p>
      )}
      
      <button 
        onClick={onContinue}
        style={{
          background: '#4A90D9', color: '#fff', border: 'none', padding: '15px 40px',
          borderRadius: '30px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(74, 144, 217, 0.3)'
        }}>
        Continue
      </button>
    </div>
  );
};

export default FeedbackOverlay;
