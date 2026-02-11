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

// ============ Game Data ============

const LEVELS = [
  {
    id: 1,
    name: 'חיות או חפצים?',
    description: 'מה לא שייך לקבוצה?',
    icon: '🦁',
    rounds: [
      { group: 'חיות', items: ['🦁', '🐶', '🐱'], odd: '🚗', explanation: 'נכון! המכונית היא לא חיה.' },
      { group: 'חיות', items: ['🐸', '🐰', '🐻'], odd: '🏠', explanation: 'נכון! הבית הוא לא חיה.' },
      { group: 'חפצים', items: ['🪑', '🛋️', '🚪'], odd: '🐶', explanation: 'נכון! הכלב הוא לא חפץ בבית.' },
      { group: 'פירות', items: ['🍎', '🍌', '🍊'], odd: '🐱', explanation: 'נכון! החתול הוא לא פרי.' },
      { group: 'חיות', items: ['🦋', '🐝', '🐛'], odd: '✈️', explanation: 'נכון! המטוס הוא לא חרק.' },
      { group: 'כלי תחבורה', items: ['🚗', '🚌', '🚂'], odd: '🍎', explanation: 'נכון! התפוח הוא לא כלי תחבורה.' },
    ],
  },
  {
    id: 2,
    name: 'צבעים',
    description: 'איזה פריט בצבע שונה?',
    icon: '🎨',
    rounds: [
      { group: 'אדום', items: ['🍎', '🌹', '❤️'], odd: '🔵', explanation: 'נכון! הכחול הוא לא אדום.' },
      { group: 'צהוב', items: ['🌟', '🍋', '🌻'], odd: '🍆', explanation: 'נכון! החציל הוא סגול, לא צהוב.' },
      { group: 'ירוק', items: ['🌿', '🥒', '🐸'], odd: '🔴', explanation: 'נכון! האדום הוא לא ירוק.' },
      { group: 'לבן', items: ['☁️', '🥛', '⚪'], odd: '🖤', explanation: 'נכון! השחור הוא לא לבן.' },
      { group: 'כתום', items: ['🍊', '🥕', '🎃'], odd: '🍇', explanation: 'נכון! הענבים הם לא כתומים.' },
      { group: 'ורוד', items: ['🌸', '🩷', '🦩'], odd: '💚', explanation: 'נכון! הירוק הוא לא ורוד.' },
    ],
  },
  {
    id: 3,
    name: 'רגשות',
    description: 'מי מרגיש אחרת?',
    icon: '😀',
    rounds: [
      { group: 'שמח', items: ['😀', '😄', '🥳'], odd: '😢', explanation: 'נכון! הפרצוף הזה עצוב, לא שמח.' },
      { group: 'עצוב', items: ['😢', '😭', '😞'], odd: '😂', explanation: 'נכון! הפרצוף הזה צוחק, לא עצוב.' },
      { group: 'כועס', items: ['😠', '😡', '🤬'], odd: '😊', explanation: 'נכון! הפרצוף הזה מחייך, לא כועס.' },
      { group: 'מפחד', items: ['😨', '😱', '🫣'], odd: '😎', explanation: 'נכון! הפרצוף הזה מגניב, לא מפחד.' },
      { group: 'שמח', items: ['🤗', '😁', '🤩'], odd: '😤', explanation: 'נכון! הפרצוף הזה כועס, לא שמח.' },
      { group: 'ישנוני', items: ['😴', '🥱', '😪'], odd: '🤪', explanation: 'נכון! הפרצוף הזה משוגע, לא ישנוני.' },
    ],
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

const XP_PER_LEVEL = 20;

// ============ Main Component ============

const OddOneOutGame = ({ themeId, onBack, triggerConfetti }) => {
  const theme = getTheme(themeId);

  const [currentLevel, setCurrentLevel] = useState(0); // 0 = level select
  const [rounds, setRounds] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const startLevel = useCallback((levelId) => {
    const level = LEVELS[levelId - 1];
    // Shuffle each round's display items
    const prepared = level.rounds.map((r) => ({
      ...r,
      displayItems: shuffle([...r.items, r.odd]),
    }));
    setRounds(prepared);
    setRoundIndex(0);
    setScore(0);
    setCurrentLevel(levelId);
    setGameComplete(false);
    setSelected(null);
    setShowResult(false);
  }, []);

  // TTS instruction on each round
  useEffect(() => {
    if (currentLevel > 0 && rounds.length > 0 && roundIndex < rounds.length && !showResult) {
      const timer = setTimeout(() => speak('מי יוצא דופן?'), 400);
      return () => clearTimeout(timer);
    }
  }, [currentLevel, roundIndex, rounds.length, showResult]);

  const round = rounds[roundIndex];

  const handleSelect = (item) => {
    if (showResult) return;

    setSelected(item);
    setShowResult(true);

    if (item === round.odd) {
      // Correct!
      setScore((prev) => prev + 1);
      triggerConfetti?.('normal');
      setTimeout(() => speak(round.explanation), 300);

      setTimeout(() => {
        if (roundIndex + 1 >= rounds.length) {
          setGameComplete(true);
          addXP(XP_PER_LEVEL);
          recordGameStats('oddOneOut', rounds.length, score + 1);
          triggerConfetti?.('big');
        } else {
          setRoundIndex((prev) => prev + 1);
          setSelected(null);
          setShowResult(false);
        }
      }, 2500);
    } else {
      // Wrong
      playOopsSound();
      setTimeout(() => {
        setSelected(null);
        setShowResult(false);
      }, 1200);
    }
  };

  // ============ Level Select ============
  if (currentLevel === 0) {
    return (
      <div className={`min-h-screen ${theme.bg} flex flex-col items-center justify-center p-6 ${theme.font}`} dir="rtl">
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">🔎</div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 drop-shadow-2xl">מי יוצא דופן?</h1>
          <p className="text-xl text-white/80">מצא את מי שלא שייך לקבוצה!</p>
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
                  <h2 className="text-2xl font-bold text-white">שלב {level.id}: {level.name}</h2>
                  <p className="text-white/70 text-lg">{level.description}</p>
                </div>
                <div className="text-3xl text-white/60">←</div>
              </div>
            </button>
          ))}
        </div>

        <button onClick={onBack} className="mt-8 px-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-xl font-bold transition-all">
          ← חזרה
        </button>
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
          <p className="text-2xl text-white/90 mb-2">סיימת את שלב {currentLevel}: {LEVELS[currentLevel - 1].name}</p>
          <p className="text-xl text-white/70 mb-4">ציון: {score}/{rounds.length}</p>
          <div className="text-3xl text-yellow-300 font-bold mb-8">+{XP_PER_LEVEL} XP</div>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => startLevel(currentLevel)} className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-2xl text-white text-xl font-bold transition-all">
              שחק שוב 🔄
            </button>
            {currentLevel < LEVELS.length && (
              <button onClick={() => startLevel(currentLevel + 1)} className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 rounded-2xl text-white text-xl font-bold transition-all">
                שלב הבא ⭐
              </button>
            )}
            <button onClick={() => setCurrentLevel(0)} className="px-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-xl font-bold transition-all">
              בחירת שלב 📋
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
      <button onClick={() => speak('מי יוצא דופן?')} className="mb-6 flex items-center gap-2">
        <span className="text-3xl font-bold text-white">מי יוצא דופן? 🤔</span>
        <span className="text-2xl">🔊</span>
      </button>

      {/* Items grid — 2x2 */}
      <div className="grid grid-cols-2 gap-5 sm:gap-6 mb-6">
        {round.displayItems.map((item, idx) => {
          const isOdd = item === round.odd;
          const isSelected = selected === item;
          const isCorrectShown = showResult && isOdd && isSelected;
          const isWrongShown = showResult && !isOdd && isSelected;

          let cls = `${theme.cardBg} hover:scale-105`;
          if (isCorrectShown) cls = 'bg-green-500 scale-110 ring-8 ring-green-300';
          else if (isWrongShown) cls = 'bg-red-500 animate-shake';
          else if (showResult && isOdd && !isSelected) cls = `${theme.cardBg} ring-4 ring-yellow-400`;

          return (
            <button
              key={idx}
              onClick={() => handleSelect(item)}
              disabled={showResult}
              className={`w-32 h-32 sm:w-36 sm:h-36 rounded-3xl flex items-center justify-center transition-all duration-300 transform ${cls} ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className="text-7xl sm:text-8xl">{item}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback text */}
      {showResult && selected === round.odd && (
        <div className={`${theme.cardBg} rounded-2xl px-6 py-4 text-center`}>
          <p className="text-xl font-bold text-white">{round.explanation}</p>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default OddOneOutGame;
