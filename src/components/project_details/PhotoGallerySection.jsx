'use client';
import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';

/* ---- Enhanced Helpers for Best Quality ---- */

/** Normalize a "photo" to a URL string no matter if it's a string or object */
function getRawUrl(photo) {
  if (!photo) return '';
  if (typeof photo === 'string') return photo.trim();
  // common fields we've seen
  return (
    photo.url?.trim() ||
    photo.src?.trim() ||
    photo.original?.trim() ||
    photo.image?.url?.trim() ||
    ''
  );
}

/** Pick the highest resolution available from photo object */
function pickBestFromObject(photo) {
  // If API provides variants/resolutions array with width/height, pick max width
  const variants = photo?.variants || photo?.resolutions || photo?.sources || photo?.sizes;
  if (Array.isArray(variants) && variants.length) {
    const best = [...variants].sort((a, b) => (b.width || 0) - (a.width || 0))[0];
    return getRawUrl(best);
  }
  
  // Check for direct width/height properties
  if (photo?.width && photo?.height) {
    return getRawUrl(photo);
  }
  
  // Otherwise fall back to main URL
  return getRawUrl(photo);
}

/** Get the best possible URL for display */
function getBestUrl(photo) {
  const raw = typeof photo === 'string' ? photo : pickBestFromObject(photo);
  if (!raw) return '';

  // For known CDNs, optimize for 1280x768 display
  const targetWidth = 1280;
  const targetHeight = 768;

  // Cloudinary optimization
  if (/\/upload\/[^/]*\//.test(raw)) {
    return raw.replace(
      /\/upload\/([^/]*)\//,
      (_, t) => {
        const base = t
          .split(',')
          .filter(p => !/^w_|^h_|^q_|^dpr_|^c_/.test(p))
          .join(',');
        const inject = [`w_${targetWidth}`, `h_${targetHeight}`, 'q_95', 'dpr_2', 'c_fill'].join(',');
        return `/upload/${[base, inject].filter(Boolean).join(',')}/`;
      }
    );
  }

  // Imgix-like optimization
  const hasQuery = raw.includes('?');
  const [base, query = ''] = raw.split('?');
  const params = new URLSearchParams(query);

  params.set('w', String(targetWidth));
  params.set('h', String(targetHeight));
  params.set('q', '90');
  params.set('dpr', '2');
  params.set('fit', 'crop');
  params.set('auto', 'format');

  return `${base}?${params.toString()}`;
}

/** Get thumbnail URL */
function getThumbnailUrl(photo) {
  const raw = typeof photo === 'string' ? photo : pickBestFromObject(photo);
  if (!raw) return '';

  // Cloudinary thumbnail
  if (/\/upload\/[^/]*\//.test(raw)) {
    return raw.replace(
      /\/upload\/([^/]*)\//,
      (_, t) => {
        const base = t
          .split(',')
          .filter(p => !/^w_|^h_|^q_|^dpr_|^c_/.test(p))
          .join(',');
        const inject = ['w_160', 'h_100', 'q_80', 'c_fill'].join(',');
        return `/upload/${[base, inject].filter(Boolean).join(',')}/`;
      }
    );
  }

  // Generic thumbnail
  const [base, query = ''] = raw.split('?');
  const params = new URLSearchParams(query);
  params.set('w', '160');
  params.set('h', '100');
  params.set('q', '80');
  params.set('fit', 'crop');

  return `${base}?${params.toString()}`;
}

/** Build blur placeholder */
function getBlurUrl(photo) {
  const raw = typeof photo === 'string' ? photo : pickBestFromObject(photo);
  if (!raw) return '';

  // Very low quality for blur
  const [base, query = ''] = raw.split('?');
  const params = new URLSearchParams(query);
  params.set('w', '20');
  params.set('q', '10');
  params.set('blur', '10');

  return `${base}?${params.toString()}`;
}

