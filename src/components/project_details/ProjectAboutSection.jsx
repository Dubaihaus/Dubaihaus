'use client';
import { useMemo, useState } from 'react';

function formatLocation(loc) {
  if (!loc) return null;
  const parts = [loc.sector, loc.district, loc.city, loc.region].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}
function formatAED(n, cur = 'AED') {
  return n != null ? `${cur} ${Number(n).toLocaleString()}` : null;
}

export default function ProjectAboutSection({ property }) {
  const p = property?.rawData ?? property ?? {};

  const title = p.name || property?.title || 'the Project';
  const rawDesc =
    p.description ||
    p.overview ||
    p.short_description ||
    property?.description ||
    '';

  const isLikelyHtml = /<\/?[a-z][\s\S]*>/i.test(rawDesc || '');
  const [expanded, setExpanded] = useState(false);

  const facts = useMemo(() => {
    const list = [];
    const loc = formatLocation(p.location);
    if (loc) list.push({ label: 'Location', value: loc });
    if (p.developer) list.push({ label: 'Developer', value: p.developer });
    if (p.completion_date) list.push({ label: 'Completion', value: p.completion_date });
    if (p.min_price != null) list.push({ label: 'Starting Price', value: formatAED(p.min_price, p.price_currency || 'AED') });
    if (Array.isArray(p.payment_plans) && p.payment_plans.length) {
      list.push({ label: 'Payment Plan', value: p.payment_plans[0].name || 'Available' });
    }
    return list;
  }, [p]);

  const amenityNames = Array.isArray(p.project_amenities)
    ? p.project_amenities.map((a) => a?.amenity?.name).filter(Boolean).slice(0, 8)
    : [];

  const shortText = isLikelyHtml ? rawDesc : (rawDesc || '').trim();
  const hasText = Boolean(shortText);

  return (
    <section className="bg-white px-4 md:px-12 py-12" dir="ltr">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">About {title}</h2>

        <a
          href={p.marketing_brochure || '#'}
          target={p.marketing_brochure ? '_blank' : undefined}
          rel="noreferrer"
          className="flex items-center gap-2 text-sky-600 font-medium hover:underline"
        >
          <span className="inline-flex w-8 h-8 rounded-full bg-sky-500 text-white items-center justify-center">
            &gt;
          </span>
          <span>Request Available Units & Prices</span>
        </a>
      </div>

      {hasText ? (
        <div className="text-gray-700 leading-relaxed space-y-3">
          {!isLikelyHtml ? (
            <>
              <p className={`${expanded ? '' : 'line-clamp-5'}`}>{shortText || 'No detailed description available.'}</p>
              {shortText.length > 400 && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="text-sky-600 text-sm font-semibold hover:underline"
                >
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </>
          ) : (
            <div
              className="prose max-w-none prose-sky prose-p:my-2 prose-headings:mt-4 prose-headings:mb-2"
              dangerouslySetInnerHTML={{ __html: shortText }}
            />
          )}
        </div>
      ) : (
        <p className="text-gray-500">No detailed description available.</p>
      )}

      {facts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
          {facts.map((f, i) => (
            <div key={`${f.label}-${i}`} className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-lg p-4">
              <span className="text-sky-600 font-semibold">{f.label}:</span>
              <span className="text-gray-800">{f.value}</span>
            </div>
          ))}
        </div>
      )}

      {amenityNames.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Highlights & Amenities</h3>
          <ul className="flex flex-wrap gap-2">
            {amenityNames.map((n, idx) => (
              <li key={`${n}-${idx}`} className="text-sm bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-700">
                {n}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
