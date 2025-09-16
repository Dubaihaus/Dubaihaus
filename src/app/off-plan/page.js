'use client';

import { useState, useEffect } from "react";
import FiltersPanel from "@/components/FiltersPanel";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useRouter, useSearchParams } from "next/navigation"; 

export default function OffPlanPage({ limit }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // **Step 1: Initialize filters from query params**
    const initialFilters = {};
    for (const [key, value] of searchParams.entries()) {
        initialFilters[key] = value;
    }

    const [filters, setFilters] = useState(initialFilters);
    const [projects, setProjects] = useState([]);
    const [currency, setCurrency] = useState("AED");
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchProjects = async () => {
        const params = new URLSearchParams({ ...filters, currency });
        const res = await fetch(`/api/off-plan?${params.toString()}`);
if (!res.ok) {
  const text = await res.text();
  console.error("off-plan API error:", res.status, text.slice(0, 300));
  setProjects([]);
  return;
}
const raw = await res.text();
if (!raw) {
  setProjects([]);
  return;
}
const data = JSON.parse(raw);
const limitedProjects = limit ? data.results?.slice(0, limit) : data.results;
setProjects(limitedProjects || []);
    };

    useEffect(() => {
        fetchProjects();
    }, [filters]);


    // **Step 4: Sync filters when the URL changes (e.g., user navigates via card click)**
    useEffect(() => {
        const updatedFilters = {};
        for (const [key, value] of searchParams.entries()) {
            updatedFilters[key] = value;
        }
        setFilters(updatedFilters);
    }, [searchParams]); // <-- Runs whenever URL params change


    const handleViewMore = () => {
        setLoading(true);
        setTimeout(() => {
            router.push('/off-plan');
        }, 300); // delay to show loading animation
    };

    return (
        <div className="p-6 max-w-7xl mx-auto" dir="ltr">
            {/* Title & Currencies */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        New Off-Plan Properties for Sale in Dubai
                    </h1>
                    <p className="text-sm text-gray-600 max-w-xl mt-1">
                        Off-plan properties are developments which are still in planning or construction.
                        Buying in the UAE provides early-phase pricing and flexible payment plans.
                    </p>
                </div>

                {/* Currency Buttons */}
                <div className="flex gap-2">
                    {["AED", "EUR", "USD"].map((cur) => (
                        <Button
                            key={cur}
                            variant={currency === cur ? "default" : "outline"}
                            onClick={() => setCurrency(cur)}
                            className="px-4"
                        >
                            {cur}
                        </Button>
                    ))}
                </div>
            </div>

            {/* View More (Only on Limited version) */}
            {limit && (
                <div className="mb-6">
                    <Button
                        className="bg-sky-600 hover:bg-sky-700 text-white"
                        onClick={handleViewMore}
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Loading...
                            </div>
                        ) : (
                            "View More"
                        )}
                    </Button>
                </div>
            )}

            {/* Filters (only on full version) */}
            {!limit && (
                <div className="flex gap-2 mb-6">
                    <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="px-4">Filters</Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                            <SheetHeader>
                                <SheetTitle>Filters</SheetTitle>
                            </SheetHeader>
                            <div className="mt-4">
                                <FiltersPanel filters={filters} setFilters={setFilters} />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            )}

            {/* Properties Grid */}
            <div>
                {projects.length === 0 ? (
                    <p className="text-gray-500">No properties found.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                        {projects.map((p) => (
                            <PropertyCard key={p.id} property={p} currency={currency} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
