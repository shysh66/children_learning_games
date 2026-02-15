// Game logic for generating questions based on level configurations
// Handles Junior Math, Addition/Subtraction, Multiplication, and Division games

import { addSubLevels, multiplyLevels, divideLevels, juniorLevels, compareLevels, sequenceLevels } from '../data/levelConfigs';

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

// Generate smart distractors based on common math mistakes
const generateSmartDistractors = (num1, num2, operation) => {
  const distractors = new Set();
  let correct;

  // Calculate correct answer
  switch (operation) {
    case 'add':
    case 'junior_add':
      correct = num1 + num2;
      break;
    case 'subtract':
    case 'junior_subtract':
      correct = num1 - num2;
      break;
    case 'multiply':
      correct = num1 * num2;
      break;
    case 'divide':
      correct = Math.floor(num1 / num2);
      break;
    default:
      correct = num1 + num2;
  }

  const addDistractor = (value) => {
    if (value !== correct && value >= 0 && Number.isFinite(value)) {
      distractors.add(value);
    }
  };

  // Strategy 1: Operation Confusion
  if (operation === 'multiply') {
    addDistractor(num1 + num2); // confused with addition
    addDistractor(Math.abs(num1 - num2)); // confused with subtraction
  } else if (operation === 'add' || operation === 'junior_add') {
    addDistractor(num1 * num2); // confused with multiplication
  } else if (operation === 'subtract' || operation === 'junior_subtract') {
    addDistractor(num1 + num2); // confused with addition
  } else if (operation === 'divide') {
    addDistractor(num1 - num2); // confused with subtraction
    addDistractor(num1 * num2); // confused with multiplication
  }

  // Strategy 2: Near Misses (Neighbors)
  if (operation === 'multiply') {
    addDistractor(num1 * (num2 - 1)); // neighbor below
    addDistractor(num1 * (num2 + 1)); // neighbor above
    addDistractor((num1 - 1) * num2); // neighbor below (other factor)
    addDistractor((num1 + 1) * num2); // neighbor above (other factor)
  } else if (operation === 'divide') {
    addDistractor(correct - 1);
    addDistractor(correct + 1);
    addDistractor(correct + 2);
  } else {
    // Addition/Subtraction near misses
    addDistractor(correct + 1);
    addDistractor(correct - 1);
    addDistractor(correct + 10);
    addDistractor(correct - 10);
  }

  // Strategy 3: Visual/Digit Confusion
  if (correct >= 10 && correct <= 99) {
    const reversed = parseInt(String(correct).split('').reverse().join(''), 10);
    addDistractor(reversed);
  }

  // Strategy 4: Fallback - close range random numbers
  const range = Math.max(5, Math.ceil(correct * 0.2));
  let attempts = 0;
  while (distractors.size < 5 && attempts < 50) {
    const offset = randomInt(-range, range);
    const fallback = correct + offset;
    addDistractor(fallback);
    attempts++;
  }

  // Final fallback: sequential numbers if still not enough
  let seq = 1;
  while (distractors.size < 5) {
    addDistractor(correct + seq);
    addDistractor(correct - seq);
    seq++;
  }

  // Return exactly 5 distractors
  return Array.from(distractors).slice(0, 5);
};

