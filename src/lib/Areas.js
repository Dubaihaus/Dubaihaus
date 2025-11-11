// src/lib/Areas.js
export const DUBAI_AREAS = [
  {
    slug: "downtown-dubai",
    title: "Downtown Dubai",
    image: "/dashboard/downtown.webp",
    filters: { 
      // 👇 use the district ID and region only
      districts: "201",  // this should match area.id from useAreas("Dubai")
      region: "Dubai",
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

// 🔹 Abu Dhabi areas (NEW)
export const ABU_DHABI_AREAS = [
  {
    slug: "al-reem-island",
    title: "Al Reem Island",
    image: "/dashboard/abu-dhabi/reem-island.jpg", // create this in /public
    filters: {
      area: "Al Reem Island",
      region: "Abu Dhabi",
    },
  },
  {
    slug: "yas-island",
    title: "Yas Island",
    image: "/dashboard/abu-dhabi/yas-island.jpg",
    filters: {
      area: "Yas Island",
      region: "Abu Dhabi",
    },
  },
  {
    slug: "saadiyat-island",
    title: "Saadiyat Island",
    image: "/dashboard/abu-dhabi/saadiyat-island.jpg",
    filters: {
      area: "Saadiyat Island",
      region: "Abu Dhabi",
    },
  },
  {
    slug: "al-raha-beach",
    title: "Al Raha Beach",
    image: "/dashboard/abu-dhabi/al-raha-beach.jpg",
    filters: {
      area: "Al Raha Beach",
      region: "Abu Dhabi",
    },
  },
  {
    slug: "masdar-city",
    title: "Masdar City",
    image: "/dashboard/abu-dhabi/masdar-city.jpg",
    filters: {
      area: "Masdar City",
      region: "Abu Dhabi",
    },
  },
  {
    slug: "al-ghadeer",
    title: "Al Ghadeer",
    image: "/dashboard/abu-dhabi/al-ghadeer.jpg",
    filters: {
      area: "Al Ghadeer",
      region: "Abu Dhabi",
    },
  },
];
export const AREAS = DUBAI_AREAS;
const ALL_AREAS = [...DUBAI_AREAS, ...ABU_DHABI_AREAS];

export function getAreaBySlug(slug) {
  return ALL_AREAS.find((a) => a.slug === slug) || null;
}

// Helper function to get area filters for API
export function getAreaFilters(areaSlug) {
  const area = getAreaBySlug(areaSlug);
  return area ? area.filters : {};
}