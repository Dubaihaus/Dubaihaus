"use client";

import ErrorOverlay from "@/components/common/ErrorOverlay";
import React from "react";

export default function BlogPostError({ error, reset }) {
    console.error("Blog post error:", error);
    return <ErrorOverlay />;
}
