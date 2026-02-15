import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getTheme } from '../data/themes';
import { grantStar, recordGameStats } from '../utils/storage';
import { playCheerSound } from '../utils/sounds';
import { StarEarnedModal } from '../components';

// ============ Game Data ============

const ANIMALS = [
  { name: 'אריה', emoji: '🦁', food: { name: 'תפוחים', emoji: '🍎', single: 'תפוח' } },
  { name: 'קוף', emoji: '🐵', food: { name: 'בננות', emoji: '🍌', single: 'בננה' } },
  { name: 'פיל', emoji: '🐘', food: { name: 'אבטיחים', emoji: '🍉', single: 'אבטיח' } },
  { name: 'דוב', emoji: '🐻', food: { name: 'דבש', emoji: '🍯', single: 'דבש' } },
  { name: 'ארנב', emoji: '🐰', food: { name: 'גזרים', emoji: '🥕', single: 'גזר' } },
];

const LEVELS = [
  { id: 1, name: 'קל', description: 'ספירה עד 3', icon: '⭐', minTarget: 1, maxTarget: 3, rounds: 5 },
  { id: 2, name: 'בינוני', description: 'ספירה עד 5', icon: '🌟', minTarget: 2, maxTarget: 5, rounds: 6 },
  { id: 3, name: 'מאתגר', description: 'ספירה עד 8', icon: '💫', minTarget: 3, maxTarget: 8, rounds: 6 },
];

// ============ TTS Helper ============

const speak = (text, lang = 'he-IL') => {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.85;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {
    // Silently fail
  }
};

// ============ Sound Effects ============

const playCrunchSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;

    // White noise burst for crunch
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass filter for crunch character
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(1.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.2);

    // Add a low "thump" for body
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
    oscGain.gain.setValueAtTime(0.3, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    osc.start(now);
    osc.stop(now + 0.15);
  } catch (e) {
    // Silently fail
  }
};

// ============ Generate Rounds ============

function generateRounds(level) {
  const rounds = [];
  let lastAnimalIndex = -1;
  for (let i = 0; i < level.rounds; i++) {
    let animalIndex;
    do {
      animalIndex = Math.floor(Math.random() * ANIMALS.length);
    } while (animalIndex === lastAnimalIndex && ANIMALS.length > 1);
    lastAnimalIndex = animalIndex;
    const animal = ANIMALS[animalIndex];
    const target = level.minTarget + Math.floor(Math.random() * (level.maxTarget - level.minTarget + 1));
    rounds.push({ animal, target });
  }
  return rounds;
}

// ============ Main Component ============

