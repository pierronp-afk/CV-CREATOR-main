import DOMPurify from 'dompurify';

/**
 * Format string for HTML preview, handling bold tags and alignment divs.
 */
export const formatTextForPreview = (text, withQuotes = false) => {
  if (!text) return "";
  let content = String(text);

  // Si des guillemets sont demandés, on les injecte intelligemment
  if (withQuotes) {
    // Si le texte contient une balise div d'alignement, on injecte les guillemets à l'intérieur
    if (content.includes('<div class="text-')) {
      content = content.replace(/(<div class="text-(?:left|center|right|justify)">)/g, '$1"')
                       .replace(/(<\/div>)$/g, '"$1');
    } else {
      content = `"${content}"`;
    }
  }

  const result = content
    .replace(/</g, "&lt;").replace(/>/g, "&gt;") 
    .replace(/&lt;b&gt;/g, "<b>").replace(/&lt;\/b&gt;/g, "</b>") 
    // Autorise les div d'alignement
    .replace(/&lt;div class="text-(left|center|right|justify)"&gt;\n?/g, '<div class="text-$1">')
    .replace(/\n?&lt;\/div&gt;/g, "</div>")
    .replace(/\n/g, "<br/>");

  return DOMPurify.sanitize(result, { ALLOWED_TAGS: ['b', 'br', 'div'], ALLOWED_ATTR: ['class'] });
};

/**
 * Split experiences into pages (max 2 per page, unless forceNewPage is set).
 */
export const paginateExperiences = (experiences) => {
  if (!Array.isArray(experiences)) return [];
  const pages = [];
  let currentPage = [];
  experiences.forEach((exp) => {
    if (exp.forceNewPage && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [exp];
    } else if (currentPage.length === 2) {
      pages.push(currentPage);
      currentPage = [exp];
    } else {
      currentPage.push(exp);
    }
  });
  if (currentPage.length > 0) pages.push(currentPage);
  return pages;
};

/**
 * Common image error handler to hide broken images.
 */
export const handleImageError = (e) => {
  e.target.style.display = 'none';
};

/**
 * Initial empty CV data structure.
 */
export const DEFAULT_CV_DATA = {
  isAnonymous: false,
  hidePhoto: false,
  showSecteur: true,
  showCertif: true,
  swapPages: false, // false: Compétences en p2 | true: Expériences en p2
  smileLogo: "/logos/smile-white.png", 
  profile: {
    firstname: "Prénom",
    lastname: "NOM",
    years_experience: "5",
    current_role: "Poste de Consultant",
    main_tech: "Techno principale",
    summary: "Forte expérience en gestion de projet Drupal et dans l'accompagnement de nos clients.",
    photo: null, 
    tech_logos: [
      { type: 'url', src: 'https://cdn.simpleicons.org/php', name: 'PHP' },
      { type: 'url', src: 'https://cdn.simpleicons.org/drupal', name: 'Drupal' },
      { type: 'url', src: 'https://cdn.simpleicons.org/symfony', name: 'Symfony' }
    ]
  },
  soft_skills: ["Agilité", "Rigueur", "Communication"],
  languages: [
    { name: "Anglais", level: "B2" },
    { name: "Français", level: "C2" }
  ],
  connaissances_sectorielles: ["Industrie", "E-commerce"],
  certifications: [{ name: "Drupal certified", logo: "https://cdn.simpleicons.org/drupal" }],
  experiences: [
    {
      id: 1,
      client_name: "Disney",
      client_logo: "https://logo.clearbit.com/disney.com",
      period: "Jan 2023 - Présent",
      role: "Développeur Frontend",
      context: "Projet de refonte globale du site consommateur.",
      phases: "• Conception\n• Développement",
      tech_stack: ["Drupal", "Twig"],
      forceNewPage: false
    }
  ],
  education: [{ year: "2008/2010", degree: "Master Miage", location: "Orléans" }],
  skills_categories: {
    "Langages": [{ name: "JAVA", rating: 4 }, { name: "PHP", rating: 5 }],
    "Outils": [{ name: "Jira", rating: 5 }]
  }
};
