// src/app/api/off-plan/latest/route.js
import { searchProperties, getPropertyById } from "@/lib/reellyApi";
import { cookies } from "next/headers";
import { translateProjectsForLocale } from "@/lib/translateReelly";

export const runtime = "nodejs";

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

  let data = await searchProperties(filters);

  // ✅ Enrich with paymentPlan + propertyTypes from detail API
  if (data?.results?.length) {
    try {
      const enrichedResults = await Promise.all(
        data.results.map(async (item) => {
          try {
            const detail = await getPropertyById(item.id);

            return {
              ...item,
              propertyTypes: detail?.propertyTypes || item.propertyTypes || [],
              paymentPlans: detail?.paymentPlans || item.paymentPlans || [],
              paymentPlan: detail?.paymentPlan || item.paymentPlan || null,
            };
          } catch (err) {
            console.error("Failed to enrich latest project", item.id, err);
            return item;
          }
        })
      );
      data = { ...data, results: enrichedResults };
    } catch (err) {
      console.error("Bulk enrichment for latest failed:", err);
    }
  }

  // 🌍 Locale-aware translation (currently only for German)
  if (data?.results?.length && locale === "de") {
    try {
      data.results = await translateProjectsForLocale(data.results, locale);
    } catch (err) {
      console.error("Translation for latest projects failed:", err);
    }
  }

  const responseHeaders = {
    "Content-Type": "application/json",
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
    Vary: "Accept-Encoding, Cookie, Next-Locale",
  };

  return new Response(JSON.stringify(data || { results: [], total: 0 }), {
    headers: responseHeaders,
  });
}
