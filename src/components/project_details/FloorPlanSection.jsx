'use client';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

const isImage = (u = '') =>
  /\.(png|jpe?g|webp|gif|bmp|svg)(\?.*)?$/i.test(u);

const isPdf = (u = '') => /\.pdf(\?.*)?$/i.test(u);

function parseTypicalImage(val) {
  if (!val) return null;
  try {
    const parsed = typeof val === 'string' ? JSON.parse(val) : val;
    if (Array.isArray(parsed)) return parsed[0]?.url || null;
    return parsed?.url || null;
  } catch {
    return typeof val === 'string' ? val : null;
  }
}

const norm = (s) => (s || '').trim();

export default function FloorPlanSection({ property }) {
  const sp = useSearchParams();
  const urlSelectedType =
    (sp.get('unit_types') || sp.get('unit_type') || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)[0] || null;

  const title = property?.title || property?.rawData?.name || 'Project';
  const unitBlocks = Array.isArray(property?.rawData?.unit_blocks)
    ? property.rawData.unit_blocks
    : [];

  // Group by unit_type
  const grouped = useMemo(() => {
    const g = new Map();
    for (const b of unitBlocks) {
      const t = norm(b?.unit_type) || 'Other';
      if (!g.has(t)) g.set(t, []);
      g.get(t).push(b);
    }
    return g;
  }, [unitBlocks]);

  const unitTypes = Array.from(grouped.keys());
  const [activeType, setActiveType] = useState(
    urlSelectedType && unitTypes.includes(urlSelectedType) ? urlSelectedType : unitTypes[0] || 'Floor Plans'
  );

  const blocksForType = grouped.get(activeType) || [];
  const blockLabels = blocksForType.map(
    (b) => norm(b?.name) || norm(b?.unit_type) || 'Floor Plan'
  );
  const [activeBlockLabel, setActiveBlockLabel] = useState(blockLabels[0] || 'Floor Plan');

  const currentBlock =
    blocksForType.find(
      (b) => (norm(b?.name) || norm(b?.unit_type)) === activeBlockLabel
    ) || {};

  // Collect media for current block
  const typical = parseTypicalImage(currentBlock?.typical_unit_image_url);
  const blockFiles = Array.isArray(currentBlock?.floor_plans)
    ? currentBlock.floor_plans.map(fp => fp?.file).filter(Boolean)
    : [];

  // Project-level files (fallback)
  const projectFiles = Array.isArray(property?.rawData?.floor_plans)
    ? property.rawData.floor_plans.map(fp => fp?.file).filter(Boolean)
    : [];

  // All candidates
  const candidateImages = [
    typical,
    ...blockFiles.filter(isImage),
    ...projectFiles.filter(isImage),
  ].filter(Boolean);

  const candidatePdfs = [
    ...blockFiles.filter(isPdf),
    ...projectFiles.filter(isPdf),
  ];

  const [mainImg, setMainImg] = useState(
    candidateImages[0] || '/project_detail_images/design.jpg'
  );

  // Reset main image when block/type changes
  useMemo(() => {
    const first = (candidateImages[0] || '/project_detail_images/design.jpg');
    setMainImg(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType, activeBlockLabel]);

  // Price
  const unitPrice = currentBlock?.units_price_from_aed ?? currentBlock?.price_from_aed ?? null;
  const projectMin = property?.price ?? property?.rawData?.min_price ?? null;
  const displayPrice =
    unitPrice != null
      ? `AED ${Number(unitPrice).toLocaleString()}`
      : projectMin != null
      ? `AED ${Number(projectMin).toLocaleString()}`
      : 'N/A';

  // PDFs (aggregated)
  const allPlansHref =
    property?.rawData?.layouts_pdf ||
    property?.rawData?.floor_plans_pdf ||
    null;

  const brochureHref =
    property?.rawData?.brochure_url ||
    property?.rawData?.marketing_brochure ||
    null;

  const hasAnyMedia =
    candidateImages.length > 0 ||
    candidatePdfs.length > 0 ||
    Boolean(allPlansHref);

  // If no unit_types at all, show a simple fallback from project files/links
  if (!unitTypes.length) {
    return (
      <section className="px-4 py-12 md:px-16 bg-white" dir="ltr">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">
          Floor Plans of {title}
        </h2>

        {!hasAnyMedia ? (
          <div className="text-gray-500">No floor plans available.</div>
        ) : (
          <div className="bg-white border rounded-xl shadow-md p-6">
            {candidateImages.length > 0 && (
              <>
                <div className="relative w-full h-[360px] mb-4">
                  <Image src={candidateImages[0]} alt="Floor plan" fill className="object-contain rounded-md bg-white" />
                </div>
                {candidateImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {candidateImages.map((u, i) => (
                      <Image key={i} src={u} alt={`Plan ${i + 1}`} width={120} height={80} className="rounded-md border object-contain bg-white" />
                    ))}
                  </div>
                )}
              </>
            )}

            {candidatePdfs.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-sm text-gray-600">Floor plans available as PDF:</div>
                <div className="flex flex-wrap gap-2">
                  {candidatePdfs.map((u, i) => (
                    <a
                      key={i}
                      href={u}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-md border text-sm hover:bg-sky-50"
                    >
                      View floor plan #{i + 1} (PDF)
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              {allPlansHref && (
                <a href={allPlansHref} target="_blank" rel="noreferrer" className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-md text-sm font-medium text-center">
                  Open All Floor Plans (PDF)
                </a>
              )}
              {brochureHref && (
                <a href={brochureHref} target="_blank" rel="noreferrer" className="border border-sky-500 hover:bg-sky-100 text-sky-600 px-5 py-2 rounded-md text-sm font-medium text-center">
                  Download Brochure
                </a>
              )}
            </div>
          </div>
        )}
      </section>
    );
  }

  // Full UI with tabs/chips
  return (
    <section className="px-4 py-12 md:px-16 bg-white" dir="ltr">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">
        Floor Plans of {title}
      </h2>

      {/* Unit-type tabs */}
      <div className="flex gap-3 mb-4 overflow-x-auto">
        {unitTypes.map((t) => (
          <button
            key={t}
            onClick={() => {
              setActiveType(t);
              const first = (grouped.get(t) || [])[0];
              const label = norm(first?.name) || norm(first?.unit_type) || 'Floor Plan';
              setActiveBlockLabel(label);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium border ${
              activeType === t ? 'bg-sky-500 text-white' : 'border-sky-300 text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Block chips */}
      {blockLabels.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {blockLabels.map((label) => (
            <button
              key={label}
              onClick={() => setActiveBlockLabel(label)}
              className={`px-3 py-1.5 rounded-full text-xs border ${
                activeBlockLabel === label ? 'bg-sky-600 text-white' : 'border-sky-300 text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Card */}
      {!hasAnyMedia ? (
        <div className="text-gray-500">No floor plans available.</div>
      ) : (
        <div className="bg-white border rounded-xl shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Gallery (only for images) */}
            <div>
              {candidateImages.length > 0 ? (
                <>
                  <div className="relative w-full h-[360px]">
                    <Image src={mainImg} alt={`${activeBlockLabel} floor plan`} fill className="rounded-md object-contain bg-white" />
                  </div>
                  {candidateImages.length > 1 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto">
                      {candidateImages.map((u, i) => (
                        <button
                          key={i}
                          onClick={() => setMainImg(u)}
                          className={`border rounded-md overflow-hidden min-w-[100px] ${
                            mainImg === u ? 'border-sky-500' : 'border-gray-200'
                          }`}
                        >
                          <Image src={u} alt={`thumb ${i + 1}`} width={120} height={80} className="object-contain bg-white" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-gray-600">
                  Floor plans are available as PDF files.
                </div>
              )}
            </div>

            {/* Info + PDF CTAs */}
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{activeBlockLabel}</h3>
                <p className="text-sm text-gray-500 mt-1">Price: {displayPrice}</p>
              </div>

              {/* Block-level PDFs */}
              {candidatePdfs.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm text-gray-600">Floor plans (PDF):</div>
                  <div className="flex flex-wrap gap-2">
                    {candidatePdfs.map((u, i) => (
                      <a
                        key={i}
                        href={u}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-md border text-sm hover:bg-sky-50"
                      >
                        View plan #{i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                {allPlansHref && (
                  <a
                    href={allPlansHref}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-md text-sm font-medium transition-all text-center"
                  >
                    Open All Floor Plans (PDF)
                  </a>
                )}
                {brochureHref && (
                  <a
                    href={brochureHref}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-sky-500 hover:bg-sky-100 text-sky-600 px-5 py-2 rounded-md text-sm font-medium transition-all text-center"
                  >
                    Download Brochure
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
