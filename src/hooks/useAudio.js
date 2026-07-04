import { audioMap } from '../utils/audioMap';

const elevenLabsCache = new Map();
const DEFAULT_VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2';

const STYLE_SETTINGS = {
  celebration:  { stability: 0.12, similarity_boost: 0.45, style: 0.75, use_speaker_boost: true },
  encouragement:{ stability: 0.16, similarity_boost: 0.50, style: 0.65, use_speaker_boost: true },
  question:     { stability: 0.20, similarity_boost: 0.55, style: 0.55, use_speaker_boost: true },
  emphasis:     { stability: 0.16, similarity_boost: 0.50, style: 0.60, use_speaker_boost: true },
  thinking:     { stability: 0.24, similarity_boost: 0.60, style: 0.35, use_speaker_boost: true },
  statement:    { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true },
  instruction:  { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true },
};

// ─── Global single-track audio engine ─────────────────────────────────────────
// Only one queue can play at a time. `currentQueueId` acts as a generation
// counter — incrementing it invalidates any active playback loop.

let currentAudio = null;
let currentQueueId = 0;
let pendingRequests = new Map(); // Track in-flight requests by queueId

// Create a single Audio instance that we will reuse.
const globalAudio = typeof Audio !== 'undefined' ? new Audio() : null;

// A promise that resolves when the current narration segment has finished playing.
// Used to prevent race conditions when rapidly changing slides.
let narrationCompletePromise = Promise.resolve();
let resolveNarrationComplete = () => {};

function playWithSpeechSynthesis(text) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

// When the global audio element finishes playing, resolve the current completion promise.
  if (globalAudio) {
    globalAudio.onended = () => {
      console.log("[globalAudio] Playback ended.");
      resolveNarrationComplete();
    };
    globalAudio.onerror = (e) => {
      console.error("[globalAudio] Playback error:", e);
      resolveNarrationComplete();
    };
  }

/**
 * stopNarration()
 * Immediately halts any playing audio and cancels the active queue.
 * Safe to call even if nothing is playing.
 */
export function stopNarration() {
  // Cancel any in-flight ElevenLabs requests for this queue
  // Invalidate any running queue loop FIRST.
  // This will cause any in-progress narrate() call to exit early.
  currentQueueId++; 

  // Cancel any in-flight ElevenLabs requests immediately.
  for (const [key, controller] of pendingRequests) {
    controller.abort();
  }
  pendingRequests.clear();

  // Interrupt any currently playing audio.
  if (globalAudio) {
    globalAudio.pause();
    globalAudio.currentTime = 0;
    globalAudio.src = ""; // Release the audio resource.
  }
  window.speechSynthesis?.cancel();
  
  // Ensure any pending narration completion promise is resolved to prevent deadlocks.
  resolveNarrationComplete();
  narrationCompletePromise = new Promise(resolve => resolveNarrationComplete = resolve);

  currentAudio = null;
}

/**
 * getAudioUrl(text, style, apiKey)
 * Returns the URL for audio, checking cache first, then pre-generated map,
 * then fetching from ElevenLabs if needed.
 */
