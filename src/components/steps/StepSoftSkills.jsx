import React from 'react';
import { Hexagon } from 'lucide-react';
import { InputUI } from '../ui/FormUI';

export default function StepSoftSkills({ cvData, updateCvData }) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right transition-all text-left">
        <div className="flex items-center gap-3 mb-4 text-[#3b72ff] text-left"><Hexagon size={24} /><h2 className="text-lg font-bold uppercase text-left">Soft Skills</h2></div>
        {[0, 1, 2].map(i => (<InputUI key={i} label={`Hexagone #${i+1}`} value={cvData.soft_skills[i]} onChange={(v) => {const s = [...cvData.soft_skills]; s[i] = v; updateCvData(p => ({...p, soft_skills: s}));}} />))}
    </div>
  );
}
