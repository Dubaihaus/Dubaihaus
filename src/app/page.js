


// import Navbar from "@/components/navbar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import OffPlanPage from "@/app/off-plan/page";
import OffPlanPropertyTypesSection from "@/components/dashboard/OffPlanPropertyTypesSection";
import React from "react";
import Footer from "@/components/footer";
// import AreasShowcase from "@/components/dashboard/PropertiesPerArea";

export default function Home() {
    return (
        <>
            {/* <Navbar /> */}
            <DashboardHeader />
            <OffPlanPage limit={6} />
            <OffPlanPropertyTypesSection />
            {/* <AreasShowcase /> */}
            <Footer/>
        </>
    );
}
