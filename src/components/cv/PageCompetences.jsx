import React from 'react';
import { Cpu, Factory, Award, GraduationCap, Languages } from 'lucide-react';
import A4Page from './A4Page';
import CornerTriangle from './CornerTriangle';
import HeaderSmall from '../ui/HeaderSmall';
import HexagonRating from '../ui/HexagonRating';
import Footer from '../ui/Footer';
import { handleImageError } from '../../utils/cv';

/**
 * CV Page focusing on skills, sectoral knowledge, certifications, and education.
 */
const PageCompetences = ({ cvData }) => {
  const skillsCategories = cvData.skills_categories || {};
  const categoriesCount = Object.keys(skillsCategories).length;
  const gridColsClass = 
    categoriesCount <= 1 ? 'grid-cols-1' :
    categoriesCount === 2 ? 'grid-cols-2' :
    categoriesCount === 3 ? 'grid-cols-3' :
    'grid-cols-4';

  return (
    <A4Page>
      <CornerTriangle customLogo={cvData.smileLogo} />
      <HeaderSmall 
        isAnonymous={cvData.isAnonymous} 
        profile={cvData.profile} 
        role={cvData.profile.current_role} 
        logo={cvData.smileLogo} 
      />
      <div className="flex flex-col h-full px-12 flex-1 pb-32 overflow-hidden print:overflow-visible">
        
        {/* === BLOC HAUT : COMPÉTENCES (taille naturelle, pas de flex-1) === */}
        <section className="flex-shrink-0 mt-8">
          <h3 className="text-lg font-bold text-[#2E86C1] uppercase tracking-wide font-montserrat mb-4 flex items-center gap-2">
            <Cpu size={20}/> Mes Compétences
          </h3>
          <div className={`grid ${gridColsClass} gap-x-6 gap-y-8`}>
            {Object.entries(skillsCategories).map(([cat, skills]) => (
              <div key={cat} className="break-inside-avoid skill-category">
                <h4 className="text-[9px] font-bold text-[#999999] uppercase tracking-widest border-b border-slate-100 pb-1.5 mb-2">
                  {String(cat)}
                </h4>
                <div className="space-y-2">
                  {(skills || []).map((skill, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-[#333333] uppercase leading-tight break-words">
                        {String(skill.name)}
                      </span>
                      <div>
                        <HexagonRating score={skill.rating} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* === ESPACE FLEXIBLE QUI PUSH LE BLOC BAS AU CENTRE === */}
        <div className="flex-1 flex flex-col justify-center min-h-0">
          
          {/* Séparateur centré */}
          <div className="border-t border-slate-200 mb-8"></div>

          {/* BLOC BAS : 2 colonnes */}
          <div className="grid grid-cols-2 gap-10">
            
            {/* COLONNE GAUCHE : Secteurs + Certifications */}
            <div className="flex flex-col gap-6">
              {cvData.showSecteur && (cvData.connaissances_sectorielles || []).length > 0 && (
                <section>
                  <h3 className="text-lg font-bold text-[#2E86C1] uppercase tracking-wide font-montserrat mb-3 flex items-center gap-2">
                    <Factory size={20}/> Connaissances Sectorielles
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {(cvData.connaissances_sectorielles || []).map((s, i) => (
                      <span key={i} className="border-2 border-[#2E86C1] text-[#2E86C1] text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
                        {String(s)}
                      </span>
                    ))}
                  </div>
                </section>
              )}
              {cvData.showCertif && (cvData.certifications || []).length > 0 && (
                <section>
                  <h3 className="text-lg font-bold text-[#2E86C1] uppercase tracking-wide font-montserrat mb-3 flex items-center gap-2">
                    <Award size={20}/> Certifications
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {cvData.certifications.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-50 p-1.5 rounded">
                        {c.logo && c.logo !== "null" && (
                          <img src={c.logo} onError={handleImageError} className="w-7 h-7 object-contain" alt={String(c.name)} />
                        )}
                        <span className="text-[10px] font-bold text-slate-700 uppercase leading-tight">{String(c.name)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* COLONNE DROITE : Formation + Langues */}
            <section>
              <h3 className="text-lg font-bold text-[#2E86C1] uppercase tracking-wide font-montserrat mb-4 flex items-center gap-2">
                <GraduationCap size={20}/> Ma Formation
              </h3>
              <div className="space-y-3">
                {(cvData.education || []).map((edu, i) => (
                  <div key={i} className="border-l-2 border-slate-100 pl-3">
                    <span className="text-[10px] font-bold text-[#999999] block">{String(edu.year)}</span>
                    <h4 className="text-xs font-bold text-[#333333] uppercase leading-tight">{String(edu.degree)}</h4>
                    <span className="text-[9px] text-[#2E86C1] font-medium uppercase">{String(edu.location)}</span>
                  </div>
                ))}
              </div>
              {(cvData.languages || []).length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <h4 className="text-[11px] font-bold text-[#2E86C1] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Languages size={14}/> Langues
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {cvData.languages.map((lang, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                        <span className="text-[10px] font-bold text-[#333333] uppercase">{String(lang.name)}</span>
                        <span className="text-[10px] font-black text-[#2E86C1] bg-white px-1.5 rounded">{String(lang.level)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Séparateur du bas (miroir visuel du haut pour equilibrer) */}
          <div className="border-t border-slate-200 mt-8 opacity-0"></div>
        </div>
      </div>
      <Footer />
    </A4Page>
  );
};

export default PageCompetences;
