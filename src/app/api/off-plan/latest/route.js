// src/app/api/off-plan/latest/route.js
import { searchProperties } from "@/lib/reellyApi";
import { cookies } from "next/headers";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const filters = {
    sale_status: "on_sale",
    status: "presale",
    ordering: "-updated_at",
    pricedOnly: false, // allow 0-price projects, you can hide in UI if needed
    page: parseInt(searchParams.get("page")) || 1,
    pageSize: Math.min(parseInt(searchParams.get("pageSize")) || 12, 50),
  };

  if (searchParams.get("region")) {
    filters.region = searchParams.get("region");
  }
  if (searchParams.get("country")) {
    filters.country = searchParams.get("country");
  }

  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";

  console.log("🆕 /api/off-plan/latest filters:", { ...filters, locale });

  const data = await searchProperties(filters);

  const responseHeaders = {
    "Content-Type": "application/json",
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
    Vary: "Accept-Encoding, Cookie, Next-Locale",
  };

  return new Response(JSON.stringify(data || { results: [], total: 0 }), {
    headers: responseHeaders,
  });
}
