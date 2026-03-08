// src/components/abu-dhabi/AbuDhabiHero.jsx
"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function AbuDhabiHero() {
    const t = useTranslations();

    // Using a nice fallback or actual placeholder if available
    const heroImage = "/project_detail_images/building.jpg";

    return (
        <section className="relative h-[80vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
            {/* Background Image Setup */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={heroImage}
                    alt="Abu Dhabi Real Estate Properties"
                    fill
                    priority
                    className="object-cover object-center scale-105" // slight scale to cover edges smoothly during motion if any
                    sizes="100vw"
                />
            </div>

            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-10" />

            {/* Hero Content */}
            <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white mt-16">

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="mb-4 inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-md border border-white/20 shadow-sm"
                >
                    <span className="flex h-2 w-2 rounded-full bg-sky-400 mr-2 shadow-[0_0_8px_rgba(56,189,248,0.8)]"></span>
                    Explore the Capital
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
                    className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 max-w-4xl"
                >
                    Discover Luxury Properties in <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Abu Dhabi</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
                    className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-10 max-w-2xl font-light leading-relaxed"
                >
                    Experience premium off-plan investments and luxurious living in the UAE's capital city.
                </motion.p>

                {/* Optional scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center"
                >
                    <span className="text-xs tracking-[0.2em] uppercase text-white/60 mb-3 block">Scroll Down</span>
                    <div className="w-px h-12 bg-white/20 relative overflow-hidden">
                        <motion.div
                            animate={{ y: [0, 48] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-white to-transparent"
                        />
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
