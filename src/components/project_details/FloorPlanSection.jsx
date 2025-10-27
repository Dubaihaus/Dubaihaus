// src/components/project_details/PropertyTypesAndPlans.jsx
'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Image from 'next/image';

/* ------------------- helpers (unchanged logic) ------------------- */
const norm = (s) => (s ?? '').toString().trim();
const isImg = (u = '') => /\.(png|jpe?g|webp|gif|bmp|svg)(\?.*)?$/i.test(u);
const isPdf = (u = '') => /\.pdf(\?.*)?$/i.test(u); // kept in case you expand later

const N = (v) => { const x = Number(v); return Number.isFinite(x) ? x : null; };
const fmt = (v) => Number(v).toLocaleString();

const brLabelShort = (b) => (Number(b) === 0 ? 'Studio' : `${Number(b)}-BR`);
const brLabelLong  = (b) => (Number(b) === 0 ? 'Studio' : `${Number(b)}-Bedroom`);

const sizeStrSqft = (min, max) => {
  const lo = N(min), hi = N(max);
  if (lo && hi) return `${fmt(lo)}–${fmt(hi)} sq.ft.`;
  if (lo) return `${fmt(lo)} sq.ft.`;
  if (hi) return `${fmt(hi)} sq.ft.`;
  return 'Upon Request';
};
const sizeStrM2 = (min, max) => {
  const lo = N(min), hi = N(max);
  if (lo && hi) return `${fmt(lo)}–${fmt(hi)} m²`;
  if (lo) return `${fmt(lo)} m²`;
  if (hi) return `${fmt(hi)} m²`;
  return null;
};
const priceStrAED = (min, max) => {
  const lo = N(min), hi = N(max);
  if (lo && hi) return `AED ${fmt(lo)} – ${fmt(hi)}`;
  if (lo) return `AED ${fmt(lo)}`;
  if (hi) return `AED ${fmt(hi)}`;
  return 'Upon Request';
};

/** Normalize API into flat entries (unchanged) */
function extractEntries(property) {
  const unitBlocks = Array.isArray(property?.rawData?.unit_blocks)
    ? property.rawData.unit_blocks
    : null;

  if (unitBlocks && unitBlocks.length) {
    return unitBlocks.map((b, i) => {
      const files = (Array.isArray(b.floor_plans) ? b.floor_plans : [])
        .map((fp) => fp?.file)
        .filter(Boolean);
      const layoutImgs = (Array.isArray(b.layouts) ? b.layouts : [])
        .map((x) => x?.image?.url)
        .filter(Boolean);
      return {
        key: `ub-${i}`,
        unitType: b?.unit_type || b?.type || (property?.rawData?.property_type || 'Residence'),
        bedrooms: N(b?.bedrooms),
        name: b?.name || brLabelLong(b?.bedrooms),
        fromSizeSqft: N(b?.size_from_sqft ?? b?.sizeFromSqft),
        toSizeSqft:   N(b?.size_to_sqft   ?? b?.sizeToSqft),
        fromSizeM2:   N(b?.size_from_m2   ?? b?.sizeFromM2),
        toSizeM2:     N(b?.size_to_m2     ?? b?.sizeToM2),
        fromPrice:    N(b?.price_from_aed ?? b?.units_price_from_aed),
        toPrice:      N(b?.price_to_aed   ?? b?.units_price_to_aed),
        media: [...files, ...layoutImgs].filter(Boolean),
      };
    });
  }

  // Fallback: typical_units (DaVinci case)
  const tus = Array.isArray(property?.rawData?.typical_units)
    ? property.rawData.typical_units
    : Array.isArray(property?.typical_units)
    ? property.typical_units
    : [];

  return tus.map((t, i) => {
    const layoutImgs = (Array.isArray(t.layout) ? t.layout : [])
      .map((x) => x?.image?.url)
      .filter(Boolean);
    return {
      key: `tu-${i}`,
      unitType: property?.rawData?.property_type || 'Apartment',
      bedrooms: N(t?.bedrooms),
      name: brLabelLong(t?.bedrooms),
      fromSizeSqft: N(t?.from_size_sqft),
      toSizeSqft:   N(t?.to_size_sqft),
      fromSizeM2:   N(t?.from_size_m2),
      toSizeM2:     N(t?.to_size_m2),
      fromPrice:    N(t?.from_price_aed),
      toPrice:      N(t?.to_price_aed),
      media: layoutImgs, // images only
    };
  });
}

