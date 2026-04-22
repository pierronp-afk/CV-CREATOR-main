import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_CV_DATA } from '../utils/cv';

const STORAGE_KEY = 'smile_cv_data_final_v30_stable';

/**
 * Hook to manage CV data, history, and persistence.
 */
export const useCvData = () => {
  const [history, setHistory] = useState([]);

  const [cvData, setCvData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Sanitization
        if (typeof parsed.skills_categories !== 'object' || Array.isArray(parsed.skills_categories)) {
          parsed.skills_categories = DEFAULT_CV_DATA.skills_categories;
        }
        
        // Migrate legacy tech_logos (strings -> objects)
        if (parsed.profile && Array.isArray(parsed.profile.tech_logos)) {
          parsed.profile.tech_logos = parsed.profile.tech_logos.map(logo => {
            if (typeof logo === 'string') {
              return { type: 'url', src: `https://cdn.simpleicons.org/${logo.toLowerCase().replace(/\s+/g, '')}`, name: logo };
            }
            return logo;
          });
        } else if (parsed.profile && !parsed.profile.tech_logos) {
          parsed.profile.tech_logos = [];
        }

        // Ensure certifications are consistent if needed
        if (Array.isArray(parsed.certifications)) {
          parsed.certifications = parsed.certifications.map(c => {
            if (typeof c === 'string') return { name: c, logo: null };
            return c;
          });
        }
        
        return parsed;
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
    }
    return DEFAULT_CV_DATA;
  });

  // Persist to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
    }, 1000);
    return () => clearTimeout(timer);
  }, [cvData]);

  // Update logic with history
  const updateCvData = useCallback((updater) => {
    setCvData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (JSON.stringify(prev) !== JSON.stringify(next)) {
        setHistory((h) => [prev, ...h].slice(0, 30));
      }
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    if (history.length > 0) {
      const [lastState, ...remainingHistory] = history;
      setCvData(lastState);
      setHistory(remainingHistory);
    }
  }, [history]);

  const resetCV = useCallback(() => {
    updateCvData(DEFAULT_CV_DATA);
  }, [updateCvData]);

  const purgeData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('smile_cv_privacy_accepted');
    setCvData(DEFAULT_CV_DATA);
    setHistory([]);
  }, []);

  // Specialized Handlers
  const handleProfileChange = useCallback((field, value) => {
    updateCvData((p) => ({ ...p, profile: { ...p.profile, [field]: value } }));
  }, [updateCvData]);

  const handlePhotoUpload = useCallback((file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => updateCvData((prev) => ({ 
        ...prev, 
        profile: { ...prev.profile, photo: ev.target.result } 
      }));
      reader.readAsDataURL(file);
    }
  }, [updateCvData]);

  const handleSmileLogo = useCallback((file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => updateCvData((prev) => ({ 
        ...prev, 
        smileLogo: ev.target.result 
      }));
      reader.readAsDataURL(file);
    }
  }, [updateCvData]);

  const addTechLogo = useCallback((logo) => {
    updateCvData((p) => ({ 
      ...p, 
      profile: { ...p.profile, tech_logos: [...p.profile.tech_logos, logo] } 
    }));
  }, [updateCvData]);

  const removeTechLogo = useCallback((index) => {
    updateCvData((p) => ({ 
      ...p, 
      profile: { ...p.profile, tech_logos: p.profile.tech_logos.filter((_, idx) => idx !== index) } 
    }));
  }, [updateCvData]);

  const addExperience = useCallback(() => {
    updateCvData((p) => ({
      ...p,
      experiences: [
        {
          id: Date.now(),
          client_name: "",
          client_logo: null,
          period: "",
          role: "",
          context: "",
          phases: "",
          achievements: [],
          tech_stack: [],
          forceNewPage: false,
        },
        ...p.experiences,
      ],
    }));
  }, [updateCvData]);

  const updateExperience = useCallback((id, field, value) => {
    updateCvData((p) => ({
      ...p,
      experiences: p.experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  }, [updateCvData]);

  const removeExperience = useCallback((id) => {
    updateCvData((p) => ({
      ...p,
      experiences: p.experiences.filter((e) => e.id !== id),
    }));
  }, [updateCvData]);

  const addSkillCategory = useCallback((name) => {
    if (name) {
      updateCvData((p) => ({
        ...p,
        skills_categories: { ...p.skills_categories, [name]: [] },
      }));
    }
  }, [updateCvData]);

  const deleteCategory = useCallback((name) => {
    updateCvData((p) => {
      const newCats = { ...p.skills_categories };
      delete newCats[name];
      return { ...p, skills_categories: newCats };
    });
  }, [updateCvData]);

  const addSkillToCategory = useCallback((category, skill) => {
    if (skill && skill.name) {
      updateCvData((p) => ({
        ...p,
        skills_categories: {
          ...p.skills_categories,
          [category]: [...p.skills_categories[category], { ...skill }],
        },
      }));
    }
  }, [updateCvData]);

  const updateSkillInCategory = useCallback((category, index, field, value) => {
    updateCvData((p) => {
      const skills = [...p.skills_categories[category]];
      skills[index] = { ...skills[index], [field]: value };
      return { ...p, skills_categories: { ...p.skills_categories, [category]: skills } };
    });
  }, [updateCvData]);

  const removeSkillFromCategory = useCallback((category, index) => {
    updateCvData((p) => ({
      ...p,
      skills_categories: {
        ...p.skills_categories,
        [category]: p.skills_categories[category].filter((_, i) => i !== index),
      },
    }));
  }, [updateCvData]);

  const updateEducation = useCallback((index, field, value) => {
    updateCvData((p) => {
      const edu = [...p.education];
      edu[index] = { ...edu[index], [field]: value };
      return { ...p, education: edu };
    });
  }, [updateCvData]);

  const addEducation = useCallback(() => {
    updateCvData((p) => ({
      ...p,
      education: [...p.education, { year: "", degree: "", location: "" }],
    }));
  }, [updateCvData]);

  const removeEducation = useCallback((index) => {
    updateCvData((p) => ({
      ...p,
      education: p.education.filter((_, i) => i !== index),
    }));
  }, [updateCvData]);

  const addLanguage = useCallback(() => {
    updateCvData((p) => ({
      ...p,
      languages: [...(p.languages || []), { name: "", level: "B2" }],
    }));
  }, [updateCvData]);

  const updateLanguage = useCallback((index, field, value) => {
    updateCvData((p) => {
      const list = [...(p.languages || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...p, languages: list };
    });
  }, [updateCvData]);

  const removeLanguage = useCallback((index) => {
    updateCvData((p) => ({
      ...p,
      languages: (p.languages || []).filter((_, i) => i !== index),
    }));
  }, [updateCvData]);

  const addSecteur = useCallback((newSecteur) => {
    if (newSecteur) {
      updateCvData((p) => ({ 
        ...p, 
        connaissances_sectorielles: [...p.connaissances_sectorielles, newSecteur] 
      }));
    }
  }, [updateCvData]);

  const removeSecteur = useCallback((index) => {
    updateCvData((p) => ({ 
      ...p, 
      connaissances_sectorielles: p.connaissances_sectorielles.filter((_, i) => i !== index) 
    }));
  }, [updateCvData]);

  const addCertification = useCallback((cert) => {
    updateCvData((p) => ({ 
      ...p, 
      certifications: [...p.certifications, { name: cert.name, logo: cert.src }] 
    }));
  }, [updateCvData]);

  const removeCertification = useCallback((index) => {
    updateCvData((p) => ({ 
      ...p, 
      certifications: p.certifications.filter((_, i) => i !== index) 
    }));
  }, [updateCvData]);

  const moveItem = useCallback((listName, index, direction) => {
    updateCvData((p) => {
      const list = [...p[listName]];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target >= 0 && target < list.length) {
        const newList = [...list];
        [newList[index], newList[target]] = [newList[target], newList[index]];
        return { ...p, [listName]: newList };
      }
      return p;
    });
  }, [updateCvData]);

  return {
    cvData,
    setCvData,
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
  };
};
