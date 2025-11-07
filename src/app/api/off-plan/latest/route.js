// src/app/api/latest/route.js
import { searchProperties } from "@/lib/reellyApi";
import { cookies } from "next/headers";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Default filters for latest projects (per Reelly)
  const filters = {
    sale_status: "on_sale",
    status: "Presale",
    ordering: "-updated_at",                         // latest first
    pricedOnly: false,                               // 🔹 do NOT force price filter
    page: parseInt(searchParams.get("page")) || 1,
    pageSize: Math.min(parseInt(searchParams.get("pageSize")) || 12, 50),
  };

  // Optional: region/country filters
  if (searchParams.get("region")) {
    filters.region = searchParams.get("region");
  }
  if (searchParams.get("country")) {
    filters.country = searchParams.get("country");
  }

  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";

  console.log("🆕 Fetching LATEST projects with filters:", filters);
  
  const data = await searchProperties(filters);

  const responseHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800',
    'Vary': 'Accept-Encoding, Cookie, Next-Locale',
  };

  return new Response(JSON.stringify(data || { results: [], total: 0 }), {
    headers: responseHeaders,
  });
}
