import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import { getTheme } from '../data/themes';
import { gameModes, QUESTIONS_PER_LEVEL } from '../data/levelConfigs';
import { generateLevelQuestions } from '../utils/gameLogic';
import { calculateAnswerXP } from '../data/ranks';
import { ProgressBar, FloatingXP } from '../components';

// Junior answer button with visual dots
const JuniorAnswerButton = ({
  answer,
  onClick,
  isSelected,
  isCorrect,
  showFeedback,
  shakeWrong,
  theme,
}) => {
  const showCorrectFeedback = showFeedback && isCorrect;
  const showWrongFeedback = showFeedback && isSelected && !isCorrect;

  // Generate dots for visual counting aid
  const renderDots = () => {
    const dots = [];
    const maxDots = Math.min(answer, 20);
    for (let i = 0; i < maxDots; i++) {
      dots.push(
        <span
          key={i}
          className="inline-block w-2 h-2 bg-white/80 rounded-full"
        />
      );
    }
    return dots;
  };

  const getButtonStyles = () => {
    if (showCorrectFeedback) {
      return 'bg-green-500 scale-110 ring-8 ring-green-300';
    }
    if (showWrongFeedback) {
      return `bg-red-500 ${shakeWrong ? 'animate-shake' : ''}`;
    }
    return `${theme.cardBg} hover:scale-105`;
  };

  return (
    <>
      <button
        onClick={onClick}
        disabled={showFeedback}
        className={`
          flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-3xl transition-all duration-300 transform
          ${getButtonStyles()}
          ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-2xl'}
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

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
};

// Junior visual question display
const JuniorVisualQuestion = ({ question, theme }) => {
  if (!question || !theme) return null;

  const { type, num1, num2, visual, useGrid } = question;

  // Base container class for grid layout
  const containerClass = useGrid
    ? 'flex flex-wrap justify-center gap-2 max-w-md mx-auto'
    : 'flex flex-wrap justify-center gap-3';

  // Render counting question (just show items)
  const renderCountingVisual = () => {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="text-4xl font-bold text-white">כמה יש?</div>
        <div className={containerClass}>
          {[...Array(num1)].map((_, idx) => (
            <span
              key={idx}
              className="text-5xl animate-bounce"
              style={{ animationDelay: `${idx * 0.1}s` }}
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
                  className="text-4xl animate-bounce"
                  style={{ animationDelay: `${idx * 0.1}s` }}
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
                  className="text-4xl animate-bounce"
                  style={{ animationDelay: `${(visual.group1 + idx) * 0.1}s` }}
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
                  className={`text-4xl relative ${isCrossed ? 'opacity-50' : ''}`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
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

  // Game state
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [showFloatingXP, setShowFloatingXP] = useState(false);
  const [currentXPGain, setCurrentXPGain] = useState(0);

  // Calculate XP per correct answer based on level
  const xpPerAnswer = calculateAnswerXP(level - 1);

  // Pre-generate all questions at the start of the level
  useEffect(() => {
    const levelQuestions = generateLevelQuestions(gameMode, level, QUESTIONS_PER_LEVEL);
    setQuestions(levelQuestions);
    setQuestionIndex(0);
    setScore(0);
    setEarnedXP(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
  }, [gameMode, level]);

  // Get current question from pre-generated list
  const currentQuestion = questions[questionIndex];

  // Handle floating XP animation complete
  const handleFloatingXPComplete = useCallback(() => {
    setShowFloatingXP(false);
  }, []);

  // Handle answer selection
  const handleAnswer = (answer) => {
    if (showFeedback) return;

    setSelectedAnswer(answer);
    setShowFeedback(true);

    const isCorrect = answer === currentQuestion.correct;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setEarnedXP((prev) => prev + xpPerAnswer);
      setCurrentXPGain(xpPerAnswer);
      setShowFloatingXP(true);
      triggerConfetti?.('normal');
    } else {
      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 500);
    }

    // Move to next question or complete
    setTimeout(() => {
      if (questionIndex + 1 < QUESTIONS_PER_LEVEL) {
        setQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        // Game complete - pass both score and earned XP
        const finalScore = isCorrect ? score + 1 : score;
        const finalXP = isCorrect ? earnedXP + xpPerAnswer : earnedXP;
        onComplete(finalScore, finalXP);
      }
    }, 1500);
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
          <JuniorVisualQuestion question={currentQuestion} theme={theme} />
        </div>

        {/* Answer buttons - 2x2 grid with visual dots */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {currentQuestion.answers.map((answer, idx) => (
            <JuniorAnswerButton
              key={idx}
              answer={answer}
              onClick={() => handleAnswer(answer)}
              isSelected={selectedAnswer === answer}
              isCorrect={answer === currentQuestion.correct}
              showFeedback={showFeedback}
              shakeWrong={shakeWrong}
              theme={theme}
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
    </div>
  );
};

export default JuniorGameScreen;
