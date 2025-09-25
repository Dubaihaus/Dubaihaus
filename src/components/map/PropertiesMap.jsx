'use client';

import { useMemo, useState } from 'react';
import Map, {
  Marker,
  Popup,
  NavigationControl,
  ScaleControl,
  Source,
  Layer,
} from 'react-map-gl';

const MAPBOX_STYLE = 'mapbox://styles/mapbox/streets-v12';

function toPoint(p) {
  if (Number.isFinite(p?.lat) && Number.isFinite(p?.lng)) {
    return { lat: p.lat, lng: p.lng };
  }
  // fallback to whatever might exist
  const loc = p.locationObj || p.rawData?.location || p.location;
  const lat = Number(loc?.latitude);
  const lng = Number(loc?.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}
    

function polygonGeoJSON(project) {
  const poly = project?.locationObj?.polygon || project?.location?.polygon || project?.rawData?.location?.polygon;
  if (!poly?.type || !Array.isArray(poly?.coordinates)) return null;

  return {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', properties: {}, geometry: poly },
    ],
  };
}

export default function PropertiesMap({ projects = [], initialView }) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [active, setActive] = useState(null);

  // Debug: log projects to see what we're working with
  console.log('PropertiesMap received projects:', projects);

  const markers = useMemo(
    () => {
      const validMarkers = projects
        .map(p => ({ p, pt: toPoint(p) }))
        .filter(x => x.pt);
      
      console.log('Valid markers found:', validMarkers.length, 'out of', projects.length);
      return validMarkers;
    },
    [projects]
  );

  const start = useMemo(() => {
    if (initialView) return initialView;
    if (markers.length) {
      const firstMarker = markers[0];
      return { 
        longitude: firstMarker.pt.lng, 
        latitude: firstMarker.pt.lat, 
        zoom: 12 
      };
    }
    // Dubai default
    return { longitude: 55.2708, latitude: 25.2048, zoom: 10 };
  }, [markers, initialView]);

  const poly = projects.length === 1 ? polygonGeoJSON(projects[0]) : null;

  if (!token) {
    console.error('Mapbox token not found!');
    return (
      <div className="w-full h-[480px] rounded-xl border border-gray-200 flex items-center justify-center">
        <div className="text-red-500">Mapbox token not configured</div>
      </div>
    );
  }

  return (
    <div className="w-full h-[480px] rounded-xl overflow-hidden border border-gray-200">
      <Map
        mapboxAccessToken={token}
        mapStyle={MAPBOX_STYLE}
        initialViewState={start}
        reuseMaps
      >
        <NavigationControl position="top-right" />
        <ScaleControl />

        {poly && (
          <Source id="project-poly" type="geojson" data={poly}>
            <Layer id="poly-fill" type="fill" paint={{ 'fill-color': '#3b82f6', 'fill-opacity': 0.12 }} />
            <Layer id="poly-line" type="line" paint={{ 'line-color': '#3b82f6', 'line-width': 2 }} />
          </Source>
        )}

        {markers.map(({ p, pt }) => (
          <Marker
            key={p.id}
            longitude={pt.lng}
            latitude={pt.lat}
            anchor="bottom"
            onClick={(e) => { 
              e.originalEvent.stopPropagation(); 
              setActive(p); 
            }}
          >
            <div className="bg-blue-600 text-white text-[11px] px-2 py-1 rounded-md shadow cursor-pointer hover:bg-blue-700 transition-colors">
              {p.minPrice && p.minPrice > 0
                ? `AED ${(Number(p.minPrice) || Number(p.price) || 0).toLocaleString()}`
                : (p.title || p.name || 'Property')}
            </div>
          </Marker>
        ))}

        {active && (
          <Popup
            longitude={toPoint(active)?.lng}
            latitude={toPoint(active)?.lat}
            anchor="top"
            closeOnClick={false}
            onClose={() => setActive(null)}
            className="z-50"
          >
            <div className="max-w-xs">
              <div className="font-semibold">{active.title || active.name}</div>
              <div className="text-xs text-gray-600">
                {active.locationObj ? 
                  [active.locationObj.sector, active.locationObj.district, active.locationObj.region].filter(Boolean).join(', ') 
                  : active.location}
              </div>
              {active.coverImage && (
                <img 
                  src={active.coverImage} 
                  alt={active.title || active.name} 
                  className="mt-2 w-full h-24 object-cover rounded" 
                />
              )}
              <a 
                href={`/ui/project_details/${active.id}`} 
                className="mt-2 inline-block text-blue-600 text-sm font-medium hover:text-blue-800"
              >
                View details →
              </a>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}