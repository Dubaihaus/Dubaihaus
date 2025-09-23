// src/lib/formatHandover.js
const MONTHS = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

function tryDate(d) {
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? null : dt;
}

export function formatHandover(raw) {
  if (raw == null) return 'Contact Manager';
  const s = String(raw).trim();
  if (!s) return 'Contact Manager';

  // 1) ISO-ish or timestamp
  // - "2025-09-01", "2025-09", "2025-09-01T00:00:00Z", 1693526400000, etc.
  // Try "YYYY-MM" by appending day
  if (/^\d{4}-\d{2}$/.test(s)) {
    const d = tryDate(`${s}-01`);
    if (d) return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
  // Plain ISO / full date / timestamp number
  const maybeNumeric = Number(s);
  const d1 = tryDate(!isNaN(maybeNumeric) ? maybeNumeric : s);
  if (d1) return d1.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  // 2) "Month YYYY" (Sep 2025, September 2025, SEP 2025)
  const m1 = s.match(/^([A-Za-z]{3,9})[,\s-]+(\d{4})$/);
  if (m1) {
    const m = MONTHS[m1[1].toLowerCase()];
    const y = Number(m1[2]);
    if (m != null && y >= 1900 && y <= 2100) {
      const d = new Date(Date.UTC(y, m, 1));
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  }

  // 3) "MM/YYYY"
  const m2 = s.match(/^(\d{1,2})[\/-](\d{4})$/);
  if (m2) {
    const mm = Number(m2[1]) - 1;
    const yy = Number(m2[2]);
    if (mm >= 0 && mm <= 11) {
      const d = new Date(Date.UTC(yy, mm, 1));
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  }

  // 4) Quarter strings: "Q1 2025", "Q4-2025"
  const q = s.match(/^Q([1-4])\s*[- ]?\s*(\d{4})$/i);
  if (q) {
    // You can either return "Qx YYYY" directly, or map to a representative month.
    // For real-estate, it's common to keep it as Qx:
    return `Q${q[1]} ${q[2]}`;
    // If you prefer a month label, map Q1→Mar, Q2→Jun, Q3→Sep, Q4→Dec.
  }

  // 5) Year-only: "2025"
  if (/^\d{4}$/.test(s)) return s;

  // Fallback: show raw string (better than "Invalid Date")
  return s;
}

// Convenience for property objects with varying field names
export function getHandoverLabel(property) {
  const raw =
    property?.completionDate ??
    property?.completion_date ??
    property?.rawData?.completion_date ??
    property?.rawData?.completionDate ??
    null;
  return formatHandover(raw);
}
