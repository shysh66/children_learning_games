import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getTheme } from '../data/themes';
import { addXP, recordGameStats } from '../utils/storage';
import { playCheerSound, playOopsSound } from '../utils/sounds';
import { speakWord } from '../data/englishWords';
import levelsConfig from '../data/levels_config.json';

// Fallback color palette keyed by lowercase word name
const FALLBACK_COLORS = {
  dog: 'bg-amber-300',
  cat: 'bg-orange-300',
  bird: 'bg-sky-300',
  cow: 'bg-lime-300',
  red: 'bg-red-400',
  blue: 'bg-blue-400',
  green: 'bg-green-400',
  yellow: 'bg-yellow-300',
  one: 'bg-purple-300',
  two: 'bg-pink-300',
  three: 'bg-teal-300',
  four: 'bg-orange-400',
};

// Build a lookup from image path → word name for fallback display
const buildImageToWord = (words) => {
  const map = {};
  for (const w of words) {
    map[w.image] = w.word;
    for (const d of w.distractors) {
      if (!map[d]) {
        // Extract name from path: /assets/images/dog.png → Dog
        const match = d.match(/\/([^/]+)\.png$/);
        if (match) {
          map[d] = match[1].charAt(0).toUpperCase() + match[1].slice(1);
        }
      }
    }
  }
  return map;
};

// Get fallback color for an image path
const getFallbackColor = (src) => {
  const match = src.match(/\/([^/]+)\.png$/);
  if (match) {
    return FALLBACK_COLORS[match[1]] || 'bg-purple-300';
  }
  return 'bg-purple-300';
};

