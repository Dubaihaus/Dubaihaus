"use client";

import ErrorOverlay from "@/components/common/ErrorOverlay";
import React from "react";

export default function AreasError({ error, reset }) {
    console.error("Areas page error:", error);
    return <ErrorOverlay />;
}
