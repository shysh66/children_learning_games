import React, { useState, useEffect, useCallback } from 'react';
import { getTheme } from '../data/themes';
import { addXP, recordGameStats } from '../utils/storage';
import { playOopsSound } from '../utils/sounds';

// ============ TTS Helper ============

const speak = (text) => {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {
    // Silently fail
  }
};

// ============ SVG Shape Rendering ============

// Generate regular polygon points for SVG (centered at cx, cy)
const regularPolygonPoints = (sides, cx, cy, r) => {
  const points = [];
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return points.join(' ');
};

const ShapeSVG = ({ shapeId, size = 120, color = '#818cf8' }) => {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;

  const commonProps = {
    fill: color,
    fillOpacity: 0.25,
    stroke: color,
    strokeWidth: 3,
    strokeLinejoin: 'round',
  };

  switch (shapeId) {
    case 'triangle':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon points={regularPolygonPoints(3, cx, cy, r)} {...commonProps} />
        </svg>
      );
    case 'square':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon points={regularPolygonPoints(4, cx, cy, r)} {...commonProps} />
        </svg>
      );
    case 'pentagon':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon points={regularPolygonPoints(5, cx, cy, r)} {...commonProps} />
        </svg>
      );
    case 'hexagon':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon points={regularPolygonPoints(6, cx, cy, r)} {...commonProps} />
        </svg>
      );
    case 'heptagon':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon points={regularPolygonPoints(7, cx, cy, r)} {...commonProps} />
        </svg>
      );
    case 'octagon':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon points={regularPolygonPoints(8, cx, cy, r)} {...commonProps} />
        </svg>
      );
    case 'nonagon':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon points={regularPolygonPoints(9, cx, cy, r)} {...commonProps} />
        </svg>
      );
    case 'decagon':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon points={regularPolygonPoints(10, cx, cy, r)} {...commonProps} />
        </svg>
      );
    case 'rectangle': {
      const w = r * 1.7;
      const h = r * 1.0;
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={2} {...commonProps} />
        </svg>
      );
    }
    case 'rhombus': {
      // Diamond rotated — clearly different from a square
      const rh = r * 0.9;
      const rw = r * 0.55;
      const pts = `${cx},${cy - rh} ${cx + rw},${cy} ${cx},${cy + rh} ${cx - rw},${cy}`;
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon points={pts} {...commonProps} />
        </svg>
      );
    }
    case 'trapezoid': {
      // Top shorter than bottom
      const topW = r * 0.7;
      const botW = r * 1.5;
      const h = r * 0.9;
      const pts = `${cx - topW},${cy - h / 2} ${cx + topW},${cy - h / 2} ${cx + botW},${cy + h / 2} ${cx - botW},${cy + h / 2}`;
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon points={pts} {...commonProps} />
        </svg>
      );
    }
    case 'parallelogram': {
      // Slanted rectangle
      const pw = r * 1.3;
      const ph = r * 0.85;
      const skew = r * 0.4;
      const pts = `${cx - pw + skew},${cy - ph / 2} ${cx + pw + skew},${cy - ph / 2} ${cx + pw - skew},${cy + ph / 2} ${cx - pw - skew},${cy + ph / 2}`;
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon points={pts} {...commonProps} />
        </svg>
      );
    }
    default:
      return null;
  }
};

// ============ Shape Data ============

const SHAPES = {
  triangle: {
    id: 'triangle',
    name: 'משולש',
    sides: 3,
    vertices: 3,
    explanation: 'למשולש יש תמיד 3 צלעות ו-3 קודקודים.',
  },
  square: {
    id: 'square',
    name: 'ריבוע',
    sides: 4,
    vertices: 4,
    explanation: 'לריבוע יש 4 צלעות שוות ו-4 זוויות ישרות.',
  },
  pentagon: {
    id: 'pentagon',
    name: 'מחומש',
    sides: 5,
    vertices: 5,
    explanation: 'למחומש יש 5 צלעות ו-5 קודקודים.',
  },
  hexagon: {
    id: 'hexagon',
    name: 'משושה',
    sides: 6,
    vertices: 6,
    explanation: 'למשושה יש 6 צלעות ו-6 קודקודים.',
  },
  heptagon: {
    id: 'heptagon',
    name: 'משובע',
    sides: 7,
    vertices: 7,
    explanation: 'למשובע יש 7 צלעות ו-7 קודקודים.',
  },
  octagon: {
    id: 'octagon',
    name: 'מתומן',
    sides: 8,
    vertices: 8,
    explanation: 'למתומן יש 8 צלעות ו-8 קודקודים.',
  },
  nonagon: {
    id: 'nonagon',
    name: 'מתושע',
    sides: 9,
    vertices: 9,
    explanation: 'למתושע יש 9 צלעות ו-9 קודקודים.',
  },
  decagon: {
    id: 'decagon',
    name: 'מעושר',
    sides: 10,
    vertices: 10,
    explanation: 'למעושר יש 10 צלעות ו-10 קודקודים.',
  },
  rectangle: {
    id: 'rectangle',
    name: 'מלבן',
    sides: 4,
    vertices: 4,
    explanation: 'למלבן יש צלעות נגדיות שוות ו-4 זוויות ישרות.',
  },
  rhombus: {
    id: 'rhombus',
    name: 'מעוין',
    sides: 4,
    vertices: 4,
    explanation: "למעוין יש 4 צלעות שוות (כמו ריבוע 'מעוך').",
  },
  trapezoid: {
    id: 'trapezoid',
    name: 'טרפז',
    sides: 4,
    vertices: 4,
    explanation: 'לטרפז יש רק זוג אחד של צלעות מקבילות.',
  },
  parallelogram: {
    id: 'parallelogram',
    name: 'מקבילית',
    sides: 4,
    vertices: 4,
    explanation: 'למקבילית יש שני זוגות של צלעות מקבילות.',
  },
};

