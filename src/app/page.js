'use client';


// import Navbar from "@/components/navbar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import OffPlanPage from "@/app/off-plan/page";
import OffPlanPropertyTypesSection from "@/components/dashboard/OffPlanPropertyTypesSection";
import React from "react";
import Footer from "@/components/footer";

export default function Home() {
    return (
        <>
            {/* <Navbar /> */}
            <DashboardHeader />
            <OffPlanPage limit={6} />
            <OffPlanPropertyTypesSection />
            <Footer/>
        </>
    );
}
