'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PropertyCard from '@/components/PropertyCard';
import { X, Map as MapIcon, List } from 'lucide-react';
import MapSection from '@/components/map/MapSection'; // Reusing map section if possible or building simple one

export default function SearchResultsClient({ results, filters }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Helper to remove a specific filter
    const removeFilter = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            // Remove specific value from comma list
            const current = params.get(key)?.split(',') || [];
            const newValues = current.filter(v => v !== value);
            if (newValues.length > 0) {
                params.set(key, newValues.join(','));
            } else {
                params.delete(key);
            }
        } else {
            // Remove entire key
            params.delete(key);
        }
        router.push(`/off-plan/search?${params.toString()}`);
    };

    const clearAll = () => {
        router.push('/off-plan/search');
    };

    // Generate active chips
    const chips = [];
    if (filters.types) filters.types.forEach(t => chips.push({ label: t, key: 'type', value: t }));
    if (filters.areas) filters.areas.forEach(t => chips.push({ label: t, key: 'area', value: t }));
    if (filters.developers) filters.developers.forEach(t => chips.push({ label: t, key: 'developer', value: t }));
    if (filters.years) filters.years.forEach(t => chips.push({ label: t, key: 'handoverYear', value: t }));
    if (filters.minPrice) chips.push({ label: `Min Price: ${filters.minPrice}`, key: 'priceMin' });
    if (filters.maxPrice) chips.push({ label: `Max Price: ${filters.maxPrice}`, key: 'priceMax' });
    if (filters.search) chips.push({ label: `Search: "${filters.search}"`, key: 'q' });

    const showMap = filters.showMap;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Active Filters */}
            {chips.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-8">
                    <span className="text-sm text-gray-500 font-medium mr-2">Active Filters:</span>
                    {chips.map((chip, idx) => (
                        <button
                            key={idx}
                            onClick={() => removeFilter(chip.key, chip.value)}
                            className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition"
                        >
                            {chip.label}
                            <X className="w-3 h-3 ml-2" />
                        </button>
                    ))}
                    <button
                        onClick={clearAll}
                        className="text-sm text-red-600 hover:underline ml-2"
                    >
                        Clear all
                    </button>
                </div>
            )}

            {/* Content Area */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Map Column (if shown) - reusing logic or simple dynamic rendering */}
                {showMap && (
                    <div className="w-full lg:w-1/2 h-[500px] lg:h-auto lg:min-h-[600px] sticky top-24 rounded-2xl overflow-hidden shadow-lg border border-gray-200 order-first lg:order-last">
                        {/* We can use the existing MapSection but it might need projects passed in specific format 
                         or simplified. Let's try basic MapSection if it accepts projects. 
                         HomeClient uses MapSection.
                      */}
                        <MapSection
                            projects={results}
                            title="Properties Map"
                            height={600}
                            maxWidthClass="w-full"
                            showMarkersInitially={true}
                        />
                    </div>
                )}

                {/* Grid Column */}
                <div className={`w-full ${showMap ? 'lg:w-1/2' : ''}`}>
                    {results.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <h3 className="text-xl font-medium text-gray-900 mb-2">No properties found</h3>
                            <p className="text-gray-500 mb-6">Try adjusting your filters or search criteria.</p>
                            <button onClick={clearAll} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
                                View All Properties
                            </button>
                        </div>
                    ) : (
                        <div className={`grid grid-cols-1 ${showMap ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-6`}>
                            {results.map((project, idx) => (
                                <PropertyCard
                                    key={project.id}
                                    property={project}
                                    index={idx}
                                    currency={filters.currency}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
