'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaUmbrellaBeach, FaWater, FaLeaf, FaGolfBall, FaDollarSign, FaLandmark, FaBuilding, FaCrown, FaArrowRight } from 'react-icons/fa';

// Small helper: turns {k:v} into "?k=v&..."
const toHref = (filters = {}) => {
  const params = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== '')
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

  // --- DATA CONFIG (edit freely) ---
  const categories = [
    {
      title: 'All Properties in Dubai',
      image: '/dashboard/building.jpg',
      badge: null,
      filters: {},
    },
    {
      title: 'Apartments',
      image: '/dashboard/apartments.jpg',
      badge: 'FROM AED 700,000',
      filters: { unit_types: 'Apartment' },
    },
    {
      title: 'Penthouses',
      image: '/dashboard/property1.jpg',
      badge: 'FROM AED 2,000,000',
      filters: { unit_types: 'Penthouse' },
    },
    {
      title: 'Townhouses',
      image: '/dashboard/townhouses.jpg',
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
    { label: 'Beachfront Properties', Icon: FaUmbrellaBeach, filters: { beachfront: 'true' } },
    { label: 'Waterfront Properties', Icon: FaWater, filters: { waterfront: 'true' } },
    { label: 'Dubai Luxury Living', Icon: FaCrown, filters: { luxury: 'true' } },
    { label: 'Green Nature Living', Icon: FaLeaf, filters: { green_living: 'true' } },
    { label: 'Near Golf Course', Icon: FaGolfBall, filters: { near_golf: 'true' } },
    { label: 'Properties Below AED 1,000,000', Icon: FaDollarSign, filters: { price_max: '1000000' } },
    { label: 'Properties Above AED 1,000,000', Icon: FaDollarSign, filters: { price_min: '1000000' } },
    { label: 'Land Plots', Icon: FaLandmark, filters: { unit_types: 'Plot' } },
    { label: 'Buildings', Icon: FaBuilding, filters: { unit_types: 'Building' } },
    { label: 'Branded Residences', Icon: FaCrown, filters: { branded: 'true' } },
  ];

//   const rightPanel = {
//     title: 'Revered schools for families:',
//     bullets: [
//       'RAK Academy within 15 min',
//       'GEMS Westminster School within 20 min',
//       'Nurseries and early learning centers within 15–20 min',
//     ],
//   };

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
          className="absolute left-1/2 -translate-x-1/2 mt-3 w-[980px] max-w-[95vw] rounded-xl border bg-white shadow-2xl"
          onMouseEnter={openNow}
          onMouseLeave={closeSoon}
        >
          <div className="grid grid-cols-12 gap-6 p-4">
            {/* Left: cards + pills */}
            <div className="col-span-12 lg:col-span-9">
              {/* Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                {categories.map((c) => (
                  <Link
                    key={c.title}
                    href={toHref(c.filters)}
                    className="group rounded-lg overflow-hidden border hover:shadow-md transition"
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
                    <div className="flex items-center justify-between p-3 bg-white">
                      <span className="text-sm font-semibold">{c.title}</span>
                      <FaArrowRight className="text-sky-500 text-xs opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pills */}
              <div className="mt-4 flex flex-wrap gap-3">
                {pills.map(({ label, Icon, filters }) => (
                  <Link
                    key={label}
                    href={toHref(filters)}
                    className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs hover:border-sky-500 hover:text-sky-600 transition"
                  >
                    <Icon className="text-sky-600" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: info panel */}
            {/* <div className="hidden lg:block col-span-3">
              <div className="h-full rounded-xl bg-gray-50 p-4">
                <div className="font-semibold mb-2">{rightPanel.title}</div>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {rightPanel.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            </div> */}
          </div>
        </div>
      )}

      {/* Mobile fallback: show simple link below md */}
      <div className="md:hidden">
        {/* Optionally render a plain link in your mobile menu */}
      </div>
    </div>
  );
}
