import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import { getTheme } from '../data/themes';
import { gameModes, QUESTIONS_PER_LEVEL } from '../data/levelConfigs';
import { generateLevelQuestions } from '../utils/gameLogic';
import { calculateAnswerXP } from '../data/ranks';
import { ProgressBar, FloatingXP } from '../components';

// Number Train - Sequence game screen
const SequenceGameScreen = ({
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

  if (!currentQuestion || questions.length === 0) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="text-4xl text-white animate-pulse">טוען...</div>
      </div>
    );
  }

  const { sequence, missingIndex } = currentQuestion;

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

        {/* Train Card */}
        <div className={`${theme.cardBg} rounded-3xl p-6 sm:p-10 mt-6 sm:mt-8 mb-6`}>
          <div className="text-center mb-6">
            <span className="text-xl text-white/70">השלם את הסדרה! 🚂</span>
          </div>

          {/* Train wagons - ltr so locomotive leads on the left */}
          <div className="flex items-center justify-center gap-1 sm:gap-2" dir="ltr">
            {/* Locomotive at the head (left side, pulling the train) */}
            <div className="text-4xl sm:text-5xl">🚂</div>

            {/* Wagons trailing behind the locomotive */}
            {sequence.map((num, idx) => {
              const isMissing = idx === missingIndex;
              const showAnswer = isMissing && showFeedback;

              return (
                <div key={idx} className="flex items-center">
                  {/* Connector */}
                  <div className="w-2 sm:w-4 h-1 bg-white/30" />

                  {/* Wagon */}
                  <div
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center border-3 transition-all duration-300 ${
                      isMissing && !showAnswer
                        ? 'bg-yellow-500/30 border-yellow-400 border-dashed border-2 animate-pulse'
                        : showAnswer
                        ? selectedAnswer === currentQuestion.correct
                          ? 'bg-green-500/40 border-green-400 border-2'
                          : 'bg-red-500/40 border-red-400 border-2'
                        : 'bg-white/15 border-white/30 border-2'
                    }`}
                  >
                    {isMissing && !showAnswer ? (
                      <span className="text-3xl sm:text-4xl text-yellow-300 font-black">?</span>
                    ) : (
                      <span className="text-2xl sm:text-3xl text-white font-black">
                        {showAnswer ? currentQuestion.correct : num}
                      </span>
                    )}

                    {/* Wagon emoji underneath */}
                    <div className="absolute -bottom-5 text-lg">🚃</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Direction hint */}
          <div className="text-center mt-8">
            <span className="text-white/50 text-sm">
              {currentQuestion.isAscending ? '⬆️ סדרה עולה' : '⬇️ סדרה יורדת'}
              {' • '}
              קפיצות של {currentQuestion.jump}
            </span>
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className="text-center mt-3">
              <span className={`text-xl font-bold ${selectedAnswer === currentQuestion.correct ? 'text-green-400' : 'text-red-400'}`}>
                {selectedAnswer === currentQuestion.correct
                  ? '🎉 נכון!'
                  : `❌ התשובה הנכונה: ${currentQuestion.correct}`}
              </span>
            </div>
          )}
        </div>

        {/* Answer buttons - 6 options in responsive grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 max-w-2xl mx-auto">
          {currentQuestion.answers.map((answer, idx) => {
            const isCorrect = showFeedback && answer === currentQuestion.correct;
            const isWrong = showFeedback && answer === selectedAnswer && answer !== currentQuestion.correct;

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(answer)}
                className={`py-5 sm:py-6 rounded-2xl text-3xl sm:text-4xl font-black transition-all duration-300 ${
                  isCorrect
                    ? 'bg-green-500 text-white scale-105'
                    : isWrong
                    ? 'bg-red-500 text-white'
                    : showFeedback
                    ? 'bg-white/10 text-white/50'
                    : 'bg-white/20 text-white hover:bg-white/40 hover:scale-105'
                } ${isWrong && shakeWrong ? 'animate-shake' : ''}`}
                style={{
                  animation: isWrong && shakeWrong ? 'shake 0.5s ease-in-out' : undefined,
                }}
              >
                {answer}
              </button>
            );
          })}
        </div>

        {/* Score */}
        <div className="text-center">
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

export default SequenceGameScreen;
