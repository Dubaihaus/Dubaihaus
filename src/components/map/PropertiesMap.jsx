// src/components/map/PropertiesMap.jsx
'use client';

import { useMemo, useState } from 'react';
import Map, { Marker, Popup, NavigationControl, ScaleControl, Source, Layer } from 'react-map-gl';

const MAPBOX_STYLE = 'mapbox://styles/mapbox/streets-v12';

function toPoint(p) {
  if (p?.lat != null && p?.lng != null && Number.isFinite(p.lat) && Number.isFinite(p.lng)) {
    return { lat: p.lat, lng: p.lng };
  }
  return null;
}

function polygonGeoJSON(project) {
  const poly = project?.locationObj?.polygon || project?.rawData?.location?.polygon;
  if (!poly?.type || !Array.isArray(poly?.coordinates)) return null;
  return { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: poly }] };
}

export default function PropertiesMap({ projects = [], initialView }) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [active, setActive] = useState(null);

  const markers = useMemo(() => {
    return projects
      .map((p) => ({ p, pt: toPoint(p) }))
      .filter((x) => x.pt !== null);
  }, [projects]);

  const start = useMemo(() => {
    if (initialView) return initialView;
    if (markers.length > 0) {
      const { pt } = markers[0];
      return { longitude: pt.lng, latitude: pt.lat, zoom: 12 };
    }
    return { longitude: 55.2708, latitude: 25.2048, zoom: 10 }; // Dubai default
  }, [markers, initialView]);

  const poly = projects.length === 1 ? polygonGeoJSON(projects[0]) : null;

  if (!token) {
    return (
      <div className="w-full h-[480px] rounded-xl border border-gray-200 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <div>Mapbox token not configured</div>
          <div className="text-sm">Check NEXT_PUBLIC_MAPBOX_TOKEN</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
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
            {/* Simple red pin (dot) */}
            <button
              aria-label={p.name || 'Property'}
              className="group -translate-y-1"
              onClick={(e) => {
                e.stopPropagation();
                setActive(p);
              }}
            >
              <div className="h-3 w-3 rounded-full bg-red-600 border-2 border-white shadow-md group-hover:scale-110 transition-transform" />
              {/* small pointer */}
              <div className="mx-auto h-2 w-[2px] bg-red-600" />
            </button>
          </Marker>
        ))}

        {active && (
          <Popup
            longitude={active.lng}
            latitude={active.lat}
            anchor="top"
            closeOnClick={false}
            onClose={() => setActive(null)}
            className="z-50"
          >
            <div className="max-w-xs">
              <div className="font-semibold">{active.title || active.name}</div>
              <div className="text-xs text-gray-600">{active.location}</div>
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
