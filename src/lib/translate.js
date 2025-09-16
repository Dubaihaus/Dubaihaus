const cache = new Map();
const ENDPOINT = "http://localhost:5000/translate";

// Ensure translation input is always a string
export async function translate(text, target = "de", source = "en") {
  if (typeof text !== "string") text = String(text || ""); // Convert non-strings safely
  if (!text || source === target) return text;

  const cleanText = text.trim().replace(/\s+/g, ' ');
  if (!cleanText) return text;

  const key = `${cleanText}::${target}`;
  if (cache.has(key)) return cache.get(key);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: cleanText, source, target, format: "text" })
    });

    const json = await res.json();

    if (json?.translatedText) {
      cache.set(key, json.translatedText);
      return json.translatedText;
    } else {
      console.warn("Translation failed, using fallback:", json?.error || json);
      return text; // fallback
    }
  } catch (err) {
    console.error("LibreTranslate error:", err);
    return text; // fallback
  }
}
