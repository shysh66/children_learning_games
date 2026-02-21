import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import { getTheme } from '../data/themes';
import { gameModes, QUESTIONS_PER_LEVEL } from '../data/levelConfigs';
import { generateLevelQuestions } from '../utils/gameLogic';
import { calculateAnswerXP } from '../data/ranks';
import { ProgressBar, FloatingXP } from '../components';

// Hungry Alligator - Comparison game screen
const CompareGameScreen = ({
  themeId,
  gameMode,
  level,
  onComplete,
  onBack,
  triggerConfetti,
}) => {
  const theme = getTheme(themeId);
  const mode = gameModes[gameMode];

  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [showFloatingXP, setShowFloatingXP] = useState(false);
  const [currentXPGain, setCurrentXPGain] = useState(0);

  const xpPerAnswer = calculateAnswerXP(level - 1);

  useEffect(() => {
    const levelQuestions = generateLevelQuestions(gameMode, level, QUESTIONS_PER_LEVEL);
    setQuestions(levelQuestions);
    setQuestionIndex(0);
    setScore(0);
    setEarnedXP(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
  }, [gameMode, level]);

  const currentQuestion = questions[questionIndex];

  const handleFloatingXPComplete = useCallback(() => {
    setShowFloatingXP(false);
  }, []);

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

    setTimeout(() => {
      if (questionIndex + 1 < QUESTIONS_PER_LEVEL) {
        setQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        const finalScore = isCorrect ? score + 1 : score;
        const finalXP = isCorrect ? earnedXP + xpPerAnswer : earnedXP;
        onComplete(finalScore, finalXP);
      }
    }, 1500);
  };

  // Handle clicking a number card - the child picks which number is bigger
  const handleNumberClick = (side) => {
    if (showFeedback) return;
    // Clicking left number means "left is bigger" => '>'
    // Clicking right number means "right is bigger" => '<'
    const answer = side === 'left' ? '>' : '<';
    handleAnswer(answer);
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
      <FloatingXP xp={currentXPGain} show={showFloatingXP} onComplete={handleFloatingXPComplete} />

      <div className="max-w-3xl w-full">
        {/* Header */}
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
            <span className="text-3xl">{mode.icon}</span>
          </div>
        </div>

        {/* Progress */}
        <ProgressBar
          current={questionIndex + 1}
          total={QUESTIONS_PER_LEVEL}
          theme={theme}
          labelLeft={`שלב ${level}`}
          labelRight={`שאלה ${questionIndex + 1} מתוך ${QUESTIONS_PER_LEVEL}`}
        />

        {/* Comparison Card */}
        <div className={`${theme.cardBg} rounded-3xl p-6 sm:p-10 mt-6 sm:mt-8 mb-6`}>
          <div className="text-center mb-4">
            <span className="text-xl text-white/70">לחצו על המספר הגדול! 🐊</span>
          </div>

          {/* Side A vs Side B - clickable number cards */}
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            {/* Left Side - clickable */}
            <div className="flex-1 text-center">
              <button
                onClick={() => handleNumberClick('left')}
                disabled={showFeedback}
                className={`w-full rounded-2xl p-4 sm:p-6 border-2 transition-all duration-300 ${
                  showFeedback && selectedAnswer === '>' && currentQuestion.correct === '>'
                    ? 'bg-green-500/40 border-green-400 scale-105'
                    : showFeedback && selectedAnswer === '>' && currentQuestion.correct !== '>'
                    ? 'bg-red-500/40 border-red-400'
                    : showFeedback && currentQuestion.correct === '>'
                    ? 'bg-green-500/20 border-green-400/50'
                    : 'bg-white/15 border-white/20 hover:bg-white/30 hover:scale-105 hover:border-yellow-400 cursor-pointer'
                } ${showFeedback && selectedAnswer === '>' && currentQuestion.correct !== '>' && shakeWrong ? 'animate-shake' : ''}`}
                style={{
                  animation: showFeedback && selectedAnswer === '>' && currentQuestion.correct !== '>' && shakeWrong ? 'shake 0.5s ease-in-out' : undefined,
                }}
              >
                <span className="text-3xl sm:text-5xl font-black text-white">
                  {currentQuestion.leftDisplay}
                </span>
              </button>
            </div>

            {/* Alligator / Answer Zone */}
            <div className="flex-shrink-0">
              <div className="text-5xl sm:text-6xl text-yellow-300 font-black">
                {showFeedback ? (
                  currentQuestion.correct === '=' ? (
                    <span>=</span>
                  ) : currentQuestion.correct === '>' ? (
                    <span style={{ display: 'inline-block', transform: 'scaleX(-1)' }}>🐊</span>
                  ) : (
                    <span>🐊</span>
                  )
                ) : (
                  <span className="text-white/30">?</span>
                )}
              </div>
            </div>

            {/* Right Side - clickable */}
            <div className="flex-1 text-center">
              <button
                onClick={() => handleNumberClick('right')}
                disabled={showFeedback}
                className={`w-full rounded-2xl p-4 sm:p-6 border-2 transition-all duration-300 ${
                  showFeedback && selectedAnswer === '<' && currentQuestion.correct === '<'
                    ? 'bg-green-500/40 border-green-400 scale-105'
                    : showFeedback && selectedAnswer === '<' && currentQuestion.correct !== '<'
                    ? 'bg-red-500/40 border-red-400'
                    : showFeedback && currentQuestion.correct === '<'
                    ? 'bg-green-500/20 border-green-400/50'
                    : 'bg-white/15 border-white/20 hover:bg-white/30 hover:scale-105 hover:border-yellow-400 cursor-pointer'
                } ${showFeedback && selectedAnswer === '<' && currentQuestion.correct !== '<' && shakeWrong ? 'animate-shake' : ''}`}
                style={{
                  animation: showFeedback && selectedAnswer === '<' && currentQuestion.correct !== '<' && shakeWrong ? 'shake 0.5s ease-in-out' : undefined,
                }}
              >
                <span className="text-3xl sm:text-5xl font-black text-white">
                  {currentQuestion.rightDisplay}
                </span>
              </button>
            </div>
          </div>

          {/* Equal button - for when both numbers are the same */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => handleAnswer('=')}
              disabled={showFeedback}
              className={`px-8 py-3 sm:px-10 sm:py-4 rounded-2xl text-2xl sm:text-3xl font-black transition-all duration-300 ${
                showFeedback && selectedAnswer === '=' && currentQuestion.correct === '='
                  ? 'bg-green-500 text-white scale-110'
                  : showFeedback && selectedAnswer === '=' && currentQuestion.correct !== '='
                  ? 'bg-red-500 text-white'
                  : showFeedback && currentQuestion.correct === '='
                  ? 'bg-green-500/30 text-green-300'
                  : 'bg-white/20 text-white hover:bg-white/40 hover:scale-105'
              } ${showFeedback && selectedAnswer === '=' && currentQuestion.correct !== '=' && shakeWrong ? 'animate-shake' : ''}`}
              style={{
                animation: showFeedback && selectedAnswer === '=' && currentQuestion.correct !== '=' && shakeWrong ? 'shake 0.5s ease-in-out' : undefined,
              }}
            >
              = שווים!
            </button>
          </div>

          {/* Hint text */}
          {showFeedback && (
            <div className="text-center mt-4">
              <span className={`text-xl font-bold ${selectedAnswer === currentQuestion.correct ? 'text-green-400' : 'text-red-400'}`}>
                {selectedAnswer === currentQuestion.correct
                  ? '🎉 נכון!'
                  : `❌ התשובה הנכונה: ${currentQuestion.leftDisplay} ${currentQuestion.correct} ${currentQuestion.rightDisplay}`}
              </span>
            </div>
          )}
        </div>

        {/* Score */}
        <div className="text-center mt-4">
          <span className="text-xl text-white/70">
            ניקוד: {score}/{questionIndex + (showFeedback ? 1 : 0)}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default CompareGameScreen;
