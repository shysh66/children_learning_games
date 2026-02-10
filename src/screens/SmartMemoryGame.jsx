import React, { useState, useCallback } from 'react';
import { getTheme } from '../data/themes';
import { getSelectedZone, addXP, recordGameStats } from '../utils/storage';

// ============ Card Data ============

const ANIMALS = [
  { emoji: '🦁', name: 'אריה' },
  { emoji: '🐶', name: 'כלב' },
  { emoji: '🐱', name: 'חתול' },
  { emoji: '🐘', name: 'פיל' },
  { emoji: '🦒', name: "ג'ירפה" },
  { emoji: '🐬', name: 'דולפין' },
  { emoji: '🦋', name: 'פרפר' },
  { emoji: '🐙', name: 'תמנון' },
  { emoji: '🐢', name: 'צב' },
];

const SHAPES_COLORS = [
  { emoji: '🔴', name: 'אדום' },
  { emoji: '🔵', name: 'כחול' },
  { emoji: '⭐', name: 'כוכב' },
  { emoji: '🟢', name: 'ירוק' },
  { emoji: '💜', name: 'סגול' },
  { emoji: '🔷', name: 'יהלום' },
];

// Equations grouped by unique result value
// Each result maps to possible equations that produce it
const MATH_EQUATIONS = {
  2: ['1 + 1', '4 - 2'],
  3: ['1 + 2', '5 - 2'],
  4: ['2 + 2', '7 - 3'],
  5: ['3 + 2', '8 - 3'],
  6: ['4 + 2', '9 - 3'],
  7: ['4 + 3', '10 - 3'],
  8: ['5 + 3', '10 - 2'],
  9: ['5 + 4', '12 - 3'],
  10: ['7 + 3', '6 + 4'],
  11: ['8 + 3', '5 + 6'],
  12: ['7 + 5', '8 + 4'],
};

// ============ Helpers ============

const shuffle = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const playWrongSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(200, now + 0.3);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.4);
  } catch (e) {
    // Silently fail if audio not supported
  }
};

// ============ Card Generation ============

const generateCards = (zone, level) => {
  const isLittleExplorers = zone === 'littleExplorers';
  let pairs = [];

  if (isLittleExplorers) {
    if (level === 1) {
      // Level 1: 3 pairs - Animals
      const selected = shuffle(ANIMALS).slice(0, 3);
      pairs = selected.map((item, i) => [
        { id: `${i}-a`, pairId: i, content: item.emoji, type: 'emoji' },
        { id: `${i}-b`, pairId: i, content: item.emoji, type: 'emoji' },
      ]);
    } else if (level === 2) {
      // Level 2: 4 pairs - Shapes/Colors
      const selected = shuffle(SHAPES_COLORS).slice(0, 4);
      pairs = selected.map((item, i) => [
        { id: `${i}-a`, pairId: i, content: item.emoji, type: 'emoji' },
        { id: `${i}-b`, pairId: i, content: item.emoji, type: 'emoji' },
      ]);
    } else {
      // Level 3: 6 pairs - Mixed (3 animals + 3 shapes)
      const animals = shuffle(ANIMALS).slice(0, 3);
      const shapes = shuffle(SHAPES_COLORS).slice(0, 3);
      const mixed = [...animals, ...shapes];
      pairs = mixed.map((item, i) => [
        { id: `${i}-a`, pairId: i, content: item.emoji, type: 'emoji' },
        { id: `${i}-b`, pairId: i, content: item.emoji, type: 'emoji' },
      ]);
    }
  } else {
    // Ace Academy
    if (level === 1) {
      // Level 1: 6 pairs - Emoji vs Emoji
      const selected = shuffle(ANIMALS).slice(0, 6);
      pairs = selected.map((item, i) => [
        { id: `${i}-a`, pairId: i, content: item.emoji, type: 'emoji' },
        { id: `${i}-b`, pairId: i, content: item.emoji, type: 'emoji' },
      ]);
    } else if (level === 2) {
      // Level 2 (Reading): Image vs Text
      const selected = shuffle(ANIMALS).slice(0, 6);
      pairs = selected.map((item, i) => [
        { id: `${i}-a`, pairId: i, content: item.emoji, type: 'emoji' },
        { id: `${i}-b`, pairId: i, content: item.name, type: 'text' },
      ]);
    } else {
      // Level 3 (Math): Equation vs Result - UNIQUE results guaranteed
      const allResults = shuffle(Object.keys(MATH_EQUATIONS).map(Number));
      const selectedResults = allResults.slice(0, 6);
      pairs = selectedResults.map((result, i) => {
        const equations = MATH_EQUATIONS[result];
        const equation = equations[Math.floor(Math.random() * equations.length)];
        return [
          { id: `${i}-a`, pairId: i, content: equation, type: 'equation' },
          { id: `${i}-b`, pairId: i, content: String(result), type: 'result' },
        ];
      });
    }
  }

  return shuffle(pairs.flat());
};