export async function getAudioUrl(text, style = 'statement', apiKey, queueId = 0) {
  // 1. Check pre-generated audio map first (zero latency)
  if (audioMap && audioMap[text]) {
    console.log(`[getAudioUrl] Using pre-generated audio for: "${text}"`);
    return audioMap[text];
  }

  // 2. Check in-memory cache for dynamic audio
  const cacheKey = `${text}::${style}`;
  if (elevenLabsCache.has(cacheKey)) {
    console.log(`[getAudioUrl] Using cached audio for: "${text}"`);
    return elevenLabsCache.get(cacheKey);
  }

  // 3. Fetch from the Vercel proxy first, then fall back to direct ElevenLabs only when a client API key exists.
  try {
    const styleSettings = STYLE_SETTINGS[style] || STYLE_SETTINGS.statement;
    const controller = new AbortController();
    pendingRequests.set(`${queueId}-${cacheKey}`, controller);

    console.log(`[getAudioUrl] Fetching audio for: "${text}"`);
    let response = await fetch('/api/elevenlabs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voiceId: DEFAULT_VOICE_ID,
        voiceSettings: styleSettings,
      }),
      signal: controller.signal,
    });

    pendingRequests.delete(`${queueId}-${cacheKey}`);

    const isHtmlFallback = (response.headers.get('content-type') || '').includes('text/html');
    const resolvedApiKey = apiKey || import.meta.env.VITE_ELEVENLABS_API_KEY;

    if ((!response.ok || isHtmlFallback) && resolvedApiKey) {
      console.warn('[getAudioUrl] Proxy returned an error, retrying directly from ElevenLabs.');
      response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_VOICE_ID}`, {
        method: 'POST',
        headers: {
          'xi-api-key': resolvedApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: styleSettings,
        }),
        signal: controller.signal,
      });
    }

    if (!response.ok || isHtmlFallback) {
      console.error('[getAudioUrl] Audio request failed:', response.status, response.statusText);
      return null;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    elevenLabsCache.set(cacheKey, url);
    console.log(`[getAudioUrl] Successfully fetched and cached audio for: "${text}"`);
    return url;
  } catch (e) {
    // Ignore abort errors - they're expected when navigating away
    if (e.name !== 'AbortError') {
      console.error('[useAudio] Audio fetch error:', e);
    }
    return null;
  }
}

/**
 * preloadAudio(text, style, apiKey)
 * Pre-generates and caches audio for upcoming slides.
 * Safe to call even if nothing is playing.
 */
export async function preloadAudio(text, style = 'statement', apiKey) {
  // Skip if already cached
  const cacheKey = `${text}::${style}`;
  if (elevenLabsCache.has(cacheKey) || (audioMap && audioMap[text])) {
    return;
  }
  if (!apiKey) return;
  
  // Fire-and-forget preload
  getAudioUrl(text, style, apiKey, -1).catch(() => null);
}

/**
 * narrate(segments, apiKey)
 * Plays an array of { text, style } segments sequentially.
 * - Automatically stops any previously playing narration before starting.
 * - Checks `currentQueueId` at every async boundary to abort if cancelled.
 * - Preloads the next segment's URL while the current one plays.
 * - Adds an 80 ms gap between segments to prevent clipping.
 *
 * @param {Array<{text:string, style:string}>} segments
 * @param {string|undefined} apiKey  ElevenLabs API key (optional)
 * @returns {void}  (fire-and-forget; use stopNarration() to cancel)
 */
export async function narrate(segments, apiKey) {
  // Before starting new narration, wait for any existing narration to complete.
  // This ensures that `stopNarration` has fully processed and cleared the audio system.
  await narrationCompletePromise;

  // Bump the generation counter — this cancels any existing queue
  currentQueueId++;
  const myQueueId = currentQueueId;

  // If global audio isn't available, we can't narrate.
  if (!globalAudio) {
    console.warn("[narrate] Audio not supported in this environment.");
    resolveNarrationComplete(); // Resolve the promise to prevent waiting indefinitely in non-audio environments.
    return;
  }

  for (let i = 0; i < segments.length; i++) {
    // Cancelled? (e.g., by stopNarration() or a new narrate() call)
    if (currentQueueId !== myQueueId) return;

    const { text, style } = segments[i];
    const url = await getAudioUrl(text, style, apiKey, myQueueId);

    if (currentQueueId !== myQueueId) return; // Cancelled while fetching.

    // Eagerly preload the next segment's URL so it's cache-warm.
    if (i + 1 < segments.length) {
      preloadAudio(segments[i + 1].text, segments[i + 1].style, apiKey);
    }

    // Set up a new promise for the completion of this narration segment.
    narrationCompletePromise = new Promise(resolve => resolveNarrationComplete = resolve);

    if (!url) {
      console.warn(`[narrate] No audio URL available for "${text}"; using browser speech fallback.`);
      await playWithSpeechSynthesis(text);
      resolveNarrationComplete();
      if (currentQueueId !== myQueueId) return;
      if (i < segments.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 80));
      }
      continue;
    }

    // Assign the new audio URL to the single global Audio instance.
    globalAudio.src = url;
    currentAudio = globalAudio; // Keep a reference to the currently playing audio.

    // Play the audio. Handle potential autoplay policy issues gracefully.
    try {
      await globalAudio.play();
    } catch (e) {
      console.warn("[narrate] Audio playback blocked by browser (autoplay policy?)", e);
      await playWithSpeechSynthesis(text);
      resolveNarrationComplete(); // Resolve to prevent deadlock if play fails.
    }

    // Wait for the current segment to finish playing (or be interrupted).
    await narrationCompletePromise;

    // If we were cancelled during playback, exit.
    if (currentQueueId !== myQueueId) return;

    // Add an 80 ms gap between segments to prevent clipping, but only if not the last segment.
    if (i < segments.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 80));
    }
  }

  // After all segments, clear the current audio reference.
  currentAudio = null;
  resolveNarrationComplete(); // Resolve the final completion promise.
}
