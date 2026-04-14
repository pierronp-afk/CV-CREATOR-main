import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ArrowRight, ArrowLeft, Download, Plus, Trash2, MoveUp, MoveDown, 
  Upload, X, Briefcase, GraduationCap, User, Hexagon, Cpu, 
  ImageIcon, ZoomIn, ZoomOut, Search, LayoutTemplate, 
  Save, FolderOpen, Eye, Shield, Check, Edit2,
  Bold, List, Copy, HelpCircle, RefreshCw, Cloud, Mail, Printer,
  ChevronUp, ChevronDown, Award, Factory, ToggleLeft, ToggleRight, FilePlus,
  FileSearch, Loader2, Lock, Sparkles, AlertCircle, LifeBuoy, GripVertical,
  Undo2, AlignLeft, AlignCenter, AlignRight, AlignJustify
} from 'lucide-react';

import { 
  formatTextForPreview, 
  paginateExperiences, 
  handleImageError,
  DEFAULT_CV_DATA
} from './utils/cv';

import { useCvData } from './hooks/useCvData';

import A4Page from './components/cv/A4Page';
import CornerTriangle from './components/cv/CornerTriangle';
import PageCompetences from './components/cv/PageCompetences';

import HeaderSmall from './components/ui/HeaderSmall';
import Footer from './components/ui/Footer';
import HexagonRating from './components/ui/HexagonRating';
import ModalUI from './components/ui/ModalUI';
import { ButtonUI, InputUI, RichTextareaUI, DropZoneUI, LogoSelectorUI } from './components/ui/FormUI';

import PagesExperiences from './components/cv/PagesExperiences';

// --- CONFIGURATION & THÈME ---
const THEME = {
  primary: "#2E86C1", 
  secondary: "#006898", 
  textDark: "#333333", 
  textGrey: "#666666", 
  bg: "#FFFFFF"
};

const getIconUrl = (slug) => `https://cdn.simpleicons.org/${String(slug || '').toLowerCase().replace(/\s+/g, '')}`;
const getClearbitUrl = (domain) => `https://logo.clearbit.com/${String(domain || '').trim()}`;

// --- DONNÉES PAR DÉFAUT ---
// (DEFAULT_CV_DATA moved to src/utils/cv.js)

// (Utils moved to src/utils/cv.js)

// --- SOUS-COMPOSANTS UI ---

// (ModalUI moved to separate file)

// (A4Page, CornerTriangle, HeaderSmall, Footer, HexagonRating moved to separate files)

// (ExperienceItem moved to separate file)

// --- COMPOSANTS UI FORMULAIRE ---

// --- COMPOSANT PRINCIPAL ---

