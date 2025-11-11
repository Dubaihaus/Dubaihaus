// components/legal/_shared/LegalDoc.jsx
'use client';

import { useEffect, useState } from 'react';

export default function LegalDoc({ src, title, type = 'privacy', lang = 'en' }) {
  const [html, setHtml] = useState('');
  const [state, setState] = useState('loading');

  useEffect(() => {
    let isMounted = true;
    setState('loading');

    fetch(src, { cache: 'force-cache' })
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error('Failed to load'))))
      .then((text) => {
        if (!isMounted) return;

        // ✅ If the file is a full HTML document, only keep the <body> content
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'text/html');
          const bodyHtml = doc.body && doc.body.innerHTML.trim();
          setHtml(bodyHtml || text); // fallback: use raw text
        } catch {
          setHtml(text);
        }

        setState('ready');
      })
      .catch(() => {
        if (!isMounted) return;
        setState('error');
      });

    return () => {
      isMounted = false;
    };
  }, [src]);

  if (state === 'loading') {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-slate-200 rounded-lg mb-4" />
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-5/6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <ExclamationIcon className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Document Unavailable</h3>
        <p className="text-slate-600 mb-4">
          Failed to load <strong>{title}</strong>. Please try refreshing the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  const themeClass =
    type === 'privacy' ? 'legal-theme-privacy' : 'legal-theme-terms';

  return (
    <article
      className={`legal-article ${themeClass}`}
    >
      {/* Header badge */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
        <div
          className={`p-2 rounded-lg ${
            type === 'privacy' ? 'bg-blue-100' : 'bg-emerald-100'
          }`}
        >
          {type === 'privacy' ? (
            <ShieldIcon
              className={`w-5 h-5 ${
                type === 'privacy' ? 'text-blue-600' : 'text-emerald-600'
              }`}
            />
          ) : (
            <FileTextIcon
              className={`w-5 h-5 ${
                type === 'privacy' ? 'text-blue-600' : 'text-emerald-600'
              }`}
            />
          )}
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
            {title}
          </h1>
          <p className="text-sm text-slate-600">
            {lang === 'de'
              ? 'Rechtlich bindendes Dokument'
              : 'Legally binding document'}{' '}
            • DubaiHaus
          </p>
        </div>
      </div>

      {/* ✅ Injected HTML gets styled via .legal-content rules */}
      <div
        className="legal-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}

// Icons
function ExclamationIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
      />
    </svg>
  );
}

function ShieldIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

function FileTextIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}
