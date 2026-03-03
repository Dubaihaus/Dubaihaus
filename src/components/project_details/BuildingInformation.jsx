'use client';
import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

/* -------- helpers -------- */

function humanizeStatus(s, t) {
  if (!s) return t('location.buildingDetails.values.na');

  const val = String(s).toLowerCase().trim();

  if (val === 'announced') return t('location.buildingDetails.values.sale.announced');
  if (val === 'presale' || val === 'pre-sale') return t('location.buildingDetails.values.sale.presale');
  if (val === 'on_sale') return t('location.buildingDetails.values.sale.onSale');
  if (val === 'out_of_stock') return t('location.buildingDetails.values.sale.outOfStock');

  if (val === 'under_construction') return t('location.buildingDetails.values.construction.underConstruction');
  if (val === 'completed' || val === 'constructed') return t('location.buildingDetails.values.construction.completed');

  return String(s).replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

function formatLocation(loc, t) {
  if (!loc) return t('location.buildingDetails.values.na');
  const parts = [loc?.sector, loc?.district, loc?.city, loc?.region].filter(Boolean);
  return parts.length ? parts.join(', ') : t('location.buildingDetails.values.na');
}

/** Format AED price nicely (with K / M / B suffix) */
function formatAED(n, t) {
  if (n == null || n === '') return t('location.buildingDetails.values.priceOnRequest');
  const num = Number(n);
  if (!Number.isFinite(num)) return t('location.buildingDetails.values.priceOnRequest');

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

function formatFurnishing(furnishing, t) {
  if (!furnishing) return t('location.buildingDetails.values.na');

  const val = String(furnishing).toLowerCase().trim();
  if (val === 'yes' || val === 'true' || val === '1') return t('location.buildingDetails.values.furnishing.yes');
  if (val === 'no' || val === 'false' || val === '0') return t('location.buildingDetails.values.furnishing.no');

  return String(furnishing).toUpperCase() === 'YES'
    ? t('location.buildingDetails.values.furnished')
    : String(furnishing);
}

/** Safely pull a URL out of different shapes */
function pickUrl(x) {
  if (!x) return null;
  if (typeof x === 'string') return x;
  return x.url || x.src || x.image?.url || null;
}

/** Return up to N DISTINCT urls, favoring the LAST images in arrays */
function takeLastDistinct(urlArrays, n = 3) {
  const seen = new Set();
  const out = [];
  for (const arr of urlArrays) {
    if (!Array.isArray(arr)) continue;
    for (let i = arr.length - 1; i >= 0 && out.length < n; i--) {
      const u = pickUrl(arr[i]);
      if (u && !seen.has(u)) {
        seen.add(u);
        out.push(u);
      }
    }
    if (out.length >= n) break;
  }
  return out.slice(0, n);
}

/** Escape for RegExp constructor */
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Extract "##### <heading> ... (until next ##### or end)" from markdown-ish text */
function extractMdSection(md, heading) {
  if (!md || typeof md !== 'string') return null;
  const re = new RegExp(`#####\\s*${escapeRegExp(heading)}\\b(.*?)(?=#####|\\s*$)`, 'is');
  const m = md.match(re);
  if (!m) return null;
  const cleaned = m[1].trim().replace(/^#+\s*/g, '');
  return cleaned || null;
}

export default function CombinedPropertyDetails({ property }) {
  const t = useTranslations('projectDetails');
  const p = property?.rawData ?? property ?? {};

  // Prefer last, distinct images from architecture → interior → cover
  const appealImages = takeLastDistinct(
    [
      Array.isArray(p.architecture) ? p.architecture : [],
      Array.isArray(p.interior) ? p.interior : [],
      p.cover_image ? [p.cover_image] : [],
    ],
    3
  );

  // Points of interest (limit to 6)
  const pointsOfInterest = Array.isArray(p?.project_map_points)
    ? p.project_map_points.slice(0, 6)
    : [];

  const na = t('location.buildingDetails.values.na');
  const tba = t('location.buildingDetails.values.tba');

  // LEFT CARD: Property & Building Information
  const leftCardInfo = [
    { label: t('location.buildingDetails.labels.buildingName'), value: p.name || property?.title || na, category: 'building' },
    { label: t('location.buildingDetails.labels.developer'), value: p.developer?.name || p.developer_name || p.developer || na, category: 'developer' },
    { label: t('location.buildingDetails.labels.furnishing'), value: formatFurnishing(p.furnishing, t), category: 'features' },
    { label: t('location.buildingDetails.labels.constructionStatus'), value: humanizeStatus(p.construction_status, t), category: 'status' },
    { label: t('location.buildingDetails.labels.saleStatus'), value: humanizeStatus(p.sale_status, t), category: 'status' },
    { label: t('location.buildingDetails.labels.completionDate'), value: p.completion_date || p.handover || tba, category: 'timeline' },
    { label: t('location.buildingDetails.labels.serviceCharge'), value: p.service_charge || na, category: 'financial' },
    { label: t('location.buildingDetails.labels.referenceNo'), value: p.id ?? property?.id ?? na, category: 'administrative' },
    { label: t('location.buildingDetails.labels.location'), value: formatLocation(p.location, t), category: 'location' },
  ].filter((item) => item.value !== na);

  // RIGHT CARD: Starting Price (always)
  const rightCardInfo = [
    { label: t('location.economicAppeal.startingPrice'), value: formatAED(p.min_price, t), highlight: true },
  ].filter((item) => item.value !== na);

  // ---------- NEW: Prefer "Location description and benefits" from overview ----------
  const overviewSource =
    p?.description ||
    p?.overview ||
    p?.about ||
    property?.description ||
    '';

  const locationDescription =
    extractMdSection(overviewSource, 'Location description and benefits') || null;
  // -----------------------------------------------------------------------------------

  return (
    <section className="px-5 py-12 md:px-10 md:py-16 lg:px-14 bg-white/80 backdrop-blur-[1px] rounded-2xl shadow-[0_10px_30px_rgba(17,24,39,0.06)]">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-3">
          {t('location.sectionTitle')}
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          {t('location.sectionSubtitle')}
        </p>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* LEFT CARD */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8">
          <div className="mb-6 pb-4 border-b border-slate-200">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900">{t('location.buildingDetails.title')}</h3>
            <p className="text-slate-600 text-sm mt-1">{t('location.buildingDetails.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {leftCardInfo.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white border border-slate-100 hover:border-slate-300 transition-all duration-300 hover:shadow-sm"
              >
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{item.label}</p>
                <p className="mt-1 text-lg font-medium text-slate-900 break-words">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-brand-dark font-semibold">{t('location.buildingDetails.summary')}</p>
            <p className="text-brand-dark text-sm">
              {t('location.buildingDetails.specsCount', { count: leftCardInfo.length })}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          {/* Economic Appeal Card */}
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8">
            <div className="mb-6 pb-4 border-b border-slate-200">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900">{t('location.economicAppeal.title')}</h3>
              <p className="text-slate-600 text-sm mt-1">{t('location.economicAppeal.subtitle')}</p>
            </div>

            {/* Images Grid (last, distinct) */}
            {appealImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {appealImages.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-slate-200">
                    <Image
                      src={img}
                      alt={`Property view ${idx + 1}`}
                      width={120}
                      height={120}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Economic Info */}
            <div className="space-y-4">
              {rightCardInfo.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${item.highlight
                    ? 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 shadow-sm'
                    : 'bg-white border border-slate-100 hover:border-slate-300'
                    }`}
                >
                  <div className="text-slate-700 font-semibold">{item.label}</div>
                  <div
                    className={`text-right ${item.highlight ? 'text-emerald-700 font-bold text-lg' : 'text-slate-900 font-medium'
                      }`}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CONDITIONAL: Location Description (from overview) OR Nearby Locations */}
          {locationDescription ? (
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8">
              <div className="mb-4">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900">
                  {t('location.benefits.title')}
                </h3>

              </div>
              <p className="text-slate-700 leading-7 md:leading-8 text-justify">
                {locationDescription}
              </p>
            </div>
          ) : (
            pointsOfInterest.length > 0 && (
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8">
                <div className="mb-6">
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900">{t('location.nearby.title')}</h3>
                  <p className="text-slate-600 text-sm mt-1">{t('location.nearby.subtitle')}</p>
                </div>

                <div className="space-y-3">
                  {pointsOfInterest.map((poi, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-slate-300 transition-all duration-300 hover:shadow-sm"
                    >
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">
                          {poi.map_point_name || poi.name || poi.title}
                        </h4>
                        <p className="text-slate-500 text-xs">
                          {poi.distance ? t('location.nearby.distance', { distance: poi.distance }) : t('location.nearby.nearby')}
                        </p>
                      </div>
                      <div className="text-right">
                        {poi.time || poi.minutes || poi.time_min ? (
                          <span className="bg-slate-900/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {t('location.nearby.time', { minutes: poi.time || poi.minutes || poi.time_min })}
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm">
                            {t('location.nearby.nearby')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <p className="text-slate-500 text-sm">
                    {t('location.nearby.summary', { count: pointsOfInterest.length })}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
