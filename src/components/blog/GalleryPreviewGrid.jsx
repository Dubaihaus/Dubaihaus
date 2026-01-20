"use client";

import { useMemo, useState } from "react";
import ImageLightbox from "@/components/blog/ImageLightbox";

export default function GalleryPreviewGrid({ images = [] }) {
  const safeImages = useMemo(() => images?.filter((i) => i?.url) ?? [], [images]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const openAt = (idx) => {
    setActiveIndex(idx);
    setOpen(true);
  };

  if (!safeImages.length) return null;

  return (
    <>
      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {safeImages.map((img, idx) => (
          <div
            key={`${img.url}-${idx}`}
            className="relative rounded-2xl overflow-hidden aspect-[4/3] group shadow-sm hover:shadow-md transition"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.alt || `Gallery image ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              loading="lazy"
            />

            {/* Caption */}
            {img.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 backdrop-blur-sm transform translate-y-full group-hover:translate-y-0 transition">
                {img.caption}
              </div>
            )}

            {/* Hover overlay + Preview */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition">
              <button
                type="button"
                onClick={() => openAt(idx)}
                className="
                  absolute left-4 bottom-10
                  inline-flex items-center justify-center
                  rounded-full px-4 py-2
                  text-xs font-semibold
                  bg-white/95 text-slate-900
                  shadow-md
                  transform translate-y-4 opacity-0
                  group-hover:translate-y-0 group-hover:opacity-100
                  transition duration-300
                  hover:bg-white
                "
              >
                Preview
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox (NO CROP) */}
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
