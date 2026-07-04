export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateSessionQuestions(bank) {
  const byType = {};
  bank.forEach(q => {
    if (!byType[q.type]) byType[q.type] = [];
    byType[q.type].push(q);
  });

  // Pick 10 from each type (shuffled), then shuffle the combined 100
  const selected = Object.values(byType)
    .flatMap(qs => shuffleArray(qs).slice(0, 10));
  return shuffleArray(selected);
}
