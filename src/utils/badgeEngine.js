export const BADGES = [
  {
    id: 'line_explorer',
    label: '🏅 Line Explorer',
    description: 'Complete Wonder and Story phases',
    condition: (s) => s.phaseComplete.wonder && s.phaseComplete.story,
  },
  {
    id: 'line_builder',
    label: '🥈 Line Builder',
    description: 'Complete all 3 Simulation stations',
    condition: (s) => s.simStationsComplete.every(Boolean),
  },
  {
    id: 'geometry_champion',
    label: '🥇 Geometry Champion',
    description: 'Score 80%+ in Play phase',
    condition: (s) => {
      const totalCorrect = s.worldScores.reduce((sum, ws) => sum + (ws || 0), 0);
      return totalCorrect >= 80;
    },
  },
  {
    id: 'perfect_lines',
    label: '💎 Perfect Lines',
    description: 'Score 10/10 in any world',
    condition: (s) => s.worldScores.some(ws => ws === 10),
  },
  {
    id: 'streak_star',
    label: '🔥 Streak Star',
    description: 'Achieve a streak of 10 consecutive correct answers',
    condition: (s) => s.maxStreak >= 10,
  },
  {
    id: 'full_journey',
    label: '🌟 Full Journey',
    description: 'Complete all 5 phases',
    condition: (s) => Object.values(s.phaseComplete).every(Boolean),
  },
  {
    id: 'sharp_eye',
    label: '🎯 Sharp Eye',
    description: 'Complete Station B without any wrong selection',
    condition: (s) => s.stationBPerfect === true,
  },
  {
    id: 'right_angle_ranger',
    label: '📐 Right Angle Ranger',
    description: 'Correctly use the right-angle tester 5 times in a row',
    condition: (s) => s.testerFitStreak >= 5,
  },
];

export function checkBadges(state) {
  return BADGES
    .filter(b => !state.badges.includes(b.id) && b.condition(state))
    .map(b => b.id);
}
