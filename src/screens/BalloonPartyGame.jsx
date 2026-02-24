import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getTheme } from '../data/themes';
import { addXP, recordGameStats } from '../utils/storage';
import { playOopsSound } from '../utils/sounds';
import useGameAnalytics from '../hooks/useGameAnalytics';

// ============ Hebrew Alphabet Data ============

// Easy pool: visually/phonetically distinct letters
const EASY_LETTERS = [
  { letter: 'א', name: 'אָלֶף' },
  { letter: 'ב', name: 'בֵּית' },
  { letter: 'ג', name: 'גִּימֶל' },
  { letter: 'ד', name: 'דָּלֶת' },
  { letter: 'י', name: 'יוֹד' },
  { letter: 'ל', name: 'לָמֶד' },
  { letter: 'מ', name: 'מֵם' },
  { letter: 'נ', name: 'נוּן' },
  { letter: 'ע', name: 'עַיִן' },
  { letter: 'ש', name: 'שִׁין' },
];

// Hard pool: visually or phonetically similar letters
const HARD_LETTERS = [
  { letter: 'ה', name: 'הֵא' },
  { letter: 'ח', name: 'חֵית' },
  { letter: 'ת', name: 'תָּו' },
  { letter: 'ו', name: 'וָו' },
  { letter: 'ז', name: 'זַיִן' },
  { letter: 'כ', name: 'כַּף' },
  { letter: 'ר', name: 'רֵישׁ' },
  { letter: 'ק', name: 'קוֹף' },
  { letter: 'פ', name: 'פֵּא' },
  { letter: 'צ', name: 'צָדִי' },
];

const ALL_LETTERS = [...EASY_LETTERS, ...HARD_LETTERS];

const BALLOON_COLORS = [
  'bg-red-400 border-red-600',
  'bg-blue-400 border-blue-600',
  'bg-green-400 border-green-600',
  'bg-yellow-400 border-yellow-600',
  'bg-purple-400 border-purple-600',
];

const ROUNDS_PER_GAME = 10;
const BALLOONS_PER_ROUND = 5;
const XP_PER_GAME = 30;
const EASY_ROUNDS = 5;

// ============ TTS Helper ============

