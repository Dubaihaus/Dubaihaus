"use client";

import { useEffect } from "react";

export default function ImageLightbox({
  open,
  onClose,
  images = [],
  activeIndex = 0,
  setActiveIndex = () => {},
}) {
  const active = images?.[activeIndex];

  const next = () => setActiveIndex((i) => (i + 1) % images.length);
  const prev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && images.length > 1) next();
      if (e.key === "ArrowLeft" && images.length > 1) prev();
    };

    window.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, images.length]);

  if (!open || !active) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-6xl">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="absolute -top-12 right-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
        >
          ✕
        </button>

        {/* IMPORTANT: no crop */}
        <div className="relative rounded-3xl border border-white/10 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.45)] overflow-hidden">
          <div className="w-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.url}
              alt={active.alt || "Preview image"}
              className="
                block
                max-w-[95vw]
                max-h-[85vh]
                w-auto
                h-auto
                object-contain
                select-none
              "
              draggable={false}
            />
          </div>

          {(active.caption || active.alt) && (
            <div className="px-4 py-3 text-xs text-white/90 border-t border-white/10 bg-black/40">
              {active.caption || active.alt}
            </div>
          )}
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              ›
            </button>

            <div className="mt-3 text-center text-xs text-white/70">
              {activeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
