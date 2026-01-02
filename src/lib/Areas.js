// src/lib/Areas.js

// 🔹 Dubai areas
export const DUBAI_AREAS = [
  {
    slug: "downtown-dubai",
    title: "Downtown Dubai",
    image: "/dashboard/downtown.webp",
    filters: {
      // use fuzzy search across area/district/location/title
      search_query: "Downtown Dubai",
      region: "Dubai",
    },
  },
  {
    slug: "dubai-hills-estate",
    title: "Dubai Hills Estate",
    image: "/dashboard/building.jpg",
    filters: {
      search_query: "Dubai Hills Estate",
      region: "Dubai",
    },
  },
  {
    slug: "palm-jumeirah",
    title: "Palm Jumeirah",
    image: "/dashboard/palm1.jpg",
    filters: {
      search_query: "Palm Jumeirah",
      region: "Dubai",
    },
  },
  {
    slug: "dubai-marina",
    title: "Dubai Marina",
    image: "/dashboard/Marina.jpg",
    filters: {
      search_query: "Dubai Marina",
      region: "Dubai",
    },
  },
  {
    slug: "jumeirah-village-circle",
    title: "Jumeirah Village Circle (JVC)",
    image: "/dashboard/building.jpg",
    filters: {
      search_query: "Jumeirah Village Circle",
      region: "Dubai",
    },
  },
  {
    slug: "business-bay",
    title: "Business Bay",
    image: "/dashboard/downtown.jpg",
    filters: {
      search_query: "Business Bay",
      region: "Dubai",
    },
  },
];

// 🔹 Abu Dhabi areas
// 🔹 Abu Dhabi areas
export const ABU_DHABI_AREAS = [
  {
    slug: "al-reem-island",
    title: "Al Reem Island",
    image: "/dashboard/reem.webp",
    filters: {
      search_query: "Al Reem Island",
      region: "Abu Dhabi",
    },
  },
  {
    slug: "yas-island",
    title: "Yas Island",
    image: "/dashboard/yas.webp",
    filters: {
      search_query: "Yas Island",
      region: "Abu Dhabi",
    },
  },
  {
    slug: "saadiyat-island",
    title: "Saadiyat Island",
    image: "/dashboard/sadayat.jpg",
    filters: {
      search_query: "Saadiyat Island",
      region: "Abu Dhabi",
    },
  },
  {
    slug: "al-raha-beach",
    title: "Al Raha Beach",
    image: "/dashboard/alraha.webp",
    filters: {
      search_query: "Al Raha Beach",
      region: "Abu Dhabi",
    },
  },
  {
    slug: "masdar-city",
    title: "Masdar City",
    image: "/dashboard/masdar.webp",
    filters: {
      search_query: "Masdar City",
      region: "Abu Dhabi",
    },
  },
  {
    slug: "zayed-city",
    title: "Zayed City",
    image: "/dashboard/zayed.webp", // change image if you have a better one
    filters: {
      search_query: "Zayed City",
      region: "Abu Dhabi",
    },
  },
  // NEW
  {
    slug: "marina-square",
    title: "Marina Square",
    image: "/dashboard/abu-dhabi/marina-square.jpg", // use placeholder/building.jpg if you don’t have assets yet
    filters: {
      search_query: "Marina Square",
      region: "Abu Dhabi",
    },
  },
  {
    slug: "fahid-island",
    title: "Fahid Island",
    image: "/dashboard/abu-dhabi/fahid-island.jpg",
    filters: {
      search_query: "Fahid Island",
      region: "Abu Dhabi",
    },
  },
  {
    slug: "ramhan-island",
    title: "Ramhan Island",
    image: "/dashboard/abu-dhabi/ramhan-island.jpg",
    filters: {
      search_query: "Ramhan Island",
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
