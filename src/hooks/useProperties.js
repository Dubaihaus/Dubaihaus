// src/hooks/useProperties.js
'use client';

import { useQuery } from '@tanstack/react-query';

async function fetchProperties(filters = {}) {
  const searchParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const response = await fetch(`/api/off-plan?${searchParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch properties');
  }
  
  return response.json();
}

export function useProperties(filters = {}, options = {}) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => fetchProperties(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

export function useAreaProperties(areaSlug, filters = {}, options = {}) {
  const areaFilters = {
    page: 1,
    pageSize: 6,
    pricedOnly: false,
    ...filters,
  };

  return useProperties(areaFilters, {
    staleTime: 1000 * 60 * 10, // 10 minutes for area data
    ...options,
  });
}