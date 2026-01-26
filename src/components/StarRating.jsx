import React from 'react';
import { Star } from 'lucide-react';

// Star rating display component
const StarRating = ({
  stars = 0,
  maxStars = 3,
  size = 'medium',
  showEmpty = true,
  className = '',
}) => {
  // Size variants
  const sizeMap = {
    small: 16,
    medium: 24,
    large: 32,
    xlarge: 48,
  };

  const iconSize = sizeMap[size] || sizeMap.medium;

  return (
    <div className={`flex gap-1 ${className}`}>
      {[...Array(maxStars)].map((_, index) => (
        <Star
          key={index}
          size={iconSize}
          className={
            index < stars
              ? 'text-yellow-400 fill-yellow-400'
              : showEmpty
              ? 'text-gray-400/50'
              : 'hidden'
          }
        />
      ))}
    </div>
  );
};

export default StarRating;
