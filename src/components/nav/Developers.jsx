// src/components/nav/Developers.jsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';

import { usePathname } from 'next/navigation';

// Configure which devs to feature + the card background image to show
const FEATURED = [
  { match: 'Emaar', img: '/dashboard/emaar.webp', label: 'Emaar' },
  { match: 'Meraas', img: '/dashboard/meraas.webp', label: 'Meraas' },
  { match: 'DAMAC', img: '/dashboard/damac.webp', label: 'DAMAC' },
  { match: 'Nakheel', img: '/dashboard/nakheel.webp', label: 'Nakheel' },
];

export default function DevelopersMegaMenu({ label = 'Developers' }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devs, setDevs] = useState([]);

  const wrapRef = useRef(null);
  const panelRef = useRef(null);
  const timer = useRef(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const openNow = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    timer.current = setTimeout(() => setOpen(false), 120);
  };

  // Fetch developers once when menu first opens
  useEffect(() => {
    if (!open || devs.length) return;
    setLoading(true);
    fetch('/api/developers?limit=200', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => setDevs(j?.results ?? []))
      .finally(() => setLoading(false));
  }, [open, devs.length]);

  // Close on ESC and outside click
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);

    const onClick = (e) => {
      // Check both wrapper (trigger) and portal panel
      if (
        (wrapRef.current && wrapRef.current.contains(e.target)) ||
        (panelRef.current && panelRef.current.contains(e.target))
      ) {
        return;
      }
      setOpen(false);
    };

    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onClick);
    };
  }, []);

  // Pick featured devs from API and attach the configured background images
  const featured = useMemo(() => {
    const lower = (s) => String(s || '').toLowerCase();
    return FEATURED.map((cfg) => {
      const found = devs.find((d) => lower(d.name).includes(lower(cfg.match)));
      return { cfg, dev: found ?? null };
    });
  }, [devs]);

  // Use FEATURED as placeholders while loading so cfg is always defined
  const cardsToRender = loading
    ? FEATURED.map((cfg) => ({ cfg, dev: null }))
    : featured;

  const fallbackImg = '/dashboard/all-dev.webp';

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <button
        type="button"
        className="text-sm hover:text-blue-600 transition py-2"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
      </button>

      {/* Portal Panel - Fixed Position */}
      {open && mounted && createPortal(
        <div
          ref={panelRef}
          className="fixed left-1/2 top-[72px] -translate-x-1/2 w-[980px] max-w-[95vw]
                     max-h-[calc(100vh-96px)] overflow-y-auto
                     rounded-2xl border bg-white shadow-2xl z-[9999]"
          onMouseEnter={openNow}
          onMouseLeave={closeSoon}
        >
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <div className="text-sm font-semibold text-slate-800">
              Featured Developers
            </div>
            {loading && (
              <div className="text-xs text-slate-500">Loading…</div>
            )}
          </div>

          {/* Row: All Developers + 4 featured cards */}
          <div className="px-5 pb-5 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* All Developers */}
            <Link
              href="/developers"
              className="group rounded-xl overflow-hidden border bg-white hover:shadow-md transition"
              onClick={() => setOpen(false)}
            >
              <div className="relative h-36">
                <Image
                  src="/dashboard/all-dev.webp"
                  alt="All Developers"
                  fill
                  className="object-cover"
                  sizes="180px"
                />
                {/* Search bubble top-right */}
                <span className="absolute top-2 right-2 grid place-items-center h-8 w-8 rounded-full bg-sky-600 text-white text-xs shadow">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <line x1="16.65" y1="16.65" x2="21" y2="21" />
                  </svg>
                </span>
              </div>
              <div className="px-4 py-3 text-center text-sm font-semibold">
                All Developers
              </div>
            </Link>

            {/* Featured developer cards */}
            {cardsToRender.map(({ cfg, dev }, i) => {
              const href = dev
                ? `/off-plan?developer=${encodeURIComponent(dev.id)}`
                : '#';
              const bg = cfg?.img || fallbackImg;
              const labelText = dev?.name || cfg?.label || 'Developer';

              return (
                <Link
                  key={dev?.id ?? `featured-${i}`}
                  href={href}
                  className="group rounded-xl overflow-hidden border bg-white hover:shadow-md transition"
                  title={labelText}
                  onClick={() => setOpen(false)}
                >
                  <div className="relative h-36">
                    {/* Background / property-style image */}
                    <Image
                      src={bg}
                      alt={labelText}
                      fill
                      className="object-cover"
                      sizes="180px"
                    />

                    {/* Developer logo pinned top-left (no extra box) */}
                    {dev?.logoUrl && (
                      <Image
                        src={dev.logoUrl}
                        alt={`${labelText} logo`}
                        width={88}
                        height={28}
                        className="absolute top-2 left-2 h-7 w-auto object-contain"
                      />
                    )}
                  </div>

                  {/* Name under the card */}
                  <div className="px-4 py-3 text-center text-sm font-semibold">
                    {labelText}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
