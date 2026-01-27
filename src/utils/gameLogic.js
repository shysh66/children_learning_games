// Game logic for generating questions based on level configurations
// Handles Junior Math, Addition/Subtraction, and Multiplication games

import { addSubLevels, multiplyLevels, juniorLevels } from '../data/levelConfigs';

// Generate random integer between min and max (inclusive)
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Shuffle array (Fisher-Yates)
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Generate wrong answers that are close to the correct answer
const generateWrongAnswers = (correct, count = 3, minValue = 0, maxOffset = 5) => {
  const answers = new Set();
  let attempts = 0;
  const maxAttempts = 100;

  while (answers.size < count && attempts < maxAttempts) {
    // Generate wrong answer within reasonable range
    const offset = randomInt(-maxOffset, maxOffset);
    const wrong = correct + offset;

    if (wrong >= minValue && wrong !== correct && !answers.has(wrong)) {
      answers.add(wrong);
    }
    attempts++;
  }

  // Fallback: add sequential wrong answers if not enough
  let fallback = minValue;
  while (answers.size < count) {
    if (fallback !== correct && !answers.has(fallback)) {
      answers.add(fallback);
    }
    fallback++;
  }

  return Array.from(answers);
};

// Generate Junior Math question based on level
export const generateJuniorQuestion = (levelId) => {
  const config = juniorLevels[levelId];
  if (!config) {
    console.error(`Invalid junior level: ${levelId}`);
    return generateJuniorQuestion(1); // Fallback to level 1
  }

  const { type, maxNumber, maxResult } = config;
  let questionType, num1, num2, correct;

  switch (type) {
    case 'counting':
      // Just counting - "How many items?"
      questionType = 'counting';
      num1 = randomInt(1, maxNumber);
      num2 = 0;
      correct = num1;
      break;

    case 'addition':
      // Addition only
      questionType = 'junior_add';
      num1 = randomInt(1, maxResult - 1);
      num2 = randomInt(1, maxResult - num1);
      correct = num1 + num2;
      break;

    case 'subtraction':
      // Subtraction only
      questionType = 'junior_subtract';
      num1 = randomInt(2, maxNumber);
      num2 = randomInt(1, num1 - 1);
      correct = num1 - num2;
      break;

    case 'mixed':
    default:
      // Mixed addition and subtraction
      const isAddition = Math.random() > 0.5;
      if (isAddition) {
        questionType = 'junior_add';
        num1 = randomInt(1, Math.floor(maxResult / 2));
        num2 = randomInt(1, maxResult - num1);
        correct = num1 + num2;
      } else {
        questionType = 'junior_subtract';
        num1 = randomInt(2, maxResult);
        num2 = randomInt(1, Math.min(num1 - 1, Math.floor(maxResult / 2)));
        correct = num1 - num2;
      }
      break;
  }

  // Generate wrong answers - smaller range for young children
  const maxOffset = Math.min(3, Math.max(2, Math.floor(correct / 2)));
  const wrongAnswers = generateWrongAnswers(correct, 3, 0, maxOffset);
  const allAnswers = shuffleArray([correct, ...wrongAnswers]);

  return {
    type: questionType,
    num1,
    num2,
    correct,
    answers: allAnswers,
    showVisual: true, // Always show visual for junior
    useGrid: config.useGrid || false,
    visual: {
      // For counting: just num1 items
      // For addition: num1 items + num2 items (two groups)
      // For subtraction: num1 items with num2 crossed out
      group1: num1,
      group2: num2,
      total: questionType === 'junior_add' ? correct : num1,
      subtracted: questionType === 'junior_subtract' ? num2 : 0,
    },
  };
};

