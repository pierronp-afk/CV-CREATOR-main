import React, { useState, useRef } from 'react';
import { 
  Plus, Upload, X, Search, Bold, List, AlignJustify, 
  AlignLeft, AlignCenter, AlignRight, Sparkles 
} from 'lucide-react';
import { handleImageError } from '../../utils/cv';

export const ButtonUI = ({ children, onClick, variant = "primary", className = "", disabled = false, title = "" }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 justify-center";
  const variants = {
    primary: "bg-[#3b72ff] text-white hover:bg-[#ff8054] shadow-md",
    secondary: "bg-slate-100 text-slate-600 hover:bg-slate-200",
    outline: "border-2 border-[#3b72ff] text-[#3b72ff] hover:bg-[#ff8054] hover:text-white hover:border-[#ff8054]",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 p-2",
    ghost: "text-slate-500 hover:bg-slate-100",
    toolbar: "p-1.5 hover:bg-slate-200 rounded text-slate-600"
  };
  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      title={title} 
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export const InputUI = ({ label, value, onChange, placeholder, maxLength, type = "text" }) => (
  <div className="mb-4 text-left">
    <div className="flex justify-between items-baseline mb-1 text-left">
      <label className="text-xs font-bold text-[#333333] uppercase tracking-wide">{String(label)}</label>
      {maxLength && <span className={`text-[10px] ${String(value || '').length > maxLength ? 'text-red-500 font-bold' : 'text-slate-400'}`}>{String(value || '').length} / {maxLength}</span>}
    </div>
    <input 
      type={type} 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)} 
      placeholder={placeholder} 
      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b72ff] text-sm text-[#333333] transition-all" 
    />
  </div>
);

export const RichTextareaUI = ({ label, value, onChange, placeholder }) => {
  const textareaRef = useRef(null);

  const insertTag = (tag) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);

    if (tag === 'b') {
      onChange(`${before}<b>${selected}</b>${after}`);
    } else if (tag === 'list') {
      if (start !== end) {
        const bulletedLines = selected.split('\n').map(line => 
          line.trim() === "" ? line : (line.startsWith('• ') ? line : `• ${line}`)
        ).join('\n');
        onChange(before + bulletedLines + after);
      } else {
        onChange(`${before}• ${after}`);
      }
    } else if (['left', 'center', 'right', 'justify'].includes(tag)) {
      if (start === end) {
        let cleanText = text.replace(/<div class="text-(left|center|right|justify)">/g, '').replace(/<\/div>/g, '');
        onChange(`<div class="text-${tag}">${cleanText}</div>`);
      } else {
        onChange(`${before}<div class="text-${tag}">${selected}</div>${after}`);
      }
    }
  };

  const copyToClipboard = (url) => {
    if (value) {
      const prompt = "Agis comme un expert Smile. Reformule ce texte pour un CV de consultant. Ton 'corporate', direct. Corrige les fautes. PAS de markdown. Texte : \n";
      const fullText = prompt + value;
      const textArea = document.createElement("textarea");
      textArea.value = fullText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    window.open(url, '_blank');
  };

  return (
    <div className="mb-6 text-left">
      <div className="flex justify-between items-end mb-1 text-left">
        <label className="text-xs font-bold text-[#333333] uppercase block">{String(label)}</label>
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#3b72ff] transition-all shadow-sm">
        <div className="flex flex-col bg-white border-b border-slate-200 text-left">
          <div className="px-3 py-1 bg-blue-50/50 border-b border-slate-50">
            <p className="text-[9px] font-bold text-[#3b72ff] flex items-center gap-1 uppercase tracking-tight text-left">
              <Sparkles size={10}/> Cliquez sur l'IA, puis faites simplement COLLER dans la fenêtre qui s'ouvre.
            </p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1.5 text-left flex-wrap">
            <ButtonUI variant="toolbar" onClick={() => insertTag('b')} title="Gras"><Bold size={12}/></ButtonUI>
            <ButtonUI variant="toolbar" onClick={() => insertTag('list')} title="Puce"><List size={12}/></ButtonUI>
            <div className="w-px h-3 bg-slate-300 mx-1"></div>
            <div className="flex items-center bg-slate-100 hover:bg-slate-200 transition-colors rounded px-1.5 py-0.5">
              <AlignJustify size={12} className="text-slate-500 mr-1" />
              <select 
                className="bg-transparent text-[10px] text-slate-600 outline-none cursor-pointer font-bold uppercase tracking-tighter"
                onChange={(e) => {
                  if (e.target.value) insertTag(e.target.value);
                  e.target.value = ""; 
                }}
                defaultValue=""
                title="Alignement"
              >
                <option value="" disabled>Alignement</option>
                <option value="left">Gauche</option>
                <option value="center">Centré</option>
                <option value="right">Droite</option>
                <option value="justify">Justifié</option>
              </select>
            </div>
            <div className="w-px h-3 bg-slate-300 mx-1"></div>
            <span className="text-[9px] text-slate-400 font-bold mr-1 uppercase tracking-tighter">IA:</span>
            {[
              { name: 'ChatGPT', url: 'https://chat.openai.com/', domain: 'openai.com' },
              { name: 'Gemini', url: 'https://gemini.google.com/', icon: 'googlegemini' },
              { name: 'Claude', url: 'https://claude.ai/', icon: 'anthropic' },
              { name: 'Mistral', url: 'https://chat.mistral.ai/', domain: 'mistral.ai' }
            ].map((tool) => (
              <button 
                key={tool.name} 
                onClick={() => copyToClipboard(tool.url)} 
                className="p-1 hover:bg-slate-100 rounded transition-all hover:scale-110 grayscale hover:grayscale-0 opacity-70 hover:opacity-100 text-left" 
                title={`Copier & Ouvrir ${tool.name}`}
              >
                <img 
                  src={tool.domain ? `https://www.google.com/s2/favicons?domain=${tool.domain}&sz=64` : `https://cdn.simpleicons.org/${tool.icon}`} 
                  onError={handleImageError} 
                  className="w-4 h-4 object-contain" 
                  alt={tool.name} 
                />
              </button>
            ))}
          </div>
        </div>
        <textarea 
          ref={textareaRef} 
          className="w-full px-4 py-3 bg-transparent text-sm h-32 resize-none focus:outline-none border-none shadow-inner text-left" 
          value={value || ''} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder={placeholder} 
        />
      </div>
    </div>
  );
};

