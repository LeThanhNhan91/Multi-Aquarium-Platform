"use client";

import React from "react";
import { BarChart3 } from "lucide-react";
import TabPlaceholder from "./TabPlaceholder";

interface AnalyticsTabProps {
  storeId: string;
}

export default function AnalyticsTab({ storeId }: AnalyticsTabProps) {
  return <TabPlaceholder title="Báo cáo" icon={BarChart3} />;
}
