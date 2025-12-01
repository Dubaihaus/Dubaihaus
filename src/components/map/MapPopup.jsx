// src/components/map/MapPopup.jsx
'use client';

import { memo } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const MapPopup = memo(({ project, onClose }) => {
  const t = useTranslations('map.popup');

  const title = project.title || project.name || t('fallbackTitle');
  const locationText =
    project.location ||
    project?.rawData?.location?.district ||
    t('fallbackLocation');

  return (
    <div className="relative max-w-xs bg-white rounded-lg shadow-lg text-left">
      {project.coverImage && (
        <div className="relative w-full h-32">
          <Image
            src={project.coverImage}
            alt={title}
            fill
            className="object-cover rounded-t-lg"
            sizes="300px"
          />
        </div>
      )}

      <div className="p-3">
        <div className="font-semibold text-gray-900 text-sm mb-1">
          {title}
        </div>

        <div className="text-xs text-gray-600 mb-2">{locationText}</div>

        <a
          href={`/ui/project_details/${project.id}`}
          className="text-blue-600 text-sm font-medium hover:text-blue-800 inline-flex items-center gap-1"
        >
          <span>{t('viewDetails')}</span>
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </a>
      </div>

      {/* close btn */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-xs"
      >
        ×
      </button>
    </div>
  );
});

MapPopup.displayName = 'MapPopup';

export default MapPopup;
