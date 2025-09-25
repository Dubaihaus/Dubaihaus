// src/lib/reellyApi.js
import dns from "node:dns";
import { normalizeProject } from './ProjectNormalizer';
dns.setDefaultResultOrder("ipv4first");

const RAW_BASE_URL =
  process.env.REELLY_BASE_URL ||
  "https://api-reelly.up.railway.app/api/v2/clients";

// 🔧 remove any trailing slashes to avoid `//projects`
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");
const API_TOKEN = process.env.REELLY_API_TOKEN || process.env.RELLY_API_TOKEN;

function buildHeaders(extra = {}) {
  return {
      Accept: "application/json",
    "Content-Type": "application/json",
    // IMPORTANT: Reelly expects X-API-Key (not Authorization)
    "X-API-Key": API_TOKEN,
    ...extra,
  };
}
let _regionsCache = { at: 0, data: [] };
const REGIONS_TTL_MS = 1000 * 60 * 60; // 1h

export async function listRegions() {
  const now = Date.now();
  if (now - _regionsCache.at < REGIONS_TTL_MS && _regionsCache.data?.length) {
    return _regionsCache.data;
  }
  const res = await fetch(`${BASE_URL}/regions?format=json`, {
    headers: buildHeaders(),
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  _regionsCache = { at: now, data };
  return data;
}

export async function searchProperties({ page = 1, pageSize = 20, pricedOnly = true, ...filters } = {}) {
  const url = `${BASE_URL}/projects`;
  
  const offset = (page - 1) * pageSize;
  const qs = new URLSearchParams({
    limit: String(pageSize),
    offset: String(offset),
  });

  // Enhanced filter mappings including area-specific filters
  const filterMappings = {
    location: "search_query", // Use search_query for location text search
    sector: "search_query",   // Map sector to search_query
    area: "search_query",     // Map area to search_query
    bedrooms: "unit_bedrooms",
    minPrice: "unit_price_from",
    maxPrice: "unit_price_to",
    minSize: "unit_area_from",
    maxSize: "unit_area_to",
    currency: "preferred_currency",
    region: "region",
    // Bounding box filters
    bbox_sw_lat: "bbox_sw_lat",
    bbox_sw_lng: "bbox_sw_lng", 
    bbox_ne_lat: "bbox_ne_lat",
    bbox_ne_lng: "bbox_ne_lng",
  };

  // Price filtering - only apply if explicitly requested
  if (pricedOnly && !('minPrice' in filters) && !('unit_price_from' in filters)) {
    qs.set('unit_price_from', '1'); // excludes null/0
  }

  // Apply all filters
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") continue;
    
    const apiParam = filterMappings[key] || key;
    
    // Handle array parameters (comma-separated)
    if (Array.isArray(value)) {
      qs.append(apiParam, value.join(','));
    } else {
      qs.append(apiParam, String(value));
    }
  }

  try {
    const res = await fetch(`${url}?${qs.toString()}`, {
      headers: buildHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Reelly API error:", res.status, res.statusText, errText.slice(0, 300));
      return null;
    }

    const json = await res.json();
    return transformPropertiesResponse(json, page, pageSize);
  } catch (err) {
    console.error("Reelly API fetch failed:", err);
    return null;
  }
}
export async function getPropertyById(id) {
  const url = `${BASE_URL}/projects/${encodeURIComponent(id)}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: buildHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`❌ Reelly Property API error: ${res.status} - ${res.statusText} ${body.slice(0, 200)}`);
      return null;
    }

    const json = await res.json();
    return transformPropertyResponse(json);
  } catch (err) {
    console.error("❌ Reelly API fetch error:", err);
    return null;
  }
}

// ---------- transforms ----------

function transformPropertiesResponse(reellyData, page, pageSize) {
 const items = (reellyData?.results || []).filter(i => Number(i?.min_price) > 0);
  
    // return normalizeProject(reellyData);

      const results = items.map(normalizeProject);

  return {
    results,
    total: reellyData?.count ?? results.length,
    page,
    pageSize,
    next: reellyData?.next ?? null,
    previous: reellyData?.previous ?? null,
  };
}
    // return {
    //  results: items.map((item) => ({
    //   id: item.id,
    //   title: item.name,
    //   location: item.location?.sector || item.location?.district || item.location?.region || "Unknown location",
    //   price: item.min_price ?? null,
    //   coverPhoto: item.cover_image?.url || null,
    //   area: item.location ? `${item.location.sector}, ${item.location.district}` : "Unknown area",
    //   completionDate: item.completion_date || item.completion_datetime,
    //   developer: item.developer,
    //   status: item.construction_status || item.sale_status,
    //   // Additional fields you might need
    //   minSize: item.min_size,
    //   maxSize: item.max_size,
    //   priceCurrency: item.price_currency,
    // })),
//     total: reellyData?.count ?? items.length,
//     page: page,
//     pageSize: pageSize,
//     next: reellyData?.next,
//     previous: reellyData?.previous,
//   };
// }

function transformPropertyResponse(reellyProperty) {
  // Extract images from various sources
  const arch = (reellyProperty?.architecture || []).map((img) => img?.url).filter(Boolean);
  const interior = (reellyProperty?.interior || []).map((img) => img?.url).filter(Boolean);
  const lobby = (reellyProperty?.lobby || []).map((img) => img?.url).filter(Boolean);
  const cover = reellyProperty?.cover_image?.url;

  const allImages = [...arch, ...interior, ...lobby, cover].filter(Boolean);

  return {
    id: reellyProperty?.id,
    title: reellyProperty?.name,
    description: reellyProperty?.description || reellyProperty?.short_description,
    location: reellyProperty?.location ? 
      `${reellyProperty.location.sector}, ${reellyProperty.location.district}, ${reellyProperty.location.region}` : 
      "Unknown location",
    price: reellyProperty?.min_price ?? null,
    maxPrice: reellyProperty?.max_price ?? null,
    media: { photos: allImages },
    amenities: Array.isArray(reellyProperty?.project_amenities)
      ? reellyProperty.project_amenities.map((amenity) => ({ 
          name: amenity.amenity?.name, 
          icon: amenity.icon?.url 
        }))
      : [],
    building_info: { 
      name: reellyProperty?.name,
      building_count: reellyProperty?.building_count,
      units_count: reellyProperty?.units_count
    },
    developer: reellyProperty?.developer,
    completionDate: reellyProperty?.completion_date || reellyProperty?.completion_datetime,
    constructionStatus: reellyProperty?.construction_status,
    saleStatus: reellyProperty?.sale_status,
    minSize: reellyProperty?.min_size,
    maxSize: reellyProperty?.max_size,
    priceCurrency: reellyProperty?.price_currency,
    areaUnit: reellyProperty?.area_unit,
    // Include the raw data for debugging or future use
    rawData: reellyProperty
  };
}