// ============ Level Definitions ============

const getLevels = (zone) => {
  if (zone === 'littleExplorers') {
    return [
      { id: 1, name: 'חיות', description: '3 זוגות של חיות', icon: '🦁', pairs: 3 },
      { id: 2, name: 'צורות וצבעים', description: '4 זוגות של צורות', icon: '🔵', pairs: 4 },
      { id: 3, name: 'מעורב', description: '6 זוגות מעורבים', icon: '🌈', pairs: 6 },
    ];
  }
  return [
    { id: 1, name: 'זוגות', description: 'מצא תמונות זהות', icon: '🎴', pairs: 6 },
    { id: 2, name: 'קריאה', description: 'התאם תמונה למילה', icon: '📖', pairs: 6 },
    { id: 3, name: 'חשבון', description: 'התאם תרגיל לתוצאה', icon: '🔢', pairs: 6 },
  ];
};

const getGridCols = (numCards) => {
  if (numCards <= 6) return 3;
  if (numCards <= 8) return 4;
  return 4;
};

// ============ Main Component ============

const SmartMemoryGame = ({ themeId, onBack, triggerConfetti }) => {
  const theme = getTheme(themeId);
  const zone = getSelectedZone() || 'aceAcademy';
  const levels = getLevels(zone);

  const [currentLevel, setCurrentLevel] = useState(0);
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [shakeCards, setShakeCards] = useState([]);

  const startLevel = useCallback((levelId) => {
    const newCards = generateCards(zone, levelId);
    setCards(newCards);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setCurrentLevel(levelId);
    setGameComplete(false);
    setIsChecking(false);
    setShakeCards([]);
  }, [zone]);

  const handleCardClick = useCallback((cardId) => {
    if (isChecking) return;
    if (matchedCards.includes(cardId)) return;
    if (flippedCards.includes(cardId)) return;
    if (flippedCards.length >= 2) return;

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      setIsChecking(true);

      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard.pairId === secondCard.pairId) {
        // Match found
        triggerConfetti();
        const newMatched = [...matchedCards, firstId, secondId];

        setTimeout(() => {
          setMatchedCards(newMatched);
          setFlippedCards([]);
          setIsChecking(false);

          if (newMatched.length === cards.length) {
            setGameComplete(true);
            const level = levels.find((l) => l.id === currentLevel);
            const xpEarned = (level?.pairs || 6) * 10;
            addXP(xpEarned);
            recordGameStats('smartMemory', level?.pairs || 6, level?.pairs || 6);
            triggerConfetti('big');
          }
        }, 600);
      } else {
        // No match
        playWrongSound();
        setShakeCards([firstId, secondId]);

        setTimeout(() => {
          setFlippedCards([]);
          setShakeCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  }, [isChecking, matchedCards, flippedCards, cards, currentLevel, levels, triggerConfetti]);

  // ============ Level Select Screen ============
  if (currentLevel === 0) {
    return (
      <div
        className={`min-h-screen ${theme.bg} flex flex-col items-center justify-center p-6 ${theme.font}`}
        dir="rtl"
      >
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">🧩</div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 drop-shadow-2xl">
            משחק הזיכרון החכם
          </h1>
          <p className="text-xl text-white/80">בחר שלב ומצא את הזוגות!</p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-md">
          {levels.map((level) => (
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
    const level = levels.find((l) => l.id === currentLevel);
    const xpEarned = (level?.pairs || 6) * 10;

    return (
      <div
        className={`min-h-screen ${theme.bg} flex items-center justify-center p-6 ${theme.font}`}
        dir="rtl"
      >
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">🏆</div>
          <h1 className="text-5xl font-black text-white mb-4">כל הכבוד!</h1>
          <p className="text-2xl text-white/90 mb-2">מצאת את כל הזוגות!</p>
          <p className="text-xl text-white/70 mb-2">
            שלב {currentLevel}: {level?.name}
          </p>
          <p className="text-lg text-white/60 mb-4">מהלכים: {moves}</p>
          <div className="text-3xl text-yellow-300 font-bold mb-8">+{xpEarned} XP</div>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => startLevel(currentLevel)}
              className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-2xl text-white text-xl font-bold transition-all"
            >
              שחק שוב 🔄
            </button>
            {currentLevel < levels.length && (
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

  // ============ Game Board ============
  const numCards = cards.length;
  const gridCols = getGridCols(numCards);
  const totalPairs = numCards / 2;
  const matchedPairs = matchedCards.length / 2;

  return (
    <div
      className={`min-h-screen ${theme.bg} flex flex-col items-center p-4 ${theme.font}`}
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
          {matchedPairs} / {totalPairs} זוגות
        </div>
        <div className="text-white font-bold text-lg">🔄 {moves}</div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-2xl h-3 bg-white/20 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-500"
          style={{ width: `${(matchedPairs / totalPairs) * 100}%` }}
        />
      </div>

      {/* Card Grid */}
      <div
        className="grid gap-3 sm:gap-4 w-full max-w-2xl"
        style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
      >
        {cards.map((card) => {
          const isFlipped = flippedCards.includes(card.id);
          const isMatched = matchedCards.includes(card.id);
          const isShaking = shakeCards.includes(card.id);
          const showFront = isFlipped || isMatched;

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={isMatched || isChecking}
              className={`
                aspect-square rounded-2xl relative
                transition-all duration-200
                ${isMatched ? 'opacity-50 scale-95' : 'hover:scale-105 cursor-pointer'}
                ${isShaking ? 'memory-shake' : ''}
              `}
              style={{ perspective: '600px' }}
            >
              <div
                className="w-full h-full relative"
                style={{
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.5s ease-in-out',
                  transform: showFront ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Card Back (question mark) */}
                <div
                  className={`
                    absolute inset-0 rounded-2xl flex items-center justify-center
                    ${theme.cardBg} border-2 border-white/30 shadow-lg
                  `}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span className="text-4xl sm:text-5xl">❓</span>
                </div>

                {/* Card Front (content) */}
                <div
                  className={`
                    absolute inset-0 rounded-2xl flex items-center justify-center
                    ${isMatched
                      ? 'bg-green-500/30 border-green-400'
                      : 'bg-white/20 backdrop-blur-sm border-white/40'}
                    border-2 shadow-lg
                  `}
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  {card.type === 'emoji' ? (
                    <span
                      className={
                        numCards <= 8
                          ? 'text-5xl sm:text-6xl'
                          : 'text-4xl sm:text-5xl'
                      }
                    >
                      {card.content}
                    </span>
                  ) : (
                    <span
                      className={`text-white font-bold text-center px-2 ${
                        card.type === 'equation'
                          ? 'text-xl sm:text-2xl'
                          : 'text-lg sm:text-2xl'
                      }`}
                    >
                      {card.content}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Level info */}
      <div className="mt-6 text-center">
        <p className="text-white/60 text-lg">
          שלב {currentLevel}: {levels.find((l) => l.id === currentLevel)?.name}
        </p>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes memory-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .memory-shake {
          animation: memory-shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default SmartMemoryGame;
