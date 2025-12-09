// src/app/api/off-plan/latest/route.js
import { getCachedProjects } from '@/lib/projectService';
import { applyCurrencyToProjects } from '@/lib/currencyService';

export const runtime = 'nodejs';

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const currency = (searchParams.get('currency') || 'AED').toUpperCase();

  const filters = {
    // ✅ Latest endpoint: only PRESALE projects
    saleStatus: 'presale',
    status: 'presale', // fallback

    // Sort logic handled in service by default or override
    sortBy: 'updatedAt',
    sortOrder: 'desc',

    // pagination
    page: parseInt(searchParams.get('page')) || 1,
    pageSize: Math.min(parseInt(searchParams.get('pageSize')) || 12, 50),

    // optional
    currency,
  };

  if (searchParams.get('region')) {
    filters.search = searchParams.get('region'); // generic search
  }
  if (searchParams.get('country')) {
    filters.country = searchParams.get('country'); // handled as generic search? or ignore if not in schema.
    // getCachedProjects uses search param for locations.
  }

  // console.log('🆕 /api/off-plan/latest (Cached) filters:', filters);

  let data = await getCachedProjects(filters);

  // 🔹 NEW: Apply currency conversion
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
