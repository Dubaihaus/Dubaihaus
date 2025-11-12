// src/app/api/footer/route.js
import { listDevelopers, listDistricts } from "@/lib/reellyApi";
import { ABU_DHABI_AREAS } from "@/lib/Areas";

/** Areas already shown in cards – exclude from footer (Dubai) */
const EXCLUDED_AREAS = new Set([
  "Downtown Dubai",
  "Dubai Hills Estate",
  "Palm Jumeirah",
  "Dubai Marina",
  "Jumeirah Village Circle",
  "Jumeirah Village Circle (JVC)",
  "Business Bay",
]);

/** Abu Dhabi areas already shown in Abu Dhabi area section – exclude from footer */
const EXCLUDED_ABU_DHABI_AREAS = new Set(
  // (ABU_DHABI_AREAS || []).map((a) => a.title?.trim())
);

/** Deduplicate + cap results by name */
function dedupeTop(items = [], pick = (x) => x?.name, limit = 12) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    const name = (pick(it) || "").trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
    if (out.length >= limit) break;
  }
  return out;
}

/** Build an internal href safely (never undefined) */
function qsHref(base, paramsObj) {
  const qs = new URLSearchParams();
  Object.entries(paramsObj || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.append(k, String(v));
  });
  const s = qs.toString();
  return s ? `${base}?${s}` : base;
}

export async function GET() {
  try {
    /* ---------------- Developers (link by developer id) ---------------- */
    const devRaw = await listDevelopers({ limit: 200, offset: 0 }).catch(() => []);
    const developers = dedupeTop(
      (devRaw || []).map((d) => {
        const name = (d?.name || "").trim();
        const id = d?.id;
        // Prefer developer ID; fallback to name search if ID missing
        const href = id
          ? qsHref("/off-plan", { developer: String(id) })
          : qsHref("/off-plan", { search_query: name || "developer" });
        return { name, href };
      }),
      (d) => d?.name,
      12
    );

    /* ---------------- Dubai Areas (districts; exclude card ones) ---------------- */
    const districtsDubai = await listDistricts("Dubai").catch(() => []);
    const areas = dedupeTop(
      (districtsDubai || [])
        .filter((d) => !EXCLUDED_AREAS.has(String(d?.name || "")))
        .map((d) => {
          const name = (d?.name || "").trim();
          const id = d?.id;
          // Prefer district id; fallback to name search
          const href = id
            ? qsHref("/off-plan", { districts: String(id) })
            : qsHref("/off-plan", { search_query: name || "Dubai" });
          return { name, href };
        }),
      (a) => a?.name,
      12
    );

    /* ---------------- Abu Dhabi Areas (new footer column) ---------------- */
    const districtsAbuDhabi = await listDistricts("Abu Dhabi").catch(() => []);
    const abuDhabiAreas = dedupeTop(
      (districtsAbuDhabi || [])
        .filter((d) => !EXCLUDED_ABU_DHABI_AREAS.has(String(d?.name || "")))
        .map((d) => {
          const name = (d?.name || "").trim();
          const id = d?.id;
          // Prefer district id; ensure region=Abu Dhabi in query
          const href = id
            ? qsHref("/off-plan", {
                districts: String(id),
                region: "Abu Dhabi",
              })
            : qsHref("/off-plan", {
                search_query: name || "Abu Dhabi",
                region: "Abu Dhabi",
              });
          return { name, href };
        }),
      (a) => a?.name,
      12
    );

    /* ---------------- Useful Links (internal routes) ---------------- */
    const usefulLinks = [
      { name: "Contact Us", href: "/contact" },
      { name: "Areas in UAE", href: "/areas" },
      { name: "Dubai Real Estate Blog", href: "/blog" },
      { name: "Dubai Real Estate FAQ", href: "/faq" },
      { name: "Developers", href: "/developers" },
      { name: "Map", href: "/map" },
    ].map((u) => ({ name: u.name, href: u.href || "/" }));

    // Set proper caching headers for CDN
    const headers = {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400", // 1 hour fresh, 1 day stale
    };

    // propertyTypes kept as empty array for backward compatibility
    return new Response(
      JSON.stringify({
        developers,
        areas,
        abuDhabiAreas,
        propertyTypes: [],
        usefulLinks,
      }),
      { headers }
    );
  } catch (e) {
    console.error("Footer API error:", e);
    // Always return a valid JSON shape (null-safe client)
    return new Response(
      JSON.stringify({
        developers: [],
        areas: [],
        abuDhabiAreas: [],
        propertyTypes: [],
        usefulLinks: [],
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=300", // 5 minutes on error
        },
      }
    );
  }
}
