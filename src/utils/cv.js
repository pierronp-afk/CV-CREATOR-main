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

  return content
    .replace(/</g, "&lt;").replace(/>/g, "&gt;") 
    .replace(/&lt;b&gt;/g, "<b>").replace(/&lt;\/b&gt;/g, "</b>") 
    // Autorise les div d'alignement
    .replace(/&lt;div class="text-(left|center|right|justify)"&gt;\n?/g, '<div class="text-$1">')
    .replace(/\n?&lt;\/div&gt;/g, "</div>")
    .replace(/\n/g, "<br/>"); 
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
