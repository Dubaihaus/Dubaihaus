// src/lib/Areas.js
export const AREAS = [
  {
    slug: "downtown-dubai",
    title: "Downtown Dubai",
    image: "/dashboard/downtown.webp",
    filters: { 
      area: "Downtown Dubai",
        sector: "Downtown Dubai",
      region: "Dubai" ,
      id:"201"// Additional filter for better results
    },
  },
  {
    slug: "dubai-hills-estate",
    title: "Dubai Hills Estate",
    image: "/dashboard/building.jpg",
    filters: { 
      area: "Dubai Hills",
      region: "Dubai"
    },
  },
  {
    slug: "palm-jumeirah",
    title: "Palm Jumeirah",
    image: "/dashboard/palm1.jpg",
    filters: { 
      area: "Palm Jumeirah",
      region: "Dubai"
    },
  },
  {
    slug: "dubai-marina",
    title: "Dubai Marina",
    image: "/dashboard/Marina.jpg",
    filters: { 
      area: "Dubai Marina",
      region: "Dubai"
    },
  },
  {
    slug: "jumeirah-village-circle",
    title: "Jumeirah Village Circle (JVC)",
    image: "/dashboard/building.jpg",
    filters: { 
      area: "Jumeirah Village Circle",
      region: "Dubai"
    },
  },
  {
    slug: "business-bay",
    title: "Business Bay",
    image: "/dashboard/downtown.jpg",
    filters: { 
      area: "Business Bay",
      region: "Dubai"
    },
  },

];

export function getAreaBySlug(slug) {
  return AREAS.find(a => a.slug === slug) || null;
}

// Helper function to get area filters for API
export function getAreaFilters(areaSlug) {
  const area = getAreaBySlug(areaSlug);
  return area ? area.filters : {};
}