// ============ Level Definitions ============

const LEVELS = [
  {
    id: 1,
    name: 'ספירת צלעות',
    description: 'כמה צלעות יש לצורה?',
    icon: '📐',
    questionType: 'sides',
    shapes: ['triangle', 'square', 'pentagon', 'hexagon', 'heptagon'],
    rounds: 5,
  },
  {
    id: 2,
    name: 'ספירת קודקודים',
    description: 'כמה קודקודים (פינות) יש?',
    icon: '📍',
    questionType: 'vertices',
    shapes: ['triangle', 'square', 'pentagon', 'hexagon', 'heptagon'],
    rounds: 5,
  },
  {
    id: 3,
    name: 'שמות הצורות',
    description: 'מה שם הצורה?',
    icon: '🏷️',
    questionType: 'name',
    shapes: ['triangle', 'pentagon', 'hexagon', 'heptagon', 'octagon', 'nonagon', 'decagon'],
    rounds: 5,
  },
  {
    id: 4,
    name: 'משפחת המרובעים',
    description: 'ריבוע, מלבן, מעוין, טרפז ומקבילית',
    icon: '🔷',
    questionType: 'name',
    shapes: ['square', 'rectangle', 'rhombus', 'trapezoid', 'parallelogram'],
    rounds: 5,
  },
];

// ============ Helpers ============

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Generate questions for a level (anti-repetition: each shape used at most once)
function generateQuestions(level) {
  const questions = [];
  const usedShapes = [];

  for (let i = 0; i < level.rounds; i++) {
    // Pick a shape NOT already used this round
    const available = level.shapes.filter((s) => !usedShapes.includes(s));
    const pool = available.length > 0 ? available : level.shapes;
    const shapeId = pool[Math.floor(Math.random() * pool.length)];
    usedShapes.push(shapeId);

    const shape = SHAPES[shapeId];

    let questionText, correctAnswer, wrongAnswers;

    if (level.questionType === 'sides') {
      questionText = 'כמה צלעות יש לצורה?';
      correctAnswer = String(shape.sides);
      const possibleWrong = [3, 4, 5, 6, 7, 8, 9, 10]
        .filter((n) => n !== shape.sides)
        .map(String);
      wrongAnswers = shuffle(possibleWrong).slice(0, 3);
    } else if (level.questionType === 'vertices') {
      questionText = 'כמה קודקודים (פינות) יש לצורה?';
      correctAnswer = String(shape.vertices);
      const possibleWrong = [3, 4, 5, 6, 7, 8, 9, 10]
        .filter((n) => n !== shape.vertices)
        .map(String);
      wrongAnswers = shuffle(possibleWrong).slice(0, 3);
    } else {
      // name
      questionText = 'מה שם הצורה?';
      correctAnswer = shape.name;
      const otherNames = level.shapes
        .filter((s) => s !== shapeId)
        .map((s) => SHAPES[s].name);
      wrongAnswers = shuffle(otherNames).slice(0, 3);
    }

    const options = shuffle([correctAnswer, ...wrongAnswers]);

    questions.push({
      shapeId,
      shape,
      questionText,
      correctAnswer,
      options,
    });
  }

  return questions;
}

