import React from 'react';
import { 
  User, X, Shield, Trash2, LayoutTemplate, List, 
  ToggleLeft, ToggleRight, Eye, EyeOff 
} from 'lucide-react';
import { handleImageError } from '../../utils/cv';
import { InputUI, RichTextareaUI, DropZoneUI, LogoSelectorUI } from '../ui/FormUI';

export default function StepProfil({
  cvData,
  updateCvData,
  handleProfileChange,
  handlePhotoUpload,
  handleSmileLogo,
  addTechLogo,
  removeTechLogo,
  onShowPrivacy,
  onShowPurge,
}) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right transition-all text-left">
      <div className="flex items-center gap-3 mb-4 text-[#3b72ff] text-left"><User size={24} /><h2 className="text-lg font-bold uppercase text-left">Profil</h2></div>
      
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-3">
        <h3 className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Mise en page des documents</h3>
        <button 
          onClick={() => updateCvData(p => ({...p, swapPages: !p.swapPages}))}
          className="w-full flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200 shadow-sm group hover:border-blue-400 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              {cvData.swapPages ? <List size={20}/> : <LayoutTemplate size={20}/>}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-700">Ordre des pages</p>
              <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">
                {cvData.swapPages ? "Expériences d'abord" : "Compétences d'abord"}
              </p>
            </div>
          </div>
          {cvData.swapPages ? <ToggleRight className="text-blue-600" size={28}/> : <ToggleLeft className="text-slate-300" size={28}/>}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-left">
        <div>
          <InputUI label="Prénom" value={cvData.profile.firstname} onChange={(v) => handleProfileChange('firstname', v)} />
          <InputUI label="NOM" value={cvData.profile.lastname} onChange={(v) => handleProfileChange('lastname', v)} />
        </div>
        <div className="p-3 border border-slate-200 bg-slate-50 rounded-lg flex flex-col gap-2 text-left">
          <span className="text-[10px] font-bold text-slate-600 uppercase flex items-center justify-between text-left">Photo Profil</span>
          <DropZoneUI onFile={handlePhotoUpload} label={cvData.profile.photo ? "Changer" : "Glisser-déposer photo"} icon={<User size={16}/>} className="h-24 bg-white text-left" />
          <button 
            onClick={() => updateCvData(p => ({...p, hidePhoto: !p.hidePhoto}))}
            className="w-full flex items-center justify-between bg-white p-2 mt-2 rounded-lg border border-slate-200 group hover:border-[#ff8054] transition-all text-xs"
          >
            <div className="flex items-center gap-2">
              {cvData.hidePhoto ? <EyeOff size={14} className="text-slate-500"/> : <Eye size={14} className="text-[#3b72ff]"/>}
              <span className="font-bold text-slate-600">
                {cvData.hidePhoto ? "Photo masquée" : "Photo visible"}
              </span>
            </div>
            {cvData.hidePhoto ? <ToggleLeft className="text-slate-300" size={22}/> : <ToggleRight className="text-[#3b72ff]" size={22}/>}
          </button>
        </div>
      </div>
      <InputUI label="Poste Actuel" value={cvData.profile.current_role} onChange={(v) => handleProfileChange('current_role', v)} />
      <div className="grid grid-cols-2 gap-4 text-left">
        <InputUI label="Années XP" value={cvData.profile.years_experience} onChange={(v) => handleProfileChange('years_experience', v)} />
        <InputUI label="Techno Principale" value={cvData.profile.main_tech} onChange={(v) => handleProfileChange('main_tech', v)} />
      </div>
      <RichTextareaUI label="Bio / Résumé" value={cvData.profile.summary} onChange={(val) => handleProfileChange('summary', val)} />
      
      <div className="bg-white p-4 rounded-xl border border-slate-200 text-left">
        <LogoSelectorUI 
          onSelect={addTechLogo} 
          label="Technologies (Suggestions Smile)" 
          suggestions={[
            'drupal', 'symfony', 'php', 'react', 'python', 
            { name: 'powerbi', src: 'https://www.vectorlogo.zone/logos/microsoft_powerbi/microsoft_powerbi-icon.svg' },
            'snowflake', 'databricks', 'apachenifi', 
            { name: 'java', src: 'https://www.vectorlogo.zone/logos/java/java-icon.svg' },
            { name: 'amazonaws', src: 'https://www.vectorlogo.zone/logos/amazon_aws/amazon_aws-icon.svg' },
            { name: 'googlecloud', src: 'https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg' },
            { name: 'azure', src: 'https://www.vectorlogo.zone/logos/microsoft_azure/microsoft_azure-icon.svg' },
            'mysql', 'postgresql', 'docker', 'git', 'javascript', 'tailwindcss',
            'linux', 'android', 
            { name: 'freertos', src: 'https://img.icons8.com/color/48/000000/freertos.png' },
            { name: 'zephyr', src: 'https://img.icons8.com/color/48/000000/zephyr.png' },
            { name: 'yocto', src: 'https://img.icons8.com/color/48/000000/yocto.png' },
            'openwrt',
            'gstreamer', 'opencv', 'qt', 'c', 'cplusplus', 'springboot', 'terraform'
          ]}
        />
        
        <div className="flex flex-wrap gap-2 mt-4 p-4 bg-slate-900 rounded-lg border border-slate-800 shadow-inner text-left">
          {cvData.profile.tech_logos?.map((logo, i) => {
            const src = typeof logo === 'string' 
              ? `https://cdn.simpleicons.org/${logo.toLowerCase().replace(/\s+/g, '')}` 
              : (logo.src || logo.url);
            const name = typeof logo === 'string' ? logo : (logo.name || logo.slug);
            return (
              <div key={i} className="relative group bg-white/10 p-2 rounded-md border border-white/5 transition-colors hover:bg-white/20 text-left">
                <img src={src} onError={handleImageError} className="w-6 h-6 object-contain brightness-0 invert text-left" alt={String(name)} />
                <button onClick={() => removeTechLogo(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 shadow-sm text-left"><X size={10} /></button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 text-left">
        <button onClick={onShowPrivacy} className="text-[10px] text-slate-400 hover:text-[#ff8054] flex items-center gap-1 uppercase font-bold transition-colors text-left">
          <Shield size={12}/> Notice de confidentialité
        </button>
        <button onClick={onShowPurge} className="text-[10px] text-slate-400 hover:text-red-500 flex items-center gap-1 uppercase font-bold transition-colors text-left">
          <Trash2 size={12}/> Supprimer mes données
        </button>
      </div>
    </div>
  );
}
