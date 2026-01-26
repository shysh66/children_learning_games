import React from 'react';
import { getOperatorSymbol } from '../utils/gameLogic';

// Visual question display with icons
const VisualQuestion = ({
  question,
  theme,
}) => {
  if (!question || !theme) return null;

  const { type, num1, num2, showVisual, visual } = question;
  const operator = getOperatorSymbol(type);

  // Render multiplication visual (groups of items)
  const renderMultiplyVisual = () => {
    if (!showVisual || !visual) return null;

    const { groups, items } = visual;

    return (
      <div className="flex flex-wrap justify-center gap-4 max-w-2xl">
        {[...Array(groups)].map((_, groupIdx) => (
          <div
            key={groupIdx}
            className={`${theme.cardBg} rounded-2xl p-3 animate-bounce`}
            style={{ animationDelay: `${groupIdx * 0.1}s` }}
          >
            <div className="flex gap-2">
              {[...Array(items)].map((_, itemIdx) => (
                <span key={itemIdx} className="text-4xl">
                  {theme.visualIcon}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render addition/subtraction visual (icons with strike-through for subtraction)
  const renderAddSubVisual = () => {
    if (!showVisual || !visual) return null;

    const { total, subtracted } = visual;
    const displayTotal = Math.min(total, 20); // Limit for performance
    const remaining = total - subtracted;

    return (
      <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
        {[...Array(displayTotal)].map((_, idx) => {
          const isSubtracted = type === 'subtract' && idx >= remaining;

          return (
            <span
              key={idx}
              className={`text-3xl transition-all ${
                isSubtracted ? 'opacity-30 line-through' : ''
              }`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {theme.visualIcon}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4 mb-8">
      {/* Math expression */}
      <div className="text-6xl font-bold text-white mb-2" dir="ltr">
        {num1} {operator} {num2}
      </div>

      {/* Visual representation */}
      {type === 'multiply' ? renderMultiplyVisual() : renderAddSubVisual()}
    </div>
  );
};

export default VisualQuestion;
