import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { narrate, stopNarration, preloadAudio } from '../../hooks/useAudio';
import { say, emphasize } from '../../utils/narration';

const STORY_SLIDES = [
  {
    image: '/images/story_treehouse.png',
    title: "John's Treehouse",
    text: "John is building a treehouse ladder. He needs the rungs to be evenly spaced, and the side rails to meet the floor at a perfect corner.",
    highlight: '"Lines can be parallel or perpendicular!"',
    mascotText: "Lines are everywhere! 🪜",
    action: say,
  },
  {
    image: '/images/story_parallel.png',
    title: "Parallel Lines",
    text: "Look! The two railway tracks never touch. They stay exactly the same distance apart, forever. That is what we call parallel!",
    highlight: '"Same direction, same distance, forever!"',
    mascotText: "They never crash! 🛤️",
    action: emphasize,
  },
  {
    image: '/images/story_perpendicular.png',
    title: "Perpendicular Lines",
    text: "Now look at Yuki's window. The lines cross and make a perfect square corner, a right angle. That is perpendicular!",
    highlight: '"A perfect square corner — 90°!"',
    mascotText: "Like the corner of a book! 📐",
    action: emphasize,
  },
  {
    image: '/images/story_intersecting.png',
    title: "Intersecting Lines",
    text: "Some lines just cross at a slanted corner. Those are intersecting, but not perpendicular, because there is no right angle.",
    highlight: '"They cross, but not at 90°."',
    mascotText: "Watch out, they cross! ❌",
    action: say,
  },
];

export default function StoryPhase({ onComplete, audioEnabled, apiKey }) {
  const [slide, setSlide] = useState(0);
  const [anim, setAnim] = useState(false);
  const [textVis, setTextVis] = useState(false);
  const [hlVis, setHlVis] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const s = STORY_SLIDES[slide];
  const isLast = slide === STORY_SLIDES.length - 1;
  const pct = ((slide + 1) / STORY_SLIDES.length) * 100;

  // Preload next slide's audio when component mounts or slide changes.
  useEffect(() => {
    if (audioEnabled && apiKey) {
      // Preload all upcoming slides
      STORY_SLIDES.forEach((slideData, index) => {
        // Preload current and upcoming slides.
        // We preload the current slide too, as `narrate` might be called before `preloadAudio` had a chance to run for the current slide.
        if (index >= slide) {
          const segment = slideData.action(slideData.text);
          preloadAudio(segment.text, segment.style, apiKey);
        }
      });
    }
  }, [audioEnabled, apiKey, slide]);

  useEffect(() => {
    setTextVis(false); setHlVis(false); setImgLoaded(false);
    // Removed timeouts for immediate text and highlight visibility
    setTextVis(true);
    setHlVis(true);
  }, [slide]);

  // Start narration immediately when the slide changes.
  // stopNarration() is called by the navigation buttons.
  useEffect(() => {
    if (audioEnabled) {
      narrate([s.action(s.text)], apiKey);
    }
  }, [slide, audioEnabled, apiKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = useCallback(() => {
    if (anim) return;
    stopNarration();
    setAnim(true);
    // Set the next slide immediately to reduce perceived latency.
    if (isLast) onComplete();
    else setSlide(i => i + 1);
    setAnim(false);
  }, [anim, isLast, onComplete]);

  const goPrev = useCallback(() => {
    if (anim || slide === 0) return;
    stopNarration();
    setAnim(true);
    setSlide(i => i - 1);
    setAnim(false);
  }, [anim, slide]);

  return (
    <div className="story-phase">
      <div className="story-progress">
        <div className="story-progress-bar">
          <div className="story-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="story-progress-label">{slide + 1} / {STORY_SLIDES.length}</span>
      </div>

      <div className={`story-card ${anim ? 'flipping' : ''}`}>
        <div className="story-image-section">
          <img
            src={s.image}
            alt={s.title}
            className="story-image"
            style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.4s ease' }}
            onLoad={() => setImgLoaded(true)}
          />
          <div className="story-image-overlay" />
        </div>

        <div className="story-text-section">
          <h2 className="story-title">{s.title}</h2>
          <p className={`story-text ${textVis ? 'revealed' : ''}`}>{s.text}</p>

          <div className={`story-highlight ${hlVis ? 'visible' : ''}`}>
            <span>✨</span>
            <span className="story-highlight-text">{s.highlight}</span>
            <span>✨</span>
          </div>

          <div className="story-mascot">
            <div className="mascot" style={{ width: 50, height: 50, fontSize: '1.4rem' }}>🤖</div>
            <div className="speech-bubble" style={{ fontSize: '0.8rem', padding: '8px 14px', maxWidth: 180 }}>
              {s.mascotText}
            </div>
          </div>
        </div>
      </div>

      <div className="story-nav">
        <button className="btn btn-outline btn-sm" onClick={goPrev} disabled={slide === 0} style={{ opacity: slide === 0 ? 0.3 : 1 }}>
          ← Back
        </button>
        <div className="story-dots">
          {STORY_SLIDES.map((_, i) => (
            <div key={i} className={`story-dot ${i === slide ? 'active' : i < slide ? 'completed' : ''}`} />
          ))}
        </div>
        <button className={`btn ${isLast ? 'btn-green' : 'btn-primary'} btn-sm`} onClick={goNext}>
          {isLast ? "🚀 Let's Explore!" : 'Next →'}
        </button>
      </div>
    </div>
  );
}
