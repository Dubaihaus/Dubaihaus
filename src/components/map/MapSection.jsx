// src/components/map/MapSection.jsx
'use client';

import { useMapData } from '@/hooks/useMapData';
import { useState, useEffect, useRef, useMemo } from 'react';
import PropertiesMap from './PropertiesMap';
import { useTranslations } from 'next-intl';

const BATCH_SIZE = 80;
const BATCH_DELAY = 60;

function MapLoading({ height }) {
  const t = useTranslations('map.section');
  return (
    <div
      className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 flex items-center justify-center"
      style={{ height: `${height}px` }}
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto mb-2"></div>
        <p className="text-slate-600 text-sm">{t('loading')}</p>
      </div>
    </div>
  );
}

export default function MapSection({
  projects,
  title,
  initialView,
  className = '',
  height = 480,
  maxWidthClass = 'max-w-5xl',
}) {
  const tSection = useTranslations('map.section');
  const tHome = useTranslations('home.mapSection');

  const heading = title || tHome('title');

  // Data fetching
  const { data: mapData, isLoading, error } = useMapData({
    enabled: !projects,
  });

  // Memoize projects to prevent unnecessary re-renders
  const rawProjects = useMemo(
    () => projects || mapData?.results || [],
    [projects, mapData?.results]
  );

  // Memoize filtered projects
  const projectsWithCoords = useMemo(
    () =>
      rawProjects.filter(
        (p) =>
          p?.lat != null &&
          p?.lng != null &&
          Number.isFinite(p.lat) &&
          Number.isFinite(p.lng)
      ),
    [rawProjects]
  );

  // State
  const [visibleMarkers, setVisibleMarkers] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Refs for batching
  const batchRef = useRef({ timer: null, currentIndex: 0, cancelled: false });

  // Reset and start streaming when projects change
  useEffect(() => {
    // Cancel any existing batch
    if (batchRef.current.timer) {
      clearTimeout(batchRef.current.timer);
      batchRef.current.cancelled = true;
    }

    if (projectsWithCoords.length === 0) {
      setVisibleMarkers([]);
      setIsStreaming(false);
      return;
    }

    // Reset state
    setVisibleMarkers([]);
    setIsStreaming(true);
    batchRef.current.currentIndex = 0;
    batchRef.current.cancelled = false;

    // Start batching
    const processBatch = () => {
      if (batchRef.current.cancelled) return;

      const start = batchRef.current.currentIndex;
      const end = Math.min(start + BATCH_SIZE, projectsWithCoords.length);
      const batch = projectsWithCoords.slice(start, end);

      setVisibleMarkers((prev) => [...prev, ...batch]);
      batchRef.current.currentIndex = end;

      if (end < projectsWithCoords.length) {
        batchRef.current.timer = setTimeout(processBatch, BATCH_DELAY);
      } else {
        setIsStreaming(false);
      }
    };

    // Start first batch after short delay
    batchRef.current.timer = setTimeout(processBatch, 200);

    // Cleanup
    return () => {
      batchRef.current.cancelled = true;
      if (batchRef.current.timer) {
        clearTimeout(batchRef.current.timer);
      }
    };
  }, [projectsWithCoords]); // Only depends on projectsWithCoords

  // Loading states
  if (!projects && isLoading) {
    return (
      <section className={`w-full ${className}`}>
        <div className={`mx-auto ${maxWidthClass}`}>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3">
            {heading}
          </h2>
          <MapLoading height={height} />
        </div>
      </section>
    );
  }

  if (!projects && error) {
    return (
      <section className={`w-full ${className}`}>
        <div className={`mx-auto ${maxWidthClass}`}>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3">
            {heading}
          </h2>
          <div
            className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600 flex items-center justify-center bg-white/80"
            style={{ height: `${height}px` }}
          >
            <div className="text-center">
              <p className="text-red-500 font-semibold">
                {tSection('errorTitle')}
              </p>
              <p className="text-xs mt-2">{tSection('errorBody')}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (projectsWithCoords.length === 0) {
    return (
      <section className={`w-full ${className}`}>
        <div className={`mx-auto ${maxWidthClass}`}>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3">
            {heading}
          </h2>
          <div
            className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600 flex items-center justify-center bg-white/80"
            style={{ height: `${height}px` }}
          >
            <div className="text-center">
              <p className="text-red-500 font-semibold">
                {tSection('emptyTitle')}
              </p>
              <p className="text-xs mt-2">
                {tSection('emptyBody', { count: rawProjects.length })}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`w-full ${className}`}>
      <div className={`mx-auto ${maxWidthClass}`}>
        <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3">
          {heading}
        </h2>
        <div
          className="rounded-2xl overflow-hidden border border-slate-200 shadow-[0_18px_60px_rgba(15,23,42,0.08)] bg-white"
          style={{ height: `${height}px` }}
        >
          <PropertiesMap
            projects={visibleMarkers}
            initialView={initialView}
            showMarkers={visibleMarkers.length > 0}
            markersLoading={isStreaming}
          />
        </div>
      </div>
    </section>
  );
}
