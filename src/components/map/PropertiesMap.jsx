// src/components/map/PropertiesMap.jsx
'use client';

import { useMemo, useState, useCallback, lazy, Suspense } from 'react';
import { useTranslations } from 'next-intl';

// Lazy load map components
const Map = lazy(() =>
  import('react-map-gl').then((mod) => ({ default: mod.Map }))
);
const Marker = lazy(() =>
  import('react-map-gl').then((mod) => ({ default: mod.Marker }))
);
const Popup = lazy(() =>
  import('react-map-gl').then((mod) => ({ default: mod.Popup }))
);
const NavigationControl = lazy(() =>
  import('react-map-gl').then((mod) => ({ default: mod.NavigationControl }))
);
const ScaleControl = lazy(() =>
  import('react-map-gl').then((mod) => ({ default: mod.ScaleControl }))
);

import MapMarker from './MapMarker';
import MapPopup from './MapPopup';

// 2D, colored street style (no dark 3D feel)
const MAPBOX_STYLE = 'mapbox://styles/mapbox/streets-v12';

function MapLoading() {
  const tSection = useTranslations('map.section');
  return (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{tSection('loading')}</p>
      </div>
    </div>
  );
}

function MarkersLoading() {
  const tStatus = useTranslations('map.status');
  return (
    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg z-10">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span>{tStatus('markersLoading')}</span>
      </div>
    </div>
  );
}

function toPoint(p) {
  if (
    p?.lat != null &&
    p?.lng != null &&
    Number.isFinite(p.lat) &&
    Number.isFinite(p.lng)
  ) {
    return { lat: p.lat, lng: p.lng };
  }
  return null;
}

export default function PropertiesMap({
  projects = [],
  initialView,
  showMarkers = true,
  markersLoading = false,
}) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const tStatus = useTranslations('map.status');
  const [activeProject, setActiveProject] = useState(null);

  // Convert projects to markers
  const markers = useMemo(() => {
    if (!showMarkers) return [];
    return projects
      .map((p) => ({ p, pt: toPoint(p) }))
      .filter((x) => x.pt !== null);
  }, [projects, showMarkers]);

  // Initial view state – 2D (no pitch/bearing)
  const initialViewState = useMemo(() => {
    if (initialView) {
      return {
        ...initialView,
        pitch: 0,
        bearing: 0,
      };
    }

    if (markers.length > 0) {
      const { pt } = markers[0];
      return {
        longitude: pt.lng,
        latitude: pt.lat,
        zoom: 12,
        pitch: 0,
        bearing: 0,
      };
    }

    // Default to Dubai
    return {
      longitude: 55.2708,
      latitude: 25.2048,
      zoom: 11,
      pitch: 0,
      bearing: 0,
    };
  }, [markers, initialView]);

  // Event handlers
  const handleMarkerClick = useCallback((project) => {
    setActiveProject(project);
  }, []);

  const handlePopupClose = useCallback(() => {
    setActiveProject(null);
  }, []);

  if (!token) {
    return (
      <div className="w-full h-full rounded-xl border border-gray-200 flex items-center justify-center bg-gray-50">
        <div className="text-red-500 text-center">
          <div>{tStatus('mapboxMissingTitle')}</div>
          <div className="text-sm text-gray-500 mt-1">
            {tStatus('mapboxMissingBody')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Loading indicator for markers */}
      {markersLoading && <MarkersLoading />}

      <Suspense fallback={<MapLoading />}>
        <Map
          mapboxAccessToken={token}
          mapStyle={MAPBOX_STYLE}
          initialViewState={initialViewState}
          reuseMaps
          cooperativeGestures
          maxPitch={0} // lock to 2D
        >
          <Suspense fallback={null}>
            <NavigationControl position="top-right" />
            <ScaleControl />
          </Suspense>

          {/* Markers */}
          {showMarkers &&
            markers.map(({ p, pt }) => (
              <Suspense key={p.id} fallback={null}>
                <Marker longitude={pt.lng} latitude={pt.lat} anchor="bottom">
                  <MapMarker
                    project={p}
                    onMarkerClick={handleMarkerClick}
                    isActive={activeProject?.id === p.id}
                  />
                </Marker>
              </Suspense>
            ))}

          {/* Popup */}
          {activeProject && (
            <Suspense fallback={null}>
              <Popup
                longitude={activeProject.lng}
                latitude={activeProject.lat}
                anchor="top"
                closeOnClick={false}
                onClose={handlePopupClose}
                closeButton={false}
              >
                <MapPopup
                  project={activeProject}
                  onClose={handlePopupClose}
                />
              </Popup>
            </Suspense>
          )}
        </Map>
      </Suspense>
    </div>
  );
}
