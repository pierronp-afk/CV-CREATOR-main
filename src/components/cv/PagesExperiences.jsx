import React from 'react';
import A4Page from './A4Page';
import CornerTriangle from './CornerTriangle';
import HeaderSmall from '../ui/HeaderSmall';
import Footer from '../ui/Footer';
import ExperienceItem from './ExperienceItem';
import { getBrand } from '../../config/brands';


/**
 * CV Pages focusing on professional experiences, with multiple pages if needed.
 */
const PagesExperiences = ({ cvData, experiencePages }) => {
  const brand = getBrand(cvData.brandId);

  return (
    <>
      {experiencePages.map((chunk, pageIndex) => (
        <A4Page key={pageIndex}>
          <CornerTriangle brandId={cvData.brandId} customLogo={cvData.smileLogo} />
          <HeaderSmall 
            isAnonymous={cvData.isAnonymous} 
            profile={cvData.profile} 
            role={cvData.profile.current_role} 
            logo={cvData.smileLogo} 
            brandId={cvData.brandId}
          />
          <div className="flex justify-between items-end border-b border-slate-200 pb-2 mb-8 mt-8 px-12 flex-shrink-0 text-left">
            <h3 className="text-xl font-bold uppercase tracking-wide font-montserrat" style={{ color: brand.primary }}>
              {pageIndex === 0 ? "Mes dernières expériences" : "Expériences (Suite)"}
            </h3>
            <span className="text-[10px] font-bold text-[#666666] uppercase text-left">Références</span>
          </div>
          <div className="flex-1 px-12 pb-32 overflow-hidden print:overflow-visible text-left">
            {chunk.map((exp) => (<ExperienceItem key={exp.id} exp={exp} brandId={cvData.brandId} />))}
          </div>
          <Footer brandId={cvData.brandId} />
        </A4Page>
      ))}
    </>
  );
};

export default PagesExperiences;
