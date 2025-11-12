// src/components/project_details/ProjectDetailsHighlights.jsx
'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

/* ---------------- utils (updated) ---------------- */

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

/** Join unique strings */
function uniqJoin(arr) {
  return [...new Set(arr.filter(Boolean).map(s => String(s).trim()))].join(', ');
}

/** Extract only "##### Project general facts" section from a markdown-ish blob */
function extractProjectGeneralFacts(md) {
  if (!md || typeof md !== 'string') return null;
  // Match the section header and grab everything until the next "##### ..." or end.
  // Case-insensitive, dotall to span newlines. Handles content placed on same line
  // as the header as in the provided example.
  const re = /#####\s*Project\s+general\s+facts\b(.*?)(?=#####|\s*$)/is;
  const m = md.match(re);
  if (!m) return null;

  // Clean up leading/trailing whitespace and stray hashes if any snuck in.
  const cleaned = m[1].trim().replace(/^#+\s*/g, '');
  return cleaned || null;
}

/**
 * Property Types (unchanged)
 */
function inferPropertyTypes(property, raw, selectedFromUrl = []) {
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

  const pretty = types.map((t) => {
    const s = String(t).toLowerCase();
    if (s.includes('mansion')) return 'Mansions';
    if (s.includes('villa')) return 'Villas';
    if (s.includes('townhouse') || s === 'th') return 'Townhouses';
    if (s.includes('penthouse')) return 'Penthouses';
    if (s.includes('studio')) return 'Studios';
    if (s.includes('apartment')) return 'Apartments';
    if (s.includes('loft')) return 'Lofts';
    return t.charAt(0).toUpperCase() + t.slice(1);
  });

  return uniqJoin(pretty) || null;
}

/** Bedrooms summary like "Studio, 1–2 BR" */
function inferBedroomsSummary(p) {
  const bedCounts = new Set();

  (p?.typical_units || []).forEach(t => {
    const b = Number(t?.bedrooms);
    if (Number.isFinite(b)) bedCounts.add(b);
  });

  (p?.unit_blocks || []).forEach(b => {
    const name = b?.name || b?.unit_type || '';
    const m = String(name).match(/(\d+)\s*-\s*bed|(\d+)\s*bedroom|^(\d+)br?/i);
    const val = Number(m?.[1] || m?.[2] || m?.[3]);
    if (Number.isFinite(val)) bedCounts.add(val);
    if (/studio/i.test(name)) bedCounts.add(0);
  });

  if (!bedCounts.size) return null;

  const sorted = [...bedCounts].sort((a, b) => a - b);
  const hasStudio = sorted.includes(0);
  const nums = sorted.filter(n => n > 0);

  if (hasStudio && nums.length === 0) return 'Studio';
  if (hasStudio && nums.length === 1) return `Studio, ${nums[0]} BR`;
  if (hasStudio && nums.length > 1) return `Studio, ${nums[0]}–${nums[nums.length - 1]} BR`;
  if (!hasStudio && nums.length === 1) return `${nums[0]} BR`;
  return `${nums[0]}–${nums[nums.length - 1]} BR`;
}

/** Area range like "302 – 1,409 sq.ft" */
function inferAreaRange(p) {
  const areas = [];
  const pushNum = v => {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) areas.push(n);
  };

  (p?.typical_units || []).forEach(t => {
    pushNum(t?.area_sqft);
    pushNum(t?.size_sqft);
    pushNum(t?.from_area_sqft);
    pushNum(t?.to_area_sqft);
    pushNum(t?.from_size_sqft);
    pushNum(t?.to_size_sqft);
    const sqmVals = [t?.area_sqm, t?.size_sqm, t?.from_area_sqm, t?.to_area_sqm].filter(Number.isFinite);
    sqmVals.forEach(sqm => pushNum(sqm * 10.7639));
  });

  (p?.unit_blocks || []).forEach(b => {
    pushNum(b?.area_from_sqft);
    pushNum(b?.area_to_sqft);
    pushNum(b?.size_from_sqft);
    pushNum(b?.size_to_sqft);
  });

  if (!areas.length) return null;
  const min = Math.min(...areas);
  const max = Math.max(...areas);
  const fmt = n => Math.round(n).toLocaleString();
  return min === max ? `${fmt(min)} sq.ft` : `${fmt(min)} – ${fmt(max)} sq.ft`;
}

/** Handover like "Q2 2026" */
function inferHandover(p) {
  if (p?.completion_date) return p.completion_date;
  if (p?.handover) return p.handover;
  const q = p?.handover_quarter || p?.completion_quarter;
  const y = p?.handover_year || p?.completion_year;
  if (q && y) return `${q} ${y}`;
  if (p?.completion_year) return String(p.completion_year);
  return null;
}

