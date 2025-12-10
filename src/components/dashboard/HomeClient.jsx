// src/components/dashboard/HomeClient.jsx
"use client";

import React, { useEffect, useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import OffPlanClient from "@/components/OffPlanClient"; // ⬅️ use the client component
import OffPlanPropertyTypesSection from "@/components/dashboard/OffPlanPropertyTypesSection";
import Footer from "@/components/footer";
import AreasShowcaseClient from "@/components/dashboard/PropertiesPerArea";
import MapSection from "@/components/map/MapSection";
import AbuDhabiAreasSection from "@/components/dashboard/AbuDhabiAreas";
import { useTranslations } from "next-intl";
import OffPlanFilterPanel from "@/components/offplan/OffPlanFilterPanel";

export default function HomeClient({ filterOptions }) {
  const [mapProjects, setMapProjects] = useState([]);
  const tHome = useTranslations("home");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/off-plan?forMap=true&pageSize=200");
        const data = await res.json();
        setMapProjects(Array.isArray(data?.results) ? data.results : []);
      } catch {
        setMapProjects([]);
      }
    })();
  }, []);

  return (
    <>
      <DashboardHeader filterOptions={filterOptions} />
      

     {/* 2. Filter panel: half-overlap hero, half on white */}
      <div className="relative z-30 -mt-12 sm:-mt-16 lg:-mt-20">
        <OffPlanFilterPanel filterOptions={filterOptions} />
      </div>

      {/* 3. Push OffPlan section down so it doesn't touch the card */}
      <div className="mt-04 sm:mt-14 lg:mt-10">
        <OffPlanClient limit={9} latest={true} />
      </div>

      <OffPlanPropertyTypesSection />

      <MapSection
        projects={mapProjects}
        title={tHome("mapSection.title")}
        height={520}
        initialView={{ longitude: 55.27, latitude: 25.2, zoom: 10 }}
        maxWidthClass="max-w-6xl"
        showMarkersInitially={false}
      />

      <AbuDhabiAreasSection />
      <AreasShowcaseClient />


    </>
  );
}
