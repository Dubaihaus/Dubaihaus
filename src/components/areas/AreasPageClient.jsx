// src/components/areas/AreasPageClient.jsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useAreas } from "@/hooks/useAreas";
import AreaCard from "./AreaCard";
import AreasFilterPanel from "./AreasFilterPanel";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

export default function AreasPageClient() {
  const t = useTranslations("areas");

  const [region, setRegion] = useState("Dubai");
  const [areaQuery, setAreaQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { data, isLoading: areasLoading, error } = useAreas(region);
  const areas = data?.areas || [];

  // Simulate loading for better UX
  useEffect(() => {
    if (!areasLoading) {
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [areasLoading]);

  const filteredAreas = useMemo(() => {
    const q = areaQuery.trim().toLowerCase();
    if (!q) return areas;
    return areas.filter((a) => a.name.toLowerCase().includes(q));
  }, [areas, areaQuery]);

  // Loading skeleton array
  const skeletonItems = Array.from({ length: 9 }, (_, i) => i);

  const count = filteredAreas.length;
  const countLabelBase =
    count === 1
      ? `${count} ${t("results.areaSingular")} ${t("results.found")}`
      : `${count} ${t("results.areaPlural")} ${t("results.found")}`;
  const countLabel = areaQuery
    ? `${countLabelBase} ${t("results.forQueryPrefix")} "${areaQuery}"`
    : countLabelBase;

  const title =
    region === "all"
      ? t("results.allUaeAreas")
      : `${region} ${t("results.regionAreasSuffix")}`;

  const stats = [
    {
      number: t("stats.primeAreasNumber"),
      label: t("stats.primeAreas"),
    },
    {
      number: t("stats.developmentsNumber"),
      label: t("stats.developments"),
    },
    {
      number: t("stats.investmentValueNumber"),
      label: t("stats.investmentValue"),
    },
  ];

  return (
    <main className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Enhanced HERO */}
      <section className="relative bg-gradient-to-br from-sky-600 via-sky-500 to-blue-600 text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-[url('/dashboard/downtown.jpg')] bg-cover bg-center opacity-10"
            style={{
              backgroundBlendMode: "overlay",
            }}
          />
          {/* Animated grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        </div>

        {/* Floating elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float" />
        <div
          className="absolute top-20 right-20 w-16 h-16 bg-white/5 rounded-full blur-lg animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-20 left-1/4 w-24 h-24 bg-white/8 rounded-full blur-xl animate-float"
          style={{ animationDelay: "4s" }}
        />

        <div className="relative max-w-6xl mx-auto px-4 py-28 md:py-32 min-h-[400px] z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center md:text-left"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
            >
              {t("hero.titleLine1")}
              <span className="block bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                {t("hero.titleHighlight")}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="max-w-2xl text-lg md:text-xl text-white/90 leading-relaxed mb-8"
            >
              {t("hero.description")}
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-8 mt-12"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.2 }}
                  className="text-center"
                >
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    {stat.number}
                  </div>
                  <div className="text-sm text-white/70 mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-3 bg-white/50 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Filter Panel */}
      <AreasFilterPanel
        region={region}
        onRegionChange={setRegion}
        areaQuery={areaQuery}
        onAreaQueryChange={setAreaQuery}
      />

      {/* Areas Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        {/* Results header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-600 mt-1">{countLabel}</p>
          </div>

          {/* Sort dropdown */}
          <div className="mt-4 sm:mt-0">
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option>{t("results.sortPopularity")}</option>
              <option>{t("results.sortName")}</option>
              <option>{t("results.sortPropertyCount")}</option>
            </select>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {skeletonItems.map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 animate-pulse"
              >
                <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("states.errorTitle")}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {t("states.errorBody")}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 transition-colors duration-300"
            >
              {t("states.retry")}
            </button>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && filteredAreas.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🏙️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("states.emptyTitle")}
            </h3>
            <p className="text-gray-600 mb-6">{t("states.emptyBody")}</p>
            <button
              onClick={() => {
                setAreaQuery("");
                setRegion("Dubai");
              }}
              className="px-6 py-3 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 transition-colors duration-300"
            >
              {t("states.clearFilters")}
            </button>
          </motion.div>
        )}

        {/* Areas Grid */}
        <AnimatePresence mode="wait">
          {!isLoading && filteredAreas.length > 0 && (
            <motion.div
              key={`grid-${region}-${areaQuery}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredAreas.map((area, index) => (
                <AreaCard
                  key={area.id || area.name}
                  area={area}
                  index={index}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Load More Button */}
        {!isLoading &&
          filteredAreas.length > 0 &&
          filteredAreas.length % 9 === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-12"
            >
              <button className="px-8 py-3 border-2 border-sky-500 text-sky-600 rounded-xl font-semibold hover:bg-sky-50 transition-all duration-300 hover:border-sky-600">
                {t("states.loadMore")}
              </button>
            </motion.div>
          )}
      </section>
    </main>
  );
}
