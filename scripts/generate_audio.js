import fs from 'fs';
import path from 'path';

const API_KEY = process.env.VITE_ELEVENLABS_API_KEY;
const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2'; // Alice
const MODEL_ID = 'eleven_multilingual_v2';

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
  { text: "Set the mirror to a 45-degree angle. That will make the laser bounce off at a perfect 90-degree turn and hit the gem!", style: 'instruction' },
  { text: "Perfect! A 45-degree mirror makes the laser reflect at a right angle and hit the gem!", style: 'celebration' },
  { text: "Not quite! Set the mirror to exactly 45 degrees so the laser reflects at a perfect 90-degree angle onto the gem.", style: 'encouragement' },

  { text: "Adjust the new track to be PERFECTLY parallel to the existing bridge so the train can cross!", style: 'instruction' },
  { text: "Awesome! The tracks are parallel and the train is safe!", style: 'celebration' },
  { text: "Not quite parallel! The train will crash if the tracks aren't straight.", style: 'encouragement' },

  { text: "Slice the shape PERPENDICULAR to the glowing bottom edge!", style: 'instruction' },
  { text: "Ninja slice! Perfect perpendicular cut!", style: 'celebration' },
  { text: "Not quite! A perpendicular cut needs to be exactly straight up and down here.", style: 'encouragement' },

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

  // Question Bank
  { text: "Which pair of lines is PARALLEL?", style: 'question' },
  { text: "Which pair of lines is PERPENDICULAR?", style: 'question' },
  { text: "Look at these two lines. Are they parallel, perpendicular, intersecting, or neither?", style: 'question' },
  { text: "\"These two lines are parallel.\" True or False?", style: 'question' },
  { text: "\"These two lines are perpendicular.\" True or False?", style: 'question' },
  { text: "A student is looking for a pair of PARALLEL lines. Which object shows this?", style: 'question' },
  { text: "A builder uses a tester on the corner. Does it fit exactly?", style: 'question' },
  { text: "How many pairs of parallel lines are in this rectangle?", style: 'question' },
  { text: "How many pairs of perpendicular lines are in this shape?", style: 'question' },
  { text: "Which letter has a pair of PERPENDICULAR lines?", style: 'question' },
  { text: "Our friend wants to find a shape with PERPENDICULAR lines. Which one has lines that cross at a perfect 90° corner?", style: 'question' },

  // PlayPhase
  { text: "Welcome to the new world! Let's go!", style: 'celebration' },
  { text: "World complete! Great job!", style: 'celebration' },
  { text: "Amazing! Great streak!", style: 'celebration' },
  { text: "Correct! Well done!", style: 'celebration' },

  // ReflectPhase
  { text: "Wonderful! Now let us reflect on what you learned. Teach the mascot!", style: 'statement' },
  { text: "Excellent! That is correct!", style: 'celebration' },
  { text: "Not quite, but keep trying!", style: 'encouragement' },
  { text: "How do you feel about parallel and perpendicular lines now?", style: 'question' },
  { text: "You completed the challenge! Amazing work today!", style: 'celebration' },

  // Intro Screen
  { text: "Hello! Today we are going to explore Parallel and Perpendicular Lines!", style: 'cheer' },

  // Reflect Phase Questions
  { text: "Two roads run side by side and never cross. What type of lines are they?", style: 'question' },
  { text: "What makes two lines 'perpendicular'?", style: 'question' },
  { text: "The sides of a window frame — what geometry do they show?", style: 'question' },
];

const STYLE_SETTINGS = {
  celebration: { stability: 0.12, similarity_boost: 0.45, style: 0.75, use_speaker_boost: true },
  encouragement: { stability: 0.16, similarity_boost: 0.50, style: 0.65, use_speaker_boost: true },
  question: { stability: 0.20, similarity_boost: 0.55, style: 0.55, use_speaker_boost: true },
  emphasis: { stability: 0.16, similarity_boost: 0.50, style: 0.60, use_speaker_boost: true },
  thinking: { stability: 0.24, similarity_boost: 0.60, style: 0.35, use_speaker_boost: true },
  statement: { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true },
  instruction: { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true },
};

async function generateAudio() {
  if (!API_KEY) {
    console.log('No ElevenLabs API key found. Skipping audio generation.');
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
          model_id: MODEL_ID,
          voice_settings: STYLE_SETTINGS[style] || STYLE_SETTINGS.statement
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      fs.writeFileSync(filepath, Buffer.from(buffer));
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      console.error(`Failed to generate ${filename}:`, err);
    }
  }

  const mapFileContent = `export const audioMap = ${JSON.stringify(audioMap, null, 2)};\n`;
  fs.writeFileSync(path.join(process.cwd(), 'src', 'utils', 'audioMap.js'), mapFileContent);
  console.log('Audio generation and mapping complete.');
}

generateAudio();
