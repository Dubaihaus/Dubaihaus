"use client";

import ErrorOverlay from "@/components/common/ErrorOverlay";
import React from "react";

export default function FeaturedPropertiesError({ error, reset }) {
    console.error("Featured properties error:", error);
    return <ErrorOverlay />;
}
