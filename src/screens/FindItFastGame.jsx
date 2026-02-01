import React, { useState, useEffect, useCallback } from 'react';
import { getRandomWords, speakWord } from '../data/englishWords';
import { getTheme } from '../data/themes';
import { addXP } from '../utils/storage';
import { playCheerSound } from '../utils/sounds';

// Find it Fast Game - Listen and find the correct emoji
const FindItFastGame = ({ themeId, onBack, onComplete, triggerConfetti }) => {
  const theme = getTheme(themeId);
  const [items, setItems] = useState([]);
  const [currentTarget, setCurrentTarget] = useState(null);
  const [found, setFound] = useState([]);
  const [shake, setShake] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Initialize game
  const initGame = useCallback(() => {
    const words = getRandomWords(12); // 12 items to find
    setItems(words);
    setTotalItems(words.length);
    setFound([]);
    setScore(0);
    setGameComplete(false);

    // Set first target after a short delay
    setTimeout(() => {
      setCurrentTarget(words[0]);
      speakWord(`Find the ${words[0].word}`);
    }, 500);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Speak current target
  const speakCurrentTarget = () => {
    if (currentTarget) {
      speakWord(`Find the ${currentTarget.word}`);
    }
  };

  // Handle emoji click
  const handleItemClick = (item) => {
    if (gameComplete) return;
    if (found.includes(item.word)) return;

    if (item.word === currentTarget?.word) {
      // Correct!
      playCheerSound();
      triggerConfetti();
      speakWord('Correct!');

      const newFound = [...found, item.word];
      setFound(newFound);
      setScore((prev) => prev + 1);

      // Find next target
      const remaining = items.filter((i) => !newFound.includes(i.word));

      if (remaining.length === 0) {
        // Game complete!
        setTimeout(() => {
          setGameComplete(true);
          addXP(50);
          triggerConfetti('big');
        }, 500);
      } else {
        // Move to next target
        setTimeout(() => {
          const nextTarget = remaining[0];
          setCurrentTarget(nextTarget);
          speakWord(`Find the ${nextTarget.word}`);
        }, 800);
      }
    } else {
      // Wrong!
      setShake(item.word);
      speakWord('Try again');

      setTimeout(() => {
        setShake(null);
      }, 500);
    }
  };

  if (gameComplete) {
    return (
      <div
        className={`min-h-screen ${theme.bg} flex items-center justify-center p-8`}
        dir="rtl"
      >
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">🏆</div>
          <h1 className="text-5xl font-black text-white mb-4">מדהים!</h1>
          <p className="text-2xl text-white/90 mb-2">מצאת את כל התמונות!</p>
          <p className="text-xl text-white/70 mb-8">ציון: {score}/{totalItems}</p>
          <div className="text-3xl text-yellow-300 font-bold mb-8">+50 XP</div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={initGame}
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

  return (
    <div
      className={`min-h-screen ${theme.bg} flex flex-col items-center p-4`}
      dir="rtl"
    >
      {/* Header with current target */}
      <div className="text-center mb-6 mt-4">
        <h1 className="text-3xl font-black text-white mb-2">🔍 מצא את התמונה!</h1>

        {currentTarget && (
          <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4 inline-block">
            <p className="text-lg text-white/70 mb-1">הקשב ומצא:</p>
            <button
              onClick={speakCurrentTarget}
              className="text-4xl font-black text-yellow-300 hover:scale-110 transition-transform"
            >
              🔊 {currentTarget.word}
            </button>
          </div>
        )}

        <div className="mt-3 text-white/70">
          נמצאו: {found.length}/{totalItems}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-w-2xl px-2">
        {items.map((item, index) => {
          const isFound = found.includes(item.word);
          const isShaking = shake === item.word;

          return (
            <button
              key={`${item.word}-${index}`}
              onClick={() => handleItemClick(item)}
              disabled={isFound}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl text-4xl sm:text-5xl transition-all duration-300 ${
                isFound
                  ? 'bg-green-400/30 scale-75 opacity-40'
                  : 'bg-white/20 hover:bg-white/40 hover:scale-110 cursor-pointer'
              } ${isShaking ? 'animate-shake bg-red-400/50' : ''}`}
              style={{
                animation: isShaking ? 'shake 0.5s ease-in-out' : undefined,
              }}
            >
              {item.emoji}
            </button>
          );
        })}
      </div>

      {/* Speak button */}
      <button
        onClick={speakCurrentTarget}
        className="mt-6 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-xl text-white text-lg font-bold transition-all flex items-center gap-2"
      >
        <span>🔊</span>
        <span>השמע שוב</span>
      </button>

      {/* Back button */}
      <button
        onClick={onBack}
        className="mt-4 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl text-white text-lg font-bold transition-all"
      >
        ← חזרה
      </button>

      {/* Shake animation keyframes */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default FindItFastGame;
