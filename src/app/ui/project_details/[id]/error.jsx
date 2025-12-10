"use client";

import ErrorOverlay from "@/components/common/ErrorOverlay";
import React from "react";

export default function ProjectDetailsError({ error, reset }) {
  console.error("Project details error:", error);
  return <ErrorOverlay />;
}
