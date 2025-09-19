'use client';
import { useMemo, useState } from 'react';

const ProjectAboutSection = ({ property }) => {
  // Title + long description
  const title = property.title || property?.rawData?.name || 'the Project';
  const rawDesc =
    property.description ||
    property?.rawData?.overview ||
    property?.rawData?.description ||
    property?.rawData?.short_description ||
    '';

  // Some APIs return HTML; keep it simple: prefer plain text, fallback to HTML render
  const isLikelyHtml = /<\/?[a-z][\s\S]*>/i.test(rawDesc || '');
  const [expanded, setExpanded] = useState(false);

  // Key facts to add substance without repeating other sections
  const facts = useMemo(() => {
    const list = [];
    if (property.location) list.push({ label: 'Location', value: property.location });
    if (property.developer) list.push({ label: 'Developer', value: property.developer });
    if (property.completionDate) {
      list.push({
        label: 'Completion',
        value: new Date(property.completionDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      });
    }
    if (property.price != null) {
      list.push({
        label: 'Starting Price',
        value: `${property.priceCurrency || 'AED'} ${Number(property.price).toLocaleString()}`,
      });
    }
    // Peek into rawData for optional extras
    if (property?.rawData?.payment_plan_name) {
      list.push({ label: 'Payment Plan', value: property.rawData.payment_plan_name });
    }
    return list;
  }, [property]);

  // Amenities (names only) to hint at what’s special — not a full list
  const amenityNames = Array.isArray(property.amenities)
    ? property.amenities.map(a => a?.name).filter(Boolean).slice(0, 8)
    : [];

  const shortText = isLikelyHtml
    ? rawDesc // if HTML, don’t substring; just show fully with toggle disabled
    : (rawDesc || '').trim();

  const hasText = Boolean(shortText);

  return (
    <section className="bg-white px-4 md:px-12 py-12" dir="ltr">
      {/* Title + CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">About {title}</h2>

        {/* Simple CTA (wire up later) */}
        <a
          href={property?.rawData?.brochure_url || '#'}
          target={property?.rawData?.brochure_url ? '_blank' : undefined}
          className="flex items-center gap-2 text-sky-600 font-medium hover:underline"
        >
          <span className="inline-flex w-8 h-8 rounded-full bg-sky-500 text-white items-center justify-center">
            &gt;
          </span>
          <span>Request Available Units & Prices</span>
        </a>
      </div>

      {/* Description */}
      {hasText ? (
        <div className="text-gray-700 leading-relaxed space-y-3">
          {!isLikelyHtml ? (
            <>
              <p className={`${expanded ? '' : 'line-clamp-5'}`}>
                {shortText || 'No detailed description available.'}
              </p>
              {shortText.length > 400 && (
                <button
                  onClick={() => setExpanded(v => !v)}
                  className="text-sky-600 text-sm font-semibold hover:underline"
                >
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </>
          ) : (
            // If API sends HTML
            <div
              className="prose max-w-none prose-sky prose-p:my-2 prose-headings:mt-4 prose-headings:mb-2"
              dangerouslySetInnerHTML={{ __html: shortText }}
            />
          )}
        </div>
      ) : (
        <p className="text-gray-500">No detailed description available.</p>
      )}

      {/* Key Facts */}
      {facts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
          {facts.map((f, i) => (
            <div
              key={`${f.label}-${i}`}
              className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-lg p-4"
            >
              <span className="text-sky-600 font-semibold">{f.label}:</span>
              <span className="text-gray-800">{f.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Amenities preview (optional, small) */}
      {amenityNames.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Highlights & Amenities</h3>
          <ul className="flex flex-wrap gap-2">
            {amenityNames.map((n, idx) => (
              <li
                key={`${n}-${idx}`}
                className="text-sm bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-700"
              >
                {n}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default ProjectAboutSection;
