import React from 'react';

// Progress bar component for showing game progress
const ProgressBar = ({
  current,
  total,
  theme = null,
  showLabel = true,
  labelLeft = '',
  labelRight = '',
  height = 'medium',
}) => {
  const percentage = (current / total) * 100;

  // Height variants
  const heightStyles = {
    small: 'h-2',
    medium: 'h-4',
    large: 'h-6',
  };

  // Get fill color based on theme
  const getFillColor = () => {
    if (theme) {
      return theme.primarySolid || theme.primary.split(' ')[0];
    }
    return 'bg-indigo-600';
  };

  return (
    <div className="w-full">
      {showLabel && (labelLeft || labelRight) && (
        <div className="flex justify-between items-center mb-3">
          <span className="text-2xl text-white font-bold">{labelLeft}</span>
          <span className="text-2xl text-white font-bold">{labelRight}</span>
        </div>
      )}
      <div className={`w-full bg-white/20 rounded-full ${heightStyles[height]} overflow-hidden`}>
        <div
          className={`h-full ${getFillColor()} transition-all duration-500 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