export default function App() {
  const [step, setStep] = useState(1);
  const [zoom, setZoom] = useState(0.55);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showAIConsent, setShowAIConsent] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const jsonInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const [newSecteur, setNewSecteur] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSkillsInput, setNewSkillsInput] = useState({});
  
  // États pour gérer le drag and drop
  const [draggedSkill, setDraggedSkill] = useState(null);
  const [draggedCategory, setDraggedCategory] = useState(null);
  const [draggedEduIndex, setDraggedEduIndex] = useState(null);
  const [draggedExpIndex, setDraggedExpIndex] = useState(null);
  const [draggedCertIndex, setDraggedCertIndex] = useState(null);

  const {
    cvData,
    updateCvData,
    undo,
    resetCV,
    purgeData,
    handleProfileChange,
    handlePhotoUpload,
    handleSmileLogo,
    addTechLogo,
    removeTechLogo,
    addExperience,
    updateExperience,
    removeExperience,
    addSkillCategory,
    deleteCategory,
    addSkillToCategory,
    updateSkillInCategory,
    removeSkillFromCategory,
    updateEducation,
    addEducation,
    removeEducation,
    addSecteur,
    removeSecteur,
    addCertification,
    removeCertification,
    moveItem,
    history,
  } = useCvData();

  // --- CALCULS DU DOCUMENT ---
  const experiencePages = paginateExperiences(cvData.experiences);
  const totalPagesCount = 2 + experiencePages.length; 
  const scaledContentHeight = (totalPagesCount * 1122.5 * zoom) + ((totalPagesCount - 1) * 40 * zoom);

  useEffect(() => {
    const accepted = localStorage.getItem('smile_cv_privacy_accepted');
    if (!accepted) {
      setShowPrivacyNotice(true);
    }
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => { 
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; 
      }
    };
    document.head.appendChild(script);
  }, []);

  const getFilenameBase = () => {
    const year = new Date().getFullYear();
    if (cvData.isAnonymous) return `CV_Anonyme_${year}`;
    const clean = (str) => String(str || "").replace(/[^a-z0-9]/gi, '_').toUpperCase();
    return `CV ${year} - ${clean(cvData.profile.lastname)} - ${clean(cvData.profile.firstname)}`;
  };

  useEffect(() => { document.title = getFilenameBase(); }, [cvData.profile, cvData.isAnonymous]);

  const extractTextFromPDF = async (file) => {
    if (!window.pdfjsLib) {
      throw new Error("La bibliothèque PDF n'est pas encore prête. Réessayez dans un instant.");
    }
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(" ");
      fullText += pageText + "\n";
    }
    return fullText;
  };

  const handlePDFImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPendingFile(file);
    setShowAIConsent(true);
    e.target.value = null; 
  };

  const confirmAIAnalysis = async () => {
    if (!pendingFile) return;
    setShowAIConsent(false);
    setIsImporting(true);
    setImportError(null);
    try {
      let rawText = await extractTextFromPDF(pendingFile);
      rawText = rawText.replace(/\s+/g, ' ').trim().substring(0, 15000);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erreur lors de l'analyse");
      }

      const result = await response.json();
      
      updateCvData(prev => ({
        ...prev,
        ...result,
        profile: { ...prev.profile, ...result.profile },
        experiences: (result.experiences || []).map((exp, idx) => ({ 
          ...exp, 
          id: Date.now() + idx, 
          client_logo: null,
          forceNewPage: false 
        }))
      }));
    } catch (err) {
      console.error("Détails de l'erreur d'import:", err);
      setImportError(err.message || "Erreur lors de l'analyse IA.");
    } finally {
      setIsImporting(false);
      setPendingFile(null);
    }
  };

  const handleAddSkillToCategory = (cat) => { 
    const i = newSkillsInput[cat] || { name: '', rating: 3 }; 
    if (i.name) { 
      addSkillToCategory(cat, { name: i.name, rating: i.rating }); 
      setNewSkillsInput(p => ({ ...p, [cat]: { name: '', rating: 3 } })); 
    } 
  };
  const updateNewSkillInput = (cat, field, val) => { setNewSkillsInput(p => ({ ...p, [cat]: { ...(p[cat] || { name: '', rating: 3 }), [field]: val } })); };
  
  const handleDragOver = (e) => e.preventDefault();

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

  const handleExpDragStart = (index) => setDraggedExpIndex(index);
  const handleExpDrop = (targetIndex) => {
    if (draggedExpIndex === null || draggedExpIndex === targetIndex) { setDraggedExpIndex(null); return; }
    const list = [...cvData.experiences];
    const [moved] = list.splice(draggedExpIndex, 1);
    list.splice(targetIndex, 0, moved);
    updateCvData(prev => ({ ...prev, experiences: list }));
    setDraggedExpIndex(null);
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

  const handlePurgeData = () => {
    purgeData();
    setShowPurgeConfirm(false);
    setShowPrivacyNotice(true); 
  };

  const downloadJSON = () => { const a = document.createElement('a'); a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cvData)); a.download = `${getFilenameBase()}.json`; a.click(); };
  
  const uploadJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const importedData = JSON.parse(String(ev.target.result));
        updateCvData(prev => ({
          ...DEFAULT_CV_DATA,
          ...importedData,
          profile: { ...DEFAULT_CV_DATA.profile, ...(importedData.profile || {}) },
          experiences: Array.isArray(importedData.experiences) ? importedData.experiences : prev.experiences,
          education: Array.isArray(importedData.education) ? importedData.education : prev.education,
          connaissances_sectorielles: Array.isArray(importedData.connaissances_sectorielles) ? importedData.connaissances_sectorielles : prev.connaissances_sectorielles,
          certifications: Array.isArray(importedData.certifications) ? importedData.certifications : prev.certifications,
          soft_skills: Array.isArray(importedData.soft_skills) ? importedData.soft_skills : prev.soft_skills,
          skills_categories: importedData.skills_categories || prev.skills_categories
        }));
      } catch (err) {
        console.error("Erreur lecture JSON:", err);
        setImportError("Le fichier JSON est corrompu ou invalide.");
      } finally {
        e.target.value = ""; 
      }
    };
    reader.readAsText(file);
  };
  
  
  const acceptPrivacy = () => {
    localStorage.setItem('smile_cv_privacy_accepted', 'true');
    setShowPrivacyNotice(false);
    setShowGuide(true);
  };

   const handlePrint = () => {
      const printWindow = window.open('', '_blank');
      const content = document.querySelector('.print-container').innerHTML;
      const styles = Array.from(document.querySelectorAll('style')).map(s => s.innerHTML).join('\n');
      printWindow.document.write(`<html><head><title>${getFilenameBase()}</title><script src="https://cdn.tailwindcss.com"></script><style>${styles}</style><style>@page { size: A4; margin: 0; } body { margin: 0; padding: 0; background: white; width: 210mm; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } .A4-page { box-shadow: none !important; margin: 0 !important; page-break-after: always !important; height: 297mm !important; width: 210mm !important; display: flex !important; flex-direction: column !important; } .triangle-bg, .bg-[#2E86C1], .bg-blue-50, .hexagon-fill { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background-color: inherit !important; fill: inherit !important; } * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }</style></head><body onload="setTimeout(() => { window.print(); window.close(); }, 1000)"><div class="flex flex-col">${content}</div></body></html>`);
      printWindow.document.close();
  };

  // Écouteur global pour le Ctrl+Z
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo]);

  // (PageCompetences component definitions removed from App.jsx as they're now in separate files)

  // (PagesExperiences component definition removed from App.jsx as it's now in separate file)

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row h-screen overflow-hidden font-sans text-left">
      {showPrivacyNotice && (
        <ModalUI 
          title="Notice de Confidentialité & RGPD" 
          confirmText="J'ai compris et j'accepte"
          onConfirm={acceptPrivacy}
          icon={<Shield size={32} />}
          danger={false}
        >
          <div className="space-y-3">
            <p>Pour garantir la protection de vos données personnelles conformément au RGPD :</p>
            <ul className="list-disc pl-4 space-y-1 text-xs text-left">
              <li><strong>Stockage Local :</strong> Vos données sont enregistrées exclusivement dans votre navigateur (localStorage). Elles ne sont jamais stockées sur nos serveurs.</li>
              <li><strong>Intelligence Artificielle :</strong> L'importation PDF utilise l'API Google Gemini via un proxy sécurisé.</li>
              <li><strong>Services Tiers :</strong> L'affichage des logos s'appuie sur SimpleIcons et Clearbit.</li>
            </ul>
          </div>
        </ModalUI>
      )}

      {showGuide && (
        <ModalUI 
          title="Guide de Rédaction Smile" 
          confirmText="C'est noté !"
          onConfirm={() => setShowGuide(false)}
          icon={<LifeBuoy size={32} />}
          danger={false}
        >
          <div className="space-y-4 text-left text-sm text-slate-600">
            <p>Quelques conseils pour un CV parfait :</p>
            <ul className="list-disc pl-4 space-y-2">
              <li><strong>Photo :</strong> Privilégiez un fond neutre et une tenue professionnelle.</li>
              <li><strong>Résumé :</strong> Soyez concis (3-4 lignes max) et mettez en avant votre valeur ajoutée.</li>
              <li><strong>Expériences :</strong> Distinguez bien le <em>Contexte</em> (équipe, méthode, enjeux) de la <em>Réalisation</em> (vos actions concrètes).</li>
            </ul>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-blue-800 mt-4 flex items-start gap-2">
              <LifeBuoy size={16} className="mt-0.5 flex-shrink-0"/>
              <span>Vous pourrez consulter cette notice à tout moment en cliquant sur l'icône <strong>bouée</strong> en haut de l'écran.</span>
            </div>
          </div>
        </ModalUI>
      )}

      {showAIConsent && (
        <ModalUI title="Autoriser l'IA ?" confirmText="Analyser" onClose={() => { setShowAIConsent(false); setPendingFile(null); }} onConfirm={confirmAIAnalysis} icon={<Sparkles size={32} />} danger={false}>
          <p>Le fichier sera analysé par l'IA pour extraction automatique.</p>
        </ModalUI>
      )}

      {showResetConfirm && (
        <ModalUI title="Réinitialiser le formulaire ?" onClose={() => setShowResetConfirm(false)} onConfirm={resetCV}>
          <p>Toutes les modifications non sauvegardées seront perdues.</p>
        </ModalUI>
      )}

      {showPurgeConfirm && (
        <ModalUI title="Supprimer définitivement ?" onClose={() => setShowPurgeConfirm(false)} onConfirm={() => { purgeData(); setShowPurgeConfirm(false); setShowPrivacyNotice(true); }} confirmText="Oui, purger tout">
          <p>Toutes vos données seront supprimées de votre navigateur. Cette action est irréversible.</p>
        </ModalUI>
      )}

      {/* FORMULAIRE */}
      <div className="w-full md:w-[500px] bg-white border-r border-slate-200 flex flex-col h-full z-10 shadow-xl print:hidden text-left">
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 space-y-4">
          <div className="flex gap-2">
            <button className="flex-1 bg-[#2E86C1] hover:bg-[#2573a7] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-3 shadow-md transition-all uppercase text-sm" onClick={() => pdfInputRef.current.click()} disabled={isImporting}>
              {isImporting ? <Loader2 size={18} className="animate-spin text-white"/> : <FileSearch size={18} className="text-white"/>}
              <span className="drop-shadow-sm">{isImporting ? "Analyse..." : "Import PDF"}</span>
            </button>
            <button className={`px-6 py-3 rounded-xl font-bold border transition-all text-sm uppercase ${cvData.isAnonymous ? 'bg-red-50 text-red-600 border-red-200 shadow-sm' : 'bg-white text-slate-600 border-slate-200 shadow-sm hover:bg-slate-50'}`} onClick={() => updateCvData(p => ({...p, isAnonymous: !p.isAnonymous}))}>
              <Lock size={16}/> {cvData.isAnonymous ? "Anonyme" : "Anonymiser"}
            </button>
            <input type="file" ref={pdfInputRef} className="hidden" accept=".pdf" onChange={handlePDFImport} />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between px-2 py-4 text-left">
            <button className="flex-1 flex flex-col items-center gap-1.5 group" onClick={() => setShowResetConfirm(true)}>
              <RefreshCw size={22} className="text-slate-400 group-hover:text-[#2E86C1] transition-colors"/>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter text-left">Refresh</span>
            </button>
            <div className="w-px h-10 bg-slate-100"></div>
            <button className={`flex-1 flex flex-col items-center gap-1.5 group ${history.length === 0 ? 'opacity-20 cursor-not-allowed' : ''}`} onClick={undo} disabled={history.length === 0}>
              <Undo2 size={22} className="text-slate-400 group-hover:text-[#2E86C1] transition-colors"/>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter text-left">Undo (Ctrl+Z)</span>
            </button>
            <div className="w-px h-10 bg-slate-100"></div>
            <button className="flex-1 flex flex-col items-center gap-1.5 group" onClick={downloadJSON}>
              <Save size={22} className="text-slate-400 group-hover:text-[#2E86C1] transition-colors"/>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter text-left">Save</span>
            </button>
            <div className="w-px h-10 bg-slate-100"></div>
            <button className="flex-1 flex flex-col items-center gap-1.5 group" onClick={() => jsonInputRef.current.click()}>
              <FolderOpen size={22} className="text-slate-400 group-hover:text-[#2E86C1] transition-colors"/>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter text-left">Upload</span>
              <input type="file" ref={jsonInputRef} className="hidden" accept=".json" onChange={uploadJSON} />
            </button>
          </div>
        </div>

        <div className="p-6 border-b border-slate-100 bg-white sticky top-0 z-20 text-left">
          <div className="flex justify-between items-center mb-6 text-left">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-xl text-[#2E86C1]">Smile Editor</h1>
              <button onClick={() => setShowGuide(true)} className="text-slate-400 hover:text-[#2E86C1] transition-colors p-1 rounded-full hover:bg-slate-50" title="Guide de rédaction">
                <LifeBuoy size={20} />
              </button>
            </div>
            <span className="text-xs font-bold text-slate-400 text-left">Étape {step} / 4</span>
          </div>
          <div className="flex gap-2 text-left">
            <button className="flex-1 bg-slate-100 text-slate-600 hover:bg-slate-200 px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed text-left flex items-center justify-center gap-2" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}>
              <ArrowLeft size={16} /> Précédent
            </button>
            {step < 4 ? (
              <button className="flex-[2] bg-[#2E86C1] text-white hover:bg-[#2573a7] px-4 py-2 rounded-lg font-bold text-sm shadow-md transition-all flex items-center gap-2 justify-center" onClick={() => setStep(s => Math.min(4, s + 1))}>Suivant <ArrowRight size={16} /></button>
            ) : (
              <button className="flex-[2] bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md transition-all flex items-center gap-2 justify-center" onClick={handlePrint}><Printer size={16} /> Générer PDF</button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar text-left">
            {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right transition-all text-left">
              <div className="flex items-center gap-3 mb-4 text-[#2E86C1] text-left"><User size={24} /><h2 className="text-lg font-bold uppercase text-left">Profil</h2></div>
              
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
                <div className="p-3 border border-blue-100 bg-blue-50/50 rounded-lg flex flex-col gap-2 text-left">
                  <span className="text-[10px] font-bold text-[#2E86C1] uppercase text-left">Logo Entreprise (Import Manuel)</span>
                  <DropZoneUI onFile={handleSmileLogo} label={cvData.smileLogo ? "Changer Logo" : "Charger Logo"} className="h-24 bg-white text-left" />
                </div>
                <div className="p-3 border border-slate-200 bg-slate-50 rounded-lg flex flex-col gap-2 text-left">
                  <span className="text-[10px] font-bold text-slate-600 uppercase flex items-center justify-between text-left">Photo Profil</span>
                  <DropZoneUI onFile={handlePhotoUpload} label={cvData.profile.photo ? "Changer" : "Glisser-déposer photo"} icon={<User size={16}/>} className="h-24 bg-white text-left" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-left">
                <InputUI label="Prénom" value={cvData.profile.firstname} onChange={(v) => handleProfileChange('firstname', v)} />
                <InputUI label="NOM" value={cvData.profile.lastname} onChange={(v) => handleProfileChange('lastname', v)} />
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
                    'powerbi', 'snowflake', 'databricks', 'apachenifi', 
                    'amazonaws', 'amazoniotcore', 'amazoniotgreengrass', 'googlecloud', 'azure', 
                    'mysql', 'postgresql', 'docker', 'git', 'javascript', 'tailwindcss',
                    'linux', 'android', 'freertos', 'zephyr', 'buildroot', 'yoctoproject', 'openwrt',
                    'gstreamer', 'opencv', 'qt', 'c', 'cplusplus', 'java', 'springboot', 'terraform'
                  ]}
                />
                
                <div className="flex flex-wrap gap-2 mt-4 p-4 bg-slate-900 rounded-lg border border-slate-800 shadow-inner text-left">
                  {cvData.profile.tech_logos?.map((logo, i) => {
                    const src = typeof logo === 'string' ? `https://cdn.simpleicons.org/${logo.toLowerCase().replace(/\s+/g, '')}` : logo.src;
                    const name = typeof logo === 'string' ? logo : logo.name;
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
                <button onClick={() => setShowPrivacyNotice(true)} className="text-[10px] text-slate-400 hover:text-[#2E86C1] flex items-center gap-1 uppercase font-bold transition-colors text-left">
                  <Shield size={12}/> Notice de confidentialité
                </button>
                <button onClick={() => setShowPurgeConfirm(true)} className="text-[10px] text-slate-400 hover:text-red-500 flex items-center gap-1 uppercase font-bold transition-colors text-left">
                  <Trash2 size={12}/> Supprimer mes données
                </button>
              </div>
            </div>
            )}
            
            {/* ... Rest of the steps (2, 3, 4) remain unchanged ... */}
            {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right transition-all text-left">
                <div className="flex items-center gap-3 mb-4 text-[#2E86C1] text-left"><Hexagon size={24} /><h2 className="text-lg font-bold uppercase text-left">Soft Skills</h2></div>
                {[0, 1, 2].map(i => (<InputUI key={i} label={`Hexagone #${i+1}`} value={cvData.soft_skills[i]} onChange={(v) => {const s = [...cvData.soft_skills]; s[i] = v; updateCvData(p => ({...p, soft_skills: s}));}} />))}
            </div>
            )}

            {step === 3 && (
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
            )}

            {step === 4 && (
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
            )}
        </div>
      </div>

      {/* --- PREVIEW AREA --- */}
      <div className="flex-1 bg-slate-800 overflow-hidden relative flex flex-col items-center text-left">
        <div className="absolute bottom-6 z-50 flex items-center gap-4 bg-white/90 backdrop-blur px-6 py-2 rounded-full shadow-2xl print:hidden transition-all hover:scale-105 text-left">
            <button onClick={() => setZoom(Math.max(0.2, zoom - 0.1))} className="p-2 hover:bg-slate-100 rounded-full"><ZoomOut size={18} /></button>
            <span className="text-xs font-bold text-slate-600 min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="p-2 hover:bg-slate-100 rounded-full"><ZoomIn size={18} /></button>
        </div>

        <div className="flex-1 overflow-auto w-full p-8 flex justify-center custom-scrollbar border-l border-slate-700 text-left">
          <div 
            className="print-container block origin-top transition-transform duration-300 text-left" 
            style={{ transform: `scale(${zoom})`, height: `${scaledContentHeight}px`, width: `${210 * zoom}mm`, minHeight: 'max-content' }}
          >
            {/* PAGE 1 : PROFIL (Toujours en premier) */}
            <A4Page>
              <CornerTriangle customLogo={cvData.smileLogo} />
              {!cvData.isAnonymous && cvData.profile.photo && cvData.profile.photo !== "null" && (
                <div className="absolute top-12 right-12 w-44 h-44 rounded-full overflow-hidden border-4 border-white shadow-xl z-20 bg-white flex items-center justify-center text-left">
                  <img src={cvData.profile.photo} onError={handleImageError} className="max-w-full max-h-full object-contain" alt="Portrait" />
                </div>
              )}
              <div className="pt-36 px-16 pb-0 flex-shrink-0 text-left">
                 <h1 className="uppercase leading-[0.85] mb-8 font-montserrat text-[#333333] text-left">
                   {cvData.isAnonymous 
                    ? `${String(cvData.profile.firstname?.[0] || '')}${String(cvData.profile.lastname?.substring(0, 2) || '')}` 
                    : <><span className="text-4xl block font-semibold opacity-90 text-left">{String(cvData.profile.firstname)}</span><span className="text-6xl font-black text-left">{String(cvData.profile.lastname)}</span></>}
                 </h1>
                 <div className="inline-block bg-[#2E86C1] text-white font-bold text-xl px-4 py-1 rounded-sm uppercase mb-6 tracking-wider shadow-sm text-left">{String(cvData.profile.years_experience)} ans d'expérience</div>
                 <h2 className="text-3xl font-black text-[#333333] uppercase mb-1 tracking-wide font-montserrat opacity-90 text-left">{String(cvData.profile.current_role)}</h2>
                 <div className="text-lg text-[#666666] font-medium uppercase tracking-widest mb-10 border-l-4 border-[#2E86C1] pl-4 text-left">{String(cvData.profile.main_tech)}</div>
              </div>
              <div className="flex-1 flex flex-col justify-start pt-0 pb-12 overflow-hidden text-center text-left">
                  {cvData.profile.summary && cvData.profile.summary.replace(/<[^>]*>/g, '').trim() !== "" && (
                    <div className="px-24 mb-10 relative z-10 flex flex-col items-center text-center text-left">
                       <div className="text-lg text-[#333333] leading-relaxed italic border-t border-slate-100 pt-8 break-words w-full max-w-[160mm] text-justify" dangerouslySetInnerHTML={{__html: formatTextForPreview(cvData.profile.summary, true)}}></div>
                    </div>
                  )}
                  <div className="w-full bg-[#2E86C1] py-3 px-16 mb-1 flex items-center justify-center gap-10 shadow-inner relative z-10 flex-shrink-0 text-left tech-banner">
                    {(cvData.profile.tech_logos || []).map((logo, i) => {
                      const src = typeof logo === 'string' ? `https://cdn.simpleicons.org/${logo.toLowerCase().replace(/\s+/g, '')}` : logo.src;
                      const name = typeof logo === 'string' ? logo : logo.name;
                      return src && src !== "null" ? (
                        <img key={i} src={src} onError={handleImageError} className="h-14 w-auto object-contain brightness-0 invert opacity-95 transition-transform" alt={String(name)} />
                      ) : null;
                    })}
                  </div>
                  <div className="flex justify-center gap-12 relative z-10 px-10 flex-shrink-0 mt-2 text-left">
                    {(cvData.soft_skills || []).map((skill, i) => (
                      <div key={i} className="relative w-40 h-44 flex items-center justify-center text-left">
                        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-[#2E86C1] fill-current drop-shadow-xl text-left hexagon-shape"><polygon points="50 0, 100 25, 100 75, 50 100, 0 75, 0 25" /></svg>
                        <span className="relative z-10 text-white font-bold text-sm uppercase text-center px-4 leading-tight font-montserrat text-left">{String(skill || "Skill")}</span>
                      </div>
                    ))}
                  </div>
              </div>
              <Footer />
            </A4Page>

            {/* RENDU DYNAMIQUE SELON L'ORDRE CHOISI */}
            {cvData.swapPages ? (
              <>
                <PagesExperiences cvData={cvData} experiencePages={experiencePages} />
                <PageCompetences cvData={cvData} />
              </>
            ) : (
              <>
                <PageCompetences cvData={cvData} />
                <PagesExperiences cvData={cvData} experiencePages={experiencePages} />
              </>
            )}

          </div>
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&family=Open+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-sans { font-family: 'Open Sans', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .A4-page { width: 210mm; height: 297mm; background: white; flex-shrink: 0; box-sizing: border-box; position: relative; }
        @media print {
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 0; background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-hidden { display: none !important; }
          .A4-page { margin: 0 !important; box-shadow: none !important; page-break-after: always !important; }
        }
      `}</style>
    </div>
  );
}
