'use client';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import OffPlanPage from "@/app/off-plan/page";
import OffPlanPropertyTypesSection from "@/components/dashboard/OffPlanPropertyTypesSection";
import React from "react";
import Footer from "@/components/footer";
import { useEffect, useState } from 'react';
import AreasShowcaseClient from "@/components/dashboard/PropertiesPerArea";
import MapSection from "@/components/map/MapSection";
import AbuDhabiAreasSection from "@/components/dashboard/AbuDhabiAreas";

export default function Home() {
  const [homeProjects, setHomeProjects] = useState([]);

  useEffect(() => {
    (async () => {
      // 🆕 FIX: Use the correct endpoint path
      const res = await fetch('/api/off-plan/latest?pageSize=200');
      const data = await res.json();
      console.log("🏠 Homepage latest projects:", data?.results?.length);
      setHomeProjects(Array.isArray(data?.results) ? data.results : []);
    })();
  }, []);

  return (
    <>
      <DashboardHeader />
      
      <OffPlanPage limit={6} latest={true} />
      <OffPlanPropertyTypesSection />
      
      <MapSection
        projects={homeProjects}
        title="Find latest properties on the map"
        height={520}
        initialView={{ longitude: 55.27, latitude: 25.20, zoom: 10 }}
        maxWidthClass="max-w-6xl"
        showMarkersInitially={false}
      />
<AbuDhabiAreasSection />
      <AreasShowcaseClient />
      <Footer/>
    </>
  );
}