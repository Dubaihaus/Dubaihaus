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

/** Abu Dhabi areas already shown somewhere else – if you want to exclude them, fill this set */
const EXCLUDED_ABU_DHABI_AREAS = new Set(
  // (ABU_DHABI_AREAS || []).map((a) => a.title?.trim())
);

// ✅ Max items in footer columns
const MAX_FOOTER_ITEMS = 8;

// ✅ Featured developers (will always be shown first if possible)
const FEATURED_DEVELOPER_NAMES = [
  "Emaar",
  "Damac",
  "Sobha",
  "Nakheel",
  "Ellington",
  "Binghatti",
  "Aldar",
  "Meraas",
];

// ✅ Featured Abu Dhabi areas (will be shown first)
const FEATURED_ABU_DHABI_AREA_NAMES = [
  "Ghantoot",
  "Hudayriyat Island",
  "Ramhan Island",
  "Fahid Island",
  "Jubail Island",
  "Al Reem Island",
  "Yas Island",
  "Saadiyat Island",
];

// (Optional) you can fill this later if you want specific Dubai areas
const FEATURED_DUBAI_AREA_NAMES = [
  // "Dubai Marina",
  // "Downtown Dubai",
  // ...
];

/** Deduplicate + cap results by name */
function dedupeTop(items = [], pick = (x) => x?.name, limit = MAX_FOOTER_ITEMS) {
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

/** Helper: merge featured names + API data, keep max limit and order */
function mergeFeaturedWithApi({
  featuredNames = [],
  apiItems = [],
  buildHrefFromName,
  limit = MAX_FOOTER_ITEMS,
}) {
  const out = [];
  const seen = new Set();

  const addItem = (name, href) => {
    const trimmed = (name || "").trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ name: trimmed, href });
  };

  // 1) Add featured first
  for (const name of featuredNames) {
    if (out.length >= limit) break;
    const href = buildHrefFromName(name);
    addItem(name, href);
  }

  // 2) Fill remaining slots from API items
  for (const it of apiItems) {
    if (out.length >= limit) break;
    const name = (it?.name || "").trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    const href = it.href || buildHrefFromName(name);
    addItem(name, href);
  }

  // Safety slice
  return out.slice(0, limit);
}

export async function GET() {
  try {
    /* ---------------- Developers (link by developer id) ---------------- */
    const devRaw = await listDevelopers({ limit: 200, offset: 0 }).catch(() => []);

    const developersFromApi =
      (devRaw || []).map((d) => {
        const name = (d?.name || "").trim();
        const id = d?.id;
        const href = id
          ? qsHref("/off-plan", { developer: String(id) })
          : qsHref("/off-plan", { search_query: name || "developer" });
        return { name, href };
      }) || [];

    const developers = mergeFeaturedWithApi({
      featuredNames: FEATURED_DEVELOPER_NAMES,
      apiItems: developersFromApi,
      buildHrefFromName: (name) => {
        const lower = name.toLowerCase();
        const match = (devRaw || []).find(
          (d) => String(d?.name || "").trim().toLowerCase() === lower
        );
        if (match?.id) {
          return qsHref("/off-plan", { developer: String(match.id) });
        }
        return qsHref("/off-plan", { search_query: name || "developer" });
      },
      limit: MAX_FOOTER_ITEMS,
    });

    /* ---------------- Dubai Areas (districts; exclude card ones) ---------------- */
    const districtsDubai = await listDistricts("Dubai").catch(() => []);

    const dubaiAreasFromApi =
      (districtsDubai || [])
        .filter((d) => !EXCLUDED_AREAS.has(String(d?.name || "")))
        .map((d) => {
          const name = (d?.name || "").trim();
          const id = d?.id;
          const href = id
            ? qsHref("/off-plan", { districts: String(id) })
            : qsHref("/off-plan", { search_query: name || "Dubai" });
          return { name, href };
        }) || [];

    const areas = mergeFeaturedWithApi({
      featuredNames: FEATURED_DUBAI_AREA_NAMES,
      apiItems: dubaiAreasFromApi,
      buildHrefFromName: (name) => {
        const lower = name.toLowerCase();
        const match = (districtsDubai || []).find(
          (d) => String(d?.name || "").trim().toLowerCase() === lower
        );
        if (match?.id) {
          return qsHref("/off-plan", { districts: String(match.id) });
        }
        return qsHref("/off-plan", { search_query: name || "Dubai" });
      },
      limit: MAX_FOOTER_ITEMS,
    });

    /* ---------------- Abu Dhabi Areas (footer column) ---------------- */
    const districtsAbuDhabi = await listDistricts("Abu Dhabi").catch(() => []);

    const abuDhabiAreasFromApi =
      (districtsAbuDhabi || [])
        .filter((d) => !EXCLUDED_ABU_DHABI_AREAS.has(String(d?.name || "")))
        .map((d) => {
          const name = (d?.name || "").trim();
          const id = d?.id;
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
        }) || [];

    const abuDhabiAreas = mergeFeaturedWithApi({
      featuredNames: FEATURED_ABU_DHABI_AREA_NAMES,
      apiItems: abuDhabiAreasFromApi,
      buildHrefFromName: (name) => {
        const lower = name.toLowerCase();
        const match = (districtsAbuDhabi || []).find(
          (d) => String(d?.name || "").trim().toLowerCase() === lower
        );
        if (match?.id) {
          return qsHref("/off-plan", {
            districts: String(match.id),
            region: "Abu Dhabi",
          });
        }
        return qsHref("/off-plan", {
          search_query: name || "Abu Dhabi",
          region: "Abu Dhabi",
        });
      },
      limit: MAX_FOOTER_ITEMS,
    });

    /* ---------------- Useful Links (internal routes) ---------------- */
    const usefulLinks = [
      { name: "Contact Us", href: "/contact" },
      { name: "Areas in UAE", href: "/areas" },
      { name: "Dubai Real Estate Blog", href: "/blog" },
      { name: "Dubai Real Estate FAQ", href: "/faq" },
      { name: "Developers", href: "/developers" },
      { name: "Map", href: "/map" },
    ].map((u) => ({ name: u.name, href: u.href || "/" }));

    const headers = {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    };

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
          "Cache-Control": "public, s-maxage=300",
        },
      }
    );
  }
}
