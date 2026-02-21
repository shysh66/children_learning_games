import React, { useState, useEffect, useCallback } from 'react';
import { getTheme } from '../data/themes';
import { addXP, recordGameStats } from '../utils/storage';
import { playOopsSound } from '../utils/sounds';
import useGameAnalytics from '../hooks/useGameAnalytics';

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

// ============ Direction Data ============

const DIRECTIONS = [
  { id: 'left', label: 'שמאלה', arrow: '⬅️' },
  { id: 'right', label: 'ימינה', arrow: '➡️' },
  { id: 'up', label: 'למעלה', arrow: '⬆️' },
  { id: 'down', label: 'למטה', arrow: '⬇️' },
];

// Each element has a base orientation (facing left by default)
// and the transforms needed for each direction
const ELEMENTS = [
  {
    emoji: '🐟',
    name: 'דג',
    verb: 'שוחה',
    transforms: {
      left: {},
      right: { transform: 'scaleX(-1)' },
      up: { transform: 'rotate(90deg)' },
      down: { transform: 'rotate(-90deg)' },
    },
  },
  {
    emoji: '🚀',
    name: 'טיל',
    verb: 'עף',
    // Rocket base points up, so we adjust accordingly
    transforms: {
      up: {},
      down: { transform: 'rotate(180deg)' },
      right: { transform: 'rotate(90deg)' },
      left: { transform: 'rotate(-90deg)' },
    },
  },
  {
    emoji: '🐦',
    name: 'ציפור',
    verb: 'עפה',
    transforms: {
      left: {},
      right: { transform: 'scaleX(-1)' },
      up: { transform: 'rotate(90deg)' },
      down: { transform: 'rotate(-90deg)' },
    },
  },
  {
    emoji: '🦋',
    name: 'פרפר',
    verb: 'עף',
    transforms: {
      left: {},
      right: { transform: 'scaleX(-1)' },
      up: { transform: 'rotate(90deg)' },
      down: { transform: 'rotate(-90deg)' },
    },
  },
  {
    emoji: '🐝',
    name: 'דבורה',
    verb: 'עפה',
    transforms: {
      left: {},
      right: { transform: 'scaleX(-1)' },
      up: { transform: 'rotate(90deg)' },
      down: { transform: 'rotate(-90deg)' },
    },
  },
  {
    emoji: '✈️',
    name: 'מטוס',
    verb: 'טס',
    transforms: {
      right: {},
      left: { transform: 'scaleX(-1)' },
      up: { transform: 'rotate(-90deg)' },
      down: { transform: 'rotate(90deg)' },
    },
  },
  {
    emoji: '🐊',
    name: 'תנין',
    verb: 'שוחה',
    transforms: {
      left: {},
      right: { transform: 'scaleX(-1)' },
      up: { transform: 'rotate(90deg)' },
      down: { transform: 'rotate(-90deg)' },
    },
  },
  {
    emoji: '🦅',
    name: 'נשר',
    verb: 'עף',
    transforms: {
      left: {},
      right: { transform: 'scaleX(-1)' },
      up: { transform: 'rotate(90deg)' },
      down: { transform: 'rotate(-90deg)' },
    },
  },
];

const ROUNDS_PER_GAME = 8;
const XP_REWARD = 25;
const NUM_OPTIONS = 3;

// ============ Helpers ============

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateRounds() {
  // Shuffle all elements and pick ROUNDS_PER_GAME
  const shuffled = shuffle(ELEMENTS);
  const selected = shuffled.slice(0, ROUNDS_PER_GAME);

  // Ensure no consecutive repeats (swap approach — no closures in loops)
  for (let i = 1; i < selected.length; i++) {
    if (selected[i].emoji === selected[i - 1].emoji) {
      for (let j = i + 1; j < selected.length; j++) {
        if (selected[j].emoji !== selected[i - 1].emoji) {
          [selected[i], selected[j]] = [selected[j], selected[i]];
          break;
        }
      }
    }
  }

  return selected.map((element) => {
    // Pick target direction
    const targetDir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];

    // Pick wrong directions (different from target)
    const wrongDirs = shuffle(DIRECTIONS.filter((d) => d.id !== targetDir.id)).slice(0, NUM_OPTIONS - 1);

    // Build options
    const options = shuffle([
      { dirId: targetDir.id, style: element.transforms[targetDir.id], isCorrect: true },
      ...wrongDirs.map((d) => ({ dirId: d.id, style: element.transforms[d.id], isCorrect: false })),
    ]);

    const correctIndex = options.findIndex((o) => o.isCorrect);

    // Build question text
    const question = `איזה ${element.name} ${element.verb} ${targetDir.label}?`;

    return {
      element,
      targetDir,
      options,
      correctIndex,
      question,
    };
  });
}

