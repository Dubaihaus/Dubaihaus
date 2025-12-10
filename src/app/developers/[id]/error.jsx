"use client";

import ErrorOverlay from "@/components/common/ErrorOverlay";
import React from "react";

export default function DeveloperDetailsError({ error, reset }) {
    console.error("Developer details error:", error);
    return <ErrorOverlay />;
}