// Shape colors by id for visual variety
const SHAPE_COLORS = {
  triangle: '#f97316',
  square: '#818cf8',
  pentagon: '#22c55e',
  hexagon: '#eab308',
  heptagon: '#8b5cf6',
  octagon: '#ec4899',
  nonagon: '#0ea5e9',
  decagon: '#d946ef',
  rectangle: '#06b6d4',
  rhombus: '#a855f7',
  trapezoid: '#f43f5e',
  parallelogram: '#14b8a6',
};

// ============ Explanation Modal ============

const ExplanationModal = ({ shape, onClose }) => {
  // Auto-speak explanation
  useEffect(() => {
    if (shape) {
      const timer = setTimeout(() => speak(shape.explanation), 300);
      return () => clearTimeout(timer);
    }
  }, [shape]);

  if (!shape) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
        {/* Shape icon */}
        <div className="flex justify-center mb-4">
          <ShapeSVG shapeId={shape.id} size={100} color={SHAPE_COLORS[shape.id]} />
        </div>

        {/* Shape name */}
        <h2 className="text-3xl font-black text-gray-800 mb-4" dir="rtl">
          {shape.name}
        </h2>

        {/* Explanation */}
        <p className="text-xl text-gray-600 leading-relaxed mb-6" dir="rtl">
          {shape.explanation}
        </p>

        {/* Listen again */}
        <button
          onClick={() => speak(shape.explanation)}
          className="mb-4 px-4 py-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all text-lg font-bold flex items-center gap-2 mx-auto"
        >
          <span>🔊</span>
          <span>השמע שוב</span>
        </button>

        {/* Got it button */}
        <button
          onClick={onClose}
          className="w-full px-8 py-4 bg-blue-500 hover:bg-blue-600 rounded-2xl text-white text-2xl font-bold transition-all"
        >
          הבנתי! ✓
        </button>
      </div>
    </div>
  );
};

// ============ Main Component ============

