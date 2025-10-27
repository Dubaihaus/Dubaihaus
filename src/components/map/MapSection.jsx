// src/components/map/MapSection.jsx
'use client';

import PropertiesMap from './PropertiesMap';

export default function MapSection({
  projects = [],
  title = 'Find your properties on the map',
  initialView,
  className = '',
  height = 480,
  maxWidthClass = 'max-w-5xl', // << new, controls content width
}) {
  const projectsWithCoords = projects.filter(
    (p) => p?.lat != null && p?.lng != null && Number.isFinite(p.lat) && Number.isFinite(p.lng)
  );

  return (
    <section className={`w-full ${className}`}>
      <div className={`mx-auto ${maxWidthClass}`}>
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3">
          {title}
        </h2>

        {projectsWithCoords.length > 0 ? (
          <div
            className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
            style={{ height: `${height}px` }}
          >
            <PropertiesMap projects={projectsWithCoords} initialView={initialView} />
          </div>
        ) : (
          <div
            className="rounded-xl border border-dashed border-gray-300 p-6 text-sm text-gray-500 flex items-center justify-center"
            style={{ height: `${height}px` }}
          >
            <div className="text-center">
              <p className="text-red-500 font-semibold">No properties with valid coordinates available.</p>
              <p className="text-xs mt-2">Found {projects.length} projects but {projects.length - projectsWithCoords.length} have no location data.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