/* ---------------- Component ---------------- */

const PhotoGallerySection = ({ property }) => {
  // Collect all possible image sources from API
  const exterior = (property?.rawData?.architecture || []).map(p => p);
  const interior = (property?.rawData?.interior || []).map(p => p);
  const lobby    = (property?.rawData?.lobby || []).map(p => p);
  const cover    = property?.rawData?.cover_image ? [property.rawData.cover_image] : [];
  const media    = Array.isArray(property?.media?.photos) ? property.media.photos : [];
  const amenities = Array.isArray(property?.amenities) 
    ? property.amenities.map(a => a?.image || a?.icon || a?.photo).filter(Boolean)
    : [];

  // Build comprehensive photo collection
  const allPhotos = useMemo(() => {
    const sources = [
      ...media,
      ...exterior,
      ...interior, 
      ...lobby,
      ...cover,
      ...amenities
    ].filter(photo => {
      const url = getRawUrl(photo);
      return url && /\.(png|jpe?g|webp|gif|bmp|svg)(\?.*)?$/i.test(url);
    });

    // Get best quality URLs and remove duplicates
    const urls = sources.map(photo => ({
      original: getBestUrl(photo),
      thumbnail: getThumbnailUrl(photo),
      blur: getBlurUrl(photo)
    })).filter(item => item.original);

    // Basic deduplication
    const seen = new Set();
    return urls.filter(item => {
      if (seen.has(item.original)) return false;
      seen.add(item.original);
      return true;
    });
  }, [media, exterior, interior, lobby, cover, amenities]);

  const exteriorUrls = useMemo(
    () => exterior.map(photo => ({
      original: getBestUrl(photo),
      thumbnail: getThumbnailUrl(photo),
      blur: getBlurUrl(photo)
    })).filter(item => item.original),
    [exterior]
  );

  const interiorUrls = useMemo(
    () => interior.map(photo => ({
      original: getBestUrl(photo),
      thumbnail: getThumbnailUrl(photo),
      blur: getBlurUrl(photo)
    })).filter(item => item.original),
    [interior]
  );

  const hasInterior = interiorUrls.length > 0;
  const hasExterior = exteriorUrls.length > 0;

  const [activeTab, setActiveTab] = useState(
    hasExterior ? 'exterior' : (hasInterior ? 'interior' : 'all')
  );

  const images = activeTab === 'exterior'
    ? exteriorUrls
    : activeTab === 'interior'
      ? interiorUrls
      : allPhotos;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSlideshowActive, setIsSlideshowActive] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Slideshow effect (now 5 seconds)
  useEffect(() => {
    if (!isSlideshowActive || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length, isSlideshowActive]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentImageIndex(0);
    setIsSlideshowActive(true);
  };

  const currentImage = images[currentImageIndex] || { 
    original: "/project_detail_images/building.jpg",
    thumbnail: "/project_detail_images/building.jpg",
    blur: "/project_detail_images/building.jpg"
  };

  if (images.length === 0) {
    return (
      <section className="px-5 py-12 md:px-10 md:py-16 lg:px-14 bg-white/80 backdrop-blur-[1px] rounded-2xl shadow-[0_10px_30px_rgba(17,24,39,0.06)]">
        <div className="text-center py-12">
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4">Photo Gallery</h2>
          <p className="text-slate-600">No photos available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative max-w-7xl w-full mx-auto px-5 py-12 md:px-10 md:py-16 lg:px-14 bg-white/80 backdrop-blur-[1px] rounded-2xl shadow-[0_10px_30px_rgba(17,24,39,0.06)]"
      dir="ltr"
    >
      {/* Title + Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-2">Photo Gallery</h2>
          <p className="text-slate-600">
            {images.length} {images.length === 1 ? 'photo' : 'photos'} available
            {isSlideshowActive && " • Slideshow active"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasExterior && (
            <button
              onClick={() => handleTabChange('exterior')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'exterior'
                  ? 'bg-gradient-to-r from-brand-sky to-brand-dark text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Exteriors ({exteriorUrls.length})
            </button>
          )}
          {hasInterior && (
            <button
              onClick={() => handleTabChange('interior')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'interior'
                  ? 'bg-gradient-to-r from-brand-sky to-brand-dark text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Interiors ({interiorUrls.length})
            </button>
          )}
          <button
            onClick={() => handleTabChange('all')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-brand-sky to-brand-dark text-white shadow-lg'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Photos ({allPhotos.length})
          </button>
        </div>
      </div>

      {/* Main Image Container - Fixed 1280x768 aspect ratio */}
      <div 
        className="relative mb-6 rounded-2xl overflow-hidden bg-slate-100 shadow-xl"
        style={{ 
          width: '100%',
          height: '0',
          paddingBottom: '60%', // 768/1280 = 0.6 = 60%
        }}
        onMouseEnter={() => {
          setIsHovered(true);
          setIsSlideshowActive(false);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsSlideshowActive(true);
        }}
      >
        <div className="absolute inset-0">
          <Image
            src={currentImage.original}
            alt={`Gallery image ${currentImageIndex + 1}`}
            fill
            quality={95}
            priority={currentImageIndex === 0}
            placeholder="blur"
            blurDataURL={currentImage.blur}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1280px"
            className={`object-cover transition-all ease-in-out duration-700 ${
              isHovered ? 'scale-105' : 'scale-100'
            }`}
          />
          
          {/* Slideshow controls */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
              <button
                onClick={() => {
                  setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
                  setIsSlideshowActive(false);
                }}
                className="text-white hover:text-sky-300 transition-colors"
              >
                ‹
              </button>
              
              <div className="text-white text-sm font-medium">
                {currentImageIndex + 1} / {images.length}
              </div>
              
              <button
                onClick={() => {
                  setCurrentImageIndex(prev => (prev + 1) % images.length);
                  setIsSlideshowActive(false);
                }}
                className="text-white hover:text-sky-300 transition-colors"
              >
                ›
              </button>
              
              <button
                onClick={() => setIsSlideshowActive(!isSlideshowActive)}
                className="text-white hover:text-sky-300 transition-colors ml-2"
              >
                {isSlideshowActive ? '⏸️' : '▶️'}
              </button>
            </div>
          )}

          {/* Progress bar for slideshow (now 5s) */}
          {isSlideshowActive && images.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200/50">
              <div 
                className="h-full bg-sky-500"
                style={{ animation: 'progress 5s linear infinite' }}
              />
              <style jsx>{`
                @keyframes progress {
                  from { width: 0%; }
                  to { width: 100%; }
                }
              `}</style>
            </div>
          )}
        </div>
      </div>
          {/* Thumbnail Strip */}
{images.length > 1 && (
  <div className="mt-6 flex flex-wrap justify-center gap-3">
    {images.map((img, index) => (
      <button
        key={index}
        onClick={() => {
          setCurrentImageIndex(index);
          setIsSlideshowActive(false);
        }}
        className={`relative rounded-lg overflow-hidden border-2 transition-all duration-200 ${
          index === currentImageIndex
            ? 'border-sky-500 scale-105 shadow-md'
            : 'border-transparent hover:border-sky-300'
        }`}
        style={{ width: '100px', height: '65px' }}
      >
        <Image
          src={img.thumbnail || img.original}
          alt={`Thumbnail ${index + 1}`}
          fill
          className="object-cover"
          sizes="100px"
          placeholder="blur"
          blurDataURL={img.blur}
        />
        {index === currentImageIndex && (
          <div className="absolute inset-0 bg-sky-500/20"></div>
        )}
      </button>
    ))}
  </div>
)}

      {/* Thumbnails removed as requested */}
    </section>
  );
};

export default PhotoGallerySection;
