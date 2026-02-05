// src/lib/projectDataHydration.js
import { getPropertyById } from './reellyApi';
import { formatPaymentPlanShort } from './formatters';

// In-memory cache for hydrated project data (per request lifecycle)
const hydrationCache = new Map();

/**
 * Extract property types from project detail data
 * @param {Object} projectDetail - Full project detail from API
 * @returns {string[]} Array of property type names
 */
function extractPropertyTypes(projectDetail) {
    if (!projectDetail) return [];

    // Check normalized data first
    if (Array.isArray(projectDetail.propertyTypes) && projectDetail.propertyTypes.length > 0) {
        return projectDetail.propertyTypes;
    }

    // Extract from unitTypes
    if (Array.isArray(projectDetail.unitTypes) && projectDetail.unitTypes.length > 0) {
        const types = projectDetail.unitTypes
            .map((u) => u.unitCategory || u.unit_category)
            .filter(Boolean);
        return [...new Set(types)];
    }

    // Extract from typical_units in raw data
    if (Array.isArray(projectDetail.rawData?.typical_units)) {
        const units = projectDetail.rawData.typical_units;
        const types = units
            .map((u) => {
                // Try various field names
                return u.unit_category || u.unit_type || u.unitCategory || u.type;
            })
            .filter(Boolean);
        return [...new Set(types)];
    }

    return [];
}

/**
 * Extract payment plan from project detail
 * @param {Object} projectDetail - Full project detail from API
 * @returns {Object|null} Payment plan object or null
 */
function extractPaymentPlan(projectDetail) {
    if (!projectDetail) return null;

    // Check paymentPlans array
    if (Array.isArray(projectDetail.paymentPlans) && projectDetail.paymentPlans.length > 0) {
        return projectDetail.paymentPlans[0];
    }

    // Check raw data
    if (Array.isArray(projectDetail.rawData?.payment_plans) && projectDetail.rawData.payment_plans.length > 0) {
        return projectDetail.rawData.payment_plans[0];
    }

    return null;
}

/**
 * Hydrate project card data (property types + payment plan) from API detail endpoint
 * Uses caching to avoid redundant API calls
 * 
 * @param {Object} project - Project object from list results
 * @param {string} currency - Currency for API call
 * @returns {Promise<Object>} Hydrated project data with propertyTypes and paymentPlanShort
 */
export async function hydrateProjectCardData(project, currency = 'AED') {
    if (!project || !project.id) {
        return {
            propertyTypes: [],
            paymentPlanShort: null,
            paymentPlanRaw: null,
        };
    }

    const cacheKey = `${project.id}-${currency}`;

    // Check in-memory cache
    if (hydrationCache.has(cacheKey)) {
        return hydrationCache.get(cacheKey);
    }

    try {
        // Fetch project detail with Next.js caching
        const detail = await fetch(
            `https://api-reelly.up.railway.app/api/v2/clients/projects/${project.id}?format=json&preferred_currency=${currency}`,
            {
                headers: {
                    'Accept': 'application/json',
                    'X-API-Key': process.env.REELLY_API_TOKEN || process.env.RELLY_API_TOKEN,
                },
                next: { revalidate: 21600 }, // 6 hours
            }
        ).then(res => res.ok ? res.json() : null);

        if (!detail) {
            const fallback = {
                propertyTypes: [],
                paymentPlanShort: null,
                paymentPlanRaw: null,
            };
            hydrationCache.set(cacheKey, fallback);
            return fallback;
        }

        // Use the same normalizer as other API calls
        const { normalizeProject } = await import('./ProjectNormalizer');
        const normalized = normalizeProject(detail);

        const propertyTypes = extractPropertyTypes(normalized);
        const paymentPlanRaw = extractPaymentPlan(normalized);
        const paymentPlanShort = paymentPlanRaw
            ? formatPaymentPlanShort(paymentPlanRaw, 'Payment plan')
            : null;

        const result = {
            propertyTypes,
            paymentPlanShort,
            paymentPlanRaw,
        };

        hydrationCache.set(cacheKey, result);
        return result;
    } catch (error) {
        console.error(`Failed to hydrate project ${project.id}:`, error);
        const fallback = {
            propertyTypes: [],
            paymentPlanShort: null,
            paymentPlanRaw: null,
        };
        hydrationCache.set(cacheKey, fallback);
        return fallback;
    }
}

/**
 * Batch hydrate multiple projects with concurrency limiting
 * @param {Object[]} projects - Array of project objects
 * @param {string} currency - Currency for API calls
 * @param {number} concurrency - Max parallel calls (default: 5)
 * @returns {Promise<Object[]>} Array of hydrated projects
 */
export async function hydrateProjectsBatch(projects, currency = 'AED', concurrency = 5) {
    if (!Array.isArray(projects) || projects.length === 0) {
        return projects;
    }

    // Simple concurrency limiting using batching
    const results = [];
    for (let i = 0; i < projects.length; i += concurrency) {
        const batch = projects.slice(i, i + concurrency);
        const batchPromises = batch.map(async (project) => {
            // Only hydrate if missing property types
            const needsHydration =
                !project.propertyTypes ||
                project.propertyTypes.length === 0 ||
                (Array.isArray(project.propertyTypes) &&
                    project.propertyTypes.some(t =>
                        typeof t === 'string' &&
                        (t.includes('Building') || t.includes('Complex') || t === 'Property')
                    ));

            if (!needsHydration) {
                return project; // Already has good data
            }

            const hydrated = await hydrateProjectCardData(project, currency);
            return {
                ...project,
                propertyTypes: hydrated.propertyTypes.length > 0
                    ? hydrated.propertyTypes
                    : project.propertyTypes,
                paymentPlanShort: hydrated.paymentPlanShort || project.paymentPlanShort,
                paymentPlans: hydrated.paymentPlanRaw
                    ? [hydrated.paymentPlanRaw]
                    : project.paymentPlans,
            };
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
    }

    return results;
}

/**
 * Clear the hydration cache (useful for testing or manual cache invalidation)
 */
export function clearHydrationCache() {
    hydrationCache.clear();
}
