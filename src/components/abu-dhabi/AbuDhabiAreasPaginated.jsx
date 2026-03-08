// src/components/abu-dhabi/AbuDhabiAreasPaginated.jsx
"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useAreas } from "@/hooks/useAreas";
import AreaCard from "@/components/areas/AreaCard";
import { Button } from "@/components/ui/button";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export default function AbuDhabiAreasPaginated() {
    const t = useTranslations();
    const [showAll, setShowAll] = useState(false);
    const { data: areasData, isLoading } = useAreas("Abu Dhabi");

    const allAreas = areasData?.areas || [];

    const { curatedAreas, remainingAreas } = useMemo(() => {
        const curated = [];
        const rem = [];
        const seen = new Set();

        const priorityNames = [
            "Yas Island",
            "Al Reem Island",
            "Ghadeer Al Tayr",
            "Zayed City",
            "Al Shamkhah",
            "Al Raha Beach"
        ];

        // 1. Gather exact or close matches for curated
        priorityNames.forEach(name => {
            const match = allAreas.find(a => {
                const aName = a.name.toLowerCase();
                const target = name.toLowerCase();
                // fuzzy match to catch "Reem Island" mapping to "Al Reem Island"
                return aName === target || aName.includes(target.replace("al ", ""));
            });
            if (match && !seen.has(match.id || match.name)) {
                curated.push(match);
                seen.add(match.id || match.name);
            }
        });

        // 2. Gather remaining
        allAreas.forEach(a => {
            if (!seen.has(a.id || a.name)) {
                rem.push(a);
            }
        });

        return { curatedAreas: curated, remainingAreas: rem };
    }, [allAreas]);

    const visibleAreas = showAll ? [...curatedAreas, ...remainingAreas] : curatedAreas;
    const hasMore = !showAll && remainingAreas.length > 0;

    const handleLoadMore = () => {
        setShowAll(true);
    };

    return (
        <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative">
            <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                        Popular Areas in <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">Abu Dhabi</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Discover the most sought-after neighborhoods and investment hotspots across the capital.
                    </p>
                </motion.div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 animate-pulse">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 bg-gray-200 rounded-2xl w-full"></div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
                    >
                        <AnimatePresence>
                            {visibleAreas.map((area, index) => {
                                // Provide specialized search filter link
                                const overrides = {
                                    ...area,
                                    href: `/off-plan?search=${encodeURIComponent(area.name)}&region=Abu%20Dhabi`
                                };
                                return <AreaCard key={area.id || area.name} area={overrides} index={index} />;
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}

                {hasMore && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-center mt-12"
                    >
                        <Button
                            onClick={handleLoadMore}
                            size="lg"
                            className="px-8 py-6 rounded-full font-semibold text-lg hover:shadow-lg transition-all"
                        >
                            Show More Areas
                        </Button>
                    </motion.div>
                )}
            </div>
        </section>
    );
}
