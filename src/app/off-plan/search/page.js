// src/app/off-plan/search/page.js
import { getCachedProjects } from '@/lib/projectService';
import { getFilterOptions, parseSearchParamsToFilters, buildWhereClauseFromFilters } from '@/lib/offplanFilters';
import SearchHero from '@/components/offplan/SearchHero';
import SearchResultsClient from '@/components/offplan/SearchResultsClient';
import Footer from '@/components/footer';
// We need Navbar? It's usually in layout.js. 
// Assuming layout.js handles navbar.

export const metadata = {
    title: 'Search Off-Plan Properties - DubaiHaus',
    description: 'Find your dream off-plan property in Dubai with our advanced search filters.',
};

export default async function SearchPage({ searchParams }) {
    // 1. Parse params
    // Next.js 15 searchParams is a Promise? 
    // Wait, in Next.js 15, page props are promises: params and searchParams.
    // The user prompt said Next.js 15 + App Router. 
    // I should await searchParams if it's Next 15.

    const resolvedSearchParams = await searchParams; // Next.js 15 requirement
    const rawSearchParams = new URLSearchParams(resolvedSearchParams);
    const filters = parseSearchParamsToFilters(rawSearchParams);

    // 2. Fetch Options
    const filterOptions = await getFilterOptions();

    // 3. Fetch Results
    // We need to use projectService, but we enhanced it to handle our filters?
    // Or we use buildWhereClauseFromFilters and call Prisma directly?
    // The plan said: "Call buildWhereClauseFromFilters ... Run a single Prisma query".
    // logic in projectService.js `getCachedProjects` ALREADY calls `prisma.findMany`.
    // And I updated `projectService.js` to handle `filters.propertyTypes` etc.
    // So I can just call `getCachedProjects(filters)`.

    // NOTE: parseSearchParamsToFilters returns object with `types` (array).
    // projectService expects `propertyTypes` (array) if I aligned them.
    // Let's check my update to `projectService.js` in Step 22.
    // It checks `filters.propertyTypes`. 
    // `parseSearchParamsToFilters` returns `types`. 
    // I need to map `types` to `propertyTypes` before calling service.

    const serviceFilters = {
        ...filters,
        propertyTypes: filters.types,      // map 'types' to 'propertyTypes'
        handoverYears: filters.years,      // map 'years' to 'handoverYears'
        // 'developers' is same
        // 'areas' is same
        limit: 100 // Reasonable limit for results page
    };

    const { results, total } = await getCachedProjects(serviceFilters);

    return (
        <main className="min-h-screen bg-white">
            <SearchHero
                filterOptions={filterOptions}
                filters={filters}
                totalResults={total}
            />
            <SearchResultsClient
                results={results}
                filters={filters}
            />
           
        </main>
    );
}
