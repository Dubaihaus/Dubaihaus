// src/components/dashboard/DashboardHeader.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQueries } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

// ====== CONFIG ======
// ====== CONFIG ======
// ====== CONFIG ======
const AREAS_CONFIG = [
  // --- Abu Dhabi ---

  {
    title: 'Downtown Dubai',
    filters: {
      search_query: 'Downtown Dubai',
      region: 'Dubai',
    },
    gradient: 'bg-gradient-to-r from-slate-900/60 to-sky-900/60',
    fallbackImg: '/dashboard/downtown.webp',
  },
  {
    title: 'Saadiyat Island',
    filters: {
      search_query: 'Al Saadiyat Island',
      region: 'Abu Dhabi',
    },
    gradient: 'bg-gradient-to-r from-sky-900/60 to-blue-900/60',
    fallbackImg: '/dashboard/saadiyat.jpg',
  },
  
    {
      title: 'Jumeirah Village Circle (JVC)',
      filters: {
        search_query: 'Jumeirah Village Circle',
        region: 'Dubai',
      },
      gradient: 'bg-gradient-to-r from-green-900/60 to-blue-900/60',
      fallbackImg: '/dashboard/palm1.jpg',
    },
  {
    title: 'Yas Island',
    filters: {
      search_query: 'Yas Island',
      region: 'Abu Dhabi',
    },
    gradient: 'bg-gradient-to-r from-emerald-900/60 to-teal-900/60',
    fallbackImg: '/dashboard/yas.webp',
  },
  
    // --- Dubai ---
    {
      title: 'Business Bay',
      filters: {
        search_query: 'Business Bay',
        region: 'Dubai',
      },
      gradient: 'bg-gradient-to-r from-blue-900/60 to-purple-900/60',
      fallbackImg: '/dashboard/BusinessBay.webp',
    },
  {
    title: 'Al Reem Island',
    filters: {
      search_query: 'Al Reem Island',
      region: 'Abu Dhabi',
    },
    gradient: 'bg-gradient-to-r from-indigo-900/60 to-cyan-900/60',
    fallbackImg: '/dashboard/reem.webp',
  },
];

const PLACEHOLDER = '/project_detail_images/building.jpg';


// ====== HELPERS ======
function extractImageUrl(project) {
  if (!project) return null;
  const imageCandidates = [
    project.coverImage,
    project.coverPhoto,
    project.cover_image?.url,
    project.rawData?.cover_image?.url,
    project.media?.photos?.[0]?.url,
    project.photos?.[0]?.url,
    project.images?.[0]?.url,
    project.project_images?.[0]?.url,
  ].filter(Boolean);

  for (const c of imageCandidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
    if (c?.url && typeof c.url === 'string') return c.url.trim();
  }
  return null;
}

