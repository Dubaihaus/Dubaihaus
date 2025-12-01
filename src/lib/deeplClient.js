// src/lib/deeplClient.js
// Simple DeepL client + in-memory cache
import { prisma } from "./prisma";
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const DEEPL_API_URL = "https://api-free.deepl.com/v2/translate";

// In-memory cache: key = `${lang}:${text}` -> translatedText
const translationCache = new Map();

async function fetchFromDbCache(texts, targetLang) {
  if (!texts.length) return new Map();

  try {
    const rows = await prisma.translation.findMany({
      where: {
        targetLang,
        sourceText: { in: texts },
      },
    });

    const map = new Map();
    const ids = [];

    for (const row of rows) {
      map.set(row.sourceText.trim(), row.translatedText);
      ids.push(row.id);
    }

    if (rows.length) {
      console.log(
        `💾 DB cache hits: ${rows.length}/${texts.length} for lang=${targetLang}`
      );
    }

    // Best-effort update lastUsedAt
    if (ids.length) {
      prisma.translation
        .updateMany({
          where: { id: { in: ids } },
          data: { lastUsedAt: new Date() },
        })
        .catch(() => {});
    }

    return map;
  } catch (err) {
    console.error("DB cache lookup failed:", err);
    return new Map();
  }
}
async function saveToDbCache(pairs, targetLang) {
  // pairs: array of { sourceText, translatedText }
  if (!pairs.length) return;

  try {
    const ops = pairs.map(({ sourceText, translatedText }) =>
      prisma.translation.upsert({
        where: {
          targetLang_sourceText: {
            targetLang,
            sourceText,
          },
        },
        update: {
          translatedText,
          charCount: sourceText.length,
          lastUsedAt: new Date(),
        },
        create: {
          targetLang,
          sourceText,
          translatedText,
          charCount: sourceText.length,
        },
      })
    );

    await Promise.all(ops);
    console.log(
      `💾 Saved ${pairs.length} translations into DB cache for lang=${targetLang}`
    );
  } catch (err) {
    console.error("DB cache write failed:", err);
  }
}


/**
 * Translate MANY texts in one DeepL call (keeps order).
 * Uses cache so you don't pay twice for the same string.
 */


export async function translateMany(texts, targetLang = "DE") {
  if (!DEEPL_API_KEY) {
    console.warn("DEEPL_API_KEY not set – returning original texts.");
    return texts;
  }

  if (!Array.isArray(texts) || texts.length === 0) return texts;

  // Normalise to strings
  const input = texts.map((t) =>
    typeof t === "string" ? t : t == null ? "" : String(t)
  );

  const results = new Array(input.length);
  let missing = [];
  let missingIdx = [];

  // 1) In-memory cache
  input.forEach((text, idx) => {
    const trimmed = text.trim();
    if (!trimmed) {
      results[idx] = text;
      return;
    }

    const cacheKey = `${targetLang}:${trimmed}`;
    if (translationCache.has(cacheKey)) {
      results[idx] = translationCache.get(cacheKey);
    } else {
      results[idx] = null;
      missing.push(trimmed);
      missingIdx.push(idx);
    }
  });

  // 2) DB cache
  if (missing.length > 0) {
    const dbMap = await fetchFromDbCache(missing, targetLang);

    const stillMissing = [];
    const stillMissingIdx = [];

    missing.forEach((txt, i) => {
      const idx = missingIdx[i];
      if (dbMap.has(txt)) {
        const translated = dbMap.get(txt);
        results[idx] = translated;

        const cacheKey = `${targetLang}:${txt}`;
        translationCache.set(cacheKey, translated);
      } else {
        stillMissing.push(txt);
        stillMissingIdx.push(idx);
      }
    });

    missing = stillMissing;
    missingIdx = stillMissingIdx;
  }

  // 3) If everything was cached (memory + DB), we’re done
  if (missing.length === 0) {
    return results.map((r, i) => (r ?? input[i]));
  }

  // 4) Call DeepL for the remaining texts
  try {
    console.log(
      `🌐 translateMany -> targetLang=${targetLang}, incoming=${input.length}`
    );
    console.log(
      `🌐 translateMany -> cache missed, calling DeepL for ${missing.length} texts`
    );

    const params = new URLSearchParams();
    params.append("auth_key", DEEPL_API_KEY);
    missing.forEach((txt) => params.append("text", txt));
    params.append("target_lang", targetLang);

    const totalChars = missing.reduce((sum, t) => sum + t.length, 0);
    console.log(`🚀 Calling DeepL: target=${targetLang}, chars=${totalChars}`);

    const res = await fetch(DEEPL_API_URL, {
      method: "POST",
      body: params,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("DeepL API error:", res.status, errText.slice(0, 300));
      return input;
    }

    const json = await res.json();
    const translations = json?.translations || [];

    // For DB insert
    const dbPairs = [];

    translations.forEach((tr, i) => {
      const original = missing[i];
      const translated = tr?.text || original;
      const idx = missingIdx[i];

      const cacheKey = `${targetLang}:${original}`;
      translationCache.set(cacheKey, translated);
      results[idx] = translated;

      dbPairs.push({ sourceText: original, translatedText: translated });
    });

    console.log(
      `✅ DeepL success: got ${translations.length} translations. ` +
        `Sample: ${JSON.stringify(translations[0]?.text)?.slice(0, 80)}`
    );

    // 5) Save to DB asynchronously (don’t block response too much)
    saveToDbCache(dbPairs, targetLang).catch(() => {});

    // Final merge with original texts as fallback
    return results.map((r, i) => (r ?? input[i]));
  } catch (err) {
    console.error("DeepL fetch failed:", err);
    return input;
  }
}


/**
 * Convenience for a single string
 */
export async function translateText(text, targetLang = "DE") {
  const [translated] = await translateMany([text], targetLang);
  return translated;
}
