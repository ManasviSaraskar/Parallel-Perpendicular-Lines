import { audioMap } from '../utils/audioMap';

const DEFAULT_VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2';
const DEFAULT_MODEL_ID = 'eleven_multilingual_v2';

const STYLE_SETTINGS = {
  celebration:  { stability: 0.12, similarity_boost: 0.45, style: 0.75, use_speaker_boost: true },
  encouragement:{ stability: 0.16, similarity_boost: 0.50, style: 0.65, use_speaker_boost: true },
  question:     { stability: 0.20, similarity_boost: 0.55, style: 0.55, use_speaker_boost: true },
  emphasis:     { stability: 0.16, similarity_boost: 0.50, style: 0.60, use_speaker_boost: true },
  thinking:     { stability: 0.24, similarity_boost: 0.60, style: 0.35, use_speaker_boost: true },
  statement:    { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true },
  instruction:  { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true },
  default:      { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true },
};

const elevenLabsCache = new Map();
let currentQueueId = 0;
let pendingRequests = new Map();
const globalAudio = typeof Audio !== 'undefined' ? new Audio() : null;
let narrationCompletePromise = Promise.resolve();
let resolveNarrationComplete = () => {};

if (globalAudio) {
  globalAudio.onended = () => resolveNarrationComplete();
  globalAudio.onerror = () => resolveNarrationComplete();
}

/**
 * stopNarration()
 * Immediately halts any playing audio and cancels the active queue.
 * Safe to call even if nothing is playing.
 */
export function stopNarration() {
  currentQueueId += 1;

  for (const controller of pendingRequests.values()) {
    controller.abort();
  }
  pendingRequests.clear();

  if (globalAudio) {
    globalAudio.pause();
    globalAudio.currentTime = 0;
    globalAudio.src = '';
  }

  resolveNarrationComplete();
  narrationCompletePromise = new Promise((resolve) => { resolveNarrationComplete = resolve; });
}

/**
 * getAudioUrl(text, style, apiKey)
 * Returns the URL for audio, checking pre-generated assets first,
 * then dynamic ElevenLabs audio if needed.
 */
export async function getAudioUrl(text, style = 'statement', apiKey, queueId = 0) {
  const cacheKey = `${text}::${style}`;
  const styleSettings = STYLE_SETTINGS[style] || STYLE_SETTINGS.default;

  if (audioMap && audioMap[text]) {
    console.log(`[getAudioUrl] Using pre-generated ElevenLabs Alice audio for: "${text}"`);
    return audioMap[text];
  }

  if (elevenLabsCache.has(cacheKey)) {
    console.log(`[getAudioUrl] Using cached ElevenLabs Alice audio for: "${text}"`);
    return elevenLabsCache.get(cacheKey);
  }

  const resolvedApiKey = apiKey || import.meta.env.VITE_ELEVENLABS_API_KEY;
  if (!resolvedApiKey) {
    console.warn(`[getAudioUrl] No ElevenLabs API key available for dynamic audio: "${text}"`);
    return null;
  }

  const controller = new AbortController();
  pendingRequests.set(`${queueId}-${cacheKey}`, controller);

  try {
    console.log(`[getAudioUrl] Fetching dynamic Alice audio from ElevenLabs for: "${text}"`);
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': resolvedApiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: DEFAULT_MODEL_ID,
        voice_settings: styleSettings,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorPayload = await response.text().catch(() => 'Unknown ElevenLabs error');
      console.error('[getAudioUrl] ElevenLabs request failed:', response.status, response.statusText, errorPayload);
      return null;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    elevenLabsCache.set(cacheKey, url);
    return url;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('[getAudioUrl] ElevenLabs fetch error:', error);
    }
    return null;
  } finally {
    pendingRequests.delete(`${queueId}-${cacheKey}`);
  }
}

/**
 * preloadAudio(text, style, apiKey)
 * Preloads the next line of narration so audio is ready when needed.
 */
export async function preloadAudio(text, style = 'statement', apiKey) {
  const cacheKey = `${text}::${style}`;
  if (elevenLabsCache.has(cacheKey) || (audioMap && audioMap[text])) {
    return;
  }
  await getAudioUrl(text, style, apiKey, -1).catch(() => null);
}

/**
 * narrate(segments, apiKey)
 * Plays an array of { text, style } segments sequentially.
 */
export async function narrate(segments, apiKey) {
  await narrationCompletePromise;
  currentQueueId += 1;
  const myQueueId = currentQueueId;

  if (!globalAudio) {
    console.warn('[narrate] Audio is not supported in this environment.');
    resolveNarrationComplete();
    return;
  }

  for (let i = 0; i < segments.length; i += 1) {
    if (currentQueueId !== myQueueId) return;

    const { text, style } = segments[i];
    const url = await getAudioUrl(text, style, apiKey, myQueueId);
    if (currentQueueId !== myQueueId) return;

    if (i + 1 < segments.length) {
      preloadAudio(segments[i + 1].text, segments[i + 1].style, apiKey);
    }

    narrationCompletePromise = new Promise((resolve) => { resolveNarrationComplete = resolve; });

    if (!url) {
      console.warn(`[narrate] No ElevenLabs Alice audio available for "${text}"; skipping voice playback.`);
      resolveNarrationComplete();
      if (currentQueueId !== myQueueId) return;
      if (i < segments.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 80));
      }
      continue;
    }

    globalAudio.src = url;

    try {
      await globalAudio.play();
    } catch (error) {
      console.warn('[narrate] Audio playback failed for ElevenLabs Alice audio.', error);
      resolveNarrationComplete();
    }

    await narrationCompletePromise;
    if (currentQueueId !== myQueueId) return;

    if (i < segments.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
  }

  currentAudio = null;
  resolveNarrationComplete();
}
