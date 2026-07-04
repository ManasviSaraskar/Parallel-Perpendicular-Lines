import LinePairDiagram from '../shared/LinePairDiagram';

export default function QuestionRenderer({ question, onAnswer, disabled }) {
  const renderVisual = () => {
    if (question.visual === 'linePair') {
      return (
        <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', justifyContent: 'center' }}>
          <LinePairDiagram angleA={question.lineAngleA} angleB={question.lineAngleB} relationship={question.relationship} />
        </div>
      );
    }
    if (question.visual === 'picture') {
      let icon;
      if (question.objectTheme === 'railway') icon = '🛤️';
      else if (question.objectTheme === 'window') icon = '🪟';
      else if (question.objectTheme === 'plus') icon = '➕';
      else icon = '🪜';
      return (
        <div style={{ fontSize: '5rem', textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
          {icon}
        </div>
      );
    }
    if (question.visual === 'shape' || question.visual === 'letter') {
      return (
        <div style={{ fontSize: '4rem', textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontWeight: 'bold', fontFamily: 'monospace' }}>
          {question.visual === 'letter' ? question.correctAnswer : '▭'}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginTop: 0, lineHeight: 1.4 }}>
        {question.questionText}
      </h2>

      {renderVisual()}

      <div className="options-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {question.options.map((opt, i) => (
          <button
            key={i}
            className="btn btn-outline"
            onClick={() => !disabled && onAnswer(opt === question.correctAnswer)}
            disabled={disabled}
            style={{ padding: '18px', fontSize: '1rem', textAlign: 'left' }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
