// src/hooks/useAreas.js
"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchAreas(region = "Dubai") {
  const sp = new URLSearchParams();
  if (region) sp.append("region", region);

  const res = await fetch(`/api/areas?${sp.toString()}`);

  if (!res.ok) {
    throw new Error("Failed to fetch areas");
  }

  return res.json(); // { region, areas }
}

export function useAreas(region) {
  return useQuery({
    queryKey: ["areas", region],
    queryFn: () => fetchAreas(region),
    enabled: !!region, // don't run without region
    staleTime: 1000 * 60 * 5, // 5 min
  });
}
