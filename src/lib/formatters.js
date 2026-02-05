// src/lib/formatters.js

/**
 * Format location string, removing duplicates and numeric-only segments
 * @param {Object|string} locOrString - Location object or string
 * @param {string} unknownLabel - Fallback label
 * @returns {string} Formatted location
 */
export function formatLocation(locOrString, unknownLabel = 'Unknown location') {
    let parts = [];

    // If object: extract parts
    if (locOrString && typeof locOrString === 'object') {
        const { sector, district, city, region, country } = locOrString;
        const countryStr =
            typeof country === 'string' && !/^\d+$/.test(country) ? country : null;
        parts = [sector, district, city, region, countryStr].filter(Boolean);
    } else {
        // If string: split by comma
        const s = String(locOrString || '').trim();
        if (!s) return unknownLabel;
        parts = s.split(',').map((p) => p.trim()).filter(Boolean);
    }

    // Remove numeric-only segments
    parts = parts.filter((p) => !/^\d+$/.test(p));

    if (!parts.length) return unknownLabel;

    // Deduplicate while preserving order (case-insensitive)
    const seen = new Set();
    const uniqueParts = [];

    for (const part of parts) {
        const normalized = part.toLowerCase();
        if (!seen.has(normalized)) {
            seen.add(normalized);
            uniqueParts.push(part);
        }
    }

    return uniqueParts.join(', ') || unknownLabel;
}

/**
 * Format payment plan from x/y/z to combined format
 * Examples:
 *   "20/40/40" → "60/40 Payment Plan"
 *   "10/65/25" → "75/25 Payment Plan"
 *   "40/60" → "40/60 Payment Plan"
 * 
 * @param {Object|string} paymentPlan - Payment plan object or raw string
 * @param {string} fallbackLabel - Fallback label
 * @returns {string|null} Formatted payment plan label
 */
export function formatPaymentPlanShort(paymentPlan, fallbackLabel = 'Payment plan') {
    if (!paymentPlan) return null;

    // Extract percentages from steps if it's an object
    let percentages = [];

    if (typeof paymentPlan === 'object' && paymentPlan.steps) {
        percentages = paymentPlan.steps
            .map((s) => Number(s?.percentage ?? s?.percent))
            .filter((n) => Number.isFinite(n) && n > 0)
            .map((n) => Math.round(n));
    }

    // If we got percentages from object, format them
    if (percentages.length > 0) {
        if (percentages.length === 3) {
            // Combine first two (construction) + third (handover)
            const construction = percentages[0] + percentages[1];
            const handover = percentages[2];
            return `${construction}/${handover} ${fallbackLabel}`;
        } else if (percentages.length === 2) {
            return `${percentages[0]}/${percentages[1]} ${fallbackLabel}`;
        } else if (percentages.length > 3) {
            // More than 3: just show first 3 parts combined
            const construction = percentages.slice(0, -1).reduce((a, b) => a + b, 0);
            const handover = percentages[percentages.length - 1];
            return `${construction}/${handover} ${fallbackLabel}`;
        }
    }

    // Try parsing from string patterns like "20/40/40", "20-40-40", "20 40 40"
    const stringValue =
        typeof paymentPlan === 'string'
            ? paymentPlan
            : paymentPlan.name || paymentPlan.title || '';

    if (stringValue) {
        // Match patterns: "20/40/40", "20-40-40", "20 40 40"
        const match = stringValue.match(/(\d+)[\s\/-]+(\d+)[\s\/-]+(\d+)/);
        if (match) {
            const [, p1, p2, p3] = match;
            const construction = parseInt(p1) + parseInt(p2);
            const handover = parseInt(p3);
            return `${construction}/${handover} ${fallbackLabel}`;
        }

        // Two-part pattern: "40/60"
        const match2 = stringValue.match(/(\d+)[\s\/-]+(\d+)/);
        if (match2) {
            const [, p1, p2] = match2;
            return `${p1}/${p2} ${fallbackLabel}`;
        }
    }

    // Fallback: return original name if it's not generic
    if (typeof paymentPlan === 'object') {
        const name = paymentPlan.name || paymentPlan.title || '';
        if (name && name.toLowerCase() !== 'payment plan') {
            return name;
        }
    }

    return fallbackLabel;
}

/**
 * Strip markdown heading markers (####, ###, etc.) from text
 * @param {string} text - Input text
 * @returns {string} Text without markdown headings
 */
export function stripMarkdownHeadings(text) {
    if (!text) return '';
    // Remove markdown heading markers at start of lines
    return text.replace(/^#{2,6}\s*/gm, '');
}

/**
 * Normalize property type name for display
 * @param {string} type - Raw property type
 * @returns {string} Normalized type
 */
export function normalizePropertyType(type) {
    if (!type) return '';
    const t = String(type).trim();

    // Capitalize first letter
    return t.charAt(0).toUpperCase() + t.slice(1);
}
