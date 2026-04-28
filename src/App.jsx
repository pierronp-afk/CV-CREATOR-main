import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ArrowRight, ArrowLeft, 
  ZoomIn, ZoomOut, 
  Save, FolderOpen, Shield, 
  RefreshCw, Printer,
  FileSearch, Loader2, Lock, Sparkles, LifeBuoy,
  Undo2
} from 'lucide-react';

import { 
  formatTextForPreview, 
  paginateExperiences, 
  handleImageError,
  DEFAULT_CV_DATA
} from './utils/cv';
import { getBrand, BRANDS } from './config/brands';


import { useCvData } from './hooks/useCvData';

import A4Page from './components/cv/A4Page';
import CornerTriangle from './components/cv/CornerTriangle';
import PageCompetences from './components/cv/PageCompetences';

import HeaderSmall from './components/ui/HeaderSmall';
import Footer from './components/ui/Footer';
import ModalUI from './components/ui/ModalUI';
import PreviewErrorBoundary from './components/ui/PreviewErrorBoundary';

import PagesExperiences from './components/cv/PagesExperiences';

import StepProfil from './components/steps/StepProfil';
import StepSoftSkills from './components/steps/StepSoftSkills';
import StepCompetences from './components/steps/StepCompetences';
import StepExperiences from './components/steps/StepExperiences';

