// src/lib/slugify.js
export function slugify(input) {
  if (!input) return "";

  return input
    .toString()
    .toLowerCase()
    .trim()
    // remove quotes
    .replace(/['"]/g, "")
    // replace any non-alphanumeric with hyphen
    .replace(/[^a-z0-9]+/g, "-")
    // collapse multiple hyphens
    .replace(/-+/g, "-")
    // trim starting/ending hyphens
    .replace(/^-|-$/g, "");
}
