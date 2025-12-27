// src/app/api/off-plan/route.js
import { getCachedProjects } from '@/lib/projectService';
import { applyCurrencyToProjects } from '@/lib/currencyService';

export const runtime = 'nodejs';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filters = {};

  const currency = (searchParams.get('currency') || 'AED').toUpperCase();

  // Parse params
  searchParams.forEach((value, key) => {
    if (key === 'currency') return;
    if (value == null || value === '') return;

    switch (key) {
      // pagination
      case 'page':
        filters.page = parseInt(value, 10) || 1;
        break;
      case 'pageSize':
        filters.pageSize = parseInt(value, 10) || 20;
        break;

      // numeric filters (we keep as string; projectService parses)
      case 'minPrice':
      case 'maxPrice':
      case 'minBedrooms':
      case 'maxBedrooms':
      case 'minSize':
      case 'maxSize':
        filters[key] = value;
        break;

      // booleans
      case 'latest':
      case 'isFeatured':
      case 'isComingSoon':
        filters[key] = value === 'true';
        break;

      // map mode
      case 'forMap':
      case 'mode':
        filters[key] = value;
        break;

      // location filters (critical for areas sections)
      case 'area':
        filters.area = value;
        filters.areas = value.split(',').filter(Boolean);
        break;
      case 'region':
        filters.region = value;
        filters.regions = value.split(',').filter(Boolean);
        break;
      case 'developer':
        filters.developer = value;
        filters.developers = value.split(',').filter(Boolean);
        break;

      case 'city':
      case 'district':
      case 'country':
        filters[key] = value;
        break;

      // generic search
      case 'search':
      case 'search_query':
        filters.search = value;
        break;

      // legacy status keys
      case 'sale_status':
        filters.saleStatus = value;
        break;
      case 'construction_status':
        filters.constructionStatus = value;
        break;

      // bounding box (from old region resolver)
      case 'bbox_sw_lat':
      case 'bbox_sw_lng':
      case 'bbox_ne_lat':
      case 'bbox_ne_lng':
        filters[key] = value;
        break;

      default:
        filters[key] = value;
    }
  });

  const forMap =
    filters.mode === 'map' ||
    filters.forMap === 'true' ||
    filters.forMap === true;

  // Specific "latest" logic – presale only
  if (filters.latest) {
    filters.saleStatus = 'presale';
    delete filters.latest;
  }

  console.log('🔍 /api/off-plan (Cached) filters:', { ...filters, currency });

  let data;

  if (forMap) {
    // 🌍 Map mode: ignore all filters, get ALL projects and then
    // filter to those with valid coordinates.
    data = await getCachedProjects({
      page: 1,
      pageSize: 1000, // you currently have ~1010 projects
      limit: 1000,
    });

    if (data?.results) {
      data.results = data.results.filter(
        (p) =>
          typeof p.lat === 'number' &&
          typeof p.lng === 'number' &&
          !Number.isNaN(p.lat) &&
          !Number.isNaN(p.lng)
      );
      data.total = data.results.length;
      data.totalPages = 1;
    }
  } else {
    data = await getCachedProjects(filters);
  }

  // 🔹 Enrich with currency
  data = await applyCurrencyToProjects(data, currency);

  const responseHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    Vary: 'Accept-Encoding, Cookie, Next-Locale',
  };

  return new Response(JSON.stringify(data || { results: [], total: 0 }), {
    headers: responseHeaders,
  });
}