// Generate Junior Math question based on level
export const generateJuniorQuestion = (levelId) => {
  const config = juniorLevels[levelId];
  if (!config) {
    console.error(`Invalid junior level: ${levelId}`);
    return generateJuniorQuestion(1); // Fallback to level 1
  }

  const { type, maxNumber, maxResult, minNumber = 1 } = config;
  let questionType, num1, num2, correct;

  switch (type) {
    case 'counting':
      // Just counting - "How many items?"
      questionType = 'counting';
      num1 = randomInt(minNumber, maxNumber);
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
        // Ensure result is at least minNumber
        const minNum1 = Math.max(1, Math.ceil(minNumber / 2));
        num1 = randomInt(minNum1, Math.floor(maxResult / 2));
        const minNum2 = Math.max(1, minNumber - num1);
        num2 = randomInt(minNum2, maxResult - num1);
        correct = num1 + num2;
      } else {
        questionType = 'junior_subtract';
        // For subtraction, num1 should be at least minNumber + 1
        const minStart = Math.max(minNumber + 1, 2);
        num1 = randomInt(minStart, maxResult);
        num2 = randomInt(1, Math.min(num1 - minNumber, Math.floor(num1 / 2)));
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

  const { maxResult, allowSubtraction, allowCrossing, minResult = 1 } = config;

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
        // Ensure result is at least minResult
        const minNum1 = Math.max(1, Math.floor(minResult / 2));
        num1 = randomInt(minNum1, maxResult - 1);
        const minNum2 = Math.max(1, minResult - num1);
        num2 = randomInt(minNum2, maxResult - num1);
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
        // Ensure result is at least minResult
        const minNum1 = Math.max(minResult + 1, Math.min(6, maxResult));
        num1 = randomInt(minNum1, maxResult);
        const maxNum2 = num1 - minResult;
        num2 = randomInt(1, Math.max(1, maxNum2));
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
    if (correct >= minResult && correct <= maxResult) {
      break;
    }
  } while (attempts < maxAttempts);

  // Generate smart distractors (5 wrong answers for 6 total options)
  const type = isAddition ? 'add' : 'subtract';
  const wrongAnswers = generateSmartDistractors(num1, num2, type);
  const allAnswers = shuffleArray([correct, ...wrongAnswers]);

  return {
    type,
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

  // Generate smart distractors (5 wrong answers for 6 total options)
  const wrongAnswers = generateSmartDistractors(num1, num2, 'multiply');
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

// Generate Division question based on level (integer results only)
export const generateDivisionQuestion = (levelId) => {
  const config = divideLevels[levelId];
  if (!config) {
    console.error(`Invalid division level: ${levelId}`);
    return generateDivisionQuestion(1); // Fallback to level 1
  }

  const { divisors, maxDividend } = config;

  // Select random divisor from allowed list
  const divisor = divisors[randomInt(0, divisors.length - 1)];

  // Generate a quotient (result) that makes sense
  const maxQuotient = Math.floor(maxDividend / divisor);
  const quotient = randomInt(1, Math.max(1, maxQuotient));

  // Calculate dividend (the number being divided)
  const dividend = quotient * divisor;

  const correct = quotient;

  // Generate smart distractors (5 wrong answers for 6 total options)
  const wrongAnswers = generateSmartDistractors(dividend, divisor, 'divide');
  const allAnswers = shuffleArray([correct, ...wrongAnswers]);

  // Show visual if dividend is small enough (20 or less)
  const showVisual = config.visualRequired && dividend <= 20;

  return {
    type: 'divide',
    num1: dividend,    // The dividend (total)
    num2: divisor,     // The divisor
    correct,
    answers: allAnswers,
    showVisual,
    visual: {
      total: dividend, // Show this many icons
      groups: divisor, // Divide into this many groups
    },
  };
};

// Generate a simple equation for comparison levels
const generateSimpleEquation = (maxNumber) => {
  const isAdd = Math.random() > 0.5;
  if (isAdd) {
    const a = randomInt(1, maxNumber - 1);
    const b = randomInt(1, maxNumber - a);
    return { text: `${a} + ${b}`, value: a + b };
  } else {
    const a = randomInt(2, maxNumber);
    const b = randomInt(1, a - 1);
    return { text: `${a} - ${b}`, value: a - b };
  }
};

// Generate Comparison question (Hungry Alligator)
export const generateCompareQuestion = (levelId) => {
  const config = compareLevels[levelId];
  if (!config) return generateCompareQuestion(1);

  const { type, maxNumber, minNumber = 1 } = config;
  let leftDisplay, rightDisplay, leftValue, rightValue;

  if (type === 'numbers') {
    leftValue = randomInt(minNumber, maxNumber);
    rightValue = randomInt(minNumber, maxNumber);
    // Ensure some variety - avoid equal too often but allow it sometimes
    if (Math.random() > 0.15 && leftValue === rightValue) {
      rightValue = randomInt(minNumber, maxNumber);
    }
    leftDisplay = String(leftValue);
    rightDisplay = String(rightValue);
  } else if (type === 'equation_vs_number') {
    const eq = generateSimpleEquation(maxNumber);
    leftDisplay = eq.text;
    leftValue = eq.value;
    rightValue = randomInt(1, maxNumber);
    rightDisplay = String(rightValue);
  } else if (type === 'equation_vs_equation') {
    const eq1 = generateSimpleEquation(maxNumber);
    const eq2 = generateSimpleEquation(maxNumber);
    leftDisplay = eq1.text;
    leftValue = eq1.value;
    rightDisplay = eq2.text;
    rightValue = eq2.value;
  }

  let correct;
  if (leftValue > rightValue) correct = '>';
  else if (leftValue < rightValue) correct = '<';
  else correct = '=';

  return {
    type: 'compare',
    leftDisplay,
    rightDisplay,
    leftValue,
    rightValue,
    correct,
    answers: ['<', '=', '>'],
    num1: leftValue,
    num2: rightValue,
  };
};

// Generate Sequence question (Number Train)
export const generateSequenceQuestion = (levelId) => {
  const config = sequenceLevels[levelId];
  if (!config) return generateSequenceQuestion(1);

  const { jumps, direction, missingPosition, maxStart } = config;
  const jump = jumps[randomInt(0, jumps.length - 1)];

  let isAscending;
  if (direction === 'ascending') isAscending = true;
  else if (direction === 'descending') isAscending = false;
  else isAscending = Math.random() > 0.5;

  let start;
  if (isAscending) {
    start = randomInt(1, Math.max(1, maxStart - jump * 3));
  } else {
    start = randomInt(jump * 3 + 1, Math.max(jump * 3 + 1, maxStart));
  }

  // Build the sequence of 4 numbers
  const sequence = [];
  for (let i = 0; i < 4; i++) {
    sequence.push(isAscending ? start + jump * i : start - jump * i);
  }

  // Decide missing position
  let missingIdx;
  if (missingPosition === 'middle') {
    missingIdx = randomInt(1, 2); // Index 1 or 2
  } else {
    missingIdx = 3; // Last position
  }

  const correct = sequence[missingIdx];

  // Generate wrong answers close to correct (5 wrong answers for 6 total options)
  const wrongAnswers = generateWrongAnswers(correct, 5, 0, jump * 2 || 5);
  const allAnswers = shuffleArray([correct, ...wrongAnswers]);

  return {
    type: 'sequence',
    sequence,
    missingIndex: missingIdx,
    correct,
    answers: allAnswers,
    jump,
    isAscending,
    num1: sequence[0],
    num2: sequence[1],
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
  if (gameMode === 'divide') {
    return generateDivisionQuestion(levelId);
  }
  if (gameMode === 'compare') {
    return generateCompareQuestion(levelId);
  }
  if (gameMode === 'sequence') {
    return generateSequenceQuestion(levelId);
  }
  return generateAddSubQuestion(levelId);
};

// Create a unique key for a question to detect duplicates
const getQuestionKey = (question) => {
  return `${question.type}-${question.num1}-${question.num2}`;
};

// Generate all questions for a level at once, ensuring no duplicates
export const generateLevelQuestions = (gameMode, levelId, count = 8) => {
  const questions = [];
  const usedKeys = new Set();
  const maxAttempts = count * 10; // Prevent infinite loop
  let attempts = 0;

  while (questions.length < count && attempts < maxAttempts) {
    const question = generateQuestion(gameMode, levelId);
    const key = getQuestionKey(question);

    // Only add if this question hasn't been used yet
    if (!usedKeys.has(key)) {
      usedKeys.add(key);
      questions.push(question);
    }

    attempts++;
  }

  // If we couldn't generate enough unique questions, fill with regenerated ones
  // (this can happen with very limited question ranges like counting to 5)
  while (questions.length < count) {
    const question = generateQuestion(gameMode, levelId);
    questions.push(question);
  }

  return questions;
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
    case 'divide':
      return '÷';
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