async function fetchAreaSlideData(areaConfig) {
  const baseParams = { page: '1', pageSize: '1', pricedOnly: 'false' };

  // Prefer explicit filters.search_query, fallback to title without "(JVC)" etc.
  const searchQuery =
    areaConfig.filters?.search_query ||
    areaConfig.title.split('(')[0].trim();

  const paramsObj = {
    ...baseParams,
    search_query: searchQuery,
  };

  // If region is provided in filters, pass it through as well
  if (areaConfig.filters?.region) {
    paramsObj.region = areaConfig.filters.region;
  }

  const params = new URLSearchParams(paramsObj);

  try {
    const res = await fetch(`/api/off-plan?${params.toString()}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.results?.length > 0) return data.results[0];
    return null;
  } catch {
    return null;
  }
}


function useAreaSlides() {
  return useQueries({
    queries: AREAS_CONFIG.map((areaConfig) => ({
      queryKey: ['area-slide', areaConfig.title],
      queryFn: () => fetchAreaSlideData(areaConfig),
      staleTime: 1000 * 60 * 15, // 15 minutes
    })),
  });
}

function BackgroundImage({ src, alt, fallbackSrc, className }) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
    setHasError(false);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!hasError && currentSrc !== fallbackSrc) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
  };

  return (
    <div className={`absolute inset-0 ${className}`}>
      <Image
        src={currentSrc}
        alt={alt}
        fill
        className="object-cover"
        sizes="100vw"
        onError={handleError}
        priority
      />
    </div>
  );
}

// ====== COMPONENT ======
export default function DashboardHeader() {
  const slideQueries = useAreaSlides();
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const t = useTranslations('dashboard.hero');

  const slides = slideQueries.map((query, index) => {
    const areaConfig = AREAS_CONFIG[index];
    const project = query.data;

    const projectImage = extractImageUrl(project);
    const finalImage = projectImage || areaConfig.fallbackImg || PLACEHOLDER;

    const allHref = `/off-plan?${new URLSearchParams(
      areaConfig.filters
    ).toString()}`;
    const projectId = project?.id || project?.rawData?.id;
    const detailHref = projectId ? `/ui/project_details/${projectId}` : allHref;

    const areaTitle = areaConfig.title;
    const projectName =
      project?.name || t('fallbackProjectName', { defaultValue: 'Featured property' });

    let description;
    if (project) {
      if (project.bedrooms) {
        description = t('descriptionWithBedrooms', {
          projectName,
          areaTitle,
          bedrooms: project.bedrooms,
        });
      } else {
        description = t('descriptionNoBedrooms', {
          projectName,
          areaTitle,
        });
      }
    } else {
      description = t('descriptionFallback', { areaTitle });
    }

    return {
      areaTitle,
      description,
      bg: finalImage,
      gradient: areaConfig.gradient,
      projectId,
      hrefAll: allHref,
      hrefDetail: detailHref,
      hasProject: !!project,
      fallbackImg: areaConfig.fallbackImg,
      isLoading: query.isLoading,
    };
  });

  const loading = slideQueries.some((query) => query.isLoading);

  // Auto-rotate slides
  useEffect(() => {
    if (slides.length < 2 || loading) return;
    const id = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent((p) => (p + 1) % slides.length);
        setIsAnimating(false);
      }, 500);
    }, 6000);
    return () => clearInterval(id);
  }, [slides.length, loading]);

  const goTo = useCallback(
    (idx) => {
      if (idx === current || isAnimating) return;
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent(idx);
        setIsAnimating(false);
      }, 500);
    },
    [current, isAnimating]
  );

  const active = slides[current] || null;

  // ====== LOADING SKELETON ======
  if (loading && slides.length === 0) {
    return (
      <section
        className="relative h-[440px] sm:h-[520px] md:h-[600px] lg:h-[680px] bg-gray-200 overflow-hidden"
        dir="ltr"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-400/60 to-gray-600/60" />
        <div className="relative z-10 flex flex-col justify-center h-full px-4 sm:px-8 md:px-16">
          <div className="max-w-3xl mb-8">
            <div className="h-10 sm:h-12 bg-gray-300 rounded mb-4 w-4/5 animate-pulse" />
            <div className="h-5 sm:h-6 bg-gray-300 rounded mb-2 w-full animate-pulse" />
            <div className="h-5 sm:h-6 bg-gray-300 rounded mb-6 w-2/3 animate-pulse" />
            <div className="flex gap-3 sm:gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 bg-gray-300 rounded-full w-24 animate-pulse"
                />
              ))}
            </div>
            <div className="flex gap-3 sm:gap-4">
              <div className="h-11 sm:h-12 bg-gray-300 rounded w-40 sm:w-48 animate-pulse" />
              <div className="h-11 sm:h-12 bg-gray-300 rounded w-48 sm:w-56 animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ====== HERO ======
  return (
    <section
      className="relative overflow-hidden h-[480px] sm:h-[560px] md:h-[640px] lg:h-[700px]"
      dir="ltr"
    >
      {/* Background slideshow */}
      <div className="absolute inset-0">
        {slides.map((slide, idx) => (
          <div
            key={`${slide.areaTitle}-${idx}`}
            className={`absolute inset-0 transition-all duration-1000 ${
              idx === current ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            style={{
              transition:
                'opacity 1s ease-in-out, transform 6s ease-in-out',
            }}
          >
            <BackgroundImage
              src={slide.bg}
              alt={slide.areaTitle}
              fallbackSrc={slide.fallbackImg || PLACEHOLDER}
              className="z-0"
            />
            <div className={`absolute inset-0 ${slide.gradient} z-0`} />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/30 z-0" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center h-full px-4 sm:px-8 md:px-26">
        {active ? (
          <div className="max-w-3xl mb-6 sm:mb-8 transform transition-transform duration-500">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight uppercase mb-3 sm:mb-4 text-white drop-shadow-lg">
              {active.areaTitle}
            </h1>
            {/* <p className="text-base sm:text-lg md:text-xl mb-5 sm:mb-6 text-white/90 leading-relaxed max-w-2xl drop-shadow-md">
              {active.description}
            </p> */}

            {active.hasProject ? (
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                <span className="text-yellow-200 text-xs sm:text-sm font-medium">
                  {t('statusExploreArea')}
                </span>
              </div>
            )}

            {/* Chips */}
            {/* <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
              {[t('chipLuxury'), t('chipGreen'), t('chipAmenities')].map(
                (txt) => (
                  <span
                    key={txt}
                    className="bg-white/20 backdrop-blur-lg px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm text-white border border-white/30 shadow-lg"
                  >
                    {txt}
                  </span>
                )
              )}
            </div> */}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                href={active.hrefDetail}
                className="bg-brand-sky hover:bg-brand-dark text-white font-semibold px-6 py-3 sm:px-8 sm:py-4 rounded-lg transition-all duration-300 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 sm:hover:-translate-y-1 flex items-center justify-center gap-2"
                prefetch
              >
                <span>
                  {active.hasProject
                    ? t('primaryCtaWithProject')
                    : t('primaryCtaNoProject')}
                </span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
              <Link
                href={active.hrefAll}
                className="border-2 border-white text-white hover:bg-white/20 font-semibold px-6 py-3 sm:px-8 sm:py-4 rounded-lg transition-all duration-300 text-center backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 sm:hover:-translate-y-1"
                prefetch
              >
                {t('secondaryCtaPrefix', {
                  areaShort: active.areaTitle.split(' ')[0],
                })}
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight uppercase mb-3 sm:mb-4 text-white">
              {t('defaultTitle')}
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-5 sm:mb-6 text-white/90 leading-relaxed">
              {t('defaultDescription')}
            </p>
          </div>
        )}

        {/* Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 backdrop-blur-md rounded-full p-1.5 sm:p-2 bg-black/20">
            {slides.map((slide, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                  idx === current
                    ? 'bg-white scale-110 sm:scale-125 shadow-lg'
                    : 'bg-white/50 hover:bg-white/70 hover:scale-105'
                }`}
                aria-label={t('dotAriaLabel', { areaTitle: slide.areaTitle })}
              />
            ))}
          </div>
        )}

        {/* Arrows (hidden on small screens) */}
        {/* {slides.length > 1 && (
          <>
            <button
              onClick={() =>
                goTo((current - 1 + slides.length) % slides.length)
              }
              className="hidden md:inline-flex absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-full p-3 md:p-4 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/20"
              aria-label={t('ariaPreviousSlide')}
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => goTo((current + 1) % slides.length)}
              className="hidden md:inline-flex absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-full p-3 md:p-4 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/20"
              aria-label={t('ariaNextSlide')}
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )} */}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
        <div
          className="h-full bg-white transition-all duration-5000 ease-linear shadow-lg"
          style={{
            width: isAnimating ? '100%' : '0%',
            transition: isAnimating ? 'width 5s linear' : 'none',
          }}
          key={current}
        />
      </div>
    </section>
  );
}
