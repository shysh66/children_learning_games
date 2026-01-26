// Level configurations for each game mode
// Defines difficulty progression and question parameters

export const QUESTIONS_PER_LEVEL = 8;
export const STARS_TO_UNLOCK_NEXT = 1; // Minimum stars needed to unlock next level
export const TOTAL_LEVELS = 4; // Total levels per game mode

// Addition & Subtraction level configurations
export const addSubLevels = {
  1: {
    id: 1,
    name: 'שלב 1',
    description: 'חיבור עד 10',
    maxResult: 10,
    allowSubtraction: false,
    allowCrossing: false, // No carrying/borrowing
    visualRequired: true,
  },
  2: {
    id: 2,
    name: 'שלב 2',
    description: 'חיבור וחיסור עד 20',
    maxResult: 20,
    allowSubtraction: true,
    allowCrossing: false,
    visualRequired: true,
  },
  3: {
    id: 3,
    name: 'שלב 3',
    description: 'מעבר העשרת',
    maxResult: 20,
    allowSubtraction: true,
    allowCrossing: true, // Carrying/borrowing (e.g., 8+5, 12-4)
    visualRequired: false,
  },
  4: {
    id: 4,
    name: 'שלב 4',
    description: 'מספרים עד 50',
    maxResult: 50,
    allowSubtraction: true,
    allowCrossing: true,
    visualRequired: false,
  },
};

// Multiplication level configurations
export const multiplyLevels = {
  1: {
    id: 1,
    name: 'שלב 1',
    description: 'כפולות של 1, 2, 10',
    multipliers: [1, 2, 10],
    maxMultiplier: 10,
    visualRequired: true,
  },
  2: {
    id: 2,
    name: 'שלב 2',
    description: 'כפולות של 5',
    multipliers: [1, 2, 5, 10],
    maxMultiplier: 10,
    visualRequired: true,
  },
  3: {
    id: 3,
    name: 'שלב 3',
    description: 'כפולות של 3, 4',
    multipliers: [1, 2, 3, 4, 5, 10],
    maxMultiplier: 10,
    visualRequired: false,
  },
  4: {
    id: 4,
    name: 'שלב 4',
    description: 'כפולות של 6, 7, 8, 9',
    multipliers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    maxMultiplier: 10,
    visualRequired: false,
  },
};

// Game modes
export const gameModes = {
  multiply: {
    id: 'multiply',
    name: 'לוח הכפל',
    icon: '✖️',
    description: 'תרגול כפל מהנה',
    levels: multiplyLevels,
    totalLevels: TOTAL_LEVELS,
  },
  addsub: {
    id: 'addsub',
    name: 'חיבור וחיסור',
    icon: '➕➖',
    description: 'תרגול חיבור וחיסור',
    levels: addSubLevels,
    totalLevels: TOTAL_LEVELS,
  },
};

// Calculate stars based on score
export const calculateStars = (score, totalQuestions = QUESTIONS_PER_LEVEL) => {
  const percentage = score / totalQuestions;
  if (percentage >= 1) return 3; // Perfect score
  if (percentage >= 0.75) return 2; // 6/8 or better
  if (percentage >= 0.5) return 1; // 4/8 or better
  return 0; // Less than half
};

// Check if level is passed (at least 1 star)
export const isLevelPassed = (stars) => stars >= STARS_TO_UNLOCK_NEXT;