const speak = (text) => {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      utterance.rate = 0.75;
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

// ============ Generate a single round ============

function generateRound(roundIndex, prevLetter) {
  const pool = roundIndex < EASY_ROUNDS ? EASY_LETTERS : HARD_LETTERS;

  // Pick target — not same as previous
  const candidates = pool.filter((l) => l.letter !== prevLetter);
  const target = candidates[Math.floor(Math.random() * candidates.length)];

  // Pick distractors from the full alphabet (excluding target)
  const distractors = shuffle(ALL_LETTERS.filter((l) => l.letter !== target.letter)).slice(
    0,
    BALLOONS_PER_ROUND - 1
  );

  const balloons = shuffle([target, ...distractors]);

  return { target, balloons };
}

// ============ Balloon Component ============

const Balloon = ({ item, colorClass, onClick, popped, isCorrect, delay }) => {
  return (
    <button
      onClick={onClick}
      disabled={popped}
      className={`
        relative flex items-center justify-center
        w-20 h-24 sm:w-24 sm:h-28
        rounded-full border-4 text-4xl font-black text-white
        transition-all duration-300
        ${colorClass}
        ${popped && isCorrect ? 'animate-ping opacity-0 scale-150' : ''}
        ${popped && !isCorrect ? 'opacity-0 scale-50' : ''}
        ${!popped ? 'hover:scale-110 active:scale-95 shadow-lg cursor-pointer' : 'cursor-not-allowed'}
        balloon-float
      `}
      style={{ animationDelay: `${delay}s` }}
    >
      {item.letter}
      {/* Balloon string */}
      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-0.5 h-5 bg-white/60" />
    </button>
  );
};

// ============ Main Component ============

const BalloonPartyGame = ({ themeId, onBack, triggerConfetti }) => {
  const theme = getTheme(themeId);
  const { trackLevelComplete } = useGameAnalytics('Balloon Party');

  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [currentRound, setCurrentRound] = useState(null);
  const [poppedLetters, setPoppedLetters] = useState([]);
  const [showCorrect, setShowCorrect] = useState(false);
  const prevLetterRef = useRef(null);

  // Initialize first round
  const startGame = useCallback(() => {
    prevLetterRef.current = null;
    const round = generateRound(0, null);
    setCurrentRound(round);
    setRoundIndex(0);
    setScore(0);
    setGameComplete(false);
    setPoppedLetters([]);
    setShowCorrect(false);
  }, []);

  useEffect(() => {
    startGame();
  }, [startGame]);

  // Speak the question when round changes
  useEffect(() => {
    if (currentRound && !showCorrect) {
      const timer = setTimeout(() => {
        speak(`איפה ה${currentRound.target.name}?`);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentRound, showCorrect]);

  const handleBalloonClick = (item) => {
    if (showCorrect || poppedLetters.includes(item.letter)) return;

    if (item.letter === currentRound.target.letter) {
      // Correct!
      setShowCorrect(true);
      setPoppedLetters((prev) => [...prev, item.letter]);
      const newScore = score + 1;
      setScore(newScore);
      triggerConfetti?.('normal');
      speak(`כן! ${currentRound.target.name}!`);
      trackLevelComplete(roundIndex + 1, newScore, true);

      setTimeout(() => {
        if (roundIndex + 1 >= ROUNDS_PER_GAME) {
          // Game complete
          setGameComplete(true);
          addXP(XP_PER_GAME);
          recordGameStats('balloonParty', ROUNDS_PER_GAME, newScore);
          triggerConfetti?.('big');
        } else {
          const nextIndex = roundIndex + 1;
          prevLetterRef.current = currentRound.target.letter;
          const nextRound = generateRound(nextIndex, prevLetterRef.current);
          setCurrentRound(nextRound);
          setRoundIndex(nextIndex);
          setPoppedLetters([]);
          setShowCorrect(false);
        }
      }, 1500);
    } else {
      // Wrong — speak the clicked letter name, then play error sound
      speak(item.name);
      setTimeout(() => playOopsSound(), 500);
      setPoppedLetters((prev) => [...prev, item.letter]);
    }
  };

  // ============ Loading ============
  if (!currentRound) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="text-4xl text-white animate-pulse">טוען...</div>
      </div>
    );
  }

  // ============ Game Complete ============
  if (gameComplete) {
    return (
      <div
        className={`min-h-screen ${theme.bg} flex items-center justify-center p-6 ${theme.font}`}
        dir="rtl"
      >
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">🎈</div>
          <h1 className="text-5xl font-black text-white mb-4">כל הכבוד!</h1>
          <p className="text-2xl text-white/90 mb-2">
            זיהית {score} אותיות מתוך {ROUNDS_PER_GAME}!
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

  // ============ Game Play ============
  return (
    <div
      className={`min-h-screen ${theme.bg} flex flex-col items-center p-4 sm:p-8 ${theme.font} overflow-hidden`}
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
          {roundIndex + 1} / {ROUNDS_PER_GAME}
        </div>
        <div className="text-white font-bold text-lg">⭐ {score}</div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-2xl h-3 bg-white/20 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-500"
          style={{ width: `${(roundIndex / ROUNDS_PER_GAME) * 100}%` }}
        />
      </div>

      {/* Question */}
      <button
        onClick={() => speak(`איפה ה${currentRound.target.name}?`)}
        className={`${theme.cardBg} rounded-3xl px-8 py-5 mb-8 text-center hover:scale-105 transition-all duration-300 cursor-pointer`}
      >
        <p className="text-white/70 text-base mb-1 flex items-center justify-center gap-2">
          <span>🔊</span>
          <span>לחץ לשמוע שוב</span>
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-white">
          איפה ה{currentRound.target.name}?
        </p>
      </button>

      {/* Balloons area */}
      <div className="flex items-end justify-center gap-4 sm:gap-8 h-48 sm:h-56 relative w-full max-w-2xl">
        {currentRound.balloons.map((item, idx) => (
          <Balloon
            key={`${roundIndex}-${item.letter}`}
            item={item}
            colorClass={BALLOON_COLORS[idx % BALLOON_COLORS.length]}
            onClick={() => handleBalloonClick(item)}
            popped={poppedLetters.includes(item.letter)}
            isCorrect={item.letter === currentRound.target.letter}
            delay={idx * 0.15}
          />
        ))}
      </div>

      {/* Balloon float animation */}
      <style>{`
        @keyframes balloonFloat {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-18px) rotate(2deg); }
        }
        .balloon-float {
          animation: balloonFloat 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default BalloonPartyGame;
