// src/components/nav/Areas.jsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const FEATURED_ORDER = [
  'Palm Jebel Ali',
  'DIFC',
  'Dubai Creek',
  'Dubai Hills Estate',
  'Downtown Dubai',
];

// Optional static fallbacks (used only if we can’t fetch a project cover)
const DISTRICT_IMAGES = {
  'Palm Jebel Ali': '/dashboard/palm.jpg',
  DIFC: '/dashboard/difc.jpg',
  'Dubai Creek': '/dashboard/creek.jpg',
  'Dubai Creek Harbour': '/dashboard/creek.jpg',
  'Dubai Hills Estate': '/dashboard/hills.jpg',
  'Downtown Dubai': '/dashboard/downtown.jpg',
};
const FALLBACK_IMG = '/project_detail_images/building.jpg';

function ImgWithFallback({ src, alt, sizes, className }) {
  const [err, setErr] = useState(false);
  const safeSrc = !src || err ? FALLBACK_IMG : src;
  return (
    <Image
      src={safeSrc}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      onError={() => setErr(true)}
    />
  );
}

export default function AreasMegaMenu({ label = 'Areas' }) {
  const [open, setOpen] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [imgByDistrict, setImgByDistrict] = useState({}); // { [id]: url }
  const [loadingImages, setLoadingImages] = useState(false);

  const wrapRef = useRef(null);
  const timer = useRef(null);

  const openNow = () => { if (timer.current) clearTimeout(timer.current); setOpen(true); };
  const closeSoon = () => { timer.current = setTimeout(() => setOpen(false), 120); };

  // Fetch UAE (Dubai) districts when menu first opens
  useEffect(() => {
    if (!open || districts.length) return;
    setLoadingDistricts(true);
    fetch('/api/districts?name=Dubai', { cache: 'no-store' })
      .then(r => r.json())
      .then(j => setDistricts(Array.isArray(j) ? j : []))
      .finally(() => setLoadingDistricts(false));
  }, [open, districts.length]);

  // Close on ESC / outside click
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const onClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  // Build prioritized list (featured first), then fill. Show only 5.
  const cards = useMemo(() => {
    const all = (districts || []).map(d => ({
      id: d.id,
      name: d.name || '',
    }));

    const used = new Set();
    const featured = FEATURED_ORDER.map(name => {
      const found = all.find(d => d.name.toLowerCase().includes(name.toLowerCase()));
      if (found) { used.add(found.id); return found; }
      return { id: `placeholder-${name}`, name, placeholder: true };
    });

    const rest = all.filter(d => !used.has(d.id));
    return [...featured, ...rest].slice(0, 5);
  }, [districts]);

  // Fetch a sample project cover for each real district in our 5 cards
  useEffect(() => {
    const realIds = cards.filter(c => !c.placeholder && c.id).map(c => String(c.id));
    if (!realIds.length) return;

    let cancelled = false;
    setLoadingImages(true);

    (async () => {
      try {
        const entries = await Promise.all(realIds.map(async (id) => {
          const qs = new URLSearchParams({
            page: '1',
            pageSize: '1',
            pricedOnly: 'false',
            districts: id,
          });
          const res = await fetch(`/api/off-plan?${qs.toString()}`, { cache: 'no-store' });
          if (!res.ok) return [id, null];
          const data = await res.json();
          const first = data?.results?.[0];
          const url =
            first?.coverImage ||
            first?.cover_image?.url ||
            first?.rawData?.cover_image?.url ||
            null;
          return [id, url];
        }));

        if (!cancelled) {
          const map = Object.fromEntries(entries);
          setImgByDistrict(prev => ({ ...prev, ...map }));
        }
      } finally {
        if (!cancelled) setLoadingImages(false);
      }
    })();

    return () => { cancelled = true; };
  }, [cards]);

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
        onClick={() => setOpen(v => !v)}
      >
        {label}
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-[980px] max-w-[95vw] rounded-xl border bg-white shadow-2xl p-4">
          <div className="flex items-center justify-between px-1 pb-3">
            <div className="text-sm font-semibold text-slate-800">
              Popular Areas (UAE)
            </div>
            {(loadingDistricts || loadingImages) && (
              <div className="text-xs text-slate-500">Loading…</div>
            )}
          </div>

          {/* All Areas + 5 cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* All Areas → /areas */}
            <Link
              href="/areas"
              className="group rounded-xl overflow-hidden border bg-white hover:shadow-md transition"
            >
              <div className="relative h-28">
                <ImgWithFallback
                  src="/dashboard/land.jpg"
                  alt="All Areas"
                  sizes="180px"
                  className="object-cover"
                />
                <span className="absolute top-2 right-2 grid place-items-center h-8 w-8 rounded-full bg-sky-600 text-white text-xs shadow">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <line x1="16.65" y1="16.65" x2="21" y2="21" />
                  </svg>
                </span>
              </div>
              <div className="px-3 py-3 text-center text-sm font-semibold">
                All Areas
              </div>
            </Link>

            {/* Area cards (5 max) */}
            {cards.map((d) => {
            //   const href = d.placeholder
            //     ? `/off-plan?area=${encodeURIComponent(d.name)}`
            //     : `/off-plan?districts=${encodeURIComponent(String(d.id))}`;
            const href = d.placeholder
  ? `/off-plan?area=${encodeURIComponent(d.name)}`
  : `/off-plan?districts=${encodeURIComponent(String(d.id))}&area=${encodeURIComponent(d.name)}`;

              // Pick dynamic cover (preferred), else configured static, else fallback
              const dynamic = !d.placeholder && imgByDistrict[d.id];
              const staticImg = DISTRICT_IMAGES[d.name];
              const src = dynamic || staticImg || null;

              return (
                <Link
                  key={d.id}
                  href={href}
                  className="group rounded-xl overflow-hidden border bg-white hover:shadow-md transition"
                  title={d.name}
                >
                  <div className="relative h-28">
                    <ImgWithFallback
                      src={src}
                      alt={d.name}
                      sizes="160px"
                      className="object-cover"
                    />
                  </div>
                  <div className="px-3 py-3 text-center text-sm font-semibold">
                    {d.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
