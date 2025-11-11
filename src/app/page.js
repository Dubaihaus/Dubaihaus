// src/app/page.js
"use client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import OffPlanPage from "@/app/off-plan/page";
import OffPlanPropertyTypesSection from "@/components/dashboard/OffPlanPropertyTypesSection";
import React, { useEffect, useState } from "react";
import Footer from "@/components/footer";
import AreasShowcaseClient from "@/components/dashboard/PropertiesPerArea";
import MapSection from "@/components/map/MapSection";
import AbuDhabiAreasSection from "@/components/dashboard/AbuDhabiAreas";

export default function Home() {
  const [mapProjects, setMapProjects] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        // 🗺️ Fetch many projects for the map (aggregated across pages)
        const res = await fetch("/api/off-plan?forMap=true&pageSize=200");
        const data = await res.json();
        console.log("🗺️ Homepage map projects:", data?.results?.length);
        setMapProjects(Array.isArray(data?.results) ? data.results : []);
      } catch (err) {
        console.error("Failed to load map projects", err);
        setMapProjects([]);
      }
    })();
  }, []);

  return (
    <>
      <DashboardHeader />

      {/* Uses /api/off-plan with latest=true internally */}
      <OffPlanPage limit={6} latest={true} />
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
      <Footer />
    </>
  );
}
