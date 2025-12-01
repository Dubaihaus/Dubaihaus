// src/components/offplan/OffPlanClient.jsx  (CLIENT)
'use client';

import { useState, useEffect } from 'react';
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

export default function OffPlanClient({ limit, latest = false }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('offPlan.client');

  // Initialize filters from query params (for full page)
  const initialFilters = {};
  for (const [key, value] of searchParams.entries()) initialFilters[key] = value;

  const [filters, setFilters] = useState(initialFilters);
  const [projects, setProjects] = useState([]);
  const [currency, setCurrency] = useState('AED');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const paramsObj = { ...filters, currency };
      if (latest) paramsObj.latest = 'true';

      Object.keys(paramsObj).forEach((k) => {
        if (!paramsObj[k]) delete paramsObj[k];
      });

      const params = new URLSearchParams(paramsObj);
      const res = await fetch(`/api/off-plan?${params.toString()}`);
      if (!res.ok) {
        const text = await res.text();
        console.error('off-plan API error:', res.status, text.slice(0, 300));
        setProjects([]);
        return;
      }
      const data = await res.json();
      setProjects(
        limit ? (data.results || []).slice(0, limit) : data.results || []
      );
    } catch (e) {
      console.error('Error fetching projects:', e);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currency, latest]);

  // Sync URL only on the full page
  useEffect(() => {
    if (!limit) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
      router.replace(`/off-plan?${params.toString()}`, { scroll: false });
    }
  }, [filters, limit, router]);

  const handleViewMore = () => {
    setLoading(true);
    setTimeout(() => router.push('/off-plan'), 300);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="ltr">
      {/* Title & Currencies */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t('heading')}
          </h1>
          <p className="text-sm text-gray-600 max-w-xl mt-1">
            {t('description')}
          </p>
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
                <FiltersPanel filters={filters} setFilters={setFilters} />
              </div>
            </SheetContent>
          </Sheet>

          {Object.keys(filters).length > 0 && (
            <Button
              variant="outline"
              onClick={() => setFilters({})}
              className="px-4"
            >
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

      {/* Grid */}
      {!loading && (
        <div>
          {projects.length === 0 ? (
            <p className="text-gray-500">{t('noResults')}</p>
          ) : (
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
          )}
        </div>
      )}
    </div>
  );
}
