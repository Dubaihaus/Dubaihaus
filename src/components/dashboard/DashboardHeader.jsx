'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Enhanced AREAS_CONFIG with proper district IDs
const AREAS_CONFIG = [
  { 
    title: 'Jumeirah Village Circle (JVC)', 
    filters: { districts: '269' }, // ✅ JVC
    gradient: 'bg-gradient-to-r from-green-900/60 to-blue-900/60', 
    fallbackImg: '/dashboard/palm1.jpg' 
  },
  { 
    title: 'Business Bay', 
    filters: { districts: '187' }, // ✅ Business Bay
    gradient: 'bg-gradient-to-r from-blue-900/60 to-purple-900/60', 
    fallbackImg: '/dashboard/BusinessBay.webp' 
  },
  { 
    title: 'Dubai Hills Estate', 
    filters: { districts: ['204', '210']  }, // ✅ Dubai Hills (Estate)
    gradient: 'bg-gradient-to-r from-emerald-900/60 to-teal-900/60', 
    fallbackImg: '/dashboard/dubai-hills.jpg' 
  },
  { 
    title: 'Downtown Dubai', 
    filters: { districts: '201' }, // ✅
    gradient: 'bg-gradient-to-r from-slate-900/60 to-sky-900/60',   
    fallbackImg: '/dashboard/downtown.jpg' 
  },
  { 
    title: 'Dubai Marina', 
    filters: { districts: '217' }, // ✅
    gradient: 'bg-gradient-to-r from-indigo-900/60 to-cyan-900/60',  
    fallbackImg: '/dashboard/Marina.jpg' 
  },
  { 
    title: 'Palm Jumeirah', 
    filters: { districts: '308' }, // ✅ Palm Jumeirah
    gradient: 'bg-gradient-to-r from-fuchsia-900/60 to-rose-900/60', 
    fallbackImg: '/dashboard/palm.jpg' 
  },
];


const PLACEHOLDER = '/project_detail_images/building.jpg';

// Enhanced image extraction - combines both approaches
function extractImageUrl(project) {
  if (!project) return null;
  
  // Try all possible image paths
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

  // Return first valid URL
  for (const candidate of imageCandidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
    if (candidate?.url && typeof candidate.url === 'string') {
      return candidate.url.trim();
    }
  }
  
  return null;
}

