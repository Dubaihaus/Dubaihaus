// src/components/nav/MegaMenu.jsx
'use client';
import { createPortal } from 'react-dom';


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

import { usePathname } from 'next/navigation';

export default function MegaMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);
  const menuRef = useRef(null);
  const panelRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const onClick = (e) => {
      // If clicking inside the trigger or the portal panel, do nothing
      if (
        (menuRef.current && menuRef.current.contains(e.target)) ||
        (panelRef.current && panelRef.current.contains(e.target))
      ) {
        return;
      }
      setOpen(false);
    };
    // Use pointerdown for better touch/click handling
    document.addEventListener('pointerdown', onClick);
    return () => document.removeEventListener('pointerdown', onClick);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
      filters: { building_type: 'Apartment' },
    },
    {
      title: 'Penthouses',
      image: '/dashboard/Penthhouse.jpeg',
      badge: 'FROM AED 2,000,000',
      filters: { building_type: 'Penthouse' },
    },
    {
      title: 'Townhouses',
      image: '/dashboard/Townhouse.jpeg',
      badge: 'FROM AED 1,000,000',
      filters: { building_type: 'Townhouse' },
    },
    {
      title: 'Villas',
      image: '/dashboard/villas.jpg',
      badge: 'FROM AED 1,500,000',
      filters: { building_type: 'Villa' },
    },
  ];

  {/* Pills section removed as per audit (inconsistent filters) */ }

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
      {open && mounted && createPortal(
        <div
          ref={panelRef}
          className="fixed left-1/2 top-[72px] -translate-x-1/2 w-[980px] max-w-[95vw]
               max-h-[calc(100vh-96px)] overflow-y-auto
               rounded-2xl border bg-white shadow-2xl z-[9999]"
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
                  onClick={() => setOpen(false)}
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


          </div>
        </div>,
        document.body
      )}


      {/* Mobile fallback: show simple link below md if needed */}
      <div className="md:hidden" />
    </div>
  );
}
