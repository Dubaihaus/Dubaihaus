// src/components/Navbar.jsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import LocaleSwitcher from './LocaleSwitcher';
import Link from 'next/link';
import MegaMenu from './nav/MegaMenu';
import DevelopersMegaMenu from './nav/Developers';
import AreasMegaMenu from './nav/Areas';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mobilePropsOpen, setMobilePropsOpen] = useState(false);
  const [mobileDevsOpen, setMobileDevsOpen] = useState(false);
  const t = useTranslations();

  const OTHER_LINKS = [
    'navbar.events',
    'navbar.comingSoon',
    // 'navbar.developers'  // ← removed (we render custom)
    //'navbar.areas',
    'navbar.map',
    'navbar.videos',
    'navbar.faq',
    'navbar.blog',
  ];

  return (
    <nav className="w-full border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Dubai Off Plan" className="h-8 w-auto" />
           
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex gap-6 items-center">
            <MegaMenu label={t('navbar.properties')} />
            <AreasMegaMenu label={t('navbar.areas')} />
            <DevelopersMegaMenu label={t('navbar.developers')} />
            {OTHER_LINKS.map((key) => (
              <a key={key} href="#" className="text-sm hover:text-blue-600 transition">
                <TranslatedText translationKey={key} />
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            <LocaleSwitcher />
            <div className="bg-sky-500 text-white rounded-full p-2 cursor-pointer hover:bg-sky-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium"><TranslatedText translationKey="navbar.find" /></span>
          </div>

          {/* Mobile button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden mt-2 space-y-2 pb-3">
            {/* Properties section */}
            <button
              onClick={() => setMobilePropsOpen((v) => !v)}
              className="w-full flex items-center justify-between text-left text-sm py-2 border-b"
            >
              <span>{t('navbar.properties')}</span>
              {mobilePropsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {mobilePropsOpen && (
              <div className="pl-3 space-y-2">
                <MobileSubLink href="/off-plan" label={t('navbar.properties')} />
                <MobileSubLink href="/off-plan?unit_types=Apartment" label={t('offPlan.propertyTypes.apartments.title') ?? 'Apartments'} />
                <MobileSubLink href="/off-plan?unit_types=Penthouse" label={t('offPlan.propertyTypes.penthouses.title') ?? 'Penthouses'} />
                <MobileSubLink href="/off-plan?unit_types=Townhouse" label={t('offPlan.propertyTypes.townhouses.title') ?? 'Townhouses'} />
                <MobileSubLink href="/off-plan?unit_types=Villa" label={t('offPlan.propertyTypes.villas.title') ?? 'Villas'} />
              </div>
            )}

            {/* Developers section */}
            <button
              onClick={() => setMobileDevsOpen((v) => !v)}
              className="w-full flex items-center justify-between text-left text-sm py-2 border-b"
            >
              <span>{t('navbar.developers')}</span>
              {mobileDevsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {mobileDevsOpen && (
              <div className="pl-3 space-y-2">
                <MobileSubLink href="/developers" label={t('navbar.developers')} />
                {/* A few popular developer filters */}
                <MobileSubLink href="/off-plan?developer=emaar" label="Emaar" />
                <MobileSubLink href="/off-plan?developer=damac" label="DAMAC" />
                <MobileSubLink href="/off-plan?developer=nakheel" label="Nakheel" />
              </div>
            )}

            {OTHER_LINKS.map((key) => (
              <a key={key} href="#" className="block text-sm py-2 border-b">
                <TranslatedText translationKey={key} />
              </a>
            ))}

            <LocaleSwitcher />
          </div>
        )}
      </div>
    </nav>
  );
}

function TranslatedText({ translationKey }) {
  const t = useTranslations();
  return t(translationKey);
}

function MobileSubLink({ href, label }) {
  return (
    <Link href={href} className="block text-sm py-2 border-b border-dashed">
      {label}
    </Link>
  );
}