/** Summary using ALL entries (unchanged logic) */
function buildSummary(title, entries, fallbackType = 'residences') {
  const total = entries.length;
  const typeGuess  = norm(entries[0]?.unitType) || fallbackType;
  const typePlural = /s$/i.test(typeGuess) ? typeGuess : `${typeGuess}s`;

  const byBr = new Map();
  for (const e of entries) {
    const k = Number.isFinite(e.bedrooms) ? e.bedrooms : e.name || 'Unit';
    if (!byBr.has(k)) {
      byBr.set(k, {
        label: brLabelLong(Number.isFinite(e.bedrooms) ? e.bedrooms : k),
        minSqft: Number.POSITIVE_INFINITY,
        maxSqft: 0,
      });
    }
    const g = byBr.get(k);
    if (N(e.fromSizeSqft)) g.minSqft = Math.min(g.minSqft, e.fromSizeSqft);
    if (N(e.toSizeSqft))   g.maxSqft = Math.max(g.maxSqft, e.toSizeSqft || e.fromSizeSqft || 0);
  }

  const parts = [];
  for (const [, g] of byBr) {
    const has = Number.isFinite(g.minSqft) && g.maxSqft > 0;
    parts.push(`${g.label} (${has ? `${fmt(Math.round(g.minSqft))}–${fmt(Math.round(g.maxSqft))} sq.ft.` : 'size on request'})`);
  }

  return `${title} features ${total} ${typePlural.toLowerCase()} — ${parts.join(', ')}.`;
}

/* ------------------- Row reveal helper ------------------- */
// Each row fades/slides when it enters viewport (with slight stagger).
function useRevealOnScroll(delayMs = 0) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            // Stagger with delay per row
            setTimeout(() => setVisible(true), delayMs);
            obs.disconnect();
          }
        });
      },
      { root: null, threshold: 0.12 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [delayMs]);

  return { ref, visible };
}

