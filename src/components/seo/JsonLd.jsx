// src/components/seo/JsonLd.jsx
'use client';

export default function JsonLd({ data }) {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      // JSON-LD must be a JSON string
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
