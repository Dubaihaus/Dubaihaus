// src/components/developers/DevelopersHero.jsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function DevelopersHero({ total }) {
  const [search, setSearch] = useState('');
  const t = useTranslations('developers.hero');

  return (
    <header
      className="
    relative border-b border-sky-100/60
    bg-[radial-gradient(circle_at_top,_var(--color-brand-sky)_0,_#F5F7FB_55%,_white_100%)]
  "
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-10 pt-16 lg:flex-row lg:items-center">
        <div className="flex-1">
          <p className="text-[11px] tracking-[0.25em] uppercase text-sky-600/80">
            {t('badge')}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {t('heading')}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-slate-600">
            {t('description')}
          </p>
          {typeof total === 'number' && total > 0 && (
            <p className="mt-4 text-xs font-medium text-slate-500">
              {t('countLabel', { total })}
            </p>
          )}
        </div>

        {/* Filter panel – glassy white card like contact section */}
        <div className="mt-6 w-full max-w-md flex-1 lg:mt-0">
          <div className="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {t('filterTitle')}
            </p>

            <div className="mt-3 space-y-3">
              <div>
                <label
                  htmlFor="dev-search"
                  className="mb-1 block text-xs font-medium text-slate-600"
                >
                  {t('searchLabel')}
                </label>
                <div className="relative">
                  <input
                    id="dev-search"
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(
                          new CustomEvent('developers:search', {
                            detail: e.target.value,
                          })
                        );
                      }
                    }}
                    placeholder={t('searchPlaceholder')}
                    className="
                      w-full rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 text-sm
                      text-slate-900 placeholder:text-slate-400
                      focus:border-[var(--color-brand-sky)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-sky)]
                    "
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] text-slate-400">
                    ⌘K
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                {t('tip')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
