import React, { useReducer, useEffect, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { checkBadges } from './utils/badgeEngine';
import { generateSessionQuestions } from './data/questionBank';
import { stopNarration } from './hooks/useAudio';

import FloatingNumbers from './components/FloatingNumbers';
import IntroScreen from './components/IntroScreen';
import WonderPhase from './components/phases/WonderPhase';
import StoryPhase from './components/phases/StoryPhase';
import SimulatePhase from './components/phases/SimulatePhase';
import PlayPhase from './components/phases/PlayPhase';
import ReflectPhase from './components/phases/ReflectPhase';

const PHASES = ['intro', 'wonder', 'story', 'simulate', 'play', 'reflect'];
const JOURNEY_ITEMS = [
  { icon: '🔍', label: 'Wonder' },
  { icon: '📖', label: 'Story' },
  { icon: '🧪', label: 'Simulate' },
  { icon: '🎮', label: 'Play' },
  { icon: '📓', label: 'Reflect' },
];

const ACTIONS = {
  SET_PHASE: 'SET_PHASE',
  NEXT_STORY_PANEL: 'NEXT_STORY_PANEL',
  ADVANCE_SIM_STATION: 'ADVANCE_SIM_STATION',
  COMPLETE_SIM_STATION: 'COMPLETE_SIM_STATION',
  NEXT_SIM_ROUND: 'NEXT_SIM_ROUND',
  TESTER_FIT_SUCCESS: 'TESTER_FIT_SUCCESS',
  TESTER_FIT_FAIL: 'TESTER_FIT_FAIL',
  LOAD_QUESTIONS: 'LOAD_QUESTIONS',
  ANSWER_CORRECT: 'ANSWER_CORRECT',
  ANSWER_INCORRECT: 'ANSWER_INCORRECT',
  USE_HINT: 'USE_HINT',
  NEXT_QUESTION: 'NEXT_QUESTION',
  UNLOCK_BADGE: 'UNLOCK_BADGE',
  CLEAR_NEW_BADGE: 'CLEAR_NEW_BADGE',
  RESTORE_SESSION: 'RESTORE_SESSION',
  SET_AUDIO: 'SET_AUDIO',
  RESET_SESSION: 'RESET_SESSION',
  SET_STATS: 'SET_STATS',
};

const initialState = {
  phase: 'intro',              
  storyPanel: 0,                
  currentSimStation: 0,         
  simStationsComplete: [false, false, false],
  simRound: 0,                  
  
  questionSet: [],              
  currentQuestion: 0,           
  currentWorld: -1,               
  worldScores: Array(10).fill(null),
  hintsUsed: 0,
  attemptCount: 0,              
  
  testerFitStreak: 0,           
  
  xp: 0,
  totalStars: 0,
  streak: 0,
  maxStreak: 0,
  badges: [],                   
  
  sessionId: crypto.randomUUID(),
  audioEnabled: true,
  playStats: null,
};

function reducer(state, action) {
  let newState = state;
  switch (action.type) {
    case ACTIONS.SET_PHASE:
      newState = { ...state, phase: action.payload };
      break;
    case ACTIONS.SET_AUDIO:
      newState = { ...state, audioEnabled: action.payload };
      break;
    case ACTIONS.SET_STATS:
      newState = { ...state, playStats: action.payload };
      break;
    case ACTIONS.NEXT_STORY_PANEL:
      newState = { ...state, storyPanel: state.storyPanel + 1 };
      break;
    case ACTIONS.COMPLETE_SIM_STATION: {
      const newSim = [...state.simStationsComplete];
      newSim[action.payload] = true;
      newState = { ...state, currentSimStation: action.payload + 1, simStationsComplete: newSim };
      break;
    }
    case ACTIONS.LOAD_QUESTIONS:
      newState = { ...state, questionSet: action.payload };
      break;
    case ACTIONS.RESTORE_SESSION:
      newState = { ...state, ...action.payload };
      break;
    default:
      return state;
  }
  return newState;
}

function App() {
  const [savedState, setSavedState] = useLocalStorage('intellia_pp_lines_v2', null);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (savedState && savedState.sessionId) {
      dispatch({ type: ACTIONS.RESTORE_SESSION, payload: savedState });
    }
    if (state.questionSet.length === 0) {
      dispatch({ type: ACTIONS.LOAD_QUESTIONS, payload: generateSessionQuestions() });
    }
  }, []);

  useEffect(() => {
    setSavedState(state);
  }, [state, setSavedState]);

  const toggleAudio = useCallback(() => {
    dispatch({ type: ACTIONS.SET_AUDIO, payload: !state.audioEnabled });
    if (state.audioEnabled) stopNarration();
  }, [state.audioEnabled]);

  const goHome = useCallback(() => {
    stopNarration();
    dispatch({ type: ACTIONS.SET_PHASE, payload: 'intro' });
    dispatch({ type: ACTIONS.SET_STATS, payload: null });
  }, []);

  const restart = useCallback(() => {
    stopNarration();
    dispatch({ type: ACTIONS.SET_PHASE, payload: 'wonder' });
    dispatch({ type: ACTIONS.SET_STATS, payload: null });
  }, []);

  useEffect(() => {
    return () => stopNarration();
  }, []);

  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  const phaseIndex = PHASES.indexOf(state.phase);
  const showJourney = state.phase !== 'intro';

  return (
    <>
      <FloatingNumbers />
      <div className="app-container">
        
        <button className="audio-toggle-btn" onClick={toggleAudio} title={state.audioEnabled ? 'Mute' : 'Unmute'}>
          {state.audioEnabled ? '🔊' : '🔇'}
        </button>

        {showJourney && (
          <button className="home-btn" onClick={goHome}>
            🏠 Home
          </button>
        )}

        {showJourney && (
          <div className="journey-bar">
            {JOURNEY_ITEMS.map((item, i) => {
              const stepPhaseIndex = i + 1; // wonder=1, story=2, etc.
              const isActive = phaseIndex === stepPhaseIndex;
              const isCompleted = phaseIndex > stepPhaseIndex;
              return (
                <div key={i} className="journey-step-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
                  <div className={`journey-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                    <div className="journey-step-dot">{isCompleted ? '✓' : item.icon}</div>
                    <div className="journey-step-label">{item.label}</div>
                  </div>
                  {i < JOURNEY_ITEMS.length - 1 && (
                    <div className={`journey-connector ${phaseIndex > stepPhaseIndex ? 'filled' : ''}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {state.phase === 'intro' && (
          <IntroScreen
            onStart={() => dispatch({ type: ACTIONS.SET_PHASE, payload: 'wonder' })}
            audioEnabled={state.audioEnabled}
            onToggleAudio={toggleAudio}
            apiKey={apiKey}
          />
        )}

        {state.phase === 'wonder' && (
          <WonderPhase
            onComplete={() => dispatch({ type: ACTIONS.SET_PHASE, payload: 'story' })}
            audioEnabled={state.audioEnabled}
            apiKey={apiKey}
          />
        )}

        {state.phase === 'story' && (
          <StoryPhase
            onComplete={() => dispatch({ type: ACTIONS.SET_PHASE, payload: 'simulate' })}
            audioEnabled={state.audioEnabled}
            apiKey={apiKey}
          />
        )}

        {state.phase === 'simulate' && (
          <SimulatePhase
            onComplete={() => dispatch({ type: ACTIONS.SET_PHASE, payload: 'play' })}
            audioEnabled={state.audioEnabled}
            apiKey={apiKey}
          />
        )}

        {state.phase === 'play' && (
          <PlayPhase
            onComplete={(stats) => { 
              dispatch({ type: ACTIONS.SET_STATS, payload: stats }); 
              dispatch({ type: ACTIONS.SET_PHASE, payload: 'reflect' }); 
            }}
            audioEnabled={state.audioEnabled}
            apiKey={apiKey}
          />
        )}

        {state.phase === 'reflect' && (
          <ReflectPhase
            stats={state.playStats}
            onRestart={restart}
            onGoHome={goHome}
            audioEnabled={state.audioEnabled}
            apiKey={apiKey}
          />
        )}
      </div>
    </>
  );
}

export default App;
