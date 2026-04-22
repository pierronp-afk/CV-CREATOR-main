import React from 'react';

/**
 * Hexagon-shaped skill rating (1-5).
 */
const HexagonRating = ({ score, onChange, color = "#2E86C1" }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((i) => (
      <svg 
        key={i} 
        viewBox="0 0 100 100" 
        onClick={onChange ? () => onChange(i) : undefined} 
        className={`w-3 h-3 ${onChange ? 'cursor-pointer hover:scale-125 transition-transform' : ''} ${i <= score ? 'fill-current hexagon-fill' : 'text-slate-200 fill-current'}`}
        style={i <= score ? { color } : {}}
      >
        <polygon points="50 0, 100 25, 100 75, 50 100, 0 75, 0 25" />
      </svg>
    ))}
  </div>
);

export default HexagonRating;
