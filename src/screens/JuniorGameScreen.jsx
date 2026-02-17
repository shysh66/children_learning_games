import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { getTheme } from '../data/themes';
import { gameModes, QUESTIONS_PER_LEVEL } from '../data/levelConfigs';
import { generateLevelQuestions } from '../utils/gameLogic';
import { calculateAnswerXP } from '../data/ranks';
import { playOopsSound } from '../utils/sounds';
import { grantStar } from '../utils/storage';
import { ProgressBar, FloatingXP, StarEarnedModal } from '../components';
import useGameAnalytics from '../hooks/useGameAnalytics';

// Junior answer button with visual dots and elimination support
const JuniorAnswerButton = ({
  answer,
  onClick,
  isCorrect,
  showFeedback,
  theme,
  eliminated,
  hintMode,
}) => {
  const showCorrectFeedback = showFeedback && isCorrect;
  const isPulsing = hintMode && isCorrect && !showFeedback;

  // Generate dots for visual counting aid
  const renderDots = () => {
    const dots = [];
    const maxDots = Math.min(answer, 20);
    for (let i = 0; i < maxDots; i++) {
      dots.push(
        <span
          key={i}
          className={`inline-block rounded-full transition-all duration-300 ${
            hintMode
              ? 'w-3 h-3 bg-white'
              : 'w-2 h-2 bg-white/80'
          }`}
        />
      );
    }
    return dots;
  };

  const getButtonStyles = () => {
    if (showCorrectFeedback) {
      return 'bg-green-500 scale-110 ring-8 ring-green-300';
    }
    if (eliminated) {
      return 'bg-gray-500 opacity-50 grayscale cursor-not-allowed';
    }
    if (isPulsing) {
      return `${theme.cardBg} animate-hint-pulse`;
    }
    return `${theme.cardBg} hover:scale-105`;
  };

  return (
    <button
      onClick={onClick}
      disabled={showFeedback || eliminated}
      className={`
        flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-3xl transition-all duration-300 transform
        ${getButtonStyles()}
        ${showFeedback || eliminated ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-2xl'}
        text-white min-h-[120px]
      `}
    >
      {/* Number */}
      <span className="text-5xl font-black">{answer}</span>
      {/* Visual dots */}
      <div className="flex flex-wrap justify-center gap-1 max-w-[80px]">
        {renderDots()}
      </div>
    </button>
  );
};