/** Payment plan like "60% on handover" */
function inferPaymentPlan(p) {
  if (typeof p?.payment_plan === 'string' && p.payment_plan.trim()) return p.payment_plan.trim();
  const plans = Array.isArray(p?.payment_plans) ? p.payment_plans : [];
  if (!plans.length) return null;

  const handover = plans.find(pl => /handover/i.test(pl?.name || pl?.title || ''));
  const pct = v => {
    const n = Number(v);
    return Number.isFinite(n) ? `${n}%` : null;
  };
  if (handover) {
    const v = pct(handover?.percent || handover?.percentage || handover?.value);
    if (v) return `${v} on handover`;
  }
  const sorted = [...plans].sort(
    (a, b) => (Number(b?.percent || b?.percentage || b?.value) || 0) - (Number(a?.percent || a?.percentage || a?.value) || 0)
  );
  const top = sorted[0];
  const v = pct(top?.percent || top?.percentage || top?.value);
  return v ? v : null;
}

/** Developer name */
function inferDeveloper(p) {
  return p?.developer?.name || p?.developer_name || p?.developer || null;
}

/** Nearby points → strings like "Wynn Resort — 5 min" */
function nearbyPoints(p) {
  const points = Array.isArray(p?.project_map_points) ? p.project_map_points : [];
  const cleaned = points
    .map(pt => {
      const name = pt?.map_point_name || pt?.name || pt?.title;
      const mins = pt?.duration_min || pt?.minutes || pt?.time_min;
      const km = pt?.distance;
      if (!name) return null;
      if (Number.isFinite(mins)) return `${name} — ${mins} min`;
      if (Number.isFinite(km)) return `${name} — ${km} km`;
      return name;
    })
    .filter(Boolean);
  return cleaned.slice(0, 8);
}

/** Build an auto description if API has none */
function buildAutoDescription({
  title, location, developer, propertyTypes, bedroomsSummary, handover, startingPrice,
}) {
  const bits = [];
  const main = [];
  main.push(title);
  if (location) main.push(`in ${location}`);
  const sentence1 =
    developer
      ? `${main.join(' ')} is a development by ${developer}.`
      : `${main.join(' ')} is a modern residential development.`;
  bits.push(sentence1);

  const details = [];
  if (propertyTypes) details.push(propertyTypes.toLowerCase());
  if (bedroomsSummary) details.push(bedroomsSummary.toLowerCase());
  if (details.length) {
    bits.push(
      `It offers ${details.join(' with ')}${handover ? `, with handover expected ${handover}.` : '.'}`
    );
  } else if (handover) {
    bits.push(`Handover is expected ${handover}.`);
  }

  if (startingPrice) bits.push(`Homes start from ${startingPrice}.`);
  return bits.join(' ');
}

/* ---------------- component ---------------- */

export default function ProjectDetailsHighlights({ property }) {
  const p = property?.rawData ?? property ?? {};
  const sp = useSearchParams();
  const selectedFromUrl = (sp.get('unit_types') || sp.get('unit_type') || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const projectTitle = titleFromProperty(property);
  const location = formatLocation(p?.location);
  const propertyTypes = inferPropertyTypes(property, p, selectedFromUrl);
  const startingPrice = formatAED(p?.min_price);
  const handover = inferHandover(p);
  const paymentPlan = inferPaymentPlan(p);
  const areaRange = inferAreaRange(p);
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
    });

  // 🔎 Keep ONLY "##### Project general facts" if present; otherwise keep fallback.
  const overviewText = extractProjectGeneralFacts(overviewTextRaw) || overviewTextRaw;

  const details = [
    ['Starting Price', startingPrice],
    ['Handover', handover],
    ['Payment Plan', paymentPlan],
    ['Area', areaRange],
    ['Property Type', propertyTypes],
    ['Bedrooms', bedroomsSummary],
    ['Developer', developerName],
    ['Location', location],
  ].filter(([, value]) => Boolean(value));

  return (
    <section className="bg-[#f6f8fb] py-10 md:py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 lg:[grid-template-columns:minmax(0,1fr)_460px] gap-12 lg:gap-20 xl:gap-24">
          {/* LEFT */}
          <div className="lg:pr-9">
            <p className="text-sm font-semibold text-slate-600 mb-3">About the Project</p>
            <h2 className="text-[30px] leading-[1.15] md:text-5xl md:leading-[1.15] font-extrabold tracking-tight text-slate-900 mb-6">
              Overview of {projectTitle}
            </h2>

            {overviewText && (
              <p className="text-slate-700 text-[16px] leading-7 md:text-[17px] md:leading-8 mb-7 md:mb-8 text-justify">
                {overviewText}
              </p>
            )}

            {poi.length > 0 && (
              <>
                <div className="text-slate-900 font-semibold mb-3">Nearby locations include:</div>
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
              <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-3.5">Project Details</h3>
              <dl className="divide-y divide-slate-200">
                {details.map(([label, value]) => (
                  <div key={label} className="py-2.5 grid grid-cols-[1fr_auto] gap-6 items-center">
                    <dt className="text-slate-600 text-[14px]">{label}</dt>
                    <dd className="text-right font-semibold text-slate-900 text-[14px]">{value}</dd>
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
                  Download Brochure
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
