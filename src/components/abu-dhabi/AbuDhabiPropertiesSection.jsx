// src/components/abu-dhabi/AbuDhabiPropertiesSection.jsx
"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useProperties } from "@/hooks/useProperties";
import PropertyCard from "@/components/PropertyCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

export default function AbuDhabiPropertiesSection() {
    const t = useTranslations();

    // Fetch properties using multiple robust calls to prioritize announced, presale, and then on_sale (start_of_sales)
    const { data: announcedData, isLoading: isAnnouncedLoading } = useProperties({
        region: "Abu Dhabi",
        sale_status: "announced",
        limit: 9,
        pageSize: 9,
    });

    const { data: presaleData, isLoading: isPresaleLoading } = useProperties({
        region: "Abu Dhabi",
        sale_status: "presale",
        limit: 9,
        pageSize: 9,
    });

    const { data: onSaleData, isLoading: isOnSaleLoading } = useProperties({
        region: "Abu Dhabi",
        sale_status: "start_of_sales",
        limit: 9,
        pageSize: 9,
    });

    const isLoading = isAnnouncedLoading || isPresaleLoading || isOnSaleLoading;

    const properties = useMemo(() => {
        const combined = [
            ...(announcedData?.results || []),
            ...(presaleData?.results || []),
            ...(onSaleData?.results || [])
        ];

        // Deduplicate by property ID mapping preserving order
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());

        // Ensure exactly up to 9 items
        return unique.slice(0, 9);
    }, [announcedData, presaleData, onSaleData]);

    return (
        <section className="py-20 bg-gray-50 relative border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 md:px-8 mt-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6"
                >
                    <div className="max-w-2xl">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                            Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">Properties</span>
                        </h2>
                        <p className="text-lg text-gray-600">
                            Handpicked off-plan projects and new developments available in Abu Dhabi right now.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="hidden md:inline-flex rounded-full">
                        <Link href="/off-plan?region=Abu%20Dhabi">
                            View All Properties
                        </Link>
                    </Button>
                </motion.div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-[450px] bg-white rounded-2xl shadow-sm animate-pulse flex flex-col">
                                <div className="h-64 bg-gray-200 rounded-t-2xl"></div>
                                <div className="p-6 space-y-4">
                                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : properties.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {properties.map((property, idx) => (
                                <PropertyCard
                                    key={property.id}
                                    property={property}
                                    index={idx}
                                />
                            ))}
                        </div>

                        <div className="mt-12 text-center md:hidden">
                            <Button asChild className="w-full rounded-full" size="lg">
                                <Link href="/off-plan?region=Abu%20Dhabi">
                                    View All Properties
                                </Link>
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-gray-500 text-lg">No properties found in Abu Dhabi matching the criteria.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
