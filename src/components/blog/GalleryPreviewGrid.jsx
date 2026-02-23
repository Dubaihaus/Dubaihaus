"use client";

import { useMemo, useState } from "react";
import ImageLightbox from "@/components/blog/ImageLightbox";

const MAX_PREVIEW = 6;

export default function GalleryPreviewGrid({ images = [] }) {
  const safeImages = useMemo(() => images?.filter((i) => i?.url) ?? [], [images]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const openAt = (idx) => {
    setActiveIndex(idx);
    setOpen(true);
  };

  if (!safeImages.length) return null;

  const previewImages = safeImages.slice(0, MAX_PREVIEW);
  const remaining = safeImages.length - MAX_PREVIEW;

  return (
    <>
      {/* Desktop layout: 2 big left stacked + 4 small right (2x2) */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 h-[420px] lg:h-[480px]">
        {previewImages.map((img, idx) => {
          const isLastWithMore = idx === MAX_PREVIEW - 1 && remaining > 0;

          // Layout map:
          // idx 0 -> left big top (col-span-2)
          // idx 1 -> left big bottom (col-span-2)
          // idx 2 -> right top-left
          // idx 3 -> right top-right
          // idx 4 -> right bottom-left
          // idx 5 -> right bottom-right (overlay +N)
          const gridClass =
            idx === 0
              ? "col-span-2 row-span-1"
              : idx === 1
                ? "col-span-2 row-span-1"
                : "col-span-1 row-span-1";

          return (
            <button
              key={`${img.url}-${idx}`}
              type="button"
              onClick={() => openAt(idx)}
              className={`relative ${gridClass} w-full h-full rounded-2xl overflow-hidden group shadow-sm hover:shadow-md transition`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt || `Gallery image ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-500"
                loading="lazy"
              />

              {/* Caption (optional hover strip) */}
              {img.caption && !isLastWithMore && (
                <div className="absolute left-0 right-0 bottom-0 bg-black/55 text-white text-xs px-3 py-2 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition">
                  {img.caption}
                </div>
              )}

              {/* Hover overlay */}
              {!isLastWithMore && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
              )}

              {/* +N more overlay on last tile */}
              {isLastWithMore && (
                <div className="absolute inset-0 bg-black/55 flex items-end justify-start p-3">
                  <span className="text-white text-sm font-semibold px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
                  >
                    + {remaining} more
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile layout: keep it simple + usable (2 columns, 6 tiles) */}
      <div className="grid md:hidden grid-cols-2 gap-3">
        {previewImages.map((img, idx) => {
          const isLastWithMore = idx === MAX_PREVIEW - 1 && remaining > 0;

          return (
            <button
              key={`${img.url}-${idx}`}
              type="button"
              onClick={() => openAt(idx)}
              className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt || `Gallery image ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {isLastWithMore && (
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                  <span className="text-white text-base font-bold">
                    +{remaining} more
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Lightbox (ALL images, not just preview) */}
      <ImageLightbox
        open={open}
        onClose={() => setOpen(false)}
        images={safeImages.map((i) => ({
          url: i.url,
          alt: i.alt,
          caption: i.caption,
        }))}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
      />
    </>
  );
}