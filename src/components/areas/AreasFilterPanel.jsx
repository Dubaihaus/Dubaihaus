// src/components/areas/AreasFilterPanel.jsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

const REGIONS = [
  { value: "Dubai", label: "Dubai",  count: 42 },
  { value: "Abu Dhabi", label: "Abu Dhabi", count: 28 },
  { value: "Sharjah", label: "Sharjah",   count: 15 },
  { value: "Ajman", label: "Ajman",  count: 8 },
  { value: "Ras Al Khaimah", label: "Ras Al Khaimah",  count: 6 },
  { value: "Fujairah", label: "Fujairah",  count: 4 },
  { value: "Umm Al Quwain", label: "Umm Al Quwain",  count: 3 },
  { value: "all", label: "All UAE", count: 106 },
];

export default function AreasFilterPanel({
  region,
  onRegionChange,
  areaQuery,
  onAreaQueryChange,
}) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchRef = useRef(null);

  // Mock suggestions - in real app, this would come from API
  const areaSuggestions = [
    "Downtown Dubai", "Dubai Marina", "Palm Jumeirah", "Business Bay",
    "Jumeirah Village", "Dubai Hills", "Yas Island", "Al Reem Island",
    "Khalifa City", "Al Maryah Island"
  ];

  useEffect(() => {
    if (areaQuery.length > 1) {
      const filtered = areaSuggestions.filter(area =>
        area.toLowerCase().includes(areaQuery.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [areaQuery]);

  const handleSuggestionClick = (suggestion) => {
    onAreaQueryChange(suggestion);
    setSuggestions([]);
    searchRef.current?.blur();
  };

  return (
    <section className="-mt-16 md:-mt-20 mb-12 relative z-20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-100"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            {/* Region Select */}
            <div className="lg:col-span-4">
              <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">
                📍 Select Region
              </label>
              <div className="relative">
                <select
                  value={region}
                  onChange={(e) => onRegionChange(e.target.value)}
                  className="w-full appearance-none border-2 border-gray-200 rounded-xl px-4 py-3.5 pr-10 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-300 bg-white hover:border-gray-300 cursor-pointer"
                >
                  {REGIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.emoji} {r.label} ({r.count})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Area Search */}
            <div className="lg:col-span-5 relative">
              <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">
                🔍 Search Areas
              </label>
              <div className="relative">
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Try 'Downtown', 'Marina', 'Yas Island'..."
                  value={areaQuery}
                  onChange={(e) => onAreaQueryChange(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 pr-24 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-300 hover:border-gray-300"
                />
                
                {/* Search button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-shadow duration-300"
                  style={{ backgroundColor: "#00C6FF" }}
                >
                  Find Areas
                </motion.button>
              </div>

              {/* Search Suggestions */}
              <AnimatePresence>
                {suggestions.length > 0 && isSearchFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-30 overflow-hidden"
                  >
                    {suggestions.map((suggestion, index) => (
                      <motion.div
                        key={suggestion}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                        onMouseDown={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="flex items-center text-sm">
                          <span className="text-sky-500 mr-2">📍</span>
                          {suggestion}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Map Button */}
            <div className="lg:col-span-3 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="w-full lg:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-semibold border-2 border-sky-500 text-sky-600 bg-white hover:bg-sky-50 hover:border-sky-600 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A2 2 0 013 15.382V5.618a2 2 0 011.106-1.789L9 2m0 18l6-3m-6 3V2m6 15l5.447-2.724A2 2 0 0021 12.382V4.618a2 2 0 00-1.106-1.789L15 2m0 15V2"
                  />
                </svg>
                View Map
              </motion.button>
            </div>
          </div>

       
        </motion.div>
      </div>
    </section>
  );
}