// Turns a Category.slug (e.g. "protein-powders", set by the admin panel's
// Category Management page) into a display label ("Protein Powders").
// Product listings/cards only carry the slug, so this is a display-only
// fallback — the admin-entered category name itself lives in the Category
// collection and is what the shop filter / footer links use directly.
const formatCategory = (slug) =>
  String(slug ?? '')
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export default formatCategory;
