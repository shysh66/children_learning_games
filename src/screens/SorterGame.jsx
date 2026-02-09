import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getTheme } from '../data/themes';
import { addXP, recordGameStats } from '../utils/storage';
import { playCheerSound } from '../utils/sounds';

// ============ Level Data ============

const LEVELS = [
  {
    id: 1,
    name: 'צבעים',
    description: 'שים את הפריט בקופסה הנכונה לפי הצבע',
    icon: '🎨',
    rounds: generateColorRounds(),
  },
  {
    id: 2,
    name: 'צורות',
    description: 'שים את הצורה במקום הנכון',
    icon: '🔷',
    rounds: generateShapeRounds(),
  },
  {
    id: 3,
    name: 'חיות',
    description: 'שים כל חיה בסביבה הנכונה שלה',
    icon: '🦁',
    rounds: generateAnimalRounds(),
  },
];

function generateColorRounds() {
  const colors = [
    { name: 'אדום', nameEn: 'red', emoji: '🔴', bg: 'bg-red-500', border: 'border-red-400', glow: 'shadow-red-500/50' },
    { name: 'כחול', nameEn: 'blue', emoji: '🔵', bg: 'bg-blue-500', border: 'border-blue-400', glow: 'shadow-blue-500/50' },
    { name: 'ירוק', nameEn: 'green', emoji: '🟢', bg: 'bg-green-500', border: 'border-green-400', glow: 'shadow-green-500/50' },
    { name: 'צהוב', nameEn: 'yellow', emoji: '🟡', bg: 'bg-yellow-500', border: 'border-yellow-400', glow: 'shadow-yellow-500/50' },
    { name: 'סגול', nameEn: 'purple', emoji: '🟣', bg: 'bg-purple-500', border: 'border-purple-400', glow: 'shadow-purple-500/50' },
  ];

  const rounds = [];
  // For each round, pick 2 containers and 1 item that matches one of them
  const pairs = [
    [0, 1], [0, 2], [1, 3], [2, 4], [0, 4],
    [1, 2], [3, 4], [0, 3], [1, 4], [2, 3],
  ];

  for (const [a, b] of pairs) {
    const correctIndex = Math.random() < 0.5 ? 0 : 1;
    const correctColor = correctIndex === 0 ? colors[a] : colors[b];
    rounds.push({
      containers: [
        { id: `box-${a}`, label: `קופסה ${colors[a].name}`, color: colors[a], emoji: '📦' },
        { id: `box-${b}`, label: `קופסה ${colors[b].name}`, color: colors[b], emoji: '📦' },
      ],
      item: {
        emoji: correctColor.emoji,
        label: `כדור ${correctColor.name}`,
        correctContainerId: correctIndex === 0 ? `box-${a}` : `box-${b}`,
      },
      instruction: `שים את הכדור ה${correctColor.name} בקופסה ה${correctColor.name}`,
      instructionEn: `Put the ${correctColor.nameEn} ball in the ${correctColor.nameEn} box`,
    });
  }
  return rounds;
}