const PolygonDetectiveGame = ({ themeId, onBack, triggerConfetti }) => {
  const theme = getTheme(themeId);

  // Game state
  const [currentLevel, setCurrentLevel] = useState(0); // 0 = level select
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [eliminatedOptions, setEliminatedOptions] = useState([]);
  const [showCorrect, setShowCorrect] = useState(false);
  const [explanationShape, setExplanationShape] = useState(null);

  // Start a level
  const startLevel = useCallback((levelIndex) => {
    const level = LEVELS[levelIndex - 1];
    setQuestions(generateQuestions(level));
    setQuestionIndex(0);
    setScore(0);
    setCurrentLevel(levelIndex);
    setGameComplete(false);
    setAttempts(0);
    setEliminatedOptions([]);
    setShowCorrect(false);
    setExplanationShape(null);
  }, []);

  const question = questions[questionIndex];

  const handleAnswer = (answer) => {
    if (showCorrect || eliminatedOptions.includes(answer)) return;

    if (answer === question.correctAnswer) {
      // Correct!
      setShowCorrect(true);
      // XP only on 1st or 2nd try
      if (attempts < 2) {
        setScore((prev) => prev + 1);
      }
      triggerConfetti?.('normal');

      setTimeout(() => {
        if (questionIndex + 1 >= questions.length) {
          // Level complete
          const finalScore = attempts < 2 ? score + 1 : score;
          setGameComplete(true);
          const xpEarned = currentLevel * 15;
          addXP(xpEarned);
          recordGameStats('polygonDetective', questions.length, finalScore);
          triggerConfetti?.('big');
        } else {
          setQuestionIndex((prev) => prev + 1);
          setAttempts(0);
          setEliminatedOptions([]);
          setShowCorrect(false);
        }
      }, 1200);
    } else {
      // Wrong — show explanation
      playOopsSound();
      setAttempts((prev) => prev + 1);
      setEliminatedOptions((prev) => [...prev, answer]);

      // Find the shape that the wrong answer refers to
      // For name questions, find shape by name; for number questions, show the questioned shape
      let explanationTarget = question.shape;
      if (question.shape) {
        // For name-type questions, try to show the explanation for what they incorrectly chose
        if (LEVELS[currentLevel - 1]?.questionType === 'name') {
          const wrongShape = Object.values(SHAPES).find((s) => s.name === answer);
          if (wrongShape) {
            explanationTarget = wrongShape;
          }
        }
      }
      setExplanationShape(explanationTarget);
    }
  };

  const handleCloseExplanation = () => {
    setExplanationShape(null);
  };

  // ============ Level Select Screen ============
  if (currentLevel === 0) {
    return (
      <div
        className={`min-h-screen ${theme.bg} flex flex-col items-center justify-center p-6 ${theme.font}`}
        dir="rtl"
      >
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">🔍</div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 drop-shadow-2xl">
            בלש המצולעים
          </h1>
          <p className="text-xl text-white/80">זהה צורות גיאומטריות!</p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-md">
          {LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => startLevel(level.id)}
              className={`${theme.cardBg} rounded-3xl p-6 text-right transition-all duration-300 hover:scale-105 hover:shadow-xl`}
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">{level.icon}</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">
                    שלב {level.id}: {level.name}
                  </h2>
                  <p className="text-white/70 text-lg">{level.description}</p>
                </div>
                <div className="text-3xl text-white/60">←</div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onBack}
          className="mt-8 px-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-xl font-bold transition-all"
        >
          ← חזרה
        </button>
      </div>
    );
  }

  // ============ Game Complete Screen ============
  if (gameComplete) {
    const xpEarned = currentLevel * 15;
    return (
      <div
        className={`min-h-screen ${theme.bg} flex items-center justify-center p-6 ${theme.font}`}
        dir="rtl"
      >
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">🌟</div>
          <h1 className="text-5xl font-black text-white mb-4">כל הכבוד!</h1>
          <p className="text-2xl text-white/90 mb-2">
            סיימת את שלב {currentLevel}: {LEVELS[currentLevel - 1].name}
          </p>
          <p className="text-xl text-white/70 mb-4">
            ציון: {score}/{questions.length}
          </p>
          <div className="text-3xl text-yellow-300 font-bold mb-8">+{xpEarned} XP</div>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => startLevel(currentLevel)}
              className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-2xl text-white text-xl font-bold transition-all"
            >
              שחק שוב 🔄
            </button>
            {currentLevel < LEVELS.length && (
              <button
                onClick={() => startLevel(currentLevel + 1)}
                className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 rounded-2xl text-white text-xl font-bold transition-all"
              >
                שלב הבא ⭐
              </button>
            )}
            <button
              onClick={() => setCurrentLevel(0)}
              className="px-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-xl font-bold transition-all"
            >
              בחירת שלב 📋
            </button>
            <button
              onClick={onBack}
              className="px-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-xl font-bold transition-all"
            >
              חזרה ←
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ Game Play Screen ============
  if (!question) return null;

  const shapeColor = SHAPE_COLORS[question.shapeId] || '#818cf8';

  return (
    <div
      className={`min-h-screen ${theme.bg} flex flex-col items-center p-4 sm:p-8 ${theme.font}`}
      dir="rtl"
    >
      {/* Explanation Modal */}
      <ExplanationModal shape={explanationShape} onClose={handleCloseExplanation} />

      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-4 mt-2">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white font-bold transition-all"
        >
          ← חזרה
        </button>
        <div className="text-white/80 font-bold text-lg">
          {questionIndex + 1} / {questions.length}
        </div>
        <div className="text-white font-bold text-lg">
          ⭐ {score}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-2xl h-3 bg-white/20 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-500"
          style={{ width: `${(questionIndex / questions.length) * 100}%` }}
        />
      </div>

      {/* Shape display */}
      <div className={`${theme.cardBg} rounded-3xl p-8 sm:p-10 mb-6 flex flex-col items-center`}>
        <ShapeSVG shapeId={question.shapeId} size={160} color={shapeColor} />
        <p className="text-2xl sm:text-3xl font-bold text-white mt-4">
          {question.questionText}
        </p>
      </div>

      {/* Answer options — 2x2 grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-lg mb-6">
        {question.options.map((option, idx) => {
          const isEliminated = eliminatedOptions.includes(option);
          const isCorrectOption = showCorrect && option === question.correctAnswer;

          let btnStyle = `${theme.cardBg} hover:scale-105`;
          if (isCorrectOption) {
            btnStyle = 'bg-green-500 scale-110 ring-8 ring-green-300';
          } else if (isEliminated) {
            btnStyle = 'bg-gray-500 opacity-40 grayscale';
          }

          return (
            <button
              key={`${questionIndex}-${idx}`}
              onClick={() => handleAnswer(option)}
              disabled={isEliminated || showCorrect}
              className={`
                py-5 px-4 rounded-3xl text-center transition-all duration-300 transform
                ${btnStyle}
                ${isEliminated || showCorrect ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-2xl'}
                text-white min-h-[70px]
              `}
            >
              <span className="text-3xl sm:text-4xl font-bold">{option}</span>
            </button>
          );
        })}
      </div>

      {/* Level info */}
      <div className="text-center">
        <span className="text-lg text-white/50">
          שלב {currentLevel}: {LEVELS[currentLevel - 1].name}
        </span>
      </div>
    </div>
  );
};

export default PolygonDetectiveGame;
