// // src/app/api/off-plan/route.js
// import { getCachedProjects } from '@/lib/projectService';
// import { applyCurrencyToProjects } from '@/lib/currencyService';

// export const runtime = 'nodejs';

// export async function GET(request) {
//   const { searchParams } = new URL(request.url);
//   const filters = {};

//   const currency = (searchParams.get('currency') || 'AED').toUpperCase();

//   // Parse params
//   searchParams.forEach((value, key) => {
//     if (key === 'currency') return;
//     if (value == null || value === '') return;

//     switch (key) {
//       // pagination
//       case 'page':
//         filters.page = parseInt(value, 10) || 1;
//         break;
//       case 'pageSize':
//         filters.pageSize = parseInt(value, 10) || 20;
//         break;

//       // numeric filters (we keep as string; projectService parses)
//       case 'minPrice':
//       case 'maxPrice':
//       case 'minBedrooms':
//       case 'maxBedrooms':
//       case 'minSize':
//       case 'maxSize':
//         filters[key] = value;
//         break;

//       // booleans
//       case 'latest':
//       case 'isFeatured':
//       case 'isComingSoon':
//         filters[key] = value === 'true';
//         break;

//       // map mode
//       case 'forMap':
//       case 'mode':
//         filters[key] = value;
//         break;

//       // location filters (critical for areas sections)
//       case 'area':
//         filters.area = value;
//         filters.areas = value.split(',').filter(Boolean);
//         break;
//       case 'region':
//         if (value.includes(',')) {
//           filters.regions = value.split(',').filter(Boolean);
//         } else {
//           filters.region = value;
//         }
//         break;
//       case 'developer':
//         filters.developer = value;
//         filters.developers = value.split(',').filter(Boolean);
//         break;

//       case 'city':
//       case 'district':
//       case 'country':
//         filters[key] = value;
//         break;

//       // generic search
//       // case 'search':
//       // case 'search_query':
//       //   filters.search = value;
//       //   break;
//       // generic search (free text)
//       case 'search':
//         filters.search = value;
//         break;

//       // legacy semantics: community / area / sector search
//       case 'search_query':
//         filters.area = value;
//         filters.areas = value.split(',').filter(Boolean);
//         break;

//       // legacy status keys
//       case 'sale_status':
//         filters.saleStatus = value;
//         break;
//       case 'construction_status':
//         filters.constructionStatus = value;
//         break;

//       // bounding box (from old region resolver)
//       case 'bbox_sw_lat':
//       case 'bbox_sw_lng':
//       case 'bbox_ne_lat':
//       case 'bbox_ne_lng':
//         filters[key] = value;
//         break;

//       default:
//         filters[key] = value;
//     }
//   });

//   const forMap =
//     filters.mode === 'map' ||
//     filters.forMap === 'true' ||
//     filters.forMap === true;

//   // Specific "latest" logic – presale only
//   if (filters.latest) {
//     filters.saleStatus = 'presale';
//     delete filters.latest;
//   }

//   console.log('🔍 /api/off-plan (Cached) filters:', { ...filters, currency });

//   let data;

//   if (forMap) {
//     // 🌍 Map mode: ignore all filters, get ALL projects and then
//     // filter to those with valid coordinates.
//     data = await getCachedProjects({
//       page: 1,
//       pageSize: 1000, // you currently have ~1010 projects
//       limit: 1000,
//     });

//     if (data?.results) {
//       data.results = data.results.filter(
//         (p) =>
//           typeof p.lat === 'number' &&
//           typeof p.lng === 'number' &&
//           !Number.isNaN(p.lat) &&
//           !Number.isNaN(p.lng)
//       );
//       data.total = data.results.length;
//       data.totalPages = 1;
//     }
//   } else {
//     data = await getCachedProjects(filters);
//   }

//   // 🔹 Enrich with currency
//   data = await applyCurrencyToProjects(data, currency);

//   const responseHeaders = {
//     'Content-Type': 'application/json',
//     'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
//     Vary: 'Accept-Encoding, Cookie, Next-Locale',
//   };

