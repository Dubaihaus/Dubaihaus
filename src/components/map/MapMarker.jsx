// src/components/map/MapMarker.jsx
'use client';

import { memo } from 'react';

const MapMarker = memo(({ project, onMarkerClick, isActive }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    onMarkerClick(project);
  };

  return (
    <button
      aria-label={project.name || 'Property'}
      className="group transform transition-all duration-200 hover:scale-125"
      onClick={handleClick}
    >
      <div className="relative">
        {/* soft drop shadow "blob" */}
        <div className="absolute inset-0 translate-y-1 flex justify-center pointer-events-none">
          <div className="w-4 h-4 bg-black/20 blur-sm rounded-full" />
        </div>

        {/* main bubble */}
        <div
          className={`relative w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-200
            ${isActive
              ? 'bg-blue-600 scale-125 ring-2 ring-blue-400/50'
              : 'bg-red-500 hover:bg-red-600'
            }`}
        >
          {/* glossy dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-1 h-1 rounded-full opacity-80
                ${isActive ? 'bg-blue-200' : 'bg-white'}
              `}
            />
          </div>
        </div>

        {/* little tail */}
        <div
          className={`mx-auto w-0.5 h-3 mt-0.5 ${
            isActive ? 'bg-blue-600' : 'bg-red-600'
          }`}
        />
      </div>
    </button>
  );
});

MapMarker.displayName = 'MapMarker';

export default MapMarker;
