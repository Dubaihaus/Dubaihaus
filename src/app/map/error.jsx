"use client";

import ErrorOverlay from "@/components/common/ErrorOverlay";
import React from "react";

export default function MapError({ error, reset }) {
    console.error("Map page error:", error);
    return <ErrorOverlay />;
}
