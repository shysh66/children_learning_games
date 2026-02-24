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

// ============ Plant Data ============

const PLANTS = [
  { name: 'חַמָּנִיָּה', icon: '🌻', color: 'yellow', part: 'flower' },
  { name: 'סַבָּר', icon: '🌵', color: 'green', part: 'stem' },
  { name: 'וֶרֶד', icon: '🌹', color: 'red', part: 'flower' },
  { name: 'צִבְעוֹנִי', icon: '🌷', color: 'red', part: 'flower' },
  { name: 'תִּלְתָּן', icon: '🍀', color: 'green', part: 'leaf' },
  { name: 'עֵץ', icon: '🌳', color: 'green', part: 'leaf' },
  { name: 'אוֹרֶן', icon: '🌲', color: 'green', part: 'leaf' },
  { name: 'עָצִיץ', icon: '🪴', color: 'green', part: 'leaf' },
  { name: 'פֶּרַח', icon: '🌸', color: 'pink', part: 'flower' },
  { name: 'נַרְקִיס', icon: '🌼', color: 'yellow', part: 'flower' },
  { name: 'הִבִּיסְקוּס', icon: '🌺', color: 'red', part: 'flower' },
  { name: 'עֲשָׂבִים', icon: '🌿', color: 'green', part: 'leaf' },
];

// ============ Level Definitions ============

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateLevel1Rounds() {
  // 2 visually distinct plants per round
  const pairs = [
    { target: PLANTS[0], distractor: PLANTS[1] }, // sunflower vs cactus
    { target: PLANTS[2], distractor: PLANTS[6] }, // rose vs pine
    { target: PLANTS[4], distractor: PLANTS[10] }, // clover vs hibiscus
    { target: PLANTS[9], distractor: PLANTS[5] }, // narcissus vs tree
    { target: PLANTS[8], distractor: PLANTS[1] }, // blossom vs cactus
    { target: PLANTS[3], distractor: PLANTS[7] }, // tulip vs potted plant
  ];
  return pairs.map((p) => ({
    target: p.target,
    options: shuffle([p.target, p.distractor]),
    instruction: `מִצְאוּ אֶת הַ${p.target.name}!`,
  }));
}

function generateLevel2Rounds() {
  // 3 plants per round (1 target + 2 distractors)
  const groups = [
    { target: PLANTS[0], distractors: [PLANTS[1], PLANTS[5]] },
    { target: PLANTS[2], distractors: [PLANTS[6], PLANTS[4]] },
    { target: PLANTS[3], distractors: [PLANTS[9], PLANTS[7]] },
    { target: PLANTS[10], distractors: [PLANTS[8], PLANTS[11]] },
    { target: PLANTS[7], distractors: [PLANTS[0], PLANTS[2]] },
    { target: PLANTS[11], distractors: [PLANTS[3], PLANTS[10]] },
  ];
  return groups.map((g) => ({
    target: g.target,
    options: shuffle([g.target, ...g.distractors]),
    instruction: `מִצְאוּ אֶת הַ${g.target.name}!`,
  }));
}

function generateLevel3Rounds() {
  // Identification by parts (leaf) or color family
  const greenLeafPlants = PLANTS.filter((p) => p.part === 'leaf');
  const redFlowerPlants = PLANTS.filter((p) => p.color === 'red' && p.part === 'flower');
  const yellowPlants = PLANTS.filter((p) => p.color === 'yellow');

  return [
    {
      target: greenLeafPlants[0],
      options: shuffle([greenLeafPlants[0], PLANTS[0], PLANTS[2]]),
      instruction: 'מִצְאוּ צֶמַח עִם עָלִים יְרֻקִּים!',
    },
    {
      target: redFlowerPlants[0],
      options: shuffle([redFlowerPlants[0], PLANTS[1], PLANTS[9]]),
      instruction: 'מִצְאוּ פֶּרַח אָדֹם!',
    },
    {
      target: yellowPlants[0],
      options: shuffle([yellowPlants[0], PLANTS[2], PLANTS[1]]),
      instruction: 'מִצְאוּ צֶמַח צָהֹב!',
    },
    {
      target: greenLeafPlants[1],
      options: shuffle([greenLeafPlants[1], PLANTS[10], PLANTS[8]]),
      instruction: 'מִצְאוּ צֶמַח עִם עָלִים יְרֻקִּים!',
    },
    {
      target: redFlowerPlants[1],
      options: shuffle([redFlowerPlants[1], PLANTS[0], PLANTS[7]]),
      instruction: 'מִצְאוּ פֶּרַח אָדֹם!',
    },
    {
      target: yellowPlants[1],
      options: shuffle([yellowPlants[1], PLANTS[10], PLANTS[6]]),
      instruction: 'מִצְאוּ צֶמַח צָהֹב!',
    },
  ];
}

