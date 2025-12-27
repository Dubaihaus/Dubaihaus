'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronDown, Search, X, Check } from 'lucide-react';

/**
 * MultiSelect Dropdown Component
 */
function MultiSelect({ label, options = [], selected = [], onChange, placeholder = "Select..." }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleOption = (value) => {
        const newSelected = selected.includes(value)
            ? selected.filter(v => v !== value)
            : [...selected, value];
        onChange(newSelected);
    };

    const displayText = selected.length > 0
        ? `${selected.length} selected`
        : placeholder;

    return (
        <div className="relative w-full" ref={containerRef}>
            <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-left flex justify-between items-center hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium text-gray-700 shadow-sm"
            >
                <span className="truncate block max-w-[140px]">{displayText}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full min-w-[220px] bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-left left-0">
                    <div className="p-2 border-b border-gray-50">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(option => {
                                const isSelected = selected.includes(option);
                                return (
                                    <div
                                        key={option}
                                        onClick={() => toggleOption(option)}
                                        className={`flex items-center px-3 py-2 rounded-md cursor-pointer text-sm transition-colors ${isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                                            }`}>
                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <span>{option}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="px-4 py-3 text-sm text-gray-400 text-center">No results found</div>
                        )}
                    </div>
                    {selected.length > 0 && (
                        <div className="p-2 border-t border-gray-50 bg-gray-50/50 flex justify-end">
                            <button
                                onClick={() => onChange([])}
                                className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1"
                            >
                                Clear Selection
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * Price Range Dropdown
 */
function PriceRangeDropdown({ min, max, label, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Local state for inputs to avoid stuttering, sync on blur/submit
    const [localMin, setLocalMin] = useState(min || '');
    const [localMax, setLocalMax] = useState(max || '');

    useEffect(() => {
        setLocalMin(min || '');
        setLocalMax(max || '');
    }, [min, max]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                // Commit changes on close
                onChange({ min: localMin, max: localMax });
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [localMin, localMax, onChange]);

    const displayText = (min || max)
        ? `${min ? min : '0'} - ${max ? max : 'Any'}`
        : 'Any Price';

    return (
        <div className="relative w-full" ref={containerRef}>
            <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-left flex justify-between items-center hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium text-gray-700 shadow-sm"
            >
                <span className="truncate block max-w-[140px]">{displayText}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full min-w-[260px] bg-white rounded-lg shadow-xl border border-gray-100 p-4 animate-in fade-in zoom-in-95 duration-100 origin-top-left left-0">
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-xs text-gray-400 mb-1 block">Min Price</label>
                            <input
                                type="number"
                                value={localMin}
                                onChange={e => setLocalMin(e.target.value)}
                                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="0"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-gray-400 mb-1 block">Max Price</label>
                            <input
                                type="number"
                                value={localMax}
                                onChange={e => setLocalMax(e.target.value)}
                                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Any"
                            />
                        </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                        <button
                            onClick={() => {
                                onChange({ min: localMin, max: localMax });
                                setIsOpen(false);
                            }}
                            className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded hover:bg-black transition"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}


export default function OffPlanFilterPanel({ filterOptions, initialFilters }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations('dashboard.filters') || ((k) => k); // Fallback if not loaded

    // Initialize state from props or URL
    const [types, setTypes] = useState(initialFilters?.types || []);
    const [regions, setRegions] = useState(initialFilters?.regions || []);
    const [areas, setAreas] = useState(initialFilters?.areas || []);
    const [developers, setDevelopers] = useState(initialFilters?.developers || []);
    const [years, setYears] = useState(initialFilters?.years || []);
    const [search, setSearch] = useState(initialFilters?.search || '');
    const [price, setPrice] = useState({ min: initialFilters?.minPrice || '', max: initialFilters?.maxPrice || '' });
    const [showMap, setShowMap] = useState(initialFilters?.showMap || false);

    // Sync with URL if needed (optional, if we want back button support to update UI)
    useEffect(() => {
        // Usually better to let the parent pass `initialFilters` from server.
        // But if we navigate shallow, we might want to sync.
    }, [searchParams]);

    // Derived area options based on selected regions
    const availableAreas = React.useMemo(() => {
        const withRegion = filterOptions?.areasWithRegion || [];
        const simple = filterOptions?.areas || [];

        if (!regions || regions.length === 0) return simple;

        // Filter areas that belong to selected regions
        const filtered = withRegion
            .filter(item => item.region && regions.includes(item.region))
            .map(item => item.area);

        return [...new Set(filtered)].sort();
    }, [regions, filterOptions]);

    const handleRegionChange = (newRegions) => {
        setRegions(newRegions);

        // If we have mapped data, we can validate selected areas
        const withRegion = filterOptions?.areasWithRegion;
        if (withRegion && newRegions.length > 0 && areas.length > 0) {
            // Check if current selected areas are valid for new regions
            // An area is valid if its region is in newRegions
            // Find each selected area in metadata
            const valid = areas.filter(areaName => {
                const match = withRegion.find(r => r.area === areaName);
                if (!match) return true; // keep if unknown (safer)
                return newRegions.includes(match.region);
            });

            if (valid.length !== areas.length) {
                setAreas(valid);
            }
        }
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (types.length) params.set('type', types.join(','));
        if (regions.length) params.set('region', regions.join(','));
        if (areas.length) params.set('area', areas.join(','));
        if (developers.length) params.set('developer', developers.join(','));
        if (years.length) params.set('handoverYear', years.join(','));
        if (search) params.set('q', search);
        if (price.min) params.set('priceMin', price.min);
        if (price.max) params.set('priceMax', price.max);
        if (showMap) params.set('showMap', 'true');

        // Preserve currency if exists in current URL
        const currentCurrency = searchParams.get('currency');
        if (currentCurrency) params.set('currency', currentCurrency);

        router.push(`/off-plan/search?${params.toString()}`);
    };

    // Derive years options if not provided (e.g. 2025-2030 + Completed)
    const defaultYears = ['Completed'];
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 6; i++) {
        defaultYears.push(String(currentYear + i));
    }

    // Use DB provided years if available, else default
    // The backend might not return "Completed" explicitly as a year, so we combine logic.
    // Actually the plan said "Build options like: Completed, 2025...". 
    // We'll just use the logic here.
    const yearOptions = defaultYears;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-30 -mt-24 sm:-mt-32">
            <div className="bg-white rounded-2xl shadow-2xl shadow-black/10 p-4 md:p-6 border border-gray-100">

                {/* Row 1: Dropdowns (5 columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
                    <MultiSelect
                        label="Property Type"
                        placeholder="All Types"
                        options={filterOptions?.types || []}
                        selected={types}
                        onChange={setTypes}
                    />
                    <MultiSelect
                        label="State / Emirate"
                        placeholder="All Emirates"
                        options={filterOptions?.regions || ['Dubai', 'Abu Dhabi']}
                        selected={regions}
                        onChange={handleRegionChange}
                    />
                    <MultiSelect
                        label="Area / Community"
                        placeholder="All Areas"
                        options={availableAreas}
                        selected={areas}
                        onChange={setAreas}
                    />
                    <MultiSelect
                        label="Developer"
                        placeholder="All Developers"
                        options={filterOptions?.developers || []}
                        selected={developers}
                        onChange={setDevelopers}
                    />
                    <PriceRangeDropdown
                        label="Price Range"
                        min={price.min}
                        max={price.max}
                        onChange={setPrice}
                    />
                </div>

                {/* Row 2: Handover Date + Search & Actions */}
                <div className="flex flex-col lg:flex-row items-end gap-3">

                    {/* Handover Date (Moved to Row 2) */}
                    <div className="w-full lg:w-56">
                        <MultiSelect
                            label="Handover Date"
                            placeholder="Any Date"
                            options={yearOptions}
                            selected={years}
                            onChange={setYears}
                        />
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-shadow shadow-sm hover:border-gray-300"
                            placeholder="Search project name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>

                    {/* Map Toggle - Styled Switch */}
                    <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start px-2 h-[46px]">
                        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Show Map</span>
                        <button
                            onClick={() => setShowMap(!showMap)}
                            className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${showMap ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${showMap ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Find Button */}
                    <button
                        onClick={handleSearch}
                        className="w-full lg:w-auto bg-brand-sky border border-transparent rounded-lg py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-lg shadow-red-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 h-[46px]"
                    >
                        <Search className="w-5 h-5 mr-2" />
                        Search
                    </button>
                </div>

            </div>
        </div>
    );
}