// --- CONFIGURATION & THÈME ---
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
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState(null);

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
    addLanguage,
    updateLanguage,
    removeLanguage,
    moveItem,
    history,
  } = useCvData();

  const brand = getBrand(cvData.brandId);

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
        languages: Array.isArray(result.languages) ? result.languages : (prev.languages || []),
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
          languages: Array.isArray(importedData.languages) ? importedData.languages : prev.languages,
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
      const styles = Array.from(document.querySelectorAll('style')).map(s => s.outerHTML).join('\n');
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .map(l => {
          const clone = l.cloneNode();
          if (clone.href) clone.href = new URL(clone.href, window.location.href).href;
          return clone.outerHTML;
        }).join('\n');
      printWindow.document.write(`<html><head><title>${getFilenameBase()}</title>${links}${styles}<style>@page { size: A4; margin: 0; } body { margin: 0; padding: 0; background: white; width: 210mm; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } .A4-page { box-shadow: none !important; margin: 0 !important; page-break-after: always !important; height: 297mm !important; width: 210mm !important; display: flex !important; flex-direction: column !important; overflow: visible !important; } .triangle-bg, .bg-[#2E86C1], .bg-blue-50, .hexagon-fill { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background-color: inherit !important; fill: inherit !important; } * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }</style></head><body onload="setTimeout(() => { window.print(); window.close(); }, 500)"><div class="flex flex-col">${content}</div></body></html>`);
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
            <button className="flex-1 bg-[#3b72ff] hover:bg-[#ff8054] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-3 shadow-md transition-all uppercase text-sm" onClick={() => pdfInputRef.current.click()} disabled={isImporting}>
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
              <RefreshCw size={22} className="text-slate-400 group-hover:text-[#ff8054] transition-colors"/>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter text-left">Refresh</span>
            </button>
            <div className="w-px h-10 bg-slate-100"></div>
            <button className={`flex-1 flex flex-col items-center gap-1.5 group ${history.length === 0 ? 'opacity-20 cursor-not-allowed' : ''}`} onClick={undo} disabled={history.length === 0}>
              <Undo2 size={22} className="text-slate-400 group-hover:text-[#ff8054] transition-colors"/>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter text-left">Undo (Ctrl+Z)</span>
            </button>
            <div className="w-px h-10 bg-slate-100"></div>
            <button className="flex-1 flex flex-col items-center gap-1.5 group" onClick={downloadJSON}>
              <Save size={22} className="text-slate-400 group-hover:text-[#ff8054] transition-colors"/>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter text-left">Save</span>
            </button>
            <div className="w-px h-10 bg-slate-100"></div>
            <button className="flex-1 flex flex-col items-center gap-1.5 group" onClick={() => jsonInputRef.current.click()}>
              <FolderOpen size={22} className="text-slate-400 group-hover:text-[#ff8054] transition-colors"/>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter text-left">Upload</span>
              <input type="file" ref={jsonInputRef} className="hidden" accept=".json" onChange={uploadJSON} />
            </button>
          </div>
        </div>

        <div className="p-6 border-b border-slate-100 bg-white sticky top-0 z-20 text-left">
          <div className="flex justify-between items-center mb-6 text-left">
            <div className="flex items-center gap-3">
              <img src="/smile-logo.png" alt="Smile" className="h-11 w-auto" />
              <div className="flex flex-col border-l-2 border-[#3b72ff] pl-3 leading-none">
                <span className="text-[10px] font-black text-[#3b72ff] uppercase tracking-wider">CV</span>
                <span className="text-[16px] font-black text-[#3b72ff] uppercase tracking-tight">Editor</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowGuide(true)} className="flex items-center gap-1.5 text-slate-400 hover:text-[#ff8054] transition-colors px-2 py-1 rounded-lg hover:bg-slate-50 border border-slate-100 shadow-sm group" title="Guide de rédaction">
                <LifeBuoy size={16} className="group-hover:animate-spin-slow" />
                <span className="text-xs font-black">?</span>
              </button>
              <span className="text-xs font-bold text-slate-400 text-left">Étape {step} / 4</span>
            </div>
          </div>
          <div className="flex gap-2 text-left">
            <button className="flex-1 bg-slate-100 text-slate-600 hover:bg-slate-200 px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed text-left flex items-center justify-center gap-2" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}>
              <ArrowLeft size={16} /> Précédent
            </button>
            {step < 4 ? (
              <button className="flex-[2] bg-[#3b72ff] text-white hover:bg-[#ff8054] px-4 py-2 rounded-lg font-bold text-sm shadow-md transition-all flex items-center gap-2 justify-center" onClick={() => setStep(s => Math.min(4, s + 1))}>Suivant <ArrowRight size={16} /></button>
            ) : (
              <button className="flex-[2] bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md transition-all flex items-center gap-2 justify-center" onClick={handlePrint}><Printer size={16} /> Générer PDF</button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar text-left">
            {step === 1 && (
              <StepProfil
                cvData={cvData}
                updateCvData={updateCvData}
                handleProfileChange={handleProfileChange}
                handlePhotoUpload={handlePhotoUpload}
                handleSmileLogo={handleSmileLogo}
                addTechLogo={addTechLogo}
                removeTechLogo={removeTechLogo}
                onShowPrivacy={() => setShowPrivacyNotice(true)}
                onShowPurge={() => setShowPurgeConfirm(true)}
              />
            )}
            
            {step === 2 && (
              <StepSoftSkills 
                cvData={cvData} 
                updateCvData={updateCvData} 
              />
            )}

            {step === 3 && (
              <StepCompetences 
                cvData={cvData}
                updateCvData={updateCvData}
                addSecteur={addSecteur}
                removeSecteur={removeSecteur}
                addCertification={addCertification}
                removeCertification={removeCertification}
                updateEducation={updateEducation}
                addEducation={addEducation}
                removeEducation={removeEducation}
                addSkillCategory={addSkillCategory}
                deleteCategory={deleteCategory}
                addSkillToCategory={addSkillToCategory}
                updateSkillInCategory={updateSkillInCategory}
                removeSkillFromCategory={removeSkillFromCategory}
                languages={cvData.languages}
                addLanguage={addLanguage}
                updateLanguage={updateLanguage}
                removeLanguage={removeLanguage}
                moveItem={moveItem}
              />
            )}

            {step === 4 && (
              <StepExperiences 
                cvData={cvData}
                updateExperience={updateExperience}
                addExperience={addExperience}
                removeExperience={removeExperience}
                moveItem={moveItem}
                updateCvData={updateCvData}
              />
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
            <PreviewErrorBoundary>
            {/* PAGE 1 : PROFIL (Toujours en premier) */}
            <A4Page>
              <CornerTriangle brandId={cvData.brandId} customLogo={cvData.smileLogo} />
              {!cvData.isAnonymous && !cvData.hidePhoto && cvData.profile.photo && cvData.profile.photo !== "null" && (
                <div className="absolute top-12 right-12 w-44 h-44 rounded-full overflow-hidden border-4 border-white shadow-xl z-20 bg-white flex items-center justify-center text-left">
                  <img src={cvData.profile.photo} onError={handleImageError} className="max-w-full max-h-full object-contain" alt="Portrait" />
                </div>
              )}
              <div className="pt-36 px-16 pb-0 flex-shrink-0 text-left">
                 <h1 className="uppercase leading-[0.85] mb-8 font-montserrat text-[#333333] text-left">
                   {cvData.isAnonymous 
                    ? <span className="text-4xl block font-black">{String(cvData.profile.firstname?.[0] || '').toUpperCase()}{String(cvData.profile.lastname?.substring(0, 3) || '').toUpperCase()}</span>
                    : <><span className="text-4xl block font-semibold opacity-90 text-left">{String(cvData.profile.firstname)}</span><span className="text-6xl font-black text-left">{String(cvData.profile.lastname)}</span></>}
                 </h1>
                 <div className="inline-block text-white font-bold text-xl px-4 py-1 rounded-sm uppercase mb-6 tracking-wider shadow-sm text-left" style={{ backgroundColor: brand.primary }}>{String(cvData.profile.years_experience)} ans d'expérience</div>
                 <h2 className="text-3xl font-black text-[#333333] uppercase mb-1 tracking-wide font-montserrat opacity-90 text-left">{String(cvData.profile.current_role)}</h2>
                 <div className="text-lg font-medium uppercase tracking-widest mb-10 pl-4 text-left" style={{ borderLeft: `4px solid ${cvData.brandId === 'smile_v2' ? brand.accent : brand.primary}`, color: cvData.brandId === 'smile_v2' ? brand.accent : '#666666' }}>{String(cvData.profile.main_tech)}</div>
              </div>
              <div className="flex-1 flex flex-col justify-start pt-0 pb-12 overflow-hidden text-center text-left">
                  {cvData.profile.summary && cvData.profile.summary.replace(/<[^>]*>/g, '').trim() !== "" && (
                    <div className="px-24 mb-10 relative z-10 flex flex-col items-center text-center text-left">
                       <div className="text-lg text-[#333333] leading-relaxed italic border-t border-slate-100 pt-8 break-words w-full max-w-[160mm] text-justify overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 9, WebkitBoxOrient: 'vertical' }} dangerouslySetInnerHTML={{__html: formatTextForPreview(cvData.profile.summary, true)}}></div>
                    </div>
                  )}
                  <div className="w-full py-3 px-16 mb-1 flex items-center justify-center gap-10 shadow-inner relative z-10 flex-shrink-0 text-left tech-banner" style={{ backgroundColor: brand.primary }}>
                    {(cvData.profile.tech_logos || []).map((logo, i) => {
                      const src = typeof logo === 'string' 
                        ? `https://cdn.simpleicons.org/${logo.toLowerCase().replace(/\s+/g, '')}` 
                        : (logo.src || logo.url);
                      const name = typeof logo === 'string' ? logo : (logo.name || logo.slug);
                      return src && src !== "null" ? (
                        <img key={i} src={src} onError={handleImageError} className="h-14 w-auto object-contain opacity-95 transition-transform" style={{ filter: cvData.brandId === 'smile_v2' ? 'none' : 'brightness(0) invert(1)' }} alt={String(name)} />
                      ) : null;
                    })}
                  </div>
                  <div className="flex justify-center gap-8 relative z-10 px-10 flex-shrink-0 mt-2 text-left">
                    {(cvData.soft_skills || []).map((skill, i) => {
                      const isV2 = cvData.brandId === 'smile_v2';
                      return (
                        <div key={i} className="relative flex-shrink-0" style={{ width: 144, height: 144 }}>
                          <svg viewBox="0 0 100 100" overflow="visible" className="absolute inset-0 drop-shadow-xl" style={{ width: 144, height: 144, fill: isV2 ? 'transparent' : brand.primary, stroke: isV2 ? brand.primary : 'none', strokeWidth: isV2 ? 8 : 0, strokeLinejoin: 'round' }}>
                            <polygon points="50 0, 100 25, 100 75, 50 100, 0 75, 0 25" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center px-4">
                            <span className="font-bold text-[11px] uppercase text-center leading-tight font-montserrat break-words w-full" style={{ color: isV2 ? brand.primary : 'white' }}>{String(skill || 'Skill')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
              </div>
              <Footer brandId={cvData.brandId} />
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
            </PreviewErrorBoundary>

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
        .animate-spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
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
