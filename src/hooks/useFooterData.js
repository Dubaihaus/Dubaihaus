// src/hooks/useFooterData.js
'use client';

import { useQuery } from '@tanstack/react-query';

async function fetchFooterData() {
  const response = await fetch('/api/footer');
  
  if (!response.ok) {
    throw new Error('Failed to fetch footer data');
  }
  
  return response.json();
}

export function useFooterData() {
  return useQuery({
    queryKey: ['footer'],
    queryFn: fetchFooterData,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}