// Enhanced fetch strategies
async function fetchWithStrategies(areaConfig) {
  const baseParams = { page: '1', pageSize: '1', pricedOnly: 'false' };
  
  // Strategy 1: District ID (primary)
  if (areaConfig.filters.districts) {
    try {
      const params = new URLSearchParams({ ...baseParams, districts: areaConfig.filters.districts });
      const response = await fetch(`/api/off-plan?${params}`, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        if (data?.results?.length > 0) {
          console.log(`✅ Found project for ${areaConfig.title} via district ID`);
          return data.results[0];
        }
      }
    } catch (error) {
      console.warn(`District ID strategy failed for ${areaConfig.title}:`, error);
    }
  }

  // Strategy 2: Area name fallback
  try {
    const areaName = areaConfig.title.split('(')[0].trim(); // "Jumeirah Village Circle (JVC)" -> "Jumeirah Village Circle"
    const params = new URLSearchParams({ ...baseParams, area: areaName });
    const response = await fetch(`/api/off-plan?${params}`, { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      if (data?.results?.length > 0) {
        console.log(`✅ Found project for ${areaConfig.title} via area name`);
        return data.results[0];
      }
    }
  } catch (error) {
    console.warn(`Area name strategy failed for ${areaConfig.title}:`, error);
  }

  // Strategy 3: Search query fallback
  try {
    const searchQuery = areaConfig.title.split('(')[0].trim();
    const params = new URLSearchParams({ ...baseParams, search_query: searchQuery });
    const response = await fetch(`/api/off-plan?${params}`, { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      if (data?.results?.length > 0) {
        console.log(`✅ Found project for ${areaConfig.title} via search`);
        return data.results[0];
      }
    }
  } catch (error) {
    console.warn(`Search strategy failed for ${areaConfig.title}:`, error);
  }

  console.log(`❌ No projects found for ${areaConfig.title}`);
  return null;
}

// Image component with robust fallback
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

export default function DashboardHeader() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Enhanced data fetching
  useEffect(() => {
    let cancelled = false;

    const fetchAllAreas = async () => {
      setLoading(true);
      console.log('🚀 Starting to fetch area data...');
      
      try {
        const slidesData = await Promise.all(
          AREAS_CONFIG.map(async (areaConfig) => {
            try {
              const project = await fetchWithStrategies(areaConfig);
              
              // Extract image with fallback
              const projectImage = extractImageUrl(project);
              const finalImage = projectImage || areaConfig.fallbackImg || PLACEHOLDER;

              // Build URLs
              const allHref = `/off-plan?${new URLSearchParams(areaConfig.filters).toString()}`;
              const projectId = project?.id || project?.rawData?.id;
              const detailHref = projectId ? `/ui/project_details/${projectId}` : allHref;

              // Build description
              const description = project 
                ? `${project.name || 'Featured property'} in ${areaConfig.title}. ${project.bedrooms ? `${project.bedrooms}-bed` : 'Luxury'} apartments with modern amenities.`
                : `Explore premium off-plan developments in ${areaConfig.title}.`;

              return {
                areaTitle: areaConfig.title,
                description,
                bg: finalImage,
                gradient: areaConfig.gradient,
                projectId,
                hrefAll: allHref,
                hrefDetail: detailHref,
                hasProject: !!project,
              };
            } catch (error) {
              console.error(`Error processing ${areaConfig.title}:`, error);
              return {
                areaTitle: areaConfig.title,
                description: `Explore premium off-plan developments in ${areaConfig.title}.`,
                bg: areaConfig.fallbackImg || PLACEHOLDER,
                gradient: areaConfig.gradient,
                projectId: null,
                hrefAll: `/off-plan?${new URLSearchParams(areaConfig.filters).toString()}`,
                hrefDetail: `/off-plan?${new URLSearchParams(areaConfig.filters).toString()}`,
                hasProject: false,
              };
            }
          })
        );

        if (!cancelled) {
          const validSlides = slidesData.filter(slide => slide !== null);
          console.log(`📊 Loaded ${validSlides.length} slides:`, validSlides.map(s => s.areaTitle));
          setSlides(validSlides);
          
          if (validSlides.length > 0 && current >= validSlides.length) {
            setCurrent(0);
          }
        }
      } catch (error) {
        console.error('Error in dashboard header:', error);
        if (!cancelled) {
          setSlides([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          console.log('✅ Finished loading dashboard header');
        }
      }
    };

    fetchAllAreas();

    return () => { cancelled = true; };
  }, []);

  // Auto-rotation
  useEffect(() => {
    if (slides.length < 2 || loading) return;
    
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % slides.length);
        setIsAnimating(false);
      }, 500);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [slides.length, loading]);

  const goTo = useCallback((idx) => {
    if (idx === current || isAnimating) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setIsAnimating(false);
    }, 500);
  }, [current, isAnimating]);

  const active = slides[current] || null;

  // Loading state
  if (loading && slides.length === 0) {
    return (
      <section className="relative h-[600px] bg-gray-200 overflow-hidden" dir="ltr">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-400/60 to-gray-600/60" />
        <div className="relative z-10 flex flex-col justify-center h-full px-4 md:px-16">
          <div className="max-w-3xl mb-8">
            <div className="h-12 bg-gray-300 rounded mb-4 w-3/4 animate-pulse" />
            <div className="h-6 bg-gray-300 rounded mb-2 w-full animate-pulse" />
            <div className="h-6 bg-gray-300 rounded mb-6 w-2/3 animate-pulse" />
            <div className="flex gap-4 mb-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 bg-gray-300 rounded-full w-24 animate-pulse" />
              ))}
            </div>
            <div className="flex gap-4">
              <div className="h-12 bg-gray-300 rounded w-48 animate-pulse" />
              <div className="h-12 bg-gray-300 rounded w-56 animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[700px] overflow-hidden" dir="ltr">
      {/* Background slideshow */}
      <div className="absolute inset-0">
        {slides.map((slide, idx) => (
          <div
            key={`${slide.areaTitle}-${idx}`}
            className={`absolute inset-0 transition-all duration-1000 ${
              idx === current
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105'
            }`}
            style={{
              transition: 'opacity 1s ease-in-out, transform 6s ease-in-out',
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
        {/* Enhanced overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 z-0" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center h-full px-4 md:px-16">
        {active ? (
          <div className="max-w-3xl mb-8 transform transition-transform duration-500">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight uppercase mb-4 text-white drop-shadow-lg">
              {active.areaTitle}
            </h1>
            <p className="text-lg md:text-xl mb-6 text-white/90 leading-relaxed drop-shadow-md max-w-2xl">
              {active.description}
            </p>

            {/* Status indicator */}
            {active.hasProject ? (
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-200 text-sm font-medium">Properties Available</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                <span className="text-yellow-200 text-sm font-medium">Explore Area</span>
              </div>
            )}

            {/* Chips */}
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="bg-white/20 backdrop-blur-lg px-4 py-2 rounded-full text-sm text-white border border-white/30 shadow-lg">
                 Luxury Apartments
              </span>
              <span className="bg-white/20 backdrop-blur-lg px-4 py-2 rounded-full text-sm text-white border border-white/30 shadow-lg">
                 Green Spaces
              </span>
              <span className="bg-white/20 backdrop-blur-lg px-4 py-2 rounded-full text-sm text-white border border-white/30 shadow-lg">
                 Premium Amenities
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={active.hrefDetail}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
                prefetch
              >
                <span>{active.hasProject ? 'Discover Properties' : 'Explore Area'}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href={active.hrefAll}
                className="border-2 border-white text-white hover:bg-white/20 font-semibold px-8 py-4 rounded-lg transition-all duration-300 text-center backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                prefetch
              >
                View All in {active.areaTitle.split(' ')[0]}
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight uppercase mb-4 text-white">
              Dubai Off-Plan Properties
            </h1>
            <p className="text-lg md:text-xl mb-6 text-white/90 leading-relaxed">
              Discover premium off-plan developments across Dubai's most sought-after locations.
            </p>
          </div>
        )}

        {/* Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 backdrop-blur-md rounded-full p-2 bg-black/20">
            {slides.map((slide, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  idx === current 
                    ? 'bg-white scale-125 shadow-lg' 
                    : 'bg-white/50 hover:bg-white/70 hover:scale-110'
                }`}
                aria-label={`Go to ${slide.areaTitle}`}
              />
            ))}
          </div>
        )}

        {/* Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={() => goTo((current - 1 + slides.length) % slides.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-full p-4 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/20"
              aria-label="Previous slide"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => goTo((current + 1) % slides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-full p-4 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/20"
              aria-label="Next slide"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
        <div
          className="h-full bg-white transition-all duration-5000 ease-linear shadow-lg"
          style={{ 
            width: isAnimating ? '100%' : '0%', 
            transition: isAnimating ? 'width 5s linear' : 'none' 
          }}
          key={current}
        />
      </div>
    </section>
  );
}