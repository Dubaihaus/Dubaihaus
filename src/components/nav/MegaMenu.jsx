// src/components/nav/MegaMenu.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaUmbrellaBeach,
  FaWater,
  FaLeaf,
  FaGolfBall,
  FaDollarSign,
  FaLandmark,
  FaBuilding,
  FaCrown,
  FaArrowRight,
} from 'react-icons/fa';

// Small helper: turns {k:v} into "?k=v&..."
const toHref = (filters = {}) => {
  const params = new URLSearchParams(
    Object.entries(filters).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    )
  ).toString();
  return `/off-plan${params ? `?${params}` : ''}`;
};

export default function MegaMenu() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);
  const menuRef = useRef(null);

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const onClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Hover helpers (little delay prevents flicker)
  const openNow = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  // --- DATA CONFIG ---
  const categories = [
    {
      title: 'All Properties in Dubai',
      image: '/dashboard/palm1.jpg',
      badge: null,
      filters: {},
    },
    {
      title: 'Apartments',
      image: '/dashboard/Apartments.jpeg',
      badge: 'FROM AED 700,000',
      filters: { unit_types: 'Apartment' },
    },
    {
      title: 'Penthouses',
      image: '/dashboard/Penthhouse.jpeg',
      badge: 'FROM AED 2,000,000',
      filters: { unit_types: 'Penthouse' },
    },
    {
      title: 'Townhouses',
      image: '/dashboard/Townhouse.jpeg',
      badge: 'FROM AED 1,000,000',
      filters: { unit_types: 'Townhouse' },
    },
    {
      title: 'Villas',
      image: '/dashboard/villas.jpg',
      badge: 'FROM AED 1,500,000',
      filters: { unit_types: 'Villa' },
    },
  ];

  const pills = [
    {
      label: 'Beachfront Properties',
      Icon: FaUmbrellaBeach,
      filters: { beachfront: 'true' },
    },
    { label: 'Waterfront Properties', Icon: FaWater, filters: { waterfront: 'true' } },
    { label: 'Dubai Luxury Living', Icon: FaCrown, filters: { luxury: 'true' } },
    { label: 'Green Nature Living', Icon: FaLeaf, filters: { green_living: 'true' } },
    { label: 'Near Golf Course', Icon: FaGolfBall, filters: { near_golf: 'true' } },
    {
      label: 'Properties Below AED 1,000,000',
      Icon: FaDollarSign,
      filters: { price_max: '1000000' },
    },
    {
      label: 'Properties Above AED 1,000,000',
      Icon: FaDollarSign,
      filters: { price_min: '1000000' },
    },
    { label: 'Land Plots', Icon: FaLandmark, filters: { unit_types: 'Plot' } },
    { label: 'Buildings', Icon: FaBuilding, filters: { unit_types: 'Building' } },
    {
      label: 'Branded Residences',
      Icon: FaCrown,
      filters: { branded: 'true' },
    },
  ];

  return (
    <div
      ref={menuRef}
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      {/* Trigger (desktop) */}
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        className="text-sm hover:text-blue-600 transition py-2"
        onFocus={openNow}
        onBlur={closeSoon}
        onClick={() => setOpen((v) => !v)} // good for touch devices
      >
        Properties
      </button>

      {/* Panel */}
      {open && (
        <div
          className="absolute left-1/2 -translate-x-1/2 mt-3 w-[980px] max-w-[95vw] rounded-2xl border bg-white shadow-2xl z-50"
          onMouseEnter={openNow}
          onMouseLeave={closeSoon}
        >
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <div className="text-sm font-semibold text-slate-800">
              Explore Dubai properties
            </div>
          </div>

          <div className="px-5 pb-5">
            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
              {categories.map((c) => (
                <Link
                  key={c.title}
                  href={toHref(c.filters)}
                  className="group rounded-xl overflow-hidden border bg-white hover:shadow-md transition"
                >
                  <div className="relative h-36">
                    <Image
                      src={c.image}
                      alt={c.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1280px) 20vw, 240px"
                    />
                    {c.badge && (
                      <span className="absolute top-2 left-2 bg-sky-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                        {c.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between px-3 py-3 bg-white">
                    <span className="text-sm font-semibold">{c.title}</span>
                    <FaArrowRight className="text-sky-500 text-xs opacity-0 group-hover:opacity-100 transition" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Pills */}
            <div className="mt-5 flex flex-wrap gap-3">
              {pills.map(({ label, Icon, filters }) => (
                <Link
                  key={label}
                  href={toHref(filters)}
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs bg-white hover:border-sky-500 hover:text-sky-600 transition"
                >
                  <Icon className="text-sky-600" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile fallback: show simple link below md if needed */}
      <div className="md:hidden" />
    </div>
  );
}
