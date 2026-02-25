"use client";

import React from "react";
import { Users } from "lucide-react";
import TabPlaceholder from "./TabPlaceholder";

interface CustomersTabProps {
  storeId: string;
}

export default function CustomersTab({ storeId }: CustomersTabProps) {
  return <TabPlaceholder title="Khách hàng" icon={Users} />;
}
