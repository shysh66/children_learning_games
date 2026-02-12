import React, { useState, useCallback } from 'react';
import { getTheme } from '../data/themes';
import { addXP, recordGameStats } from '../utils/storage';
import { playOopsSound } from '../utils/sounds';

// ============ Robot Painter Data ============

const PAINTER_SCENARIOS = [
  {
    id: 1,
    description: 'ציירו כלב שאוכל גלידה בחוף הים',
    tags: [
      { id: 'dog', label: 'כלב', emoji: '🐕' },
      { id: 'beach', label: 'חוף הים', emoji: '🏖️' },
      { id: 'icecream', label: 'גלידה', emoji: '🍦' },
    ],
    results: {
      0: { image: '❓', text: 'לא בחרתם כלום! הרובוט לא יודע מה לצייר.' },
      1: { image: '🐕', text: 'לא מספיק מדויק! הרובוט צייר רק כלב.' },
      2: { image: '🐕🏖️', text: 'כמעט! חסר פרט אחד.' },
      3: { image: '🐕🍦🏖️', text: '🎉 מושלם! הוראה מדויקת = תוצאה מדויקת!' },
    },
  },
  {
    id: 2,
    description: 'ציירו חתול ישן על ספה ליד חלון',
    tags: [
      { id: 'cat', label: 'חתול', emoji: '🐱' },
      { id: 'sofa', label: 'ספה', emoji: '🛋️' },
      { id: 'window', label: 'חלון', emoji: '🪟' },
    ],
    results: {
      0: { image: '❓', text: 'לא בחרתם כלום! הרובוט מבולבל.' },
      1: { image: '🐱', text: 'לא מספיק! הרובוט צייר רק חתול.' },
      2: { image: '🐱🛋️', text: 'כמעט שם! חסר עוד פרט.' },
      3: { image: '🐱🛋️🪟', text: '🎉 הוראה מעולה! הרובוט הבין בדיוק!' },
    },
  },
  {
    id: 3,
    description: 'ציירו רקדנית עם שמלה אדומה על במה',
    tags: [
      { id: 'dancer', label: 'רקדנית', emoji: '💃' },
      { id: 'dress', label: 'שמלה אדומה', emoji: '👗' },
      { id: 'stage', label: 'במה', emoji: '🎭' },
    ],
    results: {
      0: { image: '❓', text: 'הרובוט לא קיבל הוראות!' },
      1: { image: '💃', text: 'מעט מדי פרטים. הרובוט צייר רק רקדנית.' },
      2: { image: '💃👗', text: 'כמעט! איפה הבמה?' },
      3: { image: '💃👗🎭', text: '🎉 פרומפט מושלם! התוצאה בדיוק כמו שרציתם!' },
    },
  },
];

// ============ Truth or Glitch Data ============

const TRUTH_GLITCH_ITEMS = [
  {
    id: 1,
    statement: 'חתולים אוהבים חלב.',
    isTrue: true,
    explanation: 'נכון! חתולים רבים באמת אוהבים חלב.',
    icon: '🐱',
  },
  {
    id: 2,
    statement: 'פילים יכולים לעוף בעזרת האוזניים שלהם.',
    isTrue: false,
    explanation: 'באג! AI יכול לדמיין דברים שלא קיימים במציאות. פילים לא יכולים לעוף!',
    icon: '🐘',
  },
  {
    id: 3,
    statement: 'השמש זורחת בלילה.',
    isTrue: false,
    explanation: 'באג! השמש זורחת ביום. AI לפעמים מבלבל עובדות פשוטות.',
    icon: '🌙',
  },
  {
    id: 4,
    statement: 'דגים חיים במים.',
    isTrue: true,
    explanation: 'נכון! דגים באמת חיים במים.',
    icon: '🐟',
  },
  {
    id: 5,
    statement: 'עצים יכולים ללכת ממקום למקום.',
    isTrue: false,
    explanation: 'באג! עצים מושרשים באדמה ולא יכולים ללכת. AI המציא את זה!',
    icon: '🌳',
  },
  {
    id: 6,
    statement: 'גשם יורד מהעננים.',
    isTrue: true,
    explanation: 'נכון! גשם באמת יורד מהעננים.',
    icon: '🌧️',
  },
  {
    id: 7,
    statement: 'תותים הם ירקות שגדלים מתחת לאדמה.',
    isTrue: false,
    explanation: 'באג! תותים הם פירות שגדלים מעל האדמה. AI טעה!',
    icon: '🍓',
  },
  {
    id: 8,
    statement: 'ציפורים בונות קנים על עצים.',
    isTrue: true,
    explanation: 'נכון! ציפורים רבות בונות קנים על ענפי עצים.',
    icon: '🐦',
  },
];

