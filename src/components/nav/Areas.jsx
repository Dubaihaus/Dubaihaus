// src/components/nav/Areas.jsx
'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';

const FEATURED_ORDER = [
  'Palm Jebel Ali',
  'Dubai Creek',
  'Dubai Hills Estate',
  'Downtown Dubai',
];

const DISTRICT_IMAGES = {
  'Palm Jebel Ali': '/dashboard/Palm-Jebel-Ali.webp',
  DIFC: '/dashboard/difc.jpg',
  'Dubai Creek': '/dashboard/creek.jpg',
  'Dubai Creek Harbour': '/dashboard/creek.jpg',
  'Dubai Hills Estate': '/dashboard/hills.jpg',
  'Downtown Dubai': '/dashboard/downtown.webp',
  'Dubai Marina': '/dashboard/marina.jpg',
  'Jumeirah Village Circle': '/dashboard/jvc.jpg',
  'Business Bay': '/dashboard/business-bay.jpg',
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

function toStableId(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 80);
}

function getCoverUrlFromProject(p) {
  if (!p) return null;
  return (
    p?.coverPhoto ||
    (typeof p?.coverImage === 'string' ? p.coverImage : null) ||
    p?.cover_image?.url ||
    p?.rawData?.cover_image?.url ||
    null
  );
}

