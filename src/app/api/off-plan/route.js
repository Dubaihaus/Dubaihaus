import { searchProperties } from "@/lib/reellyApi";
import { cookies } from "next/headers";
import { batchTranslate } from "@/lib/batchTranslate";

// Cache for Reelly API responses
const reellyCache = new Map();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const filters = {};

    // Parse filters and map to Reelly API parameters
    searchParams.forEach((value, key) => {
        if (key === "page") filters.page = parseInt(value);
        else if (key === "pageSize") filters.pageSize = parseInt(value);
        else if (key === "location") filters.sector = value; // Map location to sector
        else if (value === "true" || value === "false") filters[key] = value === "true";
        else filters[key] = value;
    });

    // Detect locale from cookie
    const cookieStore = await cookies();
    const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";

    // ✅ Include locale in cache key
    const reellyCacheKey = JSON.stringify({ filters, locale });
    const now = Date.now();
    let data;

    // Cache check
    if (reellyCache.has(reellyCacheKey) && now - reellyCache.get(reellyCacheKey).timestamp < CACHE_DURATION) {
        console.log("⚡ Reelly data from cache");
        data = reellyCache.get(reellyCacheKey).data;
    } else {
        console.log("🔍 Fetching Reelly API:", filters);
        data = await searchProperties(filters);
        console.log("✅ Reelly API returned:", data?.results?.length || 0, "results");
        if (data) reellyCache.set(reellyCacheKey, { timestamp: now, data });
    }

    // ✅ Translate only if locale is German
    if (locale === "de" && data?.results?.length) {
        console.log("🌐 Translating API data to German...");

        // Collect all texts (titles, descriptions, locations)
        const textsToTranslate = [];
        data.results.forEach(prop => {
            textsToTranslate.push(prop.title);
            if (prop.description) textsToTranslate.push(prop.description);
            if (prop.location) textsToTranslate.push(prop.location);
        });

        // Batch translate
        const translated = await batchTranslate(textsToTranslate, "de");

        // Reapply translations in correct order
        let idx = 0;
        data.results.forEach(prop => {
            prop.title = translated[idx++];
            if (prop.description) prop.description = translated[idx++];
            if (prop.location) prop.location = translated[idx++];
        });
    }

    return Response.json(data || { results: [] });
}