import React from 'react';

// Answer button for game questions
const AnswerButton = ({
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
          text-5xl font-black py-10 rounded-3xl transition-all duration-300 transform
          ${getButtonStyles()}
          ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-2xl'}
          text-white
        `}
      >
        {answer}
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

export default AnswerButton;
