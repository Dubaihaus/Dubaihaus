// src/components/footer.js
'use client';

import '@fortawesome/fontawesome-free/css/all.min.css';
import Link from 'next/link';
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaYoutube,
} from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';
import { SiX } from 'react-icons/si';
import { useFooterData } from '@/hooks/useFooterData';

/* --------- tiny helper to render safe links ---------- */
function SafeInternalLink({ href, children, className }) {
  if (!href || typeof href !== 'string') {
    return <span className={className}>{children}</span>;
  }
  const isExternal = /^https?:\/\//i.test(href);
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

const SkeletonList = () => (
  <ul className="space-y-2">
    {Array.from({ length: 6 }).map((_, i) => (
      <li key={i} className="h-3 rounded bg-white/30 animate-pulse" />
    ))}
  </ul>
);

export default function Footer() {
  const { data, isLoading } = useFooterData();

  // Limits per-column
  const MAX_DUBAI_DEVS = 16;
  const MAX_OTHERS = 8;

  // Always keep arrays safe, even if API doesn't return a key yet
  const developers = data?.developers ?? []; // Dubai devs
  const abuDhabiDevelopers = data?.abuDhabiDevelopers ?? []; // Abu Dhabi devs
  const areas = data?.areas ?? []; // Popular areas in Dubai
  const abuDhabiAreas = data?.abuDhabiAreas ?? []; // Properties in Abu Dhabi
  const usefulLinks = data?.usefulLinks ?? [];

  return (
    <footer className="relative bg-brand-sky text-white overflow-hidden">
      {/* Background image layer */}
      <div
        className="absolute inset-0 bg-[url('/dashboard/building.jpg')] bg-cover bg-center opacity-20"
        aria-hidden="true"
      />

      {/* Main content */}
      <div className="relative max-w-screen-xl mx-auto px-4 py-10 space-y-8">
        {/* Top columns */}
        <div className="grid md:grid-cols-5 sm:grid-cols-2 gap-8">
          {/* Developers in Dubai */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Developers in Dubai</h3>
            {isLoading ? (
              <SkeletonList />
            ) : (
              <ul className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                {developers.slice(0, MAX_DUBAI_DEVS).map((d, idx) => (
                  <li key={`${d?.name || 'dev'}-${idx}`}>
                    <SafeInternalLink
                      href={d?.href}
                      className="hover:underline"
                    >
                      {d?.name || 'Developer'}
                    </SafeInternalLink>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Developers in Abu Dhabi */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Developers in Abu Dhabi
            </h3>
            {isLoading ? (
              <SkeletonList />
            ) : (
              // single-column list
              <ul className="space-y-1 text-sm">
                {abuDhabiDevelopers.slice(0, MAX_OTHERS).map((d, idx) => (
                  <li key={`${d?.name || 'abu-dev'}-${idx}`}>
                    <SafeInternalLink
                      href={d?.href}
                      className="hover:underline"
                    >
                      {d?.name || 'Developer'}
                    </SafeInternalLink>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Popular Areas (Dubai) */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Popular Areas in Dubai
            </h3>
            {isLoading ? (
              <SkeletonList />
            ) : (
              <ul className="space-y-1 text-sm">
                {areas.slice(0, MAX_OTHERS).map((a, idx) => (
                  <li key={`${a?.name || 'area'}-${idx}`}>
                    <SafeInternalLink
                      href={a?.href}
                      className="hover:underline"
                    >
                      {a?.name || 'Area'}
                    </SafeInternalLink>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Properties in Abu Dhabi */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Properties in Abu Dhabi
            </h3>
            {isLoading ? (
              <SkeletonList />
            ) : (
              <ul className="space-y-1 text-sm">
                {abuDhabiAreas.slice(0, MAX_OTHERS).map((t, idx) => (
                  <li key={`${t?.name || 'abu-dhabi-area'}-${idx}`}>
                    <SafeInternalLink
                      href={t?.href}
                      className="hover:underline"
                    >
                      {t?.name || 'Area'}
                    </SafeInternalLink>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Useful Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Useful Links</h3>
            {isLoading ? (
              <SkeletonList />
            ) : (
              <ul className="space-y-1 text-sm">
                {usefulLinks.map((u, idx) => (
                  <li key={`${u?.name || 'link'}-${idx}`}>
                    <SafeInternalLink
                      href={u?.href}
                      className="hover:underline"
                    >
                      {u?.name || 'Link'}
                    </SafeInternalLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Navigation Arrows → clickable regions */}
        <div className="flex flex-wrap gap-4 text-sm font-medium">
          {[
            { label: 'Properties in Dubai', href: '/off-plan?region=Dubai' },
            {
              label: 'Properties in Abu Dhabi',
              href: '/off-plan?region=Abu Dhabi',
            },
            {
              label: 'Properties in Ras Al Khaimah',
              href: '/off-plan?region=Ras Al Khaimah',
            },
            {
              label: 'Properties in Sharjah',
              href: '/off-plan?region=Sharjah',
            },
            { label: 'Properties in Ajman', href: '/off-plan?region=Ajman' },
            {
              label: 'Properties in Umm Al Quwain',
              href: '/off-plan?region=Umm Al Quwain',
            },
          ].map((item) => (
            <SafeInternalLink
              key={item.label}
              href={item.href}
              className="flex items-center space-x-2 hover:underline"
            >
              <FiArrowRight className="text-xl" />
              <span>{item.label}</span>
            </SafeInternalLink>
          ))}
        </div>

        {/* Bottom Links & Social Icons */}
        <div className="flex flex-wrap items-center justify-between border-t border-white/20 pt-6 relative z-10">
          <div className="flex gap-6 text-sm mb-4 sm:mb-0">
            <Link href="/legal?tab=terms" className="hover:underline">
              Terms &amp; Conditions
            </Link>
            <Link href="/legal?tab=privacy" className="hover:underline">
              Privacy Policy
            </Link>
          </div>

          {/* Socials */}
          <div className="flex items-center gap-4 text-xl">
            <a
              href="https://www.facebook.com/share/1DEkRn4pMb/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:text-blue-500 transition-colors"
            >
              <FaFacebookF />
            </a>

            <a
              href="https://www.instagram.com/dubai_haus?igsh=MWRoNmF1emwwanh4cg%3D%3D&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-pink-500 transition-colors"
            >
              <FaInstagram />
            </a>

            <a
              href="https://youtube.com/@dubaihaus?si=nS7Q64bf6gPWSD_k"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="hover:text-red-500 transition-colors"
            >
              <FaYoutube />
            </a>

            <a
              href="https://x.com/dubaihaus?s=21&t=a4oLtuzI6wKe-l8h8goJ5g"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="hover:text-gray-300 transition-colors"
            >
              <SiX />
            </a>

            <a
              href="https://www.tiktok.com/@dubaihaus.com?_t=ZS-90ypelf0PUw&_r=1"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="hover:text-gray-100 transition-colors"
            >
              <i className="fab fa-tiktok text-xl" />
            </a>

            <a
              href="https://wa.me/971505231194"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="hover:text-green-400 transition-colors"
            >
              <FaWhatsapp />
            </a>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <div className="fixed right-4 bottom-4 md:right-6 md:bottom-6 z-50 flex flex-col gap-3 pb-[env(safe-area-inset-bottom)]">
        <a
          href="https://wa.me/971505231194"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="h-12 w-12 grid place-items-center rounded-full bg-green-500 shadow-lg hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-white/60"
        >
          <FaWhatsapp className="text-white text-xl" />
        </a>
      </div>

      <div className="relative text-center py-4 text-sm text-white z-10">
        © {new Date().getFullYear()} Dubai Haus
      </div>
    </footer>
  );
}
