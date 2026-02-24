import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getTheme } from '../data/themes';
import { addXP, recordGameStats } from '../utils/storage';
import useGameAnalytics from '../hooks/useGameAnalytics';

// ============ Words Dataset ============
// Each entry: image emoji, display name (without niqqud), and first Hebrew letter

const WORDS = [
  { icon: '🦁', name: 'אריה', firstLetter: 'א', letterName: 'אָלֶף' },
  { icon: '🍌', name: 'בננה', firstLetter: 'ב', letterName: 'בֵּית' },
  { icon: '🥕', name: 'גזר', firstLetter: 'ג', letterName: 'גִּימֶל' },
  { icon: '🐟', name: 'דג', firstLetter: 'ד', letterName: 'דָּלֶת' },
  { icon: '⛰️', name: 'הר', firstLetter: 'ה', letterName: 'הֵא' },
  { icon: '🦓', name: 'זברה', firstLetter: 'ז', letterName: 'זַיִן' },
  { icon: '🐱', name: 'חתול', firstLetter: 'ח', letterName: 'חֵית' },
  { icon: '🐶', name: 'כלב', firstLetter: 'כ', letterName: 'כַּף' },
  { icon: '❤️', name: 'לב', firstLetter: 'ל', letterName: 'לָמֶד' },
  { icon: '💧', name: 'מים', firstLetter: 'מ', letterName: 'מֵם' },
  { icon: '🐍', name: 'נחש', firstLetter: 'נ', letterName: 'נוּן' },
  { icon: '🐴', name: 'סוס', firstLetter: 'ס', letterName: 'סָמֶךְ' },
  { icon: '🌳', name: 'עץ', firstLetter: 'ע', letterName: 'עַיִן' },
  { icon: '🦋', name: 'פרפר', firstLetter: 'פ', letterName: 'פֵּא' },
  { icon: '🐦', name: 'ציפור', firstLetter: 'צ', letterName: 'צָדִי' },
  { icon: '🐒', name: 'קוף', firstLetter: 'ק', letterName: 'קוֹף' },
  { icon: '🚂', name: 'רכבת', firstLetter: 'ר', letterName: 'רֵישׁ' },
  { icon: '☀️', name: 'שמש', firstLetter: 'ש', letterName: 'שִׁין' },
  { icon: '🍎', name: 'תפוח', firstLetter: 'ת', letterName: 'תָּו' },
];

const ALL_LETTERS = [...new Set(WORDS.map((w) => w.firstLetter))];

const ROUNDS_PER_GAME = 10;
const OPTIONS_PER_ROUND = 3;
const XP_PER_GAME = 30;

// ============ TTS Helper ============

const speak = (text) => {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      utterance.rate = 0.75;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {
    // Silently fail
  }
};

// ============ Shuffle helper ============

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============ Generate rounds ============

function generateRounds() {
  const shuffled = shuffle(WORDS);
  const selected = shuffled.slice(0, ROUNDS_PER_GAME);

  return selected.map((word) => {
    // Pick 2 wrong letters from all other letters
    const wrongLetters = shuffle(
      ALL_LETTERS.filter((l) => l !== word.firstLetter)
    ).slice(0, OPTIONS_PER_ROUND - 1);

    const options = shuffle([word.firstLetter, ...wrongLetters]);
    return { word, options };
  });
}

// ============ Main Component ============

