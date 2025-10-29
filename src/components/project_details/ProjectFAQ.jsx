'use client';
import { useMemo, useState } from 'react';

/* ---------- helpers ---------- */
const fmtNum = (v) => Number(v).toLocaleString();
const AED = (v) => (v != null ? `AED ${fmtNum(v)}` : null);

function titleCase(s) {
  return (s || '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function formatLocation(loc) {
  if (!loc) return null;
  const parts = [loc.sector, loc.district, loc.city, loc.region].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

function uniq(arr) {
  return Array.from(new Set(arr.filter(Boolean)));
}

/** From units, build a human sentence like:
 * "Premium 1- and 2-bedroom apartments. 1BR (833–2,098 sq.ft.), 2BR (1,843–2,358 sq.ft.)"
 */
function buildUnitMixSentence(p) {
  const blocks = Array.isArray(p?.unit_blocks) ? p.unit_blocks : [];
  const tus = Array.isArray(p?.typical_units) ? p.typical_units : [];
  const entries =
    blocks.length > 0
      ? blocks.map((b) => ({
          bedrooms: Number.isFinite(Number(b?.bedrooms)) ? Number(b.bedrooms) : null,
          unit_type: b?.unit_type || p?.property_type || 'Residence',
          from_sqft: b?.size_from_sqft ?? b?.sizeFromSqft ?? null,
          to_sqft: b?.size_to_sqft ?? b?.sizeToSqft ?? null,
        }))
      : tus.map((t) => ({
          bedrooms: Number.isFinite(Number(t?.bedrooms)) ? Number(t.bedrooms) : null,
          unit_type: p?.property_type || 'Apartment',
          from_sqft: t?.from_size_sqft ?? null,
          to_sqft: t?.to_size_sqft ?? null,
        }));

  if (!entries.length) return null;

  // group by bedrooms
  const byBr = new Map();
  for (const e of entries) {
    const key = e.bedrooms ?? -1; // -1 = unknown
    if (!byBr.has(key)) {
      byBr.set(key, {
        br: key,
        min: Number.POSITIVE_INFINITY,
        max: 0,
      });
    }
    const g = byBr.get(key);
    const lo = Number(e.from_sqft) || null;
    const hi = Number(e.to_sqft ?? e.from_sqft) || null;
    if (lo) g.min = Math.min(g.min, lo);
    if (hi) g.max = Math.max(g.max, hi);
  }

  // Build readable pieces
  const parts = [];
  const detail = [];
  const brs = [...byBr.values()].sort((a, b) => a.br - b.br);

  const label = (br) => (br <= 0 ? 'Studio' : `${br}-Bedroom`);

  for (const g of brs) {
    // summary list “1- and 2-bedroom”
    if (g.br <= 0) parts.push('Studio');
    else parts.push(`${g.br}-bedroom`);

    // detail with sizes
    const have = Number.isFinite(g.min) && g.max > 0;
    detail.push(
      have
        ? `${label(g.br)} (${fmtNum(Math.round(g.min))}–${fmtNum(Math.round(g.max))} sq.ft.)`
        : `${label(g.br)} (size on request)`
    );
  }

  const unitTypes = uniq(
    entries.map((e) => (e.unit_type || '').toString().trim().toLowerCase())
  ).map((s) => titleCase(s || 'Residence'));
  const typeText = unitTypes.length ? unitTypes.join(' & ') : 'Residences';

  const brText =
    parts.length === 1
      ? parts[0]
      : parts.length === 2
      ? parts.join(' and ')
      : `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;

  return `${typeText} include ${brText}. ${detail.join(', ')}`;
}

function extractPaymentPlan(p) {
  const plans = Array.isArray(p?.payment_plans) ? p.payment_plans : [];
  if (!plans.length) return null;

  const plan = plans[0]; // choose first plan if many
  const steps = Array.isArray(plan?.steps) ? plan.steps : [];
  if (!steps.length) return plan?.name || 'Flexible payment plans available';

  // Try to find “handover” total vs downpayment
  const total = steps.reduce((acc, s) => acc + (Number(s.percentage) || 0), 0);
  const down = steps.find((s) => /book|on\s*booking/i.test(s?.name || ''));
  const handover = steps.find((s) => /handover/i.test(s?.name || ''));

  const pieces = [];
  if (down?.percentage != null) pieces.push(`${down.percentage}% on booking`);
  if (handover?.percentage != null) pieces.push(`${handover.percentage}% on handover`);
  if (!pieces.length) {
    // generic sentence
    pieces.push(
      steps
        .map((s) => `${s.percentage}% — ${s.name}`)
        .join(', ')
    );
  }
  if (total && total !== 100) pieces.push(`(Total scheduled: ${total}%)`);

  return `${plan?.name || 'Payment Plan'}: ${pieces.join('; ')}.`;
}

function pickNearby(points = [], kind = 'school') {
  const isSchool = (n) =>
    /\bschool|college|academy|university|nursery|montessori\b/i.test(n || '');
  const isHospital = (n) =>
    /\bhospital|clinic|medical|mediclinic|kings\b/i.test(n || '');

  const items = [];
  for (const p of points) {
    const name = p?.map_point_name || '';
    if (!name) continue;
    if (kind === 'school' && isSchool(name)) items.push(name);
    if (kind === 'hospital' && isHospital(name)) items.push(name);
  }
  return uniq(items).slice(0, 6);
}

function buildAmenitiesList(project_amenities = []) {
  const names = project_amenities
    .map((a) => a?.amenity?.name)
    .filter(Boolean);
  return uniq(names).slice(0, 12);
}

/* ---------- FAQ builder ---------- */
function makeFaq(property) {
  const p = property?.rawData ?? property ?? {};

  const name = p.name || property?.title || 'the Project';
  const developer = p.developer || property?.developer || null;
  const loc = formatLocation(p.location);
  const completion = p.completion_date || null;
  const minPrice = p.min_price ?? null;
  const unitMix = buildUnitMixSentence(p);
  const plan = extractPaymentPlan(p);
  const mapPoints = Array.isArray(p.project_map_points) ? p.project_map_points : [];
  const schools = pickNearby(mapPoints, 'school');
  const hospitals = pickNearby(mapPoints, 'hospital');
  const amenities = buildAmenitiesList(p.project_amenities);

  const faqs = [];

  if (loc) {
    faqs.push({
      q: `Where is ${name} located?`,
      a: `${name} is located in ${loc}.`,
    });
  }

  if (developer) {
    faqs.push({
      q: `Who is the developer of ${name}?`,
      a: `${name} is developed by ${developer}.`,
    });
  }

  if (unitMix) {
    faqs.push({
      q: `What types of properties are available at ${name}?`,
      a: unitMix,
    });
  }

  if (minPrice != null) {
    faqs.push({
      q: `What’s the starting price at ${name}?`,
      a: `Prices start from ${AED(minPrice)}.`,
    });
  }

  if (plan) {
    faqs.push({
      q: `What payment plans are available at ${name}?`,
      a: plan,
    });
  }

  if (completion) {
    faqs.push({
      q: `When is handover scheduled for ${name}?`,
      a: `Handover (completion) is scheduled for ${completion}.`,
    });
  }

  if (amenities.length) {
    faqs.push({
      q: `What amenities are available at ${name}?`,
      a: `Key amenities include: ${amenities.join(', ')}.`,
    });
  }

  if (hospitals.length) {
    faqs.push({
      q: `Are there healthcare facilities near ${name}?`,
      a: `Nearby healthcare options include ${hospitals.join(', ')}.`,
    });
  }

  if (schools.length) {
    faqs.push({
      q: `Are there schools near ${name}?`,
      a: `Nearby schools include ${schools.join(', ')}.`,
    });
  }

  return faqs;
}

/* ---------- Accordion item (polished + animated) ---------- */
function FaqItem({ i, q, a, open, onToggle }) {
  const panelId = `faq-panel-${i}`;
  const btnId = `faq-btn-${i}`;

  return (
    <div className="overflow-hidden">
      <button
        id={btnId}
        aria-controls={panelId}
        aria-expanded={open}
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left py-4 px-4 md:px-6
                   transition-colors rounded-xl focus:outline-none
                   focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#00C6FF]
                   hover:bg-gray-50"
      >
        <span className="text-base md:text-lg font-medium text-gray-900">
          {q}
        </span>

        {/* Plus icon that rotates to an “x” on open */}
        <span
          className={`ml-3 inline-flex h-7 w-7 items-center justify-center rounded-full
                      border border-gray-300 text-gray-600 transition-transform duration-200
                      ${open ? 'rotate-45 bg-gray-50' : ''}`}
        >
          +
        </span>
      </button>

      {/* Collapsible answer with smooth height/opacity transition */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={btnId}
        className={`px-4 md:px-6 grid transition-all duration-300 ease-out
                    ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="pb-5 text-gray-700 leading-relaxed">
            {a}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main ---------- */
export default function ProjectFAQ({ property }) {
  const faqs = useMemo(() => makeFaq(property), [property]);
  const [open, setOpen] = useState(-1);

  // JSON-LD for SEO (FAQPage)
  const jsonLd = useMemo(() => {
    if (!faqs.length) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    };
  }, [faqs]);

  if (!faqs.length) return null;

  const name = property?.rawData?.name || property?.title || 'the Project';

  return (
    <section className="px-4 py-12 md:px-16 bg-white" dir="ltr">
      {/* Heading: property name in bluish color only here */}
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
        FAQ about <span className="text-[#00C6FF]">{name}</span>
      </h2>
      <p className="text-gray-600 mb-6 text-sm md:text-base">
        Answers to the most common questions buyers ask.
      </p>

      {/* Card container */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm divide-y">
        {faqs.map((f, i) => (
          <FaqItem
            key={i}
            i={i}
            q={f.q}
            a={f.a}
            open={open === i}
            onToggle={() => setOpen(open === i ? -1 : i)}
          />
        ))}
      </div>

      {jsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </section>
  );
}
