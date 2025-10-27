import { searchProperties, listRegions, listDistricts } from "@/lib/reellyApi";
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
    // const areaName = filters.area || filters.sector || filters.region || null;
    
    // if (areaName) {
    //     try {
    //         const regions = await listRegions();
    //         const match = regions.find(r =>
    //             String(r.name || "").toLowerCase().includes(String(areaName).toLowerCase()) ||
    //             String(areaName).toLowerCase().includes(String(r.name || "").toLowerCase())
    //         );
            
    //         if (match) {
    //             // Use bounding box for precise area filtering
    //             filters.bbox_sw_lat = match.sw_latitude;
    //             filters.bbox_sw_lng = match.sw_longitude;
    //             filters.bbox_ne_lat = match.ne_latitude;
    //             filters.bbox_ne_lng = match.ne_longitude;
    //             console.log(`Using bounding box for area: ${areaName}`, match);
    //         } else {
    //             // Fallback to text search if no bounding box found
    //             filters.search_query = areaName;
    //             console.log(`Using search_query for area: ${areaName}`);
    //         }
    //     } catch (error) {
    //         console.error('Error fetching regions:', error);
    //         // Fallback to text search
    //         filters.search_query = areaName;
    //     }
    // }
    // Canonical area filter: districts=<id(s)>
  // If caller already passed ?districts=..., just keep it.
  // If caller passed ?area=<name>, resolve to a district id first.
  const hasDistrictIds = typeof filters.districts === 'string' && filters.districts.trim() !== '';
  const areaName = !hasDistrictIds ? (filters.area || filters.sector || filters.region || null) : null;

  if (!hasDistrictIds && areaName) {
    try {
      const list = await listDistricts(areaName);
      // best-effort name match
      const match = (list || []).find(d =>
        String(d.name || '').toLowerCase() === String(areaName).toLowerCase()
      ) || (list || []).find(d =>
        String(d.name || '').toLowerCase().includes(String(areaName).toLowerCase())
      );
      if (match?.id) {
        filters.districts = String(match.id); // ← pass district id
        delete filters.area;
        delete filters.sector;
        delete filters.region;
        console.log(`Using districts=${filters.districts} for area "${areaName}"`);
      } else {
        // optional fallback: keep your region bbox or text search
        const regions = await listRegions().catch(() => []);
        const r = regions.find(r => String(r.name || '').toLowerCase().includes(String(areaName).toLowerCase()));
        if (r) {
          filters.bbox_sw_lat = r.sw_latitude;
          filters.bbox_sw_lng = r.sw_longitude;
          filters.bbox_ne_lat = r.ne_latitude;
          filters.bbox_ne_lng = r.ne_longitude;
        } else {
          filters.search_query = areaName;
        }
      }
    } catch (e) {
      console.error('area→districts resolution failed', e);
      filters.search_query = areaName;
    }
 }

    // Detect locale from cookie
    const cookieStore = await cookies();
    const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";

    // Cache key with filters and locale
   const cacheKey = JSON.stringify({ filters, locale, stage: "primary" });
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
    const shouldFallback =
    (data?.results?.length ?? 0) === 0 &&
    areaName &&
    (filters.districts || filters.area || filters.sector);

  if (shouldFallback) {
    const fallbackFilters = { ...filters };
    delete fallbackFilters.districts;
    // prefer explicit sector/name search
    fallbackFilters.search_query = areaName;

    const cacheKey2 = JSON.stringify({ fallbackFilters, locale, stage: "fallback" });
    if (reellyCache.has(cacheKey2) && now - reellyCache.get(cacheKey2).timestamp < CACHE_DURATION) {
      data = reellyCache.get(cacheKey2).data;
    } else {
      const res2 = await searchProperties(fallbackFilters);
      if (res2) {
        data = res2;
        reellyCache.set(cacheKey2, { timestamp: now, data });
      }
    }
  }

    return Response.json(data || { results: [], total: 0 });
}