// ============ Main Component ============

const RobotLabGame = ({ themeId, onBack, triggerConfetti }) => {
  const theme = getTheme(themeId);

  // Game state
  const [miniGame, setMiniGame] = useState(null); // null = menu, 'painter', 'truthGlitch'
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  // Painter state
  const [painterRound, setPainterRound] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [painterSubmitted, setPainterSubmitted] = useState(false);

  // Truth/Glitch state
  const [truthRound, setTruthRound] = useState(0);
  const [truthAnswered, setTruthAnswered] = useState(false);
  const [truthCorrect, setTruthCorrect] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);

  // ============ Painter Handlers ============

  const toggleTag = useCallback((tagId) => {
    if (painterSubmitted) return;
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  }, [painterSubmitted]);

  const submitPainterPrompt = useCallback(() => {
    setPainterSubmitted(true);
    setTotalAnswered(prev => prev + 1);
    const scenario = PAINTER_SCENARIOS[painterRound];
    const count = selectedTags.length;

    if (count === scenario.tags.length) {
      triggerConfetti('normal');
      setScore(prev => prev + 1);
      addXP(15);
    }
  }, [painterRound, selectedTags, triggerConfetti]);

  const nextPainterRound = useCallback(() => {
    if (painterRound < PAINTER_SCENARIOS.length - 1) {
      setPainterRound(prev => prev + 1);
      setSelectedTags([]);
      setPainterSubmitted(false);
    } else {
      setGameComplete(true);
      triggerConfetti('big');
      recordGameStats('robotLab', score, totalAnswered);
    }
  }, [painterRound, triggerConfetti, score, totalAnswered]);

  // ============ Truth/Glitch Handlers ============

  const handleTruthGlitch = useCallback((userSaysTrue) => {
    if (truthAnswered) return;

    setTruthAnswered(true);
    setTotalAnswered(prev => prev + 1);

    const item = TRUTH_GLITCH_ITEMS[truthRound];
    const correct = userSaysTrue === item.isTrue;
    setTruthCorrect(correct);

    if (correct) {
      triggerConfetti('normal');
      setScore(prev => prev + 1);
      addXP(15);
    } else {
      playOopsSound();
    }
  }, [truthAnswered, truthRound, triggerConfetti]);

  const nextTruthRound = useCallback(() => {
    if (truthRound < TRUTH_GLITCH_ITEMS.length - 1) {
      setTruthRound(prev => prev + 1);
      setTruthAnswered(false);
      setTruthCorrect(null);
    } else {
      setGameComplete(true);
      triggerConfetti('big');
      recordGameStats('robotLab', score, totalAnswered);
    }
  }, [truthRound, triggerConfetti, score, totalAnswered]);

  // ============ Navigation ============

  const startPainter = useCallback(() => {
    setMiniGame('painter');
    setPainterRound(0);
    setSelectedTags([]);
    setPainterSubmitted(false);
    setScore(0);
    setTotalAnswered(0);
    setGameComplete(false);
  }, []);

  const startTruthGlitch = useCallback(() => {
    setMiniGame('truthGlitch');
    setTruthRound(0);
    setTruthAnswered(false);
    setTruthCorrect(null);
    setScore(0);
    setTotalAnswered(0);
    setGameComplete(false);
  }, []);

  const handleBackToMenu = useCallback(() => {
    setMiniGame(null);
    setScore(0);
    setTotalAnswered(0);
    setGameComplete(false);
  }, []);

  // ============ Render: Game Complete ============

  if (gameComplete) {
    const earnedXP = score * 15;
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-4`} dir="rtl">
        <div className={`${theme.cardBg} rounded-3xl p-10 max-w-lg w-full text-center`}>
          <div className="text-8xl mb-4">🤖</div>
          <h2 className="text-4xl font-black text-white mb-4">כל הכבוד!</h2>
          <p className="text-2xl text-white/90 mb-2">
            {score} מתוך {totalAnswered} נכון
          </p>
          <p className={`text-xl ${theme.accent} mb-8`}>+{earnedXP} XP</p>
          <div className="space-y-3">
            <button
              onClick={miniGame === 'painter' ? startPainter : startTruthGlitch}
              className={`${theme.primary} w-full px-6 py-4 rounded-2xl text-white text-xl font-bold transition-all`}
            >
              🔄 שחקו שוב
            </button>
            <button
              onClick={handleBackToMenu}
              className="w-full px-6 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-xl font-bold transition-all"
            >
              ← תפריט ראשי
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ Render: Main Menu ============

  if (miniGame === null) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-4`} dir="rtl">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <div className="text-8xl mb-4">🤖</div>
            <h1 className="text-5xl font-black text-white mb-3 drop-shadow-lg">הרובוט שלי</h1>
            <p className="text-xl text-white/80">למדו איך לדבר עם רובוטים חכמים!</p>
          </div>

          <div className="space-y-5">
            <button
              onClick={startPainter}
              className={`${theme.cardBg} w-full rounded-3xl p-8 transform transition-all duration-300 hover:scale-105 text-right`}
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">🎨</div>
                <div>
                  <div className="text-3xl font-black text-white mb-1">הצייר</div>
                  <div className="text-lg text-white/70">תנו הוראות מדויקות לרובוט הצייר</div>
                </div>
              </div>
            </button>

            <button
              onClick={startTruthGlitch}
              className={`${theme.cardBg} w-full rounded-3xl p-8 transform transition-all duration-300 hover:scale-105 text-right`}
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">🐛</div>
                <div>
                  <div className="text-3xl font-black text-white mb-1">אמת או באג?</div>
                  <div className="text-lg text-white/70">האם הרובוט צודק או מבולבל?</div>
                </div>
              </div>
            </button>
          </div>

          <button
            onClick={onBack}
            className="mx-auto block mt-8 px-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-xl font-bold transition-all"
          >
            ← חזרה
          </button>
        </div>
      </div>
    );
  }

  // ============ Render: Robot Painter ============

  if (miniGame === 'painter') {
    const scenario = PAINTER_SCENARIOS[painterRound];
    const count = selectedTags.length;
    const result = painterSubmitted ? scenario.results[count] : null;
    const isPerfect = count === scenario.tags.length;

    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-4`} dir="rtl">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBackToMenu}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white font-bold transition-all"
            >
              ← חזרה
            </button>
            <div className="text-white font-bold text-lg">
              🎨 הצייר - {painterRound + 1}/{PAINTER_SCENARIOS.length}
            </div>
            <div className={`${theme.accent} font-bold text-lg`}>⭐ {score}</div>
          </div>

          {/* Task */}
          <div className={`${theme.cardBg} rounded-3xl p-6 mb-5`}>
            <div className="text-white/60 text-sm mb-2">🤖 הרובוט מבקש:</div>
            <p className="text-white text-2xl font-bold">{scenario.description}</p>
          </div>

          {/* Tags */}
          <div className={`${theme.cardBg} rounded-3xl p-6 mb-5`}>
            <h3 className="text-xl font-bold text-white mb-4">בחרו מילות מפתח להוראה:</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {scenario.tags.map(tag => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    disabled={painterSubmitted}
                    className={`px-5 py-3 rounded-2xl text-xl font-bold transition-all duration-300 ${
                      isSelected
                        ? 'bg-green-500 text-white scale-110 ring-4 ring-green-300'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    } ${painterSubmitted ? 'opacity-60' : ''}`}
                  >
                    {tag.emoji} {tag.label}
                  </button>
                );
              })}
            </div>

            {!painterSubmitted && (
              <button
                onClick={submitPainterPrompt}
                className={`${theme.primary} w-full mt-5 px-6 py-4 rounded-2xl text-white text-xl font-bold transition-all hover:scale-105`}
              >
                🚀 שלח הוראה לרובוט!
              </button>
            )}
          </div>

          {/* Result */}
          {painterSubmitted && result && (
            <div className={`${theme.cardBg} rounded-3xl p-6 text-center`}>
              <div className="text-7xl mb-4 tracking-widest">{result.image}</div>
              <p className={`text-xl font-bold mb-4 ${isPerfect ? 'text-green-400' : 'text-yellow-300'}`}>
                {result.text}
              </p>
              <button
                onClick={nextPainterRound}
                className={`${theme.primary} px-8 py-3 rounded-2xl text-white text-xl font-bold transition-all hover:scale-105`}
              >
                {painterRound === PAINTER_SCENARIOS.length - 1 ? '🏆 סיום' : 'הבא →'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============ Render: Truth or Glitch ============

  if (miniGame === 'truthGlitch') {
    const item = TRUTH_GLITCH_ITEMS[truthRound];

    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-4`} dir="rtl">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBackToMenu}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white font-bold transition-all"
            >
              ← חזרה
            </button>
            <div className="text-white font-bold text-lg">
              🐛 אמת או באג? - {truthRound + 1}/{TRUTH_GLITCH_ITEMS.length}
            </div>
            <div className={`${theme.accent} font-bold text-lg`}>⭐ {score}</div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/20 rounded-full h-3 mb-6">
            <div
              className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${((truthRound + 1) / TRUTH_GLITCH_ITEMS.length) * 100}%` }}
            />
          </div>

          {/* Robot Statement */}
          <div className={`${theme.cardBg} rounded-3xl p-8 mb-6 text-center`}>
            <div className="text-7xl mb-4">{item.icon}</div>
            <div className="text-white/60 text-sm mb-3">🤖 הרובוט אומר:</div>
            <p className="text-white text-3xl font-black leading-relaxed">
              &ldquo;{item.statement}&rdquo;
            </p>
          </div>

          {/* Buttons */}
          {!truthAnswered && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleTruthGlitch(true)}
                className="bg-green-500 hover:bg-green-400 p-6 rounded-3xl text-white text-2xl font-black transition-all hover:scale-105"
              >
                ✅ אמת!
              </button>
              <button
                onClick={() => handleTruthGlitch(false)}
                className="bg-red-500 hover:bg-red-400 p-6 rounded-3xl text-white text-2xl font-black transition-all hover:scale-105"
              >
                🐛 באג!
              </button>
            </div>
          )}

          {/* Feedback */}
          {truthAnswered && (
            <div className={`${theme.cardBg} rounded-3xl p-6 text-center`}>
              <div className={`text-2xl font-black mb-3 ${truthCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {truthCorrect ? '🎉 נכון!' : '❌ לא בדיוק...'}
              </div>
              <p className="text-white/90 text-lg mb-5 leading-relaxed">
                {item.explanation}
              </p>
              <button
                onClick={nextTruthRound}
                className={`${theme.primary} px-8 py-3 rounded-2xl text-white text-xl font-bold transition-all hover:scale-105`}
              >
                {truthRound === TRUTH_GLITCH_ITEMS.length - 1 ? '🏆 סיום' : 'הבא →'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default RobotLabGame;
