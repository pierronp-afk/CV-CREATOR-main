export const BRANDS = {
  smile: {
    id: 'smile',
    name: 'Smile',
    primary: '#2E86C1',
    secondary: '#006898',
    accent: '#2E86C1',            // titres = même couleur que primary pour Smile classic
    accentBg: '#EBF5FB',  // équivalent doux de bg-blue-50 utilisé dans les chips technos d'expérience
    logoTriangle: '/logos/smile-white.png',  // logo blanc qui va dans le triangle coloré
    logoHeader: '/smile-logo.png',  // logo couleur affiché dans le header de l'éditeur
    footerText: "Smile - IT is Open",
    footerTagline: "CRÉATEUR D'EXPÉRIENCE DIGITALE OUVERTE",
    footerHashtag: "#MadeWithSmile"
  },
  uxrepublic: {
    id: 'uxrepublic',
    name: 'UX Republic',
    primary: '#000000',
    secondary: '#333333',
    accent: '#1A1A1A',            // titres = quasi-noir pour UX Republic
    accentBg: '#F5F5F5',
    logoTriangle: '/logos/ux-republic-white.png',
    logoHeader: '/logos/ux-republic-white.png',
    footerText: "UX Republic",
    footerTagline: "EXPERTS EN EXPÉRIENCE UTILISATEUR",
    footerHashtag: "#MadeWithUXRepublic"
  },
  smile_v2: {
    id: 'smile_v2',
    name: 'Smile v2',
    template: 'classic',          // réutilise le template existant
    primary: '#3b72ff',
    secondary: '#1e4fcc',
    accent: '#ff8054',            // titres de section en orange
    accentBg: '#EBF1FF',          // bg-blue-50 équivalent pour le nouveau bleu
    logoTriangle: '/logos/smile-white.png',
    logoHeader: '/smile-logo.png',
    footerText: "Smile - IT is Open",
    footerTagline: "CRÉATEUR D'EXPÉRIENCE DIGITALE OUVERTE",
    footerHashtag: "#MadeWithSmile"
  }
};

export const DEFAULT_BRAND_ID = 'smile';
export const getBrand = (brandId) => BRANDS[brandId] || BRANDS[DEFAULT_BRAND_ID];
