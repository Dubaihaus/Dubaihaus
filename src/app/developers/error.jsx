"use client";

import ErrorOverlay from "@/components/common/ErrorOverlay";
import React from "react";

export default function DevelopersError({ error, reset }) {
    console.error("Developers page error:", error);
    return <ErrorOverlay />;
}
