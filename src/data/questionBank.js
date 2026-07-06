import { shuffleArray } from '../utils/shuffle';

const objects = ['railway tracks', 'ladder rungs', 'football/soccer goalposts', 'window panes', 'staircases', 'kite strings', 'road crossings', 'bridge beams', 'book pages', 'tic-tac-toe grids', 'fence rails', 'laptop screens', 'picture frames'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Q1: Spot parallel lines (picture MCQ)
function genQ1(id, diff) {
  const obj = pick(objects);
  const correct = 'Railway tracks';
  const wrongOptions = ['A crossroad', 'An open book', 'A plus sign'];
  return {
    id, type: 'spot_parallel', difficulty: diff, world: 0,
    relationship: 'parallel',
    questionText: `Which pair of lines is PARALLEL?`,
    visual: 'picture', objectTheme: 'railway',
    hint1: `Parallel lines never touch and always stay the same distance apart.`,
    hint2: `Look for the pair where the gap between the lines never changes.`,
    explanation: `Railway tracks are a classic example — they stay the same distance apart forever, so they are parallel.`,
    options: shuffleArray([correct, ...wrongOptions.slice(0, 3)]),
    correctAnswer: correct,
  };
}

// Q2: Spot perpendicular lines (picture MCQ)
function genQ2(id, diff) {
  const correct = 'Window panes';
  const wrongOptions = ['Railway tracks', 'Ladder sides', 'Ski poles'];
  return {
    id, type: 'spot_perpendicular', difficulty: diff, world: 0,
    relationship: 'perpendicular',
    questionText: `Which pair of lines is PERPENDICULAR?`,
    visual: 'picture', objectTheme: 'window',
    hint1: `Perpendicular lines meet to form a perfect square corner.`,
    hint2: `Think of the corner of a book or a square.`,
    explanation: `Window panes often cross exactly at a right angle, making them perpendicular.`,
    options: shuffleArray([correct, ...wrongOptions.slice(0, 3)]),
    correctAnswer: correct,
  };
}

// Q3: Classify the line pair (4-option MCQ)
function genQ3(id, diff) {
  const relationships = ['Parallel', 'Perpendicular', 'Intersecting', 'Neither'];
  const correct = pick(relationships.slice(0, 3));
  const rMap = {
    'Parallel': { aA: 0, aB: 0 },
    'Perpendicular': { aA: 0, aB: 90 },
    'Intersecting': { aA: 0, aB: 45 }
  };
  return {
    id, type: 'classify_pair', difficulty: diff, world: 0,
    relationship: correct.toLowerCase(),
    lineAngleA: rMap[correct].aA, lineAngleB: rMap[correct].aB,
    questionText: `Look at these two lines. Are they parallel, perpendicular, intersecting, or neither?`,
    visual: 'linePair',
    hint1: `Look at how they cross or if they stay the same distance apart.`,
    hint2: correct === 'Parallel' ? 'They never cross.' : correct === 'Perpendicular' ? 'They form a square corner.' : 'They cross, but not at a square corner.',
    explanation: `These lines are ${correct}.`,
    options: shuffleArray(relationships),
    correctAnswer: correct,
  };
}

// Q4: True or False
function genQ4(id, diff) {
  const isTrue = Math.random() > 0.5;
  const isPerp = Math.random() > 0.5;
  const rel = isPerp ? 'perpendicular' : 'parallel';
  
  let actualRel = rel;
  if (!isTrue) {
    actualRel = isPerp ? 'parallel' : 'perpendicular';
  }

  const rMap = {
    'parallel': { aA: 0, aB: 0 },
    'perpendicular': { aA: 0, aB: 90 }
  };

  return {
    id, type: 'true_false_line', difficulty: diff, world: 0,
    relationship: actualRel,
    lineAngleA: rMap[actualRel].aA, lineAngleB: rMap[actualRel].aB,
    isTrue,
    questionText: `"These two lines are ${rel}." True or False?`,
    visual: 'linePair',
    hint1: rel === 'parallel' ? 'Parallel lines never touch.' : 'Perpendicular lines form a right angle.',
    hint2: `Look at the diagram carefully. Does it match the word ${rel}?`,
    explanation: `The lines are actually ${actualRel}. So the statement is ${isTrue ? 'True' : 'False'}.`,
    options: ['True', 'False'],
    correctAnswer: isTrue ? 'True' : 'False',
  };
}

// Q5: Real-world object match
function genQ5(id, diff) {
  const name = 'A student';
  const correct = 'ladder rungs';
  const wrongOptions = ['a crossroad', 'a plus sign', 'a corner of a room'];
  return {
    id, type: 'real_world_match', difficulty: diff, world: 0,
    relationship: 'parallel',
    questionText: `${name} is looking for a pair of PARALLEL lines. Which object shows this?`,
    visual: 'picture',
    hint1: `Think of things that stay the same distance apart so you can climb or roll on them safely.`,
    hint2: `A ladder has steps that never cross each other.`,
    explanation: `Ladder rungs are parallel so the steps are even.`,
    options: shuffleArray([correct, ...wrongOptions.slice(0, 3)]),
    correctAnswer: correct,
  };
}

// Q6: Right-angle tester check
function genQ6(id, diff) {
  const isPerp = Math.random() > 0.5;
  const name = 'A builder';
  return {
    id, type: 'right_angle_check', difficulty: diff, world: 0,
    relationship: isPerp ? 'perpendicular' : 'intersecting',
    lineAngleA: 0, lineAngleB: isPerp ? 90 : 60,
    questionText: `${name} uses a tester on the corner. Does it fit exactly?`,
    visual: 'linePair',
    hint1: `A right angle looks like a perfect square corner.`,
    hint2: `If the tester fits snugly with no gap, it's a right angle!`,
    explanation: isPerp ? `The tester fits exactly, so they are perpendicular.` : `The tester doesn't fit, so they are just intersecting.`,
    options: ['Yes', 'No'],
    correctAnswer: isPerp ? 'Yes' : 'No',
  };
}

// Q7: Count the pairs — parallel
function genQ7(id, diff) {
  return {
    id, type: 'count_parallel', difficulty: diff, world: 0,
    relationship: 'parallel', pairCount: 2,
    questionText: `How many pairs of parallel lines are in this rectangle?`,
    visual: 'shape',
    hint1: `A rectangle has opposite sides that are parallel.`,
    hint2: `Top and bottom are one pair. Left and right are the second pair.`,
    explanation: `A rectangle has 2 pairs of parallel lines.`,
    options: ['0', '1', '2', '4'],
    correctAnswer: '2',
  };
}

// Q8: Count the pairs — perpendicular
function genQ8(id, diff) {
  return {
    id, type: 'count_perpendicular', difficulty: diff, world: 0,
    relationship: 'perpendicular', pairCount: 4,
    questionText: `How many pairs of perpendicular lines are in this shape?`,
    visual: 'shape',
    hint1: `Perpendicular lines meet at the corners.`,
    hint2: `Count the square corners (right angles) in the rectangle.`,
    explanation: `A rectangle has 4 square corners, so there are 4 pairs of perpendicular lines.`,
    options: ['2', '3', '4', '8'],
    correctAnswer: '4',
  };
}

// Q9: Letter detective
function genQ9(id, diff) {
  return {
    id, type: 'letter_detective', difficulty: diff, world: 0,
    relationship: 'perpendicular',
    questionText: `Which letter has a pair of PERPENDICULAR lines?`,
    visual: 'letter',
    hint1: `Look for a letter with a straight line meeting another at a square corner.`,
    hint2: `The letter T has a vertical line meeting a horizontal line at a right angle!`,
    explanation: `The letter T's two strokes meet at a perfect right angle, so they are perpendicular.`,
    options: ['T', 'O', 'S', 'C'],
    correctAnswer: 'T',
  };
}

// Q10: Real-world perpendicular match (replaces buggy complete_grid)
function genQ10(id, diff) {
  const name = 'Our friend';
  const correct = 'A plus sign (+)';
  const wrongOptions = ['Railway tracks', 'Ski slopes', 'Parallel bars'];
  return {
    id, type: 'real_world_match', difficulty: diff, world: 0,
    relationship: 'perpendicular',
    questionText: `${name} wants to find a shape with PERPENDICULAR lines. Which one has lines that cross at a perfect 90° corner?`,
    visual: 'picture', objectTheme: 'plus',
    hint1: `Perpendicular lines cross at exactly 90° — like the corner of a square.`,
    hint2: `Think of a shape made from one horizontal and one vertical line crossing in the middle.`,
    explanation: `A plus sign (+) is made of one horizontal and one vertical line crossing at exactly 90° — that's perpendicular!`,
    options: shuffleArray([correct, ...wrongOptions.slice(0, 3)]),
    correctAnswer: correct,
  };
}

const generators = [genQ1, genQ2, genQ3, genQ4, genQ5, genQ6, genQ7, genQ8, genQ9, genQ10];

// PRD difficulty distribution per type (15 questions total for 3 worlds, 5 per world)
const diffDist = {
  q1:  [1, 2],
  q2:  [1, 2],
  q3:  [1, 2],
  q4:  [1, 2],
  q5:  [1, 2],
  q6:  [2],
  q7:  [2],
  q8:  [2],
  q9:  [2],
  q10: [3],
};

export function generateSessionQuestions() {
  const bank = [];
  let qid = 1;
  const qKeys = ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'];

  generators.forEach((gen, gi) => {
    const diffs = diffDist[qKeys[gi]];
    diffs.forEach(diff => {
      bank.push(gen(`Q${gi + 1}_${String(qid).padStart(3, '0')}`, diff));
      qid++;
    });
  });

  const selected = shuffleArray(bank);
  selected.forEach((q, index) => {
    q.world = Math.floor(index / 5);
  });

  return selected;
}
