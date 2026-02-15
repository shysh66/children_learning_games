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

// ============ Pattern Items ============

// Simple colored shapes using SVG inline
const ITEMS = [
  { id: 'red-circle', label: 'עיגול אדום', color: '#ef4444', shape: 'circle' },
  { id: 'blue-circle', label: 'עיגול כחול', color: '#3b82f6', shape: 'circle' },
  { id: 'green-circle', label: 'עיגול ירוק', color: '#22c55e', shape: 'circle' },
  { id: 'red-triangle', label: 'משולש אדום', color: '#ef4444', shape: 'triangle' },
  { id: 'blue-triangle', label: 'משולש כחול', color: '#3b82f6', shape: 'triangle' },
  { id: 'yellow-square', label: 'ריבוע צהוב', color: '#eab308', shape: 'square' },
  { id: 'purple-square', label: 'ריבוע סגול', color: '#a855f7', shape: 'square' },
  { id: 'orange-circle', label: 'עיגול כתום', color: '#f97316', shape: 'circle' },
];

const ShapeIcon = ({ item, size = 48 }) => {
  const half = size / 2;
  const r = size * 0.38;

  if (item.shape === 'circle') {
    return (
      <svg width={size} height={size}>
        <circle cx={half} cy={half} r={r} fill={item.color} />
      </svg>
    );
  }
  if (item.shape === 'triangle') {
    const pts = `${half},${half - r} ${half + r},${half + r * 0.7} ${half - r},${half + r * 0.7}`;
    return (
      <svg width={size} height={size}>
        <polygon points={pts} fill={item.color} />
      </svg>
    );
  }
  // square
  return (
    <svg width={size} height={size}>
      <rect x={half - r} y={half - r} width={r * 2} height={r * 2} rx={3} fill={item.color} />
    </svg>
  );
};

// ============ Pattern Generation ============

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickN(arr, n) {
  return shuffle(arr).slice(0, n);
}

// Generate a single pattern round
function generateRound() {
  const patternTypes = ['ABAB', 'AABB', 'ABC'];
  const patternType = patternTypes[Math.floor(Math.random() * patternTypes.length)];

  let sequence, answer;

  if (patternType === 'ABAB') {
    const [a, b] = pickN(ITEMS, 2);
    // Show 4 items + blank = ABAB?
    sequence = [a, b, a, b];
    answer = a;
  } else if (patternType === 'AABB') {
    const [a, b] = pickN(ITEMS, 2);
    // AABB? -> A
    sequence = [a, a, b, b];
    answer = a;
  } else {
    // ABC -> ABC? = A
    const [a, b, c] = pickN(ITEMS, 3);
    sequence = [a, b, c, a, b];
    answer = c;
  }

  // Generate wrong options (items not matching the answer)
  const wrongPool = ITEMS.filter((it) => it.id !== answer.id);
  const wrongOptions = pickN(wrongPool, 2);
  const options = shuffle([answer, ...wrongOptions]);

  return { sequence, answer, options, patternType };
}

function generateRounds(count) {
  const rounds = [];
  for (let i = 0; i < count; i++) {
    let round;
    do {
      round = generateRound();
    } while (i > 0 && round.answer.id === rounds[i - 1].answer.id);
    rounds.push(round);
  }
  return rounds;
}

const ROUNDS_PER_GAME = 8;
const XP_REWARD = 25;

// ============ Main Component ============

