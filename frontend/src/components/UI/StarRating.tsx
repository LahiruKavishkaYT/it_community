import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  totalRatings?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  showCount?: boolean;
  onChange?: (rating: number) => void;
  disabled?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  totalRatings = 0,
  size = 'md',
  interactive = false,
  showCount = false,
  onChange,
  disabled = false
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const handleStarClick = (starValue: number) => {
    if (interactive && !disabled && onChange) {
      onChange(starValue);
    }
  };

  const handleStarHover = (starValue: number) => {
    if (interactive && !disabled) {
      setHoverRating(starValue);
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (interactive && !disabled) {
      setHoverRating(0);
      setIsHovering(false);
    }
  };

  const displayRating = isHovering ? hoverRating : rating;
  const starArray = Array.from({ length: 5 }, (_, index) => index + 1);

  return (
    <div className="flex items-center gap-1">
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={handleMouseLeave}
      >
        {starArray.map((starValue) => {
          const isFilled = starValue <= displayRating;
          const isPartiallyFilled = 
            starValue > Math.floor(displayRating) && 
            starValue <= Math.ceil(displayRating) && 
            !interactive;

          return (
            <button
              key={starValue}
              type="button"
              className={`
                transition-all duration-200 
                ${interactive && !disabled 
                  ? 'hover:scale-110 cursor-pointer' 
                  : 'cursor-default'
                }
                ${disabled ? 'opacity-50' : ''}
              `}
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => handleStarHover(starValue)}
              disabled={disabled || !interactive}
            >
              <Star
                className={`
                  ${sizeClasses[size]}
                  transition-colors duration-200
                  ${isFilled
                    ? 'text-yellow-400 fill-yellow-400'
                    : isPartiallyFilled
                    ? 'text-yellow-400 fill-yellow-400/50'
                    : interactive && isHovering && starValue <= hoverRating
                    ? 'text-yellow-300 fill-yellow-300/30'
                    : 'text-gray-600 fill-transparent'
                  }
                `}
              />
            </button>
          );
        })}
      </div>
      
      {showCount && (
        <span className="text-sm text-gray-400 ml-1">
          ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
        </span>
      )}
      
      {!interactive && rating > 0 && (
        <span className="text-sm text-gray-300 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
