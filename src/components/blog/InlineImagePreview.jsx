"use client";

import { useState } from "react";
import ImageLightbox from "@/components/blog/ImageLightbox";

export default function InlineImagePreview({ src, alt, className = "" }) {
  const [open, setOpen] = useState(false);

  if (!src) return null;

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt || ""}
        className={`cursor-zoom-in ${className}`}
        onClick={() => setOpen(true)}
      />

      <ImageLightbox
        open={open}
        onClose={() => setOpen(false)}
        images={[{ url: src, alt }]}
        activeIndex={0}
        setActiveIndex={() => {}}
      />
    </>
  );
}
