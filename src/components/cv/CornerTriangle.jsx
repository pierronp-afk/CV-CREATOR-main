import React from 'react';
import { handleImageError } from '../../utils/cv';

/**
 * Corner triangle background with optional custom logo.
 */
const CornerTriangle = ({ customLogo }) => (
  <div className="absolute top-0 left-0 w-[170px] h-[170px] z-50 pointer-events-none print:w-[150px] print:h-[150px]">
    <div className="absolute top-0 left-0 w-full h-full bg-[#2E86C1] triangle-bg" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
    {customLogo && customLogo !== "null" && (
      <div className="absolute top-[-5px] left-[-5px] w-[135px] h-[135px] flex items-center justify-center">
          <img src={customLogo} onError={handleImageError} className="max-w-full max-h-full object-contain" style={{ transform: 'rotate(-45deg)' }} alt="Logo" />
      </div>
    )}
  </div>
);

export default CornerTriangle;
