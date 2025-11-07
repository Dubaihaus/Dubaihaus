// src/lib/exchangeRates.js

// How long to keep rates in memory (1 hour)
const CACHE_TTL_MS = 60 * 60 * 1000;

let cachedRates = null;   // { USD: number, EUR: number, ... } base AED
let cachedAt = 0;

/**
 * Fetches latest FX rates with AED as base.
 * Uses an external API. For production, move URL to an env variable.
 */
async function fetchLatestRates() {
  // Free, no-key API. For production: use env + paid provider if needed.
  const url =
    "https://api.exchangerate.host/latest?base=AED&symbols=USD,EUR";

  const res = await fetch(url, {
    // Let Next cache on edge too (optional)
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch FX rates: ${res.status}`);
  }

  const data = await res.json();
  return data.rates || {};
}

/**
 * Returns rates, cached for CACHE_TTL_MS.
 * If network fails, falls back to last known cache (if available).
 */
export async function getAedRates() {
  const now = Date.now();

  if (cachedRates && now - cachedAt < CACHE_TTL_MS) {
    return cachedRates;
  }

  try {
    const rates = await fetchLatestRates();
    cachedRates = rates;
    cachedAt = now;
    return rates;
  } catch (err) {
    console.error("[FX] Error fetching rates", err);
    if (cachedRates) {
      // Use stale cache rather than breaking page
      return cachedRates;
    }
    // As a last resort, return neutral rates (no conversion)
    return { USD: 1, EUR: 1 };
  }
}

/**
 * Convert an amount from AED to target currency.
 * If no rate is available, returns original amount.
 */
export async function convertFromAed(amount, targetCurrency) {
  if (!amount || targetCurrency === "AED") return amount;

  const rates = await getAedRates();
  const rate = rates[targetCurrency];

  if (!rate) return amount;
  return amount * rate;
}
