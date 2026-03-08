// src/components/abu-dhabi/AbuDhabiMapSection.jsx
"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import PropertiesMap from "@/components/map/PropertiesMap";
import { useProperties } from "@/hooks/useProperties";
import { useMemo } from "react";

export default function AbuDhabiMapSection() {
    const t = useTranslations();

    // Fetch properties using a generous limit to populate the map safely
    const { data, isLoading } = useProperties({
        region: "Abu Dhabi",
        forMap: true,
        mode: "map",
    });

    const projects = data?.results || [];

    // Center strictly on Abu Dhabi
    const abuDhabiView = {
        longitude: 54.3773,
        latitude: 24.4539,
        zoom: 11,
    };

    return (
        <section className="py-20 bg-white relative">
            <div className="max-w-7xl mx-auto px-4 md:px-8 mb-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                        Interactive <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">Map</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Explore Abu Dhabi's real estate landscape and find your perfect location.
                    </p>
                </motion.div>
            </div>

            <div className="w-full h-[600px] md:h-[700px] relative px-4 md:px-8 max-w-[1600px] mx-auto">
                <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                    <PropertiesMap
                        projects={projects}
                        initialView={abuDhabiView}
                        showMarkers={true}
                        markersLoading={isLoading}
                    />
                </div>
            </div>
        </section>
    );
}