function generateShapeRounds() {
  const shapes = [
    { name: 'עיגול', nameEn: 'circle', emoji: '⭕', hole: '🔘', bg: 'bg-blue-500', border: 'border-blue-400', glow: 'shadow-blue-500/50' },
    { name: 'ריבוע', nameEn: 'square', emoji: '🟧', hole: '⬜', bg: 'bg-orange-500', border: 'border-orange-400', glow: 'shadow-orange-500/50' },
    { name: 'משולש', nameEn: 'triangle', emoji: '🔺', hole: '📐', bg: 'bg-red-500', border: 'border-red-400', glow: 'shadow-red-500/50' },
    { name: 'כוכב', nameEn: 'star', emoji: '⭐', hole: '🌟', bg: 'bg-yellow-500', border: 'border-yellow-400', glow: 'shadow-yellow-500/50' },
    { name: 'יהלום', nameEn: 'diamond', emoji: '💎', hole: '🔷', bg: 'bg-cyan-500', border: 'border-cyan-400', glow: 'shadow-cyan-500/50' },
  ];

  const rounds = [];
  const pairs = [
    [0, 1], [0, 2], [1, 3], [2, 4], [0, 4],
    [1, 2], [3, 4], [0, 3], [1, 4], [2, 3],
  ];

  for (const [a, b] of pairs) {
    const correctIndex = Math.random() < 0.5 ? 0 : 1;
    const correctShape = correctIndex === 0 ? shapes[a] : shapes[b];
    rounds.push({
      containers: [
        { id: `hole-${a}`, label: `חור ${shapes[a].name}`, color: shapes[a], emoji: shapes[a].hole },
        { id: `hole-${b}`, label: `חור ${shapes[b].name}`, color: shapes[b], emoji: shapes[b].hole },
      ],
      item: {
        emoji: correctShape.emoji,
        label: correctShape.name,
        correctContainerId: correctIndex === 0 ? `hole-${a}` : `hole-${b}`,
      },
      instruction: `שים את ה${correctShape.name} במקום הנכון`,
      instructionEn: `Put the ${correctShape.nameEn} in the right place`,
    });
  }
  return rounds;
}

function generateAnimalRounds() {
  const environments = [
    { name: 'דשא', nameEn: 'grass', emoji: '🌿', bg: 'bg-green-600', border: 'border-green-400', glow: 'shadow-green-500/50' },
    { name: 'מים', nameEn: 'water', emoji: '🌊', bg: 'bg-blue-600', border: 'border-blue-400', glow: 'shadow-blue-500/50' },
    { name: 'שמיים', nameEn: 'sky', emoji: '☁️', bg: 'bg-sky-500', border: 'border-sky-400', glow: 'shadow-sky-500/50' },
  ];

  const animals = [
    { name: 'אריה', nameEn: 'lion', emoji: '🦁', envIndex: 0 },
    { name: 'פיל', nameEn: 'elephant', emoji: '🐘', envIndex: 0 },
    { name: 'ג\'ירפה', nameEn: 'giraffe', emoji: '🦒', envIndex: 0 },
    { name: 'דג', nameEn: 'fish', emoji: '🐟', envIndex: 1 },
    { name: 'דולפין', nameEn: 'dolphin', emoji: '🐬', envIndex: 1 },
    { name: 'תמנון', nameEn: 'octopus', emoji: '🐙', envIndex: 1 },
    { name: 'ציפור', nameEn: 'bird', emoji: '🐦', envIndex: 2 },
    { name: 'נשר', nameEn: 'eagle', emoji: '🦅', envIndex: 2 },
    { name: 'פרפר', nameEn: 'butterfly', emoji: '🦋', envIndex: 2 },
  ];

  const rounds = [];
  // Create rounds with 2 or 3 containers
  const envPairs = [
    [0, 1], [0, 2], [1, 2], [0, 1], [0, 2],
    [1, 2], [0, 1], [0, 2], [1, 2], [0, 1],
  ];

  for (let i = 0; i < envPairs.length; i++) {
    const [envA, envB] = envPairs[i];
    // Pick a random animal that belongs to one of these environments
    const matchingAnimals = animals.filter(a => a.envIndex === envA || a.envIndex === envB);
    const animal = matchingAnimals[i % matchingAnimals.length];
    const correctEnvIndex = animal.envIndex;
    const correctContainerId = `env-${correctEnvIndex}`;

    rounds.push({
      containers: [
        { id: `env-${envA}`, label: environments[envA].name, color: environments[envA], emoji: environments[envA].emoji },
        { id: `env-${envB}`, label: environments[envB].name, color: environments[envB], emoji: environments[envB].emoji },
      ],
      item: {
        emoji: animal.emoji,
        label: animal.name,
        correctContainerId,
      },
      instruction: `ה${animal.name} חי ב${environments[correctEnvIndex].name} - שים אותו שם!`,
      instructionEn: `The ${animal.nameEn} lives on ${environments[correctEnvIndex].nameEn}, put it there!`,
    });
  }
  return rounds;
}

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

