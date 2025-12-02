// src/lib/currencyService.js
import { prisma } from '@/lib/prisma';

const SUPPORTED = ['AED', 'USD', 'EUR'];
const MAX_AGE_HOURS = 24; // cache TTL (1 day)
const PROVIDER_URL = 'https://open.er-api.com/v6/latest/AED'; // base = AED

/* ---------------- helpers ---------------- */

function isSupported(code) {
  return SUPPORTED.includes(code.toUpperCase());
}

function isFresh(fetchedAt) {
  if (!fetchedAt) return false;
  const ageMs = Date.now() - fetchedAt.getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  return ageHours < MAX_AGE_HOURS;
}

/**
 * Provider: open.er-api.com (keyless)
 *
 * Example response:
 *  {
 *    "result": "success",
 *    "base_code": "AED",
 *    "conversion_rates": {
 *      "AED": 1,
 *      "USD": 0.2722,
 *      "EUR": 0.25,
 *      ...
 *    }
 *  }
 *
 * Our use case:
 *   getExchangeRate('AED', 'USD' | 'EUR')
 */
async function fetchRateFromProvider(base, target) {
  base = base.toUpperCase();
  target = target.toUpperCase();

  if (base !== 'AED') {
    throw new Error(`fetchRateFromProvider currently expects base=AED, got ${base}`);
  }
  if (!['USD', 'EUR'].includes(target)) {
    throw new Error(`Unsupported AED target: ${target}`);
  }

  console.log('🌐 Fetching FX snapshot from open.er-api.com:', PROVIDER_URL);

  const res = await fetch(PROVIDER_URL);

  let json;
  try {
    json = await res.json();
  } catch (e) {
    throw new Error(`Failed to parse FX JSON: ${e?.message || e}`);
  }

  // Handle common error shapes
  const result = json.result || json.status;
  if (!res.ok || result === 'error' || json.error) {
    console.error('FX error JSON from open.er-api.com:', json);
    throw new Error(
      json?.error ??
        json?.message ??
        `Currency API error ${res.status || ''}`.trim()
    );
  }

  const rates =
    json.conversion_rates || json.rates || {}; // be flexible in case of shape changes
  const rate = rates[target];

  if (typeof rate !== 'number') {
    console.error('FX JSON missing target rate:', json);
    throw new Error(`No rate returned for AED -> ${target}`);
  }

  console.log(`✅ open.er-api.com rate AED -> ${target} = ${rate}`);
  return {
    rate,
    provider: 'open.er-api.com',
  };
}

/* ---------------- main API ---------------- */

/**
 * Get 1 base = X target
 * 1) Try Prisma cache
 * 2) If stale (>24h) or missing, call provider + upsert row
 */
export async function getExchangeRate(base, target) {
  base = base.toUpperCase();
  target = target.toUpperCase();

  if (base === target) return 1;

  if (!isSupported(base) || !isSupported(target)) {
    throw new Error(`Unsupported currency: ${base}/${target}`);
  }

  // 1) Try DB cache
  let record = await prisma.currencyRate.findUnique({
    where: {
      base_target: { base, target },
    },
  });

  if (record && isFresh(record.fetchedAt)) {
    return record.rate;
  }

  // 2) Fetch fresh rate from provider
  const { rate, provider } = await fetchRateFromProvider(base, target);

  // 3) Upsert into DB
  record = await prisma.currencyRate.upsert({
    where: {
      base_target: { base, target },
    },
    create: {
      base,
      target,
      rate,
      provider,
      fetchedAt: new Date(),
    },
    update: {
      rate,
      provider,
      fetchedAt: new Date(),
    },
  });

  return record.rate;
}

/**
 * Apply currency conversion to the off-plan API response.
 *
 * Expects:
 *   data = { results: [ { price, minPrice, maxPrice, ... }, ... ] }
 *
 * We:
 *   - Keep original AED values as priceAED / minPriceAED / ...
 *   - Overwrite visible fields with converted values.
 *   - Tag each item with `priceCurrency`.
 */
export async function applyCurrencyToProjects(data, currency) {
  if (!data || !Array.isArray(data.results) || !data.results.length) {
    return data;
  }

  const target = (currency || 'AED').toUpperCase();
  const priceFields = [
    'price',
    'minPrice',
    'maxPrice',
    'min_price',
    'max_price',
  ];

  // If AED, just tag and return (no external API call)
  if (target === 'AED') {
    const results = data.results.map((item) => ({
      ...item,
      priceCurrency: item.priceCurrency || item.price_currency || 'AED',
    }));
    return { ...data, results };
  }

  let rate;
  try {
    rate = await getExchangeRate('AED', target);
  } catch (err) {
    console.error('Currency conversion failed, falling back to AED:', err);
    const results = data.results.map((item) => ({
      ...item,
      priceCurrency: item.priceCurrency || item.price_currency || 'AED',
    }));
    return { ...data, results };
  }

  console.log(`💱 Applying FX rate AED -> ${target} = ${rate}`);

  const results = data.results.map((item) => {
    const next = {
      ...item,
      priceCurrency: target,
    };

    priceFields.forEach((field) => {
      const value = item[field];

      if (typeof value === 'number' && !Number.isNaN(value)) {
        // store original AED
        const originalKey = `${field}AED`;
        if (next[originalKey] == null) {
          next[originalKey] = value;
        }

        // overwrite with converted value
        next[field] = value * rate;
      }
    });

    return next;
  });

  return { ...data, results };
}
