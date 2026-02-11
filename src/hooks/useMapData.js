// src/hooks/useMapData.js
'use client';

import { useQuery } from '@tanstack/react-query';

async function fetchMapData() {
  const response = await fetch('/api/map-projects');

  if (!response.ok) {
    throw new Error('Failed to fetch map data');
  }

  return response.json();
}

export function useMapData(options = {}) {
  return useQuery({
    queryKey: ['map-projects'],
    queryFn: fetchMapData,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    ...options,
  });
}