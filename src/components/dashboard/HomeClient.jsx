
"use client";

import React, { useEffect, useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import OffPlanClient from "@/components/OffPlanClient"; // ⬅️ use the client component
import OffPlanPropertyTypesSection from "@/components/dashboard/OffPlanPropertyTypesSection";
import Footer from "@/components/footer";
import AreasShowcaseClient from "@/components/dashboard/PropertiesPerArea";
import MapSection from "@/components/map/MapSection";
import AbuDhabiAreasSection from "@/components/dashboard/AbuDhabiAreas";

export default function HomeClient() {
  const [mapProjects, setMapProjects] = useState([]);

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
      <DashboardHeader />

      {/* Embed the same off-plan UI, but limited + latest */}
      <OffPlanClient limit={6} latest={true} />

      <OffPlanPropertyTypesSection />

      <MapSection
        projects={mapProjects}
        title="Find latest properties on the map"
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
