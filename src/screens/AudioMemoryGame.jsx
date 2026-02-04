import React, { useState, useEffect, useCallback } from 'react';
import { getRandomWords, speakWord } from '../data/englishWords';
import { getTheme } from '../data/themes';
import { addXP, recordGameStats } from '../utils/storage';
import { playCheerSound } from '../utils/sounds';

// Audio Memory Match Game - 4x3 grid (6 pairs)
const AudioMemoryGame = ({ themeId, onBack, onComplete, triggerConfetti }) => {
  const theme = getTheme(themeId);
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [moves, setMoves] = useState(0);

  // Initialize game
  const initGame = useCallback(() => {
    const words = getRandomWords(6); // 6 pairs
    const cardPairs = [];

    // Create pairs (image vs image)
    words.forEach((wordData, index) => {
      cardPairs.push({
        id: index * 2,
        pairId: index,
        emoji: wordData.emoji,
        word: wordData.word,
        type: 'image',
      });
      cardPairs.push({
        id: index * 2 + 1,
        pairId: index,
        emoji: wordData.emoji,
        word: wordData.word,
        type: 'image',
      });
    });

    // Shuffle cards
    const shuffled = cardPairs.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setIsLocked(false);
    setGameComplete(false);
    setMoves(0);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Handle card click
  const handleCardClick = (index) => {
    // Ignore if locked, already flipped, or already matched
    if (isLocked) return;
    if (flippedIndices.includes(index)) return;
    if (matchedPairs.includes(cards[index].pairId)) return;

    // Speak the word
    speakWord(cards[index].word);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setMoves((prev) => prev + 1);

      const [first, second] = newFlipped;
      const card1 = cards[first];
      const card2 = cards[second];

      if (card1.pairId === card2.pairId) {
        // Match found!
        setTimeout(() => {
          playCheerSound();
          triggerConfetti();
          speakWord('Correct!');

          const newMatched = [...matchedPairs, card1.pairId];
          setMatchedPairs(newMatched);
          setFlippedIndices([]);
          setIsLocked(false);

          // Check if game complete
          if (newMatched.length === 6) {
            setTimeout(() => {
              setGameComplete(true);
              addXP(50);
              recordGameStats('english', 6, 6);
              triggerConfetti('big');
            }, 500);
          }
        }, 600);
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1200);
      }
    }
  };

  // Check if card is flipped
  const isFlipped = (index) => {
    return flippedIndices.includes(index) || matchedPairs.includes(cards[index]?.pairId);
  };

  // Check if card is matched
  const isMatched = (index) => {
    return matchedPairs.includes(cards[index]?.pairId);
  };

  if (gameComplete) {
    return (
      <div
        className={`min-h-screen ${theme.bg} flex items-center justify-center p-8`}
        dir="rtl"
      >
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">🎉</div>
          <h1 className="text-5xl font-black text-white mb-4">כל הכבוד!</h1>
          <p className="text-2xl text-white/90 mb-2">מצאת את כל הזוגות!</p>
          <p className="text-xl text-white/70 mb-8">מספר ניסיונות: {moves}</p>
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
      className={`min-h-screen ${theme.bg} flex flex-col items-center justify-center p-4`}
      dir="rtl"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-black text-white mb-2">🎴 משחק הזיכרון</h1>
        <p className="text-xl text-white/80">מצא את הזוגות! הקשב לכל מילה</p>
        <div className="mt-2 flex justify-center gap-6 text-white/70">
          <span>ניסיונות: {moves}</span>
          <span>זוגות: {matchedPairs.length}/6</span>
        </div>
      </div>

      {/* Card Grid - 3x4 on mobile, 4x3 on larger screens */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 max-w-lg">
        {cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(index)}
            disabled={isLocked || isMatched(index)}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl font-bold text-4xl sm:text-5xl transition-all duration-300 transform ${
              isFlipped(index)
                ? isMatched(index)
                  ? 'bg-green-400/80 scale-95 rotate-0'
                  : 'bg-white scale-105 rotate-y-180'
                : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:scale-110 hover:shadow-xl cursor-pointer'
            }`}
            style={{
              perspective: '1000px',
              transformStyle: 'preserve-3d',
            }}
          >
            {isFlipped(index) ? (
              <span className={isMatched(index) ? 'opacity-70' : ''}>
                {card.emoji}
              </span>
            ) : (
              <span className="text-white/50">?</span>
            )}
          </button>
        ))}
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        className="mt-8 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl text-white text-lg font-bold transition-all"
      >
        ← חזרה
      </button>
    </div>
  );
};

export default AudioMemoryGame;