export const DropZoneUI = ({ onFile, label = "Déposez une image", icon = <Upload size={16}/>, className = "" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);
  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-1 ${isDragging ? 'border-[#3b72ff] bg-blue-50 scale-[1.02]' : 'border-slate-300 bg-white hover:border-[#ff8054] hover:bg-slate-50'} ${className}`} 
      onClick={() => inputRef.current.click()} 
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} 
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }} 
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); if(e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]); }}
    >
      <input type="file" style={{display: 'none'}} ref={inputRef} accept="image/*" onChange={(e) => { if(e.target.files[0]) onFile(e.target.files[0]); }} />
      <div className={`transition-colors ${isDragging ? 'text-[#3b72ff]' : 'text-slate-400'}`}>{icon}</div>
      <span className={`text-[10px] font-bold uppercase transition-colors px-2 leading-tight ${isDragging ? 'text-[#3b72ff]' : 'text-slate-500'}`}>{isDragging ? "Lâchez l'image !" : label}</span>
    </div>
  );
};

export const LogoSelectorUI = ({ onSelect, label, suggestions = [] }) => {
  const [search, setSearch] = useState("");
  const getIconUrl = (slug) => `https://cdn.simpleicons.org/${String(slug || '').toLowerCase().replace(/\s+/g, '')}`;
  const getClearbitUrl = (domain) => `https://logo.clearbit.com/${String(domain || '').trim()}`;
  
  const handleSelect = (query) => {
    if (!query) return;
    let finalSrc = query.includes('.') ? getClearbitUrl(query) : getIconUrl(query);
    onSelect({ type: 'url', src: finalSrc, name: query });
    setSearch("");
  };

  const handleFile = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => onSelect({ type: 'file', src: ev.target.result, name: file.name.split('.')[0] });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner text-left mb-4">
      {label && <label className="text-[10px] font-black text-slate-500 uppercase block mb-3 tracking-widest">{String(label)}</label>}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
          {suggestions.map((s) => {
            const slug = typeof s === 'string' ? s : s.name;
            const customUrl = typeof s === 'object' ? s.src : null;
            const src = customUrl || getIconUrl(slug);
            return (
              <button 
                key={slug} 
                onClick={() => onSelect(s)} 
                className="p-1.5 hover:bg-blue-50 rounded-md transition-all group relative"
                title={slug}
              >
                <img 
                  src={src} 
                  onError={handleImageError} 
                  className="w-5 h-5 object-contain group-hover:grayscale-0 transition-all opacity-70 group-hover:opacity-100 group-hover:scale-110" 
                  alt={slug} 
                />
              </button>
            );
          })}
        </div>
      )}
      <div className="flex gap-2 mb-3 text-left">
        <div className="relative flex-1 text-left">
          <input 
            className="w-full pl-8 pr-2 py-2 bg-white border border-slate-300 rounded-lg text-xs text-left focus:ring-2 focus:ring-[#3b72ff] outline-none transition-all" 
            placeholder="Nom (ex: drupal) ou Domaine (ex: google.com)" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSelect(search)} 
          />
          <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
        </div>
        <ButtonUI variant="primary" className="px-3 h-auto" onClick={() => handleSelect(search)}><Plus size={14}/></ButtonUI>
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-slate-200"></div></div>
        <div className="relative flex justify-center text-[8px] font-bold uppercase tracking-tighter"><span className="bg-slate-50 px-2 text-slate-400">Ou charger un fichier</span></div>
      </div>
      <DropZoneUI onFile={handleFile} label="Glisser image personnalisée" icon={<Upload size={14}/>} className="mt-3 py-4" />
    </div>
  );
};