/* ------------------- Component ------------------- */
export default function PropertyTypesAndPlans({ property }) {
  const title =
    property?.title || property?.rawData?.name || property?.name || 'Project';

  const allEntries = useMemo(() => extractEntries(property), [property]);

  // Summary counts ALL entries (with or without plans)
  const summary = useMemo(
    () => buildSummary(title, allEntries, property?.rawData?.property_type || 'residences'),
    [title, allEntries, property?.rawData?.property_type]
  );

  // Group rows by bedroom, but ONLY include groups having at least one media item
  const groups = useMemo(() => {
    const by = new Map();
    for (const e of allEntries) {
      const label = brLabelLong(e.bedrooms);
      if (!by.has(label)) by.set(label, []);
      by.get(label).push(e);
    }

    const result = [];
    for (const [label, arr] of by.entries()) {
      const withMedia = arr.filter((x) => Array.isArray(x.media) && x.media.some(isImg));
      if (!withMedia.length) continue;

      const minSqft  = Math.min(...withMedia.map((x) => N(x.fromSizeSqft) || Infinity));
      const maxSqft  = Math.max(...withMedia.map((x) => N(x.toSizeSqft) || N(x.fromSizeSqft) || 0));
      const minM2    = Math.min(...withMedia.map((x) => N(x.fromSizeM2) || Infinity));
      const maxM2    = Math.max(...withMedia.map((x) => N(x.toSizeM2) || N(x.fromSizeM2) || 0));
      const minPrice = Math.min(...withMedia.map((x) => N(x.fromPrice) || Infinity));
      const maxPrice = Math.max(...withMedia.map((x) => N(x.toPrice) || N(x.fromPrice) || 0));

      result.push({
        label,
        bedroom: Number(arr[0]?.bedrooms),
        variants: withMedia,
        sizeSqftText: sizeStrSqft(Number.isFinite(minSqft) ? minSqft : null, maxSqft > 0 ? maxSqft : null),
        priceText:    priceStrAED(Number.isFinite(minPrice) ? minPrice : null, maxPrice > 0 ? maxPrice : null),
        sizeM2Min:    Number.isFinite(minM2) ? minM2 : null,
        sizeM2Max:    maxM2 > 0 ? maxM2 : null,
      });
    }

    result.sort((a, b) => {
      const A = Number.isFinite(a.bedroom) ? a.bedroom : 9999;
      const B = Number.isFinite(b.bedroom) ? b.bedroom : 9999;
      return A - B;
    });

    return result;
  }, [allEntries]);

  const brochureHref =
    property?.rawData?.brochure_url ||
    property?.rawData?.marketing_brochure ||
    property?.marketing_brochure ||
    null;

  const [openIdx, setOpenIdx] = useState(null);
  const [slideIdx, setSlideIdx] = useState({}); // { rowIndex: slideIndex }

  useEffect(() => {
    setOpenIdx(null);
    setSlideIdx({});
  }, [title]);

  /* ------------------- Layout ------------------- */
  // Match header vibe: same container and airy background
  return (
    <section className="bg-white/80 py-12 md:py-14">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Heading + CTA */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Property Types
          </h2>
          {brochureHref && (
            <a
              href={brochureHref}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-lg border border-sky-600 text-sky-700 text-sm font-semibold hover:bg-sky-50 transition"
            >
              Download brochure
            </a>
          )}
        </div>

        {/* Summary (ALL entries) */}
        <p className="text-slate-700 mb-8">{summary}</p>

        {/* Table header */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_56px] items-center px-6 py-3
                        bg-slate-50 border border-slate-200 rounded-t-2xl text-sm font-semibold text-slate-700">
          <div>Property Type</div>
          <div>Living area</div>
          <div>Price</div>
          <div></div>
        </div>

        {/* Rows */}
        <div className="border border-slate-200 border-t-0 rounded-b-2xl divide-y overflow-hidden shadow-[0_6px_22px_rgba(17,24,39,0.05)]">
          {groups.map((g, idx) => (
            <AnimatedRow
              key={`row-${idx}`}
              idx={idx}
              group={g}
              openIdx={openIdx}
              setOpenIdx={setOpenIdx}
              slideIdx={slideIdx}
              setSlideIdx={setSlideIdx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------- Animated Row ------------------- */
function AnimatedRow({ idx, group: g, openIdx, setOpenIdx, slideIdx, setSlideIdx }) {
  const open = openIdx === idx;
  const i = slideIdx[idx] ?? 0;
  const v = g.variants[i] || g.variants[0];

  const imgs = Array.isArray(v.media) ? v.media.filter(isImg) : [];
  const firstImg = imgs[0] || null;

  const thisSizeSqft = sizeStrSqft(v.fromSizeSqft, v.toSizeSqft);
  const thisSizeM2   = sizeStrM2(v.fromSizeM2, v.toSizeM2);
  const thisPrice    = priceStrAED(v.fromPrice, v.toPrice);

  // Reveal on scroll with stagger ~80ms per row
  const { ref, visible } = useRevealOnScroll(Math.min(idx * 80, 600));

  return (
    <div
      ref={ref}
      className={`bg-white transition-all duration-700 ease-out
                  ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
    >
      {/* collapsed row */}
      <button
        className={`w-full grid md:grid-cols-[2fr_1fr_1fr_56px] grid-cols-1 gap-3 items-center px-6 py-4 
                    text-left hover:bg-slate-50 transition
                    ${open ? 'bg-slate-50/70' : ''}`}
        onClick={() => {
          setOpenIdx(open ? null : idx);
          setSlideIdx((s) => ({ ...s, [idx]: 0 }));
        }}
        aria-expanded={open}
        aria-controls={`row-panel-${idx}`}
      >
        <div className="text-sm md:text-base font-medium text-slate-900">
          <span className="block md:inline">{g.label}</span>
          <span className="md:hidden block text-slate-500">{g.sizeSqftText}</span>
        </div>
        <div className="hidden md:block text-slate-600">{g.sizeSqftText}</div>
        <div className="hidden md:block text-slate-600">{g.priceText}</div>
        <div className="hidden md:flex items-center justify-center">
          <span
            className={`inline-flex w-7 h-7 items-center justify-center rounded-full border border-slate-300 text-slate-600
                        transition-transform ${open ? 'rotate-45' : ''}`}
          >
            +
          </span>
        </div>
      </button>

      {/* expanded content */}
      {open && (
        <div id={`row-panel-${idx}`} className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: image + mini carousel */}
            <div>
              {firstImg ? (
                <div className="relative w-full h-[340px] rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                  <Image
                    src={firstImg}
                    alt={`${g.label} floor plan variant ${i + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="text-sm text-slate-500">No image preview available.</div>
              )}

              {imgs.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {imgs.map((u, j) => (
                    <button
                      key={`thumb-${idx}-${j}`}
                      onClick={() => setSlideIdx((s) => ({ ...s, [idx]: j }))}
                      className={`relative w-[110px] h-[80px] border rounded-lg overflow-hidden bg-white
                                  transition shadow-sm hover:shadow-md
                                  ${i === j ? 'ring-2 ring-sky-500 border-transparent' : 'border-slate-200'}`}
                      aria-label={`Variant ${j + 1}`}
                    >
                      <Image src={u} alt={`thumb ${j + 1}`} fill className="object-contain" />
                    </button>
                  ))}
                </div>
              )}

              {/* prev/next for variants */}
              {g.variants.length > 1 && (
                <div className="flex items-center gap-2 mt-3">
                  <button
                    className="px-3 py-1.5 rounded-md text-sm border border-slate-300 hover:bg-slate-50"
                    onClick={() =>
                      setSlideIdx((s) => ({
                        ...s,
                        [idx]: (i - 1 + g.variants.length) % g.variants.length,
                      }))
                    }
                  >
                    ‹ Prev
                  </button>
                  <div className="text-sm text-slate-600">
                    Variant {i + 1} of {g.variants.length}
                  </div>
                  <button
                    className="px-3 py-1.5 rounded-md text-sm border border-slate-300 hover:bg-slate-50"
                    onClick={() =>
                      setSlideIdx((s) => ({
                        ...s,
                        [idx]: (i + 1) % g.variants.length,
                      }))
                    }
                  >
                    Next ›
                  </button>
                </div>
              )}
            </div>

            {/* Right: variant-specific info */}
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{g.label}</h3>
                <div className="mt-1 text-sm text-slate-600 space-y-1">
                  <div>
                    <span className="font-medium">Living area: </span>
                    {thisSizeSqft}
                    {thisSizeM2 ? ` (${thisSizeM2})` : ''}
                  </div>
                  <div>
                    <span className="font-medium">Price: </span>
                    {thisPrice}
                  </div>
                </div>
              </div>

              {/* list all variant facts for quick scan */}
              {g.variants.length > 1 && (
                <div className="text-xs text-slate-600">
                  <div className="font-semibold mb-1">All {g.label} variants:</div>
                  <ul className="space-y-1 list-disc ml-5">
                    {g.variants.map((vv, k) => (
                      <li key={`li-${idx}-${k}`}>
                        {sizeStrSqft(vv.fromSizeSqft, vv.toSizeSqft)}
                        {vv.fromPrice || vv.toPrice
                          ? ` • ${priceStrAED(vv.fromPrice, vv.toPrice)}`
                          : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
