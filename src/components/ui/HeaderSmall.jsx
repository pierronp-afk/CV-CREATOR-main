import React from 'react';
import { handleImageError } from '../../utils/cv';

import { getBrand } from '../../config/brands';

/**
 * Small header component used for secondary pages.
 */
const HeaderSmall = ({ isAnonymous, profile, role, logo, brandId }) => {
  const brand = getBrand(brandId);
  const nameDisplay = isAnonymous 
    ? `${String(profile.firstname?.[0] || '').toUpperCase()}${String(profile.lastname?.substring(0, 3) || '').toUpperCase()}` 
    : `${profile.firstname} ${profile.lastname}`;
    
  return (
    <div 
      className="flex justify-between items-start border-b-2 pb-4 pt-6 px-12 flex-shrink-0 text-left"
      style={{ borderColor: brand.primary }}
    >
      <div className="w-12 h-12 flex items-center justify-center text-left">
          {logo && logo !== "null" && <img src={logo} onError={handleImageError} className="max-w-full max-h-full object-contain brightness-0 invert" alt="Logo" />}
      </div>
      <div className="text-right">
        <h3 className="text-sm font-bold text-[#333333] uppercase">{String(nameDisplay)}</h3>
        <p className="text-[10px] font-bold text-[#999999] uppercase">{String(role || '')}</p>
      </div>
    </div>
  );
};

export default HeaderSmall;
