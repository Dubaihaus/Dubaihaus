import { searchProperties, listRegions } from "@/lib/reellyApi";
import { cookies } from "next/headers";

// Cache for Reelly API responses
const reellyCache = new Map();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const filters = {};

    // Parse all query parameters
    searchParams.forEach((value, key) => {
        if (key === "page") filters.page = parseInt(value);
        else if (key === "pageSize") filters.pageSize = parseInt(value);
        else if (key === "pricedOnly") filters.pricedOnly = value === "true";
        else if (value === "true" || value === "false") filters[key] = value === "true";
        else filters[key] = value;
    });

    // Handle area filtering using regions data
    const areaName = filters.area || filters.sector || filters.region || null;
    
    if (areaName) {
        try {
            const regions = await listRegions();
            const match = regions.find(r =>
                String(r.name || "").toLowerCase().includes(String(areaName).toLowerCase()) ||
                String(areaName).toLowerCase().includes(String(r.name || "").toLowerCase())
            );
            
            if (match) {
                // Use bounding box for precise area filtering
                filters.bbox_sw_lat = match.sw_latitude;
                filters.bbox_sw_lng = match.sw_longitude;
                filters.bbox_ne_lat = match.ne_latitude;
                filters.bbox_ne_lng = match.ne_longitude;
                console.log(`Using bounding box for area: ${areaName}`, match);
            } else {
                // Fallback to text search if no bounding box found
                filters.search_query = areaName;
                console.log(`Using search_query for area: ${areaName}`);
            }
        } catch (error) {
            console.error('Error fetching regions:', error);
            // Fallback to text search
            filters.search_query = areaName;
        }
    }

    // Detect locale from cookie
    const cookieStore = await cookies();
    const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";

    // Cache key with filters and locale
    const cacheKey = JSON.stringify({ filters, locale });
    const now = Date.now();
    let data;

    // Cache check
    if (reellyCache.has(cacheKey) && now - reellyCache.get(cacheKey).timestamp < CACHE_DURATION) {
        console.log("⚡ Reelly data from cache");
        data = reellyCache.get(cacheKey).data;
    } else {
        console.log("🔍 Fetching Reelly API with filters:", filters);
        data = await searchProperties(filters);
        console.log("✅ Reelly API returned:", data?.results?.length || 0, "results");
        if (data) {
            reellyCache.set(cacheKey, { timestamp: now, data });
        }
    }

    return Response.json(data || { results: [], total: 0 });
}