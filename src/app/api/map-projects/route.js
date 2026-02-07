// src/app/api/map-projects/route.js
import { searchAllProjects } from '@/lib/reellyApi';
import { getCachedProjects } from '@/lib/projectService';

export const runtime = 'nodejs';

/**
 * GET /api/map-projects
 * Returns all projects for map display (all sale statuses, minimal fields)
 * Caches for 6 hours
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const currency = (searchParams.get('currency') || 'AED').toUpperCase();

    // 1. Try Reelly API first (all statuses)
    try {
        const data = await searchAllProjects({
            pageSize: 200,
            maxPages: 6,        // 1200 projects max
            pricedOnly: false,  // Include all, even unpriiced
            currency,
        });

        if (data && data.results && data.results.length > 0) {
            // Map to minimal fields for map markers
            const markers = data.results
                .filter(p => p.lat && p.lng)
                .map(p => ({
                    id: p.id,
                    lat: p.lat,
                    lng: p.lng,
                    name: p.title || p.name,
                    status: p.sale_status || p.status,
                    minPrice: p.minPrice || p.price_from,
                    currency: p.priceCurrency || currency,
                    slug: p.id, // For routing
                    propertyTypes: p.propertyTypes || [],
                    coverPhoto: p.coverPhoto || p.coverImage || null,
                    source: p.source || 'REELLY',
                }));

            const responseHeaders = {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=43200', // 6h cache, 12h stale
            };

            return new Response(
                JSON.stringify({
                    results: markers,
                    total: markers.length,
                    source: 'api'
                }),
                { headers: responseHeaders }
            );
        }
    } catch (error) {
        console.error('⚠️ /api/map-projects: Reelly API failed, falling back to DB.', error.message);
    }

    // 2. Fallback to DB
    try {
        const data = await getCachedProjects({
            page: 1,
            pageSize: 1200,
            // No sale_status filter - get all
            sortBy: 'updatedAt',
            sortOrder: 'desc',
        });

        const markers = (data?.results || [])
            .filter(p => p.lat && p.lng)
            .map(p => ({
                id: p.id,
                lat: p.lat,
                lng: p.lng,
                name: p.title || p.name,
                status: p.sale_status || p.status,
                minPrice: p.minPrice || p.price_from,
                currency: p.priceCurrency || currency,
                slug: p.id,
                propertyTypes: p.propertyTypes || [],
                coverPhoto: p.coverPhoto || p.coverImage || null,
                source: p.source || 'DB',
            }));

        const responseHeaders = {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=43200',
        };

        return new Response(
            JSON.stringify({
                results: markers,
                total: markers.length,
                source: 'db'
            }),
            { headers: responseHeaders }
        );
    } catch (dbError) {
        console.error('❌ /api/map-projects: DB fallback also failed.', dbError);
        return new Response(
            JSON.stringify({ results: [], total: 0, source: 'error' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
