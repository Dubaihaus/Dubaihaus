// src/app/api/off-plan/route.js
import {
  searchProperties,
  listRegions,
  listDistricts,
  searchAllProjects,
  getPropertyById,
} from "@/lib/reellyApi";
import { cookies } from "next/headers";
import { translateProjectsForLocale } from "@/lib/translateReelly";

export const runtime = "nodejs";

// Helper function to search across all location fields
async function resolveAreaToFilters(areaName) {
  if (!areaName) return {};

  const filters = {};

  try {
    const districts = await listDistricts(areaName);
    const districtMatch = districts.find((d) =>
      String(d.name || "")
        .toLowerCase()
        .includes(String(areaName).toLowerCase())
    );

    if (districtMatch?.id) {
      filters.districts = String(districtMatch.id);
      return filters;
    }

    const regions = await listRegions();
    const regionMatch = regions.find((r) =>
      String(r.name || "")
        .toLowerCase()
        .includes(String(areaName).toLowerCase())
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
    console.error("Error resolving area:", error);
    filters.search_query = areaName;
  }

  return filters;
}

// Request deduplication in memory
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

// LATEST PROJECTS FILTER LOGIC
function getLatestProjectsFilters() {
  return {
    sale_status: "on_sale",
    status: "presale", // SaleStatusEnum / status usually lower-case
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
    else if (key === "forMap" || key === "mode") filters[key] = value;
    else if (value === "true" || value === "false")
      filters[key] = value === "true";
    else filters[key] = value;
  });

  const forMap =
    filters.forMap === true ||
    filters.forMap === "true" ||
    filters.mode === "map";

  // LATEST mode: /api/off-plan?latest=true
  if (filters.latest) {
    const latestFilters = getLatestProjectsFilters();
    Object.assign(filters, latestFilters);
    delete filters.latest;
  }

  // Enhanced area resolution
  const areaName =
    filters.area || filters.sector || filters.region || filters.search || null;

  if (areaName && !filters.districts && !filters.search_query) {
    try {
      const areaFilters = await resolveAreaToFilters(areaName);
      Object.assign(filters, areaFilters);

      delete filters.area;
      delete filters.sector;
      delete filters.region;
    } catch (error) {
      console.error("Area resolution failed:", error);
      filters.search_query = areaName;
    }
  }

  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  // locale reserved if you later localize queries

  console.log("🔍 /api/off-plan filters:", { ...filters, locale, forMap });

  let data;

  if (forMap) {
    // MAP MODE: aggregate multiple pages, no price restriction
    const { pageSize = 200, forMap: _fm, mode, ...rest } = filters;
    data = await searchAllProjects({
      pageSize: Math.min(pageSize || 200, 300),
      maxPages: 6,
      pricedOnly: false,
      ...rest,
    });
  } else {
    // NORMAL / LATEST MODE
    data = await dedupedSearchProperties(filters);
  }

  // Fallback strategies only for non-map searches
  if (!forMap && (data?.results?.length ?? 0) === 0 && areaName) {
    console.log("🔄 Trying fallback strategies for:", areaName);

    const fallbackStrategies = [
      async () => {
        const fallbackFilters = { ...filters, search_query: areaName };
        delete fallbackFilters.districts;
        delete fallbackFilters.bbox_sw_lat;
        delete fallbackFilters.bbox_sw_lng;
        delete fallbackFilters.bbox_ne_lat;
        delete fallbackFilters.bbox_ne_lng;
        delete fallbackFilters.sale_status;
        delete fallbackFilters.status;
        return await dedupedSearchProperties(fallbackFilters);
      },
      async () => {
        const fallbackFilters = {
          search: areaName,
          pageSize: filters.pageSize || 20,
        };
        return await dedupedSearchProperties(fallbackFilters);
      },
    ];

    for (const strategy of fallbackStrategies) {
      try {
        const fallbackResult = await strategy();
        if (fallbackResult?.results?.length > 0) {
          console.log(
            `✅ Fallback successful with ${fallbackResult.results.length} results`
          );
          data = fallbackResult;
          break;
        }
      } catch (error) {
        console.error("Fallback strategy failed:", error);
      }
    }
  }

  // Enrich with detail data (payment plans, propertyTypes)
  if (!forMap && data?.results?.length) {
    try {
      const enrichedResults = await Promise.all(
        data.results.map(async (item) => {
          try {
            const detail = await getPropertyById(item.id);

            return {
              ...item,
              // prefer detail meta, fall back to existing values if any
              propertyTypes: detail?.propertyTypes || item.propertyTypes || [],
              paymentPlans: detail?.paymentPlans || item.paymentPlans || [],
              paymentPlan: detail?.paymentPlan || item.paymentPlan || null,
            };
          } catch (err) {
            console.error("Failed to enrich project", item.id, err);
            return item;
          }
        })
      );

      data = { ...data, results: enrichedResults };
    } catch (err) {
      console.error("Bulk enrichment failed:", err);
    }
  }

  // 🌍 Locale-aware translation (skip for map mode to save quota)
  if (!forMap && data?.results?.length && locale === "de") {
    try {
      data.results = await translateProjectsForLocale(data.results, locale);
    } catch (err) {
      console.error("Translation for off-plan results failed:", err);
    }
  }

  const responseHeaders = {
    "Content-Type": "application/json",
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
    Vary: "Accept-Encoding, Cookie, Next-Locale",
  };

  return new Response(JSON.stringify(data || { results: [], total: 0 }), {
    headers: responseHeaders,
  });
}
