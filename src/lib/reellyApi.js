// src/lib/reellyApi.js
import dns from "node:dns";
import { normalizeProject } from "./ProjectNormalizer";

dns.setDefaultResultOrder("ipv4first");

const RAW_BASE_URL =
  process.env.REELLY_BASE_URL ||
  "https://api-reelly.up.railway.app/api/v2/clients";

const BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");
const API_TOKEN = process.env.REELLY_API_TOKEN || process.env.RELLY_API_TOKEN;

function buildHeaders(extra = {}) {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-API-Key": API_TOKEN,
    ...extra,
  };
}

// ---- CACHES ----
let _regionsCache = { at: 0, data: [] };
const REGIONS_TTL_MS = 1000 * 60 * 60; // 1h

let _developersCache = { at: 0, data: [] };
const DEVELOPERS_TTL_MS = 1000 * 60 * 60 * 12; // 12h

let _districtsCache = { at: 0, data: {} };
const DISTRICTS_TTL_MS = 1000 * 60 * 60; // 1h

let _countriesCache = { at: 0, data: [] };
const COUNTRIES_TTL_MS = 1000 * 60 * 60 * 24; // 24h

// ---------- Countries ----------
export async function listCountries() {
  const now = Date.now();
  if (now - _countriesCache.at < COUNTRIES_TTL_MS && _countriesCache.data?.length) {
    return _countriesCache.data;
  }

  const res = await fetch(`${BASE_URL}/countries?format=json`, {
    headers: buildHeaders(),
    cache: "no-store",
  });

  if (!res.ok) return [];
  const data = await res.json();
  _countriesCache = { at: now, data };
  return data;
}

// ---------- Districts ----------
export async function listDistricts(search = "") {
  const now = Date.now();
  const cacheKey = search || "all";

  if (
    now - _districtsCache.at < DISTRICTS_TTL_MS &&
    _districtsCache.data[cacheKey]
  ) {
    return _districtsCache.data[cacheKey];
  }

  const params = new URLSearchParams({ format: "json" });
  if (search) params.append("search", search);

  const res = await fetch(`${BASE_URL}/districts?${params.toString()}`, {
    headers: buildHeaders(),
    cache: "no-store",
  });

  if (!res.ok) return [];
  const data = await res.json();

  if (!_districtsCache.data) _districtsCache.data = {};
  _districtsCache.data[cacheKey] = data;
  _districtsCache.at = now;

  return data;
}

// ---------- Regions ----------
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

// ---------- Developers ----------
export async function listDevelopers({ limit = 50, offset = 0 } = {}) {
  const now = Date.now();
  if (now - _developersCache.at < DEVELOPERS_TTL_MS && _developersCache.data?.length) {
    return _developersCache.data;
  }

  const qs = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    format: "json",
  });

  const res = await fetch(`${BASE_URL}/developers?${qs.toString()}`, {
    headers: buildHeaders(),
    cache: "no-store",
  });

  if (!res.ok) return [];
  const json = await res.json();

  const rows = (json?.results || json || []).map((d) => ({
    id: d.id,
    name: d.name,
    website: d.website ?? null,
    logoUrl: d.logo?.url ?? null,
    raw: d,
  }));

  _developersCache = { at: now, data: rows };
  return rows;
}