const PatternSequenceGame = ({ themeId, onBack, triggerConfetti }) => {
  const theme = getTheme(themeId);

  const [rounds, setRounds] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);
  const [eliminated, setEliminated] = useState([]);

  const startGame = useCallback(() => {
    setRounds(generateRounds(ROUNDS_PER_GAME));
    setRoundIndex(0);
    setScore(0);
    setGameComplete(false);
    setShowCorrect(false);
    setEliminated([]);
  }, []);

  useEffect(() => {
    startGame();
  }, [startGame]);

  // Speak instruction on each round
  useEffect(() => {
    if (rounds.length > 0 && roundIndex < rounds.length && !showCorrect) {
      const timer = setTimeout(() => speak('מה בא אחר כך?'), 400);
      return () => clearTimeout(timer);
    }
  }, [roundIndex, rounds.length, showCorrect]);

  const round = rounds[roundIndex];

  const handleAnswer = (option) => {
    if (showCorrect || eliminated.includes(option.id)) return;

    if (option.id === round.answer.id) {
      setShowCorrect(true);
      setScore((prev) => prev + 1);
      triggerConfetti?.('normal');
      speak('כל הכבוד!');

      setTimeout(() => {
        if (roundIndex + 1 >= rounds.length) {
          setGameComplete(true);
          addXP(XP_REWARD);
          recordGameStats('patternSequence', rounds.length, score + 1);
          triggerConfetti?.('big');
        } else {
          setRoundIndex((prev) => prev + 1);
          setShowCorrect(false);
          setEliminated([]);
        }
      }, 1300);
    } else {
      playOopsSound();
      setEliminated((prev) => [...prev, option.id]);
    }
  };

  // ============ Loading ============
  if (rounds.length === 0) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="text-4xl text-white animate-pulse">טוען...</div>
      </div>
    );
  }

  // ============ Game Complete ============
  if (gameComplete) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-6 ${theme.font}`} dir="rtl">
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">🌟</div>
          <h1 className="text-5xl font-black text-white mb-4">כל הכבוד!</h1>
          <p className="text-2xl text-white/90 mb-2">השלמת {score} רצפים מתוך {rounds.length}!</p>
          <div className="text-3xl text-yellow-300 font-bold mb-8">+{XP_REWARD} XP</div>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={startGame} className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-2xl text-white text-xl font-bold transition-all">
              שחק שוב 🔄
            </button>
            <button onClick={onBack} className="px-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-xl font-bold transition-all">
              חזרה ←
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ Game Play ============
  if (!round) return null;

  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col items-center p-4 sm:p-8 ${theme.font}`} dir="rtl">
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-4 mt-2">
        <button onClick={onBack} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white font-bold transition-all">
          ← חזרה
        </button>
        <div className="text-white/80 font-bold text-lg">{roundIndex + 1} / {rounds.length}</div>
        <div className="text-white font-bold text-lg">⭐ {score}</div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-2xl h-3 bg-white/20 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${(roundIndex / rounds.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="text-3xl font-bold text-white mb-6">מה בא אחר כך? 🤔</div>

      {/* Sequence display */}
      <div className={`${theme.cardBg} rounded-3xl p-6 sm:p-8 mb-8 flex items-center justify-center gap-3 sm:gap-4 flex-wrap`}>
        {round.sequence.map((item, idx) => (
          <div key={idx} className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-2xl">
            <ShapeIcon item={item} size={44} />
          </div>
        ))}
        {/* The question mark slot */}
        <div className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-4 border-dashed border-yellow-400 ${showCorrect ? 'bg-green-400/30 border-green-400' : 'bg-white/10'}`}>
          {showCorrect ? (
            <ShapeIcon item={round.answer} size={44} />
          ) : (
            <span className="text-3xl text-yellow-400 font-black">?</span>
          )}
        </div>
      </div>

      {/* Answer options */}
      <div className="flex gap-4 sm:gap-6">
        {round.options.map((option) => {
          const isEliminated = eliminated.includes(option.id);
          const isCorrectShown = showCorrect && option.id === round.answer.id;

          let cls = `${theme.cardBg} hover:scale-110`;
          if (isCorrectShown) cls = 'bg-green-500 scale-110 ring-4 ring-green-300';
          else if (isEliminated) cls = 'bg-gray-500 opacity-40 grayscale';

          return (
            <button
              key={option.id}
              onClick={() => handleAnswer(option)}
              disabled={isEliminated || showCorrect}
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center transition-all duration-300 transform ${cls} ${isEliminated || showCorrect ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <ShapeIcon item={option} size={52} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PatternSequenceGame;
