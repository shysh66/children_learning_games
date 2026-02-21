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

// ============ Game Data ============

const TARGETS = [
  // Animals
  { emoji: '🦖', name: 'דינוזאור', similar: ['🦕'] },
  { emoji: '🐘', name: 'פיל', similar: ['🦣'] },
  { emoji: '🦋', name: 'פרפר', similar: ['🪶'] },
  { emoji: '🐙', name: 'תמנון', similar: ['🦑'] },
  { emoji: '🦜', name: 'תוכי', similar: ['🐦'] },
  { emoji: '🐬', name: 'דולפין', similar: ['🐋'] },
  { emoji: '🦊', name: 'שועל', similar: ['🐺'] },
  { emoji: '🐸', name: 'צפרדע', similar: ['🐢'] },
  // Fantasy
  { emoji: '🧚', name: 'פיה', similar: ['🧝'] },
  { emoji: '🦄', name: 'חד קרן', similar: ['🐴'] },
  { emoji: '🐉', name: 'דרקון', similar: ['🦎'] },
  { emoji: '👸', name: 'נסיכה', similar: ['👩'] },
  // Vehicles
  { emoji: '🚀', name: 'טיל', similar: ['🛸'] },
  { emoji: '✈️', name: 'מטוס', similar: ['🛩️'] },
  { emoji: '🚂', name: 'רכבת', similar: ['🚃'] },
  { emoji: '🚁', name: 'מסוק', similar: ['🪁'] },
  { emoji: '⛵', name: 'סירה', similar: ['🚤'] },
];

const ROUNDS_PER_GAME = 8;
const XP_REWARD = 25;
const NUM_OPTIONS = 4;

// ============ Distractor Types ============

const DISTRACTOR_TRANSFORMS = [
  { label: 'flipped', style: { transform: 'scaleX(-1)' } },
  { label: 'rotated-cw', style: { transform: 'rotate(15deg)' } },
  { label: 'rotated-ccw', style: { transform: 'rotate(-15deg)' } },
  { label: 'rotated-more', style: { transform: 'rotate(25deg)' } },
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

function generateRounds() {
  const shuffled = shuffle(TARGETS);
  const selected = shuffled.slice(0, ROUNDS_PER_GAME);

  // Ensure no consecutive repeats
  for (let i = 1; i < selected.length; i++) {
    if (selected[i].emoji === selected[i - 1].emoji) {
      // Swap with a later element
      for (let j = i + 1; j < selected.length; j++) {
        if (selected[j].emoji !== selected[i - 1].emoji) {
          [selected[i], selected[j]] = [selected[j], selected[i]];
          break;
        }
      }
    }
  }

  return selected.map((target) => {
    // Build distractors: mix of transforms and similar emojis
    const distractors = [];
    const availableTransforms = shuffle(DISTRACTOR_TRANSFORMS);

    // Add 1-2 similar emoji distractors if available
    const similarEmojis = target.similar || [];
    const usedSimilar = similarEmojis.slice(0, 1);
    usedSimilar.forEach((sim) => {
      distractors.push({ emoji: sim, style: {}, type: 'similar' });
    });

    // Fill remaining with CSS-transformed versions
    let tIdx = 0;
    while (distractors.length < NUM_OPTIONS - 1) {
      const t = availableTransforms[tIdx % availableTransforms.length];
      distractors.push({ emoji: target.emoji, style: t.style, type: t.label });
      tIdx++;
    }

    // The correct option
    const correct = { emoji: target.emoji, style: {}, type: 'correct' };

    // Shuffle all options
    const options = shuffle([correct, ...distractors]);
    const correctIndex = options.findIndex((o) => o.type === 'correct');

    return {
      target,
      options,
      correctIndex,
    };
  });
}

// ============ Main Component ============

const ShadowDetective = ({ themeId, onBack, triggerConfetti }) => {
  const theme = getTheme(themeId);
  const { trackLevelComplete } = useGameAnalytics('Shadow Detective');

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

  // TTS instruction on each round
  useEffect(() => {
    if (rounds.length > 0 && roundIndex < rounds.length && !showResult) {
      const timer = setTimeout(() => speak('מצא את הצללית הנכונה!'), 500);
      return () => clearTimeout(timer);
    }
  }, [roundIndex, rounds.length, showResult]);

  const round = rounds[roundIndex];

  const handleSelect = (idx) => {
    if (showResult) return;

    setSelected(idx);
    setShowResult(true);

    if (idx === round.correctIndex) {
      // Correct!
      setScore((prev) => prev + 1);
      triggerConfetti?.('normal');
      setTimeout(() => speak('כל הכבוד! מצאת את הצללית!'), 300);

      setTimeout(() => {
        if (roundIndex + 1 >= rounds.length) {
          const finalScore = score + 1;
          setGameComplete(true);
          addXP(XP_REWARD);
          recordGameStats('shadowDetective', rounds.length, finalScore);
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
          <p className="text-2xl text-white/90 mb-2">מצאת {score} צלליות מתוך {rounds.length}!</p>
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
        <button onClick={onBack} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white font-bold transition-all">← חזרה</button>
        <div className="text-white/80 font-bold text-lg">{roundIndex + 1} / {rounds.length}</div>
        <div className="text-white font-bold text-lg">⭐ {score}</div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-2xl h-3 bg-white/20 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${(roundIndex / rounds.length) * 100}%` }} />
      </div>

      {/* Question */}
      <button onClick={() => speak('מצא את הצללית הנכונה!')} className="mb-4 flex items-center gap-2">
        <span className="text-2xl sm:text-3xl font-bold text-white">מצא את הצללית הנכונה! 🕵️</span>
        <span className="text-2xl">🔊</span>
      </button>

      {/* Target (colorful element) */}
      <div className={`${theme.cardBg} rounded-3xl px-10 py-6 mb-8 text-center`}>
        <div className="text-8xl sm:text-9xl mb-2">{round.target.emoji}</div>
        <div className="text-xl font-bold text-white/80">{round.target.name}</div>
      </div>

      {/* Shadow options */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6">
        {round.options.map((option, idx) => {
          const isSelected = selected === idx;
          const isCorrect = idx === round.correctIndex;
          const isCorrectShown = showResult && isCorrect && isSelected;
          const isWrongShown = showResult && !isCorrect && isSelected;

          let cls = `${theme.cardBg} hover:scale-105`;
          if (isCorrectShown) cls = 'bg-green-500 scale-110 ring-8 ring-green-300';
          else if (isWrongShown) cls = 'bg-red-500/80 shadow-detective-shake';
          else if (showResult && isCorrect && !isSelected) cls = `${theme.cardBg} ring-4 ring-yellow-400`;

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={showResult}
              className={`w-28 h-28 sm:w-36 sm:h-36 rounded-3xl flex items-center justify-center transition-all duration-300 transform ${cls} ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className="text-6xl sm:text-7xl"
                style={{
                  filter: 'brightness(0) drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                  ...option.style,
                }}
              >
                {option.emoji}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback text */}
      {showResult && selected === round.correctIndex && (
        <div className={`${theme.cardBg} rounded-2xl px-6 py-4 text-center`}>
          <p className="text-xl font-bold text-white">מצוין! הצללית תואמת בדיוק! 🎉</p>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes shadow-detective-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .shadow-detective-shake {
          animation: shadow-detective-shake 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ShadowDetective;
