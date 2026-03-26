import React from 'react';
import { Cpu, Factory, Award, GraduationCap } from 'lucide-react';
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
  return (
    <A4Page>
      <CornerTriangle customLogo={cvData.smileLogo} />
      <HeaderSmall 
        isAnonymous={cvData.isAnonymous} 
        profile={cvData.profile} 
        role={cvData.profile.current_role} 
        logo={cvData.smileLogo} 
      />
      <div className="grid grid-cols-12 gap-10 mt-8 h-full px-12 flex-1 pb-32 overflow-hidden print:overflow-visible text-left">
          <div className="col-span-5 border-r border-slate-100 pr-8 text-left">
            <h3 className="text-lg font-bold text-[#2E86C1] uppercase tracking-wide font-montserrat mb-8 flex items-center gap-2 text-left">
              <Cpu size={20}/> Mes Compétences
            </h3>
            <div className="space-y-8 text-left">
              {Object.entries(cvData.skills_categories || {}).map(([cat, skills]) => (
                <div key={cat}>
                  <h4 className="text-[10px] font-bold text-[#999999] uppercase tracking-widest border-b border-slate-100 pb-2 mb-3 text-left">
                    {String(cat)}
                  </h4>
                  <div className="space-y-3 text-left">
                    {(skills || []).map((skill, i) => (
                      <div key={i} className="flex items-center justify-between text-left">
                        <span className="text-xs font-bold text-[#333333] uppercase text-left">
                          {String(skill.name)}
                        </span>
                        <HexagonRating score={skill.rating} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-7 flex flex-col gap-10 text-left">
            {cvData.showSecteur && (cvData.connaissances_sectorielles || []).length > 0 && (
              <section className="text-left">
                <h3 className="text-lg font-bold text-[#2E86C1] uppercase tracking-wide font-montserrat mb-4 flex items-center gap-2 text-left">
                  <Factory size={20}/> Connaissances Sectorielles
                </h3>
                <div className="flex flex-wrap gap-2 text-left">
                  {(cvData.connaissances_sectorielles || []).map((s, i) => (
                    <span key={i} className="border-2 border-[#2E86C1] text-[#2E86C1] text-[10px] font-black px-3 py-1 rounded uppercase tracking-wider text-left">
                      {String(s)}
                    </span>
                  ))}
                </div>
              </section>
            )}
            {cvData.showCertif && (cvData.certifications || []).length > 0 && (
              <section className="text-left">
                <h3 className="text-lg font-bold text-[#2E86C1] uppercase tracking-wide font-montserrat mb-4 flex items-center gap-2 text-left">
                  <Award size={20}/> Certifications
                </h3>
                <div className="grid grid-cols-2 gap-4 text-left">
                  {cvData.certifications.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 bg-slate-50 p-2 rounded text-left">
                      {c.logo && c.logo !== "null" && (
                        <img src={c.logo} onError={handleImageError} className="w-8 h-8 object-contain" alt={String(c.name)} />
                      )}
                      <span className="text-[10px] font-bold text-slate-700 uppercase leading-tight text-left">
                        {String(c.name)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
            <section className="text-left">
              <h3 className="text-lg font-bold text-[#2E86C1] uppercase tracking-wide font-montserrat mb-6 flex items-center gap-2 text-left">
                <GraduationCap size={20}/> Ma Formation
              </h3>
              <div className="space-y-4 text-left">
                {(cvData.education || []).map((edu, i) => (
                  <div key={i} className="border-l-2 border-slate-100 pl-4 text-left">
                    <span className="text-[10px] font-bold text-[#999999] block mb-1 text-left">
                      {String(edu.year)}
                    </span>
                    <h4 className="text-xs font-bold text-[#333333] uppercase leading-tight text-left">
                      {String(edu.degree)}
                    </h4>
                    <span className="text-[9px] text-[#2E86C1] font-medium uppercase text-left">
                      {String(edu.location)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
      </div>
      <Footer />
    </A4Page>
  );
};

export default PageCompetences;
