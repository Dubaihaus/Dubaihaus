// src/components/project_details/ProjectHeaderSection.jsx
'use client';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import {
  FaMoneyBillWave,
  FaPercent,
  FaCalendarAlt,
  FaPhoneAlt,
  FaWhatsapp,
} from 'react-icons/fa';
import ContactModal from '@/components/ContactModal';
import { getHandoverLabel } from '../../lib/FormatHandover';
import { useTranslations } from 'next-intl';

/* ---------- Utilities (unchanged) ---------- */
function formatAED(n, t) {
  return n != null ? `AED ${Number(n).toLocaleString()}` : t('buildingDetails.values.priceOnRequest');
}
function formatLocationLikeHighlights(locOrString) {
  if (!locOrString) return 'Dubai';
  if (typeof locOrString === 'string') {
    return locOrString.replace(/,\s*\d+\s*$/, '').trim();
  }
  const loc = locOrString;
  const parts = [loc.sector, loc.district, loc.city, loc.region].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Dubai';
}
function pickCoverUrl(property) {
  const candidates = [
    property?.coverPhoto,
    property?.media?.photos?.[0],
    property?.media?.photos?.[0]?.url,
    property?.cover_image?.url,
    property?.rawData?.cover_image?.url,
  ];
  for (const c of candidates) {
    if (!c) continue;
    if (typeof c === 'string' && c.trim()) return c.trim();
    if (typeof c === 'object' && typeof c.url === 'string' && c.url.trim())
      return c.url.trim();
    if (typeof c === 'object' && typeof c.src === 'string' && c.src.trim())
      return c.src.trim();
  }
  return '/project_detail_images/building.jpg';
}
function getStartingPriceAED(raw) {
  if (!raw) return null;

  // 1️⃣ Direct min_price field (with rounding)
  if (raw.min_price != null) {
    return Math.round(Number(raw.min_price));
  }

  // 2️⃣ Extract nested prices
  const unitBlocks = Array.isArray(raw.unit_blocks) ? raw.unit_blocks : [];
  const typical = Array.isArray(raw.typical_units) ? raw.typical_units : [];

  const prices = [
    ...unitBlocks.map(
      (b) => b?.units_price_from_aed ?? b?.price_from_aed ?? null
    ),
    ...typical.map((t) => t?.from_price_aed ?? null),
  ]
    .filter((v) => v != null && !isNaN(v)) // only valid numbers
    .map((v) => Math.round(Number(v))); // 🔥 clean rounding at source

  // 3️⃣ Return smallest valid price (already rounded)
  return prices.length ? Math.min(...prices) : null;
}

/* ---------- Payment plan helpers (copied from PaymentPlanSection) ---------- */

function hasUsableSteps(plan) {
  return plan && Array.isArray(plan.steps) && plan.steps.length > 0;
}

// 🔹 Extract first usable payment plan (from normalized or raw)
function getFirstPaymentPlan(property) {
  const raw = property?.rawData ?? property ?? {};

  const fromProp = Array.isArray(property?.paymentPlans)
    ? property.paymentPlans.filter(hasUsableSteps)
    : [];

  const fromRaw = Array.isArray(raw?.payment_plans)
    ? raw.payment_plans.filter(hasUsableSteps)
    : [];

  const plans = fromProp.length ? fromProp : fromRaw;
  return plans[0] || null;
}

// 🔹 Label for header card: "20% / 20% / 60%"
function getHeaderPaymentPlanLabel(property, t) {
  const plan = getFirstPaymentPlan(property);

  if (!plan) {
    // simple fallback if you ever set a string
    if (
      typeof property?.paymentPlan === 'string' &&
      property.paymentPlan.trim().length
    ) {
      return property.paymentPlan.trim();
    }
    return t('hero.tags.paymentPlan'); // Default translable label if no structured plan
  }

  const percentages = (plan.steps || [])
    .map((s) => Number(s.percentage))
    .filter((n) => Number.isFinite(n) && n > 0)
    .map((n) => Math.round(n));

  if (!percentages.length) return t('hero.tags.paymentPlan');

  // show first 3–4 steps max to keep it clean
  const label = percentages
    .slice(0, 4)
    .map((p) => `${p}%`)
    .join(' / ');

  return label;
}

