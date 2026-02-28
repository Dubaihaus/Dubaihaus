'use client';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

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
function buildUnitMixSentence(p, t) {
  const blocks = Array.isArray(p?.unit_blocks) ? p.unit_blocks : [];
  const tus = Array.isArray(p?.typical_units) ? p.typical_units : [];
  const entries =
    blocks.length > 0
      ? blocks.map((b) => ({
        bedrooms: Number.isFinite(Number(b?.bedrooms)) ? Number(b.bedrooms) : null,
        unit_type: b?.unit_type || p?.property_type || t('faq.helpers.residence'),
        from_sqft: b?.size_from_sqft ?? b?.sizeFromSqft ?? null,
        to_sqft: b?.size_to_sqft ?? b?.sizeToSqft ?? null,
      }))
      : tus.map((t_unit) => ({
        bedrooms: Number.isFinite(Number(t_unit?.bedrooms)) ? Number(t_unit.bedrooms) : null,
        unit_type: p?.property_type || t('faq.helpers.apartment'),
        from_sqft: t_unit?.from_size_sqft ?? null,
        to_sqft: t_unit?.to_size_sqft ?? null,
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

  const label = (br) => (br <= 0 ? t('faq.helpers.studio') : t('faq.helpers.bedroom', { br }));

  for (const g of brs) {
    // summary list “1- and 2-bedroom”
    if (g.br <= 0) parts.push(t('faq.helpers.studio'));
    else parts.push(t('faq.helpers.bedroom', { br: g.br }).toLowerCase());

    // detail with sizes
    const have = Number.isFinite(g.min) && g.max > 0;
    detail.push(
      have
        ? `${label(g.br)} (${fmtNum(Math.round(g.min))}–${fmtNum(Math.round(g.max))} sq.ft.)`
        : `${label(g.br)} (${t('faq.helpers.sizeOnRequest')})`
    );
  }

  const unitTypes = uniq(
    entries.map((e) => (e.unit_type || '').toString().trim().toLowerCase())
  ).map((s) => titleCase(s || t('faq.helpers.residence')));
  const typeText = unitTypes.length ? unitTypes.join(' & ') : t('faq.helpers.residence');

  const andStr = t('faq.helpers.and');
  const brText =
    parts.length === 1
      ? parts[0]
      : parts.length === 2
        ? parts.join(` ${andStr} `)
        : `${parts.slice(0, -1).join(', ')}, ${andStr} ${parts[parts.length - 1]}`;

  return `${typeText} include ${brText}. ${detail.join(', ')}`;
}

function extractPaymentPlan(p, t) {
  const plans = Array.isArray(p?.payment_plans) ? p.payment_plans : [];
  if (!plans.length) return null;

  const plan = plans[0]; // choose first plan if many
  const steps = Array.isArray(plan?.steps) ? plan.steps : [];
  if (!steps.length) return plan?.name || t('faq.answers.paymentPlan.flexible');

  // Try to find “handover” total vs downpayment
  const total = steps.reduce((acc, s) => acc + (Number(s.percentage) || 0), 0);
  const down = steps.find((s) => /book|on\s*booking/i.test(s?.name || ''));
  const handover = steps.find((s) => /handover/i.test(s?.name || ''));

  const pieces = [];
  if (down?.percentage != null) pieces.push(t('faq.answers.paymentPlan.onBooking', { percentage: down.percentage }));
  if (handover?.percentage != null) pieces.push(t('faq.answers.paymentPlan.onHandover', { percentage: handover.percentage }));
  if (!pieces.length) {
    // generic sentence
    pieces.push(
      steps
        .map((s) => `${s.percentage}% — ${s.name}`)
        .join(', ')
    );
  }
  if (total && total !== 100) pieces.push(t('faq.answers.paymentPlan.totalScheduled', { total }));

  return `${plan?.name || t('projectDetails.paymentPlan.fallbackTitle')}: ${pieces.join('; ')}.`;
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
function makeFaq(property, t) {
  const p = property?.rawData ?? property ?? {};

  const name = p.name || property?.title || t('faq.projectFallback');
  const developer = p.developer || property?.developer || null;
  const loc = formatLocation(p.location);
  const completion = p.completion_date || null;
  const minPrice = p.min_price ?? null;
  const unitMix = buildUnitMixSentence(p, t);
  const plan = extractPaymentPlan(p, t);
  const mapPoints = Array.isArray(p.project_map_points) ? p.project_map_points : [];
  const schools = pickNearby(mapPoints, 'school');
  const hospitals = pickNearby(mapPoints, 'hospital');
  const amenities = buildAmenitiesList(p.project_amenities);

  const faqs = [];

  if (loc) {
    faqs.push({
      q: t('faq.questions.location', { name }),
      a: t('faq.answers.location', { name, location: loc }),
    });
  }

  if (developer) {
    faqs.push({
      q: t('faq.questions.developer', { name }),
      a: t('faq.answers.developer', { name, developer }),
    });
  }

  if (unitMix) {
    faqs.push({
      q: t('faq.questions.types', { name }),
      a: unitMix,
    });
  }

  if (minPrice != null) {
    faqs.push({
      q: t('faq.questions.price', { name }),
      a: t('faq.answers.price', { name, price: AED(minPrice) }),
    });
  }

  if (plan) {
    faqs.push({
      q: t('faq.questions.paymentPlan', { name }),
      a: plan,
    });
  }

  if (completion) {
    faqs.push({
      q: t('faq.questions.handover', { name }),
      a: t('faq.answers.handover', { name, completion }),
    });
  }

  if (amenities.length) {
    faqs.push({
      q: t('faq.questions.amenities', { name }),
      a: t('faq.answers.amenities', { name, list: amenities.join(', ') }),
    });
  }

  if (hospitals.length) {
    faqs.push({
      q: t('faq.questions.healthcare', { name }),
      a: t('faq.answers.healthcare', { name, list: hospitals.join(', ') }),
    });
  }

  if (schools.length) {
    faqs.push({
      q: t('faq.questions.schools', { name }),
      a: t('faq.answers.schools', { name, list: schools.join(', ') }),
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
  const t = useTranslations('projectDetails');
  const faqs = useMemo(() => makeFaq(property, t), [property, t]);
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

  const name = property?.rawData?.name || property?.title || t('faq.projectFallback');

  return (
    <section className="px-4 py-12 md:px-16 bg-white" dir="ltr">
      {/* Heading: property name in bluish color only here */}
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
        {t('faq.title')} <span className="text-[#00C6FF]">{name}</span>
      </h2>
      <p className="text-gray-600 mb-6 text-sm md:text-base">
        {t('faq.subtitle')}
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