export default function AreasMegaMenu({
  label = 'Areas',
  hrefPrefix = '', // pass `/${locale}` from Navbar (you already do)
}) {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [imgByDistrict, setImgByDistrict] = useState({});
  const [loadingImages, setLoadingImages] = useState(false);

  const btnRef = useRef(null);
  const panelRef = useRef(null);
  const timer = useRef(null);

  const [mounted, setMounted] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });

  useEffect(() => setMounted(true), []);

  // Close menu on route change (prevents "stuck open" issues)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const openNow = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  }, []);

  const closeSoon = useCallback(() => {
    timer.current = setTimeout(() => setOpen(false), 120);
  }, []);

  // ---- POSITIONING (Portal-safe) ----
  const updatePosition = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    // center the panel on the button
    const left = rect.left + rect.width / 2;
    const top = rect.bottom + 12;

    setPanelPos({ top, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();

    const onResize = () => updatePosition();
    const onScroll = () => updatePosition();

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open, updatePosition]);

  // Close on ESC / outside click (works with Portal)
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);

    const onClick = (e) => {
      const btn = btnRef.current;
      const panel = panelRef.current;
      if (!btn || !panel) return;

      const target = e.target;
      if (!btn.contains(target) && !panel.contains(target)) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  // ---- Fetch districts from DB-backed endpoint (preferred) ----
  useEffect(() => {
    if (!open || districts.length) return;

    let cancelled = false;
    setLoadingDistricts(true);

    (async () => {
      try {
        // ✅ NEW endpoint (cached DB) – add file below
        const res = await fetch('/api/off-plan/districts?region=Dubai&limit=60', {
          cache: 'no-store',
        });

        if (res.ok) {
          const j = await res.json();
          const rows = Array.isArray(j?.districts) ? j.districts : Array.isArray(j) ? j : [];
          const normalized = rows
            .map((d) => ({
              id: d.id || toStableId(d.name),
              name: d.name || '',
              count: typeof d.count === 'number' ? d.count : undefined,
            }))
            .filter((d) => d.name);

          if (!cancelled) setDistricts(normalized);
          return;
        }

        // fallback to your old endpoint if new one not present
        const fallback = await fetch('/api/districts?name=Dubai', { cache: 'no-store' });
        if (!fallback.ok) throw new Error('Failed to fetch districts (fallback)');

        const fj = await fallback.json();
        const normalized = (Array.isArray(fj) ? fj : [])
          .map((d) => ({ id: d.id || toStableId(d.name), name: d.name || '' }))
          .filter((d) => d.name);

        if (!cancelled) setDistricts(normalized);
      } catch (err) {
        console.error('Error fetching districts:', err);
        if (!cancelled) setDistricts([]);
      } finally {
        if (!cancelled) setLoadingDistricts(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, districts.length]);

  // ---- Build prioritized list (featured first), then fill. Show only 5 ----
  const cards = useMemo(() => {
    const all = (districts || []).map((d) => ({
      id: d.id,
      name: d.name || '',
      count: d.count,
    }));

    const used = new Set();
    const featured = FEATURED_ORDER.map((name) => {
      const found = all.find(
        (d) =>
          d.name.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(d.name.toLowerCase())
      );
      if (found) {
        used.add(found.id);
        return found;
      }
      return { id: `placeholder-${toStableId(name)}`, name, placeholder: true };
    }).filter(Boolean);

    const rest = all.filter((d) => !used.has(d.id));
    return [...featured, ...rest].slice(0, 5);
  }, [districts]);

  // ---- Fetch a sample project cover for each real district in our 5 cards ----
  useEffect(() => {
    const realCards = cards.filter((c) => !c.placeholder && c.name);
    if (!open || !realCards.length) return;

    let cancelled = false;
    setLoadingImages(true);

    (async () => {
      try {
        const entries = await Promise.all(
          realCards.map(async (card) => {
            const id = card.id;
            const name = card.name;

            const strategies = [
              // ✅ best: fuzzy DB search across city/area/district/locationString/title with region constraint
              async () => {
                const qs = new URLSearchParams({
                  page: '1',
                  pageSize: '1',
                  region: 'Dubai',
                  search_query: name,
                });
                const res = await fetch(`/api/off-plan?${qs.toString()}`, { cache: 'no-store' });
                if (!res.ok) throw new Error('API error');
                return res.json();
              },
              // ✅ also good: area param (your DB code checks area OR district contains)
              async () => {
                const qs = new URLSearchParams({
                  page: '1',
                  pageSize: '1',
                  region: 'Dubai',
                  area: name,
                });
                const res = await fetch(`/api/off-plan?${qs.toString()}`, { cache: 'no-store' });
                if (!res.ok) throw new Error('API error');
                return res.json();
              },
              // last resort: no region
              async () => {
                const qs = new URLSearchParams({
                  page: '1',
                  pageSize: '1',
                  search_query: name,
                });
                const res = await fetch(`/api/off-plan?${qs.toString()}`, { cache: 'no-store' });
                if (!res.ok) throw new Error('API error');
                return res.json();
              },
            ];

            for (const strategy of strategies) {
              try {
                const data = await strategy();
                const first = data?.results?.[0];
                const url = getCoverUrlFromProject(first);
                if (url) return [id, url];
              } catch {
                // try next strategy
              }
            }
            return [id, null];
          })
        );

        if (!cancelled) {
          const map = Object.fromEntries(entries);
          setImgByDistrict((prev) => ({ ...prev, ...map }));
        }
      } catch (error) {
        console.error('Error in image fetching batch:', error);
      } finally {
        if (!cancelled) setLoadingImages(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, cards]);

  const localePath = (path) => {
    if (!hrefPrefix) return path;
    // ensure no double slashes
    const base = hrefPrefix.endsWith('/') ? hrefPrefix.slice(0, -1) : hrefPrefix;
    return `${base}${path.startsWith('/') ? path : `/${path}`}`;
  };

  const panel = (
    <div
      ref={panelRef}
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
      className="rounded-2xl border bg-white shadow-2xl p-5"
      style={{
        position: 'fixed',
        top: panelPos.top,
        left: panelPos.left,
        transform: 'translateX(-50%)',
        width: '980px',
        maxWidth: '95vw',
        zIndex: 9999, // ✅ above everything
      }}
    >
      <div className="flex items-center justify-between px-1 pb-3">
        <div className="text-sm font-semibold text-slate-800">
          Popular Areas (UAE)
        </div>
        {(loadingDistricts || loadingImages) && (
          <div className="text-xs text-slate-500">Loading…</div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* All Areas → /areas */}
        <Link
          href={localePath('/areas')}
          className="group rounded-xl overflow-hidden border bg-white hover:shadow-md transition"
          onClick={() => setOpen(false)}
        >
          <div className="relative h-28">
            <ImgWithFallback
              src="/dashboard/dubai-hills.jpg"
              alt="All Areas"
              sizes="180px"
              className="object-cover"
            />
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
          <div className="px-3 py-3 text-center text-sm font-semibold">
            All Areas
          </div>
        </Link>

        {/* Area cards (5 max) */}
        {cards.map((d) => {
          // ✅ Keep same URL style you already use across the site
          const href = localePath(`/off-plan?area=${encodeURIComponent(d.name)}`);

          const dynamic = !d.placeholder && imgByDistrict[d.id];
          const staticImg = DISTRICT_IMAGES[d.name];
          const src = dynamic || staticImg || null;

          return (
            <Link
              key={d.id}
              href={href}
              className="group rounded-xl overflow-hidden border bg-white hover:shadow-md transition"
              title={d.name}
              onClick={() => setOpen(false)}
            >
              <div className="relative h-28">
                <ImgWithFallback
                  src={src}
                  alt={d.name}
                  sizes="160px"
                  className="object-cover"
                />
              </div>
              <div className="px-3 py-3 text-center text-sm font-semibold line-clamp-2">
                {d.name}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <button
        ref={btnRef}
        type="button"
        className="text-sm font-medium text-slate-700 hover:text-sky-700 transition-colors py-2"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
      </button>

      {/* ✅ Portal dropdown so it never gets clipped on other pages */}
      {open && mounted && createPortal(panel, document.body)}
    </div>
  );
}
