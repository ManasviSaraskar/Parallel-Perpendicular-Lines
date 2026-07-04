import { shuffleArray } from './shuffle';

export function calcXP(attemptNumber, hintsUsed, streak) {
  const base = attemptNumber === 1 ? 10 : hintsUsed > 0 ? 5 : 7;
  const streakBonus = streak >= 5 ? 5 : 0;
  return base + streakBonus;
}

export function calcStars(correct, total = 10) {
  if (correct >= 9) return 3; // Gold: >=90%
  if (correct >= 7) return 2; // Silver: >=70%
  if (correct >= 5) return 1; // Bronze: >=50% (world unlock gate)
  return 0;                   // Try again
}

export function canUnlockWorld(worldScore) {
  return worldScore !== null && worldScore >= 5;
}

export function calcTotalStars(worldScores) {
  return worldScores.reduce((sum, ws) => sum + (ws !== null ? calcStars(ws) : 0), 0);
}

export function generateLineDistractors(correctRelationship) {
  const ALL = ['Parallel', 'Perpendicular', 'Intersecting', 'Neither'];
  const distractors = shuffleArray(ALL.filter(r => r !== correctRelationship)).slice(0, 3);
  return shuffleArray([correctRelationship, ...distractors]);
}

export function generateGridDistractors(correctPoint, count = 3) {
  const distractors = new Set();
  const offsets = [[1,0], [-1,0], [0,1], [0,-1], [1,1], [-1,-1]];
  shuffleArray(offsets).forEach(([dx, dy]) => {
    if (distractors.size < count) {
      distractors.add(`(${correctPoint.x + dx},${correctPoint.y + dy})`);
    }
  });
  return shuffleArray([`(${correctPoint.x},${correctPoint.y})`, ...distractors]);
}