const FirstLetterMatchGame = ({ themeId, onBack, triggerConfetti }) => {
  const theme = getTheme(themeId);
  const { trackLevelComplete } = useGameAnalytics('First Letter');

  const [rounds, setRounds] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [winMessage, setWinMessage] = useState('');
  const prevIconRef = useRef(null);

  const startGame = useCallback(() => {
    prevIconRef.current = null;
    setRounds(generateRounds());
    setRoundIndex(0);
    setScore(0);
    setGameComplete(false);
    setSelectedLetter(null);
    setShowResult(false);
    setIsCorrect(false);
    setWinMessage('');
  }, []);

  useEffect(() => {
    startGame();
  }, [startGame]);

  // Speak the question when round changes
  useEffect(() => {
    if (rounds.length > 0 && roundIndex < rounds.length && !showResult) {
      const word = rounds[roundIndex].word;
      const timer = setTimeout(() => {
        speak(`במה מתחילה המילה ${word.name}?`);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [roundIndex, rounds, showResult]);

  const round = rounds[roundIndex];

  const handleLetterClick = (letter) => {
    if (showResult) return;

    setSelectedLetter(letter);
    const correct = letter === round.word.firstLetter;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      const newScore = score + 1;
      setScore(newScore);
      const msg = `${round.word.letterName} של ${round.word.name}!`;
      setWinMessage(msg);
      speak(msg);
      triggerConfetti?.('normal');
      trackLevelComplete(roundIndex + 1, newScore, true);

      setTimeout(() => {
        if (roundIndex + 1 >= rounds.length) {
          setGameComplete(true);
          addXP(XP_PER_GAME);
          recordGameStats('firstLetter', ROUNDS_PER_GAME, newScore);
          triggerConfetti?.('big');
        } else {
          prevIconRef.current = round.word.icon;
          setRoundIndex((prev) => prev + 1);
          setSelectedLetter(null);
          setShowResult(false);
          setIsCorrect(false);
          setWinMessage('');
        }
      }, 1800);
    } else {
      speak('נסה שוב!');
      trackLevelComplete(roundIndex + 1, score, false);
      setTimeout(() => {
        setSelectedLetter(null);
        setShowResult(false);
      }, 1000);
    }
  };

  // ============ Loading ============
  if (rounds.length === 0) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="text-4xl text-white animate-pulse">טוען...</div>
      </div>
    );
  }

  // ============ Game Complete ============
  if (gameComplete) {
    return (
      <div
        className={`min-h-screen ${theme.bg} flex items-center justify-center p-6 ${theme.font}`}
        dir="rtl"
      >
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">🍎</div>
          <h1 className="text-5xl font-black text-white mb-4">כל הכבוד!</h1>
          <p className="text-2xl text-white/90 mb-2">
            זיהית {score} אותיות ראשונות מתוך {ROUNDS_PER_GAME}!
          </p>
          <div className="text-3xl text-yellow-300 font-bold mb-8">+{XP_PER_GAME} XP</div>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={startGame}
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

  // ============ Game Play ============
  if (!round) return null;

  return (
    <div
      className={`min-h-screen ${theme.bg} flex flex-col items-center p-4 sm:p-8 ${theme.font}`}
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
          {roundIndex + 1} / {ROUNDS_PER_GAME}
        </div>
        <div className="text-white font-bold text-lg">⭐ {score}</div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-2xl h-3 bg-white/20 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-500"
          style={{ width: `${(roundIndex / ROUNDS_PER_GAME) * 100}%` }}
        />
      </div>

      {/* Image card */}
      <button
        onClick={() => speak(`במה מתחילה המילה ${round.word.name}?`)}
        className={`${theme.cardBg} rounded-3xl px-12 py-8 mb-6 text-center hover:scale-105 transition-all duration-300 cursor-pointer`}
      >
        <div className="text-9xl mb-4 leading-none">{round.word.icon}</div>
        <p className="text-3xl font-bold text-white">{round.word.name}</p>
        <p className="text-white/60 text-base mt-2 flex items-center justify-center gap-2">
          <span>🔊</span>
          <span>לחץ לשמוע</span>
        </p>
      </button>

      {/* Question text */}
      <p className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">
        במה מתחילה המילה{' '}
        <span className="text-yellow-300">{round.word.name}</span>?
      </p>

      {/* Letter option buttons */}
      <div className="flex gap-5 sm:gap-8 justify-center mb-6">
        {round.options.map((letter) => {
          const isSelected = selectedLetter === letter;
          const isThisCorrect = letter === round.word.firstLetter;
          let btnStyle = 'bg-white/15 hover:bg-white/30 hover:scale-110 active:scale-95 cursor-pointer';
          if (showResult && isSelected && isThisCorrect) {
            btnStyle = 'bg-green-500 scale-110 ring-8 ring-green-300 cursor-not-allowed';
          } else if (showResult && isSelected && !isThisCorrect) {
            btnStyle = 'bg-red-500 scale-95 ring-4 ring-red-300 cursor-not-allowed';
          } else if (showResult) {
            btnStyle = 'bg-white/10 opacity-60 cursor-not-allowed';
          }

          return (
            <button
              key={letter}
              onClick={() => handleLetterClick(letter)}
              disabled={showResult}
              className={`
                w-24 h-24 sm:w-32 sm:h-32
                rounded-3xl border-4 border-white/30
                text-5xl sm:text-6xl font-black text-white
                transition-all duration-300
                ${btnStyle}
              `}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Win message */}
      {showResult && isCorrect && winMessage && (
        <div className="mt-2 text-2xl sm:text-3xl font-bold text-yellow-300 animate-pulse text-center">
          ✨ {winMessage}
        </div>
      )}
    </div>
  );
};

export default FirstLetterMatchGame;
