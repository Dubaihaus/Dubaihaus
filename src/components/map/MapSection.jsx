'use client';

import PropertiesMap from './PropertiesMap';
export default function MapSection({
  projects = [],
  title = 'Find your properties on the map',
  initialView,         
  className = '',
  height = 480,        
}) {
  const validCount = projects.filter(p => {
    const loc = p.locationObj || p.location || p.rawData?.location;
    if (!loc) return false;
    
    const lat = Number(loc.latitude || loc.lat);
    const lng = Number(loc.longitude || loc.lng);
    
    return Number.isFinite(lat) && Number.isFinite(lng);
  }).length;

  return (
    <section className={`w-full ${className}`}>
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3">
        {title}
      </h2>

      {validCount > 0 ? (
        <div style={{ height }}>
          <PropertiesMap projects={projects} initialView={initialView} />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 p-6 text-sm text-gray-500">
          No properties with valid coordinates yet. 
          {projects.length > 0 && ` Found ${projects.length} projects but none have valid coordinates.`}
        </div>
      )}
    </section>
  );
}
