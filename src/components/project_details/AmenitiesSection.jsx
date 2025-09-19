'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';

function parseImageUrl(imageUrlJson) {
  if (!imageUrlJson) return null;

  if (typeof imageUrlJson === 'string') {
    if (imageUrlJson.startsWith('http')) return imageUrlJson;
    const trimmed = imageUrlJson.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        // handle either a single object or a one-item array
        if (Array.isArray(parsed)) {
          const first = parsed[0];
          return first?.url ?? null;
        }
        return parsed?.url ?? null;
      } catch {
        return null;
      }
    }
    return null;
  }

  if (typeof imageUrlJson === 'object') {
    // common shapes { url }, { image: { url } }, { icon_url }, { images: [{url}] }
    return (
      imageUrlJson.url ??
      imageUrlJson.icon_url ??
      imageUrlJson.image?.url ??
      (Array.isArray(imageUrlJson.images) ? imageUrlJson.images[0]?.url : null) ??
      null
    );
  }

  return null;
}

export default function AmenitiesSection({ property }) {
  // Use project_amenities from Reelly API
  const rawAmenities =  Array.isArray(property?.amenities) ? property.amenities : [];

  // Build a unified amenity list with image (if any)
  const amenities = useMemo(() => {
    return rawAmenities
      .map((amenity) => {
        const name = amenity?.amenity?.name || amenity?.name || null;
        // Try multiple possible fields for image
        const img =
          parseImageUrl(amenity?.icon) ||
          parseImageUrl(amenity?.image_url) ||
          parseImageUrl(amenity?.icon_url) ||
          parseImageUrl(amenity?.image);

        return { name, img };
      })
      .filter((a) => a.name);
  }, [rawAmenities]);

  // Carousel images: prefer amenity-provided images; if none, fall back to project gallery
  const galleryFallback = Array.isArray(property?.media?.photos)
  ? property.media.photos
   : [
       ...(property?.rawData?.architecture || []).map(x => x?.url).filter(Boolean),
       ...(property?.rawData?.interior || []).map(x => x?.url).filter(Boolean),
       ...(property?.rawData?.lobby || []).map(x => x?.url).filter(Boolean),
       property?.rawData?.cover_image?.url
     ].filter(Boolean);

  const carouselImages = amenities.map((a) => a.img).filter(Boolean);
  const images = carouselImages.length > 0 ? carouselImages : galleryFallback;

  const [idx, setIdx] = useState(0);
  const hasImages = images.length > 0;

  const next = () => setIdx((i) => (i + 1) % images.length);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);

  return (
    <section className="bg-gray-50 py-12 px-4 md:px-12" dir="ltr">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* LEFT: Carousel */}
        <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm">
          <div className="relative w-full h-[340px] md:h-[420px]">
            {hasImages ? (
              <Image
                key={images[idx]}
                src={images[idx]}
                alt={`Amenity ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No amenity images
              </div>
            )}
          </div>

          {/* arrows */}
          {hasImages && images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md"
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}

          {/* dots */}
          {hasImages && images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <span
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`h-2.5 w-2.5 rounded-full cursor-pointer ${
                    i === idx ? 'bg-white' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: copy + amenity list */}
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight">
            Signature Features & Resort-Style Amenities
          </h2>

          <p className="text-gray-600 mt-3">
            {property?.description
              ? property.description
              : "Residences blending elegant design with wellness-focused living, premium finishes, and thoughtfully curated amenities."}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            {amenities.slice(0, 12).map((a, i) => (
              <div
                key={`${a.name}-${i}`}
                className="flex items-start gap-2 rounded-lg bg-white shadow-sm border border-gray-100 p-3"
              >
                <CheckCircle className="mt-0.5 h-5 w-5 text-sky-600 shrink-0" />
                <div className="text-sm font-medium text-gray-800">{a.name}</div>
              </div>
            ))}
          </div>

          {/* if there are more amenities, show a small "+N more" */}
          {amenities.length > 12 && (
            <div className="mt-3 text-sm text-gray-500">
              +{amenities.length - 12} more amenities
            </div>
          )}
        </div>
      </div>
    </section>
  );
}