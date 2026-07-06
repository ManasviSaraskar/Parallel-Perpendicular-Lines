import { useState, useCallback, useEffect, useRef } from 'react';
import { narrate, stopNarration } from '../../hooks/useAudio';

const REFLECT_QUESTIONS = [
  { q: "Two roads run side by side and never cross. What type of lines are they?", options: [
    { text: "Parallel lines — same direction forever", correct: true, emoji: "🛤️" },
    { text: "Perpendicular lines — they cross at 90°", correct: false, emoji: "❌" },
    { text: "We can't tell from the description", correct: false, emoji: "❓" },
  ]},
  { q: "What makes two lines 'perpendicular'?", options: [
    { text: "They meet at a perfect right angle (90°)", correct: true, emoji: "📐" },
    { text: "They both go the same direction", correct: false, emoji: "❌" },
    { text: "They are the same length", correct: false, emoji: "❓" },
  ]},
  { q: "The sides of a window frame — what geometry do they show?", options: [
    { text: "Perpendicular lines — the corners are 90°", correct: true, emoji: "🪟" },
    { text: "Parallel lines — they never cross", correct: false, emoji: "❌" },
    { text: "Intersecting lines — they cross at an angle", correct: false, emoji: "❓" },
  ]},
];

const CONFIDENCE_LEVELS = [
  { emoji: '😊', label: "I'm great at parallel & perpendicular!", color: '#4caf50' },
  { emoji: '🙂', label: 'I can identify most line pairs!', color: '#ff9800' },
  { emoji: '😐', label: "I'm still learning", color: '#42a5f5' },
];

