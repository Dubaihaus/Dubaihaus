// src/app/api/off-plan/latest/route.js
import { searchProperties } from "@/lib/reellyApi";
import { cookies } from "next/headers";

// Reuse the same preset as in main route
function getLatestProjectsFilters() {
  return {
    sale_status: "announced,on_sale,presale,start_of_sales",
    ordering: "-updated_at",
    pricedOnly: true,
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = Math.min(
    parseInt(searchParams.get("pageSize") || "12", 10),
    50
  );

  const baseFilters = getLatestProjectsFilters();

  const filters = {
    ...baseFilters,
    page,
    pageSize,
  };

  // If you ever want to restrict by region/country for this endpoint, do it here:
  // const region = searchParams.get("region");
  // if (region) filters.region = region;

  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";

  console.log("🆕 Fetching LATEST projects with filters:", filters);

  const data = await searchProperties(filters);

  const responseHeaders = {
    "Content-Type": "application/json",
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
    "Vary": "Accept-Encoding, Cookie, Next-Locale",
  };

  return new Response(JSON.stringify(data || { results: [], total: 0 }), {
    headers: responseHeaders,
  });
}
