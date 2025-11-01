// src/hooks/useMapData.js
'use client';

import { useQuery } from '@tanstack/react-query';

async function fetchMapData() {
  const response = await fetch('/api/off-plan?page=1&pageSize=500&pricedOnly=true');
  
  if (!response.ok) {
    throw new Error('Failed to fetch map data');
  }
  
  return response.json();
}

export function useMapData(options = {}) {
  return useQuery({
    queryKey: ['map-data'],
    queryFn: fetchMapData,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    ...options,
  });
}