// Generate Addition/Subtraction question based on level
export const generateAddSubQuestion = (levelId) => {
  const config = addSubLevels[levelId];
  if (!config) {
    console.error(`Invalid level: ${levelId}`);
    return generateAddSubQuestion(1); // Fallback to level 1
  }

  const { maxResult, allowSubtraction, allowCrossing } = config;

  // Decide operation type
  let isAddition = true;
  if (allowSubtraction) {
    isAddition = Math.random() > 0.4; // 60% addition, 40% subtraction
  }

  let num1, num2, correct;
  let attempts = 0;
  const maxAttempts = 50;

  do {
    if (isAddition) {
      // Addition
      if (allowCrossing) {
        // Allow crossing the ten (e.g., 8+5=13)
        num1 = randomInt(1, maxResult - 1);
        num2 = randomInt(1, maxResult - num1);
      } else {
        // No crossing - keep within decade
        if (maxResult <= 10) {
          num1 = randomInt(1, maxResult - 1);
          num2 = randomInt(1, maxResult - num1);
        } else {
          // For numbers up to 20 without crossing
          const decade = randomInt(0, 1) * 10;
          const maxInDecade = Math.min(9, maxResult - decade);
          num1 = decade + randomInt(1, maxInDecade);
          num2 = randomInt(1, decade + 10 - num1);
          // Ensure result doesn't cross ten boundary
          if (num1 % 10 + num2 > 10) {
            num2 = 10 - (num1 % 10);
          }
        }
      }
      correct = num1 + num2;
    } else {
      // Subtraction - ensure num1 > num2 (positive result)
      if (allowCrossing) {
        // Allow borrowing (e.g., 12-4=8)
        num1 = randomInt(Math.min(6, maxResult), maxResult);
        num2 = randomInt(1, num1 - 1);
      } else {
        // No borrowing - stay within decade
        if (maxResult <= 10) {
          num1 = randomInt(2, maxResult);
          num2 = randomInt(1, num1 - 1);
        } else {
          const decade = randomInt(1, Math.floor(maxResult / 10)) * 10;
          const startInDecade = decade + randomInt(1, 9);
          num1 = Math.min(startInDecade, maxResult);
          const maxSub = num1 - decade;
          num2 = randomInt(1, Math.max(1, maxSub - 1));
        }
      }
      correct = num1 - num2;
    }

    attempts++;

    // Validate result
    if (correct > 0 && correct <= maxResult) {
      break;
    }
  } while (attempts < maxAttempts);

  // Generate wrong answers
  const wrongAnswers = generateWrongAnswers(correct, 3, 0, 10);
  const allAnswers = shuffleArray([correct, ...wrongAnswers]);

  return {
    type: isAddition ? 'add' : 'subtract',
    num1,
    num2,
    correct,
    answers: allAnswers,
    showVisual: config.visualRequired && (num1 + (isAddition ? num2 : 0)) <= 20,
    visual: {
      total: isAddition ? correct : num1,
      subtracted: isAddition ? 0 : num2,
    },
  };
};

// Generate Multiplication question based on level
export const generateMultiplicationQuestion = (levelId) => {
  const config = multiplyLevels[levelId];
  if (!config) {
    console.error(`Invalid level: ${levelId}`);
    return generateMultiplicationQuestion(1); // Fallback to level 1
  }

  const { multipliers, maxMultiplier } = config;

  // Select random multiplier from allowed list
  const baseMultiplier = multipliers[randomInt(0, multipliers.length - 1)];

  // Generate the other factor
  const otherFactor = randomInt(1, maxMultiplier);

  // Randomly decide order for display
  const num1 = Math.random() > 0.5 ? baseMultiplier : otherFactor;
  const num2 = num1 === baseMultiplier ? otherFactor : baseMultiplier;

  const correct = num1 * num2;

  // Generate wrong answers
  const wrongAnswers = generateWrongAnswers(correct, 3, 1, 10);
  const allAnswers = shuffleArray([correct, ...wrongAnswers]);

  // Determine if visual should be shown (limit for performance)
  const showVisual = config.visualRequired && num1 <= 5 && num2 <= 5;

  return {
    type: 'multiply',
    num1,
    num2,
    correct,
    answers: allAnswers,
    showVisual,
    visual: {
      groups: Math.min(num1, 5),
      items: Math.min(num2, 5),
    },
  };
};

// Generate question based on game mode and level
export const generateQuestion = (gameMode, levelId) => {
  if (gameMode === 'junior') {
    return generateJuniorQuestion(levelId);
  }
  if (gameMode === 'multiply') {
    return generateMultiplicationQuestion(levelId);
  }
  return generateAddSubQuestion(levelId);
};

// Get operator symbol for display
export const getOperatorSymbol = (type) => {
  switch (type) {
    case 'add':
    case 'junior_add':
      return '+';
    case 'subtract':
    case 'junior_subtract':
      return '-';
    case 'multiply':
      return '×';
    case 'counting':
      return '?';
    default:
      return '?';
  }
};

// Check if question type is a junior type
export const isJuniorType = (type) => {
  return type === 'counting' || type === 'junior_add' || type === 'junior_subtract';
};
