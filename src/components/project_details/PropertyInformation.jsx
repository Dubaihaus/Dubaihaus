'use client';
import React from 'react';

function humanizeStatus(s) {
  if (!s) return 'N/A';
  return String(s)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}
function formatLocation(loc) {
  if (!loc) return 'N/A';
  const parts = [loc.sector, loc.district, loc.city, loc.region].filter(Boolean);
  return parts.length ? parts.join(', ') : 'N/A';
}
function inferType(p) {
  const t =
    p?.unit_blocks?.[0]?.unit_type ||
    p?.property_type ||
    (Array.isArray(p?.typical_units) && p.typical_units.length ? 'Apartment' : null);
  return t || 'N/A';
}

export default function PropertyInformation({ property }) {
  const p = property?.rawData ?? property ?? {};

  const info = [
    { label: 'Type', value: inferType(p), icon: '🏢' },
    {
      label: 'Furnishing',
      value: p.furnishing ? (String(p.furnishing).toUpperCase() === 'YES' ? 'Furnished' : String(p.furnishing)) : 'N/A',
      icon: '🛋️',
    },
    { label: 'Construction Status', value: humanizeStatus(p.construction_status), icon: '🎯' },
    { label: 'Sale Status', value: humanizeStatus(p.sale_status), icon: '✅' },
    { label: 'Reference no.', value: p.id ?? property?.id ?? 'N/A', icon: '🔖' },
    { label: 'Completion Date', value: p.completion_date || 'TBA', icon: '📅' },
    { label: 'Area', value: formatLocation(p.location), icon: '🏗️' },
    { label: 'Service Charge', value: p.service_charge || 'N/A', icon: '💰' },
  ];

  return (
    <section className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Property Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-gray-700">
        {info.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 bg-gray-50 p-4 rounded-md hover:bg-gray-100 transition"
          >
            <div className="text-xl">{item.icon}</div>
            <div>
              <p className="text-gray-600 font-medium">{item.label}</p>
              <p className="text-gray-900">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
