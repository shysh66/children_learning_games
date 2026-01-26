import React from 'react';

// Reusable button component with theme support
const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
  theme = null,
  icon = null,
}) => {
  // Base styles
  const baseStyles = `
    font-black rounded-2xl transform transition-all duration-300
    flex items-center justify-center gap-3
    ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105 hover:shadow-2xl'}
  `;

  // Size variants
  const sizeStyles = {
    small: 'px-4 py-2 text-lg',
    medium: 'px-8 py-4 text-xl',
    large: 'px-10 py-6 text-3xl',
    xlarge: 'px-12 py-8 text-4xl',
  };

  // Variant styles (uses theme if provided)
  const getVariantStyles = () => {
    if (theme) {
      switch (variant) {
        case 'primary':
          return theme.primary + ' text-white shadow-2xl';
        case 'secondary':
          return theme.secondary + ' text-white shadow-2xl';
        case 'ghost':
          return 'bg-white/20 hover:bg-white/30 text-white';
        case 'card':
          return theme.cardBg + ' text-white';
        default:
          return theme.primary + ' text-white';
      }
    }

    // Default styles without theme
    switch (variant) {
      case 'primary':
        return 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl';
      case 'secondary':
        return 'bg-purple-600 hover:bg-purple-500 text-white shadow-2xl';
      case 'ghost':
        return 'bg-white/20 hover:bg-white/30 text-white';
      default:
        return 'bg-indigo-600 hover:bg-indigo-500 text-white';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${getVariantStyles()} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
