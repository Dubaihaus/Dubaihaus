'use client';

import React from 'react';
import OffPlanFilterPanel from './OffPlanFilterPanel';

export default function SearchHero({ filterOptions, filters, totalResults }) {
    // Generate dynamic title based on filters
    let title = "Off-plan Properties in Dubai";

    const parts = [];
    if (filters.types && filters.types.length > 0) {
        parts.push(filters.types.join(' & '));
    } else {
        parts.push("Properties");
    }

    if (filters.areas && filters.areas.length > 0) {
        parts.push(`in ${filters.areas.join(', ')}`);
    } else {
        parts.push("in Dubai");
    }

    if (filters.developers && filters.developers.length > 0) {
        parts.push(`by ${filters.developers.join(', ')}`);
    }

    const dynamicTitle = parts.join(' ');

    return (
        <section className="relative w-full bg-slate-900 pb-20 pt-32 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            {/* Background - could be dynamic or static */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-900/40 z-10" />
                <img
                    src="/dashboard/Marina.jpg"
                    alt="Background"
                    className="w-full h-full object-cover opacity-40"
                />
            </div>

            <div className="relative z-20 w-full max-w-7xl mx-auto text-center mb-12">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 shadow-black/50 drop-shadow-lg capitalize">
                    {dynamicTitle}
                </h1>
                <p className="text-slate-200 text-lg md:text-xl">
                    Found {totalResults} results matching your criteria
                </p>
            </div>

            <div className="relative z-20 w-full pb-10 mt-12 pt-10">
                <OffPlanFilterPanel filterOptions={filterOptions} initialFilters={filters} />
            </div>
        </section>
    );
}
