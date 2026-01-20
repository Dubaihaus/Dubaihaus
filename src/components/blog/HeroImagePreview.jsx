"use client";

import { useState } from "react";
import ImageLightbox from "@/components/blog/ImageLightbox";

export default function HeroImagePreview({ url, title }) {
  const [open, setOpen] = useState(false);

  if (!url) return null;

  return (
    <>
      <div className="mb-12 overflow-hidden rounded-[32px] border border-slate-200 shadow-[0_20px_40px_rgba(0,0,0,0.08)] bg-white relative aspect-[21/9] group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={title || "Hero image"}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Preview button */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="
              absolute left-6 bottom-6
              inline-flex items-center justify-center
              rounded-full px-4 py-2
              text-xs font-semibold
              bg-white/95 text-slate-900
              shadow-md
              transform translate-y-3 opacity-0
              group-hover:translate-y-0 group-hover:opacity-100
              transition duration-300
            "
          >
            Preview
          </button>
        </div>
      </div>

      {/* Lightbox shows FULL image (no crop) */}
      <ImageLightbox
        open={open}
        onClose={() => setOpen(false)}
        images={[{ url, alt: title || "Hero image" }]}
        activeIndex={0}
        setActiveIndex={() => {}}
      />
    </>
  );
}
