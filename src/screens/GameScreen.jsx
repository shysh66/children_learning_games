import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import { getTheme } from '../data/themes';
import { gameModes, QUESTIONS_PER_LEVEL } from '../data/levelConfigs';
import { generateLevelQuestions } from '../utils/gameLogic';
import { calculateAnswerXP } from '../data/ranks';
import { ProgressBar, VisualQuestion, AnswerButton, FloatingXP } from '../components';

// Main game screen where questions are answered
const GameScreen = ({
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
      className={`min-h-screen ${theme.bg} flex flex-col items-center justify-center p-8 ${theme.font}`}
      dir="rtl"
    >
      {/* Floating XP animation */}
      <FloatingXP
        xp={currentXPGain}
        show={showFloatingXP}
        onComplete={handleFloatingXPComplete}
      />

      <div className="max-w-5xl w-full">
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
        <div className={`${theme.cardBg} rounded-3xl p-10 mb-8 mt-8`}>
          <VisualQuestion question={currentQuestion} theme={theme} />
        </div>

        {/* Answer buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {currentQuestion.answers.map((answer, idx) => (
            <AnswerButton
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
            ניקוד נוכחי: {score}/{questionIndex + (showFeedback ? 1 : 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
