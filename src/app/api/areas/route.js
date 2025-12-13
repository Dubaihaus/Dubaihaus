import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

function buildHref({ name, region }) {
  const params = new URLSearchParams();
  // Use 'area' param which allows the backend to search both area and district columns
  if (name) params.append("area", name);

  // Constrain by region (Dubai, Abu Dhabi, etc.)
  if (region && region.toLowerCase() !== "all") {
    // If we have a specific region name (like "Dubai"), use it.
    // Ideally we pass exactly what matches the DB "region" field or something `projectService` handles.
    params.append("region", region);
  }

  return `/off-plan?${params.toString()}`;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const regionParam = searchParams.get("region") || "Dubai";

  try {
    const where = {};
    if (regionParam.toLowerCase() !== "all") {
      where.region = { contains: regionParam, mode: "insensitive" };
    }

    // Fetch projects to extract areas
    const projects = await prisma.reellyProject.findMany({
      where,
      select: {
        area: true,
        district: true,
        region: true,
      },
    });

    const areaSet = new Set();
    const resultAreas = [];

    for (const p of projects) {
      // Consider both area and district as valid "Areas" for listing
      const candidates = [p.area, p.district];

      for (let raw of candidates) {
        if (!raw) continue;

        const name = raw.trim();
        if (!name) continue;

        // Skip generic labels if any
        if (name.toLowerCase() === "all") continue;

        // Use name + region as uniqueness check? 
        // For the areas page list, we usually list unique area names.
        // If "Downtown" exists in Dubai and somewhere else, they are distinct?
        // But here we are likely under a specific region filter anyway.
        const key = name.toLowerCase();

        if (!areaSet.has(key)) {
          areaSet.add(key);
          resultAreas.push({
            name: name,
            region: p.region || regionParam,
          });
        }
      }
    }

    // Sort alphabetically
    resultAreas.sort((a, b) => a.name.localeCompare(b.name));

    // Map to response format
    const areas = resultAreas.map((a) => ({
      id: a.name, // using name as ID works for the frontend key
      name: a.name,
      region: a.region,
      href: buildHref(a),
    }));

    return new Response(JSON.stringify({ region: regionParam, areas }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
      },
    });
  } catch (error) {
    console.error("Areas API error:", error);
    return new Response(
      JSON.stringify({ region: regionParam, areas: [] }),
      {
        status: 200, // Return 200 with empty list to prevent frontend crash
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
