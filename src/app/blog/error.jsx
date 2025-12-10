"use client";

import ErrorOverlay from "@/components/common/ErrorOverlay";
import React from "react";

export default function BlogError({ error, reset }) {
    console.error("Blog listing error:", error);
    return <ErrorOverlay />;
}
