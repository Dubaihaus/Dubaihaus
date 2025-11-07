// src/app/api/areas/route.js
import { listDistricts } from "@/lib/reellyApi";

/** Helper: build href for clicking an area card */
function buildHref({ id, region, name }) {
  const params = new URLSearchParams();

  if (id) params.append("districts", String(id));
  if (region) params.append("region", region);

  // Fallback: also include search_query to be safe
  if (name) params.append("search_query", name);

  return `/off-plan?${params.toString()}`;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const regionParam = searchParams.get("region") || "Dubai"; // default

  // For "all", we don't filter by a specific emirate name
  const searchArg =
    regionParam.toLowerCase() === "all" ? "" : regionParam;

  try {
    const districts = await listDistricts(searchArg).catch(() => []);

    const areas = (districts || [])
      .map((d) => {
        const name = (d?.name || "").trim();
        if (!name) return null;

        // If Reelly sends region on each district, use it; otherwise fall back to requested region
        const apiRegion =
          regionParam.toLowerCase() === "all"
            ? (d?.region || "").trim() || "UAE"
            : regionParam;

        const base = {
          id: d?.id,
          name,
          region: apiRegion,
        };

        return {
          ...base,
          href: buildHref({ ...base, name }),
        };
      })
      .filter(Boolean);

    const headers = {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
    };

    return new Response(
      JSON.stringify({ region: regionParam, areas }),
      { headers }
    );
  } catch (err) {
    console.error("Areas API error:", err);
    return new Response(
      JSON.stringify({ region: regionParam, areas: [] }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
