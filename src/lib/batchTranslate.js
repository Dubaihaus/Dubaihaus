import { translate } from "./translate";

export async function batchTranslate(texts, target = "de", source = "en", chunkSize = 5) {
  if (!texts?.length || source === target) return texts;

  const safeTexts = texts.map(t => typeof t === "string" ? t : String(t || "")); // ✅ Ensure strings

  const translated = [];
  const queue = [...safeTexts];

  while (queue.length) {
    const batch = queue.splice(0, chunkSize);
    try {
      const results = await Promise.all(batch.map(text => translate(text, target, source)));
      translated.push(...results);
    } catch (e) {
      console.error("Batch translation error:", e);
      translated.push(...batch); // fallback to originals
    }

    if (queue.length) await new Promise(res => setTimeout(res, 300)); // delay between batches
  }

  return translated;
}
