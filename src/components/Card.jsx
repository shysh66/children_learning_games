import React from 'react';

// Reusable card component with theme support
const Card = ({
  children,
  onClick,
  className = '',
  theme = null,
  hoverable = false,
  padding = 'medium',
}) => {
  // Base styles
  const baseStyles = 'rounded-3xl transition-all duration-300';

  // Padding variants
  const paddingStyles = {
    none: '',
    small: 'p-4',
    medium: 'p-8',
    large: 'p-10',
    xlarge: 'p-12',
  };

  // Get background style based on theme
  const getBgStyle = () => {
    if (theme) {
      return theme.cardBg;
    }
    return 'bg-white/20 backdrop-blur-sm border-2 border-white/30';
  };

  // Hover styles
  const hoverStyles = hoverable
    ? 'cursor-pointer hover:scale-105 hover:shadow-2xl'
    : '';

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${paddingStyles[padding]} ${getBgStyle()} ${hoverStyles} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
