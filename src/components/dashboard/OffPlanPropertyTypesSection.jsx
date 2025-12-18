// src/components/dashboard/OffPlanPropertyTypesSection.jsx
"use client";

import Image from "next/image";
import {
  FaArrowRight,
  FaBuilding,
  FaHandsHelping,
  FaStar,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const OffPlanPropertyTypesSection = () => {
  const router = useRouter();
  const t = useTranslations("offPlan");

  const propertyTypes = [
    {
      title: t("propertyTypes.penthouses.title"),
      label: t("propertyTypes.penthouses.label"),
      image: "/dashboard/Penthhouse.jpeg",
      filters: { unit_types: "Penthouse" },
    },
    {
      title: t("propertyTypes.townhouses.title"),
      label: t("propertyTypes.townhouses.label"),
      image: "/dashboard/Townhouse.jpeg",
      filters: { unit_types: "Townhouse" },
    },
    {
      title: t("propertyTypes.villas.title"),
      label: t("propertyTypes.villas.label"),
      image: "/dashboard/Villa.jpeg",
      filters: { unit_types: "Villa" },
    },
    {
      title: t("propertyTypes.all.title"),
      label: t("propertyTypes.all.label"),
      image: "/dashboard/Apartments.jpeg",
      filters: {},
    },
  ];

  const handleCardClick = (filters) => {
    const params = new URLSearchParams(filters).toString();
    router.push(`/off-plan${params ? `?${params}` : ""}`);
  };

  return (
    <section className="px-4 py-16 md:px-16 bg-white" dir="ltr">
      {/* Heading + Icons + CTA */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-10">
        {/* Left */}
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            {t("heading")}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Icons */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <FaBuilding className="text-brand-sky text-xl" />
            <span>{t("icons.brandNew")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <FaHandsHelping className="text-brand-sky text-xl" />
            <span>{t("icons.support")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <FaStar className="text-brand-sky text-xl" />
            <span>{t("icons.priority")}</span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-2 lg:mt-0">
          <button className="bg-brand-sky hover:bg-brand-dark/90 text-white text-sm font-semibold px-6 py-2 rounded-xl transition">
            {t("cta")}
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {propertyTypes.map((item, index) => (
          <div
            key={index}
            role="button"
            onClick={() => handleCardClick(item.filters)}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/90 backdrop-blur-[1px]
                       shadow-[0_10px_30px_rgba(17,24,39,0.06)] hover:shadow-[0_18px_40px_rgba(17,24,39,0.10)]
                       transition-all duration-300 cursor-pointer"
          >
            {/* Image */}
            <div className="relative aspect-[4/3]">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 25vw"
                priority={index === 0}
              />
              {/* overlay gradient for text readability */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
              {/* badge in brand-sky */}
              <span
                className="absolute top-3 left-3 inline-flex items-center rounded-full bg-brand-sky text-white
                               font-semibold text-xs px-3 py-1 shadow"
              >
                {item.label}
              </span>
            </div>

            {/* Title row */}
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-900">
                {item.title}
              </h3>
              <FaArrowRight className="text-brand-sky text-base transition-transform group-hover:translate-x-0.5" />
            </div>

            {/* bottom accent bar in brand gradient */}
            <div className="h-1 w-full bg-gradient-to-r from-brand-sky to-brand-sky" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default OffPlanPropertyTypesSection;
