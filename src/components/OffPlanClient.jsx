// src/components/OffPlanClient.jsx
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import FiltersPanel from '@/components/FiltersPanel';
import PropertyCard from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

function shallowEqualObj(a = {}, b = {}) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const k of aKeys) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}
function isAbuDhabiProject(p) {
  const city = (p?.locationObj?.city || p?.city || "").toString().toLowerCase();
  const region = (p?.locationObj?.region || p?.region || "").toString().toLowerCase();
  const loc = (p?.location || "").toString().toLowerCase();

  // direct checks
  if (city.includes("abu dhabi") || region.includes("abu dhabi") || loc.includes("abu dhabi")) {
    return true;
  }

  // common Abu Dhabi communities (fallback)
  const adAreas = [
    "yas", "saadiyat", "reem", "al reem", "al raha", "masdar",
    "khalifa city", "al maryah", "corniche", "hudayriat",
    "al jubail", "ghantoot", "al reef"
  ];

  return adAreas.some((k) => loc.includes(k));
}

function pickHomeProjectsWithAbuDhabiQuota(results, limit = 9) {
  if (!Array.isArray(results) || results.length <= limit) return results || [];

  const ad = results.filter(isAbuDhabiProject);
  if (ad.length === 0) return results.slice(0, limit);

  const targetAdCount = ad.length >= 5 ? 5 : ad.length; // 1-4 => all, >=5 => 5

  // choose top AD in the existing (latest) order
  const chosenAd = ad.slice(0, targetAdCount);

  const chosenIds = new Set(chosenAd.map((x) => String(x?.id)));

  // fill rest with non-AD in original order
  const restNeeded = Math.max(0, limit - chosenAd.length);
  const chosenNonAd = results
    .filter((x) => !isAbuDhabiProject(x))
    .filter((x) => !chosenIds.has(String(x?.id)))
    .slice(0, restNeeded);

  chosenNonAd.forEach((x) => chosenIds.add(String(x?.id)));

  // preserve original API ordering
  return results.filter((x) => chosenIds.has(String(x?.id))).slice(0, limit);
}


