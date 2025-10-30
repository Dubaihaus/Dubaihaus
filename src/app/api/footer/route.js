// src/app/api/footer/route.js
import { listDevelopers, listDistricts, searchProperties } from "@/lib/reellyApi";

/** Areas already shown in cards – exclude from footer */
const EXCLUDED_AREAS = new Set([
  "Downtown Dubai",
  "Dubai Hills Estate",
  "Palm Jumeirah",
  "Dubai Marina",
  "Jumeirah Village Circle",
  "Jumeirah Village Circle (JVC)",
  "Business Bay",
]);

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

    /* ---------------- Areas (Dubai districts; exclude card ones) ---------------- */
    const districts = await listDistricts("Dubai").catch(() => []);
    const areas = dedupeTop(
      (districts || [])
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

    /* ---------------- Property Types (derived from projects) ---------------- */
    const sample = await searchProperties({
      page: 1,
      pageSize: 60,
      pricedOnly: true,
      region: "Dubai",
    }).catch(() => null);

    const typesSet = new Set(
      (sample?.results || [])
        .flatMap((p) => p?.propertyTypes || [])
        .filter(Boolean)
        .map((s) => s.trim())
    );

    const PRIORITY = [
      "Apartment",
      "Villa",
      "Townhouse",
      "Penthouse",
      "Studio",
      "Loft",
      "Duplex",
      "Residential Complex",
      "Apartment Building",
    ];

    const propertyTypes = Array.from(typesSet)
      .sort(
        (a, b) =>
          (PRIORITY.indexOf(a) === -1 ? 999 : PRIORITY.indexOf(a)) -
          (PRIORITY.indexOf(b) === -1 ? 999 : PRIORITY.indexOf(b))
      )
      .slice(0, 6)
      .map((name) => {
        // Build links that work with either unit_types OR unit_type
        const href = qsHref("/off-plan", { unit_types: name, unit_type: name });
        return { name, href };
      });

    /* ---------------- Useful Links (internal routes) ---------------- */
    const usefulLinks = [
      { name: "Dubai 360° Virtual Tours", href: "/virtual-tours" },
      { name: "Dubai Real Estate Videos", href: "/videos" },
      { name: "Dubai Real Estate Blog", href: "/blog" },
      { name: "Dubai Real Estate FAQ", href: "/faq" },
      { name: "Buy Property with Crypto", href: "/services/buy-with-crypto" },
      { name: "Get Mortgage in Dubai", href: "/services/mortgage" },
    ].map((u) => ({ name: u.name, href: u.href || "/" }));

    return Response.json({ developers, areas, propertyTypes, usefulLinks });
  } catch (e) {
    console.error("Footer API error:", e);
    // Always return a valid JSON shape (null-safe client)
    return Response.json(
      { developers: [], areas: [], propertyTypes: [], usefulLinks: [] },
      { status: 200 }
    );
  }
}
