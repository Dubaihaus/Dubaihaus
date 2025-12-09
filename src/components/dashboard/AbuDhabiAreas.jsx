// src/components/dashboard/AbuDhabiAreas.jsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ABU_DHABI_AREAS } from "@/lib/Areas";
import { useAreaProperties } from "@/hooks/useProperties";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

const PLACEHOLDER = "/project_detail_images/building.jpg";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

function AreaCard({ area, index }) {
  const t = useTranslations("areas");

  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { data, isLoading, error } = useAreaProperties(
    area.slug,
    area.filters
  );

 const firstProperty = data?.results?.[0];

const rawCover =
  firstProperty?.coverPhoto ||
  (typeof firstProperty?.coverImage === "string"
    ? firstProperty.coverImage
    : firstProperty?.cover_image?.url) ||
  firstProperty?.rawData?.cover_image?.url ||
  area.image ||
  PLACEHOLDER;

const imageSrc =
  typeof rawCover === "string" && rawCover.trim()
    ? rawCover
    : PLACEHOLDER;

  const params = new URLSearchParams(area.filters || {});
  const loadMoreHref = `/off-plan?${params.toString()}`;

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col"
      >
        <div className="relative h-56 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-t-2xl" />
        <div className="p-6 flex flex-col flex-1 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
          <div className="h-12 bg-gray-200 rounded mt-auto animate-pulse" />
        </div>
      </motion.div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border-2 border-red-100"
      >
        <div className="relative h-56 bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center rounded-t-2xl">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-red-500 text-xl">⚠️</span>
            </div>
            <span className="text-red-600 font-medium">
              {t("abuDhabi.failedToLoadShort")}
            </span>
          </div>
        </div>
        <div className="p-6 flex flex-col flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {area.title}
          </h3>
          <p className="text-gray-600 text-sm mb-5">
            {t("abuDhabi.errorLoading")}
          </p>
          <Button asChild className="mt-auto">
            <Link href={loadMoreHref}>{t("states.retry")}</Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col relative"
    >
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-10" />

      {/* Image container */}
      <div className="relative h-56 overflow-hidden">
        <Image
          src={imageSrc}
          alt={area.title}
          fill
          className={`object-cover transition-transform duration-700 ${
            isHovered ? "scale-110" : "scale-100"
          } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onLoad={() => setImageLoaded(true)}
        />

        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Property count badge */}
        {data?.count && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 bg-black/80 text-white text-xs font-semibold px-3 py-2 rounded-full backdrop-blur-sm"
          >
            {data.count}
            {t("card.propertiesCountSuffix")}
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1 relative z-0">
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.2 }}
          className="text-xl font-bold text-gray-800 mb-2 line-clamp-1"
        >
          {area.title}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.3 }}
          className="text-gray-600 text-sm mb-5 line-clamp-2 flex-1 leading-relaxed"
        >
          {area.description || t("abuDhabi.fallbackDescription")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.4 }}
          className="mt-auto"
        >
          <Button
            asChild
            className="w-full text-white rounded-xl font-semibold py-3 text-base shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group/btn"
            style={{ backgroundColor: "#00C6FF" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#003C7A")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#00C6FF")
            }
          >
            <Link href={loadMoreHref}>
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />

              <span className="relative z-10 flex items-center justify-center">
                {t("card.cta")}
                <svg
                  className="ml-2 w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Hover border effect */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-sky-200 transition-all duration-300 pointer-events-none" />
    </motion.div>
  );
}

export default function AbuDhabiAreasSection() {
  const t = useTranslations("areas");
  const [hasEntered, setHasEntered] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasEntered(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="px-4 py-20 md:px-8 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
      dir="ltr"
    >
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-sky-100 rounded-full blur-3xl opacity-20" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={hasEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={hasEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
          >
            {t("abuDhabi.headingPrefix")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C6FF] to-blue-600">
              {t("abuDhabi.headingHighlight")}
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={hasEntered ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed"
          >
            {t("abuDhabi.description")}
          </motion.p>
        </motion.div>

        {/* Areas Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={hasEntered ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {ABU_DHABI_AREAS.map((area, index) => (
            <AreaCard key={area.slug} area={area} index={index} />
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={hasEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center pt-12 border-t border-gray-200"
        >
          <motion.h3
            initial={{ opacity: 0 }}
            animate={hasEntered ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="text-2xl font-bold text-gray-900 mb-4"
          >
            {t("abuDhabi.ctaSectionTitle")}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={hasEntered ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="text-gray-600 mb-8 max-w-2xl mx-auto"
          >
            {t("abuDhabi.ctaSectionBody")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={
              hasEntered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }
            }
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <Link
              href="/off-plan?region=Abu%20Dhabi"
              className="inline-flex items-center text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
              style={{ backgroundColor: "#00C6FF" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#003C7A")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#00C6FF")
              }
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

              <span className="relative z-10 flex items-center">
                {t("abuDhabi.ctaSectionButton")}
                <svg
                  className="ml-3 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
