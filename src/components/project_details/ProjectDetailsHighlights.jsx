// src/components/project_details/ProjectDetailsHighlights.jsx
'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

/* ---------------- utils (unchanged) ---------------- */

function normalizeText(text) {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/\u00A0/g, ' ') // replace NBSP with normal space
    .replace(/[ \t]+/g, ' ') // collapse multiple spaces and tabs
    .replace(/\n{3,}/g, '\n\n') // collapse >2 newlines into 2
    .trim();
}

function formatAED(n) {
  if (n == null || n === '') return null;
  const num = Number(n);
  if (!Number.isFinite(num)) return null;

  if (num >= 1_000_000_000) {
    const billions = num / 1_000_000_000;
    return `AED ${billions % 1 === 0 ? billions : billions.toFixed(1)}B`;
  } else if (num >= 1_000_000) {
    const millions = num / 1_000_000;
    return `AED ${millions % 1 === 0 ? millions : millions.toFixed(1)}M`;
  } else if (num >= 1_000) {
    const thousands = num / 1_000;
    return `AED ${thousands % 1 === 0 ? thousands : thousands.toFixed(1)}K`;
  }
  return `AED ${num.toLocaleString()}`;
}

function formatLocation(loc) {
  if (!loc) return null;
  const parts = [loc?.sector, loc?.district, loc?.city, loc?.region].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

function titleFromProperty(property) {
  return (
    property?.name ||
    property?.rawData?.name ||
    property?.rawData?.title ||
    property?.rawData?.project_name ||
    'Project'
  );
}

function uniqJoin(arr) {
  return [...new Set(arr.filter(Boolean).map(s => String(s).trim()))].join(', ');
}

function extractProjectGeneralFacts(md) {
  if (!md || typeof md !== 'string') return null;

  const re = /#####\s*Project\s+general\s+facts\b(.*?)(?=#####|\s*$)/is;
  const m = md.match(re);
  if (!m) return null;

  const cleaned = m[1].trim().replace(/^#+\s*/g, '');
  return cleaned || null;
}

/* ---------------- (ALL OTHER LOGIC UNCHANGED) ---------------- */
/* inferPropertyTypes, inferBedroomsSummary, inferAreaRange, */
/* inferHandover, inferPaymentPlan, inferDeveloper, nearbyPoints, */
/* buildAutoDescription */
/* -------------------------------------------------------------- */

function inferPropertyTypes(property, raw, t, selectedFromUrl = []) {
  const types = [];

  if (Array.isArray(property?.propertyTypes) && property.propertyTypes.length) {
    types.push(...property.propertyTypes);
  } else if (property?.propertyType) {
    types.push(property.propertyType);
  }

  if (Array.isArray(raw?.parkings)) {
    for (const p of raw.parkings) {
      if (!p?.unit_type) continue;
      types.push(p.unit_type);
    }
  }

  if (Array.isArray(raw?.buildings)) {
    for (const b of raw.buildings) {
      const text = `${b?.name || ''} ${b?.description || ''}`.toLowerCase();
      if (text.includes('apartment')) types.push('apartment');
      if (text.includes('villa')) types.push('villa');
      if (text.includes('mansion')) types.push('mansion');
      if (text.includes('townhouse') || text.includes('town house')) types.push('townhouse');
      if (text.includes('penthouse')) types.push('penthouse');
      if (text.includes('loft')) types.push('loft');
      if (text.includes('studio')) types.push('studio');
    }
  }

  if (selectedFromUrl && selectedFromUrl.length) {
    types.push(...selectedFromUrl);
  }

  if (!types.length) return null;

  const pretty = types.map((type) => {
    const s = String(type).toLowerCase();
    if (s.includes('mansion')) return t('highlights.propertyTypesFallback.mansions');
    if (s.includes('villa')) return t('highlights.propertyTypesFallback.villas');
    if (s.includes('townhouse') || s === 'th') return t('highlights.propertyTypesFallback.townhouses');
    if (s.includes('penthouse')) return t('highlights.propertyTypesFallback.penthouses');
    if (s.includes('studio')) return t('highlights.propertyTypesFallback.studios');
    if (s.includes('apartment')) return t('highlights.propertyTypesFallback.apartments');
    if (s.includes('loft')) return t('highlights.propertyTypesFallback.lofts');
    return type.charAt(0).toUpperCase() + type.slice(1);
  });

  return uniqJoin(pretty) || null;
}

function inferBedroomsSummary(p) {
  const bedCounts = new Set();

  (p?.typical_units || []).forEach(t => {
    const b = Number(t?.bedrooms);
    if (Number.isFinite(b)) bedCounts.add(b);
  });

  if (!bedCounts.size) return null;

  const sorted = [...bedCounts].sort((a, b) => a - b);
  if (sorted.length === 1) return `${sorted[0]} BR`;
  return `${sorted[0]}–${sorted[sorted.length - 1]} BR`;
}

function inferAreaRange(p, t) {
  const areas = [];
  const pushNum = v => {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) areas.push(n);
  };

  (p?.typical_units || []).forEach(t => pushNum(t?.area_sqft));

  if (!areas.length) return null;
  const min = Math.min(...areas);
  const max = Math.max(...areas);
  const fmt = n => Math.round(n).toLocaleString();
  const unit = t('propertyTypes.measurement.sqft');
  return min === max ? `${fmt(min)} ${unit}` : `${fmt(min)} – ${fmt(max)} ${unit}`;
}

function inferHandover(p) {
  return p?.completion_date || p?.handover || null;
}

function inferPaymentPlan(p) {
  return p?.payment_plan || null;
}

function inferDeveloper(p) {
  return p?.developer?.name || p?.developer_name || p?.developer || null;
}

function nearbyPoints(p) {
  const points = Array.isArray(p?.project_map_points) ? p.project_map_points : [];
  return points
    .map(pt => pt?.map_point_name)
    .filter(Boolean)
    .slice(0, 8);
}

function buildAutoDescription({
  title,
  location,
  developer,
  handover,
  startingPrice,
  t
}) {
  const bits = [];

  const ctx = { title, location: location || 'Dubai', developer };

  const sentence1 = developer
    ? t('highlights.autoDescription.isA', ctx)
    : t('highlights.autoDescription.isModern', ctx);

  bits.push(sentence1);

  if (startingPrice) bits.push(t('highlights.autoDescription.homesStart', { price: startingPrice }));
  if (handover) bits.push(t('highlights.autoDescription.handoverExpected', { date: handover }));

  return bits.join(' ');
}

/* ---------------- component ---------------- */

export default function ProjectDetailsHighlights({ property }) {
  const t = useTranslations('projectDetails');
  const locale = useLocale();
  const p = property?.rawData ?? property ?? {};
  const sp = useSearchParams();

  const projectTitle = titleFromProperty(property);
  const location = formatLocation(p?.location);
  const propertyTypes = inferPropertyTypes(property, p, t);
  const startingPrice = formatAED(p?.min_price);
  const handover = inferHandover(p);
  const paymentPlan = inferPaymentPlan(p);
  const areaRange = inferAreaRange(p, t);
  const bedroomsSummary = inferBedroomsSummary(p);
  const developerName = inferDeveloper(p);
  const brochureUrl = p?.marketing_brochure || null;

  const poi = useMemo(() => nearbyPoints(p), [p]);

  const overviewTextRaw =
    p?.description ||
    p?.overview ||
    p?.about ||
    buildAutoDescription({
      title: projectTitle,
      location,
      developer: developerName,
      propertyTypes,
      bedroomsSummary,
      handover,
      startingPrice,
      t
    });

  const overviewTextRawExtracted = extractProjectGeneralFacts(overviewTextRaw) || overviewTextRaw;
  const overviewText = normalizeText(overviewTextRawExtracted);

  /* ---------------- NEW: SEE MORE LOGIC ---------------- */

  const PREVIEW_LIMIT = 870;
  const [expanded, setExpanded] = useState(false);

  const previewText = useMemo(() => {
    if (!overviewText) return '';
    if (overviewText.length <= PREVIEW_LIMIT) return overviewText;

    const cut = overviewText.slice(0, PREVIEW_LIMIT);
    const lastSpace = cut.lastIndexOf(' ');
    return cut.slice(0, lastSpace > 100 ? lastSpace : PREVIEW_LIMIT) + '…';
  }, [overviewText]);

  const showToggle = overviewText && overviewText.length > PREVIEW_LIMIT;

  /* ----------------------------------------------------- */

  const details = [
    [t('highlights.startingPrice'), startingPrice],
    [t('highlights.handover'), handover],
    [t('highlights.paymentPlan'), paymentPlan],
    [t('highlights.area'), areaRange],
    [t('highlights.propertyType'), propertyTypes],
    [t('highlights.bedrooms'), bedroomsSummary],
    [t('highlights.developer'), developerName],
    [t('highlights.location'), location],
  ].filter(([, value]) => Boolean(value));

  return (
    <section className="bg-[#f6f8fb] py-10 md:py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 lg:[grid-template-columns:minmax(0,1fr)_460px] gap-12 lg:gap-20 xl:gap-24">

          {/* LEFT */}
          <div className="lg:pr-9">
            <p className="text-sm font-semibold text-slate-600 mb-3">
              {t('highlights.aboutTitle')}
            </p>

            <h2 className="text-[30px] leading-[1.15] md:text-5xl md:leading-[1.15] font-extrabold tracking-tight text-slate-900 mb-6">
              {t('highlights.overviewOf', { title: projectTitle })}
            </h2>

            {overviewText && (
              <p
                lang={locale || 'de'}
                className="text-slate-700 text-[16px] leading-7 md:text-[17px] md:leading-8 mb-7 md:mb-8 text-left md:text-justify hyphens-auto break-words"
                style={{ overflowWrap: 'anywhere' }}
              >
                {expanded ? overviewText : previewText}

                {showToggle && (
                  <button
                    type="button"
                    onClick={() => setExpanded(v => !v)}
                    className="ml-2 text-sm font-semibold text-sky-600 hover:text-sky-700 underline underline-offset-2"
                  >
                    {expanded ? t('highlights.seeLess') : t('highlights.seeMore')}
                  </button>
                )}
              </p>
            )}

            {poi.length > 0 && (
              <>
                <div className="text-slate-900 font-semibold mb-3">
                  {t('highlights.nearbyTitle')}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 md:gap-x-12">
                  {poi.map((line, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[15px] text-slate-800">
                      <span className="mt-[9px] h-[6px] w-[6px] rounded-full shrink-0 bg-emerald-500" />
                      <span className="leading-6">{line}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* RIGHT */}
          <aside className="mt-0 lg:mt-32 lg:sticky lg:top-24">
            <div className="max-w-[460px] w-full ml-auto rounded-2xl bg-slate-50 border border-slate-200 shadow-[0_8px_24px_rgba(17,24,39,0.06)] p-6 md:p-7">
              <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-3.5">
                {t('highlights.title')}
              </h3>

              <dl className="divide-y divide-slate-200">
                {details.map(([label, value]) => (
                  <div key={label} className="py-2.5 grid grid-cols-[1fr_auto] gap-6 items-center">
                    <dt className="text-slate-600 text-[14px]">{label}</dt>
                    <dd className="text-right font-semibold text-slate-900 text-[14px]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              {brochureUrl && (
                <a
                  href={brochureUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-brand-sky hover:bg-sky-500 text-white font-semibold py-3 transition-colors"
                >
                  {t('highlights.downloadBrochure')}
                </a>
              )}
            </div>
          </aside>

        </div>
      </div>
    </section>
  );
}