// Junior visual question display with hint animation support
const JuniorVisualQuestion = ({ question, theme, hintMode }) => {
  if (!question || !theme) return null;

  const { type, num1, num2, visual, useGrid } = question;

  // Base container class for grid layout
  const containerClass = useGrid
    ? 'flex flex-wrap justify-center gap-2 max-w-md mx-auto'
    : 'flex flex-wrap justify-center gap-3';

  // Icon animation class: bounce normally, jump one-by-one in hint mode
  const getIconClass = (idx) => {
    if (hintMode) {
      return 'text-5xl animate-hint-jump';
    }
    return 'text-5xl animate-bounce';
  };

  const getIconStyle = (idx) => {
    if (hintMode) {
      return { animationDelay: `${idx * 0.5}s` };
    }
    return { animationDelay: `${idx * 0.1}s` };
  };

  // Render counting question (just show items)
  const renderCountingVisual = () => {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="text-4xl font-bold text-white">כמה יש?</div>
        <div className={containerClass}>
          {[...Array(num1)].map((_, idx) => (
            <span
              key={idx}
              className={getIconClass(idx)}
              style={getIconStyle(idx)}
            >
              {theme.visualIcon}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Render addition visual (two separate groups)
  const renderAdditionVisual = () => {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {/* First group */}
          <div className={`${theme.cardBg} rounded-2xl p-4`}>
            <div className={containerClass}>
              {[...Array(visual.group1)].map((_, idx) => (
                <span
                  key={`g1-${idx}`}
                  className={getIconClass(idx)}
                  style={getIconStyle(idx)}
                >
                  {theme.visualIcon}
                </span>
              ))}
            </div>
          </div>

          {/* Plus sign */}
          <span className="text-6xl font-black text-white">+</span>

          {/* Second group */}
          <div className={`${theme.cardBg} rounded-2xl p-4`}>
            <div className={containerClass}>
              {[...Array(visual.group2)].map((_, idx) => (
                <span
                  key={`g2-${idx}`}
                  className={getIconClass(visual.group1 + idx)}
                  style={getIconStyle(visual.group1 + idx)}
                >
                  {theme.visualIcon}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Equation text */}
        <div className="text-4xl font-bold text-white" dir="ltr">
          {num1} + {num2} = ?
        </div>
      </div>
    );
  };

  // Render subtraction visual (one group with crossed items)
  const renderSubtractionVisual = () => {
    const remaining = visual.total - visual.subtracted;

    return (
      <div className="flex flex-col items-center gap-4">
        <div className={`${theme.cardBg} rounded-2xl p-4`}>
          <div className={containerClass}>
            {[...Array(visual.total)].map((_, idx) => {
              const isCrossed = idx >= remaining;
              return (
                <span
                  key={idx}
                  className={`relative ${isCrossed ? 'opacity-50' : ''} ${getIconClass(idx)}`}
                  style={getIconStyle(idx)}
                >
                  {theme.visualIcon}
                  {isCrossed && (
                    <span className="absolute inset-0 flex items-center justify-center text-red-500 text-5xl font-black">
                      ✕
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        </div>

        {/* Equation text */}
        <div className="text-4xl font-bold text-white" dir="ltr">
          {num1} - {num2} = ?
        </div>
      </div>
    );
  };

  // Choose which visual to render based on question type
  switch (type) {
    case 'counting':
      return renderCountingVisual();
    case 'junior_add':
      return renderAdditionVisual();
    case 'junior_subtract':
      return renderSubtractionVisual();
    default:
      return renderCountingVisual();
  }
};

// Main Junior Game Screen
const JuniorGameScreen = ({
  themeId,
  gameMode,
  level,
  onComplete,
  onBack,
  triggerConfetti,
}) => {
  const theme = getTheme(themeId);
  const mode = gameModes[gameMode];
  const { trackLevelComplete } = useGameAnalytics('Junior Math');

  // Game state
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showFloatingXP, setShowFloatingXP] = useState(false);
  const [currentXPGain, setCurrentXPGain] = useState(0);

  // Gentle Assistance state (elimination + hint mode)
  const [eliminatedAnswers, setEliminatedAnswers] = useState([]);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [hintMode, setHintMode] = useState(false);
  const hintTimerRef = useRef(null);
  const [showStarModal, setShowStarModal] = useState(false);
  const [earnedStarTotal, setEarnedStarTotal] = useState(0);

  // Calculate XP per correct answer based on level
  const xpPerAnswer = calculateAnswerXP(level - 1);

  // Pre-generate all questions at the start of the level
  useEffect(() => {
    const levelQuestions = generateLevelQuestions(gameMode, level, QUESTIONS_PER_LEVEL);
    setQuestions(levelQuestions);
    setQuestionIndex(0);
    setScore(0);
    setEarnedXP(0);

    setShowFeedback(false);
    setEliminatedAnswers([]);
    setMistakeCount(0);
    setHintMode(false);
  }, [gameMode, level]);

  // 10-second inactivity timer for hint mode
  useEffect(() => {
    // Clear previous timer
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }

    // Only start timer if we have a question and not already showing feedback or hint
    if (questions.length > 0 && !showFeedback && !hintMode) {
      hintTimerRef.current = setTimeout(() => {
        setHintMode(true);
      }, 10000);
    }

    return () => {
      if (hintTimerRef.current) {
        clearTimeout(hintTimerRef.current);
      }
    };
  }, [questionIndex, questions.length, showFeedback, hintMode]);

  // Get current question from pre-generated list
  const currentQuestion = questions[questionIndex];

  // Handle floating XP animation complete
  const handleFloatingXPComplete = useCallback(() => {
    setShowFloatingXP(false);
  }, []);

  // Advance to next question or complete level
  const advanceQuestion = useCallback((isCorrect, currentScore, currentXP) => {
    if (questionIndex + 1 < QUESTIONS_PER_LEVEL) {
      setQuestionIndex((prev) => prev + 1);

      setShowFeedback(false);
      setEliminatedAnswers([]);
      setMistakeCount(0);
      setHintMode(false);
    } else {
      // Game complete — grant a star for sticker album
      const gameId = `junior-level-${level}`;
      const starResult = grantStar(gameId);
      if (starResult.earned) {
        setEarnedStarTotal(starResult.totalStars);
        setShowStarModal(true);
      }
      trackLevelComplete(level, currentScore, currentScore >= QUESTIONS_PER_LEVEL / 2);
      onComplete(currentScore, currentXP);
    }
  }, [questionIndex, onComplete, level]);

  // Handle answer selection
  const handleAnswer = (answer) => {
    if (showFeedback || eliminatedAnswers.includes(answer)) return;

    const isCorrect = answer === currentQuestion.correct;

    if (isCorrect) {
      // Clear hint timer on correct answer
      if (hintTimerRef.current) {
        clearTimeout(hintTimerRef.current);
        hintTimerRef.current = null;
      }

      setShowFeedback(true);

      const newScore = score + 1;
      const newXP = earnedXP + xpPerAnswer;
      setScore(newScore);
      setEarnedXP(newXP);
      setCurrentXPGain(xpPerAnswer);
      setShowFloatingXP(true);
      triggerConfetti?.('normal');

      // Move to next question after delay
      setTimeout(() => {
        advanceQuestion(true, newScore, newXP);
      }, 1500);
    } else {
      // Wrong answer: play oops sound, eliminate this button
      playOopsSound();
      setEliminatedAnswers((prev) => [...prev, answer]);

      const newMistakeCount = mistakeCount + 1;
      setMistakeCount(newMistakeCount);

      // Activate hint mode after 2 mistakes
      if (newMistakeCount >= 2 && !hintMode) {
        setHintMode(true);
      }
    }
  };

  if (!currentQuestion || questions.length === 0) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="text-4xl text-white animate-pulse">טוען...</div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${theme.bg} flex flex-col items-center justify-center p-4 sm:p-8 ${theme.font}`}
      dir="rtl"
    >
      {/* Floating XP animation */}
      <FloatingXP
        xp={currentXPGain}
        show={showFloatingXP}
        onComplete={handleFloatingXPComplete}
      />

      <div className="max-w-4xl w-full">
        {/* Header with back button and XP display */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white font-bold transition-all flex items-center gap-2"
          >
            <ArrowRight size={20} />
            חזרה למפה
          </button>
          <div className="flex items-center gap-4">
            <div className="bg-green-500/30 px-3 py-1 rounded-lg">
              <span className="text-green-300 font-bold">+{earnedXP} XP</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{theme.icon}</span>
              <span className="text-3xl">{mode.icon}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          current={questionIndex + 1}
          total={QUESTIONS_PER_LEVEL}
          theme={theme}
          labelLeft={`שלב ${level}`}
          labelRight={`שאלה ${questionIndex + 1} מתוך ${QUESTIONS_PER_LEVEL}`}
        />

        {/* Question Card */}
        <div className={`${theme.cardBg} rounded-3xl p-6 sm:p-10 mb-6 mt-6`}>
          <JuniorVisualQuestion question={currentQuestion} theme={theme} hintMode={hintMode} />
        </div>

        {/* Answer buttons - 2x2 grid with visual dots */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {currentQuestion.answers.map((answer, idx) => (
            <JuniorAnswerButton
              key={idx}
              answer={answer}
              onClick={() => handleAnswer(answer)}
              isCorrect={answer === currentQuestion.correct}
              showFeedback={showFeedback}
              theme={theme}
              eliminated={eliminatedAnswers.includes(answer)}
              hintMode={hintMode}
            />
          ))}
        </div>

        {/* Score display */}
        <div className="text-center">
          <span className="text-xl text-white/70">
            ניקוד: {score}/{questionIndex + (showFeedback ? 1 : 0)}
          </span>
        </div>
      </div>

      {/* Star Earned Modal */}
      <StarEarnedModal
        isOpen={showStarModal}
        onClose={() => setShowStarModal(false)}
        totalStars={earnedStarTotal}
      />

      {/* Animations */}
      <style>{`
        @keyframes hint-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-hint-pulse {
          animation: hint-pulse 1s ease-in-out infinite;
        }
        @keyframes hint-jump {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.2) translateY(-8px); }
        }
        .animate-hint-jump {
          animation: hint-jump 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default JuniorGameScreen;
