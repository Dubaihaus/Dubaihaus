// src/components/map/PropertiesMap.jsx
'use client';

import { useMemo, useState, useCallback, lazy, Suspense } from 'react';

// Lazy load map components
const Map = lazy(() => import('react-map-gl').then(mod => ({ default: mod.Map })));
const Marker = lazy(() => import('react-map-gl').then(mod => ({ default: mod.Marker })));
const Popup = lazy(() => import('react-map-gl').then(mod => ({ default: mod.Popup })));
const NavigationControl = lazy(() => import('react-map-gl').then(mod => ({ default: mod.NavigationControl })));
const ScaleControl = lazy(() => import('react-map-gl').then(mod => ({ default: mod.ScaleControl })));

import MapMarker from './MapMarker';
import MapPopup from './MapPopup';

const MAPBOX_STYLE = 'mapbox://styles/mapbox/mapbox-streets-v12';

function MapLoading() {
  return (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading 3D map…</p>
      </div>
    </div>
  );
}

function MarkersLoading() {
  return (
    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg z-10">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span>Loading properties…</span>
      </div>
    </div>
  );
}

function toPoint(p) {
  if (p?.lat != null && p?.lng != null && Number.isFinite(p.lat) && Number.isFinite(p.lng)) {
    return { lat: p.lat, lng: p.lng };
  }
  return null;
}

export default function PropertiesMap({
  projects = [],
  initialView,
  showMarkers = true,
  markersLoading = false
}) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [activeProject, setActiveProject] = useState(null);

  // Convert projects to markers
  const markers = useMemo(() => {
    if (!showMarkers) return [];
    return projects
      .map(p => ({ p, pt: toPoint(p) }))
      .filter(x => x.pt !== null);
  }, [projects, showMarkers]);

  // Initial view state
  const initialViewState = useMemo(() => {
    if (initialView) return initialView;
    if (markers.length > 0) {
      const { pt } = markers[0];
      return { 
        longitude: pt.lng, 
        latitude: pt.lat, 
        zoom: 12,
        pitch: 60,
        bearing: -20
      };
    }
    return { 
      longitude: 55.2708, 
      latitude: 25.2048, 
      zoom: 11,
      pitch: 60,
      bearing: -20
    };
  }, [markers, initialView]);

  // Event handlers
  const handleMarkerClick = useCallback((project) => {
    setActiveProject(project);
  }, []);

  const handlePopupClose = useCallback(() => {
    setActiveProject(null);
  }, []);

  // Add 3D buildings on map load
  const handleMapLoad = useCallback((event) => {
    const map = event.target;
    
    // Add 3D buildings if not already present
    if (!map.getLayer('3d-buildings')) {
      map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate', 
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.6
        }
      });
    }
  }, []);

  if (!token) {
    return (
      <div className="w-full h-full rounded-xl border border-gray-200 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <div>Mapbox token not configured</div>
          <div className="text-sm">Check NEXT_PUBLIC_MAPBOX_TOKEN</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Loading indicator */}
      {markersLoading && <MarkersLoading />}

      {/* 3D controls hint */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg z-10">
        <div className="text-xs text-gray-600">
          <div className="font-medium mb-1">3D Controls:</div>
          <div>• Drag to rotate</div>
          <div>• Shift + drag to tilt</div>
          <div>• Scroll to zoom</div>
        </div>
      </div>

      {/* Map */}
      <Suspense fallback={<MapLoading />}>
        <Map
          mapboxAccessToken={token}
          mapStyle={MAPBOX_STYLE}
          initialViewState={initialViewState}
          reuseMaps
          cooperativeGestures
          maxPitch={85}
          onLoad={handleMapLoad}
        >
          <Suspense fallback={null}>
            <NavigationControl position="top-right" />
            <ScaleControl />
          </Suspense>

          {/* Markers */}
          {showMarkers && markers.map(({ p, pt }) => (
            <Suspense key={p.id} fallback={null}>
              <Marker
                longitude={pt.lng}
                latitude={pt.lat}
                anchor="bottom"
              >
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
                <MapPopup project={activeProject} onClose={handlePopupClose} />
              </Popup>
            </Suspense>
          )}
        </Map>
      </Suspense>
    </div>
  );
}