// ============ Main Component ============

const DirectionCatcher = ({ themeId, onBack, triggerConfetti }) => {
  const theme = getTheme(themeId);
  const { trackLevelComplete } = useGameAnalytics('Direction Catcher');

  const [rounds, setRounds] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const startGame = useCallback(() => {
    setRounds(generateRounds());
    setRoundIndex(0);
    setScore(0);
    setGameComplete(false);
    setSelected(null);
    setShowResult(false);
  }, []);

  useEffect(() => {
    startGame();
  }, [startGame]);

  // TTS question on each round
  useEffect(() => {
    if (rounds.length > 0 && roundIndex < rounds.length && !showResult) {
      const timer = setTimeout(() => speak(rounds[roundIndex].question), 500);
      return () => clearTimeout(timer);
    }
  }, [roundIndex, rounds, showResult]);

  const round = rounds[roundIndex];

  const handleSelect = (idx) => {
    if (showResult) return;

    setSelected(idx);
    setShowResult(true);

    if (idx === round.correctIndex) {
      // Correct!
      setScore((prev) => prev + 1);
      triggerConfetti?.('normal');
      setTimeout(() => speak('מצוין! זה הכיוון הנכון!'), 300);

      setTimeout(() => {
        if (roundIndex + 1 >= rounds.length) {
          const finalScore = score + 1;
          setGameComplete(true);
          addXP(XP_REWARD);
          recordGameStats('directionCatcher', rounds.length, finalScore);
          trackLevelComplete(1, finalScore, finalScore >= rounds.length / 2);
          triggerConfetti?.('big');
        } else {
          setRoundIndex((prev) => prev + 1);
          setSelected(null);
          setShowResult(false);
        }
      }, 2000);
    } else {
      // Wrong
      playOopsSound();
      setTimeout(() => speak('נסה שוב!'), 200);
      setTimeout(() => {
        setSelected(null);
        setShowResult(false);
      }, 1200);
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
          <p className="text-2xl text-white/90 mb-2">תפסת {score} כיוונים מתוך {rounds.length}!</p>
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

  const directionArrow = round.targetDir.arrow;

  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col items-center p-4 sm:p-8 ${theme.font}`} dir="rtl">
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-4 mt-2">
        <button onClick={onBack} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white font-bold transition-all">← חזרה</button>
        <div className="text-white/80 font-bold text-lg">{roundIndex + 1} / {rounds.length}</div>
        <div className="text-white font-bold text-lg">⭐ {score}</div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-2xl h-3 bg-white/20 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${(roundIndex / rounds.length) * 100}%` }} />
      </div>

      {/* Direction hint */}
      <div className="text-6xl mb-4 animate-pulse">{directionArrow}</div>

      {/* Question */}
      <button onClick={() => speak(round.question)} className="mb-8 flex items-center gap-2">
        <span className="text-2xl sm:text-3xl font-bold text-white text-center leading-snug">{round.question}</span>
        <span className="text-2xl">🔊</span>
      </button>

      {/* Answer options */}
      <div className="flex gap-4 sm:gap-6 mb-6">
        {round.options.map((option, idx) => {
          const isSelected = selected === idx;
          const isCorrect = idx === round.correctIndex;
          const isCorrectShown = showResult && isCorrect && isSelected;
          const isWrongShown = showResult && !isCorrect && isSelected;

          let cls = `${theme.cardBg} hover:scale-105`;
          if (isCorrectShown) cls = 'bg-green-500 scale-110 ring-8 ring-green-300';
          else if (isWrongShown) cls = 'bg-red-500/80 direction-shake';
          else if (showResult && isCorrect && !isSelected) cls = `${theme.cardBg} ring-4 ring-yellow-400`;

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={showResult}
              className={`w-28 h-28 sm:w-36 sm:h-36 rounded-3xl flex items-center justify-center transition-all duration-300 transform border-4 border-white/20 ${cls} ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className="text-6xl sm:text-7xl inline-block"
                style={option.style}
              >
                {round.element.emoji}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback text */}
      {showResult && selected === round.correctIndex && (
        <div className={`${theme.cardBg} rounded-2xl px-6 py-4 text-center`}>
          <p className="text-xl font-bold text-white">מעולה! זה הכיוון הנכון! {directionArrow}</p>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes direction-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .direction-shake {
          animation: direction-shake 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DirectionCatcher;