// Fisher-Yates shuffle (works for any array length)
const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const AuditoryMatchGame = ({ themeId, onBack, triggerConfetti, levelId = 1 }) => {
  const theme = getTheme(themeId);

  // Resolve level config
  const levelConfig = useMemo(() => {
    return levelsConfig.find((l) => l.level_id === levelId) || levelsConfig[0];
  }, [levelId]);

  const words = levelConfig.words;
  const optionsCount = levelConfig.settings.options_count;
  const total = words.length;

  const imageToWord = useMemo(() => buildImageToWord(words), [words]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const [selectedSrc, setSelectedSrc] = useState(null);
  const [imgErrors, setImgErrors] = useState({});
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);

  const currentItem = words[currentIndex];

  // Speak the current word using Web Speech Synthesis API
  const playAudio = useCallback(() => {
    if (!currentItem) return;
    speakWord(currentItem.word);
  }, [currentItem]);

  // Build and shuffle the options for the current turn
  const buildShuffledOptions = useCallback(() => {
    if (!currentItem) return;
    const distractors = currentItem.distractors.slice(0, optionsCount - 1);
    const options = [
      { src: currentItem.image, isCorrect: true },
      ...distractors.map((d) => ({ src: d, isCorrect: false })),
    ];
    setShuffledOptions(shuffleArray(options));
  }, [currentItem, optionsCount]);

  // On mount and each new turn: shuffle options and play audio
  useEffect(() => {
    if (gameComplete) return;
    setFeedback(null);
    setSelectedSrc(null);
    buildShuffledOptions();
    const timer = setTimeout(() => {
      playAudio();
    }, 400);
    return () => clearTimeout(timer);
  }, [currentIndex, gameComplete, buildShuffledOptions, playAudio]);

  // Handle image click
  const handleImageClick = (item) => {
    if (feedback) return;

    setSelectedSrc(item.src);

    if (item.isCorrect) {
      setFeedback('correct');
      playCheerSound();
      triggerConfetti();
      setScore((prev) => prev + 1);

      setTimeout(() => {
        if (currentIndex + 1 < total) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setGameComplete(true);
          addXP(50);
          recordGameStats('english', total, score + 1);
          triggerConfetti('big');
        }
      }, 1500);
    } else {
      setFeedback('wrong');
      playOopsSound();

      setTimeout(() => {
        setFeedback(null);
        setSelectedSrc(null);
      }, 800);
    }
  };

  const handleImgError = (src) => {
    setImgErrors((prev) => ({ ...prev, [src]: true }));
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setShuffledOptions([]);
    setFeedback(null);
    setSelectedSrc(null);
    setImgErrors({});
    setGameComplete(false);
    setScore(0);
  };

  // --- Completion Screen ---
  if (gameComplete) {
    return (
      <div
        className={`min-h-screen ${theme.bg} flex items-center justify-center p-8`}
      >
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">🏆</div>
          <h1 className="text-6xl font-black text-white mb-4">Good Job!</h1>
          <p className="text-2xl text-white/90 mb-2">
            You matched all the words!
          </p>
          <p className="text-xl text-white/70 mb-8">
            Score: {score}/{total}
          </p>
          <div className="text-3xl text-yellow-300 font-bold mb-8">+50 XP</div>

          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={resetGame}
              className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-2xl text-white text-xl font-bold transition-all hover:scale-105 active:scale-95"
            >
              Play Again
            </button>
            <button
              onClick={onBack}
              className="px-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-xl font-bold transition-all hover:scale-105 active:scale-95"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Dynamic grid classes based on options_count ---
  const is4Cards = optionsCount === 4;
  const gridClasses = is4Cards
    ? 'grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-xl px-2'
    : 'flex gap-4 sm:gap-8 justify-center w-full max-w-2xl px-2';
  const cardMaxWidth = is4Cards ? 'max-w-[220px]' : 'max-w-[280px]';
  const fallbackTextSize = is4Cards
    ? 'text-3xl sm:text-4xl'
    : 'text-4xl sm:text-5xl';

  // --- Game Screen ---
  return (
    <div
      className={`min-h-screen ${theme.bg} flex flex-col items-center justify-center p-4`}
    >
      {/* Header: back button + progress */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="px-5 py-3 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-lg font-bold transition-all"
        >
          Back
        </button>
        <div className="bg-white/20 backdrop-blur-md rounded-full px-6 py-2">
          <span className="text-white font-bold text-lg">
            {currentIndex + 1} / {total}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-2xl mb-8">
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentIndex / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Play Sound Button */}
      <button
        onClick={playAudio}
        className={`${is4Cards ? 'mb-6 w-24 h-24 sm:w-28 sm:h-28' : 'mb-10 w-28 h-28 sm:w-32 sm:h-32'} rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg hover:shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95`}
        aria-label="Play sound again"
      >
        <span className={`${is4Cards ? 'text-4xl sm:text-5xl' : 'text-5xl sm:text-6xl'}`}>🔊</span>
      </button>

      {/* Image Cards — dynamic 2-card or 4-card layout */}
      <div className={gridClasses}>
        {shuffledOptions.map((item, index) => {
          const isSelected = selectedSrc === item.src;
          const isCorrectFeedback = isSelected && feedback === 'correct';
          const isWrongFeedback = isSelected && feedback === 'wrong';
          const hasError = imgErrors[item.src];

          return (
            <button
              key={`${currentItem.id}-${index}`}
              onClick={() => handleImageClick(item)}
              disabled={feedback === 'correct'}
              className={`
                relative ${is4Cards ? 'w-full' : 'flex-1'} aspect-square ${cardMaxWidth} rounded-3xl shadow-lg
                transition-all duration-200 cursor-pointer overflow-hidden
                bg-white/90 backdrop-blur-sm
                hover:shadow-2xl hover:scale-105 active:scale-95
                ${isCorrectFeedback ? 'border-[6px] border-green-400 ring-4 ring-green-300/50 animate-game-bounce' : ''}
                ${isWrongFeedback ? 'border-[6px] border-red-400 ring-4 ring-red-300/50 animate-game-shake' : ''}
                ${!isSelected || !feedback ? 'border-4 border-transparent' : ''}
                ${feedback === 'correct' && !isSelected ? 'opacity-50 scale-90' : ''}
              `}
            >
              {hasError ? (
                <div
                  className={`w-full h-full flex items-center justify-center rounded-3xl ${getFallbackColor(item.src)}`}
                >
                  <span className={`${fallbackTextSize} font-black text-white drop-shadow-lg select-none`}>
                    {imageToWord[item.src] || '?'}
                  </span>
                </div>
              ) : (
                <img
                  src={item.src}
                  alt=""
                  draggable={false}
                  className="w-full h-full object-cover rounded-3xl select-none"
                  onError={() => handleImgError(item.src)}
                />
              )}

              {/* Success overlay */}
              {isCorrectFeedback && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-400/20 rounded-3xl">
                  <span className="text-6xl sm:text-7xl drop-shadow-lg">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* "Play Sound Again" text hint */}
      <p className="mt-8 text-white/50 text-base font-medium">
        Tap the speaker to hear the word again
      </p>

      {/* Keyframe animations */}
      <style>{`
        @keyframes game-shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        @keyframes game-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .animate-game-shake {
          animation: game-shake 0.5s ease-in-out;
        }
        .animate-game-bounce {
          animation: game-bounce 0.6s ease-in-out 2;
        }
      `}</style>
    </div>
  );
};

export default AuditoryMatchGame;