export default function OffPlanClient({ limit, latest = false }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('offPlan.client');

  // ✅ Build filters from URL (memoized so it updates when URL changes)
  const filtersFromUrl = useMemo(() => {
    const obj = {};
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'page') obj[key] = value;
    }
    return obj;
  }, [searchParams]);

  // ✅ Page from URL
  const pageFromUrl = useMemo(() => {
    return Number(searchParams.get('page')) || 1;
  }, [searchParams]);

  // Initialize state once (from URL on first mount)
  const [filters, setFilters] = useState(filtersFromUrl);
  const [projects, setProjects] = useState([]);
  const [currency, setCurrency] = useState('AED');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [areaDescription, setAreaDescription] = useState(null);

  const [page, setPage] = useState(pageFromUrl);
  const [totalCount, setTotalCount] = useState(0);

  const pageSize = limit || 21;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  /**
   * ✅ CRITICAL FIX:
   * When URL changes (footer links, internal navigation on same page),
   * sync component state to URL params.
   *
   * Guard against loops:
   * - This effect runs when searchParams changes.
   * - Another effect below updates URL when filters/page changes.
   * We only setState if there's a real mismatch.
   */
  const didMountRef = useRef(false);
  useEffect(() => {
    // only relevant for full page
    if (limit) return;

    // On first mount, state already initialized from URL.
    // Still safe to run, but this avoids extra setState on first render.
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    setFilters((prev) => {
      if (shallowEqualObj(prev, filtersFromUrl)) return prev;
      return filtersFromUrl;
    });

    setPage((prev) => {
      if (prev === pageFromUrl) return prev;
      return pageFromUrl;
    });
  }, [filtersFromUrl, pageFromUrl, limit]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const paramsObj = { ...filters, currency };

      if (latest) {
        paramsObj.latest = 'true';
      } else {
        paramsObj.page = page;
        paramsObj.pageSize = pageSize;
      }

      Object.keys(paramsObj).forEach((k) => {
        if (!paramsObj[k]) delete paramsObj[k];
      });

      const params = new URLSearchParams(paramsObj);
      const res = await fetch(`/api/off-plan?${params.toString()}`);
      if (!res.ok) {
        const text = await res.text();
        console.error('off-plan API error:', res.status, text.slice(0, 300));
        setProjects([]);
        setAreaDescription(null);
        setTotalCount(0);
        return;
      }

      const data = await res.json();
      // const results = data.results || [];
      // const visibleResults = limit ? results.slice(0, limit) : results;

      // setProjects(visibleResults);
      const results = data.results || [];

let visibleResults = results;

// ✅ only apply Abu Dhabi quota on HOME embed (limit + latest)
if (limit && latest) {
  visibleResults = pickHomeProjectsWithAbuDhabiQuota(results, limit);
} else {
  visibleResults = limit ? results.slice(0, limit) : results;
}

setProjects(visibleResults);


      const total =
        (typeof data.total === 'number' && data.total) ||
        (typeof data.count === 'number' && data.count) ||
        results.length;

      setTotalCount(total);

      if (!limit && paramsObj.search_query && Array.isArray(results) && results.length > 0) {
        const first = results[0];
        const rawLoc = first?.rawData?.location || {};

        const areaDesc =
          rawLoc.description ||
          rawLoc.overview ||
          rawLoc.short_description ||
          null;

        setAreaDescription(areaDesc || null);
      } else {
        setAreaDescription(null);
      }
    } catch (e) {
      console.error('Error fetching projects:', e);
      setProjects([]);
      setAreaDescription(null);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currency, latest, page]);

  // Sync URL only on the full page (your existing behavior)
  useEffect(() => {
    if (!limit) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
      if (page > 1) params.set('page', String(page));
      router.replace(`/off-plan?${params.toString()}`, { scroll: false });
    }
  }, [filters, limit, router, page]);

  const handleViewMore = () => {
    setLoading(true);
    setTimeout(() => router.push('/off-plan'), 300);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const isFullPage = !limit;
  const region = filters.region;
  const areaName = filters.search_query;

  let headingText = t('heading');
  let subText = t('description');

  if (isFullPage) {
    if (areaName) {
      headingText = `Off-plan properties in ${areaName}`;
      subText = areaDescription || null;
    } else if (region === 'Dubai') {
      headingText = 'Off-plan properties in Dubai';
    } else if (region === 'Abu Dhabi') {
      headingText = 'Off-plan properties in Abu Dhabi';
    }
  }

  const renderPageButtons = () => {
    if (totalPages <= 1 || limit) return null;

    const MAX_VISIBLE = 10;
    const blockIndex = Math.floor((page - 1) / MAX_VISIBLE);
    const start = blockIndex * MAX_VISIBLE + 1;
    const end = Math.min(start + MAX_VISIBLE - 1, totalPages);

    const buttons = [];
    for (let p = start; p <= end; p++) {
      buttons.push(
        <Button
          key={p}
          variant={p === page ? 'default' : 'outline'}
          className={`h-9 min-w-[2.25rem] text-sm ${p === page
              ? 'text-white'
              : 'border-sky-500 text-sky-700 hover:bg-sky-50'
            }`}
          style={p === page ? { backgroundColor: '#00C6FF' } : {}}
          onClick={() => setPage(p)}
        >
          {p}
        </Button>
      );
    }
    return buttons;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="ltr">
      {/* Title & Currencies */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{headingText}</h1>

          {subText && (
            <p className="text-sm text-gray-600 max-w-xl mt-1">{subText}</p>
          )}
        </div>

        <div className="flex gap-2">
          {['AED', 'EUR', 'USD'].map((cur) => (
            <Button
              key={cur}
              variant={currency === cur ? 'default' : 'outline'}
              onClick={() => setCurrency(cur)}
              className="px-4"
            >
              {cur}
            </Button>
          ))}
        </div>
      </div>

      {/* View More (Only on Limited embed) */}
      {limit && (
        <div className="mb-6">
          <Button
            className="bg-sky-600 hover:bg-sky-700 text-white"
            onClick={handleViewMore}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {t('buttons.loading')}
              </div>
            ) : (
              t('buttons.viewMore')
            )}
          </Button>
        </div>
      )}

      {/* Filters (only on full page) */}
      {!limit && (
        <div className="flex gap-2 mb-6">
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="px-4">
                {t('filters.open')}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>{t('filters.title')}</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <FiltersPanel filters={filters} setFilters={handleFiltersChange} />
              </div>
            </SheetContent>
          </Sheet>

          {Object.keys(filters).length > 0 && (
            <Button variant="outline" onClick={handleClearFilters} className="px-4">
              {t('filters.clear')}
            </Button>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center my-8">
          <div className="h-8 w-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Grid + Pagination */}
      {!loading && (
        <>
          {projects.length === 0 ? (
            <p className="text-gray-500">{t('noResults')}</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {projects.map((p) => (
                  <PropertyCard
                    key={p.id}
                    property={p}
                    currency={currency}
                    selectedUnitType={filters.unit_types || filters.unit_type}
                  />
                ))}
              </div>

              {!limit && totalPages > 1 && (
                <div className="flex justify-center mt-10">
                  <div className="inline-flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="border-sky-500 text-sky-700 hover:bg-sky-50"
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>

                    {renderPageButtons()}

                    <Button
                      variant="outline"
                      className="border-sky-500 text-sky-700 hover:bg-sky-50"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
