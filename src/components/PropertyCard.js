// src/components/PropertyCard.js
'use client';

import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { getHandoverLabel } from '../lib/FormatHandover';
import { useTranslations } from 'next-intl';

/* ---------------- helpers ---------------- */

function fmtLocation(locOrString, unknownLabel = 'Unknown location') {
  // If object: safely build without numeric country ids
  if (locOrString && typeof locOrString === 'object') {
    const { sector, district, city, region, country } = locOrString;
    const countryStr =
      typeof country === 'string' && !/^\d+$/.test(country) ? country : null;
    const parts = [sector, district, city, region, countryStr].filter(Boolean);
    return parts.join(', ') || unknownLabel;
  }

  // If string: drop standalone numeric tokens like ", 219"
  const s = String(locOrString || '').trim();
  if (!s) return unknownLabel;
  return (
    s
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p && !/^\d+$/.test(p)) // remove numeric-only segments
      .join(', ') || unknownLabel
  );
}

function TypeBadges({ types, brRange }) {
  const list =
    Array.isArray(types) && types.length ? types : null;
  if (!list && !brRange) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      {list?.map((t, index) => {
        const label =
          typeof t === "string"
            ? t
            : t?.type || t?.name || t?.unit_category || "";

        if (!label) return null;

        return (
          <motion.span
            key={`${label}-${index}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-700"
          >
            {label}
          </motion.span>
        );
      })}

      {brRange && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700"
        >
          {brRange}
        </motion.span>
      )}
    </div>
  );
}


// same “usable steps” helper as in PaymentPlanSection
function hasUsableSteps(plan) {
  return plan && Array.isArray(plan.steps) && plan.steps.length > 0;
}

/**
 * Build a short payment-plan label for the blue badge.
 * 1) Try to infer "80/20" from steps.
 * 2) Else use plan.name or fallback paymentPlanLabel.
 */
function getCardPaymentPlanLabel(property, paymentPlanLabel = 'Payment plan') {
  const plans = Array.isArray(property?.paymentPlans)
    ? property.paymentPlans.filter(hasUsableSteps)
    : [];

  // 1) If we have a plan with steps, try ratio + label
  if (plans.length) {
    const plan = plans[0];
    const steps = Array.isArray(plan.steps) ? plan.steps : [];

    const sorted = [...steps]
      .filter((s) => typeof s?.percentage === 'number')
      .sort((a, b) => b.percentage - a.percentage);

    if (sorted.length >= 2) {
      const a = Math.round(sorted[0].percentage);
      const b = Math.round(sorted[1].percentage);
      const total = steps.reduce(
        (t, s) => t + (Number(s.percentage) || 0),
        0
      );

      // Only show ratio if the top two account for most of the total
      if (total > 0 && a + b >= total * 0.9) {
        return `${a}/${b} ${paymentPlanLabel}`;
      }
    }

    if (plan.name) {
      return `${plan.name} ${paymentPlanLabel}`;
    }

    return paymentPlanLabel;
  }

  // 2) Fallback: use simple string they might have normalized
  if (typeof property?.paymentPlan === 'string' && property.paymentPlan.trim()) {
    return property.paymentPlan.trim();
  }

  return null;
}

/* ---------------- component ---------------- */

export default function PropertyCard({
  property,
  currency,
  selectedUnitType,
  index = 0,
}) {
  const router = useRouter();
  const t = useTranslations('offPlan.card');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const coverPhoto =
    property.coverPhoto ||
    property?.media?.photos?.[0] ||
    property?.cover_image?.url ||
    property?.rawData?.cover_image?.url ||
    '/project_detail_images/building.jpg';

    const rawPrice =
    property.price ?? property.minPrice ?? property.min_price ?? null;

  // Backend already converted to correct currency
  const price = rawPrice != null ? Math.round(Number(rawPrice)) : null;

  const shownCurrency =
    property.priceCurrency || property.price_currency || currency || 'AED';

  const locationLabel = fmtLocation(
    property.locationObj || property.rawData?.location || property.location,
    t('location.unknown')
  );
  const developer = property.developer || 'N/A';
  const handover = getHandoverLabel(property);

  // --- Property types & payment plan meta ---

  // Property types array from API / normalizer
const types =
  Array.isArray(property.propertyTypes) && property.propertyTypes.length
    ? property.propertyTypes
    : property.propertyType
    ? [property.propertyType]
    : [];

const brRange = property.bedroomsRange || null;

  // Comma-separated label for red badge
  const propertyTypesLabel =
    types && types.length ? types.join(', ') : t('badges.propertyFallback');

  // Only bedroom summary in chips now

  // Left red badge: property types
  const leftBadgeLabel = propertyTypesLabel;

  // Right blue badge: payment plan or "Coming soon"
  const paymentPlanLabel = getCardPaymentPlanLabel(
    property,
    t('badges.paymentPlan')
  );
  const rightBadgeLabel = paymentPlanLabel || t('badges.comingSoon');

  const queryParams = {};
  if (selectedUnitType) queryParams.unit_type = selectedUnitType;

  // Build an href STRING for router.prefetch (Link can still use object)
  const href = useMemo(() => {
    const pathname = `/ui/project_details/${property.id}`;
    const search = new URLSearchParams(queryParams).toString();
    return search ? `${pathname}?${search}` : pathname;
  }, [property.id, queryParams]);

  const prefetchDetail = useCallback(() => {
    router.prefetch(href);
  }, [router, href]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3, ease: 'easeOut' },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500 relative group"
      dir="ltr"
    >
      {/* Shine effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-10 pointer-events-none" />

      <Link
        href={{
          pathname: `/ui/project_details/${property.id}`,
          query: queryParams,
        }}
        prefetch
        onMouseEnter={prefetchDetail}
        onFocus={prefetchDetail}
        onTouchStart={prefetchDetail}
        className="flex flex-col flex-1"
      >
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
            <motion.img
              src={coverPhoto}
              alt={property.title || property.name}
              className={`w-full h-64 object-cover transition-all duration-700 ${
                isHovered ? 'scale-110' : 'scale-100'
              } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              initial={false}
              animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />

            {/* Loading skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Badges */}
            {/* Left: property types */}
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="absolute top-4 left-4 bg-white text-black text-xs font-semibold px-3 py-2 rounded-xl shadow-lg"
            >
              {leftBadgeLabel}
            </motion.span>

            {/* Right: payment plan or Coming soon */}
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="absolute top-14 left-4 bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-lg"
            >
              {rightBadgeLabel}
            </motion.span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1 relative z-0">
          {/* Price */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.1 }}
            className="font-bold text-xl mb-3"
            style={{ color: '#00C6FF' }}
          >
            {t('from')} {shownCurrency}{' '}
            {price?.toLocaleString() ?? '—'}
          </motion.p>

          {/* Title */}
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            className="text-gray-800 font-bold text-lg mb-3 line-clamp-2 leading-tight"
          >
            {property.title || property.name}
          </motion.h3>

          {/* Location */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="text-gray-500 text-sm flex items-center gap-2 mb-3"
          >
            <MapPin size={16} className="flex-shrink-0" />
            <span className="line-clamp-1">{locationLabel}</span>
          </motion.p>

          {/* Type badges – bedrooms only */}
<TypeBadges types={types} brRange={brRange} />
          {/* Developer & Handover */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.4 }}
            className="text-sm text-gray-600 space-y-2 mb-6 mt-4"
          >
            <p className="flex justify-between">
              <span className="font-medium">
                {t('labels.developer')}
              </span>
              <span className="text-gray-800">{developer}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">
                {t('labels.handover')}
              </span>
              <span className="text-gray-800">{handover}</span>
            </p>
          </motion.div>

          {/* Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.5 }}
            className="mt-auto"
          >
            <Button
              className="w-full text-white rounded-xl font-semibold py-3 text-base shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group/btn"
              style={{
                backgroundColor: '#00C6FF',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#003C7A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#00C6FF';
              }}
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />

              <motion.span
                animate={isHovered ? { x: 2 } : { x: 0 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 flex items-center justify-center"
              >
                {t('button.discoverMore')}
                <svg
                  className="ml-2 w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.span>
            </Button>
          </motion.div>
        </div>
      </Link>

      {/* Hover border effect */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-sky-200 transition-all duration-300 pointer-events-none" />
    </motion.div>
  );
}
