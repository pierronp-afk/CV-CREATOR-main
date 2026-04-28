import React from 'react';

/**
 * Hexagon-shaped skill rating (1-5).
 * variant: 'filled' (default) = actifs remplis en color, inactifs remplis en gris clair #E2E8F0
 *          'outlined'         = actifs remplis en color (pleins), inactifs vides avec contour gris (#CBD5E1)
 *          Smile v2 utilise 'outlined' pour que seuls les inactifs soient en outlined.
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
          overflow="visible"
          onClick={onChange ? () => onChange(i) : undefined}
          className={`w-3 h-3 ${onChange ? 'cursor-pointer hover:scale-125 transition-transform' : ''}`}
          style={
            isFilled
              ? {
                  fill: isActive ? color : '#E2E8F0',
                  stroke: 'none',
                  strokeWidth: 0
                }
              : {
                  fill: isActive ? color : 'transparent',
                  stroke: isActive ? 'none' : '#CBD5E1',
                  strokeWidth: isActive ? 0 : 8,
                  strokeLinejoin: 'round'
                }
          }
        >
          <polygon points="50 0, 100 25, 100 75, 50 100, 0 75, 0 25" />
        </svg>
      );
    })}
  </div>
);

export default HexagonRating;
