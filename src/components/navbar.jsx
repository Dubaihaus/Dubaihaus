// src/components/Navbar.jsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import MegaMenu from './nav/MegaMenu';
import DevelopersMegaMenu from './nav/Developers';
import AreasMegaMenu from './nav/Areas';

export default function Navbar() {
  const t = useTranslations();

  const [isOpen, setIsOpen] = useState(false);
  const [mobilePropsOpen, setMobilePropsOpen] = useState(false);
  const [mobileDevsOpen, setMobileDevsOpen] = useState(false);

  // Language dropdown + popup
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en'); // 'en' or 'de'
  const [showLangPopup, setShowLangPopup] = useState(false);

  // Blog "coming soon" popup
  const [showBlogPopup, setShowBlogPopup] = useState(false);

  /**
   * Other nav links (no Events, no Videos)
   * type:
   * - "normal"    -> regular link
   * - "comingSoon"-> Coming Soon Projects but opens /off-plan
   * - "blog"      -> show popup
   */
  const OTHER_LINKS = [
    { key: 'navbar.comingSoon', href: '/off-plan', type: 'comingSoon' },
    { key: 'navbar.map', href: '/map', type: 'normal' }, // adjust /map route if different
    { key: 'navbar.faq', href: '/faq', type: 'normal' },
    { key: 'navbar.blog', href: '#', type: 'blog' },
  ];

  const handleLangSelect = (lang) => {
    if (lang === 'de') {
      // Only show popup for German at the moment
      setLangOpen(false);
      setShowLangPopup(true);
      return;
    }
    setSelectedLang('en');
    setLangOpen(false);
    // later you can plug real locale change here if you want
  };

  const handleOtherLinkClick = (event, type) => {
    if (type === 'blog') {
      event.preventDefault();
      setShowBlogPopup(true);
    }
    // "comingSoon" and "normal" just follow their href
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Dubai Haus Logo"
              className="h-9 w-auto"
            />
          </Link>

          {/* Desktop menu */}
          <div className="hidden items-center gap-6 md:flex">
            <MegaMenu label={t('navbar.properties')} />
            <AreasMegaMenu label={t('navbar.areas')} />
            <DevelopersMegaMenu label={t('navbar.developers')} />

            {OTHER_LINKS.map(({ key, href, type }) => (
              <Link
                key={key}
                href={href}
                onClick={(e) => handleOtherLinkClick(e, type)}
                className="text-sm font-medium text-slate-700 hover:text-sky-700 transition-colors"
              >
                <TranslatedText translationKey={key} />
              </Link>
            ))}
          </div>

          {/* Right side (desktop) */}
          <div className="hidden items-center gap-4 md:flex">
            {/* Language pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:border-sky-400 hover:text-sky-700 transition"
              >
                {/* Flag */}
                <span className="text-base leading-none">
                  {selectedLang === 'en' ? '🇬🇧' : '🇩🇪'}
                </span>
                <span className="uppercase">
                  {selectedLang === 'en' ? 'EN' : 'DE'}
                </span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lg z-50">
                  <button
                    type="button"
                    onClick={() => handleLangSelect('en')}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-slate-700 hover:bg-slate-100"
                  >
                    <span className="text-base">🇬🇧</span>
                    <span className="text-xs font-medium uppercase">EN</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLangSelect('de')}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-slate-700 hover:bg-slate-100"
                  >
                    <span className="text-base">🇩🇪</span>
                    <span className="text-xs font-medium uppercase">DE</span>
                  </button>
                </div>
              )}
            </div>

            {/* Search pill */}
            <button className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-sky-600 transition">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span>{t('navbar.find')}</span>
            </button>
          </div>

          {/* Mobile button + language */}
          <div className="flex items-center gap-3 md:hidden">
            {/* Mobile language pill */}
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700"
            >
              <span>{selectedLang === 'en' ? '🇬🇧' : '🇩🇪'}</span>
              <span className="uppercase">
                {selectedLang === 'en' ? 'EN' : 'DE'}
              </span>
              <ChevronDown className="h-3 w-3" />
            </button>

            <button
              onClick={() => setIsOpen((v) => !v)}
              className="rounded-md p-1.5 text-slate-800 hover:bg-slate-100"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Click catcher to close language dropdown on desktop */}
        {langOpen && (
          <div
            className="fixed inset-0 z-40 hidden md:block"
            onClick={() => setLangOpen(false)}
          />
        )}

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 pb-4 pt-2 text-sm">
            {/* Properties section */}
            <button
              onClick={() => setMobilePropsOpen((v) => !v)}
              className="flex w-full items-center justify-between border-b py-2 text-left font-medium text-slate-800"
            >
              <span>{t('navbar.properties')}</span>
              {mobilePropsOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {mobilePropsOpen && (
              <div className="space-y-1 border-b pb-2 pl-3">
                <MobileSubLink
                  href="/off-plan"
                  label={t('navbar.properties')}
                />
                <MobileSubLink
                  href="/off-plan?unit_types=Apartment"
                  label={
                    t('offPlan.propertyTypes.apartments.title') ??
                    'Apartments'
                  }
                />
                <MobileSubLink
                  href="/off-plan?unit_types=Penthouse"
                  label={
                    t('offPlan.propertyTypes.penthouses.title') ??
                    'Penthouses'
                  }
                />
                <MobileSubLink
                  href="/off-plan?unit_types=Townhouse"
                  label={
                    t('offPlan.propertyTypes.townhouses.title') ??
                    'Townhouses'
                  }
                />
                <MobileSubLink
                  href="/off-plan?unit_types=Villa"
                  label={
                    t('offPlan.propertyTypes.villas.title') ??
                    'Villas'
                  }
                />
              </div>
            )}

            {/* Developers section */}
            <button
              onClick={() => setMobileDevsOpen((v) => !v)}
              className="flex w-full items-center justify-between border-b py-2 text-left font-medium text-slate-800"
            >
              <span>{t('navbar.developers')}</span>
              {mobileDevsOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {mobileDevsOpen && (
              <div className="space-y-1 border-b pb-2 pl-3">
                <MobileSubLink
                  href="/developers"
                  label={t('navbar.developers')}
                />
                <MobileSubLink
                  href="/off-plan?developer=emaar"
                  label="Emaar"
                />
                <MobileSubLink
                  href="/off-plan?developer=damac"
                  label="DAMAC"
                />
                <MobileSubLink
                  href="/off-plan?developer=nakheel"
                  label="Nakheel"
                />
              </div>
            )}

            {/* Other links (mobile) */}
            <div className="mt-2 space-y-1">
              {OTHER_LINKS.map(({ key, href, type }) => (
                <Link
                  key={key}
                  href={href}
                  onClick={(e) => handleOtherLinkClick(e, type)}
                  className="block border-b py-2 text-slate-700"
                >
                  <TranslatedText translationKey={key} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* "Coming soon" popup for German */}
      {showLangPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-lg">
              🇩🇪
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              German language is coming soon
            </h3>
            <p className="mb-4 text-sm text-slate-600">
              We&apos;re working on a full German experience for Dubai Haus.
              For now, the website is available in English.
            </p>
            <button
              type="button"
              onClick={() => setShowLangPopup(false)}
              className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-white shadow-md hover:bg-sky-600 transition"
            >
              Okay, got it
            </button>
          </div>
        </div>
      )}

      {/* "Coming soon" popup for Blog */}
      {showBlogPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-lg">
              📝
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              Blog is coming soon
            </h3>
            <p className="mb-4 text-sm text-slate-600">
              We&apos;re preparing insights, guides, and market updates for the
              Dubai real estate market. Stay tuned!
            </p>
            <button
              type="button"
              onClick={() => setShowBlogPopup(false)}
              className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-white shadow-md hover:bg-sky-600 transition"
            >
              Okay, got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function TranslatedText({ translationKey }) {
  const t = useTranslations();
  return t(translationKey);
}

function MobileSubLink({ href, label }) {
  return (
    <Link
      href={href}
      className="block border-b border-dashed py-2 text-slate-700"
    >
      {label}
    </Link>
  );
}
