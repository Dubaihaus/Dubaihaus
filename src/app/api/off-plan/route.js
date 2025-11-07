// src/app/api/off-plan/route.js
import { searchProperties, listRegions, listDistricts } from "@/lib/reellyApi";
import { cookies } from "next/headers";

// Helper function to search across all location fields
async function resolveAreaToFilters(areaName) {
  if (!areaName) return {};
  
  const filters = {};
  
  try {
    const districts = await listDistricts(areaName);
    const districtMatch = districts.find(d =>
      String(d.name || '').toLowerCase().includes(String(areaName).toLowerCase())
    );
    
    if (districtMatch?.id) {
      filters.districts = String(districtMatch.id);
      return filters;
    }
    
    const regions = await listRegions();
    const regionMatch = regions.find(r =>
      String(r.name || '').toLowerCase().includes(String(areaName).toLowerCase())
    );
    
    if (regionMatch) {
      filters.bbox_sw_lat = regionMatch.sw_latitude;
      filters.bbox_sw_lng = regionMatch.sw_longitude;
      filters.bbox_ne_lat = regionMatch.ne_latitude;
      filters.bbox_ne_lng = regionMatch.ne_longitude;
      return filters;
    }
    
    filters.search_query = areaName;
  } catch (error) {
    console.error('Error resolving area:', error);
    filters.search_query = areaName;
  }
  
  return filters;
}

// Request deduplication in memory (short-lived, per-instance)
const inFlightRequests = new Map();

async function dedupedSearchProperties(filters) {
  const key = JSON.stringify(filters);
  
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key);
  }
  
  const promise = searchProperties(filters).finally(() => {
    inFlightRequests.delete(key);
  });
  
  inFlightRequests.set(key, promise);
  return promise;
}

// ✅ LATEST PROJECTS FILTER LOGIC — updated per Reelly
function getLatestProjectsFilters() {
  return {
    sale_status: "on_sale",    // Reelly: use on_sale
    status: "Presale",        // Reelly: and status=pre_sale
    // ordering: "-updated_at",
    pricedOnly: true,
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filters = {};

  // Parse all query parameters
  searchParams.forEach((value, key) => {
    if (key === "page") filters.page = parseInt(value);
    else if (key === "pageSize") filters.pageSize = parseInt(value);
    else if (key === "pricedOnly") filters.pricedOnly = value === "true";
    else if (key === "latest") filters.latest = value === "true";
    else if (value === "true" || value === "false") filters[key] = value === "true";
    else filters[key] = value;
  });

  // 🔹 LATEST MODE: only when latest=true is passed
  if (filters.latest) {
    const latestFilters = getLatestProjectsFilters();
    Object.assign(filters, latestFilters);
    delete filters.latest;

    // ⚠️ remove date filter for now, to avoid weird 500s / empty results
    // If you really want 90-day recency later, add updated_at_after here *after* confirming.
  }

  // Enhanced area resolution
  const areaName = filters.area || filters.sector || filters.region || filters.search || null;
  
  if (areaName && !filters.districts && !filters.search_query) {
    try {
      const areaFilters = await resolveAreaToFilters(areaName);
      Object.assign(filters, areaFilters);
      
      delete filters.area;
      delete filters.sector;
      delete filters.region;
    } catch (error) {
      console.error('Area resolution failed:', error);
      filters.search_query = areaName;
    }
  }

  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";

  console.log("🔍 Fetching Reelly API with filters:", filters);
  let data = await dedupedSearchProperties(filters);
  
  // Multi-strategy fallback for empty results (keep as-is)
  if ((data?.results?.length ?? 0) === 0 && areaName) {
    console.log("🔄 Trying fallback strategies for:", areaName);
    
    const fallbackStrategies = [
      async () => {
        const fallbackFilters = { ...filters, search_query: areaName };
        delete fallbackFilters.districts;
        delete fallbackFilters.bbox_sw_lat;
        delete fallbackFilters.bbox_sw_lng;
        delete fallbackFilters.bbox_ne_lat;
        delete fallbackFilters.bbox_ne_lng;
        // Relax filters for fallback:
        delete fallbackFilters.sale_status;
        delete fallbackFilters.status;
        return await dedupedSearchProperties(fallbackFilters);
      },
      
      async () => {
        const fallbackFilters = { search: areaName, pageSize: filters.pageSize || 20 };
        return await dedupedSearchProperties(fallbackFilters);
      }
    ];
    
    for (const strategy of fallbackStrategies) {
      try {
        const fallbackResult = await strategy();
        if (fallbackResult?.results?.length > 0) {
          console.log(`✅ Fallback successful with ${fallbackResult.results.length} results`);
          data = fallbackResult;
          break;
        }
      } catch (error) {
        console.error('Fallback strategy failed:', error);
      }
    }
  }

  const responseHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800',
    'Vary': 'Accept-Encoding, Cookie, Next-Locale',
  };

  return new Response(JSON.stringify(data || { results: [], total: 0 }), {
    headers: responseHeaders,
  });
}
