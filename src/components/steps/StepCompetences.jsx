import React, { useState } from 'react';
import { 
  GraduationCap, Plus, Trash2, X, ChevronUp, ChevronDown, GripVertical 
} from 'lucide-react';
import { handleImageError } from '../../utils/cv';
import { ButtonUI, InputUI, LogoSelectorUI } from '../ui/FormUI';
import HexagonRating from '../ui/HexagonRating';

export default function StepCompetences({
  cvData,
  updateCvData,
  addSecteur,
  removeSecteur,
  addCertification,
  removeCertification,
  updateEducation,
  addEducation,
  removeEducation,
  addSkillCategory,
  deleteCategory,
  addSkillToCategory,
  updateSkillInCategory,
  removeSkillFromCategory,
  moveItem,
}) {
  // Local state for inputs
  const [newSecteur, setNewSecteur] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSkillsInput, setNewSkillsInput] = useState({});

  // Local state for drag and drop
  const [draggedCertIndex, setDraggedCertIndex] = useState(null);
  const [draggedEduIndex, setDraggedEduIndex] = useState(null);
  const [draggedSkill, setDraggedSkill] = useState(null);
  const [draggedCategory, setDraggedCategory] = useState(null);

  const handleDragOver = (e) => e.preventDefault();

  const handleAddSkillToCategory = (cat) => { 
    const i = newSkillsInput[cat] || { name: '', rating: 3 }; 
    if (i.name) { 
      addSkillToCategory(cat, { name: i.name, rating: i.rating }); 
      setNewSkillsInput(p => ({ ...p, [cat]: { name: '', rating: 3 } })); 
    } 
  };
  const updateNewSkillInput = (cat, field, val) => { setNewSkillsInput(p => ({ ...p, [cat]: { ...(p[cat] || { name: '', rating: 3 }), [field]: val } })); };

  const handleSkillDragStart = (cat, index) => setDraggedSkill({ cat, index });
  const handleSkillDrop = (targetCat, targetIndex) => {
    if (!draggedSkill || draggedSkill.cat !== targetCat) { setDraggedSkill(null); return; }
    const skills = [...cvData.skills_categories[targetCat]];
    const [moved] = skills.splice(draggedSkill.index, 1);
    skills.splice(targetIndex, 0, moved);
    updateCvData(prev => ({ ...prev, skills_categories: { ...prev.skills_categories, [targetCat]: skills } }));
    setDraggedSkill(null);
  };

  const handleCategoryDragStart = (catName) => setDraggedCategory(catName);
  const handleCategoryDrop = (targetCatName) => {
    if (!draggedCategory || draggedCategory === targetCatName) { setDraggedCategory(null); return; }
    const keys = Object.keys(cvData.skills_categories);
    const fromIdx = keys.indexOf(draggedCategory);
    const toIdx = keys.indexOf(targetCatName);
    const newKeys = [...keys];
    const [moved] = newKeys.splice(fromIdx, 1);
    newKeys.splice(toIdx, 0, moved);
    const newCategories = {};
    newKeys.forEach(k => { newCategories[k] = cvData.skills_categories[k]; });
    updateCvData(prev => ({ ...prev, skills_categories: newCategories }));
    setDraggedCategory(null);
  };

  const handleEduDragStart = (index) => setDraggedEduIndex(index);
  const handleEduDrop = (targetIndex) => {
    if (draggedEduIndex === null || draggedEduIndex === targetIndex) { setDraggedEduIndex(null); return; }
    const list = [...cvData.education];
    const [moved] = list.splice(draggedEduIndex, 1);
    list.splice(targetIndex, 0, moved);
    updateCvData(prev => ({ ...prev, education: list }));
    setDraggedEduIndex(null);
  };

  const handleCertDragStart = (index) => setDraggedCertIndex(index);
  const handleCertDrop = (targetIndex) => {
    if (draggedCertIndex === null || draggedCertIndex === targetIndex) { setDraggedCertIndex(null); return; }
    const list = [...cvData.certifications];
    const [moved] = list.splice(draggedCertIndex, 1);
    list.splice(targetIndex, 0, moved);
    updateCvData(prev => ({ ...prev, certifications: list }));
    setDraggedCertIndex(null);
  };

  return (
     <div className="space-y-8 animate-in slide-in-from-right transition-all text-left">
       <div className="flex items-center gap-3 mb-4 text-[#2E86C1] text-left"><GraduationCap size={24} /><h2 className="text-lg font-bold uppercase text-left">Formation & Compétences</h2></div>
       
       {/* SECTION CERTIFICATIONS AVEC DRAG & DROP */}
       <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm text-left">
         <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 text-left">Secteur & Certifs</h3>
         <div className="flex gap-2 mb-4 text-left">
           <input className="flex-1 px-3 py-1.5 border rounded text-xs text-left" placeholder="Secteur..." value={newSecteur} onChange={e=>setNewSecteur(e.target.value)} onKeyDown={e=>e.key==='Enter' && (addSecteur(newSecteur), setNewSecteur(""))} />
           <ButtonUI variant="primary" className="p-1 h-auto text-left" onClick={() => { addSecteur(newSecteur); setNewSecteur(""); }}><Plus size={10}/></ButtonUI>
         </div>
         <div className="flex flex-wrap gap-1 mb-4 text-left">{(cvData.connaissances_sectorielles || []).map((s, i) => (<span key={i} className="bg-white text-[9px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 uppercase text-left">{s} <X size={10} className="cursor-pointer text-left" onClick={() => removeSecteur(i)}/></span>))}</div>
         
         <LogoSelectorUI 
           onSelect={addCertification} 
           label="Certifications (Suggestions Smile)" 
           suggestions={['drupal', 'scrumalliance', 'amazonwebservices', 'googlecloud', 'microsoftazure', 'symfony']}
         />
         
         <div className="mt-2 space-y-1 text-left">
            {(cvData.certifications || []).map((c, i) => (
              <div 
                key={i} 
                className={`flex items-center justify-between text-[10px] bg-white p-1.5 rounded border uppercase font-bold text-left gap-2 transition-all ${draggedCertIndex === i ? 'opacity-30 border-dashed border-blue-400' : 'hover:bg-blue-50/50 cursor-default'}`}
                draggable
                onDragStart={() => handleCertDragStart(i)}
                onDragOver={handleDragOver}
                onDrop={() => handleCertDrop(i)}
              >
                <GripVertical size={14} className="text-slate-300 cursor-grab active:cursor-grabbing" />
                {c.logo && <img src={c.logo} onError={handleImageError} className="w-5 h-5 object-contain" alt="" />}
                <span className="flex-1 text-left">{c.name}</span>
                <button onClick={()=>removeCertification(i)} className="text-slate-300 hover:text-red-500"><X size={12}/></button>
              </div>
            ))}
         </div>
       </div>

       {/* SECTION DIPLÔMES AVEC DRAG & DROP */}
       <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm text-left">
         <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 text-left">Parcours Académique</h3>
         {(cvData.education || []).map((edu, i) => (
            <div 
              key={i} 
              className={`bg-white p-3 rounded-lg border mb-3 relative group shadow-sm text-left transition-all ${draggedEduIndex === i ? 'opacity-30 border-dashed border-blue-400' : ''}`}
              draggable
              onDragStart={() => handleEduDragStart(i)}
              onDragOver={handleDragOver}
              onDrop={() => handleEduDrop(i)}
            >
              <div className="absolute top-2 left-2 text-slate-200 group-hover:text-slate-400 transition-colors cursor-grab active:cursor-grabbing">
                <GripVertical size={16}/>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 text-left">
                <button onClick={() => moveItem('education', i, 'up')} disabled={i === 0} className="text-slate-300 hover:text-blue-500 disabled:opacity-20 transition-colors text-left"><ChevronUp size={16}/></button>
                <button onClick={() => moveItem('education', i, 'down')} disabled={i === cvData.education.length - 1} className="text-slate-300 hover:text-blue-500 disabled:opacity-20 transition-colors text-left"><ChevronDown size={16}/></button>
                <button onClick={() => removeEducation(i)} className="text-slate-300 hover:text-red-500 ml-1 text-left"><Trash2 size={14}/></button>
              </div>
              <div className="pl-6">
                <InputUI label="Diplôme" value={edu.degree} onChange={v => updateEducation(i, 'degree', v)} />
                <div className="grid grid-cols-2 gap-2 text-left">
                  <InputUI label="Année" value={edu.year} onChange={v => updateEducation(i, 'year', v)} />
                  <InputUI label="Lieu" value={edu.location} onChange={v => updateEducation(i, 'location', v)} />
                </div>
              </div>
            </div>
         ))}
         <ButtonUI onClick={addEducation} variant="secondary" className="w-full text-xs py-2 mt-2 shadow-sm text-left">Ajouter Formation</ButtonUI>
       </div>

       {/* SECTION COMPÉTENCES */}
       <div className="bg-white p-4 rounded-xl border border-slate-200 text-left">
          <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 text-left">Niveau Compétences</h3>
          
          {/* AJOUT : Input nouvelle catégorie */}
          <div className="flex gap-2 mb-4 text-left">
            <input 
              className="flex-1 px-3 py-2 border rounded text-xs text-left focus:ring-2 focus:ring-[#2E86C1] outline-none" 
              placeholder="Nouvelle catégorie (ex: Outils...)" 
              value={newCategoryName} 
              onChange={(e) => setNewCategoryName(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && (addSkillCategory(newCategoryName), setNewCategoryName(""))} 
            />
            <ButtonUI variant="outline" className="px-3 text-left" onClick={() => { addSkillCategory(newCategoryName); setNewCategoryName(""); }}><Plus size={14}/></ButtonUI>
          </div>

           {Object.entries(cvData.skills_categories).map(([cat, skills], catIdx) => (
            <div 
              key={cat} 
              className={`mb-4 p-3 bg-slate-50 rounded-lg text-left relative transition-all ${draggedCategory === cat ? 'opacity-30 border-dashed border-2 border-blue-400' : ''}`}
              draggable
              onDragStart={() => handleCategoryDragStart(cat)}
              onDragOver={handleDragOver}
              onDrop={() => handleCategoryDrop(cat)}
            >
              <div className="flex justify-between items-center mb-2 text-left">
                <div className="flex items-center gap-2 flex-1">
                  <GripVertical size={16} className="text-slate-300 cursor-grab active:cursor-grabbing flex-shrink-0" />
                  <h4 className="text-xs font-bold uppercase text-left">{cat}</h4>
                </div>
                <button onClick={() => deleteCategory(cat)} className="text-red-300 hover:text-red-500 transition-colors"><Trash2 size={12}/></button>
              </div>
              
              <div className="space-y-1 mb-3 text-left">
                {(skills || []).map((skill, idx) => (
                  <div 
                    key={`${cat}-${idx}`} 
                    className="flex items-center justify-between text-xs bg-white p-1.5 rounded shadow-sm text-left gap-2 group/item"
                    draggable
                    onDragStart={() => handleSkillDragStart(cat, idx)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleSkillDrop(cat, idx)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                       <GripVertical size={14} className="text-slate-300 cursor-grab flex-shrink-0" />
                       <input 
                         className="bg-transparent outline-none flex-1 font-medium text-left truncate" 
                         value={skill.name} 
                         onChange={(e) => updateSkillInCategory(cat, idx, 'name', e.target.value)} 
                       />
                    </div>
                    <HexagonRating score={skill.rating} onChange={(r) => updateSkillInCategory(cat, idx, 'rating', r)} />
                    <button onClick={() => removeSkillFromCategory(cat, idx)} className="text-slate-300 hover:text-red-500 transition-colors p-0.5 flex-shrink-0"><X size={12}/></button>
                  </div>
                ))}
              </div>

              {/* AJOUT : Input nouvel item */}
              <div className="flex gap-1 text-left pl-6 pt-2 border-t border-slate-100">
                <input 
                  className="flex-1 px-2 py-1 text-[10px] border rounded text-left focus:ring-1 focus:ring-[#2E86C1] outline-none" 
                  placeholder="Ajouter un item..." 
                  value={newSkillsInput[cat]?.name || ''} 
                  onChange={(e) => updateNewSkillInput(cat, 'name', e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkillToCategory(cat)} 
                />
                <ButtonUI variant="primary" className="p-1 h-auto text-left" onClick={() => handleAddSkillToCategory(cat)}><Plus size={10}/></ButtonUI>
              </div>

            </div>
          ))}
       </div>
     </div>
  );
}
