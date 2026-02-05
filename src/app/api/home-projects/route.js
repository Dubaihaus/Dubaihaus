import { getCachedProjects } from '@/lib/projectService';
import { applyCurrencyToProjects } from '@/lib/currencyService';
import { searchProperties } from '@/lib/reellyApi';
import { hydrateProjectsBatch } from '@/lib/projectDataHydration';

export const runtime = 'nodejs';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const currency = (searchParams.get('currency') || 'AED').toUpperCase();
    const limit = parseInt(searchParams.get('limit')) || 9;

    // 1. Try Reelly API first (Latest Launches = announced + presale)
    try {
        // Reelly API doesn't support array for sale_status, so we fetch both in parallel
        const announcedPromise = searchProperties({
            page: 1,
            pageSize: limit,
            sale_status: 'announced',
            ordering: '-updated_at',
            currency
        });

        const presalePromise = searchProperties({
            page: 1,
            pageSize: limit,
            sale_status: 'presale',
            ordering: '-updated_at',
            currency
        });

        // Set a timeout for the API call (e.g., 5 seconds)
        const apiPromise = Promise.all([announcedPromise, presalePromise]);
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Reelly API timeout')), 15000)
        );

        const [announcedData, presaleData] = await Promise.race([apiPromise, timeoutPromise]);

        // Merge results
        const combined = [
            ...(announcedData?.results || []),
            ...(presaleData?.results || [])
        ];

        if (combined.length > 0) {
            // Sort desc by updated_at
            combined.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

            // Take top N
            let finalResults = combined.slice(0, limit);

            // ✅ Hydrate property types and payment plans if missing
            try {
                finalResults = await hydrateProjectsBatch(finalResults, currency, 5);
            } catch (hydrateError) {
                console.warn('⚠️ Hydration failed, using original data:', hydrateError.message);
            }

            // Construct response object
            let data = {
                results: finalResults,
                total: finalResults.length,
                page: 1,
                pageSize: limit,
                totalPages: 1
            };

            data = await applyCurrencyToProjects(data, currency);

            const responseHeaders = {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            };

            return new Response(JSON.stringify(data), { headers: responseHeaders });
        }
    } catch (error) {
        console.error('⚠️ /api/home-projects: Reelly API failed or timed out, falling back to DB.', error.message);
    }

    // 2. Fallback to DB if API failed or returned explicit empty (though rare for homepage)
    try {
        const dbFilters = {
            page: 1,
            pageSize: limit,
            saleStatus: ['announced', 'presale'],
            sortBy: 'updatedAt',
            sortOrder: 'desc',
        };

        let data = await getCachedProjects(dbFilters);
        data = await applyCurrencyToProjects(data, currency);

        const responseHeaders = {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        };

        return new Response(JSON.stringify(data || { results: [], total: 0 }), {
            headers: responseHeaders,
        });

    } catch (dbError) {
        console.error('❌ /api/home-projects: DB fallback also failed.', dbError);
        return new Response(JSON.stringify({ results: [], total: 0 }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
