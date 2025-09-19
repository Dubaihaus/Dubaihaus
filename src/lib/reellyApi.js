// src/lib/reellyApi.js
import dns from "node:dns";
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

export async function searchProperties({ page = 1, pageSize = 20, ...filters } = {}) {
  const url = `${BASE_URL}/projects`;
  
  // Convert page to offset (new API uses offset/limit instead of page/per_page)
  const offset = (page - 1) * pageSize;
  const qs = new URLSearchParams({
    limit: String(pageSize),
    offset: String(offset),
  });

  // Map filter parameters to API expected parameters
  const filterMappings = {
    location: "sector", // Map location to sector
    bedrooms: "unit_bedrooms",
    minPrice: "min_price",
    maxPrice: "max_price",
    minSize: "min_size",
    maxSize: "max_size",
    currency: "price_currency",
    // Add other mappings as needed
  };

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") continue;
    
    const apiParam = filterMappings[key] || key;
    qs.append(apiParam, String(value));
  }

  try {
    const res = await fetch(`${url}?${qs.toString()}`, {
      headers: buildHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Reelly API error:", res.status, res.statusText, errText.slice(0, 300));
      
      // More detailed error information
      if (res.status === 404) {
        console.error("Endpoint not found. Please check the API URL structure.");
      } else if (res.status === 401) {
        console.error("Authentication failed. Please check your API token.");
      }
      
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
  const items = reellyData?.results || [];
  
  return {
    results: items.map((item) => ({
      id: item.id,
      title: item.name,
      location: item.location?.sector || item.location?.district || item.location?.region || "Unknown location",
      price: item.min_price ?? null,
      coverPhoto: item.cover_image?.url || null,
      area: item.location ? `${item.location.sector}, ${item.location.district}` : "Unknown area",
      completionDate: item.completion_date || item.completion_datetime,
      developer: item.developer,
      status: item.construction_status || item.sale_status,
      // Additional fields you might need
      minSize: item.min_size,
      maxSize: item.max_size,
      priceCurrency: item.price_currency,
    })),
    total: reellyData?.count ?? items.length,
    page: page,
    pageSize: pageSize,
    next: reellyData?.next,
    previous: reellyData?.previous,
  };
}

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
// Test script to verify the API endpoint
const testApiConnection = async () => {
  const BASE_URL = "https://api-reelly.up.railway.app/api/v2/clients";
  const API_TOKEN = process.env.REELLY_API_TOKEN;
  
  try {
    // Test without any parameters first
    const response = await fetch(`${BASE_URL}/projects`, {
      headers: {
        Accept: "application/json",
    "Content-Type": "application/json",
    // IMPORTANT: Reelly expects X-API-Key (not Authorization)
    "X-API-Key": API_TOKEN,
      }
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log("Success! Data:", data);
    } else {
      const errorText = await response.text();
      console.log("Error response:", errorText);
    }
  } catch (error) {
    console.error("Connection error:", error);
  }
};

testApiConnection();