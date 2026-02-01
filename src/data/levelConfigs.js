// Level configurations for each game mode
// Defines difficulty progression and question parameters

export const QUESTIONS_PER_LEVEL = 10;
export const STARS_TO_UNLOCK_NEXT = 1; // Minimum stars needed to unlock next level

// Junior Math level configurations (for ages 4-5)
export const juniorLevels = {
  1: {
    id: 1,
    name: 'שלב 1',
    description: 'ספירה עד 5',
    type: 'counting',
    maxNumber: 5,
    visualRequired: true,
  },
  2: {
    id: 2,
    name: 'שלב 2',
    description: 'ספירה עד 10',
    type: 'counting',
    minNumber: 4,
    maxNumber: 10,
    visualRequired: true,
  },
  3: {
    id: 3,
    name: 'שלב 3',
    description: 'חיבור עד 5',
    type: 'addition',
    maxResult: 5,
    visualRequired: true,
  },
  4: {
    id: 4,
    name: 'שלב 4',
    description: 'חיסור עד 5',
    type: 'subtraction',
    maxNumber: 5,
    visualRequired: true,
  },
  5: {
    id: 5,
    name: 'שלב 5',
    description: 'חיבור וחיסור עד 10',
    type: 'mixed',
    maxResult: 10,
    visualRequired: true,
  },
  6: {
    id: 6,
    name: 'שלב 6',
    description: 'חיבור וחיסור 3-15',
    type: 'mixed',
    minNumber: 3,
    maxResult: 15,
    visualRequired: true,
    useGrid: true,
  },
  7: {
    id: 7,
    name: 'שלב 7',
    description: 'חיבור וחיסור 5-20',
    type: 'mixed',
    minNumber: 5,
    maxResult: 20,
    visualRequired: true,
    useGrid: true,
  },
  8: {
    id: 8,
    name: 'שלב 8',
    description: 'חיבור וחיסור 7-25',
    type: 'mixed',
    minNumber: 7,
    maxResult: 25,
    visualRequired: true,
    useGrid: true,
  },
};

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
    description: 'חיבור וחיסור עם מעבר עשרת (8+5, 12-4)',
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
  5: {
    id: 5,
    name: 'שלב 5',
    description: 'מספרים 30-80',
    minResult: 30,
    maxResult: 80,
    allowSubtraction: true,
    allowCrossing: true,
    visualRequired: false,
  },
  6: {
    id: 6,
    name: 'שלב 6',
    description: 'מספרים 40-100',
    minResult: 40,
    maxResult: 100,
    allowSubtraction: true,
    allowCrossing: true,
    visualRequired: false,
  },
  7: {
    id: 7,
    name: 'שלב 7',
    description: 'מספרים 50-120',
    minResult: 50,
    maxResult: 120,
    allowSubtraction: true,
    allowCrossing: true,
    visualRequired: false,
  },
  8: {
    id: 8,
    name: 'שלב 8',
    description: 'מספרים 60-150',
    minResult: 60,
    maxResult: 150,
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
  5: {
    id: 5,
    name: 'שלב 5',
    description: 'כפולות קשות (3,4,6,7,8,9)',
    multipliers: [3, 4, 6, 7, 8, 9],
    maxMultiplier: 10,
    visualRequired: false,
  },
};

// Division level configurations (integer results only)
export const divideLevels = {
  1: {
    id: 1,
    name: 'שלב 1',
    description: 'חילוק ב-2 וב-10',
    divisors: [2, 10],
    maxDividend: 20,
    visualRequired: true,
  },
  2: {
    id: 2,
    name: 'שלב 2',
    description: 'חילוק ב-5',
    divisors: [2, 5, 10],
    maxDividend: 50,
    visualRequired: true,
  },
  3: {
    id: 3,
    name: 'שלב 3',
    description: 'חילוק ב-3 וב-4',
    divisors: [2, 3, 4, 5, 10],
    maxDividend: 40,
    visualRequired: false,
  },
  4: {
    id: 4,
    name: 'שלב 4',
    description: 'חילוק קשה (6,7,8,9)',
    divisors: [6, 7, 8, 9],
    maxDividend: 90,
    visualRequired: false,
  },
};

// Game modes
export const gameModes = {
  junior: {
    id: 'junior',
    name: 'חשבון לקטנטנים',
    icon: '🧒',
    description: 'לגילאי 4-5',
    levels: juniorLevels,
    totalLevels: 8,
  },
  multiply: {
    id: 'multiply',
    name: 'לוח הכפל',
    icon: '✖️',
    description: 'תרגול כפל מהנה',
    levels: multiplyLevels,
    totalLevels: 5,
  },
  divide: {
    id: 'divide',
    name: 'חילוק',
    icon: '➗',
    description: 'תרגול חילוק',
    levels: divideLevels,
    totalLevels: 4,
  },
  addsub: {
    id: 'addsub',
    name: 'חיבור וחיסור',
    icon: '➕➖',
    description: 'תרגול חיבור וחיסור',
    levels: addSubLevels,
    totalLevels: 8,
  },
  english: {
    id: 'english',
    name: 'אנגלית',
    icon: '🔤',
    description: 'לימוד מילים באנגלית',
    isPracticeZone: true, // Special flag - goes to practice zone instead of level map
  },
};

// Get total levels for a game mode
export const getTotalLevels = (gameMode) => {
  return gameModes[gameMode]?.totalLevels || 4;
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
