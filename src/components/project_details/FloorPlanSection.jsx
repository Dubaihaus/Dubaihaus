'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';

function parseTypicalImage(val) {
  if (!val) return null;
  try {
    // typical_unit_image_url sometimes is JSON: [{"url":"..." }] or {"url":"..."}
    const parsed = typeof val === 'string' ? JSON.parse(val) : val;
    if (Array.isArray(parsed)) return parsed[0]?.url || null;
    return parsed?.url || null;
  } catch {
    // if it was a plain URL string, just return it
    return typeof val === 'string' ? val : null;
  }
}

const FloorPlanSection = ({ property }) => {
  // DATA ———
  const unitBlocks = property?.rawData?.unit_blocks || [];
  const title = property?.title || property?.rawData?.name || 'Project';

  // tabs from unit type or block name
  const tabs = unitBlocks.length > 0
    ? unitBlocks.map(b => b?.unit_type || b?.name || 'Floor Plan')
    : ['Floor Plans'];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const currentBlock = useMemo(
    () => unitBlocks.find(b => (b?.unit_type || b?.name) === activeTab) || {},
    [unitBlocks, activeTab]
  );

  // IMAGE ——— try typical_unit_image_url -> block floor_plans[0].file -> project floor_plans[0].file
  let floorPlanImage =
    parseTypicalImage(currentBlock?.typical_unit_image_url) ||
    currentBlock?.floor_plans?.[0]?.file ||
    property?.rawData?.floor_plans?.[0]?.file ||
    '/project_detail_images/design.jpg';

  // PRICE ——— unit price -> project min price
  const unitPrice = currentBlock?.units_price_from_aed ?? currentBlock?.price_from_aed ?? null;
  const projectMin = property?.price ?? property?.rawData?.min_price ?? null;
  const displayPrice =
    unitPrice != null
      ? `AED ${Number(unitPrice).toLocaleString()}`
      : projectMin != null
      ? `AED ${Number(projectMin).toLocaleString()}`
      : 'N/A';

  // PDF LINKS ——— direct links (you said you have full access)
  const allPlansHref =
    property?.rawData?.layouts_pdf || property?.rawData?.floor_plans_pdf || null;
  const brochureHref =
    property?.rawData?.brochure_url || property?.rawData?.marketing_brochure || null;

  return (
    <section className="px-4 py-12 md:px-16 bg-white" dir="ltr">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">
        Floor Plans of {title}
      </h2>

      {/* Tabs */}
      {tabs.length > 1 && (
        <div className="flex space-x-4 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-md text-sm font-medium border ${
                activeTab === tab ? 'bg-sky-500 text-white' : 'border-sky-300 text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Card */}
      <div className="bg-white border rounded-xl shadow-md p-6 md:flex gap-6">
        <div className="flex-shrink-0">
          <Image
            src={floorPlanImage}
            alt={`${activeTab} floor plan`}
            width={300}
            height={300}
            className="rounded-md object-contain w-full h-auto"
          />
        </div>

        <div className="mt-4 md:mt-0 flex flex-col justify-between flex-grow">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {activeTab}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Price: {displayPrice}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            {allPlansHref && (
              <a
                href={allPlansHref}
                target="_blank"
                rel="noreferrer"
                className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-md text-sm font-medium transition-all text-center"
              >
                Open All Floor Plans
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
    </section>
  );
};

export default FloorPlanSection;
