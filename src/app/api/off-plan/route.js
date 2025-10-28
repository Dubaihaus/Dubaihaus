import { searchProperties, listRegions, listDistricts } from "@/lib/reellyApi";
import { cookies } from "next/headers";

// Cache for Reelly API responses
const reellyCache = new Map();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Helper function to search across all location fields
async function resolveAreaToFilters(areaName) {
  if (!areaName) return {};
  
  const filters = {};
  
  try {
    // First, try to find matching districts
    const districts = await listDistricts(areaName);
    const districtMatch = districts.find(d =>
      String(d.name || '').toLowerCase().includes(String(areaName).toLowerCase())
    );
    
    if (districtMatch?.id) {
      filters.districts = String(districtMatch.id);
      console.log(`✅ Found district match: ${districtMatch.name} (ID: ${districtMatch.id})`);
      return filters;
    }
    
    // If no district match, try regions with bounding boxes
    const regions = await listRegions();
    const regionMatch = regions.find(r =>
      String(r.name || '').toLowerCase().includes(String(areaName).toLowerCase())
    );
    
    if (regionMatch) {
      filters.bbox_sw_lat = regionMatch.sw_latitude;
      filters.bbox_sw_lng = regionMatch.sw_longitude;
      filters.bbox_ne_lat = regionMatch.ne_latitude;
      filters.bbox_ne_lng = regionMatch.ne_longitude;
      console.log(`✅ Found region match: ${regionMatch.name}`);
      return filters;
    }
    
    // Fallback to search query for sector-based areas like "Downtown Dubai"
    console.log(`🔍 No district/region match, using search_query for: ${areaName}`);
    filters.search_query = areaName;
    
  } catch (error) {
    console.error('Error resolving area:', error);
    filters.search_query = areaName;
  }
  
  return filters;
}

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

  // Enhanced area resolution - check all location fields
  const areaName = filters.area || filters.sector || filters.region || filters.search || null;
  
  if (areaName && !filters.districts && !filters.search_query) {
    try {
      const areaFilters = await resolveAreaToFilters(areaName);
      Object.assign(filters, areaFilters);
      
      // Clean up redundant filters
      delete filters.area;
      delete filters.sector;
      delete filters.region;
    } catch (error) {
      console.error('Area resolution failed:', error);
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

  // Multi-strategy fallback for empty results
  if ((data?.results?.length ?? 0) === 0 && areaName) {
    console.log("🔄 Trying fallback strategies for:", areaName);
    
    const fallbackStrategies = [
      // Strategy 1: Direct search query
      async () => {
        const fallbackFilters = { ...filters, search_query: areaName };
        delete fallbackFilters.districts;
        delete fallbackFilters.bbox_sw_lat;
        delete fallbackFilters.bbox_sw_lng;
        delete fallbackFilters.bbox_ne_lat;
        delete fallbackFilters.bbox_ne_lng;
        return await searchProperties(fallbackFilters);
      },
      
      // Strategy 2: Search by name only
      async () => {
        const fallbackFilters = { search: areaName, pageSize: filters.pageSize || 20 };
        return await searchProperties(fallbackFilters);
      },
      
      // Strategy 3: Try with different area name variations
      async () => {
        const variations = [
          areaName.toLowerCase(),
          areaName.toUpperCase(),
          areaName.replace(/\s+/g, ' ').trim()
        ];
        
        for (const variation of variations) {
          const fallbackFilters = { ...filters, search_query: variation };
          delete fallbackFilters.districts;
          const result = await searchProperties(fallbackFilters);
          if (result?.results?.length > 0) return result;
        }
        return null;
      }
    ];
    
    for (const strategy of fallbackStrategies) {
      try {
        const fallbackResult = await strategy();
        if (fallbackResult?.results?.length > 0) {
          console.log(`✅ Fallback successful with ${fallbackResult.results.length} results`);
          data = fallbackResult;
          // Update cache with successful fallback
          reellyCache.set(cacheKey, { timestamp: now, data });
          break;
        }
      } catch (error) {
        console.error('Fallback strategy failed:', error);
      }
    }
  }

  return Response.json(data || { results: [], total: 0 });
}