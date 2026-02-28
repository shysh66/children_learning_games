import React, { useState, useEffect, useCallback } from 'react';
import { getTheme } from '../data/themes';
import { addXP, recordGameStats } from '../utils/storage';
import { playCheerSound, playOopsSound } from '../utils/sounds';
import { speakWord } from '../data/englishWords';

// Mock data for Level 1 — Auditory Match Game
const MOCK_DATA = [
  {
    id: 'word_dog',
    word: 'Dog',
    image: '/assets/images/dog.png',
    distractor_image: '/assets/images/cat.png',
  },
  {
    id: 'word_cat',
    word: 'Cat',
    image: '/assets/images/cat.png',
    distractor_image: '/assets/images/bird.png',
  },
  {
    id: 'word_bird',
    word: 'Bird',
    image: '/assets/images/bird.png',
    distractor_image: '/assets/images/cow.png',
  },
  {
    id: 'word_cow',
    word: 'Cow',
    image: '/assets/images/cow.png',
    distractor_image: '/assets/images/dog.png',
  },
];

// Fallback colors for when images fail to load
const FALLBACK_COLORS = {
  '/assets/images/dog.png': 'bg-amber-300',
  '/assets/images/cat.png': 'bg-orange-300',
  '/assets/images/bird.png': 'bg-sky-300',
  '/assets/images/cow.png': 'bg-lime-300',
};

// Helper to get the word label for a given image path (for fallback display)
const getWordForImage = (src) => {
  for (const item of MOCK_DATA) {
    if (item.image === src) return item.word;
    if (item.distractor_image === src) {
      const match = MOCK_DATA.find((d) => d.image === src);
      if (match) return match.word;
    }
  }
  return '?';
};

const AuditoryMatchGame = ({ themeId, onBack, triggerConfetti }) => {
  const theme = getTheme(themeId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledPair, setShuffledPair] = useState([]);
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const [selectedSrc, setSelectedSrc] = useState(null);
  const [imgErrors, setImgErrors] = useState({});
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);
  const currentItem = MOCK_DATA[currentIndex];
  const total = MOCK_DATA.length;

  // Speak the current word using the Web Speech API
  const playAudio = useCallback(() => {
    if (!currentItem) return;
    speakWord(currentItem.word);
  }, [currentItem]);

  // Shuffle the pair of images for the current turn
  const buildShuffledPair = useCallback(() => {
    if (!currentItem) return;
    const pair = [
      { src: currentItem.image, isCorrect: true },
      { src: currentItem.distractor_image, isCorrect: false },
    ];
    // Fisher-Yates shuffle for 2 items (coin flip)
    if (Math.random() < 0.5) {
      pair.reverse();
    }
    setShuffledPair(pair);
  }, [currentItem]);

  // On mount and each new turn: shuffle images and play audio
  useEffect(() => {
    if (gameComplete) return;
    setFeedback(null);
    setSelectedSrc(null);
    buildShuffledPair();
    // Short delay so the UI renders before audio plays
    const timer = setTimeout(() => {
      playAudio();
    }, 400);
    return () => clearTimeout(timer);
  }, [currentIndex, gameComplete, buildShuffledPair, playAudio]);

  // Handle image click
  const handleImageClick = (item) => {
    // Ignore clicks while feedback is showing
    if (feedback) return;

    setSelectedSrc(item.src);

    if (item.isCorrect) {
      // Correct answer
      setFeedback('correct');
      playCheerSound();
      triggerConfetti();
      setScore((prev) => prev + 1);

      setTimeout(() => {
        if (currentIndex + 1 < total) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          // All items completed
          setGameComplete(true);
          addXP(50);
          recordGameStats('english', total, score + 1);
          triggerConfetti('big');
        }
      }, 1500);
    } else {
      // Wrong answer — gentle feedback, let them try again
      setFeedback('wrong');
      playOopsSound();

      setTimeout(() => {
        setFeedback(null);
        setSelectedSrc(null);
      }, 800);
    }
  };

  // Handle image load error — track which srcs failed
  const handleImgError = (src) => {
    setImgErrors((prev) => ({ ...prev, [src]: true }));
  };

  // Reset the entire game
  const resetGame = () => {
    setCurrentIndex(0);
    setShuffledPair([]);
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
        className="mb-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg hover:shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        aria-label="Play sound again"
      >
        <span className="text-5xl sm:text-6xl">🔊</span>
      </button>

      {/* Image Cards */}
      <div className="flex gap-4 sm:gap-8 justify-center w-full max-w-2xl px-2">
        {shuffledPair.map((item, index) => {
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
                relative flex-1 aspect-square max-w-[280px] rounded-3xl shadow-lg
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
                /* Fallback UI when image fails to load */
                <div
                  className={`w-full h-full flex items-center justify-center rounded-3xl ${FALLBACK_COLORS[item.src] || 'bg-purple-300'}`}
                >
                  <span className="text-4xl sm:text-5xl font-black text-white drop-shadow-lg select-none">
                    {getWordForImage(item.src)}
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