export default function ReflectPhase({ stats, onRestart, onGoHome, audioEnabled, apiKey }) {
  const [step, setStep] = useState(0);
  const [teachIdx, setTeachIdx] = useState(0);
  const [teachAnswered, setTeachAnswered] = useState(false);
  const [teachCorrect, setTeachCorrect] = useState(0);
  const [confidence, setConfidence] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);
  const narrationRef = useRef(null);

  const { score = 0, totalAnswered = 0, xp = 0, maxStreak = 0, worldResults = {} } = stats || {};
  const pct = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;
  const totalStars = Object.values(worldResults).reduce((a, r) => a + (r.stars || 0), 0);

  useEffect(() => {
    if (step === 0 && audioEnabled) {
      const rq = REFLECT_QUESTIONS[teachIdx];
      const segments = [];
      if (teachIdx === 0) {
        segments.push({ text: "Wonderful! Now let us reflect on what you learned. Teach the mascot!", style: 'default' });
      }
      segments.push({ text: rq.q, style: 'question' });
      narrationRef.current = narrate(segments, apiKey);
    }
  }, [step, teachIdx, audioEnabled, apiKey]);

  useEffect(() => {
    if (showConfetti) {
      const pieces = Array.from({ length: 40 }, (_, i) => ({
        id: i, x: Math.random() * 100, delay: Math.random() * 2,
        color: ['#ffc107', '#e91e63', '#4caf50', '#2196f3', '#ff5722', '#9c27b0'][i % 6],
        size: 6 + Math.random() * 10, duration: 2 + Math.random() * 3,
      }));
      setConfettiPieces(pieces);
    }
  }, [showConfetti]);

  const handleTeachAnswer = useCallback((option) => {
    if (teachAnswered) return;
    setTeachAnswered(true);
    stopNarration();
    if (option.correct) {
      setTeachCorrect(c => c + 1);
      if (audioEnabled) narrationRef.current = narrate([{ text: "Excellent! That is correct!", style: 'cheer' }], apiKey);
    } else {
      if (audioEnabled) narrationRef.current = narrate([{ text: "Not quite, but keep trying!", style: 'encourage' }], apiKey);
    }
    setTimeout(() => {
      setTeachAnswered(false);
      if (teachIdx + 1 < REFLECT_QUESTIONS.length) {
        setTeachIdx(i => i + 1);
      } else {
        setStep(1);
      }
    }, 1500);
  }, [teachAnswered, teachIdx, audioEnabled, apiKey]);

  const handleConfidenceSelect = useCallback((idx) => {
    setConfidence(idx);
    setShowConfetti(true);
    stopNarration();
    if (audioEnabled) narrationRef.current = narrate([{ text: "You completed the challenge! Amazing work today!", style: 'cheer' }], apiKey);
    setTimeout(() => setStep(2), 1000);
  }, [audioEnabled, pct, apiKey]);

  useEffect(() => {
    if (step === 1 && audioEnabled) {
      stopNarration();
      narrationRef.current = narrate([{ text: "How do you feel about parallel and perpendicular lines now?", style: 'ask' }], apiKey);
    }
  }, [step, audioEnabled, apiKey]);

  useEffect(() => {
    return () => { stopNarration(); };
  }, []);

  // Step 0: Teach the Mascot
  if (step === 0) {
    const rq = REFLECT_QUESTIONS[teachIdx];
    return (
      <div className="reflect-phase">
        <div className="reflect-header">
          <h3 className="reflect-label">📓 Reflect</h3>
          <p className="reflect-sublabel">Teach the mascot what you learned!</p>
        </div>
        <div className="reflect-card">
          <div className="reflect-mascot-row">
            <div className="mascot thinking" style={{ width: 70, height: 70, fontSize: '2rem' }}>🤖</div>
            <div className="speech-bubble" style={{ maxWidth: 280 }}>Can you help me? {rq.q}</div>
          </div>
          <div className="reflect-options">
            {rq.options.map((opt, i) => (
              <button key={i}
                className={`reflect-option ${teachAnswered ? (opt.correct ? 'correct' : 'wrong') : ''}`}
                onClick={() => handleTeachAnswer(opt)} disabled={teachAnswered}>
                <span className="reflect-option-emoji">{opt.emoji}</span>
                <span>{opt.text}</span>
              </button>
            ))}
          </div>
          <div className="reflect-progress">
            {REFLECT_QUESTIONS.map((_, i) => (
              <div key={i} className={`reflect-dot ${i === teachIdx ? 'active' : i < teachIdx ? 'done' : ''}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Confidence
  if (step === 1) {
    return (
      <div className="reflect-phase">
        <div className="reflect-card">
          <h3 className="reflect-card-title">How do you feel about parallel & perpendicular lines?</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Be honest — every answer is great!</p>
          <div className="confidence-grid">
            {CONFIDENCE_LEVELS.map((c, i) => (
              <button key={i} className={`confidence-btn ${confidence === i ? 'selected' : ''}`}
                onClick={() => handleConfidenceSelect(i)} style={{ '--conf-color': c.color }}>
                <span className="confidence-emoji">{c.emoji}</span>
                <span className="confidence-label">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Certificate
  return (
    <div className="reflect-phase">
      {showConfetti && (
        <div className="confetti-container">
          {confettiPieces.map(p => (
            <div key={p.id} className="confetti-piece" style={{
              left: `${p.x}%`, animationDelay: `${p.delay}s`,
              backgroundColor: p.color, width: p.size, height: p.size,
              animationDuration: `${p.duration}s`,
            }} />
          ))}
        </div>
      )}
      <div className="certificate-card">
        <div className="cert-badge">🏆</div>
        <h2 className="cert-title">Journey Complete!</h2>
        <p className="cert-subtitle">You finished all 5 phases!</p>
        <div className="score-circle">
          <span className="score-number">{pct}%</span>
          <span className="score-label">{score}/{totalAnswered}</span>
        </div>
        <div style={{ fontSize: '2rem', display: 'flex', gap: 8, justifyContent: 'center', margin: '16px 0' }}>
          {[1, 2, 3].map(i => (
            <span key={i} style={{ opacity: i <= Math.ceil(totalStars / 3) ? 1 : 0.2 }}>⭐</span>
          ))}
        </div>
        <div className="cert-stats">
          <div className="cert-stat">
            <div className="cert-stat-value" style={{ color: 'var(--gold)' }}>{xp}</div>
            <div className="cert-stat-label">XP Earned</div>
          </div>
          <div className="cert-stat">
            <div className="cert-stat-value" style={{ color: 'var(--coral)' }}>🔥 {maxStreak}</div>
            <div className="cert-stat-label">Max Streak</div>
          </div>
          <div className="cert-stat">
            <div className="cert-stat-value" style={{ color: 'var(--green-light)' }}>{teachCorrect}/{REFLECT_QUESTIONS.length}</div>
            <div className="cert-stat-label">Teaching</div>
          </div>
        </div>
        <div className="mascot-container" style={{ marginTop: 16 }}>
          <div className="mascot happy" style={{ width: 80, height: 80, fontSize: '2rem' }}>🤖</div>
          <div className="speech-bubble">
            {pct >= 80 ? 'Incredible! You are a Geometry Master! 🏆' : pct >= 50 ? 'Great effort! Keep practicing! 💪' : 'Good start! Try again to improve! 📚'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginTop: 24 }}>
          <button className="btn btn-primary btn-lg" onClick={() => { stopNarration(); onRestart(); }}>🔄 Play Again</button>
          <button className="btn btn-secondary" onClick={() => { stopNarration(); onGoHome(); }}>🏠 Home</button>
        </div>
      </div>
    </div>
  );
}