//   return new Response(JSON.stringify(data || { results: [], total: 0 }), {
//     headers: responseHeaders,
//   });
// }
// src/app/api/off-plan/route.js
import { getCachedProjects } from '@/lib/projectService';
import { applyCurrencyToProjects } from '@/lib/currencyService';
import { searchProperties, searchAllProjects } from '@/lib/reellyApi';
import { hydrateProjectsBatch } from '@/lib/projectDataHydration';

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

      // numeric filters
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

      // location filters
      case 'area':
        filters.area = value;
        filters.areas = value.split(',').filter(Boolean);
        break;
      case 'region':
        if (value.includes(',')) {
          filters.regions = value.split(',').filter(Boolean);
        } else {
          filters.region = value;
        }
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
        filters.search = value;
        break;

      // legacy semantics: community / area / sector search
      case 'search_query':
        filters.area = value;
        filters.areas = value.split(',').filter(Boolean);
        break;

      // legacy status keys
      case 'sale_status':
        filters.sale_status = value; // Keep in snake_case so Reelly understands it
        filters.saleStatus = value;  // DB fallback needs this camelCase
        break;
      case 'construction_status':
        filters.constructionStatus = value;
        break;

      // bounding box
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

  // "latest" = presale only (your existing logic)
  const isLatestRequest = !!filters.latest;

  if (filters.latest) {
    filters.saleStatus = 'presale';
    delete filters.latest;
  }

  console.log('🔍 /api/off-plan filters:', { ...filters, currency, forMap, isLatestRequest });

  const needsManualPagination = !forMap && (filters.sale_status === 'presale' || filters.sale_status === 'start_of_sales');

  let data;
  let dataSource = 'reelly_api';

  // 🌍 Map mode: get ALL projects via searchAllProjects
  if (forMap) {
    try {
      const apiData = await searchAllProjects({
        pageSize: 500,
        maxPages: 10,
      });

      if (apiData && apiData.results && apiData.results.length > 0) {
        data = apiData;
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
    } catch (e) {
      console.warn("Map Reelly API fell back to DB:", e);
    }
  }

  // ✅ Search mode: try searchProperties first
  if (!data && !forMap) {
    try {
      // Reelly filters object
      const apiFilters = { ...filters };

      if (needsManualPagination) {
        // Fetch all pages up to a reasonable cap to ensure we get all presale/start_of_sales
        // Then we will manually filter and paginate below.
        delete apiFilters.page;
        delete apiFilters.pageSize;

        const apiData = await searchAllProjects({
          pageSize: 200,
          maxPages: 5, // up to 1000 projects per status is more than enough
          ...apiFilters
        });

        if (apiData && apiData.results) {
          data = apiData;
        }
      } else {
        const apiData = await searchProperties(apiFilters);

        if (apiData && apiData.results) {
          data = apiData;
        }
      }
    } catch (e) {
      console.warn("List Reelly API fell back to DB:", e);
    }
  }

  // Fallback to cached DB if API failed or returned empty/nothing due to network
  if (!data) {
    dataSource = 'db_fallback';
    console.log("Fell back to cached DB for /api/off-plan");
    if (forMap) {
      data = await getCachedProjects({
        page: 1,
        pageSize: 1000,
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
      const dbFilters = { ...filters };
      if (needsManualPagination) {
        // Bypass pagination locally so we can do it manually after filtering
        dbFilters.page = 1;
        dbFilters.pageSize = 1000;
        dbFilters.limit = 1000;
      }
      data = await getCachedProjects(dbFilters);
    }
  }

  // Ensure we NEVER show out_of_stock on Coming Soon or On Sale pages.
  if (data && Array.isArray(data.results)) {
    if (filters.sale_status === 'presale' || filters.sale_status === 'start_of_sales') {
      data.results = data.results.filter((p) => {
        const status = (p.sale_status || '').toLowerCase();
        return status !== 'out_of_stock' && status !== 'sold_out' && status !== 'sold';
      });
      data.total = data.results.length;

      if (needsManualPagination) {
        const page = parseInt(filters.page, 10) || 1;
        const pageSize = parseInt(filters.pageSize, 10) || 20;

        data.totalPages = Math.max(1, Math.ceil(data.total / pageSize));
        data.page = page;
        data.pageSize = pageSize;

        const startIndex = (page - 1) * pageSize;
        data.results = data.results.slice(startIndex, startIndex + pageSize);
      } else if (filters.pageSize) {
        data.totalPages = Math.max(1, Math.ceil(data.total / filters.pageSize));
      }
    }
  }

  if (!forMap && data && Array.isArray(data.results) && data.results.length > 0) {
    try {
      data.results = await hydrateProjectsBatch(data.results, currency, 5);
    } catch (hydrateError) {
      console.warn('⚠️ Hydration failed, using original data:', hydrateError.message);
    }
  }

  // Currency enrichment (works for both sources)
  data = await applyCurrencyToProjects(data, currency);

  const responseHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    Vary: 'Accept-Encoding, Cookie, Next-Locale',
    'X-Sale-Status-Filter': filters.sale_status || 'none',
    'X-Data-Source': dataSource,
  };

  return new Response(JSON.stringify(data || { results: [], total: 0 }), {
    headers: responseHeaders,
  });
}
