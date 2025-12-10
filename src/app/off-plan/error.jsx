"use client";

import ErrorOverlay from "@/components/common/ErrorOverlay";
import React from "react";

export default function OffPlanError({ error, reset }) {
    console.error("Off-plan page error:", error);
    return <ErrorOverlay />;
}
