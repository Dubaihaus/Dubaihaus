// src/components/developers/DevelopersGrid.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

function DeveloperCard({ developer }) {
  const initials = String(developer?.name || "NA").slice(0, 2).toUpperCase();

  return (
    <Link
      href={`/developers/${developer.id}`}
      className="
        group flex flex-col rounded-3xl border border-slate-200 
        bg-white/90 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.10)]
        transition-transform hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.18)]
      "
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
          {developer.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={developer.logoUrl}
              alt={developer.name}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          ) : (
            <span className="text-sm font-semibold text-[var(--color-brand-sky)]">
              {initials}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-slate-900">
            {developer.name}
          </h2>
          {developer.website && (
            <p className="mt-0.5 truncate text-xs text-[var(--color-brand-sky)]/90">
              {developer.website.replace(/^https?:\/\//, "")}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 border border-slate-200">
          View projects
          <span className="transition-transform group-hover:translate-x-0.5">
            ↗
          </span>
        </span>
        <span className="text-[11px] text-slate-400">
          Off-plan & ready projects
        </span>
      </div>
    </Link>
  );
}

export default function DevelopersGrid({ initialDevelopers = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(
    Math.max(1, Math.ceil(initialDevelopers.length / 2)) // show half initially
  );

  useEffect(() => {
    function handleSearch(event) {
      const term = String(event.detail || "").toLowerCase();
      setSearchTerm(term);

      // When searching, show all matching results (no pagination frustration)
      if (term) {
        setVisibleCount(Number.MAX_SAFE_INTEGER);
      } else {
        setVisibleCount(
          Math.max(1, Math.ceil(initialDevelopers.length / 2))
        );
      }
    }
    window.addEventListener("developers:search", handleSearch);
    return () => window.removeEventListener("developers:search", handleSearch);
  }, [initialDevelopers.length]);

  const filtered = useMemo(() => {
    if (!searchTerm) return initialDevelopers;
    return initialDevelopers.filter((dev) =>
      String(dev.name || "").toLowerCase().includes(searchTerm)
    );
  }, [initialDevelopers, searchTerm]);

  const visibleDevelopers = filtered.slice(0, visibleCount);
  const canShowMore = filtered.length > visibleDevelopers.length;

  return (
    <div className="mt-10">
      <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing{" "}
          <span className="font-semibold text-[var(--color-brand-sky)]">
            {visibleDevelopers.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold">
            {filtered.length}
          </span>{" "}
          {filtered.length === 1 ? "developer" : "developers"}
        </span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibleDevelopers.map((dev) => (
          <DeveloperCard key={dev.id} developer={dev} />
        ))}

        {visibleDevelopers.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white/80 p-6 text-center text-sm text-slate-500">
            No developers match your search. Try another name.
          </div>
        )}
      </div>

      {canShowMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount(filtered.length)}
            className="
              inline-flex items-center gap-2 rounded-full border border-slate-300 
              bg-white/90 px-5 py-2.5 text-xs font-semibold text-slate-700
              shadow-sm hover:border-[var(--color-brand-sky)] hover:text-[var(--color-brand-dark)]
              transition-colors
            "
          >
            Show all developers
            <span>↓</span>
          </button>
        </div>
      )}
    </div>
  );
}
