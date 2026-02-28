// src/components/project_details/AmenitiesSection.jsx
'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

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

/** Escape text for safe use inside a RegExp constructor */
function escapeRegExp(s) {
  return String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* -------------------------------------------------------------------------- */
/* NEW: robust markdown-ish section extraction + removal + truncation utilities */
/* -------------------------------------------------------------------------- */

/** Collapse whitespace nicely */
function normalizeText(s) {
  return String(s || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Remove markdown sections that start with ###/####/##### <heading>
 * and end at the next heading or end of string.
 */
function removeMdSections(md, headings = []) {
  if (!md || typeof md !== 'string') return '';
  let out = md;

  for (const h of headings) {
    const pattern = new RegExp(
      `^#{3,6}\\s*${escapeRegExp(h)}\\b[\\s\\S]*?(?=^#{3,6}\\s|\\s*$)`,
      'gim'
    );
    out = out.replace(pattern, '');
  }

  return out;
}

/** Remove standalone markdown heading lines (### Title, #### Title, etc.) */
function stripHeadingLines(md) {
  return String(md || '').replace(/^#{1,6}\s+.*$/gm, '');
}

/** Remove other common markdown noise we see in API blobs */
function stripMarkdownNoise(md) {
  return String(md || '')
    .replace(/^\s*[-*]\s+/gm, '') // bullet markers
    .replace(/\*\*(.*?)\*\*/g, '$1') // bold
    .replace(/_(.*?)_/g, '$1') // italics
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // links
    .replace(/`{1,3}([\s\S]*?)`{1,3}/g, '$1'); // inline/fenced code-ish
}

/**
 * Extract a markdown-like section that starts with ###..###### <heading>
 * and ends at next heading or end.
 */
function extractMdSection(md, heading) {
  if (!md || typeof md !== 'string') return null;

  const pattern = new RegExp(
    `^#{3,6}\\s*${escapeRegExp(heading)}\\b([\\s\\S]*?)(?=^#{3,6}\\s|\\s*$)`,
    'gim'
  );

  const m = pattern.exec(md);
  if (!m) return null;

  const cleaned = normalizeText(stripMarkdownNoise(stripHeadingLines(m[1])));
  return cleaned || null;
}

/**
 * Final: pick best amenity description and ensure location/history blocks are removed
 * so they never leak into Amenities section.
 */
function buildAmenitiesParagraph(overviewSource) {
  const src = String(overviewSource || '');

  // 1) Try best-match sections first (amenity-related)
  const preferredHeadings = [
    'Finishing and materials',
    'Finishing & materials',
    'Amenities',
    'Amenities and facilities',
    'Facilities',
    'Features',
    'Project features',
    'Signature features',
  ];

  for (const h of preferredHeadings) {
    const found = extractMdSection(src, h);
    if (found) return found;
  }

  // 2) If we couldn’t extract, sanitize the whole blob and REMOVE location/history blocks
  const withoutBadSections = removeMdSections(src, [
    'Location description',
    'Location',
    'Project history',
    'Neighborhood',
    'Area',
    'About the Project',
    'Project general facts',
  ]);

  const cleaned = normalizeText(stripMarkdownNoise(stripHeadingLines(withoutBadSections)));
  return cleaned;
}

/** Truncate to N chars, avoid cutting mid-word */
function truncateText(s, limit = 500) {
  const txt = String(s || '').trim();
  if (txt.length <= limit) return txt;

  const cut = txt.slice(0, limit);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 120 ? cut.slice(0, lastSpace) : cut).trim() + '…';
}

export default function AmenitiesSection({ property }) {
  const t = useTranslations('projectDetails');
  // Use project_amenities from Reelly API
  const rawAmenities = Array.isArray(property?.amenities) ? property.amenities : [];

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
      ...(property?.rawData?.architecture || []).map((x) => x?.url).filter(Boolean),
      ...(property?.rawData?.interior || []).map((x) => x?.url).filter(Boolean),
      ...(property?.rawData?.lobby || []).map((x) => x?.url).filter(Boolean),
      property?.rawData?.cover_image?.url,
    ].filter(Boolean);

  const carouselImages = amenities.map((a) => a.img).filter(Boolean);
  const images = carouselImages.length > 0 ? carouselImages : galleryFallback;

  const [idx, setIdx] = useState(0);
  const hasImages = images.length > 0;

  const next = () => setIdx((i) => (i + 1) % images.length);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);

  /* -------------------------------------------------------------------------- */
  /* NEW: Amenities paragraph that never shows location/history sections         */
  /* + See more / See less toggle with a 500 char preview                        */
  /* -------------------------------------------------------------------------- */

  const overviewSource =
    property?.rawData?.description ||
    property?.rawData?.overview ||
    property?.rawData?.about ||
    property?.description ||
    '';

  const cleanedAmenitiesText = buildAmenitiesParagraph(overviewSource);

  // Fallback text (only if cleaned content isn't available/meaningful)
  const fallbackText = t('amenities.fallback');

  const paragraphFull =
    cleanedAmenitiesText && cleanedAmenitiesText.length > 40 ? cleanedAmenitiesText : fallbackText;

  const PREVIEW_LIMIT = 500;
  const [expanded, setExpanded] = useState(false);

  const paragraphPreview = useMemo(
    () => truncateText(paragraphFull, PREVIEW_LIMIT),
    [paragraphFull]
  );

  const shouldShowToggle = paragraphFull.length > paragraphPreview.length;

  return (
    <section className="bg-gray-50 py-12" dir="ltr">
      {/* Increased container width from max-w-6xl to max-w-7xl */}
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Increased gap from gap-10 to gap-16 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* LEFT: Carousel */}
          <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="relative w-full h-[370px] md:h-[420px]">
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
                  {t('amenities.noImages')}
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
                    className={`h-2.5 w-2.5 rounded-full cursor-pointer ${i === idx ? 'bg-white' : 'bg-white/60'
                      }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: copy + amenity list */}
          <div>
            <h2 className="text-2xl md:text-4xl font-semibold text-gray-900 leading-tight">
              {t('amenities.title')}
            </h2>

            <p className="text-gray-600 mt-3">
              {expanded ? paragraphFull : paragraphPreview}

              {shouldShowToggle && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="ml-2 text-sm font-semibold text-sky-600 hover:text-sky-700 underline underline-offset-2"
                >
                  {expanded ? t('amenities.seeLess') : t('amenities.seeMore')}
                </button>
              )}
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
                {t('amenities.moreCount', { count: amenities.length - 12 })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
