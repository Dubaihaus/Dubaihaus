// src/lib/Areas.js

// 🔹 Dubai areas
export const DUBAI_AREAS = [
  {
    slug: "downtown-dubai",
    title: "Downtown Dubai",
    image: "/dashboard/downtown.webp",
    filters: {
      // use fuzzy search across area/district/location/title
      search: "Downtown Dubai",
      region: "Dubai",
    },
  },
  {
    slug: "dubai-hills-estate",
    title: "Dubai Hills Estate",
    image: "/dashboard/building.jpg",
    filters: {
      search: "Dubai Hills",
      region: "Dubai",
    },
  },
  {
    slug: "palm-jumeirah",
    title: "Palm Jumeirah",
    image: "/dashboard/palm1.jpg",
    filters: {
      search: "Palm Jumeirah",
      region: "Dubai",
    },
  },
  {
    slug: "dubai-marina",
    title: "Dubai Marina",
    image: "/dashboard/Marina.jpg",
    filters: {
      search: "Dubai Marina",
      region: "Dubai",
    },
  },
  {
    slug: "jumeirah-village-circle",
    title: "Jumeirah Village Circle (JVC)",
    image: "/dashboard/building.jpg",
    filters: {
      search: "Jumeirah Village Circle",
      region: "Dubai",
    },
  },
  {
    slug: "business-bay",
    title: "Business Bay",
    image: "/dashboard/downtown.jpg",
    filters: {
      search: "Business Bay",
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
      search: "Al Reem Island",
      region: "Abu Dhabi",
    },
  },
  {
    slug: "yas-island",
    title: "Yas Island",
    image: "/dashboard/yas.webp",
    filters: {
      search: "Yas Island",
      region: "Abu Dhabi",
    },
  },
  {
    slug: "saadiyat-island",
    title: "Saadiyat Island",
    image: "/dashboard/sadayat.jpg",
    filters: {
      search: "Al Saadiyat Island",
      region: "Abu Dhabi",
    },
  },
  {
    slug: "al-raha-beach",
    title: "Al Raha Beach",
    image: "/dashboard/alraha.webp",
    filters: {
      search: "Al Raha Beach",
      region: "Abu Dhabi",
    },
  },
  {
    slug: "masdar-city",
    title: "Masdar City",
    image: "/dashboard/masdar.webp",
    filters: {
      search: "Masdar City",
      region: "Abu Dhabi",
    },
  },
  {
    slug: "zayed-city",
    title: "Zayed City",
    image: "/dashboard/zayed.webp", // change image if you have a better one
    filters: {
      search: "Zayed City",
      region: "Abu Dhabi",
    },
  },
  // NEW

  {
    slug: "al-maryah-island",
    title: "Al Maryah Island",
    image: "/dashboard/abu-dhabi/al-maryah-island.jpg", // use placeholder if missing
    filters: {
      search: "Al Maryah Island",
      region: "Abu Dhabi",
    },
  },

  {
    slug: "fahid-island",
    title: "Fahid Island",
    image: "/dashboard/abu-dhabi/fahid-island.jpg",
    filters: {
      search: "Fahid Island",
      region: "Abu Dhabi",
    },
  },
  {
    slug: "ramhan-island",
    title: "Ramhan Island",
    image: "/dashboard/abu-dhabi/ramhan-island.jpg",
    filters: {
      search: "Ramhan Island",
      region: "Abu Dhabi",
    },
  },
  {
    slug: "Ghadeer Al Tayr",
    title: "Ghantoot",
    image: "/dashboard/abu-dhabi/al-hudayriat-island.jpg",
    filters: {
      search: "Ghadeer Al Tayr"
    },
  },
  {
    slug: "al-bahya",
    title: "Al Bahya",
    image: "/dashboard/abu-dhabi/al-bahya.jpg",
    filters: {
      search: "Al Bahya",
      region: "Abu Dhabi",
    },
  },
  {
    slug: "al-shamkhah",
    title: "Al Shamkhah",
    image: "/dashboard/abu-dhabi/al-shamkhah.jpg",
    filters: {
      search: "Al Shamkhah",
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
