import fs from 'fs';
import path from 'path';

const API_KEY = process.env.VITE_ELEVENLABS_API_KEY;
const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2'; // Alice

const phrases = [
  // Phase 1 - Wonder
  { text: "John is building a treehouse ladder. He needs the rungs to be evenly spaced, and the side rails to meet the floor at a perfect corner.", style: 'thinking' },
  { text: "How can he check if his ladder is built correctly? Let's find out!", style: 'question' },


  // Phase 2 - Story Panels
  { text: "Sarah and Yuki walk past the railway station on a sunny morning.", style: 'statement' },
  { text: "Look! The two railway tracks never touch. They stay exactly the same distance apart, forever. That is what we call parallel!", style: 'emphasis' },
  { text: "Now look at Yuki's window. The lines cross and make a perfect square corner, a right angle. That is perpendicular!", style: 'emphasis' },
  { text: "Some lines just cross at a slanted corner. Those are intersecting, but not perpendicular, because there is no right angle.", style: 'statement' },

  // Phase 3 - Simulation Instructions
  { text: "Drag a road so it is parallel to Main Street!", style: 'instruction' },
  { text: "Now build a road that is perpendicular to Main Street!", style: 'instruction' },
  { text: "Tap all the pairs of lines that are parallel!", style: 'instruction' },
  { text: "Drag the tester to the corner. Does it fit exactly?", style: 'question' },

  // Phase 4 - Feedback
  { text: "Perfect! That is exactly perpendicular! You are a geometry superstar!", style: 'celebration' },
  { text: "Not quite! Let us look at the lines again.", style: 'encouragement' },
  { text: "Watch the tester check the corner! Does it fit exactly?", style: 'thinking' },

  // Phase 5 - Reflect
  { text: "What a journey today! Can you find one parallel thing and one perpendicular thing in your own room?", style: 'thinking' },
  { text: "Lesson complete! You are a Parallel and Perpendicular Lines Champion!", style: 'celebration' },

  // Badge unlocks
  { text: "Badge unlocked! You are a Line Explorer!", style: 'celebration' },
  { text: "Badge unlocked! Line Builder! You completed all three stations!", style: 'celebration' },
  { text: "Badge unlocked! Right Angle Ranger! Your tester skills are excellent!", style: 'celebration' },
];

const STYLE_SETTINGS = {
  celebration: { stability: 0.45, similarity_boost: 0.90, style: 0.8 },
  encouragement: { stability: 0.55, similarity_boost: 0.85, style: 0.6 },
  question: { stability: 0.60, similarity_boost: 0.80, style: 0.3 },
  emphasis: { stability: 0.85, similarity_boost: 0.70, style: 0.1 },
  thinking: { stability: 0.65, similarity_boost: 0.80, style: 0.2 },
  statement: { stability: 0.75, similarity_boost: 0.75, style: 0.0 },
  instruction: { stability: 0.80, similarity_boost: 0.75, style: 0.0 },
};

async function generateAudio() {
  if (!API_KEY) {
    console.log("No ElevenLabs API key found. Skipping audio generation.");
    return;
  }

  const audioMap = {};
  const audioDir = path.join(process.cwd(), 'public', 'assets', 'audio');

  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  for (let i = 0; i < phrases.length; i++) {
    const { text, style } = phrases[i];
    const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 30);
    const filename = `audio_${slug}_${i}.mp3`;
    const filepath = path.join(audioDir, filename);
    const publicPath = `/assets/audio/${filename}`;

    audioMap[text] = publicPath;

    if (fs.existsSync(filepath)) {
      console.log(`Skipping existing: ${filename}`);
      continue;
    }

    try {
      console.log(`Generating: ${filename}`);
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: STYLE_SETTINGS[style] || STYLE_SETTINGS.statement
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      fs.writeFileSync(filepath, Buffer.from(buffer));

      // Rate limit
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`Failed to generate ${filename}:`, err);
    }
  }

  const mapFileContent = `export const audioMap = ${JSON.stringify(audioMap, null, 2)};\n`;
  fs.writeFileSync(path.join(process.cwd(), 'src', 'utils', 'audioMap.js'), mapFileContent);
  console.log("Audio generation and mapping complete.");
}

generateAudio();