/* ---------- Component ---------- */
export default function ProjectHeaderSection({ property }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('projectDetails');

  const raw = property?.rawData ?? property ?? {};
  const coverUrl = pickCoverUrl(property);
  const title = property.title || raw.name || 'Project Title';
  const community = formatLocationLikeHighlights(
    raw.location || property.location
  );
  const startPrice = getStartingPriceAED(raw);
  const priceLabel = formatAED(startPrice, t);

  // ✅ Correct payment plan (same logic as PaymentPlanSection heading)
  // ✅ Header card: show percentages like "20% / 20% / 60%"
  const paymentPlan = getHeaderPaymentPlanLabel(property, t);


  // ✅ Correct handover label (same as cards & highlights)
  const handoverDate = getHandoverLabel(property) || t('buildingDetails.values.tba');

  /* ----- rotating tagline (one of 5 lines; new on mount) ----- */
  const taglines = useMemo(
    () => [
      t('hero.taglines.0'),
      t('hero.taglines.1'),
      t('hero.taglines.2'),
      t('hero.taglines.3'),
      t('hero.taglines.4'),
    ],
    [t]
  );
  const [tagline, setTagline] = useState(taglines[0]);
  useEffect(() => {
    setTagline(taglines[Math.floor(Math.random() * taglines.length)]);
  }, [taglines]);

  return (
    <section
      className="relative rounded-2xl bg-white/80 backdrop-blur-[1px] shadow-[0_10px_30px_rgba(17,24,39,0.06)]
                 px-5 py-10 md:px-10 md:py-14 lg:px-14 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 overflow-visible"
    >
      {/* LEFT: Image (with right padding and reduced shift) */}
      <div className="relative pr-4 md:pr-8">
        <div
          className="relative w-full h-[320px] md:h-[480px] lg:h-[540px]
                        rounded-[28px] overflow-hidden shadow-xl md:translate-x-[3%]"
        >
          <Image
            src={coverUrl}
            alt={title}
            fill
            priority
            placeholder="blur"
            blurDataURL="/project_detail_images/building_blur.jpg"
            className="object-cover will-change-transform transition-transform duration-700 ease-out hover:scale-[1.03]"
          />
          {/* subtle bottom gradient for readability if you overlay captions later */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/25 to-transparent" />
        </div>

        {/* Floating action bubbles */}
        <div className="absolute bottom-4 right-4 md:right-6 flex flex-col items-center gap-3">
          <a
            href={`tel:${raw?.developer_data?.phone || '+971505231194'}`}
            className="bg-sky-500 hover:bg-sky-600 p-4 rounded-full shadow-lg text-white transition-all hover:scale-110 hover:shadow-xl"
            aria-label="Call"
          >
            <FaPhoneAlt className="text-lg" />
          </a>
          <a
            href={`https://wa.me/${raw?.developer_data?.whatsapp || '971505231194'}`}
            target="_blank"
            rel="noreferrer"
            className="bg-green-500 hover:bg-green-600 p-4 rounded-full shadow-lg text-white transition-all hover:scale-110 hover:shadow-xl"
            aria-label="WhatsApp"
          >
            <FaWhatsapp className="text-lg" />
          </a>
        </div>
      </div>

      {/* RIGHT: Text + CTAs (with left padding) */}
      <div className="flex flex-col justify-center gap-6 md:gap-7 pl-4 md:pl-8">
        {/* Breadcrumb */}
        <nav className="text-[13px] md:text-sm text-gray-500">
          <span className="text-gray-400">{t('hero.breadcrumb.separator')}</span>{' '}
          <span className="text-sky-600 font-medium">{community}</span>
        </nav>

        {/* Title */}
        <header className="space-y-2">
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold text-slate-900 leading-tight tracking-tight">
            {title}
          </h1>
          <p className="text-xl md:text-2xl font-medium text-slate-#004C99">
            {t('hero.tags.in')} <span className="text-sky-600">{community}</span>
          </p>
        </header>

        {/* CTAs */}
        <div className="flex items-center gap-5 mt-2">
          <button
            onClick={() => setOpen(true)}
            className="min-w-[172px] rounded-xl px-7 py-3.5 text-white font-semibold
                       bg-gradient-to-r from-sky-400 to-blue-400 hover:from-sky-500 hover:to-blue-600
                       shadow-[0_10px_20px_rgba(56,189,248,0.25)] hover:shadow-[0_12px_24px_rgba(56,189,248,0.35)]
                       transition-all"
          >
            {t('hero.cta.discoverMore')}
          </button>

          <div className="relative group">
            <Image
              src="/project_detail_images/qr_code.jpg"
              alt="QR Code"
              width={84}
              height={84}
              className="rounded-xl shadow-md border border-gray-200 transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[11px] px-2 py-0.5 rounded-full shadow-sm">
              {t('hero.qr.scan')}
            </div>
            <div
              className="absolute left-1/2 -translate-x-1/2 top-[110%] opacity-0 group-hover:opacity-100 transition
                            text-xs bg-slate-900 text-white px-2 py-1 rounded pointer-events-none"
            >
              {t('hero.qr.tooltip')}
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mt-4">
          <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="bg-sky-50 p-3 rounded-lg">
              <FaMoneyBillWave className="text-sky-400 text-2xl" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-lg">{priceLabel}</p>
              <span className="text-slate-500 text-sm">{t('hero.tags.startingPrice')}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="bg-sky-50 p-3 rounded-lg">
              <FaPercent className="text-sky-400 text-2xl" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-md">
                {paymentPlan}
              </p>
              <span className="text-slate-500 text-sm">{t('hero.tags.paymentPlan')}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="bg-sky-50 p-3 rounded-lg">
              <FaCalendarAlt className="text-sky-400 text-2xl" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-lg">
                {handoverDate}
              </p>
              <span className="text-slate-500 text-sm">{t('hero.tags.handover')}</span>
            </div>
          </div>
        </div>

        {/* Tagline (rotates per mount) */}
        <div
          className="mt-4 p-4 rounded-xl border border-sky-100
                        bg-gradient-to-r from-sky-50 to-blue-50 text-center"
        >
          <p className="text-slate-700 text-sm">{tagline}</p>
        </div>
      </div>

      <ContactModal
        open={open}
        onClose={() => setOpen(false)}
        projectTitle={title}
      />
    </section>
  );
}
