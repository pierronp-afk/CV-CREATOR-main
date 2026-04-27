import React from 'react';
import { formatTextForPreview, handleImageError } from '../../utils/cv';
import { getBrand } from '../../config/brands';


/**
 * Individual experience entry with client logo, role, context, and tech stack.
 */
const ExperienceItem = ({ exp, brandId }) => {
  const brand = getBrand(brandId);

  // Helper pour vérifier si une chaîne formatée (pouvant contenir des tags HTML vides) est réellement remplie
  const isContentEmpty = (text) => {
    if (!text) return true;
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    return cleanText === "";
  };

  const hasContext = !isContentEmpty(exp.context);
  const hasPhases = !isContentEmpty(exp.phases);
  const hasTech = exp.tech_stack && Array.isArray(exp.tech_stack) && exp.tech_stack.filter(t => t && t.trim() !== "").length > 0;

  return (
    <div className="grid grid-cols-12 gap-6 mb-8 break-inside-avoid print:break-inside-avoid text-left experience-item">
      <div className="col-span-2 flex flex-col items-center pt-2 text-left">
        <div className="w-16 h-16 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center bg-white mb-2 p-1 text-center">
          {exp.client_logo && exp.client_logo !== "null" ? (
            <img src={exp.client_logo} onError={handleImageError} className="max-w-full max-h-full object-contain" alt="Logo Client" />
          ) : (
            <span className="text-[8px] font-black uppercase leading-tight px-1 break-words" style={{ color: brand.primary }}>
              {String(exp.client_name || '')}
            </span>
          )}
        </div>
      </div>
      <div className="col-span-10 border-l border-slate-100 pl-6 pb-4 text-left">
        <div className="flex justify-between items-baseline mb-3">
           <h4 className="text-lg font-bold text-[#333333] uppercase">{String(exp.client_name || '')} <span className="font-normal text-[#666666]">| {String(exp.role || '')}</span></h4>
           <span className="text-xs font-bold uppercase" style={{ color: brand.primary }}>{String(exp.period || '')}</span>
        </div>
        
        {hasContext && (
          <div className="mb-4 text-left">
             <h5 className="text-[10px] font-bold uppercase mb-1" style={{ color: brand.primary }}>Contexte</h5>
             <div className="text-sm text-[#333333] leading-relaxed break-words text-justify" dangerouslySetInnerHTML={{__html: formatTextForPreview(exp.context)}}></div>
          </div>
        )}

        {(hasPhases || hasTech) && (
          <div className="mt-4 pt-4 border-t border-slate-50 space-y-4 text-left">
             {hasPhases && (
               <div className="text-left">
                  <h5 className="text-[10px] font-bold text-[#999999] uppercase mb-1">Réalisation</h5>
                  <div className="text-xs font-medium text-[#333333] break-words text-justify" dangerouslySetInnerHTML={{__html: formatTextForPreview(exp.phases)}}></div>
               </div>
             )}
             {hasTech && (
               <div className="text-left">
                  <h5 className="text-[10px] font-bold text-[#999999] uppercase mb-1">Environnement</h5>
                  <div className="flex flex-wrap gap-1 text-left">
                    {exp.tech_stack.filter(t => t && t.trim() !== "").map((t, i) => (
                      <span key={i} className="text-xs font-bold px-2 py-0.5 rounded" style={{ color: brand.primary, backgroundColor: brand.accentBg }}>{String(t)}</span>
                    ))}
                  </div>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperienceItem;
