// src/lib/translateReelly.js
import { translateMany } from "./deeplClient";

/**
 * Translate an array of normalized projects for a given locale.
 * Currently only 'de' (German) is supported.
 */
export async function translateProjectsForLocale(projects, locale) {
  console.log(
    "🔵 translateProjectsForLocale called with locale=",
    locale,
    "projects=",
    Array.isArray(projects) ? projects.length : "N/A"
  );

  if (locale !== "de") {
    console.log("🔵 Skipping translation – locale is not 'de'.");
    return projects;
  }
  if (!Array.isArray(projects) || projects.length === 0) {
    console.log("🔵 No projects to translate.");
    return projects;
  }

  const targetLang = "DE";

  // Collect strings to translate (deduplicated)
  const uniqueMap = new Map(); // original -> index in uniqueList
  const uniqueList = [];

  const add = (str) => {
    if (!str || typeof str !== "string") return;
    const trimmed = str.trim();
    if (!trimmed) return;
    if (!uniqueMap.has(trimmed)) {
      uniqueMap.set(trimmed, uniqueList.length);
      uniqueList.push(trimmed);
    }
  };

  projects.forEach((p, idx) => {
    if (!p) return;
    add(p.title);
    add(p.description);
    add(p.location);       // <--- this actually exists on normalized project
    add(p.developer);      // simple name string
    // you can later add more fields here if needed
  });

  console.log(
    `🔵 Collected ${uniqueList.length} unique strings for DeepL. Sample:`,
    uniqueList.slice(0, 5)
  );

  if (uniqueList.length === 0) return projects;

  // Call DeepL in one batched request
  const translatedList = await translateMany(uniqueList, targetLang);

  // Build lookup map original -> translated
  const translatedMap = new Map();
  uniqueList.forEach((orig, i) => {
    translatedMap.set(orig, translatedList[i] || orig);
  });

  const translatedProjects = projects.map((p, idx) => {
    if (!p) return p;

    const newTitle =
      typeof p.title === "string" && translatedMap.has(p.title)
        ? translatedMap.get(p.title)
        : p.title;

    const newDescription =
      typeof p.description === "string" && translatedMap.has(p.description)
        ? translatedMap.get(p.description)
        : p.description;

    const newLocation =
      typeof p.location === "string" && translatedMap.has(p.location)
        ? translatedMap.get(p.location)
        : p.location;

    const newDeveloper =
      typeof p.developer === "string" && translatedMap.has(p.developer)
        ? translatedMap.get(p.developer)
        : p.developer;

    const updated = {
      ...p,
      title: newTitle,
      name: newTitle,
      description: newDescription,
      location: newLocation,
      developer: newDeveloper,
    };

    if (idx === 0) {
      console.log("🔵 Sample project before/after translation:");
      console.log("   title:", p.title, "=>", newTitle);
      console.log("   location:", p.location, "=>", newLocation);
    }

    return updated;
  });

  console.log("🔵 translateProjectsForLocale finished.");

  return translatedProjects;
}