// ============ Wrong-answer sound ============

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
    // Silently fail
  }
};

// ============ Pop Sound ============

const playPopSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch (e) {
    // Silently fail
  }
};

// ============ Main Component ============

const ROUNDS_PER_LEVEL = 8;

const SorterGame = ({ themeId, onBack, triggerConfetti }) => {
  const theme = getTheme(themeId);

  // Game state
  const [currentLevel, setCurrentLevel] = useState(0); // 0 = level select
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [highlightContainer, setHighlightContainer] = useState(null);

  // Drag state (pointer events for touch + mouse)
  const [dragging, setDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const itemRef = useRef(null);
  const containerRefs = useRef({});
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Start a level
  const startLevel = useCallback((levelIndex) => {
    const level = LEVELS[levelIndex - 1];
    // Shuffle and pick ROUNDS_PER_LEVEL rounds
    const shuffled = [...level.rounds].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, ROUNDS_PER_LEVEL);
    setRounds(selected);
    setRoundIndex(0);
    setScore(0);
    setCurrentLevel(levelIndex);
    setGameComplete(false);
    setFeedback(null);
  }, []);

  // Speak instruction when round changes
  useEffect(() => {
    if (currentLevel > 0 && rounds.length > 0 && roundIndex < rounds.length) {
      const round = rounds[roundIndex];
      // Small delay so UI renders first
      const timer = setTimeout(() => {
        speak(round.instruction, 'he-IL');
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentLevel, roundIndex, rounds]);

  // Check if a point is inside a container element
  const getDropTarget = useCallback((x, y) => {
    for (const [id, el] of Object.entries(containerRefs.current)) {
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return id;
      }
    }
    return null;
  }, []);

  // Pointer down on draggable item
  const handlePointerDown = useCallback((e) => {
    if (feedback) return;
    e.preventDefault();
    const el = itemRef.current;
    if (!el) return;
    setDragPos({ x: e.clientX, y: e.clientY });
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
    el.setPointerCapture(e.pointerId);
  }, [feedback]);

  // Pointer move while dragging
  const handlePointerMove = useCallback((e) => {
    if (!dragging) return;
    e.preventDefault();
    setDragPos({ x: e.clientX, y: e.clientY });

    // Highlight container on hover
    const target = getDropTarget(e.clientX, e.clientY);
    setHighlightContainer(target);
  }, [dragging, getDropTarget]);

  // Pointer up - check drop
  const handlePointerUp = useCallback((e) => {
    if (!dragging) return;
    e.preventDefault();
    setDragging(false);
    setHighlightContainer(null);

    const round = rounds[roundIndex];
    if (!round) return;

    const dropTarget = getDropTarget(e.clientX, e.clientY);

    if (dropTarget === round.item.correctContainerId) {
      // Correct!
      setFeedback('correct');
      playPopSound();
      playCheerSound();
      triggerConfetti();
      setScore((prev) => prev + 1);

      setTimeout(() => {
        setFeedback(null);
        if (roundIndex + 1 >= rounds.length) {
          // Level complete
          setGameComplete(true);
          const xpEarned = currentLevel * 15;
          addXP(xpEarned);
          recordGameStats('sorter', rounds.length, score + 1);
          triggerConfetti('big');
        } else {
          setRoundIndex((prev) => prev + 1);
        }
      }, 1200);
    } else if (dropTarget) {
      // Wrong container
      setFeedback('wrong');
      playWrongSound();
      speak('נסה שוב!', 'he-IL');

      setTimeout(() => {
        setFeedback(null);
      }, 800);
    }
    // If dropped nowhere, just snap back (no feedback)
  }, [dragging, rounds, roundIndex, getDropTarget, triggerConfetti, score, currentLevel]);

  // Current round
  const round = rounds[roundIndex];

  // Drag style for the item
  const getDragStyle = () => {
    if (!dragging) return {};
    return {
      position: 'fixed',
      left: dragPos.x - 40,
      top: dragPos.y - 40,
      zIndex: 9999,
      pointerEvents: 'none',
      transform: 'scale(1.2)',
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
          <div className="text-7xl mb-4">🗂️</div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 drop-shadow-2xl">
            המסדר הקטן
          </h1>
          <p className="text-xl text-white/80">בחר שלב ובוא נסדר!</p>
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
            ציון: {score}/{rounds.length}
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
  if (!round) return null;

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
      <div className="w-full max-w-2xl h-3 bg-white/20 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-500"
          style={{ width: `${((roundIndex) / rounds.length) * 100}%` }}
        />
      </div>

      {/* Instruction */}
      <div className="mb-6 text-center">
        <button
          onClick={() => speak(round.instruction, 'he-IL')}
          className={`${theme.cardBg} rounded-2xl px-6 py-4 inline-block cursor-pointer hover:scale-105 transition-all`}
        >
          <p className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 justify-center">
            <span>🔊</span>
            <span>{round.instruction}</span>
          </p>
        </button>
      </div>

      {/* Draggable Item Area */}
      <div className="mb-8 flex justify-center items-center" style={{ minHeight: '100px' }}>
        {feedback === 'correct' ? (
          <div className="text-7xl animate-bounce">✅</div>
        ) : (
          <div
            ref={itemRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={`text-7xl sm:text-8xl cursor-grab active:cursor-grabbing transition-all duration-200
              ${feedback === 'wrong' ? 'animate-bounce-back' : ''}
              ${dragging ? 'opacity-30' : 'hover:scale-110'}
            `}
            style={{ touchAction: 'none' }}
          >
            {round.item.emoji}
          </div>
        )}
      </div>

      {/* Floating drag copy */}
      {dragging && (
        <div style={getDragStyle()} className="text-7xl sm:text-8xl">
          {round.item.emoji}
        </div>
      )}

      {/* Drop hint */}
      <p className="text-white/60 text-lg mb-6 text-center">
        👆 גרור את הפריט לקופסה הנכונה
      </p>

      {/* Containers */}
      <div className="flex gap-6 sm:gap-10 justify-center flex-wrap">
        {round.containers.map((container) => {
          const isHighlighted = highlightContainer === container.id;
          const isCorrectFeedback = feedback === 'correct' && container.id === round.item.correctContainerId;
          const isWrongFeedback = feedback === 'wrong' && highlightContainer === container.id;

          return (
            <div
              key={container.id}
              ref={(el) => { containerRefs.current[container.id] = el; }}
              className={`
                w-36 h-44 sm:w-44 sm:h-52 rounded-3xl flex flex-col items-center justify-center gap-2
                border-4 border-dashed transition-all duration-200
                ${container.color.border}
                ${isHighlighted ? `scale-110 shadow-2xl ${container.color.glow} border-solid bg-white/30` : 'bg-white/10'}
                ${isCorrectFeedback ? 'bg-green-400/40 border-green-400 scale-110 border-solid' : ''}
                ${isWrongFeedback ? 'bg-red-400/40 border-red-400' : ''}
              `}
            >
              <div className="text-5xl sm:text-6xl">{container.emoji}</div>
              <div className={`text-lg sm:text-xl font-bold text-white text-center px-2`}>
                {container.label}
              </div>
              {/* Color indicator strip */}
              <div className={`w-16 h-3 rounded-full ${container.color.bg} opacity-80`} />
            </div>
          );
        })}
      </div>

      {/* Speak again button */}
      <button
        onClick={() => speak(round.instruction, 'he-IL')}
        className="mt-6 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-xl text-white text-lg font-bold transition-all flex items-center gap-2"
      >
        <span>🔊</span>
        <span>השמע שוב</span>
      </button>

      {/* Animations */}
      <style>{`
        @keyframes bounce-back {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-12px); }
          30%, 60%, 90% { transform: translateX(12px); }
        }
        .animate-bounce-back {
          animation: bounce-back 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default SorterGame;