const LEVELS = [
  {
    id: 1,
    name: 'צְמָחִים שׁוֹנִים',
    description: 'זַהוּ בֵּין 2 צְמָחִים',
    icon: '🌱',
    generate: generateLevel1Rounds,
  },
  {
    id: 2,
    name: 'יוֹתֵר צְמָחִים',
    description: 'זַהוּ בֵּין 3 צְמָחִים',
    icon: '🌿',
    generate: generateLevel2Rounds,
  },
  {
    id: 3,
    name: 'לְפִי חֵלֶק אוֹ צֶבַע',
    description: 'זַהוּ לְפִי עָלִים אוֹ צֶבַע',
    icon: '🔍',
    generate: generateLevel3Rounds,
  },
];

const XP_PER_LEVEL = 20;

// ============ Main Component ============

const WildPlantPatrolGame = ({ themeId, onBack, triggerConfetti }) => {
  const theme = getTheme(themeId);

  const [currentLevel, setCurrentLevel] = useState(0);
  const [rounds, setRounds] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [fadedPlants, setFadedPlants] = useState([]);
  const [showCorrect, setShowCorrect] = useState(false);
  const [encourageText, setEncourageText] = useState('');

  const startLevel = useCallback((levelId) => {
    const level = LEVELS[levelId - 1];
    setRounds(level.generate());
    setRoundIndex(0);
    setScore(0);
    setTotalAttempts(0);
    setCurrentLevel(levelId);
    setGameComplete(false);
    setFadedPlants([]);
    setShowCorrect(false);
    setEncourageText('');
  }, []);

  // TTS instruction on each round
  useEffect(() => {
    if (currentLevel > 0 && rounds.length > 0 && roundIndex < rounds.length && !showCorrect) {
      const timer = setTimeout(() => speak(rounds[roundIndex].instruction), 400);
      return () => clearTimeout(timer);
    }
  }, [currentLevel, roundIndex, rounds, showCorrect]);

  const round = rounds[roundIndex];

  const handlePlantClick = (plant) => {
    if (showCorrect || fadedPlants.includes(plant.icon)) return;

    setTotalAttempts((prev) => prev + 1);

    if (plant.icon === round.target.icon) {
      // Correct!
      setShowCorrect(true);
      setScore((prev) => prev + 1);
      setEncourageText('');
      triggerConfetti?.('normal');
      setTimeout(() => speak(round.target.name), 300);

      setTimeout(() => {
        if (roundIndex + 1 >= rounds.length) {
          setGameComplete(true);
          addXP(XP_PER_LEVEL);
          recordGameStats('wildPlantPatrol', totalAttempts + 1, score + 1);
          triggerConfetti?.('big');
        } else {
          setRoundIndex((prev) => prev + 1);
          setFadedPlants([]);
          setShowCorrect(false);
          setEncourageText('');
        }
      }, 2000);
    } else {
      // Wrong - fade the plant out
      playOopsSound();
      setFadedPlants((prev) => [...prev, plant.icon]);
      setEncourageText('נַסּוּ שׁוּב!');
      setTimeout(() => speak('נַסּוּ שׁוּב'), 200);
    }
  };

  // ============ Level Select ============
  if (currentLevel === 0) {
    return (
      <div className={`min-h-screen ${theme.bg} flex flex-col items-center justify-center p-6 ${theme.font}`} dir="rtl">
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">🌿</div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 drop-shadow-2xl">סַיֶּרֶת צִמְחֵי הַבָּר</h1>
          <p className="text-xl text-white/80">זַהוּ אֶת הַצְּמָחִים בַּטֶּבַע!</p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-md">
          {LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => startLevel(level.id)}
              data-testid={`level-${level.id}`}
              className={`${theme.cardBg} rounded-3xl p-6 text-right transition-all duration-300 hover:scale-105 hover:shadow-xl`}
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">{level.icon}</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">שָׁלָב {level.id}: {level.name}</h2>
                  <p className="text-white/70 text-lg">{level.description}</p>
                </div>
                <div className="text-3xl text-white/60">←</div>
              </div>
            </button>
          ))}
        </div>

        <button onClick={onBack} className="mt-8 px-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-xl font-bold transition-all">
          ← חֲזָרָה
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
          <h1 className="text-5xl font-black text-white mb-4">כָּל הַכָּבוֹד!</h1>
          <p className="text-2xl text-white/90 mb-2">סִיַּמְתֶּם אֶת שָׁלָב {currentLevel}: {LEVELS[currentLevel - 1].name}</p>
          <p className="text-xl text-white/70 mb-4">צִיּוּן: {score}/{rounds.length}</p>
          <div className="text-3xl text-yellow-300 font-bold mb-8">+{XP_PER_LEVEL} XP</div>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => startLevel(currentLevel)} className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-2xl text-white text-xl font-bold transition-all">
              שַׂחֲקוּ שׁוּב 🔄
            </button>
            {currentLevel < LEVELS.length && (
              <button onClick={() => startLevel(currentLevel + 1)} data-testid="next-level-btn" className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 rounded-2xl text-white text-xl font-bold transition-all">
                שָׁלָב הַבָּא ⭐
              </button>
            )}
            <button onClick={() => setCurrentLevel(0)} className="px-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-xl font-bold transition-all">
              בְּחִירַת שָׁלָב 📋
            </button>
            <button onClick={onBack} className="px-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-xl font-bold transition-all">
              חֲזָרָה ←
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
        <button onClick={onBack} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white font-bold transition-all">← חֲזָרָה</button>
        <div className="text-white/80 font-bold text-lg">{roundIndex + 1} / {rounds.length}</div>
        <div className="text-white font-bold text-lg">⭐ {score}</div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-2xl h-3 bg-white/20 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${(roundIndex / rounds.length) * 100}%` }} />
      </div>

      {/* Instruction */}
      <button onClick={() => speak(round.instruction)} className="mb-6 flex items-center gap-2">
        <span className="text-2xl sm:text-3xl font-bold text-white">{round.instruction}</span>
        <span className="text-2xl">🔊</span>
      </button>

      {/* Plants grid */}
      <div className={`grid ${round.options.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-5 sm:gap-8 mb-6`}>
        {round.options.map((plant, idx) => {
          const isFaded = fadedPlants.includes(plant.icon);
          const isCorrectShown = showCorrect && plant.icon === round.target.icon;

          let cls = `${theme.cardBg} hover:scale-105 cursor-pointer`;
          if (isCorrectShown) cls = 'bg-green-500 scale-110 ring-8 ring-green-300';
          else if (isFaded) cls = `${theme.cardBg} opacity-50 cursor-not-allowed`;

          return (
            <button
              key={idx}
              onClick={() => handlePlantClick(plant)}
              disabled={showCorrect || isFaded}
              data-testid={`plant-option-${idx}`}
              data-plant={plant.icon}
              className={`w-28 h-28 sm:w-36 sm:h-36 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 transform ${cls} ${showCorrect || isFaded ? 'cursor-not-allowed' : ''}`}
            >
              <span className="text-6xl sm:text-7xl">{plant.icon}</span>
              <span className="text-sm sm:text-base font-bold text-white mt-1">{plant.name}</span>
            </button>
          );
        })}
      </div>

      {/* Encouragement text */}
      {encourageText && !showCorrect && (
        <div data-testid="encourage-text" className={`${theme.cardBg} rounded-2xl px-6 py-4 text-center animate-bounce`}>
          <p className="text-xl font-bold text-white">{encourageText}</p>
        </div>
      )}

      {/* Correct answer feedback */}
      {showCorrect && (
        <div className={`${theme.cardBg} rounded-2xl px-6 py-4 text-center`}>
          <p className="text-xl font-bold text-white">מְצֻיָּן! זֶה {round.target.name}! 🌟</p>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default WildPlantPatrolGame;
