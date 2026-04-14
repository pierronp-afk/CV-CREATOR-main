import React, { useState } from 'react';
import { 
  Briefcase, Plus, Trash2, X, ChevronUp, ChevronDown, 
  GripVertical, ToggleLeft, ToggleRight, FilePlus 
} from 'lucide-react';
import { handleImageError } from '../../utils/cv';
import { ButtonUI, InputUI, RichTextareaUI, DropZoneUI } from '../ui/FormUI';

export default function StepExperiences({
  cvData,
  updateExperience,
  addExperience,
  removeExperience,
  moveItem,
  updateCvData,
}) {
  // Local drag state
  const [draggedExpIndex, setDraggedExpIndex] = useState(null);

  const handleDragOver = (e) => e.preventDefault();

  const handleExpDragStart = (index) => setDraggedExpIndex(index);
  const handleExpDrop = (targetIndex) => {
    if (draggedExpIndex === null || draggedExpIndex === targetIndex) { setDraggedExpIndex(null); return; }
    const list = [...cvData.experiences];
    const [moved] = list.splice(draggedExpIndex, 1);
    list.splice(targetIndex, 0, moved);
    updateCvData(prev => ({ ...prev, experiences: list }));
    setDraggedExpIndex(null);
  };

  return (
     <div className="space-y-8 animate-in slide-in-from-right duration-300 text-left">
       <div className="flex justify-between items-center mb-4 text-[#2E86C1] text-left">
         <div className="flex items-center gap-3 text-left">
           <Briefcase size={24} />
           <h2 className="text-lg font-bold uppercase text-left">Expériences</h2>
         </div>
         <ButtonUI onClick={addExperience} variant="outline" className="px-3 py-1 text-xs text-left"><Plus size={14} /> Ajouter</ButtonUI>
       </div>
       
       {(cvData.experiences || []).map((exp, index) => (
         <div 
           key={exp.id} 
           className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative group mb-4 text-left transition-all ${draggedExpIndex === index ? 'opacity-30 border-dashed border-blue-400' : ''}`}
           draggable
           onDragStart={() => handleExpDragStart(index)}
           onDragOver={handleDragOver}
           onDrop={() => handleExpDrop(index)}
         >
           <div className="absolute top-4 left-4 text-slate-200 group-hover:text-slate-400 cursor-grab">
              <GripVertical size={20}/>
           </div>

           <div className="absolute top-4 right-4 flex gap-1 text-left">
             <button onClick={() => moveItem('experiences', index, 'up')} disabled={index === 0} className="text-slate-300 hover:text-blue-500 disabled:opacity-20 transition-colors text-left"><ChevronUp size={18}/></button>
             <button onClick={() => moveItem('experiences', index, 'down')} disabled={index === cvData.experiences.length - 1} className="text-slate-300 hover:text-blue-500 disabled:opacity-20 transition-colors text-left"><ChevronDown size={18}/></button>
             <button onClick={() => removeExperience(exp.id)} className="text-red-300 hover:text-red-500 ml-1 text-left"><Trash2 size={16}/></button>
           </div>

           <div className="pl-8">
             <div className="mb-4 text-left">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Logo Client (Import Manuel)</span>
                <DropZoneUI 
                  onFile={(file) => {
                    const reader = new FileReader();
                    reader.onload = (ev) => updateExperience(exp.id, 'client_logo', ev.target.result);
                    reader.readAsDataURL(file);
                  }}
                  label={exp.client_logo ? "Changer Logo" : "Charger Logo"}
                  className="h-20 bg-slate-50 border-slate-200"
                />
                {exp.client_logo && (
                  <div className="mt-2 relative inline-block">
                     <img src={exp.client_logo} onError={handleImageError} className="h-12 w-auto object-contain bg-white rounded border p-1" alt="" />
                     <button onClick={() => updateExperience(exp.id, 'client_logo', null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-sm"><X size={10}/></button>
                  </div>
                )}
             </div>

             {/* SAUT DE PAGE MANUEL RÉINTÉGRÉ */}
             <div className="mb-4 flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100 text-left">
                <div className="flex items-center gap-2 text-left">
                  <FilePlus size={16} className="text-[#2E86C1]"/>
                  <span className="text-xs font-bold text-slate-600 text-left">Saut de page manuel</span>
                </div>
                <button onClick={() => updateExperience(exp.id, 'forceNewPage', !exp.forceNewPage)} className="text-left">
                  {exp.forceNewPage ? <ToggleRight className="text-green-500" size={24}/> : <ToggleLeft className="text-slate-300" size={24}/>}
                </button>
             </div>

             <InputUI label="Nom du Client" value={exp.client_name} onChange={(v) => updateExperience(exp.id, 'client_name', v)} />
             <InputUI label="Rôle" value={exp.role} onChange={(v) => updateExperience(exp.id, 'role', v)} />
             <div className="grid grid-cols-2 gap-4 text-left">
               <InputUI label="Période" value={exp.period} onChange={(v) => updateExperience(exp.id, 'period', v)} />
               <InputUI label="Environnement Tech" value={Array.isArray(exp.tech_stack) ? exp.tech_stack.join(', ') : exp.tech_stack} onChange={(v) => updateExperience(exp.id, 'tech_stack', String(v).split(',').map(s=>s.trim()))} />
             </div>
             <RichTextareaUI label="Contexte" value={exp.context} onChange={(v) => updateExperience(exp.id, 'context', v)} />
             <RichTextareaUI label="Réalisation" value={exp.phases} onChange={(v) => updateExperience(exp.id, 'phases', v)} />
           </div>
         </div>
       ))}
     </div>
  );
}
