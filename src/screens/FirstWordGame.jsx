import React, { useState, useEffect, useCallback } from 'react';
import { getTheme } from '../data/themes';
import { addXP, recordGameStats } from '../utils/storage';
import { playOopsSound } from '../utils/sounds';
import useGameAnalytics from '../hooks/useGameAnalytics';

// ============ Vocabulary Data ============

const WORDS = [
  { word: "בָּנָנָה", icon: "🍌" },
  { word: "תַּפּוּחַ", icon: "🍎" },
  { word: "בַּיִת", icon: "🏠" },
  { word: "כַּדּוּר", icon: "⚽" },
  { word: "פֶּרַח", icon: "🌸" },
  { word: "דָּג", icon: "🐟" },
  { word: "כֶּלֶב", icon: "🐶" },
  { word: "חָתוּל", icon: "🐱" },
  { word: "גְּלִידָה", icon: "🍦" },
  { word: "שֶׁמֶשׁ", icon: "☀️" },
  { word: "אוֹטוֹ", icon: "🚗" },
  { word: "סֵפֶר", icon: "📖" },
];

const ROUNDS_PER_GAME = 10;
const XP_PER_GAME = 30;

// ============ TTS Helper ============

const speak = (text) => {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {
    // Silently fail
  }
};

// ============ Shuffle helper ============

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============ Generate rounds ============

function generateRounds() {
  const shuffled = shuffle(WORDS);
  const selected = shuffled.slice(0, ROUNDS_PER_GAME);

  return selected.map((correct) => {
    // Pick 3 wrong options from other words
    const others = WORDS.filter((w) => w.icon !== correct.icon);
    const wrongOptions = shuffle(others).slice(0, 3);
    const options = shuffle([correct, ...wrongOptions]);
    return { correct, options };
  });
}

// ============ Answer Button ============

const AnswerOption = ({ icon, onClick, eliminated, showCorrect }) => {
  const getStyles = () => {
    if (showCorrect) {
      return 'bg-green-500 scale-110 ring-8 ring-green-300';
    }
    if (eliminated) {
      return 'bg-gray-500 opacity-40 grayscale cursor-not-allowed animate-shake-out';
    }
    return 'bg-white/15 hover:bg-white/25 hover:scale-110 cursor-pointer';
  };

  return (
    <button
      onClick={onClick}
      disabled={eliminated || showCorrect}
      className={`
        w-28 h-28 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center
        transition-all duration-300 transform border-4 border-white/20
        ${getStyles()}
        ${eliminated || showCorrect ? 'cursor-not-allowed' : ''}
      `}
    >
      <span className="text-6xl sm:text-7xl">{icon}</span>
    </button>
  );
};

// ============ Main Component ============

const FirstWordGame = ({ themeId, onBack, triggerConfetti }) => {
  const theme = getTheme(themeId);
  const { trackLevelComplete } = useGameAnalytics('My First Word');

  // Game state
  const [rounds, setRounds] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [eliminatedIcons, setEliminatedIcons] = useState([]);
  const [showCorrect, setShowCorrect] = useState(false);

  // Initialize game
  const startGame = useCallback(() => {
    setRounds(generateRounds());
    setRoundIndex(0);
    setScore(0);
    setGameComplete(false);
    setEliminatedIcons([]);
    setShowCorrect(false);
  }, []);

  useEffect(() => {
    startGame();
  }, [startGame]);

  // Speak word when round changes
  useEffect(() => {
    if (rounds.length > 0 && roundIndex < rounds.length && !showCorrect) {
      const timer = setTimeout(() => {
        speak(rounds[roundIndex].correct.word);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [roundIndex, rounds, showCorrect]);

  const round = rounds[roundIndex];

  const handleAnswer = (option) => {
    if (showCorrect || eliminatedIcons.includes(option.icon)) return;

    if (option.icon === round.correct.icon) {
      // Correct!
      setShowCorrect(true);
      setScore((prev) => prev + 1);
      triggerConfetti?.('normal');
      trackLevelComplete(roundIndex + 1, score + 1, true);

      setTimeout(() => {
        if (roundIndex + 1 >= rounds.length) {
          // Game complete
          const finalScore = score + 1;
          setGameComplete(true);
          addXP(XP_PER_GAME);
          recordGameStats('firstWord', rounds.length, finalScore);
          triggerConfetti?.('big');
        } else {
          setRoundIndex((prev) => prev + 1);
          setEliminatedIcons([]);
          setShowCorrect(false);
        }
      }, 1500);
    } else {
      // Wrong — eliminate this option
      playOopsSound();
      setEliminatedIcons((prev) => [...prev, option.icon]);
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

  // ============ Game Complete Screen ============
  if (gameComplete) {
    return (
      <div
        className={`min-h-screen ${theme.bg} flex items-center justify-center p-6 ${theme.font}`}
        dir="rtl"
      >
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">🌟</div>
          <h1 className="text-5xl font-black text-white mb-4">כל הכבוד!</h1>
          <p className="text-2xl text-white/90 mb-2">
            קראת {score} מילים מתוך {rounds.length}!
          </p>
          <div className="text-3xl text-yellow-300 font-bold mb-8">+{XP_PER_GAME} XP</div>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={startGame}
              className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-2xl text-white text-xl font-bold transition-all"
            >
              שחק שוב 🔄
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
  if (!round) return null;

  return (
    <div
      className={`min-h-screen ${theme.bg} flex flex-col items-center p-4 sm:p-8 ${theme.font}`}
      dir="rtl"
    >
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-4 mt-2">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white font-bold transition-all"
        >
          ← חזרה
        </button>
        <div className="text-white/80 font-bold text-lg">
          {roundIndex + 1} / {rounds.length}
        </div>
        <div className="text-white font-bold text-lg">
          ⭐ {score}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-2xl h-3 bg-white/20 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-500"
          style={{ width: `${(roundIndex / rounds.length) * 100}%` }}
        />
      </div>

      {/* Word display — clickable for TTS */}
      <button
        onClick={() => speak(round.correct.word)}
        className={`${theme.cardBg} rounded-3xl px-10 py-8 mb-8 text-center cursor-pointer hover:scale-105 transition-all duration-300 group`}
      >
        <p className="text-white/60 text-lg mb-2 flex items-center justify-center gap-2">
          <span>🔊</span>
          <span>לחץ לשמוע</span>
        </p>
        <div className="text-6xl sm:text-7xl font-bold text-white leading-relaxed" dir="rtl">
          {round.correct.word}
        </div>
      </button>

      {/* Emoji answer options — 2x2 grid */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6">
        {round.options.map((option, idx) => (
          <AnswerOption
            key={`${roundIndex}-${idx}`}
            icon={option.icon}
            onClick={() => handleAnswer(option)}
            eliminated={eliminatedIcons.includes(option.icon)}
            showCorrect={showCorrect && option.icon === round.correct.icon}
          />
        ))}
      </div>

      {/* Speak again button */}
      <button
        onClick={() => speak(round.correct.word)}
        className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-xl text-white text-lg font-bold transition-all flex items-center gap-2"
      >
        <span>🔊</span>
        <span>השמע שוב</span>
      </button>

      {/* Animations */}
      <style>{`
        @keyframes shake-out {
          0% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
          100% { transform: translateX(0); }
        }
        .animate-shake-out {
          animation: shake-out 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FirstWordGame;
