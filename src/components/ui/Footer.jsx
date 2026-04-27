import React from 'react';

import { getBrand } from '../../config/brands';

/**
 * Standard footer for all pages.
 */
const Footer = ({ brandId }) => {
  const brand = getBrand(brandId);
  return (
    <div className="absolute bottom-8 left-12 right-12 border-t border-slate-100 pt-4 flex justify-between items-center bg-white flex-shrink-0 text-[8px] font-bold">
      <div className="text-[#999999] uppercase tracking-widest text-left">
        {brand.footerText} 
        <span className="ml-1" style={{ color: brand.primary }}>{brand.footerTagline}</span>
      </div>
      <div className="text-[#333333]">{brand.footerHashtag}</div>
    </div>
  );
};

export default Footer;
