import React from 'react';

/**
 * Basic A4 page container.
 */
const A4Page = ({ children, className = "" }) => (
  <div className={`A4-page bg-white relative overflow-hidden print:overflow-visible mx-auto shadow-2xl flex-shrink-0 mb-10 ${className}`} style={{ width: '210mm', height: '297mm', display: 'flex', flexDirection: 'column' }}>
    {children}
  </div>
);

export default A4Page;
