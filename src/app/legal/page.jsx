// app/legal/page.jsx
'use client';

import { useState, useMemo } from 'react';
import Head from 'next/head';
import PrivacyPolicy from '@/components/legal/PrivacyPolicy';
import Terms from '@/components/legal/Terms';

const KEYWORDS = [
  'DubaiHaus', 'real estate', 'off-plan', 'privacy policy', 'terms and conditions',
  'UAE PDPL', 'GDPR', 'property listings', 'real estate disclaimer'
];

export default function LegalPage() {
  const [lang, setLang] = useState('en');
  const [tab, setTab] = useState('privacy');

  const title = useMemo(() => {
    const base = tab === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions';
    return `${base} | DubaiHaus`;
  }, [tab]);

  const description = useMemo(() => (
    tab === 'privacy'
      ? 'Learn how DubaiHaus collects, uses, and protects your personal data (GDPR/PDPL compliant).'
      : 'Read the DubaiHaus Terms & Conditions, disclaimers, and your responsibilities as a user.'
  ), [tab]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={KEYWORDS.join(', ')} />
        <meta name="robots" content="index,follow" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Legal Documents</h1>
                <p className="mt-1 text-sm text-slate-600">DubaiHaus Compliance Center</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700">Language:</span>
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setLang('en')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                      lang === 'en'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLang('de')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                      lang === 'de'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    DE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={() => setTab('privacy')}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${
                tab === 'privacy'
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  tab === 'privacy' ? 'bg-blue-100' : 'bg-slate-100 group-hover:bg-blue-50'
                }`}>
                  <ShieldIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Privacy Policy</h2>
                  <p className="text-sm text-slate-600 mt-1">Data protection & GDPR compliance</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setTab('terms')}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${
                tab === 'terms'
                  ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  tab === 'terms' ? 'bg-emerald-100' : 'bg-slate-100 group-hover:bg-emerald-50'
                }`}>
                  <FileTextIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Terms & Conditions</h2>
                  <p className="text-sm text-slate-600 mt-1">Usage guidelines & legal terms</p>
                </div>
              </div>
            </button>
          </div>

          {/* Content Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Panel Header */}
            <div className="border-b border-slate-200 bg-slate-50/80">
              <div className="px-6 sm:px-8 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {tab === 'privacy' 
                        ? (lang === 'de' ? 'Datenschutzerklärung' : 'Privacy Policy')
                        : (lang === 'de' ? 'Allgemeine Nutzungsbedingungen' : 'Terms & Conditions')
                      }
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                      {lang === 'de' ? 'Rechtliche Dokumentation' : 'Legal Documentation'} • DubaiHaus
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200">
                    <GlobeIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">
                      {lang === 'de' ? 'Deutsch' : 'English'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              {tab === 'privacy' ? (
                <PrivacyPolicy lang={lang} />
              ) : (
                <Terms lang={lang} />
              )}
            </div>

            {/* Panel Footer */}
            <div className="border-t border-slate-200 bg-slate-50/50 px-6 sm:px-8 py-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>DubaiHaus Legal</span>
                <span>Last updated: {new Date().toISOString().slice(0, 10)}</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

// Icon components
function ShieldIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function FileTextIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function GlobeIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}