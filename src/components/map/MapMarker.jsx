// src/components/map/MapMarker.jsx
'use client';

import { useState } from 'react';

export default function MapMarker({ project, onMarkerClick, onHoverChange, isActive }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    onMarkerClick?.(project);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHoverChange?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHoverChange?.(false);
  };

  const price = project.minPrice || project.price_from || project.price;
  const currency = project.currency || project.priceCurrency || 'AED';
  const status = project.status || project.sale_status || '';

  const isOutOfStock = () => {
    const s = (status || "").toLowerCase();
    return s === 'out_of_stock' || s === 'sold_out' || s === 'sold';
  };

  const isOOS = isOutOfStock();

  return (
    <div className="relative">
      <button
        aria-label={project.name || 'Property'}
        className="group transform transition-all duration-200 hover:scale-125 relative"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative">
          {/* soft drop shadow "blob" */}
          <div className="absolute inset-0 translate-y-1 flex justify-center pointer-events-none">
            <div className="w-4 h-4 bg-black/20 blur-sm rounded-full" />
          </div>

          {/* main bubble */}
          <div
            className={`relative w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-200 ${isActive
                ? 'bg-sky-600 scale-125 ring-2 ring-sky-400/50'
                : isOOS
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-sky-400 hover:bg-sky-500' // Using slightly lighter sky blue for default state
              }`}
          >
            {/* glossy dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`w-1 h-1 rounded-full opacity-80 ${isActive ? 'bg-sky-200' : 'bg-white'
                  }`}
              />
            </div>
          </div>

          {/* little tail */}
          <div
            className={`mx-auto w-0.5 h-3 mt-0.5 ${isActive ? 'bg-sky-600' : isOOS ? 'bg-red-600' : 'bg-sky-500'
              }`}
          />
        </div>
      </button>

      {/* Hover tooltip — z-50 is sufficient here because the Marker wrapper
           itself is elevated to z-9999 by PropertiesMap when isHovered */}
      {isHovered && !isActive && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-8 pointer-events-none z-50">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 px-3 py-2 text-sm whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
            {/* Image Thumbnail */}
            {(project.coverPhoto || project.featured_image || project.cover || project.main_image || project?.media?.photos?.[0] || project?.cover_image?.url || project?.rawData?.cover_image?.url || project?.images?.[0]) && (
              <div className="mb-2 w-full h-28 min-w-[150px] overflow-hidden rounded-md bg-gray-100">
                <img
                  src={project.coverPhoto || project.featured_image || project.cover || project.main_image || project?.media?.photos?.[0] || project?.cover_image?.url || project?.rawData?.cover_image?.url || project?.images?.[0]}
                  alt={project.name || project.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="font-semibold text-gray-900 mb-1">
              {project.name || project.title}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              {price && (
                <span className="font-medium text-blue-600">
                  {currency} {Number(price).toLocaleString()}
                </span>
              )}
              {status && (
                <span className="px-2 py-0.5 bg-gray-100 rounded-full capitalize">
                  {status.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="w-2 h-2 bg-white border-r border-b border-gray-200 rotate-45" />
          </div>
        </div>
      )}
    </div>
  );
}
