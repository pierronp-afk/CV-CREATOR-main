import React from 'react';

/**
 * Hexagon-shaped skill rating (1-5).
 * variant: 'filled' (default) = hexagones pleins colorés
 *          'outlined'         = hexagones vides avec contour coloré (Smile v2)
 */
const HexagonRating = ({ score, onChange, color = "#2E86C1", variant = 'filled' }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((i) => {
      const isActive = i <= score;
      const isFilled = variant === 'filled';
      return (
        <svg
          key={i}
          viewBox="0 0 100 100"
          onClick={onChange ? () => onChange(i) : undefined}
          className={`w-3 h-3 ${onChange ? 'cursor-pointer hover:scale-125 transition-transform' : ''}`}
          style={{
            fill: isActive
              ? (isFilled ? color : 'transparent')
              : (isFilled ? '#E2E8F0' : 'transparent'),
            stroke: isActive ? color : '#CBD5E1',
            strokeWidth: isFilled ? 0 : 8
          }}
        >
          <polygon points="50 0, 100 25, 100 75, 50 100, 0 75, 0 25" />
        </svg>
      );
    })}
  </div>
);

export default HexagonRating;
