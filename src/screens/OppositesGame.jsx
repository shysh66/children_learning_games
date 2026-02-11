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

// ============ Opposites Data ============

const PAIRS = [
  {
    concept: 'יום',
    conceptIcon: '☀️',
    opposite: 'לילה',
    oppositeIcon: '🌙',
    distractors: ['🌧️', '🚗'],
    question: 'מה ההפך מיום?',
    feedback: 'נכון! ההפך מיום הוא לילה!',
  },
  {
    concept: 'גדול',
    conceptIcon: '🐘',
    opposite: 'קטן',
    oppositeIcon: '🐜',
    distractors: ['🐶', '🌸'],
    question: 'מה ההפך מגדול?',
    feedback: 'נכון! ההפך מגדול הוא קטן!',
  },
  {
    concept: 'חם',
    conceptIcon: '🔥',
    opposite: 'קר',
    oppositeIcon: '🧊',
    distractors: ['🌈', '🎵'],
    question: 'מה ההפך מחם?',
    feedback: 'נכון! ההפך מחם הוא קר!',
  },
  {
    concept: 'שמח',
    conceptIcon: '😀',
    opposite: 'עצוב',
    oppositeIcon: '😢',
    distractors: ['😴', '🍎'],
    question: 'מה ההפך משמח?',
    feedback: 'נכון! ההפך משמח הוא עצוב!',
  },
  {
    concept: 'למעלה',
    conceptIcon: '⬆️',
    opposite: 'למטה',
    oppositeIcon: '⬇️',
    distractors: ['➡️', '🔄'],
    question: 'מה ההפך מלמעלה?',
    feedback: 'נכון! ההפך מלמעלה הוא למטה!',
  },
  {
    concept: 'מהר',
    conceptIcon: '🐇',
    opposite: 'לאט',
    oppositeIcon: '🐢',
    distractors: ['🐶', '🌻'],
    question: 'מה ההפך ממהר?',
    feedback: 'נכון! ההפך ממהר הוא לאט!',
  },
  {
    concept: 'פתוח',
    conceptIcon: '📖',
    opposite: 'סגור',
    oppositeIcon: '📕',
    distractors: ['🖊️', '🎒'],
    question: 'מה ההפך מפתוח?',
    feedback: 'נכון! ההפך מפתוח הוא סגור!',
  },
  {
    concept: 'רטוב',
    conceptIcon: '💧',
    opposite: 'יבש',
    oppositeIcon: '🏜️',
    distractors: ['🌊', '🍕'],
    question: 'מה ההפך מרטוב?',
    feedback: 'נכון! ההפך מרטוב הוא יבש!',
  },
];

const ROUNDS_PER_GAME = 8;
const XP_REWARD = 25;

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
  const shuffled = shuffle(PAIRS);
  const selected = shuffled.slice(0, ROUNDS_PER_GAME);
  return selected.map((pair) => ({
    ...pair,
    options: shuffle([pair.oppositeIcon, ...pair.distractors]),
  }));
}

// ============ Main Component ============

const OppositesGame = ({ themeId, onBack, triggerConfetti }) => {
  const theme = getTheme(themeId);

  const [rounds, setRounds] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);
  const [eliminated, setEliminated] = useState([]);

  const startGame = useCallback(() => {
    setRounds(generateRounds());
    setRoundIndex(0);
    setScore(0);
    setGameComplete(false);
    setShowCorrect(false);
    setEliminated([]);
  }, []);

  useEffect(() => {
    startGame();
  }, [startGame]);

  // TTS question on each round
  useEffect(() => {
    if (rounds.length > 0 && roundIndex < rounds.length && !showCorrect) {
      const timer = setTimeout(() => speak(rounds[roundIndex].question), 500);
      return () => clearTimeout(timer);
    }
  }, [roundIndex, rounds, showCorrect]);

  const round = rounds[roundIndex];

  const handleAnswer = (icon) => {
    if (showCorrect || eliminated.includes(icon)) return;

    if (icon === round.oppositeIcon) {
      // Correct!
      setShowCorrect(true);
      setScore((prev) => prev + 1);
      triggerConfetti?.('normal');
      setTimeout(() => speak(round.feedback), 300);

      setTimeout(() => {
        if (roundIndex + 1 >= rounds.length) {
          setGameComplete(true);
          addXP(XP_REWARD);
          recordGameStats('opposites', rounds.length, score + 1);
          triggerConfetti?.('big');
        } else {
          setRoundIndex((prev) => prev + 1);
          setShowCorrect(false);
          setEliminated([]);
        }
      }, 2500);
    } else {
      playOopsSound();
      setEliminated((prev) => [...prev, icon]);
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
          <p className="text-2xl text-white/90 mb-2">מצאת {score} הפכים מתוך {rounds.length}!</p>
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

      {/* Main concept card */}
      <div className={`${theme.cardBg} rounded-3xl px-10 py-8 mb-6 text-center`}>
        <div className="text-8xl mb-3">{round.conceptIcon}</div>
        <div className="text-4xl font-black text-white mb-2">{round.concept}</div>
      </div>

      {/* Question */}
      <button
        onClick={() => speak(round.question)}
        className="mb-6 flex items-center gap-2"
      >
        <span className="text-2xl sm:text-3xl font-bold text-white">{round.question}</span>
        <span className="text-2xl">🔊</span>
      </button>

      {/* Answer options */}
      <div className="flex gap-4 sm:gap-6 mb-6">
        {round.options.map((icon, idx) => {
          const isEliminated = eliminated.includes(icon);
          const isCorrectShown = showCorrect && icon === round.oppositeIcon;

          let cls = `${theme.cardBg} hover:scale-110`;
          if (isCorrectShown) cls = 'bg-green-500 scale-110 ring-8 ring-green-300';
          else if (isEliminated) cls = 'bg-gray-500 opacity-40 grayscale';

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(icon)}
              disabled={isEliminated || showCorrect}
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center transition-all duration-300 transform border-4 border-white/20 ${cls} ${isEliminated || showCorrect ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className="text-5xl sm:text-6xl">{icon}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {showCorrect && (
        <div className={`${theme.cardBg} rounded-2xl px-6 py-4 text-center`}>
          <p className="text-xl font-bold text-white">{round.feedback}</p>
        </div>
      )}
    </div>
  );
};

export default OppositesGame;
