import React, { useState, useEffect, useCallback } from 'react';
import { getTheme } from '../data/themes';
import { addXP, recordGameStats } from '../utils/storage';
import { playCheerSound, playOopsSound } from '../utils/sounds';
import { speakWord } from '../data/englishWords';
import levelsConfig from '../data/levels_config.json';

const ReadingMatchGame = ({ levelId = 'level_1', themeId, onBack, triggerConfetti }) => {
  const theme = getTheme(themeId);

  // Load level data
  const level = levelsConfig.levels.find((l) => l.id === levelId) || levelsConfig.levels[0];
  const words = level.words;
  const total = words.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const [selectedWord, setSelectedWord] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);

  const currentWord = words[currentIndex];

  // Play the current word via TTS
  const playAudio = useCallback(() => {
    if (!currentWord) return;
    speakWord(currentWord.audio);
  }, [currentWord]);

  // Build shuffled text options for the current turn
  const buildOptions = useCallback(() => {
    if (!currentWord) return;

    // Collect distractors from other words in the level
    const others = words.filter((w) => w.id !== currentWord.id);
    const shuffledOthers = [...others].sort(() => Math.random() - 0.5);
    const distractorCount = words.length >= 5 ? 3 : 2;
    const distractors = shuffledOthers.slice(0, distractorCount);

    // Combine correct + distractors and shuffle positions
    const allOptions = [
      { word: currentWord.word, isCorrect: true },
      ...distractors.map((d) => ({ word: d.word, isCorrect: false })),
    ];

    // Fisher-Yates shuffle
    for (let i = allOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }

    setOptions(allOptions);
  }, [currentWord, words]);

  // On mount and each new turn: build options and auto-play audio
  useEffect(() => {
    if (gameComplete) return;
    setFeedback(null);
    setSelectedWord(null);
    buildOptions();

    const timer = setTimeout(() => {
      playAudio();
    }, 400);
    return () => clearTimeout(timer);
  }, [currentIndex, gameComplete, buildOptions, playAudio]);

  // Handle text button click
  const handleOptionClick = (option) => {
    if (feedback) return;

    setSelectedWord(option.word);

    if (option.isCorrect) {
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
        setSelectedWord(null);
      }, 800);
    }
  };

  // Reset the game
  const resetGame = () => {
    setCurrentIndex(0);
    setOptions([]);
    setFeedback(null);
    setSelectedWord(null);
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
          <div className="text-8xl mb-6 animate-bounce">{'\ud83c\udfc6'}</div>
          <h1 className="text-6xl font-black text-white mb-4">Great Reading!</h1>
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
      className={`min-h-screen ${theme.bg} flex flex-col items-center p-4 pt-6`}
    >
      {/* Header: back button + progress */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-4">
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
      <div className="w-full max-w-2xl mb-6">
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentIndex / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Image display — large emoji */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 mb-6 flex items-center justify-center">
        <span className="text-[100px] sm:text-[120px] leading-none select-none">
          {currentWord.image}
        </span>
      </div>

      {/* Play Sound button */}
      <button
        onClick={playAudio}
        className="mb-6 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg hover:shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        aria-label="Play sound"
      >
        <span className="text-4xl sm:text-5xl">{'\ud83d\udd0a'}</span>
      </button>

      {/* Text buttons — word choices */}
      <div className="w-full max-w-2xl grid grid-cols-2 gap-3 sm:gap-4 px-2">
        {options.map((option, index) => {
          const isSelected = selectedWord === option.word;
          const isCorrectFeedback = isSelected && feedback === 'correct';
          const isWrongFeedback = isSelected && feedback === 'wrong';

          return (
            <button
              key={`${currentWord.id}-${index}`}
              onClick={() => handleOptionClick(option)}
              disabled={feedback === 'correct'}
              className={`
                min-h-[80px] rounded-3xl shadow-lg text-4xl font-bold
                transition-all duration-200 cursor-pointer select-none
                hover:shadow-2xl hover:scale-105 active:scale-95
                ${isCorrectFeedback
                  ? 'bg-green-100 border-[6px] border-green-400 ring-4 ring-green-300/50 text-green-700 animate-game-bounce'
                  : isWrongFeedback
                    ? 'bg-red-100 border-[6px] border-red-400 ring-4 ring-red-300/50 text-red-700 animate-game-shake'
                    : 'bg-white border-4 border-transparent text-gray-800 hover:bg-blue-50'
                }
                ${feedback === 'correct' && !isSelected ? 'opacity-50 scale-90' : ''}
              `}
            >
              {option.word}
            </button>
          );
        })}
      </div>

      {/* Hint */}
      <p className="mt-6 text-white/50 text-base font-medium">
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

export default ReadingMatchGame;