// ---------- Core: search projects (single page) ----------
export async function searchProperties({
  page = 1,
  pageSize = 20,
  pricedOnly = true,
  includeAllData = false, // reserved flag for future "expand" usage
  ...filters
} = {}) {
  const url = `${BASE_URL}/projects`;

  const offset = (page - 1) * pageSize;
  const qs = new URLSearchParams({
    limit: String(pageSize),
    offset: String(offset),
    format: "json",
  });

  // Default ordering: latest updated first
  if (!filters.ordering) {
    qs.set("ordering", "-updated_at");
  }

  const filterMappings = {
    location: "search",
    bedrooms: "unit_bedrooms",
    minPrice: "unit_price_from",
    maxPrice: "unit_price_to",
    minSize: "unit_area_from",
    maxSize: "unit_area_to",
    currency: "preferred_currency",
    region: "region",
    developer: "developer",
    developerId: "developer",
    developer_id: "developer",
    country: "country",
    district: "district",
    districts: "districts",
    district_ids: "districts",
    bbox_sw_lat: "bbox_sw_lat",
    bbox_sw_lng: "bbox_sw_lng",
    bbox_ne_lat: "bbox_ne_lat",
    bbox_ne_lng: "bbox_ne_lng",
    sector: "search_query",
    area: "search_query",
    ordering: "ordering",
    status: "status",
    sale_status: "sale_status",
    construction_status: "construction_status",
    building_type: "building_type",
    furnishing: "furnishing",
  };

  // Price filter default
  if (pricedOnly && !("minPrice" in filters) && !("unit_price_from" in filters)) {
    qs.set("unit_price_from", "1");
  }

  // Optional future: include more data via expand param
  if (includeAllData) {
    qs.set("expand", "developer,buildings,amenities,payment_plans");
  }

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") continue;
    const apiParam = filterMappings[key] || key;

    if (Array.isArray(value)) {
      qs.append(apiParam, value.join(","));
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
      const errText = await res.text().catch(() => "");
      console.error(
        "Reelly /projects error:",
        res.status,
        res.statusText,
        errText.slice(0, 300)
      );
      return null;
    }

    const json = await res.json();
    return transformPropertiesResponse(json, page, pageSize);
  } catch (err) {
    console.error("Reelly /projects fetch failed:", err);
    return null;
  }
}

// ---------- Multi-page aggregator: searchAllProjects (for map) ----------
export async function searchAllProjects({
  pageSize = 200,
  maxPages = 6,       // safety cap; 6 * 200 = 1200 projects
  pricedOnly = false,
  ...filters
} = {}) {
  const all = [];
  let page = 1;
  let total = 0;

  while (page <= maxPages) {
    const data = await searchProperties({ page, pageSize, pricedOnly, ...filters });
    if (!data || !Array.isArray(data.results) || data.results.length === 0) break;

    all.push(...data.results);
    total = data.total || all.length;

    if (!data.next || all.length >= total) break;

    page += 1;
  }

  return {
    results: all,
    total,
    pageCount: page - 1,
    next: null,
    previous: null,
  };
}

// ---------- Single project ----------
export async function getPropertyById(id) {
  const url = `${BASE_URL}/projects/${encodeURIComponent(id)}?format=json`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: buildHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(
        `❌ Reelly /projects/${id} error:`,
        res.status,
        res.statusText,
        body.slice(0, 200)
      );
      return null;
    }

    const json = await res.json();
    return transformPropertyResponse(json);
  } catch (err) {
    console.error("❌ Reelly /projects/{id} fetch error:", err);
    return null;
  }
}

// ---------- Markers (if you want them later) ----------
export async function getProjectMarkers() {
  const url = `${BASE_URL}/projects/markers?format=json`;

  try {
    const res = await fetch(url, {
      headers: buildHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Reelly /projects/markers error:", res.status, res.statusText);
      return [];
    }

    const data = await res.json();
    return data || [];
  } catch (err) {
    console.error("Reelly /projects/markers fetch failed:", err);
    return [];
  }
}

// ---------- Transform helpers ----------
function transformPropertiesResponse(reellyData, page, pageSize) {
  const items = reellyData?.results || reellyData || [];
  const results = items.map(normalizeProject).filter(Boolean);

  return {
    results,
    total: reellyData?.count ?? results.length,
    page,
    pageSize,
    next: reellyData?.next ?? null,
    previous: reellyData?.previous ?? null,
  };
}

function transformPropertyResponse(reellyProperty) {
  return normalizeProject(reellyProperty);
}
