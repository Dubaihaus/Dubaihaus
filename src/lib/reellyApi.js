// src/lib/reellyApi.js
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

const BASE_URL =
  process.env.REELLY_BASE_URL || "https://search-listings-production.up.railway.app/v1";
// accept either spelling just in case
const API_KEY = process.env.REELLY_API_KEY || process.env.RELLY_API_KEY;

function buildHeaders(extra = {}) {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-API-Key": API_KEY, // <-- Reelly expects this, not Bearer
    ...extra,
  };
}

export async function searchProperties({ page = 1, pageSize = 20, ...filters } = {}) {
  const url = `${BASE_URL}/properties`;

  // Reelly uses per_page, not pageSize
  const qs = new URLSearchParams({
    page: String(page),
    per_page: String(pageSize),
  });

  // Do not forward app-only params like currency
  for (const [k, v] of Object.entries(filters)) {
    if (k === "currency") continue;
    if (v !== undefined && v !== null && v !== "") qs.append(k, String(v));
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
    return transformPropertiesResponse(json);
  } catch (err) {
    console.error("Reelly API fetch failed:", err);
    return null;
  }
}

export async function getPropertyById(id) {
  const url = `${BASE_URL}/properties/${encodeURIComponent(id)}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: buildHeaders(), // <-- use X-API-Key, not Authorization: Bearer
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

function transformPropertiesResponse(reellyData) {
  const items = reellyData?.items || reellyData?.results || reellyData?.data || [];
  return {
    results: items.map((item) => ({
      id: item.id,
      title: item.name,
      location: item.area,
      price: item.min_price_aed ?? item.min_price ?? null,
      coverPhoto: parseImageUrl(item.cover_image_url),
      area: item.area,
      completionDate: item.completion_datetime,
      developer: item.developer,
      status: item.status,
    })),
    total: reellyData?.total ?? items.length,
    page: reellyData?.page ?? 1,
    pageSize: reellyData?.per_page ?? reellyData?.pageSize ?? items.length,
  };
}

function transformPropertyResponse(reellyProperty) {
  const arch = (reellyProperty?.architecture || []).map((img) => img?.url).filter(Boolean);
  const interior = (reellyProperty?.interior || []).map((img) => img?.url).filter(Boolean);
  const lobby = (reellyProperty?.lobby || []).map((img) => img?.url).filter(Boolean);
  const cover = reellyProperty?.cover?.url;

  const allImages = [...arch, ...interior, ...lobby, cover].filter(Boolean);

  return {
    id: reellyProperty?.id,
    title: reellyProperty?.name,
    description: reellyProperty?.overview,
    location: reellyProperty?.area,
    price: reellyProperty?.min_price_aed ?? reellyProperty?.min_price ?? null,
    media: { photos: allImages },
    amenities: Array.isArray(reellyProperty?.facilities)
      ? reellyProperty.facilities.map((f) => ({ items: [f?.name].filter(Boolean) }))
      : [],
    building_info: { name: reellyProperty?.name },
    developer: reellyProperty?.developer,
    completionDate: reellyProperty?.completion_datetime,
    ...reellyProperty,
  };
}

function parseImageUrl(imageUrlJson) {
  if (!imageUrlJson) return null;
  try {
    const parsed = JSON.parse(imageUrlJson);
    return parsed?.url || imageUrlJson;
  } catch {
    return imageUrlJson;
  }
}
