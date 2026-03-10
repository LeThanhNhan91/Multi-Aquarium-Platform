"use client";

import React from "react";
import { Settings } from "lucide-react";
import TabPlaceholder from "../TabPlaceholder";

interface SettingsTabProps {
  storeId: string;
}

export default function SettingsTab({ storeId }: SettingsTabProps) {
  return <TabPlaceholder title="Cài đặt" icon={Settings} />;
}