const FeedTheAnimalGame = ({ themeId, onBack, triggerConfetti }) => {
  const theme = getTheme(themeId);

  // Game state
  const [currentLevel, setCurrentLevel] = useState(0); // 0 = level select
  const [roundIndex, setRoundIndex] = useState(0);
  const [rounds, setRounds] = useState([]);
  const [fedCount, setFedCount] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [eating, setEating] = useState(false);
  const [roundWon, setRoundWon] = useState(false);
  const [showStarModal, setShowStarModal] = useState(false);
  const [earnedStarTotal, setEarnedStarTotal] = useState(0);

  // Drag state
  const [dragging, setDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const foodRef = useRef(null);
  const animalRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const [highlightAnimal, setHighlightAnimal] = useState(false);

  // Start a level
  const startLevel = useCallback((levelIndex) => {
    const level = LEVELS[levelIndex - 1];
    const newRounds = generateRounds(level);
    setRounds(newRounds);
    setRoundIndex(0);
    setFedCount(0);
    setScore(0);
    setCurrentLevel(levelIndex);
    setGameComplete(false);
    setRoundWon(false);
    setEating(false);
  }, []);

  // Current round data
  const round = rounds[roundIndex];

  // Speak instruction when round changes
  useEffect(() => {
    if (currentLevel > 0 && rounds.length > 0 && roundIndex < rounds.length && !roundWon) {
      const r = rounds[roundIndex];
      const instruction = `תן ל${r.animal.name} ${r.target} ${r.animal.food.name}`;
      const timer = setTimeout(() => {
        speak(instruction, 'he-IL');
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentLevel, roundIndex, rounds, roundWon]);

  // Check if point is over the animal drop zone
  const isOverAnimal = useCallback((x, y) => {
    const el = animalRef.current;
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }, []);

  // Pointer handlers for drag & drop
  const handlePointerDown = useCallback((e) => {
    if (eating || roundWon) return;
    e.preventDefault();
    const el = foodRef.current;
    if (!el) return;
    setDragPos({ x: e.clientX, y: e.clientY });
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
    el.setPointerCapture(e.pointerId);
  }, [eating, roundWon]);

  const handlePointerMove = useCallback((e) => {
    if (!dragging) return;
    e.preventDefault();
    setDragPos({ x: e.clientX, y: e.clientY });
    setHighlightAnimal(isOverAnimal(e.clientX, e.clientY));
  }, [dragging, isOverAnimal]);

  const handlePointerUp = useCallback((e) => {
    if (!dragging) return;
    e.preventDefault();
    setDragging(false);
    setHighlightAnimal(false);

    if (!round) return;

    if (isOverAnimal(e.clientX, e.clientY)) {
      // Dropped on animal — feed it!
      const newCount = fedCount + 1;
      setFedCount(newCount);
      setEating(true);

      // Play crunch + TTS count
      playCrunchSound();
      setTimeout(() => {
        speak(`${newCount}`, 'he-IL');
      }, 200);

      setTimeout(() => {
        setEating(false);

        if (newCount === round.target) {
          // Round won!
          setRoundWon(true);
          setScore((prev) => prev + 1);
          playCheerSound();
          triggerConfetti();
          speak('כל הכבוד!', 'he-IL');

          setTimeout(() => {
            if (roundIndex + 1 >= rounds.length) {
              // Game complete
              setGameComplete(true);
              const gameId = `feedAnimal-level-${currentLevel}`;
              const starResult = grantStar(gameId);
              if (starResult.earned) {
                setEarnedStarTotal(starResult.totalStars);
                setShowStarModal(true);
              }
              recordGameStats('feedAnimal', rounds.length, score + 1);
              triggerConfetti('big');
            } else {
              setRoundWon(false);
              setRoundIndex((prev) => prev + 1);
              setFedCount(0);
            }
          }, 1500);
        }
      }, 500);
    }
    // Dropped nowhere — snap back silently
  }, [dragging, round, fedCount, isOverAnimal, roundIndex, rounds, triggerConfetti, score, currentLevel]);

  // Drag style for floating food copy
  const getDragStyle = () => {
    if (!dragging) return {};
    return {
      position: 'fixed',
      left: dragPos.x - 32,
      top: dragPos.y - 32,
      zIndex: 9999,
      pointerEvents: 'none',
      transform: 'scale(1.3)',
      transition: 'transform 0.1s',
    };
  };

  // ============ Level Select Screen ============
  if (currentLevel === 0) {
    return (
      <div
        className={`min-h-screen ${theme.bg} flex flex-col items-center justify-center p-6 ${theme.font}`}
        dir="rtl"
      >
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">🍽️</div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 drop-shadow-2xl">
            זמן אוכל
          </h1>
          <p className="text-xl text-white/80">האכל את החיות וספור כמה אכלו!</p>
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
                <div className="text-3xl text-white/60">→</div>
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
            ציון: {score}/{rounds.length}
          </p>

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

        <StarEarnedModal
          isOpen={showStarModal}
          onClose={() => setShowStarModal(false)}
          totalStars={earnedStarTotal}
        />
      </div>
    );
  }

  // ============ Game Play Screen ============
  if (!round) return null;

  const instruction = `תן ל${round.animal.name} ${round.target} ${round.animal.food.name}`;

  return (
    <div
      className={`min-h-screen ${theme.bg} flex flex-col items-center p-4 select-none ${theme.font}`}
      dir="rtl"
      style={{ touchAction: 'none' }}
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
      <div className="w-full max-w-2xl h-3 bg-white/20 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-500"
          style={{ width: `${(roundIndex / rounds.length) * 100}%` }}
        />
      </div>

      {/* Instruction */}
      <div className="mb-4 text-center">
        <button
          onClick={() => speak(instruction, 'he-IL')}
          className={`${theme.cardBg} rounded-2xl px-6 py-4 inline-block cursor-pointer hover:scale-105 transition-all`}
        >
          <p className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 justify-center">
            <span>🔊</span>
            <span>{instruction}</span>
          </p>
        </button>
      </div>

      {/* Target number display */}
      <div className="mb-4 text-center">
        <div className={`inline-block ${theme.cardBg} rounded-2xl px-8 py-3`}>
          <span className="text-5xl sm:text-6xl font-black text-yellow-300">{round.target}</span>
        </div>
      </div>

      {/* Main game area — split layout */}
      <div className="w-full max-w-3xl flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 flex-1">

        {/* Left side: Animal drop zone */}
        <div className="flex flex-col items-center gap-3">
          <div
            ref={animalRef}
            className={`
              w-48 h-48 sm:w-56 sm:h-56 rounded-3xl flex flex-col items-center justify-center
              border-4 border-dashed transition-all duration-200
              ${highlightAnimal
                ? 'border-green-400 bg-green-400/30 scale-110 shadow-2xl shadow-green-500/50 border-solid'
                : 'border-white/40 bg-white/10'
              }
            `}
          >
            <div
              className={`text-8xl sm:text-9xl transition-transform duration-300 ${eating ? 'scale-125' : 'scale-100'}`}
            >
              {round.animal.emoji}
            </div>
          </div>
          <p className="text-lg text-white/80 font-bold">{round.animal.name}</p>

          {/* Fed counter — show food emojis for items fed */}
          <div className="flex gap-1 flex-wrap justify-center min-h-[36px]">
            {Array.from({ length: fedCount }).map((_, i) => (
              <span key={i} className="text-2xl animate-pop-in">
                {round.animal.food.emoji}
              </span>
            ))}
          </div>
          <div className="text-2xl font-bold text-white">
            {fedCount} / {round.target}
          </div>
        </div>

        {/* Right side: Food source */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-lg text-white/60 mb-2">👆 גרור אוכל לחיה</p>

          {roundWon ? (
            <div className="text-7xl animate-bounce">✅</div>
          ) : (
            <div
              ref={foodRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className={`
                w-36 h-36 sm:w-44 sm:h-44 rounded-3xl flex items-center justify-center
                bg-white/15 border-4 border-white/30
                cursor-grab active:cursor-grabbing transition-all duration-200
                ${dragging ? 'opacity-30' : 'hover:scale-110 hover:bg-white/25'}
              `}
              style={{ touchAction: 'none' }}
            >
              <span className="text-7xl sm:text-8xl">{round.animal.food.emoji}</span>
            </div>
          )}

          <p className="text-lg text-white/80 font-bold">{round.animal.food.name}</p>
        </div>
      </div>

      {/* Floating drag copy */}
      {dragging && (
        <div style={getDragStyle()} className="text-6xl sm:text-7xl">
          {round.animal.food.emoji}
        </div>
      )}

      {/* Speak again button */}
      <button
        onClick={() => speak(instruction, 'he-IL')}
        className="mt-4 mb-4 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-xl text-white text-lg font-bold transition-all flex items-center gap-2"
      >
        <span>🔊</span>
        <span>השמע שוב</span>
      </button>

      {/* Animations */}
      <style>{`
        @keyframes pop-in {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in {
          animation: pop-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default FeedTheAnimalGame;
