// src/lib/react-query-client.js
'use client';

import { QueryClient } from '@tanstack/react-query';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 5 minutes until data becomes stale
        staleTime: 1000 * 60 * 5,
        // 30 minutes until garbage collection
        gcTime: 1000 * 60 * 30,
        // Retry failed requests once
        retry: 1,
        // Don't refetch on window focus in production
        refetchOnWindowFocus: process.env.NODE_ENV === 'development',
      },
    },
  });
}

let browserQueryClient = null;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}