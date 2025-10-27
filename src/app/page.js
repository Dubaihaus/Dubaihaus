


// import Navbar from "@/components/navbar";
'use client';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import OffPlanPage from "@/app/off-plan/page";
import OffPlanPropertyTypesSection from "@/components/dashboard/OffPlanPropertyTypesSection";
import React from "react";
import Footer from "@/components/footer";
import { useEffect, useState } from 'react';
import AreasShowcaseClient from "@/components/dashboard/PropertiesPerArea";
import MapSection from "@/components/map/MapSection";
export default function Home() {
  const [homeProjects, setHomeProjects] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/off-plan?pageSize=1'); // or whatever you want
      const data = await res.json();
      setHomeProjects(Array.isArray(data?.results) ? data.results : []);
    })();
  }, []);

    return (
        <>
            {/* <Navbar /> */}
            <DashboardHeader />
            <OffPlanPage limit={6} />
            <OffPlanPropertyTypesSection />
             <MapSection
  projects={homeProjects}
  title="Find your properties on the map"
  height={520}
  initialView={{ longitude: 55.27, latitude: 25.20, zoom: 10 }}
  maxWidthClass="max-w-6xl" // tweak if you want wider/narrower
/>

            <AreasShowcaseClient />
            <Footer/>
        </>
    );
}
